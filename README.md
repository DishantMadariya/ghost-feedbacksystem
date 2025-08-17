# 🌐 Ghost Feedback System - Frontend

A modern, responsive React.js frontend for the Ghost Feedback System. This application provides an anonymous suggestion submission interface and a secure admin dashboard for managing feedback.

## ✨ Features

### 🎨 **User Interface**
- **Modern Design**: Clean, professional UI with Tailwind CSS
- **Responsive Layout**: Mobile-first design that works on all devices
- **Dark/Light Theme**: Adaptive color scheme
- **Accessibility**: WCAG compliant with proper ARIA labels

### 📝 **Suggestion Submission**
- **Anonymous Form**: 100% private feedback submission
- **Smart Validation**: Real-time form validation with helpful error messages
- **Category System**: 7 main categories with dependent subcategories
- **Instant Feedback**: Success confirmation and form reset

### 👨‍💼 **Admin Dashboard**
- **Role-Based Access**: Different permissions for different admin roles
- **Comprehensive Analytics**: Charts, statistics, and insights
- **Advanced Filtering**: Search, filter, and sort suggestions
- **Bulk Operations**: Manage multiple suggestions efficiently
- **Export Functionality**: CSV and Excel export options

### 🔒 **Security Features**
- **JWT Authentication**: Secure admin login system
- **Permission Management**: Granular access control
- **Input Sanitization**: XSS and injection protection
- **Secure Storage**: Local storage with token management

## 🏗️ Architecture

### **Tech Stack**
- **Framework**: React.js 18 with Hooks
- **Routing**: React Router v6
- **State Management**: React Context + Hooks
- **Styling**: Tailwind CSS with custom components
- **HTTP Client**: Axios with interceptors
- **Forms**: React Hook Form with validation
- **Charts**: Recharts for data visualization
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

### **Project Structure**
```
src/
├── components/          # Reusable UI components
│   ├── dashboard/      # Admin dashboard components
│   └── common/         # Shared components
├── contexts/           # React Context providers
├── utils/              # Helper functions and utilities
├── hooks/              # Custom React hooks
└── assets/             # Images, icons, and static files
```

## 🚀 Quick Start

### **Prerequisites**
- Node.js (v16 or higher)
- npm or yarn
- Backend API running (local or deployed)

### **Local Development Setup**

1. **Clone and navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create `.env.local` file in the client directory:
   ```env
   # API Configuration
   REACT_APP_API_BASE_URL=http://localhost:5000
   REACT_APP_API_VERSION=v1
   
   # App Configuration
   REACT_APP_NAME=Ghost Feedback System
   REACT_APP_DESCRIPTION=Anonymous suggestion box for secure employee feedback
   
   # Feature Flags
   REACT_APP_ENABLE_ANALYTICS=false
   REACT_APP_ENABLE_DEBUG_MODE=true
   
   # External Services (if needed)
   REACT_APP_GOOGLE_ANALYTICS_ID=
   REACT_APP_SENTRY_DSN=
   ```

4. **Start Development Server**
   ```bash
   npm start
   ```

### **Production Deployment (Vercel)**

1. **Environment Variables in Vercel**
   ```env
   # API Configuration
   REACT_APP_API_BASE_URL=https://your-backend.onrender.com
   REACT_APP_API_VERSION=v1
   
   # App Configuration
   REACT_APP_NAME=Ghost Feedback System
   REACT_APP_DESCRIPTION=Anonymous suggestion box for secure employee feedback
   
   # Feature Flags
   REACT_APP_ENABLE_ANALYTICS=true
   REACT_APP_ENABLE_DEBUG_MODE=false
   
   # External Services
   REACT_APP_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
   REACT_APP_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
   ```

2. **Build Command**
   ```bash
   npm run build
   ```

3. **Output Directory**
   ```
   build/
   ```

## 🔧 Configuration

### **API Configuration**
The frontend automatically configures API calls based on environment variables:

