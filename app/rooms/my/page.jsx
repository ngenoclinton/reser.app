"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import getMyRooms from "../../actions/getMyRooms";
import Heading from "../../../components/Heading";
import MyRoomCard from "../../../components/MyRoomCard";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { useAuth } from "@/context/authLogContext";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
const MyRoomsPage = () => {
  const { isAuthenticated, authLoading } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // const rooms = await getAllRooms();

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      toast.error("Please log in to view your rooms");
      setTimeout(() => router.push("/login"), 1500);
      return;
    }

    const fetchRooms = async () => {
      try {
        const myRooms = await getMyRooms();
        setRooms(myRooms);
      } catch (error) {
        console.error("Error:", error);
        toast.error("Failed to load your rooms");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-center text-foreground/60">Loading your rooms...</p>
      </div>
    );
  }

  if (!rooms || rooms.length === 0) {
    return (
      <div>
        <Heading title="Available Rooms" />
        <p>No rooms available at the moment</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <Heading title="My Rooms" subtitle="Manage your listed spaces" />
          <Button
            onClick={() => router.push("/rooms/add")}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <Plus size={20} />
            Add Room
          </Button>
        </div>

        {rooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rooms.map((room) => (
              <MyRoomCard
                key={room.$id}
                room={room}
                onRoomDeleted={(deletedId) => {
                  setRooms((prev) => prev.filter((r) => r.$id !== deletedId));
                  toast.success("Room deleted successfully");
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-background rounded-lg border border-border">
            <p className="text-lg text-foreground/60 mb-4">
              No rooms listed yet
            </p>
            <Button
              onClick={() => router.push("/rooms/add")}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <Plus size={20} />
              Add Your First Room
            </Button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default MyRoomsPage;
