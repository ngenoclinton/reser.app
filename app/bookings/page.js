"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "../../context/authLogContext";
import getMyBookings from "../actions/getMyBookings";
import Heading from "../../components/Heading";
import BookedRoomCard from "../../components/BookedRoomCard";

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
    return <p className="text-gray-600 mt-4">Loading your bookings...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Heading title="My Bookings" />
      {bookings.length === 0 ? (
        <p className="text-gray-600 mt-4">You have no bookings yet.</p>
      ) : (
        bookings.map((booking) => (
          <BookedRoomCard
            key={booking.$id}
            booking={booking}
            onCancel={(bookingId) => {
              setBookings((prev) => prev.filter((b) => b.$id !== bookingId));
            }}
          />
        ))
      )}
    </div>
  );
};

export default BookingsPage;
