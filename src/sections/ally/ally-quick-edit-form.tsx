import type { AxiosResponse } from 'axios';
import type { IAllyItem } from 'src/types/ally';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isValidPhoneNumber } from 'react-phone-number-input/input';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { toast } from 'src/components/snackbar';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

import { createAlly, updateAlly, useGetAllies } from '../../actions/ally';

// ----------------------------------------------------------------------

export type AllyQuickEditSchemaType = zod.infer<typeof AllyQuickEditSchema>;

export const AllyQuickEditSchema = zod.object({
  name: zod.string().min(1, { message: 'Nombre is required!' }),
  lastname: zod.string().min(1, { message: 'Apellido is required!' }),
  email: zod
    .string()
    .min(1, { message: 'Correo electronico es requerido!' })
    .email({ message: 'Correo electronico debe ser valido!' }),
  phoneNumber: schemaHelper.phoneNumber({ isValid: isValidPhoneNumber }),
  status: zod.string().optional(),
});

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  currentAlly?: IAllyItem;
};

export function AllyQuickEditForm({ currentAlly, open, onClose }: Props) {
  const defaultValues: AllyQuickEditSchemaType = {
    name: '',
    lastname: '',
    email: '',
    phoneNumber: '',
    status: 'active',
  };

  const methods = useForm<AllyQuickEditSchemaType>({
    mode: 'all',
    resolver: zodResolver(AllyQuickEditSchema),
    defaultValues,
    values: currentAlly ? { ...currentAlly } : defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const { refetch } = useGetAllies();

  const onSubmit = handleSubmit(async (data) => {
    const promise = await (async () => {
      let response: AxiosResponse<any>;
      if (currentAlly?.id) {
        response = await updateAlly(data, currentAlly.id);
      } else {
        response = await createAlly(data);
      }

      if (response.status === 200 || response.status === 201) {
        return response.data?.message;
      } else {
        throw new Error(response.data?.message);
      }
    })();

    toast.promise(promise, {
      loading: 'Cargando...',
      success: (message: any) => message || 'Update success!',
      error: (error) => error || 'Update error!',
    });

    try {
      await promise;
      reset();
      refetch()
      onClose();
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: { maxWidth: 720 },
        },
      }}
    >
      <DialogTitle>{currentAlly?.id ? 'Edicion de aliado' : 'Nuevo aliado'}</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent sx={{ pt: 2 }}>
          {/* <Alert variant="outlined" severity="info" sx={{ mb: 3 }}>
            Account is waiting for confirmation
          </Alert> */}

          <Box
            sx={{
              rowGap: 3,
              columnGap: 2,
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
            }}
          >
            {/* <Field.Select name="status" label="Status">
              {USER_STATUS_OPTIONS.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Field.Select> */}

            {/* <Box sx={{ display: { xs: 'none', sm: 'block' } }} /> */}

            <Field.Text name="name" label="Nombre" />
            <Field.Text name="lastname" label="Apellido" />
            <Field.Text name="email" label="Correo electronico" />
            <Field.Phone name="phoneNumber" label="Numero de telefono" />

            {/* <Field.CountrySelect
              fullWidth
              name="country"
              label="Country"
              placeholder="Choose a country"
            /> */}

            {/* <Field.Text name="state" label="State/region" /> */}
            {/* <Field.Text name="city" label="City" /> */}
            {/* <Field.Text name="address" label="Address" /> */}
            {/* <Field.Text name="zipCode" label="Zip/code" /> */}
            {/* <Field.Text name="company" label="Company" /> */}
            {/* <Field.Text name="role" label="Role" /> */}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancelar
          </Button>

          <Button type="submit" variant="contained" loading={isSubmitting}>
            {currentAlly?.id ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
