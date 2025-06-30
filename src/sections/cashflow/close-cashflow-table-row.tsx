
import type { ICloseCashFlowItem } from 'src/types/cashflow';

import { useBoolean } from 'minimal-shared/hooks';

import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import { Iconify } from 'src/components/iconify';
// import { AllyQuickEditForm } from './ally-quick-edit-form';

import { CloseCashFlowQuickView } from './close-cashflow-quick-view';


// ----------------------------------------------------------------------

type Props = {
  row: ICloseCashFlowItem;
};

export function CloseCashFlowTableRow({ row }: Props) {
  const quickView = useBoolean();

  const renderQuickEditForm = () => (
    <CloseCashFlowQuickView
      currentInfo={row}
      open={quickView.value}
      onClose={quickView.onFalse}
    />
  );

  return (
    <>
      <TableRow hover tabIndex={-1}>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.id}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.date}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
            <Button onClick={quickView.onToggle} size="small" variant="text" color="info">
                <Iconify icon="mdi:eye" sx={{ mr: 1 }} />
                Ver detalle
            </Button>
        </TableCell>



      </TableRow>

      {renderQuickEditForm()}
    </>
  );
}
