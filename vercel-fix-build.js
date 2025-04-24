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
  
  // First run our special path fixes for Vercel
  console.log('🔄 Running Vercel-specific path fixes...');
  execSync('node fix-vercel-paths.js');
  
  // Run the import fixer if needed
  if (fs.existsSync(path.join(__dirname, 'import-fixer.js'))) {
    console.log('🔄 Running import fixer...');
    execSync('node import-fixer.js');
    console.log('✅ Fixed imports');
  }
  
  // Create direct component aliases for the problematic components
  const componentsDir = 'components';
  const applicationsDir = path.join(componentsDir, 'applications');
  const commonDir = path.join(componentsDir, 'common');
  
  // Create directories if they don't exist
  if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true });
  }
  if (!fs.existsSync(applicationsDir)) {
    fs.mkdirSync(applicationsDir, { recursive: true });
  }
  if (!fs.existsSync(commonDir)) {
    fs.mkdirSync(commonDir, { recursive: true });
  }
  
  // Create direct alias files for specific problematic imports
  const aliases = [
    { path: path.join(applicationsDir, 'ApplicationForm.js'), target: './app/components/applications/ApplicationForm' },
    { path: path.join(applicationsDir, 'ApplicationDetail.js'), target: './app/components/applications/ApplicationDetail' },
    { path: path.join(applicationsDir, 'ApplicationList.js'), target: './app/components/applications/ApplicationList' },
    { path: path.join(commonDir, 'AppLayout.js'), target: './app/components/common/AppLayout' }
  ];
  
  // Create the alias files
  aliases.forEach(alias => {
    fs.writeFileSync(alias.path, `module.exports = require('${alias.target}');`);
  });
  
  console.log('✅ Created direct component aliases');
  console.log('🎉 Vercel build fixes completed successfully!');
} catch (error) {
  console.error('❌ Error during build fixes:', error);
  process.exit(1);
} 