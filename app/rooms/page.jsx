
// import rooms from '@/data/rooms.json'; 

import Heading from "../../components/Heading";
import RoomCard from "../../components/RoomCard";
import getAllRooms from "../actions/getAllRooms";

export default async function Home() {
  const rooms = await getAllRooms();

  if (!rooms || rooms.length === 0) {
    return (
      <div>
        <Heading title="Available Rooms" />
        <p>No rooms available at the moment</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Heading title="Explore Our Spaces" subtitle="Find the perfect venue for your next meeting or event" />

      {!rooms || rooms.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-foreground/60">No spaces available at the moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <RoomCard room={room} key={room.$id} />
          ))}
        </div>
      )}
    </div>
  );
}

