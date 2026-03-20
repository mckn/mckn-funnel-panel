import { initPluginTranslations } from '@grafana/i18n';
import { config } from '@grafana/runtime';
import semver from 'semver';
import pluginJson from 'plugin.json';
import { loadResources } from './loadResources';

export async function initI18n(): Promise<void> {
  const grafanaVersion = config?.buildInfo?.version;
  const loaders = grafanaVersion && semver.lt(grafanaVersion, '12.1.0') ? [loadResources] : [];
  await initPluginTranslations(pluginJson.id, loaders);
}
