# 📁 Project Structure

This document describes the organization of the FlowState repository.

## Root Directory

```
flowstate/
├── backend/                 # Express.js Backend API
├── snitfront/              # Next.js Frontend Application
├── services/               # Microservices
│   └── pathway_engine/     # Pathway Analytics Engine
├── docs/                   # Documentation
├── scripts/                # Utility scripts
├── archive/                # Archived files (not in git)
├── .github/                # GitHub workflows and templates
├── README.md               # Main project README
├── CONTRIBUTING.md         # Contribution guidelines
├── CODE_OF_CONDUCT.md      # Code of conduct
├── LICENSE                 # MIT License
├── STRUCTURE.md            # This file
├── .gitignore              # Git ignore rules
├── docker-compose.yml      # Docker compose for local dev
└── package.json            # Root package.json (optional)
```

## Backend Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # Database configuration
│   ├── middleware/
│   │   └── auth.ts              # Authentication middleware
│   ├── models/
│   │   ├── User.ts              # User model
│   │   ├── UserSettings.ts      # Settings model
│   │   ├── FlowSession.ts       # Session model
│   │   ├── Intervention.ts      # Intervention model
│   │   └── Media.ts             # Media model
│   ├── routes/
│   │   ├── auth.ts              # Auth endpoints
│   │   ├── sessions.ts          # Session endpoints
│   │   ├── settings.ts          # Settings endpoints
│   │   ├── interventions.ts     # Intervention endpoints
│   │   ├── analytics.ts         # Analytics endpoints
│   │   ├── spotify.ts           # Spotify integration
│   │   └── generate-sample-data.ts  # Test data generation
│   ├── utils/
│   │   └── spotify.ts           # Spotify utilities
│   └── server.ts                # Express server entry point
├── dist/                        # Compiled JavaScript (gitignored)
├── node_modules/                # Dependencies (gitignored)
├── tests/                       # Test files
├── .env                         # Environment variables (gitignored)
├── .env.example                 # Environment template
├── .gitignore                   # Backend gitignore
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── README.md                    # Backend documentation
└── render.yaml                  # Render deployment config
```

## Frontend Structure

```
snitfront/
├── app/
│   ├── (auth)/
│   │   ├── login/              # Login page
│   │   └── register/           # Registration page
│   ├── spaces/
│   │   ├── code/               # Code workspace
│   │   └── whiteboard/         # Whiteboard workspace
│   ├── analytics/
│   │   ├── code/               # Code analytics
│   │   └── whiteboard/         # Whiteboard analytics
│   ├── settings/               # Settings page
│   ├── profile/                # User profile
│   ├── api/                    # API routes (BFF pattern)
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── components/
│   ├── ui/                     # UI components
│   ├── layout/                 # Layout components
│   ├── spaces/                 # Workspace components
│   └── analytics/              # Analytics components
├── hooks/
│   ├── useAuth.ts              # Authentication hook
│   ├── useSession.ts           # Session management hook
│   └── useAnalytics.ts         # Analytics hook
├── lib/
│   ├── api.ts                  # API client
│   ├── auth.ts                 # Auth utilities
│   └── utils.ts                # General utilities
├── models/
│   ├── User.ts                 # User types
│   ├── Session.ts              # Session types
│   └── Analytics.ts            # Analytics types
├── public/                     # Static assets
├── styles/                     # Global styles
├── .next/                      # Next.js build (gitignored)
├── node_modules/               # Dependencies (gitignored)
├── .env                        # Environment variables (gitignored)
├── .env.example                # Environment template
├── .gitignore                  # Frontend gitignore
├── next.config.js              # Next.js configuration
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.js          # Tailwind configuration
├── postcss.config.js           # PostCSS configuration
├── vercel.json                 # Vercel deployment config
└── README.md                   # Frontend documentation
```

## Pathway Engine Structure

```
services/pathway_engine/
├── main.py                     # FastAPI + Pathway application
├── requirements.txt            # Python dependencies
├── Dockerfile                  # Docker configuration
├── .dockerignore               # Docker ignore rules
├── input_stream/               # Input directory (gitignored)
├── output/                     # Output directory (gitignored)
└── README.md                   # Pathway documentation
```

## Documentation Structure

```
docs/
├── README.md                   # Documentation index
├── setup/
│   ├── QUICK_START.md          # Quick start guide
│   ├── SETUP_GUIDE.md          # Complete setup guide
│   ├── ENVIRONMENT_VARIABLES.md # Environment variables
│   └── database-schema.sql     # Database schema
├── architecture/
│   ├── SYSTEM_ARCHITECTURE.md  # System architecture
│   ├── DATABASE_SCHEMA.md      # Database design
│   └── PATHWAY_INTEGRATION.md  # Pathway integration
├── api/
│   ├── API_REFERENCE.md        # API documentation
│   └── AUTHENTICATION.md       # Auth documentation
├── deployment/
│   ├── DEPLOYMENT_GUIDE.md     # Deployment guide
│   ├── VERCEL.md               # Vercel deployment
│   ├── RENDER.md               # Render deployment
│   └── DOCKER.md               # Docker deployment
├── development/
│   ├── LOCAL_DEVELOPMENT.md    # Local dev guide
│   ├── TESTING_GUIDE.md        # Testing guide
│   └── CODE_STYLE.md           # Code style guide
├── troubleshooting/
│   ├── COMMON_ISSUES.md        # Common issues
│   └── FAQ.md                  # Frequently asked questions
└── security/
    └── SECURITY.md             # Security best practices
