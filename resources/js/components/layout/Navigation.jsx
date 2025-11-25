// Navigation.jsx
import { useContext, useState } from "react";
import { observer } from "mobx-react-lite";
import { RootStoreContext } from "@/stores/RootStore";
import { usePage } from "@inertiajs/react";
import accountIcon from "@/assets/icons/account_circle.svg";
import WalletConnectButton from "@/components/wallet/WalletConnectButton";

const Navigation = observer(({ horizontal = false }) => {
  const rootStore = useContext(RootStoreContext);
  const userStore = rootStore.userStore;

  const { auth } = usePage().props;
  const username = auth?.user?.username ?? null;
  const isLoggedIn = Boolean(auth?.user);

  const [isDropdownActive, setIsDropdownActive] = useState(false);

  const toggleDropdown = () => setIsDropdownActive((prev) => !prev);
  const handleLogout = () => {
    setIsDropdownActive(false);
    userStore.logout();
  };

  return (
    <>
      {horizontal && (
        <nav className="navigation navigation--horizontal">
          <ul className="navigation__list navigation__list--horizontal">
            <li className="navigation__wallet">
              <WalletConnectButton />
            </li>
            <li className="navigation__account">
              <img
                src={accountIcon}
                className="navigation__link__icon icon"
                alt="account"
                onClick={toggleDropdown}
              />
            <div
              className={`user-dropdown ${isDropdownActive ? "user-dropdown--active" : ""}`}
            >
              <ul className="user-dropdown__list">
                <li>
                  <button className="user-dropdown__list__button" onClick={() => userStore.toggleOverlay("settings")}>
                    <span className="user-dropdown__icon">⚙️</span>
                    <span className="user-dropdown__label">Settings</span>
                  </button>
                </li>
                <li>
                  <button className="user-dropdown__list__button" onClick={() => userStore.toggleOverlay("wallet")}>
                    <span className="user-dropdown__icon">💳</span>
                    <span className="user-dropdown__label">Wallet</span>
                  </button>
                </li>
                <li>
                  <button className="user-dropdown__list__button" onClick={handleLogout}>
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
      )}
    </>
  );
});

export default Navigation;
