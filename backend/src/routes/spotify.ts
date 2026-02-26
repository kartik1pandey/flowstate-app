import express, { Response } from 'express';
import User from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';
import { refreshSpotifyTokenSafe, spotifyApiCall, createSpotifyFallbackResponse } from '../utils/spotify';

const router = express.Router();

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3001/api/spotify/callback';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const GROQ_API_KEY = process.env.GROQ_API_KEY!;

async function getValidAccessToken(user: any) {
  if (!user.spotifyAccessToken || !user.spotifyRefreshToken) {
    throw new Error('Spotify not connected');
  }

  if (user.spotifyTokenExpiry && new Date() >= new Date(user.spotifyTokenExpiry)) {
    const tokens = await refreshSpotifyTokenSafe(
      user.spotifyRefreshToken,
      SPOTIFY_CLIENT_ID,
      SPOTIFY_CLIENT_SECRET
    );
    
    await User.findByIdAndUpdate(user._id, {
      $set: {
        spotifyAccessToken: tokens.access_token,
        spotifyTokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
      },
    });

    return tokens.access_token;
  }

  return user.spotifyAccessToken;
}

// GET /api/spotify/auth - Get Spotify authorization URL
router.get('/auth', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const scopes = [
      'user-read-private',
      'user-read-email',
      'user-top-read',
      'user-read-recently-played',
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-currently-playing',
      'streaming',
      'playlist-read-private',
      'playlist-read-collaborative',
      'playlist-modify-private',
      'playlist-modify-public',
    ].join(' ');

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: SPOTIFY_CLIENT_ID,
      scope: scopes,
      redirect_uri: SPOTIFY_REDIRECT_URI,
      state: user.email,
    });

    const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;

    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating Spotify auth URL:', error);
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
});

// GET /api/spotify/callback - Handle Spotify OAuth callback
router.get('/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(`${FRONTEND_URL}/spaces/music?spotify_error=${error}`);
    }

    if (!code || !state) {
      return res.redirect(`${FRONTEND_URL}/spaces/music?spotify_error=missing_params`);
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64'),
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: SPOTIFY_REDIRECT_URI,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Spotify token error:', errorData);
      return res.redirect(`${FRONTEND_URL}/spaces/music?spotify_error=token_exchange_failed`);
    }

    const tokens = await tokenResponse.json();

    // Save tokens to user profile
    await User.findOneAndUpdate(
      { email: state },
      {
        $set: {
          spotifyAccessToken: tokens.access_token,
          spotifyRefreshToken: tokens.refresh_token,
          spotifyTokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
        },
      }
    );

    res.redirect(`${FRONTEND_URL}/spaces/music?spotify_connected=true`);
  } catch (error) {
    console.error('Error in Spotify callback:', error);
    res.redirect(`${FRONTEND_URL}/spaces/music?spotify_error=server_error`);
  }
});

// GET /api/spotify/top-tracks - Get user's top tracks
router.get('/top-tracks', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if Spotify is connected
    if (!user.spotifyAccessToken || !user.spotifyRefreshToken) {
      return res.json(createSpotifyFallbackResponse(
        'Spotify not connected. Please connect your Spotify account.',
        { needsConnection: true }
      ));
    }

    const accessToken = await getValidAccessToken(user);

    const timeRange = (req.query.time_range as string) || 'medium_term';
    const limit = (req.query.limit as string) || '20';

    try {
      const data = await spotifyApiCall(
        `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=${limit}`,
        accessToken
      );
      
      res.json(data);
    } catch (apiError: any) {
      console.error('Spotify API error:', apiError.message);
      const fallbackData = createSpotifyFallbackResponse(
        'Unable to load your top tracks right now. This may be because you need a Spotify Premium account or the service is temporarily unavailable.',
        { 
          error: apiError.message,
          needsPremium: apiError.message.includes('premium'),
        }
      );
      res.json(fallbackData);
    }
  } catch (error: any) {
    console.error('Error in top-tracks route:', error);
    const fallbackData = createSpotifyFallbackResponse(
      'Spotify data temporarily unavailable. Please try reconnecting your account.',
      { 
        error: error.message,
        needsReconnect: true,
      }
    );
    res.json(fallbackData);
  }
});

