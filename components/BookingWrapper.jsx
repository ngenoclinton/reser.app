import { BookingProvider } from "@/context/BookingContext";

const BookingWrapper = ({ children }) => {
  return <BookingProvider>
            {children}
          </BookingProvider>;
};

export default BookingWrapper;