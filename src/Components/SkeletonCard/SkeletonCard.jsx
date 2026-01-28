import { ImageList, ImageListItem } from '@mui/material'
import { Skeleton } from 'antd'
import React, { useEffect, useState } from 'react'
import debounce from 'lodash.debounce';

function SkeletonCard() {
    const [columns, setColumns] = useState(3);
    useEffect(() => {
        const updateColumns = () => {
            if (window.innerWidth < 567) setColumns(2);
            else if (window.innerWidth < 900) setColumns(3);
            else setColumns(4);
        };

        const handleResize = debounce(updateColumns, 100);
        window.addEventListener('resize', handleResize);
        updateColumns();  
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return (
        <div className="container py-5">
            <ImageList sx={{ width: '100%', height: 'auto' }} variant="masonry" cols={columns} gap={8}>
                {Array.from(new Array(6)).map((_, index) => (
                    <ImageListItem key={index}>
                        <Skeleton.Image
                            className="w-100"
                            style={{ width: '100%', height: 200, borderRadius: 8 }}
                            active
                        />
                    </ImageListItem>
                ))}
            </ImageList>
        </div>
    )
}

export default SkeletonCard