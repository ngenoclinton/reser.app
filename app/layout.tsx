import { Inter, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../components/header";
import Footer from "../components/Footer";
import AuthWrapper from "../components/AuthWrapper";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
});
const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata = {
  title: "Reser App - Modern Space Booking",
  description: "Book professional meeting and event spaces with ease",
  generator: "v0.app",
}
export default function RootLayout({ children }) {
  return (
    <AuthWrapper>
      <html lang="en">
        <body className={inter.className}>
          <Header />
          <main className={`font-sans antialiased flex flex-col min-h-screen`}>
            {children}
            <Toaster richColors position="top-center" />
          </main>
          <Footer />
          <ToastContainer />
        </body>
      </html>
    </AuthWrapper>
  );
}
