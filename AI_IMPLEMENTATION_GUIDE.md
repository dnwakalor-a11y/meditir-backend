# Medical Records AI Integration

This document outlines the implementation of real AI services for medical record analysis and insights generation in the MedZen platform.

## Overview

The AI integration provides:
- Real-time medical content analysis using OpenAI GPT-4
- Entity extraction using AWS Comprehend Medical
- Comprehensive AI insights with confidence scoring
- Configurable AI services with proper error handling

## Features

### 1. AI-Powered Medical Insights
- **Content Analysis**: Automated analysis of medical notes and records using OpenAI GPT-4
- **Key Findings Extraction**: Identification of important clinical findings
- **Risk Assessment**: Automated risk level assessment (Low/Moderate/High)
- **Clinical Recommendations**: AI-generated recommendations based on content
- **Follow-up Suggestions**: Automated follow-up care recommendations

### 2. AWS Comprehend Medical Integration
- **Medical Entity Extraction**: Automatic detection and classification of medical entities
- **Medication Recognition**: Identification of drugs, dosages, and administration details
- **Condition Detection**: Recognition of medical conditions, symptoms, and diagnoses
- **Anatomy Mapping**: Identification of body parts, organs, and anatomical references
- **Procedure Identification**: Detection of medical procedures and treatments
- **PHI Detection**: Automatic identification of Protected Health Information for compliance
- **Confidence Scoring**: Entity-level confidence scores for validation
- **Trait Analysis**: Additional context like negation, time, and severity

### 3. Multiple AI Service Integration
- **Dual Analysis**: OpenAI for narrative insights + AWS for structured entity extraction
- **Combined Confidence**: Composite confidence metrics from multiple services
- **Fallback Mechanisms**: Graceful degradation when individual services are unavailable
- **Service Status Tracking**: Real-time monitoring of each AI service's availability

### 4. Configuration Management
- **Environment-based Configuration**: Secure API key management
- **Service Health Monitoring**: Real-time status of AI services
- **Configuration Validation**: Automatic validation of required settings
- **Error Reporting**: Detailed error messages for configuration issues

## Configuration

### Environment Variables

Add the following to your `.env` file:

```bash
# AI Services Configuration
OPENAI_API_KEY=your_actual_openai_api_key
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=1000

# AWS Configuration for Comprehend Medical
AWS_ACCESS_KEY_ID=your_actual_aws_access_key
AWS_SECRET_ACCESS_KEY=your_actual_aws_secret_key
AWS_REGION=us-east-1

# AI Features
AI_INSIGHTS_ENABLED=true
AI_CONFIDENCE_THRESHOLD=60
AI_AUTO_UPDATE_ENABLED=false
```

### Required API Keys

#### OpenAI Setup
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account and generate an API key
3. Add billing information (GPT-4 requires paid usage)
4. Replace `your_actual_openai_api_key` with your real API key

#### AWS Setup
1. Visit [AWS Console](https://aws.amazon.com/console/)
2. Create an IAM user with Comprehend Medical permissions
3. Attach the following managed policy: `ComprehendMedicalFullAccess`
4. Or create a custom policy with these permissions:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "comprehendmedical:DetectEntitiesV2",
           "comprehendmedical:DetectPHI"
         ],
         "Resource": "*"
       }
     ]
   }
   ```
5. Generate access key and secret key
6. Replace the placeholder values with real credentials

## How AWS Comprehend Medical Works

### Entity Detection
AWS Comprehend Medical uses machine learning to identify and extract medical information from unstructured text. It can detect:

1. **Medications**: Drug names, dosages, frequencies, routes of administration
2. **Medical Conditions**: Diseases, symptoms, signs, diagnoses
3. **Anatomy**: Body parts, organs, anatomical locations
4. **Test, Treatment, Procedures**: Medical procedures, lab tests, treatments
5. **Protected Health Information**: Names, dates, addresses, phone numbers

### Entity Attributes
Each detected entity includes:
- **Text**: The actual text that was identified
- **Score**: Confidence score (0.0 to 1.0)
- **Type**: Specific entity type (e.g., GENERIC_NAME, BRAND_NAME for medications)
- **Traits**: Additional context like negation, temporal information
- **Attributes**: Related information like dosage for medications

### Example Analysis
Input text: "Patient prescribed 81mg aspirin daily for hypertension"

AWS Comprehend Medical Output:
```json
{
  "medications": [
    {
      "text": "aspirin",
      "score": 0.9987,
      "type": "GENERIC_NAME",
      "attributes": [
        {"type": "DOSAGE", "text": "81mg"},
        {"type": "FREQUENCY", "text": "daily"}
      ]
    }
  ],
  "conditions": [
    {
      "text": "hypertension",
      "score": 0.9654,
      "type": "DX_NAME"
    }
  ]
}
```

### Integration Benefits
1. **Structured Data**: Converts unstructured clinical notes into structured data
2. **HIPAA Compliance**: Built-in PHI detection for privacy protection
3. **High Accuracy**: Medical-specific AI models trained on healthcare data
4. **Real-time Processing**: Fast entity extraction for immediate insights
5. **Scalability**: Handles large volumes of medical text efficiently

## API Endpoints

### Medical Records AI

#### Generate AI Insights
```http
PUT /api/v1/medical-records/:id/ai-update
Authorization: Bearer <token>
x-tenant-id: <tenant-id>
```

#### Comprehensive AI Analysis
```http
PUT /api/v1/medical-records/:id/comprehensive-analysis
Authorization: Bearer <token>
x-tenant-id: <tenant-id>
```

#### Extract Medical Entities (AWS Comprehend Medical)
```http
GET /api/v1/medical-records/:id/entities
Authorization: Bearer <token>
x-tenant-id: <tenant-id>
```

Response:
```json
{
  "success": true,
  "data": {
    "medications": [
      {
        "text": "Aspirin",
        "score": 0.9987,
        "type": "GENERIC_NAME",
        "traits": [{"Name": "NEGATION", "Score": 0.99}],
        "attributes": [{"Type": "DOSAGE", "Text": "81mg"}]
      }
    ],
    "conditions": [
      {
        "text": "Hypertension",
        "score": 0.9654,
        "type": "DX_NAME",
        "traits": [],
        "attributes": []
      }
    ],
    "anatomy": [
      {
        "text": "heart",
        "score": 0.8976,
        "type": "SYSTEM_ORGAN_SITE",
        "traits": [],
        "attributes": []
      }
    ],
    "procedures": [
      {
        "text": "blood pressure check",
        "score": 0.8234,
        "type": "PROCEDURE_NAME",
        "traits": [],
        "attributes": []
      }
    ],
    "analysisMetadata": {
      "textLength": 1250,
      "totalEntities": 15,
      "timestamp": "2024-10-11T10:30:00Z",
      "modelVersion": "DetectEntitiesModelV20230615"
    }
  }
}
```

### AI Configuration

#### Check AI Status
```http
GET /api/v1/ai-config/status
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "aiEnabled": true,
    "openaiConfigured": true,
    "awsConfigured": true,
    "openaiModel": "gpt-4",
    "maxTokens": 1000,
    "awsRegion": "us-east-1",
    "confidenceThreshold": 60,
    "autoUpdateEnabled": false,
    "configurationErrors": []
  }
}
```

#### Health Check
```http
GET /api/v1/ai-config/health
Authorization: Bearer <token>
```

## Frontend Integration

### Medical Records Management

The frontend now includes:

1. **AI Insights Button**: Generate basic AI insights for a medical record
2. **Comprehensive Analysis Button**: Run advanced analysis with multiple AI services
3. **Real-time Status**: Display AI insights status and confidence scores
4. **Error Handling**: User-friendly error messages for configuration issues

### Usage Example

```typescript
// Generate AI insights
const generateAIInsights = async (recordId: string) => {
  try {
    const response = await fetch(
      `/api/v1/medical-records/${recordId}/ai-update`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': tenantId,
        },
      }
    );
    
    if (response.ok) {
      const result = await response.json();
      // Handle successful AI insights generation
    }
  } catch (error) {
    // Handle errors appropriately
  }
};
```

## Error Handling

### Common Configuration Errors

1. **OpenAI API Key Not Set**
   - Error: "OpenAI API key not properly configured"
   - Solution: Set `OPENAI_API_KEY` environment variable

2. **AWS Credentials Not Set**
   - Error: "AWS credentials not configured"
   - Solution: Set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`

