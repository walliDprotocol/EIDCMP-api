import path from 'path';
import nodeExternals from 'webpack-node-externals';
import { Configuration } from 'webpack';
import WebpackShellPluginNext from 'webpack-shell-plugin-next';

const CopyWebpackPlugin = require('copy-webpack-plugin');

const getConfig = (env: { [key: string]: string }, argv: { [key: string]: string }): Configuration => {
  // eslint-disable-next-line global-require
  require('dotenv').config({ path: path.resolve(__dirname, `.env.${env.mode}`) });
  return {
    entry: './src/index.ts',
    target: 'node',
    mode: argv.mode === 'production' ? 'production' : 'development',
    externals: [nodeExternals()],
    plugins: [
      new WebpackShellPluginNext({
        onBuildStart: { scripts: ['npm run clean:dev && npm run clean:prod'], blocking: true, parallel: false },
        onBuildEnd: {
          scripts: argv.mode === 'production' ? [] : ['npm run development'],
          blocking: false,
          parallel: true,
        },
      }),
      new CopyWebpackPlugin({
        patterns: [
          // {
          //   from: path.resolve(__dirname, 'webapp'),
          //   to: path.resolve(__dirname, 'build', 'webapp'),
          // },
          {
            from: path.resolve(__dirname, 'src', 'templates'),
            to: path.resolve(__dirname, 'build', 'templates'),
          },
        ],
      }),
    ],

    module: {
      rules: [
        {
          test: /\.(ts|js)$/,
          loader: 'ts-loader',
          options: {},
          exclude: /node_modules/,
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
          include: path.resolve(__dirname, 'src', 'assets', 'characters'),
          generator: {
            filename: 'assets/characters/[name][ext]', // specify the folder for assets
          },
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
      alias: {
        src: path.resolve(__dirname, 'src'),
      },
    },
    output: { path: path.join(__dirname, 'build'), filename: 'index.js', publicPath: '/' },
    optimization: { moduleIds: 'deterministic', splitChunks: { chunks: 'all' } },
  };
};
export default getConfig;
