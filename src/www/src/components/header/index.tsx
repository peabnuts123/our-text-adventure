import classNames from "classnames";
import { Link } from "gatsby";
import React, { FunctionComponent, useState } from "react";
import {
  Menu as MenuIcon,
} from 'react-feather';

import useRouteChange from "@app/hooks/use-route-change";

const Index: FunctionComponent = () => {
  // State
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  // Close menus on route change (i.e. when you navigate using on the of the menus)
  useRouteChange((_args) => {
    setIsMobileNavOpen(false);
  });

  return (
    <>
      {/* Mobile nav overlay */}
      {(isMobileNavOpen) && (
        <div className="header-mobile__background" onClick={() => setIsMobileNavOpen(false)} />
      )}

      <header className="header">
        <div className="header__content">

          {/* Brand */}
          <Link to="/" className="header__title">
            Our Text<br />
            Adventure
          </Link>

          {/* Desktop nav */}
          <nav className="header-desktop">
            <div className="header-desktop__nav-items">
              {/* Links */}
              <Link className="header-desktop__nav-item" activeClassName="is-active" to="/new-game">Start new game</Link>
              <Link className="header-desktop__nav-item" activeClassName="is-active" to="/">Home</Link>
              <Link className="header-desktop__nav-item" activeClassName="is-active" to="/about">About</Link>
            </div>
          </nav> {/* .header-desktop */}

          {/* Mobile nav */}
          <nav className="header-mobile">
            <div className="header-mobile__sandwich-container"
              role="button"
              tabIndex={0}
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            >
              <MenuIcon size={30} />
            </div>

            <div className={classNames("header-mobile__container", { 'is-open': isMobileNavOpen })}>
              {/* Links */}
              <Link className="header-mobile__nav-item" activeClassName="is-active" to="/new-game">Start new game</Link>
              <Link className="header-mobile__nav-item" activeClassName="is-active" to="/">Home</Link>
              <Link className="header-mobile__nav-item" activeClassName="is-active" to="/about">About</Link>
            </div>
          </nav> {/* .header-mobile */}

        </div> {/* .header__content */}
      </header> {/* .header */}
    </>
  );
};

export default Index;
