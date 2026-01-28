import React from 'react'
import Divider from '@mui/material/Divider';
import { Box } from '@mui/material';
function DashboardBanner2() {
    return (
        <>
            <div className="container mt-2">
                <div className="row">
                    <div className="col-12 d-flex justify-content-center">
                        <div className="d-flex align-items-center justify-content-between w-25">
                            <div className="text-center">
                                <p>Followers</p>
                                <p>0</p>
                            </div>
                            <div className="mb-3">
                                <Box sx={{ height: '43px', display: 'flex', alignItems: 'center' }}>
                                    <Divider orientation="vertical" variant="middle" flexItem />
                                </Box>
                            </div>
                            <div className="text-center">
                                <p>Following</p>
                                <p>0</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default DashboardBanner2