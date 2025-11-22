"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authLogContext";
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
import { useBooking } from "@/context/BookingContext";
import MyRoomsPage from "@/app/rooms/my/page";
import DashboardPage from "@/app/dashboard/page";
import Rooms from "@/app/rooms/page";

export default function PaymentPage({ room }) {
  const { reviewBookingDraft } = useBooking();
  const router = useRouter();
  const { user } = useAuth();

  const roomId = room.$id; // ← correct way in app dir
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [mpesaTimer, setMpesaTimer] = useState(0);
  // / In your PaymentPage component
  const [showModal, setShowModal] = useState(null);
  const [bookingId, setBookingId] = useState(null);
  // ── Card form ─────────────────────────────────────
  const [cardData, setCardData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
  });
  const [errors, setErrors] = useState({});

  // ── M-Pesa countdown ─────────────────────────────
  useEffect(() => {
    if (paymentStatus !== "waiting_pin" || mpesaTimer <= 0) return;
    const id = setInterval(() => setMpesaTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [paymentStatus, mpesaTimer]);

  // ── Validation ───────────────────────────────────
  const validateCard = () => {
    const e = {};
    if (!cardData.cardNumber.replace(/\s/g, "").match(/^\d{16}$/))
      e.cardNumber = "16-digit card number required";
    if (!cardData.expiryDate.match(/^\d{2}\/\d{2}$/)) e.expiryDate = "MM/YY";
    if (!cardData.cvv.match(/^\d{3,4}$/)) e.cvv = "CVV required";
    if (!cardData.cardName.trim()) e.cardName = "Cardholder name required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    let v = value;

    if (name === "cardNumber")
      v = value
        .replace(/\s/g, "")
        .slice(0, 16)
        .replace(/(\d{4})/g, "$1 ")
        .trim();
    else if (name === "expiryDate")
      v = value
        .replace(/\D/g, "")
        .slice(0, 4)
        .replace(/^(\d{2})/, "$1/");
    else if (name === "cvv") v = value.replace(/\D/g, "").slice(0, 4);

    setCardData((p) => ({ ...p, [name]: v }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  // ── API call (shared) ─────────────────────────────
  const callInitiate = async (method) => {
    const res = await fetch("/api/payments/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user?.$id,
        roomId: roomId,

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

    if (!res.ok) {
      const txt = await res.text();
      console.error("API error →", txt);
      throw new Error("Server error");
    }
    return res.json();
  };

  // ── Handlers ─────────────────────────────────────
  //   const handleCard = async () => {
  //     if (!validateCard()) return;
  //     setLoading(true);
  //     setPaymentStatus("processing");
  //     try {
  //       const { success, bookingId } = await callInitiate("card");
  //       if (!success) throw new Error("Card init failed");
  //       toast.success("Card ready – redirect to Paystack");
  //       // For real card flow you would now redirect to Paystack URL
  //       router.push(`/booking/${roomId}/confirmation?bookingId=${bookingId}`);
  //     } catch (e) {
  //       toast.error(e.message);
  //     } finally {
  //       setLoading(false);
  //       setPaymentStatus(null);
  //     }
  //   };
  const handleCard = async () => {
    if (!validateCard()) return;
    setLoading(true);
    try {
      const data = await callInitiate("card");
      if (!data.success) throw new Error("Failed");
      window.location.href = data.authorization_url; // ← Redirect
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  //   const handleMpesa = async () => {
  //     setLoading(true);
  //     setPaymentStatus("processing");
  //     try {
  //       const { success, bookingId } = await callInitiate("mpesa");
  //       if (!success) throw new Error("M-Pesa init failed");
  //       setPaymentStatus("waiting_pin");
  //       setMpesaTimer(15 * 60);
  //       toast.success("Check your phone for STK push");
  //     } catch (e) {
  //       toast.error(e.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  const handleMpesa = async () => {
    setLoading(true);
    try {
      const data = await callInitiate("mpesa");

      if (!data.success) throw new Error(data.error || "Failed");

      // window.location.href = data.authorization_url; // ← Also redirects to Paystack
      setBookingId(data.bookingId);
      setPaymentStatus("waiting_pin");
      setMpesaTimer(data.expiresIn); // 2 min
      toast.success("Payment request sent to your phone");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCash = async () => {
    setLoading(true);
    try {
      const { success, bookingId } = await callInitiate("cash");
      if (!success) throw new Error("Cash booking failed");
      toast.success("Booking reserved – pay on arrival");
      router.push(`/booking/${roomId}/confirmation?bookingId=${bookingId}`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Polling Fallback: In client, poll /api/bookings/[id] every 10s during "waiting_pin" to check status.
  // Poll every 3s when waiting
  //   useEffect(() => {
  //   if (!bookingId || paymentStatus !== "waiting_pin") return;

  //   let hasShownPendingError = false;

  //   const interval = setInterval(async () => {
  //     try {
  //       const res = await fetch(`/api/payments/status/${bookingId}`);
  //       if (!res.ok) return;

  //     const data = await res.json();
  //     console.log("STATUS:", data);

  //       const status = await res.json();
  //       console.log("Polled status:", status);

  //       // SUCCESS
  //       if (status.payment_status === "paid") {
  //         clearInterval(interval);
  //         setShowModal({ type: "success", message: "Payment successful!" });
  //         toast.success("Payment confirmed!");
  //         setTimeout(() => router.push(`/booking/${roomId}/confirmation?bookingId=${bookingId}`), 3000);
  //       }

  //       // FAILURE — only show after 15 seconds (give Safaricom time)
  //       if (status.payment_status === "failed" && mpesaTimer < 135) { // 150 - 15 = 135
  //         clearInterval(interval);
  //         const msg = status.error_message?.includes("cancelled") || status.error_type === "cancelled"
  //           ? "Payment cancelled by user."
  //           : status.error_message?.includes("timeout") || status.error_type === "timeout"
  //           ? "Payment timed out."
  //           : status.error_message?.includes("insufficient") || status.error_type === "insufficient_funds"
  //           ? "Insufficient funds."
  //           : "Payment failed.";

  //         setShowModal({ type: "error", message: msg });
  //         toast.error("Payment failed");
  //         setTimeout(() => {
  //           setShowModal(null);
  //           setPaymentStatus(null);
  //           setMpesaTimer(0);
  //         }, 5000);
  //       }

  //       // Optional: show "still waiting" after 30s
  //       if (mpesaTimer < 120 && !hasShownPendingError) {
  //         hasShownPendingError = true;
  //         toast("Still waiting for payment... Check your phone!", { duration: 5000 });
  //       }

  //     } catch (err) {
  //       console.log("Polling error:", err);
  //     }
  //   }, 3000);

  //   return () => clearInterval(interval);
  // }, [bookingId, paymentStatus, roomId, router, mpesaTimer]);

  useEffect(() => {
    if (!bookingId || paymentStatus !== "waiting_pin") return;

    let isMounted = true;
    let pollCount = 0;

    console.log("STARTING POLLING FOR BOOKING:", bookingId);

    const checkStatus = async () => {
      if (!isMounted) return;
      pollCount++;

      try {
        const res = await fetch(`/api/payments/status/${bookingId}`);
        const data = await res.json();

        console.log("POLL RESULT:", data);
        if (!data.success) {
          // Even if API error, keep polling
          return;
        }

        // SUCCESS
        if (data.payment_status === "paid") {
          setShowModal({ type: "success", message: "Payment Successful!" });
          toast.success(`Paid! Receipt: ${data.mpesa_receipt}`);
          setPaymentStatus("success");
          setTimeout(() => {
            router.push(
              `/booking/${roomId}/confirmation?bookingId=${bookingId}`
            );
          }, 2000);

          return;
        }

        // FAILED (wrong PIN, cancelled by user on phone)
        if ( data.payment_status === "failed" || data.payment_status === "cancelled" ) {
          setShowModal({
            type: "error",
            message: data.payment_error || "Payment failed or cancelled",
          });
          toast.error("Payment not completed");
          setPaymentStatus(null);
          setMpesaTimer(0);
          return;
        }
      } catch (err) {
        console.log("Poll failed, retrying...");
      }
    };

    // Check immediately, then every 2 seconds
    checkStatus();
    const interval = setInterval(checkStatus, 2000);

    // Stop after 3 minutes
    // const timeout = setTimeout(() => {
    //   clearInterval(interval);
    //   setShowModal({ type: "error", message: "Payment timed out" });
    //   setPaymentStatus(null);
    // }, 180000);
    // TIMEOUT AFTER 2 MINUTES (120 seconds)
    const timeout = setTimeout(() => {
      if (isMounted && paymentStatus === "waiting_pin") {
        // Mark as cancelled due to timeout
        fetch(`/api/payments/cancel/${bookingId}`, { method: "POST" });
        setShowModal({
          type: "error",
          message: "Payment timed out. Please try again.",
        });
        toast.error("Payment timed out");
        setPaymentStatus(null);
        setMpesaTimer(0);
      }
    }, 120000); // 2 minutes

    return () => {
      isMounted = false;
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [bookingId, paymentStatus, roomId, router]);

  // Inside PaymentPage component — replace the old useEffect
  // useEffect(() => {
  //   if (!bookingId || paymentStatus !== "waiting_pin") return;

  //   const evtSource = new EventSource(`/api/payments/stream/${bookingId}`);

  //   evtSource.onmessage = (event) => {
  //     if (event.data === "PING") return;

  //     const data = JSON.parse(event.data);

  //     if (data.type === "SUCCESS") {
  //       evtSource.close();
  //       clearInterval(timerInterval); // if you have one
  //       setShowModal({ type: "success", message: "Payment confirmed instantly!" });
  //       toast.success(`Paid! Receipt: ${data.receipt}`);
  //       setTimeout(() => {
  //         router.push(`/booking/${roomId}/confirmation?bookingId=${bookingId}`);
  //       }, 3000);
  //     }
  //   };

  //   evtSource.onerror = () => {
  //     evtSource.close();
  //     // Optional: fallback to polling after 30s
  //   };

  //   return () => evtSource.close();
  // }, [bookingId, paymentStatus, roomId, router]);

  // ──  Optional: Add Polling for Confirmation───────────────────────────────────────────
  // ── In MpesaWaitingScreen:
  //   useEffect(() => {
  //   if (paymentStatus !== "waiting_pin") return;
  //   const poll = setInterval(async () => {

  //     const res = await fetch(`/api/bookings/${bookingId}`);
  //     const data = await res.json();

  //     if (data.payment_status === "paid") {
  //       setPaymentStatus("success");
  //       toast.success("Payment confirmed!");
  //       router.push(`/booking/${roomId}/confirmation?bookingId=${bookingId}`);
  //     }

  //   }, 10000);  // Poll every 10s
  //   return () => clearInterval(poll);
  // }, []);

  // {showModal && (
  //     <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
  //       <div className="bg-white rounded-2xl p-10 text-center shadow-2xl max-w-sm w-full animate-in fade-in zoom-in duration-300">
  //         {showModal.type === "success" ? (
  //           <>
  //             <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
  //               <CheckCircle className="w-12 h-12 text-green-600" />
  //             </div>
  //             <h2 className="text-2xl font-bold text-green-700">
  //               Payment Successful!
  //             </h2>
  //           </>
  //         ) : (
  //           <>
  //             <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
  //               <XCircle className="w-12 h-12 text-red-600" />
  //             </div>
  //             <h2 className="text-2xl font-bold text-red-700">
  //               Payment Failed
  //             </h2>
  //           </>
  //         )}
  //         <p className="mt-4 text-gray-600">{showModal.message}</p>
  //         {showModal.type === "success" && (
  //           <p className="text-sm text-gray-500 mt-3">Redirecting...</p>
  //         )}
  //       </div>
  //     </div>
  //   );
  // }

  {
    showModal && (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm mx-4">
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
              <p>{showModal.message}</p>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── UI ───────────────────────────────────────────
  if (!reviewBookingDraft)
    return (
      <div className="p-8">
        <Rooms />
      </div>
    );

  const amount = reviewBookingDraft.chargeAmount.toFixed(2);

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          href={`/booking/${roomId}/details`}
          className="flex items-center gap-2 text-primary mb-6"
        >
          <ChevronLeft size={20} /> Back
        </Link>

        <h1 className="text-4xl font-bold mb-2">Payment</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ── Methods ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card */}
            <div
              className={`p-8 rounded-2xl border-2 cursor-pointer transition ${
                paymentMethod === "card"
                  ? "border-primary bg-primary/5"
                  : "border-border"
              }`}
              onClick={() => setPaymentMethod("card")}
            >
              <div className="flex items-center gap-4">
                <CreditCard className="text-primary" size={28} />
                <div>
                  <h3 className="font-bold text-xl">Credit / Debit Card</h3>
                  <p className="text-sm text-foreground/60">
                    Visa, Mastercard, Amex
                  </p>
                </div>
              </div>

              {paymentMethod === "card" && (
                <div className="mt-6 space-y-4">
                  {/* Card form – same as your original */}
                  <input
                    name="cardName"
                    placeholder="Name on card"
                    value={cardData.cardName}
                    onChange={handleCardChange}
                    className="w-full border p-2 rounded"
                  />
                  {errors.cardName && (
                    <p className="text-destructive">{errors.cardName}</p>
                  )}

                  <input
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardData.cardNumber}
                    onChange={handleCardChange}
                    className="w-full border p-2 rounded"
                  />
                  {errors.cardNumber && (
                    <p className="text-destructive">{errors.cardNumber}</p>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        name="expiryDate"
                        placeholder="MM/YY"
                        value={cardData.expiryDate}
                        onChange={handleCardChange}
                        className="w-full border p-2 rounded"
                      />
                      {errors.expiryDate && (
                        <p className="text-destructive">{errors.expiryDate}</p>
                      )}
                    </div>
                    <div>
                      <input
                        name="cvv"
                        placeholder="CVV"
                        value={cardData.cvv}
                        onChange={handleCardChange}
                        className="w-full border p-2 rounded"
                      />
                      {errors.cvv && (
                        <p className="text-destructive">{errors.cvv}</p>
                      )}
                    </div>
                  </div>
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
                <MpesaWaiting
                  timer={mpesaTimer}
                  amount={amount}
                  bookingId={bookingId}
                  roomId={roomId}
                  onCancel={() => {
                    setPaymentStatus(null);
                    setMpesaTimer(0);
                  }}
                />
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

          {/* ── Summary ── */}
          <div className="sticky top-24 h-fit">
            <div className="bg-white rounded-2xl p-6 shadow-lg border">
              <h3 className="text-2xl font-bold mb-4">Order Summary</h3>
              <div className="flex justify-between mb-4">
                <span className="text-foreground/70">Total</span>
                <span className="font-bold">KES {amount}</span>
              </div>

              <button
                onClick={() => {
                  if (paymentMethod === "card") handleCard();
                  else if (paymentMethod === "mpesa") handleMpesa();
                  else handleCash();
                }}
                disabled={loading || paymentStatus === "waiting_pin"}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading && <Loader className="animate-spin" size={20} />}
                {paymentStatus === "waiting_pin"
                  ? "Waiting for PIN…"
                  : `Pay KES ${amount}`}
              </button>

            <button
              onClick={async () => {
                if (!bookingId) return;

                setLoading(true);
                await fetch(`/api/payments/cancel/${bookingId}`, {
                  method: "POST",
                });
                setLoading(false);

                setShowModal({
                  type: "error",
                  message: "Payment cancelled. Choose another method.",
                });
                toast.info("Payment cancelled");
                setPaymentStatus(null);
                setMpesaTimer(0);
                setBookingId(null);
              }}
              className="mt-4 text-sm underline text-white bg-red-600 py-1 px-2 rounded-b-md"
            >
              Cancel & choose another method
            </button>
            </div>
            {/*  */}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── M-Pesa waiting screen ────────────────────────
// In MpesaWaiting component
function MpesaWaiting({ timer, amount, onCancel, bookingId, roomId }) {
  const [checking, setChecking] = useState(false);

  // const checkNow = async () => {
  //   setChecking(true);
  //   const res = await fetch(`/api/payments/status/${bookingId}`);
  //   const status = await res.json();
  //   console.log("Manual check:", status);
  //   setChecking(false);
  // };

  return (
    <div className="mt-6 p-6 bg-accent/10 rounded-lg text-center">
      <Smartphone className="mx-auto mb-4 text-primary" size={40} />
      <p className="font-bold">Check your phone</p>
      <p className="text-2xl font-bold text-primary">KES {amount}</p>
      <p className="text-4xl font-mono my-4">
        {String(Math.floor(timer / 60)).padStart(2, "0")}:
        {String(timer % 60).padStart(2, "0")}
      </p>
      {/* <button
        onClick={checkNow}
        disabled={checking}
        className="mb-3 px-6 py-2 bg-blue-600 text-white rounded-lg"
      >
        {checking ? "Checking..." : "Check Payment Status"}
      </button> */}
      <br />
      {/* <button onClick={onCancel} className="text-sm underline text-red-600">
        Cancel & choose another method
      </button> */}
    </div>
  );
}
