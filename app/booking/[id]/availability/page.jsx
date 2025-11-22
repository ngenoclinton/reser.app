import getSingleRoom from "@/app/actions/getSingleRoom";
import AvailabilityPage from "./AvailabilityPage";
import NotFound from "@/components/not-found";

export default async function Page({ params }) {
  const {id} = await params;
  const room = await getSingleRoom(id)

  if (!room) {
    return <NotFound />
  }
  return <AvailabilityPage room={room} />; // ✅ extract and pass
}
