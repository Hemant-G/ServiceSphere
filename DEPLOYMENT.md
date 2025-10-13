# Service Sphere - Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

### Local Development Setup

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd service-sphere
   ```

2. **Start MongoDB**
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Update MONGO_URI in backend/.env
   ```

3. **Quick Start (Both servers)**
   ```bash
   ./start.sh
   ```

4. **Manual Start**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm install
   npm start
   
   # Terminal 2 - Frontend
   cd frontend
   npm install
   npm start
   ```

5. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Health Check: http://localhost:5000/api/health

## 🌐 Production Deployment

### Backend Deployment (Render/Heroku)

1. **Prepare Backend**
   ```bash
   cd backend
   # Ensure all dependencies are in package.json
   npm install --production
   ```

2. **Environment Variables**
   ```env
   NODE_ENV=production
   PORT=5000
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/serviceSphere
   JWT_SECRET=your-super-secret-jwt-key-here
   ```

3. **Deploy to Render**
   - Connect GitHub repository
   - Set build command: `npm install`
   - Set start command: `npm start`
   - Add environment variables
   - Deploy

### Frontend Deployment (Netlify/Vercel)

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Environment Variables**
   ```env
   REACT_APP_API_URL=https://your-backend-url.com/api
   ```

3. **Deploy to Netlify**
   - Connect GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `build`
   - Add environment variables
   - Deploy

### Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/atlas
   - Create free cluster
   - Get connection string

2. **Update Backend Environment**
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/serviceSphere?retryWrites=true&w=majority
   ```

## 🔧 Configuration

### Backend Configuration

**File: `backend/.env`**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/serviceSphere
JWT_SECRET=supersecretkey123456789
NODE_ENV=development
```

### Frontend Configuration

**File: `frontend/.env`**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Services
- `GET /api/services` - Get all services (with filters)
- `GET /api/services/:id` - Get service by ID
- `POST /api/services` - Create service (Provider only)
- `PUT /api/services/:id` - Update service (Provider only)
- `DELETE /api/services/:id` - Delete service (Provider only)

### Bookings
- `POST /api/bookings` - Create booking (Customer only)
- `GET /api/bookings/my-bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get booking by ID
- `PUT /api/bookings/:id/status` - Update booking status

### Portfolio
- `POST /api/portfolio` - Create portfolio item (Provider only)
- `GET /api/portfolio/provider/:providerId` - Get provider's portfolio
- `GET /api/portfolio/my-portfolio` - Get my portfolio (Provider only)

### Reviews
- `POST /api/reviews` - Create review (Customer only)
- `GET /api/reviews/provider/:providerId` - Get provider reviews
- `GET /api/reviews/my-reviews` - Get my reviews (Customer only)

## 🧪 Testing

### Manual Testing Checklist

#### Customer Flow
- [ ] Sign up as customer
- [ ] Browse services
- [ ] Book a service
- [ ] View booking status
- [ ] Rate completed service

#### Provider Flow
- [ ] Sign up as provider
- [ ] Create service listing
- [ ] Upload portfolio items
- [ ] Accept/reject booking requests
- [ ] Update booking status
- [ ] View reviews

### API Testing
```bash
# Health check
curl http://localhost:5000/api/health

# Get services
curl http://localhost:5000/api/services

# Sign up
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","role":"customer"}'
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in .env
   - Verify network access (for Atlas)

2. **CORS Errors**
   - Check CORS configuration in backend
   - Verify frontend URL in CORS settings

3. **JWT Token Issues**
   - Check JWT_SECRET in .env
   - Verify token expiration settings

4. **File Upload Issues**
   - Check uploads directory permissions
   - Verify multer configuration
   - Check file size limits

### Debug Mode

**Backend Debug**
```bash
cd backend
DEBUG=* npm start
```

**Frontend Debug**
```bash
cd frontend
REACT_APP_DEBUG=true npm start
```

## 📈 Performance Optimization

### Backend
- Enable MongoDB indexing
- Implement caching (Redis)
- Add rate limiting
- Optimize database queries

### Frontend
- Implement code splitting
- Add image optimization
- Enable service worker
- Use CDN for static assets

## 🔒 Security Considerations

### Production Security
- Use strong JWT secrets
- Enable HTTPS
- Implement rate limiting
- Sanitize user inputs
- Use environment variables for secrets
- Regular security updates

### File Upload Security
- Validate file types
- Check file sizes
- Scan for malware
- Store files outside web root

## 📝 Monitoring & Logging

### Backend Logging
```javascript
// Add to server.js
const morgan = require('morgan');
app.use(morgan('combined'));
```

### Error Tracking
- Integrate Sentry for error tracking
- Set up monitoring alerts
- Log important events

## 🚀 Scaling Considerations

### Database
- Use MongoDB Atlas for scaling
- Implement database sharding
- Add read replicas

### Application
- Use PM2 for process management
- Implement load balancing
- Add horizontal scaling

### CDN
- Use CloudFlare or AWS CloudFront
- Cache static assets
- Implement edge computing

## 📞 Support

For deployment issues:
- Check logs in deployment platform
- Verify environment variables
- Test API endpoints
- Check database connectivity

## 🔄 Updates & Maintenance

### Regular Updates
- Keep dependencies updated
- Monitor security advisories
- Backup database regularly
- Test after updates

### Backup Strategy
- Database backups (daily)
- Code repository backups
- Environment configuration backups
- File upload backups
