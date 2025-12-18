// VerificationModal.jsx
import { useState } from "react";

const VerificationModal = ({ verificationId, onSuccess }) => {
  const [code, setCode] = useState("");
  const [remember, setRemember] = useState(true);

  const handleVerify = async () => {
    const res = await fetch("/secure-verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content,
      },
      body: JSON.stringify({
        verification_id: verificationId,
        code,
        remember_device: remember
      }),
    });

    const json = await res.json();

    if (res.ok && json.status === "ok") {
      onSuccess();
    } else {
      alert(json.message || "Invalid verification code.");
    }
  };

  return (
    <div className="modal modal--visible">
      <div className="modal__content">
        <h2>Verify Login</h2>
        <p>Enter the 6-digit code sent to your email.</p>

        <input
          className="form__input"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Verification code"
        />

        <label className="modal__checkbox">
          <input
            type="checkbox"
            checked={remember}
            onChange={() => setRemember(!remember)}
          />
          Remember this device
        </label>

        <button className="button" onClick={handleVerify}>
          Verify & Continue
        </button>
      </div>
    </div>
  );
};

export default VerificationModal;
