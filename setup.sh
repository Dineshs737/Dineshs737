#!/bin/bash

# GitHub Profile Auto-Updater Setup Script
# This script helps you set up the automated profile generator quickly

set -e

echo "🚀 GitHub Profile Auto-Updater Setup"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm found: $(npm --version)${NC}"
echo ""

# Get GitHub username
read -p "Enter your GitHub username (default: Dineshs737): " GITHUB_USERNAME
GITHUB_USERNAME=${GITHUB_USERNAME:-Dineshs737}

echo -e "${BLUE}📦 Using username: $GITHUB_USERNAME${NC}"
echo ""

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p .github/workflows
mkdir -p src
mkdir -p dist

# Create .gitignore if it doesn't exist
if [ ! -f .gitignore ]; then
    echo "📝 Creating .gitignore..."
    cat > .gitignore << EOF
node_modules/
dist/
.env
*.log
.DS_Store
*.js.map
EOF
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
if [ ! -f package.json ]; then
    npm init -y
fi

npm install @octokit/rest
npm install --save-dev typescript @types/node ts-node

echo ""
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Build the project
echo ""
echo "🔨 Building TypeScript..."
if [ -f tsconfig.json ]; then
    npm run build || true
fi

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "📋 Next steps:"
echo "1. Create a GitHub Personal Access Token:"
echo "   ${BLUE}https://github.com/settings/tokens${NC}"
echo ""
echo "2. Add the token to your repository secrets:"
echo "   ${BLUE}https://github.com/$GITHUB_USERNAME/$GITHUB_USERNAME/settings/secrets/actions${NC}"
echo "   Name: ${YELLOW}GH_TOKEN${NC}"
echo ""
echo "3. Test locally (optional):"
echo "   ${YELLOW}export GITHUB_TOKEN=your_token_here${NC}"
echo "   ${YELLOW}npm run generate${NC}"
echo ""
echo "4. Commit and push:"
echo "   ${YELLOW}git add .${NC}"
echo "   ${YELLOW}git commit -m '🎉 Initial setup'${NC}"
echo "   ${YELLOW}git push${NC}"
echo ""
echo "5. Trigger the workflow manually or wait for automatic run"
echo ""
echo -e "${GREEN}🎉 Happy coding!${NC}"
