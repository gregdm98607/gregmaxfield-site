// Every Amazon buy link goes through /buy/<item>/<placement>. The redirect (vercel.json,
// generated from books.json by `npm run gen:buy`) appends the Amazon Attribution tag for
// that placement, so tags are set in one file and never hand-edited into pages.
import books from './books.json';

export type Placement = Exclude<keyof typeof books.attribution, `_${string}`>;
export type TlcFormat = keyof typeof books.tlc.formats;

export const buyTlc = (format: TlcFormat, placement: Placement) => `/buy/tlc-${format}/${placement}`;
export const buyTlcBookshop = (format: 'paperback' | 'hardcover', placement: Placement) => `/buy/tlc-${format}-bookshop/${placement}`;
export const buyWorkbook = (volume: number, placement: Placement) => `/buy/wb${volume}/${placement}`;
export const amazonDp = (asin: string) => `https://www.amazon.com/dp/${asin}`;
export { books };
