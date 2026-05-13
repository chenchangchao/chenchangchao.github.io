export const defaultLocale = 'zh-Hans' as const;

export const locales = ['zh-Hans', 'en-US'] as const;

export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  'zh-Hans': '简体中文',
  'en-US': 'English',
};

export const siteMeta: Record<
  Locale,
  {
    title: string;
    description: string;
  }
> = {
  'zh-Hans': {
    title: '陈常超的技术博客',
    description: '记录 AI Agent、数据分析、TypeScript 全栈、RAG 与自动化报表实践。',
  },
  'en-US': {
    title: 'Changchao Chen Tech Blog',
    description:
      'Notes on AI agents, data analytics, TypeScript full-stack development, RAG, and automation.',
  },
};

export const navLabels: Record<
  Locale,
  {
    home: string;
    blog: string;
    about: string;
  }
> = {
  'zh-Hans': {
    home: '首页',
    blog: '博客',
    about: '关于',
  },
  'en-US': {
    home: 'Home',
    blog: 'Blog',
    about: 'About',
  },
};

export function getLocalizedPath(locale: Locale, path = '/') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (locale === defaultLocale) {
    return normalizedPath;
  }

  if (normalizedPath === '/') {
    return `/${locale}/`;
  }

  return `/${locale}${normalizedPath}`;
}

export function getPostLocale(postId: string): Locale {
  const maybeLocale = postId.split('/')[0];

  if (locales.includes(maybeLocale as Locale)) {
    return maybeLocale as Locale;
  }

  return defaultLocale;
}

export function getPostSlug(postId: string) {
  const parts = postId.split('/');

  if (locales.includes(parts[0] as Locale)) {
    return parts.slice(1).join('/');
  }

  return postId;
}

export function getPostUrl(locale: Locale, postId: string) {
  const slug = getPostSlug(postId);
  return getLocalizedPath(locale, `/blog/${slug}/`);
}