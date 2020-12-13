
const path = require('path');

exports.onCreateWebpackConfig = ({ actions }) => {
  // Add `@app` alias for imports
  actions.setWebpackConfig({
    resolve: {
      alias: {
        '@app': path.resolve(__dirname, 'src/'),
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
  });
};
