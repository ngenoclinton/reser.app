"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Calendar } from "lucide-react";

import { useAuth } from "../../context/authLogContext";

import getBookingsWithStatus from "@/app/server-actions/getBookingsWithStatus"
import getMyBookings from "../actions/getMyBookings";

import Heading from "../../components/Heading";
// import BookedRoomCard from "../../components/BookedRoomCard";
import ActiveBookingCard from "@/components/ActiveBookingCard";
import PastBookingCard from "@/components/PastBookingCard";
import CancelledBookingCard from "@/components/CancelledBookingCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BookingsPage() {
  const { user, isAuthenticated, authLoading } = useAuth()
  const [bookings, setBookings] = useState({ active: [], past: [], cancelled: [] })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated || !user?.$id) {
      toast.error("Please log in to view your bookings")
      setTimeout(() => router.push("/login"), 500)
      return
    }

    const fetchBookings = async () => {
      try {
        const result = await getBookingsWithStatus(user.$id)
        if (result.error) {
          toast.error(result.error)
        } else {
          setBookings(result)
        }
      } catch (error) {
        console.error("Error:", error)
        toast.error("Something went wrong")
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [user, isAuthenticated, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-center text-foreground/60">Loading your bookings...</p>
      </div>
    )
  }

  const totalBookings = bookings.active.length + bookings.past.length + bookings.cancelled.length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Heading title="My Bookings" subtitle="View and manage your reservations" />

      {totalBookings === 0 ? (
        <div className="text-center py-16 bg-background rounded-2xl border border-border">
          <Calendar className="mx-auto mb-4 text-foreground/40" size={40} />
          <p className="text-lg text-foreground/60 mb-4">No bookings yet</p>
          <a href="/rooms" className="text-primary hover:text-primary/90 font-semibold">
            Explore available spaces
          </a>
        </div>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3 gap-5">
            <TabsTrigger value="active">Active ({bookings.active.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({bookings.past.length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({bookings.cancelled.length})</TabsTrigger>
          </TabsList>

          {/* Active Bookings */}
          <TabsContent value="active" className="space-y-4 mt-6">
            {bookings.active.length > 0 ? (
              bookings.active.map((booking) => (
                <ActiveBookingCard
                  key={booking.$id}
                  booking={booking}
                  onCancel={(bookingId) => {
                    setBookings((prev) => ({
                      ...prev,
                      active: prev.active.filter((b) => b.$id !== bookingId),
                      cancelled: [...prev.cancelled, bookings.active.find((b) => b.$id === bookingId)],
                    }))
                  }}
                />
              ))
            ) : (
              <p className="text-center py-12 text-foreground/60">No active bookings</p>
            )}
          </TabsContent>

          {/* Past Bookings */}
          <TabsContent value="past" className="space-y-4 mt-6">
            {bookings.past.length > 0 ? (
              bookings.past.map((booking) => <PastBookingCard key={booking.$id} booking={booking} />)
            ) : (
              <p className="text-center py-12 text-foreground/60">No past bookings</p>
            )}
          </TabsContent>

          {/* Cancelled Bookings */}
          <TabsContent value="cancelled" className="space-y-4 mt-6">
            {bookings.cancelled.length > 0 ? (
              bookings.cancelled.map((booking) => <CancelledBookingCard key={booking.$id} booking={booking} />)
            ) : (
              <p className="text-center py-12 text-foreground/60">No cancelled bookings</p>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}