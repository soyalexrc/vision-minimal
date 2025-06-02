import type { AxiosResponse } from 'axios';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { isValidPhoneNumber } from 'react-phone-number-input/input';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';

import { toast } from 'src/components/snackbar';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

import { Iconify } from '../../components/iconify';
import { fDateUTC } from '../../utils/format-time';
import { RoleType } from '../../utils/roles.mapper';
import { createUser, updateUser, useGetUsers } from '../../actions/user';

import type { IUserItem } from '../../types/user';

// ----------------------------------------------------------------------

export type UserQuickEditSchemaType = zod.infer<typeof UserQuickEditSchema>;

export const UserQuickEditSchema = zod.object({
  firstname: zod.string().min(1, { message: 'Nombre is required!' }),
  lastname: zod.string().min(1, { message: 'Apellido is required!' }),
  username: zod.string().min(1, { message: 'Nombre de usuario is required!' }),
  email: zod
    .string()
    .min(1, { message: 'Correo es requerido!' })
    .email({ message: 'Debe ser un correo valido!' }),
  phonenumber: schemaHelper.phoneNumber({ isValid: isValidPhoneNumber }),
  role: zod.string().min(1, { message: 'Rol es requerido!' }),
  password: zod
    .string()
    .min(1, { message: 'Contraseña es requerida!' })
    .min(6, { message: 'Contraseña debe tener al menos 6 caracteres!' }),
  imageurl: zod.string().optional(),
  isactive: zod.boolean().optional().default(true),
  status: zod.string().default('active'),
  permissions: zod.any().optional(),
  pushtoken: zod.string().optional().default(''),
  twofactorenabled: zod.boolean().optional().default(false),
  issuperadmin: zod.boolean().optional().default(false),
});

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  currentUser?: IUserItem;
};

export function UserQuickEditForm({ currentUser, open, onClose }: Props) {
  const defaultValues: UserQuickEditSchemaType = {
    firstname: '',
    email: '',
    lastname: '',
    phonenumber: '',
    status: 'active',
    imageurl: '',
    isactive: true,
    password: '',
    permissions: {},
    username: '',
    role: '',
    pushtoken: '',
    twofactorenabled: false,
    issuperadmin: false,
  };

  const methods = useForm<UserQuickEditSchemaType>({
    mode: 'all',
    resolver: zodResolver(UserQuickEditSchema),
    defaultValues,
    values: currentUser,
  });

  const showPassword = useBoolean();

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const { refresh } = useGetUsers()


  const onSubmit = handleSubmit(async (data) => {
    const promise = await (async () => {
      let response: AxiosResponse<any>;
      if (currentUser?.id) {
        response = await updateUser(data, currentUser.id);
      } else {
        response = await createUser(data);
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
      refresh()
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
      <DialogTitle>{currentUser?.id ? 'Edicion de usuario' : 'Nuevo usuario'}</DialogTitle>

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

            <Field.Text name="firstname" label="Nombre" />
            <Field.Text name="lastname" label="Apellido" />
            <Field.Text name="username" label="Nombre de usuario" />
            <Field.Text name="email" label="Correo electornico" />
            <Field.Phone name="phonenumber" label="Numero de telefono" />
            <Field.Text
              name="password"
              label="Contraseña"
              placeholder="6+ caracteres"
              type={showPassword.value ? 'text' : 'password'}
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={showPassword.onToggle} edge="end">
                        <Iconify
                          icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Field.Select name="role" label="Rol de usuario">
              {
                Object.entries(RoleType).filter(([ key ]) => key !== 'TI' && key !== 'ADMINISTRADOR').map(([key, label]) => (
                  <MenuItem key={key} value={key}>
                    {label}
                  </MenuItem>
                ))
              }
            </Field.Select>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          <Button type="submit" variant="contained" loading={isSubmitting}>
            {currentUser?.id ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
