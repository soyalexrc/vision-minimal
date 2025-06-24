import { varAlpha, mergeClasses } from 'minimal-shared/utils';

import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { fData } from 'src/utils/format-number';

import { Iconify } from '../../iconify';
import { uploadClasses } from '../classes';
import { fileData, FileThumbnail } from '../../file-thumbnail';

import type { MultiFilePreviewProps } from '../types';

// ----------------------------------------------------------------------

// Helper function to create preview URL
const createPreviewUrl = (file: File | string): string => {
  if (typeof file === 'string') {
    return file; // Assume it's already a URL
  }
  return URL.createObjectURL(file);
};

// Helper function to handle image preview
const handleImagePreview = (file: File | string) => {
  const previewUrl = createPreviewUrl(file);
  window.open(previewUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
};

export function MultiFilePreview({
                                   sx,
                                   onRemove,
                                   lastNode,
                                   thumbnail,
                                   slotProps,
                                   firstNode,
                                   files = [],
                                   className,
                                   ...other
                                 }: MultiFilePreviewProps) {
  return (
    <ListRoot
      thumbnail={thumbnail}
      className={mergeClasses([uploadClasses.uploadMultiPreview, className])}
      sx={sx}
      {...other}
    >
      {firstNode && <ItemNode thumbnail={thumbnail}>{firstNode}</ItemNode>}

      {files.map((file) => {
        const { name, size } = fileData(file);

        if (thumbnail) {
          return (
            <ItemThumbnail key={name}>
              <FileThumbnail
                tooltip
                imageView
                file={file}
                onRemove={() => onRemove?.(file)}
                onClick={() => handleImagePreview(file)}
                sx={[
                  (theme) => ({
                    width: 80,
                    height: 80,
                    border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      },
                  }),
                ]}
                slotProps={{ icon: { sx: { width: 36, height: 36 } } }}
                {...slotProps?.thumbnail}
              />
            </ItemThumbnail>
          );
        }

        return (
          <ItemRow key={name}>
            <FileThumbnailWrapper
              onClick={() => handleImagePreview(file)}
            >
              <FileThumbnail file={file} {...slotProps?.thumbnail} />
            </FileThumbnailWrapper>

            <ListItemText
              primary={name}
              secondary={fData(size)}
              slotProps={{
                secondary: { sx: { typography: 'caption' } },
              }}
            />

            {onRemove && (
              <IconButton size="small" onClick={() => onRemove(file)}>
                <Iconify width={16} icon="mingcute:close-line" />
              </IconButton>
            )}
          </ItemRow>
        );
      })}

      {lastNode && <ItemNode thumbnail={thumbnail}>{lastNode}</ItemNode>}
    </ListRoot>
  );
}

// ----------------------------------------------------------------------

const ListRoot = styled('ul', {
  shouldForwardProp: (prop: string) => !['thumbnail', 'sx'].includes(prop),
})<Pick<MultiFilePreviewProps, 'thumbnail'>>(({ thumbnail, theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  flexDirection: 'column',
  ...(thumbnail && { flexWrap: 'wrap', flexDirection: 'row' }),
}));

const ItemThumbnail = styled('li')(() => ({ display: 'inline-flex' }));

const ItemRow = styled('li')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1, 1, 1, 1.5),
  borderRadius: theme.shape.borderRadius,
  border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
}));

const ItemNode = styled('li', {
  shouldForwardProp: (prop: string) => !['thumbnail', 'sx'].includes(prop),
})<Pick<MultiFilePreviewProps, 'thumbnail'>>(({ thumbnail }) => ({
  ...(thumbnail && { width: 'auto', display: 'inline-flex' }),
}));

const FileThumbnailWrapper = styled('div')({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  transition: 'opacity 0.2s ease-in-out',
  '&:hover': {
    opacity: 0.8,
  },
});
