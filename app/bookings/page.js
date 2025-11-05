"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "../../context/authLogContext";
import getMyBookings from "../actions/getMyBookings";
import Heading from "../../components/Heading";
import BookedRoomCard from "../../components/BookedRoomCard";
import { Calendar } from "lucide-react"

const BookingsPage = () => {
  const { user, isAuthenticated, authLoading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return; // ✅ Wait for auth state to finish loading

    if (!isAuthenticated || !user?.$id) {
      toast.error("Please log in to view your bookings");
      setTimeout(() => router.push("/login"), 1500);
      return;
    }

    const fetchBookings = async () => {
      try {
        const result = await getMyBookings(user.$id);

        if (Array.isArray(result)) {
          setBookings(result);
        } else if (result.error) {
          toast.error(result.error);
        } else {
          toast.error("Unexpected error loading bookings");
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("Something went wrong while fetching bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, isAuthenticated, authLoading, router]);

  if (authLoading || loading) {
    return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <p className="text-center text-foreground/60">Loading your bookings...</p>
          </div>
    )
  }

  return (
   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Heading title="My Bookings" subtitle="View and manage your reserved spaces" />

      {bookings.length === 0 ? (
        <div className="text-center py-16 bg-background rounded-2xl border border-border">
          <Calendar className="mx-auto mb-4 text-foreground/40" size={40} />
          <p className="text-lg text-foreground/60 mb-4">No bookings yet</p>
          <a href="/rooms" className="text-primary hover:text-primary/90 font-semibold">
            Explore available spaces
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <BookedRoomCard
              key={booking.$id}
              booking={booking}
              onCancel={(bookingId) => {
                setBookings((prev) => prev.filter((b) => b.$id !== bookingId))
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingsPage;
