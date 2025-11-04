
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
    <div>
      <Heading title="Available Rooms" />
      {rooms.map((room) => (
        <RoomCard room={room} key={room.$id} />
      ))}
    </div>
  );
}

