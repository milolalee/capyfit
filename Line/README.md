# Multi-Line OA Unified Inbox

A unified inbox system for managing multiple LINE Official Accounts (OA) from a single interface. Supports real-time messaging, multi-agent collaboration, and seamless LINE API integration.

## Features

- ✅ Receive messages from multiple LINE OAs via Webhook
- ✅ Store messages in PostgreSQL database
- ✅ Real-time updates via WebSocket (Socket.io)
- ✅ Send messages via LINE Messaging API (Reply/Push)
- ✅ Multi-OA support (>10 accounts)
- ✅ Filter conversations by OA account and status
- ✅ Agent assignment system
- ✅ Responsive UI with React + Tailwind CSS

## Tech Stack

### Backend
- Node.js + Express
- PostgreSQL
- Socket.io (WebSocket)
- LINE Messaging API SDK

### Frontend
- React 18
- Vite
- Zustand (State Management)
- Socket.io Client
- Tailwind CSS
- date-fns

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── websocket/       # WebSocket handlers
│   │   ├── database/        # Database config & migrations
│   │   └── app.js           # Express app entry point
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── store/           # Zustand state management
│   │   ├── services/        # API services
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env.example
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- LINE Developer Account(s) with Channel Access Token and Channel Secret

### 1. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE line_oa_inbox;
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
# DATABASE_URL=postgres://username:password@localhost:5432/line_oa_inbox
# PORT=3000

# Run database migrations
npm run migrate

# Start the server
npm run dev
```

The backend will run on `http://localhost:3000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:3001`

### 4. Add LINE OA Accounts

Use the API to add your LINE OA accounts:

```bash
curl -X POST http://localhost:3000/api/oa \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My LINE OA",
    "channel_id": "YOUR_CHANNEL_ID",
    "channel_secret": "YOUR_CHANNEL_SECRET",
    "access_token": "YOUR_ACCESS_TOKEN"
  }'
```

### 5. Configure LINE Webhook

For each LINE OA account:

1. Go to LINE Developers Console
2. Select your Messaging API channel
3. Set Webhook URL to: `https://your-domain.com/webhook/line/{oa_id}`
   - Replace `{oa_id}` with the actual OA ID from the database
   - Must use HTTPS (use ngrok for local testing)
4. Enable "Use webhook" toggle
5. Verify webhook endpoint

## API Endpoints

### Webhook
- `POST /webhook/line/:oa_id` - Receive LINE messages

### Messages
- `POST /api/messages/send` - Send a message
- `GET /api/messages/conversation/:conversation_id` - Get messages for a conversation
- `GET /api/messages/conversation/:conversation_id/details` - Get conversation with messages
- `GET /api/messages/conversations` - Get all conversations (with filters)

### OA Accounts
- `POST /api/oa` - Create OA account
- `GET /api/oa` - Get all OA accounts
- `GET /api/oa/:oa_id` - Get specific OA account
- `PUT /api/oa/:oa_id` - Update OA account
- `DELETE /api/oa/:oa_id` - Delete OA account

### Health Check
- `GET /health` - Check server status

## WebSocket Events

### Client → Server
- `join_room` - Join a conversation room
- `leave_room` - Leave a conversation room
- `join_oa` - Join an OA-specific room
- `leave_oa` - Leave an OA-specific room

### Server → Client
- `new_message` - New message received
- `conversation_updated` - Conversation updated
- `new_conversation` - New conversation created

## Database Schema

### oa_accounts
- `id` (UUID, Primary Key)
- `name` (VARCHAR)
- `channel_id` (VARCHAR, Unique)
- `channel_secret` (VARCHAR)
- `access_token` (VARCHAR)
- `created_at` (TIMESTAMP)

### conversations
- `id` (UUID, Primary Key)
- `oa_id` (UUID, Foreign Key)
- `user_id` (VARCHAR) - LINE userId
- `assigned_agent` (VARCHAR)
- `status` (VARCHAR) - 'open' or 'closed'
- `last_message_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)

### messages
- `id` (UUID, Primary Key)
- `conversation_id` (UUID, Foreign Key)
- `oa_id` (UUID, Foreign Key)
- `sender_type` (VARCHAR) - 'user' or 'agent'
- `message_type` (VARCHAR) - 'text', 'image', etc.
- `content` (TEXT)
- `line_message_id` (VARCHAR)
- `created_at` (TIMESTAMP)

## Development

### Running with ngrok (for local webhook testing)

```bash
# Start backend
cd backend && npm run dev

# In another terminal, start ngrok
ngrok http 3000

# Use the ngrok HTTPS URL for LINE webhook configuration
# Webhook URL: https://your-ngrok-url.ngrok-free.app/webhook/line/{oa_id}
```

### Building for Production

```bash
# Backend
cd backend
npm install
npm start

# Frontend
cd frontend
npm install
npm run build
# Serve the dist folder with your preferred web server
```

## Security Notes

- LINE webhook signature is validated on every request
- Access tokens are stored in the database (consider encryption for production)
- Use HTTPS for webhook endpoints
- Implement JWT authentication for agent login (optional for MVP)

## Future Enhancements (Not in MVP)

- Agent assignment system
- Unread message counter
- Typing indicator
- AI auto-reply
- Analytics dashboard
- Message templates
- File attachment support
- Message search
- Multi-language support

## Troubleshooting

### Webhook not receiving messages
- Verify webhook URL is HTTPS
- Check LINE webhook is enabled in console
- Verify signature validation is passing
- Check server logs for errors

### WebSocket connection issues
- Ensure both frontend and backend are running
- Check CORS configuration in backend
- Verify socket URL in frontend environment variables

### Database connection errors
- Verify PostgreSQL is running
- Check DATABASE_URL in .env file
- Ensure database exists and migrations have been run

## License

MIT

## Support

For issues and questions, please refer to the project documentation or create an issue in the repository.
