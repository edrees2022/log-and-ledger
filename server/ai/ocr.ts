/*
  Basic OCR module abstraction (placeholder implementation)
  - Future: integrate tesseract.js or external OCR service
  - Current: returns stub text with warnings so pipeline wiring can proceed safely
*/

export type OCRResult = {
  text: string;
  warnings: string[];
  engine: string;
  durationMs: number;
};

export async function performOCR(base64Image: string): Promise<OCRResult> {
  const started = Date.now();
  // Attempt real OCR via tesseract.js if available; fallback to placeholder.
  try {
    let usePlaceholder = false;
    let ocrText: string | null = null;
    // Basic sanity: decode small images only (cap ~6MB raw)
    const buf = Buffer.from(base64Image, 'base64');
    if (buf.length > 6 * 1024 * 1024) {
      usePlaceholder = true;
    } else {
      try {
        // Dynamic import; not a hard dependency.
        // @ts-ignore optional dependency – resolved at runtime if installed
        const tesseract = await import('tesseract.js');
        const { createWorker } = (tesseract as any);
        if (createWorker) {
          const worker = await createWorker({ logger: () => undefined });
          await worker.loadLanguage('eng');
          await worker.initialize('eng');
          const { data } = await worker.recognize(buf);
          ocrText = data?.text || '';
          await worker.terminate();
        } else {
          usePlaceholder = true;
        }
      } catch (e) {
        usePlaceholder = true;
      }
    }
    if (usePlaceholder || !ocrText) {
      const approxChars = Math.min(2000, Math.max(200, Math.floor(base64Image.length / 50)));
      const pseudo = `OCR_PLACEHOLDER_TEXT_START\n${'X'.repeat(approxChars)}\nOCR_PLACEHOLDER_TEXT_END`;
      return {
        text: pseudo,
        warnings: [ 'OCR placeholder used', ...(buf.length > 6 * 1024 * 1024 ? ['Image exceeded safe OCR size cap'] : []) ],
        engine: 'placeholder',
        durationMs: Date.now() - started,
      };
    }
    return {
      text: ocrText,
      warnings: [],
      engine: 'tesseract',
      durationMs: Date.now() - started,
    };
  } catch (e:any) {
    return {
      text: '',
      warnings: ['OCR failure: ' + (e?.message || 'unknown error')],
      engine: 'error',
      durationMs: Date.now() - started,
    };
  }
}
