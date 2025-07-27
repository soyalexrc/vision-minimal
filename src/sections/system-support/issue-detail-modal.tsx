import React from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export interface JiraIssueDetail {
  id: string;
  key: string;
  self: string;
  fields: {
    summary: string;
    issuetype: {
      name: string;
      iconUrl: string;
      description: string;
      subtask: boolean;
    };
    created: string;
    updated: string;
    description?: {
      type: string;
      version: number;
      content: Array<{
        type: string;
        content?: Array<{
          type: string;
          text?: string;
          marks?: Array<{
            type: string;
            attrs?: any;
          }>;
        }>;
        attrs?: any;
      }>;
    };
    assignee?: {
      displayName: string;
      emailAddress: string;
      avatarUrls: {
        '48x48': string;
        '24x24': string;
        '16x16': string;
        '32x32': string;
      };
      accountType: string;
      timeZone: string;
    };
    priority: {
      name: string;
      iconUrl: string;
      id: string;
    };
    status: {
      name: string;
      description: string;
      statusCategory: {
        name: string;
        colorName: string;
        key: string;
      };
    };
    comment?: {
      comments: Array<{
        id: string;
        author: {
          accountId: string;
          displayName: string;
          emailAddress: string;
          avatarUrls: {
            '48x48': string;
            '24x24': string;
            '16x16': string;
            '32x32': string;
          };
          timeZone: string;
        };
        body: {
          type: string;
          version: number;
          content: Array<{
            type: string;
            content?: Array<{
              type: string;
              text?: string;
            }>;
          }>;
        };
        created: string;
        updated: string;
      }>;
      total: number;
    };
    customfield_10016?: number; // Story Points
  };
}

interface IssueDetailModalProps {
  open: boolean;
  onClose: () => void;
  issue: JiraIssueDetail | null;
  loading?: boolean;
}

// ----------------------------------------------------------------------

