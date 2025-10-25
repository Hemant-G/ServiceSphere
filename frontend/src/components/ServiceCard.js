import React from 'react';
import { Link } from 'react-router-dom';
import { SERVICE_CATEGORIES } from '../utils/constants';
import { resolveImageUrl } from '../utils/media';

const ServiceCard = ({ service }) => {
  const category = SERVICE_CATEGORIES.find(cat => cat.value === service.category);
  
  return (
    <div className="bg-card rounded-lg border border-border hover:border-primary transition-colors duration-300 overflow-hidden">
      {/* Service Image */}
      <div className="h-48 bg-secondary relative">
        {service.images && service.images.length > 0 ? (
          <img
            src={resolveImageUrl(service.images[0])}
            alt={service.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-background">
            <div className="text-center">
              <div className="text-4xl mb-2">{category?.icon || '🔧'}</div>
              <div className="text-primary font-medium">{category?.label || service.category}</div>
            </div>
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-card bg-opacity-90 px-2 py-1 rounded-full text-xs font-medium text-card-foreground">
            {category?.label || service.category}
          </span>
        </div>

        {/* Rating Badge */}
        {service.averageRating > 0 && (
          <div className="absolute top-3 right-3">
            <div className="bg-card bg-opacity-90 px-2 py-1 rounded-full text-xs font-medium text-card-foreground flex items-center">
              <svg className="w-3 h-3 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {service.averageRating.toFixed(1)}
            </div>
          </div>
        )}
      </div>

      {/* Service Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-card-foreground mb-2 line-clamp-2">
          {service.title}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {service.description}
        </p>

        {/* Provider Info */}
        <div className="flex items-center mb-3">
          <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center mr-3">
            {service.provider?.avatar ? (
              <img
                src={resolveImageUrl(service.provider.avatar)}
                alt={service.provider.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <span className="text-primary font-medium text-sm">
                {service.provider?.name?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-card-foreground">{service.provider?.name}</p>
            {service.provider?.averageRating > 0 && (
              <div className="flex items-center">
                <svg className="w-3 h-3 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-xs text-muted-foreground">
                  {service.provider.averageRating.toFixed(1)} ({service.provider.totalReviews} reviews)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Service Details */}
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

        {/* Action Button */}
        <Link
          to={`/services/${service._id}`}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-center py-2 px-4 rounded-md font-medium transition-colors duration-200 block"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ServiceCard;
