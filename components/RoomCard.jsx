import Image from "next/image";
import Link from "next/link";
import { MapPin, Users } from "lucide-react"
const RoomCard = ({ room }) => {

  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

 
  const imageUrl = room.image?.startsWith("http")
    ? room.image // it's already a valid external URL (e.g., Unsplash)
    : `https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${room.image}/view?project=${projectId}`;

  const imageSrc = room.image ? imageUrl : "/images/no-image.jpg";

  return (
     <div className="bg-white rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-shadow">
      <div className="relative h-64 overflow-hidden bg-muted">
        <Image
          src={imageSrc || "/placeholder.svg"}
          alt={room.room_name}
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold">
          ${room.price_per_hour}/hr
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-2xl font-bold text-foreground mb-2">{room.room_name}</h3>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-foreground/70">
            <MapPin size={18} />
            <p className="text-sm">{room.address}</p>
          </div>
          <div className="flex items-center gap-2 text-foreground/70">
            <Users size={18} />
            <p className="text-sm">Capacity: {room.capacity || "Varies"}</p>
          </div>
        </div>

        <p className="text-foreground/60 text-sm mb-6 line-clamp-2">{room.description}</p>

        <Link
          href={`/rooms/${room.$id}`}
          className="block text-center w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-semibold"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default RoomCard;
