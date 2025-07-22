import type { AxiosResponse } from 'axios';
import type { UseFormRegister } from 'react-hook-form';

import { z } from 'zod';
import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { useGetUsers } from '../../../actions/user';
import { toast } from '../../../components/snackbar';
import { useAuthContext } from '../../../auth/hooks';
import { Iconify } from '../../../components/iconify';
import { getChangedFields } from '../../../utils/form';
import { useGetServices } from '../../../actions/service';
import { Form, Field } from '../../../components/hook-form';
import { useParams, useRouter } from '../../../routes/hooks';
import { useGetCategories } from '../../../actions/category';
import { parseCurrency } from '../../../utils/format-number';
import { createClient, updateClient, useGetClient, useGetClients } from '../../../actions/client';

import type { IClientItem } from '../../../types/client';

export const CONTACT_FROM_OPTIONS = [
  { value: 'Mercado Libre', label: 'Mercado Libre' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'Tiktok', label: 'Tiktok' },
  { value: 'Facebook', label: 'Facebook' },
  { value: 'Airbnb', label: 'Airbnb' },
  { value: 'Whatsapp', label: 'Whatsapp' },
  { value: 'Llamada', label: 'Llamada' },
  { value: 'Oficina', label: 'Oficina' },
  { value: 'Mensajeria de texto', label: 'Mensajeria de texto' },
  { value: 'Pagina web', label: 'Pagina web' },
  { value: 'Etiqueta fisica', label: 'Etiqueta fisica' },
  { value: 'Cliente recurrente', label: 'Cliente recurrente' },
  { value: 'Cliente conocido', label: 'Cliente conocido' },
  { value: 'Referido', label: 'Referido' },
  { value: 'Enlace', label: 'Enlace' },
  { value: 'Grupos Inmobiliarios', label: 'Grupos Inmobiliarios' },
];

export type ClientFormSchemaType = z.infer<typeof ClientFormSchema>;

export const ClientFormSchema = z.object({
  id: z.number().optional(),
  updatedby: z.any().optional(),
  assignedto: z.any().optional(),
  changes: z.any().optional(),
  createdby: z.any().optional(),
  name: z.string({ required_error: 'Este campo es requerido' }).min(3, 'Minimo 3 caracteres'),
  referrer: z.string().optional().nullable(),
  adviserId: z.string().optional().nullable(),
  adviserName: z.string().optional().nullable(),
  usageProperty: z.string().optional().nullable(),
  requirementStatus: z.string().optional().nullable(),
  contactFrom: z.string(),
  allowyounger: z.string().optional(),
  allowpets: z.string().optional(),
  requestracking: z.string().optional().nullable(),
  budgetfrom: z.any().optional().nullable(),
  budgetto: z.any().optional().nullable(),
  isinwaitinglist: z.boolean().optional().nullable(),
  status: z.string().default('Activo'),
  propertytype: z.string().optional(),
  propertyOfInterest: z.string().optional().nullable(),
  propertyLocation: z.string().optional().nullable(),
  typeOfCapture: z.string().optional().nullable(),
  aspiredPrice: z.string().optional().nullable(),
  typeOfBusiness: z.string().optional().nullable(),
  zonesOfInterest: z.array(z.string()).optional().nullable(),
  essentialFeatures: z.array(z.string()).optional().nullable(),
  amountOfPeople: z.number().optional().nullable(),
  amountOfPets: z.any().optional().nullable(),
  amountOfYounger: z.any().optional().nullable(),
  amountOfNights: z.number().optional().nullable(),
  arrivingDate: z.string().optional().nullable(),
  checkoutDate: z.string().optional().nullable(),
  interestDate: z.string().optional().nullable(),
  appointmentDate: z.string().optional().nullable(),
  inspectionDate: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  reasonOfStay: z.string().optional().nullable(),
  usageOfProperty: z.string().optional().nullable(),
  typeOfPerson: z.string().optional().nullable(),
  personEntry: z.string().optional().nullable(),
  personHeadquarters: z.string().optional().nullable(),
  personLocation: z.string().optional().nullable(),
  specificRequirement: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  remodeledAreas: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  m2: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
  userFullName: z.string().optional().nullable(),
  userId: z.string().optional().nullable(),
  serviceName: z.string().optional().nullable(),
  serviceId: z.string().optional().nullable(),
  subServiceName: z.string().optional().nullable(),
  subServiceId: z.string().optional().nullable(),
  username: z.string().optional().nullable(),
  propertyDistribution: z.string().optional().nullable(),
  phone: z.string().min(9),
  isPotentialInvestor: z.boolean().optional().nullable(),
});

