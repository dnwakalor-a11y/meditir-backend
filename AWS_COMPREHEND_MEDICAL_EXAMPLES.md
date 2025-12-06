# AWS Comprehend Medical Usage Examples

This document provides practical examples of how AWS Comprehend Medical is integrated into the MedZen platform for medical entity extraction.

## Overview

AWS Comprehend Medical is used to extract structured medical information from unstructured clinical notes. It works alongside OpenAI GPT-4 to provide both narrative insights and structured data extraction.

## Implementation Details

### Service Integration
```typescript
// AWS SDK Integration
import { ComprehendMedicalClient, DetectEntitiesV2Command } from '@aws-sdk/client-comprehendmedical';

// Initialize client with credentials
this.comprehendMedicalClient = new ComprehendMedicalClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Analyze medical text
const command = new DetectEntitiesV2Command({
  Text: clinicalNote,
});

const response = await this.comprehendMedicalClient.send(command);
```

## Real-World Examples

### Example 1: Emergency Department Note

**Input Text:**
```
Chief Complaint: 45-year-old male presents with chest pain and shortness of breath.

History of Present Illness: Patient reports sudden onset of severe substernal chest pain 2 hours ago, radiating to left arm. Associated with diaphoresis and nausea. Denies vomiting. No prior cardiac history.

Past Medical History: Hypertension, hyperlipidemia
Medications: Lisinopril 10mg daily, Atorvastatin 40mg nightly
Allergies: Penicillin - rash

Physical Exam: BP 160/95, HR 110, RR 22, O2 sat 96% on room air
Heart: Regular rate and rhythm, no murmurs
Lungs: Clear bilaterally

Assessment: Acute coronary syndrome, rule out myocardial infarction
Plan: Serial EKGs, cardiac enzymes, aspirin 325mg, beta blocker
```

**AWS Comprehend Medical Output:**
```json
{
  "medications": [
    {
      "text": "Lisinopril",
      "score": 0.9987,
      "type": "GENERIC_NAME",
      "attributes": [
        {"type": "DOSAGE", "text": "10mg"},
        {"type": "FREQUENCY", "text": "daily"}
      ]
    },
    {
      "text": "Atorvastatin",
      "score": 0.9976,
      "type": "GENERIC_NAME",
      "attributes": [
        {"type": "DOSAGE", "text": "40mg"},
        {"type": "FREQUENCY", "text": "nightly"}
      ]
    },
    {
      "text": "aspirin",
      "score": 0.9654,
      "type": "GENERIC_NAME",
      "attributes": [
        {"type": "DOSAGE", "text": "325mg"}
      ]
    }
  ],
  "conditions": [
    {
      "text": "chest pain",
      "score": 0.9876,
      "type": "SYMPTOM_NAME"
    },
    {
      "text": "shortness of breath",
      "score": 0.9654,
      "type": "SYMPTOM_NAME"
    },
    {
      "text": "Hypertension",
      "score": 0.9987,
      "type": "DX_NAME"
    },
    {
      "text": "hyperlipidemia",
      "score": 0.9876,
      "type": "DX_NAME"
    },
    {
      "text": "Acute coronary syndrome",
      "score": 0.9234,
      "type": "DX_NAME"
    }
  ],
  "anatomy": [
    {
      "text": "chest",
      "score": 0.9654,
      "type": "SYSTEM_ORGAN_SITE"
    },
    {
      "text": "left arm",
      "score": 0.8976,
      "type": "SYSTEM_ORGAN_SITE"
    },
    {
      "text": "Heart",
      "score": 0.9876,
      "type": "SYSTEM_ORGAN_SITE"
    }
  ],
  "procedures": [
    {
      "text": "EKGs",
      "score": 0.9876,
      "type": "TEST_NAME"
    },
    {
      "text": "cardiac enzymes",
      "score": 0.9654,
      "type": "TEST_NAME"
    }
  ]
}
```

### Example 2: Pediatric Visit Note

**Input Text:**
```
Patient: Sarah Johnson, DOB: 05/15/2018
Chief Complaint: Fever and cough for 3 days

Sarah is a 5-year-old female brought by mother for evaluation of fever up to 102.3°F and productive cough. Started 3 days ago. No vomiting or diarrhea. Eating and drinking well.

Physical Exam:
- Temp: 101.8°F, HR: 120, RR: 28
- HEENT: Red throat, no exudate
- Lungs: Bilateral wheeze, decreased air entry right base
- Abdomen: Soft, non-tender

Assessment: Right lower lobe pneumonia
Plan: Amoxicillin 500mg BID x 10 days, follow up in 48 hours
```

