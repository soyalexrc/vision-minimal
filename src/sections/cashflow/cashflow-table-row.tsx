import { useBoolean, usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import MenuList from '@mui/material/MenuList';
import Collapse from '@mui/material/Collapse';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import { RouterLink } from 'src/routes/components';

import { fCurrency } from 'src/utils/format-number';
import { fDateTimeVE2, fromDateString } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';

import { formatNumericId } from '../../utils/format-string';

import type { ICashFlowItem, ICashFlowPayment } from '../../types/cashflow';

// ----------------------------------------------------------------------

type Props = {
  row: ICashFlowItem;
  selected: boolean;
  detailsHref: string;
  onSelectRow: () => void;
  onDeleteRow: () => void;
};
export function CashFlowTableRow({ row, selected, onSelectRow, onDeleteRow, detailsHref }: Props) {
  const confirmDialog = useBoolean();
  const menuActions = usePopover();
  const collapseRow = useBoolean();

  function getCorrectValueForAmountField(item: ICashFlowPayment) {
    if (item.transactionType === 2) {
      return item.pendingToCollect
    }
    if (item.transactionType === 5) {
      return item.totalDue
    }
    return item.amount;
  }

  const renderPrimaryRow = () => (
    <TableRow hover selected={selected}>
      <TableCell padding="checkbox">
        {/*<Checkbox*/}
        {/*  checked={selected}*/}
        {/*  onClick={onSelectRow}*/}
        {/*  slotProps={{*/}
        {/*    input: {*/}
        {/*      id: `${row.id}-checkbox`,*/}
        {/*      'aria-label': `${row.id} checkbox`,*/}
        {/*    },*/}
        {/*  }}*/}
        {/*/>*/}
        <IconButton color={menuActions.open ? 'inherit' : 'default'} onClick={menuActions.onOpen}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </TableCell>

      <TableCell>
        <Link component={RouterLink} href={detailsHref} color="inherit" underline="always">
          #{formatNumericId(row.id, 5)}
        </Link>
      </TableCell>

      <TableCell>
        <ListItemText
          primary={fDateTimeVE2(fromDateString(row.date as string)).date}
          slotProps={{
            primary: {
              noWrap: true,
              sx: { typography: 'body2' },
            },
            secondary: {
              sx: { mt: 0.5, typography: 'caption' },
            },
          }}
        />
      </TableCell>

      <TableCell>
        <ListItemText
          primary={fDateTimeVE2(row.updatedAt!).date}
          secondary={fDateTimeVE2(row.updatedAt!).time}
          slotProps={{
            primary: {
              noWrap: true,
              sx: { typography: 'body2' },
            },
            secondary: {
              sx: { mt: 0.5, typography: 'caption' },
            },
          }}
        />
      </TableCell>

      <TableCell>
        <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
          <Avatar alt={row.persondata?.name}>{row.persondata?.name.toUpperCase().substring(0, 2)}</Avatar>

          <Stack sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start' }}>
            <Box component="span">{row.persondata?.name.toUpperCase()}</Box>

            {
              row.propertydata &&
              <Box component="span" sx={{ color: 'text.disabled' }}>
                {row.propertydata.name}
              </Box>
            }
            {
              !row.propertydata &&
              <Box component="span" sx={{ color: 'text.disabled' }}>
                {row.location}
              </Box>
            }
          </Stack>
        </Box>
      </TableCell>



      <TableCell align="center"> {row.payments.length} </TableCell>

      <TableCell>
        {row.total_amount.map((item) => (
          <Stack key={item.currency}>
            <Typography variant="body2" color="success.dark">
              {fCurrency(item.total_income, { currency: item.currency_code })}
            </Typography>
            <Typography variant="body2" color="error.dark">
              {fCurrency(item.total_outcome, { currency: item.currency_code })}
            </Typography>
          </Stack>
        ))}
      </TableCell>

      <TableCell>
        {row.total_amount.map((item) => (
          <Stack key={item.currency}>
            <Typography variant="body2" color="success.dark">
              {fCurrency(item.total_pending_to_collect, { currency: item.currency_code })}
            </Typography>
            <Typography variant="body2" color="error.dark">
              {fCurrency(item.total_due, { currency: item.currency_code })}
            </Typography>
          </Stack>
        ))}
      </TableCell>

      {/*<TableCell>*/}
      {/*  <Label*/}
      {/*    variant="soft"*/}
      {/*    color={getStatus(row.type as GetStatusType)?.variant || 'default'}*/}
      {/*  >*/}
      {/*    {getStatus(row.type as GetStatusType).name}*/}
      {/*  </Label>*/}
      {/*</TableCell>*/}

      <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <IconButton
          color={collapseRow.value ? 'inherit' : 'default'}
          onClick={collapseRow.onToggle}
          sx={{ ...(collapseRow.value && { bgcolor: 'action.hover' }) }}
        >
          <Iconify icon="eva:arrow-ios-downward-fill" />
        </IconButton>
      </TableCell>
    </TableRow>
  );

  const renderSecondaryRow = () => (
    <TableRow>
      <TableCell sx={{ p: 0, border: 'none' }} colSpan={10}>
        <Collapse
          in={collapseRow.value}
          timeout="auto"
          unmountOnExit
          sx={{ bgcolor: 'background.neutral' }}
        >
          <Paper sx={{ m: 1.5 }}>
            {row.payments.map((item) => (
              <Box
                key={item.id}
                sx={(theme) => ({
                  display: 'flex',
                  alignItems: 'center',
                  p: theme.spacing(1.5, 2, 1.5, 1.5),
                  '&:not(:last-of-type)': {
                    borderBottom: `solid 2px ${theme.vars.palette.background.neutral}`,
                  },
                })}
              >
                <ListItemText
                  primary={item.service + ' ' + (item.serviceType ?? '')}
                  secondary={item.reason}
                  sx={{
                    flex: 1,
                  }}
                  slotProps={{
                    primary: {
                      sx: { typography: 'body2' },
                    },
                    secondary: {
                      sx: { mt: 0.5, color: 'text.disabled' },
                    },
                  }}
                />

                <Stack direction="row" gap={4} flexWrap="wrap" >
                  <Stack>
                    <Typography variant="caption" fontWeight="bold">
                      Tipo de transaccion
                    </Typography>
                    <Typography variant="body2">{item.transactionTypeData.name}</Typography>
                  </Stack>
                  {
                    item.entityData && item.entityData.name &&
                    <Stack>
                      <Typography variant="caption" fontWeight="bold">
                        Entidad
                      </Typography>
                      <Typography variant="body2">{item.entityData.name}</Typography>
                    </Stack>
                  }
                  <Stack>
                    <Typography variant="caption" fontWeight="bold">
                      Forma de pago
                    </Typography>
                    <Typography variant="body2">{item.wayToPayData.name}</Typography>
                  </Stack>
                </Stack>

                <Box sx={{ width: 110, textAlign: 'right' }}>
                  <Stack>
                    <Typography variant="caption" fontWeight="bold">
                      Monto
                    </Typography>
                    <Typography variant="body2">{fCurrency(getCorrectValueForAmountField(item), { currency: item.currencyData.code })}</Typography>
                  </Stack>

                </Box>
              </Box>
            ))}
          </Paper>
        </Collapse>
      </TableCell>
    </TableRow>
  );

  const renderMenuActions = () => (
    <CustomPopover
      open={menuActions.open}
      anchorEl={menuActions.anchorEl}
      onClose={menuActions.onClose}
      slotProps={{ arrow: { placement: 'right-top' } }}
    >
      <MenuList>
        {/*<MenuItem*/}
        {/*  onClick={() => {*/}
        {/*    confirmDialog.onTrue();*/}
        {/*    menuActions.onClose();*/}
        {/*  }}*/}
        {/*  sx={{ color: 'error.main' }}*/}
        {/*>*/}
        {/*  <Iconify icon="solar:trash-bin-trash-bold" />*/}
        {/*  Eliminar*/}
        {/*</MenuItem>*/}

        <li>
          <MenuItem component={RouterLink} href={detailsHref} onClick={() => menuActions.onClose()}>
            <Iconify icon="solar:eye-bold" />
            Ver
          </MenuItem>
        </li>
      </MenuList>
    </CustomPopover>
  );

  const renderConfrimDialog = () => (
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
      {renderPrimaryRow()}
      {renderSecondaryRow()}
      {renderMenuActions()}
      {renderConfrimDialog()}
    </>
  );
}
