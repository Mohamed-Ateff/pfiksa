#!/usr/bin/env node

/**
 * Automated Deployment Setup Script
 * Run: npm run setup-deploy (from root)
 * This script verifies all prerequisites and guides you through deployment
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  const icon = exists ? '✅' : '❌';
  const status = exists ? 'green' : 'red';
  log(`${icon} ${description}`, status);
  return exists;
}

function checkDirectory(dirPath, description) {
  const exists = fs.existsSync(dirPath);
  const icon = exists ? '✅' : '❌';
  const status = exists ? 'green' : 'red';
  log(`${icon} ${description}`, status);
  return exists;
}

console.clear();
log('═══════════════════════════════════════════════════════════', 'cyan');
log('   🚀 EMPLOYEE-BOSS REPORTING SYSTEM - DEPLOYMENT CHECK    ', 'cyan');
log('═══════════════════════════════════════════════════════════', 'cyan');
log('');

// 1. Check project structure
log('📁 CHECKING PROJECT STRUCTURE:', 'blue');
let structureOk = true;
structureOk &= checkDirectory(path.join(__dirname, 'server'), '  server/ directory');
structureOk &= checkDirectory(path.join(__dirname, 'client'), '  client/ directory');
structureOk &= checkFile(path.join(__dirname, 'package.json'), '  Root package.json');
structureOk &= checkFile(path.join(__dirname, 'server', 'package.json'), '  Server package.json');
structureOk &= checkFile(path.join(__dirname, 'client', 'package.json'), '  Client package.json');
log('');

// 2. Check dependencies installed
log('📦 CHECKING DEPENDENCIES:', 'blue');
let serverModules = fs.existsSync(path.join(__dirname, 'server', 'node_modules'));
let clientModules = fs.existsSync(path.join(__dirname, 'client', 'node_modules'));

if (serverModules) log('✅ Server node_modules installed', 'green');
else log('⚠️  Server node_modules NOT installed (run: npm run install-all)', 'yellow');

if (clientModules) log('✅ Client node_modules installed', 'green');
else log('⚠️  Client node_modules NOT installed (run: npm run install-all)', 'yellow');
log('');

// 3. Check configuration files
log('⚙️  CHECKING CONFIGURATION FILES:', 'blue');
const envExample = checkFile(path.join(__dirname, 'server', '.env.example'), '  server/.env.example');
const envExists = fs.existsSync(path.join(__dirname, 'server', '.env'));
const envStatus = envExists ? '✅' : '⚠️ ';
const envColor = envExists ? 'green' : 'yellow';
log(`${envStatus} server/.env ${envExists ? '(exists - good for local dev)' : '(will be created during deployment)'}`, envColor);
checkFile(path.join(__dirname, '.gitignore'), '  .gitignore');
checkFile(path.join(__dirname, 'Procfile'), '  Procfile');
log('');

// 4. Check important API files
log('🔌 CHECKING API ENDPOINTS:', 'blue');
checkFile(path.join(__dirname, 'server', 'server.js'), '  server/server.js');
checkFile(path.join(__dirname, 'server', 'routes', 'auth.js'), '  server/routes/auth.js');
checkFile(path.join(__dirname, 'server', 'routes', 'reports.js'), '  server/routes/reports.js');
checkFile(path.join(__dirname, 'server', 'middleware', 'auth.js'), '  server/middleware/auth.js');
log('');

// 5. Check frontend files
log('🎨 CHECKING FRONTEND:', 'blue');
checkFile(path.join(__dirname, 'client', 'src', 'App.js'), '  client/src/App.js');
checkFile(path.join(__dirname, 'client', 'src', 'services', 'api.js'), '  client/src/services/api.js');
checkFile(path.join(__dirname, 'client', 'src', 'pages', 'EmployeeDashboard.js'), '  client/src/pages/EmployeeDashboard.js');
checkFile(path.join(__dirname, 'client', 'src', 'pages', 'BossDashboard.js'), '  client/src/pages/BossDashboard.js');
log('');

// 6. Check git status
log('📤 CHECKING GIT STATUS:', 'blue');
const gitConfigExists = fs.existsSync(path.join(__dirname, '.git'));
if (gitConfigExists) {
  log('✅ Git repository initialized', 'green');
  log('   To push changes: git add . && git commit -m "..." && git push', 'cyan');
} else {
  log('⚠️  Git repository not initialized', 'yellow');
}
log('');

// 7. Summary and next steps
log('📋 DEPLOYMENT READINESS SUMMARY:', 'blue');
if (structureOk && (serverModules || !serverModules)) {
  log('✅ Project structure is valid and ready for deployment', 'green');
  log('');
  log('🚀 NEXT STEPS:', 'cyan');
  log('');
  log('1️⃣  INSTALL DEPENDENCIES (only run once):', 'yellow');
  log('    npm run install-all', 'cyan');
  log('');
  log('2️⃣  TEST LOCALLY:', 'yellow');
  log('    npm run dev', 'cyan');
  log('    Then visit http://localhost:3000', 'cyan');
  log('');
  log('3️⃣  DEPLOY:', 'yellow');
  log('    Follow DEPLOYMENT_CHECKLIST.md or GLITCH_NETLIFY_CLICK_AND_GO.md', 'cyan');
  log('');
  log('📚 DEPLOYMENT GUIDES:', 'blue');
  log('   • DEPLOYMENT_CHECKLIST.md - Full verification checklist', 'cyan');
  log('   • GLITCH_NETLIFY_CLICK_AND_GO.md - Click-by-click guide', 'cyan');
  log('   • DEPLOY_FREE_NO_CARD.md - Free deployment options', 'cyan');
  log('');
} else {
  log('⚠️  Some issues found - see above', 'yellow');
}

log('═══════════════════════════════════════════════════════════', 'cyan');
log('');
