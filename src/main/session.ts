import { session } from 'electron';
import { SESSION_PARTITION } from '../shared/constants';
import { setupPermissions } from './permissions';

export function setupSession(): void {
  const s = session.fromPartition(SESSION_PARTITION);

  // Persist login cookies/storage between restarts
  // Partition name 'persist:whatsapp' ensures data is saved to disk.

  // Set up granular permission handling
  setupPermissions();
}

export function getSession(): Electron.Session {
  return session.fromPartition(SESSION_PARTITION);
}