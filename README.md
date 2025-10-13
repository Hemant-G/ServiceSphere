# Service Sphere - Full-Stack MERN Application

A production-ready full-stack web application connecting customers with service providers, built with the MERN stack (MongoDB, Express, React, Node.js).

## 🚀 Features

### Backend Features
- **Authentication System**: JWT-based authentication with role-based access control
- **User Management**: Customer and Provider roles with profile management
- **Service Management**: CRUD operations for services with categories and pricing
- **Booking System**: Complete booking lifecycle with status management
- **Portfolio Management**: File upload system for provider portfolios
- **Review System**: Rating and review system for completed services
- **File Upload**: Local file storage with multer middleware
- **Data Validation**: Comprehensive input validation with express-validator
- **Error Handling**: Centralized error handling middleware

### Frontend Features
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Authentication**: Login/Signup with form validation using React Hook Form + Yup
- **State Management**: Context API for global state management
- **Protected Routes**: Role-based route protection
- **File Upload**: Drag-and-drop file upload component
- **Real-time Updates**: Dynamic UI updates based on user actions
- **Form Validation**: Client-side validation with error handling

## 🛠 Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **multer** - File upload handling
- **express-validator** - Input validation
- **cors** - Cross-origin resource sharing

### Frontend
- **React** - UI library
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form handling
- **Yup** - Schema validation
- **Axios** - HTTP client
- **Framer Motion** - Animation library (ready for implementation)

## 📁 Project Structure

```
service-sphere/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── serviceController.js  # Service management
│   │   ├── bookingController.js   # Booking operations
│   │   ├── providerController.js  # Provider management
│   │   └── portfolioController.js # Portfolio management
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT authentication
│   │   ├── errorHandler.js       # Error handling
│   │   ├── validation.js         # Input validation
│   │   └── uploadMiddleware.js   # File upload handling
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Service.js           # Service schema
│   │   ├── Booking.js           # Booking schema
│   │   ├── PortfolioItem.js     # Portfolio schema
│   │   └── Review.js            # Review schema
│   ├── routes/
│   │   ├── authRoutes.js         # Authentication routes
│   │   ├── serviceRoutes.js      # Service routes
│   │   ├── bookingRoutes.js      # Booking routes
│   │   ├── providerRoutes.js     # Provider routes
│   │   ├── portfolioRoutes.js    # Portfolio routes
│   │   └── reviewRoutes.js       # Review routes
│   ├── uploads/                  # File storage directory
│   ├── .env                      # Environment variables
│   ├── server.js                 # Express server setup
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js         # Navigation component
│   │   │   ├── Footer.js         # Footer component
│   │   │   ├── ServiceCard.js    # Service display card
│   │   │   ├── ProviderCard.js   # Provider display card
│   │   │   ├── BookingCard.js    # Booking display card
│   │   │   ├── PortfolioCard.js  # Portfolio display card
│   │   │   ├── FileUpload.js     # File upload component
│   │   │   └── ProtectedRoute.js # Route protection
│   │   ├── context/
│   │   │   ├── AuthContext.js    # Authentication state
│   │   │   ├── ServiceContext.js # Service state
│   │   │   └── BookingContext.js # Booking state
│   │   ├── pages/
│   │   │   ├── Login.js          # Login page
│   │   │   └── Signup.js         # Signup page
│   │   ├── utils/
│   │   │   ├── api.js            # API client
│   │   │   └── constants.js      # App constants
│   │   ├── App.js                # Main app component
│   │   ├── index.js              # App entry point
│   │   └── index.css             # Global styles
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd service-sphere
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**
   
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/serviceSphere
   JWT_SECRET=supersecretkey123456789
   NODE_ENV=development
   ```

   Create a `.env` file in the frontend directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

5. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

6. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```

7. **Start the frontend development server**
   ```bash
   cd frontend
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📋 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Services
- `GET /api/services` - Get all services (with filters)
- `GET /api/services/:id` - Get service by ID
- `POST /api/services` - Create service (Provider only)
- `PUT /api/services/:id` - Update service (Provider only)
- `DELETE /api/services/:id` - Delete service (Provider only)
- `GET /api/services/categories` - Get service categories

