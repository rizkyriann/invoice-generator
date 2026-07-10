/**
 * PDF Multi-Page Slicing Logic
 * Handles splitting long invoices across multiple pages with smart page breaks
 */

// A4 dimensions at 96 DPI
export const A4_WIDTH_PX = 794;
export const A4_HEIGHT_PX = 1123;

// Allow some margin for safety
const PAGE_HEIGHT_WITH_MARGIN = A4_HEIGHT_PX - 40;

export interface PageSlice {
  startY: number;
  height: number;
  pageNumber: number;
}

/**
 * Calculate how many pages are needed for the content
 */
export function calculatePageCount(contentHeight: number): number {
  if (contentHeight <= A4_HEIGHT_PX) {
    return 1;
  }
  return Math.ceil(contentHeight / PAGE_HEIGHT_WITH_MARGIN);
}

/**
 * Find safe break points in the content
 * Looks for elements that can safely be split between pages
 */
function findSafeBreakPoints(container: HTMLElement): number[] {
  const breakPoints: number[] = [0];
  
  // Look for major sections that can be split
  const sections = container.querySelectorAll('[data-page-break], .page-break, tr, .invoice-item');
  
  sections.forEach((element) => {
    const rect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const relativeTop = rect.top - containerRect.top;
    
    if (relativeTop > 0) {
      breakPoints.push(Math.floor(relativeTop));
    }
  });
  
  // Sort and deduplicate
  return [...new Set(breakPoints)].sort((a, b) => a - b);
}

/**
 * Calculate optimal page slices that respect content boundaries
 */
export function calculatePageSlices(
  contentHeight: number,
  container?: HTMLElement
): PageSlice[] {
  // Single page case
  if (contentHeight <= A4_HEIGHT_PX) {
    return [
      {
        startY: 0,
        height: contentHeight,
        pageNumber: 1,
      },
    ];
  }

  // Multiple pages case
  const slices: PageSlice[] = [];
  let currentY = 0;
  let pageNumber = 1;

  // Get safe break points if container provided
  const breakPoints = container ? findSafeBreakPoints(container) : [];

  while (currentY < contentHeight) {
    const remainingHeight = contentHeight - currentY;
    let sliceHeight: number;

    if (remainingHeight <= A4_HEIGHT_PX) {
      // Last page - take all remaining content
      sliceHeight = remainingHeight;
    } else {
      // Find the best break point before the page limit
      const targetY = currentY + PAGE_HEIGHT_WITH_MARGIN;
      
      // Find closest safe break point before target
      const closestBreakPoint = breakPoints
        .filter((bp) => bp > currentY && bp <= targetY)
        .pop();

      if (closestBreakPoint && closestBreakPoint > currentY + 200) {
        // Use safe break point if it's reasonable (not too close to start)
        sliceHeight = closestBreakPoint - currentY;
      } else {
        // No good break point found, use standard page height
        sliceHeight = PAGE_HEIGHT_WITH_MARGIN;
      }
    }

    slices.push({
      startY: currentY,
      height: sliceHeight,
      pageNumber,
    });

    currentY += sliceHeight;
    pageNumber++;
  }

  return slices;
}

/**
 * Slice a canvas into multiple page canvases
 */
export function sliceCanvas(
  sourceCanvas: HTMLCanvasElement,
  slices: PageSlice[]
): HTMLCanvasElement[] {
  const pageCanvases: HTMLCanvasElement[] = [];

  slices.forEach((slice) => {
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = sourceCanvas.width;
    pageCanvas.height = Math.min(
      slice.height * (sourceCanvas.height / sourceCanvas.offsetHeight || 1),
      sourceCanvas.height - slice.startY * (sourceCanvas.height / sourceCanvas.offsetHeight || 1)
    );

    const ctx = pageCanvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Copy the slice from source canvas
    const sourceY = slice.startY * (sourceCanvas.height / sourceCanvas.offsetHeight || 1);
    
    ctx.drawImage(
      sourceCanvas,
      0,
      sourceY,
      sourceCanvas.width,
      pageCanvas.height,
      0,
      0,
      pageCanvas.width,
      pageCanvas.height
    );

    pageCanvases.push(pageCanvas);
  });

  return pageCanvases;
}

/**
 * Simple single-page slicing (fallback if smart slicing fails)
 */
export function sliceCanvasSimple(
  sourceCanvas: HTMLCanvasElement,
  contentHeight: number
): HTMLCanvasElement[] {
  const pageCount = calculatePageCount(contentHeight);
  
  if (pageCount === 1) {
    return [sourceCanvas];
  }

  const pageCanvases: HTMLCanvasElement[] = [];
  const scale = sourceCanvas.height / contentHeight;

  for (let i = 0; i < pageCount; i++) {
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = sourceCanvas.width;
    
    const isLastPage = i === pageCount - 1;
    const sliceHeight = isLastPage
      ? contentHeight - i * PAGE_HEIGHT_WITH_MARGIN
      : PAGE_HEIGHT_WITH_MARGIN;
    
    pageCanvas.height = sliceHeight * scale;

    const ctx = pageCanvas.getContext('2d');
    if (!ctx) continue;

    const sourceY = i * PAGE_HEIGHT_WITH_MARGIN * scale;
    
    ctx.drawImage(
      sourceCanvas,
      0,
      sourceY,
      sourceCanvas.width,
      pageCanvas.height,
      0,
      0,
      pageCanvas.width,
      pageCanvas.height
    );

    pageCanvases.push(pageCanvas);
  }

  return pageCanvases;
}
