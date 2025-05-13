import Box from '@mui/material/Box';
import TableBody from '@mui/material/TableBody';

import { LoadingScreen, SplashScreen } from '../loading-screen';

interface TableBodyCustomProps {
  children: React.ReactNode;
  loading?: boolean;
}

export default function TableBodyCustom({
  children,
  loading = false
}: TableBodyCustomProps) {

  if (loading) {
    return (
      <Box sx={{ height: 300, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <LoadingScreen />
      </Box>
    )
  }
  return <TableBody sx={{ position: 'relative' }}>{children}</TableBody>;

}

