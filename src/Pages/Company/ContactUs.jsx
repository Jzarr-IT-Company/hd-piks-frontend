import React, { useState } from 'react';
import AppFooter from '../../Components/AppFooter/AppFooter';

 function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      // Replace with real API call if available
      // await api.post(API_ENDPOINTS.CONTACT, form);
      alert('Message sent (demo)');
      setForm({ name: '', email: '', message: '' });
    } catch {
      alert('Send failed');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <main className="container py-5">
        <h1 className="h4 mb-3">Contact Us</h1>
        <p className="text-muted">Questions, support or partnerships — send us a message.</p>

        <form onSubmit={handleSubmit} className="row g-3 mt-3">
          <div className="col-md-6">
            <input name="name" value={form.name} onChange={handleChange} className="form-control" placeholder="Your name" required />
          </div>
          <div className="col-md-6">
            <input name="email" value={form.email} onChange={handleChange} type="email" className="form-control" placeholder="Email" required />
          </div>
          <div className="col-12">
            <textarea name="message" value={form.message} onChange={handleChange} className="form-control" rows={6} placeholder="How can we help?" required />
          </div>
          <div className="col-12">
            <button className="btn btn-primary" type="submit" disabled={sending}>
              {sending ? 'Sending…' : 'Send Message'}
            </button>
          </div>
        </form>
      </main>

      <AppFooter />
    </>
  );
}

export default ContactUs;