"use client";

import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { useState } from "react";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function StripeCheckoutForm({
  amount,
  roomId,
  userId,
  bookingData,
  clientSecret,
  bookingId,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");

  // ------------------ Handle Form Submission ------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      toast.error("Payment system not ready");
      return;
    }

    console.log("Starting payment..."); // Debug

    setProcessing(true);

    // STEP 1: Submit the form data (card details, billing, etc.)
    const { error: submitError } = await elements.submit();
    if (submitError) {
      toast.error(submitError.message || "Invalid card details");
      setProcessing(false);
      return;
    }

    // STEP 2: Now confirm the payment
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/booking/${roomId}/confirmation`,
      },
      redirect: "if_required", // This is KEY!
    });

    console.log("Payment result:", { error, paymentIntent }); // Debug

    if (error) {
      toast.error(error.message || "Payment failed");
      setMessage(error.message);
      setProcessing(false);
      return;
    }

    // Success! paymentIntent exists
    if (paymentIntent?.status === "succeeded") {
      try {
        const res = await fetch("/api/payments/stripe/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            roomId,
            userId,
            bookingData,
            bookingId, // For balance payments
          }),
        });

        const result = await res.json();

        if (result.success) {
          toast.success("Payment successful!");
          setMessage("Payment succeeded but booking failed.");
          router.push(
            `/booking/${roomId}/confirmation?bookingId=${result.bookingId}`
          );
        } else {
          toast.error("Payment succeeded but booking failed. Contact support.");
          setMessage("Payment succeeded but booking failed."); // ← FIXED
        }
      } catch (err) {
        toast.error("Network error. Contact support.");
        console.error(err);
        setMessage("Network error. Contact support.");
      }
    } else if (paymentIntent?.status === "processing") {
      toast.info("Payment is processing. We'll email you when confirmed.");
      setProcessing(false);
    }

    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement className="mb-6" />

      {/* {message && <p className="text-red-500 mb-4">{message}</p>} */}
      <button
        type="submit"
        disabled={processing || !stripe || !elements || !clientSecret}
        className="w-full py-4 bg-primary text-white rounded-lg font-bold disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <Loader className="animate-spin" size={20} />
            Processing...
          </>
        ) : (
          <>Pay KES {amount}</>
        )}
      </button>
    </form>
  );
}
