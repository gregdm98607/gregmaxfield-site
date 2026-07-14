// Canonical schema.org entity data + JSON-LD node builders.
// Single source of truth for structured data (SEO-01, SEO-02, LLM-01, LLM-03).
// Nodes are emitted as a @graph by BaseHead via StructuredData.astro; cross-node
// references use @id so entities are stated once and linked everywhere.

import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export const SITE_URL = 'https://www.gregmaxfield.com';
export const AMAZON_URL =
	'https://www.amazon.com/Lund-Covenant-novel-Greg-Maxfield/dp/B0H1XQCBPH';
// Kindle edition (its own ASIN).
export const KINDLE_URL = 'https://www.amazon.com/dp/B0H7FPRFP3';

// Stable @id anchors reused across nodes.
export const ORG_ID = `${SITE_URL}/#org`;
export const PERSON_ID = `${SITE_URL}/#greg`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const BOOK_ID = `${SITE_URL}/the-lund-covenant#book`;

// LLM-03 — cross-web identity links for entity disambiguation.
// TODO(Q4): add Amazon author page + Goodreads author page URLs once confirmed.
export const AUTHOR_SAME_AS: string[] = [
	'https://gregmaxfield.substack.com',
	'https://x.com/Greg_Maxfield5',
	// 'https://www.amazon.com/author/...',    // TODO(Q4)
	// 'https://www.goodreads.com/author/...',  // TODO(Q4)
];

type Node = Record<string, unknown>;

/** Silver Sage Media — publisher/org, referenced by @id everywhere. */
export const organizationNode = (): Node => ({
	'@type': 'Organization',
	'@id': ORG_ID,
	name: 'Silver Sage Media, LLC',
	url: SITE_URL,
});

/** Sitewide WebSite node. */
export const websiteNode = (): Node => ({
	'@type': 'WebSite',
	'@id': WEBSITE_ID,
	url: SITE_URL,
	name: SITE_TITLE,
	description: SITE_DESCRIPTION,
	publisher: { '@id': ORG_ID },
});

/** Greg Maxfield — Person. Emit on /about and homepage. */
export const personNode = (): Node => ({
	'@type': 'Person',
	'@id': PERSON_ID,
	name: 'Greg Maxfield',
	url: `${SITE_URL}/about`,
	image: `${SITE_URL}/images/greg-headshot.jpg`,
	jobTitle: 'Author',
	description:
		'Author of literary fiction rooted in the American West. A native of Emery County, Utah, ' +
		'he spent three decades in the energy industry before turning full-time to writing.',
	worksFor: { '@id': ORG_ID },
	sameAs: AUTHOR_SAME_AS,
});

/** The Lund Covenant — Book. Emit on /the-lund-covenant. */
export const bookNode = (): Node => ({
	'@type': 'Book',
	'@id': BOOK_ID,
	name: 'The Lund Covenant',
	author: { '@id': PERSON_ID },
	publisher: { '@id': ORG_ID },
	url: `${SITE_URL}/the-lund-covenant`,
	image: `${SITE_URL}/images/tlc-cover-front.jpg`,
	inLanguage: 'en',
	genre: 'Literary Fiction',
	datePublished: '2026-06-30',
	abstract:
		'A photojournalist returns to Castle Dale, Utah after his father’s death and uncovers a ' +
		'hidden network of desert humanitarian aid that someone has methodically destroyed. A novel ' +
		'about moral inheritance, complicity, and bearing witness.',
	// Default offer surfaced at the work level (paperback price).
	offers: {
		'@type': 'Offer',
		url: AMAZON_URL,
		availability: 'https://schema.org/InStock',
		price: '16.99', // paperback, confirmed from launch/GTM plan
		priceCurrency: 'USD',
	},
	// Per-format editions (SEO-01 Book ISBNs). Kindle uses an ASIN, not an ISBN.
	workExample: [
		{
			'@type': 'Book',
			'@id': `${SITE_URL}/the-lund-covenant#hardcover`,
			name: 'The Lund Covenant (Hardcover)',
			bookFormat: 'https://schema.org/Hardcover',
			isbn: '979-8234136527',
			inLanguage: 'en',
			author: { '@id': PERSON_ID },
			offers: {
				'@type': 'Offer',
				url: AMAZON_URL,
				availability: 'https://schema.org/InStock',
			},
		},
		{
			'@type': 'Book',
			'@id': `${SITE_URL}/the-lund-covenant#paperback`,
			name: 'The Lund Covenant (Paperback)',
			bookFormat: 'https://schema.org/Paperback',
			isbn: '979-8185358207',
			inLanguage: 'en',
			author: { '@id': PERSON_ID },
			offers: {
				'@type': 'Offer',
				url: AMAZON_URL,
				availability: 'https://schema.org/InStock',
				price: '16.99',
				priceCurrency: 'USD',
			},
		},
		{
			'@type': 'Book',
			'@id': `${SITE_URL}/the-lund-covenant#kindle`,
			name: 'The Lund Covenant (Kindle Edition)',
			bookFormat: 'https://schema.org/EBook',
			inLanguage: 'en',
			author: { '@id': PERSON_ID },
			offers: {
				'@type': 'Offer',
				url: KINDLE_URL,
				availability: 'https://schema.org/InStock',
			},
		},
	],
});

