"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle, Download, Calendar, Phone, Mail, Users, Banknote } from "lucide-react"
import Link from "next/link"

export default function ConfirmationPage({ params }) {
  const searchParams = useSearchParams()
  const roomId = params.roomId
  const bookingId = searchParams.get("bookingId")

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        // Fetch booking details from API or database
        const response = await fetch(`/api/bookings/${bookingId}`)
        if (response.ok) {
          const data = await response.json()
          setBooking(data)
        }
      } catch (error) {
        console.error("Error fetching booking:", error)
      } finally {
        setLoading(false)
      }
    }

    if (bookingId) {
      fetchBooking()
    }
  }, [bookingId])

  const handleDownloadReceipt = () => {
    // Generate and download receipt PDF
    const receiptContent = `
      BOOKING CONFIRMATION RECEIPT
      ============================
      Booking ID: ${bookingId}
      Date: ${new Date().toLocaleDateString()}
      
      Thank you for your booking!
    `

    const element = document.createElement("a")
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(receiptContent))
    element.setAttribute("download", `receipt-${bookingId}.txt`)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleExportCalendar = () => {
    // Generate iCal format for calendar export
    const icalContent = `
      BEGIN:VCALENDAR
      VERSION:2.0
      PRODID:-//Reser//Space Booking//EN
      BEGIN:VEVENT
      UID:${bookingId}@reser.app
      DTSTAMP:${new Date().toISOString()}
      SUMMARY:Space Booking - ${booking?.roomName || "Conference Room"}
      DTSTART:${new Date(booking?.checkInDate).toISOString()}
      DTEND:${new Date(booking?.checkOutDate).toISOString()}
      END:VEVENT
      END:VCALENDAR
    `

    const element = document.createElement("a")
    element.setAttribute("href", "data:text/calendar;charset=utf-8," + encodeURIComponent(icalContent))
    element.setAttribute("download", `booking-${bookingId}.ics`)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground/60">Loading confirmation...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Banner */}
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center mb-12">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-foreground mb-2">Booking Confirmed!</h1>
          <p className="text-xl text-foreground/60 mb-4">
            Your space reservation is secured. A confirmation email has been sent to your registered email address.
          </p>
          <p className="text-lg font-semibold text-green-600">Booking ID: {bookingId}</p>
        </div>

        {/* Booking Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Space Details */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">Space Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-foreground/60 mb-1">Space Name</p>
                  <p className="text-lg font-bold text-foreground">Conference Room A</p>
                </div>
                <div>
                  <p className="text-sm text-foreground/60 mb-1">Location</p>
                  <p className="text-lg font-bold text-foreground">123 Business Plaza, Downtown</p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <p className="text-sm text-foreground/60 mb-1">Check-In</p>
                    <p className="font-bold text-foreground">2024-12-15</p>
                    <p className="text-sm text-foreground/70">09:00 AM</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/60 mb-1">Check-Out</p>
                    <p className="font-bold text-foreground">2024-12-15</p>
                    <p className="text-sm text-foreground/70">05:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Booker Details */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">Booker Information</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Users size={18} className="text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-foreground/60">Name</p>
                    <p className="font-semibold text-foreground">John Doe</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-foreground/60">Email</p>
                    <p className="font-semibold text-foreground">john@example.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-foreground/60">Phone</p>
                    <p className="font-semibold text-foreground">+254 712 345 678</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Payment Details */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Banknote size={20} />
                Payment Details
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-foreground/70">Base Price</span>
                  <span className="font-semibold text-foreground">KES 4,800</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-foreground/70">Discount</span>
                  <span className="font-semibold text-green-600">-KES 0</span>
                </div>
                <div className="flex justify-between py-3 bg-background px-3 rounded-lg">
                  <span className="font-bold text-foreground">Total Amount</span>
                  <span className="text-2xl font-bold text-primary">KES 4,800</span>
                </div>
                <div className="bg-accent/10 p-3 rounded-lg">
                  <p className="text-sm text-foreground/70">
                    <span className="font-bold">Payment Status:</span>{" "}
                    <span className="text-green-600 font-semibold">Paid</span>
                  </p>
                  <p className="text-xs text-foreground/60 mt-1">Payment Method: M-Pesa</p>
                </div>
              </div>
            </div>

            {/* Important Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <h3 className="font-bold text-foreground mb-3">Important Information</h3>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li>• Save your booking ID for reference</li>
                <li>• Cancellation policy: 100% refund if cancelled 48+ hours before</li>
                <li>• Late arrivals may affect your booking</li>
                <li>• Contact support for any changes</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <button
            onClick={handleDownloadReceipt}
            className="py-3 px-4 bg-white border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary/5 transition flex items-center justify-center gap-2"
          >
            <Download size={20} />
            Download Receipt
          </button>
          <button
            onClick={handleExportCalendar}
            className="py-3 px-4 bg-white border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary/5 transition flex items-center justify-center gap-2"
          >
            <Calendar size={20} />
            Add to Calendar
          </button>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-border mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">What's Next?</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-bold text-foreground">Check Your Email</p>
                <p className="text-sm text-foreground/60">
                  You'll receive a confirmation email with access instructions and details about your reserved space.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-bold text-foreground">Arrive on Time</p>
                <p className="text-sm text-foreground/60">
                  Please arrive 10 minutes before your check-in time. Bring your confirmation email or booking ID.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-bold text-foreground">Enjoy Your Event</p>
                <p className="text-sm text-foreground/60">
                  Set up your event and make the most of your reserved space. Contact support if you need assistance.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/bookings"
            className="flex-1 py-3 px-6 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition text-center"
          >
            View All Bookings
          </Link>
          <Link
            href="/rooms"
            className="flex-1 py-3 px-6 bg-white border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary/5 transition text-center"
          >
            Book Another Space
          </Link>
        </div>
      </div>
    </div>
  )
}
