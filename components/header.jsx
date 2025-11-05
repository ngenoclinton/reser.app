'use client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import logo from '../assets/logo.jpg';
import { FaUser, FaSignInAlt, FaSignOutAlt, FaBuilding } from 'react-icons/fa';
import { toast } from 'sonner';
import { useAuth } from '../context/authLogContext';
import { destroySessionClient } from '../lib/destroySessionClient';
import { Menu, X } from "lucide-react"
import { useState } from "react"

const Header = () => {
  const router = useRouter();
 const { user, isAuthenticated, logout, setUser } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
  const { success, error } = await destroySessionClient();

    if (success) {
      logout();
      toast.success('Logged out successfully!');
      router.push('/login');
    } else {
      toast.error(error);
    }
  };

  return (
     <nav className="bg-white border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center bg-primary rounded-lg justify-center">
              {/* <span className="text-white font-bold text-lg">R</span> */}
              <Image
                className='h-12 w-12'
                src={logo}
                alt='Reserv logo'
                priority={true}
              />
            </div>
            <span className="text-lg font-bold text-foreground hidden sm:inline">Reserv</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-foreground hover:text-primary transition">
              Home
            </Link>
            <Link href="/rooms" className="text-foreground hover:text-primary transition">
              Rooms
            </Link>
            {isAuthenticated && (
              <Link href="/bookings" className="text-foreground hover:text-primary transition">
                My Bookings
              </Link>              
            )}
            {isAuthenticated && (<Link
              href='/rooms/add'
              className='rounded-md px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-700 hover:text-white'
            >
              Add Room
            </Link>)}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/profile" className="text-foreground hover:text-primary transition text-sm">
                  {user?.email || "Profile"}
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-foreground hover:text-primary transition text-sm font-medium">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition text-sm font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <Link href="/" className="block text-foreground hover:text-primary py-2">
              Home
            </Link>
            <Link href="/rooms" className="block text-foreground hover:text-primary py-2">
              Rooms
            </Link>
            {isAuthenticated && (
              <Link href="/bookings" className="block text-foreground hover:text-primary py-2">
                My Bookings
              </Link>
            )}
            {isAuthenticated ? (
              <>
                <Link href="/profile" className="block text-foreground hover:text-primary py-2">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition text-sm font-medium text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/login"
                  className="block text-center px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 transition text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block text-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition text-sm font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;