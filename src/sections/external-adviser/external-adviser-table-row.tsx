
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

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';

import { getStatus } from '../../utils/get-status';
import { ExternalAdviserQuickEditForm } from './external-adviser-quick-edit-form';

import type { GetStatusType } from '../../utils/get-status';
import type { IExternalAdviserItem } from '../../types/external-adviser';

// ----------------------------------------------------------------------

type Props = {
  row: IExternalAdviserItem;
  selected: boolean;
  editHref: string;
  onSelectRow: () => void;
  onDeleteRow: () => Promise<void>;
  onRestore: () => Promise<void>;
};

export function ExternalAdviserTableRow({ row, selected, editHref, onRestore, onSelectRow, onDeleteRow }: Props) {
  const menuActions = usePopover();
  const confirmDialog = useBoolean();
  const restoreDialog = useBoolean();
  const quickEditForm = useBoolean();

  const renderQuickEditForm = () => (
    <ExternalAdviserQuickEditForm
      currentExternalAdviser={row}
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
        {
          row.status !== 'deleted' &&
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
        }
        {
          row.status === 'deleted' &&
          <MenuItem
            onClick={() => {
              restoreDialog.onTrue();
              menuActions.onClose();
            }}
            sx={{ color: 'info.main' }}
          >
            <Iconify icon="solar:restart-bold" />
            Restaurar
          </MenuItem>
        }
      </MenuList>
    </CustomPopover>
  );

  const renderConfirmDialog = () => (
    <ConfirmDialog
      open={confirmDialog.value}
      onClose={confirmDialog.onFalse}
      title="Eliminar"
      content="Are you sure want to delete?"
      action={
        <Button variant="contained" color="error" onClick={async () => {
          await onDeleteRow()
          confirmDialog.onFalse();
        }}>
          Eliminar
        </Button>
      }
    />
  );

  const renderRestoreDialog = () => (
    <ConfirmDialog
      open={restoreDialog.value}
      onClose={restoreDialog.onFalse}
      title="Restaurar"
      content="Seguro que quieres restaurar este asesor?"
      action={
        <Button variant="contained" color="info" onClick={async () => {
          await onRestore()
          restoreDialog.onFalse();
        }}>
          Restaurar
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

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.id}</TableCell>
        <TableCell>
          <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
            {/*<Avatar alt={row.name} src={row.name} />*/}

            <Stack sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start' }}>
              <Link
                // component={RouterLink}
                // href={editHref}
                onClick={quickEditForm.onTrue}
                color="inherit"
                sx={{ cursor: 'pointer' }}
              >
                {row.name} {row.lastname}
              </Link>
              <Box component="span" sx={{ color: 'text.disabled' }}>
                {row.email}
              </Box>
            </Stack>
          </Box>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.phoneNumber}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.realStateCompanyName}</TableCell>



        <TableCell>
          <Label
            variant="soft"
            color={
              (getStatus(row.status as GetStatusType).variant)
            }
          >
            {getStatus(row.status as GetStatusType).name}
          </Label>
        </TableCell>

        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {
              row.status !== 'deleted' &&
              <Tooltip title="Editar" placement="top" arrow>
                <IconButton
                  color={quickEditForm.value ? 'inherit' : 'default'}
                  onClick={quickEditForm.onTrue}
                >
                  <Iconify icon="solar:pen-bold" />
                </IconButton>
              </Tooltip>
            }
            {
              row.status === 'deleted' &&
              <Box width={36} height={36} />
            }
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
      {renderRestoreDialog()}
    </>
  );
}
