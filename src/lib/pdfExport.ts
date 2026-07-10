/**
 * PDF Export Main Function
 * Orchestrates the full PDF generation pipeline
 */

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { Invoice } from '../types/invoice.types';
import {
  preloadImages,
  waitForFonts,
  createRenderTarget,
  removeRenderTarget,
  generateFilename,
  waitWithTimeout,
} from './pdfHelpers';
import { calculatePageSlices, sliceCanvas, A4_WIDTH_PX, A4_HEIGHT_PX } from './pdfSlicing';

export interface PdfExportOptions {
  onProgress?: (message: string) => void;
  timeout?: number;
}

export interface PdfExportResult {
  success: boolean;
  filename?: string;
  error?: string;
}

/**
 * Export invoice to PDF
 * @param invoice - Invoice data to export
 * @param templateElement - Rendered template React element (as HTML)
 */
export async function exportInvoiceToPdf(
  invoice: Invoice,
  templateElement: HTMLElement,
  options: PdfExportOptions = {}
): Promise<PdfExportResult> {
  const { onProgress, timeout = 15000 } = options;
  let renderTarget: HTMLDivElement | null = null;

  try {
    // Step 1: Create off-screen render target
    onProgress?.('Preparing document...');
    renderTarget = createRenderTarget();

    // Clone the template element into render target
    const clonedElement = templateElement.cloneNode(true) as HTMLElement;
    renderTarget.appendChild(clonedElement);

    // Step 2: Wait for assets to load
    onProgress?.('Loading assets...');
    await waitWithTimeout(
      Promise.all([
        preloadImages(renderTarget),
        waitForFonts(),
      ]),
      timeout,
      'Asset loading timed out'
    );

    // Small delay to ensure rendering is complete
    await new Promise(resolve => setTimeout(resolve, 300));

    // Step 3: Capture with html2canvas
    onProgress?.('Capturing document...');
    const canvas = await waitWithTimeout(
      html2canvas(renderTarget, {
        scale: 2, // 2x for high resolution
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: A4_WIDTH_PX,
        windowHeight: renderTarget.scrollHeight,
      }),
      timeout,
      'Document capture timed out'
    );

    // Step 4: Calculate page slices
    onProgress?.('Processing pages...');
    const contentHeight = renderTarget.scrollHeight;
    const slices = calculatePageSlices(contentHeight, renderTarget);

    // Step 5: Slice canvas into pages
    const pageCanvases = sliceCanvas(canvas, slices);

    if (pageCanvases.length === 0) {
      throw new Error('No pages generated');
    }

    // Step 6: Create PDF and add pages
    onProgress?.('Generating PDF...');
    
    // A4 dimensions in mm (210 × 297)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm

    // Add each page to PDF
    pageCanvases.forEach((pageCanvas, index) => {
      if (index > 0) {
        pdf.addPage();
      }

      // Calculate height to maintain aspect ratio
      const imgWidth = pdfWidth;
      const imgHeight = (pageCanvas.height * pdfWidth) / pageCanvas.width;
      
      // Convert canvas to image and add to PDF
      const imgData = pageCanvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, pdfHeight));
    });

    // Step 7: Generate filename and download
    onProgress?.('Downloading...');
    const filename = generateFilename(invoice.invoiceNumber, invoice.client.name);
    pdf.save(filename);

    // Cleanup
    if (renderTarget) {
      removeRenderTarget(renderTarget);
    }

    return {
      success: true,
      filename,
    };

  } catch (error) {
    // Cleanup on error
    if (renderTarget) {
      removeRenderTarget(renderTarget);
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('PDF export failed:', error);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Simplified export function that works with a selector
 * Finds the template element in the DOM and exports it
 */
export async function exportInvoiceToPdfFromSelector(
  invoice: Invoice,
  selector: string,
  options: PdfExportOptions = {}
): Promise<PdfExportResult> {
  const element = document.querySelector(selector) as HTMLElement;
  
  if (!element) {
    return {
      success: false,
      error: `Template element not found: ${selector}`,
    };
  }

  return exportInvoiceToPdf(invoice, element, options);
}
