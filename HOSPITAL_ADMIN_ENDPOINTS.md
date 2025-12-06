# Hospital Admin API Endpoints Documentation

## Overview
This document describes the dedicated endpoints for hospital administrators to manage doctors and patients with both single and bulk creation capabilities.

## Doctor Management Endpoints

### Create Single Doctor
**POST** `/providers/hospital-admin/single`

Creates a single doctor with complete user account setup.

**Request Body:**
```json
{
  "email": "dr.smith@hospital.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Smith",
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1980-01-01",
  "gender": "Male",
  "address": "123 Medical Street, City, State 12345",
  "licenseNumber": "MD123456789",
  "specialization": "Cardiology",
  "qualifications": "MD, FACC, Board Certified Cardiologist",
  "availability": {
    "monday": { "start": "09:00", "end": "17:00" },
    "tuesday": { "start": "09:00", "end": "17:00" },
    "timeZone": "America/New_York"
  }
}
```

**Response:**
```json
{
  "providerId": "uuid",
  "userId": "uuid",
  "email": "dr.smith@hospital.com",
  "firstName": "John",
  "lastName": "Smith",
  "role": "Doctor",
  "specialization": "Cardiology",
  "licenseNumber": "MD123456789",
  "qualifications": "MD, FACC, Board Certified Cardiologist",
  "availability": { ... },
  "isActive": true,
  "createdAt": "2023-01-01T00:00:00Z",
  "updatedAt": "2023-01-01T00:00:00Z"
}
```

### Create Multiple Doctors (Bulk)
**POST** `/providers/hospital-admin/bulk`

Creates multiple doctors at once with complete user account setup.

**Request Body:**
```json
{
  "doctors": [
    {
      "email": "dr.smith@hospital.com",
      "password": "SecurePassword123!",
      "firstName": "John",
      "lastName": "Smith",
      // ... other doctor fields
    },
    {
      "email": "dr.jones@hospital.com",
      "password": "SecurePassword123!",
      "firstName": "Jane",
      "lastName": "Jones",
      // ... other doctor fields
    }
  ]
}
```

**Response:**
```json
{
  "created": [
    { /* successful doctor creation objects */ }
  ],
  "failed": [
    {
      "index": 1,
      "email": "dr.duplicate@hospital.com",
      "error": "Email already exists"
    }
  ],
  "totalProcessed": 5,
  "successCount": 4,
  "failureCount": 1
}
```

### List All Doctors
**GET** `/providers/hospital-admin/list`

Lists all doctors in the hospital with pagination and search.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search by name, email, or specialization

**Response:**
```json
{
  "doctors": [
    {
      "providerId": "uuid",
      "userId": "uuid",
      "email": "dr.smith@hospital.com",
      "firstName": "John",
      "lastName": "Smith",
      "role": "Doctor",
      "specialization": "Cardiology",
      "licenseNumber": "MD123456789",
      "qualifications": "MD, FACC",
      "availability": { ... },
      "isActive": true,
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2023-01-01T00:00:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 20
}
```

## Patient Management Endpoints

### Create Single Patient
**POST** `/patients/hospital-admin/single`

Creates a single patient with complete user account setup.

**Request Body:**
```json
{
  "email": "patient@hospital.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1990-01-15",
  "gender": "Male",
  "medicalRecordNumber": "MRN-12345",
  "address": "123 Main St, Anytown, ST 12345",
  "insuranceInfo": {
    "provider": "HealthCare Plus",
    "policyNumber": "HC123456789",
    "groupNumber": "GRP001",
    "expiryDate": "2025-12-31"
  },
  "medicalHistory": {
    "allergies": ["Penicillin", "Peanuts"],
    "chronicConditions": ["Diabetes Type 2"],
    "surgeries": ["Appendectomy 2018"],
    "familyHistory": ["Heart Disease (Father)"]
  },
  "currentVitals": {
    "bloodPressure": "120/80",
    "heartRate": 72,
    "temperature": 98.6,
    "weight": 70,
    "height": 175
  },
  "emergencyContact": {
    "name": "Jane Doe",
    "relationship": "Spouse",
    "phoneNumber": "+1987654321",
    "email": "jane.doe@email.com"
  }
}
```

**Response:**
```json
{
  "patientId": "uuid",
  "userId": "uuid",
  "email": "patient@hospital.com",
  "fullName": "John Doe",
  "medicalRecordNumber": "MRN-12345",
  "createdAt": "2023-01-01T00:00:00Z"
}
```

### Create Multiple Patients (Bulk)
**POST** `/patients/hospital-admin/bulk`

Creates multiple patients at once with complete user account setup.

**Request Body:**
```json
{
  "patients": [
    {
      "email": "patient1@hospital.com",
      "password": "SecurePass123!",
      "firstName": "John",
      "lastName": "Doe",
      // ... other patient fields
    },
    {
      "email": "patient2@hospital.com",
      "password": "SecurePass123!",
      "firstName": "Jane",
      "lastName": "Smith",
      // ... other patient fields
    }
  ]
}
```

