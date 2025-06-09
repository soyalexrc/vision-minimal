'use client';

import React, { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import MenuItem from '@mui/material/MenuItem';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import { Field } from '../../../components/hook-form';
import { useGetCategories } from '../../../actions/category';

type Props = {
  collapseValue: boolean;
  onCollapseToggle: () => void;
  renderCollapseButton: (collapseValue: boolean, onCollapseToggle: () => void) => React.ReactNode;
  onPressNext: () => void;
}


export default function GeneralInformationForm({collapseValue, onCollapseToggle, renderCollapseButton, onPressNext}: Props) {
  const { watch, setValue } = useFormContext();
  const { categories } = useGetCategories()

  const watchedImages = watch('images')

  const handleRemoveFile = useCallback(
    (inputFile: File | string) => {
      const filtered = watchedImages && watchedImages?.filter((file: any) => file !== inputFile);
      setValue('images', filtered);
    },
    [setValue, watchedImages]
  );

  const handleRemoveAllFiles = useCallback(() => {
    setValue('images', [], { shouldValidate: true });
  }, [setValue]);

  return (
    <Card>
      <CardHeader
        title="Informacion General"
        subheader="Titulo de publicacion, descricion, mt2, imagenes, etc."
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
              gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            }}
          >
            <Field.Text sx={{ gridColumn: '1 / -1' }} name="generalInformation.publicationTitle" label="Titulo" helperText="Este es el titulo que se mostrara en la URL y en las busquedas de google." />
            <Field.Text sx={{ gridColumn: '1 / -1' }} name="generalInformation.description" label="Descripcion" multiline minRows={4} helperText="Esta descripcion se mostrara en las busquedas de google." />

            <Field.Select name="generalInformation.propertyType" label="Tipo de propiedad">
              {
                categories?.map(c => (
                  <MenuItem key={c.id} value={c.title}>
                    {c.title}
                  </MenuItem>
                ))
              }
            </Field.Select>

            <Field.Select name="generalInformation.propertyCondition" label="Tipo de mercado">
                  <MenuItem value="No aplica">No aplica</MenuItem>
                  <MenuItem value="Mercado primario">Mercado primario</MenuItem>
                  <MenuItem value="Mercado secundario">Mercado secundario</MenuItem>
            </Field.Select>

            <Field.Text name="generalInformation.footageGround" label="Metraje de terreno" />
            <Field.Text name="generalInformation.footageBuilding" label="Metraje de footageGround" />
            <Field.Text name="generalInformation.antiquity" label="Antiguedad" />
            <Field.Text name="generalInformation.zoning" label="Zonificacion" />
            <Field.Text name="generalInformation.amountOfFloors" label="Cantidad de pisos" />
            <Field.Text name="generalInformation.propertiesPerFloor" label="Propiedades por piso" />
            <Field.Select name="generalInformation.typeOfWork" label="Tipo de obra">
              <MenuItem value="No aplica">No aplica</MenuItem>
              <MenuItem value="Obra gris">Obra gris</MenuItem>
              <MenuItem value="Obra blanca">Obra blanca</MenuItem>
            </Field.Select>
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Field.Checkbox  name="generalInformation.handoverKeys" label="El propietario nos facilitó un juego de llaves" />
            </Box>
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Field.Checkbox name="generalInformation.termsAndConditionsAccepted" label="El propietario aceptó los términos y condiciones de trabajo mediante la ficha técnica" />
            </Box>
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Field.Checkbox name="generalInformation.isOccupiedByPeople" label="La propiedad está ocupada por personas" />
            </Box>
            <Box sx={{ gridColumn: '1 / -1' }} >
              <Typography variant="h5" mb={2}>Cargar imagenes</Typography>
              <Field.Upload
                multiple
                thumbnail
                name="images"
                accept={{ 'image/*': [] }}
                maxSize={1073741824}
                onRemove={handleRemoveFile}
                onRemoveAll={handleRemoveAllFiles}
              />
            </Box>
          </Box>
          <Stack direction="row" justifyContent="flex-end" onClick={onPressNext}>
            <Button type="button" variant="contained" color="primary">Siguiente</Button>
          </Stack>
        </Stack>
      </Collapse>
    </Card>
  )
}
