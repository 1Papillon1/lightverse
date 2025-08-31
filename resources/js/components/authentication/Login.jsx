// Login.jsx
import React from "react";
import { useForm } from "@inertiajs/react";

const Login = () => {
  const { data, setData, post, processing, errors } = useForm({
    email: "",
    password: "",
  });

  const handleLogin = (e) => {
    e.preventDefault();
    post("/login", {
      onError: (errs) => console.error(errs),
    });
  };

  return (
    <div className="overlay overlay--auth">
      <div className="overlay__content">
        <h1 className="overlay__title">Login</h1>
        <form className="form" onSubmit={handleLogin}>
          <div className="form__group">
            <input
              type="email"
              className="form__input"
              placeholder="Email address"
              id="email"
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
              id="password"
              value={data.password}
              onChange={(e) => setData("password", e.target.value)}
              required
            />
            {errors.password && <p className="error">{errors.password}</p>}
          </div>

          <div className="form__group">
            <button type="submit" className="button" disabled={processing}>
              {processing ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
