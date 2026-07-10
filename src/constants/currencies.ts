import type { Currency } from '../types/invoice.types';

export const CURRENCIES: Currency[] = [
  { code: 'IDR', symbol: 'Rp', locale: 'id-ID' },
  { code: 'USD', symbol: '$', locale: 'en-US' },
  { code: 'EUR', symbol: '€', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', locale: 'en-GB' },
  { code: 'JPY', symbol: '¥', locale: 'ja-JP' },
  { code: 'AUD', symbol: 'A$', locale: 'en-AU' },
  { code: 'CAD', symbol: 'C$', locale: 'en-CA' },
  { code: 'CHF', symbol: 'CHF', locale: 'de-CH' },
  { code: 'CNY', symbol: '¥', locale: 'zh-CN' },
  { code: 'SGD', symbol: 'S$', locale: 'en-SG' },
  { code: 'MYR', symbol: 'RM', locale: 'ms-MY' },
  { code: 'THB', symbol: '฿', locale: 'th-TH' },
  { code: 'PHP', symbol: '₱', locale: 'en-PH' },
  { code: 'INR', symbol: '₹', locale: 'en-IN' },
  { code: 'KRW', symbol: '₩', locale: 'ko-KR' },
  { code: 'VND', symbol: '₫', locale: 'vi-VN' },
];

export const DEFAULT_CURRENCY: Currency = CURRENCIES[0]; // IDR
