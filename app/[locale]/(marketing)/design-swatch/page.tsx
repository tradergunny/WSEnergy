import { notFound } from "next/navigation";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input, Textarea } from "@/components/ui/Input";

/**
 * Design system swatch — kept around for QA. Originally the Week 2 home
 * route; moved to /design-swatch in Week 4 when the real homepage shipped.
 */
export default async function DesignSwatchPage({
  params,
}: PageProps<"/[locale]/design-swatch">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const t = dict.swatch;

  return (
    <Container as="section" className="py-12">
      <header className="mb-10">
        <p className="text-eyebrow text-mist-400 mb-2">WS Energy · QA</p>
        <h1 className="text-h1 text-mist-50 font-medium">{t.title}</h1>
        <p className="text-body-lg text-mist-400 mt-3 max-w-2xl">
          {t.intro}
        </p>
      </header>

      <section className="mb-12">
        <h2 className="text-h2 text-mist-50 mb-4 font-medium">
          {t.buttonsHeading}
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">{t.primary}</Button>
          <Button variant="secondary">{t.secondary}</Button>
          <Button variant="outline-primary">{t.outlinePrimary}</Button>
          <Button variant="tertiary">{t.tertiary}</Button>
        </div>

        <h3 className="text-h3 text-mist-200 mt-8 mb-3 font-medium">
          {t.sizesHeading}
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" size="sm">
            sm
          </Button>
          <Button variant="primary" size="md">
            md
          </Button>
          <Button variant="primary" size="lg">
            lg
          </Button>
        </div>

        <h3 className="text-h3 text-mist-200 mt-8 mb-3 font-medium">
          {t.statesHeading}
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">Default</Button>
          <Button variant="primary" disabled>
            {t.disabled}
          </Button>
          <Button variant="secondary" disabled>
            {t.disabled}
          </Button>
          <Button variant="primary" href="/">
            As link
          </Button>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-h2 text-mist-50 mb-4 font-medium">
          {t.badgesHeading}
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="authorized">★ Authorized</Badge>
          <Badge variant="exclusive">★ Exclusive in Thailand</Badge>
          <Badge variant="brand">Huawei</Badge>
          <Badge variant="brand">Projoy</Badge>
          <Badge variant="safety-critical">Safety critical</Badge>
          <Badge variant="in-stock">In stock</Badge>
        </div>
      </section>

      <section>
        <h2 className="text-h2 text-mist-50 mb-4 font-medium">Inputs</h2>
        <div className="grid max-w-2xl grid-cols-1 gap-4 md:grid-cols-2">
          <Input label="Email" type="email" placeholder="you@company.com" />
          <Input
            label="Phone"
            type="tel"
            placeholder="+66 …"
            hint="Used for quote follow-up."
          />
          <Input
            label="Company"
            placeholder="ACME Co., Ltd."
            error="Please enter your company."
            required
          />
          <Input label="Filled" defaultValue="SUN2000-15KTL-M5" readOnly />
        </div>
        <div className="mt-4 max-w-2xl">
          <Textarea
            label="Project notes"
            placeholder="BOM, timeline, anything we should know…"
          />
        </div>
      </section>
    </Container>
  );
}
