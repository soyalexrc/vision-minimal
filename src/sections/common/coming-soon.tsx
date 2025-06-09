'use client';

import type { UseCountdownDateReturn } from 'minimal-shared/hooks';

import React from 'react';
import dayjs from 'dayjs';
import { varAlpha } from 'minimal-shared/utils';
import { useCountdownDate } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import { outlinedInputClasses } from '@mui/material/OutlinedInput';

import { _socials } from 'src/_mock';
import { ComingSoonIllustration } from 'src/assets/illustrations';

import { Iconify } from 'src/components/iconify';


// ----------------------------------------------------------------------

type Props = {
  countdown?: UseCountdownDateReturn
  showEmailInput?: boolean;
  showSocials?: boolean;
}

// ----------------------------------------------------------------------

export function ComingSoonView({ countdown, showEmailInput, showSocials }: Props) {
  const currentDate = dayjs()
  const futureDate = currentDate.add(10, 'days');

  const defaultCountdown = useCountdownDate(futureDate.toDate());

  const countdownValue = defaultCountdown;

  return (
    <Container sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h3" sx={{ mb: 2 }}>
        Proximamente!
      </Typography>

      <Typography sx={{ color: 'text.secondary' }}>
        Estamos trabajando en esta pagina.
      </Typography>

      <ComingSoonIllustration sx={{ my: { xs: 5, sm: 10 } }} />

      <Stack
        divider={<Box sx={{ mx: { xs: 1, sm: 2.5 } }}>:</Box>}
        sx={{ typography: 'h2', justifyContent: 'center', flexDirection: 'row' }}
      >
        <TimeBlock label="Dias" value={countdownValue.days} />
        <TimeBlock label="Horas" value={countdownValue.hours} />
        <TimeBlock label="Minutos" value={countdownValue.minutes} />
        <TimeBlock label="Segundos" value={countdownValue.seconds} />
      </Stack>

      {
        showEmailInput &&
        <TextField
          fullWidth
          placeholder="Enter your email"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <Button variant="contained" size="large">
                    Notify me
                  </Button>
                </InputAdornment>
              ),
              sx: [
                (theme) => ({
                  pr: 0.5,
                  [`&.${outlinedInputClasses.focused}`]: {
                    boxShadow: theme.vars.customShadows.z20,
                    transition: theme.transitions.create(['box-shadow'], {
                      duration: theme.transitions.duration.shorter,
                    }),
                    [`& .${outlinedInputClasses.notchedOutline}`]: {
                      border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.32)}`,
                    },
                  },
                }),
              ],
            },
          }}
          sx={{ my: 5 }}
        />
      }
      {
        showSocials &&
        <Box sx={{ gap: 1, display: 'flex', justifyContent: 'center' }}>
          {_socials.map((social) => (
            <IconButton key={social.label}>
              {social.value === 'twitter' && <Iconify icon="socials:twitter" />}
              {social.value === 'facebook' && <Iconify icon="socials:facebook" />}
              {social.value === 'instagram' && <Iconify icon="socials:instagram" />}
              {social.value === 'linkedin' && <Iconify icon="socials:linkedin" />}
            </IconButton>
          ))}
        </Box>

      }
    </Container>
  );
}

// ----------------------------------------------------------------------

type TimeBlockProps = {
  label: string;
  value: string;
};

function TimeBlock({ label, value }: TimeBlockProps) {
  return (
    <div>
      <div> {value} </div>
      <Box sx={{ color: 'text.secondary', typography: 'body1' }}>{label}</Box>
    </div>
  );
}
