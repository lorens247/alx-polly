# Simple REST API Scaffold

This project demonstrates two different approaches to scaffolding a simple REST API with Express.js.

## Endpoints

Both implementations provide the same core endpoints:
- `GET /items` - Retrieve all items
- `POST /items` - Create a new item

## Run A – Inline Only (Ghost Completions)

**File:** `server-inline.js`

This version is designed to work with ghost completions. It includes:
- Complete inline code structure
- Simple array-based storage
- Basic error handling
- Clean, straightforward implementation

**To run:**
```bash
npm install
npm start
```

## Run B – Chat Only (AI Generated)

**File:** `server-chat.js`

This version was generated entirely by AI chat. It includes:
- Map-based data storage for better performance
- Enhanced error handling and validation
- Additional health check endpoint (`GET /health`)
- 404 handler for undefined routes
- Global error handler
- More detailed logging and timestamps
- Better input validation

**To run:**
```bash
npm install
node server-chat.js
```

## Installation

```bash
cd api-test
npm install
```

## Testing the API

### Get all items
```bash
curl http://localhost:3000/items
```

### Create a new item
```bash
curl -X POST http://localhost:3000/items \
  -H "Content-Type: application/json" \
  -d '{"name": "New Item", "description": "Item description"}'
```

### Health check (Run B only)
```bash
curl http://localhost:3000/health
```

## Key Differences

| Feature | Run A (Inline) | Run B (Chat) |
|---------|----------------|--------------|
| Storage | Array | Map |
| Error Handling | Basic | Comprehensive |
| Validation | Simple | Enhanced |
| Additional Endpoints | None | `/health` |
| Route Handling | Basic | 404 + Global error handler |
| Logging | Basic | Detailed with timestamps |
| Input Sanitization | Basic | Advanced (trim, type checking) |

Both implementations are production-ready and demonstrate different coding styles and approaches to the same problem.
