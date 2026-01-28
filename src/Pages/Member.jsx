import React, { useEffect, useState, Suspense } from 'react';
import MemeberBanner1 from '../Components/MemeberBanner1/MemeberBanner1';
import { getAllUsers } from '../Services/user.js';
import { Spin } from 'antd';
import MemeberCardSkeletonCompo from '../Components/MemeberCardSkeletonCompoMemeberCardSkeletonCompo/MemeberCardSkeletonCompo';

const MemberBanner2 = React.lazy(() => import('../Components/MemberBanner2/MemberBanner2'));

function Member() {
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const users = await getAllUsers();
        setUserData(users);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <MemeberBanner1 userData={userData} />
      <Suspense fallback={<div style={{ height: "100vh" }} className='d-flex justify-content-center align-items-center'><Spin /></div>}>
        <div className="container">
          <div className="row d-flex gap-3 justify-content-center">
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <MemeberCardSkeletonCompo key={index} />
              ))
            ) : (
              <MemberBanner2 userData={userData} />
            )}
          </div>
        </div>
      </Suspense>
    </>
  );
}

export default Member;
