#!/bin/bash

# Create a backup of the current branch
git branch backup-before-clean

# Remove environment files from git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch \
    .env \
    .env.* \
    .env.local \
    .env.development \
    .env.test \
    .env.production \
    .env.development.local \
    .env.test.local \
    .env.production.local" \
  --prune-empty --tag-name-filter cat -- --all

# Clean up and optimize the repository
git for-each-ref --format='delete %(refname)' refs/original/ | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo "Git history has been cleaned. Original branch is saved as 'backup-before-clean'"
echo "Please review the changes and then run:"
echo "git push origin --force --all"
echo "git push origin --force --tags" 