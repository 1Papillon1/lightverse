// Signup.jsx
import { useForm } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import PasswordRules from "@/utils/PasswordRules";
import { useState, useMemo } from "react";

const Signup = () => {
  const [showPasswordRules, setShowPasswordRules] = useState(false);

const { data, setData, post, processing, errors } = useForm({
  username: "",
  password: "",
  password_confirmation: "",
});

  // 🔐 Password rule validation (frontend)
  const isPasswordValid = useMemo(() => {
    return (
      data.password.length >= 8 &&
      /[A-Z]/.test(data.password) &&
      /[a-z]/.test(data.password) &&
      /\d/.test(data.password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(data.password)
    );
  }, [data.password]);

  // 🔁 Password match check
  const passwordsMatch =
    data.password &&
    data.password === data.password_confirmation;

  const handleRegister = (e) => {
    e.preventDefault();

    // Guard against invalid submission
    if (!isPasswordValid || !passwordsMatch) {
      return;
    }

    post("/register");
  };

  const openLogin = (e) => {
    e.preventDefault();
    router.visit("/login", {
      preserveState: true,
      preserveScroll: true,
    });
  };

  return (
    <div className="overlay overlay--auth">
      <div className="overlay__content">
        <h1 className="overlay__title">Sign Up</h1>

        <form className="form" onSubmit={handleRegister}>
          {/* Username */}
          <div className="form__group">
            <input
              type="text"
              className="form__input"
              placeholder="Username"
              name="username"
              value={data.username}
              onChange={(e) => setData("username", e.target.value)}
              required
            />
            {errors.username && (
              <p className="error">{errors.username}</p>
            )}
          </div>

       
          {/* Password */}
          <div className="form__group">
            <input
              type="password"
              className="form__input"
              placeholder="Password"
              name="password"
              value={data.password}
              onChange={(e) => setData("password", e.target.value)}
              onFocus={() => setShowPasswordRules(true)}
              onBlur={() => setShowPasswordRules(false)}
              required
            />

            {showPasswordRules && (
              <PasswordRules password={data.password} />
            )}

            {errors.password && (
              <p className="error">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form__group">
            <input
              type="password"
              className="form__input"
              placeholder="Confirm Password"
              name="password_confirmation"
              value={data.password_confirmation}
              onChange={(e) =>
                setData("password_confirmation", e.target.value)
              }
              required
            />

            {data.password_confirmation && !passwordsMatch && (
              <p className="error">Passwords do not match</p>
            )}

            {errors.password_confirmation && (
              <p className="error">
                {errors.password_confirmation}
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="form__group">
            <button
              type="submit"
              className="button"
              disabled={
                processing ||
                !isPasswordValid ||
                !passwordsMatch
              }
            >
              {processing ? "Signing up..." : "Sign Up"}
            </button>
          </div>
        </form>

        <div className="overlay__footer">
          <div className="auth__switch">
            Already have an account?{" "}
            <a href="#" onClick={openLogin}>
              Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
