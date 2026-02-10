import React from 'react';
import AppFooter from '../../Components/AppFooter/AppFooter';

function Privacy() {
  return (
    <>
      <main className="container py-5">
        <h1 className="h4 mb-2">Privacy Policy</h1>
        <p className="text-muted mb-4"><strong>Last Updated:</strong> 1st-Feb-2026</p>

        <p className="text-muted">
          Welcome to HDPiks (https://www.hdpiks.com). Your privacy is very important to us. This Privacy Policy explains how HDPiks (“we”, “our”, “us”) collects, uses, stores, protects, and discloses information when you visit or use our website, services, and digital content (collectively, the “Website”).
        </p>

        <p className="text-muted">
          By accessing or using HDPiks, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree with this policy, please discontinue use of the Website.
        </p>

        <h2 className="h5 mt-4">1. Information We Collect</h2>
        <p className="text-muted">We collect different types of information to provide and improve our services.</p>

        <h3 className="h6 mt-3">1.1 Personal Information</h3>
        <p className="text-muted">
          Personal information is data that can be used to identify you directly or indirectly. We may collect personal information when you:
        </p>
        <ul className="text-muted">
          <li>Register an account</li>
          <li>Subscribe to newsletters</li>
          <li>Contact us via forms or email</li>
          <li>Upload or download content</li>
        </ul>
        <p className="text-muted">Personal information may include name, email address, username, IP address, and any information you voluntarily provide.</p>

        <h3 className="h6 mt-3">1.2 Non-Personal Information</h3>
        <p className="text-muted">
          We also collect non-personal information automatically when you use the Website, including browser type and version, device type, operating system, referring URLs, pages visited, time spent, and date/time of visits. This data is used for analytics, security, and performance optimization.
        </p>

        <h2 className="h5 mt-4">2. How We Use Your Information</h2>
        <p className="text-muted">
          HDPiks uses collected information to operate and maintain the Website, create and manage user accounts, communicate with users (updates, notifications, support), improve user experience and content quality, monitor usage, prevent fraud, enhance security, and comply with legal obligations. We do not sell, rent, or trade your personal information to third parties.
        </p>

        <h2 className="h5 mt-4">3. Cookies and Tracking Technologies</h2>
        <h3 className="h6 mt-3">3.1 What Are Cookies?</h3>
        <p className="text-muted">Cookies are small data files stored on your device that help us recognize users, remember preferences, and analyze traffic.</p>
        <h3 className="h6 mt-3">3.2 How We Use Cookies</h3>
        <p className="text-muted">We use cookies to remember preferences, enable essential website functionality, analyze traffic and usage patterns, and improve performance and security. You can disable cookies through your browser settings; however, doing so may affect some features of the Website.</p>

        <h2 className="h5 mt-4">4. Log Files</h2>
        <p className="text-muted">
          Like many websites, HDPiks follows a standard procedure of using log files which may record IP addresses, browser type, ISP, date/time stamps, and referring/exit pages. This information is not linked to personally identifiable information and is used for analytics and security.
        </p>

        <h2 className="h5 mt-4">5. Third-Party Services</h2>
        <p className="text-muted">
          HDPiks may use third-party services such as analytics providers, advertising partners, or hosting providers. These third parties may collect information according to their own privacy policies. HDPiks has no control over how third-party services use collected data. Examples include Google Analytics, advertising networks, and cloud hosting providers.
        </p>

        <h2 className="h5 mt-4">6. Advertising Partners Privacy Policies</h2>
        <p className="text-muted">
          Some advertisers on HDPiks may use cookies, JavaScript, or web beacons in their advertisements to measure effectiveness and personalize ads. HDPiks’ Privacy Policy does not apply to other advertisers or websites; please consult third-party ad servers' privacy policies for details.
        </p>

        <h2 className="h5 mt-4">7. Data Protection Rights</h2>
        <p className="text-muted">
          Depending on your location, you may have rights including access to your personal data, correction or updating, deletion, restriction or objection to processing, and data portability. To exercise these rights, please contact us via the Website.
        </p>

        <h2 className="h5 mt-4">8. GDPR (General Data Protection Regulation)</h2>
        <p className="text-muted">
          If you are a resident of the European Economic Area (EEA), you have specific rights under GDPR such as the right to be informed, access, rectification, erasure, restrict processing, and object to processing. HDPiks processes personal data only when legally permitted, e.g., with your consent or to fulfill contractual obligations.
        </p>

        <h2 className="h5 mt-4">9. CCPA (California Consumer Privacy Act)</h2>
        <p className="text-muted">
          Under the CCPA, California consumers may request disclosure of collected personal data, request deletion, and opt-out of the sale of personal data (if applicable). HDPiks does not sell personal information.
        </p>

        <h2 className="h5 mt-4">10. Children’s Information</h2>
        <p className="text-muted">
          HDPiks does not knowingly collect personally identifiable information from children under 13. If you believe a child has provided information, contact us and we will promptly remove such information.
        </p>

        <h2 className="h5 mt-4">11. Data Security</h2>
        <p className="text-muted">
          We implement appropriate technical and organizational security measures to protect your information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure and we cannot guarantee absolute security.
        </p>

        <h2 className="h5 mt-4">12. Data Retention</h2>
        <p className="text-muted">
          We retain personal information only as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
        </p>

        <h2 className="h5 mt-4">13. Changes to This Privacy Policy</h2>
        <p className="text-muted">
          HDPiks may update this Privacy Policy occasionally. Any changes will be posted on this page with an updated “Last Updated” date. Continued use of the Website after changes constitutes acceptance of the revised policy.
        </p>

        <h2 className="h5 mt-4">14. Consent</h2>
        <p className="text-muted">
          By using our Website, you consent to this Privacy Policy and agree to its terms.
        </p>

        <h2 className="h5 mt-4">15. Contact Us</h2>
        <p className="text-muted">
          If you have questions, concerns, or requests regarding this Privacy Policy, please contact us through the <a href="/company/contact-us">contact form</a> on the Website.
        </p>

        <p className="text-muted mt-4">
          This Privacy Policy applies solely to online activities and is valid for visitors to our Website with regards to the information that they share and/or collect on HDPiks.
        </p>
      </main>

      <AppFooter />
    </>
  );
}

export default Privacy;