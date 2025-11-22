"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";

import { useAuth } from "../context/authLogContext";
import { useRouter } from "next/navigation";
import { Calendar, Clock, AlertCircle, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

import DatePicker from "@/components/date-picker";

import createBookingWithDeposit from "@/app/server-actions/createBookingWithDeposit";
import getBookedDatesForRoom from "@/app/server-actions/getBookedDatesForRoom";


export default function BookingFormAdvanced({ room }) {
  //onBookingSuccess add this prop later
  const [state, formAction] = useActionState(createBookingWithDeposit, {});
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [bookedDates, setBookedDates] = useState([]);

  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [checkInTime, setCheckInTime] = useState("09:00");
  const [checkOutTime, setCheckOutTime] = useState("17:00");

  const [totalHours, setTotalHours] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const [dateConflict, setDateConflict] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please log in to book a space");
      return;
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const fetchBookedDates = async () => {
      const dates = await getBookedDatesForRoom(room.$id);
      setBookedDates(dates);
    };
    fetchBookedDates();
  }, [room.$id]);

  useEffect(() => {
    if (!checkInDate || !checkOutDate) return;

    const checkIn = new Date(`${checkInDate}T${checkInTime}`);
    const checkOut = new Date(`${checkOutDate}T${checkOutTime}`);

    if (checkOut <= checkIn) {
      setTotalHours(0);
      setDepositAmount(0);
      setTotalAmount(0);
      setDateConflict(false);
      return;
    }

    const msInHour = 1000 * 60 * 60;
    const msInDay = 1000 * 60 * 60 * 24;

    const days = Math.ceil((checkOut - checkIn) / msInDay);
    const hoursPerDay =
      (new Date(`1970-01-01T${checkOutTime}`) -
        new Date(`1970-01-01T${checkInTime}`)) /
      msInHour;

    const totalHours = hoursPerDay * days;
    const totalAmount = totalHours * room.price_per_hour;
    const hours = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60));
    // const total = hours * room.price_per_hour;
    const deposit = totalAmount * 0.5;

    setTotalHours(totalHours);
    setDepositAmount(deposit);
    setTotalAmount(totalAmount);

    const hasConflict = bookedDates.some((booked) => {
      const bookedCheckIn = new Date(booked.checkIn);
      const bookedCheckOut = new Date(booked.checkOut);
      return (
        (checkIn >= bookedCheckIn && checkIn < bookedCheckOut) ||
        (checkOut > bookedCheckIn && checkOut <= bookedCheckOut) ||
        (checkIn <= bookedCheckIn && checkOut >= bookedCheckOut)
      );
    });

    setDateConflict(hasConflict);
  }, [
    checkInDate,
    checkOutDate,
    checkInTime,
    checkOutTime,
    room.price_per_hour,
    bookedDates,
  ]);

  // ✅ Handle booking state updates
  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) {
      toast.success("Room booked Successfully");
      router.push("/bookings");
    }
  }, [state]);

  //   const handleSubmit = async (formData) => {
  //     if (dateConflict) {
  //       toast.error("Selected dates conflict with existing bookings");
  //       return;
  //     }

  //     if (!checkInDate || !checkOutDate || !user.$id) {
  //       toast.error("Please fill in all required fields");
  //       return;
  //     }

  //     setLoading(true);
  //     formData.append("check_in_date", checkInDate);
  //     formData.append("check_in_time", checkInTime);
  //     formData.append("check_out_date", checkOutDate);
  //     formData.append("check_out_time", checkOutTime);
  //     formData.append("room_id", room.$id);
  //     formData.append("room_name", room.room_name);
  //     formData.append("user_id", user.$id);
  //     formData.append("price_per_hour", room.price_per_hour);

  //     await formAction(formData);
  //   };

  useEffect(() => {
    if (state.success) {
      toast.success("Booking created! Proceed to payment for 50% deposit.");
      //   onBookingSuccess(state.booking)
      //    router.push("/checkout")
      setLoading(false);
    }
    if (state.error) {
      toast.error(state.error);
      setLoading(false);
    }
  }, [state]);

  const handleBeforeSubmit = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to continue");
      // router.push("/login");
      return false;
    }

    if (dateConflict) {
      toast.error("Selected dates conflict with an existing booking");
      return false;
    }

    return true;
  };

  return (
    <Card className="p-6 max-w-md">
      <h3 className="text-2xl font-bold mb-6 text-foreground">
        Book This Space
      </h3>

      <div className="bg-secondary/10 rounded-lg p-4 mb-6 border border-secondary/20">
        <div className="flex justify-between mb-2">
          <span className="text-foreground/70">Price per hour:</span>
          <span className="font-semibold">${room.price_per_hour}</span>
        </div>
        {totalHours > 0 && (
          <>
            <div className="flex justify-between mb-2">
              <span className="text-foreground/70">Total hours:</span>
              <span className="font-semibold">{totalHours}h</span>
            </div>
            <div className="border-t border-secondary/20 pt-2 mt-2">
              <div className="flex justify-between mb-2">
                <span className="text-foreground/70">Total amount:</span>
                <span className="font-bold text-lg">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-accent font-semibold">
                  50% Deposit required:
                </span>
                <span className="font-bold text-accent text-lg">
                  ${depositAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {dateConflict && (
        <Alert className="mb-6 border-destructive bg-destructive/10">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            These dates conflict with existing bookings. Please select different
            dates.
          </AlertDescription>
        </Alert>
      )}

      <form
        action={formAction}
        className="space-y-4"
      >
        <input type="hidden" name="room_id" value={room.$id} />
        <input type="hidden" name="room_name" value={room.room_name} />
        <input type="hidden" name="user_id" value={user?.$id ?? ""} />
        <input
          type="hidden"
          name="price_per_hour"
          value={room.price_per_hour}
        />
        <input type="hidden" name="check_in_date" value={checkInDate} />
        <input type="hidden" name="check_in_time" value={checkInTime} />
        <input type="hidden" name="check_out_date" value={checkOutDate} />
        <input type="hidden" name="check_out_time" value={checkOutTime} />

        <input type="hidden" name="total_hours" value={totalHours} />
        <input type="hidden" name="total_amount" value={totalAmount} />
        <input type="hidden" name="deposit_amount" value={depositAmount} />

        <div>
          <label className="block text-sm font-semibold mb-2 text-foreground">
            <Calendar className="inline mr-2" size={16} />
            Check-in Date
          </label>
          <DatePicker
            value={checkInDate}
            name="check_in_date"
            onChange={setCheckInDate}
            bookedDates={bookedDates}
            disabledDates={bookedDates.map(
              (b) => new Date(b.checkIn).toISOString().split("T")[0]
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-foreground">
            <Clock className="inline mr-2" size={16} />
            Check-in Time
          </label>
          <Input
            type="time"
            name="check_in_time"
            value={checkInTime}
            onChange={(e) => setCheckInTime(e.target.value)}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-foreground">
            <Calendar className="inline mr-2" size={16} />
            Check-out Date
          </label>
          <DatePicker
            value={checkOutDate}
            name="check_out_date"
            onChange={setCheckOutDate}
            bookedDates={bookedDates}
            minDate={checkInDate}
            disabledDates={bookedDates.map(
              (b) => new Date(b.checkIn).toISOString().split("T")[0]
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-foreground">
            <Clock className="inline mr-2" size={16} />
            Check-out Time
          </label>
          <Input
            type="time"
            name="check_out_time"
            value={checkOutTime}
            onChange={(e) => setCheckOutTime(e.target.value)}
            className="w-full"
          />
        </div>

        {!dateConflict && checkInDate && checkOutDate && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <Check className="text-green-600" size={18} />
            <span className="text-sm font-medium text-green-700">
              These dates are available!
            </span>
          </div>
        )}

        <Button
          type="submit"
          disabled={!isAuthenticated || dateConflict || loading || !checkInDate || !checkOutDate}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3"
        >
          {loading ? "Processing..." : "Proceed to Payment"}
        </Button>

        {/* <Button
          type="submit"
          disabled={!isAuthenticated || dateConflict || loading || !checkInDate || !checkOutDate}
          className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition"
        >
          {loading ? "Processing..." : "Book Now"}
        </Button> */}
      </form>
      
      {/* <Button
          // type="submit"
          // disabled={!isAuthenticated || dateConflict || loading || !checkInDate || !checkOutDate}
          className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition"
        >
          {loading ? "Processing..." : "Check Availability"}
        </Button> */}
    </Card>
  );
}
