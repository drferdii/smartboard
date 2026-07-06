import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://rumah-makan-semayot.com",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
    },
  ];
}
