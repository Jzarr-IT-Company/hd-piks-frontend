import React, { useEffect, useState } from 'react'
import MemberDetailBanner1 from '../Components/MemberDetailBanner1/MemberDetailBanner1'
import MemberDetailBanner2 from '../Components/MemberDetailBanner2/MemberDetailBanner2'
import { getUserById } from '../Services/user.js'
import { useParams } from 'react-router-dom'

function MemberDetail() {
  const { id } = useParams();
  const [filterationData,setFilterationData]=useState([]);
  useEffect(() => {
    (async () => {
      try {
        const user = await getUserById(id);
        setFilterationData(user ? [user] : []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    })();
  }, [id]);
  
  return (
    <>
      <MemberDetailBanner1 filterationData={filterationData} />
      <MemberDetailBanner2 filterationData={filterationData}/>
    </>
  )
}

export default MemberDetail