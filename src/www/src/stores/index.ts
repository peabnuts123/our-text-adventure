import { Context, createContext, useContext } from 'react';

import ScreenStore from './screen';

export const stores = {
  ScreenStore: new ScreenStore(),
};

const StoresContext: Context<typeof stores> = createContext(stores);

export const useStores = (): typeof stores => useContext(StoresContext);
