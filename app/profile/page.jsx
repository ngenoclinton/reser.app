"use client"
import { useAuth } from "../../context/authLogContext"
import { useRouter } from "next/navigation"
import Heading from "../../components/Heading"
import { LogOut, User } from "lucide-react"
import { useEffect } from "react"

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Heading title="My Profile" subtitle="Manage your account settings" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl border border-border p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <User className="text-white" size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">{user.name || "User"}</h3>
                <p className="text-foreground/60">{user.email}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="pb-6 border-b border-border">
                <label className="block text-sm text-foreground/60 mb-2">Email Address</label>
                <p className="text-lg text-foreground font-medium">{user.email}</p>
              </div>

              <div className="pb-6 border-b border-border">
                <label className="block text-sm text-foreground/60 mb-2">Account Created</label>
                <p className="text-lg text-foreground font-medium">
                  {new Date(user.$createdAt || new Date()).toLocaleDateString()}
                </p>
              </div>

              <div>
                <label className="block text-sm text-foreground/60 mb-2">Account ID</label>
                <p className="text-lg text-foreground font-mono break-all">{user.$id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl border border-border p-8">
            <h3 className="text-xl font-bold text-foreground mb-6">Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => router.push("/bookings")}
                className="w-full px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition font-semibold text-center"
              >
                My Bookings
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-6 py-3 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition font-semibold flex items-center justify-center gap-2"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
