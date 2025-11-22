import getSingleRoom from '@/app/actions/getSingleRoom';
import DetailsPage from './DetailsPage'
import NotFound from '@/components/not-found';
const page = async ({params}) => {
  const {id} = await params; 
  const room = await getSingleRoom(id); 

  if (!room) {
    return <NotFound />
  }

  return (
    <div>
      <DetailsPage roomid={id} room={room} />
    </div>
  )
}

export default page;