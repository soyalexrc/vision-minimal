import React from 'react';

import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import {
  Box,
  Card,
  Grid,
  Chip,
  Stack,
  Paper,
  Typography,
  CardContent,
  LinearProgress
} from '@mui/material';

import { Iconify } from '../../components/iconify';

interface CurrencyData {
  bs: number;
  usd: number;
  eur: number;
}

interface ServiceData {
  ingreso: CurrencyData;
  egreso: CurrencyData;
  cuentasPorPagar: CurrencyData;
  utilidad: CurrencyData;
}

interface WayToPayData {
  ingreso: CurrencyData;
  egreso: CurrencyData;
  cuentasPorPagar: CurrencyData;
  disponibilidad: CurrencyData;
}

interface EntityData extends CurrencyData {
  desglosePorWayToPay: Record<string, WayToPayData>;
}

interface CashFlowData {
  flujoDeEfectivo: {
    ingreso: CurrencyData;
    egreso: CurrencyData;
    disponibilidad: CurrencyData;
  };
  cuentas: {
    cuentasPorCobrar: CurrencyData;
    cuentasPorPagar: CurrencyData;
  };
  analisis: {
    utilidad: CurrencyData;
    disponibilidadPorEntidad: Record<string, EntityData>;
    utilidadPorServicio: Record<string, ServiceData>;
  };
  resumen: {
    ingresoTotal: CurrencyData;
    egresoTotal: CurrencyData;
    utilidadNeta: CurrencyData;
    disponibilidadTotal: CurrencyData;
  };
}

