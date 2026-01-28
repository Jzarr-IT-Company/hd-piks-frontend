import { message } from 'antd';
import api from '../../Services/api.js';
import React from 'react';

function DeleteObject({ id, refresh }) {
    const deleteObjct = async () => {
        try {
            const resp = await api.delete(`/images/${id._id}`);
            if (resp.data.status === 200) {
                message.success('Successfully deleted asset');
                refresh();
            } else {
                message.error(resp.data.message || 'Delete failed');
            }
        } catch (err) {
            message.error('Delete failed');
        }
    };
    return (
        <button className='btn btn-danger w-100' onClick={deleteObjct} style={{ fontSize: '13px' }}>
            <i className="fa-solid fa-trash me-3"></i> Delete
        </button>
    );
}

export default DeleteObject;