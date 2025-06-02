import type { AxiosResponse } from 'axios';

import { z } from 'zod';
import { toast } from 'sonner';
import { useBoolean } from 'minimal-shared/hooks';
import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider, useFieldArray } from 'react-hook-form';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';

import axiosInstance from '../../../lib/axios';
import { useAuthContext } from '../../../auth/hooks';
import { Form } from '../../../components/hook-form';
import { Iconify } from '../../../components/iconify';
import { useParams, useRouter } from '../../../routes/hooks';
import { parseCurrency } from '../../../utils/format-number';
import GeneralInformationForm from './general-information-form';
import LocationInformationForm from './location-information-form';
import NegotiationInformationForm from './negotiation-information-form';
import DocumentationInformationForm from './documentation-information-form';
import { useGetProperty, useGetProperties, createUpdateProperty } from '../../../actions/property';
import AttributesEquipmentUtilitiesServicesDistributionForm from './attributes-equipment-utilities-services-distribution-form';

import type {
  Utility,
  Adjacency,
  Attribute,
  Distribution,
  UtilityFormField,
  AdjacencyFormField,
  AttributeFormField,
  EquipmentFormField,
  DistributionFormField,
  IPropertyItemCreateUpdate,
} from '../../../types/property';

export type PropertyFormSchemaType = z.infer<typeof PropertyFormSchema>;

export const PropertyFormSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  images: z.any().optional(),
  documents: z.any().optional(),
  distributions: z.any().optional(),
  attributes: z.any().optional(),
  adjacencies: z.any().optional(),
  equipments: z.any().optional(),
  utilities: z.any().optional(),
  furnishedAreas: z.any().optional(),
  status: z.string().default('inactive'),
  updatedby: z.any().optional(),
  changes: z.any().optional(),
  createdby: z.any().optional(),

  // General info
  generalInformation: z.object({
    id: z.string().optional(),
    code: z.string().optional(),
    publicationTitle: z.string(),
    footageGround: z.string(),
    footageBuilding: z.string(),
    description: z.string(),
    propertyType: z.string(),
    zoning: z.string().optional(),
    propertyCondition: z.string().optional(),
    antiquity: z.string().optional(),
    amountOfFloors: z.string().optional(),
    typeOfWork: z.string().optional(),
    propertiesPerFloor: z.string().optional(),
    handoverKeys: z.boolean(),
    termsAndConditionsAccepted: z.boolean(),
    isFurnished: z.boolean(),
    isOccupiedByPeople: z.boolean(),
  }),

  locationInformation: z.object({
    id: z.string().optional(),
    location: z.string().optional(),
    nomenclature: z.string().optional(),
    tower: z.string().optional(),
    amountOfFloors: z.string().optional(),
    isClosedStreet: z.string().optional(),
    country: z.string(),
    state: z.string(),
    municipality: z.string().optional(),
    urbanization: z.string().optional(),
    avenue: z.string().optional(),
    city: z.string().optional(),
    street: z.string().optional(),
    buildingShoppingCenter: z.string().optional(),
    buildingNumber: z.string().optional(),
    floor: z.string().optional(),
    referencePoint: z.string().optional(),
    howToGet: z.string().optional(),
    trunkNumber: z.string().optional(),
    trunkLevel: z.string().optional(),
    parkingNumber: z.string().optional(),
    parkingLevel: z.string().optional(),
  }),

  documentsInformation: z.object({
    id: z.string().optional(),
    propertyDoc: z.boolean().optional(),
    CIorRIF: z.boolean().optional(),
    ownerCIorRIF: z.boolean().optional(),
    spouseCIorRIF: z.boolean().optional(),
    isCatastralRecordSameOwner: z.boolean(),
    condominiumSolvency: z.boolean(),
    mainProperty: z.boolean(),
    mortgageRelease: z.string().optional(),
    condominiumSolvencyDetails: z.string().optional(),
    power: z.string().optional(),
    successionDeclaration: z.string().optional(),
    courtRulings: z.string().optional(),
    catastralRecordYear: z.string().optional(),
    attorneyEmail: z.string().optional(),
    attorneyPhone: z.string().optional(),
    attorneyFirstName: z.string().optional(),
    attorneyLastName: z.string().optional(),
    realStateTax: z.string().optional(),
    owner: z.any().optional(),
  }),

  negotiationInformation: z.object({
    id: z.string().optional(),
    price: z.any(),
    minimumNegotiation: z.any().optional(),
    client: z.string().optional(),
    reasonToSellOrRent: z.string().optional(),
    realstateadvisername: z.string().optional(),
    externaladvisername: z.string().optional(),
    partOfPayment: z.string().optional(),
    operationType: z.string(),
    ally: z.any().optional(),
    allyname: z.string().optional(),
    propertyExclusivity: z.string(),
    realStateAdviser: z.any().optional(),
    additional_price: z.string().optional(),
    externalAdviser: z.any().optional(),
    sellCommission: z.string().optional(),
    rentCommission: z.string().optional(),
    ownerPaysCommission: z.string().optional(),
    mouthToMouth: z.boolean(),
    realStateGroups: z.boolean(),
    realStateWebPages: z.boolean(),
    socialMedia: z.boolean(),
    publicationOnBuilding: z.boolean(),
  }),
});

