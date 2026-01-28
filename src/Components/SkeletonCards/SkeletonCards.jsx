import { ImageList, ImageListItem } from '@mui/material'
import { Skeleton } from 'antd'
import React from 'react'

function SkeletonCards() {
    return (
        <div className="container py-5">
            <ImageList sx={{ width: '100%', height: 'auto' }} variant="masonry" cols={columns} gap={8}>
                {Array.from(new Array(200)).map((_, index) => (
                    <ImageListItem key={index}>
                        <Skeleton.Image style={{ width: '100%', height: 200, borderRadius: 8 }} active />
                    </ImageListItem>
                ))}
            </ImageList>
        </div>
    )
}

export default SkeletonCards