// This script patches the app to ensure it works on Vercel
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Running Vercel build fixes...');

// Create a patch for the app module resolution
try {
  // Create a module resolver file for Vercel
  const resolverContent = `
  module.exports = {
    alias: {
      '@': path.resolve(__dirname),
      'app': path.resolve(__dirname, 'app'),
    }
  };
  `;
  
  fs.writeFileSync(path.join(__dirname, 'module-resolver.js'), resolverContent);
  console.log('✅ Created module resolver');
  
  // Run the import fixer if needed
  if (fs.existsSync(path.join(__dirname, 'import-fixer.js'))) {
    console.log('🔄 Running import fixer...');
    execSync('node import-fixer.js');
    console.log('✅ Fixed imports');
  }
  
  console.log('🎉 Vercel build fixes completed successfully!');
} catch (error) {
  console.error('❌ Error during build fixes:', error);
  process.exit(1);
} 