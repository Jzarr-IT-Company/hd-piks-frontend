import React from 'react'

function BackBtnCompo() {
    const handleBack=()=>{
        window.history.back()
    }
  return (
    <button className='btn btn-light' onClick={handleBack}>Back</button>

  )
}

export default BackBtnCompo