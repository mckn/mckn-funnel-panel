import { LANGUAGES, type ResourceLoader, type Resources } from '@grafana/i18n';
import pluginJson from 'plugin.json';

const pluginLanguageCodes = Array.isArray((pluginJson as any).languages)
  ? new Set<string>((pluginJson as any).languages)
  : new Set<string>();

const resources = LANGUAGES.filter((lang) => pluginLanguageCodes.has(lang.code)).reduce<
  Record<string, () => Promise<{ default: Resources }>>
>((acc, lang) => {
  acc[lang.code] = async () => await import(`./locales/${lang.code}/${pluginJson.id}.json`);
  return acc;
}, {});

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
