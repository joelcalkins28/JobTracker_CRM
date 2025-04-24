# ⚠️ SECURITY ALERT: Exposed Google API Credentials

## Issue

Google API credentials have been exposed in a JSON file that was uploaded to the repository:
- Client ID: 1093119358418-svf1pbp3dohn2gs2s66vn1r7pt4e2vb3.apps.googleusercontent.com
- Client Secret: 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

## Actions Taken

1. **Credentials moved to environment variables**: The exposed credentials have been moved to `.env.local` file which is excluded from git by the `.gitignore` file.
2. **Exposed JSON credential file deleted**: The credential file has been deleted from the repository.

## Critical Next Steps

### Immediate Actions Required

1. **Regenerate Google OAuth credentials**:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Delete the exposed client secret
   - Create a new OAuth client ID
   - Update the `.env.local` file with the new credentials
   - Update redirect URIs in Google Cloud Console

2. **Check for commits containing the credentials**:
   - If the credentials were previously committed to git, they still exist in the repository history
   - Consider using tools like `git filter-branch` or `BFG Repo Cleaner` to remove sensitive information from git history
   - Alternatively, consider creating a fresh repository and copying the current codebase

### Best Practices Going Forward

1. **Never commit credentials or secrets** to git repositories
2. **Always use environment variables** for secrets
3. **Set up pre-commit hooks** to scan for potential secrets in code
4. **Regularly rotate credentials** especially after any potential exposure
5. **Use Vercel's environment variables** for deployment secrets

## Security Resources

- [Google Cloud Platform - Security Best Practices](https://cloud.google.com/docs/security/best-practices)
- [NextAuth.js Security Documentation](https://next-auth.js.org/security)
- [Vercel Environment Variables Documentation](https://vercel.com/docs/concepts/projects/environment-variables)
- [Git - Removing Sensitive Data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository) 