import React, { useState } from 'react';
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '../utils/constants';

const BookingCard = ({ booking, onStatusUpdate, showActions = true, userRole }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleStatusUpdate = (newStatus) => {
    if (onStatusUpdate) {
      onStatusUpdate(booking._id, { status: newStatus });
    }
  };

  const isCustomer = userRole === 'customer';
  const isProvider = userRole === 'provider';

  const canCancel = isCustomer && (booking.status === 'pending' || booking.status === 'accepted');
  const canAccept = isProvider && booking.status === 'pending';
  const canReject = isProvider && booking.status === 'pending';
  const canStart = isProvider && booking.status === 'accepted';
  const canComplete = isProvider && booking.status === 'in-progress';

  const BookingDetailsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-card p-6 rounded-lg shadow-xl w-full max-w-lg border border-border">
        <div className="flex justify-between items-center border-b border-border pb-3 mb-4">
          <h2 className="text-xl font-bold text-card-foreground">Booking Details</h2>
          <button onClick={() => setIsDetailsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-card-foreground">Service: {booking.service?.title}</h3>
            <p className="text-sm text-muted-foreground">Status:
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${BOOKING_STATUS_COLORS[booking.status]}`}>
                {BOOKING_STATUS_LABELS[booking.status]}
              </span>
            </p>
          </div>

          {isProvider && booking.customer && (
            <div>
              <h4 className="font-semibold text-card-foreground">Customer Information</h4>
              <p className="text-sm text-muted-foreground">Name: {booking.customer.name}</p>
              <p className="text-sm text-muted-foreground">Email: {booking.customer.email}</p>
              <p className="text-sm text-muted-foreground">Phone: {booking.contactPhone}</p>
            </div>
          )}

          {booking.customerAddress && (
            <div>
              <h4 className="font-semibold text-card-foreground">Service Address</h4>
              <p className="text-sm text-muted-foreground">
                {booking.customerAddress.street}, {booking.customerAddress.city}, {booking.customerAddress.state} {booking.customerAddress.zipCode}
              </p>
            </div>
          )}

          {booking.notes && (
            <div>
              <h4 className="font-semibold text-card-foreground">Customer Notes</h4>
              <p className="text-sm text-muted-foreground bg-secondary p-2 rounded-md">{booking.notes}</p>
            </div>
          )}

          {booking.customerImages && booking.customerImages.length > 0 && (
            <div>
              <h4 className="font-semibold text-card-foreground">Uploaded Images</h4>
              <div className="flex flex-wrap gap-2 mt-2">
                {booking.customerImages.map((img, index) => (
                  <a key={index} href={`http://localhost:5000${img}`} target="_blank" rel="noopener noreferrer">
                    <img src={`http://localhost:5000${img}`} alt={`booking-img-${index}`} className="w-24 h-24 object-cover rounded-md border" />
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-border pt-4">
            <h4 className="font-semibold text-card-foreground">Timeline</h4>
            <ul className="text-sm text-muted-foreground list-disc list-inside">
              <li>Created: {formatDate(booking.createdAt)}</li>
              {booking.acceptedAt && <li>Accepted: {formatDate(booking.acceptedAt)}</li>}
              {booking.startedAt && <li>Started: {formatDate(booking.startedAt)}</li>}
              {booking.completedAt && <li>Completed: {formatDate(booking.completedAt)}</li>}
              {booking.cancelledAt && <li>Cancelled: {formatDate(booking.cancelledAt)} by {booking.cancelledBy}</li>}
            </ul>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setIsDetailsModalOpen(false)}
              className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-card rounded-lg border border-border hover:border-primary/50 transition-colors duration-300 overflow-hidden">
      {/* Header */}
      <div className="bg-secondary/50 px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h3 className="text-lg font-semibold text-card-foreground">
              {booking.service?.title}
            </h3>
            <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${BOOKING_STATUS_COLORS[booking.status]}`}>
              {BOOKING_STATUS_LABELS[booking.status]}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            #{booking._id.slice(-8)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Service Details */}
        <div className="mb-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center mb-2">
              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center mr-3">
                {isCustomer && booking.provider?.avatar ? (
                  <img src={`http://localhost:5000${booking.provider.avatar}`} alt={booking.provider.name} className="h-10 w-10 rounded-full object-cover" />
                ) : isProvider && booking.customer?.avatar ? (
                  <img src={`http://localhost:5000${booking.customer.avatar}`} alt={booking.customer.name} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <span className="text-primary font-medium text-lg">
                    {isCustomer ? booking.provider?.name?.charAt(0).toUpperCase() : booking.customer?.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-card-foreground">
                  {isCustomer ? `Provider: ${booking.provider?.name}` : `Customer: ${booking.customer?.name}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isCustomer ? booking.provider?.email : booking.customer?.email}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary">${booking.totalPrice}</p>
              <p className="text-xs text-muted-foreground">Total Price</p>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Scheduled: {formatDate(booking.scheduledDate)}</span>
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span>Payment via: <span className="font-medium capitalize">{booking.paymentMethod}</span></span>
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
             <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Payment Status: <span className="font-medium capitalize">{booking.paymentStatus}</span></span>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsDetailsModalOpen(true)}
              className="px-3 py-1 border border-border text-secondary-foreground text-sm rounded-md hover:bg-secondary transition-colors"
            >
              View Details
            </button>
            {canAccept && (
              <button
                onClick={() => handleStatusUpdate('accepted')}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors"
              >
                Accept
              </button>
            )}
            
            {canReject && (
              <button
                onClick={() => handleStatusUpdate('rejected')}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors"
              >
                Reject
              </button>
            )}
            
            {canStart && (
              <button
                onClick={() => handleStatusUpdate('in-progress')}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
              >
                Start Service
              </button>
            )}
            
            {canComplete && (
              <button
                onClick={() => handleStatusUpdate('completed')}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md transition-colors"
              >
                Complete
              </button>
            )}
            
            {canCancel && (
              <button
                onClick={() => handleStatusUpdate('cancelled')}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-md transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </div>
      {isDetailsModalOpen && <BookingDetailsModal />}
    </div>
  );
};

export default BookingCard;
