// passwordRules.jsx
import { useState, useEffect } from "react";

const passwordRules = [
  { id: "length", label: "At least 8 characters" },
  { id: "uppercase", label: "One uppercase letter" },
  { id: "lowercase", label: "One lowercase letter" },
  { id: "number", label: "One number" },
  { id: "special", label: "One special character (!@#$%^&*)" },
];

const PasswordRules = ({ password }) => {
  const [rulesState, setRulesState] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  useEffect(() => {
    setRulesState({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [password]);

  return (
    <ul className="password-rules">
      {passwordRules.map((rule) => (
        <li key={rule.id} className={rulesState[rule.id] ? "valid" : ""}>
          <span className="dot" /> {rule.label}
        </li>
      ))}
    </ul>
  );
};

export default PasswordRules;