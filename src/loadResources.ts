import { type ResourceLoader, type Resources } from '@grafana/i18n';
import pluginJson from 'plugin.json';

const resources: Record<string, () => Promise<{ default: Resources }>> = {
  'en-US': () => import('./locales/en-US/mckn-funnel-panel.json'),
  'sv-SE': () => import('./locales/sv-SE/mckn-funnel-panel.json'),
  'es-ES': () => import('./locales/es-ES/mckn-funnel-panel.json'),
  'pt-BR': () => import('./locales/pt-BR/mckn-funnel-panel.json'),
  'fr-FR': () => import('./locales/fr-FR/mckn-funnel-panel.json'),
};

export const loadResources: ResourceLoader = async (resolvedLanguage: string) => {
  try {
    const loader = resources[resolvedLanguage];
    if (!loader) {
      console.error(`The plugin '${pluginJson.id}' doesn't support the language '${resolvedLanguage}'`);
      return {};
    }

    const translation = await loader();
    return translation.default;
  } catch (error) {
    console.error(`The plugin '${pluginJson.id}' failed to load language '${resolvedLanguage}'`, error);
    return {};
  }
};
