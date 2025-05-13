import type { IAllyItem } from 'src/types/ally';

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
import { IExternalAdviserItem } from '../../types/external-adviser';
import type { AxiosResponse } from 'axios';
import { createAlly, updateAlly } from '../../actions/ally';
import { createExternalAdviser, updateExternalAdviser, useGetExternalAdvisers } from '../../actions/external-adviser';

// ----------------------------------------------------------------------

export type ExternalAdviserQuickEditSchemaType = zod.infer<typeof ExternalAdviserQuickEditSchema>;

export const ExternalAdviserQuickEditSchema = zod.object({
  name: zod.string().min(1, { message: 'Nombre is required!' }),
  lastname: zod.string().min(1, { message: 'Apellido is required!' }),
  realStateCompanyName: zod.string().optional(),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  phoneNumber: schemaHelper.phoneNumber({ isValid: isValidPhoneNumber }),
  status: zod.string(),
});

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  currentExternalAdviser?: IExternalAdviserItem;
};

export function ExternalAdviserQuickEditForm({ currentExternalAdviser, open, onClose }: Props) {
  const defaultValues: ExternalAdviserQuickEditSchemaType = {
    name: '',
    lastname: '',
    email: '',
    phoneNumber: '',
    realStateCompanyName: '',
    status: 'active',
  };

  const methods = useForm<ExternalAdviserQuickEditSchemaType>({
    mode: 'all',
    resolver: zodResolver(ExternalAdviserQuickEditSchema),
    defaultValues,
    values: currentExternalAdviser?.id ? { ...currentExternalAdviser } : defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const { refetch } = useGetExternalAdvisers()

  const onSubmit = handleSubmit(async (data) => {
    const promise = await (async () => {
      let response: AxiosResponse<any>;
      if (currentExternalAdviser?.id) {
        response = await updateExternalAdviser(data, currentExternalAdviser.id);
      } else {
        response = await createExternalAdviser(data);
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
      <DialogTitle>{currentExternalAdviser?.id ? 'Edicion de asesor' : 'Nuevo asesor externo'}</DialogTitle>

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

            {/*<Box sx={{ display: { xs: 'none', sm: 'block' } }} />*/}

            <Field.Text name="name" label="Nombre" />
            <Field.Text name="lastname" label="Apellido" />
            <Field.Text name="email" label="Correo electronico" />
            <Field.Text name="realStateCompanyName" label="Nombre de compania" />
            <Field.Phone name="phoneNumber" label="Numero de telefono" />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancelar
          </Button>

          <Button type="submit" variant="contained" loading={isSubmitting}>
            {currentExternalAdviser?.id ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
