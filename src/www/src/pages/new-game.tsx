import React, { FunctionComponent } from "react";
import { useRouter } from "next/router";

import { useStores } from "@app/stores";


const NewGame: FunctionComponent = () => {
  const Router = useRouter();

  // Stores
  const { StateStore } = useStores();

  // Immediately reset state and navigate back to index
  StateStore.resetState();
  // @NOTE safeguard for server-side rendering
  if (typeof window !== 'undefined') {
    void Router.replace('/');
  }

  return (
    <></>
  );
};

export default NewGame;
