import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { getPostHref, getPostLocale, SITE_DESCRIPTION, SITE_TITLE } from '../consts';

export async function GET(context) {
	const posts = (await getCollection('blog')).filter(
		(post) => getPostLocale(post.id) === 'zh-Hans' && post.id.toLowerCase().startsWith('zh-hans/'),
	);
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			...post.data,
			link: getPostHref('zh-Hans', post.id),
		})),
	});
}