**Response:**
```json
{
  "successful": [
    {
      "patientId": "uuid",
      "userId": "uuid",
      "email": "patient1@hospital.com",
      "fullName": "John Doe",
      "medicalRecordNumber": "MRN-12345",
      "createdAt": "2023-01-01T00:00:00Z"
    }
  ],
  "failed": [
    {
      "index": 1,
      "email": "patient.duplicate@hospital.com",
      "error": "Email already exists"
    }
  ],
  "summary": {
    "total": 5,
    "successful": 4,
    "failed": 1
  }
}
```

### List All Patients
**GET** `/patients/hospital-admin/list`

Lists all patients in the hospital with pagination and search.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search by name, email, or medical record number

**Response:**
```json
{
  "patients": [
    {
      "patientId": "uuid",
      "tenantId": "uuid",
      "userId": "uuid",
      "medicalRecordNumber": "MRN-12345",
      "dateOfBirth": "1990-01-15T00:00:00Z",
      "gender": "Male",
      "address": "123 Main St, Anytown, ST 12345",
      "phoneNumber": "+1234567890",
      "insuranceInfo": { ... },
      "medicalHistory": { ... },
      "currentVitals": { ... },
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2023-01-01T00:00:00Z",
      "user": {
        "userId": "uuid",
        "email": "patient@hospital.com",
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20
}
```

### Update Patient
**PUT** `/patients/hospital-admin/:patientId`

Updates patient information.

### Delete Patient
**DELETE** `/patients/hospital-admin/:patientId`

Deletes a patient and associated user account.

## Features Implemented

### ✅ Single Creation
- **Doctors**: Create individual doctor accounts with user setup
- **Patients**: Create individual patient accounts with user setup

### ✅ Bulk Creation
- **Doctors**: Create multiple doctors in one request
- **Patients**: Create multiple patients in one request
- **Error Handling**: Failed creations are reported with specific error messages
- **Success Tracking**: Successfully created accounts are returned with details

### ✅ Team Management
- **List Management**: Paginated listing of doctors and patients
- **Search Functionality**: Search by name, email, specialization (doctors), medical record number (patients)
- **Update Operations**: Update doctor and patient information
- **Delete Operations**: Remove doctors and patients from the system

### ✅ Data Validation
- **Strong Password Requirements**: Enforced for all user accounts
- **Email Validation**: Prevents duplicate emails
- **Required Fields**: Validated according to business rules
- **Date Handling**: Proper conversion of date strings to Date objects

### ✅ Response Structures
- **Consistent DTOs**: Properly typed response objects
- **Error Details**: Detailed error information for failed operations
- **Success Metrics**: Summary statistics for bulk operations

## Technical Implementation

### Backend Architecture
- **NestJS Controllers**: Dedicated hospital admin endpoints
- **Service Layer**: Business logic separation
- **DTOs**: Type-safe data transfer objects
- **Entity Relationships**: User ↔ Provider/Patient with tenant isolation
- **Validation**: Class-validator decorators for input validation

### Security Features
- **Password Hashing**: Secure password storage using crypto
- **Tenant Isolation**: Multi-tenant data separation
- **Email Uniqueness**: Prevents duplicate accounts
- **Input Sanitization**: Validated and sanitized inputs

### Database Integration
- **TypeORM**: Object-relational mapping
- **PostgreSQL**: Relational database with JSONB support
- **Migrations**: Schema versioning and updates
- **Relationships**: Proper foreign key constraints

## Usage Examples

### Create a Single Doctor
```bash
curl -X POST http://localhost:3000/providers/hospital-admin/single \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dr.smith@hospital.com",
    "password": "SecurePassword123!",
    "firstName": "John",
    "lastName": "Smith",
    "specialization": "Cardiology",
    "licenseNumber": "MD123456789"
  }'
```

### Create Multiple Patients
```bash
curl -X POST http://localhost:3000/patients/hospital-admin/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "patients": [
      {
        "email": "patient1@hospital.com",
        "password": "SecurePass123!",
        "firstName": "John",
        "lastName": "Doe",
        "dateOfBirth": "1990-01-15"
      },
      {
        "email": "patient2@hospital.com",
        "password": "SecurePass123!",
        "firstName": "Jane",
        "lastName": "Smith",
        "dateOfBirth": "1985-03-22"
      }
    ]
  }'
```

### List Doctors with Search
```bash
curl "http://localhost:3000/providers/hospital-admin/list?page=1&limit=10&search=cardiology"
```

## Next Steps

1. **Authentication Integration**: Add JWT authentication guards when auth module is available
2. **Role-Based Access**: Implement proper role checks for hospital admin access
3. **Audit Logging**: Track all hospital admin operations for compliance
4. **Email Notifications**: Send welcome emails to newly created users
5. **Batch Operations**: Add batch update and delete operations
6. **Export Functionality**: Add CSV/Excel export for doctor and patient lists
7. **Analytics Dashboard**: Provide statistics on team management operations

The hospital admin endpoints are now fully functional and provide comprehensive team management capabilities for both doctors and patients with single and bulk creation options.
