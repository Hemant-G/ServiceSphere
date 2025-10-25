import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useService } from '../context/ServiceContext';
import { API_ROOT } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';

const ServiceDetails = () => {
  const { id } = useParams();
  const { fetchServiceById } = useService();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [providerProfile, setProviderProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadServiceDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const serviceResult = await fetchServiceById(id);
        if (serviceResult.success) {
          setService(serviceResult.service);
          // Fetch provider profile
          if (serviceResult.service.provider?._id) {
            const providerResult = await authAPI.getUserProfile(serviceResult.service.provider._id);
            if (providerResult.data.success) {
              setProviderProfile(providerResult.data.data);
            } else {
              throw new Error('Could not fetch provider profile.');
            }
          }
        } else {
          throw new Error(serviceResult.error);
        }
      } catch (err) {
        setError(err.message || 'Failed to load service details.');
      } finally {
        setIsLoading(false);
      }
    };

    loadServiceDetails();
  }, [id, fetchServiceById]);

  if (isLoading) {
    return <div className="text-center py-20 text-muted-foreground">Loading service details...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-destructive">Error: {error}</div>;
  }

  if (!service) {
    return <div className="text-center py-20 text-muted-foreground">Service not found.</div>;
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 bg-card rounded-lg border border-border p-8">
            <h1 className="text-3xl font-bold text-card-foreground mb-2">{service.title}</h1>
            <p className="text-lg text-muted-foreground mb-6">{service.description}</p>

            <div className="border-t border-border pt-6">
              <h2 className="text-2xl font-semibold text-card-foreground mb-4">Service Details</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-muted-foreground">Category:</span>
                  <span className="text-card-foreground">{service.category}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-muted-foreground">Price:</span>
                  <span className="text-2xl font-bold text-primary">${service.price}</span>
                </div>
                {service.duration && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-muted-foreground">Estimated Duration:</span>
                    <span className="text-card-foreground">{service.duration} hours</span>
                  </div>
                )}
              </div>
            </div>

            {/* Provider's Portfolio Preview */}
            {providerProfile?.portfolio?.length > 0 && (
              <div className="border-t border-border mt-8 pt-6">
                <h2 className="text-2xl font-semibold text-card-foreground mb-4">Provider's Portfolio</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {providerProfile.portfolio.map(item => (
                    <Link to={`/portfolio/${item._id}`} key={item._id} className="group">
                      <div className="rounded-lg overflow-hidden border group-hover:shadow-lg transition-shadow">
                        <img src={`${API_ROOT}${item.images[0]}`} alt={item.title} className="h-32 w-full object-cover" />
                        <div className="p-2">
                          <h4 className="text-sm font-semibold truncate group-hover:text-primary">{item.title}</h4>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar with Provider Info and Booking */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border border-border p-6 sticky top-8">
              {providerProfile ? (
                <div className="text-center">
                  <img
                    src={providerProfile.avatar ? `${API_ROOT}${providerProfile.avatar}` : `https://ui-avatars.com/api/?name=${providerProfile.name}&background=random`}
                    alt={providerProfile.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-card shadow-lg"
                  />
                  <h3 className="text-xl font-bold text-card-foreground">{providerProfile.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">Provider since {new Date(providerProfile.createdAt).toLocaleDateString()}</p>

                  <div className="flex justify-center items-center space-x-1 text-yellow-500 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-5 h-5 ${i < Math.round(providerProfile.averageRating) ? 'text-yellow-400' : 'text-muted-foreground/50'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.539 1.118l-3.367-2.448a1 1 0 00-1.175 0l-3.367 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
                      </svg>
                    ))}
                    <span className="text-muted-foreground text-sm ml-2">({providerProfile.totalReviews} reviews)</span>
                  </div>

                  {user?.role === 'customer' ? (
                    <Link
                      to={`/book/${service._id}`}
                      className="w-full block text-center bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                    >
                      Book This Service
                    </Link>
                  ) : user?.id === providerProfile._id ? ( <p className="text-sm text-muted-foreground">This is your service listing.</p> ) : (
                    <Link
                      to="/login"
                      className="w-full block text-center bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                    >
                      Login to Book
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground">Provider information not available.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;