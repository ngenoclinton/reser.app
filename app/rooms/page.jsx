"use client"
import { useState, useEffect } from "react"
import RoomCard from "@/components/RoomCard"
import RoomListView from "@/components/RoomListView"
import RoomFilters from "@/components/RoomFilters"
import getAllRooms from "@/app/actions/getAllRooms"
import Heading from "@/components/Heading"
export default function Page() {

  const [allRooms, setAllRooms] = useState([])
  const [filteredRooms, setFilteredRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewType, setViewType] = useState("grid")
  
  // const rooms = await getAllRooms();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const rooms = await getAllRooms()
        setAllRooms(rooms)
        setFilteredRooms(rooms)
      } catch (error) {
        console.error("Error fetching rooms:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRooms()
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-center text-foreground/60">Loading spaces...</p>
      </div>
    )
  }

  if (!allRooms || allRooms.length === 0) {
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

      {/* Filters Component */}
      <RoomFilters
        rooms={allRooms}
        onFiltersChange={setFilteredRooms}
        onViewChange={setViewType}
        currentView={viewType}
      />

      {/* Grid or List View */}
      {viewType === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <RoomCard room={room} key={room.$id} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {filteredRooms.map((room) => (
          <RoomListView  key={room.$id} room={room} />
          ))}
        </div>
      )}

      {filteredRooms.length === 0 && (
        <div className="text-center py-16">
          <p className="text-lg text-foreground/60">No spaces match your criteria</p>
        </div>
      )}
    </div>
  );
}

