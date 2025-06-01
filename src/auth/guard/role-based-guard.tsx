'use client';

import type { Theme, SxProps } from '@mui/material/styles';

import { m } from 'framer-motion';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { ForbiddenIllustration } from 'src/assets/illustrations';

import { varBounce, MotionContainer } from 'src/components/animate';

import { useAuthContext } from '../hooks';
import React from 'react';

// ----------------------------------------------------------------------

/**
 * NOTE:
 * This component is for reference only.
 * You can customize the logic and conditions to better suit your application's requirements.
 */

export type RoleBasedGuardProp = {
  sx?: SxProps<Theme>;
  hasContent?: boolean;
  allowedRoles: string | string[];
  children: React.ReactNode;
};

export function RoleBasedGuard({
  sx,
  children,
  hasContent,
  allowedRoles,
}: RoleBasedGuardProp) {
  const { user } = useAuthContext();
  if (user && user.role && allowedRoles && !allowedRoles.includes(user.role)) {
    return hasContent ? (
      <Container
        component={MotionContainer}
        sx={[{ textAlign: 'center' }, ...(Array.isArray(sx) ? sx : [sx])]}
      >
        <m.div variants={varBounce('in')}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            Permiso denegado
          </Typography>
        </m.div>

        <m.div variants={varBounce('in')}>
          <Typography sx={{ color: 'text.secondary' }}>
            No cuentas con permiso para acceder a este contenido.
          </Typography>
        </m.div>

        <m.div variants={varBounce('in')}>
          <ForbiddenIllustration sx={{ my: { xs: 5, sm: 10 } }} />
        </m.div>
      </Container>
    ) : null;
  }

  return <> {children} </>;
}
