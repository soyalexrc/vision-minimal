'use client';

// Error boundaries must be Client Components

import { m } from 'framer-motion';
import { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import axios from '../lib/axios';
import { useAuthContext } from '../auth/hooks';
import { SimpleLayout } from '../layouts/simple';
import { RouterLink } from '../routes/components';
import { ServerErrorIllustration } from '../assets/illustrations';
import { varBounce, MotionContainer } from '../components/animate';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [retries, setRetries] = useState(0);
  const {user} = useAuthContext();

  useEffect(() => {
    console.log('here', error.message);
    notifyDiscord();
  }, []);

  const notifyDiscord = async () => {
    try {
      if (process.env.NODE_ENV === 'development') return;
      const response = await axios.post('/external/notify-discord', {
        contents: [
          {"name": "user", "value": JSON.stringify(user)},
          {"name": "url", "value": window.location.href},
          {"name": "userAgent", "value": navigator.userAgent},
          {"name": "source", "value": 'VISION INMOBILIARIA FRONTEND'},
        ],
        error: error.message,
        type: 'error'
      });

      if (response.data.success) {
        console.log('Discord notification sent successfully');
      } else {
        console.log('Discord notification sent successfully');
      }
    } catch (err) {
      console.error('Error notifying Discord:', err);
    }
  }

  function handleRetry() {
    setRetries((prev) => prev + 1);
    if (retries < 2) {
      reset();
    } else {
      location.reload();
    }
  }

  return (
    <SimpleLayout
      slotProps={{
        content: { compact: true },
      }}
    >
      <Container component={MotionContainer}>
        <m.div variants={varBounce('in')}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            Oops... Algo paso, vuelve a intentarlo.
          </Typography>
        </m.div>

        <m.div variants={varBounce('in')}>
          <Typography sx={{ color: 'text.secondary' }}>
            Lo sentimos, ha ocurrido un error inesperado. Por favor, intenta nuevamente o contacta
            al soporte si el problema persiste.
          </Typography>
        </m.div>

        <m.div variants={varBounce('in')}>
          <ServerErrorIllustration sx={{ my: { xs: 4, sm: 8 } }} />
        </m.div>

        <Stack gap={2}>
          <Button onClick={handleRetry} size="large" variant="contained">
            Intentar de nuevo
          </Button>
          <Button component={RouterLink} href="/" size="large">
            Volver a el inicio
          </Button>
        </Stack>
      </Container>
    </SimpleLayout>
  );
}
