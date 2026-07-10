/**
 * PDF Export Helper Functions
 * Utilities for preloading assets and preparing DOM for PDF capture
 */

/**
 * Preload all images in a DOM node
 * Returns a promise that resolves when all images are loaded
 */
export async function preloadImages(node: HTMLElement): Promise<void> {
  const images = node.querySelectorAll('img');
  const imagePromises: Promise<void>[] = [];

  images.forEach((img) => {
    if (img.complete) {
      return; // Already loaded
    }

    const promise = new Promise<void>((resolve, reject) => {
      const tempImg = new Image();
      tempImg.onload = () => resolve();
      tempImg.onerror = () => resolve(); // Resolve even on error to not block
      tempImg.src = img.src;
    });

    imagePromises.push(promise);
  });

  await Promise.all(imagePromises);
}

/**
 * Wait for all web fonts to be loaded
 * Uses document.fonts.ready API
 */
export async function waitForFonts(): Promise<void> {
  if ('fonts' in document) {
    await document.fonts.ready;
  }
  // Small additional delay to ensure fonts are fully rendered
  await new Promise((resolve) => setTimeout(resolve, 100));
}

/**
 * Create an off-screen render target for PDF capture
 * Fixed width for A4 paper at 96 DPI
 */
export function createRenderTarget(): HTMLDivElement {
  const container = document.createElement('div');
  
  // A4 dimensions at 96 DPI: 794px × 1123px
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px';
  container.style.minHeight = '1123px';
  container.style.backgroundColor = '#ffffff';
  container.style.zIndex = '-1';
  
  document.body.appendChild(container);
  
  return container;
}

/**
 * Remove the render target from DOM
 */
export function removeRenderTarget(container: HTMLDivElement): void {
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
  }
}

/**
 * Generate PDF filename from invoice data
 */
export function generateFilename(invoiceNumber: string, clientName: string): string {
  // Sanitize strings for filename
  const sanitize = (str: string) => {
    return str
      .replace(/[^a-z0-9]/gi, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
  };

  const sanitizedInvoiceNumber = sanitize(invoiceNumber);
  const sanitizedClientName = sanitize(clientName);

  return `Invoice-${sanitizedInvoiceNumber}-${sanitizedClientName}.pdf`;
}

/**
 * Wait with timeout
 * Rejects if timeout is reached
 */
export async function waitWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string = 'Operation timed out'
): Promise<T> {
  const timeoutPromise = new Promise<T>((_, reject) => {
    setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}