export interface BlogPostingInput {
	url: string;
	title: string;
	description: string;
	datePublished: string; // ISO
	dateModified?: string; // ISO
	image?: string;
}

/** BlogPosting/Article node for a blog post (SEO-02). */
export const blogPostingNode = (post: BlogPostingInput): Node => ({
	'@type': 'BlogPosting',
	'@id': `${post.url}#article`,
	headline: post.title,
	description: post.description,
	datePublished: post.datePublished,
	dateModified: post.dateModified ?? post.datePublished,
	author: { '@id': PERSON_ID },
	publisher: { '@id': ORG_ID },
	image: post.image ?? `${SITE_URL}/images/og-image.png`,
	mainEntityOfPage: post.url,
	url: post.url,
});

export interface FaqItem {
	question: string;
	answer: string;
}

/** FAQPage node (LLM-01). */
export const faqNode = (items: FaqItem[]): Node => ({
	'@type': 'FAQPage',
	mainEntity: items.map((it) => ({
		'@type': 'Question',
		name: it.question,
		acceptedAnswer: { '@type': 'Answer', text: it.answer },
	})),
});

// Shared FAQ content — reused by the visible FAQ block AND the FAQPage JSON-LD
// so the two never drift (LLM-01 acceptance criterion).
export const FAQ_ITEMS: FaqItem[] = [
	{
		question: 'Who is Greg Maxfield?',
		answer:
			'Greg Maxfield is an author of literary fiction rooted in the American West and a native of ' +
			'Emery County, Utah. After three decades in the energy industry he turned full-time to writing. ' +
			'His debut novel is The Lund Covenant.',
	},
	{
		question: 'What is The Lund Covenant about?',
		answer:
			'A photojournalist returns to Castle Dale, Utah after his father’s death and uncovers a ' +
			'hidden network of desert humanitarian aid that someone has methodically destroyed. It is a ' +
			'novel about moral inheritance, complicity, and bearing witness.',
	},
	{
		question: 'Where is Castle Dale, Utah?',
		answer:
			'Castle Dale is a small town in Emery County, in the high desert of central Utah — the ' +
			'landscape where The Lund Covenant is set and where the author grew up.',
	},
	{
		question: 'What books is The Lund Covenant similar to?',
		answer:
			'Readers who enjoy the quiet, place-rooted literary fiction of Kent Haruf, Marilynne Robinson, ' +
			'and Denis Johnson will feel at home with The Lund Covenant.',
	},
	{
		question: 'Where can I buy The Lund Covenant?',
		answer:
			'The Lund Covenant is available now in paperback, hardcover, and Kindle editions on Amazon, ' +
			'and can also be read chapter by chapter as it serializes on Substack.',
	},
];
