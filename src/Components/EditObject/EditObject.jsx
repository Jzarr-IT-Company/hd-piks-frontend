import React, { useState } from 'react';
import { Modal, message } from 'antd';
import api from '../../Services/api.js';

function EditObject({ id, initialData, refresh }) {
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState(initialData || {});
  const handleOpen = () => setVisible(true);
  const handleClose = () => setVisible(false);
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSave = async () => {
    try {
      const resp = await api.patch(`/images/${id._id}`, form);
      if (resp.data.status === 200) {
        message.success('Asset updated');
        refresh && refresh();
        handleClose();
      } else {
        message.error(resp.data.message || 'Update failed');
      }
    } catch (err) {
      message.error('Update failed');
    }
  };
  return (
    <>
      <button className='btn btn-light w-100' style={{ fontSize: '13px' }} onClick={handleOpen}>
        <i className="fa-regular fa-pen-to-square me-2"></i> Edit
      </button>
      <Modal open={visible} onCancel={handleClose} onOk={handleSave} title="Edit Asset">
        <input name="title" value={form.title || ''} onChange={handleChange} placeholder="Title" className="form-control mb-2" />
        <input name="description" value={form.description || ''} onChange={handleChange} placeholder="Description" className="form-control mb-2" />
        {/* Add more fields as needed */}
      </Modal>
    </>
  );
}

export default EditObject;