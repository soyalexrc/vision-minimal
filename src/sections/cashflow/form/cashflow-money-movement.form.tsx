import { z } from 'zod';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { MenuItem } from '@mui/material';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { 
  useGetCashFlowEntities,
  useGetCashFlowWaysToPay,
  useGetCashFlowCurrencies
} from 'src/actions/cashflow';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { useAuthContext } from 'src/auth/hooks';
import { isAdmin } from 'src/utils/roles.mapper';

// Schema para validación
export const MoneyMovementSchema = z.object({
  from: z.number().min(1, 'Debe seleccionar la entidad de origen'),
  to: z.number().min(1, 'Debe seleccionar la entidad de destino'),
  currency: z.number().min(1, 'Debe seleccionar una moneda'),
  wayToPay: z.number().min(1, 'Debe seleccionar una categoría'),
//   amount: z.any().refine((val) => val && parseFloat(val) > 0, 'El monto debe ser mayor a 0'),
  amount: z.any().optional(),
  reason: z.string().optional(),
  date: z.any().optional(),
}).refine((data) => data.from !== data.to, {
  message: "La entidad de origen y destino no pueden ser la misma",
  path: ["hasta"],
});

export type MoneyMovementSchemaType = z.infer<typeof MoneyMovementSchema>;

interface CashflowMoneyMovementFormProps {
  onSubmit: (data: MoneyMovementSchemaType) => Promise<void>;
  onCancel: () => void;
}

export function CashflowMoneyMovementForm({ onSubmit, onCancel }: CashflowMoneyMovementFormProps) {
  const { user } = useAuthContext();
  const { entities } = useGetCashFlowEntities();
  const { currencies } = useGetCashFlowCurrencies();
  const { waysToPay } = useGetCashFlowWaysToPay();

  const defaultValues: MoneyMovementSchemaType = {
    from: 0,
    to: 0,
    currency: 0,
    wayToPay: 0,
    amount: 0,
    reason: '',
    date: new Date(),
  };

  const methods = useForm<MoneyMovementSchemaType>({
    mode: 'all',
    resolver: zodResolver(MoneyMovementSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const watchedDesde = watch('from');

  // Filtrar entidades para "hasta" - no puede ser la misma que "desde"
  const filteredEntitiesHasta = entities.filter((entity) => entity.id !== watchedDesde);

  const handleDateChange = useCallback((date: Date | null) => {
    if (date) {
      const adjustedDate = new Date(date);
      adjustedDate.setHours(12, 0, 0, 0);
      setValue('date', adjustedDate);
    } else {
      setValue('date', null);
    }
  }, [setValue]);

  const handleFormSubmit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  });

  const obtainPrefixByCurrency = () => {
    const currencyId = watch('currency');
    const currency = currencies.find((c) => c.id === currencyId);
    return currency ? currency.symbol : '';
  };

  return (
    <Form methods={methods} onSubmit={handleFormSubmit}>
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>
          Movimiento de Dinero
        </Typography>
        <Divider />
      </Box>

      <Box
        sx={{
          rowGap: 3,
          columnGap: 2,
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',
            md: 'repeat(2, 1fr)',
          },
        }}
      >
        {/* Fecha - Solo para ADMIN y TI */}
        {isAdmin(user.role) && (
          <Field.DatePicker
            name="date"
            size="small"
            label="Fecha"
            onChange={handleDateChange}
            sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}
          />
        )}

        {/* Desde */}
        <Field.Select
          name="from"
          label="Desde"
          size="small"
        >
        <MenuItem value={0}><em>Seleccionar</em></MenuItem>
        {entities.map((entity) => (
            <MenuItem key={entity.id} value={entity.id}>
            {entity.name}
            </MenuItem>
        ))}
        </Field.Select>

        {/* Hasta */}
        <Field.Select
          name="to"
          label="Hasta"
          size="small"
        >
        <MenuItem value={0}><em>Seleccionar</em></MenuItem>
        {filteredEntitiesHasta.map((entity) => (
            <MenuItem key={entity.id} value={entity.id}>
            {entity.name}
            </MenuItem>
        ))}
        </Field.Select>

        {/* Moneda */}
        <Field.Select
          name="currency"
          label="Moneda"
          size="small"
        >
          <MenuItem value={0}><em>Seleccionar</em></MenuItem>
            {currencies.map((currency) => (
            <MenuItem key={currency.id} value={currency.id}>
                {currency.name}
            </MenuItem>
            ))}
        </Field.Select>

        {/* Forma de pago */}
        <Field.Select
          name="wayToPay"
          label="Forma de pago"
          size="small"
        >
          <MenuItem value={0}><em>Seleccionar</em></MenuItem>
            {waysToPay.map((wayToPay) => (
                <MenuItem key={wayToPay.id} value={wayToPay.id}>
                {wayToPay.name}
                </MenuItem>
            ))}
        </Field.Select>

        {/* Monto */}
        <Field.Currency
            size="small"
            prefix={obtainPrefixByCurrency() + ' '}
            name="amount"
            label="Monto"
        />

        {/* Descripción */}
        <Field.Text
          name="reason"
          label="Concepto"
          size="small"
          multiline
          rows={3}
          sx={{ gridColumn: '1 / -1' }}
        />
      </Box>

      {/* Botones */}
      <Stack direction="row" justifyContent="flex-end" gap={2} my={4}>
        <Button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          type="submit"
          color="primary"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <Iconify icon="eva:loading-spinner-fill" /> : null}
        >
          {isSubmitting ? 'Creando...' : 'Crear Movimiento'}
        </Button>
      </Stack>
    </Form>
  );
}
