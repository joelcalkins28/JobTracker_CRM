#!/bin/bash

# Force push to GitHub
git checkout -b project-files
git push -f origin project-files

echo "Pushed to project-files branch on GitHub. Please go to GitHub and:"
echo "1. Navigate to your repository: https://github.com/joelcalkins28/JobTracker_CRM"
echo "2. You should see a notification to create a pull request from project-files"
echo "3. Create the pull request and merge it to main" 