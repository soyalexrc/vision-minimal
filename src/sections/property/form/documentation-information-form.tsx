'use client';

import React from 'react';

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

type Props = {
  collapseValue: boolean;
  onCollapseToggle: () => void;
  onPressNext: () => void;
  renderCollapseButton: (collapseValue: boolean, onCollapseToggle: () => void) => React.ReactNode;
}

const DocumentationInformationForm = React.forwardRef<HTMLDivElement, Props>(({
                                                                   collapseValue,
                                                                   onCollapseToggle,
                                                                   renderCollapseButton,
                                                                   onPressNext
                                                                 }: Props, ref) => (
    <Card ref={ref}>
      <CardHeader
        title="Documentacion de inmueble"
        subheader="Documentos legales, permisos, escrituras, etc."
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
              gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
            }}
          >
            {/*<Field.Text sx={{ gridColumn: '1 / -1' }} name="generalInformation.publicationTitle" label="Titulo" helperText="Este es el titulo que se mostrara en la URL y en las busquedas de google." />*/}
            {/*<Field.Text sx={{ gridColumn: '1 / -1' }} name="generalInformation.description" label="Descripcion" multiline minRows={4} helperText="Esta descripcion se mostrara en las busquedas de google." />*/}

            <Field.Select name="documentsInformation.owner" label="Propietario">
              <MenuItem value="No aplica">No aplica</MenuItem>
              <MenuItem value="Obra gris">Obra gris</MenuItem>
              <MenuItem value="Obra blanca">Obra blanca</MenuItem>
            </Field.Select>

            <Box sx={{ gridColumn: '1 / -1' }}>
              <Typography variant="h5">Datos de apoderado</Typography>.
            </Box>

            <Field.Text name="documentsInformation.attorneyFirstName" label="Nombre de apoderado" />
            <Field.Text name="documentsInformation.attorneyLastName" label="Apellido de apoderado" />
            <Field.Text name="documentsInformation.attorneyPhone" label="Telefono de apoderado" />
            <Field.Text name="documentsInformation.attorneyEmail" label="Correo electronico de apoderado" />

            <Divider />

            <Box sx={{ gridColumn: '1 / -1' }}>
              <Field.Checkbox  name="documentsInformation.propertyDoc" label="Documento de propiedad" />
              <Field.Checkbox  name="documentsInformation.ownerCIorRIF" label="C.I / RIF propietario" />
              <Field.Checkbox  name="documentsInformation.spouseCIorRIF" label="C.I / RIF Conyuge" />
              <Field.Checkbox  name="documentsInformation.CIorRIF" label="C.I / RIF Apoderado" />
            </Box>



            <Field.Select name="documentsInformation.power" label="Poder">
              <MenuItem value="N/A">N/A</MenuItem>
              <MenuItem value="Por tramitar">Por tramitar</MenuItem>
              <MenuItem value="Notariado">Notariado</MenuItem>
              <MenuItem value="Registrado">Registrado</MenuItem>
            </Field.Select>

            <Field.Select name="documentsInformation.mortgageRelease" label="Liberacion de hipoteca">
              <MenuItem value="N/A">N/A</MenuItem>
              <MenuItem value="Por tramitar">Por tramitar</MenuItem>
              <MenuItem value="Registrado">Registrado</MenuItem>
              <MenuItem value="Solo finiquito">Solo finiquito</MenuItem>
            </Field.Select>

            <Field.Select name="documentsInformation.successionDeclaration" label="Declaracion sucesoral">
              <MenuItem value="N/A">N/A</MenuItem>
              <MenuItem value="Por tramitar">Por tramitar</MenuItem>
              <MenuItem value="Declaracion">Declaracion</MenuItem>
              <MenuItem value="Solvencia">Solvencia</MenuItem>
              <MenuItem value="RIF">RIF</MenuItem>
            </Field.Select>

            <Field.Select name="documentsInformation.courtRulings" label="Sentencias tribunales">
              <MenuItem value="N/A">N/A</MenuItem>
              <MenuItem value="Por tramitar">Por tramitar</MenuItem>
              <MenuItem value="Registradas">Registradas</MenuItem>
            </Field.Select>

            <Box sx={{ gridColumn: '1 / -1' }}>
              <Typography variant="h5">Datos de la propiedad</Typography>.
            </Box>


            <Field.Text name="documentsInformation.cadastralRecordYear" label="Comision de venta" />
            <Field.Text name="documentsInformation.realStateTax" label="Impuesto inmobiliario" />
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Field.Checkbox  name="documentsInformation.isCadastralRecordSameOwner" label="A nombre de propietario" />
              <Field.Checkbox  name="documentsInformation.mainProperty" label="Vivienda principal" />
            </Box>

            <Box sx={{ gridColumn: '1 / -1' }}>
              <Typography variant="h5">Carga de documentos</Typography>.
            </Box>

          </Box>
          <Stack direction="row" justifyContent="flex-end" onClick={onPressNext}>
            <Button type="button" variant="contained" color="primary">Siguiente</Button>
          </Stack>
        </Stack>
      </Collapse>
    </Card>
  ))

export default DocumentationInformationForm;
