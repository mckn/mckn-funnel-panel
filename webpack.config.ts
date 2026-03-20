import type { Configuration } from 'webpack';
import baseConfigFn, { type Env } from './.config/webpack/webpack.config.ts';

const config = async (env: Env): Promise<Configuration> => {
  const baseConfig = await baseConfigFn(env);

  const externals = Array.isArray(baseConfig.externals) ? baseConfig.externals : [];

  return {
    ...baseConfig,
    externals: [...externals, /^@grafana\/i18n/i],
  };
};

export default config;
