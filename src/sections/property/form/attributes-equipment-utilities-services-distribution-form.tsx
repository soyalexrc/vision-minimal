'use client';

import React, { useState } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import CardHeader from '@mui/material/CardHeader';

import AttributesTab from './attributes-tab';
import { useParams } from '../../../routes/hooks';

import type { Attribute } from '../../../types/property';

type Props = {
  collapseValue: boolean;
  onCollapseToggle: () => void;
  onPressNext: () => void;
  renderCollapseButton: (collapseValue: boolean, onCollapseToggle: () => void) => React.ReactNode;
};

const TABS_OPTIONS = [
  { value: 'attributes', label: 'Atributos' },
  { value: 'distribution', label: 'Distribucion' },
  { value: 'equipment', label: 'Equipos' },
  { value: 'utilities', label: 'Servicios' },
  { value: 'adjacencies', label: 'Adjacencias' },
];

const AttributesEquipmentUtilitiesDistributionAdjacenciesForm = React.forwardRef<
  HTMLDivElement,
  Props
>(({ collapseValue, onCollapseToggle, onPressNext, renderCollapseButton }: Props, ref) => {
  const [currentTab, setCurrentTab] = useState<string>('attributes');

  const { id } = useParams<{ id?: string }>();

  const renderTabContent = () => {
    switch (currentTab) {
      case 'attributes':
        return (
          <AttributesTab />
        );
      case 'distribution':
        return <div>Distribution content here</div>;
      case 'equipment':
        return <div>Equipment content here</div>;
      case 'utilities':
        return <div>Utilities content here</div>;
      case 'adjacencies':
        return <div>Adjacencies content here</div>;
      default:
        return null;
    }
  };

  return (
    <Card ref={ref}>
      <CardHeader
        title="Attributos - Distribucion - Equipos - Servicios - Adjacencias  de inmueble"
        subheader="Selecciona los atributos del inmueble, como tipo de propiedad, habitaciones, baños, equipos, servicios y adjacencias disponibles."
        action={renderCollapseButton(collapseValue, onCollapseToggle)}
        sx={{ mb: 3 }}
      />

      <Collapse in={collapseValue}>
        <Divider />

        <Stack spacing={3} sx={{ p: 3 }}>
          <Tabs
            value={currentTab}
            onChange={(_, newValue) => setCurrentTab(newValue)}
            sx={[
              (theme) => ({
                boxShadow: `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
              }),
            ]}
          >
            {TABS_OPTIONS.map((tab) => (
              <Tab key={tab.value} value={tab.value} label={tab.label} />
            ))}
          </Tabs>

          {renderTabContent()}

          <Stack direction="row" justifyContent="flex-end" onClick={onPressNext}>
            <Button type="button" variant="contained" color="primary">
              Siguiente
            </Button>
          </Stack>
        </Stack>
      </Collapse>
    </Card>
  );
});

export default AttributesEquipmentUtilitiesDistributionAdjacenciesForm;
