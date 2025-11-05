// import rooms from '@/data/rooms.json';
import NotFound from "../../../components/NotFound";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Users, Clock, Award, CheckCircle, DollarSign } from "lucide-react"
import Heading from "../../../components/Heading";
import BookingForm from "../../../components/BookingForm";
import getSingleRoom from "../../actions/getSingleRoom";

const RoomPage = async ({ params }) => {
  const { id } = await params; // ✅ no await here
  // ---------------------------------------------->
  const room = await getSingleRoom(id);
  //--- ------------------------------------------->

  if (!room) {
    return <NotFound />;
  }

  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

  const imageUrl = room.image?.startsWith("http")
    ? room.image // it's already a valid external URL (e.g., Unsplash)
    : `https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${room.image}/view?project=${projectId}`;

  const imageSrc = room.image ? imageUrl : "/images/no-image.jpg";

  const amenities = room.amenities ? room.amenities.split(",").map((a) => a.trim()) : []

  return (
   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/rooms" className="flex items-center gap-2 text-primary hover:text-primary/90 transition mb-8">
        <ArrowLeft size={20} />
        <span>Back to Spaces</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column - Images & Info */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl overflow-hidden mb-8 h-96">
            <Image
              src={imageSrc || "/placeholder.svg"}
              alt={room.room_name}
              width={800}
              height={500}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="mb-12">
            <Heading title={room.room_name} />
            <p className="text-base text-foreground/70 leading-relaxed mb-8">{room.description}</p>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
            <div className="p-4 bg-background rounded-xl border border-border">
              <Users size={20} className="text-primary mb-2" />
              <p className="text-sm text-foreground/60">Capacity</p>
              <p className="text-lg font-bold text-foreground">{room.capacity || "∞"}</p>
            </div>
            <div className="p-4 bg-background rounded-xl border border-border">
              <Clock size={20} className="text-primary mb-2" />
              <p className="text-sm text-foreground/60">Size</p>
              <p className="text-lg font-bold text-foreground">{room.sqft}ft²</p>
            </div>
            <div className="p-4 bg-background rounded-xl border border-border">
              <DollarSign size={20} className="text-primary mb-2" />
              <p className="text-sm text-foreground/60">Price</p>
              <p className="text-lg font-bold text-foreground">${room.price_per_hour}</p>
            </div>
            <div className="p-4 bg-background rounded-xl border border-border">
              <Award size={20} className="text-primary mb-2" />
              <p className="text-sm text-foreground/60">Available From</p>
              <p className="text-lg font-bold text-foreground">{room.availability || "Yes"}</p>
            </div>
          </div>

          {/* Amenities */}
          {amenities.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-6">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {amenities.map((amenity, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border">
                    <CheckCircle className="text-primary flex-shrink-0" size={16} />
                    <span className="text-foreground">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Booking */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white p-8 rounded-2xl border border-border shadow-lg">
            <BookingForm room={room} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
