import type { GridCellParams } from '@mui/x-data-grid';

import NextLink from 'next/link'
import { useBoolean, usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';

import { getStatus } from '../../utils/get-status';
import { fCurrency } from '../../utils/format-number';
import { ClientQuickEditForm } from './client-quick-edit-form';
import { formatLocalVenezuelanPhone } from '../../utils/format-phone';

import type { IClientItem } from '../../types/client';
import type { GetStatusType } from '../../utils/get-status';
import { UserType } from '../../auth/types';

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

export function ConditionalRenderCell({ params, value, user }: ParamsProps & { value: string, user?: UserType }) {
  // Check ownership: does record.adviserId match current user.id?
  console.log(params.row);
  const hasAccess = !user ||
    user.role !== "ASESOR_INMOBILIARIO" ||
    !params.row.adviserId ||
    params.row.adviserId === user?.id;

  if (!hasAccess) {
    return <span style={{ color: '#ccc' }}>***</span>; // Show placeholder
  }

  return (
    <Stack direction="row" spacing={0.5} sx={{ py: 1 }}>
      {value} <RenderErrorWarning params={params} />
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

export function RenderCellPhone({ params, value, user }: ParamsProps & { value: string, user: UserType }) {
  // Check ownership: does record.adviserId match current user.id?
  console.log(params.row);
  const hasAccess = !user ||
    user.role !== "ASESOR_INMOBILIARIO" ||
    !params.row.adviserId ||
    params.row.adviserId === user?.id;

  if (!hasAccess) {
    return <span style={{ color: '#ccc' }}>***</span>; // Show placeholder
  }

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

// ----------------------------------------------------------------------

type Props = {
  row: IClientItem;
  selected: boolean;
  editHref: string;
  onSelectRow: () => void;
  onDeleteRow: () => void;
};

export function ClientTableRow({ row, selected, editHref, onSelectRow, onDeleteRow }: Props) {
  const menuActions = usePopover();
  const confirmDialog = useBoolean();
  const quickEditForm = useBoolean();

  const renderQuickEditForm = () => (
    <ClientQuickEditForm
      currentclient={row}
      open={quickEditForm.value}
      onClose={quickEditForm.onFalse}
    />
  );

  const renderMenuActions = () => (
    <CustomPopover
      open={menuActions.open}
      anchorEl={menuActions.anchorEl}
      onClose={menuActions.onClose}
      slotProps={{ arrow: { placement: 'right-top' } }}
    >
      <MenuList>
        <li>
          <MenuItem component={RouterLink} href={editHref} onClick={() => menuActions.onClose()}>
            <Iconify icon="solar:pen-bold" />
            Editar
          </MenuItem>
        </li>

        <MenuItem
          onClick={() => {
            confirmDialog.onTrue();
            menuActions.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Eliminar
        </MenuItem>
      </MenuList>
    </CustomPopover>
  );

  const renderConfirmDialog = () => (
    <ConfirmDialog
      open={confirmDialog.value}
      onClose={confirmDialog.onFalse}
      title="Delete"
      content="Are you sure want to delete?"
      action={
        <Button variant="contained" color="error" onClick={onDeleteRow}>
          Delete
        </Button>
      }
    />
  );

  return (
    <>
      <TableRow hover selected={selected} aria-checked={selected} tabIndex={-1}>
        <TableCell padding="checkbox">
          <Checkbox
            checked={selected}
            onClick={onSelectRow}
            slotProps={{
              input: {
                id: `${row.id}-checkbox`,
                'aria-label': `${row.id} checkbox`,
              },
            }}
          />
        </TableCell>
        <TableCell>{row.id}</TableCell>

        <TableCell>
          <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
            {/*<Avatar alt={row.name} src={row.name} />*/}

            <Stack sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start' }}>
              <Link
                component={RouterLink}
                href={editHref}
                color="inherit"
                sx={{ cursor: 'pointer' }}
              >
                {row.name?.toUpperCase()} {row.lastname?.toUpperCase()}
              </Link>
              <Box component="span" sx={{ color: 'text.disabled' }}>
                {row.email}
              </Box>
            </Stack>
          </Box>
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.phone}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap', minWidth: 200 }}>{row.adviserName}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.serviceName}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.propertytype}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.propertyOfInterest}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.contactFrom}</TableCell>
        <TableCell sx={{ minWidth: 200 }}>
          <Typography variant="caption">{row.specificRequirement}</Typography>
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.requestracking}</TableCell>
        <TableCell>
          <Label
            variant="soft"
            color={
              (row.status === 'active' && 'success') ||
              (row.status === 'pending' && 'warning') ||
              (row.status === 'banned' && 'error') ||
              (row.status === 'deleted' && 'error') ||
              'default'
            }
          >
            {row.status}
          </Label>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap', minWidth: 140 }}>
          <Label variant="soft" color={row.isinwaitinglist ? 'success' : 'error'}>
            {row.isinwaitinglist ? 'Si' : 'No'}
          </Label>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Label variant="soft" color={row.isPotentialInvestor ? 'success' : 'error'}>
            {row.isPotentialInvestor ? 'Si' : 'No'}
          </Label>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {fCurrency(row.budgetfrom)} - {fCurrency(row.budgetto)}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.typeOfPerson}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Label
            variant="soft"
            color={
              row.allowyounger === 'Si'
                ? 'success'
                : row.allowyounger === 'No'
                  ? 'error'
                  : 'default'
            }
          >
            {row.allowyounger} {row.allowyounger === 'Si' && ` = ${row.amountOfYounger}`}
          </Label>
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Label
            variant="soft"
            color={
              row.allowpets === 'Si' ? 'success' : row.allowpets === 'No' ? 'error' : 'default'
            }
          >
            {row.allowpets} {row.allowpets === 'Si' && ` = ${row.amountOfPets}`}
          </Label>
        </TableCell>

        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Quick Edit" placement="top" arrow>
              <IconButton
                color={quickEditForm.value ? 'inherit' : 'default'}
                onClick={quickEditForm.onTrue}
              >
                <Iconify icon="solar:pen-bold" />
              </IconButton>
            </Tooltip>

            <IconButton
              color={menuActions.open ? 'inherit' : 'default'}
              onClick={menuActions.onOpen}
            >
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </Box>
        </TableCell>
      </TableRow>

      {renderQuickEditForm()}
      {renderMenuActions()}
      {renderConfirmDialog()}
    </>
  );
}
