import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComprehendMedicalClient, DetectEntitiesV2Command } from '@aws-sdk/client-comprehendmedical';
import { MedicalRecord, RecordType, RecordStatus } from '../entities/medical-record.entity';
import { 
  CreateMedicalRecordDto, 
  UpdateMedicalRecordDto, 
  MedicalRecordQueryDto,
  GenerateAIInsightsDto 
} from '../dto/medical-record.dto';
import { AIConfigService } from './ai-config.service';

@Injectable()
export class MedicalRecordService {
  private readonly logger = new Logger(MedicalRecordService.name);
  private comprehendMedicalClient: ComprehendMedicalClient;

  constructor(
    @InjectRepository(MedicalRecord)
    private medicalRecordRepository: Repository<MedicalRecord>,
    private aiConfigService: AIConfigService,
  ) {
    // Log AI configuration status on startup
    this.aiConfigService.logConfigurationWarnings();
    
    // Initialize AWS Comprehend Medical client
    this.initializeAWSClient();
  }

  /**
   * Initialize AWS Comprehend Medical client
   */
  private initializeAWSClient(): void {
    const awsAccessKey = process.env.AWS_ACCESS_KEY_ID;
    const awsSecretKey = process.env.AWS_SECRET_ACCESS_KEY;
    const awsRegion = process.env.AWS_REGION || 'us-east-1';

    if (awsAccessKey && awsSecretKey && 
        awsAccessKey !== 'your_aws_access_key_here' && 
        awsSecretKey !== 'your_aws_secret_key_here') {
      
      this.comprehendMedicalClient = new ComprehendMedicalClient({
        region: awsRegion,
        credentials: {
          accessKeyId: awsAccessKey,
          secretAccessKey: awsSecretKey,
        },
      });
      
      this.logger.log('AWS Comprehend Medical client initialized successfully');
    } else {
      this.logger.warn('AWS Comprehend Medical not configured - entity extraction will be unavailable');
    }
  }

  /**
   * Create a new medical record
   */
  async create(createMedicalRecordDto: CreateMedicalRecordDto, providerId: string, tenantId: string): Promise<MedicalRecord> {
    this.logger.log(`Creating medical record for patient ${createMedicalRecordDto.patientId}`);

    const medicalRecord = this.medicalRecordRepository.create({
      ...createMedicalRecordDto,
      providerId,
      tenantId,
      status: RecordStatus.DRAFT,
      recordDate: createMedicalRecordDto.recordDate ? new Date(createMedicalRecordDto.recordDate) : new Date(),
    });

    return await this.medicalRecordRepository.save(medicalRecord);
  }

  /**
   * Get all medical records with filtering
   */
  async findAll(query: MedicalRecordQueryDto, tenantId: string): Promise<MedicalRecord[]> {
    const queryBuilder = this.medicalRecordRepository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.patient', 'patient')
      .leftJoinAndSelect('record.provider', 'provider')
      .leftJoinAndSelect('record.appointment', 'appointment')
      .where('record.tenantId = :tenantId', { tenantId });

    // Apply filters
    if (query.patientId) {
      queryBuilder.andWhere('record.patientId = :patientId', { patientId: query.patientId });
    }

    if (query.providerId) {
      queryBuilder.andWhere('record.providerId = :providerId', { providerId: query.providerId });
    }

    if (query.type) {
      queryBuilder.andWhere('record.type = :type', { type: query.type });
    }

    if (query.status) {
      queryBuilder.andWhere('record.status = :status', { status: query.status });
    }

    if (query.startDate) {
      queryBuilder.andWhere('record.recordDate >= :startDate', { startDate: query.startDate });
    }

    if (query.endDate) {
      queryBuilder.andWhere('record.recordDate <= :endDate', { endDate: query.endDate });
    }

    if (query.search) {
      queryBuilder.andWhere(
        '(record.title ILIKE :search OR record.content ILIKE :search OR record.chiefComplaint ILIKE :search)',
        { search: `%${query.search}%` }
      );
    }

    if (query.tags && query.tags.length > 0) {
      queryBuilder.andWhere('record.tags && :tags', { tags: query.tags });
    }

    // Sorting
    queryBuilder.orderBy('record.recordDate', 'DESC');

    return await queryBuilder.getMany();
  }

