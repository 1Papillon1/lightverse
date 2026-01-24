// Login.jsx
import { useForm } from "@inertiajs/react";
import { Inertia } from "@inertiajs/inertia";

const Login = () => {
 const { data, setData, post, processing, errors } = useForm({
  username: "",
  password: "",
  remember: false,
});

  const handleLogin = (e) => {
  e.preventDefault();
  post("/login");
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
              type="text"
              className="form__input"
              placeholder="Username"
              value={data.username}
              onChange={(e) => setData("username", e.target.value)}
              required
            />
           {errors.username && (
              <p className="status error">{errors.username}</p>
            )}
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
              checked={data.remember}
              onChange={(e) => setData("remember", e.target.checked)}
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