type Props = {
  currentClient?: IClientItem;
  isEdit?: boolean;
};

export function CreateUpdateClientForm({ currentClient, isEdit = false }: Props) {
  const defaultValues: ClientFormSchemaType = {
    name: '',
    phone: '',
    isPotentialInvestor: false,
    referrer: '',
    adviserId: '',
    adviserName: '',
    usageProperty: '',
    requirementStatus: '',
    contactFrom: '',
    allowyounger: 'N/A',
    allowpets: 'N/A',
    requestracking: '',
    budgetfrom: '',
    budgetto: '',
    isinwaitinglist: false,
    status: 'active',
    propertytype: '',
    propertyOfInterest: '',
    propertyLocation: '',
    typeOfCapture: '',
    aspiredPrice: '',
    typeOfBusiness: '',
    zonesOfInterest: [],
    essentialFeatures: [],
    amountOfPeople: 0,
    amountOfPets: 0,
    amountOfYounger: 0,
    amountOfNights: 0,
    arrivingDate: null,
    checkoutDate: null,
    interestDate: null,
    appointmentDate: null,
    inspectionDate: null,
    note: '',
    reasonOfStay: '',
    usageOfProperty: '',
    typeOfPerson: 'Natural',
    personEntry: '',
    personHeadquarters: '',
    personLocation: '',
    specificRequirement: '',
    location: '',
    remodeledAreas: '',
    company: '',
    m2: '0',
    occupation: '',
    userFullName: null,
    userId: null,
    serviceName: null,
    serviceId: null,
    subServiceName: null,
    subServiceId: null,
    username: null,
    updatedby: { id: undefined, username: '', name: '', email: '' },
    createdby: { id: undefined, username: '', name: '', email: '' },
    assignedto: { id: undefined, username: '', name: '', email: '' },
    propertyDistribution: null,
  };
  const router = useRouter();
  const { id } = useParams();
  const { user } = useAuthContext();

  const shortUser = {
    id: user?.id,
    username: user?.username,
    name: user?.firstname + ' ' + user?.lastname,
    email: user?.email,
  };

  const methods = useForm<ClientFormSchemaType>({
    mode: 'all',
    resolver: zodResolver(ClientFormSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    watch,
    control,
    formState: { isSubmitting },
  } = methods;

  const {
    fields: zones,
    append: appendZone,
    remove: removeZone,
  } = useFieldArray({
    control,
    name: 'zonesOfInterest',
  });

  const {
    fields: features,
    append: appendFeature,
    remove: removeFeature,
  } = useFieldArray({
    control,
    name: 'essentialFeatures',
  });

  const watchedIsInWaitingList = watch('isinwaitinglist');

  console.log('watchedIsInWaitingList', watchedIsInWaitingList);

  const watchedContactFrom = watch('contactFrom');
  const watchedTypeOfPerson = watch('typeOfPerson');
  const watchedPersonHeadquarters = watch('personHeadquarters');
  const watchedAllowPets = watch('allowpets');
  const watchedAllowYounger = watch('allowyounger');

  const { refresh } = useGetClients();
  const { refresh: refreshCurrent } = useGetClient(id as any);
  const { services } = useGetServices();
  const { users } = useGetUsers();
  const { categories } = useGetCategories();

  const onSubmit = handleSubmit(async (values) => {
    console.log('values', values);
    const data = {
      ...values,
      budgetfrom: typeof values.budgetfrom === 'string' ? parseCurrency(values.budgetfrom) : values.budgetfrom,
      budgetto: typeof values.budgetto === 'string' ? parseCurrency(values.budgetto) : values.budgetto,
      amountOfYounger:
        typeof values.amountOfYounger === 'string'
          ? Number(values.amountOfYounger)
          : values.amountOfYounger,
      amountOfPets:
        typeof values.amountOfPets === 'string' ? Number(values.amountOfPets) : values.amountOfPets,
      // adviser_name: users.find((user: any) => user.id === values.adviser_id)?.fullName,
    };

    const promise = await (async () => {
      let response: AxiosResponse<any>;
      if (currentClient?.id) {
        const changes = getChangedFields(data, currentClient);

        if (Object.keys(changes).length === 0) {
          console.log('No changes made.');
          return 'No se detectaron cambios en el registro.';
        }
        response = await updateClient({ ...data, updatedby: shortUser, changes }, currentClient.id);
      } else {
        response = await createClient({ ...data, createdby: shortUser });
      }

      if (response.status === 200 || response.status === 201) {
          refresh();
        if (currentClient?.id) {
          refreshCurrent();
        }
        return response.data?.message;
      } else {
        throw new Error(response.data?.message);
      }
    })();

    toast.promise(promise, {
      loading: 'Cargando...',
      success: (message: string) => message || 'Registro actualizado!',
      error: (error) => error || 'Error al actualizar el registro!',
    });

    try {
      await promise;
      reset();
      router.push('/dashboard/clients');
    } catch (error) {
      console.error(error);
    }
  });

  useEffect(() => {
    if (currentClient) {
      reset(currentClient);
    } else {
      reset(defaultValues);
    }
  }, [currentClient, reset]);

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      {/* --- Sección: Información básica --- */}
      <Section title="Información básica">
        <Box
          sx={{
            rowGap: 3,
            columnGap: 2,
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(1, 1fr)',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            },
          }}
        >
          <Field.Text disabled={!isEdit} size="small" name="name" label="Nombre" />
          <Field.Phone disabled={!isEdit} size="small" name="phone" label="Teléfono" />
          {/*<Field.Text size="small" name="email" label="Correo electrónico" />*/}
          <Field.Select
            disabled={!isEdit}
            size="small"
            name="contactFrom"
            label="¿Cómo nos contactó?"
          >
            {CONTACT_FROM_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Field.Select>
          {watchedContactFrom === 'Referido' && (
            <Field.Text disabled={!isEdit} name="referrer" label="Nombre del referido" />
          )}
          {watchedContactFrom === 'Enlace' && (
            <Field.Text disabled={!isEdit} name="referrer" label="Detalle de enlace (Opcional)" />
          )}
          {(watchedContactFrom === 'Cliente recurrente' || watchedContactFrom === 'Cliente conocido') && (
            <Field.Text disabled={!isEdit} name="referrer" label={`Detalle de ${watchedContactFrom.toLowerCase()} (Opcional)`} />
          )}
          {watchedContactFrom === 'Grupos Inmobiliarios' && (
            <Field.Text disabled={!isEdit} name="referrer" label="Detalle de grupo inmobiliario (Opcional)" />
          )}
          {
            user?.role !== 'ASESOR_INMOBILIARIO' &&
            <Field.Select
              disabled={!isEdit}
              size="small"
              sx={{ gridColumn: '1 / -1' }}
              name="assignedto"
              label="Asignar a"
              onChange={(e) => {
                const userObj = JSON.parse(e.target.value);
                methods.setValue('assignedto', userObj);
              }}
              value={
                methods.watch('assignedto')?.id ? JSON.stringify(methods.watch('assignedto')) : ''
              }
            >
              {users.map((usr) => (
                <MenuItem key={usr.id} value={JSON.stringify({ id: usr.id, name: usr.firstname + ' ' + usr.lastname, email: usr.email, username: usr.username })}>
                  {usr.firstname} {usr.lastname}
                </MenuItem>
              ))}
            </Field.Select>
          }
          <Field.Checkbox
            disabled={!isEdit}
            name="isPotentialInvestor"
            label="Es potencial inversor"
          />
          <div />
          <div />
          <Field.Checkbox
            disabled={!isEdit}
            name="isinwaitinglist"
            label="Esta en lista de espera"
          />
        </Box>
      </Section>

      {/* --- Sección: Información de servicio --- */}
      <Section title="Servicio e Interés">
        <Box
          sx={{
            rowGap: 3,
            columnGap: 2,
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' },
          }}
        >
          <Field.Select disabled={!isEdit} size="small" name="serviceName" label="Tipo de servicio">
            {services?.map((s) => (
              <MenuItem key={s.id} value={s.title}>
                {s.title}
              </MenuItem>
            ))}
          </Field.Select>

          {/*<Field.Select name="adviser_id" label="Asesor">*/}
          {/*  {advisers?.map(a => (*/}
          {/*    <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>*/}
          {/*  ))}*/}
          {/*</Field.Select>*/}

          <Field.Select
            disabled={!isEdit}
            size="small"
            name="propertytype"
            label="Tipo de inmueble"
          >
            {categories?.map((cat) => (
              <MenuItem key={cat.id} value={cat.title}>
                {cat.title}
              </MenuItem>
            ))}
          </Field.Select>

          <Field.Text
            disabled={!isEdit}
            size="small"
            name="propertyOfInterest"
            label="Propiedad de interés"
          />
          <div />
          {/*<Stack direction="row" spacing={2} flexWrap="wrap">*/}
          <DynamicList
            register={methods.register}
            title="Zonas de interés"
            items={zones}
            disabled={!isEdit}
            onAdd={() => appendZone('')}
            onRemove={removeZone}
            registerFieldPrefix="zonesOfInterest"
          />
          {/*  <Stack flex={1}>*/}
          {/*    <Typography variant="h5" mb={2}>Posibles zonas de interes</Typography>*/}

          {/*    {zones.length < 1 && (*/}
          {/*      <Stack my={2}>*/}
          {/*        <Stack p={2} sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>*/}
          {/*          <Typography color="text.secondary" align="center">*/}
          {/*            No has agregado posibles zonas de interés.*/}
          {/*          </Typography>*/}
          {/*        </Stack>*/}
          {/*      </Stack>*/}
          {/*    )}*/}

          {/*    <ul>*/}
          {/*      {zones.map((item, index) => (*/}
          {/*        <Stack key={item.id} direction="row" spacing={2} alignItems="flex-end" mb={2}>*/}
          {/*          <Field.Text*/}
          {/*            fullWidth*/}
          {/*            size="small"*/}
          {/*            variant="outlined"*/}
          {/*            {...methods.register(`zonesOfInterest.${index}`)}*/}
          {/*          />*/}
          {/*          <IconButton*/}
          {/*            size="small"*/}
          {/*            color="error"*/}
          {/*            onClick={() => removeZone(index)}*/}
          {/*          >*/}
          {/*            <Iconify icon="mdi:delete" width={24} height={24} />*/}
          {/*          </IconButton>*/}
          {/*        </Stack>*/}
          {/*      ))}*/}
          {/*      <Stack direction="row" justifyContent="center" mt={2}>*/}
          {/*        <Button*/}
          {/*          variant="outlined"*/}
          {/*          startIcon={<Iconify icon="mdi:plus" width={24} height={24} />}*/}
          {/*          onClick={() => appendZone('')}*/}
          {/*        >*/}
          {/*          Agregar nueva zona*/}
          {/*        </Button>*/}
          {/*      </Stack>*/}
          {/*    </ul>*/}

          {/*  </Stack>*/}
          {/*  <Stack flex={1}>*/}
          {/*    <Typography variant="h5" mb={2}>Caracteristicas escenciales</Typography>*/}

          {/*    {zones.length < 1 && (*/}
          {/*      <Stack my={2}>*/}
          {/*        <Stack p={2} sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>*/}
          {/*          <Typography color="text.secondary" align="center">*/}
          {/*            No has agregado caracteristicas.*/}
          {/*          </Typography>*/}
          {/*        </Stack>*/}
          {/*      </Stack>*/}
          {/*    )}*/}

          {/*    <ul>*/}
          {/*      {features.map((item, index) => (*/}
          {/*        <Stack key={item.id} direction="row" spacing={2} alignItems="flex-end" mb={2}>*/}
          {/*          <Field.Text*/}
          {/*            fullWidth*/}
          {/*            size="small"*/}
          {/*            variant="outlined"*/}
          {/*            {...methods.register(`essentialFeatures.${index}`)}*/}
          {/*          />*/}
          {/*          <IconButton*/}
          {/*            size="small"*/}
          {/*            color="error"*/}
          {/*            onClick={() => removeFeature(index)}*/}
          {/*          >*/}
          {/*            <Iconify icon="mdi:delete" width={24} height={24} />*/}
          {/*          </IconButton>*/}
          {/*        </Stack>*/}
          {/*      ))}*/}
          {/*      <Stack direction="row" justifyContent="center" mt={2}>*/}
          {/*        <Button*/}
          {/*          variant="outlined"*/}
          {/*          startIcon={<Iconify icon="mdi:plus" width={24} height={24} />}*/}
          {/*          onClick={() => appendFeature('')}*/}
          {/*        >*/}
          {/*          Agregar nueva caracteristica*/}
          {/*        </Button>*/}
          {/*      </Stack>*/}
          {/*    </ul>*/}

          {/*  </Stack>*/}
          <DynamicList
            register={methods.register}
            title="Características esenciales"
            items={features}
            disabled={!isEdit}
            onAdd={() => appendFeature('')}
            onRemove={removeFeature}
            registerFieldPrefix="essentialFeatures"
          />
          {/*</Stack>*/}
        </Box>
      </Section>

      {/* --- Sección: Presupuesto --- */}
      <Section title="Presupuesto">
        <Box
          sx={{
            rowGap: 3,
            columnGap: 2,
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' },
          }}
        >
          <Field.Currency disabled={!isEdit} size="small" name="budgetfrom" label="Desde" />
          <Field.Currency disabled={!isEdit} size="small" name="budgetto" label="Hasta" />
        </Box>
      </Section>

      {/* --- Sección: Perfil del cliente --- */}
      <Section title="Perfil del cliente">
        <Box
          sx={{
            rowGap: 3,
            columnGap: 2,
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' },
          }}
        >
          <Field.Select disabled={!isEdit} name="typeOfPerson" label="Tipo de persona">
            <MenuItem value="Natural">Natural</MenuItem>
            <MenuItem value="Juridica">Jurídica</MenuItem>
          </Field.Select>

          {watchedTypeOfPerson === 'Natural' && (
            <Field.Text disabled={!isEdit} name="occupation" label="Ocupación" />
          )}

          {watchedTypeOfPerson === 'Juridica' && (
            <>
              <Field.Text disabled={!isEdit} name="personEntry" label="Rubro" />
              <Field.Select disabled={!isEdit} name="personHeadquarters" label="Sede">
                <MenuItem value="Fisica">Física</MenuItem>
                <MenuItem value="Virtual">Virtual</MenuItem>
                <MenuItem value="Ninguna">Ninguna</MenuItem>
              </Field.Select>
              {watchedPersonHeadquarters !== 'Ninguna' && (
                <Field.Text disabled={!isEdit} name="personLocation" label="Ubicación sede" />
              )}
            </>
          )}
        </Box>
      </Section>

      {/* --- Sección: Otros --- */}
      <Section title="Otros">
        <Box
          sx={{
            rowGap: 3,
            columnGap: 2,
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' },
          }}
        >
          <Field.Select
            disabled={!isEdit}
            size="small"
            name="allowyounger"
            label="Presencia de menores de edad"
          >
            <MenuItem value="Si">Si</MenuItem>
            <MenuItem value="No">No</MenuItem>
            <MenuItem value="N/A">N/A</MenuItem>
          </Field.Select>

          {watchedAllowYounger === 'Si' && (
            <Field.Text
              disabled={!isEdit}
              type="number"
              size="small"
              name="amountOfYounger"
              label="Cantidad de menores de edad"
            />
          )}

          <Field.Select
            disabled={!isEdit}
            size="small"
            name="allowpets"
            label="Presencia de mascotas"
          >
            <MenuItem value="Si">Si</MenuItem>
            <MenuItem value="No">No</MenuItem>
            <MenuItem value="N/A">N/A</MenuItem>
          </Field.Select>

          {watchedAllowPets === 'Si' && (
            <Field.Text
              disabled={!isEdit}
              type="number"
              size="small"
              name="amountOfPets"
              label="Cantidad de mascotas"
            />
          )}
          <Field.Text
            disabled={!isEdit}
            size="small"
            name="specificRequirement"
            label="Detalle de la solicitud"
          />
          <Field.Text
            disabled={!isEdit}
            size="small"
            name="requestracking"
            label="Seguimiento de la solicitud"
          />
          <Field.Select disabled={!isEdit} size="small" name="status" label="Estatus">
            <MenuItem value="active">Activo</MenuItem>
            <MenuItem value="inactive">Inactivo</MenuItem>
            <MenuItem value="concreted">Concretado</MenuItem>
          </Field.Select>
        </Box>
      </Section>

      {/*  Button to submit*/}
      <Stack direction="row" justifyContent="flex-end" gap={4} mt={2} mb={5}>
        <Button onClick={() => router.back()}>
          <Iconify icon="eva:arrow-ios-back-fill" />
          Volver
        </Button>
        {isEdit && (
          <Button
            variant="contained"
            type="submit"
            size="large"
            color="primary"
            disabled={isSubmitting}
            loading={isSubmitting}
            startIcon={isSubmitting ? <Iconify icon="eva:loading-spinner-fill" /> : null}
          >
            {currentClient ? 'Actualizar' : 'Crear'} cliente
          </Button>
        )}
      </Stack>
    </Form>
  );
}

type DynamicListProps = {
  title: string;
  items: { id: string; value?: string }[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  registerFieldPrefix: string;
  disabled?: boolean;
  register: UseFormRegister<any>;
};

const DynamicList: React.FC<DynamicListProps> = ({
  title,
  items,
  onAdd,
  onRemove,
  registerFieldPrefix,
  register,
  disabled = false,
}) => (
  <Stack flex={1}>
    <Typography variant="subtitle1" mb={2}>
      {title}
    </Typography>
    {items.length === 0 ? (
      <Stack p={2} bgcolor="background.paper" borderRadius={2} mb={2}>
        <Typography color="text.secondary" align="center">
          No hay elementos.
        </Typography>
      </Stack>
    ) : (
      items.map((item, index) => (
        <Stack key={item.id} direction="row" spacing={2} alignItems="flex-end" mb={2}>
          <Field.Text
            disabled={disabled}
            fullWidth
            size="small"
            {...register(`${registerFieldPrefix}.${index}`)}
          />
          <IconButton disabled={disabled} color="error" onClick={() => onRemove(index)}>
            <Iconify icon="mdi:delete" />
          </IconButton>
        </Stack>
      ))
    )}
    <Button
      disabled={disabled}
      variant="outlined"
      startIcon={<Iconify icon="mdi:plus" />}
      onClick={onAdd}
    >
      Agregar
    </Button>
  </Stack>
);

const Grid = ({ columns, children }: { columns: any; children: React.ReactNode }) => (
  <Box display="grid" gridTemplateColumns={columns} gap={2} mb={3}>
    {children}
  </Box>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Box mb={5}>
    <Typography variant="h6" gutterBottom>
      {title}
    </Typography>
    <Divider sx={{ mb: 3 }} />
    {children}
  </Box>
);
