import Link from "next/link"
import Image from "next/image"
import { CheckCircle2, Users, Calendar } from "lucide-react"
import danielle_cerullo_room from '../assets/danielle-cerullo-room-1.jpg';

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 to-secondary/5 py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6 leading-tight">
                Book Perfect Spaces Instantly
              </h1>
              <p className="text-xl text-foreground/70 mb-8 leading-relaxed">
                Discover and reserve premium meeting and event spaces tailored to your needs. Professional, modern, and
                effortless.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/rooms"
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-semibold text-center"
                >
                  Explore Spaces
                </Link>
                <Link
                  href="/register"
                  className="px-8 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary/5 transition font-semibold text-center"
                >
                  Get Started
                </Link>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={danielle_cerullo_room}
                alt="Professional meeting space"
                width={500}
                height={400}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-lg text-foreground/60">Three simple steps to book your perfect space</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Calendar,
                title: "Search & Explore",
                description: "Browse through our curated selection of premium meeting and event spaces",
              },
              {
                icon: CheckCircle2,
                title: "Book in Seconds",
                description: "Select your dates, times, and confirm your booking instantly",
              },
              {
                icon: Users,
                title: "Host Your Event",
                description: "Show up to your reserved space and focus on what matters",
              },
            ].map((step, i) => {
              const Icon = step.icon
              return (
                <div key={i} className="p-8 border border-border rounded-2xl hover:shadow-lg transition">
                  <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mb-4">
                    <Icon className="text-primary" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-foreground/60">{step.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Why Choose Reser?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              "Verified and trusted spaces",
              "Instant confirmation",
              "Flexible cancellation",
              "24/7 customer support",
              "Best price guarantee",
              "Premium amenities included",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="text-primary" size={24} />
                </div>
                <p className="text-lg text-foreground">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Book?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of professionals using Reser for their meetings and events.
          </p>
          <Link
            href="/rooms"
            className="inline-block px-8 py-3 bg-white text-primary rounded-lg hover:bg-gray-100 transition font-semibold"
          >
            Browse Spaces Now
          </Link>
        </div>
      </section>
    </div>
  )
}
