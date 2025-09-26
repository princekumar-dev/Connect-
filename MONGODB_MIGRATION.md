# MSEC Connect - MongoDB Migration

## Overview
This project has been successfully migrated from using local JSON files to MongoDB Atlas for data storage.

## Changes Made

### 1. Database Migration
- **From**: Local JSON files (`users.json`, `events.json`, `bookings.json`)
- **To**: MongoDB Atlas Cloud Database
- **Connection String**: `mongodb+srv://prince55833kumar_db_user:prince55833@msecconnect.rsrf96t.mongodb.net/msec_connect`

### 2. New Dependencies
- `mongoose`: MongoDB object modeling for Node.js
- `dotenv`: Environment variable management

### 3. New Files Created
- `.env`: Environment variables (MongoDB URI, PORT)
- `models.js`: Mongoose schemas for User, Event, and Booking collections
- `db.js`: MongoDB connection configuration
- `migrate.js`: Data migration script from JSON to MongoDB
- `test-db.js`: MongoDB functionality test script

### 4. Updated Files
- `server.js`: Completely refactored to use MongoDB operations instead of JSON file operations
- `package.json`: Added new dependencies and migration script

## Database Schema

### Users Collection
```javascript
{
  id: Number (unique),
  email: String (unique),
  password: String,
  name: String,
  role: String (admin|staff|hod|principal|secretary)
}
```

### Events Collection
```javascript
{
  id: Number (unique),
  name: String,
  date: String,
  time: String,
  desc: String,
  image: String,
  createdAt: String
}
```

### Bookings Collection
```javascript
{
  id: Number (unique),
  venue: String,
  date: String,
  time: String,
  attendees: Number,
  organizer: String,
  email: String,
  purpose: String,
  status: String (pending|confirmed|cancelled),
  priority: Number,
  createdAt: String,
  originalVenue: String (optional),
  movedReason: String (optional)
}
```

## Available Scripts

```bash
# Start the server
npm start

# Start with nodemon for development
npm run dev

# Migrate data from JSON files to MongoDB
npm run migrate

# Test MongoDB connection and operations
node test-db.js
```

## Environment Variables

Create a `.env` file in the root directory with:

```
MONGODB_URI=mongodb+srv://prince55833kumar_db_user:prince55833@msecconnect.rsrf96t.mongodb.net/msec_connect
PORT=3000
```

## Migration Process

1. **Automatic Initialization**: When the server starts, it automatically creates default users if the Users collection is empty
2. **Manual Migration**: Run `npm run migrate` to transfer existing data from JSON files to MongoDB
3. **Data Verification**: The migration script provides a summary of transferred records

## API Endpoints

All existing API endpoints remain the same, but now operate on MongoDB collections:

- `GET /api/health` - Health check
- `POST /api/login` - User authentication
- `GET /api/event` - Get all events
- `POST /api/event` - Create new event (admin only)
- `DELETE /api/event/:id` - Delete event (admin only)
- `GET /api/bookings` - Get all bookings (admin only)
- `GET /api/bookings/status/:status` - Get bookings by status (admin only)
- `GET /api/user/bookings` - Get user's own bookings
- `POST /api/bookings` - Create new booking
- `PATCH /api/bookings/:id/status` - Update booking status (admin only)
- `DELETE /api/bookings/:id` - Delete booking (admin only)
- `GET /api/bookings/stats` - Get booking statistics (admin only)

## Default User Credentials

- **Admin**: `admin@msec.edu.in` / `admin@123`
- **Staff**: `staff@msec.edu.in` / `staff@123`
- **HOD**: `hod@msec.edu.in` / `hod@123`
- **Principal**: `principal@msec.edu.in` / `principal@123`
- **Secretary**: `secretary@msec.edu.in` / `secretary@123`

## Features Preserved

- ✅ User role-based access control
- ✅ Booking priority system (Secretary > Principal > HOD > Staff)
- ✅ Automatic booking conflict resolution
- ✅ Venue reassignment for lower priority bookings
- ✅ All existing admin functionalities
- ✅ Booking status management
- ✅ Statistics and reporting

## Benefits of MongoDB Migration

1. **Scalability**: No file I/O limitations, better concurrent access
2. **Data Integrity**: ACID transactions and validation
3. **Query Performance**: Indexed searches and complex queries
4. **Cloud Storage**: Data is securely stored in MongoDB Atlas
5. **Backup & Recovery**: Automatic backups and point-in-time recovery
6. **Real-time Collaboration**: Multiple users can access data simultaneously

## Testing

The system has been thoroughly tested with:
- ✅ MongoDB connection verification
- ✅ Data migration validation
- ✅ All API endpoints functionality
- ✅ User authentication
- ✅ Booking creation and management
- ✅ Admin operations

All functionality works as expected with the new MongoDB backend.