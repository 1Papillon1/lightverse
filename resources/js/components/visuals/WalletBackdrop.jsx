// WalletBackdrop.jsx
import React, { useState } from "react";
import UniverseBackdrop from "./UniverseBackdrop";
import PortfolioTowers from "@/components/visuals/PortfolioTowers";
import { observer } from "mobx-react-lite"; 

const WalletBackdrop = observer(({ mode = "wallet" }) => {
  const [hovered, setHovered] = useState(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  return (
    <>
      <UniverseBackdrop mode={mode}>
     {/*  <PortfolioTowers
          onHover={setHovered}
          onMouseMove={setMouse}
          hoveredSymbol={hovered?.symbol}
        />  */}
      </UniverseBackdrop>

      {hovered && (
        <div
          style={{
            position: "fixed",
            top: `${mouse.y}px`,
            left: `${mouse.x + 20}px`,
            pointerEvents: "none",
            opacity: 1,
            transform: "translateY(-50%)",
            zIndex: 1002,
          }}
        >
          <div className="tooltip tooltip--info">
            <p className="tooltip__text">
              {hovered.symbol}: {hovered.amount} <br /> (${hovered.usdValue.toFixed(2)})
            </p>
          </div>
        </div>
      )}
    </>
  );
});

export default WalletBackdrop;