// GET /api/spotify/search - Search for tracks
router.get('/search', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const accessToken = await getValidAccessToken(user);
    const query = req.query.q as string;
    const limit = (req.query.limit as string) || '20';

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const data = await spotifyApiCall(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
      accessToken
    );

    res.json(data);
  } catch (error: any) {
    console.error('Error searching Spotify:', error);
    res.status(500).json({ error: error.message || 'Failed to search' });
  }
});

// POST /api/spotify/recommendations - Get AI-powered music recommendations
router.post('/recommendations', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const accessToken = await getValidAccessToken(user);
    const { mood, activity, energyLevel, focus, userMessage, previousSongs, playlistLength = 12 } = req.body;

    // Build context for AI
    let aiContext = '';
    if (focus === 'deep-work') {
      aiContext = 'The user needs music for deep work and maximum concentration. Suggest calm, ambient, instrumental tracks with no lyrics or minimal vocals.';
    } else if (focus === 'creative') {
      aiContext = 'The user needs music for creative work. Suggest inspiring, indie, jazz, or alternative tracks that stimulate creativity.';
    } else if (focus === 'energetic') {
      aiContext = 'The user needs high-energy music for active work. Suggest upbeat, motivating tracks from pop, rock, EDM, or hip-hop.';
    } else if (focus === 'relaxation') {
      aiContext = 'The user needs relaxing music for breaks. Suggest calm, soothing tracks for meditation and relaxation.';
    } else {
      aiContext = `The user needs music for: ${mood || activity || 'general listening'}`;
    }

    if (previousSongs && previousSongs.length > 0) {
      aiContext += `\n\nPrevious recommendations:\n${previousSongs.join('\n')}`;
    }

    if (userMessage) {
      aiContext += `\n\nUser's specific request: ${userMessage}`;
    }

    // Get song recommendations from Groq
    const requestCount = Math.ceil(playlistLength * 1.5);
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a music recommendation expert. You must suggest EXACTLY ${requestCount} songs with their artists. Format each song as "Song Name by Artist Name" on separate lines. IMPORTANT: Only provide real, existing songs that can be found on Spotify. Do NOT make up song names. Only provide the ${requestCount} song titles, nothing else - no numbering, no explanations, no extra text.`,
          },
          {
            role: 'user',
            content: aiContext,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!groqResponse.ok) {
      const error = await groqResponse.text();
      console.error('Groq API error:', error);
      return res.status(groqResponse.status).json({ error: 'Failed to generate recommendations' });
    }

    const groqData = await groqResponse.json();
    const aiSuggestions = groqData.choices[0]?.message?.content || '';

    // Parse song suggestions
    const songLines = aiSuggestions.split('\n').filter((line: string) => line.trim());
    const tracks: any[] = [];

    // Search for each song on Spotify
    for (const songLine of songLines) {
      if (tracks.length >= playlistLength) break;
      
      try {
        const cleanLine = songLine.replace(/^\d+[\.\)]\s*/, '').replace(/^[-*]\s*/, '').trim();
        if (!cleanLine || cleanLine.length < 3) continue;

        try {
          const searchData = await spotifyApiCall(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(cleanLine)}&type=track&limit=3`,
            accessToken
          );

          if (searchData.tracks && searchData.tracks.items && searchData.tracks.items.length > 0) {
            tracks.push(searchData.tracks.items[0]);
          }
        } catch (searchError: any) {
          console.error('Error searching for song:', cleanLine, 'Error:', searchError.message);
        }
      } catch (error) {
        console.error('Error processing song line:', songLine, error);
      }
    }

    if (tracks.length === 0) {
      const fallbackData = createSpotifyFallbackResponse(
        'Unable to find music tracks at the moment. Please try again later.',
        {
          tracks: [],
          explanation: 'Music recommendations are temporarily unavailable.',
          aiSuggestions: ''
        }
      );
      return res.json(fallbackData);
    }

    const finalTracks = tracks.slice(0, playlistLength);

    // Generate explanation
    const explanationResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a music curator. Explain briefly (2-3 sentences) why this playlist suits the user\'s needs.',
          },
          {
            role: 'user',
            content: `Context: ${aiContext}\n\nPlaylist:\n${finalTracks.map(t => `${t.name} by ${t.artists.map((a: any) => a.name).join(', ')}`).join('\n')}\n\nExplain why this playlist works for them.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    let explanation = 'These tracks are curated to match your current focus needs.';
    if (explanationResponse.ok) {
      const explData = await explanationResponse.json();
      explanation = explData.choices[0]?.message?.content || explanation;
    }

    res.json({
      tracks: finalTracks,
      explanation,
      aiSuggestions,
    });
  } catch (error: any) {
    console.error('Error getting recommendations:', error);
    const fallbackData = createSpotifyFallbackResponse(
      'Unable to generate music recommendations at the moment. Please try again later.',
      {
        tracks: [],
        explanation: 'Music recommendations are temporarily unavailable due to connectivity issues.',
        aiSuggestions: '',
        error: error.message
      }
    );
    res.json(fallbackData);
  }
});

// POST /api/spotify/create-playlist - Create playlist and add tracks
router.post('/create-playlist', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const accessToken = await getValidAccessToken(user);
    const { name, description, trackUris } = req.body;

    // Get user's Spotify ID
    const profileResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!profileResponse.ok) {
      throw new Error('Failed to get user profile');
    }

    const profile = await profileResponse.json();

    // Create playlist
    const truncatedDescription = description 
      ? (description.length > 300 ? description.substring(0, 297) + '...' : description)
      : 'Created by your AI music assistant';
    
    const createResponse = await fetch(
      `https://api.spotify.com/v1/users/${profile.id}/playlists`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name || 'AI Recommended Playlist',
          description: truncatedDescription,
          public: false,
        }),
      }
    );

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('Failed to create playlist:', errorText);
      
      if (createResponse.status === 403 && errorText.includes('Insufficient client scope')) {
        return res.status(403).json({ 
          error: 'Spotify permissions missing. Please reconnect your Spotify account.',
          needsReconnect: true 
        });
      }
      
      throw new Error('Failed to create playlist');
    }

    const playlist = await createResponse.json();

    // Add tracks to playlist
    if (trackUris && trackUris.length > 0) {
      for (let i = 0; i < trackUris.length; i += 100) {
        const batch = trackUris.slice(i, i + 100);
        
        await fetch(
          `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ uris: batch }),
          }
        );
      }
    }

    res.json({
      playlist,
      message: 'Playlist created successfully',
    });
  } catch (error: any) {
    console.error('Error creating playlist:', error);
    res.status(500).json({ error: error.message || 'Failed to create playlist' });
  }
});

// GET /api/spotify/playback - Get current playback state
router.get('/playback', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const accessToken = await getValidAccessToken(user);

    const response = await fetch('https://api.spotify.com/v1/me/player', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (response.status === 204) {
      return res.json({ playing: false });
    }

    if (!response.ok) {
      const error = await response.text();
      console.error('Spotify playback state error:', error);
      return res.status(response.status).json({ error: 'Failed to get playback state' });
    }

    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error('Error getting playback state:', error);
    res.status(500).json({ error: error.message || 'Failed to get playback state' });
  }
});

// POST /api/spotify/playback - Control Spotify playback
router.post('/playback', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const accessToken = await getValidAccessToken(user);
    const { action, trackUris, deviceId, position } = req.body;

    let endpoint = '';
    let method = 'PUT';
    let requestBody: any = null;

    switch (action) {
      case 'play':
        endpoint = 'https://api.spotify.com/v1/me/player/play';
        if (deviceId) endpoint += `?device_id=${deviceId}`;
        requestBody = trackUris ? { uris: trackUris } : null;
        break;
      
      case 'pause':
        endpoint = 'https://api.spotify.com/v1/me/player/pause';
        break;
      
      case 'next':
        method = 'POST';
        endpoint = 'https://api.spotify.com/v1/me/player/next';
        break;
      
      case 'previous':
        method = 'POST';
        endpoint = 'https://api.spotify.com/v1/me/player/previous';
        break;
      
      case 'seek':
        endpoint = `https://api.spotify.com/v1/me/player/seek?position_ms=${position}`;
        break;
      
      case 'volume':
        endpoint = `https://api.spotify.com/v1/me/player/volume?volume_percent=${position}`;
        break;
      
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    const response = await fetch(endpoint, {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: requestBody ? JSON.stringify(requestBody) : undefined,
    });

    if (response.status === 204) {
      return res.json({ success: true });
    }

    if (!response.ok) {
      const error = await response.text();
      console.error('Spotify playback error:', error);
      return res.status(response.status).json({ error: 'Playback control failed' });
    }

    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error('Error controlling playback:', error);
    res.status(500).json({ error: error.message || 'Failed to control playback' });
  }
});

export default router;
