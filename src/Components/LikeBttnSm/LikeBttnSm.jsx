import React, { useState } from 'react';
import Cookies from 'js-cookie';
import api from '../../Services/api.js';
import { API_ENDPOINTS } from '../../config/api.config.js';

function LikeBttnSm({ imgId }) {
    const [liked, setLiked] = useState(false);
    const id = Cookies.get('id');

    const handleClick = async () => {
        try {
            setLiked(!liked);

            if (!liked) {
                const response = await api.post(API_ENDPOINTS.SAVE_LIKE, {
                    imageId: imgId, 
                    userId: id
                });
                console.log("Liked RESPONSE", response);
            } else {
                const response = await api.post(API_ENDPOINTS.UNLIKE, {
                    userId: id
                });
                console.log("Unliked RESPONSE", response);
            }
        } catch (error) {
            console.error("Error in like/unlike action:", error.message);
        }
    };

    return (
        <button
            onClick={handleClick}
            style={{ fontSize: "11px" }}
            className={`btn border px-4 fw-semibold py-3 ${liked ? 'text-danger' : 'text-secondary'}`}
        >
            <i className={liked ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
            {liked ? " Liked" : " Like"}
        </button>
    );
}

export default LikeBttnSm;
