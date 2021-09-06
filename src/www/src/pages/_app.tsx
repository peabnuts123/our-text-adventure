import { FunctionComponent } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';

import '@app/styles/index.scss';
import Header from '@app/components/header';
import Config from '@app/config';
import Logger from '@app/util/Logger';

// Static initialisation
Logger.setLogLevel(Config.LogLevel);

const App: FunctionComponent<AppProps> = ({ Component, pageProps }) => {
  return <>
    <Head>
      <title>Our Text Adventure</title>

      <meta name="viewport" content="width=device-width, initial-scale=1"></meta>
    </Head>

    <Header />

    <div className="page">
      <div className="page__content">
        <Component {...pageProps} />
      </div>
    </div>
  </>;
};

export default App;
