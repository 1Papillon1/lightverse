// Signup.jsx
import React from "react";
import { useForm } from "@inertiajs/react";
import { Inertia } from "@inertiajs/inertia";

const Signup = () => {
  const { data, setData, post, processing, errors } = useForm({
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const handleRegister = (e) => {
    e.preventDefault();
    post("/register", {
      onSuccess: () => {
        setData({ username: "", email: "", password: "", password_confirmation: "" });
      },
      onError: (errors) => {
        console.error(errors);
      },
    });
  };

  const openLogin = (e) => {
    e.preventDefault();
    Inertia.visit("/login", {
      preserveState: true,
      preserveScroll: true,
    });
  };

  return (
    <div className="overlay overlay--auth">
      <div className="overlay__content">
        <h1 className="overlay__title">Sign Up</h1>
        <form className="form" onSubmit={handleRegister} role="form" aria-label="Sign up form">
          <div className="form__group">
            <input
              type="text"
              className="form__input"
              placeholder="Username"
              value={data.username}
              onChange={(e) => setData("username", e.target.value)}
              required
            />
            {errors.username && <p className="error">{errors.username}</p>}
          </div>

          <div className="form__group">
            <input
              type="email"
              className="form__input"
              placeholder="Email"
              value={data.email}
              onChange={(e) => setData("email", e.target.value)}
              required
            />
            {errors.email && <p className="error">{errors.email}</p>}
          </div>

          <div className="form__group">
            <input
              type="password"
              className="form__input"
              placeholder="Password"
              value={data.password}
              onChange={(e) => setData("password", e.target.value)}
              required
            />
            {errors.password && <p className="error">{errors.password}</p>}
          </div>

          <div className="form__group">
            <input
              type="password"
              name="password_confirmation"
              className="form__input"
              placeholder="Confirm Password"
              value={data.password_confirmation}
              onChange={(e) => setData("password_confirmation", e.target.value)}
              required
            />
            {errors.password_confirmation && (
              <p className="error">{errors.password_confirmation}</p>
            )}
          </div>

          <div className="form__group">
            <button type="submit" className="button" disabled={processing}>
              {processing ? "Signing up..." : "Sign Up"}
            </button>
          </div>

          {(errors.username ||
            errors.email ||
            errors.password ||
            errors.password_confirmation) && (
            <div className="error-messages">
              {Object.entries(errors).map(([field, message]) => (
                <p key={field} className="error">{message}</p>
              ))}
            </div>
          )}
        </form>

        <div className="overlay__footer">
          <div className="auth__switch">
            Already have an account?{" "}
            <a
              href="?mode=login"
              onClick={openLogin}
              role="button"
              tabIndex={0}
              aria-label="Switch to login"
            >
              Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
