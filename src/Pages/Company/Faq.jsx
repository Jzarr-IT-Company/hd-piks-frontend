import React from 'react';
import AppFooter from '../../Components/AppFooter/AppFooter';

function Faq() {
  const FAQ = [
    {
      q: 'What is HDPiks?',
      a: 'HDPiks is an online platform that provides high-quality digital visual content, including stock images, wallpapers, graphics, and other creative assets. Our goal is to help creators, designers, marketers, and businesses access visually appealing resources easily and efficiently.',
    },
    {
      q: 'Is HDPiks free to use?',
      a: 'Yes, HDPiks offers free access to a wide range of digital assets. Some content may be subject to specific usage conditions or licensing terms, which are clearly mentioned on the website. Always review the license information before using any content.',
    },
    {
      q: 'Do I need to create an account to download content?',
      a: 'Some content on HDPiks can be downloaded without creating an account. However, registering an account may be required to access certain features, download limits, or contributor tools.',
    },
    {
      q: 'Can I use HDPiks content for commercial projects?',
      a: 'Usage rights depend on the specific license associated with the content. In general, HDPiks content can be used for personal and creative projects. Commercial use may be allowed unless otherwise stated. You are responsible for ensuring your usage complies with our Terms & Conditions.',
    },
    {
      q: 'Do I need to give credit or attribution?',
      a: 'Attribution is not required unless explicitly mentioned for a specific asset. However, giving credit to HDPiks or the contributor is always appreciated and helps support the creative community.',
    },
    {
      q: 'Can I resell or redistribute HDPiks content?',
      a: 'No. You may not sell, sublicense, redistribute, or make HDPiks content available as standalone files, whether free or paid. Content must be used as part of a larger creative or design project.',
    },
    {
      q: 'Are the images and assets copyrighted?',
      a: 'Yes. All content on HDPiks is protected by copyright laws and is owned by HDPiks or its contributors. Downloading content does not transfer ownership rights.',
    },
    {
      q: 'What file formats are available on HDPiks?',
      a: 'HDPiks may offer content in various formats, including JPG, PNG, PSD, vector files, and other common digital formats, depending on the asset type.',
    },
    {
      q: 'How often is new content added?',
      a: 'We regularly update HDPiks with new content to keep our library fresh, relevant, and aligned with current design trends.',
    },
    {
      q: 'Can I become a contributor on HDPiks?',
      a: 'Yes, HDPiks welcomes creative contributors. If you are interested in sharing your work with our audience, you can apply through the contributor section (if available) or contact us for more information.',
    },
    {
      q: 'How do I report copyright infringement?',
      a: 'If you believe that any content on HDPiks infringes your copyright, please contact us with detailed information, including proof of ownership. We take copyright matters seriously and will take appropriate action.',
    },
    {
      q: 'Is my personal information safe on HDPiks?',
      a: 'Yes. We value your privacy and take appropriate measures to protect your personal data. For full details, please review our Privacy Policy.',
    },
    {
      q: 'Does HDPiks use cookies?',
      a: 'Yes, HDPiks uses cookies to enhance user experience, analyze traffic, and improve website performance. You can manage cookie preferences through your browser settings.',
    },
    {
      q: 'Why is a download not working?',
      a: 'If you experience download issues, it may be due to browser settings, internet connectivity, or temporary server issues. Try refreshing the page or contacting support if the problem persists.',
    },
    {
      q: 'Can I request specific content?',
      a: 'We welcome suggestions from our users. While we cannot guarantee fulfillment of all requests, we value your feedback and use it to improve our content offerings.',
    },
    {
      q: 'Can HDPiks content be used on social media?',
      a: 'Yes, HDPiks content can generally be used on social media platforms as part of your posts or designs, provided the usage complies with our licensing terms.',
    },
    {
      q: 'What should I do if I forget my account password?',
      a: 'If you forget your password, use the “Forgot Password” option on the login page to reset it. Follow the instructions sent to your registered email address.',
    },
    {
      q: 'Can HDPiks change its terms or policies?',
      a: 'Yes. HDPiks reserves the right to update or modify its Terms & Conditions, Privacy Policy, and other site policies at any time. Continued use of the website means you accept the updated policies.',
    },
    {
      q: 'Is HDPiks available worldwide?',
      a: 'Yes, HDPiks is accessible globally. Users from different countries can browse and download content, subject to local laws and regulations.',
    },
    {
      q: 'How can I contact HDPiks support?',
      a: 'If you have any questions, issues, or feedback, please reach out through our Contact Us page. We’ll do our best to assist you promptly.',
    },
  ];

  return (
    <>
      <main className="container py-5">
        <h1 className="h4 mb-3">Frequently Asked Questions</h1>
        <p className="text-muted mb-4">
          Welcome to the HDPiks FAQs page. Here you’ll find answers to the most common questions about using our website, downloading content,
          licensing, accounts, and more. If you don’t find what you’re looking for, feel free to <a href="/company/contact-us">contact us</a>.
        </p>

        <div className="row">
          <div className="col-12">
            {FAQ.map((item, idx) => (
              <div key={idx} className="mb-4">
                <h3 className="h6">{idx + 1}. {item.q}</h3>
                <p className="text-muted mb-0">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <AppFooter />
    </>
  );
}

export default Faq;