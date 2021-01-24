import { Link } from "gatsby";
import React, { FunctionComponent } from "react";

const Index: FunctionComponent = () => {
  return (
    <header className="header">
      <Link to="/" className="header-desktop__title">Our Text Adventure</Link>

      <nav className="header-desktop">

        <div className="header-desktop__nav-items">
          <Link to="/new-game"
            className="header-desktop__nav-item"
            activeClassName="is-active"
          >
            Start new game
          </Link>
          <Link to="/"
            className="header-desktop__nav-item"
            activeClassName="is-active"
          >
            Home
          </Link>
          <Link to="/about"
            className="header-desktop__nav-item"
            activeClassName="is-active"
          >
            About
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Index;
