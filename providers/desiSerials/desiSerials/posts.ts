import { Post, ProviderContext } from "../types";

const BASE = "https://www.desi-serials.to";

function absoluteUrl(url: string): string {
  try {
    return new URL(url, BASE).href;
  } catch {
    return url;
  }
}

function cleanTitle(title: string): string {
  return title
    .replace(/\s+/g, " ")
    .replace(/\s*[-–]\s*Watch Online.*$/i, "")
    .trim();
}

function parsePosts(html: string, providerContext: ProviderContext): Post[] {
  const $ = providerContext.cheerio.load(html);
  const posts: Post[] = [];
  const seen = new Set<string>();

  $("h2 a, h3 a, article a, .post a").each((_, el) => {
    const href = $(el).attr("href");
    const text = $(el).text().trim();

    if (!href || !text) return;

    const link = absoluteUrl(href);

    if (!link.startsWith(BASE)) return;
    if (link === BASE + "/" || link.includes("/category/")) return;

    const title = cleanTitle(text);
    if (!title || seen.has(link)) return;

    const article = $(el).closest("article, .post, .blog-post, .item");
    const image =
      article.find("img").first().attr("src") ||
      article.find("img").first().attr("data-src") ||
      "";

    seen.add(link);

    posts.push({
      title,
      link,
      image: image ? absoluteUrl(image) : "",
      type: "series",
    });
  });

  return posts;
}

export const getPosts = async function ({
  filter,
  page,
  signal,
  providerContext,
}: {
  filter: string;
  page: number;
  providerValue: string;
  signal: AbortSignal;
  providerContext: ProviderContext;
}): Promise<Post[]> {
  const path =
    filter === "/latest-episodes/"
      ? page > 1
        ? `/latest-episodes/page/${page}/`
        : "/latest-episodes/"
      : filter;

  const url = absoluteUrl(path);

  const res = await providerContext.axios.get(url, {
    signal,
    headers: providerContext.commonHeaders,
  });

  return parsePosts(res.data, providerContext).slice(0, 40);
};

export const getSearchPosts = async function ({
  searchQuery,
  page,
  signal,
  providerContext,
}: {
  searchQuery: string;
  page: number;
  providerValue: string;
  signal: AbortSignal;
  providerContext: ProviderContext;
}): Promise<Post[]> {
  const url =
    `${BASE}/?s=${encodeURIComponent(searchQuery)}` +
    (page > 1 ? `&paged=${page}` : "");

  const res = await providerContext.axios.get(url, {
    signal,
    headers: providerContext.commonHeaders,
  });

  return parsePosts(res.data, providerContext).slice(0, 40);
};
