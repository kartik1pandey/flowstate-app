# Contributing to FlowState

First off, thank you for considering contributing to FlowState! It's people like you that make FlowState such a great tool.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Testing](#testing)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker
- Git
- A Supabase account
- Basic knowledge of TypeScript, React, and Express.js

### Setup Development Environment

1. **Fork the repository**
   ```bash
   # Click the 'Fork' button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/flowstate.git
   cd flowstate
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/flowstate.git
   ```

4. **Install dependencies**
   ```bash
   # Backend
   cd backend && npm install
   
   # Frontend
   cd ../snitfront && npm install
   
   # Pathway
   cd ../services/pathway_engine
   pip install -r requirements.txt
   ```

5. **Setup environment variables**
   ```bash
   # Copy example files
   cp backend/.env.example backend/.env
   cp snitfront/.env.example snitfront/.env
   
   # Edit with your credentials
   ```

6. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend
   cd snitfront && npm run dev
   
   # Terminal 3 - Pathway
   cd services/pathway_engine
   docker-compose up
   ```

## 🔄 Development Process

### Branching Strategy

We use a simplified Git Flow:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

### Creating a Feature Branch

```bash
# Update your local main
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

### Making Changes

1. **Write clean, readable code**
   - Follow existing code style
   - Add comments for complex logic
   - Keep functions small and focused

2. **Test your changes**
   ```bash
   # Run tests
   npm test
   
   # Run linter
   npm run lint
   
   # Type check
   npm run type-check
   ```

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

## 🔀 Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No console.log or debugging code
- [ ] Branch is up to date with main

### Submitting a Pull Request

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Select your feature branch
   - Fill out the PR template

3. **PR Title Format**
   ```
   type(scope): description
   
   Examples:
   feat(auth): add OAuth2 login
   fix(api): resolve session timeout issue
   docs(readme): update installation steps
   ```

4. **PR Description Template**
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Testing
   - [ ] Unit tests pass
   - [ ] Integration tests pass
   - [ ] Manual testing completed
   
   ## Screenshots (if applicable)
   
   ## Related Issues
   Closes #123
   ```

### Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, your PR will be merged
4. Your contribution will be credited

## 📝 Coding Standards

### TypeScript/JavaScript

```typescript
// Use TypeScript for type safety
interface User {
  id: string;
  email: string;
  name: string;
}

// Use async/await over promises
async function getUser(id: string): Promise<User> {
  const user = await db.users.findById(id);
  return user;
}

// Use descriptive variable names
const activeUserCount = users.filter(u => u.isActive).length;

// Add JSDoc comments for public APIs
/**
 * Calculates the flow score based on user metrics
 * @param metrics - User activity metrics
 * @returns Flow score between 0-100
 */
function calculateFlowScore(metrics: Metrics): number {
  // Implementation
}
```

### Python

```python
# Follow PEP 8 style guide
# Use type hints
def calculate_flow_score(
    keystroke_count: int,
    distraction_count: int,
    session_seconds: int
) -> float:
    """
    Calculate flow score based on user metrics.
    
    Args:
        keystroke_count: Number of keystrokes
        distraction_count: Number of distractions
        session_seconds: Session duration in seconds
        
    Returns:
        Flow score between 0-100
    """
    # Implementation
    pass
```

### React Components

```typescript
// Use functional components with hooks
import { useState, useEffect } from 'react';

interface Props {
  userId: string;
}

export function UserProfile({ userId }: Props) {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);
  
  if (!user) return <Loading />;
  
  return (
    <div className="user-profile">
      <h1>{user.name}</h1>
    </div>
  );
}
```

## 💬 Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
type(scope): subject

body (optional)

footer (optional)
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(auth): add Google OAuth login

fix(api): resolve race condition in session creation

docs(readme): update installation instructions

refactor(pathway): optimize flow score calculation

test(api): add integration tests for auth endpoints
```

## 🧪 Testing

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd snitfront
npm test

# Pathway tests
cd services/pathway_engine
pytest

# Integration tests
npm run test:integration
```

### Writing Tests

```typescript
// Unit test example
describe('calculateFlowScore', () => {
  it('should return 100 for perfect metrics', () => {
    const score = calculateFlowScore({
      keystrokes: 1000,
      distractions: 0,
      duration: 3600
    });
    expect(score).toBe(100);
  });
  
  it('should return 0 for no activity', () => {
    const score = calculateFlowScore({
      keystrokes: 0,
      distractions: 0,
      duration: 0
    });
    expect(score).toBe(0);
  });
});
```

## 📚 Documentation

### Code Documentation

- Add JSDoc/docstrings for all public functions
- Include parameter descriptions and return types
- Add usage examples for complex functions

### README Updates

- Update README.md if adding new features
- Add screenshots for UI changes
- Update API documentation for new endpoints

## 🐛 Reporting Bugs

### Before Reporting

- Check existing issues
- Verify it's reproducible
- Gather relevant information

### Bug Report Template

```markdown
**Describe the bug**
A clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 1.0.0]

**Additional context**
Any other relevant information
```

## ✨ Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem

**Describe the solution you'd like**
What you want to happen

**Describe alternatives you've considered**
Other solutions you've thought about

**Additional context**
Mockups, examples, etc.
```

## 🎯 Areas for Contribution

We especially welcome contributions in these areas:

- 🐛 Bug fixes
- 📝 Documentation improvements
- 🧪 Test coverage
- ♿ Accessibility improvements
- 🌍 Internationalization (i18n)
- 🎨 UI/UX enhancements
- ⚡ Performance optimizations

## 💡 Questions?

- 💬 Join our [Discord](https://discord.gg/flowstate)
- 📧 Email: dev@flowstate.app
- 📖 Check the [documentation](./docs)

## 🙏 Thank You!

Your contributions make FlowState better for everyone. We appreciate your time and effort!

---

**Happy Coding! 🚀**
