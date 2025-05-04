import { CONFIG } from 'src/global-config';

import { NotFoundView } from 'src/sections/error';

// ----------------------------------------------------------------------

export const metadata = { title: `¡Página no encontrada 404! | Error - ${CONFIG.appName}` };

export default function Page() {
  return <NotFoundView />;
}
