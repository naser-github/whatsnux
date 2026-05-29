import { app, shell, dialog, session, ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { SESSION_PARTITION } from '../shared/constants';

function uniqueDownloadPath(downloadsPath: string, filename: string): string {
  const parsed = path.parse(filename);
  let candidate = path.join(downloadsPath, filename);
  let index = 1;

  while (fs.existsSync(candidate)) {
    candidate = path.join(downloadsPath, `${parsed.name} (${index})${parsed.ext}`);
    index += 1;
  }

  return candidate;
}

export function setupDownloads(): void {
  const s = session.fromPartition(SESSION_PARTITION);

  s.on('will-download', (_event, item) => {
    const downloadsPath = app.getPath('downloads');

    item.setSavePath(uniqueDownloadPath(downloadsPath, item.getFilename()));

    item.on('done', (_event2, state) => {
      if (state === 'cancelled' || state === 'interrupted') {
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
