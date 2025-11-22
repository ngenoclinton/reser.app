// Placeholder for SMS integration with Africa's Talking or Twilio
// This will be called from API routes when needed

export async function sendSMS(phoneNumber, message) {
  try {
    // Validate phone number format
    const formattedPhone = formatPhoneNumber(phoneNumber)

    if (!formattedPhone) {
      console.error("[v0] Invalid phone number:", phoneNumber)
      return { success: false, error: "Invalid phone number" }
    }

    // In production, integrate with:
    // - Africa's Talking for Kenya (recommended for M-Pesa alignment)
    // - Twilio as alternative

    console.log(`[v0] SMS sent to ${formattedPhone}: ${message}`)

    // Example Africa's Talking integration (uncomment when ready):
    // const response = await fetch('https://api.sandbox.africastalking.com/version1/messaging', {
    //   method: 'POST',
    //   headers: {
    //     'Accept': 'application/json',
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //     'apiKey': process.env.AFRICASTALKING_API_KEY,
    //   },
    //   body: `username=${process.env.AFRICASTALKING_USERNAME}&recipients=${formattedPhone}&message=${message}`,
    // });

    return { success: true, message: "SMS scheduled" }
  } catch (error) {
    console.error("[v0] SMS error:", error)
    return { success: false, error: error.message }
  }
}

function formatPhoneNumber(phone) {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, "")

  // If starts with 0 (Kenya), replace with 254
  if (cleaned.startsWith("0")) {
    return "+" + "254" + cleaned.slice(1)
  }

  // If already has country code
  if (cleaned.startsWith("254")) {
    return "+" + cleaned
  }

  // Default to +254 for Kenya
  return "+254" + cleaned
}
