# BackendDigiManiac API

A Node.js/Express API with optimized structure for user management and authentication.

## Project Structure

```
src/
├── app.js                 # Main application file (optimized)
├── config/
│   └── db.js             # Database configuration
├── controllers/           # Business logic (future use)
├── middlewares/
│   ├── authMiddleware.js  # JWT authentication middleware
│   └── index.js          # Middleware configuration
├── models/
│   └── User.js           # User model
├── routes/
│   ├── auth.js           # Authentication routes (login)
│   ├── profile.js        # Profile management routes
│   ├── user.js           # User data routes
│   ├── account.js        # Account management routes
│   └── index.js          # Route configuration
├── uploads/              # File uploads directory
├── utils/
│   └── upload.js         # File upload configuration
└── validations/          # Input validation (future use)
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/register` - User registration
- `POST /api/verifyEmail` - Verify email existence
- `POST /api/updatepassword` - Update user password

### User Management
- `GET /api/profile/:id` - Get user by ID
- `GET /api/getusers` - Get all users
- `GET /api/profile` - Get current user profile (authenticated)

### Profile Management
- `PUT /api/profile/edit` - Edit user profile (authenticated)

### Time Tracking
- `POST /api/time/clock-in` - Clock in (authenticated)
- `POST /api/time/clock-out` - Clock out (authenticated)
- `GET /api/time/status` - Get current clock status (authenticated)
- `GET /api/time/entries` - Get time entries with pagination (authenticated)
- `GET /api/time/today` - Get today's time summary (authenticated)

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with:
   ```
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

3. Start the server:
   ```bash
   npm run dev
   ```

## Optimization Benefits

- **Modular Structure**: Routes are organized by functionality
- **Clean Main File**: `app.js` is now only 20 lines vs 225 lines
- **Maintainable**: Each route file handles specific functionality
- **Scalable**: Easy to add new routes and features
- **Separation of Concerns**: Middleware, routes, and configuration are separated

## Testing with Postman

All endpoints remain the same as before optimization. The API functionality is unchanged - only the internal structure has been improved for better maintainability.
