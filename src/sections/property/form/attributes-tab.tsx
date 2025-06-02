'use client';

import React, { useMemo, useState } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import Typography from '@mui/material/Typography';
import {
  Box,
  Grid,
  Radio,
  Select,
  Checkbox,
  MenuItem,
  TextField,
  InputLabel,
  RadioGroup,
  FormControl,
  InputAdornment,
  FormControlLabel,
} from '@mui/material';

import { Iconify } from '../../../components/iconify';

import type { AttributeFormField } from '../../../types/property';

const AttributesTab = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { control, setValue } = useFormContext();

  // Use useFieldArray to manage the attributes array
  const { fields } = useFieldArray({
    control,
    name: 'attributes', // This will be the field name in your main form
  });

  // Filter attributes based on search term
  const filteredFields = useMemo(() => {
    if (!searchTerm.trim()) return fields;

    return fields.filter((field) => {
      const attributeField = field as unknown as AttributeFormField;
      return attributeField.attribute.label.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [fields, searchTerm]);


  // Render different form inputs based on attribute type
  const renderAttributeInput = (field: AttributeFormField, index: number, originalIndex: number) => {
    const { attribute } = field;
    const fieldName = `attributes.${originalIndex}.value` as const;

    // console.log('Rendering attribute input:', attribute.label, 'Type:', attribute.formType);

    switch (attribute.formType) {
      case 'text':
        return (
          <Controller
            name={fieldName}
            control={control}
            render={({ field: inputField }) => (
              <TextField
                {...inputField}
                label={attribute.label}
                placeholder={attribute.placeholder}
                fullWidth
                variant="outlined"
                onChange={(e) => {
                  inputField.onChange(e.target.value);
                  setValue(`attributes.${originalIndex}.valueType`, 'string');
                }}
              />
            )}
          />
        );

      case 'number':
        return (
          <Controller
            name={fieldName}
            control={control}
            render={({ field: inputField }) => (
              <TextField
                {...inputField}
                type="number"
                label={attribute.label}
                placeholder={attribute.placeholder}
                fullWidth
                variant="outlined"
                onChange={(e) => {
                  inputField.onChange(e.target.value);
                  setValue(`attributes.${originalIndex}.valueType`, 'number');
                }}
              />
            )}
          />
        );

      case 'textarea':
        return (
          <Controller
            name={fieldName}
            control={control}
            render={({ field: inputField }) => (
              <TextField
                {...inputField}
                label={attribute.label}
                placeholder={attribute.placeholder}
                multiline
                rows={4}
                fullWidth
                variant="outlined"
                onChange={(e) => {
                  inputField.onChange(e.target.value);
                  setValue(`attributes.${originalIndex}.valueType`, 'string');
                }}
              />
            )}
          />
        );

      case 'check':
        return (
          <Controller
            name={fieldName}
            control={control}
            render={({ field: inputField }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={inputField.value === 'true'}
                    onChange={(e) => {
                      const newValue = e.target.checked ? 'true' : 'false';
                      inputField.onChange(newValue);
                      setValue(`attributes.${originalIndex}.valueType`, 'boolean');
                    }}
                  />
                }
                label={attribute.label}
              />
            )}
          />
        );

      case 'select': {
        let selectOptions: any[] = [];
        try {
          selectOptions = attribute.options ? JSON.parse(attribute.options) : [];
        } catch (e) {
          console.error('Error parsing select options:', attribute.options);
        }

        return (
          <Controller
            name={fieldName}
            control={control}
            render={({ field: inputField }) => (
              <FormControl fullWidth variant="outlined">
                <InputLabel>{attribute.label}</InputLabel>
                <Select
                  {...inputField}
                  label={attribute.label}
                  onChange={(e) => {
                    inputField.onChange(e.target.value);
                    setValue(`attributes.${originalIndex}.valueType`, 'string');
                  }}
                >
                  {selectOptions.map((option: { value: string; label: string }) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        );
      }

      case 'radio': {
        let radioOptions: any[] = [];
        try {
          radioOptions = attribute.options ? JSON.parse(attribute.options) : [];
        } catch (error) {
          console.error('Error parsing radio options:', attribute.options);
        }

        return (
          <Controller
            name={fieldName}
            control={control}
            render={({ field: inputField }) => (
              <FormControl component="fieldset">
                <InputLabel component="legend">{attribute.label}</InputLabel>
                <RadioGroup
                  {...inputField}
                  onChange={(e) => {
                    inputField.onChange(e.target.value);
                    setValue(`attributes.${originalIndex}.valueType`, 'string');
                  }}
                >
                  {radioOptions.map((option: { value: string; label: string }) => (
                    <FormControlLabel
                      key={option.value}
                      value={option.value}
                      control={<Radio />}
                      label={option.label}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            )}
          />
        );
      }

      default:
        console.warn('Unknown form type:', attribute.formType);
        return (
          <div>Unsupported field type: {attribute.formType}</div>
        );
    }
  };



  if (!fields || fields.length === 0) {
    return (
      <div>
        <p>No attributes to display</p>
        <p>Available attributes: {fields.length}</p>
      </div>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar atributos..."
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

      <Typography variant="body2" mb={2} fontWeight="bold">Atributos encontrados: {filteredFields.length} de {fields.length}</Typography>

      <Grid container spacing={1}>
        {filteredFields.map((field) => {
          const attributeField = field as unknown as AttributeFormField;
          // Find the original index in the unfiltered array
          const originalIndex = fields.findIndex(f => f.id === field.id);

          // console.log('Mapping field:', originalIndex, attributeField);

          // Determine grid size based on field type
          const getGridSize = (formType: string) => {
            switch (formType) {
              case 'textarea':
                return { xs: 12 }; // Full width for textarea
              case 'radio':
                return { xs: 12, sm: 6 }; // Half width on small screens and up
              case 'check':
                return { xs: 12, sm: 6, md: 4, lg: 3 }; // Smaller for checkboxes
              default:
                return { xs: 12, sm: 6, md: 4 }; // Default: full on mobile, half on tablet, third on desktop
            }
          };

          return (
            <Grid
              size={{...getGridSize(attributeField.attribute.formType)}}
              key={field.id || `attr-${originalIndex}`}
            >
              {/* Hidden fields to maintain the structure */}
              <Controller
                name={`attributes.${originalIndex}.attributeId`}
                control={control}
                render={() => <input type="hidden" />}
              />
              <Controller
                name={`attributes.${originalIndex}.valueType`}
                control={control}
                render={() => <input type="hidden" />}
              />

              {/* Render the actual input */}
              {renderAttributeInput(attributeField, originalIndex, originalIndex)}
            </Grid>
          );
        })}
      </Grid>

      {/* Show message when no results found */}
      {searchTerm && filteredFields.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
          No attributes found matching &#34;{searchTerm}&#34;
        </Box>
      )}
    </Box>
  );
};

export default AttributesTab;
