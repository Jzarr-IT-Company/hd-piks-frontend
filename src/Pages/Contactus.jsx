import React, { useState } from 'react';

function Contactus() {
  // Define state variables for form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // You can now access the values of form fields
    console.log("Form Values: ", {
      name,
      email,
      subject,
      message
    });

    // You can add form submission logic here (e.g., send to a server)
  };

  return (
    <>
      <section className="py-5 body" style={{
        background:
          'linear-gradient(135deg, rgba(208, 194, 224, 0.7), rgba(255, 236, 235, 0.7), rgba(212, 239, 223, 0.7))',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
      }}>
        <div className="container">
          <div className="row g-0 h-100">
            <div className="col-lg-6 col-md-12 d-flex ">
              <div className="bg-blur shadow rounded p-4 w-100 d-flex flex-column justify-content-center">
                <ul className="list-unstyled flex-grow-1 d-flex flex-column justify-content-center ms-5">
                  <li className="mb-3 d-flex align-items-center">
                    <i
                      className="bi bi-telephone-fill me-3"
                      style={{ color: "white", fontSize: "1.5rem" }}
                    />
                    <div>
                      <h5 style={{ color: "#435461" }}>CALL US</h5>
                      <p>021-3459-5777</p>
                    </div>
                  </li>
                  <li className="mb-3 d-flex align-items-center">
                    <i
                      className="bi bi-geo-alt-fill me-3"
                      style={{ color: "white", fontSize: "1.5rem" }}
                    />
                    <div>
                      <h5 style={{ color: "#435461" }}>ADDRESS</h5>
                      <p>New York, United States</p>
                    </div>
                  </li>
                  <li className="mb-3 d-flex align-items-center">
                    <i
                      className="bi bi-envelope-fill me-3"
                      style={{ color: "white", fontSize: "1.5rem" }}
                    />
                    <div>
                      <h5 style={{ color: "#435461" }}>EMAIL ADDRESS</h5>
                      <p>contact@hdpiks.com</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-lg-6 col-md-12 d-flex ">
              <div className="p-4 rounded bg-white w-100 d-flex flex-column">
                <h2 style={{ color: "#435461" }} className="mb-4 text-center">
                  Get in Touch
                </h2>
                <form className="flex-grow-1" onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <div className="form-floating mb-3">
                      <input
                        type="text"
                        className="form-control"
                        id="floatingInput"
                        placeholder="name@example.com"
                        value={name}
                        onChange={(e) => setName(e.target.value)} // Update name state
                      />
                      <label htmlFor="floatingInput">Name</label>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="form-floating mb-3">
                      <input
                        type="email"
                        className="form-control"
                        id="floatingInput"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} // Update email state
                      />
                      <label htmlFor="floatingInput">Email address</label>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="form-floating mb-3">
                      <input
                        type="text"
                        className="form-control"
                        id="floatingInput"
                        placeholder="Subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)} // Update subject state
                      />
                      <label htmlFor="floatingInput">Subject</label>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="message" className="form-label">
                      Message<span style={{ color: "red" }}>*</span>
                    </label>
                    <textarea
                      className="form-control"
                      id="message"
                      rows={4}
                      placeholder="Write your message"
                      required=""
                      value={message}
                      onChange={(e) => setMessage(e.target.value)} // Update message state
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn w-100 py-3"
                    style={{ backgroundColor: "#58207e", color: "aliceblue" }}
                  >
                    Submit
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Contactus;
