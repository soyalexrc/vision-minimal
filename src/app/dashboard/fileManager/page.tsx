import { CONFIG } from 'src/global-config';

import { FileExplorerView } from '../../../sections/file-explorer/view/file-explorer-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Gestion de archivos - ${CONFIG.appName}` };

export default function Page() {
  return <FileExplorerView />;
}
