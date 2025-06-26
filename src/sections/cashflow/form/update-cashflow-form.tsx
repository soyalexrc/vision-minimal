import type { AxiosResponse } from 'axios';

import { toast } from 'sonner';
import { varAlpha } from 'minimal-shared/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { Dialog, DialogTitle, DialogActions, DialogContent } from '@mui/material';

import { getChangedFields } from 'src/utils/form';
import { parseCurrency } from 'src/utils/format-number';

import { Label } from '../../../components/label';
import { useAuthContext } from '../../../auth/hooks';
import { Iconify } from '../../../components/iconify';
import { Form, Field } from '../../../components/hook-form';
import { fromDateString } from '../../../utils/format-time';
import { useParams, useRouter } from '../../../routes/hooks';
import { useGetProperties } from '../../../actions/property';
import { useGetServices, useGetSubServices } from '../../../actions/service';
import {
  CashFlowSchema,
  ExternalPersonSchema, ExternalPropertySchema
} from './create-cashflow-form';
import {
  updateCashFlow,
  useGetCashFlow,
  useGetCashFlowPeople,
  createExternalPerson,
  useGetCashFlowEntities,
  createExternalProperty,
  useGetCashFlowWaysToPay,
  useGetCashFlowProperties,
  useGetCashFlowCurrencies, useGetCashFlowTransactionTypes,
} from '../../../actions/cashflow';

import type { IPropertyCashFlow } from '../../../types/cashflow';
import type { GetOneCashFlowData} from '../../../actions/cashflow';
import type { CashFlowSchemaType ,
  ExternalPersonSchemaType,
  ExternalPropertySchemaType} from './create-cashflow-form';


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

type Props = {
  currentCashFlow: GetOneCashFlowData;
};

