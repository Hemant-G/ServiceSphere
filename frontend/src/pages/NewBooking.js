import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useBooking } from '../context/BookingContext';
import { useService } from '../context/ServiceContext';

const NewBooking = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { createBooking } = useBooking();
  const { fetchServiceById } = useService();
  const [service, setService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    const loadService = async () => {
      const result = await fetchServiceById(serviceId);
      if (result.success) {
        setService(result.service);
      }
      setIsLoading(false);
    };
    loadService();
  }, [serviceId, fetchServiceById]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('serviceId', serviceId);
    formData.append('providerId', service.provider._id);
    formData.append('scheduledDate', data.scheduledDate);
    formData.append('contactPhone', data.contactPhone);
    formData.append('customerAddress[street]', data.street);
    formData.append('customerAddress[city]', data.city);
    formData.append('customerAddress[state]', data.state);
    formData.append('customerAddress[zipCode]', data.zipCode);
    formData.append('paymentMethod', data.paymentMethod);
    if (data.notes) {
      formData.append('notes', data.notes);
    }
    if (data.customerImages && data.customerImages.length > 0) {
      Array.from(data.customerImages).forEach(image => {
        formData.append('customerImages', image);
      });
    }

    const result = await createBooking(formData);
    if (result.success) {
      navigate('/dashboard');
    } else {
      alert(result.error || 'Failed to create booking.');
    }
    setIsSubmitting(false);
  };

  if (isLoading) return <div className="text-center py-20 text-muted-foreground">Loading...</div>;
  if (!service) return <div className="text-center py-20 text-muted-foreground">Service not found.</div>;

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-2xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-foreground mb-2">Book: {service.title}</h1>
        <p className="text-muted-foreground mb-6">with {service.provider.name}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-card p-8 rounded-lg border border-border">
          <div>
            <label htmlFor="scheduledDate" className="block text-sm font-medium text-card-foreground">Scheduled Date & Time</label>
            <input type="datetime-local" id="scheduledDate" {...register('scheduledDate', { required: true })} className="mt-1 block w-full bg-input border-border rounded-md shadow-sm" />
            {errors.scheduledDate && <p className="text-destructive text-sm mt-1">This field is required.</p>}
          </div>

          <div>
            <label htmlFor="contactPhone" className="block text-sm font-medium text-card-foreground">Contact Phone</label>
            <input type="tel" id="contactPhone" {...register('contactPhone', { required: true })} className="mt-1 block w-full bg-input border-border rounded-md shadow-sm" />
            {errors.contactPhone && <p className="text-destructive text-sm mt-1">This field is required.</p>}
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-card-foreground">Service Address</legend>
            <input {...register('street', { required: true })} placeholder="Street Address" className="mt-1 block w-full bg-input border-border rounded-md shadow-sm" />
            <input {...register('city', { required: true })} placeholder="City" className="mt-1 block w-full bg-input border-border rounded-md shadow-sm" />
            <input {...register('state', { required: true })} placeholder="State" className="mt-1 block w-full bg-input border-border rounded-md shadow-sm" />
            <input {...register('zipCode', { required: true })} placeholder="ZIP Code" className="mt-1 block w-full bg-input border-border rounded-md shadow-sm" />
          </fieldset>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-card-foreground">Notes (Optional)</label>
            <textarea id="notes" {...register('notes')} rows="3" className="mt-1 block w-full bg-input border-border rounded-md shadow-sm"></textarea>
          </div>

          <div>
            <label htmlFor="customerImages" className="block text-sm font-medium text-card-foreground">Upload Images (Optional)</label>
            <p className="text-xs text-muted-foreground mb-2">Show the provider what needs to be done. (Up to 5 images)</p>
            <input
              type="file"
              id="customerImages"
              {...register('customerImages')}
              multiple
              accept="image/*"
              className="mt-1 block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground">Payment Method</label>
            <div className="mt-2 flex gap-4">
              <label className="flex items-center p-3 border border-border rounded-md cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                <input
                  type="radio"
                  value="cash"
                  {...register('paymentMethod', { required: true })}
                  defaultChecked
                  className="h-4 w-4 text-primary border-input focus:ring-ring"
                />
                <span className="ml-3 text-sm font-medium text-card-foreground">Pay with Cash</span>
              </label>
              <label className="flex items-center p-3 border border-border rounded-md cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                <input type="radio" value="card" {...register('paymentMethod')} className="h-4 w-4 text-primary border-input focus:ring-ring" />
                <span className="ml-3 text-sm font-medium text-card-foreground">Pay with Card (Online)</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Booking...' : `Book Now for $${service.price}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewBooking;