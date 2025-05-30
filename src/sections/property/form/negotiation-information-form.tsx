'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import CardHeader from '@mui/material/CardHeader';

import { Field } from '../../../components/hook-form';

type Props = {
  collapseValue: boolean;
  onCollapseToggle: () => void;
  onPressNext: () => void;
  renderCollapseButton: (collapseValue: boolean, onCollapseToggle: () => void) => React.ReactNode;
}

const NegotiationInformationForm = React.forwardRef<HTMLDivElement, Props>(({
                                                                           collapseValue,
                                                                           onCollapseToggle,
                                                                           renderCollapseButton
                                                                         }: Props, ref) => {
  return (
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
              gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' },
            }}
          >
            <Field.Text name="code" label="Product code" />

            <Field.Text name="sku" label="Product SKU" />
          </Box>
        </Stack>
      </Collapse>
    </Card>
  );
})

export default NegotiationInformationForm;