const CashFlowDashboard: React.FC<{ data: CashFlowData }> = ({ data }) => {
  const [showExtra, setShowExtra] = React.useState<'accounts' | 'byEntity' | 'byService' | 'none'>('none');
  const formatCurrency = (amount: number, currency: string) => {
    if (amount === 0) return '-';
    const symbol = currency === 'usd' ? '$' : currency === 'eur' ? '€' : 'Bs';
    return `${symbol} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const getCurrencyColor = (amount: number) => {
    if (amount > 0) return 'success.main';
    if (amount < 0) return 'error.main';
    return 'text.secondary';
  };

  const CurrencyDisplay: React.FC<{ localData: CurrencyData; title: string; icon?: React.ReactNode }> = ({
                                                                                                      localData,
                                                                                                      title,
                                                                                                      icon
                                                                                                    }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          {icon}
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Stack>
        <Stack spacing={1}>
          {Object.entries(localData).map(([currency, amount]) => (
            <Box key={currency} display="flex" justifyContent="space-between" alignItems="center">
              <Chip
                label={currency.toUpperCase()}
                size="small"
                variant="outlined"
              />
              <Typography
                variant="body1"
                fontWeight="bold"
                color={getCurrencyColor(amount as number)}
              >
                {formatCurrency(amount as number, currency)}
              </Typography>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );

  const ServiceCard: React.FC<{ name: string; localData: ServiceData }> = ({ name, localData }) => {
    const totalUtilidad = localData.utilidad.bs + localData.utilidad.usd + localData.utilidad.eur;
    const totalIngreso = localData.ingreso.bs + localData.ingreso.usd + localData.ingreso.eur;
    const utilidadPercentage = totalIngreso > 0 ? (totalUtilidad / totalIngreso) * 100 : 0;

    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom noWrap title={name}>
            {name}
          </Typography>

          <Box mb={2}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Margen de Utilidad
            </Typography>
            <LinearProgress
              variant="determinate"
              value={Math.abs(utilidadPercentage)}
              color={utilidadPercentage >= 0 ? 'success' : 'error'}
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="caption" color={utilidadPercentage >= 0 ? 'success.main' : 'error.main'}>
              {utilidadPercentage.toFixed(1)}%
            </Typography>
          </Box>

          <Grid container spacing={1}>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">Ingreso</Typography>
              {Object.entries(localData.ingreso).map(([currency, amount]) => (
                amount !== 0 && (
                  <Typography key={currency} variant="body2" color="success.main">
                    {formatCurrency(amount as number, currency)}
                  </Typography>
                )
              ))}
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">Utilidad</Typography>
              {Object.entries(localData.utilidad).map(([currency, amount]) => (
                amount !== 0 && (
                  <Typography key={currency} variant="body2" color={getCurrencyColor(amount as number)}>
                    {formatCurrency(amount as number, currency)}
                  </Typography>
                )
              ))}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const EntityCard: React.FC<{ name: string; localData: EntityData }> = ({ name, localData }) => {
    const hasMainData = [localData.bs, localData.usd, localData.eur].some(val => val !== 0);

    const hasWayToPayData = Object.keys(localData.desglosePorWayToPay || {}).length > 0;

    return (
      <Paper sx={{ p: 2, height: '100%' }}>
        <Typography variant="subtitle2" gutterBottom noWrap title={name}>
          {name}
        </Typography>
        {/* Total de la entidad */}
        {hasMainData && (
          <Box mb={2}>
            <Typography variant="caption" color="primary.main" fontWeight="bold">
              Total Disponibilidad
            </Typography>
            <Stack spacing={0.5}>
              {Object.entries({ bs: localData.bs, usd: localData.usd, eur: localData.eur }).map(([currency, amount]) => (
                amount !== 0 && (
                  <Typography
                    key={currency}
                    variant="body2"
                    fontWeight="bold"
                    color={getCurrencyColor(amount)}
                  >
                    {formatCurrency(amount, currency)}
                  </Typography>
                )
              ))}
            </Stack>
          </Box>
        )}

        {/* Desglose por forma de pago */}
        {hasWayToPayData && (
          <Box>
            <Divider sx={{ mb: 1 }} />
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Desglose por Forma de Pago
            </Typography>

            <Stack spacing={1.5}>
              {Object.entries(localData.desglosePorWayToPay).map(([wayToPay, wayData]) => {
                const hasWayData = Object.values(wayData.disponibilidad).some(val => val !== 0);
                if (!hasWayData) return null;

                return (
                  <Paper
                    key={wayToPay}
                    variant="outlined"
                    sx={{ p: 1, backgroundColor: 'grey.50' }}
                  >
                    <Typography variant="caption" fontWeight="medium" color="text.primary">
                      {wayToPay}
                    </Typography>
                    <Stack spacing={0.25} mt={0.5}>
                      {Object.entries(wayData.disponibilidad).map(([currency, amount]) => (
                        amount !== 0 && (
                          <Typography
                            key={currency}
                            variant="caption"
                            color={getCurrencyColor(amount)}
                          >
                            {formatCurrency(amount, currency)}
                          </Typography>
                        )
                      ))}
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          </Box>
        )}
      </Paper>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Resumen Principal */}

      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <CurrencyDisplay
            localData={data.resumen.ingresoTotal}
            title="Ingresos"
            icon={<Iconify icon="material-symbols:trending-up" color="success" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <CurrencyDisplay
            localData={data.resumen.egresoTotal}
            title="Egresos"
            icon={<Iconify icon="material-symbols:trending-down" color="error" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <CurrencyDisplay
            localData={data.resumen.utilidadNeta}
            title="Utilidad Neta"
            icon={<Iconify icon="material-symbols:business-center" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <CurrencyDisplay
            localData={data.resumen.disponibilidadTotal}
            title="Disponibilidad"
            icon={<Iconify icon="material-symbols-light:account-balance-wallet" />}
          />
        </Grid>
      </Grid>

      {/* pills for select */}
      <Stack direction="row" spacing={1} mb={4}>
        <Chip
          label="Cuentas"
          variant={showExtra === 'accounts' ? 'filled' : 'outlined'}
          onClick={() => setShowExtra(showExtra === 'accounts' ? 'none' : 'accounts')}
          color={showExtra === 'accounts' ? 'primary' : 'default'}
          icon={<Iconify icon="mdi:account-cash" />}
        />
        <Chip
          label="Disponibilidad por Entidad"
          variant={showExtra === 'byEntity' ? 'filled' : 'outlined'}
          onClick={() => setShowExtra(showExtra === 'byEntity' ? 'none' : 'byEntity')}
          color={showExtra === 'byEntity' ? 'primary' : 'default'}
          icon={<Iconify icon="mdi:account-group" />}
        />
        <Chip
          label="Rentabilidad por Servicio"
          variant={showExtra === 'byService' ? 'filled' : 'outlined'}
          onClick={() => setShowExtra(showExtra === 'byService' ? 'none' : 'byService')}
          color={showExtra === 'byService' ? 'primary' : 'default'}
          icon={<Iconify icon="mdi:chart-bar" />}
        />
      </Stack>

      {/* Cuentas por Cobrar y Pagar */}
      {
        showExtra === 'accounts' &&
        <>
          <Typography variant="h5" gutterBottom>
            Gestión de Cuentas
          </Typography>

          <Grid container spacing={3} mb={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <CurrencyDisplay
                localData={data.cuentas.cuentasPorCobrar}
                title="Cuentas por Cobrar"
                icon={<Iconify icon="akar-icons:reciept" color="info" />}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <CurrencyDisplay
                localData={data.cuentas.cuentasPorPagar}
                title="Cuentas por Pagar"
                icon={<Iconify icon="akar-icons:reciept" color="warning" />}
              />
            </Grid>
          </Grid>
        </>
      }

      {/* Disponibilidad por Entidad */}
      {
        showExtra === 'byEntity' &&
        <>
          <Typography variant="h5" gutterBottom>
            Disponibilidad por Entidad
            <Tooltip title="Incluye desglose por forma de pago">
              <IconButton size="small">
                <Iconify icon="material-symbols:info" fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>

          <Grid container spacing={2} mb={4}>
            {Object.entries(data.analisis.disponibilidadPorEntidad).map(([entity, entityData]) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={entity}>
                <EntityCard name={entity} localData={entityData} />
              </Grid>
            ))}
          </Grid>
        </>
      }

      {/* Utilidad por Servicio */}
      {
        showExtra === 'byService' &&
        <>
          <Typography variant="h5" gutterBottom>
            Rentabilidad por Servicio
          </Typography>

          <Grid container spacing={3}>
            {Object.entries(data.analisis.utilidadPorServicio).map(([service, serviceData]) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={service}>
                <ServiceCard name={service} localData={serviceData} />
              </Grid>
            ))}
          </Grid>
        </>
      }
    </Box>
  );
};

export default CashFlowDashboard;

// Ejemplo de uso:
/*
import CashFlowDashboard from './components/CashFlowDashboard';

const data = {
  // Tu JSON aquí
};

function App() {
  return <CashFlowDashboard data={data} />;
}
*/
