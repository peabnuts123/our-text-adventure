import React, { FunctionComponent, useEffect, useState } from "react";

import GameScreen from "@app/models/GameScreen";
import { useStores } from "@app/stores";
import Terminal from "@app/components/terminal";

const IndexPage: FunctionComponent = () => {
  const { ScreenStore } = useStores();

  const [baseScreen, setBaseScreen] = useState<GameScreen | undefined>(undefined);

  useEffect(() => {
    async function getStore(): Promise<void> {
      const result = await ScreenStore.getScreenById(ScreenStore.BaseScreenId);
      setBaseScreen(result);
    }

    void getStore();
  }, [ScreenStore]);

  return (
    <div className="home">
      <h1>Home Page</h1>

      <Terminal initialScreen={baseScreen}/>
    </div>
  );
};

export default IndexPage;
