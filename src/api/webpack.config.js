const path = require('path');
const { promisify } = require('util');
const glob = promisify(require('glob'));
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = async () => {
  return {
    mode: 'production',
    entry: await getEntryPoints(),
    target: 'node',
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: '[name]/index.js',
      library: {
        type: 'commonjs',
      },
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
      plugins: [
        /* For resolving path aliases defined in `tsconfig.json` */
        new TsconfigPathsPlugin(),
      ],
    },
  };
};

/**
 * Get a map of entrypoint names -> entry points, for processing by webpack
 * @returns {Promise<Record<string,string>>}
 */
async function getEntryPoints() {
  // All `index.ts` files under `src/handlers` are assumed to be handlers
  const allHandlers = await glob('./src/handlers/**/index.ts');

  // Map `./src/handlers/project/create/index.ts` into `project/create`
  //  and store on a map like:
  //    "project/create": './src/handlers/project/create/index.ts',
  //  for consumption by webpack.
  const entryPoints = {};
  allHandlers.forEach((handler) => {
    // Remove prefix and suffix using RegExp
    const [_, name] = /.\/src\/handlers\/(.*)\/index.ts/.exec(handler);
    entryPoints[name] = handler;
  });

  return entryPoints;
}
