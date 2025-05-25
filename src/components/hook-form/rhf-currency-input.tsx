// components/hook-form/Field.Currency.tsx

import {NumericFormat} from 'react-number-format';
import { Controller, useFormContext } from 'react-hook-form';

import TextField from '@mui/material/TextField';

type CurrencyFieldProps = {
  name: string;
  label: string;
  size?: 'small' | 'medium';
  prefix?: string;
  thousandSeparator?: string;
  decimalSeparator?: string;
  allowNegative?: boolean;
};

export default function RHFCurrencyField({
                                        name,
                                        label,
                                        size = 'small',
                                        prefix = '$ ',
                                        thousandSeparator = ',',
                                        decimalSeparator = '.',
                                        allowNegative = false,
                                      }: CurrencyFieldProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <NumericFormat
          {...field}
          customInput={TextField}
          fullWidth
          size={size}
          label={label}
          prefix={prefix}
          thousandSeparator={thousandSeparator}
          decimalSeparator={decimalSeparator}
          decimalScale={2}
          fixedDecimalScale
          allowNegative={allowNegative}
          value={field.value || ''}
          onValueChange={({ floatValue }) => field.onChange(floatValue)}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
        />
      )}
    />
  );
}
