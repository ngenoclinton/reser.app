"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { ChevronLeft, Percent, Users } from "lucide-react"
import Link from "next/link"
import { useBooking } from "@/context/BookingContext";

export default function ReviewPage({ room}) {
  const { draftBooking, setReviewBookingDraft } = useBooking();
    console.log(draftBooking);

  const router = useRouter()
  const searchParams = useSearchParams() 

  // const bookingDataStr = searchParams.get("data")
  // const bookingData = bookingDataStr ? JSON.parse(decodeURIComponent(bookingDataStr)) : null

  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [paymentType, setPaymentType] = useState("deposit") // 'deposit' or 'full'


  if (!draftBooking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground/60">Invalid booking data</p>
      </div>
    )
  }

  // const calculateDuration = () => {
  //   const start = new Date(draftBooking.checkInDate)
  //   const end = new Date(draftBooking.checkOutDate)
  //   const timeDiff = Math.abs(end - start)
  //   const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))

  //   const checkInHour = Number.parseInt(draftBooking.checkInTime.split(":")[0])
  //   const checkOutHour = Number.parseInt(draftBooking.checkOutTime.split(":")[0])
  //   const hoursPerDay = checkOutHour - checkInHour

  //   return { days: daysDiff, hoursPerDay }
  // }

  const calculatePrice = () => {
    if (!room) return { basePrice: 0, discount: 0, totalPrice: 0, depositPrice: 0 }
    // const { days } = calculateDuration()
    const basePrice = room.price_per_hour * draftBooking.totalHours
    const discountAmount = Number((basePrice * discount) / 100)
    const totalPrice = Number(basePrice - discountAmount)
    const depositPrice = Number(totalPrice * 0.5)

    return { basePrice, discountAmount, totalPrice, depositPrice }
  }

  const handleApplyPromo = () => {
    // Mock promo codes validation
    const promoCodes = {
      FIRST10: 10,
      CORP20: 20,
      WEEKEND15: 15,
    }

    if (promoCodes[promoCode.toUpperCase()]) {
      setDiscount(promoCodes[promoCode.toUpperCase()])
      toast.success(`${discount}% discount applied!`)
    } else {
      toast.error("Invalid promo code")
    }
  }

  const handleProceed = () => {
    if (!room) {
      toast.error("Room data not loaded")
      return
    }

    const price = calculatePrice()
    const chargeAmount = paymentType === "deposit" ? price.depositPrice : price.totalPrice;
    const depositPaid = paymentType === "deposit" ? price.depositPrice : 0;
   
    const reviewDraftPayload = {
      ...draftBooking,
      roomId:room.$id,
      roomName: room.room_name,
      chargeAmount,
      paymentType,
      promo: discount > 0 ? { code: promoCode, discount } : null,
      ...price,
    }
 
    setReviewBookingDraft(reviewDraftPayload); 
    router.push(`/booking/${room.$id}/details`);
    // router.push(`/booking/${roomId}/details?data=${encodeURIComponent(JSON.stringify(summaryData))}`)
  }

//   if (!room) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-background">
//         <p className="text-foreground/60">Loading...</p>
//       </div>
//     )
//   }

  const price = calculatePrice()

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Link
          href={`/booking/${room.$id}/availability`}
          className="flex items-center gap-2 text-primary hover:text-primary/90 mb-8"
        >
          <ChevronLeft size={20} />
          <span>Back to Availability</span>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Review Your Booking</h1>
          <p className="text-foreground/60">Confirm details and apply any discounts</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Space Details */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">Space Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-foreground/70">Space Name</span>
                  <span className="font-semibold text-foreground">{room.room_name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-foreground/70">Check-In</span>
                  <span className="font-semibold text-foreground">
                    {draftBooking.checkInDate} @ {draftBooking.checkInTime}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-foreground/70">Check-Out</span>
                  <span className="font-semibold text-foreground">
                    {draftBooking.checkOutDate} @ {draftBooking.checkOutTime}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-foreground/70">Capacity</span>
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <Users size={16} />
                    {room.capacity || "Unlimited"}
                  </span>
                </div>
              </div>
            </div>

            {/* Promo Code */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Percent size={20} />
                Apply Promo Code
              </h2>
              <p className="text-sm text-foreground/60 mb-4">Sample codes: FIRST10, CORP20, WEEKEND15</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="Enter promo code"
                  className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={handleApplyPromo}
                  className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition"
                >
                  Apply
                </button>
              </div>
              {discount > 0 && (
                <p className="mt-3 text-sm text-green-600 font-semibold">✓ {discount}% discount applied</p>
              )}
            </div>

            {/* Payment Type Selection */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">Payment Option</h2>
              <div className="space-y-3">
                <label
                  className="flex items-center p-4 border-2 border-border rounded-lg cursor-pointer hover:bg-background transition"
                  style={{ borderColor: paymentType === "deposit" ? "var(--primary)" : "var(--border)" }}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="deposit"
                    checked={paymentType === "deposit"}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className="w-4 h-4"
                  />
                  <div className="ml-4">
                    <p className="font-semibold text-foreground">Pay 50% Deposit Now</p>
                    <p className="text-sm text-foreground/60">Reserve the space, pay balance on arrival</p>
                    <p className="text-lg font-bold text-primary mt-1">$ {draftBooking.depositAmount.toFixed(2)}</p>
                  </div>
                </label>

                <label
                  className="flex items-center p-4 border-2 border-border rounded-lg cursor-pointer hover:bg-background transition"
                  style={{ borderColor: paymentType === "full" ? "var(--primary)" : "var(--border)" }}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="full"
                    checked={paymentType === "full"}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className="w-4 h-4"
                  />
                  <div className="ml-4">
                    <p className="font-semibold text-foreground">Pay Full Amount Now</p>
                    <p className="text-sm text-foreground/60">Complete payment and get instant confirmation</p>
                    <p className="text-lg font-bold text-primary mt-1">$ {draftBooking.totalAmount.toFixed(2)}</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="sticky top-24 h-fit">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-6">Price Summary</h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-border">
                <div className="flex justify-between text-foreground/70">
                  <span>Base Price</span>
                  <span>$ {price.basePrice.toFixed(2)}</span>
                </div>

                {price.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Discount ({discount}%)</span>
                    <span>-$ {price.discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="text-sm text-foreground/60">
                  <p>Taxes & Fees: $ 0</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="text-2xl font-bold text-primary">$ {price.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-foreground/60">
                    {paymentType === "deposit" ? "Pay Now (50%)" : "Pay Now"}
                  </span>
                  <span className="text-xl font-bold text-accent">
                    $ {(paymentType === "deposit" ? price.depositPrice : price.totalPrice).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleProceed}
                className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition mb-3"
              >
                Continue to Details
              </button>

              <p className="text-xs text-foreground/50 text-center">
                By proceeding, you agree to our terms and cancellation policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
