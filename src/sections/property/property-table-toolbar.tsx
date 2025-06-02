import type { UseSetStateReturn } from 'minimal-shared/hooks';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { GridSlotProps, GridRowSelectionModel } from '@mui/x-data-grid';

import { useState, useCallback } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import {
  GridToolbarExport,
  GridToolbarContainer,
  GridToolbarQuickFilter,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
} from '@mui/x-data-grid';

import { Iconify } from 'src/components/iconify';

import { useGetCategories } from '../../actions/property';
import { PropertyTableFiltersResult } from './property-table-filters-result';

import type { IPropertyDataFilters } from '../../types/property';

// ----------------------------------------------------------------------

type Props = {
  onResetPage: () => void;
  filters: UseSetStateReturn<IPropertyDataFilters>;
};

type CustomToolbarProps = GridSlotProps['toolbar'] & {
  canReset: boolean;
  filteredResults: number;
  onResetPage: () => void;
  selectedRowIds: GridRowSelectionModel;
  filters: UseSetStateReturn<IPropertyDataFilters>;
  onOpenConfirmDeleteRows: () => void;
  options?: {
    // Add your filter options here - adjust based on your property data structure
    propertyType?: { value: string; label: string }[];
    operationType?: { value: string; label: string }[];
  };
};

export function PropertyGridTableToolbar({
  filters,
  canReset,
  selectedRowIds,
  filteredResults,
  setFilterButtonEl,
  onResetPage,
  onOpenConfirmDeleteRows,
}: CustomToolbarProps) {
  const { state: currentFilters, setState: updateFilters } = filters;
  const { categories } = useGetCategories();


  // Local state for select filters
  const [propertyType, setPropertyType] = useState(currentFilters.propertyType || []);
  const [operationType, setOperationType] = useState(currentFilters.operationType || []);

  // Select handlers
  const handleChangePropertyType = useCallback((event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event;
    setPropertyType(typeof value === 'string' ? value.split(',') : value);
  }, []);

  const handleChangeOperationType = useCallback((event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event;
    setOperationType(typeof value === 'string' ? value.split(',') : value);
  }, []);

  // Filter apply handlers
  const handleFilterPropertyType = useCallback(() => {
    onResetPage();
    updateFilters({ propertyType });
  }, [onResetPage, updateFilters, propertyType]);

  const handleFilterOperationType = useCallback(() => {
    onResetPage();
    updateFilters({ operationType });
  }, [onResetPage, updateFilters, operationType]);


  const propertyTypeOptions = categories?.map(item => ({ value: item.title, label: item.title }))
  const operationTypeOptions = [
    { value: 'Venta', label: 'Venta' },
    { value: 'Alquiler', label: 'Alquiler' },
    { value: 'Traspaso', label: 'Traspaso' },
    { value: 'Venta y Alquiler', label: 'Venta y Alquiler' },
  ]

  return (
    <>
      <GridToolbarContainer>
        <Stack direction="row" gap={2}>
          <GridToolbarQuickFilter placeholder="Buscar..." sx={{ flex: 1 }} />
          {/* Property Type Filter */}
          {renderSelectFilter(
            'propertyType',
            'Tipo de Propiedad',
            propertyType,
            handleChangePropertyType,
            handleFilterPropertyType,
            propertyTypeOptions
          )}

          {/* Operation Type Filter */}
          {renderSelectFilter(
            'operationType',
            'Tipo de Operación',
            operationType,
            handleChangeOperationType,
            handleFilterOperationType,
            operationTypeOptions
          )}
        </Stack>
        <Stack
          direction="row"
          gap={2}
          sx={{ flexGrow: 1, alignItems: 'center', justifyContent: 'flex-end' }}
        >
          {!!selectedRowIds.length && (
            <Button
              size="small"
              color="error"
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
              onClick={onOpenConfirmDeleteRows}
            >
              Eliminar ({selectedRowIds.length})
            </Button>
          )}

          <GridToolbarColumnsButton />
          <GridToolbarFilterButton ref={setFilterButtonEl} slotProps={{}} />
          <GridToolbarExport
            printOptions={{ disableToolbarButton: true }}
            csvOptions={{ fileName: 'propiedades' }}
          />
        </Stack>
      </GridToolbarContainer>

      {canReset && (
        <PropertyTableFiltersResult
          onResetPage={() => {}}
          filters={filters}
          totalResults={filteredResults}
          sx={{ p: 2.5, pt: 0 }}
        />
      )}
    </>
  );
}

const renderSelectFilter = (
  filterKey: 'propertyType' | 'operationType',
  label: string,
  value: string[],
  onChange: (event: SelectChangeEvent<string[]>) => void,
  onApply: () => void,
  optionsArray?: { value: string; label: string }[]
) => {
  if (!optionsArray?.length) return null;

  return (
    <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 } }}>
      <InputLabel htmlFor={`filter-${filterKey}-select`}>{label}</InputLabel>
      <Select
        multiple
        value={value}
        onChange={onChange}
        onClose={onApply}
        input={<OutlinedInput label={label} />}
        renderValue={(selected) => selected.map((val) => val).join(', ')}
        inputProps={{ id: `filter-${filterKey}-select` }}
        sx={{ textTransform: 'capitalize' }}
      >
        {optionsArray.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            <Checkbox
              disableRipple
              size="small"
              checked={value.includes(option.value)}
              slotProps={{
                input: {
                  id: `${option.value}-checkbox`,
                  'aria-label': `${option.label} checkbox`,
                },
              }}
            />
            {option.label}
          </MenuItem>
        ))}
        <MenuItem
          onClick={onApply}
          sx={[
            (theme) => ({
              justifyContent: 'center',
              fontWeight: theme.typography.button,
              bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
              border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
            }),
          ]}
        >
          Aplicar
        </MenuItem>
      </Select>
    </FormControl>
  );
};
