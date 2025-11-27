'use client';

import { Smartphone } from "lucide-react";
export function MpesaWaiting({ timer, amount }) {
  return (
    <div className="mt-6 p-6 bg-green-50 rounded-lg text-center border border-green-200">
      <Smartphone className="mx-auto mb-4 text-primary" size={48} />
      <p className="font-bold text-lg">Check your phone</p>
      <p className="text-3xl font-bold text-primary my-3">KES {amount}</p>
      <p className="text-4xl font-mono font-bold">
        {String(Math.floor(timer / 60)).padStart(2, "0")}:
        {String(timer % 60).padStart(2, "0")}
      </p>
      <p className="text-sm text-gray-600 mt-4">
        Enter PIN to complete payment
      </p>
    </div>
  );
}
