'use client';

import { z } from 'zod';
import { useMemo, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CardContent from '@mui/material/CardContent';

import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';

import { parseCurrency } from 'src/utils/format-number';

import { useGetUsers } from 'src/actions/user';
import { useGetClients } from 'src/actions/client';
import { useGetServices } from 'src/actions/service';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { RouterLink } from '../../../routes/components';

// ----------------------------------------------------------------------

const PUNTA_OPTIONS = [
  { value: 'punta_cliente', label: 'Punta cliente' },
  { value: 'punta_inmueble', label: 'Punta inmueble' },
  { value: 'doble_punta', label: 'Doble punta' },
];

const ENLACE_OPTIONS = [
  { value: 'asesor_vision', label: 'Asesor vision' },
  { value: 'asesor_externo', label: 'Asesor externo' },
  { value: 'no_hay_enlace', label: 'No hay enlace' },
];

const RENTAL_COMMISSION_OPTIONS = [
  { value: 'una_comision', label: 'Una comisión' },
  { value: 'doble_comision', label: 'Doble comisión' },
];

const CommissionFormSchema = z.object({
  // External property fields (when no property ID in URL)
  identificationNumber: z.string().optional(),
  location: z.string().optional(),

  // Service selection
  serviceType: z.string().min(1, 'Tipo de servicio es requerido'),
  servicePercentage: z.number().default(0),

  // User selection (ASESOR_INMOBILIARIO only)
  advisorId: z.string().min(1, 'Asesor es requerido'),
  advisorName: z.string().optional(),

  // Client selection
  clientId: z.string().min(1, 'Cliente es requerido'),
  clientName: z.string().optional(),

  // Financial fields
  transactionAmount: z.any(),
  deductibleAmount: z.any(),
  deductibleAmountDetail: z.any().optional(),

  // Calculated fields
  advisorFees: z.any(),
  companyFees: z.any(),
  lawyerFees: z.any(), // For legal service (ID 6)
  accountantFees: z.any(), // For accounting service (ID 5)
  materialFees: z.any(), // For remodelacion service (ID 4)
  technicalFees: z.any(), // For servicio tecnico (ID 13)
  cleaningStaffFees: z.any(), // For cleaning service (ID 7)

  // Real estate specific fields (only required for services 10, 11, 16, 19)
  tip: z.any().optional(),
  hasExternalAdvisor: z.boolean().default(false),
  externalAdvisor: z.string().optional(),
  externalAdvisorRealEstate: z.string().optional(),
  externalAdvisorTip: z.string().optional(),
  link: z.string().optional(),
  visionAdvisorLink: z.string().optional(),
  externalLink: z.string().optional(),
  ally: z.boolean().default(false),
  allyId: z.string().optional(),

  // Operation type
  operationType: z.string().optional(),

  // Rental specific
  rentalCommission: z.any().optional(),
  realEstateCommission: z.any(),
  realEstateCommissionDetail: z.string().optional(),

  // Advisor level fields
  advisorLevelTitle: z.string().optional(),
  advisorLevelPercentage: z.number().optional(),

  // Property owner percentage (for rentals)
  propertyOwnerPercentage: z.number().default(50),

  // Daily stay specific (ESTADIA POR DIA)
  dailyRate: z.any().optional(),
  numberOfDays: z.number().optional(),
  guaranteeAmount: z.any().optional(), // Garantía
  administrativeFee: z.any().optional(), // Tarifa administrativa
  cleaningStaffFeesAmount: z.any().optional(), // Personal de limpieza amount

  // Dynamic deductibles array
  deductibles: z.array(z.object({
    title: z.string().min(1, 'Título es requerido'),
    amount: z.any(),
    description: z.string().optional(),
    advisorPercentage: z.number().min(0).max(100).default(50), // % that goes to advisor
    companyPercentage: z.number().min(0).max(100).default(50), // % that goes to company
  })).default([]),

  // Final calculations
  visionAdvisorSubtotalFees: z.any(),
  propertyTipAmount: z.any(),
  clientTipAmount: z.any(),
  doubleTipAmount: z.any(),
  visionAdvisorTotalFees: z.any(),
  companyFeesFinal: z.any(),

  // Punta percentages for calculation
  propertyTipPercentage: z.number().default(50),
  clientTipPercentage: z.number().default(50),
}).refine((data) => {
  // If external property, require identificationNumber and location
  if (!data.identificationNumber && !data.location) {
    return true; // Internal property
  }
  return !!(data.identificationNumber && data.location);
}, {
  message: "Para propiedades externas, se requiere número de identificación y ubicación",
  path: ["identificationNumber"],
});

type CommissionFormSchemaType = z.infer<typeof CommissionFormSchema>;

type Props = {
  id?: string;
};

export function CommissionCalculationDetailView({ id: propId }: Props) {
  const { id: urlId } = useParams();
  const propertyId = propId || urlId;
  const isExternalProperty = !propertyId;

  const { users } = useGetUsers();
  const { clients } = useGetClients();
  const { services } = useGetServices();

  // Filter advisors (ASESOR_INMOBILIARIO role only)
  const advisors = useMemo(() =>
    users?.filter(user => user.role === 'ASESOR_INMOBILIARIO') || [],
    [users]
  );

  const defaultValues: CommissionFormSchemaType = {
    identificationNumber: '',
    location: '',
    serviceType: '',
    servicePercentage: 0,
    advisorId: '',
    advisorName: '',
    clientId: '',
    clientName: '',
    transactionAmount: '',
    deductibleAmount: '',
    deductibleAmountDetail: '',
    advisorFees: '',
    companyFees: '',
    lawyerFees: '',
    accountantFees: '',
    materialFees: '',
    technicalFees: '',
    cleaningStaffFees: '',
    tip: '',
    hasExternalAdvisor: false,
    externalAdvisor: '',
    externalAdvisorRealEstate: '',
    externalAdvisorTip: '',
    link: '',
    visionAdvisorLink: '',
    externalLink: '',
    ally: false,
    allyId: '',
    operationType: '',
    rentalCommission: '',
    realEstateCommission: '',
    realEstateCommissionDetail: '',
    advisorLevelTitle: '',
    advisorLevelPercentage: 0,
    propertyOwnerPercentage: 50,
    dailyRate: '',
    numberOfDays: 0,
    guaranteeAmount: '',
    administrativeFee: '',
    cleaningStaffFeesAmount: '',
    deductibles: [],
    visionAdvisorSubtotalFees: '',
    propertyTipAmount: '',
    clientTipAmount: '',
    doubleTipAmount: '',
    visionAdvisorTotalFees: '',
    companyFeesFinal: '',
    propertyTipPercentage: 50,
    clientTipPercentage: 50,
  };

  const methods = useForm<CommissionFormSchemaType>({
    mode: 'all',
    resolver: zodResolver(CommissionFormSchema),
    defaultValues,
  });

  const {
    watch,
    setValue,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = methods;

  const { fields: deductibleFields, append: appendDeductible, remove: removeDeductible } = useFieldArray({
    control,
    name: 'deductibles',
  });

  const watchedServiceType = watch('serviceType');
  const watchedServiceId = watch('serviceType'); // This will be updated to store ID
  const watchedTransactionAmount = watch('transactionAmount');
  const watchedDeductibleAmount = watch('deductibleAmount');
  const watchedServicePercentage = watch('servicePercentage');
  const watchedHasExternalAdvisor = watch('hasExternalAdvisor');
  const watchedLink = watch('link');
  const watchedOperationType = watch('operationType');
  const watchedTip = watch('tip');
  const watchedRealEstateCommission = watch('realEstateCommission');
  const watchedRentalCommission = watch('rentalCommission');
  const watchedDeductibles = watch('deductibles');
  const watchedAdvisorId = watch('advisorId');
  const watchedAdvisorLevelPercentage = watch('advisorLevelPercentage');
  const watchedPropertyOwnerPercentage = watch('propertyOwnerPercentage');
  const watchedDailyRate = watch('dailyRate');
  const watchedNumberOfDays = watch('numberOfDays');
  const watchedGuaranteeAmount = watch('guaranteeAmount');
  const watchedAdministrativeFee = watch('administrativeFee');
  const watchedCleaningStaffFeesAmount = watch('cleaningStaffFeesAmount');
  const watchedAdvisorFees = watch('advisorFees');
  const watchedCompanyFees = watch('companyFees');
  const watchedPropertyTipPercentage = watch('propertyTipPercentage');
  const watchedClientTipPercentage = watch('clientTipPercentage');
  const watchedLawyerFees = watch('lawyerFees');
  const watchedAccountantFees = watch('accountantFees');
  const watchedMaterialFees = watch('materialFees');
  const watchedTechnicalFees = watch('technicalFees');
  const watchedCleaningStaffFees = watch('cleaningStaffFees');

  // Check if current service should show real estate info
  const showRealEstateInfo = useMemo(() => {
    if (!watchedServiceType || !services) return false;
    const selectedService = services.find(s => s.title === watchedServiceType);
    return selectedService && [10, 11, 16, 19].includes(selectedService.id!);
  }, [watchedServiceType, services]);

  // Get current service ID
  const currentServiceId = useMemo(() => {
    if (!watchedServiceType || !services) return null;
    const selectedService = services.find(s => s.title === watchedServiceType);
    return selectedService?.id || null;
  }, [watchedServiceType, services]);

  // Extract advisor metadata when advisor is selected
  useEffect(() => {
    if (watchedAdvisorId && advisors.length > 0) {
      const selectedAdvisor = advisors.find(advisor => advisor.id?.toString() === watchedAdvisorId);
      if (selectedAdvisor?.metadata) {
        const metadata = typeof selectedAdvisor.metadata === 'string'
          ? JSON.parse(selectedAdvisor.metadata)
          : selectedAdvisor.metadata;

        if (metadata.adviser_level_title && metadata.adviser_level_percentage) {
          setValue('advisorLevelTitle', metadata.adviser_level_title);
          setValue('advisorLevelPercentage', metadata.adviser_level_percentage);
        }
      }
    }
  }, [watchedAdvisorId, advisors, setValue]);

  // Check if current service is legal service
  const isLegalService = useMemo(() => {
    if (!watchedServiceType || !services) return false;
    const selectedService = services.find(s => s.title === watchedServiceType);
    return selectedService && selectedService.id === 6;
  }, [watchedServiceType, services]);

  // Check if current service is accounting service
  const isAccountingService = useMemo(() => {
    if (!watchedServiceType || !services) return false;
    const selectedService = services.find(s => s.title === watchedServiceType);
    return selectedService && selectedService.id === 5;
  }, [watchedServiceType, services]);

  // Check if current service is remodelacion service
  const isRemodelacionService = useMemo(() => {
    if (!watchedServiceType || !services) return false;
    const selectedService = services.find(s => s.title === watchedServiceType);
    return selectedService && selectedService.id === 4;
  }, [watchedServiceType, services]);

  // Check if current service is technical service
  const isTechnicalService = useMemo(() => {
    if (!watchedServiceType || !services) return false;
    const selectedService = services.find(s => s.title === watchedServiceType);
    return selectedService && selectedService.id === 13;
  }, [watchedServiceType, services]);

  // Check if current service is cleaning service
  const isCleaningService = useMemo(() => {
    if (!watchedServiceType || !services) return false;
    const selectedService = services.find(s => s.title === watchedServiceType);
    return selectedService && selectedService.id === 7;
  }, [watchedServiceType, services]);

  // Auto-populate service percentage when service is selected
  useEffect(() => {
    if (watchedServiceType && services) {
      const selectedService = services.find(s => s.title === watchedServiceType);
      if (selectedService) {
        // For real estate services, use advisor level percentage
        if (showRealEstateInfo && watchedAdvisorLevelPercentage) {
          setValue('servicePercentage', watchedAdvisorLevelPercentage);
        } else {
          // For other services, use service commission percentage
          const commisionPercentage = selectedService.commissionPercentage || 0;
          setValue('servicePercentage', commisionPercentage);
        }
      }
    }
  }, [watchedServiceType, services, showRealEstateInfo, watchedAdvisorLevelPercentage, setValue]);

  // Clear real estate fields when service doesn't require them
  useEffect(() => {
    if (!showRealEstateInfo) {
      // Clear all real estate specific fields
      setValue('tip', '');
      setValue('hasExternalAdvisor', false);
      setValue('externalAdvisor', '');
      setValue('externalAdvisorRealEstate', '');
      setValue('externalAdvisorTip', '');
      setValue('link', '');
      setValue('visionAdvisorLink', '');
      setValue('externalLink', '');
      setValue('ally', false);
      setValue('allyId', '');
      setValue('operationType', '');
      setValue('rentalCommission', '');
      setValue('realEstateCommission', '');
      setValue('realEstateCommissionDetail', '');
    }
  }, [showRealEstateInfo, setValue]);

  // Calculate basic fees when values change
  useEffect(() => {
    if (watchedTransactionAmount && watchedServicePercentage) {
      const transactionAmount = parseCurrency(watchedTransactionAmount);
      const deductible = parseCurrency(watchedDeductibleAmount);
      const netAmount = transactionAmount - deductible;
      const advisorFees = (netAmount * watchedServicePercentage) / 100;

      setValue('advisorFees', advisorFees.toFixed(2));

      // Calculate fees based on service type
      if (isLegalService) {
        const lawyerFees = (netAmount * 45) / 100; // 45% for lawyer
        setValue('lawyerFees', lawyerFees.toFixed(2));
        setValue('accountantFees', '0');
        setValue('materialFees', '0');
        setValue('technicalFees', '0');

        // Company fees = total - deductible - advisor - lawyer
        const companyFees = netAmount - advisorFees - lawyerFees;
        setValue('companyFees', companyFees.toFixed(2));
      } else if (isAccountingService) {
        const accountantFees = (netAmount * 50) / 100; // 50% for accountant
        setValue('accountantFees', accountantFees.toFixed(2));
        setValue('lawyerFees', '0');
        setValue('materialFees', '0');
        setValue('technicalFees', '0');

        // Company fees = total - deductible - advisor - accountant
        const companyFees = netAmount - advisorFees - accountantFees;
        setValue('companyFees', companyFees.toFixed(2));
      } else if (isRemodelacionService || isTechnicalService || isCleaningService) {
        setValue('lawyerFees', '0');
        setValue('accountantFees', '0');

        // For remodelacion, technical, and cleaning services, fees are manually entered
        const materialFees = parseCurrency(watchedMaterialFees);
        const technicalFees = parseCurrency(watchedTechnicalFees);
        const cleaningStaffFees = parseCurrency(watchedCleaningStaffFees);
        const companyFees = netAmount - advisorFees - materialFees - technicalFees - cleaningStaffFees;
        setValue('companyFees', companyFees.toFixed(2));
      } else {
        setValue('lawyerFees', '0');
        setValue('accountantFees', '0');
        setValue('materialFees', '0');
        setValue('technicalFees', '0');
        setValue('cleaningStaffFees', '0');
        const companyFees = netAmount - advisorFees;
        setValue('companyFees', companyFees.toFixed(2));
      }
    }
  }, [watchedTransactionAmount, watchedDeductibleAmount, watchedServicePercentage, isLegalService, isAccountingService, isRemodelacionService, isTechnicalService, isCleaningService, watchedMaterialFees, watchedTechnicalFees, watchedCleaningStaffFees, setValue]);

  // Calculate real estate specific amounts and final calculations
  useEffect(() => {
    if (!showRealEstateInfo || !watchedTransactionAmount || !watchedAdvisorLevelPercentage) return;

    const transactionAmount = parseCurrency(watchedTransactionAmount);
    const deductible = parseCurrency(watchedDeductibleAmount);
    const totalDeductibles = watchedDeductibles?.reduce((sum, deductibleItem) => sum + parseCurrency(deductibleItem.amount), 0) || 0;

    // Calculate base for commission: Transaction - main deductible - additional deductibles
    const netAmount = transactionAmount - deductible;
    const baseForCommission = netAmount - totalDeductibles;
    const advisorLevelPct = watchedAdvisorLevelPercentage / 100;

    // Clear other service fees for real estate
    setValue('lawyerFees', '0');
    setValue('accountantFees', '0');
    setValue('materialFees', '0');
    setValue('technicalFees', '0');
    setValue('cleaningStaffFees', '0');

    if (currentServiceId === 11) { // COMPRAVENTA
      // COMPRAVENTA Calculation:
      // 1. Base para comisión = Monto operación - suma de todos los deducibles
      // 2. Honorarios Asesor = (Monto operación - deducible principal) × % del servicio
      // 3. Honorarios empresa = monto operación - deducible principal - monto asesor
      // 4. Tips are calculated from the advisor level % on the base after deductibles

      const baseForCommissionAfterDeductibles = transactionAmount - deductible - totalDeductibles;

      // Advisor fees = (Transaction - main deductible) × service percentage
      const advisorBaseFees = netAmount * (watchedServicePercentage / 100);
      setValue('advisorFees', advisorBaseFees.toFixed(2));

      // Company fees = Transaction - main deductible - advisor fees
      const companyBaseFees = netAmount - advisorBaseFees;
      setValue('companyFees', companyBaseFees.toFixed(2));

      if (watchedTip) {
        // Tips are calculated from the base after all deductibles using advisor level %
        if (watchedTip === 'punta_cliente') {
          const clientTipAmount = baseForCommissionAfterDeductibles * advisorLevelPct;
          setValue('clientTipAmount', clientTipAmount.toFixed(2));
          setValue('propertyTipAmount', '0');
          setValue('doubleTipAmount', '0');
        } else if (watchedTip === 'punta_inmueble') {
          const propertyTipAmount = baseForCommissionAfterDeductibles * advisorLevelPct;
          setValue('propertyTipAmount', propertyTipAmount.toFixed(2));
          setValue('clientTipAmount', '0');
          setValue('doubleTipAmount', '0');
        } else if (watchedTip === 'doble_punta') {
          const clientTipAmount = baseForCommissionAfterDeductibles * advisorLevelPct;
          const propertyTipAmount = baseForCommissionAfterDeductibles * advisorLevelPct;
          const doubleTipAmount = clientTipAmount + propertyTipAmount;
          setValue('clientTipAmount', clientTipAmount.toFixed(2));
          setValue('propertyTipAmount', propertyTipAmount.toFixed(2));
          setValue('doubleTipAmount', doubleTipAmount.toFixed(2));
        }
      }
    } else if (currentServiceId === 10) { // ALQUILER
      let rentalAmount = watchedRealEstateCommission ? parseCurrency(watchedRealEstateCommission) : 0;

      // Apply rental commission multiplier
      if (watchedRentalCommission === 'doble_comision') {
        rentalAmount *= 2;
      }

      const adjustedBase = rentalAmount - totalDeductibles;
      const propertyOwnerAmount = adjustedBase * (watchedPropertyOwnerPercentage / 100);
      const advisorAmount = adjustedBase * advisorLevelPct;
      const companyAmount = adjustedBase - propertyOwnerAmount - advisorAmount;

      setValue('propertyTipAmount', propertyOwnerAmount.toFixed(2));
      setValue('clientTipAmount', advisorAmount.toFixed(2));
      setValue('doubleTipAmount', companyAmount.toFixed(2));

      // Update basic financial fields
      setValue('advisorFees', advisorAmount.toFixed(2));
      setValue('companyFees', companyAmount.toFixed(2));
    } else if (currentServiceId === 19) { // ESTADIA POR DIA
      // ESTADIA POR DIA Calculation:
      // Total estadía = Daily rate × Number of days
      // Base = Total estadía - garantía - tarifa administrativa
      // Propietario = Base × 70%
      // Asesor = Base × 30% × advisor level percentage from metadata
      // Empresa = Total estadía - garantía - propietario - asesor - personal limpieza

      const dailyRate = parseCurrency(watchedDailyRate);
      const days = watchedNumberOfDays || 0;
      const guaranteeAmount = parseCurrency(watchedGuaranteeAmount);
      const administrativeFee = parseCurrency(watchedAdministrativeFee);
      const cleaningStaffAmount = parseCurrency(watchedCleaningStaffFeesAmount);

      const totalStay = dailyRate * days;
      const baseAmount = totalStay - guaranteeAmount - administrativeFee;

      // Property owner gets 70%
      const propertyOwnerAmount = baseAmount * 0.7;

      // Advisor gets 30% of base × advisor level percentage
      const advisorBaseAmount = baseAmount * 0.3;
      const advisorFinalAmount = advisorBaseAmount * advisorLevelPct;

      // Company gets remainder
      const companyAmount = totalStay - guaranteeAmount - propertyOwnerAmount - advisorFinalAmount - cleaningStaffAmount;

      setValue('propertyTipAmount', propertyOwnerAmount.toFixed(2));
      setValue('clientTipAmount', advisorFinalAmount.toFixed(2));
      setValue('doubleTipAmount', companyAmount.toFixed(2));

      // Update basic financial fields
      setValue('advisorFees', advisorFinalAmount.toFixed(2));
      setValue('companyFees', companyAmount.toFixed(2));
    } else if (currentServiceId === 16) { // TRASPASO FONDO COMERCIO (combines compraventa + rental logic)
      if (watchedTip) {
        const rentalCommission = watchedRealEstateCommission ? parseCurrency(watchedRealEstateCommission) : 0;
        const combinedBase = baseForCommission + rentalCommission;

        let advisorFees = 0;
        if (watchedTip === 'punta_cliente') {
          const clientTipAmount = combinedBase * advisorLevelPct;
          advisorFees = clientTipAmount;
          setValue('clientTipAmount', clientTipAmount.toFixed(2));
          setValue('propertyTipAmount', '0');
          setValue('doubleTipAmount', '0');
        } else if (watchedTip === 'punta_inmueble') {
          const propertyTipAmount = combinedBase * advisorLevelPct;
          advisorFees = propertyTipAmount;
          setValue('propertyTipAmount', propertyTipAmount.toFixed(2));
          setValue('clientTipAmount', '0');
          setValue('doubleTipAmount', '0');
        } else if (watchedTip === 'doble_punta') {
          const clientTipAmount = combinedBase * advisorLevelPct;
          const propertyTipAmount = combinedBase * advisorLevelPct;
          const doubleTipAmount = clientTipAmount + propertyTipAmount;
          advisorFees = doubleTipAmount;
          setValue('clientTipAmount', clientTipAmount.toFixed(2));
          setValue('propertyTipAmount', propertyTipAmount.toFixed(2));
          setValue('doubleTipAmount', doubleTipAmount.toFixed(2));
        }

        // Update basic financial fields
        setValue('advisorFees', advisorFees.toFixed(2));
        const companyFees = (netAmount + rentalCommission) - advisorFees;
        setValue('companyFees', companyFees.toFixed(2));
      }
    }
  }, [
    showRealEstateInfo,
    watchedTransactionAmount,
    watchedDeductibleAmount,
    watchedDeductibles,
    watchedAdvisorLevelPercentage,
    watchedTip,
    watchedRealEstateCommission,
    watchedRentalCommission,
    watchedPropertyOwnerPercentage,
    watchedDailyRate,
    watchedNumberOfDays,
    watchedGuaranteeAmount,
    watchedAdministrativeFee,
    watchedCleaningStaffFeesAmount,
    currentServiceId,
    setValue
  ]);

  // Calculate final totals including deductibles
  useEffect(() => {
    if (watchedTransactionAmount) {
      const transactionAmount = parseCurrency(watchedTransactionAmount);
      const deductible = parseCurrency(watchedDeductibleAmount);
      const lawyerFees = parseCurrency(watchedLawyerFees);
      const accountantFees = parseCurrency(watchedAccountantFees);
      const materialFees = parseCurrency(watchedMaterialFees);
      const technicalFees = parseCurrency(watchedTechnicalFees);
      const cleaningStaffFees = parseCurrency(watchedCleaningStaffFees);
      const currentAdvisorFees = parseCurrency(watchedAdvisorFees);

      // Calculate total deductibles from array
      const totalDeductibles = watchedDeductibles?.reduce((sum, deductibleItem) => sum + parseCurrency(deductibleItem.amount), 0) || 0;

      if (showRealEstateInfo) {
        if (currentServiceId === 19) { // ESTADIA POR DIA special case
          // For ESTADIA POR DIA, subtotal is the base amount * 30% (before advisor level percentage)
          const dailyRate = parseCurrency(watchedDailyRate);
          const days = watchedNumberOfDays || 0;
          const guaranteeAmount = parseCurrency(watchedGuaranteeAmount);
          const administrativeFee = parseCurrency(watchedAdministrativeFee);

          const totalStay = dailyRate * days;
          const baseAmount = totalStay - guaranteeAmount - administrativeFee;
          const advisorBaseAmount = baseAmount * 0.3; // 30% before advisor level percentage

          setValue('visionAdvisorSubtotalFees', advisorBaseAmount.toFixed(2));
          setValue('visionAdvisorTotalFees', currentAdvisorFees.toFixed(2)); // Final amount after advisor level %
        } else {
          // For other real estate services, use service percentage calculation
          const subtotal = (transactionAmount - deductible) * (watchedServicePercentage / 100);
          setValue('visionAdvisorSubtotalFees', subtotal.toFixed(2));
          setValue('visionAdvisorTotalFees', currentAdvisorFees.toFixed(2));
        }

        // Company fees final = already calculated in real estate logic
        const currentCompanyFees = parseCurrency(watchedCompanyFees);
        setValue('companyFeesFinal', currentCompanyFees.toFixed(2));
      } else {
        // For non-real estate services, use the old logic
        const subtotal = (transactionAmount - deductible) * (watchedServicePercentage / 100);
        setValue('visionAdvisorSubtotalFees', subtotal.toFixed(2));

        // Calculate total Vision advisor fees (subtract total deductibles)
        const totalAdvisorFees = subtotal - totalDeductibles;
        setValue('visionAdvisorTotalFees', totalAdvisorFees.toFixed(2));

        // Calculate final company fees
        const finalCompanyFees = transactionAmount - deductible - totalAdvisorFees - lawyerFees - accountantFees - materialFees - technicalFees - cleaningStaffFees;
        setValue('companyFeesFinal', finalCompanyFees.toFixed(2));
      }
    }
  }, [
    watchedTransactionAmount,
    watchedDeductibleAmount,
    watchedServicePercentage,
    watchedDeductibles,
    watchedAdvisorFees,
    watchedCompanyFees,
    watchedLawyerFees,
    watchedAccountantFees,
    watchedMaterialFees,
    watchedTechnicalFees,
    watchedCleaningStaffFees,
    showRealEstateInfo,
    currentServiceId,
    watchedDailyRate,
    watchedNumberOfDays,
    watchedGuaranteeAmount,
    watchedAdministrativeFee,
    setValue
  ]);

  const onSubmit = handleSubmit(async (values) => {
    console.log('Commission calculation values:', values);
    // TODO: Implement commission calculation submission
  });

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Calcular comisión"
        links={[
          { name: 'Inicio', href: paths.dashboard.root },
          { name: 'Calculo de comisiones', href: paths.dashboard.admin.commissions },
          { name: isExternalProperty ? 'Propiedad externa' : `Inmueble ${propertyId}` },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.admin.commissions}
            variant="outlined"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
          >
            Volver
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Form methods={methods} onSubmit={onSubmit}>
        <Card>
          <CardContent>
            {/* External Property Section */}
            {isExternalProperty && (
              <Section title="Información de propiedad externa">
                <Box
                  sx={{
                    rowGap: 3,
                    columnGap: 2,
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' },
                  }}
                >
                  <Field.Text
                    name="identificationNumber"
                    label="Número de identificación"
                    required
                  />
                  <Field.Text
                    name="location"
                    label="Ubicación"
                    required
                  />
                </Box>
              </Section>
            )}

            {/* Basic Information Section */}
            <Section title="Información básica">
              <Box
                sx={{
                  rowGap: 3,
                  columnGap: 2,
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' },
                }}
              >
                <Field.Select name="serviceType" label="Tipo de servicio" required>
                  {services?.map((service) => (
                    <MenuItem key={service.id} value={service.title}>
                      {service.title}
                    </MenuItem>
                  ))}
                </Field.Select>

                <Field.Text
                  name="servicePercentage"
                  label="Porcentaje del servicio (%)"
                  type="number"
                  disabled
                />

                <Field.Select name="advisorId" label="Asesor" required>
                  {advisors.map((advisor) => (
                    <MenuItem
                      key={advisor.id}
                      value={advisor.id?.toString() || ''}
                    >
                      {advisor.firstname} {advisor.lastname}
                    </MenuItem>
                  ))}
                </Field.Select>

                <Field.Select name="clientId" label="Cliente" required>
                  {clients?.map((client: any) => (
                    <MenuItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </MenuItem>
                  ))}
                </Field.Select>
              </Box>
            </Section>

            {/* Financial Information Section */}
            <Section title="Información financiera">
              <Box
                sx={{
                  rowGap: 3,
                  columnGap: 2,
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' },
                }}
              >
                <Field.Currency
                  size="medium"
                  name="transactionAmount"
                  label="Monto de la transacción"
                />

                <Field.Currency
                  size="medium"
                  name="deductibleAmount"
                  label="Monto deducible"
                />

                <Field.Text
                  name="deductibleAmountDetail"
                  label="Detalle de monto deducible"
                  sx={{ gridColumn: '1 / -1' }}
                />

                {/* ESTADIA POR DIA specific fields */}
                {currentServiceId === 19 && (
                  <>
                    <Field.Currency
                      size="medium"
                      name="dailyRate"
                      label="Tarifa diaria"
                    />
                    <Field.Text
                      name="numberOfDays"
                      label="Número de días"
                      type="number"
                      required
                    />
                    <Field.Currency
                      size="medium"
                      name="guaranteeAmount"
                      label="Garantía"
                    />
                    <Field.Currency
                      size="medium"
                      name="administrativeFee"
                      label="Tarifa administrativa"
                    />
                    <Field.Currency
                      size="medium"
                      name="cleaningStaffFeesAmount"
                      label="Personal de limpieza"
                    />
                  </>
                )}

                <Field.Currency
                  size="medium"
                  name="advisorFees"
                  label="Honorarios asesor"
                  disabled
                />

                {isLegalService && (
                  <Field.Currency
                    size="medium"
                    name="lawyerFees"
                    label="Honorarios abogado (45%)"
                    disabled
                  />
                )}

                {isAccountingService && (
                  <Field.Currency
                    size="medium"
                    name="accountantFees"
                    label="Honorarios contador (50%)"
                    disabled
                  />
                )}

                {isRemodelacionService && (
                  <Field.Currency
                    size="medium"
                    name="materialFees"
                    label="Honorarios materiales"
                  />
                )}

                {isTechnicalService && (
                  <Field.Currency
                    size="medium"
                    name="technicalFees"
                    label="Honorarios técnico"
                  />
                )}

                {isCleaningService && (
                  <Field.Currency
                    size="medium"
                    name="cleaningStaffFees"
                    label="Honorarios personal de limpieza"
                  />
                )}

                <Field.Currency
                  size="medium"
                  name="companyFees"
                  label="Honorarios de empresa"
                  disabled
                />
              </Box>
            </Section>

            {/* Real Estate Specific Section - Only for services 10, 11, 16, 19 */}
            {showRealEstateInfo && (
              <Section title="Información inmobiliaria">
                <Stack spacing={3}>
                  {/* Advisor Level Information */}
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: 'background.neutral',
                      borderRadius: 1,
                      display: 'grid',
                      gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' },
                      gap: 2,
                    }}
                  >
                    <Field.Text
                      name="advisorLevelTitle"
                      label="Nivel del asesor"
                      disabled
                    />
                    <Field.Text
                      name="advisorLevelPercentage"
                      label="Porcentaje por nivel (%)"
                      type="number"
                      disabled
                    />
                  </Box>

                  <Box
                    sx={{
                      rowGap: 3,
                      columnGap: 2,
                      display: 'grid',
                      gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' },
                    }}
                  >
                    {/* Show tip selection for COMPRAVENTA and TRASPASO FONDO COMERCIO */}
                    {(currentServiceId === 11 || currentServiceId === 16) && (
                      <Field.Select name="tip" label="Punta" required>
                        {PUNTA_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Field.Select>
                    )}

                    {/* Show rental commission for ALQUILER */}
                    {currentServiceId === 10 && (
                      <>
                        <Field.Select name="rentalCommission" label="Modalidad de comisión" required>
                          {RENTAL_COMMISSION_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Field.Select>
                        <Field.Currency
                          name="realEstateCommission"
                          label="Monto del alquiler mensual"
                        />
                        <Field.Text
                          name="propertyOwnerPercentage"
                          label="Porcentaje propietario (%)"
                          type="number"
                        />
                      </>
                    )}


                    {/* Show rental commission for TRASPASO FONDO COMERCIO */}
                    {currentServiceId === 16 && (
                      <Field.Currency
                          name="realEstateCommission"
                          label="Comisión adicional (modalidad alquiler)"
                        />
                    )}

                    <Field.Checkbox
                      name="hasExternalAdvisor"
                      label="¿Hay asesor externo?"
                    />

                    {watchedHasExternalAdvisor && (
                      <>
                        <Field.Text
                          name="externalAdvisor"
                          label="Asesor externo"
                        />
                        <Field.Text
                          name="externalAdvisorRealEstate"
                          label="Inmobiliaria del asesor externo"
                        />
                        <Field.Select name="externalAdvisorTip" label="Punta asesor externo">
                          <MenuItem value="punta_inmueble">Punta inmueble</MenuItem>
                          <MenuItem value="punta_cliente">Punta cliente</MenuItem>
                        </Field.Select>
                      </>
                    )}

                    <Field.Select name="link" label="Enlace">
                      {ENLACE_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Field.Select>

                    {watchedLink === 'asesor_vision' && (
                      <Field.Select name="visionAdvisorLink" label="Asesor Vision">
                        {advisors.map((advisor) => (
                          <MenuItem key={advisor.id} value={advisor.id?.toString() || ''}>
                            {advisor.firstname} {advisor.lastname}
                          </MenuItem>
                        ))}
                      </Field.Select>
                    )}

                    {watchedLink === 'asesor_externo' && (
                      <Field.Text
                        name="externalLink"
                        label="Asesor externo"
                      />
                    )}

                    <Field.Checkbox
                      name="ally"
                      label="Aliado"
                    />
                  </Box>
                </Stack>
              </Section>
            )}


            {/* Deductibles Section */}
            <Section title="Deducibles y gastos">
              <Stack spacing={2}>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    onClick={() => appendDeductible({
                      title: '',
                      amount: '',
                      description: '',
                      advisorPercentage: 50,
                      companyPercentage: 50
                    })}
                    startIcon={<Iconify icon="eva:plus-fill" />}
                  >
                    Agregar deducible
                  </Button>
                  <Button
                    variant="outlined"
                    disabled
                    startIcon={<Iconify icon="eva:download-fill" />}
                  >
                    Importar desde flujo de caja
                  </Button>
                </Stack>

                {deductibleFields.map((field, index) => (
                  <Box
                    key={field.id}
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      position: 'relative',
                    }}
                  >
                    <IconButton
                      onClick={() => removeDeductible(index)}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: 'error.main',
                      }}
                    >
                      <Iconify icon="eva:trash-2-outline" />
                    </IconButton>

                    <Box
                      sx={{
                        rowGap: 2,
                        columnGap: 2,
                        display: 'grid',
                        gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' },
                        pr: 5, // Space for delete button
                      }}
                    >
                      <Field.Text
                        name={`deductibles.${index}.title`}
                        label="Título"
                        required
                      />
                      <Field.Currency
                        name={`deductibles.${index}.amount`}
                        label="Monto"
                        size="medium"
                      />

                      <Field.Text
                        name={`deductibles.${index}.advisorPercentage`}
                        label="% Asesor"
                        type="number"
                        slotProps={{
                          htmlInput: { min: 0, max: 100 }
                        }}
                      />
                      <Field.Text
                        name={`deductibles.${index}.companyPercentage`}
                        label="% Empresa"
                        type="number"
                        slotProps={{
                          htmlInput: { min: 0, max: 100 }
                        }}
                      />

                      <Field.Text
                        name={`deductibles.${index}.description`}
                        label="Descripción"
                        sx={{ gridColumn: '1 / -1' }}
                      />
                    </Box>
                  </Box>
                ))}

                {deductibleFields.length === 0 && (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                    No hay deducibles agregados. Haz clic en &quotAgregar deducible&quot para comenzar.
                  </Typography>
                )}
              </Stack>
            </Section>

            {/* Final Calculations Section */}
            {(showRealEstateInfo && watchedAdvisorLevelPercentage) && (
              <Section title="Distribución final">
                <Box
                  sx={{
                    rowGap: 3,
                    columnGap: 2,
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' },
                  }}
                >
                  {/* COMPRAVENTA and TRASPASO FONDO COMERCIO labels */}
                  {(currentServiceId === 11 || currentServiceId === 16) && (
                    <>
                      <Field.Currency
                        size="medium"
                        name="propertyTipAmount"
                        label="Punta inmueble ($)"
                        disabled
                      />
                      <Field.Currency
                        size="medium"
                        name="clientTipAmount"
                        label="Punta cliente ($)"
                        disabled
                      />
                      <Field.Currency
                        size="medium"
                        name="doubleTipAmount"
                        label="Doble punta ($)"
                        disabled
                      />
                    </>
                  )}

                  {/* ALQUILER and ESTADIA POR DIA labels */}
                  {(currentServiceId === 10 || currentServiceId === 19) && (
                    <>
                      <Field.Currency
                        size="medium"
                        name="propertyTipAmount"
                        label="Comisión propietario ($)"
                        disabled
                      />
                      <Field.Currency
                        size="medium"
                        name="clientTipAmount"
                        label="Comisión asesor ($)"
                        disabled
                      />
                      <Field.Currency
                        size="medium"
                        name="doubleTipAmount"
                        label="Comisión empresa ($)"
                        disabled
                      />
                    </>
                  )}

                  <Field.Currency
                    size="medium"
                    name="visionAdvisorSubtotalFees"
                    label="Subtotal honorarios asesor Vision"
                    disabled
                  />

                  <Field.Currency
                    size="medium"
                    name="visionAdvisorTotalFees"
                    label="Total honorarios asesor Vision"
                    disabled
                  />

                  <Field.Currency
                    size="medium"
                    name="companyFeesFinal"
                    label="Honorarios de empresa (final)"
                    disabled
                  />
                </Box>
              </Section>
            )}

            {/* Submit Button */}
            <Stack direction="row" justifyContent="flex-end" gap={2} mt={4}>
              <Button
                component={RouterLink}
                href={paths.dashboard.admin.commissions}
                startIcon={<Iconify icon="eva:arrow-back-fill" />}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <Iconify icon="eva:loading-spinner-fill" /> : <Iconify icon="eva:save-fill" />}
              >
                Calcular comisión
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Form>
    </DashboardContent>
  );
}

// Section component for form organization
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Box mb={4}>
    <Typography variant="h6" gutterBottom>
      {title}
    </Typography>
    <Divider sx={{ mb: 3 }} />
    {children}
  </Box>
);
