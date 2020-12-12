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
  ],
};
