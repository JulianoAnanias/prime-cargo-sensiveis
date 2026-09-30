import { saveMidia, getMidia, deleteMidia, getAllMidias } from './store';

export async function saveMidiaBlob(midiaId: string, blob: Blob, vistoriaId: string, userId: string, metadata: any = {}) {
  await saveMidia({
    midiaId,
    vistoriaId,
    userId,
    syncStatus: 'pending',
    blob,
    metadata
  });
}

export async function getMidiaBlob(midiaId: string): Promise<Blob | null> {
  const midia = await getMidia(midiaId);
  return midia ? midia.blob : null;
}

export async function getMidiaUrl(midiaId: string): Promise<string | null> {
  const blob = await getMidiaBlob(midiaId);
  if (blob) {
    return URL.createObjectURL(blob);
  }
  return null;
}

export async function deleteMidiaBlob(midiaId: string) {
  await deleteMidia(midiaId);
}

export async function getStorageUsage(): Promise<{ used: number, total: number }> {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    return {
      used: estimate.usage || 0,
      total: estimate.quota || 0
    };
  }
  return { used: 0, total: 0 };
}

export async function cleanupOldMidia(daysOld: number) {
  const cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
  const midias = await getAllMidias('syncStatus', 'synced');
  
  for (const midia of midias) {
    // Assumindo que criamos uma propriedade dataCriacao no metadata
    if (midia.metadata?.dataCriacao && midia.metadata.dataCriacao < cutoff) {
      await deleteMidia(midia.midiaId);
    }
  }
}
