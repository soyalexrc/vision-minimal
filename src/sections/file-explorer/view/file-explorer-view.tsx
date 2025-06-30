'use client';

import { useState, Fragment, useEffect } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Menu from '@mui/material/Menu';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import { List, Toolbar, ListItem, CardContent, ListItemSecondaryAction } from '@mui/material';

import axios from '../../../lib/axios';
import { paths } from '../../../routes/paths';
import { Iconify } from '../../../components/iconify';
import { DashboardContent } from '../../../layouts/dashboard';
import { CustomBreadcrumbs } from '../../../components/custom-breadcrumbs';

interface DirectoryInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  webkitdirectory?: any;
  directory?: any;
}

// Type definitions
interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'folder';
  size: number;
  lastModified: string;
}

interface ContextMenuState {
  mouseX: number;
  mouseY: number;
  item: FileItem;
}

interface FileWithRelativePath extends File {
  webkitRelativePath: string;
  customRelativePath: string;
}

interface FileObject {
  file: File;
  relativePath: string;
}

interface UploadResponse {
  success: boolean;
  message: string;
  totalFiles?: number;
  foldersCreated?: number;
}

interface WebKitDirectoryEntry {
  isFile: boolean;
  isDirectory: boolean;
  name: string;
  createReader?: () => WebKitDirectoryReader;
  file?: (callback: (file: File) => void) => void;
}

interface WebKitDirectoryReader {
  readEntries: (callback: (entries: WebKitDirectoryEntry[]) => void) => void;
}

// interface DataTransferItemWithEntry extends DataTransferItem {
//   webkitGetAsEntry?: () => WebKitDirectoryEntry | null;
// }

type ViewMode = 'list' | 'grid';

