#!/bin/bash

# Checkout main branch
git checkout main

# Force push to GitHub main branch
git push -f origin main

echo "Force pushed to main branch on GitHub."
echo "This overwrites the remote main branch with your local main branch."
echo "Visit your repository at: https://github.com/joelcalkins28/JobTracker_CRM" 