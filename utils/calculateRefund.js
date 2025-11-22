// Calculate refund amount based on cancellation time and policy
// Policy: 100% if 48+ hours before, 50% if 24-48 hours, no refund within 24 hours

export function calculateRefund(checkInDateTime, cancellationDateTime, totalAmount) {
  const checkIn = new Date(checkInDateTime)
  const cancellation = new Date(cancellationDateTime)

  const hoursUntilCheckIn = (checkIn - cancellation) / (1000 * 60 * 60)

  let refundPercentage = 0
  let refundReason = ""

  if (hoursUntilCheckIn >= 48) {
    refundPercentage = 100
    refundReason = "Full refund (cancelled 48+ hours before)"
  } else if (hoursUntilCheckIn >= 24) {
    refundPercentage = 50
    refundReason = "Partial refund (cancelled 24-48 hours before)"
  } else {
    refundPercentage = 0
    refundReason = "No refund (cancelled within 24 hours)"
  }

  const refundAmount = (totalAmount * refundPercentage) / 100

  return {
    refundAmount: Math.round(refundAmount * 100) / 100,
    refundPercentage,
    refundReason,
    hoursUntilCheckIn: Math.round(hoursUntilCheckIn * 10) / 10,
  }
}
