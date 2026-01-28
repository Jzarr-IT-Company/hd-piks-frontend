import { Button } from '@mui/material'
import React from 'react'
import { FaFacebook,} from 'react-icons/fa';

function FacebookShareBttnCompo({ data }) {
    return (
        <Button
            startIcon={<FaFacebook size={35} style={{ color: '#1877F2' }} />}
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://www.yourwebsite.com/image-page/' + data.imageId)}`}
            target="_blank"
            fullWidth
            sx={{ mb: 1 }}
        >
            Share on Facebook
        </Button>

    )
}

export default FacebookShareBttnCompo