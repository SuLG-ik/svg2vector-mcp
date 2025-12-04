# Publishing to npm

This guide will help you publish the svg2vector-mcp package to npm.

## Prerequisites

1. Create an npm account at https://www.npmjs.com/signup
2. Verify your email address

## Steps to Publish

### 1. Login to npm

```bash
npm login
```

Enter your:
- Username
- Password
- Email
- One-time password (if 2FA is enabled)

### 2. Update package.json

Before publishing, update:

- `version`: Follow semantic versioning (e.g., 1.0.0 → 1.0.1)
- `author`: Add your name/username
- `repository.url`: Update with your GitHub repository URL

Example:

```json
{
  "version": "1.0.0",
  "author": "Your Name <your.email@example.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/svg2vector-mcp.git"
  }
}
```

### 3. Test the Package

```bash
npm test
```

This will run the test script to ensure everything works.

### 4. Check Package Contents

See what will be published:

```bash
npm pack --dry-run
```

### 5. Publish

For first-time publishing:

```bash
npm publish
```

For subsequent versions:

```bash
# Update version first
npm version patch  # 1.0.0 → 1.0.1
# or
npm version minor  # 1.0.0 → 1.1.0
# or
npm version major  # 1.0.0 → 2.0.0

# Then publish
npm publish
```

### 6. Verify Publication

Check your package at:
```
https://www.npmjs.com/package/svg2vector-mcp
```

## Using Published Package

After publishing, users can install with:

```bash
npm install -g svg2vector-mcp
```

## Updating

To publish updates:

1. Make your changes
2. Test: `npm test`
3. Update version: `npm version patch` (or minor/major)
4. Publish: `npm publish`
5. Push git tags: `git push --tags`

## Troubleshooting

### Package name already exists
- Change the package name in package.json to something unique
- Check availability: `npm view <package-name>`

### Permission denied
- Verify you're logged in: `npm whoami`
- Check package scope/ownership

### 2FA Required
- Enable 2FA in npm settings for better security
- You'll need to enter OTP when publishing

## Best Practices

1. Always test before publishing
2. Use semantic versioning
3. Keep a CHANGELOG.md
4. Add tags to git commits: `git push --tags`
5. Consider using npm organizations for team packages
