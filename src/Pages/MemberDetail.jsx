import React from 'react'
import { Navigate, useParams } from 'react-router-dom'

function MemberDetail() {
  const { id } = useParams();
  return <Navigate to={`/creatordetail/${id}`} replace />;
}

export default MemberDetail
