import React, { FunctionComponent, useEffect, useState } from "react";

import GameScreen from "@app/models/GameScreen";
import { useStores } from "@app/stores";

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

      <div className="home__code-test">
        {baseScreen !== undefined ?
          (
            <div>
              {baseScreen.body.join('\n')}
            </div>
          ) :
          (
            <p>Loading&hellip;</p>
          )
        }
      </div>
    </div>
  );
};

export default IndexPage;
