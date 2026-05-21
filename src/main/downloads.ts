import { app, shell, dialog, session, ipcMain } from 'electron';
import { SESSION_PARTITION } from '../shared/constants';

export function setupDownloads(): void {
  const s = session.fromPartition(SESSION_PARTITION);

  s.on('will-download', (_event, item) => {
    const defaultPath = app.getPath('downloads');

    item.setSavePath(defaultPath + '/' + item.getFilename());

    item.on('done', (_event2, state) => {
      if (state === 'completed') {
        const filePath = item.getSavePath();
        shell.openPath(filePath);
      } else if (state === 'cancelled' || state === 'interrupted') {
        dialog.showErrorBox(
          'Download Failed',
          `The download "${item.getFilename()}" failed or was interrupted.`
        );
      }
    });
  });
}

export function setupDownloadIpc(): void {
  ipcMain.on('open-downloads-folder', () => {
    const downloadsPath = app.getPath('downloads');
    shell.openPath(downloadsPath);
  });
}