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
import { List , Toolbar, ListItem, CardContent, ListItemSecondaryAction } from '@mui/material';

import axios from '../../../lib/axios';
import { paths } from '../../../routes/paths';
import { Iconify } from '../../../components/iconify';
import { DashboardContent } from '../../../layouts/dashboard';
import { CustomBreadcrumbs } from '../../../components/custom-breadcrumbs';

export function FileExplorerView() {
  const theme = useTheme();
  const [currentPath, setCurrentPath] = useState('');
  const [items, setItems] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [showUpload, setShowUpload] = useState(false);
  const [contextMenu, setContextMenu] = useState<any>(null);
  const [editingItem, setEditingItem] = useState(null);
  const [newName, setNewName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [createFolderDialog, setCreateFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Mock API calls - replace with your actual Hono backend endpoints
  const apiBase = '/api/r2'; // Your Hono worker endpoint

  const fetchItems = async (path = '') => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/r2/list?path=' + encodeURIComponent(path));
      if (response.status !== 200 ) throw new Error('Failed to fetch items');
      const data = await response.data;
      setItems(data.data || []);
    } catch (error: any) {
      console.error('Error fetching items:', error);
      setError('Failed to load files and folders');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const downloadItem = async (item: any) => {
    try {
      const response = await axios.get('/r2/download?path=' + encodeURIComponent(item.path), {
        responseType: 'blob'
      });

      if (response.status !== 200) throw new Error('Failed to download file');
      const blob = await response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Error downloading file:', error);
      setError('Failed to download file');
    }
  };

  const deleteItem = async (item: any) => {
    try {
      const response = await axios.delete(`/r2/delete?path=${encodeURIComponent(item.path) }`);
      if (response.status !== 200) throw new Error('Failed to delete item');
      fetchItems(currentPath);
    } catch (error) {
      console.error('Error deleting item:', error);
      setError('Failed to delete item');
    }
  };

  const renameItem = async (item: any, nName: string) => {
    try {
      const response = await axios.put('/r2/rename', {
        oldPath: item.path,
        newName: nName
      });
      if (response.status !== 200) throw new Error('Failed to rename item');
      fetchItems(currentPath);
      setEditingItem(null);
    } catch (error) {
      console.error('Error renaming item:', error);
      setError('Failed to rename item');
    }
  };

  const createFolder = async (folderName: string) => {
    try {
      const response = await axios.post('/r2/create-folder', {
        path: currentPath,
        name: folderName
      });
      if (response.status !== 200 && response.status !== 201) throw new Error('Failed to create folder');
      fetchItems(currentPath);
      setCreateFolderDialog(false);
      setNewFolderName('');
    } catch (error) {
      console.error('Error creating folder:', error);
      setError('Failed to create folder');
    }
  };
  const handleFolderUpload = async (files) => {
    const formData = new FormData();
    formData.append('baseFolder', currentPath);

    Array.from(files).forEach(file => {
      // Get the relative path from the file's webkitRelativePath
      const relativePath = file.webkitRelativePath || file.name;

      // Append both the file and its relative path
      formData.append('files', file);
      formData.append('paths', relativePath);
    });

    try {
      const response = await axios.post(`/r2/upload/folder`, formData);
      if (response.status !== 200 && response.status !== 201) throw new Error('Failed to upload folder');

      const result = await response.data;
      console.log(`Uploaded ${result.totalFiles} files in ${result.foldersCreated} folders`);

      fetchItems(currentPath);
      setShowUpload(false);
    } catch (error) {
      console.error('Error uploading folder:', error);
      setError('Failed to upload folder');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const itemsDropped =  Array.from(e.dataTransfer.items);
    const files = [];

    // Check if any items are directories
    const hasDirectories = itemsDropped.some(item =>
      item.webkitGetAsEntry && item.webkitGetAsEntry()?.isDirectory
    );

    if (hasDirectories) {
      // Handle folder drop
      const promises = itemsDropped.map(item => {
        const entry = item.webkitGetAsEntry();
        if (entry) {
          return processEntry(entry, '');
        }
        return Promise.resolve([]);
      });

      Promise.all(promises).then(results => {
        const allFileObjects = results.flat();
        if (allFileObjects.length > 0) {
          // Convert file objects back to files for upload
          const filesForUpload = allFileObjects.map(fileObj => {
            const file = fileObj.file;
            // Store the relative path as a property on the file for later access
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
      // Handle regular file drop
      const fileList = Array.from(e.dataTransfer.files);
      if (fileList.length > 0) {
        handleFileUpload(fileList);
      }
    }
  };

  const handleFolderUploadFromDrop = async (files) => {
    const formData = new FormData();
    formData.append('baseFolder', currentPath);

    files.forEach(file => {
      // Get the relative path from our custom property or fallback to webkitRelativePath
      const relativePath = file.customRelativePath || file.webkitRelativePath || file.name;

      // Append the file with the relative path as filename
      formData.append('files', file, relativePath);
      formData.append('paths', relativePath);
    });

    try {
      const response = await axios.post(`/r2/upload/folder`, formData);
      if (response.status !== 200 && response.status !== 201) throw new Error('Failed to upload folder');

      const result = await response.data;
      console.log(`Uploaded ${result.totalFiles} files in ${result.foldersCreated} folders`);

      fetchItems(currentPath);
      setShowUpload(false);
    } catch (error) {
      console.error('Error uploading folder:', error);
      setError('Failed to upload folder');
    }
  };


  const processEntry = (entry, path) => new Promise((resolve) => {
      if (entry.isFile) {
        entry.file((file) => {
          // Create a new object with path information instead of modifying the file
          const fileWithPath = {
            file,
            relativePath: path + file.name
          };
          resolve([fileWithPath]);
        });
      } else if (entry.isDirectory) {
        const dirReader = entry.createReader();
        dirReader.readEntries((entries) => {
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

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileUpload = async (files: any) => {
    const formData = new FormData();
    formData.append('folder', currentPath);
    formData.append('shouldGenerateKey','false');

    Array.from(files).forEach((file: any) => {
      // const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');

      // const modifiedFile = new File([file], nameWithoutExtension, {
      //   type: file.type,
      //   lastModified: file.lastModified
      // });

      formData.append('files', file);
    });

    try {
      const response = await axios.post(`/r2/upload/multiple`, formData);
      if (response.status !== 200 && response.status !== 201) throw new Error('Failed to upload files');
      fetchItems(currentPath);
      setShowUpload(false);
    } catch (error: any) {
      console.error('Error uploading files:', error);
      setError('Failed to upload files');
    }
  };

  const navigateToFolder = (folderPath: any) => {
    setCurrentPath(folderPath);
    setSelectedItems(new Set());
  };

  const goBack = () => {
    const pathParts = currentPath.split('/').filter(Boolean);
    pathParts.pop();
    const parentPath = pathParts.join('/');
    setCurrentPath(parentPath);
  };

  const handleContextMenu = (e, item) => {
    e.preventDefault();
    setContextMenu({
      mouseX: e.clientX - 2,
      mouseY: e.clientY - 4,
      item
    });
  };

  const handleContextMenuClose = () => {
    setContextMenu(null);
  };

  const filteredItems = items.filter((item: any) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchItems(currentPath);
  }, [currentPath]);

  const formatFileSize = (bytes: any) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: any) => new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const iconMap = {
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
    return iconMap[extension] || 'mdi:file';
  };


  const renderGridView = () => (
    <Grid container spacing={2}>
      {filteredItems.map((item: any) => (
        <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }}  key={item.path}>
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
                    // onBlur={() => renameItem(item, newName)}
                    onKeyPress={(e) => {
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
        {filteredItems.map((item, index) => (
          <Fragment key={item.path}>
            <ListItem
              sx={{
                cursor: 'pointer',
                bgcolor: selectedItems.has(item.path) ? 'action.selected' : 'background.paper',
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
              button
              onClick={() => {
                if (item.type === 'folder') {
                  navigateToFolder(item.path);
                }
              }}
              onContextMenu={(e) => handleContextMenu(e, item)}
              selected={selectedItems.has(item.path)}
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
                      onChange={(e) => setNewName(e.target.value)}
                      // onBlur={() => renameItem(item, newName)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') renameItem(item, newName);
                        if (e.key === 'Escape') setEditingItem(null);
                      }}
                      size="small"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
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
            { name: 'Gestion de archivos', href: paths.dashboard.cashFlow.root },
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
                color="success"
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
          {/*{renderBreadcrumbs()}*/}

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
                downloadItem(contextMenu.item);
                handleContextMenuClose();
              }}
            >
              <Iconify icon="mdi:download" style={{ marginRight: 8 }} />
              Download
            </MenuItem>
          )}
          <MenuItem
            onClick={() => {
              setEditingItem(contextMenu.item.path);
              setNewName(contextMenu.item.name);
              handleContextMenuClose();
            }}
          >
            <Iconify icon="mdi:pencil" style={{ marginRight: 8 }} />
            Rename
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete "${contextMenu.item.name}"?`)) {
                deleteItem(contextMenu.item);
              }
              handleContextMenuClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="mdi:delete" style={{ marginRight: 8 }} />
            Delete
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
                      onChange={(e) => handleFileUpload(e.target.files)}
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
                      directory=""
                      multiple
                      onChange={(e) => handleFolderUpload(e.target.files)}
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
                <Typography variant="caption" color="text.secondary">
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
              onKeyPress={(e) => {
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
