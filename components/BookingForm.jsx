'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useEffectEvent } from 'react';
import { useActionState } from "react";
import { toast } from "sonner"
import bookRoom from '../app/actions/bookRoom';
import { useAuth } from '../context/authLogContext';
import { Calendar, Clock } from "lucide-react"

const BookingForm = ({ room }) => {
  const router = useRouter();
  const [state, formAction] = useActionState(bookRoom, {});
  const { user, isAuthenticated } = useAuth();

    // ✅ Redirect unauthenticated users safely
  useEffectEvent(() => {
    if (!isAuthenticated) {
      toast.error('Please log in to book a room.');
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // ✅ Handle booking state updates
  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) {
      toast.success('Room booked Successfully');
      router.push('/bookings');
    }
  }, [state]);

const handleSubmit = async (formData) => {
    formData.set("room_id", room.$id)
    formData.set("user_id", user?.$id || "")
    formData.set("room_name", room.room_name)
  await formAction(formData);
};

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm text-foreground/60 mb-2">Price per hour</p>
        <p className="text-3xl font-bold text-primary">${room.price_per_hour}</p>
      </div>

      <form action={handleSubmit} className="space-y-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
            <Calendar size={18} />
            Check-In Date
          </label>
          <input
            type="date"
            name="check_in_date"
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
            <Clock size={18} />
            Check-In Time
          </label>
          <input
            type="time"
            name="check_in_time"
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
            <Calendar size={18} />
            Check-Out Date
          </label>
          <input
            type="date"
            name="check_out_date"
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
            <Clock size={18} />
            Check-Out Time
          </label>
          <input
            type="time"
            name="check_out_time"
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition"
        >
          Book Now
        </button>
        <p className="text-xs text-foreground/50 text-center">You won't be charged until confirmed</p>
      </form>
    </div>
  );
};

export default BookingForm;