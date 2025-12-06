# Email Configuration Guide

## Overview

Meditir uses Resend for email delivery, providing beautiful, responsive email templates for:

- **Hospital Welcome Emails**: Sent when a new hospital is created
- **User Invitation Emails**: Sent when users are invited to join a hospital
- **Password Reset Emails**: Sent when users request password resets

## Setup

### 1. Get Resend API Key

1. Go to [Resend](https://resend.com)
2. Create an account or sign in
3. Generate an API key from your dashboard
4. Add the API key to your environment variables

### 2. Environment Variables

Add these to your `.env` file:

```bash
# Email Configuration
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=noreply@notifications.meditir.com
FROM_NAME=Meditir Platform
FRONTEND_BASE_URL=http://localhost:3001
```

### 3. Domain Configuration

For production, you'll need to:

1. Verify your domain in Resend
2. Add SPF and DKIM records to your DNS
3. Update `FROM_EMAIL` to use your verified domain

## Email Templates

All email templates follow a green and white design theme consistent with Meditir branding.

### Hospital Welcome Email

**Triggered when**: A new hospital is created by platform admin

**Content includes**:

- Welcome message with hospital name
- Login credentials (subdomain, email, temporary password)
- Password reset link
- Feature overview
- Security notice about password reset

**Template variables**:

- `hospitalName`: The hospital's display name
- `adminName`: Admin's full name
- `adminEmail`: Admin's email address
- `subdomain`: Hospital's subdomain
- `temporaryPassword`: Temporary password
- `resetPasswordUrl`: Link to reset password

### User Invitation Email

**Triggered when**: A user is invited to join a hospital

**Content includes**:

- Personal welcome message
- Role information
- Hospital details
- Login credentials
- Password setup link
- Inviter information

**Template variables**:

- `hospitalName`: The hospital's display name
- `userFirstName`: User's first name
- `userLastName`: User's last name
- `userEmail`: User's email address
- `role`: User's role (Doctor, Nurse, etc.)
- `temporaryPassword`: Temporary password
- `resetPasswordUrl`: Link to set password
- `invitedByName`: Name of person who sent the invitation

### Password Reset Email

**Triggered when**: User requests password reset

**Content includes**:

- Personal greeting
- Reset link with token
- Security notice about link expiration
- Alternative text link
- Contact information for help

**Template variables**:

- `userFirstName`: User's first name
- `userLastName`: User's last name
- `userEmail`: User's email address
- `resetToken`: Secure reset token
- `resetPasswordUrl`: Base URL for password reset
- `hospitalName`: Hospital name (optional)

## Password Reset Flow

### 1. Request Password Reset

**Endpoint**: `POST /auth/forgot-password`

**Request**:

```json
{
  "email": "user@hospital.com"
}
```

**Headers** (for hospital users):

```
x-tenant-subdomain: hospital-subdomain
```

### 2. Validate Reset Token

**Endpoint**: `POST /auth/validate-reset-token`

**Request**:

```json
{
  "token": "reset-token-here"
}
```

**Response**:

```json
{
  "valid": true
}
```

### 3. Reset Password

**Endpoint**: `POST /auth/reset-password`

**Request**:

```json
{
  "token": "reset-token-here",
  "newPassword": "newSecurePassword123!"
}
```

## Frontend Integration

### Admin Frontend

Password reset pages are available at:

- `/forgot-password` - Request password reset
- `/reset-password?token=xxx` - Reset password with token

### Hospital App

Password reset functionality is integrated into:

- Login page with "Forgot Password" link
- Dedicated reset password pages
- Tenant-aware password reset (uses subdomain)

## Security Features

### Token Security

- Tokens are cryptographically secure (32 bytes)
- 24-hour expiration time
- Single-use tokens (marked as used after reset)
- Automatic cleanup of old tokens

### Email Security

- No sensitive information in email content
- Secure reset links with HTTPS
- Clear expiration messaging
- Rate limiting on password reset requests

### Privacy Protection

- Doesn't reveal if email exists
- Generic success messages
- Secure error handling

## Error Handling

The email service includes robust error handling:

- Email failures don't block user/hospital creation
- Detailed logging for debugging
- Graceful degradation if Resend is unavailable
- Retry mechanisms for transient failures

## Testing

### Development Testing

For development, you can use Resend's test mode:

1. Use a test API key
2. Emails will be logged but not delivered
3. Check the Resend dashboard for delivery status

### Integration Testing

Test the complete flow:

1. Create a hospital → Check welcome email
2. Invite a user → Check invitation email
3. Request password reset → Check reset email
4. Complete password reset → Verify functionality

## Production Deployment

### DNS Configuration

Add these DNS records for your domain:

```
# SPF Record
TXT @ "v=spf1 include:_spf.resend.com ~all"

# DKIM Record (get from Resend dashboard)
TXT resend._domainkey "v=DKIM1; k=rsa; p=YOUR_PUBLIC_KEY"
```

### Environment Variables

Update production environment:

```bash
RESEND_API_KEY=re_live_your_production_key
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Your Platform Name
FRONTEND_BASE_URL=https://admin.yourdomain.com
```

### Monitoring

Monitor email delivery through:

- Resend dashboard analytics
- Application logs
- User feedback on email delivery

## Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check API key validity
   - Verify domain authentication
   - Check rate limits

2. **Reset links not working**
   - Verify FRONTEND_BASE_URL is correct
   - Check token expiration
   - Ensure HTTPS in production

3. **Template rendering issues**
   - Check template variable names
   - Verify HTML structure
   - Test with different email clients

### Debug Mode

Enable detailed email logging:

```bash
LOG_LEVEL=debug
```

This will log email sending attempts and responses from Resend.

## Support

For issues with:

- **Resend API**: Contact Resend support
- **Template design**: Modify templates in `EmailService`
- **Integration issues**: Check application logs and error handling
