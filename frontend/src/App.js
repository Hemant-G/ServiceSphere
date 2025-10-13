import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ServiceProvider } from './context/ServiceContext';
import { BookingProvider } from './context/BookingContext';
import { PortfolioProvider } from './context/PortfolioContext';
import { LocationProvider } from './context/LocationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import Services from './pages/Services';
import ServiceDetails from './pages/ServiceDetails';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import PortfolioItemDetails from './pages/PortfolioItemDetails';
import MyPortfolio from './pages/Dashboard/MyPortfolio';
import NotFound from './pages/NotFound';
import NewBooking from './pages/NewBooking';


function App() {
  return (
    <AuthProvider>
      <ServiceProvider>
        <LocationProvider>
          <PortfolioProvider>
            <BookingProvider>
              <Router> 
                <div className="min-h-screen flex flex-col">
                  <Navbar />
                  <main className="flex-grow">
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<Home />} />
                      <Route path="/services" element={<Services />} />
                      <Route path="/services/:id" element={<ServiceDetails />} />
                      <Route path="/portfolio" element={<Portfolio />} />
                      <Route path="/portfolio/:id" element={<PortfolioItemDetails />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                      
                      {/* Protected Routes */}
                      <Route 
                        path="/dashboard" 
                        element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
                      />
                      <Route 
                        path="/profile" 
                        element={<ProtectedRoute><Profile /></ProtectedRoute>} 
                      />
                      <Route
                        path="/portfolio/my-portfolio"
                        element={
                          <ProtectedRoute roles={['provider']}>
                            <MyPortfolio />
                          </ProtectedRoute>
                        }
                      />
                      <Route 
                        path="/book/:serviceId"
                        element={<ProtectedRoute roles={['customer']}><NewBooking /></ProtectedRoute>}
                      />
                      
                      {/* Catch all route */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              </Router>
            </BookingProvider>
          </PortfolioProvider>
        </LocationProvider>
      </ServiceProvider>
    </AuthProvider>
  );
}

export default App;