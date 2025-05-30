'use client';

import React, { useMemo, useState } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import Typography from '@mui/material/Typography';
import {
  Box,
  Grid,
  Checkbox,
  TextField,
  InputAdornment,
  FormControlLabel,
} from '@mui/material';

import { Iconify } from '../../../components/iconify';

import type { EquipmentFormField } from '../../../types/property';

const EquipmentsTab = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { control, setValue, watch } = useFormContext();

  // Use useFieldArray to manage the attributes array
  const { fields } = useFieldArray({
    control,
    name: 'equipments', // This will be the field name in your main form
  });

  // Filter attributes based on search term
  const filteredFields = useMemo(() => {
    if (!searchTerm.trim()) return fields;

    return fields.filter((field) => {
      const distributionField = field as EquipmentFormField;
      return distributionField.equipment.title.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [fields, searchTerm]);


  // Render different form inputs based on attribute type
  const renderEquipmentInput = (field: EquipmentFormField, index: number, originalIndex: number) => {
    const { equipment } = field;
    const fieldName = `equipments.${originalIndex}.value` as const;
    const additionalInfoFieldName = `equipments.${originalIndex}.additionalInformation` as const;
    const brandFieldName = `equipments.${originalIndex}.brand` as const;

    // Watch the checkbox value to show/hide additional info field
    const isChecked = watch(fieldName) === 'true';


    // console.log('Rendering attribute input:', attribute.label, 'Type:', attribute.formType);

    return (
      <Box>
        <Controller
          name={fieldName}
          control={control}
          render={({ field: inputField }) => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={inputField.value === 'true' || inputField.value === true}
                  onChange={(e) => {
                    const newValue = e.target.checked ? 'true' : 'false';
                    inputField.onChange(newValue);
                    setValue(`distributions.${originalIndex}.valueType`, 'boolean');
                  }}
                />
              }
              label={equipment.title}
            />
          )}
        />

        {/* Conditional Additional Information Field */}
        {isChecked && (
          <>
            <Controller
              name={brandFieldName}
              control={control}
              render={({ field: textField }) => (
                <TextField
                  {...textField}
                  placeholder="Marca (Opcional)"
                  fullWidth
                  size="small"
                  variant="outlined"
                  sx={{ mt: 1 }}
                />
              )}
            />
            <Controller
              name={additionalInfoFieldName}
              control={control}
              render={({ field: textField }) => (
                <TextField
                  {...textField}
                  placeholder="Información adicional (Opcional)"
                  fullWidth
                  size="small"
                  variant="outlined"
                  sx={{ mt: 1 }}
                  multiline
                  rows={2}
                />
              )}
            />
          </>
        )}
      </Box>
    );
  };



  if (!fields || fields.length === 0) {
    return (
      <div>
        <p>No equipments to display</p>
        <p>Available equipments: {fields.length}</p>
      </div>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar en opciones de equipos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" />
              </InputAdornment>
            ),
          }}
          variant="outlined"
          size="small"
        />
      </Box>

      <Typography variant="body2" mb={2} fontWeight="bold">Equipos encontrados: {filteredFields.length} de {fields.length}</Typography>

      <Grid container spacing={1}>
        {filteredFields.map((field) => {
          const equipmentField = field as EquipmentFormField;
          // Find the original index in the unfiltered array
          const originalIndex = fields.findIndex(f => f.id === field.id);

          return (
            <Grid
              item
              size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
              key={field.id || `equip-${originalIndex}`}
            >
              {/* Hidden fields to maintain the structure */}
              <Controller
                name={`equipments.${originalIndex}.equipmentId`}
                control={control}
                render={() => <input type="hidden" />}
              />

              <Controller
                name={`equipments.${originalIndex}.valueType`}
                control={control}
                render={() => <input type="hidden" />}
              />

              {/*In your Grid render section, add this hidden field:*/}
              <Controller
                name={`equipments.${originalIndex}.additionalInformation`}
                control={control}
                render={() => <input type="hidden" />}
              />

              <Controller
                name={`equipments.${originalIndex}.brand`}
                control={control}
                render={() => <input type="hidden" />}
              />

              {/* Render the actual input */}
              {renderEquipmentInput(equipmentField, originalIndex, originalIndex)}
            </Grid>
          );
        })}
      </Grid>

      {/* Show message when no results found */}
      {searchTerm && filteredFields.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
          No distribution found matching &#34;{searchTerm}&#34;
        </Box>
      )}
    </Box>
  );
};

export default EquipmentsTab;
