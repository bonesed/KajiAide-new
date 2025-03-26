const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function(env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      // 必要に応じてオプションを追加
      babel: {
        dangerouslyAddModulePathsToTranspile: [
          // Web対応のために特別なトランスパイルが必要なパッケージがあれば追加
        ]
      }
    },
    argv
  );

  // Web特有の設定をさらに追加
  // SVGやその他のファイルタイプへの対応を強化
  config.module.rules.push({
    test: /\.svg$/,
    use: ['@svgr/webpack', 'url-loader'],
  });

  // PWA対応のためのプラグイン設定
  if (env.mode === 'production') {
    config.plugins.push(
      // PWA対応のためのWorkboxプラグインなどを追加できます
    );
  }

  return config;
};