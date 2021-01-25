import { useEffect } from "react";

import { useStores } from "@app/stores";
import { OnRouteChangeFunction } from "@app/stores/route";


const useRouteChange = (callback: OnRouteChangeFunction): void => {
  const { RouteStore } = useStores();

  useEffect(() => {
    RouteStore.addRouteChangeListener(callback);
    return () => {
      RouteStore.removeRouteChangeListener(callback);
    };
    // @NOTE If you add `callback` to useEffect's dependencies, it still works
    //  but constantly subscribes/unsubscribes every render (as the callback function is redefined)
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
};

export default useRouteChange;
