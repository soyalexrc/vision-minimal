import type { ICloseCashFlowItem } from 'src/types/cashflow';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import CardContent from '@mui/material/CardContent';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';

import { Iconify } from '../../components/iconify/iconify';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  currentInfo: ICloseCashFlowItem;
};

interface CurrencyAmount {
  bs: number;
  eur: number;
  usd: number;
}

const formatCurrency = (amount: number, currency: string) => {
  const symbols = { bs: 'Bs.', eur: '€', usd: '$' };
  return `${symbols[currency as keyof typeof symbols]} ${amount.toLocaleString('es-ES', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};

const CurrencyDisplay = ({ amounts, title }: { amounts: CurrencyAmount; title: string }) => (
  <Box>
    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
      {title}
    </Typography>
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Typography variant="body2">{formatCurrency(amounts.bs, 'bs')}</Typography>
      <Typography variant="body2">{formatCurrency(amounts.eur, 'eur')}</Typography>
      <Typography variant="body2">{formatCurrency(amounts.usd, 'usd')}</Typography>
    </Box>
  </Box>
);

const SummaryCard = ({ 
  title, 
  amounts, 
  icon, 
  color = 'primary' 
}: { 
  title: string; 
  amounts: CurrencyAmount; 
  icon: React.ReactNode;
  color?: 'primary' | 'success' | 'error' | 'warning';
}) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: 40,
          height: 40,
          borderRadius: 1,
          bgcolor: `${color}.lighter`,
          color: `${color}.main`,
          mr: 2
        }}>
          {icon}
        </Box>
        <Typography variant="h6" component="h3">
          {title}
        </Typography>
      </Box>
      <CurrencyDisplay amounts={amounts} title="" />
    </CardContent>
  </Card>
);

export function CloseCashFlowQuickView({ currentInfo, open, onClose }: Props) {
  if (!currentInfo?.data?.totals) {
    return (
      <Dialog
        fullWidth
        maxWidth={false}
        open={open}
        onClose={onClose}
        slotProps={{
          paper: {
            sx: { maxWidth: 720 },
          },
        }}
      >
        <DialogTitle>Cierre de Caja</DialogTitle>
        <DialogContent>
          <Typography>No hay información disponible</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    );
  }

  const { totals } = currentInfo.data;
  const { resumen, cuentas, analisis, flujoDeEfectivo } = totals;

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: { maxWidth: 1200 },
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Iconify icon="material-symbols:account-balance" />
          <Typography variant="h6">
            Cierre de Caja - {new Date(currentInfo.date!).toLocaleDateString('es-ES')}
          </Typography>
        </Box>
        <Chip 
          label={`ID: ${currentInfo.id}`} 
          size="small" 
          variant="outlined" 
        />
        <IconButton onClick={onClose} size="small">
          <Iconify icon="material-symbols:close" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Resumen Principal */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="material-symbols:trending-up" color="primary" />
            Resumen Financiero
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard
                title="Ingresos Totales"
                amounts={resumen.ingresoTotal}
                icon={<Iconify icon="material-symbols:trending-up" />}
                color="success"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard
                title="Egresos Totales"
                amounts={resumen.egresoTotal}
                icon={<Iconify icon="material-symbols:trending-down" />}
                color="error"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard
                title="Utilidad Neta"
                amounts={resumen.utilidadNeta}
                icon={<Iconify icon="material-symbols:account-balance" />}
                color="primary"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard
                title="Disponibilidad Total"
                amounts={resumen.disponibilidadTotal}
                icon={<Iconify icon="material-symbols:account-balance" />}
                color="warning"
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Cuentas por Pagar y Cobrar */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Estado de Cuentas
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6}}>
              <Card>
                <CardContent>
                  <CurrencyDisplay 
                    amounts={cuentas.cuentasPorCobrar} 
                    title="Cuentas por Cobrar" 
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6}}>
              <Card>
                <CardContent>
                  <CurrencyDisplay 
                    amounts={cuentas.cuentasPorPagar} 
                    title="Cuentas por Pagar" 
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Disponibilidad por Entidad */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Disponibilidad por Entidad
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Entidad</strong></TableCell>
                  <TableCell align="right"><strong>Bolívares (Bs.)</strong></TableCell>
                  <TableCell align="right"><strong>Euros (€)</strong></TableCell>
                  <TableCell align="right"><strong>Dólares ($)</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(analisis.disponibilidadPorEntidad).map(([entidad, amounts]) => (
                  <TableRow key={entidad} hover>
                    <TableCell component="th" scope="row">
                      <Typography variant="body2" fontWeight="medium">
                        {entidad}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency((amounts as CurrencyAmount).bs, 'bs')}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency((amounts as CurrencyAmount).eur, 'eur')}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency((amounts as CurrencyAmount).usd, 'usd')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Flujo de Efectivo */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Flujo de Efectivo
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ bgcolor: 'success.lighter' }}>
                <CardContent>
                  <CurrencyDisplay 
                    amounts={flujoDeEfectivo.ingreso} 
                    title="Ingresos de Efectivo" 
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ bgcolor: 'error.lighter' }}>
                <CardContent>
                  <CurrencyDisplay 
                    amounts={flujoDeEfectivo.egreso} 
                    title="Egresos de Efectivo" 
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ bgcolor: 'warning.lighter' }}>
                <CardContent>
                  <CurrencyDisplay 
                    amounts={flujoDeEfectivo.disponibilidad} 
                    title="Disponibilidad de Efectivo" 
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Información adicional */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Fecha de creación:</strong> {new Date(currentInfo.createdAt!).toLocaleString('es-ES')}
            {' • '}
            <strong>Última actualización:</strong> {new Date(currentInfo.updatedAt!).toLocaleString('es-ES')}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}