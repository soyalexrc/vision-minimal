'use client';

import { es } from 'date-fns/locale';
import { setDefaultOptions } from 'date-fns';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { LocalizationProvider as Provider } from '@mui/x-date-pickers/LocalizationProvider';

import { useLocales } from './use-locales';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export function LocalizationProvider({ children }: Props) {
  const { currentLang } = useLocales();

  setDefaultOptions({ locale: es })
  // dayjs.locale(currentLang.adapterLocale);

  return (
    <Provider dateAdapter={AdapterDateFns} adapterLocale={currentLang.adapterLocale as any}>
      {children}
    </Provider>
  );
}