3. **API Quota Exceeded**
   - Error: "OpenAI API quota exceeded"
   - Solution: Check OpenAI billing and usage limits

4. **Invalid API Key**
   - Error: "OpenAI API authentication failed"
   - Solution: Verify API key is correct and active

### Error Response Format

```json
{
  "success": false,
  "error": {
    "message": "AI service temporarily unavailable",
    "code": "AI_SERVICE_ERROR",
    "details": "OpenAI API quota exceeded"
  }
}
```

## Security Considerations

1. **API Key Protection**: Never expose API keys in frontend code
2. **Rate Limiting**: Implement rate limiting for AI endpoints
3. **Data Privacy**: Ensure patient data is handled according to HIPAA requirements
4. **Error Logging**: Log errors without exposing sensitive information
5. **Authentication**: All AI endpoints require valid JWT tokens

## Performance Optimization

1. **Caching**: Cache AI insights to reduce API calls
2. **Batch Processing**: Process multiple records efficiently
3. **Confidence Thresholds**: Only store high-confidence insights
4. **Async Processing**: Use background jobs for large analysis tasks

## Testing

### Configuration Testing

```bash
# Check AI configuration status
curl -X GET http://localhost:3000/api/v1/ai-config/status \
  -H "Authorization: Bearer <token>"

# Test health check
curl -X GET http://localhost:3000/api/v1/ai-config/health \
  -H "Authorization: Bearer <token>"
```

### Medical Record Analysis Testing

```bash
# Generate AI insights for a record
curl -X PUT http://localhost:3000/api/v1/medical-records/123/ai-update \
  -H "Authorization: Bearer <token>" \
  -H "x-tenant-id: tenant-123"
```

## Monitoring and Logging

The system logs the following:

1. **Configuration Status**: AI service availability on startup
2. **API Calls**: Successful and failed AI service calls
3. **Performance Metrics**: Response times and confidence scores
4. **Error Tracking**: Detailed error information for debugging

## Deployment Notes

1. **Environment Variables**: Ensure all AI-related environment variables are set in production
2. **API Limits**: Monitor OpenAI and AWS usage to avoid quota issues
3. **Health Checks**: Include AI service health in deployment health checks
4. **Rollback Plan**: Have fallback mechanisms when AI services are unavailable

## Future Enhancements

1. **Additional AI Providers**: Integration with more medical AI services
2. **Custom Models**: Training custom models for specific medical specialties
3. **Real-time Analysis**: Stream processing for real-time insights
4. **Advanced Analytics**: Trend analysis and predictive modeling
5. **Voice Integration**: Voice-to-text with AI analysis

## Support

For issues related to AI integration:

1. Check configuration using `/api/v1/ai-config/status`
2. Verify environment variables are set correctly
3. Check API key validity and billing status
4. Review application logs for detailed error information

---

**Note**: This implementation removes all mock data and integrates with real AI services. Ensure proper API keys and configuration before deployment to production.