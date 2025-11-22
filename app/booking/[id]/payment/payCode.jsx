
    "use client"

    import { useState, useEffect } from "react"
    import { useRouter, useSearchParams } from "next/navigation"
    import { useAuth } from "@/context/authLogContext"
    import { toast } from "sonner"
    import { ChevronLeft, CreditCard, Smartphone, Banknote, Loader } from "lucide-react"
    import Link from "next/link"
    import { useBooking } from "@/context/BookingContext";

    export default function PaymentCode({room}) {
        const {reviewBookingDraft} = useBooking();
        console.log(reviewBookingDraft); 

    const router = useRouter()
    // const searchParams = useSearchParams()
    const { user } = useAuth()

    // const paymentDataStr = searchParams.get("data")
    // const paymentData = paymentDataStr ? JSON.parse(decodeURIComponent(paymentDataStr)) : null

    const [paymentMethod, setPaymentMethod] = useState("card") // 'card', 'mpesa', 'cash'
    const [loading, setLoading] = useState(false)
    const [paymentStatus, setPaymentStatus] = useState(null) // 'processing', 'waiting_pin', 'success', 'error'
    const [mpesaTimer, setMpesaTimer] = useState(0)

    // Card payment form
    const [cardData, setCardData] = useState({
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        cardName: "",
    })
    const [errors, setErrors] = useState({})

    useEffect(() => {
        if (!reviewBookingDraft) {
        toast.error("Invalid payment data")
        // router.push(`/booking/${room.$id}/details`)
        }
    }, [reviewBookingDraft, router])

    // M-Pesa timer countdown
    useEffect(() => {
        let interval
        if (paymentStatus === "waiting_pin" && mpesaTimer > 0) {
        interval = setInterval(() => {
            setMpesaTimer((prev) => {
            if (prev <= 1) {
                setPaymentStatus("error")
                toast.error("M-Pesa request expired")
                return 0
            }
            return prev - 1
            })
        }, 1000)
        }
        return () => clearInterval(interval)
    }, [paymentStatus, mpesaTimer])

    const validateCardData = () => {
        const newErrors = {}

        if (!cardData.cardNumber.replace(/\s/g, "").match(/^\d{16}$/)) {
        newErrors.cardNumber = "Valid 16-digit card number required"
        }
        if (!cardData.expiryDate.match(/^\d{2}\/\d{2}$/)) {
        newErrors.expiryDate = "Format: MM/YY"
        }
        if (!cardData.cvv.match(/^\d{3,4}$/)) {
        newErrors.cvv = "Valid CVV required"
        }
        if (!cardData.cardName.trim()) {
        newErrors.cardName = "Cardholder name required"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleCardChange = (e) => {
        const { name, value } = e.target
        let formattedValue = value

        if (name === "cardNumber") {
        formattedValue = value
            .replace(/\s/g, "")
            .slice(0, 16)
            .replace(/(\d{4})/g, "$1 ")
            .trim()
        } else if (name === "expiryDate") {
        formattedValue = value.replace(/\D/g, "").slice(0, 4)
        if (formattedValue.length >= 2) {
            formattedValue = formattedValue.slice(0, 2) + "/" + formattedValue.slice(2)
        }
        } else if (name === "cvv") {
        formattedValue = value.replace(/\D/g, "").slice(0, 4)
        }

        setCardData((prev) => ({ ...prev, [name]: formattedValue }))
        if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: null }))
        }
    }

    const handleCardPayment = async () => {
        if (!validateCardData()) return

        setLoading(true)
        setPaymentStatus("processing")

        try {
        const response = await fetch("/api/payments/initiate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            userId: user?.$id,
            roomId:room.$id,

            roomName:reviewBookingDraft.roomName,
            price_per_hour:reviewBookingDraft.roomPrice,
            total_hours: reviewBookingDraft.totalHours,

            checkInDate: reviewBookingDraft.checkInDate,
            checkInTime: reviewBookingDraft.checkInTime,
            checkOutDate: reviewBookingDraft.checkOutDate,
            checkOutTime: reviewBookingDraft.checkOutTime,
            amount: reviewBookingDraft.chargeAmount,
            paymentMethod: "card",
            bookingDetails: {
                bookerName: reviewBookingDraft.bookerName,
                bookerEmail: reviewBookingDraft.bookerEmail,
                bookerPhone: reviewBookingDraft.bookerPhone,
                companyName: reviewBookingDraft.companyName,
                attendeeCount: reviewBookingDraft.attendeeCount,
                specialRequests: reviewBookingDraft.specialRequests,
            },
            }),
        })

        const result = await response.json()

        if (result.success) {
            // In production: integrate with Stripe here
            toast.success("Payment processed successfully");

            router.push(`/booking/${room.$id}/confirmation`)
            // router.push(`/booking/${room.$id}/confirmation?bookingId=${result.bookingId}`)
        } else {
            throw new Error(result.error)
        }
        } catch (error) {
        setPaymentStatus("error")
        toast.error(error.message || "Payment failed")
        } finally {
        setLoading(false)
        }
    }

    const handleMpesaPayment = async () => {
        setLoading(true)
        setPaymentStatus("processing")

        try {
        const response = await fetch("/api/payments/initiate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            userId: user?.$id,
            roomId:room.$id,

            roomName:reviewBookingDraft.roomName,
            price_per_hour:reviewBookingDraft.roomPrice,
            total_hours: reviewBookingDraft.totalHours,
            
            checkInDate: reviewBookingDraft.checkInDate,
            checkInTime: reviewBookingDraft.checkInTime,
            checkOutDate: reviewBookingDraft.checkOutDate,
            checkOutTime: reviewBookingDraft.checkOutTime,

            amount: reviewBookingDraft.chargeAmount,
            
            paymentMethod: "mpesa",
            bookingDetails: {
                bookerName: reviewBookingDraft.bookerName,
                bookerEmail: reviewBookingDraft.bookerEmail,
                bookerPhone: reviewBookingDraft.bookerPhone,
                companyName: reviewBookingDraft.companyName,
                attendeeCount: reviewBookingDraft.attendeeCount,
                specialRequests: reviewBookingDraft.specialRequests,
            },
            }),
        })

        const result = await response.json()

        if (result.success) {
            setPaymentStatus("waiting_pin")
            setMpesaTimer(15 * 60) // 15 minutes
            toast.success("Payment request sent to your phone")
        } else {
            throw new Error(result.error)
        }
        } catch (error) {
        setPaymentStatus("error")
        toast.error(error.message || "M-Pesa initialization failed")
        } finally {
        setLoading(false)
        }
    }

    const handleCashPayment = async () => {
        setLoading(true)
        setPaymentStatus("processing")

        try {
        const response = await fetch("/api/payments/initiate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            userId: user?.$id,
            roomId:room.$id,

            roomName:reviewBookingDraft.roomName,
            price_per_hour:reviewBookingDraft.roomPrice,
            total_hours: reviewBookingDraft.totalHours,            
        
            checkInDate: reviewBookingDraft.checkInDate,
            checkInTime: reviewBookingDraft.checkInTime,
            checkOutDate: reviewBookingDraft.checkOutDate,
            checkOutTime: reviewBookingDraft.checkOutTime,
            amount: reviewBookingDraft.chargeAmount,
            paymentMethod: "cash",
            bookingDetails: {
                bookerName: reviewBookingDraft.bookerName,
                bookerEmail: reviewBookingDraft.bookerEmail,
                bookerPhone: reviewBookingDraft.bookerPhone,
                companyName: reviewBookingDraft.companyName,
                attendeeCount: reviewBookingDraft.attendeeCount,
                specialRequests: reviewBookingDraft.specialRequests,
            },
            }),
        })

        const result = await response.json()

        if (result.success) {
            toast.success("Booking confirmed. Please pay on arrival.")
            router.push(`/booking/${room.$id}/confirmation?bookingId=${result.bookingId}`)
        } else {
            throw new Error(result.error)
        }
        } catch (error) {
        setPaymentStatus("error")
        toast.error(error.message || "Booking failed")
        } finally {
        setLoading(false)
        }
    }

    if (!reviewBookingDraft) {
        return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <p className="text-foreground/60">Loading...</p>
        </div>
        )
    }

    const chargeAmount = reviewBookingDraft.chargeAmount.toFixed(2)
    const isDeposit = reviewBookingDraft.paymentType === "deposit"

    return (
        <div className="min-h-screen bg-background py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            {paymentStatus !== "waiting_pin" && (
            <Link
                href={`/booking/${room.$id}/details`}
                className="flex items-center gap-2 text-primary hover:text-primary/90 mb-8"
            >
                <ChevronLeft size={20} />
                <span>Back to Details</span>
            </Link>
            )}

            <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Payment</h1>
            <p className="text-foreground/60">
                {paymentStatus === "waiting_pin"
                ? "Complete payment on your phone"
                : "Select your preferred payment method"}
            </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Methods */}
            <div className="lg:col-span-2">
                {paymentStatus === "waiting_pin" ? (
                <MpesaWaitingScreen timer={mpesaTimer} amount={chargeAmount} onCancel={() => setPaymentStatus(null)} />
                ) : (
                <div className="space-y-6">
                    {/* Card Payment */}
                    <div
                    className={`bg-white rounded-2xl p-8 shadow-lg border-2 transition cursor-pointer ${
                        paymentMethod === "card" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => {
                        setPaymentMethod("card")
                        setErrors({})
                    }}
                    >
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CreditCard className="text-primary" size={24} />
                        </div>
                        <div className="flex-1">
                        <h3 className="text-xl font-bold text-foreground mb-2">Credit/Debit Card</h3>
                        <p className="text-sm text-foreground/60">Visa, Mastercard, American Express</p>
                        </div>
                    </div>

                    {paymentMethod === "card" && (
                        <div className="mt-6 space-y-4 pt-6 border-t border-border">
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">Cardholder Name</label>
                            <input
                            type="text"
                            name="cardName"
                            value={cardData.cardName}
                            onChange={handleCardChange}
                            placeholder="John Doe"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.cardName ? "border-destructive" : "border-border"}`}
                            />
                            {errors.cardName && <p className="text-sm text-destructive mt-1">{errors.cardName}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">Card Number</label>
                            <input
                            type="text"
                            name="cardNumber"
                            value={cardData.cardNumber}
                            onChange={handleCardChange}
                            placeholder="1234 5678 9012 3456"
                            maxLength="19"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.cardNumber ? "border-destructive" : "border-border"}`}
                            />
                            {errors.cardNumber && <p className="text-sm text-destructive mt-1">{errors.cardNumber}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">Expiry Date</label>
                            <input
                                type="text"
                                name="expiryDate"
                                value={cardData.expiryDate}
                                onChange={handleCardChange}
                                placeholder="MM/YY"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.expiryDate ? "border-destructive" : "border-border"}`}
                            />
                            {errors.expiryDate && <p className="text-sm text-destructive mt-1">{errors.expiryDate}</p>}
                            </div>
                            <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">CVV</label>
                            <input
                                type="text"
                                name="cvv"
                                value={cardData.cvv}
                                onChange={handleCardChange}
                                placeholder="123"
                                maxLength="4"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.cvv ? "border-destructive" : "border-border"}`}
                            />
                            {errors.cvv && <p className="text-sm text-destructive mt-1">{errors.cvv}</p>}
                            </div>
                        </div>
                        </div>
                    )}
                    </div>

                    {/* M-Pesa Payment */}
                    <div
                    className={`bg-white rounded-2xl p-8 shadow-lg border-2 transition cursor-pointer ${
                        paymentMethod === "mpesa" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => {
                        setPaymentMethod("mpesa")
                        setErrors({})
                    }}
                    >
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Smartphone className="text-primary" size={24} />
                        </div>
                        <div className="flex-1">
                        <h3 className="text-xl font-bold text-foreground mb-2">M-Pesa (STK Push)</h3>
                        <p className="text-sm text-foreground/60">Quick and secure mobile payment</p>
                        </div>
                    </div>

                    {paymentMethod === "mpesa" && (
                        <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/20">
                        <p className="text-sm text-foreground/70">
                            A payment request will be sent to <strong>{reviewBookingDraft.bookerPhone}</strong>. You'll have 15
                            minutes to enter your M-Pesa PIN.
                        </p>
                        </div>
                    )}
                    </div>

                    {/* Cash Payment */}
                    <div
                    className={`bg-white rounded-2xl p-8 shadow-lg border-2 transition cursor-pointer ${
                        paymentMethod === "cash" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => {
                        setPaymentMethod("cash")
                        setErrors({})
                    }}
                    >
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Banknote className="text-primary" size={24} />
                        </div>
                        <div className="flex-1">
                        <h3 className="text-xl font-bold text-foreground mb-2">Pay on Arrival</h3>
                        <p className="text-sm text-foreground/60">Pay cash when you arrive at the venue</p>
                        </div>
                    </div>

                    {paymentMethod === "cash" && (
                        <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/20">
                        <p className="text-sm text-foreground/70">
                            Your booking will be reserved. Please arrive on time and pay the full amount in cash. Late
                            arrival may affect your booking.
                        </p>
                        </div>
                    )}
                    </div>
                </div>
                )}
            </div>

            {/* Order Summary */}
            <div className="sticky top-24 h-fit">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-border">
                <h3 className="text-2xl font-bold text-foreground mb-6">Order Summary</h3>

                <div className="space-y-4 mb-6 pb-6 border-b border-border">
                    <div className="flex justify-between">
                    <span className="text-foreground/70">Subtotal</span>
                    <span className="font-semibold text-foreground">KES {reviewBookingDraft.totalPrice.toFixed(2)}</span>
                    </div>

                    {reviewBookingDraft.promo && (
                    <div className="flex justify-between text-green-600 font-semibold">
                        <span>Discount ({reviewBookingDraft.promo.discount}%)</span>
                        <span>-KES {reviewBookingDraft.discountAmount.toFixed(2)}</span>
                    </div>
                    )}

                    <div className="flex justify-between">
                    <span className="text-foreground/70">Taxes & Fees</span>
                    <span className="font-semibold text-foreground">KES 0</span>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="flex justify-between mb-2">
                    <span className="text-foreground/70">Total</span>
                    <span className="text-2xl font-bold text-primary">KES {reviewBookingDraft.totalPrice.toFixed(2)}</span>
                    </div>
                    {isDeposit && (
                    <div className="flex justify-between mt-3 p-3 bg-accent/10 rounded-lg">
                        <span className="text-sm text-foreground/70">Deposit to Pay (50%)</span>
                        <span className="text-lg font-bold text-accent">${chargeAmount}</span>
                    </div>
                    )}
                </div>

                <button
                    onClick={
                    paymentMethod === "card"
                        ? handleCardPayment
                        : paymentMethod === "mpesa"
                        ? handleMpesaPayment
                        : handleCashPayment
                    }
                    disabled={loading || paymentStatus === "waiting_pin"}
                    className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? <Loader size={20} className="animate-spin" /> : null}
                    {paymentStatus === "waiting_pin" ? "Waiting for PIN..." : `Pay KES ${chargeAmount}`}
                </button>

                <p className="text-xs text-foreground/50 text-center mt-3">Your payment is secure and encrypted</p>
                </div>
            </div>
            </div>
        </div>
        </div>
    )
    }

    function MpesaWaitingScreen({ timer, amount, onCancel }) {
    const minutes = Math.floor(timer / 60)
    const seconds = timer % 60

    return (
        <div className="bg-white rounded-2xl p-12 shadow-lg border border-border text-center">
        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Smartphone className="text-primary" size={40} />
        </div>

        <h2 className="text-3xl font-bold text-foreground mb-2">Payment Request Sent</h2>
        <p className="text-foreground/60 mb-8">
            Check your phone and enter your M-Pesa PIN to confirm payment of
            <br />
            <span className="text-2xl font-bold text-primary">KES {amount}</span>
        </p>

        <div className="bg-background p-6 rounded-lg mb-8 border border-border">
            <p className="text-sm text-foreground/60 mb-2">Request expires in</p>
            <p className="text-4xl font-bold text-accent">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </p>
        </div>

        <p className="text-sm text-foreground/70 mb-6">
            Do not share your PIN with anyone. M-Pesa will never ask for your PIN.
        </p>

        <button
            onClick={onCancel}
            className="px-6 py-2 border border-border text-foreground rounded-lg hover:bg-background transition"
        >
            Cancel & Choose Different Method
        </button>
        </div>
    )
    }