type Props = {
  currentProperty?: IPropertyItemCreateUpdate;
};

export function CreateUpdatePropertyForm({ currentProperty}: Props) {
  const defaultValues: PropertyFormSchemaType = {
    id: undefined,
    userId: 'TEST',
    images: [],
    documents: [],
    // documents: ['https://bucket.visioninmobiliaria.com.ve/images/1748585345043-z31n58s0h89.pdf'],
    // images: ['https://2.img-dpreview.com/files/p/E~C1000x0S4000x4000T1200x1200~articles/3925134721/0266554465.jpeg'],
    distributions: [],
    attributes: [],
    adjacencies: [],
    equipments: [],
    utilities: [],
    furnishedAreas: [],
    status: 'inactive',
    updatedby: { id: undefined, username: '', name: '', email: '' },
    createdby: { id: undefined, username: '', name: '', email: '' },
    changes: undefined,

    generalInformation: {
      id: undefined,
      code: '',
      publicationTitle: '',
      footageGround: '',
      footageBuilding: '',
      description: '',
      propertyType: '',
      zoning: '',
      propertyCondition: '',
      antiquity: '',
      amountOfFloors: '',
      typeOfWork: '',
      propertiesPerFloor: '',
      handoverKeys: false,
      termsAndConditionsAccepted: false,
      isFurnished: false,
      isOccupiedByPeople: false,
    },

    locationInformation: {
      id: undefined,
      location: '',
      nomenclature: '',
      tower: '',
      amountOfFloors: '',
      isClosedStreet: '',
      country: 'Venezuela',
      state: '',
      municipality: '',
      urbanization: '',
      avenue: '',
      city: '',
      street: '',
      buildingShoppingCenter: '',
      buildingNumber: '',
      floor: '',
      referencePoint: '',
      howToGet: '',
      trunkNumber: '',
      trunkLevel: '',
      parkingNumber: '',
      parkingLevel: '',
    },

    documentsInformation: {
      id: undefined,
      propertyDoc: false,
      CIorRIF: false,
      ownerCIorRIF: false,
      spouseCIorRIF: false,
      isCatastralRecordSameOwner: false,
      condominiumSolvency: false,
      mainProperty: false,
      mortgageRelease: '',
      condominiumSolvencyDetails: '',
      power: '',
      successionDeclaration: '',
      courtRulings: '',
      catastralRecordYear: '',
      attorneyEmail: '',
      attorneyPhone: '',
      attorneyFirstName: '',
      attorneyLastName: '',
      realStateTax: '',
      owner: '',
    },

    negotiationInformation: {
      id: undefined,
      price: '',
      minimumNegotiation: '',
      client: '',
      reasonToSellOrRent: '',
      realstateadvisername: '',
      externaladvisername: '',
      partOfPayment: '',
      operationType: '',
      ally: '',
      allyname: '',
      propertyExclusivity: '',
      realStateAdviser: '',
      additional_price: '',
      externalAdviser: '',
      sellCommission: '',
      rentCommission: '',
      ownerPaysCommission: '',
      mouthToMouth: false,
      realStateGroups: false,
      realStateWebPages: false,
      socialMedia: false,
      publicationOnBuilding: false,
    },
  };
  const { user } = useAuthContext();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { refresh } = useGetProperties();
  const { refresh: refreshCurrent } = useGetProperty(id as any);

  const shortUser = {
    id: user?.id,
    username: user?.username,
    name: user?.firstname + ' ' + user?.lastname,
    email: user?.email,
  };

  const openGeneralInfo = useBoolean(true);
  const openLocationInfo = useBoolean(false);
  const openNegotiationInfo = useBoolean(false);
  const openDocumentationInfo = useBoolean(false);
  const openSelectablesInfo = useBoolean(false);
  const locationRef = React.useRef<HTMLDivElement>(null);
  const selectablesRef = React.useRef<HTMLDivElement>(null);
  const negotiationRef = React.useRef<HTMLDivElement>(null);
  const documentationRef = React.useRef<HTMLDivElement>(null);

  const [attributesFetched, setAttributesFetched] = useState(false);
  const [equipmentsFetched, setEquipmentsFetched] = useState(false);
  const [utilitiesFetched, setUtilitiesFetched] = useState(false);
  const [adjacenciesFetched, setAdjacenciesFetched] = useState(false);
  const [distributionsFetched, setDistributionsFetched] = useState(false);

  const methods = useForm<PropertyFormSchemaType>({
    mode: 'all',
    resolver: zodResolver(PropertyFormSchema),
    defaultValues,
    values: currentProperty ? { ...currentProperty } : defaultValues,
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = methods;

  const { replace: attrReplace, fields: attrFields } = useFieldArray({
    control,
    name: 'attributes',
  });
  const { replace: distReplace, fields: distFields } = useFieldArray({
    control,
    name: 'distributions',
  });
  const { replace: equipReplace, fields: equipFields } = useFieldArray({
    control,
    name: 'equipments',
  });
  const { replace: utilsReplace, fields: utilsFields } = useFieldArray({
    control,
    name: 'utilities',
  });
  const { replace: adjaReplace, fields: adjaFields } = useFieldArray({
    control,
    name: 'adjacencies',
  });

  // Fetch attributes once when component mounts
  useEffect(() => {
    if (!attributesFetched) {
      fetchAttributes();
    }
    if (!distributionsFetched) {
      fetchDistributions();
    }
    if (!equipmentsFetched) {
      fetchEquipments();
    }
    if (!utilitiesFetched) {
      fetchUtilities();
    }
    if (!adjacenciesFetched) {
      fetchAdjacencies();
    }
  }, []);

  const fetchAttributes = async () => {
    try {
      const response = await axiosInstance.get('/attribute');
      await initializeAttributeFields(response.data);
      setAttributesFetched(true);
    } catch (error) {
      console.error('Error fetching attributes:', error);
    }
  };

  const fetchDistributions = async () => {
    try {
      const response = await axiosInstance.get('/distribution');
      await initializeDistributionFields(response.data);
      setDistributionsFetched(true);
    } catch (error) {
      console.error('Error fetching distributions:', error);
    }
  };

  const fetchEquipments = async () => {
    try {
      const response = await axiosInstance.get('/equipment');
      await initializeEquipmentsFields(response.data);
      setEquipmentsFetched(true);
    } catch (error) {
      console.error('Error fetching equipments:', error);
    }
  };

  const fetchUtilities = async () => {
    try {
      const response = await axiosInstance.get('/utility');
      await initializeUtilitiesFields(response.data);
      setUtilitiesFetched(true);
    } catch (error) {
      console.error('Error fetching utilities:', error);
    }
  };

  const fetchAdjacencies = async () => {
    try {
      const response = await axiosInstance.get('/adjacency');
      await initializeAdjacenciesFields(response.data);
      setAdjacenciesFetched(true);
    } catch (error) {
      console.error('Error fetching adjacencies:', error);
    }
  };

  const initializeAttributeFields = async (attributesData: Attribute[]) => {
    let attributeFields: AttributeFormField[] = [];

    if (currentProperty?.id) {
      console.log('Editing existing property:', currentProperty?.id);
      // Editing existing property - fetch current values
      try {
        const currentValues: any = currentProperty.attributes;
        console.log('Current values:', currentValues);

        // Create form fields from existing values
        attributeFields = attributesData.map((attr) => {
          const existingValue = currentValues.find((cv: any) => cv.attributeId === attr.id);
          return {
            attributeId: attr.id,
            value: existingValue?.value || (attr.formType === 'check' ? 'false' : ''),
            valueType: existingValue?.valueType || 'string',
            attribute: attr,
          };
        });
      } catch (valueError) {
        console.warn('Could not fetch existing values, using defaults:', valueError);
        // Fallback to default values if fetching existing values fails
        attributeFields = attributesData.map((attr) => ({
          attributeId: attr.id,
          value: attr.formType === 'check' ? 'false' : '',
          valueType: 'string' as const,
          attribute: attr,
        }));
      }
    } else {
      console.log('Creating new property');
      // New property - create default form fields
      attributeFields = attributesData.map((attr) => ({
        attributeId: attr.id,
        value: attr.formType === 'check' ? 'false' : '',
        valueType: 'string' as const,
        attribute: attr,
      }));
    }

    console.log('Prepared attribute fields:', attributeFields);

    // Only replace if we don't have fields yet or if this is the first initialization
    if (attrFields.length === 0 || !attributesFetched) {
      attrReplace(attributeFields);
    }
  };

  const initializeDistributionFields = async (distributionsData: Distribution[]) => {
    let distributionFields: DistributionFormField[] = [];

    if (currentProperty?.id) {
      console.log('Editing existing property:', currentProperty?.id);
      // Editing existing property - fetch current values
      try {
        const currentValues: any = currentProperty.distributions;
        console.log('Current values:', currentValues);

        // Create form fields from existing values
        distributionFields = distributionsData.map((dist) => {
          const existingValue = currentValues.find((cv: any) => cv.distributionId === dist.id);
          return {
            distributionId: dist.id,
            distribution: dist,
            additionalInformation: existingValue?.additionalInformation || '', // Add this
            value: existingValue ? 'true' : 'false',
            valueType: 'boolean', // Add this
          };
        });
      } catch (valueError) {
        console.warn('Could not fetch existing values, using defaults:', valueError);
        // Fallback to default values if fetching existing values fails
        distributionFields = distributionsData.map((dist) => ({
          distributionId: dist.id,
          distribution: dist,
          additionalInformation: '', // Add this
          value: 'false', // Add default value
          valueType: 'boolean', // Add this
        }));
      }
    } else {
      console.log('Creating new property');
      // New property - create default form fields
      distributionFields = distributionsData.map((dist) => ({
        distributionId: dist.id,
        additionalInformation: '', // Add this
        value: 'false', // Add default value
        distribution: dist,
        valueType: 'boolean', // Add this
      }));
    }

    console.log('Prepared distribution fields:', distributionFields);

    // Only replace if we don't have fields yet or if this is the first initialization
    if (distFields.length === 0 || !distributionsFetched) {
      distReplace(distributionFields);
    }
  };

  const initializeEquipmentsFields = async (equipmentsData: Distribution[]) => {
    let equipmentFields: EquipmentFormField[] = [];

    if (currentProperty?.id) {
      console.log('Editing existing property:', currentProperty?.id);
      // Editing existing property - fetch current values
      try {
        const currentValues: any = currentProperty.equipments;
        console.log('Current values:', currentValues);

        // Create form fields from existing values
        equipmentFields = equipmentsData.map((equip) => {
          const existingValue = currentValues.find((cv: any) => cv.equipmentId === equip.id);
          return {
            equipmentId: equip.id,
            equipment: equip,
            additionalInformation: existingValue?.additionalInformation || '', // Add this
            brand: existingValue?.brand || '', // Add this
            value: existingValue ? 'true' : 'false',
            valueType: 'boolean', // Add this
          };
        });
      } catch (valueError) {
        console.warn('Could not fetch existing values, using defaults:', valueError);
        // Fallback to default values if fetching existing values fails
        equipmentFields = equipmentsData.map((equip) => ({
          equipmentId: equip.id,
          equipment: equip,
          additionalInformation: '', // Add this
          brand: '', // Add this
          value: 'false', // Add default value
          valueType: 'boolean', // Add this
        }));
      }
    } else {
      console.log('Creating new property');
      // New property - create default form fields
      equipmentFields = equipmentsData.map((equip) => ({
        equipmentId: equip.id,
        equipment: equip,
        additionalInformation: '', // Add this
        brand: '', // Add this
        value: 'false', // Add default value
        valueType: 'boolean', // Add this
      }));
    }

    console.log('Prepared equipments fields:', equipmentFields);

    // Only replace if we don't have fields yet or if this is the first initialization
    if (equipFields.length === 0 || !equipmentsFetched) {
      equipReplace(equipmentFields);
    }
  };

  const initializeUtilitiesFields = async (utilitiesData: Utility[]) => {
    let utilitiesFields: UtilityFormField[] = [];

    if (currentProperty?.id) {
      console.log('Editing existing property:', currentProperty?.id);
      // Editing existing property - fetch current values
      try {
        const currentValues: any = currentProperty.utilities;
        console.log('Current values:', currentValues);

        // Create form fields from existing values
        utilitiesFields = utilitiesData.map((util) => {
          const existingValue = currentValues.find((cv: any) => cv.utilityId === util.id);
          return {
            utilityId: util.id,
            utility: util,
            additionalInformation: existingValue?.additionalInformation || '', // Add this
            value: existingValue ? 'true' : 'false',
            valueType: 'boolean', // Add this
          };
        });
      } catch (valueError) {
        console.warn('Could not fetch existing values, using defaults:', valueError);
        // Fallback to default values if fetching existing values fails
        utilitiesFields = utilitiesData.map((util) => ({
          utilityId: util.id,
          utility: util,
          additionalInformation: '', // Add this
          value: 'false', // Add default value
          valueType: 'boolean', // Add this
        }));
      }
    } else {
      console.log('Creating new property');
      // New property - create default form fields
      utilitiesFields = utilitiesData.map((util) => ({
        utilityId: util.id,
        utility: util,
        additionalInformation: '', // Add this
        value: 'false', // Add default value
        valueType: 'boolean', // Add this
      }));
    }

    console.log('Prepared utilitiess fields:', utilitiesFields);

    // Only replace if we don't have fields yet or if this is the first initialization
    if (utilsFields.length === 0 || !utilitiesFetched) {
      utilsReplace(utilitiesFields);
    }
  };

  const initializeAdjacenciesFields = async (adjacenciesData: Adjacency[]) => {
    let adjacenciesFields: AdjacencyFormField[] = [];

    if (currentProperty?.id) {
      console.log('Editing existing property:', currentProperty?.id);
      // Editing existing property - fetch current values
      try {
        const currentValues: any = currentProperty.adjacencies;
        console.log('Current values:', currentValues);

        // Create form fields from existing values
        adjacenciesFields = adjacenciesData.map((adjacency) => {
          const existingValue = currentValues.find((cv: any) => cv.adjacencyId === adjacency.id);
          return {
            adjacencyId: adjacency.id,
            adjacency,
            value: existingValue ? 'true' : 'false',
            valueType: 'boolean', // Add this
          };
        });
      } catch (valueError) {
        console.warn('Could not fetch existing values, using defaults:', valueError);
        // Fallback to default values if fetching existing values fails
        adjacenciesFields = adjacenciesData.map((util) => ({
          adjacencyId: util.id,
          adjacency: util,
          value: 'false', // Add default value
          valueType: 'boolean', // Add this
        }));
      }
    } else {
      console.log('Creating new property');
      // New property - create default form fields
      adjacenciesFields = adjacenciesData.map((util) => ({
        adjacencyId: util.id,
        adjacency: util,
        value: 'false', // Add default value
        valueType: 'boolean', // Add this
      }));
    }

    console.log('Prepared adjacencies fields:', adjacenciesFields);

    // Only replace if we don't have fields yet or if this is the first initialization
    if (adjaFields.length === 0 || !adjacenciesFetched) {
      adjaReplace(adjacenciesFields);
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    console.log('Submitting property:', values);

    const data = {
      ...values,
      negotiationInformation: {
        ...values.negotiationInformation,
        price: parseCurrency(values.negotiationInformation.price),
        minimumNegotiation: parseCurrency(values.negotiationInformation.minimumNegotiation),
      }
    };

    const promise = await (async () => {
      let response: AxiosResponse<any>;
      if (currentProperty?.id) {
        // const changes = getChangedFields(data, currentProperty);
        //
        // if (Object.keys(changes).length === 0) {
        //   console.log('No changes made.');
        //   return 'No se detectaron cambios en el registro.';
        // }
        response = await createUpdateProperty({ ...data, updatedby: shortUser }, 'update', currentProperty.id);
      } else {
        response = await createUpdateProperty({
          ...data,
          userId: user.id.toString(),
          createdby: shortUser,
          negotiationInformation: {
            ...data.negotiationInformation,
            realStateAdviser: user.role === 'ASESOR_INMOBILIARIO' ? user.id.toString() : data.negotiationInformation.realStateAdviser,
            realstateadvisername: user.role === 'ASESOR_INMOBILIARIO' ? user.firstname + ' ' + user.lastname : data.negotiationInformation.realstateadvisername,
          }
        }, 'create');
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
      refresh();
      refreshCurrent();
      router.push('/dashboard/properties');
    } catch (error) {
      console.error(error);
    }
  });

  const renderCollapseButton = (value: boolean, onToggle: () => void) => (
    <IconButton onClick={onToggle}>
      <Iconify icon={value ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'} />
    </IconButton>
  );

  function onPressNext(currentCollapseKey: string) {
    const collapseMap: any = {
      general: { close: openGeneralInfo.onFalse, open: openLocationInfo.onTrue, ref: locationRef },
      location: {
        close: openLocationInfo.onFalse,
        open: openSelectablesInfo.onTrue,
        ref: selectablesRef,
      },
      selectables: {
        close: openSelectablesInfo.onFalse,
        open: openNegotiationInfo.onTrue,
        ref: negotiationRef,
      },
      negotiation: {
        close: openNegotiationInfo.onFalse,
        open: openDocumentationInfo.onTrue,
        ref: documentationRef,
      },
      documentation: { close: openDocumentationInfo.onFalse, open: null, ref: null },
    };

    // Close current collapse
    collapseMap[currentCollapseKey].close();

    // Open next collapse if exists
    if (collapseMap[currentCollapseKey].open) {
      collapseMap[currentCollapseKey].open();

      // Scroll to next section
      if (collapseMap[currentCollapseKey].ref?.current) {
        setTimeout(() => {
          // Scroll to element with offset for better visibility
          const yOffset =
            currentCollapseKey === 'general'
              ? -900
              : currentCollapseKey === 'location'
                ? -800
                : -500; // 20px gap from the top
          const element = collapseMap[currentCollapseKey].ref.current;
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

          window.scrollTo({
            top: y,
            behavior: 'smooth',
          });
          // collapseMap[currentCollapseKey].ref.current.scrollIntoView({
          //   behavior: 'smooth',
          //   block: 'start',
          // });
        }, 100); // Small timeout to ensure collapse animation has started
      }
    }
  }

  return (
    <FormProvider {...methods}>
      <Form methods={methods} onSubmit={onSubmit}>
        <Stack spacing={{ xs: 3, md: 5 }} sx={{ mx: 'auto' }}>
          <GeneralInformationForm
            onCollapseToggle={openGeneralInfo.onToggle}
            collapseValue={openGeneralInfo.value}
            renderCollapseButton={renderCollapseButton}
            onPressNext={() => onPressNext('general')}
          />
          <LocationInformationForm
            ref={locationRef}
            onCollapseToggle={openLocationInfo.onToggle}
            collapseValue={openLocationInfo.value}
            renderCollapseButton={renderCollapseButton}
            onPressNext={() => onPressNext('location')}
          />
          <AttributesEquipmentUtilitiesServicesDistributionForm
            ref={selectablesRef}
            onCollapseToggle={openSelectablesInfo.onToggle}
            collapseValue={openSelectablesInfo.value}
            renderCollapseButton={renderCollapseButton}
            onPressNext={() => onPressNext('selectables')}
          />

          <NegotiationInformationForm
            ref={negotiationRef}
            onCollapseToggle={openNegotiationInfo.onToggle}
            collapseValue={openNegotiationInfo.value}
            renderCollapseButton={renderCollapseButton}
            onPressNext={() => onPressNext('negotiation')}
          />
          <DocumentationInformationForm
            ref={documentationRef}
            onCollapseToggle={openDocumentationInfo.onToggle}
            collapseValue={openDocumentationInfo.value}
            renderCollapseButton={renderCollapseButton}
            onPressNext={() => onPressNext('documentation')}
          />

          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={isSubmitting}
              startIcon={isSubmitting && <Iconify icon="mdi:loading" className="animate-spin" />}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </Stack>
        </Stack>
      </Form>
    </FormProvider>
  );
}
