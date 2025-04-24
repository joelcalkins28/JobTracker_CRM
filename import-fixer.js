// This script updates all imports to use the full path from the app directory
// Run with: node import-fixer.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all TypeScript files in the app directory
const result = execSync('find ./app -type f -name "*.ts" -o -name "*.tsx"').toString();
const files = result.split('\n').filter(Boolean);

// Function to process each file
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace imports from @/components to app/components
    content = content.replace(/from\s+['"']@\/components\//g, 'from \'app/components/');
    
    // Replace imports from @/lib to app/lib
    content = content.replace(/from\s+['"']@\/lib\//g, 'from \'app/lib/');
    
    // Replace imports from @/hooks to app/hooks
    content = content.replace(/from\s+['"']@\/hooks\//g, 'from \'app/hooks/');
    
    // Replace other imports from @/ to app/
    content = content.replace(/from\s+['"']@\//g, 'from \'app/');
    
    // Write updated content back to the file
    fs.writeFileSync(filePath, content);
    console.log(`Updated imports in ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

// Process all files
files.forEach(processFile);

console.log('Import paths updated successfully!'); 