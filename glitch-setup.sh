#!/bin/bash
# Glitch Deployment Helper Script
# Run this in Glitch's console to set up the app

echo "🚀 Setting up your app on Glitch..."

# Install dependencies
npm install

# Create .env file if it doesn't exist
if [ ! -f server/.env ]; then
    cat > server/.env << EOF
MONGODB_URI=mongodb+srv://admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/employee-reports?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_12345
PORT=3000
NODE_ENV=production
EOF
    echo "✅ Created .env file - EDIT IT WITH YOUR MONGODB STRING!"
else
    echo "✅ .env file already exists"
fi

# Start the server
npm run server