  /**
   * Get medical record by ID
   */
  async findOne(recordId: string, tenantId: string): Promise<MedicalRecord> {
    const record = await this.medicalRecordRepository.findOne({
      where: { recordId, tenantId },
      relations: ['patient', 'provider', 'appointment'],
    });

    if (!record) {
      throw new NotFoundException('Medical record not found');
    }

    return record;
  }

  /**
   * Update medical record
   */
  async update(recordId: string, updateMedicalRecordDto: UpdateMedicalRecordDto, tenantId: string): Promise<MedicalRecord> {
    const record = await this.findOne(recordId, tenantId);

    Object.assign(record, updateMedicalRecordDto);

    return await this.medicalRecordRepository.save(record);
  }

  /**
   * Get patient's medical history
   */
  async getPatientHistory(patientId: string, tenantId: string): Promise<MedicalRecord[]> {
    return await this.medicalRecordRepository.find({
      where: {
        patientId,
        tenantId,
        status: RecordStatus.ACTIVE,
      },
      relations: ['provider', 'appointment'],
      order: {
        recordDate: 'DESC',
      },
    });
  }

  /**
   * Get recent records for a provider
   */
  async getRecentRecords(providerId: string, tenantId: string, limit: number = 10): Promise<MedicalRecord[]> {
    return await this.medicalRecordRepository.find({
      where: {
        providerId,
        tenantId,
      },
      relations: ['patient', 'appointment'],
      order: {
        recordDate: 'DESC',
      },
      take: limit,
    });
  }

  /**
   * Activate a medical record (finalize)
   */
  async activate(recordId: string, tenantId: string): Promise<MedicalRecord> {
    const record = await this.findOne(recordId, tenantId);

    record.status = RecordStatus.ACTIVE;

    return await this.medicalRecordRepository.save(record);
  }

  /**
   * Generate AI insights with configuration validation
   */
  async generateAIInsights(generateAIInsightsDto: GenerateAIInsightsDto): Promise<any> {
    // Check if AI services are configured
    if (!this.aiConfigService.isAIEnabled()) {
      throw new Error('AI services are not properly configured. Please check your environment variables.');
    }

    try {
      const insights = await this.callOpenAIService(generateAIInsightsDto);
      
      // Validate confidence threshold
      const config = this.aiConfigService.getConfigurationStatus();
      if (insights.confidence < config.confidenceThreshold) {
        this.logger.warn(`AI insights confidence (${insights.confidence}) below threshold (${config.confidenceThreshold})`);
      }

      return {
        ...insights,
        timestamp: new Date(),
        service: 'openai',
        model: config.openaiModel,
      };
    } catch (error) {
      this.logger.error('Failed to generate AI insights:', error);
      throw new Error('AI service temporarily unavailable. Please try again later.');
    }
  }

  /**
   * Update record with AI insights
   */
  async updateWithAIInsights(recordId: string, tenantId: string): Promise<MedicalRecord> {
    const record = await this.findOne(recordId, tenantId);

    try {
      const aiInsights = await this.generateAIInsights({
        content: record.content,
        patientContext: {
          pastMedicalHistory: record.pastMedicalHistory,
          medications: record.medications,
          allergies: record.allergies,
        },
      });

      record.aiInsights = JSON.stringify(aiInsights);
      record.aiSummary = aiInsights.summary;

      return await this.medicalRecordRepository.save(record);
    } catch (error) {
      this.logger.error('Failed to update record with AI insights:', error);
      throw new Error('Failed to generate AI insights for record');
    }
  }

  /**
   * Call OpenAI API for medical insights with proper error handling
   */
  private async callOpenAIService(generateAIInsightsDto: GenerateAIInsightsDto): Promise<any> {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey || openaiApiKey === 'your_openai_api_key_here') {
      throw new Error('OpenAI API key not properly configured');
    }

