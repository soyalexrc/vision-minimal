
import type { AxiosResponse } from 'axios';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isValidPhoneNumber } from 'react-phone-number-input/input';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { USER_STATUS_OPTIONS } from 'src/_mock';

import { toast } from 'src/components/snackbar';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

import { createOwner, updateOwner, useGetOwners } from '../../actions/owner';

import type { IOwnerItem } from '../../types/owner';

// ----------------------------------------------------------------------

export type OwnerQuickEditSchemaType = zod.infer<typeof OwnerQuickEditSchema>;

export const OwnerQuickEditSchema = zod.object({
  name: zod.string().min(1, { message: 'Nombre is required!' }),
  lastname: zod.string().min(1, { message: 'Apellido is required!' }),
  isInvestor: zod.boolean(),
  birthdate: zod.string().optional(),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  phoneNumber: schemaHelper.phoneNumber({ isValid: isValidPhoneNumber }),
  // country: schemaHelper.nullableInput(zod.string().min(1, { message: 'Country is required!' }), {
    // message for null value
    // message: 'Country is required!',
  // }),
  // state: zod.string().min(1, { message: 'State is required!' }),
  // city: zod.string().min(1, { message: 'City is required!' }),
  // address: zod.string().min(1, { message: 'Address is required!' }),
  // zipCode: zod.string().min(1, { message: 'Zip code is required!' }),
  // company: zod.string().min(1, { message: 'Company is required!' }),
  // role: zod.string().min(1, { message: 'Role is required!' }),
  // Not required
  status: zod.string(),
});

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  currentOwner?: IOwnerItem;
};

export function OwnerQuickEditForm({ currentOwner, open, onClose }: Props) {
  const defaultValues: OwnerQuickEditSchemaType = {
    name: '',
    lastname: '',
    email: '',
    phoneNumber: '',
    status: 'active',
    isInvestor: false,
    birthdate: undefined,
  };

  const methods = useForm<OwnerQuickEditSchemaType>({
    mode: 'all',
    resolver: zodResolver(OwnerQuickEditSchema),
    defaultValues,
    values: currentOwner?.id ? { ...currentOwner } : defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const { refetch } = useGetOwners();

  const onSubmit = handleSubmit(async (data) => {
    const promise = await (async () => {
      let response: AxiosResponse<any>;
      if (currentOwner?.id) {
        response = await updateOwner(data, currentOwner.id);
      } else {
        response = await createOwner(data);
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
      <DialogTitle>{currentOwner?.id ? 'Edicion de propietario' : 'Nuevo propietario'}</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent sx={{ pt: 2 }}>

          <Box
            sx={{
              rowGap: 3,
              columnGap: 2,
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
            }}
          >

            <Field.Text name="name" label="Nombre" />
            <Field.Text name="lastname" label="Apellido" />
            <Field.Text name="email" label="Correo electronico" />
            <Field.Phone name="phoneNumber" label="Numero de telefono" />
            <Field.Checkbox label="Es inversor?" name="isInvestor" />
            <Field.DatePicker name="birthdate" label="Fecha de cumpleanos" />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancelar
          </Button>

          <Button type="submit" variant="contained" loading={isSubmitting}>
            {currentOwner?.id ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
