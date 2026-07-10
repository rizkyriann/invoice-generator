import type { ComponentType } from 'react';
import type { Invoice } from '../types/invoice.types';

export interface TemplateMeta {
  id: string;
  name: string;
  description: string;
  accentColor: string;
  previewThumbnailUrl: string;
}

export type TemplateComponent = ComponentType<{ invoice: Invoice }>;

export const TEMPLATE_METADATA: TemplateMeta[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean whitespace, thin rules, single accent',
    accentColor: '#6366f1',
    previewThumbnailUrl: '/templates/minimal-thumb.png',
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Bold typography, colored total block',
    accentColor: '#8b5cf6',
    previewThumbnailUrl: '/templates/modern-thumb.png',
  },
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Structured grid, muted palette, formal',
    accentColor: '#0ea5e9',
    previewThumbnailUrl: '/templates/corporate-thumb.png',
  },
];

// Template components are lazy-loaded
export const TEMPLATE_COMPONENTS: Record<string, () => Promise<{ default: TemplateComponent }>> = {
  minimal: () => import('./TemplateMinimal'),
  modern: () => import('./TemplateModern'),
  corporate: () => import('./TemplateCorporate'),
};

/**
 * TEMPLATE CONTRACT
 * 
 * All template components MUST:
 * 1. Accept a single prop: { invoice: Invoice }
 * 2. Render these regions (even if styled differently):
 *    - Header: Business identity + invoice number/dates
 *    - Bill-to: Client details
 *    - Line items: Table or card list of invoice items
 *    - Totals: Subtotal through remaining balance
 *    - Footer: Notes, T&C, and extras (QR, signature, stamp if present)
 * 3. NOT import any components from components/ui/ (templates are documents, not app chrome)
 * 4. NOT drop any data present in the Invoice object
 * 5. Be purely presentational (no state, no side effects)
 */
