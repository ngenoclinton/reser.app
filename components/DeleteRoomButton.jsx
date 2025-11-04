"use client";
import { toast } from "react-toastify";
import { FaTrash } from "react-icons/fa";
import deleteRoom from "../app/actions/deleteRoom";
import { useRouter } from "next/navigation";

const DeleteRoomButton = ({ roomId, room_name, onDeleteSuccess }) => {
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${room_name}?`
    );

    if (!confirmed) return;

    if (confirmed) {
      try {
        const response = await deleteRoom(roomId);

        if (response.success) {
          toast.success(`${room_name} deleted successfully!`);
          onDeleteSuccess?.(); // ✅ Update UI immediately
          router.refresh(); // ✅ Then sync data from server
          setTimeout(() => router.refresh(), 200); // short delay for cache revalidation
        } else {
          toast.error(result.message || `Failed to delete ${room_name}.`);
        }
      } catch (error) {
        console.log(`Failed to delete ${room_name}  room`, error);
        toast.error(`Failed to delete ${room_name}  room : ${error}`);
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="bg-red-500 text-white px-4 py-2 rounded mb-2 sm:mb-0 w-full sm:w-auto text-center hover:bg-red-700"
    >
      <FaTrash className="inline mr-1" /> Delete
    </button>
  );
};

export default DeleteRoomButton;
