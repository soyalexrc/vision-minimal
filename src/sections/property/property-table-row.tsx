import type { GridCellParams } from '@mui/x-data-grid';

import NextLink from 'next/link'

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import { RouterLink } from 'src/routes/components';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import { getStatus } from '../../utils/get-status';
import { fCurrency } from '../../utils/format-number';
import { formatLocalVenezuelanPhone } from '../../utils/format-phone';

import type { GetStatusType } from '../../utils/get-status';

// ----------------------------------------------------------------------

type ParamsProps = {
  params: GridCellParams;
};

const RenderErrorWarning = ({ params }: ParamsProps) => {
  const findError = params.row.errors?.find((item: any) => item.field == params.field);
  if (findError && findError.message) {
    return (
      <Tooltip title={findError.message}>
        <Iconify icon="material-symbols:error-rounded" color="error.main" />
      </Tooltip>
    );
  }

  const findWarning = params.row.warnings?.find((item: any) => item.field == params.field);

  if (findWarning && findWarning.message) {
    return (
      <Tooltip title={findWarning.message}>
        <Iconify icon="material-symbols:warning-rounded" color="warning.main" />
      </Tooltip>
    );
  }
  return <></>;
};

export function RenderCellProperty({ params, href }: ParamsProps & { href: string }) {
  return (
    <Box
      sx={{
        py: 2,
        gap: 2,
        width: 1,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Avatar
        alt={params.row.publicationTitle}
        src={params.row.coverUrl}
        variant="rounded"
        sx={{ width: 64, height: 64 }}
      />

      <ListItemText
        primary={
          <Link component={RouterLink} href={href} color="inherit">
            {params.row.publicationTitle}
          </Link>
        }
        secondary="secondary"
        slotProps={{
          primary: { noWrap: true },
          secondary: { sx: { color: 'text.disabled' } },
        }}
      />
    </Box>
  );
}


export function RenderCellAmount({ params, value }: ParamsProps & { value: number }) {
  return (
    <Stack direction="row" spacing={0.5} sx={{ py: 1 }}>
      {fCurrency(value)} <RenderErrorWarning params={params} />
    </Stack>
  );
}

export function RenderCellStatus({ params, value }: ParamsProps & { value: GetStatusType }) {
  return (
    <Stack direction="row" spacing={0.5} sx={{ py: 1 }}>
      <Label variant="soft" color={getStatus(value)?.variant || 'default'}>
        {getStatus(value).name}
      </Label>{' '}
      <RenderErrorWarning params={params} />
    </Stack>
  );
}

export function RenderCell({ params, value }: ParamsProps & { value: string }) {
  return (
    <Stack direction="row" spacing={0.5} sx={{ py: 1 }}>
      {value} <RenderErrorWarning params={params} />
    </Stack>
  );
}

export function RenderCellPhone({ params, value }: ParamsProps & { value: string }) {
  return (
    <Stack direction="row" spacing={0.5} sx={{ py: 1 }}>
      <NextLink href={`https://wa.me/${value}`} target="_blank" rel="noopener noreferrer">
        <Typography variant="body2" sx={{ textDecoration: 'underline', cursor: 'pointer' }}>{formatLocalVenezuelanPhone(value)}</Typography>
      </NextLink>
      <RenderErrorWarning params={params} />
    </Stack>
  );
}

export function RenderCellRedirect({
                                     params,
                                     value,
                                     redirectTo
                                   }: ParamsProps & { value: string; redirectTo: string }) {
  return (
    <Stack direction="row" spacing={0.5} sx={{ py: 1 }}>
      <RouterLink href={redirectTo} passHref>
        <Typography
          variant="body2"
          color="text.primary"
          sx={{
            textDecoration: 'none',
            '&:hover': {
              cursor: 'pointer',
              textDecoration: 'underline',
            },
          }}
        >
          {value}
        </Typography>
      </RouterLink>
      <RenderErrorWarning params={params} />
    </Stack>
  );
}

