import Link from "next/link";
import CancelBookingButton from "./CancelBookingButton";
import { Calendar, Clock } from "lucide-react";

const BookedRoomCard = ({ booking, onCancel }) => {
  const { room_id: room } = booking;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    // Get month
    const options = { month: "short" };
    const month = date.toLocaleString("en-US", options, { timeZone: "UTC" });
    // Get day
    const day = date.getUTCDate();
    // Format time in UTC 12-hour
    const timeOptions = {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      timeZone: "UTC",
    };
    const time = date.toLocaleString("en-US", timeOptions);
    // Final formatted string
    return `${month} ${day} at ${time}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-border p-6 hover:shadow-lg transition">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-4">
            {room.name}
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-foreground/70">
              <Calendar size={16} className="text-primary" />
              <div>
                <p className="text-sm text-foreground/60">Check In</p>
                <p className="font-medium text-base">{formatDate(booking.check_in)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-foreground/70">
              <Clock size={16} className="text-primary" />
              <div>
                <p className="text-sm text-foreground/60">Check Out</p>
                <p className="font-medium text-base">{formatDate(booking.check_out)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between">
          <div className="inline-flex px-4 py-2 bg-secondary/20 text-primary rounded-lg w-fit">
            <span className="font-semibold text-sm">Confirmed Booking</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/rooms/${room.$id || room}`}
              className="flex-1 px-4 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary/5 transition font-semibold text-center"
            >
              View Room
            </Link>
            <CancelBookingButton bookingId={booking.$id} onCancel={onCancel} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookedRoomCard;
