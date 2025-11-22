// Helper functions for formatting data for display

export function formatCurrency(amount) {
  return `KES ${Number.parseFloat(amount).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-KE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function formatTime(timeString) {
  const [hours, minutes] = timeString.split(":")
  const hour = Number.parseInt(hours)
  const ampm = hour >= 12 ? "PM" : "AM"
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

export function formatDuration(hours) {
  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24

  let result = ""
  if (days > 0) result += `${days}d `
  if (remainingHours > 0) result += `${Math.round(remainingHours)}h`

  return result.trim() || "< 1h"
}

export function formatPhoneNumber(phone) {
  const cleaned = phone.replace(/\D/g, "")
  if (cleaned.length === 10) {
    return `+254 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
  }
  return phone
}
