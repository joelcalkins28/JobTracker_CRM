#!/bin/bash

# Fix imports by replacing @/app/ with @/
find ./app -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' -e 's|@/app/|@/|g'

echo "Fixed imports in all TypeScript files" 