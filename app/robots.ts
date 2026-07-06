import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const aiBots = [
    "GPTBot",
    "ChatGPT-User",
    "ClaudeBot",
    "PerplexityBot",
    "Google-Extended",
    "Applebot-Extended",
    "Bytespider",
    "CCBot",
    "anthropic-ai",
    "FacebookBot",
    "Amazonbot",
  ];

  const rules = [
    {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    ...aiBots.map((bot) => ({
      userAgent: bot,
      allow: "/",
    })),
  ];

  return {
    rules,
    sitemap: "https://rumah-makan-semayot.com/sitemap.xml",
  };
}
