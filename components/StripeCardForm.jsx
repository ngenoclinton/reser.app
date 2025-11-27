// 'use clientt'

// import { PaymentElement } from "@stripe/react-stripe-js";
// import { toast } from "react-hot-toast";
// import { useElements, useStripe } from "@stripe/react-stripe-js";
// import { useState } from "react";
// // 
// export default function StripeCardForm ({ amount, onSuccess }) {
//   const stripe = useStripe();
//   const elements = useElements();
//   const [processing, setProcessing] = useState(false);
//   const [message, setMessage] = useState('');

//   const handleStripePayment = async (e) => {
//     e.preventDefault();
//     if (!stripe || !elements) return;

//     setProcessing(true);

//     const { error, paymentIntent } = await stripe.confirmPayment({
//       elements,
//       confirmParams: {
//         return_url: `${window.location.origin}/booking/complete`, // we'll handle this
//       },
//       redirect: 'if_required',
//     });

//     if (error) {
//       setMessage(error.message);
//       toast.error(error.message);
//     } else if (paymentIntent.status === 'succeeded') {
//       // Finalize booking on your backend
//       const res = await fetch('/api/payments/stripe/confirm', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           paymentIntentId: paymentIntent.id,
//         }),
//       });

//       const result = await res.json();
//       if (result.success) {
//         toast.success("Payment successful!");
//         onSuccess?.(result.bookingId);
//       }
//     }

//     setProcessing(false);
//   };

//   return (
//     <form onSubmit={handleStripePayment}>
//       <PaymentElement />
//       <button
//         type="submit"
//         disabled={processing || !stripe}
//         className="mt-6 w-full py-3 bg-primary text-white rounded-lg font-bold"
//       >
//         {processing ? "Processing..." : `Pay KES ${amount}`}
//       </button>
//       {message && <div className="mt-4 text-red-600">{message}</div>}
//     </form>
//   );
// }