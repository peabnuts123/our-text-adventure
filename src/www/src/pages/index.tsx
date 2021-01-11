import React, { FunctionComponent } from "react";

import Terminal from "@app/components/terminal";

const IndexPage: FunctionComponent = () => {
  return (
    <div className="home">
      <h1>Home Page</h1>

      <Terminal />
    </div>
  );
};

export default IndexPage;
