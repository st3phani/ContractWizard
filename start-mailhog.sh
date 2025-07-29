#!/bin/bash

# Start MailHog in background
echo "🚀 Starting MailHog..."
echo "📧 SMTP Server: localhost:1025"
echo "🌐 Web Interface: http://localhost:8025"
echo ""

# Start MailHog
mailhog &

echo "✅ MailHog is running!"
echo "🔗 Access the web interface at: http://localhost:8025"
echo "📨 SMTP server is listening on: localhost:1025"
echo ""
echo "To stop MailHog, use: pkill mailhog"