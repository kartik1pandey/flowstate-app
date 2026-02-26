# Flow State Facilitator - Express Backend

This is the Express.js backend for the Flow State Facilitator application, converted from Next.js API routes.

## Features

- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Flow Sessions**: Track and analyze flow state sessions
- **Interventions**: Manage productivity interventions
- **Analytics**: Generate insights from session data
- **Spotify Integration**: AI-powered music recommendations and playback control
- **AI Chat**: Groq-powered AI assistant for productivity coaching
- **ML Operations**: Machine learning features for sentiment analysis and fatigue prediction

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `SPOTIFY_CLIENT_ID`: Spotify API client ID
- `SPOTIFY_CLIENT_SECRET`: Spotify API client secret
- `GROQ_API_KEY`: Groq AI API key

### 3. Run the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

The server will run on `http://localhost:3001` by default.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/signin` - Sign in user
- `GET /api/auth/profile` - Get user profile (requires auth)
- `PATCH /api/auth/profile` - Update user profile (requires auth)

### Sessions
- `GET /api/sessions` - Get all sessions (requires auth)
- `GET /api/sessions/:id` - Get specific session (requires auth)
- `POST /api/sessions` - Create new session (requires auth)
- `PATCH /api/sessions/:id` - Update session (requires auth)
- `DELETE /api/sessions/:id` - Delete session (requires auth)

### Interventions
- `GET /api/interventions` - Get all interventions (requires auth)
- `POST /api/interventions` - Create new intervention (requires auth)
- `PATCH /api/interventions/:id` - Update intervention (requires auth)

### Analytics
- `GET /api/analytics?period=week` - Get analytics (requires auth)

### Spotify
- `GET /api/spotify/auth` - Get Spotify authorization URL (requires auth)
- `GET /api/spotify/callback` - OAuth callback (public)
- `GET /api/spotify/top-tracks` - Get user's top tracks (requires auth)
- `GET /api/spotify/search?q=query` - Search for tracks (requires auth)
- `POST /api/spotify/recommendations` - Get AI-powered recommendations (requires auth)
- `POST /api/spotify/create-playlist` - Create playlist (requires auth)
- `GET /api/spotify/playback` - Get playback state (requires auth)
- `POST /api/spotify/playback` - Control playback (requires auth)

### AI & ML
- `POST /api/ai/chat` - Generate AI chat completion (requires auth)
- `POST /api/ml` - ML operations (requires auth)

### Settings
- `GET /api/settings` - Get user settings (requires auth)
- `PATCH /api/settings` - Update user settings (requires auth)

### Other
- `GET /health` - Health check endpoint

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

After signing in or registering, you'll receive a token that should be included in subsequent requests.

## Frontend Integration

Update your frontend API calls to point to `http://localhost:3001` instead of the Next.js backend.

Example:
```typescript
const API_BASE_URL = 'http://localhost:3001';

// Make authenticated request
const response = await fetch(`${API_BASE_URL}/api/sessions`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
```

## Differences from Next.js Backend

1. **Authentication**: Uses JWT tokens instead of NextAuth sessions
2. **CORS**: Configured to allow requests from frontend (localhost:3000)
3. **Session Management**: Express sessions for server-side state
4. **Error Handling**: Centralized error handling middleware
5. **Route Structure**: Express router-based instead of file-based routing

## Development

The backend uses TypeScript and includes:
- Hot reload with `ts-node-dev`
- Type checking with TypeScript
- MongoDB with Mongoose ODM
- Express middleware for CORS, JSON parsing, and sessions

## Production Deployment

1. Build the TypeScript code:
   ```bash
   npm run build
   ```

2. Set environment variables for production

3. Run the compiled code:
   ```bash
   npm start
   ```

## Troubleshooting

### MongoDB Connection Issues
- Ensure your MongoDB URI is correct
- Check that your IP is whitelisted in MongoDB Atlas
- Verify network connectivity

### Spotify API Issues
- Verify your Spotify credentials
- Ensure redirect URI matches in Spotify Dashboard
- Check that required scopes are included

### CORS Issues
- Update `FRONTEND_URL` in `.env` to match your frontend URL
- Ensure credentials are included in frontend requests

## License

MIT
