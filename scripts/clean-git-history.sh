#!/bin/bash

# Function to clean environment files from a branch
clean_branch() {
    local branch=$1
    echo "Cleaning branch: $branch"
    
    # Switch to the branch
    git checkout $branch
    
    # Remove environment files from git history
    git filter-branch --force --index-filter \
        "git rm --cached --ignore-unmatch .env*" \
        --prune-empty --tag-name-filter cat -- --all
    
    # Force push the changes
    git push origin $branch --force
}

# Clean main branch
clean_branch "main"

# Clean dev branch
clean_branch "dev"

# Delete local branches except main and dev
git branch | grep -v "main" | grep -v "dev" | xargs git branch -D

# Delete remote branches except main and dev
git push origin --delete $(git branch -r | grep -v "main" | grep -v "dev" | sed 's/origin\///')

# Switch back to dev branch
git checkout dev

echo "Cleanup complete! Only main and dev branches remain." 