#!/bin/bash

# AI Services Setup Script for MedZen Platform
# This script helps configure AI services for medical record analysis

echo "🔧 MedZen AI Services Configuration"
echo "=================================="

# Check if .env file exists
ENV_FILE="/Users/joseph/Projects/medzen/medzen-workspace/medzen-backend/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ .env file not found at $ENV_FILE"
    exit 1
fi

echo "✅ Found .env file"

# Function to check if a variable exists and is not a placeholder
check_config() {
    local var_name=$1
    local placeholder=$2
    local current_value=$(grep "^$var_name=" "$ENV_FILE" | cut -d'=' -f2)
    
    if [ -z "$current_value" ] || [ "$current_value" = "$placeholder" ]; then
        echo "⚠️  $var_name is not configured (current: $current_value)"
        return 1
    else
        echo "✅ $var_name is configured"
        return 0
    fi
}

echo ""
echo "🔍 Checking AI Service Configuration..."
echo "======================================"

# Check OpenAI configuration
echo ""
echo "📋 OpenAI Configuration:"
check_config "OPENAI_API_KEY" "your_openai_api_key_here"
openai_configured=$?

check_config "OPENAI_MODEL" ""
check_config "OPENAI_MAX_TOKENS" ""

# Check AWS configuration
echo ""
echo "📋 AWS Configuration:"
check_config "AWS_ACCESS_KEY_ID" "your_aws_access_key_here"
aws_key_configured=$?

check_config "AWS_SECRET_ACCESS_KEY" "your_aws_secret_key_here"
aws_secret_configured=$?

check_config "AWS_REGION" ""

# Check AI feature flags
echo ""
echo "📋 AI Feature Configuration:"
check_config "AI_INSIGHTS_ENABLED" ""
check_config "AI_CONFIDENCE_THRESHOLD" ""
check_config "AI_AUTO_UPDATE_ENABLED" ""

echo ""
echo "📊 Configuration Summary"
echo "======================="

if [ $openai_configured -eq 0 ]; then
    echo "✅ OpenAI: Ready"
else
    echo "❌ OpenAI: Not configured"
    echo "   To configure OpenAI:"
    echo "   1. Visit https://platform.openai.com/"
    echo "   2. Create an account and generate an API key"
    echo "   3. Update OPENAI_API_KEY in .env file"
fi

if [ $aws_key_configured -eq 0 ] && [ $aws_secret_configured -eq 0 ]; then
    echo "✅ AWS Comprehend Medical: Ready"
else
    echo "❌ AWS Comprehend Medical: Not configured"
    echo "   To configure AWS:"
    echo "   1. Visit https://aws.amazon.com/console/"
    echo "   2. Create IAM user with Comprehend Medical permissions"
    echo "   3. Update AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env"
fi

echo ""
echo "🚀 Next Steps"
echo "============"

if [ $openai_configured -ne 0 ] || [ $aws_key_configured -ne 0 ] || [ $aws_secret_configured -ne 0 ]; then
    echo "1. Configure missing AI services (see details above)"
    echo "2. Restart the backend server"
    echo "3. Test AI functionality using the health check endpoint:"
    echo "   GET /api/v1/ai-config/health"
else
    echo "✅ All AI services are configured!"
    echo "1. Restart the backend server to apply changes"
    echo "2. Test AI functionality:"
    echo "   - Use the Medical Records Management interface"
    echo "   - Click the AI Insights buttons"
    echo "   - Check /api/v1/ai-config/status for detailed status"
fi

echo ""
echo "📚 Additional Resources"
echo "====================="
echo "- AI Implementation Guide: ./AI_IMPLEMENTATION_GUIDE.md"
echo "- Backend API Documentation: http://localhost:3000/api"
echo "- OpenAI Platform: https://platform.openai.com/"
echo "- AWS Comprehend Medical: https://aws.amazon.com/comprehend/medical/"

echo ""
echo "🔒 Security Reminders"
echo "===================="
echo "- Never commit API keys to version control"
echo "- Use environment variables for all secrets"
echo "- Monitor API usage and billing"
echo "- Implement proper rate limiting"

echo ""
echo "Configuration check complete! 🎉"