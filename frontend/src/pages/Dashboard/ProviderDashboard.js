import React, { useState, useEffect } from 'react';
import { useService } from '../../context/ServiceContext';
import { Link } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { BOOKING_STATUS } from '../../utils/constants';
import ServiceCard from '../../components/ServiceCard';
import { FiCalendar, FiTool } from 'react-icons/fi';
import BookingCard from '../../components/BookingCard';

const ServiceFormModal = ({ serviceToEdit, onClose, onServiceCreated }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState(60);
  const [predefinedServices, setPredefinedServices] = useState([]);
  const { createService, updateService, servicesAPI } = useService();
  const isEditMode = !!serviceToEdit;

  useEffect(() => {
    const fetchPredefinedServices = async () => {
      try {
        const { data } = await servicesAPI.getPredefined();
        if (data && data.data) {
          setPredefinedServices(data.data);
          if (!isEditMode && data.data.length > 0) {
            setTitle(data.data[0]);
            setCategory(data.data[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch predefined services:", error);
      }
    };
    if (servicesAPI) fetchPredefinedServices();

    if (isEditMode) {
      setTitle(serviceToEdit.title);
      setCategory(serviceToEdit.category);
      setDescription(serviceToEdit.description);
      setPrice(serviceToEdit.price);
      setDuration(serviceToEdit.duration);
    }
  }, [servicesAPI, serviceToEdit, isEditMode]);

  const handleTitleChange = (e) => {
    const selectedTitle = e.target.value;
    setTitle(selectedTitle);
    setCategory(selectedTitle);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const serviceData = { title, description, category, price, duration };
    const result = isEditMode 
      ? await updateService(serviceToEdit._id, serviceData)
      : await createService(serviceData);

    if (result.success) {
      onServiceCreated();
    } else {
      alert(result.error || `Failed to ${isEditMode ? 'update' : 'create'} service.`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-card p-8 rounded-lg shadow-xl w-full max-w-md border border-border">
        <h2 className="text-2xl font-bold mb-6 text-card-foreground">{isEditMode ? 'Edit Service' : 'Add New Service'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select value={title} onChange={handleTitleChange} className="w-full p-2 border border-input bg-input rounded" required>
            <option value="" >Select a Service</option>
            {predefinedServices.map(service => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
          <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border border-input bg-input rounded" required />
          <input type="number" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} className="w-full p-2 border border-input bg-input rounded" required />
          <input type="number" placeholder="Duration (in minutes)" value={duration} onChange={e => setDuration(e.target.value)} className="w-full p-2 border border-input bg-input rounded" required />
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded text-secondary-foreground border border-border hover:bg-secondary">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90">
              {isEditMode ? 'Update Service' : 'Create Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProviderDashboard = () => {
  const { 
    services, 
    isLoading: servicesLoading, 
    getMyServices, // Changed from fetchServices
    deleteService
  } = useService();
  
  const { 
    bookings, 
    isLoading: bookingsLoading, 
    fetchBookings, 
    updateBookingStatus,
    fetchBookingStats 
  } = useBooking();
  
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState(null);

  useEffect(() => {
    if (getMyServices) getMyServices({ limit: 20 });
    fetchBookings({ limit: 20 });
    if (fetchBookingStats) {
      fetchBookingStats().then(result => {
        if (result.success) {
          setStats(result.data); // Corrected to use result.data based on bookingController
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleServiceCreated = () => {
    setShowServiceForm(false);
    setEditingService(null);
    // Refresh services list
    if (getMyServices) getMyServices({ limit: 20 });
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setShowServiceForm(true);
  };

  const handleStatusUpdate = async (bookingId, statusData) => {
    const result = await updateBookingStatus(bookingId, statusData);
    if (result.success) {
      // Refresh bookings
      fetchBookings({ limit: 20 });
    } else {
      alert(result.error);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      const result = await deleteService(serviceId);
      if (result.success) {
        if (getMyServices) getMyServices({ limit: 20 });
      } else {
        alert(result.error);
      }
    }
  };

  const getFilteredBookings = () => {
    if (activeTab === 'bookings') return bookings;
    if (activeTab === 'pending') return bookings.filter(b => b.status === BOOKING_STATUS.PENDING);
    if (activeTab === 'in-progress') return bookings.filter(b => b.status === BOOKING_STATUS.IN_PROGRESS);
    return [];
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'services', label: 'My Services' },
    { id: 'bookings', label: 'All Bookings' },
    { id: 'pending', label: 'Pending Requests' },
    { id: 'in-progress', label: 'In Progress' },
  ];

  const filteredBookings = getFilteredBookings();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Provider Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome back, {user?.name}!</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Services</p>
                  <p className="text-2xl font-semibold text-card-foreground">{services.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                  <p className="text-2xl font-semibold text-card-foreground">{stats?.totalBookings || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                  <p className="text-2xl font-semibold text-card-foreground">
                    {stats?.stats?.find(s => s._id === BOOKING_STATUS.PENDING)?.count || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-semibold text-card-foreground">${stats?.totalRevenue || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-card rounded-lg border border-border p-6 mb-8">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => { setEditingService(null); setShowServiceForm(true); }}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Add New Service
            </button>
            <Link
              to="/portfolio/my-portfolio" 
              className="border border-primary text-primary px-4 py-2 rounded-lg font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Manage Portfolio
            </Link>
            <a
              href="/profile"
              className="border border-border text-foreground px-4 py-2 rounded-lg font-medium hover:bg-secondary transition-colors"
            >
              Edit Profile
            </a>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-card rounded-lg border border-border">
          {/* Add/Edit Service Modal */}
          {showServiceForm && (
            <ServiceFormModal
              serviceToEdit={editingService}
              onClose={() => { setShowServiceForm(false); setEditingService(null); }}
              onServiceCreated={handleServiceCreated}
            />
          )}
          {/* Tabs */}
          <div className="border-b border-border">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-4">Recent Bookings</h3>
                  {bookingsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, index) => (
                        <div key={index} className="bg-background rounded-lg p-4 animate-pulse">
                          <div className="h-4 bg-secondary rounded mb-2"></div>
                          <div className="h-3 bg-secondary rounded mb-4"></div>
                          <div className="h-8 bg-secondary rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : bookings.slice(0, 3).length > 0 ? (
                    <div className="space-y-4">
                      {bookings.slice(0, 3).map((booking) => (
                        <BookingCard
                          key={booking._id}
                          booking={booking}
                          onStatusUpdate={handleStatusUpdate}
                          userRole={user.role}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FiCalendar className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No bookings yet</p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-4">My Services</h3>
                  {servicesLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(3)].map((_, index) => (
                        <div key={index} className="bg-background rounded-lg p-4 animate-pulse">
                          <div className="h-32 bg-secondary rounded mb-4"></div>
                          <div className="h-4 bg-secondary rounded mb-2"></div>
                          <div className="h-3 bg-secondary rounded mb-4"></div>
                          <div className="h-8 bg-secondary rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : services.slice(0, 3).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {services.slice(0, 3).map((service) => (
                        <ServiceCard key={service._id} service={service} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FiTool className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground mb-4">No services created yet</p>
                      <button
                        onClick={() => { setEditingService(null); setShowServiceForm(true); }}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                      >
                        Create Your First Service
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-card-foreground">My Services</h3>
                  <button
                    onClick={() => { setEditingService(null); setShowServiceForm(true); }}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Add New Service
                  </button>
                </div>

                {servicesLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, index) => (
                      <div key={index} className="bg-background rounded-lg p-4 animate-pulse">
                        <div className="h-32 bg-secondary rounded mb-4"></div>
                        <div className="h-4 bg-secondary rounded mb-2"></div>
                        <div className="h-3 bg-secondary rounded mb-4"></div>
                        <div className="h-8 bg-secondary rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : services.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service) => (
                      <div key={service._id} className="relative">
                        <ServiceCard service={service} onEdit={handleEditService} onDelete={handleDeleteService} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FiTool className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium text-card-foreground mb-2">No services created yet</h3>
                    <p className="text-muted-foreground mb-4">Start by creating your first service offering</p>
                    <button
                      onClick={() => { setEditingService(null); setShowServiceForm(true); }}
                      className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                    >
                      Create Your First Service
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Bookings Tabs */}
            {(activeTab === 'bookings' || activeTab === 'pending' || activeTab === 'in-progress') && (
              <div>
                <h3 className="text-lg font-semibold text-card-foreground mb-4">
                  {activeTab === 'bookings' ? 'All Bookings' : 
                   activeTab === 'pending' ? 'Pending Requests' : 
                   'In Progress Bookings'}
                </h3>

                {bookingsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="bg-background rounded-lg p-4 animate-pulse">
                        <div className="h-4 bg-secondary rounded mb-2"></div>
                        <div className="h-3 bg-secondary rounded mb-4"></div>
                        <div className="h-8 bg-secondary rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredBookings.length > 0 ? (
                  <div className="space-y-6">
                    {filteredBookings.map((booking) => (
                      <BookingCard
                        key={booking._id}
                        booking={booking}
                        onStatusUpdate={handleStatusUpdate}
                        userRole={user.role}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FiCalendar className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium text-card-foreground mb-2">No bookings found</h3>
                    <p className="text-muted-foreground">
                      {activeTab === 'pending' ? 'No pending booking requests' : 
                       activeTab === 'in-progress' ? 'No services in progress' : 
                       'No bookings yet'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;