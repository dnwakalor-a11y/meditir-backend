import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AIConfigService {
  private readonly logger = new Logger(AIConfigService.name);

  /**
   * Check if AI services are properly configured
   */
  isAIEnabled(): boolean {
    return (
      this.isOpenAIConfigured() ||
      this.isAWSConfigured()
    );
  }

  /**
   * Check if OpenAI is configured
   */
  isOpenAIConfigured(): boolean {
    const apiKey = process.env.OPENAI_API_KEY;
    return !!(apiKey && apiKey !== 'your_openai_api_key_here');
  }

  /**
   * Check if AWS Comprehend Medical is configured
   */
  isAWSConfigured(): boolean {
    const accessKey = process.env.AWS_ACCESS_KEY_ID;
    const secretKey = process.env.AWS_SECRET_ACCESS_KEY;
    return !!(
      accessKey && 
      secretKey && 
      accessKey !== 'your_aws_access_key_here' &&
      secretKey !== 'your_aws_secret_key_here' &&
      accessKey.length > 10 && // Basic validation
      secretKey.length > 10
    );
  }

  /**
   * Get AI configuration status
   */
  getConfigurationStatus() {
    return {
      aiEnabled: this.isAIEnabled(),
      openaiConfigured: this.isOpenAIConfigured(),
      awsConfigured: this.isAWSConfigured(),
      openaiModel: process.env.OPENAI_MODEL || 'gpt-4',
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1000'),
      awsRegion: process.env.AWS_REGION || 'us-east-1',
      confidenceThreshold: parseInt(process.env.AI_CONFIDENCE_THRESHOLD || '60'),
      autoUpdateEnabled: process.env.AI_AUTO_UPDATE_ENABLED === 'true',
    };
  }

  /**
   * Validate required environment variables for AI services
   */
  validateConfiguration(): string[] {
    const errors: string[] = [];

    if (!this.isOpenAIConfigured() && !this.isAWSConfigured()) {
      errors.push('No AI services configured. Please set up OpenAI or AWS credentials.');
    }

    if (process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      errors.push('OpenAI API key is set to placeholder value. Please update with real API key.');
    }

    if (process.env.AWS_ACCESS_KEY_ID === 'your_aws_access_key_here') {
      errors.push('AWS Access Key is set to placeholder value. Please update with real credentials.');
    }

    if (process.env.AWS_SECRET_ACCESS_KEY === 'your_aws_secret_key_here') {
      errors.push('AWS Secret Key is set to placeholder value. Please update with real credentials.');
    }

    return errors;
  }

  /**
   * Log configuration warnings
   */
  logConfigurationWarnings(): void {
    const errors = this.validateConfiguration();
    if (errors.length > 0) {
      this.logger.warn('AI Configuration Issues:');
      errors.forEach(error => this.logger.warn(`- ${error}`));
      this.logger.warn('AI features will have limited functionality until configuration is complete.');
    } else {
      this.logger.log('AI services properly configured');
    }
  }
}