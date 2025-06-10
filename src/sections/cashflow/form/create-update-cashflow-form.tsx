import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { useAuthContext } from '../../../auth/hooks';
import { Iconify } from '../../../components/iconify';
import { Form, Field } from '../../../components/hook-form';
import { useParams, useRouter } from '../../../routes/hooks';
import { useGetServices, useGetSubServices } from '../../../actions/service';
import {
  useGetCashFlowPeople,
  useGetCashFlowEntities,
  useGetCashFlowWaysToPay,
  useGetCashFlowProperties,
  useGetCashFlowCurrencies,
  useGetCashFlowTransactionTypes,
  createCashFlow,
  updateCashFlow,
} from '../../../actions/cashflow';

import type { ICashFlowItem } from '../../../types/cashflow';
import { parseCurrency } from 'src/utils/format-number';
import utc from 'dayjs/plugin/utc';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { getChangedFields } from 'src/utils/form';
import { AxiosResponse } from 'axios';

export const MONTHS = [
  'ENERO',
  'FEBRERO',
  'MARZO',
  'ABRIL',
  'MAYO',
  'JUNIO',
  'JULIO',
  'AGOSTO',
  'SEPTIEMBRE',
  'OCTUBRE',
  'NOVIEMBRE',
  'DICIEMBRE',
];

const emptyPayment = {
        id: 0,
        amount: 0,
        canon: false,
        contract: false,
        currency: 0,
        entity: 0,
        guarantee: false,
        incomeByThird: 0,
        observation: '',
        pendingToCollect: 0,
        reason: '',
        service: '',
        serviceType: '',
        taxPayer: '',
        totalDue: 0,
        transactionType: 0,
        wayToPay: 0,
      };

export type CashFlowSchemaType = z.infer<typeof CashFlowSchema>;

export const CashFlowSchema = z.object({
  id: z.number().optional(),
  property: z.number().nullable().optional(),
  person: z.number().nullable().optional(),
  owner: z.number().nullable().optional(),
  user: z.number().optional(),
  client: z.number().nullable().optional(),
  date: z.any(),
  month: z.string(),
  location: z.string().optional(),
  attachments: z.any().optional(),
  temporalTransactionId: z.any().optional(),
  isTemporalTransaction: z.any().optional(),
  payments: z.array(
    z.object({
      id: z.number().optional(),
      canon: z.boolean().optional(),
      contract: z.boolean().optional(),
      guarantee: z.boolean().optional(),
      serviceType: z.string().optional(),
      reason: z.string(),
      service: z.string(),
      taxPayer: z.string().optional(),
      amount: z.any().optional(),
      currency: z.number().optional(),
      wayToPay: z.number().optional(),
      entity: z.number().optional(),
      transactionType: z.number().optional(),
      totalDue: z.any().optional(),
      incomeByThird: z.any().optional(),
      pendingToCollect: z.any().optional(),
      observation: z.string().optional(),
    })
  ),
});

type Props = {
  currentCashFlow?: ICashFlowItem;
  isEdit?: boolean;
};

