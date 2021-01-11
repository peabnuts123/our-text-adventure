import { Context, createContext, useContext } from 'react';

import ScreenStore from './screen';
import StateStore from './state';
import CommandStore from './command';

export const stores = {
  ScreenStore: new ScreenStore(),
  StateStore: new StateStore(),
  CommandStore: new CommandStore(),
};

const StoresContext: Context<typeof stores> = createContext(stores);

export const useStores = (): typeof stores => useContext(StoresContext);
