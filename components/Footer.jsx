import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-foreground text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                <span className="text-foreground font-bold">R</span>
              </div>
              <span className="font-bold text-lg">Reser</span>
            </div>
            <p className="text-sm text-gray-300">Professional space booking made simple.</p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <Link href="/rooms" className="hover:text-white transition">
                Explore Rooms
              </Link>
              <Link href="/" className="hover:text-white transition">
                Pricing
              </Link>
              <Link href="/" className="hover:text-white transition">
                Features
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <Link href="/" className="hover:text-white transition">
                About
              </Link>
              <Link href="/" className="hover:text-white transition">
                Blog
              </Link>
              <Link href="/" className="hover:text-white transition">
                Careers
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <Link href="/" className="hover:text-white transition">
                Privacy
              </Link>
              <Link href="/" className="hover:text-white transition">
                Terms
              </Link>
              <Link href="/" className="hover:text-white transition">
                Contact
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 Reserv App. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
