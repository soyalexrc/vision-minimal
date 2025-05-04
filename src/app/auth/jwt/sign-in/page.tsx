import { CONFIG } from 'src/global-config';

import { JwtSignInView } from 'src/auth/view/jwt';

// ----------------------------------------------------------------------

export const metadata = { title: `Iniciar sesión | Jwt - ${CONFIG.appName}` };

export default function Page() {
  return <JwtSignInView />;
}
