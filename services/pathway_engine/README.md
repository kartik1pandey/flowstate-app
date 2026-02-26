# FlowState Pathway Analytics Engine

Real-time cognitive analytics and flow detection using Pathway streaming framework.

## What It Does

- **Real-Time Flow Score**: Computes cognitive flow state every 5 seconds
- **Distraction Detection**: Identifies when users lose focus
- **Burnout Risk**: Detects early signs of cognitive fatigue
- **Deep Flow Alerts**: Notifies when users enter peak productivity state

## Architecture

```
User Events → HTTP Endpoint → Pathway Stream Processing → Analytics Output
                                      ↓
                              Sliding Windows (60s)
                                      ↓
                              Feature Engineering
                                      ↓
                              Flow Score Calculation
                                      ↓
                              State Detection
                                      ↓
                              JSON Lines Output
```

## Flow Score Formula

```python
FlowScore = 
    0.35 × normalized_typing_velocity +
    0.25 × session_duration_score +
    0.20 × music_focus_alignment +
    0.20 × (1 - distraction_rate)
```

Range: 0-100
- 80-100: Deep Flow 🔥
- 60-79: Focused ✅
- 40-59: Moderate ⚠️
- 0-39: Distracted 🚨

## API Endpoints

### Health Check
```bash
GET http://localhost:8001/
```

### Ingest Event
```bash
POST http://localhost:8001/event
Content-Type: application/json

{
  "user_id": "user123",
  "space_type": "code",
  "event_type": "keystroke",
  "value": 1,
  "metadata": {"language": "python"},
  "timestamp": "2025-02-26T12:00:00Z"
}
```

### Get Flow Score
```bash
GET http://localhost:8001/flow/{user_id}
```

### Get Detailed Metrics
```bash
GET http://localhost:8001/metrics/{user_id}
```

## Event Types

- `keystroke`: User typed a character
- `paste`: User pasted text
- `blur`: Window lost focus (distraction)
- `focus`: Window gained focus
- `tab_switch`: User switched tabs
- `music_play`: Music started playing
- `music_pause`: Music paused
- `session_start`: Session began
- `session_end`: Session ended
- `timer_tick`: Timer tick (every second)

## Space Types

- `code`: Code editor
- `writing`: Writing space
- `reading`: Reading space
- `whiteboard`: Whiteboard/drawing
- `music`: Music player
- `chat`: AI chat
- `timer`: Pomodoro timer

## Output Files

Located in `/app/output/`:

- `flow_metrics.jsonl`: All flow score computations
- `deep_flow_alerts.jsonl`: Deep flow state detections
- `distraction_alerts.jsonl`: Distraction spike alerts
- `burnout_alerts.jsonl`: Burnout risk warnings

## Running Locally

### With Docker (Recommended)
```bash
docker build -t flowstate-pathway .
docker run -p 8001:8001 flowstate-pathway
```

### Without Docker
```bash
pip install -r requirements.txt
python main.py
```

## Testing

### Send Test Events
```bash
# Simulate typing
for i in {1..100}; do
  curl -X POST http://localhost:8001/event \
    -H "Content-Type: application/json" \
    -d "{
      \"user_id\": \"test123\",
      \"space_type\": \"code\",
      \"event_type\": \"keystroke\",
      \"value\": 1,
      \"metadata\": {\"language\": \"python\"},
      \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
    }"
  sleep 0.5
done

# Check flow score
curl http://localhost:8001/flow/test123
```

### Monitor Output
```bash
# Watch flow metrics in real-time
tail -f output/flow_metrics.jsonl

# Watch alerts
tail -f output/deep_flow_alerts.jsonl
tail -f output/distraction_alerts.jsonl
tail -f output/burnout_alerts.jsonl
```

## Configuration

Environment variables:
- `MONGODB_URI`: MongoDB connection string (optional)
- `PORT`: API port (default: 8001)

## Dependencies

- `pathway>=0.8.0`: Streaming framework
- `fastapi>=0.104.0`: REST API
- `uvicorn`: ASGI server
- `pymongo`: MongoDB connector (optional)

## Performance

- **Latency**: <1 second for flow score updates
- **Throughput**: 1000+ events/second
- **Memory**: ~200MB base + ~1MB per 10k events
- **CPU**: ~10% on single core

## Troubleshooting

### Events Not Processing
1. Check Pathway is running: `curl http://localhost:8001/`
2. Check logs: `docker logs flowstate_pathway`
3. Verify event format matches schema

### Flow Score Always Zero
- Wait 60 seconds for first window to complete
- Ensure events are being sent
- Check output files for data

### High Memory Usage
- Pathway keeps recent windows in memory
- Adjust window size if needed
- Restart container to clear memory

## License

MIT
