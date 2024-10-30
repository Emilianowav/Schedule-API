import path from 'path';

const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.(mp3|wav|ogg)$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'static/sounds/',
            publicPath: '/_next/static/sounds/',
          },
        },
      ],
    });

    return config;
  },
};

export default nextConfig;
