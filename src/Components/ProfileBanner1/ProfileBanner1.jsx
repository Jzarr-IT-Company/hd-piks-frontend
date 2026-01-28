import React, { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { User, Mail, MapPin, Globe2, Link2, Sparkles, AlignLeft, FileText, Clock, CheckCircle2, Briefcase, Calendar, Instagram, Facebook } from 'lucide-react';
import { useGlobalState } from '../../Context/Context';
import ProfileBanner1Bttn from '../ProfileBanner1Bttn/ProfileBanner1Bttn';
import ProfileBanner1UploadImages from '../ProfileBanner1UploadImages/ProfileBanner1UploadImages';

import CreatorProfileImageUpload from '../ProfileBanner1UploadImages/CreatorProfileImageUpload';

function ProfileBanner1() {
    const {
        fullName, setFullName,
        email,
        dob, setDob,
        gender, setGender,
        profession, setProfession,
        skills, setSkills,
        portfolioLink, setPortfolioLink,
        country, setCountry,
        state, setState,
        city, setCity,
        zipCode, setZipCode,
        bio, setBio,
        socialMediaLinks, setSocialMediaLinks,
        userData,
        creatorData,
        showContributorForm,
        termsChecked, setTermsChecked,
    } = useGlobalState();

    const [creatorProfileImage, setCreatorProfileImage] = React.useState(creatorData?.profile?.profileImage?.url || '');

    const [step, setStep] = React.useState(1);

    const location = useLocation();
    const isContributorRoute = location.pathname === '/profile/contributor';

    // Hydrate user profile fields by default; use creator profile only on contributor route
    useEffect(() => {
        if (!isContributorRoute) {
            if (userData?.name) setFullName(userData.name);
            if (userData?.PortfolioLink) setPortfolioLink(userData.PortfolioLink);
            if (userData?.country) setCountry(userData.country);
            if (userData?.city) setCity(userData.city);
            if (userData?.addbio) setBio(userData.addbio);
            if (userData?.gender) setGender(userData.gender);
            if (userData?.Skills) setSkills(userData.Skills);

            if (Array.isArray(userData?.SocialMediaLinks) && userData.SocialMediaLinks.length) {
                setSocialMediaLinks(userData.SocialMediaLinks);
            }
            return;
        }

        const profile = creatorData?.profile || {};
        if (profile.displayName) setFullName(profile.displayName);
        if (profile.website) setPortfolioLink(profile.website);
        if (profile.country) setCountry(profile.country);
        if (profile.state) setState(profile.state);
        if (profile.city) setCity(profile.city);
        if (profile.zipCode) setZipCode(profile.zipCode);
        if (profile.bio) setBio(profile.bio);
        if (profile.gender) setGender(profile.gender);
        if (profile.dob) setDob(profile.dob);
        if (profile.profession) setProfession(profile.profession);

        if (profile.skills) {
            const skillsValue = Array.isArray(profile.skills) ? profile.skills.join(', ') : profile.skills;
            setSkills(skillsValue);
        }

        const mergedLinks = [...(profile.portfolioLinks || []), ...(profile.socialLinks || [])];
        if (mergedLinks.length) {
            setSocialMediaLinks((prev) => {
                const next = prev && prev.length ? [...prev] : [];
                mergedLinks.forEach((url, idx) => {
                    if (!next[idx]) {
                        next[idx] = { platform: next[idx]?.platform || `Link ${idx + 1}`, url };
                    } else {
                        next[idx] = { ...next[idx], url };
                    }
                });
                return next;
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userData, creatorData, isContributorRoute]);

    const contributorStatus = creatorData?.status || 'not-applied';
    const isContributor = isContributorRoute;
    const shouldShowContributorForm = isContributorRoute;

    const heading = isContributor
        ? 'My contributor profile'
        : shouldShowContributorForm
            ? 'Apply as contributor'
            : 'My profile';

    const helperText = isContributor
        ? 'Your contributor details are visible to users once approved.'
        : shouldShowContributorForm
            ? 'Complete these details to submit your contributor application.'
            : 'You are browsing as a user. Click "Switch to contributor" to start your application.';

    useEffect(() => {
        if (!isContributorRoute) {
            setStep(1);
            return;
        }
        if (contributorStatus === 'approved' || contributorStatus === 'pending') {
            setStep(3);
        } else {
            setStep(1);
        }
    }, [isContributorRoute, contributorStatus]);

    const goToNextStep = () => setStep((prev) => Math.min(prev + 1, 3));
    const goToProfileStep = () => setStep(2);
    const goToStatusStep = () => setStep(3);

    const professionalPlatforms = useMemo(() => [
        { platform: 'Shutterstock', placeholder: 'https://www.shutterstock.com/', Icon: Link2 },
        { platform: 'Adobe Stock', placeholder: 'https://stock.adobe.com/', Icon: Link2 },
        { platform: 'iStock', placeholder: 'https://www.istockphoto.com/', Icon: Link2 },
        { platform: 'Portfolio', placeholder: 'https://www.myportfolio.com/', Icon: Link2 },
    ], []);

    const socialPlatforms = useMemo(() => [
        { platform: 'Instagram', placeholder: 'https://instagram.com/yourhandle', Icon: Instagram },
        { platform: 'Facebook', placeholder: 'https://facebook.com/yourpage', Icon: Facebook },
    ], []);

    const countries = [
        "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia",
        "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin",
        "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
        "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia",
        "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica",
        "Dominican Republic", "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia",
        "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece",
        "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India",
        "Indonesia", "Iran", "Iraq", "Ireland", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya",
        "Kiribati", "Korea (North)", "Korea (South)", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho",
        "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives",
        "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco",
        "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand",
        "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea",
        "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis",
        "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia",
        "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia",
        "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan",
        "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan",
        "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
        "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
    ];

    const getLinkValue = (platform) => socialMediaLinks.find((link) => link.platform === platform)?.url || '';

    const upsertLink = (platform, url) => {
        const exists = socialMediaLinks.some((link) => link.platform === platform);
        const next = socialMediaLinks.map((link) => link.platform === platform ? { ...link, url } : link);
        if (!exists) next.push({ platform, url });
        setSocialMediaLinks(next);
    };

    const Stepper = () => {
        const steps = [
            { id: 1, label: 'Terms and conditions' },
            { id: 2, label: 'Profile' },
            { id: 3, label: 'Welcome' },
        ];

        return (
            <div className="contrib-stepper mb-4">
                {steps.map((item, idx) => {
                    const active = step === item.id;
                    const done = step > item.id;
                    return (
                        <React.Fragment key={item.id}>
                            <div className="contrib-stepper__item">
                                <div
                                    className={`contrib-stepper__circle ${active ? 'contrib-stepper__circle--active' : ''} ${done ? 'contrib-stepper__circle--done' : ''}`}
                                >
                                    {item.id}
                                </div>
                                <div className={`contrib-stepper__label ${active ? 'contrib-stepper__label--active' : ''} ${done ? 'contrib-stepper__label--done' : ''}`}>
                                    {item.label}
                                </div>
                            </div>
                            {idx < steps.length - 1 && (
                                <div
                                    className="contrib-stepper__connector"
                                    style={{ background: done ? '#2563eb' : '#e5e7eb' }}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        );
    };

    if (!shouldShowContributorForm) {
        return (
            <div className="profile-wrap">
                <div className="profile-card profile-card__side">
                    <h3 className="profile-title d-flex align-items-center gap-2">
                        <User size={18} strokeWidth={1.6} />
                        My profile
                    </h3>
                    <p className="text-muted" style={{ marginBottom: '12px' }}>Update your user details.</p>
                    <ProfileBanner1UploadImages />
                    <div className="mt-4">
                        <label className="profile-label d-flex align-items-center gap-2">
                            <AlignLeft size={16} strokeWidth={1.6} /> Bio
                        </label>
                        <textarea
                            rows={5}
                            className="form-control"
                            placeholder="Short bio about yourself (max 150 characters)"
                            value={bio || ''}
                            onChange={(e) => { setBio(e.target.value); }}
                        />
                    </div>
                </div>

                <div className="profile-card profile-card__main">
                    <section className="profile-section">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                            <h5 className="mb-0 d-flex align-items-center gap-2">
                                <User size={18} strokeWidth={1.6} /> Personal information
                            </h5>
                            <small className="text-muted">Visible to you</small>
                        </div>
                        <div className="profile-grid">
                            <div>
                                <label className="profile-label d-flex align-items-center gap-2">
                                    <User size={16} strokeWidth={1.6} /> Full name
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={fullName || ''}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Your name"
                                />
                            </div>
                            <div>
                                <label className="profile-label d-flex align-items-center gap-2">
                                    <Mail size={16} strokeWidth={1.6} /> Email
                                </label>
                                <input
                                    type="email"
                                    className="form-control"
                                    value={email || ''}
                                    disabled
                                />
                            </div>
                            <div>
                                <label className="profile-label d-flex align-items-center gap-2">
                                    <MapPin size={16} strokeWidth={1.6} /> Country
                                </label>
                                <select
                                    className="form-select"
                                    value={country || ''}
                                    onChange={(e) => setCountry(e.target.value)}
                                >
                                    <option value="" disabled>Select Country</option>
                                    {countries.map((countryName, index) => (
                                        <option key={index} value={countryName}>
                                            {countryName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="profile-label d-flex align-items-center gap-2">
                                    <MapPin size={16} strokeWidth={1.6} /> City
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={city || ''}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="City"
                                />
                            </div>
                            <div>
                                <label className="profile-label">Gender</label>
                                <select
                                    className="form-select"
                                    value={gender || ''}
                                    onChange={(e) => setGender(e.target.value)}
                                >
                                    <option value="" disabled>Select</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <section className="profile-section">
                        <h5 className="mb-3 d-flex align-items-center gap-2">
                            <Link2 size={18} strokeWidth={1.6} /> Links & skills
                        </h5>
                        <div className="profile-grid">
                            <div>
                                <label className="profile-label d-flex align-items-center gap-2">
                                    <Globe2 size={16} strokeWidth={1.6} /> Portfolio link
                                </label>
                                <input
                                    type="url"
                                    className="form-control"
                                    value={portfolioLink || ''}
                                    onChange={(e) => setPortfolioLink(e.target.value)}
                                    placeholder="https://www.example.com"
                                />
                            </div>
                            <div>
                                <label className="profile-label d-flex align-items-center gap-2">
                                    <Sparkles size={16} strokeWidth={1.6} /> Skills
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={skills || ''}
                                    onChange={(e) => setSkills(e.target.value)}
                                    placeholder="E.g., Photoshop, Figma"
                                />
                            </div>
                            {socialMediaLinks.map((link, idx) => (
                                <div key={idx}>
                                    <label className="profile-label d-flex align-items-center gap-2">
                                        <Link2 size={16} strokeWidth={1.6} /> {link.platform || `Link ${idx + 1}`}
                                    </label>
                                    <input
                                        type="url"
                                        className="form-control"
                                        value={link.url}
                                        onChange={(e) => {
                                            const next = [...socialMediaLinks];
                                            next[idx] = { ...next[idx], url: e.target.value };
                                            setSocialMediaLinks(next);
                                        }}
                                        placeholder="https://"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="mt-3">
                        <ProfileBanner1Bttn />
                    </div>
                </div>
            </div>
        );
    }

    const renderContributorContent = () => {
        if (step === 1) {
            return (
                <div className="contrib-shell">
                    <Stepper />
                    <div className="contrib-card" style={{ maxWidth: '1140px', margin: '0 auto', width: '100%' }}>
                        <div className="text-center mb-3">
                            <h4 className="mb-1 d-flex align-items-center justify-content-center gap-2">
                                <FileText size={18} /> Contributor terms
                            </h4>
                            <p className="text-muted mb-0">Accept the latest contributor license to continue.</p>
                        </div>
                        <div className="contrib-terms mb-3">
                            <p><strong>Updated:</strong> March 2024 — by proceeding you acknowledge you own the rights to every upload and you grant the platform a worldwide license to publish and distribute your works.</p>
                            <p>Content must respect intellectual property laws. Do not upload AI-generated, third-party, or sensitive material without written permission. Repeated violations can lead to suspension or removal from the program.</p>
                            <p>Payouts, taxation, and identity verification follow your country’s regulations and our payment partners’ policies. You agree to provide accurate information for compliance checks and to keep your details up to date.</p>
                            <p>We may contact you about portfolio curation, legal notices, or program updates. If you disagree with any clause, do not continue with the contributor application.</p>
                            <div className="form-check mt-2">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="termsCheck"
                                    checked={termsChecked}
                                    onChange={(e) => setTermsChecked(e.target.checked)}
                                />
                                <label className="form-check-label" htmlFor="termsCheck">
                                    I accept the contributor terms and conditions.
                                </label>
                            </div>
                        </div>
                        <div className="contrib-actions">
                            <button
                                className="btn btn-primary fw-semibold"
                                disabled={!termsChecked}
                                onClick={goToNextStep}
                            >
                                Accept & continue
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        if (step === 3) {
            const isApproved = contributorStatus === 'approved';
            return (
                <div className="contrib-shell">
                    <Stepper />
                    <div className="contrib-card" style={{ maxWidth: '880px', margin: '0 auto', width: '100%' }}>
                        <div className="text-center mb-3">
                            <div className="d-flex justify-content-center mb-2">
                                {isApproved ? <CheckCircle2 size={32} className="text-success" /> : <Clock size={32} className="text-warning" />}
                            </div>
                            <h4 className="mb-1">{isApproved ? 'Welcome to the dashboard' : 'Application pending'}</h4>
                            <p className="text-muted mb-3">
                                {isApproved
                                    ? 'Your contributor profile is approved. Head to the dashboard to start uploading.'
                                    : 'Your application is under review. This usually takes 2-4 business days. We will notify you once it is decided.'}
                            </p>
                            <div className="d-flex justify-content-center gap-2">
                                {isApproved ? (
                                    <button className="btn btn-primary" onClick={() => window.location.assign('/dashboard')}>
                                        Go to dashboard
                                    </button>
                                ) : (
                                    <button className="btn btn-outline-primary" onClick={goToProfileStep}>
                                        Update profile
                                    </button>
                                )}
                                {!isApproved && (
                                    <button className="btn btn-link text-decoration-none" onClick={() => window.location.assign('/profile/contributor')}>
                                        View application
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // Step 2: contributor profile form
        return (
            <div className="contrib-shell">
                <Stepper />
                <div className="contrib-card" style={{ maxWidth: '1160px', margin: '0 auto', width: '100%' }}>
                    <div className="mb-3">
                        <h4 className="mb-1">Contributor profile</h4>
                        <p className="text-muted mb-0">Share your public details and portfolio links. This mirrors the Freepik contributor flow.</p>
                    </div>

                    <section className="profile-section">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                            <h5 className="mb-0">Information</h5>
                            <small className="text-muted">Visible to users</small>
                        </div>
                        <div className="contrib-grid">
                            <div>
                                <label className="profile-label d-flex align-items-center gap-2"><User size={16} /> Public Author username</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="e.g. devjzarr"
                                />
                            </div>
                            <div>
                                <label className="profile-label d-flex align-items-center gap-2"><Globe2 size={16} /> Website</label>
                                <input
                                    type="url"
                                    className="form-control"
                                    value={portfolioLink}
                                    onChange={(e) => setPortfolioLink(e.target.value)}
                                    placeholder="https://www.example.com"
                                />
                            </div>
                            <div>
                                <label className="profile-label d-flex align-items-center gap-2"><MapPin size={16} /> Country</label>
                                <select
                                    className="form-select"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                >
                                    <option value="" disabled>Select Country</option>
                                    {countries.map((countryName, index) => (
                                        <option key={index} value={countryName}>
                                            {countryName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </section>

                    <section className="profile-section">
                        <h5 className="mb-3">Professional portfolio</h5>
                        <div className="profile-stack">
                            {professionalPlatforms.map(({ platform, placeholder, Icon }) => (
                                <div className="profile-input-row" key={platform}>
                                    <span className="profile-badge"><Icon size={16} /></span>
                                    <input
                                        type="url"
                                        className="form-control"
                                        placeholder={placeholder}
                                        value={getLinkValue(platform)}
                                        onChange={(e) => upsertLink(platform, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="profile-section">
                        <h5 className="mb-3">Social</h5>
                        <div className="profile-stack">
                            {socialPlatforms.map(({ platform, placeholder, Icon }) => (
                                <div className="profile-input-row" key={platform}>
                                    <span className="profile-badge profile-badge__social"><Icon size={16} /></span>
                                    <input
                                        type="url"
                                        className="form-control"
                                        placeholder={placeholder}
                                        value={getLinkValue(platform)}
                                        onChange={(e) => upsertLink(platform, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="profile-section">
                        <h5 className="mb-3">Profile photo & bio</h5>
                        <div className="contrib-grid">
                            <div className="d-flex flex-column gap-2">
                                <CreatorProfileImageUpload profileImage={creatorProfileImage} setProfileImage={setCreatorProfileImage} />
                            </div>
                            <div>
                                <label className="profile-label d-flex align-items-center gap-2"><AlignLeft size={16} /> Bio</label>
                                <textarea
                                    rows={5}
                                    className="form-control"
                                    placeholder="Short bio about yourself (max 150 characters)"
                                    value={bio}
                                    onChange={(e) => { setBio(e.target.value); }}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="profile-section">
                        <h5 className="mb-3">Additional details</h5>
                        <div className="contrib-grid contrib-grid--four">
                            <div>
                                <label className="profile-label d-flex align-items-center gap-2"><Calendar size={16} /> Date of Birth</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="profile-label d-flex align-items-center gap-2"><User size={16} /> Gender</label>
                                <select
                                    className="form-select"
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                >
                                    <option value="" disabled>Select</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="profile-label d-flex align-items-center gap-2"><Briefcase size={16} /> Profession</label>
                                <select
                                    className="form-select"
                                    value={profession}
                                    onChange={(e) => setProfession(e.target.value)}
                                    aria-label="Profession"
                                >
                                    <option value="" disabled>Select Profession</option>
                                    <option value="web_developer">Web Developer</option>
                                    <option value="video_editor">Video Editor</option>
                                    <option value="graphic_designer">Graphic Designer</option>
                                    <option value="marketer">Marketer</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="profile-label d-flex align-items-center gap-2"><Sparkles size={16} /> Skills</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={skills}
                                    onChange={(e) => setSkills(e.target.value)}
                                    placeholder="E.g., Photoshop, Figma"
                                />
                            </div>
                            <div>
                                <label className="profile-label d-flex align-items-center gap-2"><MapPin size={16} /> State</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                    placeholder="State"
                                />
                            </div>
                            <div>
                                <label className="profile-label d-flex align-items-center gap-2"><MapPin size={16} /> City</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="City"
                                />
                            </div>
                            <div>
                                <label className="profile-label d-flex align-items-center gap-2"><MapPin size={16} /> Zip Code</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={zipCode}
                                    onChange={(e) => setZipCode(e.target.value)}
                                    placeholder="Zip Code"
                                />
                            </div>
                            <div>
                                <label className="profile-label d-flex align-items-center gap-2"><Mail size={16} /> Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    value={email}
                                    disabled
                                />
                            </div>
                        </div>
                        <div className="mt-3 d-flex justify-content-between">
                            <button className="btn btn-link" onClick={() => setStep(1)}>Back</button>
                            <ProfileBanner1Bttn />
                        </div>
                    </section>
                </div>
            </div>
        );
    };

    return renderContributorContent();
}

export default ProfileBanner1;
