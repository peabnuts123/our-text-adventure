import React, { FunctionComponent } from "react";

import { navigate } from 'gatsby';
import { useStores } from "@app/stores";


const NewGame: FunctionComponent = () => {
  // Stores
  const { StateStore } = useStores();

  // Immediately reset state and navigate back to index
  StateStore.resetState();
  // @NOTE safeguard for server-side rendering
  if (typeof window !== 'undefined') {
    void navigate('/');
  }

  return (
    <></>
  );
};

export default NewGame;