```javascript
// src/utils/api.js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
const API_VERSION = process.env.REACT_APP_API_VERSION || 'v1';

export const API_ENDPOINTS = {
  BASE: `${API_BASE_URL}/api/${API_VERSION}`,
  SUGGESTIONS: `${API_BASE_URL}/api/${API_VERSION}/suggestions`,
  AUTH: `${API_BASE_URL}/api/${API_VERSION}/auth`,
  ADMIN: `${API_BASE_URL}/api/${API_VERSION}/admin`
};
```

### **Tailwind Configuration**
Custom color scheme and component classes:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: { /* Blue theme */ },
        ghost: { /* Neutral grays */ },
        success: { /* Green */ },
        warning: { /* Yellow */ },
        danger: { /* Red */ }
      }
    }
  }
};
```

## 📱 Responsive Design

### **Breakpoints**
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

### **Mobile-First Approach**
- Touch-friendly interface
- Optimized for small screens
- Progressive enhancement for larger devices

## 🎨 Customization

### **Branding**
- **Logo**: Replace `/public/logo.png` with your logo
- **Favicon**: Update favicon files in `/public/`
- **Colors**: Modify Tailwind config for brand colors
- **Typography**: Customize font families and sizes

### **Categories**
Modify categories in the backend API. The frontend automatically adapts to category changes.

### **Admin Roles**
Update admin roles and permissions in the backend. The frontend UI automatically adjusts based on user permissions.

## 🚀 Performance Optimization

### **Code Splitting**
- Route-based code splitting
- Lazy loading for admin components
- Dynamic imports for heavy components

### **Bundle Optimization**
- Tree shaking for unused code
- Optimized imports
- Compressed assets

### **Caching Strategy**
- Service worker for offline support
- Local storage for user preferences
- HTTP caching headers

## 🔒 Security Considerations

### **Frontend Security**
- Input validation and sanitization
- XSS prevention
- CSRF protection via JWT
- Secure storage practices

### **API Security**
- HTTPS-only in production
- JWT token management
- Secure cookie handling
- CORS configuration

## 🧪 Testing

### **Component Testing**
```bash
# Run component tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=ComponentName
```

### **E2E Testing**
```bash
# Install Playwright
npm install -D @playwright/test

# Run E2E tests
npx playwright test
```

## 📊 Analytics & Monitoring

### **Built-in Analytics**
- User interaction tracking
- Form submission analytics
- Admin dashboard usage
- Performance metrics

### **External Integration**
- Google Analytics
- Sentry error tracking
- Custom analytics events

## 🚨 Troubleshooting

### **Common Issues**

1. **API Connection Error**
   - Check `REACT_APP_API_BASE_URL` in environment variables
   - Verify backend is running and accessible
   - Check CORS configuration on backend

2. **Build Errors**
   - Clear `node_modules` and reinstall
   - Check Node.js version compatibility
   - Verify all environment variables are set

3. **Styling Issues**
   - Clear browser cache
   - Check Tailwind CSS compilation
   - Verify custom CSS imports

### **Development Tools**
- React Developer Tools
- Redux DevTools (if using Redux)
- Network tab for API debugging
- Console for error logging

## 📞 Support

For frontend issues:
1. Check browser console for errors
2. Verify environment variables
3. Test API endpoints independently
4. Check Vercel deployment logs

## 🔗 Links

- **Backend Repository**: [Ghost Feedback Backend](https://github.com/your-username/ghost-feedback-backend)
- **Live Demo**: [Your Frontend URL]
- **API Documentation**: [Your Backend API URL]

## 📝 Deployment Checklist

### **Pre-Deployment**
- [ ] Environment variables configured
- [ ] API endpoints updated
- [ ] Build successful locally
- [ ] Tests passing
- [ ] Assets optimized

### **Post-Deployment**
- [ ] Frontend accessible
- [ ] API calls working
- [ ] Forms functional
- [ ] Admin login working
- [ ] Responsive design verified

---

**Built with ❤️ for secure, anonymous employee feedback**
