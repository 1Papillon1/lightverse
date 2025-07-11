import { useContext, useState } from "react";
import { observer } from "mobx-react-lite";
import { RootStoreContext } from "@/stores/RootStore";
import { Inertia } from '@inertiajs/inertia';
import { usePage } from "@inertiajs/react";
import accountIcon from "@/assets/icons/account_circle.svg";




const Navigation = observer(({ horizontal = false, vertical = true }) => {
    const rootStore = useContext(RootStoreContext);
    const { auth } = usePage().props;
    const username = auth?.user?.username ?? null;
    const isLoggedIn = Boolean(auth?.user);
    const store = rootStore.marketStore;


    const [isDropdownActive, setIsDropdownActive] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleDropdown = () => setIsDropdownActive(prev => !prev);
    const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);

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
                            onClick={() => Inertia.visit("/login")}
                          >
                            Login
                          </button>
                        </li>
                        <li className="dropdown__item">
                          <button
                            className="dropdown__link"
                            onClick={() => Inertia.visit("/signup")}
                          >
                            Sign up
                          </button>
                        </li>
                      </>
                    )}
                    <li className="dropdown__item">
                      <button
                        className="dropdown__link"
                        onClick={() => Inertia.visit("/settings")}
                      >
                        Settings
                      </button>
                    </li>
                    {isLoggedIn && (
                      <li className="dropdown__item">
                        <button
                          className="dropdown__link"
                          onClick={() => Inertia.post("/logout")}
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
          </ul>
        </nav>
      )}


     {/*  {!isMobileMenuOpen && (
  <div className="mobile__menu__button" onClick={toggleMobileMenu}>
    <img src={menuIcon} alt="Menu" />
  </div>
)}

    
      {navigationState === "main" && (
      <nav
        className={`navigation navigation--vertical ${
          isMobileMenuOpen ? "navigation--open" : ""
        }`}
      >
        <div className="mobile__menu__close" onClick={toggleMobileMenu}>
          <img className="icon icon--close" src={closeIcon} alt="Close" />
        </div>
        <ul className="navigation__list navigation__list--vertical">
      
          <li className="navigation__item navigation__item--has-dropdown">
            <button
              className="navigation__link navigation__link--vertical"
              onClick={() => {
                Inertia.visit("/dashboard");
                setIsMobileMenuOpen(false);
              }}
            >
              <img
                src={dashboardIcon}
                className="navigation__link__icon"
                alt="dashboard"
              />
               <span className="navigation__link__text">Dashboard</span>
            </button>
              <div className="dropdown dropdown--vertical">
              <ul className="dropdown__list">
                <li className="dropdown__item dropdown__title">Dashboard</li>
              </ul>
            </div>
            
          </li>

    
          <li className="navigation__item navigation__item--has-dropdown">
            <button className="navigation__link navigation__link--vertical">
              <img
                src={walletIcon}
                className="navigation__link__icon"
                alt="wallet"
              />
               <span className="navigation__link__text">Wallet</span>
            </button>
            <div className="dropdown dropdown--vertical">
              <ul className="dropdown__list">
                <li className="dropdown__item dropdown__title">Wallet</li>
                <li className="dropdown__item">
                  <button className="dropdown__link">
                    View
                  </button>
                </li>
                <li className="dropdown__item">
                  <button className="dropdown__link">
                    Connect
                  </button>
                </li>
              </ul>
            </div>
          </li>

          
          <li className="navigation__item navigation__item--has-dropdown">
            <button className="navigation__link navigation__link--vertical">
              <img
                src={homeIcon}
                className="navigation__link__icon"
                alt="overview"
               
              />
              <span className="navigation__link__text">Overview</span>
            </button>
            <div className="dropdown dropdown--vertical">
              <ul className="dropdown__list">
                <li className="dropdown__item dropdown__title">Overview</li>

                <li className="dropdown__item">
                    <button
                      className="dropdown__link"
                         onClick={() => {
                          Inertia.visit("/about");
                          setIsMobileMenuOpen(false);
                        }}
                    >
                      About
                    </button>
                  </li>

                  <li className="dropdown__item">
                    <button
                      className="dropdown__link"
                      onClick={() => {
                        rootStore.uiStore.setNavigationState("roadmap");
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Roadmap
                    </button>
                  </li>

                  <li className="dropdown__item">
                    <button
                      className="dropdown__link"
                      onClick={() => {
                        rootStore.uiStore.setNavigationState("news");
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      News
                    </button>
                  </li>
                </ul>
              </div>
          </li>



        </ul>
      </nav>
  )}
}
  
    {  {navigationState === "blockPreview" && store && store.selectedMarket && (
  <nav
    className={`navigation navigation--vertical ${
      isMobileMenuOpen ? "navigation--open" : ""
    }`}
  >
    <ul className="navigation__list navigation__list--vertical">
      <li className="navigation__item navigation__item--has-dropdown">
        <button
          className="navigation__link navigation__link--vertical"
          onClick={() => {
             rootStore.uiStore.requestExplosion();
            setIsMobileMenuOpen(false);
          }}
        >
          <img
            src={previewIcon}
            className="navigation__link__icon"
            alt="dashboard"
          />
          <span className="navigation__link__text">View details</span>
        </button>
        <div className="dropdown dropdown--vertical">
          <ul className="dropdown__list">
            <li className="dropdown__item dropdown__title">View details</li>
          </ul>
        </div>
      </li>
    </ul>
  </nav>
)} */}



    </>
  );
});

export default Navigation;