export function CreateUpdateCashFlowForm({ currentCashFlow, isEdit = false }: Props) {
  const { user } = useAuthContext();
  const defaultValues: CashFlowSchemaType = {
    id: undefined,
    property: null,
    person: null,
    owner: null,
    client: null,
    user: user.id,
    date: new Date(),
    month: '',
    location: '',
    attachments: [],
    temporalTransactionId: null,
    isTemporalTransaction: false,
    payments: [
      {
        ...emptyPayment,
      },
    ],
  };
  const router = useRouter();
  const { id } = useParams();
  const { cashflowPeople } = useGetCashFlowPeople();
  const { cashflowProperties } = useGetCashFlowProperties();
  const { transactionTypes } = useGetCashFlowTransactionTypes();
  const { waysToPay } = useGetCashFlowWaysToPay();
  const { currencies } = useGetCashFlowCurrencies();
  const { entities } = useGetCashFlowEntities();
  const { services } = useGetServices();
  const { subServices } = useGetSubServices()

  const shortUser = {
    id: user?.id,
    username: user?.username,
    name: user?.firstname + ' ' + user?.lastname,
    email: user?.email,
  };

  const methods = useForm<CashFlowSchemaType>({
    mode: 'all',
    resolver: zodResolver(CashFlowSchema),
    defaultValues,
    // values: currentCashFlow ? { ...currentCashFlow } : defaultValues,
  });

  const {
    reset,
    setValue,
    handleSubmit,
    watch,
    control,
    formState: { isSubmitting },
  } = methods;

  const {
    fields: payments,
    append: appendPayment,
    remove: removePayment,
  } = useFieldArray({
    control,
    name: 'payments',
  });

  const onSubmit = handleSubmit(async (values) => {
   const data = {
      ...values,
      payments: values.payments.map((payment) => ({
        ...payment,
        amount: parseCurrency(payment.amount),
        totalDue: parseCurrency(payment.totalDue),
        pendingToCollect: parseCurrency(payment.pendingToCollect),
        incomeByThird: parseCurrency(payment.incomeByThird),
      })),
    };

    const promise = await (async () => {
      let response: AxiosResponse<any>;
      if (currentCashFlow?.id) {
        const changes = getChangedFields(data, currentCashFlow);
    
        if (Object.keys(changes).length === 0) {
          console.log('No changes made.');
          return 'No se detectaron cambios en el registro.';
        }
        response = await updateCashFlow(data, shortUser, currentCashFlow.id);
      } else {
        response = await createCashFlow(data, shortUser);
      }
    
      if (response.status === 200 || response.status === 201) {
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
      // refresh();
      // refreshCurrent();
      router.push('/dashboard/cashFlow');
    } catch (error) {
      console.error(error);
    }
  });

  function showWayToPay(i: number) {
    const transactionType = watch(`payments.${i}.transactionType`);
    return transactionType !== 2 &&  transactionType !== 5;
  }

  function showEntity(i: number) {
    const transactionType = watch(`payments.${i}.transactionType`);
    return transactionType === 1 || transactionType === 2 || transactionType === 3;
  }

  function showAmount(i: number) {
    const transactionType = watch(`payments.${i}.transactionType`);
    return transactionType === 1 || transactionType === 3 || transactionType === 4;
  }

  function obtainPrefixByCurrency(i: number) {
    const currencyId = watch(`payments.${i}.currency`);
    const currency = currencies.find((c) => c.id === currencyId);
    return currency ? currency.symbol : '';
  }

  function getTotalDueLabel(i: number) {
    const transactionType = watch(`payments.${i}.transactionType`);
    return transactionType === 5 ? 'Monto' : 'Por pagar';
  }

  function showTotalDue(i: number) {
    const transactionType = watch(`payments.${i}.transactionType`);
    return transactionType === 1 || transactionType === 5 || transactionType === 4;
  }

  function showPendingToCollect(i: number) {
    const transactionType = watch(`payments.${i}.transactionType`);
    return transactionType === 1 || transactionType === 2 || transactionType === 4 ;
  }

  function showTaxPayerOptions(i: number) {
    const service = watch(`payments.${i}.service`);
    return service === 'Inmobiliario';
  }

  function showCanonGuaranteeContract(i: number) {
    const service = watch(`payments.${i}.service`);
    return service === 'Contable';
  }

  function showSubService(i: number) {
    const service = watch(`payments.${i}.service`);
    const fullService = services.find(s => s.title === service);
    if (!fullService) {
      return subServices
    }
    return subServices.filter(sub => sub.serviceId === fullService.id);
  }


    const watchedAttachments = watch('attachments')
  
    const handleRemoveFile = useCallback(
      (inputFile: File | string) => {
        const filtered = watchedAttachments && watchedAttachments?.filter((file: any) => file !== inputFile);
        setValue('attachments', filtered);
      },
      [setValue, watchedAttachments]
    );
  
    const handleRemoveAllFiles = useCallback(() => {
      setValue('attachments', [], { shouldValidate: true });
    }, [setValue]);

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
          <Field.DatePicker disableFuture disabled={!isEdit} size="small" name="date" label="Fecha" />

          <Field.Autocomplete
            name="person"
            label="Persona"
            size="small"
            options={cashflowPeople}
            getOptionLabel={(option) => option.name || ''}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            onChange={(_, newValue) => {
              // Set just the ID in the form value if newValue exists
              methods.setValue('person', newValue ? newValue.id : null);
            }}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                {option.name}
              </li>
            )}
            // Convert the ID back to the full object for display purposes
            value={cashflowPeople.find((person) => person.id === methods.watch('person')) || null}
          />
          <Field.Autocomplete
            name="property"
            label="Inmueble (opcional)"
            size="small"
            options={cashflowProperties}
            getOptionLabel={(option) => option.name || ''}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            onChange={(_, newValue) => {
              // Set just the ID in the form value if newValue exists
              methods.setValue('property', newValue ? newValue.id : null);
            }}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                {option.name}
              </li>
            )}
            // Convert the ID back to the full object for display purposes
            value={cashflowProperties.find((property) => property.id === methods.watch('property')) || null}
          />
          <Field.Select disabled={!isEdit} size="small" name="month" label="Mes">
            {MONTHS.map((month) => (
              <MenuItem key={month} value={month}>
                {month}
              </MenuItem>
            ))}
          </Field.Select>

          <Field.Text disabled={!isEdit} size="small" name="location" label="Ubicacion" />
        </Box>
      </Section>

      {/* --- Sección: Información de servicio --- */}
      <Section title="Pagos">
        {payments.map((_, index) => (
          <Box
            key={index + 1}
            sx={{ mb: 4, p: 3, border: 1, borderColor: 'grey.300', borderRadius: 2 }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                Pago #{index + 1}
              </Typography>
              {payments.length > 1 && (
                <IconButton
                  onClick={() => removePayment(index)}
                  color="error"
                  size="small"
                  disabled={!isEdit}
                >
                  <Iconify icon="eva:trash-2-fill" />
                </IconButton>
              )}
            </Stack>

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

              <Field.Select disabled={!isEdit} size="small" name={`payments.${index}.transactionType`} label="Tipo de Transacción">
                {transactionTypes.map((transactionType) => (
                  <MenuItem key={transactionType.id} value={transactionType.id}>
                    {transactionType.name}
                  </MenuItem>
                ))}
              </Field.Select>

              {showWayToPay(index) && (
                <Field.Select disabled={!isEdit} size="small" name={`payments.${index}.wayToPay`} label="Forma de pago">
                  {waysToPay.map((wayToPay) => (
                    <MenuItem key={wayToPay.id} value={wayToPay.id}>
                      {wayToPay.name}
                    </MenuItem>
                  ))}
                </Field.Select>
              )}

              <Field.Select disabled={!isEdit} size="small" name={`payments.${index}.currency`} label="Moneda">
                {currencies.map((currency) => (
                  <MenuItem key={currency.id} value={currency.id}>
                    {currency.name}
                  </MenuItem>
                ))}
              </Field.Select>

              {
                showEntity(index) && (
                  <Field.Select disabled={!isEdit} size="small" name={`payments.${index}.entity`} label="Entidad">
                    {entities.map((entity) => (
                      <MenuItem key={entity.id} value={entity.id}>
                        {entity.name}
                      </MenuItem>
                    ))}
                  </Field.Select>
                )
              }


              {
                showAmount(index) && (
                  <Field.Currency
                    disabled={!isEdit}
                    size="small"
                    prefix={obtainPrefixByCurrency(index) + ' '}
                    name={`payments.${index}.amount`}
                    label="Monto"
                  />
                )
              }

              {
                showTotalDue(index) && (
                  <Field.Currency
                    disabled={!isEdit}
                    size="small"
                    prefix={obtainPrefixByCurrency(index) + ' '}
                    name={`payments.${index}.totalDue`}
                    label={getTotalDueLabel(index)}
                  />
                )
              }

              {
                showPendingToCollect(index) && (
                  <Field.Currency
                    disabled={!isEdit}
                    size="small"
                    prefix={obtainPrefixByCurrency(index) + ' '}
                    name={`payments.${index}.pendingToCollect`}
                    label="Pendiente por Cobrar"
                  />
                )
              }


              <Field.Select disabled={!isEdit} size="small" name={`payments.${index}.service`} label="Servicio">
                {services.map((service) => (
                  <MenuItem key={service.id} value={service.title}>
                    {service.title}
                  </MenuItem>
                ))}
              </Field.Select>

              <Field.Select disabled={!isEdit} size="small" name={`payments.${index}.serviceType`} label="Tipo de servicio">
                <MenuItem value="">
                  Ninguno
                </MenuItem>
                {showSubService(index).map((subService) => (
                  <MenuItem key={subService.id} value={subService.service}>
                    {subService.service}
                  </MenuItem>
                ))}
              </Field.Select>

              {/*{*/}
              {/*  showCanonGuaranteeContract(index) && (*/}
                  <Box sx={{ mt: 2 }}>
                    <Field.Switch disabled={!isEdit} name={`payments.${index}.canon`} label="Canon" />
                    <Field.Switch
                      disabled={!isEdit}
                      name={`payments.${index}.contract`}
                      label="Contrato"
                    />
                    <Field.Switch
                      disabled={!isEdit}
                      name={`payments.${index}.guarantee`}
                      label="Garantía"
                    />
                  </Box>
                {/*)*/}
              {/*}*/}

              {/*{*/}
              {/*  showTaxPayerOptions(index) && (*/}
                  <Field.Select
                    disabled={!isEdit}
                    size="small"
                    name={`payments.${index}.taxPayer`}
                    label="Contribuyente"
                  >
                    <MenuItem value="Ordinario Natural">Ordinario Natural</MenuItem>
                    <MenuItem value="Ordinario Juridico">Ordinario Juridico</MenuItem>
                    <MenuItem value="Especial">Especial</MenuItem>
                  </Field.Select>
                {/*)*/}
              {/*}*/}


              {/*<Field.Currency*/}
              {/*  disabled={!isEdit}*/}
              {/*  size="small"*/}
              {/*  name={`payments.${index}.incomeByThird`}*/}
              {/*  label="Ingreso por Terceros"*/}
              {/*/>*/}
            </Box>

            <Box sx={{ mt: 2 }}>
              <Field.Text
                disabled={!isEdit}
                size="small"
                name={`payments.${index}.reason`}
                label="Concepto"
                multiline
                rows={3}
                fullWidth
              />
              {/*<Field.Text*/}
              {/*  disabled={!isEdit}*/}
              {/*  size="small"*/}
              {/*  name={`payments.${index}.observation`}*/}
              {/*  label="Observaciones"*/}
              {/*  multiline*/}
              {/*  rows={3}*/}
              {/*  fullWidth*/}
              {/*/>*/}
            </Box>
          </Box>
        ))}
      </Section>
      
            <Box display="flex" justifyContent="center" my={3}>
        <Button onClick={() => appendPayment({ ...emptyPayment })} variant="contained" >+ Agregar Pago adicional</Button>
      </Box>

      <Box sx={{ gridColumn: '1 / -1' }} >
         <Typography variant="h5" mb={2}>Cargar Evidencias</Typography>
         <Field.Upload
           multiple
           thumbnail
           accept={{
            'image/*': [],
            'application/pdf': [],
            'application/vnd.ms-excel': [],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [],
            'application/msword': [],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
            'video/*': [],
           }}
           name="attachments"
           maxSize={1073741824}
           onRemove={handleRemoveFile}
           onRemoveAll={handleRemoveAllFiles}
         />
          </Box>



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
            {currentCashFlow ? 'Actualizar' : 'Crear'} Transaccion
          </Button>
        )}
      </Stack>
    </Form>
  );
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Box mb={5}>
    <Typography variant="h6" gutterBottom>
      {title}
    </Typography>
    <Divider sx={{ mb: 3 }} />
    {children}
  </Box>
);
