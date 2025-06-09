'use client';

import { useFormContext } from 'react-hook-form';
import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import MenuItem from '@mui/material/MenuItem';
import CardHeader from '@mui/material/CardHeader';

import { Field } from '../../../components/hook-form';
import { LOCATIONS, LOCATIONS_DETAIL } from '../../../assets/data';

type Props = {
  collapseValue: boolean;
  onCollapseToggle: () => void;
  onPressNext: () => void;
  renderCollapseButton: (collapseValue: boolean, onCollapseToggle: () => void) => React.ReactNode;
};

const LocationInformationForm = React.forwardRef<HTMLDivElement, Props>(
  ({ collapseValue, onCollapseToggle, onPressNext, renderCollapseButton }: Props, ref) => {
    const { watch } = useFormContext();

    const watchedState = watch('locationInformation.state');

    useEffect(() => {
      setMunicipalities(
        watchedState === 'Cojedes'
          ? LOCATIONS_DETAIL.cojedes
          : watchedState === 'Carabobo'
            ? LOCATIONS_DETAIL.carabobo
            : []
      );
    }, [watchedState]);

    const [municipalities, setMunicipalities] = useState<string[]>([]);

    return (
      <Card ref={ref}>
        <CardHeader
          title="Ubicacion de inmueble"
          subheader="Direccion, Ciudad, municipio, parroquia, etc."
          action={renderCollapseButton(collapseValue, onCollapseToggle)}
          sx={{ mb: 3 }}
        />

        <Collapse in={collapseValue}>
          <Divider />

          <Stack spacing={3} sx={{ p: 3 }}>
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
              <Field.CountrySelect name="locationInformation.country" label="Pais" />

              <Field.Select name="locationInformation.state" label="Estado">
                {LOCATIONS.map((location) => (
                  <MenuItem key={location} value={location}>
                    {location}
                  </MenuItem>
                ))}
              </Field.Select>

              <Field.Select name="locationInformation.municipality" label="Municipio">
                {municipalities.map((municipality) => (
                  <MenuItem key={municipality} value={municipality}>
                    {municipality}
                  </MenuItem>
                ))}
              </Field.Select>

              <Field.Text name="locationInformation.urbanization" label="Urbanización / Sector" />
              <Field.Text name="locationInformation.avenue" label="Avenida" />
              <Field.Text name="locationInformation.street" label="Calle" />
              <Field.Text
                name="locationInformation.location"
                label="Nombre de Residencia / Centro Comercial / Edificio / Complejo"
              />
              <Field.Text name="locationInformation.referencePoint" label="Punto de referencia" />

              <Field.Select name="locationInformation.isClosedStreet" label="Es calle cerrada">
                <MenuItem value="Si">Si</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </Field.Select>

              <Field.Text name="locationInformation.tower" label="Torre" />
              <Field.Text name="locationInformation.floor" label="Nro. de piso" />
              <Field.Text
                name="locationInformation.nomenclature"
                label="Nomenclatura de propiedad"
              />
              <Field.Text name="locationInformation.howToGet" label="Especificar como llegar" />
              <Field.Text
                name="locationInformation.parkingNumber"
                label="Numero de estacionamiento"
              />
              <Field.Text
                name="locationInformation.parkingLevel"
                label="Nivel de estacionamiento"
              />
              <Field.Text name="locationInformation.trunkNumber" label="Numero de maletero" />
              <Field.Text name="locationInformation.trunkLevel" label="Numero de maletero" />
            </Box>
            <Stack direction="row" justifyContent="flex-end" onClick={onPressNext}>
              <Button type="button" variant="contained" color="primary">
                Siguiente
              </Button>
            </Stack>
          </Stack>
        </Collapse>
      </Card>
    );
  }
);

export default LocationInformationForm;
