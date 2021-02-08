import React, { FunctionComponent, useEffect } from "react";

import Terminal from "@app/components/terminal";
import { useStores } from "@app/stores";

const IndexPage: FunctionComponent = () => {
  const { StateStore } = useStores();

  useEffect(() => {
    // Ensure that all sources are up-to-date with state information
    // While the State does store state on-change, the preferred source (URL query params)
    //  is wiped whenever the route is changed.
    // We call it here manually, on every render of the index page, to ensure
    //  that all sources are always up-to-date
    StateStore.storeState();

    // @TODO potentially move this to the Terminal component,
    //  or even a hook e.g. useStoreUpdater();
  });

  return (
    <div className="home">
      <h1>Home Page</h1>

      <Terminal />
    </div>
  );
};

export default IndexPage;
