"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/authLogContext"
import { toast } from "sonner"
import { ChevronLeft, User, Mail, Phone, Building2, MessageSquare, Users } from "lucide-react"
import Link from "next/link"
import { useBooking } from "@/context/BookingContext";

export default function DetailsPage({room}) {
const { reviewBookingDraft, setReviewBookingDraft} = useBooking();
  const router = useRouter()
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    bookerName: user?.name || "",
    bookerEmail: user?.email || "",
    bookerPhone: "",
    companyName: "",
    attendeeCount: 1,
    specialRequests: "",
    termsAccepted: false,
    privacyAccepted: false,
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!reviewBookingDraft) {
      toast.error("Invalid booking data")
      router.push("/rooms")
    }
  }, [reviewBookingDraft, router])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.bookerName.trim()) newErrors.bookerName = "Name is required"
    if (!formData.bookerEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.bookerEmail = "Valid email is required"
    if (!formData.bookerPhone.match(/^\d{10}$/)) newErrors.bookerPhone = "Valid 10-digit phone is required"
    if (formData.attendeeCount < 1) newErrors.attendeeCount = "At least 1 attendee is required"
    if (!formData.termsAccepted) newErrors.termsAccepted = "You must accept terms"
    if (!formData.privacyAccepted) newErrors.privacyAccepted = "You must accept privacy policy"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleProceed = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      const paymentPayloadData = {
        ...reviewBookingDraft,
        bookerName: formData.bookerName,
        bookerEmail: formData.bookerEmail,
        bookerPhone: formData.bookerPhone,
        companyName: formData.companyName,
        attendeeCount: formData.attendeeCount,
        specialRequests: formData.specialRequests,
      }

      setReviewBookingDraft(paymentPayloadData)
    router.push(`/booking/${room.$id}/payment`); 

    //   router.push(`/booking/${roomId}/payment?data=${encodeURIComponent(JSON.stringify(paymentData))}`)
    } catch (error) {
      toast.error("Error proceeding to payment")
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

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Link
          href={`/booking/${room.$id}/review`}
          className="flex items-center gap-2 text-primary hover:text-primary/90 mb-8"
        >
          <ChevronLeft size={20} />
          <span>Back to Review</span>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Booker Information</h1>
          <p className="text-foreground/60">Enter your details for the booking confirmation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <User size={20} />
                Personal Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="bookerName"
                    value={formData.bookerName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.bookerName ? "border-destructive" : "border-border"}`}
                    placeholder="John Doe"
                  />
                  {errors.bookerName && <p className="text-sm text-destructive mt-1">{errors.bookerName}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-1">
                      <Mail size={16} />
                      Email *
                    </label>
                    <input
                      type="email"
                      name="bookerEmail"
                      value={formData.bookerEmail}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.bookerEmail ? "border-destructive" : "border-border"}`}
                      placeholder="john@example.com"
                    />
                    {errors.bookerEmail && <p className="text-sm text-destructive mt-1">{errors.bookerEmail}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-1">
                      <Phone size={16} />
                      Phone *
                    </label>
                    <input
                      type="tel"
                      name="bookerPhone"
                      value={formData.bookerPhone}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.bookerPhone ? "border-destructive" : "border-border"}`}
                      placeholder="7123456789"
                    />
                    {errors.bookerPhone && <p className="text-sm text-destructive mt-1">{errors.bookerPhone}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Business Info */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Building2 size={20} />
                Business Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Company Name (Optional)</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Your Company Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-1">
                    <Users size={16} />
                    Number of Attendees
                  </label>
                  <input
                    type="number"
                    name="attendeeCount"
                    value={formData.attendeeCount}
                    onChange={handleChange}
                    min="1"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.attendeeCount ? "border-destructive" : "border-border"}`}
                  />
                  {errors.attendeeCount && <p className="text-sm text-destructive mt-1">{errors.attendeeCount}</p>}
                </div>
              </div>
            </div>

            {/* Special Requests */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <MessageSquare size={20} />
                Special Requests
              </h2>

              <textarea
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleChange}
                placeholder="E.g., Setup requirements, dietary preferences, etc."
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-24"
              />
            </div>

            {/* Terms & Conditions */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-6">Terms & Policies</h2>

              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleChange}
                    className="w-5 h-5 mt-1"
                  />
                  <span className="text-sm text-foreground/70">
                    I agree to the terms and conditions. I understand the cancellation policy: 100% refund if cancelled
                    48+ hours before, 50% if 24-48 hours, no refund within 24 hours.
                  </span>
                </label>
                {errors.termsAccepted && <p className="text-sm text-destructive">{errors.termsAccepted}</p>}

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="privacyAccepted"
                    checked={formData.privacyAccepted}
                    onChange={handleChange}
                    className="w-5 h-5 mt-1"
                  />
                  <span className="text-sm text-foreground/70">
                    I accept the privacy policy and consent to receiving booking confirmations via SMS/Email (GDPR
                    compliant).
                  </span>
                </label>
                {errors.privacyAccepted && <p className="text-sm text-destructive">{errors.privacyAccepted}</p>}
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="sticky top-24 h-fit">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-border">
              <h3 className="text-2xl font-bold text-foreground mb-6">Booking Summary</h3>

              <div className="space-y-4 mb-6 pb-6 border-b border-border">
                <div>
                  <p className="text-sm text-foreground/60 mb-1">Space</p>
                  <p className="font-bold text-foreground">{reviewBookingDraft.roomName}</p>
                </div>

                <div>
                  <p className="text-sm text-foreground/60 mb-1">Dates</p>
                  <p className="font-bold text-foreground">
                    {reviewBookingDraft.checkInDate} to {reviewBookingDraft.checkOutDate}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-foreground/60 mb-1">Times</p>
                  <p className="font-bold text-foreground">
                    {reviewBookingDraft.checkInTime} - {reviewBookingDraft.checkOutTime}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-foreground/60 mb-1">Total Amount</p>
                  <p className="text-2xl font-bold text-primary">$ {reviewBookingDraft.totalPrice.toFixed(2)}</p>
                </div>

                {reviewBookingDraft.paymentType === "deposit" && (
                  <div>
                    <p className="text-sm text-foreground/60 mb-1">Deposit to Pay (50%)</p>
                    <p className="text-xl font-bold text-accent">$ {reviewBookingDraft.depositPrice.toFixed(2)}</p>
                  </div>
                )}
              </div>

              <button
                onClick={handleProceed}
                disabled={loading}
                className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Continue to Payment"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
