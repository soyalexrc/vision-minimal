import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface ProjectMetadata {
  project: {
    key: string;
    name: string;
  };
  issueTypes: Array<{
    id: string;
    name: string;
    description: string;
    iconUrl: string;
  }>;
  priorities: Array<{
    id: string;
    name: string;
    iconUrl: string;
  }>;
  users: Array<{
    accountId: string;
    displayName: string;
    emailAddress: string;
    avatarUrls: any;
  }>;
}

interface CreateIssueModalProps {
  open: boolean;
  onClose: () => void;
  onIssueCreated: () => void;
  metadata: ProjectMetadata | null;
  metadataLoading: boolean;
  metadataError: any;
  onCreateIssue: (payload: any) => Promise<void>;
}

// ----------------------------------------------------------------------

export function CreateIssueModal({
  open,
  onClose,
  onIssueCreated,
  metadata,
  metadataLoading,
  metadataError,
  onCreateIssue
}: CreateIssueModalProps) {
  const [formData, setFormData] = useState({
    summary: '',
    description: '',
    issueType: 'Story',
    priority: '',
    assignee: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setError(null);
      setSuccess(null);
      setFormData({
        summary: '',
        description: '',
        issueType: 'Story', // Default to 'Story' or first issue type
        priority: '',
        assignee: ''
      });
    }
  }, [open]);

  // Set default issue type when metadata loads
  useEffect(() => {
    if (metadata?.issueTypes.length) {
      const nonEpicTypes = metadata.issueTypes.filter(type => type.name !== 'Epic');
      const defaultType = nonEpicTypes.find(type => type.name === 'Story')
        || nonEpicTypes[0];
      if (defaultType) {
        setFormData(prev => ({ ...prev, issueType: defaultType.name }));
      }
    }
  }, [metadata]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async () => {
    if (!formData.summary.trim()) {
      setError('El resumen es obligatorio');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Create payload with only the fields that are filled
      const payload: any = {
        summary: formData.summary.trim(),
      };

      // Only add optional fields if they have values
      if (formData.description.trim()) {
        payload.description = formData.description.trim();
      }

      if (formData.issueType) {
        // Find the issue type object to get the ID
        const issueTypeObj = metadata?.issueTypes.find(type => type.name === formData.issueType);
        if (issueTypeObj) {
          payload.issueType = issueTypeObj.id;
        }
      }

      // Only include priority if it's set and not empty
      if (formData.priority && formData.priority.trim()) {
        // Find the priority object to get the ID
        const priorityObj = metadata?.priorities.find(p => p.name === formData.priority);
        if (priorityObj) {
          payload.priority = priorityObj.id;
        }
      }

      if (formData.assignee) {
        payload.assignee = formData.assignee;
      }

      await onCreateIssue(payload);
      setSuccess('Issue creado exitosamente!');

      // Auto-close after 2 seconds
      setTimeout(() => {
        onIssueCreated();
      }, 2000);
    } catch (err: any) {
      // Extract more detailed error information
      let errorMessage = 'Error al crear el issue';

      if (err.message) {
        errorMessage = err.message;
      }

      // If there are field errors, show them
      if (err.details?.fieldErrors) {
        const fieldErrors = Object.entries(err.details.fieldErrors)
          // eslint-disable-next-line @typescript-eslint/no-shadow
          .map(([field, error]) => `${field}: ${error}`)
          .join(', ');
        errorMessage = `Error en campos: ${fieldErrors}`;
      }

      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  const getSelectedUser = () => {
    if (!metadata || !formData.assignee) return null;
    return metadata.users.find(user => user.accountId === formData.assignee) || null;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '60vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <Iconify icon="solar:add-circle-bold" width={24} color="primary.main" />
            <Typography variant="h6">Crear Nuevo Issue</Typography>
          </Box>
          <IconButton onClick={handleClose} disabled={submitting}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Este issue será agregado al backlog
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {metadataLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : metadataError ? (
          <Alert severity="error">
            Error al cargar los metadatos del proyecto
          </Alert>
        ) : (
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success">
                {success}
              </Alert>
            )}

            {/* Resumen - Obligatorio */}
            <TextField
              label="Resumen *"
              value={formData.summary}
              onChange={(e) => handleInputChange('summary', e.target.value)}
              fullWidth
              required
              placeholder="Ingresa un breve resumen del issue"
              disabled={submitting}
              error={!formData.summary.trim() && error !== null}
              helperText={!formData.summary.trim() && error !== null ? "El resumen es obligatorio" : ""}
            />

            {/* Descripción */}
            <TextField
              label="Descripción"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              fullWidth
              multiline
              rows={4}
              placeholder="Proporciona una descripción detallada del issue"
              disabled={submitting}
            />

            {/* Tipo de Issue */}
            {metadata && (
              <FormControl fullWidth>
                <InputLabel>Tipo de Issue</InputLabel>
                <Select
                  value={formData.issueType}
                  label="Tipo de Issue"
                  onChange={(e) => handleInputChange('issueType', e.target.value)}
                  disabled={submitting}
                >
                  {metadata.issueTypes.filter(type => type.name !== 'Epic').map((type) => (
                    <MenuItem key={type.id} value={type.name}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <img
                          src={type.iconUrl}
                          alt={type.name}
                          width={16}
                          height={16}
                        />
                        <span>{type.name}</span>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Prioridad */}
            {metadata && (
              <FormControl fullWidth>
                <InputLabel>Prioridad</InputLabel>
                <Select
                  value={formData.priority}
                  label="Prioridad"
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  disabled={submitting}
                >
                  <MenuItem value="">
                    <em>Ninguna</em>
                  </MenuItem>
                  {metadata.priorities.map((priority) => (
                    <MenuItem key={priority.id} value={priority.name}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <img
                          src={priority.iconUrl}
                          alt={priority.name}
                          width={16}
                          height={16}
                        />
                        <span>{priority.name}</span>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Asignado a */}
            {metadata && (
              <Autocomplete
                options={metadata.users}
                getOptionLabel={(option) => `${option.displayName} (${option.emailAddress})`}
                value={getSelectedUser()}
                onChange={(_, newValue) => {
                  handleInputChange('assignee', newValue?.accountId || '');
                }}
                disabled={submitting}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Asignado a"
                    placeholder="Buscar un usuario para asignar"
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props} display="flex" alignItems="center" gap={1}>
                    <Avatar
                      src={option.avatarUrls['24x24'] || option.avatarUrls['16x16']}
                      alt={option.displayName}
                      sx={{ width: 24, height: 24 }}
                    />
                    <Box>
                      <Typography variant="body2">{option.displayName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.emailAddress}
                      </Typography>
                    </Box>
                  </Box>
                )}
              />
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={handleClose}
          disabled={submitting}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={metadataLoading || submitting || !formData.summary.trim()}
          startIcon={submitting ? <CircularProgress size={16} /> : <Iconify icon="solar:add-circle-bold" />}
        >
          {submitting ? 'Creando...' : 'Crear Issue'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
