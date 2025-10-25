import React from 'react';
import { API_ROOT } from '../utils/constants';
import { Link } from 'react-router-dom';
import { FiFileText } from 'react-icons/fi';

const PortfolioCard = ({ portfolioItem }) => {
  return (
    <div className="bg-card rounded-lg border border-border hover:border-primary transition-colors duration-300 overflow-hidden">
      {/* Images */}
      <div className="h-48 bg-secondary relative">
        {portfolioItem.images && portfolioItem.images.length > 0 ? (
          <div className="relative h-full">
            <img
              src={`${API_ROOT}${portfolioItem.images[0]}`}
              alt={portfolioItem.title}
              className="w-full h-full object-cover"
            />
            {portfolioItem.images.length > 1 && (
              <div className="absolute top-3 right-3 bg-background/70 text-foreground px-2 py-1 rounded-full text-xs">
                +{portfolioItem.images.length - 1} more
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-background">
            <div className="text-center">
              <FiFileText className="w-12 h-12 text-muted-foreground mb-2" />
              <div className="text-primary font-medium">Portfolio</div>
            </div>
          </div>
        )}
        
        {/* Featured Badge */}
        {portfolioItem.featured && (
          <div className="absolute top-3 left-3">
            <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs font-medium border border-yellow-500/30">
              Featured
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-card-foreground mb-2 line-clamp-2">
          {portfolioItem.title}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-3 line-clamp-3">
          {portfolioItem.description}
        </p>

        {/* Skills */}
        {portfolioItem.skills && portfolioItem.skills.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {portfolioItem.skills.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}
              {portfolioItem.skills.length > 3 && (
                <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                  +{portfolioItem.skills.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Experience */}
        {portfolioItem.experience > 0 && (
          <div className="flex items-center text-sm text-muted-foreground mb-3">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{portfolioItem.experience} years experience</span>
          </div>
        )}

        {/* Resume Link */}
        {portfolioItem.resumeUrl && (
          <div className="mb-3">
            <a
              href={portfolioItem.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-primary hover:text-primary/90"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Resume
            </a>
          </div>
        )}

        {/* Action Button */}
        <Link
          to={`/portfolio/${portfolioItem._id}`}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-center py-2 px-4 rounded-md font-medium transition-colors duration-200 block"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default PortfolioCard;
