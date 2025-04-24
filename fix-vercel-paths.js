// This script fixes specific import paths for Vercel build
const fs = require('fs');
const path = require('path');

console.log('🔧 Running special path fixes for Vercel...');

const filesToFix = [
  'app/(routes)/applications/[id]/page.tsx',
  'app/(routes)/applications/[id]/edit/page.tsx',
  'app/(routes)/applications/new/page.tsx',
  'app/(routes)/applications/page.tsx',
  'app/(routes)/dashboard/page.tsx',
  'app/(routes)/tasks/page.tsx',
  'app/(routes)/tasks/[id]/page.tsx',
  'app/(routes)/tasks/[id]/edit/page.tsx',
  'app/(routes)/tasks/new/page.tsx',
  'app/(routes)/auth/login/page.tsx',
  'app/(routes)/auth/register/page.tsx'
];

try {
  // Process each file with problematic imports
  filesToFix.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    
    if (fs.existsSync(fullPath)) {
      console.log(`Fixing imports in ${filePath}`);
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Fix relative paths that use ../../../../
      content = content.replace(/from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/(components|lib)/g, 
        "from '../../../..$1");
        
      // Fix @/app/ paths to @/ to prevent double app prefix
      content = content.replace(/from\s+['"]@\/app\/(components|lib)/g, 
        "from '@/$1");
      
      // Write fixed content back
      fs.writeFileSync(fullPath, content);
    } else {
      console.warn(`File not found: ${filePath}`);
    }
  });

  console.log('✅ Fixed specific import paths');

  // Now create the component alias directory for better compatibility
  const componentsDir = path.join(__dirname, 'components');
  const libDir = path.join(__dirname, 'lib');
  
  if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true });
    
    // Create components symlinks or just simple index.js files
    fs.writeFileSync(
      path.join(componentsDir, 'index.js'),
      "module.exports = require('./app/components');"
    );
  }
  
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
    
    // Create lib symlinks or just simple index.js files
    fs.writeFileSync(
      path.join(libDir, 'index.js'),
      "module.exports = require('./app/lib');"
    );
  }
  
  console.log('✅ Created component and lib aliases');
  console.log('✅ Vercel path fixes completed successfully!');
} catch (error) {
  console.error('❌ Error during Vercel path fixes:', error);
  process.exit(1);
} 