    const systemPrompt = `You are a medical AI assistant specialized in analyzing clinical notes and medical records. 
    Your task is to analyze the provided medical content and generate structured insights.
    
    IMPORTANT: Only provide medical insights based on the content provided. Do not diagnose or provide medical advice.
    This analysis is for healthcare professionals to review and validate.
    
    Please provide:
    1. A concise summary of the medical content
    2. Key clinical findings mentioned in the text
    3. Clinical recommendations based on documented findings
    4. Risk assessment (Low/Moderate/High) based on documented conditions
    5. Follow-up suggestions based on clinical protocols
    6. Confidence score (0-100) based on content completeness
    
    Respond only with valid JSON in this format:
    {
      "summary": "Brief summary of the medical content",
      "keyFindings": ["finding1", "finding2", "finding3"],
      "recommendations": ["recommendation1", "recommendation2"],
      "riskAssessment": "Low/Moderate/High",
      "followUpSuggestions": ["suggestion1", "suggestion2"],
      "confidence": 85,
      "disclaimer": "This analysis is for healthcare professional review only and should not replace clinical judgment."
    }`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4',
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: `Analyze this medical content: ${generateAIInsightsDto.content}
              
              ${generateAIInsightsDto.patientContext ? 
                `Patient Context: 
                Past Medical History: ${generateAIInsightsDto.patientContext.pastMedicalHistory || 'Not provided'}
                Current Medications: ${generateAIInsightsDto.patientContext.medications || 'Not provided'}
                Allergies: ${generateAIInsightsDto.patientContext.allergies || 'Not provided'}` : ''
              }`,
            },
          ],
          temperature: 0.3,
          max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1000'),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      try {
        return JSON.parse(content);
      } catch (parseError) {
        this.logger.error('Failed to parse OpenAI response:', content);
        throw new Error('Invalid response format from AI service');
      }
    } catch (error) {
      this.logger.error('OpenAI API call failed:', error);
      if (error.message.includes('API key')) {
        throw new Error('OpenAI API authentication failed. Please check your API key.');
      }
      if (error.message.includes('quota')) {
        throw new Error('OpenAI API quota exceeded. Please check your billing.');
      }
      throw new Error('OpenAI service temporarily unavailable');
    }
  }

  /**
   * Call AWS Comprehend Medical for entity extraction
   */
  private async callAWSComprehendMedical(text: string): Promise<any> {
    if (!this.comprehendMedicalClient) {
      throw new Error('AWS Comprehend Medical not configured. Please set AWS credentials.');
    }

    if (!text || text.trim().length === 0) {
      throw new Error('No text provided for analysis');
    }

    // AWS Comprehend Medical has a 20,000 character limit
    const maxLength = 20000;
    const analysisText = text.length > maxLength ? text.substring(0, maxLength) : text;

    try {
      this.logger.log(`Analyzing ${analysisText.length} characters with AWS Comprehend Medical`);

      const command = new DetectEntitiesV2Command({
        Text: analysisText,
      });

      const response = await this.comprehendMedicalClient.send(command);

      if (!response.Entities) {
        this.logger.warn('No entities detected by AWS Comprehend Medical');
        return {
          medications: [],
          conditions: [],
          anatomy: [],
          procedures: [],
          testTreatmentProcedures: [],
          protectedHealthInformation: [],
          rawEntities: [],
        };
      }

      // Process and categorize entities
      const medications = response.Entities.filter(entity => 
        entity.Category === 'MEDICATION'
      ).map(entity => ({
        text: entity.Text,
        score: entity.Score,
        type: entity.Type,
        traits: entity.Traits || [],
        attributes: entity.Attributes || [],
      }));

      const conditions = response.Entities.filter(entity => 
        entity.Category === 'MEDICAL_CONDITION'
      ).map(entity => ({
        text: entity.Text,
        score: entity.Score,
        type: entity.Type,
        traits: entity.Traits || [],
        attributes: entity.Attributes || [],
      }));

      const anatomy = response.Entities.filter(entity => 
        entity.Category === 'ANATOMY'
      ).map(entity => ({
        text: entity.Text,
        score: entity.Score,
        type: entity.Type,
        traits: entity.Traits || [],
        attributes: entity.Attributes || [],
      }));

      const procedures = response.Entities.filter(entity => 
        entity.Category === 'TEST_TREATMENT_PROCEDURE'
      ).map(entity => ({
        text: entity.Text,
        score: entity.Score,
        type: entity.Type,
        traits: entity.Traits || [],
        attributes: entity.Attributes || [],
      }));

      const protectedHealthInfo = response.Entities.filter(entity => 
        entity.Category === 'PROTECTED_HEALTH_INFORMATION'
      ).map(entity => ({
        text: entity.Text,
        score: entity.Score,
        type: entity.Type,
        traits: entity.Traits || [],
      }));

      const result = {
        medications,
        conditions,
        anatomy,
        procedures: procedures,
        testTreatmentProcedures: procedures, // Alias for backward compatibility
        protectedHealthInformation: protectedHealthInfo,
        rawEntities: response.Entities,
        analysisMetadata: {
          textLength: analysisText.length,
          totalEntities: response.Entities.length,
          timestamp: new Date(),
          modelVersion: response.ModelVersion,
        },
      };

      this.logger.log(`AWS Comprehend Medical detected ${response.Entities.length} entities`);
      return result;

    } catch (error) {
      this.logger.error('AWS Comprehend Medical analysis failed:', error);
      
      // Provide specific error messages
      if (error.name === 'ValidationException') {
        throw new Error('Invalid text provided for AWS Comprehend Medical analysis');
      } else if (error.name === 'ThrottlingException') {
        throw new Error('AWS Comprehend Medical rate limit exceeded. Please try again later.');
      } else if (error.name === 'AccessDeniedException') {
        throw new Error('AWS credentials do not have permission for Comprehend Medical');
      } else if (error.name === 'InternalServerException') {
        throw new Error('AWS Comprehend Medical service error. Please try again.');
      }
      
      throw new Error('Failed to analyze text with AWS Comprehend Medical');
    }
  }

  /**
   * Enhanced AI analysis combining multiple services
   */
  async generateComprehensiveAIAnalysis(recordId: string, tenantId: string): Promise<MedicalRecord> {
    const record = await this.findOne(recordId, tenantId);

    try {
      // Run multiple AI services in parallel
      const [openaiInsights, awsEntities] = await Promise.allSettled([
        this.callOpenAIService({
          content: record.content,
          patientContext: {
            pastMedicalHistory: record.pastMedicalHistory,
            medications: record.medications,
            allergies: record.allergies,
          },
        }),
        this.callAWSComprehendMedical(record.content),
      ]);

      const combinedInsights = {
        openaiAnalysis: openaiInsights.status === 'fulfilled' ? openaiInsights.value : null,
        awsEntities: awsEntities.status === 'fulfilled' ? awsEntities.value : null,
        analysisDate: new Date(),
        confidence: this.calculateOverallConfidence(openaiInsights, awsEntities),
        services: {
          openai: openaiInsights.status === 'fulfilled' ? 'success' : 'failed',
          aws: awsEntities.status === 'fulfilled' ? 'success' : 'failed',
        },
        errors: {
          openai: openaiInsights.status === 'rejected' ? openaiInsights.reason?.message : null,
          aws: awsEntities.status === 'rejected' ? awsEntities.reason?.message : null,
        },
      };

      record.aiInsights = JSON.stringify(combinedInsights);
      record.aiSummary = this.generateCombinedSummary(combinedInsights);

      return await this.medicalRecordRepository.save(record);
    } catch (error) {
      this.logger.error('Comprehensive AI analysis failed:', error);
      throw new Error('Failed to generate comprehensive AI analysis');
    }
  }

  /**
   * Generate combined summary from multiple AI services
   */
  private generateCombinedSummary(insights: any): string {
    let summary = '';
    
    if (insights.openaiAnalysis?.summary) {
      summary += `OpenAI Analysis: ${insights.openaiAnalysis.summary}`;
    }
    
    if (insights.awsEntities) {
      const entityCounts = {
        medications: insights.awsEntities.medications?.length || 0,
        conditions: insights.awsEntities.conditions?.length || 0,
        procedures: insights.awsEntities.procedures?.length || 0,
        anatomy: insights.awsEntities.anatomy?.length || 0,
      };
      
      const entitySummary = Object.entries(entityCounts)
        .filter(([, count]) => count > 0)
        .map(([type, count]) => `${count} ${type}`)
        .join(', ');
        
      if (entitySummary) {
        summary += summary ? ` | AWS Entities: ${entitySummary}` : `AWS Entities: ${entitySummary}`;
      }
    }
    
    return summary || 'AI analysis completed';
  }

  /**
   * Get medical entities for a specific record
   */
  async getMedicalEntities(recordId: string, tenantId: string): Promise<any> {
    const record = await this.findOne(recordId, tenantId);
    
    if (!record.content) {
      throw new Error('No content available for entity extraction');
    }

    try {
      const entities = await this.callAWSComprehendMedical(record.content);
      return {
        success: true,
        data: entities,
        recordId: record.recordId,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to extract entities for record ${recordId}:`, error);
      throw new Error('Failed to extract medical entities');
    }
  }

  /**
   * Calculate overall confidence from multiple AI services
   */
  private calculateOverallConfidence(openaiResult: any, awsResult: any): number {
    let totalConfidence = 0;
    let serviceCount = 0;

    if (openaiResult.status === 'fulfilled' && openaiResult.value?.confidence) {
      totalConfidence += openaiResult.value.confidence;
      serviceCount++;
    }

    if (awsResult.status === 'fulfilled') {
      // AWS Comprehend Medical doesn't provide overall confidence, so we estimate based on entity scores
      totalConfidence += 75; // Default confidence for successful AWS analysis
      serviceCount++;
    }

    return serviceCount > 0 ? Math.round(totalConfidence / serviceCount) : 0;
  }

  /**
   * Search medical records by content
   */
  async searchRecords(searchTerm: string, tenantId: string, providerId?: string): Promise<MedicalRecord[]> {
    const queryBuilder = this.medicalRecordRepository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.patient', 'patient')
      .leftJoinAndSelect('record.provider', 'provider')
      .where('record.tenantId = :tenantId', { tenantId })
      .andWhere(
        '(record.title ILIKE :search OR record.content ILIKE :search OR record.chiefComplaint ILIKE :search OR record.assessment ILIKE :search)',
        { search: `%${searchTerm}%` }
      );

    if (providerId) {
      queryBuilder.andWhere('record.providerId = :providerId', { providerId });
    }

    queryBuilder.orderBy('record.recordDate', 'DESC');

    return await queryBuilder.getMany();
  }

  /**
   * Get medical record statistics
   */
  async getStatistics(providerId: string, tenantId: string): Promise<any> {
    const [
      totalRecords,
      draftRecords,
      activeRecords,
      todayRecords,
    ] = await Promise.all([
      this.medicalRecordRepository.count({
        where: { providerId, tenantId },
      }),
      this.medicalRecordRepository.count({
        where: { providerId, tenantId, status: RecordStatus.DRAFT },
      }),
      this.medicalRecordRepository.count({
        where: { providerId, tenantId, status: RecordStatus.ACTIVE },
      }),
      this.medicalRecordRepository
        .createQueryBuilder('record')
        .where('record.providerId = :providerId', { providerId })
        .andWhere('record.tenantId = :tenantId', { tenantId })
        .andWhere('DATE(record.recordDate) = CURRENT_DATE')
        .getCount(),
    ]);

    return {
      total: totalRecords,
      draft: draftRecords,
      active: activeRecords,
      today: todayRecords,
      activationRate: totalRecords > 0 ? (activeRecords / totalRecords) * 100 : 0,
    };
  }

  /**
   * Delete medical record
   */
  async remove(recordId: string, tenantId: string): Promise<void> {
    const record = await this.findOne(recordId, tenantId);
    await this.medicalRecordRepository.remove(record);
  }

  // Private helper methods for AI insights (mock implementations)
  private generateMockSummary(content: string): string {
    const words = content.split(' ').slice(0, 50);
    return `AI Summary: ${words.join(' ')}...`;
  }

  private extractKeyFindings(content: string): string[] {
    // Mock key findings extraction
    const findings: string[] = [];
    if (content.toLowerCase().includes('pain')) findings.push('Patient reports pain');
    if (content.toLowerCase().includes('fever')) findings.push('Fever present');
    if (content.toLowerCase().includes('blood pressure')) findings.push('Blood pressure noted');
    return findings.length > 0 ? findings : ['No significant findings identified'];
  }

  private generateRecommendations(content: string): string[] {
    // Mock recommendations
    return [
      'Continue current treatment plan',
      'Monitor symptoms',
      'Follow up in 2 weeks',
    ];
  }

  private assessRisk(content: string): string {
    // Mock risk assessment
    if (content.toLowerCase().includes('severe') || content.toLowerCase().includes('emergency')) {
      return 'High Risk';
    } else if (content.toLowerCase().includes('moderate') || content.toLowerCase().includes('concern')) {
      return 'Moderate Risk';
    }
    return 'Low Risk';
  }

  private generateFollowUp(content: string): string[] {
    // Mock follow-up suggestions
    return [
      'Schedule follow-up appointment',
      'Order lab work if symptoms persist',
      'Patient education on condition',
    ];
  }
}