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
            <li className="navigation__account">
              <img
                src={accountIcon}
                className="navigation__link__icon icon"
                alt="account"
                onClick={toggleDropdown}
              />
              <div
                className={
                  "dropdown dropdown--horizontal" +
                  (isDropdownActive ? " dropdown--active" : "")
                }
              >
                <ul className="dropdown__list">
                  {!isLoggedIn && (
                    <>
                      <li className="dropdown__item">
                        <button
                          className="dropdown__link"
                          onClick={() => userStore.toggleOverlay("login")}
                        >
                          Login
                        </button>
                      </li>
                      <li className="dropdown__item">
                        <button
                          className="dropdown__link"
                          onClick={() => userStore.toggleOverlay("signup")}
                        >
                          Sign up
                        </button>
                      </li>
                    </>
                  )}

                  <li className="dropdown__item">
                    <button
                      className="dropdown__link"
                      onClick={() => userStore.toggleOverlay("settings")}
                    >
                      Settings
                    </button>
                  </li>
                  {isLoggedIn && (
                    <li className="dropdown__item">
                      <button
                        className="dropdown__link"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </li>
                  )}
                </ul>
              </div>

              {username && (
                <span className="navigation__link__label">{username}</span>
              )}
            </li>
            <li className="navigation__wallet">
              <WalletConnectButton />
            </li>
          </ul>
        </nav>
      )}
    </>
  );
});

export default Navigation;
