"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import getMyRooms from "../../actions/getMyRooms";
import Heading from "../../../components/Heading";
import MyRoomCard from "../../../components/MyRoomCard";
import ProtectedRoute from "../../../components/ProtectedRoute";

const MyRoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRooms = await getMyRooms();
        setRooms(userRooms);
      } catch (error) {
        toast.error("Session expired. Please log in again.");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) return <p>Loading your rooms...</p>;

  return (
    <ProtectedRoute>
      <Heading title="My Rooms" />
      {rooms.length > 0 ? (
        rooms.map((room) => <MyRoomCard key={room.$id} room={room} setRooms={setRooms}/>)
      ) : (
        <p>You have no room listings</p>
      )}
    </ProtectedRoute>
  );
};

export default MyRoomsPage;
