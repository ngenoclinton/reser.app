"use client";
import { createContext, useContext, useState } from "react";

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [draftBooking, setDraftBooking] = useState(null);
  const [reviewBookingDraft, setReviewBookingDraft] = useState(null);

  return (
    <BookingContext.Provider value={ { draftBooking, setDraftBooking,reviewBookingDraft, setReviewBookingDraft} }>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);
