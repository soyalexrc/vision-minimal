'use client';

import React, { useState } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Avatar from '@mui/material/Avatar';

import { varAlpha } from 'minimal-shared/utils';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Label } from 'src/components/label';

import { paths } from '../../routes/paths';
import { DashboardContent } from '../../layouts/dashboard';
import {
  type JiraIssue,
  useGetJiraBacklog,
  useGetJiraSprint,
  useGetJiraIssues,
  useGetIssue,
  refreshAllJiraData,
} from '../../actions/jira';
import { IssueDetailModal } from './issue-detail-modal';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los Estados' },
  { value: 'Por hacer', label: 'Por hacer' },
  { value: 'En progreso', label: 'En progreso' },
  { value: 'Completado', label: 'Completado' },
  { value: 'Backlog', label: 'Backlog' },
];

// ----------------------------------------------------------------------

export function SystemSupportView() {
  const [activeTab, setActiveTab] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedIssueKey, setSelectedIssueKey] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // SWR hooks for data fetching
  const {
    backlogIssues,
    backlogLoading,
    backlogError,
    refreshBacklog,
  } = useGetJiraBacklog();

  const {
    sprintIssues,
    sprintLoading,
    sprintError,
    currentSprint,
    refreshSprint,
  } = useGetJiraSprint();

  // Commented out "Todos los issues" functionality
  // const {
  //   allIssues,
  //   allIssuesLoading,
  //   allIssuesError,
  //   refreshAllIssues,
  // } = useGetJiraIssues({ statusFilter });

  const {
    issue: selectedIssue,
    issueLoading,
    issueError,
  } = useGetIssue(selectedIssueKey);

  const loading = backlogLoading || sprintLoading; // || allIssuesLoading;
  const error = backlogError || sprintError; // || allIssuesError;

  const handleRefreshAll = () => {
    refreshAllJiraData({ statusFilter });
  };

  const handleIssueClick = (issueKey: string) => {
    setSelectedIssueKey(issueKey);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    // Small delay to allow modal to close smoothly before clearing the key
    setTimeout(() => setSelectedIssueKey(null), 300);
  };

  const getStatusColor = (statusCategory: string) => {
    switch (statusCategory.toLowerCase()) {
      case 'new':
      case 'por hacer':
        return 'default';
      case 'indeterminate':
      case 'en progreso':
        return 'primary';
      case 'done':
      case 'completado':
        return 'success';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'highest':
      case 'high':
      case 'más alta':
      case 'alta':
        return '#d32f2f';
      case 'medium':
      case 'media':
        return '#f57c00';
      case 'low':
      case 'lowest':
      case 'baja':
      case 'más baja':
        return '#388e3c';
      default:
        return '#757575';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const IssueTable: React.FC<{
    issues: JiraIssue[];
    variant?: 'sprint' | 'backlog' | 'default';
    loading?: boolean;
    emptyMessage?: string;
  }> = ({
    issues,
    variant = 'default',
    loading = false,
    emptyMessage = 'No se encontraron issues'
  }) => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress size={24} />
        </Box>
      );
    }

    if (issues.length === 0) {
      return (
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            backgroundColor: (theme) =>
              variant === 'sprint'
                ? varAlpha(theme.vars.palette.primary.mainChannel, 0.04)
                : variant === 'backlog'
                ? varAlpha(theme.vars.palette.warning.mainChannel, 0.04)
                : 'transparent',
          }}
        >
          <Iconify
            icon={variant === 'sprint' ? "solar:document-text-bold" : "solar:file-text-bold"}
            sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {emptyMessage}
          </Typography>
        </Paper>
      );
    }

    return (
      <TableContainer>
        <Table sx={{ minWidth: 750 }} size="small">
          <TableHead>
            <TableRow>
              {/*<TableCell sx={{ width: 20 }} />*/}
              <TableCell sx={{ minWidth: 50 }}>-</TableCell>
              <TableCell sx={{ minWidth: 100 }}>Clave</TableCell>
              <TableCell>Resumen</TableCell>
              <TableCell align="center">Estado</TableCell>
              {/*<TableCell align="center">Prioridad</TableCell>*/}
              <TableCell>Asignado a</TableCell>
              <TableCell>Creado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {issues.map((issue) => (
              <TableRow
                key={issue.id}
                hover
                onClick={() => handleIssueClick(issue.key)}
                sx={{
                  cursor: 'pointer',
                  backgroundColor: (theme) =>
                    variant === 'sprint'
                      ? varAlpha(theme.vars.palette.primary.mainChannel, 0.02)
                      : variant === 'backlog'
                      ? varAlpha(theme.vars.palette.warning.mainChannel, 0.02)
                      : 'transparent',
                  '&:hover': {
                    backgroundColor: (theme) =>
                      variant === 'sprint'
                        ? varAlpha(theme.vars.palette.primary.mainChannel, 0.08)
                        : variant === 'backlog'
                        ? varAlpha(theme.vars.palette.warning.mainChannel, 0.08)
                        : varAlpha(theme.vars.palette.action.selectedChannel, 0.08),
                  }
                }}
              >
                <TableCell>
                  <img
                    src={issue.fields.issuetype.iconUrl}
                    alt={issue.fields.issuetype.name}
                    width={16}
                    height={16}
                  />
                </TableCell>
                <TableCell>
                  <Stack spacing={1} alignItems="center">
                    <Typography variant="body2" fontWeight="medium" color="primary">
                      {issue.key}
                    </Typography>
                    {/*{variant === 'sprint' && (*/}
                    {/*  <Label color="primary" variant="soft" sx={{ height: 20 }}>*/}
                    {/*    Sprint*/}
                    {/*  </Label>*/}
                    {/*)}*/}
                    {/*{variant === 'backlog' && (*/}
                    {/*  <Label color="warning" variant="soft" sx={{ height: 20 }}>*/}
                    {/*    Backlog*/}
                    {/*  </Label>*/}
                    {/*)}*/}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                    {issue.fields.summary}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={issue.fields.status.name}
                    color={getStatusColor(issue.fields.status.statusCategory.name)}
                    size="small"
                    sx={{ height: 24 }}
                  />
                </TableCell>
                {/*<TableCell align="center">*/}
                {/*  <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>*/}
                {/*    <Iconify*/}
                {/*      icon="material-symbols:flag"*/}
                {/*      sx={{ fontSize: 16, color: getPriorityColor(issue.fields.priority.name) }}*/}
                {/*    />*/}
                {/*    <Typography variant="caption" color="text.secondary">*/}
                {/*      {issue.fields.priority.name}*/}
                {/*    </Typography>*/}
                {/*  </Box>*/}
                {/*</TableCell>*/}
                <TableCell>
                  {issue.fields.assignee ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar
                        sx={{ width: 24, height: 24 }}
                        alt={issue.fields.assignee.displayName}
                      >
                        {issue.fields.assignee.displayName.charAt(0)}
                      </Avatar>
                      <Typography variant="caption" color="text.secondary">
                        {issue.fields.assignee.displayName}
                      </Typography>
                    </Stack>
                  ) : (
                    <Typography variant="caption" color="text.disabled">
                      Sin asignar
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(issue.fields.created)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const TabPanel: React.FC<{ children: React.ReactNode; value: number; index: number }> = ({
    children,
    value,
    index,
  }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Soporte del sistema"
        links={[
          { name: 'Inicio', href: paths.dashboard.root },
          { name: 'Administración' },
          { name: 'Soporte del sistema' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Container maxWidth="xl">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h1">
            Panel de Jira
          </Typography>
          <Tooltip title="Actualizar datos">
            <IconButton onClick={handleRefreshAll} disabled={loading}>
              <Iconify icon="solar:refresh-bold" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Commented out status filter - only used for "Todos los issues" */}
        {/* <Box mb={3}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Filtro de estado</InputLabel>
                <Select
                  value={statusFilter}
                  label="Filtro de estado"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box> */}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error?.message || 'Error al cargar los datos de Jira'}
          </Alert>
        )}

        <Card>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={[
              (theme) => ({
                px: 2.5,
                boxShadow: `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
              }),
            ]}
          >
            <Tab label={`Sprint Actual (${sprintIssues.length})`} />
            <Tab label={`Backlog (${backlogIssues.length})`} />
            {/* <Tab label={`Todos los Issues (0)`} /> */}
          </Tabs>

          {loading && (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          )}

          <TabPanel value={activeTab} index={0}>
            {currentSprint && (
              <Alert severity="info" sx={{ mb: 3, mx: 3, mt: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="solar:clock-circle-bold" />
                  <Box>
                    <Typography variant="h6">{currentSprint.name}</Typography>
                    <Typography variant="body2">
                      {currentSprint.state} • {formatDate(currentSprint.startDate)} - {formatDate(currentSprint.endDate)}
                    </Typography>
                  </Box>
                </Stack>
              </Alert>
            )}
            <Box sx={{ p: 3 }}>
              <IssueTable
                issues={sprintIssues}
                variant="sprint"
                loading={sprintLoading}
                emptyMessage="No hay issues en el sprint actual"
              />
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Box sx={{ p: 3 }}>
              <IssueTable
                issues={backlogIssues}
                variant="backlog"
                loading={backlogLoading}
                emptyMessage="No hay issues en el backlog"
              />
            </Box>
          </TabPanel>

          {/* Commented out "Todos los issues" tab */}
          {/* <TabPanel value={activeTab} index={2}>
            <Box sx={{ p: 3 }}>
              <IssueTable
                issues={allIssues}
                variant="default"
                loading={allIssuesLoading}
                emptyMessage="No se encontraron issues"
              />
            </Box>
          </TabPanel> */}
        </Card>
      </Container>

      {/* Issue Detail Modal */}
      <IssueDetailModal
        open={modalOpen}
        onClose={handleCloseModal}
        issue={selectedIssue}
        loading={issueLoading}
      />
    </DashboardContent>
  );
}
