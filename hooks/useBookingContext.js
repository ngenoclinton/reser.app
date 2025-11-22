"use client"

import { useState, useEffect } from "react"

const STORAGE_KEY = "reser_booking_session"

export function useBookingContext() {
  const [bookingData, setBookingData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setBookingData(JSON.parse(stored))
      }
    } catch (error) {
      console.error("Failed to load booking data from storage:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save to localStorage whenever bookingData changes
  useEffect(() => {
    if (bookingData && !isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookingData))
      } catch (error) {
        console.error("Failed to save booking data to storage:", error)
      }
    }
  }, [bookingData, isLoading])

  const updateBookingData = (updates) => {
    setBookingData((prev) => ({
      ...(prev || {}),
      ...updates,
    }))
  }

  const clearBookingData = () => {
    setBookingData(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    bookingData,
    updateBookingData,
    clearBookingData,
    isLoading,
  }
}
