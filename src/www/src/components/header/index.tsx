import classNames, { Argument as ClassNamesArgument } from "classnames";
import { useRouter } from "next/router";
import React, { FunctionComponent, useState, useEffect } from "react";
import {
  Menu as MenuIcon,
} from 'react-feather';
import Link from "next/link";


const Index: FunctionComponent = () => {
  const Router = useRouter();

  // State
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  // Lifecycle
  useEffect(() => {
    // Close menus on route change (i.e. when you navigate using on the of the menus)
    Router.events.on('routeChangeComplete', () => {
      setIsMobileNavOpen(false);
    });
  }, []);

  // Functions
  const isCurrentRoute = (route: string): boolean => Router.route === route;
  const hasActiveClassName = (route: string): ClassNamesArgument  => ({ 'is-active': isCurrentRoute(route) });

  return (
    <>
      {/* Mobile nav overlay */}
      {(isMobileNavOpen) && (
        <div className="header-mobile__background" onClick={() => setIsMobileNavOpen(false)} />
      )}

      <header className="header">
        <div className="header__content">

          {/* Brand */}
          <Link href="/">
            <a className="header__title" >
              Our Text<br />
              Adventure
            </a>
          </Link>

          {/* Desktop nav */}
          <nav className="header-desktop">
            <div className="header-desktop__nav-items">
              {/* Links */}
              <Link href="/new-game">
                <a className={classNames("header-desktop__nav-item", hasActiveClassName('/new-game'))}>Start new game</a>
              </Link>
              <Link href="/">
                <a className={classNames("header-desktop__nav-item", hasActiveClassName('/'))}>Home</a>
              </Link>
              <Link href="/about">
                <a className={classNames("header-desktop__nav-item", hasActiveClassName('/about'))}>About</a>
              </Link>
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
              <Link href="/new-game">
                <a className={classNames("header-mobile__nav-item", hasActiveClassName('/new-game'))}>Start new game</a>
              </Link>
              <Link href="/">
                <a className={classNames("header-mobile__nav-item", hasActiveClassName('/'))}>Home</a>
              </Link>
              <Link href="/about">
                <a className={classNames("header-mobile__nav-item", hasActiveClassName('/about'))}>About</a>
              </Link>
            </div>
          </nav> {/* .header-mobile */}

        </div> {/* .header__content */}
      </header> {/* .header */}
    </>
  );
};

export default Index;
