import { Context, createContext, useContext } from 'react';

import StateStore from './state';

export const stores = {
  StateStore: new StateStore(),
};

const StoresContext: Context<typeof stores> = createContext(stores);

export const useStores = (): typeof stores => useContext(StoresContext);
