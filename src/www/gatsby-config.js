module.exports = {
  plugins: [
    // Plugin to add a layout (parent) component to every page (not unloaded when transitioning between routes)
    'gatsby-plugin-layout',
    // Plugin to enable compilation of SASS (through dart-sass)
    {
      resolve: `gatsby-plugin-sass`,
      options: {
        implementation: require("sass"),
      },
    },
    // For deploying to S3
    {
      resolve: `gatsby-plugin-s3`,
      options: {
        // @TODO we might not need this plugin - not sure what it does with these values
        bucketName: '@TODO', // Will be overridden by deploy script
        // protocol: "https",
        // hostname: "our-text-adventure.foo.bar",
      },
    },
  ],
};
