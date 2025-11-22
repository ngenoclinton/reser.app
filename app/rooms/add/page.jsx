"use client"

import { useState, useEffect} from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { useAuth } from "../../../context/authLogContext"

import { useActionState } from "react"; // ✅ new import

import Heading from "../../../components/Heading"
import ProtectedRoute from "../../../components/ProtectedRoute"

import createRoom from "../../actions/createRoom";

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"

export default function AddRoomPage() {
  const { user, isAuthenticated, authLoading, loading} = useAuth(); 
  const [state, formAction] = useActionState(createRoom, {});
  const [load, setLoad] = useState(false); // ✅ rename


  const [loader, setLoader] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imageId, setImageId] = useState(null); 


  const router = useRouter()   
  // const [loading, setLoading] = useState(false)

   useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) {
      toast.success(state.message);
      router.push("/");
    }
  }, [state]);

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-center text-foreground/60">Checking authentication...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-center text-foreground/60">Please log in to add a room</p>
      </div>
    )
  }

  const handleAction = (formData) => {
    setLoad(true); 

    if (!user) {
      toast.error("You must be logged in to create a room.");
      router.push("/login");
      return;
    }

    formData.append("userId", user.$id);
    formAction(formData);

    setLoad(false)
  };
// -----------------------------------------//
// Appwrite client for browser → direct upload
  const browserClient = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT);

  const storage = new Storage(browserClient);

  // DIRECT file upload — avoids 413 issues
  const handleImageUpload = async (file) => {
    setLoader(true);
    try {
      const uploaded = await storage.createFile(
        process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS,
        ID.unique(),
        file
      );

      setImageId(uploaded.$id);
      toast.success("Image uploaded!");
    } catch (error) {
      console.error(error);
      toast.error("Image upload failed");
    }
    setLoader(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.target);

    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    // Attach image ID (uploaded earlier)
    if (imageId) {
      form.append("imageId", imageId);
    }

    const res = await fetch("/api/rooms/create", {
      method: "POST",
      body: form,
    });

     const result = await res.json();

    if (result.success) {
      toast.success("Room created!");
      router.push("/");
    } else {
      toast.error(result.error);
    }

    setLoader(false);
  }

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Heading title="Add New Room" subtitle="List your space on Reser" />

        <Card className="p-8 border border-border">
          <form action={handleAction} className="space-y-6">
            {/* Room Name */}
            <div>
              <label               
              htmlFor="name" 
              className="block text-sm font-semibold mb-2 text-foreground">Room Name</label>
              <Input
                type="text"
                id="name"
                name="name"
                required                
                placeholder="Enter a name (Large Conference Room)"
                // value={formData.name}
                // onChange={handleInputChange}                
                // className="border rounded w-full py-2 px-3"
              />
            </div>

            {/* Description */}
            <div>
              <label 
              htmlFor="description"
              className="block text-sm font-semibold mb-2 text-foreground">Description</label>
              <Textarea
                name="description"                
                id="description"
                // value={formData.description}
                // onChange={handleInputChange}
                placeholder="Describe your room..."
                rows={4}
                required
              />
            </div>

            {/* Grid: Capacity & Sqft */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label 
                htmlFor="capacity"
                className="block text-sm font-semibold mb-2 text-foreground">Capacity (people)</label>
                <Input
                  type="number"
                  id="capacity"
                  name="capacity"
                  // value={formData.capacity}
                  // onChange={handleInputChange}
                  placeholder="Number of people the room can hold (e.g 20)"
                  required
                />
              </div>

              <div>
                <label 
                 htmlFor="sqft"
                className="block text-sm font-semibold mb-2 text-foreground">Size (sqft)</label>
                <Input
                  type="number"
                  id="sqft"
                  name="sqft"
                  // value={formData.sqft}
                  // onChange={handleInputChange}
                  placeholder="500"
                  required
                />
              </div>
            </div>

            {/* Grid: Price & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label 
                htmlFor="price_per_hour"
                className="block text-sm font-semibold mb-2 text-foreground">Price per Hour ($)</label>
                <Input
                  type="number"
                  id="price_per_hour"
                  name="price_per_hour"
                  // value={formData.price_per_hour}
                  // onChange={handleInputChange}
                  placeholder="Enter price per hour (e.g 50)"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label 
                htmlFor="location"
                className="block text-sm font-semibold mb-2 text-foreground">Location</label>
                <Input
                  type="text"
                  id="location"
                  name="location"
                  // value={formData.location}
                  // onChange={handleInputChange}
                  placeholder="Downtown, Building A, Floor 2"
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label 
              htmlFor="address"
              className="block text-sm font-semibold mb-2 text-foreground">Full Address</label>
              <Input
                type="text"
                id="address"
                name="address"
                // value={formData.address}
                // onChange={handleInputChange}
                placeholder="123 Business St, City, State"
                required
              />
            </div>

            <div className="mb-4">
            <label
              htmlFor="availability"
              className="block text-sm font-semibold mb-2 text-foreground">Availability</label>
            <Input
              type="text"
              id="availability"
              name="availability"
              // value={formData.availability}
              placeholder="Availability (Monday - Friday, 9am - 5pm)"
              required
            />
            </div>

            {/* Amenities */}
            <div>
              <label 
              htmlFor="amenities"
              className="block text-sm font-semibold mb-2 text-foreground">Amenities (comma separated)</label>
              <Input
                type="text"
                id="amenities"
                name="amenities"
                // value={formData.amenities}
                // onChange={handleInputChange}
                placeholder="WiFi, Projector, Whiteboard, AC"
              />
            </div>

          {/* <!-- Image Upload --> */}
          <div className="mb-8">
            <label
              htmlFor="image"
              className="block text-gray-700 font-bold mb-2"
            >
              Image
            </label>

            <Input
              type="file"
              id="image"
              name="image"
              className="border rounded w-full py-2 px-3"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files[0];
                setImageFile(f);
                handleImageUpload(f);
              }}
            />
          </div>

            {/* Submit Buttons */}
            <div className="flex gap-2 pt-6 border-t border-border">
              <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1 bg-primary hover:bg-primary/90">
                {loading ? "Adding..." : "Add Room"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
