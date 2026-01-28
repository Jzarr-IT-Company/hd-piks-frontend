import { Skeleton } from 'antd';
import React from 'react'

function MemeberCardSkeletonCompo() {
    return (
        <div className="col-md-4">
          <div className="card rounded-4 position-relative card-hover">
            <Skeleton.Image active style={{ width: "100%", height: "160px", borderRadius: "16px 16px 0 0" }} />
            <div className="card-body rounded-bottom-4" style={{ backgroundColor: "#80019d" }}>
              <div className="d-flex flex-column justify-content-center align-items-center">
                <Skeleton.Avatar active size={80} style={{ marginTop: "-40px" }} />
                <Skeleton.Input active size="small" style={{ width: "60%", marginTop: "10px" }} />
                <Skeleton.Button active size="small" style={{ width: "50%", marginTop: "10px" }} />
              </div>
            </div>
          </div>
        </div>
      );
}

export default MemeberCardSkeletonCompo