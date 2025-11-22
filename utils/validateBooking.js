// Validate booking data and detect conflicts

export function validateBookingData(bookingData) {
  const errors = []

  // Check dates
  const checkIn = new Date(bookingData.checkInDate)
  const checkOut = new Date(bookingData.checkOutDate)

  if (isNaN(checkIn.getTime())) errors.push("Invalid check-in date")
  if (isNaN(checkOut.getTime())) errors.push("Invalid check-out date")

  if (checkIn >= checkOut) {
    errors.push("Check-out date must be after check-in date")
  }

  if (checkIn < new Date()) {
    errors.push("Check-in date cannot be in the past")
  }

  // Check times
  if (!bookingData.checkInTime.match(/^\d{2}:\d{2}$/)) {
    errors.push("Invalid check-in time format")
  }

  if (!bookingData.checkOutTime.match(/^\d{2}:\d{2}$/)) {
    errors.push("Invalid check-out time format")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function checkDateConflict(bookedDates, checkInDate, checkOutDate) {
  const start = new Date(checkInDate)
  const end = new Date(checkOutDate)

  const conflictingBookings = bookedDates.filter((booking) => {
    const bookingStart = new Date(booking.check_in_date)
    const bookingEnd = new Date(booking.check_out_date)

    // Check if ranges overlap
    return start < bookingEnd && end > bookingStart
  })

  return {
    hasConflict: conflictingBookings.length > 0,
    conflictingBookings,
  }
}
