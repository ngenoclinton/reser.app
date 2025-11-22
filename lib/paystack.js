// lib/paystack.ts
import Paystack from "paystack";

if (!process.env.PAYSTACK_SECRET_KEY) {
  throw new Error("PAYSTACK_SECRET_KEY is missing");
}

const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY);
export default paystack;