"use client"

import Link from "next/link"
import Image from "next/image"
import { MapPin, Users, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

export default function RoomListView({ room }) {
//   s
const bucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

 
  const imageUrl = room.image?.startsWith("http")
    ? room.image // it's already a valid external URL (e.g., Unsplash)
    : `https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${room.image}/view?project=${projectId}`;

  const imageSrc = room.image ? imageUrl : "/images/no-image.jpg";

  return (
    <div className="space-y-4">
      <Link key={room.$id} href={`/rooms/${room.$id}`}>
          <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer p-0">
            <div className="flex flex-col md:flex-row">
              {/* Image */}
              <div className="md:w-48 h-48 md:h-auto overflow-hidden bg-muted flex-shrink-0">
                <Image
                  src={imageSrc || "/placeholder.svg?height=200&width=300&query=meeting room"}
                  alt={room.room_name}
                  width={300}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{room.room_name}</h3>
                      <p className="text-sm text-foreground/60 flex items-center gap-1 mt-1">
                        <MapPin size={16} />
                        {room.location}
                      </p>
                    </div>
                    <Badge className="bg-secondary text-secondary-foreground">Featured</Badge>
                  </div>
                  <p className="text-foreground/70 line-clamp-2 mb-4">{room.description}</p>
                </div>

                {/* Footer */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex gap-6 text-sm">
                    <div className="flex items-center gap-2 text-foreground/70">
                      <Users size={18} className="text-primary" />
                      <span>{room.capacity} people</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground/70">
                      <Clock size={18} className="text-primary" />
                      <span>{room.sqft} sqft</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">${room.price_per_hour}</div>
                    <p className="text-xs text-foreground/60">per hour</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Link>
    </div>
  )
}
