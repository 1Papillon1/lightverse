// resources/js/components/Navigation.jsx
import { useContext, useState, useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import { RootStoreContext } from "@/stores/RootStore";
import { usePage } from "@inertiajs/react";

import accountIcon from "@/assets/icons/account_circle.svg";
import LightDisplay from "@/components/light/LightDisplay";
import NotificationBell from "@/components/notifications/NotificationBell";

const COLLAPSE_AT = 1300;

const Navigation = observer(({ horizontal = false }) => {
  const { userStore } = useContext(RootStoreContext);
  const { auth } = usePage().props;

  const user       = auth?.user ?? null;
  const username   = user?.username ?? "";
  const isAdmin    = user?.is_admin === true;
  const isLoggedIn = Boolean(user);

  const [isDropdownActive, setIsDropdownActive] = useState(false);
  const [collapsed,        setCollapsed]        = useState(false);
  const [menuOpen,         setMenuOpen]         = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const check = () => setCollapsed(window.innerWidth < COLLAPSE_AT);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const openOverlay = (name) => {
    setIsDropdownActive(false);
    setMenuOpen(false);
    userStore.openOverlay(name);
  };

  const handleLogout = () => {
    setIsDropdownActive(false);
    setMenuOpen(false);
    userStore.logout();
  };

  if (!horizontal || !isLoggedIn) return null;

  return (
    <nav className="navigation navigation--horizontal">
      <ul className="navigation__list navigation__list--horizontal">

        {isAdmin && (
          <li className="navigation__admin-button">
            <button className="button" onClick={() => openOverlay("admin")}>
              <span className="navigation__admin-icon">🛠️</span>
              <span className="navigation__admin-label">Admin Panel</span>
            </button>
          </li>
        )}

        {/* Full layout >= 1300px */}
        {!collapsed && (
          <>
            <li className="navigation__light">
              <LightDisplay variant="nav" />
            </li>
            <li className="navigation__notifications">
              <NotificationBell />
            </li>
            <li className="navigation__account">
              <img
                src={accountIcon}
                className="navigation__link__icon icon"
                alt="account"
                onClick={() => setIsDropdownActive(v => !v)}
              />
              <div className={`user-dropdown ${isDropdownActive ? "user-dropdown--active" : ""}`}>
                <ul className="user-dropdown__list">
                  {!isAdmin && (
                    <li>
                      <button className="user-dropdown__list__button"
                        onClick={() => openOverlay("achievements")}>
                        <span className="user-dropdown__icon">💠</span>
                        <span className="user-dropdown__label">Achievements</span>
                      </button>
                    </li>
                  )}
                  <li>
                    <button className="user-dropdown__list__button"
                      onClick={() => openOverlay("settings")}>
                      <span className="user-dropdown__icon">⚙️</span>
                      <span className="user-dropdown__label">Settings</span>
                    </button>
                  </li>
                  <li>
                    <button className="user-dropdown__list__button"
                      onClick={handleLogout}>
                      <span className="user-dropdown__icon">🚪</span>
                      <span className="user-dropdown__label">Logout</span>
                    </button>
                  </li>
                </ul>
              </div>
              {username && (
                <span className="navigation__link__label">{username}</span>
              )}
            </li>
          </>
        )}

        {/* Hamburger layout < 1300px */}
        {collapsed && (
          <li className="nav-hamburger" ref={menuRef}>
            <button
              className={`nav-hamburger__btn ${menuOpen ? "is-open" : ""}`}
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Toggle menu"
            >
              <span className="nav-hamburger__bar" />
              <span className="nav-hamburger__bar" />
              <span className="nav-hamburger__bar" />
            </button>

            <div className={`nav-hamburger__panel ${menuOpen ? "is-open" : ""}`}>

              {/* Row 1 — username left, light right */}
              <div className="nav-hamburger__section nav-hamburger__section--row">
                <div className="nav-hamburger__user">
                  <img src={accountIcon} alt="account" className="nav-hamburger__avatar" />
                  <span className="nav-hamburger__username">{username}</span>
                </div>
                <LightDisplay variant="nav" />
              </div>

              <div className="nav-hamburger__divider" />

              {/* All actions in one unified list */}
              <ul className="nav-hamburger__list">

                {/* Notifications — same style as other items */}
                <li className="nav-hamburger__item nav-hamburger__item--notifications">
                  <NotificationBell />
                  <span>Notifications</span>
                </li>

                {!isAdmin && (
                  <li>
                    <button className="nav-hamburger__item"
                      onClick={() => openOverlay("achievements")}>
                      <span>💠</span> Achievements
                    </button>
                  </li>
                )}
                <li>
                  <button className="nav-hamburger__item"
                    onClick={() => openOverlay("settings")}>
                    <span>⚙️</span> Settings
                  </button>
                </li>
                <li>
                  <button className="nav-hamburger__item nav-hamburger__item--logout"
                    onClick={handleLogout}>
                    <span>🚪</span> Logout
                  </button>
                </li>
              </ul>

            </div>
          </li>
        )}

      </ul>
    </nav>
  );
});

export default Navigation;