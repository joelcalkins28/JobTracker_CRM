#!/usr/bin/env node

/**
 * Environment Security Check Script
 * 
 * This script checks that all required environment variables are set
 * and provides guidance on securing sensitive information.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk'); // You may need to install this: npm install chalk

// Define required environment variables
const requiredVars = [
  { name: 'DATABASE_URL', sensitive: true },
  { name: 'NEXTAUTH_SECRET', sensitive: true },
  { name: 'NEXTAUTH_URL', sensitive: false },
  { name: 'JWT_SECRET', sensitive: true },
  { name: 'GOOGLE_CLIENT_ID', sensitive: true },
  { name: 'GOOGLE_CLIENT_SECRET', sensitive: true },
  { name: 'GOOGLE_REDIRECT_URI', sensitive: false },
  { name: 'NODE_ENV', sensitive: false }
];

// Helper functions
const log = {
  info: (msg) => console.log(chalk.blue('INFO: ') + msg),
  success: (msg) => console.log(chalk.green('SUCCESS: ') + msg),
  warning: (msg) => console.log(chalk.yellow('WARNING: ') + msg),
  error: (msg) => console.log(chalk.red('ERROR: ') + msg)
};

/**
 * Checks if .env files are in .gitignore
 * @returns {boolean} True if .env files are properly ignored
 */
function checkGitIgnore() {
  try {
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    if (!fs.existsSync(gitignorePath)) {
      log.error('No .gitignore file found. Create one to prevent committing sensitive information.');
      return false;
    }

    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    const lines = gitignoreContent.split('\n');
    
    const hasEnvIgnore = lines.some(line => 
      line.trim() === '.env' || 
      line.trim() === '.env.local' || 
      line.trim() === '*.env*' ||
      line.trim() === '.env*'
    );

    if (!hasEnvIgnore) {
      log.error('.env files are not ignored in .gitignore! Add ".env*" to your .gitignore file.');
      return false;
    }
    
    log.success('.env files are properly ignored in .gitignore');
    return true;
  } catch (error) {
    log.error(`Failed to check .gitignore: ${error.message}`);
    return false;
  }
}

/**
 * Checks if an example env file exists
 * @returns {boolean} True if example file exists
 */
function checkEnvExample() {
  const examplePath = path.join(process.cwd(), '.env.example');
  if (!fs.existsSync(examplePath)) {
    log.warning('No .env.example file found. Creating one helps new developers set up the project.');
    return false;
  }
  
  const exampleContent = fs.readFileSync(examplePath, 'utf8');
  const missingVars = [];
  
  for (const variable of requiredVars) {
    if (!exampleContent.includes(variable.name)) {
      missingVars.push(variable.name);
    }
  }
  
  if (missingVars.length > 0) {
    log.warning(`The following variables are missing from .env.example: ${missingVars.join(', ')}`);
    return false;
  }
  
  log.success('.env.example exists and contains all required variables');
  return true;
}

/**
 * Checks environment variables for presence and potential security issues
 */
function checkEnvironmentVariables() {
  log.info('Checking environment variables...');
  
  const missing = [];
  const insecure = [];
  
  for (const variable of requiredVars) {
    const value = process.env[variable.name];
    
    if (!value) {
      missing.push(variable.name);
      continue;
    }
    
    // Check for potentially insecure values
    if (variable.sensitive) {
      if (value.length < 10 && variable.name.includes('SECRET')) {
        insecure.push(`${variable.name} (too short for a secret)`);
      }
      
      if (value.includes('example') || value.includes('test') || value.includes('development')) {
        insecure.push(`${variable.name} (appears to be a non-production value)`);
      }
    }
  }
  
  if (missing.length > 0) {
    log.error(`Missing required environment variables: ${missing.join(', ')}`);
  } else {
    log.success('All required environment variables are set');
  }
  
  if (insecure.length > 0) {
    log.warning(`Potentially insecure environment variables: ${insecure.join(', ')}`);
  }
}

/**
 * Checks for sensitive files that should not be in the repository
 */
function checkSensitiveFiles() {
  const sensitivePatterns = [
    'credentials.json',
    'client_secret_*.json',
    'token.json',
    '.env.production',
    '.env.development',
    '.env.local',
    '.env'
  ];
  
  const foundFiles = [];
  
  for (const pattern of sensitivePatterns) {
    const files = fs.readdirSync(process.cwd())
      .filter(file => {
        if (pattern.includes('*')) {
          const regex = new RegExp(pattern.replace('*', '.*'));
          return regex.test(file);
        }
        return file === pattern;
      });
    
    foundFiles.push(...files);
  }
  
  if (foundFiles.length > 0) {
    log.warning(`Found potentially sensitive files that should not be committed: ${foundFiles.join(', ')}`);
    log.warning('Ensure these files are in your .gitignore');
  } else {
    log.success('No sensitive files found in the root directory');
  }
}

// Run all checks
function runSecurityChecks() {
  log.info('Starting environment security checks...');
  console.log('-'.repeat(50));
  
  checkGitIgnore();
  console.log('-'.repeat(50));
  
  checkEnvExample();
  console.log('-'.repeat(50));
  
  checkEnvironmentVariables();
  console.log('-'.repeat(50));
  
  checkSensitiveFiles();
  console.log('-'.repeat(50));
  
  log.info('Security check complete');
}

runSecurityChecks(); 