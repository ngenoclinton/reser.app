'use server';

import { ID } from "node-appwrite";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "../../config/appwriteClient";

async function createRoom(prevState, formData) {

  if (!formData.get("userId")) {
    return { error: "You must be logged in to create a room" };
  }

  const { databases, storage} = await createAdminClient();

  try {

    // Uploading image
    let imageID;

    const image = formData.get('image');

    if (image && image.size > 0 && image.name !== 'undefined') {
      try {
        // Upload
        const response = await storage.createFile('rooms', ID.unique(), image);
        imageID = response.$id;
      } catch (error) {
        console.log('Error uploading image', error);
        return {
          error: 'Error uploading image',
        };
      }
    } else {
      console.log('No image file provided or file is invalid');
    }

    //create room 
    const newRoom = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS,
      ID.unique(),
      {
        user_id: formData.get("userId"),// associate with user
        room_name: formData.get('name'),
        description: formData.get('description'),
        sqft: formData.get('sqft'),
        capacity: formData.get('capacity'),
        location: formData.get('location'),
        address: formData.get('address'),
        availability: formData.get('availability'),
        price_per_hour: formData.get('price_per_hour'),
        amenities: formData.get('amenities'),
        image:imageID
      }
    );
    console.log(newRoom); 

    revalidatePath("/rooms");

    return { 
      success: true,
      message: "Room created successfully!",
 };
s

  } catch (error) {
    console.error("❌ createRoom failed:", error);
    return { error: error.message };
  }
}

export default createRoom;

// async function createRoom(previousState, formData) {
//   // Get databases instance
//   const { databases, storage } = await createAdminClient();

//   try {
//     const { user } = await checkAuth();

//     if (!user) {
//       return {
//         error: 'You must be logged in to create a room',
//       };
//     }

//     // Uploading image
//     // let imageID;

//     // const image = formData.get('image');

//     // if (image && image.size > 0 && image.name !== 'undefined') {
//     //   try {
//     //     // Upload
//     //     const response = await storage.createFile('rooms', ID.unique(), image);
//     //     imageID = response.$id;
//     //   } catch (error) {
//     //     console.log('Error uploading image', error);
//     //     return {
//     //       error: 'Error uploading image',
//     //     };
//     //   }
//     // } else {
//     //   console.log('No image file provided or file is invalid');
//     // }

//     // Create room
//     const newRoom = await databases.createDocument(
//       process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
//       process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS,
//       ID.unique(),
//       {
//         // user_id: user.id,
//         name: formData.get('name'),
//         description: formData.get('description'),
//         sqft: formData.get('sqft'),
//         capacity: formData.get('capacity'),
//         location: formData.get('location'),
//         address: formData.get('address'),
//         availability: formData.get('availability'),
//         price_per_hour: formData.get('price_per_hour'),
//         amenities: formData.get('amenities'),
//       }
//     );

//     revalidatePath('/');

//     return {
//       success: true,
//     };
//   } catch (error) {
//   console.error('❌ createRoom failed:', error);
//   return { error: error.message || 'An unexpected error has occurred' };
// }
// }