export function IssueDetailModal({
  open,
  onClose,
  issue,
  loading = false
}: IssueDetailModalProps) {
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
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const extractCommentText = (content: any[]): string => {
    let text = '';
    content.forEach(item => {
      if (item.type === 'paragraph' && item.content) {
        item.content.forEach((textItem: any) => {
          if (textItem.type === 'text' && textItem.text) {
            text += textItem.text;
          }
        });
        text += '\n';
      }
    });
    return text.trim();
  };

  const renderDescriptionContent = (content: any[]): React.ReactNode => {
    return content.map((item, index) => {
      switch (item.type) {
        case 'paragraph':
          if (!item.content || item.content.length === 0) {
            return <Box key={index} sx={{ height: 16 }} />;
          }
          return (
            <Typography key={index} variant="body2" paragraph>
              {item.content.map((textItem: any, textIndex: number) => {
                let text = textItem.text || '';
                let style: React.CSSProperties = {};

                if (textItem.marks) {
                  textItem.marks.forEach((mark: any) => {
                    if (mark.type === 'textColor') {
                      style.color = mark.attrs?.color;
                    }
                    if (mark.type === 'strike') {
                      style.textDecoration = 'line-through';
                    }
                  });
                }

                return (
                  <span key={textIndex} style={style}>
                    {text}
                  </span>
                );
              })}
            </Typography>
          );

        case 'bulletList':
          return (
            <List key={index} sx={{ pl: 2 }}>
              {item.content.map((listItem: any, listIndex: number) => (
                <ListItem key={listIndex} sx={{ py: 0, display: 'list-item', listStyleType: 'disc' }}>
                  <ListItemText
                    primary={
                      listItem.content?.[0]?.content?.[0]?.text || ''
                    }
                    sx={{ margin: 0 }}
                  />
                </ListItem>
              ))}
            </List>
          );

        case 'orderedList':
          return (
            <List key={index} sx={{ pl: 2 }}>
              {item.content.map((listItem: any, listIndex: number) => (
                <ListItem key={listIndex} sx={{ py: 0, display: 'list-item', listStyleType: 'decimal' }}>
                  <ListItemText
                    primary={
                      <Box>
                        {listItem.content.map((paragraph: any, pIndex: number) => {
                          if (paragraph.type === 'paragraph') {
                            return (
                              <Typography key={pIndex} variant="body2">
                                {paragraph.content?.[0]?.text || ''}
                              </Typography>
                            );
                          }
                          if (paragraph.type === 'orderedList') {
                            return (
                              <List key={pIndex} sx={{ pl: 2 }}>
                                {paragraph.content.map((subItem: any, subIndex: number) => (
                                  <ListItem key={subIndex} sx={{ py: 0, display: 'list-item', listStyleType: 'lower-alpha' }}>
                                    <ListItemText
                                      primary={subItem.content?.[0]?.content?.[0]?.text || ''}
                                      sx={{ margin: 0 }}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            );
                          }
                          return null;
                        })}
                      </Box>
                    }
                    sx={{ margin: 0 }}
                  />
                </ListItem>
              ))}
            </List>
          );

        case 'mediaSingle':
          return (
            <Box key={index} sx={{ my: 2 }}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.100' }}>
                <Typography variant="body2" color="text.secondary">
                  📎 Archivo multimedia disponible
                </Typography>
                {item.content?.[0]?.attrs?.alt && (
                  <Typography variant="caption" display="block">
                    {item.content[0].attrs.alt}
                  </Typography>
                )}
              </Paper>
            </Box>
          );

        default:
          return null;
      }
    });
  };

  if (!issue && !loading) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { maxHeight: '90vh' }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={2}>
            <CircularProgress size={24} />
          </Box>
        ) : issue ? (
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box flex={1}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <img
                  src={issue.fields.issuetype.iconUrl}
                  alt={issue.fields.issuetype.name}
                  width={20}
                  height={20}
                />
                <Chip
                  label={issue.key}
                  size="small"
                  color="primary"
                  sx={{ fontWeight: 'bold' }}
                />
                <Chip
                  label={issue.fields.status.name}
                  color={getStatusColor(issue.fields.status.statusCategory.name)}
                  size="small"
                />
              </Box>
              <Typography variant="h6" component="div">
                {issue.fields.summary}
              </Typography>
            </Box>
            <IconButton onClick={onClose} size="small">
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </Box>
        ) : null}
      </DialogTitle>

      {issue && !loading && (
        <>
          <DialogContent dividers>
            <Grid container spacing={3}>
              {/* Detalles del Issue */}
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom color="primary">
                      Detalles del Issue
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Iconify icon="solar:document-bold" width={16} />
                          <Typography variant="body2" color="text.secondary">
                            Tipo: {issue.fields.issuetype.name}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Iconify
                            icon="material-symbols:flag"
                            width={16}
                            sx={{ color: getPriorityColor(issue.fields.priority.name) }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            Prioridad: {issue.fields.priority.name}
                          </Typography>
                        </Box>
                        {issue.fields.customfield_10016 && (
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <Iconify
                              icon="solar:star-bold"
                              width={16}
                              sx={{ color: 'primary.main' }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              Story Points:
                              <Typography component="span" color="primary.main" fontWeight="medium" sx={{ ml: 0.5 }}>
                                {issue.fields.customfield_10016}
                              </Typography>
                            </Typography>
                          </Box>
                        )}
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Iconify icon="solar:calendar-bold" width={16} />
                          <Typography variant="body2" color="text.secondary">
                            Creado: {formatDate(issue.fields.created)}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Iconify icon="solar:refresh-bold" width={16} />
                          <Typography variant="body2" color="text.secondary">
                            Actualizado: {formatDate(issue.fields.updated)}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Información del Asignado */}
              {issue.fields.assignee && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom color="primary">
                        Asignado a
                      </Typography>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar
                          src={issue.fields.assignee.avatarUrls['32x32']}
                          sx={{ width: 40, height: 40 }}
                        >
                          <Iconify icon="solar:user-bold" />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {issue.fields.assignee.displayName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {issue.fields.assignee.emailAddress}
                          </Typography>
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            {issue.fields.assignee.timeZone}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Descripción */}
              {issue.fields.description && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom color="primary">
                        Descripción
                      </Typography>
                      <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                        {renderDescriptionContent(issue.fields.description.content)}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Sección de Comentarios */}
                <Card variant="outlined" sx={{ width: '100%' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <Iconify icon="solar:chat-square-bold" width={16} />
                      <Typography variant="subtitle2" color="primary">
                        Comentarios ({issue.fields.comment?.total || 0})
                      </Typography>
                    </Box>
                    {issue.fields.comment?.total === 0 ? (
                      <Typography variant="body2" color="text.secondary" fontStyle="italic">
                        No hay comentarios todavía
                      </Typography>
                    ) : (
                      <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                        {issue.fields.comment?.comments.map((comment, index) => (
                          <Box key={comment.id} sx={{ mb: 2, pb: 2, borderBottom: index < issue.fields.comment!.comments.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <Avatar
                                src={comment.author.avatarUrls['24x24']}
                                sx={{ width: 24, height: 24 }}
                              >
                                {comment.author.displayName.charAt(0)}
                              </Avatar>
                              <Typography variant="body2" fontWeight="medium">
                                {comment.author.displayName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(comment.created)}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ ml: 4 }}>
                              {extractCommentText(comment.body.content)}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>

              {/* Enlaces y Referencias */}
              {/*<Grid item xs={12}>*/}
              {/*  <Card variant="outlined">*/}
              {/*    <CardContent>*/}
              {/*      <Box display="flex" alignItems="center" gap={1} mb={2}>*/}
              {/*        <Iconify icon="solar:link-bold" width={16} />*/}
              {/*        <Typography variant="subtitle2" color="primary">*/}
              {/*          Enlaces y Referencias*/}
              {/*        </Typography>*/}
              {/*      </Box>*/}
              {/*      <Typography variant="body2" color="text.secondary">*/}
              {/*        ID del Issue: {issue.id}*/}
              {/*      </Typography>*/}
              {/*      <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>*/}
              {/*        URL: {issue.self}*/}
              {/*      </Typography>*/}
              {/*    </CardContent>*/}
              {/*  </Card>*/}
              {/*</Grid>*/}
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={onClose}>Cerrar</Button>
            {/*<Button */}
            {/*  variant="contained" */}
            {/*  href={issue.self.replace('/rest/api/3/issue/', '/browse/')}*/}
            {/*  target="_blank"*/}
            {/*  rel="noopener noreferrer"*/}
            {/*  startIcon={<Iconify icon="solar:external-link-bold" />}*/}
            {/*>*/}
            {/*  Abrir en Jira*/}
            {/*</Button>*/}
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
