// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const DEFAULT_LOCALE = 'zh-Hans' as const;

export const LOCALES = ['zh-Hans', 'en-US'] as const;

export type Locale = (typeof LOCALES)[number];

export const SITE = {
	'zh-Hans': {
		title: '陈常超的技术博客',
		description: '记录 AI Agent、RAG、TypeScript 全栈等个人项目实践。',
		lang: 'zh-Hans',
	},
	'en-US': {
		title: "Chen Changchao's Tech Blog",
		description:
			'Notes on AI agents, RAG, TypeScript full-stack development, and related personal projects.',
		lang: 'en-US',
	},
} satisfies Record<
	Locale,
	{
		title: string;
		description: string;
		lang: string;
	}
>;

export const NAV = {
	'zh-Hans': {
		home: '首页',
		blog: '博客',
		about: '关于',
		language: 'English',
	},
	'en-US': {
		home: 'Home',
		blog: 'Blog',
		about: 'About',
		language: '简体中文',
	},
} satisfies Record<
	Locale,
	{
		home: string;
		blog: string;
		about: string;
		language: string;
	}
>;

// 保留旧变量，避免 BaseHead.astro / rss.xml.js 等旧代码立刻报错
export const SITE_TITLE = SITE[DEFAULT_LOCALE].title;
export const SITE_DESCRIPTION = SITE[DEFAULT_LOCALE].description;

export function isLocale(value: string): value is Locale {
	return LOCALES.includes(value as Locale);
}

export function getLocaleFromPathname(pathname: string): Locale {
	const firstSegment = pathname.split('/').filter(Boolean)[0];

	if (firstSegment && isLocale(firstSegment)) {
		return firstSegment;
	}

	return DEFAULT_LOCALE;
}

export function removeLocalePrefix(pathname: string) {
	const segments = pathname.split('/').filter(Boolean);
	const firstSegment = segments[0];

	if (firstSegment && isLocale(firstSegment)) {
		const rest = segments.slice(1).join('/');
		return rest ? `/${rest}/` : '/';
	}

	return pathname;
}

export function localizedPath(locale: Locale, path = '/') {
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;

	if (locale === DEFAULT_LOCALE) {
		return normalizedPath;
	}

	if (normalizedPath === '/') {
		return `/${locale}/`;
	}

	return `/${locale}${normalizedPath}`;
}

export function getPostLocale(postId: string): Locale {
	const firstSegment = postId.split('/')[0];

	if (isLocale(firstSegment)) {
		return firstSegment;
	}

	return DEFAULT_LOCALE;
}

export function getPostSlug(postId: string) {
	const segments = postId.split('/');

	if (isLocale(segments[0])) {
		return segments.slice(1).join('/');
	}

	return postId;
}

export function getPostHref(locale: Locale, postId: string) {
	const slug = getPostSlug(postId);
	return localizedPath(locale, `/blog/${slug}/`);
}

export function switchLocalePath(targetLocale: Locale, currentPathname: string) {
	const pathWithoutLocale = removeLocalePrefix(currentPathname);
	return localizedPath(targetLocale, pathWithoutLocale);
}