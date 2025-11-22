import React from 'react'
import getSingleRoom from '@/app/actions/getSingleRoom';
import PaymentPage from './PaymentPage'
import NotFound from '@/components/not-found';
const page = async ({params}) => {
  const {id}=await params;
  const room = await getSingleRoom(id); 
if (!room) {
    return <NotFound />
  }
  return (
    <div>
      <PaymentPage room={room}/>
    </div>
  )
}

export default page