import React from 'react';

const StarRating = ({ rating }) => {
  const renderStars = () => {
    const stars = [];
    const totalStars = 5;  
    const fullStars = Math.floor(rating);  
    const halfStar = rating % 1 >= 0.5; 
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star full">★</span>);
    }
    if (halfStar) {
      stars.push(<span key={fullStars} className="star half">★</span>);
    }
    for (let i = stars.length; i < totalStars; i++) {
      stars.push(<span key={i} className="star empty">★</span>);
    }
    return stars;
  };

  return (
    <div className="star-rating" style={{ backgroundColor: 'transparent', padding: '5px', borderRadius: '5px' }}>
      {renderStars()}
      <span style={{ marginLeft: '10px' }}>{rating}</span>
      <style>
        {`
          .star {
            font-size: 24px;  
            color: gold;  
          }
          .half {
            color: gold;  
          }
          .empty {
            color: lightgray; 
          }
        `}
      </style>
    </div>
  );
};


export default StarRating;
