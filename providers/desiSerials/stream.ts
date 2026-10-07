import { Stream, ProviderContext } from "../types";

export const getStream = async function ({
  link,
  type,
  signal,
  providerContext,
  isDownload,
}: {
  link: string;
  type: string;
  signal?: AbortSignal;
  providerContext: ProviderContext;
  isDownload?: boolean;
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

  $("source").each((_, el) => {
    const src = $(el).attr("src");

    if (!src) return;

    const streamUrl = new URL(src, link).href;

    if (
      streamUrl.includes(".m3u8") ||
      streamUrl.includes(".mp4")
    ) {
      streams.push({
        server: "TVLogy",
        link: streamUrl,
        type: streamUrl.includes(".m3u8") ? "m3u8" : "mp4",
        quality: "720",
      });
    }
  });

  return streams;
};
