import React, { useState } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes for validation
import './PricingPlanBanner1.css';

function PricingPlanBanner1() {
    const [isMonthly, setIsMonthly] = useState(false); 
    const [userCount, setUserCount] = useState(1);

    const togglePlan = () => {
        setIsMonthly(!isMonthly);
    };

    const incrementUserCount = () => {
        setUserCount(prevCount => prevCount + 1);
    };

    const decrementUserCount = () => {
        setUserCount(prevCount => (prevCount > 1 ? prevCount - 1 : 1));
    };

    return (
        <div className="container py-5 my-4">
            <div className="user-count my-5">
                <label className="user-count-label">How many users?</label>
                <div className="user-count-controls">
                    <button className="user-button" onClick={decrementUserCount}>-</button>
                    <span className="user-count-display">{userCount} User{userCount > 1 ? "s" : ""}</span>
                    <button className="user-button" onClick={incrementUserCount}>+</button>
                </div>
            </div>
            <div className="toggle-section">
                <span>Monthly</span>
                <label className="switch">
                    <input type="checkbox" checked={!isMonthly} onChange={togglePlan} />
                    <span className="slider"></span>
                </label>
                <span>Annually</span>
            </div>
            <div className="plans pt-5">
                <Plan
                    title="Essential"
                    monthlyPrice="10226.25 PKR"
                    annualPrice="852.19 PKR"
                    aiCredits="84000"
                    content="No Premium stock content"
                    downloads="Limited downloads"
                    isMonthly={isMonthly}
                    userCount={userCount}
                />
                <Plan
                    title="Premium"
                    monthlyPrice="12281.25 PKR"
                    annualPrice="1023.44 PKR"
                    discount="50%"
                    aiCredits="216000"
                    content="All Premium stock content"
                    downloads="Unlimited downloads"
                    isMonthly={isMonthly}
                    userCount={userCount}
                />
                <Plan
                    title="Premium+"
                    monthlyPrice="29059.38 PKR"
                    annualPrice="2425.78 PKR"
                    discount="50%"
                    aiCredits="540000"
                    content="All Premium stock content"
                    downloads="Unlimited downloads"
                    isMonthly={isMonthly}
                    userCount={userCount}
                />
            </div>
        </div>
    );
}

function Plan({ title, monthlyPrice, annualPrice, discount, aiCredits, content, downloads, isMonthly, userCount }) {
    return (
        <div className="plan">
            <h2>{title}</h2>
            <p className="price">
                {!isMonthly && discount && <span className="discount">{discount}</span>}
                {isMonthly ? (
                    `${monthlyPrice} / month`
                ) : (
                    <>
                        <del className="strikethrough">{monthlyPrice}</del> 
                        {` ${annualPrice} billed annually`} 
                    </>
                )} 
                per user
            </p>
            <p className='fw-semibold'>Total for {userCount} {userCount > 1 ? "users" : "user"}: 
                {isMonthly ? 
                    `${(parseFloat(monthlyPrice.replace(/,/g, '')) * userCount).toFixed(2)} PKR / month` : 
                    `${(parseFloat(annualPrice.replace(/,/g, '')) * userCount).toFixed(2)} PKR annually`}
            </p>
            <button className="get-plan-button">Get {title}</button>
            <div className="features">
                <p>✓ AI Credits: {aiCredits} / year</p>
                <p>✓ Easy-to-use online design tools</p>
                <p>✓ {content}</p>
                <p>✓ {downloads}</p>
                <p><a href="#">Compare all features</a></p>
            </div>
        </div>
    );
}

// Add PropTypes for validation
Plan.propTypes = {
  title: PropTypes.string.isRequired,
  monthlyPrice: PropTypes.string.isRequired,
  annualPrice: PropTypes.string.isRequired,
  discount: PropTypes.string,
  aiCredits: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  downloads: PropTypes.string.isRequired,
  isMonthly: PropTypes.bool.isRequired,
  userCount: PropTypes.number.isRequired,
};

export default PricingPlanBanner1;
