import type { TextFieldProps } from '@mui/material/TextField';
import type { DatePickerProps } from '@mui/x-date-pickers/DatePicker';
import type { MobileDateTimePickerProps } from '@mui/x-date-pickers/MobileDateTimePicker';

import { format } from 'date-fns';
import { Controller, useFormContext } from 'react-hook-form';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';

import { formatPatterns } from '../../utils/format-time';

// ----------------------------------------------------------------------

type RHFDatePickerProps = DatePickerProps<Date> & {
  name: string;
  size?: 'small' | 'medium';
};

export function RHFDatePicker({ name, slotProps, size = 'medium', ...other }: RHFDatePickerProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <DatePicker
          {...field}
          value={field.value ? new Date(field.value) : null}
          onChange={(newValue) => field.onChange(newValue ? new Date(newValue) : null)}
          format={formatPatterns.date}
          slotProps={{
            ...slotProps,
            textField: {
              fullWidth: true,
              size,
              error: !!error,
              helperText: error?.message ?? (slotProps?.textField as TextFieldProps)?.helperText,
              ...slotProps?.textField,
            },
          }}
          {...other}
        />
      )}
    />
  );
}

// ----------------------------------------------------------------------

type RHFMobileDateTimePickerProps = MobileDateTimePickerProps<Date> & {
  name: string;
  size?: 'small' | 'medium';
};

export function RHFMobileDateTimePicker({
                                          name,
                                          slotProps,
                                          size = 'medium',
                                          ...other
                                        }: RHFMobileDateTimePickerProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <MobileDateTimePicker
          {...field}
          value={field.value ? new Date(field.value) : null}
          onChange={(newValue) => field.onChange(newValue ? format(newValue, "yyyy-MM-dd'T'HH:mm:ss") : null)}
          format={formatPatterns.split.dateTime}
          slotProps={{
            textField: {
              fullWidth: true,
              size,
              error: !!error,
              helperText: error?.message ?? (slotProps?.textField as TextFieldProps)?.helperText,
              ...slotProps?.textField,
            },
            ...slotProps,
          }}
          {...other}
        />
      )}
    />
  );
}
