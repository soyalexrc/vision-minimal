
import { AuthGuard } from 'src/auth/guard';

import { SimpleLayout } from '../../layouts/simple';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {

  return (
    <AuthGuard>
      <SimpleLayout>
        {children}
      </SimpleLayout>
    </AuthGuard>
  );
}
