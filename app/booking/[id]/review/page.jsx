import getSingleRoom from "@/app/actions/getSingleRoom";
import ReviewPage from "./ReviewPage";
import NotFound from "@/components/not-found";

export default async function Page({ params }) {
    const {id} = await params;
    const room = await getSingleRoom(id)


  if (!room) {
    return <NotFound/>
  }

  return <ReviewPage roomId={id} room={room} />; // ✅ extract and pass
}
