import { getCollection } from 'astro:content'
import rss from '@astrojs/rss'
import { AUTHOR_NAME, SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from '../consts'

export async function GET(context) {
  const posts = await getCollection('blog')

  // 按日期排序，最新的在前
  const sortedPosts = posts.sort(
    (a, b) => new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime()
  )

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site || SITE_URL,
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.id}/`,
      categories: post.data.tags || [],
      author: post.data.author || AUTHOR_NAME,
      content: post.data.description,
    })),
    customData: `<language>zh-cn</language>
    <managingEditor>${AUTHOR_NAME}</managingEditor>
    <webMaster>${AUTHOR_NAME}</webMaster>
    <generator>Astro</generator>`,
  })
}
