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
