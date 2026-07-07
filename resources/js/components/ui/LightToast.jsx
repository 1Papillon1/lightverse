// resources/js/components/ui/LightToast.jsx
// Small floating toast shown when Light is earned in Proving Grounds
// Usage: <LightToast amount={12} />
// Parent manages visibility — unmount after 3000ms
 
import React, { useEffect, useState } from 'react';
 
const LightToast = ({ amount }) => {
  const [visible, setVisible] = useState(false);
 
  useEffect(() => {
    // Slight delay so it animates in after mount
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);
 
  return (
    <div className={`light-toast ${visible ? 'light-toast--visible' : ''}`}>
      <span className="light-toast__icon">✦</span>
      <span className="light-toast__text">+{amount} Active Light</span>
    </div>
  );
};
 
export default LightToast;