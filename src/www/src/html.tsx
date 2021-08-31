import React, { FunctionComponent } from "react";

import Config from '@app/config';

interface Props {
  htmlAttributes: Record<string, unknown>,
  headComponents: unknown[],
  bodyAttributes: Record<string, unknown>,
  preBodyComponents: unknown[],
  body: string,
  postBodyComponents: unknown[],
}

const Html: FunctionComponent<Props> = (props) => {
  return (
    <html {...props.htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        {/* App info */}
        <meta name="app-environment" content={Config.EnvironmentId} />
        <meta name="app-version" content={Config.AppVersion} />

        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono:ital@0;1&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Zilla+Slab&display=swap" rel="stylesheet" />


        {props.headComponents}
      </head>
      <body {...props.bodyAttributes}>
        {props.preBodyComponents}
        <div
          key={`body`}
          id="___gatsby"
          dangerouslySetInnerHTML={{ __html: props.body }}
        />
        {props.postBodyComponents}
      </body>
    </html>
  );
};

export default Html;
