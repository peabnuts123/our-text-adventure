import Document, { Html, Head, Main, NextScript } from 'next/document';

import Config from '@app/config';

class MyDocument extends Document {
  render(): JSX.Element {
    return (
      <Html lang="en">
        <Head>
          {/* App info */}
          <meta name="app-environment" content={Config.EnvironmentId} />
          <meta name="app-version" content={Config.AppVersion} />

          {/* Fonts */}
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link href="https://fonts.googleapis.com/css2?family=Space+Mono:ital@0;1&display=swap" rel="stylesheet" />
          <link href="https://fonts.googleapis.com/css2?family=Zilla+Slab&display=swap" rel="stylesheet" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
