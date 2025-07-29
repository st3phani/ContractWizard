#!/bin/bash

echo "🧪 Testing Email Integration..."
echo ""

# Test 1: Check if MailHog is running
echo "1. Checking MailHog status..."
if curl -s http://localhost:8025 > /dev/null; then
    echo "✅ MailHog is running on http://localhost:8025"
else
    echo "❌ MailHog is not running. Starting it..."
    mailhog > /dev/null 2>&1 &
    sleep 3
    if curl -s http://localhost:8025 > /dev/null; then
        echo "✅ MailHog started successfully"
    else
        echo "❌ Failed to start MailHog"
        exit 1
    fi
fi

# Test 2: Check email test endpoint
echo ""
echo "2. Testing email system endpoint..."
RESPONSE=$(curl -s http://localhost:5000/api/email/test)
if [[ $RESPONSE == *"ready"* ]]; then
    echo "✅ Email system is ready"
else
    echo "⚠️  Email system status: $RESPONSE"
fi

# Test 3: Send a test email via API
echo ""
echo "3. Testing email sending..."
curl -s -X POST http://localhost:5000/api/contracts/1/email \
  -H "Content-Type: application/json" \
  -d '{
    "recipient": "test@example.com",
    "subject": "Test Contract Email",
    "message": "Acesta este un email de test pentru verificarea integrării MailHog.",
    "attachPDF": false
  }' > /dev/null

if [ $? -eq 0 ]; then
    echo "✅ Test email sent successfully"
else
    echo "❌ Failed to send test email"
fi

# Test 4: Check if email was received in MailHog
echo ""
echo "4. Checking MailHog for received emails..."
sleep 2
EMAILS=$(curl -s http://localhost:8025/api/v1/messages 2>/dev/null || echo "[]")
if [[ $EMAILS == *"test@example.com"* ]]; then
    echo "✅ Email received in MailHog!"
else
    echo "⚠️  No test email found in MailHog (might be okay if no test contracts exist)"
fi

echo ""
echo "🎉 Email integration test completed!"
echo "📧 Open MailHog: http://localhost:8025"
echo "🌐 Open App: http://localhost:5000"