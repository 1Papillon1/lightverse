import React from "react";
import { useForm } from "@inertiajs/react";

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
        setData({ username: "", email: "", password: "", confirmPassword: "" });
      },
      onError: (errors) => {
        console.error(errors);
      },
    });
  };

  return (
    <section className="hero">
      <form className="form" onSubmit={handleRegister}>
        <div className="form__group">
        
          <input
            type="text"
            className="form__input"
            placeholder="Username"
            value={data.username}
            onChange={(e) => setData('username', e.target.value)}
            required
          />
         
        </div>
        <div className="form__group">
          <input
            type="email"
            className="form__input"
            placeholder="Email"
            value={data.email}
            onChange={(e) => setData('email', e.target.value)}
            required
          />
   
        </div>
        <div className="form__group">
          <input
            type="password"
            className="form__input"
            placeholder="Password"
            value={data.password}
            onChange={(e) => setData('password', e.target.value)}
            required
          />
    
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

        {/* SUBMIT */}
        <div className="form__group">
          <button type="submit" className="button" disabled={processing}>
            {processing ? "Signing up..." : "Sign Up"}
          </button>
        </div>

        {/* Svi errori */}
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
    </section>
  );
};

export default Signup;