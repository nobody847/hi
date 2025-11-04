# Priyam Ops Hub

A personal dashboard for tracking development projects, credentials, notes, and progress. Single-user application designed for personal use only.

## Recent Changes

### November 3, 2025
- Converted from Firebase multi-user to single-user PostgreSQL system
- Replaced Firebase Authentication with simple session-based login (username: priyam, password: priyam@2653)
- Migrated from Cloud Firestore to PostgreSQL with Drizzle ORM
- Removed all multi-user functionality for personal use only
- Kept working Google Drive backup integration from Replit
- Merged best UI components from local codebase
- Implemented Express.js REST API for all CRUD operations

## Project Architecture

### Frontend (React + TypeScript + Tailwind CSS)
- **Authentication**: Session-based with hardcoded credentials (personal use)
- **State Management**: React hooks with API calls
- **Routing**: Wouter for client-side navigation
- **UI Components**: Shadcn UI with custom dark theme
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with Zod validation

### Backend (Express + PostgreSQL)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Express session-based authentication
- **API**: RESTful API endpoints for all CRUD operations
- **External Integrations**: Google Drive API for project backups (via Replit Connector)

### Data Model
- **Projects**: Main entity with name, description, status, tech stack, links, dev notes
- **Issues**: Bug/error tracker with priority and status
- **Credentials**: Secure key-value storage for API keys and secrets
- **Team Members**: Collaborator information with roles and contact
- **Goals**: Future roadmap items with completion tracking
- **Users**: Single user authentication table

## Key Features

1. **Dashboard**: Overview with project status charts, recent activity, quick access cards
2. **Projects Management**: Full CRUD operations with search and filtering
3. **Project Details**: Multi-tabbed view (Details, Dev Notes, Issue Tracker, Credentials, Team, Goals)
4. **Technologies Analytics**: Bar chart showing most-used technologies
5. **Google Drive Backup**: Export project data to Google Drive (credentials excluded for security)
6. **Personal Use**: Single-user system with hardcoded authentication
7. **Security**: Session-based authentication with PostgreSQL data storage

## Database Schema

PostgreSQL tables managed by Drizzle ORM:
- `projects`: Project information with timestamps and tech stack array
- `issues`: Project issues with foreign key to projects (cascade delete)
- `credentials`: API keys and secrets with foreign key to projects (cascade delete)
- `team_members`: Team information with foreign key to projects (cascade delete)
- `goals`: Project goals with foreign key to projects (cascade delete)
- `users`: Single user authentication (username: priyam)

## Environment Variables

Required:
- `DATABASE_URL`: PostgreSQL connection string (provided by Replit)
- `SESSION_SECRET`: Session secret for Express (auto-generated if not provided)

Optional:
- Google Drive integration configured through Replit Connectors (for backup feature)

## API Endpoints

### Authentication
- `POST /api/auth/login`: Login with username and password
- `POST /api/auth/logout`: Logout and destroy session
- `GET /api/auth/status`: Check authentication status

### Projects
- `GET /api/projects`: Get all projects
- `GET /api/projects/:id`: Get single project
- `POST /api/projects`: Create new project
- `PUT /api/projects/:id`: Update project
- `DELETE /api/projects/:id`: Delete project (cascades to all related data)

### Issues, Credentials, Team Members, Goals
- Similar CRUD endpoints for each entity type
- All endpoints require authentication via session

### Backup
- `POST /api/backup-to-drive`: Export project to Google Drive

## Design System

- **Color Palette**: Dark theme with soft professional accents
  - Background: Dark navy/gray (hsl(222 18% 11%))
  - Primary: Soft teal (hsl(180 65% 32%))
  - Charts: Teal, lavender, amber variants
- **Typography**: Inter for UI, JetBrains Mono for code
- **Spacing**: Consistent 4px-based spacing system
- **Components**: Shadcn UI with custom dark theme configuration

## User Preferences

- Personal use only (single user: Priyam)
- Dark mode is the default and primary theme
- Responsive design for desktop, tablet, and mobile
- Sidebar navigation with collapsible menu
- Card-based layouts throughout the application

## Login Credentials

- **Username**: priyam
- **Password**: priyam@2653

Note: This is a personal dashboard designed for single-user access only.
