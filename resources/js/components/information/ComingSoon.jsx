// CoomingSoon.jsx
import React from "react";

const ComingSoon = ({ message = "We're building something amazing. Stay tuned!" }) => {
  return (
    <div className="overlay overlay--comingsoon">
      <div className="overlay__content">
        <h1 className="overlay__title">Coming Soon</h1>
        <p className="overlay__text">{message}</p>
      </div>
    </div>
  );
};
  
  export default ComingSoon;