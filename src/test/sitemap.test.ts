import { describe, expect, it } from "vitest";
import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { sitemapStaticPaths, sitemapXML } from "@/lib/sitemap";

describe("public sitemap", () => {
  it("includes public pages but never authenticated descendants or sign-in", () => {
    const root = createRootRoute({ staticData: { sitemap: false } });
    const home = createRoute({ getParentRoute: () => root, path: "/", staticData: { sitemap: true } });
    const about = createRoute({ getParentRoute: () => root, path: "about", staticData: { sitemap: true } });
    const contact = createRoute({ getParentRoute: () => root, path: "contact", staticData: { sitemap: true } });
    const privacy = createRoute({ getParentRoute: () => root, path: "privacy", staticData: { sitemap: true } });
    const faq = createRoute({ getParentRoute: () => root, path: "faq", staticData: { sitemap: true } });
    const community = createRoute({ getParentRoute: () => root, path: "community", staticData: { sitemap: true } });
    const auth = createRoute({ getParentRoute: () => root, path: "auth", staticData: { sitemap: false } });
    const privateLayout = createRoute({ getParentRoute: () => root, id: "_authenticated", staticData: { sitemap: "exclude-subtree" } });
    const resumes = createRoute({ getParentRoute: () => privateLayout, path: "resumes", staticData: { sitemap: true } });
    const router = createRouter({ routeTree: root.addChildren([home, about, contact, privacy, faq, community, auth, privateLayout.addChildren([resumes])]) });
    expect(sitemapStaticPaths(router)).toEqual(["/", "/about", "/community", "/contact", "/faq", "/privacy"]);
  });

  it("uses the public domain without invented modification dates", () => {
    const xml = sitemapXML("https://soulskill.soulvest.ai", [{ path: "/" }]);
    expect(xml).toContain("<loc>https://soulskill.soulvest.ai/</loc>");
    expect(xml).not.toContain("<lastmod>");
  });
});