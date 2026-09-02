import { env } from 'cloudflare:workers';

export function runtimeString(name: string, fallback = ''): string {
  const fromWorker =
    (env as unknown as Record<string, unknown> | undefined)?.[name];
  if (typeof fromWorker === 'string' && fromWorker) return fromWorker;

  const fromProcess = process.env[name];
  if (typeof fromProcess === 'string' && fromProcess) return fromProcess;

  return fallback;
}
