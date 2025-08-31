// ReturnToOrbitButton.jsx
import React from "react";
import { FaRocket } from "react-icons/fa";
import { Inertia } from "@inertiajs/inertia";


export default function ReturnToOrbitButton() {


const handleReturn = () => {
    
    Inertia.visit("/dashboard", {
      preserveState: true, 
      preserveScroll: true, 
    });
    };

  return (
    <div className="asidebar">
      <button className="asidebar__button" onClick={() => handleReturn()}>
        <FaRocket style={{ marginRight: "0.5rem" }} />
        Back to Space
      </button>
    </div>
  );
}