import React, { useState, useEffect } from 'react';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { BOOKING_STATUS, BOOKING_STATUS_LABELS } from '../../utils/constants';
import BookingCard from '../../components/BookingCard';

const CustomerDashboard = () => {
  const { 
    bookings, 
    isLoading, 
    fetchBookings, 
    updateBookingStatus,
    fetchBookingStats 
  } = useBooking();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('all');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchBookings({ limit: 20 });
    fetchBookingStats().then(result => {
      if (result.success) {
        setStats(result.stats);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on component mount to prevent infinite loop

  const handleStatusUpdate = async (bookingId, statusData) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      const result = await updateBookingStatus(bookingId, { status: BOOKING_STATUS.CANCELLED });
      if (result.success) {
        fetchBookings({ limit: 20 }); // Refresh bookings on success
      } else {
        alert(result.error);
      }
    }
  };

  const getFilteredBookings = () => {
    if (activeTab === 'all') return bookings;
    return bookings.filter(booking => booking.status === activeTab);
  };

  const getTabCount = (status) => {
    if (status === 'all') return bookings.length;
    return bookings.filter(booking => booking.status === status).length;
  };

  const tabs = [
    { id: 'all', label: 'All Bookings', count: getTabCount('all') },
    { id: BOOKING_STATUS.PENDING, label: 'Pending', count: getTabCount(BOOKING_STATUS.PENDING) },
    { id: BOOKING_STATUS.ACCEPTED, label: 'Accepted', count: getTabCount(BOOKING_STATUS.ACCEPTED) },
    { id: BOOKING_STATUS.IN_PROGRESS, label: 'In Progress', count: getTabCount(BOOKING_STATUS.IN_PROGRESS) },
    { id: BOOKING_STATUS.COMPLETED, label: 'Completed', count: getTabCount(BOOKING_STATUS.COMPLETED) },
    { id: BOOKING_STATUS.CANCELLED, label: 'Cancelled', count: getTabCount(BOOKING_STATUS.CANCELLED) },
  ];

  const filteredBookings = getFilteredBookings();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Customer Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.name}!</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalBookings}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.stats.find(s => s._id === BOOKING_STATUS.COMPLETED)?.count || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.stats.find(s => s._id === BOOKING_STATUS.PENDING)?.count || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-semibold text-gray-900">${stats.totalRevenue}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <a
              href="/services"
              className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Browse Services
            </a>
            <a
              href="/services"
              className="border border-primary-600 text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-primary-600 hover:text-white transition-colors"
            >
              Book New Service
            </a>
            <a
              href="/profile"
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Edit Profile
            </a>
          </div>
        </div>

        {/* Bookings Section */}
        <div className="bg-white rounded-lg shadow-md">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Bookings Content */}
          <div className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : filteredBookings.length > 0 ? (
              <div className="space-y-6">
                {filteredBookings.map((booking) => (
                  <BookingCard
                    key={booking._id}
                    booking={booking}
                    onStatusUpdate={handleStatusUpdate} // This will now only be used for cancellation
                    userRole={user.role}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📅</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  {activeTab === 'all' ? 'No bookings yet' : `No ${BOOKING_STATUS_LABELS[activeTab].toLowerCase()} bookings`}
                </h3>
                <p className="text-gray-600 mb-4">
                  {activeTab === 'all' 
                    ? 'Start by booking your first service' 
                    : `You don't have any ${BOOKING_STATUS_LABELS[activeTab].toLowerCase()} bookings at the moment`
                  }
                </p>
                {activeTab === 'all' && (
                  <a
                    href="/services"
                    className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                  >
                    Browse Services
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
