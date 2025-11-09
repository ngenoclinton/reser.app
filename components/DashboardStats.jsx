"use client"

import { BarChart3, Users, DollarSign, AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"

export default function DashboardStats({ stats }) {
  const statCards = [
    {
      icon: BarChart3,
      label: "Total Rooms",
      value: stats.totalRooms || 0,
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: Users,
      label: "Active Bookings",
      value: stats.activeBookings || 0,
      color: "bg-green-50 text-green-600",
    },
    {
      icon: DollarSign,
      label: "Total Revenue",
      value: `$${(stats.totalRevenue || 0).toFixed(2)}`,
      color: "bg-purple-50 text-purple-600",
    },
    {
      icon: AlertCircle,
      label: "Pending Payments",
      value: stats.pendingPayments || 0,
      color: "bg-yellow-50 text-yellow-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statCards.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <Card key={idx} className={`p-6 ${stat.color}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-foreground/70 mb-2">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              </div>
              <Icon size={28} className="opacity-20" />
            </div>
          </Card>
        )
      })}
    </div>
  )
}
