import React from 'react';
import { Link } from 'react-router-dom';
import { resolveImageUrl } from '../utils/media';

const ProviderCard = ({ provider }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Provider Avatar */}
      <div className="h-32 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
        {provider.avatar ? (
          <img
            src={resolveImageUrl(provider.avatar)}
            alt={provider.name}
            className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-md"
          />
        ) : (
          <div className="h-20 w-20 rounded-full bg-primary-600 flex items-center justify-center border-4 border-white shadow-md">
            <span className="text-white font-bold text-2xl">
              {provider.name?.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Provider Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {provider.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3">
          {provider.email}
        </p>

        {/* Rating */}
        {provider.averageRating > 0 && (
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(provider.averageRating)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">
              {provider.averageRating.toFixed(1)} ({provider.totalReviews} reviews)
            </span>
          </div>
        )}

        {/* Services Count */}
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          {provider.servicesCount || 0} services
        </div>

        {/* Action Button */}
        <Link
          to={`/services/provider/${provider._id}`}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white text-center py-2 px-4 rounded-md font-medium transition-colors duration-200 block"
        >
          View Services
        </Link>
      </div>
    </div>
  );
};

export default ProviderCard;
