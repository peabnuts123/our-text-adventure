import { Link } from "gatsby";
import React, { FunctionComponent } from "react";

const Index: FunctionComponent = () => {
  return (
    <header className="header">
      <nav className="header-desktop container">
        <Link to="/" className="header-desktop__title">Our Text Adventure</Link>

        <div className="header-desktop__nav-items">
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
