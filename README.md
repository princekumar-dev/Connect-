# Connect-
MSEC Connect is a complete venue booking system with user authentication, an admin dashboard for managing bookings, and real-time updates. It features a modern, responsive UI using Tailwind CSS and stores data in JSON files. The system streamlines venue booking and administration for educational institutions.

# MSEC Connect - Venue Booking System

A complete venue booking system with backend server and admin dashboard.

## Features

### 🔐 **User Authentication**
- Admin access: `admin@msec.edu.in` / `admin@123`
- Regular user: `user@msec.edu.in` / `user@123`

### 📊 **Admin Dashboard** (Admin Only)
- View all bookings with real-time data
- Approve/reject pending bookings
- Cancel confirmed bookings
- Delete bookings
- View booking statistics
- Filter by status (All, Confirmed, Pending, Cancelled)

### 📝 **Booking Management**
- Create new venue bookings
- Persistent data storage in JSON files
- Real-time updates across the system

### 🎨 **Modern UI**
- Responsive design with Tailwind CSS
- Animated wave effects
- Interactive cards and buttons
- Loading states and notifications

## Quick Start

### Prerequisites
- Node.js (Download from https://nodejs.org/)

### Installation & Running

1. **Easy Start** (Windows):
   ```bash
   # Double-click start-server.bat
   ```

2. **Manual Start**:
   ```bash
   # Install dependencies
   npm install

   # Start the server
   npm start
   ```

### Access the Application

Once the server is running, visit:
- **Home Page**: http://localhost:3000/index.html
- **Login**: http://localhost:3000/login.html
- **Admin Dashboard**: http://localhost:3000/bookings.html
- **Book Venue**: http://localhost:3000/book.html

## API Endpoints

### Authentication
- `POST /api/login` - User authentication

### Bookings (Admin Only)
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/status/:status` - Filter by status
- `POST /api/bookings` - Create new booking
- `PATCH /api/bookings/:id/status` - Update booking status
- `DELETE /api/bookings/:id` - Delete booking
- `GET /api/bookings/stats` - Get booking statistics

## File Structure

```
├── server.js           # Backend server
├── package.json        # Dependencies
├── start-server.bat    # Quick start script
├── bookings.json       # Booking data storage
├── users.json          # User data storage
├── index.html          # Home page
├── login.html          # Authentication page
├── bookings.html       # Admin dashboard
├── book.html           # Booking form
├── venue.html          # Venues page
└── events.html         # Events page
```

## Admin Features

### Booking Management
- **Approve**: Change pending bookings to confirmed
- **Reject/Cancel**: Change bookings to cancelled status
- **Reactivate**: Restore cancelled bookings
- **Delete**: Permanently remove bookings

### Dashboard Statistics
- Total bookings count
- Confirmed bookings
- Pending approvals
- Cancelled bookings

### Real-time Updates
- Automatic refresh after actions
- Loading states during API calls
- Success/error notifications

## Security Features

- Admin-only access to booking management
- Role-based authentication
- Access denied for non-admin users
- Secure API endpoints with user verification

## Data Storage

The system uses JSON files for data persistence:
- `bookings.json` - All booking records
- `users.json` - User accounts and roles

## Troubleshooting

### Server Won't Start
1. Ensure Node.js is installed
2. Run `npm install` to install dependencies
3. Check if port 3000 is available

### Can't Access Admin Dashboard
1. Login with admin credentials: `admin@msec.edu.in` / `admin@123`
2. Only admin users can access booking management

### API Errors
1. Ensure server is running on http://localhost:3000
2. Check browser console for error messages
3. Verify user is logged in properly

## Development

### Adding New Features
1. Update `server.js` for new API endpoints
2. Modify frontend HTML/JavaScript as needed
3. Update this README with new features

### Database Migration
To use a real database instead of JSON files:
1. Replace file operations in `server.js`
2. Update connection settings
3. Modify data access functions

## Support

For issues or questions, please check:
1. Browser console for error messages
2. Server console for backend errors
3. Ensure all dependencies are installed

---

**MSEC Connect** - Streamlining venue booking for educational institutions.

