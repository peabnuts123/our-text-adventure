import Config from '@app/config';
import Logger from '@app/util/Logger';
import { stores } from '@app/stores';

import "@app/style/index.scss";

Logger.setLogLevel(Config.LogLevel);

// Bind onRouteUpdate to RouteStore
export const onRouteUpdate = ({ location, prevLocation }) => {
  const { RouteStore } = stores;

  RouteStore.onRouteChange({
    previousLocation: prevLocation,
    location,
  });
};
