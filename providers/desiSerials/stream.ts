import { Stream, ProviderContext } from "../types";

export const getStream = async function ({
  link,
  type,
  signal,
  providerContext,
}: {
  link: string;
  type: string;
  signal?: AbortSignal;
  providerContext: ProviderContext;
}): Promise<Stream[]> {
  const res = await providerContext.axios.get(link, {
    signal,
    headers: {
      ...providerContext.commonHeaders,
      Referer: "https://www.desi-serials.to/",
    },
  });

  const $ = providerContext.cheerio.load(res.data);

  const streams: Stream[] = [];

  $("iframe").each((_, el) => {
    const src = $(el).attr("src");

    if (!src) return;

    const playerUrl = new URL(src, link).href;

    if (playerUrl.includes("tvlogy")) {
      streams.push({
        server: "TVLogy",
        link: playerUrl,
        type: "mp4",
        quality: "720p",
      });
    }
  });

  return streams;
};
