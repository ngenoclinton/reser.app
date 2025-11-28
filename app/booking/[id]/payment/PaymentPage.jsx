"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronLeft,
  CreditCard,
  Smartphone,
  Banknote,
  Loader,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { Elements } from "@stripe/react-stripe-js";

//--------- Context & Hooks -----------//
import { useBooking } from "@/context/BookingContext";
import { useAuth } from "@/context/authLogContext";

import { stripePromise } from "@/lib/stripe"; // ← Make sure this file exists
import convertToSubcurrency from "@/lib/convertToSubCurrency";

///------------Components ------------------///
import { StripeCheckoutForm } from "@/components/StripeCheckoutForm";
import { MpesaWaiting } from "@/components/MpesaWaiting";

//-------- Payment Page Component ---------//
export default function PaymentPage({ room }) {
  //-------- Context & Router --------//
  const { reviewBookingDraft } = useBooking();
  console.log(reviewBookingDraft); // DEBUG: Check booking draft
  const router = useRouter();
  const params = useParams(); // ← THIS WAS MISSING
  const { user } = useAuth();

  //-------- State --------//
  const roomId = room.$id;

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [mpesaTimer, setMpesaTimer] = useState(0);
  const [bookingId, setBookingId] = useState(null);
  const [showModal, setShowModal] = useState(null);
  // Stripe-specific state
  const [clientSecret, setClientSecret] = useState("");
  const [stripeBookingId, setStripeBookingId] = useState("");

  // THIS IS THE FIX — ADD THIS USEEFFECT
  useEffect(() => {
    if (!reviewBookingDraft) {
      toast.error(
        "Booking details missing. Please select a room and try again."
      );
      router.push(`/booking/${params.id || ""}`); // or `/rooms`
    }
  }, [reviewBookingDraft, router, params?.id]);

  // EARLY RETURN — Prevents crash while redirecting
  if (!reviewBookingDraft) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Redirecting to room selection...</p>
        </div>
      </div>
    );
  }

  //------------- Amount ---------------------//
  const amount = reviewBookingDraft.chargeAmount.toFixed(2);
  const convertedAmount = convertToSubcurrency(reviewBookingDraft.chargeAmount);

  // ── Create Stripe PaymentIntent when card is selected ─────────────────────
  useEffect(() => {
    if (paymentMethod === "card" && !clientSecret) {
      createStripePaymentIntent();
    }
  }, [paymentMethod]); // Added convertedAmount as dependency

  // ── Create Stripe PaymentIntent Function ────────────────────────────────

  const createStripePaymentIntent = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/payments/stripe/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: convertedAmount, // in cents
          currency: "kes",
          metadata: {
            booking_details: JSON.stringify({
              userId: user?.$id,
              roomId: roomId,
              ...reviewBookingDraft,
            }),
          },
        }),
      });

      const data = await res.json();
      console.log("API Response:", data); // ← DEBUG: Check this in console

      if (data.clientSecret && data.bookingId) {
        setClientSecret(data.clientSecret);
        setStripeBookingId(data.bookingId);
      } else {
        toast.error("Failed to load card payment");
      }
    } catch (err) {
      toast.error("Card payment setup failed");
      console.error("Fetch error:", err); // Debug: Log the error
    } finally {
      setLoading(false);
    }
  };
  // --------------------------------------------------- //─────────────

  // ── Shared initiate (for M-Pesa & Cash) ───────────────────────────────────

  const callInitiate = async (method) => {
    const res = await fetch("/api/payments/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user?.$id,
        roomId,
        roomName: reviewBookingDraft.roomName,
        price_per_hour: reviewBookingDraft.roomPrice,
        total_hours: reviewBookingDraft.totalHours,
        checkInDate: reviewBookingDraft.checkInDate,
        checkInTime: reviewBookingDraft.checkInTime,
        checkOutDate: reviewBookingDraft.checkOutDate,
        checkOutTime: reviewBookingDraft.checkOutTime,
        amount: reviewBookingDraft.chargeAmount,
        paymentType: reviewBookingDraft.paymentType,
        paymentMethod: method,
        bookingDetails: {
          bookerName: reviewBookingDraft.bookerName,
          bookerEmail: reviewBookingDraft.bookerEmail,
          bookerPhone: reviewBookingDraft.bookerPhone,
          companyName: reviewBookingDraft.companyName,
          attendeeCount: reviewBookingDraft.attendeeCount,
          specialRequests: reviewBookingDraft.specialRequests,
        },
      }),
    });

    if (!res.ok) throw new Error("Server error");
    return res.json();
  };

  // ── M-Pesa Handler ───────────────────────────────────────────────────────
  const handleMpesa = async () => {
    setLoading(true);
    try {
      const data = await callInitiate("mpesa");
      if (!data.success) throw new Error(data.error || "Failed");

      setBookingId(data.bookingId);
      setPaymentStatus("waiting_pin");
      setMpesaTimer(data.expiresIn || 120);
      toast.success("Payment request sent to your phone");
    } catch (e) {
      toast.error(e.message || "M-Pesa failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Cash Handler ────────────────────────────────────────────────────────
  const handleCash = async () => {
    setLoading(true);
    try {
      const data = await callInitiate("cash");
      if (!data.success) throw new Error("Cash booking failed");

      toast.success("Booking reserved – pay on arrival");
      router.push(
        `/booking/${roomId}/confirmation?bookingId=${data.bookingId}`
      );
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── M-Pesa Polling ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!bookingId || paymentStatus !== "waiting_pin") return;

    let isMounted = true;

    const checkStatus = async () => {
      if (!isMounted) return;

      try {
        const res = await fetch(`/api/payments/status/${bookingId}`);
        const data = await res.json();

        if (data.payment_status === "paid") {
          setShowModal({ type: "success", message: "Payment Successful!" });
          toast.success(`Paid! Receipt: ${data.mpesa_receipt}`);
          setTimeout(() => {
            router.push(
              `/booking/${roomId}/confirmation?bookingId=${bookingId}`
            );
          }, 2000);
        } else if (["failed", "cancelled"].includes(data.payment_status)) {
          setShowModal({
            type: "error",
            message: data.payment_error || "Payment failed or cancelled",
          });
          toast.error("Payment not completed");
          setPaymentStatus(null);
          setMpesaTimer(0);
        }
      } catch (err) {
        console.log("Poll error:", err);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 3000);

    const timeout = setTimeout(() => {
      if (isMounted && paymentStatus === "waiting_pin") {
        fetch(`/api/payments/cancel/${bookingId}`, { method: "POST" });
        setShowModal({ type: "error", message: "Payment timed out" });
        toast.error("Payment timed out");
        setPaymentStatus(null);
        setMpesaTimer(0);
      }
    }, 120000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [bookingId, paymentStatus, roomId, router]);

  // ── Modal ───────────────────────────────────────────────────────────────
  {
    showModal && (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm w-full">
          {showModal.type === "success" ? (
            <>
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-700">
                Payment Successful!
              </h2>
              <p className="mt-2 text-gray-600">{showModal.message}</p>
              <p className="text-sm text-gray-500 mt-4">Redirecting...</p>
            </>
          ) : (
            <>
              <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-700">
                Payment Failed
              </h2>
              <p className="mt-2 text-gray-600">{showModal.message}</p>
              <button
                onClick={() => {
                  setShowModal(null);
                  setPaymentStatus(null);
                  setMpesaTimer(0);
                  setBookingId(null);
                }}
                className="mt-6 px-6 py-2 bg-primary text-white rounded-lg"
              >
                Try Again
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          href={`/booking/${roomId}/details`}
          className="flex items-center gap-2 text-primary mb-6"
        >
          <ChevronLeft size={20} /> Back
        </Link>

        <h1 className="text-4xl font-bold mb-8">Complete Payment</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Methods */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card - Stripe */}
            <div
              className={`p-8 rounded-2xl border-2 cursor-pointer transition ${
                paymentMethod === "card"
                  ? "border-primary bg-primar y/5"
                  : "border-border"
              }`}
              onClick={() => setPaymentMethod("card")}
            >
              <div className="flex items-center gap-4">
                <CreditCard className="text-primary" size={28} />
                <div>
                  <h3 className="font-bold text-xl">Credit / Debit Card</h3>
                  <p className="text-sm text-foreground/60">Visa, Mastercard</p>
                </div>
              </div>

              {paymentMethod === "card" && (
                <div className="mt-6">
                  {paymentMethod === "card" && (
                    <div className="mt-6">
                      {!clientSecret ? (
                        <div className="text-center py-12">
                          <Loader
                            className="animate-spin mx-auto mb-4"
                            size={32}
                          />
                          <p>Loading secure card payment...</p>
                        </div>
                      ) : (
                        <Elements
                          stripe={stripePromise}
                          options={{
                            // mode: "payment",
                            clientSecret,
                            // amount: convertToSubcurrency(amount),
                            // currency: "kes",
                            appearance: { theme: "stripe" },
                          }}
                        >
                          <StripeCheckoutForm
                            amount={amount}
                            roomId={roomId}
                            bookingId={stripeBookingId}
                            userId={user?.$id}
                            bookingData={reviewBookingDraft}
                            clientSecret={clientSecret}
                          />
                        </Elements>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* M-Pesa */}
            <div
              className={`p-8 rounded-2xl border-2 cursor-pointer transition ${
                paymentMethod === "mpesa"
                  ? "border-primary bg-primary/5"
                  : "border-border"
              }`}
              onClick={() => setPaymentMethod("mpesa")}
            >
              <div className="flex items-center gap-4">
                <Smartphone className="text-primary" size={28} />
                <div>
                  <h3 className="font-bold text-xl">M-Pesa (STK Push)</h3>
                  <p className="text-sm text-foreground/60">
                    Instant phone payment
                  </p>
                </div>
              </div>

              {paymentMethod === "mpesa" && paymentStatus === "waiting_pin" && (
                <MpesaWaiting timer={mpesaTimer} amount={amount} />
              )}
            </div>

            {/* Cash */}
            <div
              className={`p-8 rounded-2xl border-2 cursor-pointer transition ${
                paymentMethod === "cash"
                  ? "border-primary bg-primary/5"
                  : "border-border"
              }`}
              onClick={() => setPaymentMethod("cash")}
            >
              <div className="flex items-center gap-4">
                <Banknote className="text-primary" size={28} />
                <div>
                  <h3 className="font-bold text-xl">Pay on Arrival</h3>
                  <p className="text-sm text-foreground/60">
                    Reserve now, pay later
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="sticky top-24 h-fit">
            <div className="bg-white rounded-2xl p-6 shadow-lg border">
              <h3 className="text-2xl font-bold mb-4">Order Summary</h3>
              <div className="flex justify-between mb-6">
                <span className="text-foreground/70">Total Amount</span>
                <span className="font-bold text-xl">KES {amount}</span>
              </div>

              <button
                onClick={() => {
                  if (paymentMethod === "card") return; // handled inside Stripe form
                  if (paymentMethod === "mpesa") handleMpesa();
                  if (paymentMethod === "cash") handleCash();
                }}
                disabled={
                  loading ||
                  paymentStatus === "waiting_pin" ||
                  paymentMethod === "card"
                }
                className="w-full py-4 bg-primary text-white rounded-lg font-bold disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <Loader className="animate-spin" size={20} />}
                {paymentStatus === "waiting_pin"
                  ? "Waiting for PIN..."
                  : paymentMethod === "card"
                  ? "Use card form above ↑"
                  : `Pay KES ${amount}`}
              </button>

              {paymentStatus === "waiting_pin" && (
                <button
                  onClick={async () => {
                    await fetch(`/api/payments/cancel/${bookingId}`, {
                      method: "POST",
                    });
                    setPaymentStatus(null);
                    setMpesaTimer(0);
                    setBookingId(null);
                    toast.info("Cancelled. Choose another method.");
                  }}
                  className="mt-4 w-full text-sm underline text-red-600"
                >
                  Cancel & choose another method
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
