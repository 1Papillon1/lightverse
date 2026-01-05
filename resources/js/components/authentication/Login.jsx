// Login.jsx
import { useForm } from "@inertiajs/react";
import { Inertia } from "@inertiajs/inertia";

const Login = () => {
  const { data, setData, post, processing, errors } = useForm({
    email: "",
    password: "",
    remember: false,
  });

  const handleLogin = (e) => {
    e.preventDefault();
    post("/login", {
      onError: (errs) => {
        console.error(errs);
        if (errs.email) {
          setData({'email': '', 'password': ''})
        }
      },
    });
  };

  const openSignup = (e) => {
    e.preventDefault();
    // keep SPA behavior and preserve state
    Inertia.visit("/register", {
      preserveState: true,
      preserveScroll: true,
    });
  };

  return (
    <div className="overlay overlay--auth">
      <div className="overlay__content">
        <h1 className="overlay__title">Login</h1>
        <form className="form" onSubmit={handleLogin} role="form" aria-label="Login form">
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
            {errors.email && <p className="status error">{errors.email}</p>}
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

          <div className="form__group form__group--remember">
          <label className="form__remember">
            <input
              type="checkbox"
              name="remember"
              className="form__remember-input"
            />
            <span className="form__remember-box"></span>
            <span className="form__remember-text">Remember me</span>
          </label>
        </div>

          <div className="form__group">
            <button type="submit" className="button" disabled={processing}>
              {processing ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>

        <div className="overlay__footer">
          <div className="auth__switch">
            Don't have an account?{" "}
            <a
              href="?mode=signup"
              onClick={openSignup}
              role="button"
              tabIndex={0}
              aria-label="Switch to sign up"
            >
              Sign Up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