export function UpdateCashFlowForm({ currentCashFlow }: Props) {
  const { user } = useAuthContext();
  const defaultValues: CashFlowSchemaType = {
    id: undefined,
    property: 0,
    person: 0,
    owner: 0,
    client: 0,
    user: user.id,
    date: new Date(),
    month: '',
    location: '',
    attachments: [],
    type: 'regular',
    temporalTransactionId: 0,
    isTemporalTransaction: false,
    payments: [],
  };
  const router = useRouter();
  const { id } = useParams();
  const {refresh} = useGetCashFlow(id as any)
  const { cashflowPeople, refetch: refetchPeople } = useGetCashFlowPeople();
  const { cashflowProperties, refetch: refetchProperties } = useGetCashFlowProperties();
  const { transactionTypes } = useGetCashFlowTransactionTypes();
  const { waysToPay } = useGetCashFlowWaysToPay();
  const { currencies } = useGetCashFlowCurrencies();
  const { entities } = useGetCashFlowEntities();
  const { services } = useGetServices();
  const { subServices } = useGetSubServices();

  const [openPersonDialog, setOpenPersonDialog] = useState(false);
  const [openPropertyDialog, setOpenPropertyDialog] = useState(false);

  const shortUser = useMemo(() => ({
    id: user?.id,
    username: user?.username,
    name: user?.firstname + ' ' + user?.lastname,
    email: user?.email,
  }), [user?.id, user?.username, user?.firstname, user?.lastname, user?.email]);

  const formValues = useMemo(() => ({
      id: currentCashFlow.cashflow.id!,
      property: currentCashFlow.cashflow.property || 0,
      person: currentCashFlow.cashflow.person || 0,
      owner: currentCashFlow.cashflow.owner || 0,
      user: currentCashFlow.cashflow.user || shortUser.id,
      client: currentCashFlow.cashflow.client || 0,
      date: currentCashFlow.cashflow.date ? fromDateString(currentCashFlow.cashflow.date as string) : new Date(),
      month: currentCashFlow.cashflow.month || '',
      location: currentCashFlow.cashflow.location || '',
      attachments: currentCashFlow.cashflow.attachments || [],
      type: currentCashFlow.cashflow.type || 'regular',
      temporalTransactionId: currentCashFlow.cashflow.temporalTransactionId || 0,
      isTemporalTransaction: currentCashFlow.cashflow.isTemporalTransaction || false,
    }), [currentCashFlow, shortUser])

  const methods = useForm<CashFlowSchemaType>({
    mode: 'all',
    resolver: zodResolver(CashFlowSchema),
    defaultValues,
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

  console.log(formValues)

  useEffect(() => {
    if (currentCashFlow) {
      methods.reset(formValues);
      currentCashFlow.payments?.forEach((payment) => {
          appendPayment({
            id: payment.id!,
            canon: payment.canon || false,
            contract: payment.contract || false,
            guarantee: payment.guarantee || false,
            serviceType: payment.serviceType || '',
            reason: payment.reason || '',
            service: payment.service || '',
            taxPayer: payment.taxPayer || '',
            amount: payment.amount || 0,
            currency: payment.currency || 0,
            wayToPay: payment.wayToPay || 0,
            entity: payment.entity || 0,
            transactionType: payment.transactionType || 0,
            totalDue: payment.totalDue || 0,
            incomeByThird: payment.incomeByThird || 0,
            pendingToCollect: payment.pendingToCollect || 0,
            observation: payment.observation || '',
          });
        });
    }
  }, [])



  const onSubmit = handleSubmit(async (values) => {
    if (values.person === null || values.person === 0) {
      toast.error('Debe seleccionar una persona');
      return;
    }

    if (values.property === null || values.property === 0) {
      toast.error('Debe seleccionar un inmueble');
      return;
    }

    if (values.location === null || values.location?.trim() === '') {
      toast.error('Debe seleccionar una ubicación');
      return;
    }

    if (values.payments.some((payment: any) =>
      payment.wayToPay === null ||
      payment.transactionType === null ||
      payment.currency === null
    )) {
      toast.error('Todos los pagos deben tener forma de pago, categoría y moneda');
      return;
    }
    const data = {
      ...values,
      payments: values.payments.map((payment: any) => ({
        ...payment,
        amount: parseCurrency(typeof payment.amount === 'string' ? payment.amount : String(payment.amount)),
        entity: payment.entity === 0 ? null : (payment.entity || null),
        totalDue: parseCurrency(typeof payment.totalDue === 'string' ? payment.totalDue : String(payment.totalDue)),
        pendingToCollect: parseCurrency(typeof payment.pendingToCollect === 'string' ? payment.pendingToCollect : String(payment.pendingToCollect)),
        incomeByThird: parseCurrency(typeof payment.incomeByThird === 'string' ? payment.incomeByThird : String(payment.incomeByThird)),
      })),
    };

    const promise = await (async () => {
      const changes = getChangedFields(data, currentCashFlow);

      if (Object.keys(changes).length === 0) {
        console.log('No changes made.');
        return 'No se detectaron cambios en el registro.';
      }

      const response: AxiosResponse<any> = await updateCashFlow(data, shortUser, currentCashFlow.cashflow.id);

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
      refresh();
      router.push('/dashboard/cashFlow');
    } catch (error) {
      console.error(error);
    }
  });

  function showWayToPay(i: number) {
    const transactionType = watch(`payments.${i}.transactionType`);
    // return transactionType !== 2 && transactionType !== 5;
    return true;
  }

  function showEntity(i: number) {
    const transactionType = watch(`payments.${i}.transactionType`);
    return transactionType === 1 || transactionType === 3 || transactionType === 6;
  }

  function showAmount(i: number) {
    const transactionType = watch(`payments.${i}.transactionType`);
    return transactionType === 1 || transactionType === 3 || transactionType === 4 || transactionType === 6;
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
    return transactionType === 5
  }

  function showPendingToCollect(i: number) {
    const transactionType = watch(`payments.${i}.transactionType`);
    return transactionType === 2
  }

  function showTaxPayerOptions(i: number) {
    const service = watch(`payments.${i}.service`);
    return service === 'Contable';
  }

  function showCanonGuaranteeContract(i: number) {
    const service = watch(`payments.${i}.service`);
    return service === 'Administración de contratos';
  }

  function showServices(i: number) {
    const transactionType = watch(`payments.${i}.transactionType`);
    return transactionType !== 6;
  }

  function showSubService(i: number) {
    const service = watch(`payments.${i}.service`);
    const fullService = services.find((s) => s.title === service);
    if (!fullService) {
      return subServices;
    }
    return subServices.filter((sub) => sub.serviceId === fullService.id);
  }

  const watchedAttachments = watch('attachments');

  const handleRemoveFile = useCallback(
    (inputFile: File | string) => {
      const filtered =
        watchedAttachments && watchedAttachments?.filter((file: any) => file !== inputFile);
      setValue('attachments', filtered);
    },
    [setValue, watchedAttachments]
  );

  const handleRemoveAllFiles = useCallback(() => {
    setValue('attachments', [], { shouldValidate: true });
  }, [setValue]);

  const handleDateChange = useCallback((date: Date | null) => {
    if (date) {
      const adjustedDate = new Date(date);
      adjustedDate.setHours(12, 0, 0, 0);
      setValue('date', adjustedDate);
    } else {
      setValue('date', null);
    }
  }, [setValue]);

  const handlePersonChange = useCallback((_: any, newValue: any) => {
    setValue('person', newValue ? newValue.id : null);
  }, [setValue]);

  return (
    <>
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
            {
              user.role === 'ADMINISTRADOR' || user.role === 'TI' &&
              <Field.DatePicker
                name="date"
                // onChange={handleDateChange}
                size="small"
                label="Fecha"
              />
            }

            <Stack direction="row" alignItems="center" gap={1}>
              <Field.Autocomplete
                sx={{ flexGrow: 1 }}
                name="person"
                label="Persona"
                size="small"
                options={cashflowPeople}
                getOptionLabel={(option) => option.name || ''}
                isOptionEqualToValue={(option, value) => option.id === value?.id}
                onChange={handlePersonChange}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    {option.name}
                  </li>
                )}
                // Convert the ID back to the full object for display purposes
                value={
                  cashflowPeople.find((person) => person.id === methods.watch('person')) || null
                }
              />
              <IconButton onClick={() => setOpenPersonDialog(true)}  size="small">
                <Iconify icon="solar:cart-plus-bold" />
              </IconButton>
            </Stack>
            <Stack direction="row" alignItems="center" gap={1}>
              <Field.Autocomplete
                name="property"
                label="Inmueble"
                size="small"
                sx={{ flexGrow: 1 }}
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
                value={
                  cashflowProperties.find(
                    (property) => property.id === methods.watch('property')
                  ) || null
                }
              />
              <IconButton
                onClick={() => setOpenPropertyDialog(true)}

                size="small"
              >
                <Iconify icon="solar:user-plus-bold" />
              </IconButton>
            </Stack>

            {/*<Field.Select  size="small" name="month" label="Mes">*/}
            {/*  {MONTHS.map((month) => (*/}
            {/*    <MenuItem key={month} value={month}>*/}
            {/*      {month}*/}
            {/*    </MenuItem>*/}
            {/*  ))}*/}
            {/*</Field.Select>*/}

            <Field.Text  size="small" name="location" label="Ubicacion" />
            <Field.Select

              size="small"
              name="type"
              label="Tipo de transacción"
            >
              <MenuItem value="regular">Regular</MenuItem>
              <MenuItem value="change">Cambio</MenuItem>
              <MenuItem value="return">Devolución</MenuItem>
              <MenuItem value="internal_admin">Administración Interna</MenuItem>
            </Field.Select>
          </Box>
        </Section>

        {/* --- Sección: Información de servicio --- */}
        <Section title="Transacciones">
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
                  Transaccion #{index + 1}
                </Typography>
                {payments.length > 1 && (
                  <IconButton
                    onClick={() => removePayment(index)}
                    color="error"
                    size="small"

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
                <Field.Select

                  size="small"
                  name={`payments.${index}.transactionType`}
                  label="Categoria"
                >
                  <MenuItem value={0}><em>Seleccionar</em></MenuItem>
                  {transactionTypes.map((transactionType) => (
                    <MenuItem key={transactionType.id} value={transactionType.id}>
                      {transactionType.name}
                    </MenuItem>
                  ))}
                </Field.Select>

                {showWayToPay(index) && (
                  <Field.Select

                    size="small"
                    name={`payments.${index}.wayToPay`}
                    label="Forma de pago"
                  >
                    <MenuItem value={0}><em>Seleccionar</em></MenuItem>
                    {waysToPay.map((wayToPay) => (
                      <MenuItem key={wayToPay.id} value={wayToPay.id}>
                        {wayToPay.name}
                      </MenuItem>
                    ))}
                  </Field.Select>
                )}

                <Field.Select

                  size="small"
                  name={`payments.${index}.currency`}
                  label="Moneda"
                >
                  <MenuItem value={0}><em>Seleccionar</em></MenuItem>
                  {currencies.map((currency) => (
                    <MenuItem key={currency.id} value={currency.id}>
                      {currency.name}
                    </MenuItem>
                  ))}
                </Field.Select>

                {showEntity(index) && (
                  <Field.Select

                    size="small"
                    name={`payments.${index}.entity`}
                    label="Entidad"
                  >
                    <MenuItem value={0}><em>Seleccionar</em></MenuItem>
                    {entities.map((entity) => (
                      <MenuItem key={entity.id} value={entity.id}>
                        {entity.name}
                      </MenuItem>
                    ))}
                  </Field.Select>
                )}

                {showAmount(index) && (
                  <Field.Currency

                    size="small"
                    prefix={obtainPrefixByCurrency(index) + ' '}
                    name={`payments.${index}.amount`}
                    label="Monto"
                  />
                )}

                {showTotalDue(index) && (
                  <Field.Currency

                    size="small"
                    prefix={obtainPrefixByCurrency(index) + ' '}
                    name={`payments.${index}.totalDue`}
                    label={getTotalDueLabel(index)}
                  />
                )}

                {showPendingToCollect(index) && (
                  <Field.Currency

                    size="small"
                    prefix={obtainPrefixByCurrency(index) + ' '}
                    name={`payments.${index}.pendingToCollect`}
                    label={showAmount(index) ? 'Pendiente por Cobrar' : 'Monto'}
                    // label="Pendiente por Cobrar"
                  />
                )}

                {
                  showServices(index) &&
                  <Field.Select

                    size="small"
                    name={`payments.${index}.service`}
                    label="Servicio"
                  >
                    {services.map((service) => (
                      <MenuItem key={service.id} value={service.title}>
                        {service.title}
                      </MenuItem>
                    ))}
                  </Field.Select>
                }

                {
                  showServices(index) &&
                  <Field.Select

                    size="small"
                    name={`payments.${index}.serviceType`}
                    label="Tipo de servicio"
                  >
                    <MenuItem value="">Ninguno</MenuItem>
                    {showSubService(index).map((subService) => (
                      <MenuItem key={subService.id} value={subService.service}>
                        {subService.service}
                      </MenuItem>
                    ))}
                  </Field.Select>
                }

                {
                  showTaxPayerOptions(index) && (
                    <Field.Select

                      size="small"
                      name={`payments.${index}.taxPayer`}
                      label="Contribuyente"
                    >
                      <MenuItem value="Ordinario Natural">Ordinario Natural</MenuItem>
                      <MenuItem value="Ordinario Juridico">Ordinario Juridico</MenuItem>
                      <MenuItem value="Especial">Especial</MenuItem>
                    </Field.Select>
                  )
                }

                {showCanonGuaranteeContract(index) && (
                  <Box sx={{ mt: 2 }}>
                    <Field.Switch

                      name={`payments.${index}.canon`}
                      label="Canon"
                    />
                    <Field.Switch

                      name={`payments.${index}.contract`}
                      label="Contrato"
                    />
                    <Field.Switch

                      name={`payments.${index}.guarantee`}
                      label="Garantía"
                    />
                  </Box>
                )}

                {/*<Field.Currency*/}
                {/*  */}
                {/*  size="small"*/}
                {/*  name={`payments.${index}.incomeByThird`}*/}
                {/*  label="Ingreso por Terceros"*/}
                {/*/>*/}
              </Box>

              <Box sx={{ mt: 2 }}>
                <Field.Text

                  size="small"
                  name={`payments.${index}.reason`}
                  label="Concepto"
                  multiline
                  rows={3}
                  fullWidth
                />
                {/*<Field.Text*/}
                {/*  */}
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
          <Button onClick={() => appendPayment({ ...emptyPayment })} variant="contained">
            + Agregar Pago adicional
          </Button>
        </Box>

        <Box sx={{ gridColumn: '1 / -1' }}>
          <Typography variant="h5" mb={2}>
            Cargar Evidencias
          </Typography>
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
            <Button
              variant="contained"
              type="submit"
              size="large"
              color="primary"
              disabled={isSubmitting}
              loading={isSubmitting}
              startIcon={isSubmitting ? <Iconify icon="eva:loading-spinner-fill" /> : null}
            >
              Actualizar Transaccion
            </Button>
        </Stack>
      </Form>
      <ExternalPersonDialogForm
        open={openPersonDialog}
        setOpen={setOpenPersonDialog}
        onSubmitFinished={async (idPerson: number) => {
          setValue('person', idPerson);
          await refetchPeople();
          setOpenPersonDialog(false);
          toast.success(`Persona creada exitosamente!`);
        }}
      />
      <ExternalPropertyDialogForm
        open={openPropertyDialog}
        cashflowProperties={cashflowProperties}
        setOpen={setOpenPropertyDialog}
        onSubmitFinished={async (idProperty: number) => {
          setValue('property', idProperty);
          await refetchProperties();
          setOpenPropertyDialog(false);
          toast.success(`Inmueble creado exitosamente!`);
        }}
      />
    </>
  );
}

const ExternalPersonDialogForm = ({
                                    open,
                                    setOpen,
                                    onSubmitFinished,
                                  }: {
  open: boolean;
  setOpen: (value: boolean) => void;
  onSubmitFinished: (id: number) => void;
}) => {
  const methods = useForm<ExternalPersonSchemaType>({
    mode: 'all',
    resolver: zodResolver(ExternalPersonSchema),
    defaultValues: {
      name: '',
      source: 'CASH_FLOW',
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const onLocalSubmit = handleSubmit(async (values) => {
    // Replace with your API call to create a person
    const response = await createExternalPerson(values);
    onSubmitFinished(response.data.data.id);
    reset();
  });

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <Form methods={methods} onSubmit={onLocalSubmit}>
        <DialogTitle>Crear nueva persona</DialogTitle>
        <DialogContent>
          <Field.Text sx={{ mt: 1 }} name="name" label="Nombre" />
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} variant="contained">
            {isSubmitting ? 'Creando...' : 'Crear'}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
};

const ExternalPropertyDialogForm = ({
                                      open,
                                      setOpen,
                                      cashflowProperties,
                                      onSubmitFinished,
                                    }: {
  open: boolean;
  cashflowProperties: IPropertyCashFlow[];
  setOpen: (value: boolean) => void;
  onSubmitFinished: (id: number) => void;
}) => {
  const { properties } = useGetProperties();
  const methods = useForm<ExternalPropertySchemaType>({
    mode: 'all',
    resolver: zodResolver(ExternalPropertySchema),
    defaultValues: {
      name: '',
      location: '',
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const onLocalSubmit = handleSubmit(async (values) => {
    // Replace with your API call to create a person
    const response = await createExternalProperty(values);
    onSubmitFinished(response.data.data.id);
    reset();
  });

  const [tabValue, setTabValue] = useState('form');

  const handleChangeTab = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      setTabValue(newValue);
    },
    [tabValue, setTabValue]
  );

  const filteredProperties = properties.filter(p =>
    // Only include properties with a valid publication title
    p.publicationTitle && p.publicationTitle.trim() !== '' &&
    // And only include those that don't exist in cashflowProperties
    !cashflowProperties.some(cfp => cfp.name === p.publicationTitle)
  );
  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <Form methods={methods} onSubmit={onLocalSubmit}>
        <DialogTitle>Crear nuevo inmueble</DialogTitle>
        <DialogContent>
          <Tabs
            value={tabValue}
            onChange={handleChangeTab}
            sx={[
              (theme) => ({
                px: 2.5,
                boxShadow: `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
              }),
            ]}
          >
            <Tab iconPosition="end" value="form" label="Formulario" />
            <Tab iconPosition="end" value="select" label="Seleccionar de inventario"
                 icon={
                   <Label
                     variant={(tabValue === 'select' && 'filled') || 'soft'}
                     color="default"
                   >
                     {filteredProperties.length}
                   </Label>
                 }/>
          </Tabs>

          {tabValue === 'form' && (
            <Box mt={2}>
              <Field.Text sx={{ mt: 1 }} name="name" label="Nombre" />
              <Field.Text sx={{ mt: 3 }} name="location" label="Ubicacion (opcional)" />
            </Box>
          )}

          {tabValue === 'select' && (
            <Box display="flex" justifyContent="center" alignItems="center" mt={2} height={141}>
              <Field.Autocomplete
                name="name"
                sx={{ width: 406 }}
                label="Seleccionar"
                options={filteredProperties}
                getOptionLabel={(option) => option.publicationTitle || ''}
                isOptionEqualToValue={(option, value) => {
                  console.log({ option: option.publicationTitle, value });
                  // For text comparison since we're storing the title
                  return option.publicationTitle === value;
                }}
                onChange={(_, newValue) => {
                  // Set the publication title directly
                  methods.setValue('name', newValue ? newValue.publicationTitle : '');
                  // Optionally set location too if available
                  if (newValue?.address) {
                    methods.setValue('location', newValue.address);
                  }
                }}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    {option.publicationTitle}
                  </li>
                )}
                // Convert the ID back to the full object for display purposes
                value={
                  properties.find((person) => person.publicationTitle === methods.watch('name')) ||
                  null
                }
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          {tabValue === 'form' && (
            <Button type="submit" disabled={isSubmitting} variant="contained">
              {isSubmitting ? 'Creando...' : 'Crear'}
            </Button>
          )}
          {tabValue === 'select' && (
            <Button type="button" variant="contained" onClick={() => setTabValue('form')}>
              Continuar
            </Button>
          )}
        </DialogActions>
      </Form>
    </Dialog>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Box mb={5}>
    <Typography variant="h6" gutterBottom>
      {title}
    </Typography>
    <Divider sx={{ mb: 3 }} />
    {children}
  </Box>
);
