import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useService } from '../context/ServiceContext';
import { useAuth } from '../context/AuthContext';
import { SERVICE_CATEGORIES } from '../utils/constants';
import { FiSearch, FiCalendar, FiStar, FiTool, FiBriefcase } from 'react-icons/fi';

const Home = () => {
  const { fetchServices, getFeaturedServices, isLoading } = useService();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchServices({ limit: 8 });
  }, [fetchServices]);

  const featuredServices = getFeaturedServices();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-card bg-gradient-to-b from-card to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
              Find <span className="text-primary">Trusted</span> Service Providers
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-muted-foreground max-w-3xl mx-auto">
              Connect with skilled professionals for all your home and business needs. 
              From cleaning to repairs, we've got you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/services"
                className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all transform hover:scale-105 shadow-lg"
              >
                Browse Services
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/signup"
                  className="border-2 border-border text-foreground px-8 py-3 rounded-lg font-semibold hover:bg-secondary transition-all transform hover:scale-105"
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple steps to get the services you need
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-card p-8 rounded-lg border border-border shadow-sm hover:shadow-primary/20 hover:border-primary/30 hover:-translate-y-2 transition-all duration-300 text-center">
              <div className="bg-secondary w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiSearch className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">1. Search & Browse</h3>
              <p className="text-muted-foreground text-sm">
                Find services by category or search for specific needs. Browse provider profiles and reviews.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="bg-card p-8 rounded-lg border border-border shadow-sm hover:shadow-primary/20 hover:border-primary/30 hover:-translate-y-2 transition-all duration-300 text-center">
              <div className="bg-secondary w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiCalendar className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">2. Book & Schedule</h3>
              <p className="text-muted-foreground text-sm">
                Choose your preferred provider and schedule a convenient time for the service.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="bg-card p-8 rounded-lg border border-border shadow-sm hover:shadow-primary/20 hover:border-primary/30 hover:-translate-y-2 transition-all duration-300 text-center">
              <div className="bg-secondary w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiStar className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">3. Rate & Review</h3>
              <p className="text-muted-foreground text-sm">
                After service completion, rate your experience and help others make informed decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-card-foreground mb-4">
              Popular Service Categories
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find the perfect service for your needs
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {SERVICE_CATEGORIES.slice(0, 12).map((category) => (
              <Link
                key={category.value}
                to={`/services?category=${category.value}`}
                className="bg-background p-6 rounded-lg border border-border hover:border-primary hover:-translate-y-1 transition-all text-center group"
              >
                <div className="text-4xl mb-3 text-primary transition-transform">
                  {category.icon}
                </div>
                <h3 className="font-medium text-foreground text-sm">
                  {category.label}
                </h3>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link
              to="/services"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              View All Categories
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Services Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Featured Services
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Top-rated services from trusted providers
            </p>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-card rounded-lg border border-border overflow-hidden animate-pulse">
                  <div className="h-48 bg-secondary"></div>
                  <div className="p-4">
                    <div className="h-4 bg-secondary rounded mb-2"></div>
                    <div className="h-3 bg-secondary rounded mb-4"></div>
                    <div className="h-8 bg-secondary rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredServices.slice(0, 4).map((service) => (
                <div key={service._id} className="bg-card rounded-lg border border-border hover:border-primary transition-colors overflow-hidden">
                  <div className="h-48 bg-secondary relative">
                    {service.images && service.images.length > 0 ? (
                      <img
                        src={service.images[0]}
                        alt={service.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-background">
                        <div className="text-center">
                          <div className="text-4xl mb-2">
                            {SERVICE_CATEGORIES.find(cat => cat.value === service.category)?.icon || <FiBriefcase />}
                          </div>
                          <div className="text-primary font-medium">
                            {SERVICE_CATEGORIES.find(cat => cat.value === service.category)?.label || service.category}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="absolute top-3 right-3">
                      <div className="bg-card bg-opacity-90 px-2 py-1 rounded-full text-xs font-medium text-card-foreground flex items-center">
                        <svg className="w-3 h-3 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {service.averageRating.toFixed(1)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-card-foreground mb-2 line-clamp-2">
                      {service.title}
                    </h3>
                    
                    <div className="flex items-center mb-3">
                      <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center mr-2">
                        <span className="text-primary font-medium text-xs">
                          {service.provider?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">{service.provider?.name}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {service.duration} hours
                      </div>
                      <div className="text-lg font-bold text-primary">
                        ${service.price}
                      </div>
                    </div>
                    
                    <Link
                      to={`/services/${service._id}`}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-center py-2 px-4 rounded-md font-medium transition-colors duration-200 block"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-lg border border-border">
              <FiTool className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium text-card-foreground mb-2">No services available yet</h3>
              <p className="text-muted-foreground">Check back later for featured services</p>
            </div>
          )}
          
          <div className="text-center mt-8">
            <Link
              to="/services"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust Service Sphere for their service needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/signup"
                  className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  Sign Up Now
                </Link>
                <Link
                  to="/services"
                  className="border border-border text-foreground px-8 py-3 rounded-lg font-semibold hover:bg-secondary transition-colors"
                >
                  Browse Services
                </Link>
              </>
            ) : (
              <Link
                to="/services"
                className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Browse Services
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
