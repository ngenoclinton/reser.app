// Calculate booking price based on room rate and duration

export function calculatePrice(pricePerHour, checkInDate, checkInTime, checkOutDate, checkOutTime) {
  const checkIn = new Date(`${checkInDate}T${checkInTime}`)
  const checkOut = new Date(`${checkOutDate}T${checkOutTime}`)

  const durationHours = (checkOut - checkIn) / (1000 * 60 * 60)

  if (durationHours < 0) {
    throw new Error("Check-out time must be after check-in time")
  }

  const basePrice = pricePerHour * durationHours
  const depositPrice = basePrice * 0.5

  return {
    basePrice: Math.round(basePrice * 100) / 100,
    depositPrice: Math.round(depositPrice * 100) / 100,
    durationHours: Math.round(durationHours * 10) / 10,
  }
}

export function applyDiscount(price, discountPercentage) {
  if (discountPercentage < 0 || discountPercentage > 100) {
    throw new Error("Discount must be between 0 and 100")
  }

  const discountAmount = (price * discountPercentage) / 100
  const finalPrice = price - discountAmount

  return {
    discountAmount: Math.round(discountAmount * 100) / 100,
    finalPrice: Math.round(finalPrice * 100) / 100,
  }
}
