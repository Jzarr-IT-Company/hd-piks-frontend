import React from 'react';

const MemberBanner1 = React.memo(({ userData }) => {
    const memberCount = Array.isArray(userData) ? userData.length : 0;

    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-12">
                    <div>
                        <h3 className="fw-bold fs-2">Members ({memberCount})</h3>
                        <p>Explore our members and their portfolio of resources.</p>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default MemberBanner1;
