"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuth } from "@/context/authLogContext"
import getMyRooms from "@/app/actions/getMyRooms"
import getBookingsWithStatus from "@/app/server-actions/getBookingsWithStatus"
import Heading from "@/components/Heading"
import DashboardStats from "@/components/DashboardStats"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const { user, isAuthenticated, authLoading } = useAuth()
  const [rooms, setRooms] = useState([])
  const [bookings, setBookings] = useState({ active: [], past: [], cancelled: [] })
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated || !user?.$id) {
      toast.error("Please log in to access your dashboard")
      setTimeout(() => router.push("/login"), 1500)
      return
    }

    const fetchData = async () => {
      try {
        const myRooms = await getMyRooms()
        setRooms(myRooms)

        const bookingsData = await getBookingsWithStatus(user.$id)
        setBookings(bookingsData)

        // Calculate stats
        const totalBookings = bookingsData.active.length + bookingsData.past.length
        const revenue = bookingsData.past.reduce((sum, b) => sum + (b.total_amount || 0), 0)
        const pendingPayments = bookingsData.active.filter((b) => b.status === "pending_deposit").length

        setStats({
          totalRooms: myRooms.length,
          totalBookings,
          totalRevenue: revenue,
          pendingPayments,
          activeBookings: bookingsData.active.length,
          pastBookings: bookingsData.past.length,
        })
      } catch (error) {
        console.error("Error:", error)
        toast.error("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, isAuthenticated, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-center text-foreground/60">Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Heading title="Host Dashboard" subtitle="Manage your rooms and bookings" />

      {/* Stats Overview */}
      <DashboardStats stats={stats} />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Button
          onClick={() => router.push("/rooms/add")}
          className="bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-semibold"
        >
          + Add New Room
        </Button>
        <Button variant="outline" onClick={() => router.push("/rooms/my")} className="py-6 text-lg font-semibold">
          Manage Rooms ({stats.totalRooms})
        </Button>
      </div>

      {/* Pending Payments Alert */}
      {stats.pendingPayments > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <p className="text-yellow-800 font-semibold">
            {stats.pendingPayments} booking(s) awaiting 50% deposit payment
          </p>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-lg font-bold mb-4 text-foreground">Recent Bookings</h3>
          {bookings.active.length > 0 ? (
            <div className="space-y-3">
              {bookings.active.slice(0, 5).map((booking) => (
                <div
                  key={booking.$id}
                  className="flex justify-between items-start pb-3 border-b border-border last:border-b-0"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{booking.room_name}</p>
                    <p className="text-sm text-foreground/60">{new Date(booking.check_in).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">${booking.total_amount?.toFixed(2)}</p>
                    <p className="text-xs text-foreground/60">{booking.status}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-foreground/60 text-sm">No active bookings</p>
          )}
        </div>

        {/* Your Rooms */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-lg font-bold mb-4 text-foreground">Your Rooms</h3>
          {rooms.length > 0 ? (
            <div className="space-y-3">
              {rooms.slice(0, 5).map((room) => (
                <div
                  key={room.$id}
                  className="flex justify-between items-start pb-3 border-b border-border last:border-b-0"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{room.name}</p>
                    <p className="text-sm text-foreground/60">
                      {room.capacity} people • ${room.price_per_hour}/hr
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-foreground/60 text-sm">No rooms listed yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
