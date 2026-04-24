# Agent Documentation

## Overview

This document describes the AI Agent system for the Fitness Card Game Backend.

## Agent Capabilities

### Core Functions
- **Game Logic Management**: Handles card game mechanics, turn-based gameplay, and state management
- **Fitness Activity Tracking**: Monitors and validates user fitness activities
- **Progress Tracking**: Records player progress, achievements, and milestones
- **Recommendation Engine**: Suggests personalized workouts and challenges based on user data

### Agent Types

#### 1. Game Agent
- Manages card game logic
- Handles player turns and game states
- Validates card plays and combinations
- Calculates scores and rewards

#### 2. Fitness Agent
- Tracks workout activities
- Validates exercise completion
- Provides workout recommendations
- Monitors progress towards goals

#### 3. Social Agent
- Manages player interactions
- Handles challenges and competitions
- Facilitates leaderboards and rankings
- Enables social features and sharing

## API Endpoints

### Game Endpoints
- `POST /api/game/start` - Start a new game session
- `POST /api/game/play-card` - Play a card
- `GET /api/game/state` - Get current game state
- `POST /api/game/turn-end` - End current turn

### Fitness Endpoints
- `POST /api/fitness/log-activity` - Log a fitness activity
- `GET /api/fitness/progress` - Get fitness progress
- `GET /api/fitness/recommendations` - Get workout recommendations
- `POST /api/fitness/complete-challenge` - Complete a challenge

### Social Endpoints
- `GET /api/social/leaderboard` - Get leaderboard
- `POST /api/social/challenge` - Send a challenge to another player
- `GET /api/social/friends` - Get friends list
- `POST /api/social/share` - Share achievements

## Data Models

### Game State
```javascript
{
  gameId: string,
  players: Player[],
  currentTurn: number,
  deck: Card[],
  discardPile: Card[],
  gameState: 'waiting' | 'playing' | 'finished',
  scores: { [playerId: number]: number }
}
```

### Player
```javascript
{
  playerId: number,
  username: string,
  hand: Card[],
  fitnessLevel: number,
  achievements: Achievement[]
}
```

### Card
```javascript
{
  cardId: string,
  type: 'exercise' | 'reward' | 'penalty',
  value: number,
  description: string,
  exerciseType?: string
}
```

### Fitness Activity
```javascript
{
  activityId: string,
  playerId: number,
  type: string,
  duration: number,
  calories: number,
  timestamp: Date,
  verified: boolean
}
```

## Configuration

### Agent Settings
```javascript
const agentConfig = {
  maxTurnTime: 60, // seconds
  minPlayers: 2,
  maxPlayers: 4,
  deckSize: 52,
  startingHand: 5
};
```

## Error Handling

### Common Errors
- `GAME_NOT_FOUND` - Game session does not exist
- `INVALID_MOVE` - Player attempted an illegal move
- `TURN_TIMEOUT` - Player exceeded turn time limit
- `ACTIVITY_NOT_VERIFIED` - Fitness activity could not be verified

## Security Considerations

- All API requests require authentication
- Fitness activities are verified before being accepted
- Rate limiting applied to prevent abuse
- Player data encrypted at rest

## Future Enhancements

- [ ] AI opponent with adaptive difficulty
- [ ] Real-time multiplayer support
- [ ] Integration with fitness wearables
- [ ] Machine learning for personalized recommendations
- [ ] Voice command support
- [ ] AR/VR fitness experiences

## Version History

- **v1.0.0** - Initial release with core game and fitness tracking
