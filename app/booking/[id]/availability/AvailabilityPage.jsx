"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"

import getBookedDatesForRoom from "@/app/server-actions/getBookedDatesForRoom"

import { useBookingContext } from "@/hooks/useBookingContext"
import { useAuth } from "@/context/authLogContext";
import { useBooking } from "@/context/BookingContext";

export default function AvailabilityPage({room}) {
  const { setDraftBooking } = useBooking();

  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { bookingData, updateBookingData } = useBookingContext()

  const [bookedDates, setBookedDates] = useState([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [dateConflict, setDateConflict] = useState(false)

  const [checkInDate, setCheckInDate] = useState("")
  const [checkOutDate, setCheckOutDate] = useState("")
  const [checkInTime, setCheckInTime] = useState("09:00")
  const [checkOutTime, setCheckOutTime] = useState("17:00")
  const [totalHours, setTotalHours] = useState(0)
  const [depositAmount, setDepositAmount] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please log in to check availability")
      router.push("/login")
      return
    }

    const fetchData = async () => {
      try {
       
        const bookedData = await getBookedDatesForRoom(room.$id); 

        if (bookedData) setBookedDates(bookedData)

        // Restore persisted booking data
        if (bookingData && bookingData.room.$id === room.$id) {
          setCheckInDate(bookingData.checkInDate || "")
          setCheckOutDate(bookingData.checkOutDate || "")
          setCheckInTime(bookingData.checkInTime || "09:00")
          setCheckOutTime(bookingData.checkOutTime || "17:00")
        }
      } catch (err) {
        toast.error("Error loading room data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [room.$id, isAuthenticated, router])

  useEffect(() => {
    if (!checkInDate || !checkOutDate || !room) return

    const checkIn = new Date(`${checkInDate}T${checkInTime}`)
    const checkOut = new Date(`${checkOutDate}T${checkOutTime}`)

    if (checkOut <= checkIn) {
      setTotalHours(0)
      setDepositAmount(0)
      setTotalAmount(0)
      setDateConflict(false)
      return
    }

    const msInDay = 1000 * 60 * 60 * 24
    const msInHour = 1000 * 60 * 60

    const days = Math.ceil((checkOut - checkIn) / msInDay)
    const hoursPerDay = (new Date(`1970-01-01T${checkOutTime}`) - new Date(`1970-01-01T${checkInTime}`)) / msInHour

    const calculatedTotalHours = hoursPerDay * days
    const calculatedTotalAmount = calculatedTotalHours * room.price_per_hour
    const calculatedDeposit = calculatedTotalAmount * 0.5

    setTotalHours(calculatedTotalHours)
    setDepositAmount(calculatedDeposit)
    setTotalAmount(calculatedTotalAmount)

    const hasConflict = bookedDates.some((booked) => {
      const bookedCheckIn = new Date(booked.checkIn)
      const bookedCheckOut = new Date(booked.checkOut)
      return (
        (checkIn >= bookedCheckIn && checkIn < bookedCheckOut) ||
        (checkOut > bookedCheckIn && checkOut <= bookedCheckOut) ||
        (checkIn <= bookedCheckIn && checkOut >= bookedCheckOut)
      )
    })

    setDateConflict(hasConflict)
  }, [checkInDate, checkOutDate, checkInTime, checkOutTime, room, bookedDates])

  const isDateBooked = (date) => {
    return bookedDates.some((booking) => {
      const bookingStart = new Date(booking.checkIn)
      const bookingEnd = new Date(booking.checkOut)
      return date >= bookingStart && date <= bookingEnd
    })
  }

  const isDateAvailable = (date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date >= today && !isDateBooked(date)
  }

  const handleDateSelect = (date) => {
    if (!isDateAvailable(date)) {
      toast.error("This date is not available")
      return
    }

    const dateStr = date.toISOString().split("T")[0]

    if (!checkInDate) {
      setCheckInDate(dateStr)
    } else if (!checkOutDate) {
      if (new Date(dateStr) < new Date(checkInDate)) {
        setCheckInDate(dateStr)
        setCheckOutDate(checkInDate)
      } else {
        setCheckOutDate(dateStr)
      }
    } else {
      setCheckInDate(dateStr)
      setCheckOutDate("")
    }
  }

  const handleProceed = () => {
    if (!checkInDate || !checkOutDate) {
      toast.error("Please select both check-in and check-out dates")
      return
    }

    if (dateConflict) {
      toast.error("Selected dates conflict with existing bookings")
      return
    }

    const bookingPayload = {
      roomId: room.$id,
      roomName: room.room_name,
      roomPrice: room.price_per_hour,
      checkInDate,
      checkOutDate,
      checkInTime,
      checkOutTime,
      totalHours,
      totalAmount,
      depositAmount,
    }

    updateBookingData(bookingPayload)
    
    setDraftBooking(bookingPayload); 
    
    router.push(`/booking/${room.$id}/review`);
    // router.push(`/booking/${room.$id}/review?data=${encodeURIComponent(JSON.stringify(bookingPayload))}`);

  }

  const renderCalendarMonth = (monthOffset) => {
    const month = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + monthOffset)
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay()

    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(month.getFullYear(), month.getMonth(), i))
    }

    return { month, days }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-300 border-t-orange-600 mb-4"></div>
          <p className="text-gray-600">Loading availability...</p>
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Room not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => router.push(`/rooms/${room.$id}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition font-semibold"
          >
            <ChevronLeft size={24} />
            Back
          </button>
          <div className="text-center flex-1">
            <h1 className="text-5xl font-serif text-gray-800 mb-2">Check Availability</h1>
            <p className="text-lg text-orange-600 font-medium">{room.room_name}</p>
            <p className="text-sm text-gray-600 mt-2">Capacity: {room.capacity} people</p>
          </div>
          <div className="w-24"></div> {/* Spacer for alignment */}
        </div>

        {/* Calendar Section */}
        <div className="bg-white border-4 border-gray-800 rounded-lg p-8 mb-8 shadow-xl">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6 bg-gray-800 text-white p-4 rounded">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-2 hover:bg-gray-700 rounded transition"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex items-center gap-4">
              <select
                value={currentMonth.getMonth()}
                onChange={(e) => setCurrentMonth(new Date(currentMonth.getFullYear(), Number.parseInt(e.target.value)))}
                className="bg-gray-700 text-white px-3 py-1 rounded"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i} value={i}>
                    {new Date(2024, i).toLocaleDateString("en-US", { month: "long" })}
                  </option>
                ))}
              </select>
              <select
                value={currentMonth.getFullYear()}
                onChange={(e) => setCurrentMonth(new Date(Number.parseInt(e.target.value), currentMonth.getMonth()))}
                className="bg-gray-700 text-white px-3 py-1 rounded"
              >
                {Array.from({ length: 5 }).map((_, i) => {
                  const year = new Date().getFullYear() + i
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  )
                })}
              </select>
            </div>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-2 hover:bg-gray-700 rounded transition"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* 3-Month Calendar Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[0, 1, 2].map((offset) => {
              const { month, days } = renderCalendarMonth(offset)

              return (
                <div key={offset} className="text-center">
                  <h3 className="text-gray-800 font-semibold text-lg mb-4">
                    {month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </h3>

                  {/* Day Headers */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
                      <div key={day} className="text-xs font-bold text-gray-600 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-1">
                    {days.map((date, idx) => {
                      if (!date) {
                        return <div key={`empty-${idx}`} className="p-2" />
                      }

                      const isBooked = isDateBooked(date)
                      const isAvailable = isDateAvailable(date)
                      const dateStr = date.toISOString().split("T")[0]
                      const isSelected =
                        checkInDate === dateStr ||
                        checkOutDate === dateStr ||
                        (checkInDate && checkOutDate && date >= new Date(checkInDate) && date <= new Date(checkOutDate))
                      const isStart = checkInDate === dateStr
                      const isEnd = checkOutDate === dateStr

                      return (
                        <button
                          key={dateStr}
                          onClick={() => handleDateSelect(date)}
                          disabled={isBooked || !isAvailable}
                          className={`p-2 rounded text-sm font-semibold transition ${
                            isBooked
                              ? "bg-red-200 text-red-700 cursor-not-allowed"
                              : isEnd
                                ? "bg-green-300 text-green-800"
                                : isStart || isSelected
                                  ? "bg-green-200 text-green-800"
                                  : isAvailable
                                    ? "bg-green-100 text-gray-800 hover:bg-green-200"
                                    : "text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          {date.getDate()}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="border-t border-gray-200 mt-6 pt-4 flex gap-6 flex-wrap justify-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-200 rounded"></div>
              <span className="text-gray-700">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-200 rounded"></div>
              <span className="text-gray-700">Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-300 rounded"></div>
              <span className="text-gray-700">Selected</span>
            </div>
          </div>
        </div>

        {/* Selection Form Section */}
        <div className="bg-white border-4 border-gray-800 rounded-lg p-8 mb-8 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            {/* Check-in Date */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">Check-in Date</label>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:outline-none focus:border-orange-600"
              />
            </div>

            {/* Check-in Time */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">Check-in Time</label>
              <input
                type="time"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:outline-none focus:border-orange-600"
              />
            </div>

            {/* Check-out Date */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">Check-out Date</label>
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:outline-none focus:border-orange-600"
              />
            </div>

            {/* Check-out Time */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">Check-out Time</label>
              <input
                type="time"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:outline-none focus:border-orange-600"
              />
            </div>
          </div>

          {checkInDate && checkOutDate && (
            <div className="mt-6 p-4 bg-gray-50 rounded border border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">Room Capacity</p>
                  <p className="text-xl font-bold text-gray-800">{room.capacity} people</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Hours</p>
                  <p className="text-xl font-bold text-gray-800">{totalHours.toFixed(1)} hrs</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-xl font-bold text-orange-600">${totalAmount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">50% Deposit</p>
                  <p className="text-xl font-bold text-green-600">${depositAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pricing Summary (Sticky) */}
        {checkInDate && checkOutDate && (
          <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
              <div>
                <p className="text-sm opacity-75">Total for your stay</p>
                <p className="text-2xl font-bold">${totalAmount.toFixed(2)}</p>
                <p className="text-sm opacity-75">50% Deposit: ${depositAmount.toFixed(2)}</p>
              </div>
              <button
                onClick={handleProceed}
                disabled={dateConflict}
                className="px-8 py-3 bg-orange-600 text-white font-bold rounded hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to Review
              </button>
            </div>
          </div>
        )}

        {dateConflict && (
          <div className="fixed bottom-0 left-0 right-0 bg-red-600 text-white p-4 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3">
              <AlertCircle size={24} />
              <p className="font-semibold">
                These dates conflict with existing bookings. Please select different dates.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