**AWS Comprehend Medical with PHI Detection:**
```json
{
  "protectedHealthInformation": [
    {
      "text": "Sarah Johnson",
      "score": 0.9987,
      "type": "NAME"
    },
    {
      "text": "05/15/2018",
      "score": 0.9876,
      "type": "DATE"
    }
  ],
  "conditions": [
    {
      "text": "Fever",
      "score": 0.9876,
      "type": "SYMPTOM_NAME"
    },
    {
      "text": "cough",
      "score": 0.9654,
      "type": "SYMPTOM_NAME"
    },
    {
      "text": "pneumonia",
      "score": 0.9234,
      "type": "DX_NAME"
    }
  ],
  "medications": [
    {
      "text": "Amoxicillin",
      "score": 0.9987,
      "type": "GENERIC_NAME",
      "attributes": [
        {"type": "DOSAGE", "text": "500mg"},
        {"type": "FREQUENCY", "text": "BID"},
        {"type": "DURATION", "text": "10 days"}
      ]
    }
  ],
  "anatomy": [
    {
      "text": "throat",
      "score": 0.9654,
      "type": "SYSTEM_ORGAN_SITE"
    },
    {
      "text": "Lungs",
      "score": 0.9876,
      "type": "SYSTEM_ORGAN_SITE"
    },
    {
      "text": "right lower lobe",
      "score": 0.8976,
      "type": "SYSTEM_ORGAN_SITE"
    }
  ]
}
```

## Combined Analysis with OpenAI

### Comprehensive Analysis Flow
1. **OpenAI GPT-4** provides narrative analysis and clinical insights
2. **AWS Comprehend Medical** extracts structured entities
3. **Combined Result** merges both for comprehensive understanding

**Example Combined Output:**
```json
{
  "openaiAnalysis": {
    "summary": "45-year-old male presenting with acute chest pain concerning for acute coronary syndrome",
    "keyFindings": [
      "Sudden onset severe substernal chest pain",
      "Radiation to left arm with diaphoresis",
      "Risk factors: hypertension, hyperlipidemia"
    ],
    "recommendations": [
      "Immediate cardiac workup with serial EKGs",
      "Cardiac biomarkers every 6 hours",
      "Consider cardiology consultation"
    ],
    "riskAssessment": "High Risk",
    "confidence": 92
  },
  "awsEntities": {
    "medications": [/* medication entities */],
    "conditions": [/* condition entities */],
    "procedures": [/* procedure entities */],
    "totalEntities": 15
  },
  "combinedInsights": {
    "structuredMedications": "Current: Lisinopril, Atorvastatin | Planned: Aspirin, Beta blocker",
    "keyConditions": "Primary: Acute coronary syndrome | History: Hypertension, Hyperlipidemia",
    "recommendedTests": "EKGs, Cardiac enzymes",
    "overallConfidence": 89
  }
}
```

## Error Handling

### Common AWS Comprehend Medical Errors
```typescript
try {
  const entities = await this.callAWSComprehendMedical(text);
} catch (error) {
  if (error.name === 'ValidationException') {
    // Invalid text format
  } else if (error.name === 'ThrottlingException') {
    // Rate limit exceeded
  } else if (error.name === 'AccessDeniedException') {
    // Insufficient permissions
  }
}
```

## Performance Considerations

### Text Length Limits
- **Maximum**: 20,000 characters per request
- **Recommended**: 5,000-10,000 characters for optimal performance
- **Chunking**: Large documents are automatically chunked

### Rate Limits
- **Default**: 20 requests per second
- **Burst**: Up to 100 requests for short periods
- **Monitoring**: Track usage to avoid throttling

## Privacy and Compliance

### PHI Detection
AWS Comprehend Medical automatically detects:
- Names
- Dates
- Phone numbers
- Addresses
- Email addresses
- Social Security Numbers
- Medical Record Numbers

### HIPAA Compliance
- All data processed in HIPAA-eligible AWS regions
- No data stored by AWS after processing
- Audit logs maintained for compliance
- Encryption in transit and at rest

## Frontend Integration

### Medical Entities Viewer Component
```typescript
// Extract entities for a medical record
const entities = await fetch(`/api/v1/medical-records/${recordId}/entities`);

// Display structured entities
<MedicalEntitiesViewer recordId={recordId} />
```

### Features
- Visual entity categorization
- Confidence score indicators
- PHI detection warnings
- Export capabilities
- Search and filter functionality

## Cost Optimization

### Best Practices
1. **Batch Processing**: Process multiple records efficiently
2. **Caching**: Cache results to avoid reprocessing
3. **Filtering**: Only process relevant content sections
4. **Monitoring**: Track usage and costs regularly

### Pricing Model
- Pay per character processed
- No minimum charges
- Volume discounts available
- Free tier: 25,000 characters/month for first 12 months

---

This integration provides powerful medical entity extraction capabilities that complement the narrative analysis from OpenAI, creating a comprehensive AI-powered medical records analysis system.