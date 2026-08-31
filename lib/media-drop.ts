import {ALLOWED_TYPES, MAX_BYTES} from './media-validation';

export const MAX_BATCH_FILES = 500;
const extensions: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp',
  gif: 'image/gif', avif: 'image/avif', mp4: 'video/mp4', webm: 'video/webm',
};
export function uploadType(file: Pick<File, 'name' | 'type'>) {
  // Finder/browser combinations sometimes omit the MIME type. The server still
  // checks the actual bytes, so an extension never bypasses content validation.
  return file.type && file.type !== 'application/octet-stream'
    ? file.type : extensions[file.name.split('.').pop()?.toLowerCase() || ''] || '';
}
export function uploadProblem(file: Pick<File, 'name' | 'type' | 'size'>) {
  if (!ALLOWED_TYPES.includes(uploadType(file))) return 'Unsupported format. Export JPG, PNG, WebP, GIF, AVIF, MP4 or WebM.';
  if (!file.size) return 'This file is empty.';
  if (file.size > MAX_BYTES) return 'Larger than 25 MB. Export a smaller copy.';
  return null;
}

export type DroppedEntry = {
  name: string; isFile: boolean; isDirectory: boolean;
  file?: (success: (file: File) => void, error: (error: unknown) => void) => void;
  createReader?: () => {readEntries: (success: (entries: DroppedEntry[]) => void, error: (error: unknown) => void) => void};
};
export type DropSnapshot = {entry: DroppedEntry | null; file: File | null}[];
export function snapshotDrop(data: DataTransfer): DropSnapshot {
  // Capture synchronously inside the drop event, before its protected data store closes.
  const items = Array.from(data.items || []).filter(item => item.kind === 'file');
  if (!items.length) return Array.from(data.files).map(file => ({entry: null, file}));
  return items.map(item => {
    const entryItem = item as DataTransferItem & {getAsEntry?: () => FileSystemEntry | null};
    let entry = null;
    try {entry = (entryItem.getAsEntry?.() || item.webkitGetAsEntry?.() || null) as DroppedEntry | null;} catch {}
    return {entry, file: item.getAsFile()};
  });
}
export async function collectDrop(snapshot: DropSnapshot) {
  const files: File[] = [], issues: string[] = [];
  let entriesSeen = 0;
  const add = (file: File) => {
    if (file.name.startsWith('.')) return;
    if (files.length >= MAX_BATCH_FILES) throw new Error('Choose a smaller folder or batch: up to 500 files at a time. Nothing from this batch was uploaded.');
    files.push(file);
  };
  async function visit(entry: DroppedEntry, path = '', depth = 0): Promise<void> {
    if (entry.name.startsWith('.')) return;
    if (++entriesSeen > 10000 || depth > 32) throw new Error('This folder is too large or deeply nested. Drag a smaller selection. Nothing from this batch was uploaded.');
    const label = path + entry.name;
    if (entry.isFile && entry.file) {
      let file: File;
      try {file = await new Promise<File>((resolve, reject) => entry.file!(resolve, reject));}
      catch {issues.push(`${label}: could not read this file. Download cloud-only files first, then try again.`);return;}
      add(file);
    } else if (entry.isDirectory && entry.createReader) {
      const reader = entry.createReader();
      for (;;) {
        let children: DroppedEntry[];
        try {children = await new Promise<DroppedEntry[]>((resolve, reject) => reader.readEntries(resolve, reject));}
        catch {issues.push(`${label}: could not read this folder. Try dragging its files instead.`);break;}
        if (!children.length) break;
        for (const child of children) await visit(child, label + '/', depth + 1);
      }
    } else issues.push(`${label}: folder access is unavailable. Drag its files instead.`);
  }
  for (const item of snapshot) {
    if (item.entry) await visit(item.entry);
    else if (item.file) add(item.file);
    else issues.push('This browser could not read a dropped item. Open its folder and drag the files instead.');
  }
  return {files, issues};
}