### Bookings
- `POST /api/bookings` - Create booking (Customer only)
- `GET /api/bookings/my-bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get booking by ID
- `PUT /api/bookings/:id/status` - Update booking status
- `GET /api/bookings/stats` - Get booking statistics

### Portfolio
- `POST /api/portfolio` - Create portfolio item (Provider only)
- `GET /api/portfolio/provider/:providerId` - Get provider's portfolio
- `GET /api/portfolio/my-portfolio` - Get my portfolio (Provider only)
- `PUT /api/portfolio/:id` - Update portfolio item (Provider only)
- `DELETE /api/portfolio/:id` - Delete portfolio item (Provider only)

### Reviews
- `POST /api/reviews` - Create review (Customer only)
- `GET /api/reviews/provider/:providerId` - Get provider reviews
- `GET /api/reviews/service/:serviceId` - Get service reviews
- `GET /api/reviews/my-reviews` - Get my reviews (Customer only)
- `PUT /api/reviews/:id` - Update review (Customer only)
- `DELETE /api/reviews/:id` - Delete review (Customer only)

## 🔐 Authentication & Authorization

The application uses JWT (JSON Web Tokens) for authentication. Users can have two roles:

- **Customer**: Can book services, leave reviews, manage their bookings
- **Provider**: Can create services, manage bookings, upload portfolio items

### Protected Routes
- All API endpoints except public ones require authentication
- Role-based access control for specific operations
- Frontend routes are protected using `ProtectedRoute` component

## 📱 User Flows

### Customer Flow
1. Sign up as a customer
2. Browse available services
3. Book a service
4. Track booking status
5. Leave reviews after service completion

### Provider Flow
1. Sign up as a provider
2. Create service listings
3. Upload portfolio items
4. Manage booking requests
5. Update booking status
6. View reviews and ratings

## 🎨 UI Components

### Reusable Components
- **ServiceCard**: Displays service information with booking action
- **ProviderCard**: Shows provider details and services
- **BookingCard**: Displays booking information with status actions
- **PortfolioCard**: Shows portfolio items with image gallery
- **FileUpload**: Drag-and-drop file upload with preview
- **ProtectedRoute**: Route protection based on authentication and roles

### Styling
- Tailwind CSS for utility-first styling
- Responsive design for mobile, tablet, and desktop
- Consistent color scheme and typography
- Hover effects and transitions

## 🔧 Development Status

### ✅ Completed
- [x] Backend project setup and configuration
- [x] Database models and schemas
- [x] Authentication system with JWT
- [x] Service management API
- [x] Booking system API
- [x] Portfolio management with file uploads
- [x] Review system API
- [x] Frontend project setup with Tailwind CSS
- [x] Context API for state management
- [x] Reusable UI components
- [x] Authentication pages (Login/Signup)
- [x] API client and utilities

### 🚧 In Progress / Next Steps
- [ ] Public pages (Home, Services, ServiceDetails, NotFound)
- [ ] Dashboard pages (CustomerDashboard, ProviderDashboard)
- [ ] Frontend-backend integration
- [ ] Form validation and error handling
- [ ] File upload functionality
- [ ] Responsive design implementation
- [ ] Framer Motion animations
- [ ] Testing and optimization

## 🚀 Deployment

### Backend Deployment (Render/Heroku)
1. Connect your GitHub repository
2. Set environment variables:
   - `MONGO_URI` (MongoDB Atlas connection string)
   - `JWT_SECRET` (secure random string)
   - `NODE_ENV=production`
3. Deploy

### Frontend Deployment (Netlify/Vercel)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set environment variables:
   - `REACT_APP_API_URL` (your backend API URL)
4. Deploy

### Database Setup
- Use MongoDB Atlas for production
- Update connection string in backend environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Email: support@servicesphere.com
- Documentation: [Link to docs]
- Issues: [GitHub Issues]

## 🔮 Future Enhancements

- [ ] Real-time notifications
- [ ] Payment gateway integration
- [ ] Advanced search and filtering
- [ ] Mobile app development
- [ ] AI-powered service recommendations
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Chat system between customers and providers