export function FileExplorerView() {
  const theme = useTheme();
  const [currentPath, setCurrentPath] = useState<string>('');
  const [items, setItems] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showUpload, setShowUpload] = useState<boolean>(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newName, setNewName] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [createFolderDialog, setCreateFolderDialog] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');

  const fetchItems = async (path: string = ''): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`/r2/list?path=${encodeURIComponent(path)}`);
      if (response.status !== 200) throw new Error('Failed to fetch items');
      const data = response.data;
      setItems(data.data || []);
    } catch (err: any) {
      console.error('Error fetching items:', err);
      setError('Failed to load files and folders');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const downloadItem = async (item: FileItem): Promise<void> => {
    try {
      const response = await axios.get(`/r2/download?path=${encodeURIComponent(item.path)}`, {
        responseType: 'blob'
      });

      if (response.status !== 200) throw new Error('Failed to download file');
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Error downloading file:', err);
      setError('Failed to download file');
    }
  };

  const deleteItem = async (item: FileItem): Promise<void> => {
    try {
      const response = await axios.delete(`/r2/delete?path=${encodeURIComponent(item.path)}`);
      if (response.status !== 200) throw new Error('Failed to delete item');
      fetchItems(currentPath);
    } catch (err: any) {
      console.error('Error deleting item:', err);
      setError('Failed to delete item');
    }
  };

  const renameItem = async (item: FileItem, nName: string): Promise<void> => {
    try {
      const response = await axios.put('/r2/rename', {
        oldPath: item.path,
        newName: nName
      });
      if (response.status !== 200) throw new Error('Failed to rename item');
      fetchItems(currentPath);
      setEditingItem(null);
    } catch (err: any) {
      console.error('Error renaming item:', err);
      setError('Failed to rename item');
    }
  };

  const createFolder = async (folderName: string): Promise<void> => {
    try {
      const response = await axios.post('/r2/create-folder', {
        path: currentPath,
        name: folderName
      });
      if (response.status !== 200 && response.status !== 201) throw new Error('Failed to create folder');
      fetchItems(currentPath);
      setCreateFolderDialog(false);
      setNewFolderName('');
    } catch (err: any) {
      console.error('Error creating folder:', err);
      setError('Failed to create folder');
    }
  };

  const handleFolderUpload = async (files: FileList | null): Promise<void> => {
    if (!files) return;

    const formData = new FormData();
    formData.append('baseFolder', currentPath);

    Array.from(files).forEach((file: any) => {
      const relativePath = file.webkitRelativePath || file.name;
      formData.append('files', file);
      formData.append('paths', relativePath);
    });

    try {
      const response = await axios.post<UploadResponse>('/r2/upload/folder', formData);
      if (response.status !== 200 && response.status !== 201) throw new Error('Failed to upload folder');

      const result = response.data;
      console.log(`Uploaded ${result.totalFiles} files in ${result.foldersCreated} folders`);

      fetchItems(currentPath);
      setShowUpload(false);
    } catch (err: any) {
      console.error('Error uploading folder:', err);
      setError('Failed to upload folder');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();

    const itemsDropped = Array.from(e.dataTransfer.items) as any[];

    const hasDirectories = itemsDropped.some(item =>
      item.webkitGetAsEntry && item.webkitGetAsEntry()?.isDirectory
    );

    if (hasDirectories) {
      const promises = itemsDropped.map((item: any) => {
        const entry = item.webkitGetAsEntry();
        if (entry) {
          return processEntry(entry, '');
        }
        return Promise.resolve([]);
      });

      Promise.all(promises).then(results => {
        const allFileObjects = results.flat();
        if (allFileObjects.length > 0) {
          const filesForUpload = allFileObjects.map(fileObj => {
            const file = fileObj.file as FileWithRelativePath;
            Object.defineProperty(file, 'customRelativePath', {
              value: fileObj.relativePath,
              writable: false,
              enumerable: false
            });
            return file;
          });
          handleFolderUploadFromDrop(filesForUpload);
        }
      });
    } else {
      const fileList = Array.from(e.dataTransfer.files);
      if (fileList.length > 0) {
        handleFileUpload(fileList);
      }
    }
  };

  const handleFolderUploadFromDrop = async (files: FileWithRelativePath[]): Promise<void> => {
    const formData = new FormData();
    formData.append('baseFolder', currentPath);

    files.forEach(file => {
      const relativePath = file.customRelativePath || file.webkitRelativePath || file.name;
      formData.append('files', file, relativePath);
      formData.append('paths', relativePath);
    });

    try {
      const response = await axios.post<UploadResponse>('/r2/upload/folder', formData);
      if (response.status !== 200 && response.status !== 201) throw new Error('Failed to upload folder');

      const result = response.data;
      console.log(`Uploaded ${result.totalFiles} files in ${result.foldersCreated} folders`);

      fetchItems(currentPath);
      setShowUpload(false);
    } catch (err: any) {
      console.error('Error uploading folder:', err);
      setError('Failed to upload folder');
    }
  };

  const processEntry = (entry: WebKitDirectoryEntry, path: string): Promise<FileObject[]> =>
    new Promise((resolve) => {
      if (entry.isFile && entry.file) {
        entry.file((file: File) => {
          const fileWithPath: FileObject = {
            file,
            relativePath: path + file.name
          };
          resolve([fileWithPath]);
        });
      } else if (entry.isDirectory && entry.createReader) {
        const dirReader = entry.createReader();
        dirReader.readEntries((entries: WebKitDirectoryEntry[]) => {
          const promises = entries.map(childEntry =>
            processEntry(childEntry, path + entry.name + '/')
          );
          Promise.all(promises).then(results => {
            resolve(results.flat());
          });
        });
      } else {
        resolve([]);
      }
    });

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileUpload = async (files: FileList | File[]): Promise<void> => {
    const formData = new FormData();
    formData.append('folder', currentPath);
    formData.append('shouldGenerateKey', 'false');

    Array.from(files).forEach((file: File) => {
      formData.append('files', file);
    });

    try {
      const response = await axios.post<UploadResponse>('/r2/upload/multiple', formData);
      if (response.status !== 200 && response.status !== 201) throw new Error('Failed to upload files');
      fetchItems(currentPath);
      setShowUpload(false);
    } catch (err: any) {
      console.error('Error uploading files:', err);
      setError('Failed to upload files');
    }
  };

  const navigateToFolder = (folderPath: string): void => {
    setCurrentPath(folderPath);
    setSelectedItems(new Set());
  };

  const goBack = (): void => {
    const pathParts = currentPath.split('/').filter(Boolean);
    pathParts.pop();
    const parentPath = pathParts.join('/');
    setCurrentPath(parentPath);
  };

  const handleContextMenu = (e: React.MouseEvent, item: FileItem): void => {
    e.preventDefault();
    setContextMenu({
      mouseX: e.clientX - 2,
      mouseY: e.clientY - 4,
      item
    });
  };

  const handleContextMenuClose = (): void => {
    setContextMenu(null);
  };

  const filteredItems = items.filter((item: FileItem) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchItems(currentPath);
  }, [currentPath]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  const getFileIcon = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const iconMap: Record<string, string> = {
      pdf: 'mdi:file-pdf',
      doc: 'mdi:file-word',
      docx: 'mdi:file-word',
      xls: 'mdi:file-excel',
      xlsx: 'mdi:file-excel',
      ppt: 'mdi:file-powerpoint',
      pptx: 'mdi:file-powerpoint',
      txt: 'mdi:file-document',
      jpg: 'mdi:file-image',
      jpeg: 'mdi:file-image',
      png: 'mdi:file-image',
      gif: 'mdi:file-image',
      mp4: 'mdi:file-video',
      avi: 'mdi:file-video',
      mp3: 'mdi:file-music',
      wav: 'mdi:file-music',
      zip: 'mdi:zip-box',
      rar: 'mdi:zip-box',
    };
    return iconMap[extension || ''] || 'mdi:file';
  };

  const renderGridView = () => (
    <Grid container spacing={2}>
      {filteredItems.map((item: FileItem) => (
        <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={item.path}>
          <Card
            sx={{
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                boxShadow: theme.shadows[4],
                transform: 'translateY(-2px)'
              },
              bgcolor: selectedItems.has(item.path) ? 'action.selected' : 'background.paper'
            }}
            onClick={() => {
              if (item.type === 'folder') {
                navigateToFolder(item.path);
              }
            }}
            onContextMenu={(e) => handleContextMenu(e, item)}
          >
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Iconify
                icon={item.type === 'folder' ? 'mdi:folder' : getFileIcon(item.name)}
                style={{
                  fontSize: 48,
                  color: item.type === 'folder' ? theme.palette.primary.main : theme.palette.text.secondary,
                  marginBottom: 8
                }}
              />
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                {editingItem === item.path ? (
                  <TextField
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') renameItem(item, newName);
                      if (e.key === 'Escape') setEditingItem(null);
                    }}
                    size="small"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  item.name
                )}
              </Typography>
              {item.type === 'file' && (
                <Chip
                  label={formatFileSize(item.size)}
                  size="small"
                  variant="outlined"
                />
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderListView = () => (
    <Paper>
      <List>
        {filteredItems.map((item: FileItem, index: number) => (
          <Fragment key={item.path}>
            <ListItem
              sx={{
                border: 'none',
                cursor: 'pointer',
                bgcolor: selectedItems.has(item.path) ? 'action.selected' : 'background.paper',
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
              component="button"
              onClick={() => {
                if (item.type === 'folder') {
                  navigateToFolder(item.path);
                }
              }}
              onContextMenu={(e) => handleContextMenu(e, item)}
              aria-selected={selectedItems.has(item.path)}
            >
              <ListItemIcon>
                <Iconify
                  icon={item.type === 'folder' ? 'mdi:folder' : getFileIcon(item.name)}
                  style={{
                    fontSize: 24,
                    color: item.type === 'folder' ? theme.palette.primary.main : theme.palette.text.secondary
                  }}
                />
              </ListItemIcon>
              <ListItemText
                primary={
                  editingItem === item.path ? (
                    <TextField
                      value={newName}
                      onChange={(e: any) => setNewName(e.target.value)}
                      onKeyDown={(e: any) => {
                        if (e.key === 'Enter') renameItem(item, newName);
                        if (e.key === 'Escape') setEditingItem(null);
                      }}
                      size="small"
                      autoFocus
                      onClick={(e: any) => e.stopPropagation()}
                    />
                  ) : (
                    item.name
                  )
                }
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {item.type === 'file' ? formatFileSize(item.size) : 'Folder'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(item.lastModified)}
                    </Typography>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContextMenu(e, item);
                  }}
                >
                  <Iconify icon="mdi:dots-vertical" />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
            {index < filteredItems.length - 1 && <Divider />}
          </Fragment>
        ))}
      </List>
    </Paper>
  );

  return (
    <>
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Gestion de archivos"
          links={[
            { name: 'Inicio', href: paths.dashboard.root },
            { name: 'Administración' },
            { name: 'Gestion de archivos', href: paths.dashboard.fileExplorer.root },
            { name: 'Listado' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
      </DashboardContent>
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
              {currentPath && (
                <IconButton onClick={goBack} color="inherit">
                  <Iconify icon="mdi:arrow-left" />
                </IconButton>
              )}
              <Typography variant="h6" color="inherit">
                Explorador de Archivos
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Refresh">
                <IconButton
                  onClick={() => fetchItems(currentPath)}
                  disabled={loading}
                  color="inherit"
                >
                  <Iconify icon={loading ? 'mdi:loading' : 'mdi:refresh'} className={loading ? 'animate-spin' : ''} />
                </IconButton>
              </Tooltip>

              <Tooltip title={`Switch to ${viewMode === 'list' ? 'grid' : 'list'} view`}>
                <IconButton
                  onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                  color="inherit"
                >
                  <Iconify icon={viewMode === 'list' ? 'mdi:view-grid' : 'mdi:view-list'} />
                </IconButton>
              </Tooltip>

              <Button
                variant="contained"
                startIcon={<Iconify icon="mdi:upload" />}
                onClick={() => setShowUpload(true)}
                sx={{ mr: 1 }}
              >
                Subir
              </Button>

              <Button
                variant="contained"
                color="primary"
                startIcon={<Iconify icon="mdi:folder-plus" />}
                onClick={() => setCreateFolderDialog(true)}
              >
                Nueva carpeta
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Content */}
        <Box sx={{ p: 3, flexGrow: 1, overflow: 'auto' }}>
          <TextField
            fullWidth
            placeholder="Busca archivos y carpetas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Iconify icon="mdi:magnify" style={{ marginRight: 8 }} />,
            }}
            sx={{ mb: 3 }}
          />

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
              <CircularProgress />
            </Box>
          ) : filteredItems.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Iconify icon="mdi:folder-open" style={{ fontSize: 64, color: theme.palette.text.disabled, marginBottom: 16 }} />
              <Typography variant="h6" color="text.secondary">
                No files or folders found
              </Typography>
            </Box>
          ) : (
            viewMode === 'grid' ? renderGridView() : renderListView()
          )}
        </Box>

        {/* Context Menu */}
        <Menu
          open={contextMenu !== null}
          onClose={handleContextMenuClose}
          anchorReference="anchorPosition"
          anchorPosition={
            contextMenu !== null
              ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
              : undefined
          }
        >
          {contextMenu?.item?.type === 'file' && (
            <MenuItem
              onClick={() => {
                if (contextMenu?.item) {
                  downloadItem(contextMenu.item);
                }
                handleContextMenuClose();
              }}
            >
              <Iconify icon="mdi:download" style={{ marginRight: 8 }} />
              Download
            </MenuItem>
          )}
          <MenuItem
            onClick={() => {
              if (contextMenu?.item) {
                setEditingItem(contextMenu.item.path);
                setNewName(contextMenu.item.name);
              }
              handleContextMenuClose();
            }}
          >
            <Iconify icon="mdi:pencil" style={{ marginRight: 8 }} />
            Cambiar nombre
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (contextMenu?.item && window.confirm(`Are you sure you want to delete "${contextMenu.item.name}"?`)) {
                deleteItem(contextMenu.item);
              }
              handleContextMenuClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="mdi:delete" style={{ marginRight: 8 }} />
            Eliminar
          </MenuItem>
        </Menu>

        {/* Upload Dialog */}
        <Dialog open={showUpload} onClose={() => setShowUpload(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Sube archivos o carpetas</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 2 }}>
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Subir archivos
                </Typography>
                <Box
                  sx={{
                    position: 'relative',
                    display: 'inline-block',
                    width: '100%'
                  }}
                >
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<Iconify icon="mdi:file-upload" />}
                    sx={{
                      py: 2,
                      borderStyle: 'dashed',
                      borderWidth: 2,
                      '&:hover': {
                        borderStyle: 'dashed',
                        borderWidth: 2,
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    Seleccionar archivos
                    <input
                      type="file"
                      multiple
                      onChange={(e) => handleFileUpload(e.target.files as any)}
                      style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer'
                      }}
                    />
                  </Button>
                </Box>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Subir carpeta
                </Typography>
                <Box
                  sx={{
                    position: 'relative',
                    display: 'inline-block',
                    width: '100%'
                  }}
                >
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<Iconify icon="mdi:folder-upload" />}
                    sx={{
                      py: 2,
                      borderStyle: 'dashed',
                      borderWidth: 2,
                      '&:hover': {
                        borderStyle: 'dashed',
                        borderWidth: 2,
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    Seleccionar carpeta
                    <input
                      type="file"
                      webkitdirectory=""
                      multiple
                      onChange={(e) => handleFolderUpload(e.target.files)}
                      style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer'
                      }}
                      {...({} as DirectoryInputProps)}
                    />
                  </Button>
                </Box>
                <Typography variant="caption" color="textSecondary">
                  Selecciona una carpeta para subir todos sus archivos y subcarpetas.
                </Typography>
              </Box>

              <Box>
                <Paper
                  sx={{
                    border: '2px dashed',
                    borderColor: 'primary.main',
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                    bgcolor: 'action.hover',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.selected'
                    }
                  }}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                >
                  <Iconify icon="mdi:cloud-upload" style={{ fontSize: 48, marginBottom: 16 }} />
                  <Typography variant="body1" gutterBottom>
                    Arrastra y suelta archivos aqui.
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Soporta archivos y carpetas. Puedes subir múltiples archivos o una carpeta completa.
                  </Typography>
                </Paper>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowUpload(false)}>Cancelar</Button>
          </DialogActions>
        </Dialog>

        {/* Create Folder Dialog */}
        <Dialog open={createFolderDialog} onClose={() => setCreateFolderDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Crear nueva carpeta</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Nombre de carpeta"
              fullWidth
              variant="outlined"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newFolderName.trim()) {
                  createFolder(newFolderName.trim());
                }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateFolderDialog(false)}>Cancelar</Button>
            <Button
              onClick={() => createFolder(newFolderName.trim())}
              variant="contained"
              disabled={!newFolderName.trim()}
            >
              Crear
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
}
