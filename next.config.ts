import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/**",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/9-2/product", destination: "/en/products", permanent: true },
      { source: "/9-2/product/rapid-shutdown-2", destination: "/en/safety/rapid-shutdown", permanent: true },
      { source: "/9-2/product/rapid-shutdown-2/:sku", destination: "/en/safety/rapid-shutdown", permanent: true },
      { source: "/9-2/product/firefighter-safety-switches", destination: "/en/safety/firefighter-safety-switches", permanent: true },
      { source: "/9-2/product/firefighter-safety-switches/:sku", destination: "/en/safety/firefighter-safety-switches", permanent: true },
      { source: "/9-2/product/optimizer-2", destination: "/en/products/optimizers", permanent: true },
      { source: "/9-2/product/optimizer-2/:slug", destination: "/en/products/optimizers", permanent: true },
      { source: "/9-2/product/micro-inverter-2", destination: "/en/products/micro-inverters", permanent: true },
      { source: "/9-2/product/micro-inverter-2/:slug", destination: "/en/products/micro-inverters", permanent: true },
      { source: "/9-2/product/inverter-2", destination: "/en/products/inverters", permanent: true },
      { source: "/9-2/product/inverter-2/:slug", destination: "/en/products/inverters", permanent: true },
      { source: "/9-2/product/ev-charger", destination: "/en/products/ev-chargers", permanent: true },
      { source: "/9-2/product/ev-charger/:slug", destination: "/en/products/ev-chargers", permanent: true },
      { source: "/9-2/product/accessories-2", destination: "/en/products/accessories", permanent: true },
      { source: "/9-2/product/accessories-2/:slug", destination: "/en/products/accessories", permanent: true },
      { source: "/9-2/product/battery-storag", destination: "/en/products/battery-storage", permanent: true },
      { source: "/9-2/product/battery-storag/:slug", destination: "/en/products/battery-storage", permanent: true },
      { source: "/9-2/solutions", destination: "/en/solutions/commercial-industrial", permanent: true },
      { source: "/9-2/scada-2", destination: "/en/solutions/scada-monitoring", permanent: true },
      { source: "/9-2/blog", destination: "/en/resources/articles", permanent: true },
      { source: "/9-2/blog/:slug", destination: "/en/resources/articles", permanent: true },
      { source: "/9-2/news-events", destination: "/en/resources/articles", permanent: true },
      { source: "/9-2/about", destination: "/en/about/projoy-partnership", permanent: true },
      { source: "/9-2/contact", destination: "/en/contact", permanent: true },
      { source: "/9-2/workshop-training", destination: "/en/resources/workshop-training", permanent: true },
      { source: "/installer", destination: "/en/contact", permanent: true },
    ];
  },
};

export default nextConfig;
