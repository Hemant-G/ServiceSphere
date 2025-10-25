import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import { resolveImageUrl } from '../utils/media';

const PortfolioItemDetails = () => {
  const { id } = useParams();
  const { getPortfolioItemById } = usePortfolio();
  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const loadItem = async () => {
      setIsLoading(true);
      const result = await getPortfolioItemById(id);
      if (result.success) {
        setItem(result.data);
        if (result.data.images && result.data.images.length > 0) {
          setSelectedImage(resolveImageUrl(result.data.images && result.data.images[0]));
        }
      } else {
        setError(result.error);
      }
      setIsLoading(false);
    };
    loadItem();
  }, [id, getPortfolioItemById]);

  if (isLoading) {
    return <div className="text-center py-20 text-muted-foreground">Loading portfolio item...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-destructive">Error: {error}</div>;
  }

  if (!item) {
    return <div className="text-center py-20 text-muted-foreground">Portfolio item not found.</div>;
  }

  return (
    <div className="bg-background min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          {/* Image Gallery */}
          <div className="p-4">
            <div className="mb-4">
              <img
                src={selectedImage}
                alt={item.title}
                className="w-full h-96 object-cover rounded-lg shadow-md"
              />
            </div>
            <div className="flex space-x-2 overflow-x-auto">
              {item.images.map((img, index) => (
                <img
                  key={index}
                  src={resolveImageUrl(img)}
                  alt={`${item.title} - ${index + 1}`}
                  onClick={() => setSelectedImage(resolveImageUrl(img))}
                  className={`w-24 h-24 object-cover rounded-md cursor-pointer border-2 transition-all ${
                    selectedImage === resolveImageUrl(img) ? 'border-primary' : 'border-border'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <h1 className="text-3xl font-bold text-card-foreground mb-2">{item.title}</h1>
            <p className="text-sm text-muted-foreground mb-4">Category: <span className="font-medium text-primary">{item.category}</span></p>

            <p className="text-foreground whitespace-pre-wrap">{item.description}</p>

            {item.skills && item.skills.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-card-foreground mb-2">Skills Used</h3>
                <div className="flex flex-wrap gap-2">
                  {item.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Provider Info */}
            {item.provider && (
              <div className="mt-8 border-t border-border pt-6 flex items-center">
                <img
                  src={item.provider.avatar ? resolveImageUrl(item.provider.avatar) : `https://ui-avatars.com/api/?name=${item.provider.name}&background=random`}
                  alt={item.provider.name}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <p className="text-sm text-muted-foreground">Work by:</p>
                  <h4 className="text-xl font-bold text-card-foreground">{item.provider.name}</h4>
                  <div className="flex items-center text-sm text-yellow-500 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${i < Math.round(item.provider.averageRating) ? 'text-yellow-400' : 'text-muted-foreground/30'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.539 1.118l-3.367-2.448a1 1 0 00-1.175 0l-3.367 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
                      </svg>
                    ))}
                    <span className="text-muted-foreground text-xs ml-2">({item.provider.totalReviews} reviews)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioItemDetails;