#!/bin/bash

# Diagnostic script to identify the issue

echo "🔍 GitHub Profile Generator Diagnostics"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check Node.js
echo "1. Checking Node.js..."
if command -v node &> /dev/null; then
    echo -e "${GREEN}✅ Node.js: $(node --version)${NC}"
else
    echo -e "${RED}❌ Node.js not found${NC}"
fi

# Check npm
echo "2. Checking npm..."
if command -v npm &> /dev/null; then
    echo -e "${GREEN}✅ npm: $(npm --version)${NC}"
else
    echo -e "${RED}❌ npm not found${NC}"
fi

echo ""
echo "3. Checking file structure..."

# Check package.json
if [ -f "package.json" ]; then
    echo -e "${GREEN}✅ package.json exists${NC}"
    echo "   Scripts defined:"
    cat package.json | grep -A 10 '"scripts"' | grep -v "scripts" | sed 's/^/   /'
else
    echo -e "${RED}❌ package.json NOT FOUND${NC}"
fi

# Check tsconfig.json
if [ -f "tsconfig.json" ]; then
    echo -e "${GREEN}✅ tsconfig.json exists${NC}"
else
    echo -e "${RED}❌ tsconfig.json NOT FOUND${NC}"
fi

# Check src/index.ts
if [ -f "src/index.ts" ]; then
    echo -e "${GREEN}✅ src/index.ts exists${NC}"
    lines=$(wc -l < src/index.ts)
    echo "   Lines: $lines"
else
    echo -e "${RED}❌ src/index.ts NOT FOUND${NC}"
fi

# Check workflow file
if [ -f ".github/workflows/update-profile.yml" ]; then
    echo -e "${GREEN}✅ .github/workflows/update-profile.yml exists${NC}"
else
    echo -e "${RED}❌ Workflow file NOT FOUND${NC}"
fi

echo ""
echo "4. Checking dependencies..."

# Check node_modules
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules exists${NC}"

    # Check specific dependencies
    if [ -d "node_modules/@octokit" ]; then
        echo -e "${GREEN}✅ @octokit/rest installed${NC}"
    else
        echo -e "${RED}❌ @octokit/rest NOT installed${NC}"
    fi

    if [ -d "node_modules/typescript" ]; then
        echo -e "${GREEN}✅ typescript installed${NC}"
    else
        echo -e "${RED}❌ typescript NOT installed${NC}"
    fi
else
    echo -e "${RED}❌ node_modules NOT FOUND${NC}"
    echo -e "${YELLOW}⚠️  Run: npm install${NC}"
fi

echo ""
echo "5. Checking build output..."

# Check dist folder
if [ -d "dist" ]; then
    echo -e "${GREEN}✅ dist/ folder exists${NC}"

    if [ -f "dist/index.js" ]; then
        echo -e "${GREEN}✅ dist/index.js exists${NC}"
    else
        echo -e "${RED}❌ dist/index.js NOT FOUND${NC}"
        echo -e "${YELLOW}⚠️  Run: npm run build${NC}"
    fi
else
    echo -e "${RED}❌ dist/ folder NOT FOUND${NC}"
    echo -e "${YELLOW}⚠️  Run: npm run build${NC}"
fi

echo ""
echo "6. Testing npm scripts..."

# Check if package.json has scripts
if [ -f "package.json" ]; then
    if grep -q '"generate"' package.json; then
        echo -e "${GREEN}✅ 'generate' script found in package.json${NC}"
    else
        echo -e "${RED}❌ 'generate' script NOT found in package.json${NC}"
        echo -e "${YELLOW}⚠️  Your package.json is missing the generate script!${NC}"
    fi

    if grep -q '"build"' package.json; then
        echo -e "${GREEN}✅ 'build' script found in package.json${NC}"
    else
        echo -e "${RED}❌ 'build' script NOT found in package.json${NC}"
    fi
fi

echo ""
echo "7. Checking git status..."
git status --short 2>/dev/null || echo "Not a git repository"

echo ""
echo "========================================"
echo "📋 Summary & Recommendations"
echo "========================================"

# Provide recommendations
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ CRITICAL: package.json is missing${NC}"
    echo "   Create it with: npm init -y"
fi

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Dependencies not installed${NC}"
    echo "   Run: npm install"
fi

if [ ! -f "dist/index.js" ]; then
    echo -e "${YELLOW}⚠️  Project not built${NC}"
    echo "   Run: npm run build"
fi

if [ -f "package.json" ] && ! grep -q '"generate"' package.json; then
    echo -e "${RED}❌ CRITICAL: package.json missing 'generate' script${NC}"
    echo "   Add this to package.json scripts section:"
    echo '   "generate": "node dist/index.js",'
fi

echo ""
echo "🔧 Quick Fix Commands:"
echo "   npm install          # Install dependencies"
echo "   npm run build        # Build TypeScript"
echo "   npm run generate     # Run generator"
echo ""
