/**
 * Site navigation per BRIEF §4 (IA) with URLs from §5.
 * `href` is locale-relative (no leading locale segment); Header prefixes it.
 */

export type NavChild = {
  key: string;
  href: string;
  exclusive?: boolean;
};

export type NavItem = {
  key: string;
  href: string;
  children?: NavChild[];
};

export const mainNav: NavItem[] = [
  {
    key: "safety",
    href: "/safety",
    children: [
      { key: "rapidShutdown", href: "/safety/rapid-shutdown", exclusive: true },
      {
        key: "firefighterSwitches",
        href: "/safety/firefighter-safety-switches",
      },
      { key: "whySafety", href: "/safety/why-solar-safety-matters" },
    ],
  },
  {
    key: "products",
    href: "/products",
    children: [
      { key: "inverters", href: "/products/inverters" },
      { key: "batteryStorage", href: "/products/battery-storage" },
      { key: "optimizers", href: "/products/optimizers" },
      { key: "microInverters", href: "/products/micro-inverters" },
      { key: "evChargers", href: "/products/ev-chargers" },
      { key: "accessories", href: "/products/accessories" },
    ],
  },
  {
    key: "solutions",
    href: "/solutions",
    children: [
      { key: "ci", href: "/solutions/commercial-industrial" },
      { key: "residential", href: "/solutions/residential" },
      { key: "solarFarm", href: "/solutions/solar-farm" },
      { key: "scada", href: "/solutions/scada-monitoring" },
    ],
  },
  { key: "training", href: "/training" },
  { key: "installers", href: "/installers" },
  {
    key: "resources",
    href: "/resources",
    children: [
      { key: "datasheets", href: "/resources/datasheets" },
      { key: "wiringDiagrams", href: "/resources/wiring-diagrams" },
      { key: "standards", href: "/resources/standards-compliance" },
      { key: "workshop", href: "/resources/workshop-training" },
      { key: "articles", href: "/resources/articles" },
    ],
  },
  {
    key: "about",
    href: "/about",
    children: [
      { key: "company", href: "/about" },
      { key: "team", href: "/about/team" },
      { key: "projoyPartnership", href: "/about/projoy-partnership" },
      { key: "certifications", href: "/about/certifications" },
      { key: "news", href: "/about/news-events" },
    ],
  },
];

/** Secondary nav — task-driven destinations rendered in the utility bar. */
export const secondaryNav: NavItem[] = [
  { key: "projects", href: "/projects" },
  { key: "contact", href: "/contact" },
];

export const footerNav = {
  col1: [
    { key: "safety", href: "/safety" },
    { key: "products", href: "/products" },
    { key: "solutions", href: "/solutions" },
    { key: "projects", href: "/projects" },
  ],
  col2: [
    { key: "resources", href: "/resources" },
    { key: "about", href: "/about" },
    { key: "careers", href: "/about" },
    { key: "news", href: "/about/news-events" },
  ],
};

export function withLocale(locale: string, href: string): string {
  if (href === "/") return `/${locale}`;
  return `/${locale}${href}`;
}
