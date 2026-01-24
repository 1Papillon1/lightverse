import { useContext, useState } from "react";
import { observer } from "mobx-react-lite";
import { RootStoreContext } from "@/stores/RootStore";
import { usePage } from "@inertiajs/react";

import accountIcon from "@/assets/icons/account_circle.svg";
import WalletConnectButton from "@/components/wallet/WalletConnectButton";

const Navigation = observer(({ horizontal = false }) => {
  const { userStore, lightwebCoinStore: coinStore } =
    useContext(RootStoreContext);

  const { auth } = usePage().props;

  const user = auth?.user ?? null;
  const username = user?.username ?? "";
  const isAdmin = user?.is_admin === true;
  const isLoggedIn = Boolean(user);

  const [isDropdownActive, setIsDropdownActive] = useState(false);

  const toggleDropdown = () => setIsDropdownActive((v) => !v);

  const openOverlay = (name) => {
    setIsDropdownActive(false);
    userStore.openOverlay(name);
  };

  const handleLogout = () => {
    setIsDropdownActive(false);
    userStore.logout();
  };

  if (!horizontal || !isLoggedIn) return null;

  return (
    <nav className="navigation navigation--horizontal">
      <ul className="navigation__list navigation__list--horizontal">

        {/* ---------------- LEFT SIDE ---------------- */}
        {!isAdmin && (
          <>
            <li className="navigation__balance">
              <span className="navigation__link navigation__balance__content">
                <span className="navigation__balance__icon">💠</span>
                <span className="navigation__balance__value">
                  {coinStore.balance}
                </span>
              </span>
            </li>

            <li className="navigation__wallet">
              <WalletConnectButton />
            </li>
          </>
        )}

        {isAdmin && (
          <li className="navigation__admin-button">
            <button
              className="button"
              onClick={() => openOverlay("admin")}
            >
              <span className="navigation__admin-icon">🛠️</span>
              <span className="navigation__admin-label">Admin Panel</span>
            </button>
          </li>
        )}

        {/* ---------------- ACCOUNT ---------------- */}
        <li className="navigation__account">
          <img
            src={accountIcon}
            className="navigation__link__icon icon"
            alt="account"
            onClick={toggleDropdown}
          />

          <div
            className={`user-dropdown ${
              isDropdownActive ? "user-dropdown--active" : ""
            }`}
          >
            <ul className="user-dropdown__list">

              {!isAdmin && (
                <>
                  <li>
                    <button
                      className="user-dropdown__list__button"
                      onClick={() => openOverlay("achievements")}
                    >
                      <span className="user-dropdown__icon">💠</span>
                      <span className="user-dropdown__label">
                        Achievements
                      </span>
                    </button>
                  </li>
                </>
              )}

              <li>
                <button
                  className="user-dropdown__list__button"
                  onClick={() => openOverlay("settings")}
                >
                  <span className="user-dropdown__icon">⚙️</span>
                  <span className="user-dropdown__label">Settings</span>
                </button>
              </li>

              <li>
                <button
                  className="user-dropdown__list__button"
                  onClick={handleLogout}
                >
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
      </ul>
    </nav>
  );
});

export default Navigation;
