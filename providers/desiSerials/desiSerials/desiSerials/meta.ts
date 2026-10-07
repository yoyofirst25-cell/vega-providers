import { Info, ProviderContext, Link } from "../types";

const BASE = "https://www.desi-serials.to";

export const getMeta = async function ({
  link,
  providerContext,
}: {
  link: string;
  providerContext: ProviderContext;
}): Promise<Info> {
  const res = await providerContext.axios.get(
    new URL(link, BASE).href,
    { headers: providerContext.commonHeaders }
  );

  const $ = providerContext.cheerio.load(res.data);

  const title =
    $("h1").first().text().trim() ||
    $("title").text().replace(/\s*-\s*Desi-Serials.*$/i, "").trim();

  const image =
    $("article img").first().attr("src") ||
    $("meta[property='og:image']").attr("content") ||
    "";

  const description =
    $("article p").first().text().trim() ||
    $("meta[name='description']").attr("content") ||
    "";

  const episodeLinks: Link["directLinks"] = [];

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    const text = $(el).text().trim();

    if (!href) return;

    const lower = href.toLowerCase();

    const looksLikePlayer =
      lower.includes("tvarticles.org") ||
      lower.includes("dailymotion") ||
      lower.includes("tvlogy");

    if (looksLikePlayer) {
      episodeLinks.push({
        title: text || "Watch",
        link: href,
        type: "movie",
      });
    }
  });

  const links: Link[] = episodeLinks.length
    ? [{
        title: "Available Links",
        directLinks: episodeLinks,
        quality: "720p"
      }]
    : [];

  return {
    title,
    synopsis: description,
    image,
    type: "series",
    linkList: links,
    webUrl: new URL(link, BASE).href,
  };
};
