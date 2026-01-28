import React, { useEffect, useRef, useState } from 'react';
import api from '../../Services/api';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api.config';
import { User, Mail, AlignLeft, MapPin, Calendar, Briefcase, Sparkles as SparkleIcon, Globe2, Link2, Instagram } from 'lucide-react';

function EditableCreatorProfile({ onClose }) {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const fileInputRef = useRef();

  useEffect(() => {
    async function fetchCreator() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(API_ENDPOINTS.CREATOR_ME);
        const data = res.data;
        const profile = data.data?.profile || {};
        console.log('Fetched creator profile data:', data);
        setForm({
          displayName: profile.displayName || '',
          bio: profile.bio || '',
          country: profile.country || '',
          city: profile.city || '',
          state: profile.state || '',
          zipCode: profile.zipCode || '',
          dob: profile.dob || '',
          gender: profile.gender || '',
          profession: profile.profession || '',
          skills: Array.isArray(profile.skills) ? profile.skills.join(', ') : (profile.skills || ''),
          website: profile.website || '',
          portfolioLinks: Array.isArray(profile.portfolioLinks) ? profile.portfolioLinks.join(', ') : (profile.portfolioLinks || ''),
          socialLinks: Array.isArray(profile.socialLinks) ? profile.socialLinks.join(', ') : (profile.socialLinks || ''),
        });
        setProfileImageUrl(profile.profileImage?.url || '');
      } catch (err) {
        setError('Failed to load profile.');
      }
      setLoading(false);
    }
    fetchCreator();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setProfileImageUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      let uploadedImageUrl = profileImageUrl;
      if (profileImage) {
        const presignRes = await api.post(API_ENDPOINTS.GET_PRESIGNED_PROFILE_IMAGE_URL, {
          fileName: profileImage.name,
          fileType: profileImage.type,
        });
        const presignData = presignRes.data?.data;
        if (!presignData?.presignedUrl || !presignData?.s3Url) {
          setError('Failed to get presigned URL for image upload.');
          setLoading(false);
          return;
        }
        await axios.put(presignData.presignedUrl, profileImage, {
          headers: { 'Content-Type': profileImage.type },
        });
        // Save S3 URL to creator profile
        const saveRes = await api.post(API_ENDPOINTS.SAVE_CREATOR_PROFILE_IMAGE_URL, {
          s3Url: presignData.s3Url,
          s3Key: presignData.s3Key,
          fileSize: profileImage.size,
          mimeType: profileImage.type
        });
        uploadedImageUrl = saveRes.data.url || presignData.s3Url;
      }
      const payload = {
        displayName: form.displayName,
        bio: form.bio,
        country: form.country,
        city: form.city,
        state: form.state,
        zipCode: form.zipCode,
        dob: form.dob,
        gender: form.gender,
        profession: form.profession,
        skills: form.skills.split(',').map((s) => s.trim()),
        website: form.website,
        portfolioLinks: form.portfolioLinks.split(',').map((l) => l.trim()),
        socialLinks: form.socialLinks.split(',').map((l) => l.trim()),
        profileImage: { url: uploadedImageUrl },
      };
        await api.patch(API_ENDPOINTS.CREATOR_ME, payload);
      setEditMode(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 2000);
      if (onClose) onClose();
    } catch (err) {
      setError('Failed to update profile.');
    }
    setLoading(false);
  };

  if (loading) return <div className="text-center py-5">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!form) return null;

  return (
    <form className="row g-3" style={{ maxWidth: '600px' }} onSubmit={e => { e.preventDefault(); if (editMode) { handleSave(); } else { setEditMode(true); } }}>
      {success && <div className="alert alert-success w-100">{success}</div>}
      <div className="col-12 d-flex flex-column align-items-center mb-3">
        <label htmlFor="profileImage" className="form-label"><User size={20} className="me-2" />Profile Image</label>
        <input
          type="file"
          className="form-control mb-2"
          id="profileImage"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          disabled={!editMode}
          style={{ maxWidth: '250px' }}
        />
        {profileImageUrl ? (
          <img src={profileImageUrl} alt="Creator" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <span className="text-muted">No image</span>
        )}
      </div>
      <div className="col-md-6">
        <label className="form-label"><User size={16} className="me-2" />Name</label>
        <input type="text" className="form-control" name="displayName" value={form.displayName} onChange={handleChange} readOnly={!editMode} />
      </div>
      <div className="col-12">
        <label className="form-label"><AlignLeft size={16} className="me-2" />Bio</label>
        <textarea className="form-control" rows={2} name="bio" value={form.bio} onChange={handleChange} readOnly={!editMode} />
      </div>
      <div className="col-md-6">
        <label className="form-label"><MapPin size={16} className="me-2" />Country</label>
        <input type="text" className="form-control" name="country" value={form.country} onChange={handleChange} readOnly={!editMode} />
      </div>
      <div className="col-md-6">
        <label className="form-label"><MapPin size={16} className="me-2" />City</label>
        <input type="text" className="form-control" name="city" value={form.city} onChange={handleChange} readOnly={!editMode} />
      </div>
      <div className="col-md-6">
        <label className="form-label"><MapPin size={16} className="me-2" />State</label>
        <input type="text" className="form-control" name="state" value={form.state} onChange={handleChange} readOnly={!editMode} />
      </div>
      <div className="col-md-6">
        <label className="form-label"><MapPin size={16} className="me-2" />Zip Code</label>
        <input type="text" className="form-control" name="zipCode" value={form.zipCode} onChange={handleChange} readOnly={!editMode} />
      </div>
      <div className="col-md-6">
        <label className="form-label"><Calendar size={16} className="me-2" />Date of Birth</label>
        <input type="text" className="form-control" name="dob" value={form.dob} onChange={handleChange} readOnly={!editMode} />
      </div>
      <div className="col-md-6">
        <label className="form-label"><User size={16} className="me-2" />Gender</label>
        <input type="text" className="form-control" name="gender" value={form.gender} onChange={handleChange} readOnly={!editMode} />
      </div>
      <div className="col-md-6">
        <label className="form-label"><Briefcase size={16} className="me-2" />Profession</label>
        <input type="text" className="form-control" name="profession" value={form.profession} onChange={handleChange} readOnly={!editMode} />
      </div>
      <div className="col-md-6">
        <label className="form-label"><SparkleIcon size={16} className="me-2" />Skills</label>
        <input type="text" className="form-control" name="skills" value={form.skills} onChange={handleChange} readOnly={!editMode} />
      </div>
      <div className="col-12">
        <label className="form-label"><Globe2 size={16} className="me-2" />Website</label>
        <input type="text" className="form-control" name="website" value={form.website} onChange={handleChange} readOnly={!editMode} />
      </div>
      <div className="col-12">
        <label className="form-label"><Link2 size={16} className="me-2" />Portfolio Links</label>
        <input type="text" className="form-control" name="portfolioLinks" value={form.portfolioLinks} onChange={handleChange} readOnly={!editMode} />
      </div>
      <div className="col-12">
        <label className="form-label"><Instagram size={16} className="me-2" />Social Links</label>
        <input type="text" className="form-control" name="socialLinks" value={form.socialLinks} onChange={handleChange} readOnly={!editMode} />
      </div>
      <div className="col-12 d-flex justify-content-start mt-3">
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {editMode ? (loading ? 'Saving...' : 'Save') : 'Edit'}
        </button>
        {editMode && (
          <button className="btn btn-secondary ms-2" type="button" onClick={() => setEditMode(false)} disabled={loading}>Cancel</button>
        )}
      </div>
    </form>
  );
}

export default EditableCreatorProfile;