```

## Scripts Directory

```
scripts/
├── cleanup-repo.ps1            # Repository cleanup script
├── setup-dev.sh                # Development setup script
├── deploy.sh                   # Deployment script
└── test-all.sh                 # Run all tests
```

## GitHub Directory

```
.github/
├── workflows/
│   ├── ci.yml                  # Continuous integration
│   ├── deploy.yml              # Deployment workflow
│   └── test.yml                # Test workflow
├── ISSUE_TEMPLATE/
│   ├── bug_report.md           # Bug report template
│   └── feature_request.md      # Feature request template
└── PULL_REQUEST_TEMPLATE.md    # PR template
```

## Archive Directory

```
archive/
├── old-docs/                   # Old documentation files
├── scripts/                    # Old script files
└── README.md                   # Archive index
```

## File Naming Conventions

### Documentation
- Use UPPERCASE for important docs: `README.md`, `CONTRIBUTING.md`
- Use Title Case for guides: `Quick_Start.md`
- Use hyphens for multi-word files: `database-schema.sql`

### Code Files
- Use camelCase for TypeScript/JavaScript: `userModel.ts`
- Use PascalCase for components: `UserProfile.tsx`
- Use kebab-case for CSS/config: `tailwind.config.js`
- Use snake_case for Python: `main.py`

### Directories
- Use lowercase for directories: `components/`, `utils/`
- Use kebab-case for multi-word: `api-routes/`

## Important Files

### Root Level
- `README.md` - Main project documentation
- `CONTRIBUTING.md` - How to contribute
- `CODE_OF_CONDUCT.md` - Community guidelines
- `LICENSE` - MIT License
- `STRUCTURE.md` - This file
- `.gitignore` - Git ignore rules

### Backend
- `backend/src/server.ts` - Entry point
- `backend/src/config/database.ts` - Database setup
- `backend/.env.example` - Environment template

### Frontend
- `snitfront/app/layout.tsx` - Root layout
- `snitfront/app/page.tsx` - Home page
- `snitfront/.env.example` - Environment template

### Pathway
- `services/pathway_engine/main.py` - Main application
- `services/pathway_engine/Dockerfile` - Docker config

## Git Workflow

### Branches
- `main` - Production code
- `develop` - Development branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches
- `hotfix/*` - Urgent fixes

### Commits
Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code style
- `refactor:` - Code refactoring
- `test:` - Tests
- `chore:` - Maintenance

## Environment Files

### Never Commit
- `.env` - Local environment variables
- `.env.local` - Local overrides
- `.env.production` - Production secrets

### Always Commit
- `.env.example` - Environment template
- `.env.development.example` - Development template

## Build Artifacts (Gitignored)

- `node_modules/` - NPM dependencies
- `dist/` - Compiled code
- `.next/` - Next.js build
- `build/` - Build output
- `coverage/` - Test coverage
- `*.log` - Log files

## Best Practices

1. **Keep root clean** - Only essential files in root
2. **Organize by feature** - Group related files together
3. **Use consistent naming** - Follow conventions
4. **Document structure** - Keep this file updated
5. **Archive old files** - Don't delete, archive
6. **Use .gitignore** - Keep repo clean
7. **Separate concerns** - Backend, frontend, services
8. **Version control** - Commit often, push regularly

## Maintenance

### Regular Tasks
- [ ] Update dependencies monthly
- [ ] Review and archive old docs
- [ ] Update documentation
- [ ] Clean up unused files
- [ ] Review .gitignore rules

### Before Release
- [ ] Update version numbers
- [ ] Update CHANGELOG
- [ ] Review documentation
- [ ] Run all tests
- [ ] Build production bundles

## References

- [Main README](./README.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [Documentation Index](./docs/README.md)
- [Architecture Guide](./docs/architecture/SYSTEM_ARCHITECTURE.md)
