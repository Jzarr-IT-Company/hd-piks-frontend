import React from 'react';
import AppFooter from '../../Components/AppFooter/AppFooter';

function AboutUs() {
  return (
    <>
      <main className="container py-5">
        <div className="row align-items-center mb-5">
          <div className="col-lg-7">
            <h1 className="display-5 fw-bold">About HDPiks</h1>
            <p className="lead text-muted">
              Welcome to HDPiks – your ultimate destination for high‑quality digital visuals
              designed to inspire creativity and empower ideas.
            </p>
            <p className="text-muted">
              At HDPiks, we believe that great design starts with great resources. Our mission
              is to make premium‑quality visual content easily accessible to everyone, whether you
              are a designer, developer, marketer, content creator, student, or business owner.
              We aim to simplify the creative process by providing a growing library of visually
              stunning and professionally crafted digital assets.
            </p>
          </div>

          <div className="col-lg-5">
            <div
              className="rounded overflow-hidden"
              style={{
                minHeight: 220,
                background: 'linear-gradient(180deg,#eef1f6,#f7f7fb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#444',
                textAlign: 'center',
                padding: 20,
              }}
            >
              <div>
                <h5 className="mb-2">Professional Visuals</h5>
                <p className="small text-muted mb-0">
                  High-resolution images, wallpapers, graphics and more — curated for creators.
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="mb-5">
          <h2 className="h4">Who We Are</h2>
          <p className="text-muted">
            HDPiks is an online platform dedicated to offering a wide range of high‑resolution images,
            wallpapers, graphics, and other creative assets that help bring projects to life. We are
            passionate about creativity, innovation, and digital freedom. Our platform is built to serve
            both beginners and professionals who need reliable, visually appealing resources without
            unnecessary complexity.
          </p>
          <p className="text-muted">
            We understand how challenging it can be to find the right visual content that matches your
            creative vision. That’s why HDPiks focuses on quality, usability, and simplicity, so you can
            spend less time searching and more time creating.
          </p>
        </section>

        <section className="mb-5">
          <h2 className="h4">Our Mission</h2>
          <p className="text-muted">
            Our mission is simple:
          </p>
          <ul className="text-muted">
            <li>To provide high‑quality digital assets that are easy to access and use</li>
            <li>To support creators, designers, and businesses worldwide</li>
            <li>To build a trusted platform where creativity thrives</li>
            <li>To continuously improve and expand our content library</li>
          </ul>
          <p className="text-muted">
            We are committed to making HDPiks a reliable resource for anyone looking to enhance their
            digital projects with professional visuals.
          </p>
        </section>

        <section className="mb-5">
          <h2 className="h4">What We Offer</h2>
          <p className="text-muted">
            HDPiks offers a diverse collection of digital content, including but not limited to:
          </p>
          <ul className="text-muted">
            <li>High‑resolution stock images</li>
            <li>Wallpapers and backgrounds</li>
            <li>Creative graphics and design assets</li>
            <li>Visual resources for websites, apps, and marketing</li>
          </ul>
          <p className="text-muted">
            Our content is carefully curated and regularly updated to ensure freshness, relevance, and
            quality. We aim to meet the evolving needs of modern digital creators across various industries.
          </p>
        </section>

        <section className="mb-5">
          <h2 className="h4">Our Community</h2>
          <p className="text-muted">
            HDPiks is more than just a content platform — it’s a growing creative community. We value
            collaboration and creativity, and we welcome contributors who want to share their work with
            a global audience.
          </p>
          <p className="text-muted">
            By connecting creators and users, we create an ecosystem where talent is recognized and
            creativity is rewarded. Every asset on HDPiks plays a role in helping someone else build,
            design, or communicate better.
          </p>
        </section>

        <section className="mb-5">
          <h2 className="h4">Why Choose HDPiks</h2>
          <div className="row">
            <div className="col-md-6">
              <ul className="text-muted">
                <li><strong>Quality First:</strong> We focus on high‑resolution, visually appealing content.</li>
                <li><strong>User‑Friendly Platform:</strong> Simple navigation and easy downloads.</li>
              </ul>
            </div>
            <div className="col-md-6">
              <ul className="text-muted">
                <li><strong>Creative Freedom:</strong> Resources designed to support creative expression.</li>
                <li><strong>Continuous Growth:</strong> Regular updates and expanding collections.</li>
              </ul>
            </div>
          </div>
          <p className="text-muted mt-3">
            Our goal is to provide a smooth and enjoyable experience from the moment you land on our website.
          </p>
        </section>

        <section className="mb-5">
          <h2 className="h4">Our Vision</h2>
          <p className="text-muted">
            We envision HDPiks as a globally recognized platform for digital visual resources — one that
            empowers creativity without limits. As technology and design trends evolve, we aim to grow
            alongside them, introducing new features, tools, and content categories to better serve our users.
          </p>
        </section>

        <section className="mb-5">
          <h2 className="h4">Commitment to Users</h2>
          <p className="text-muted">
            User satisfaction is at the core of everything we do. We are dedicated to maintaining transparency,
            respecting user privacy, and continuously improving our services based on feedback and innovation.
          </p>
          <p className="text-muted">
            Whether you are working on a personal project or a professional campaign, HDPiks is here to support your creative journey.
          </p>
        </section>

        <section className="mb-5">
          <h2 className="h4">Get in Touch</h2>
          <p className="text-muted">
            We love hearing from our users. If you have questions, suggestions, or feedback, feel free to reach out
            through our <a href="/company/contact-us">Contact Us</a> page. Your input helps us grow and improve.
          </p>
          <p className="text-muted">
            Thank you for choosing HDPiks. Create freely. Design boldly. Inspire endlessly.
          </p>
        </section>
      </main>

      <AppFooter />
    </>
  );
}

export default AboutUs;