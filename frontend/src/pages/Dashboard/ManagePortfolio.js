import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { usePortfolio } from '../../context/PortfolioContext';
import { servicesAPI } from '../../utils/api';
import { FiImage } from 'react-icons/fi';
import { resolveImageUrl } from '../../utils/media';

const PortfolioFormModal = ({ onClose, onPortfolioItemCreated }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const { createPortfolioItem } = usePortfolio();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [predefinedServices, setPredefinedServices] = useState([]);

  useEffect(() => {
    const fetchPredefinedServices = async () => {
      try {
        const { data } = await servicesAPI.getPredefined();
        if (data && data.data) {
          setPredefinedServices(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch predefined services:", error);
      }
    };
    fetchPredefinedServices();
  }, []);



  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('category', data.category);
    
    if (data.images && data.images.length > 0) {
      Array.from(data.images).forEach(image => formData.append('images', image));
    }

    const result = await createPortfolioItem(formData);
    if (result.success) {
      onPortfolioItemCreated();
      reset();
    } else {
      alert(result.error || 'Failed to create portfolio item.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-card p-8 rounded-lg shadow-xl w-full max-w-md border border-border">
        <h2 className="text-2xl font-bold mb-6 text-card-foreground">Add Portfolio Item</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input {...register('title', { required: 'Title is required' })} placeholder="Title" className="w-full p-2 border border-input bg-input rounded" />
          {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
          
          <textarea {...register('description', { required: 'Description is required' })} placeholder="Description" className="w-full p-2 border border-input bg-input rounded" />
          {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1">Category</label>
            <select {...register('category', { required: 'Category is required' })} className="w-full p-2 border border-input bg-input rounded">
              <option value="">Select a category</option>
              {predefinedServices.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
            {errors.category && <p className="text-destructive text-sm">{errors.category.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1">Images (up to 5)</label>
            <input type="file" {...register('images', { required: 'At least one image is required' })} className="w-full p-2 border border-input bg-input rounded" accept="image/*" multiple />
            {errors.images && <p className="text-destructive text-sm">{errors.images.message}</p>}
          </div>

          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded text-secondary-foreground border border-border hover:bg-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {isSubmitting ? 'Creating...' : 'Create Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ManagePortfolio = () => {
  const { portfolioItems, isLoading, getMyPortfolio, deletePortfolioItem } = usePortfolio();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    getMyPortfolio();
  }, [getMyPortfolio]); // This is already correct, but confirms the pattern.

  const handleItemCreated = () => {
    setShowForm(false);
    getMyPortfolio();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      await deletePortfolioItem(id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Manage Portfolio</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Add New Item
          </button>
        </div>

        {showForm && (
          <PortfolioFormModal
            onClose={() => setShowForm(false)}
            onPortfolioItemCreated={handleItemCreated}
          />
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-card rounded-lg border border-border animate-pulse">
                <div className="h-48 bg-secondary"></div>
                <div className="p-4">
                  <div className="h-4 bg-secondary rounded mb-2 w-3/4"></div>
                  <div className="h-3 bg-secondary rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : portfolioItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {portfolioItems.map(item => (
              <div key={item._id} className="bg-card rounded-lg border border-border overflow-hidden group relative">
                <img src={resolveImageUrl(item.images && item.images[0])} alt={item.title} className="h-56 w-full object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-card-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                  <p className="text-foreground mt-2 text-sm">{item.description.substring(0, 100)}...</p>
                </div>
                <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => {/* Handle Edit: Open modal with item data */}}
                        className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                        title="Edit Item"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button
                        onClick={() => handleDelete(item._id)}
                        className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                        title="Delete Item"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-lg border border-border">
            <FiImage className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium text-card-foreground mb-2">Your portfolio is empty</h3>
            <p className="text-muted-foreground mb-4">Showcase your best work by adding items to your portfolio.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Add Your First Item
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagePortfolio;