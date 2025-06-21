import i18next from 'i18next';

import { allLangs } from '../all-langs';
import { fallbackLng } from '../locales-config';

// ----------------------------------------------------------------------

export function formatNumberLocale() {
  const lng = i18next.resolvedLanguage ?? fallbackLng;
  console.log('lng', lng);

  const currentLang = allLangs.find((lang) => lang.value === lng);
  console.log('currentLang', currentLang);

  return { code: currentLang?.numberFormat.code, currency: currentLang?.numberFormat.currency };
}
