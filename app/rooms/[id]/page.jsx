// import rooms from '@/data/rooms.json';
import NotFound from "../../../components/NotFound";
import Image from "next/image";
import Link from "next/link";
import { FaChevronLeft } from "react-icons/fa";
import Heading from "../../../components/Heading";
import BookingForm from "../../../components/BookingForm";
import getAllRooms from "../../actions/getAllRooms";
import getSingleRoom from "../../actions/getSingleRoom";

const RoomPage = async ({ params }) => {
  const { id } = await params; // ✅ no await here
  // ---------------------------------------------->
  const room = await getSingleRoom(id);
  //--- ------------------------------------------->
  // const rooms = await getAllRooms();
  // const room = rooms.find((room) => room.id === id);

  if (!room) {
    return <NotFound />;
  }

  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

  const imageUrl = room.image?.startsWith("http")
    ? room.image // it's already a valid external URL (e.g., Unsplash)
    : `https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${room.image}/view?project=${projectId}`;

  const imageSrc = room.image ? imageUrl : "/images/no-image.jpg";

  return (
    <>
      <Link
        href="/"
        className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
      >
        <FaChevronLeft className="inline mr-1" />
        <span className="ml-2">Back to Rooms</span>
      </Link>{" "}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:space-x-6">
          <Image
            src={imageSrc}
            alt={room.room_name}
            width={400}
            height={100}
            className="w-full sm:w-1/3 h-64 object-cover rounded-lg"
          />

          <div className="mt-4 sm:mt-0 sm:flex-1">
            <Heading title={room.room_name} />

            <p className="text-gray-600 mb-4">{room.description}</p>

            <ul className="space-y-2">
              <li>
                <span className="font-semibold text-gray-800">Size:</span>{" "}
                {room.sqft}
                sq ft
              </li>
              <li>
                <span className="font-semibold text-gray-800">
                  Availability:
                </span>
                {room.availability}
              </li>
              <li>
                <span className="font-semibold text-gray-800">Price:</span>$
                {room.price_per_hour}/hour
              </li>
              <li>
                <span className="font-semibold text-gray-800">Address:</span>{" "}
                {room.address}
              </li>
            </ul>
          </div>
        </div>

        <BookingForm room={room} />
      </div>
    </>
  );
};

export default RoomPage;
