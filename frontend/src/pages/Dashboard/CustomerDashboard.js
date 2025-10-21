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
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Customer Dashboard</h1>
          <p className="text-gray-400 mt-2">Welcome back, {user?.name}!</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
              <div className="flex items-center">
                <div className="p-3 bg-blue-900/50 rounded-lg">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Bookings</p>
                  <p className="text-2xl font-semibold text-white">{stats.totalBookings}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
              <div className="flex items-center">
                <div className="p-3 bg-green-900/50 rounded-lg">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Completed</p>
                  <p className="text-2xl font-semibold text-white">
                    {stats.stats.find(s => s._id === BOOKING_STATUS.COMPLETED)?.count || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-900/50 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Pending</p>
                  <p className="text-2xl font-semibold text-white">
                    {stats.stats.find(s => s._id === BOOKING_STATUS.PENDING)?.count || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
              <div className="flex items-center">
                <div className="p-3 bg-purple-900/50 rounded-lg">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Spent</p>
                  <p className="text-2xl font-semibold text-white">${stats.totalRevenue}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <a
              href="/services"
              className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Browse Services
            </a>
            <a
              href="/profile"
              className="border border-gray-600 text-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-700 hover:text-white transition-colors"
            >
              Edit Profile
            </a>
          </div>
        </div>

        {/* Bookings Section */}
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-400'
                      : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'bg-gray-700 text-gray-300'
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
                  <div key={index} className="bg-gray-700/50 rounded-lg p-4 animate-pulse">
                    <div className="h-4 bg-gray-600 rounded mb-2 w-3/4"></div>
                    <div className="h-3 bg-gray-600 rounded mb-4 w-1/2"></div>
                    <div className="h-8 bg-gray-600 rounded w-1/4"></div>
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
                <h3 className="text-xl font-medium text-white mb-2">
                  {activeTab === 'all' ? 'No bookings yet' : `No ${BOOKING_STATUS_LABELS[activeTab].toLowerCase()} bookings`}
                </h3>
                <p className="text-gray-400 mb-4">
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
