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

import { Field } from '../../../components/hook-form';
import Typography from '@mui/material/Typography';

type Props = {
  collapseValue: boolean;
  onCollapseToggle: () => void;
  onPressNext: () => void;
  renderCollapseButton: (collapseValue: boolean, onCollapseToggle: () => void) => React.ReactNode;
}

const NegotiationInformationForm = React.forwardRef<HTMLDivElement, Props>(({
                                                                           collapseValue,
                                                                           onCollapseToggle,
                                                                           renderCollapseButton,
                                                                           onPressNext
                                                                         }: Props, ref) => (
    <Card ref={ref}>
      <CardHeader
        title="Negociacion de inmueble"
        subheader="Precio, asesor, condiciones de pago, etc."
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

            <Field.Currency size="medium" name="negotiationInformation.price" label="Precio" />
            <Field.Text name="negotiationInformation.partOfPayment" label="Recibe como parte de pago" />
            <Field.Currency size="medium" name="negotiationInformation.minimumNegotiation" label="Negociacion minima" />
            <Field.Text name="negotiationInformation.reasonToSellOrRent" label="Motivo de operacion" />

            <Field.Select name="negotiationInformation.realStateAdviser" label="Tipo de obra">
              <MenuItem value="No aplica">No aplica</MenuItem>
              <MenuItem value="Obra gris">Obra gris</MenuItem>
              <MenuItem value="Obra blanca">Obra blanca</MenuItem>
            </Field.Select>

            <Field.Text name="negotiationInformation.ally" label="Aliado (Opcional)" />

            <Field.Select name="negotiationInformation.operationType" label="Tipo de operacion">
              <MenuItem value="Venta">Venta</MenuItem>
              <MenuItem value="Alquiler">Alquiler</MenuItem>
              <MenuItem value="Venta y Alquiler">Venta y Alquiler</MenuItem>
              <MenuItem value="Traspaso">Traspaso</MenuItem>
            </Field.Select>

            <Field.Currency size="medium" name="negotiationInformation.additional_price" label="Precio de alquiler" />

            <Field.Select name="negotiationInformation.propertyExclusivity" label="Exclusividad">
              <MenuItem value="No Aplica">No Aplica</MenuItem>
              <MenuItem value="30 dias">30 dias</MenuItem>
              <MenuItem value="45 dias">45 dias</MenuItem>
              <MenuItem value="60 dias">60 dias</MenuItem>
            </Field.Select>

            <Field.Select name="negotiationInformation.ownerPaysCommission" label="¿Propietario paga comision?">
              <MenuItem value="Si">Si</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </Field.Select>

            <Field.Text name="negotiationInformation.sellCommission" label="Comision de venta" />
            <Field.Text name="negotiationInformation.rentCommission" label="Comision de alquiler" />

            <Field.Select name="negotiationInformation.externalAdviser" label="Captacion asesor externo">
              <MenuItem value="Si">Si</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </Field.Select>

            <Box sx={{ gridColumn: '1 / -1' }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>El propietario autoriza publicar en:</Typography>
              <Field.Checkbox  name="negotiationInformation.socialMedia" label="Redes sociales" />
              <Field.Checkbox  name="negotiationInformation.realStateWebPages" label="Paginas de inmuebles" />
              <Field.Checkbox  name="negotiationInformation.realStateGroups" label="Grupos inmobiliarios" />
              <Field.Checkbox  name="negotiationInformation.mouthToMouth" label="Boca a boca" />
              <Field.Checkbox  name="negotiationInformation.publicationOnBuilding" label="Aviso en fachada" />

            </Box>
          </Box>
          <Stack direction="row" justifyContent="flex-end" onClick={onPressNext}>
            <Button type="button" variant="contained" color="primary">Siguiente</Button>
          </Stack>
        </Stack>
      </Collapse>
    </Card>
  ))

export default NegotiationInformationForm;
