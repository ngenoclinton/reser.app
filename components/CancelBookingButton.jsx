'use client';
import { toast } from 'sonner';
import { useAuth } from '../context/authLogContext';
import cancelBooking from '../app/actions/cancelBooking';
import { useRouter } from 'next/navigation';

const CancelBookingButton = ({ bookingId }) => {
  const { user,  isAuthenticated} = useAuth();
  const router = useRouter();

  const handleCancelClick = async () => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to cancel a booking');
      return;
    }

    const confirmed = confirm('Are you sure you want to cancel this booking?');
    if (!confirmed) return;

    try {
      const result = await cancelBooking(bookingId, user.$id);

      if (result.success) {
        toast.success('Booking cancelled successfully!');
        router.refresh(); // ✅ Refresh bookings list
      } else {
        toast.error(result.error || 'Failed to cancel booking.');
      }
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      toast.error('Something went wrong while cancelling booking.');
    }
  };

  return (
    <button
      onClick={handleCancelClick}
      className="bg-red-500 text-white px-4 py-2 rounded w-full sm:w-auto text-center hover:bg-red-700"
    >
      Cancel Booking
    </button>
  );
};

export default CancelBookingButton;
