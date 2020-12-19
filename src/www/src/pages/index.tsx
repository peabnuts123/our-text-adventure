import React, { FunctionComponent, useEffect, useState } from "react";

import GameScreen from "@app/models/GameScreen";
import { useStores } from "@app/stores";
import CommandInput from "@app/components/command-input";
import Logger, { LogLevel } from "@app/util/Logger";

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

  const onSubmitCommand = async (command: string): Promise<void> => {
    Logger.log(LogLevel.debug, "Submitting command: ", command);
  };

  return (
    <div className="home">
      <h1>Home Page</h1>

      <CommandInput onSubmit={onSubmitCommand} />

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

      <CommandInput onSubmit={onSubmitCommand} />
    </div>
  );
};

export default IndexPage;
