import React, { useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import PortfolioCard from '../components/PortfolioCard';
import { Link } from 'react-router-dom';
import { FiImage } from 'react-icons/fi';

const Portfolio = () => {
  const { portfolioItems, isLoading, fetchPortfolioItems } = usePortfolio();

  useEffect(() => {
    fetchPortfolioItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Portfolio Showcase</h1>
        <p className="text-lg text-muted-foreground mb-8">Explore the amazing work from our talented service providers.</p>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-card rounded-lg border border-border overflow-hidden animate-pulse">
                <div className="h-48 bg-secondary"></div>
                <div className="p-4">
                  <div className="h-4 bg-secondary rounded mb-2"></div>
                  <div className="h-3 bg-secondary rounded mb-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : portfolioItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioItems.map((portfolioItem) => (
              <PortfolioCard key={portfolioItem._id} portfolioItem={portfolioItem} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-lg border border-border">
            <FiImage className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium text-card-foreground mb-2">No portfolio items to show yet</h3>
            <p className="text-muted-foreground mb-4">Check back soon to see amazing work from our providers.</p>
            <Link to="/services" className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
              Browse Services
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;
