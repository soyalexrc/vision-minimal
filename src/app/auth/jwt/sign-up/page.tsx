import { CONFIG } from 'src/global-config';

import { JwtSignUpView } from 'src/auth/view/jwt';

// ----------------------------------------------------------------------

export const metadata = { title: `Registrarse | Jwt - ${CONFIG.appName}` };

export default function Page() {
  return <JwtSignUpView />;
}
