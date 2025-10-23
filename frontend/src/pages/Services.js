import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useService } from '../context/ServiceContext';
import { SERVICE_CATEGORIES } from '../utils/constants';
import ServiceCard from '../components/ServiceCard';
import { FiSearch } from 'react-icons/fi';

const Services = () => {
  const { 
    services, 
    isLoading, 
    fetchServices, 
    setCategory, 
    setSearchQuery, 
    clearFilters,
    pagination = { total: 0, pages: 0, page: 1 }
  } = useService();

  const locationUrl = useLocation();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [rating, setRating] = useState(''); 
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    // This effect handles filter initialization from URL and fetches services on load or URL change.
    const queryParams = new URLSearchParams(locationUrl.search);
    const page = queryParams.get('page') || 1;
    const limit = queryParams.get('limit') || 12;
    const category = (queryParams.get('category') || '').toLowerCase();
    const search = queryParams.get('search') || '';
    const minPrice = queryParams.get('minPrice') || '';
    const maxPrice = queryParams.get('maxPrice') || '';
    const ratingParam = queryParams.get('rating') || '';
    const locationParam = queryParams.get('location') || '';
    const sort = queryParams.get('sort') || 'createdAt';
    const order = queryParams.get('order') || 'desc';

    // Update local state from URL
    setSelectedCategory(category);
    setSearchTerm(search);
    setPriceRange({ min: minPrice, max: maxPrice });
    setRating(ratingParam);
    setLocationFilter(locationParam);
    setSortBy(sort);
    setSortOrder(order);

    // Update context state for consistency
    setCategory(category);
    setSearchQuery(search);

    // Fetch services using parameters from the URL
    const fetchParams = Object.fromEntries(queryParams.entries());
    fetchServices({ page, limit, ...fetchParams });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationUrl.search, fetchServices, setCategory, setSearchQuery]);

  // Handle changes for non-URL filters
  const handleFilterChange = (setter, value) => {
    setter(value);
  };
  
  // Handle category change (triggers URL update and then useEffect)
  const handleCategoryChange = (categoryValue) => {
    const standardizedCategory = categoryValue.toLowerCase();
    const newSearchParams = new URLSearchParams(locationUrl.search);

    if (standardizedCategory === 'all' || !standardizedCategory) {
      newSearchParams.delete('category');
    } else {
      newSearchParams.set('category', standardizedCategory);
    }
    newSearchParams.set('page', '1'); // Reset to first page on category change
    
    // The navigate call will trigger the main useEffect to re-fetch with new params.
    navigate({
      search: newSearchParams.toString()
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchTerm); // Set search query in context

    // Use current local state for all filters (including the standardized selectedCategory)
    fetchServices({
      page: 1,
      limit: 12,
      search: searchTerm,
      category: selectedCategory, // This is already standardized by useEffect
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      rating,
      location: locationFilter,
      sort: sortBy,
      order: sortOrder
    });
  };

  const handleApplyFilters = () => {
    // Apply filters and re-fetch services
    fetchServices({
      page: 1,
      limit: 12,
      search: searchTerm,
      category: selectedCategory,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      rating,
      location: locationFilter,
      sort: sortBy,
      order: sortOrder
    });
  };

  const handleClearFilters = () => {
    // Clear URL category
    navigate({ search: '' });

    // Clear context state
    clearFilters(); 
    setSearchQuery('');
    
    // Clear local state
    setSearchTerm('');
    setSelectedCategory('');
    setPriceRange({ min: '', max: '' });
    setRating('');
    setLocationFilter('');
    setSortBy('createdAt');
    setSortOrder('desc');

    // Fetch all services
    fetchServices({ page: 1, limit: 12 });
  };

  const handleSortChange = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
    
    // Fetch with new sort params and existing filters
    fetchServices({
      page: 1,
      limit: 12,
      search: searchTerm,
      category: selectedCategory,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      rating,
      location: locationFilter,
      sort: field,
      order: order
    });
  };
  
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      // Fetch with new page and existing filters
      fetchServices({
        page: newPage,
        limit: 12,
        search: searchTerm,
        category: selectedCategory,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
        rating,
        location: locationFilter,
        sort: sortBy,
        order: sortOrder
      });
    }
  };

  const totalPages = pagination.pages || 0;
  const currentPage = pagination.page || 1;
  const displayedPages = [];

  // Logic for displaying page numbers (e.g., 1, 2, ..., 10, 11)
  if (totalPages > 0) {
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        displayedPages.push(i);
      }
    } else {
      displayedPages.push(1);
      if (currentPage > 3) displayedPages.push('...');
      if (currentPage > 2 && currentPage < totalPages - 1) displayedPages.push(currentPage);
      if (currentPage < totalPages - 2) displayedPages.push('...');
      if (currentPage < totalPages) displayedPages.push(totalPages);
    }
  }


  return (
    <div className="min-h-screen bg-background py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Service Marketplace</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-1/4">
            <div className="bg-card rounded-lg border border-border p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-card-foreground mb-4 border-b border-border pb-2">Filters</h2>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-card-foreground mb-2">Category</h3>
                <ul className="space-y-2">
                  <li 
                    className={`cursor-pointer text-sm p-2 rounded-md transition-colors ${selectedCategory === '' ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-muted'}`}
                    onClick={() => handleCategoryChange('')}
                  >
                    All Categories
                  </li>
                  {SERVICE_CATEGORIES.map(category => (
                    <li
                      key={category.value}
                      className={`cursor-pointer text-sm p-2 rounded-md transition-colors ${selectedCategory === category.value.toLowerCase() ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-muted'}`}
                      onClick={() => handleCategoryChange(category.value)}
                    >
                      {category.label}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6 border-t border-border pt-4">
                <h3 className="font-medium text-card-foreground mb-2">Price Range (USD)</h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => handleFilterChange(setPriceRange, { ...priceRange, min: e.target.value })}
                    className="w-1/2 p-2 bg-input border border-border rounded-md text-sm focus:ring-ring focus:border-primary"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => handleFilterChange(setPriceRange, { ...priceRange, max: e.target.value })}
                    className="w-1/2 p-2 bg-input border border-border rounded-md text-sm focus:ring-ring focus:border-primary"
                  />
                </div>
              </div>

              {/* Rating Filter (Example) */}
              <div className="mb-6 border-t border-border pt-4">
                <h3 className="font-medium text-card-foreground mb-2">Minimum Rating</h3>
                <select
                  value={rating}
                  onChange={(e) => handleFilterChange(setRating, e.target.value)}
                  className="w-full p-2 bg-input border border-border rounded-md text-sm focus:ring-ring focus:border-primary"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4 Stars & Up</option>
                  <option value="3">3 Stars & Up</option>
                  <option value="2">2 Stars & Up</option>
                </select>
              </div>

              {/* Location Filter (Example) */}
              <div className="mb-6 border-t border-border pt-4">
                <h3 className="font-medium text-card-foreground mb-2">Location (City/Zip)</h3>
                <input
                  type="text"
                  placeholder="e.g., New York, 10001"
                  value={locationFilter}
                  onChange={(e) => handleFilterChange(setLocationFilter, e.target.value)}
                  className="w-full p-2 bg-input border border-border rounded-md text-sm focus:ring-ring focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-3 border-t border-border pt-4">
                <button
                  onClick={handleApplyFilters}
                  className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md font-semibold hover:bg-primary/90 transition-colors"
                >
                  Apply Filters
                </button>
                <button
                  onClick={handleClearFilters}
                  className="w-full bg-secondary text-secondary-foreground px-4 py-2 rounded-md font-semibold hover:bg-secondary/80 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content (Services List) */}
          <div className="lg:w-3/4">
            {/* Search Bar and Sort */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-card p-4 rounded-lg border border-border mb-6">
              <form onSubmit={handleSearch} className="flex flex-grow w-full sm:w-auto mb-4 sm:mb-0 sm:mr-4">
                <input
                  type="text"
                  placeholder="Search services, providers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-grow p-3 bg-input border border-border rounded-l-md focus:ring-ring focus:border-primary"
                />
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground px-4 rounded-r-md hover:bg-primary/90 transition-colors"
                >
                  Search
                </button>
              </form>

              {/* Sort Dropdown */}
              <div className="flex items-center w-full sm:w-auto">
                <label htmlFor="sort" className="text-sm font-medium text-muted-foreground mr-2 min-w-max">
                  Sort By:
                </label>
                <select
                  id="sort"
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    handleSortChange(field, order);
                  }}
                  className="p-3 bg-input border border-border rounded-md text-sm focus:ring-ring focus:border-primary"
                >
                  <option value="createdAt-desc">Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating-desc">Rating: High to Low</option>
                </select>
              </div>
            </div>

            {/* Results and Loading */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-primary font-medium">Loading services...</p>
              </div>
            ) : services && services.length > 0 ? (
              <>
                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map(service => (
                    <ServiceCard key={service._id} service={service} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-10 flex justify-center">
                    <nav className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="px-3 py-2 text-sm font-medium text-muted-foreground bg-card border border-border rounded-md hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      {displayedPages.map((page) => {
                        if (typeof page === 'number') {
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                page === currentPage
                                  ? 'bg-primary text-primary-foreground'
                                  : 'text-foreground bg-card border border-border hover:bg-secondary'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (
                          page === '...' &&
                          (displayedPages.indexOf(page) === 1 ||
                            displayedPages.indexOf(page) === displayedPages.length - 2)
                        ) { 
                          return <span key={page} className="px-2 text-muted-foreground">...</span>;
                        }
                        return null;
                      })}
                      
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                        className="px-3 py-2 text-sm font-medium text-muted-foreground bg-card border border-border rounded-md hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-card border border-border rounded-lg">
                <FiSearch className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium text-card-foreground mb-2">No services found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your search criteria</p>
                <button
                  onClick={handleClearFilters}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;