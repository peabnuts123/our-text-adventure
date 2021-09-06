// const path = require('path');
const { NormalModuleReplacementPlugin, DefinePlugin } = require('webpack');
const { version: PACKAGE_VERSION } = require('./package.json');

module.exports = {
  trailingSlash: true,
  reactStrictMode: true,
  webpack: (config) => {
    // Read environment in from NODE_ENV
    const ENVIRONMENT_ID = process.env['ENVIRONMENT_ID'].toLocaleLowerCase();

    // Configure webpack plugins
    // Rewrite imports to `@app/config` to the environment-specific version
    // This means configuration is type-safe, easy, and hot-reloads at runtime!
    config.plugins.push(new NormalModuleReplacementPlugin(/^@app\/config$/, (resource) => {
      resource.request = resource.request.replace(/.*/, `@app/config/environments/${ENVIRONMENT_ID}`);
    }));

    // Define these variables as globals in resulting JavaScript
    config.plugins.push(new DefinePlugin({
      // For some god awful reason the values need to be converted to valid code
      //  i.e. if the value is "world" it will plop the string "world" into your code
      //  where you reference the variable. So this must be converted to `'world'` i.e. a string
      //  within a string, so that the resulting code receives a string
      'process.env.PACKAGE_VERSION': JSON.stringify(PACKAGE_VERSION),
      'process.env.ENVIRONMENT_ID': JSON.stringify(ENVIRONMENT_ID),
    }));

    // Important: return the modified config
    return config;
  },
};
