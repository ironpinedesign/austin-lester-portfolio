export type ClientLogo = {
  id: string;
  name: string;
  logoPath: `/brand/client-logos/${string}.svg`;
  opticalWidth: `${number}%`;
  aspectRatio: number;
};

export type TestimonialDefinition = {
  id: string;
  clientId: ClientLogo["id"];
  quoteKey: `about.testimonials.${string}.quote`;
  nameKey: `about.testimonials.${string}.name`;
  roleKey: `about.testimonials.${string}.role`;
  organizationKey: `about.testimonials.${string}.organization`;
};

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  organization: string;
  logoPath: ClientLogo["logoPath"];
  logoOpticalWidth: ClientLogo["opticalWidth"];
  logoAspectRatio: number;
};

export const clientLogos = [
  { id: "bergara", name: "Bergara", logoPath: "/brand/client-logos/bergara.svg", opticalWidth: "59.2%", aspectRatio: 7.5283 },
  { id: "eberlestock", name: "Eberlestock", logoPath: "/brand/client-logos/eberlestock.svg", opticalWidth: "51.1%", aspectRatio: 3.6932 },
  { id: "cz-firearms", name: "CZ Firearms", logoPath: "/brand/client-logos/cz-firearms.svg", opticalWidth: "42.1%", aspectRatio: 2.5083 },
  { id: "truckvault", name: "TruckVault", logoPath: "/brand/client-logos/truckvault.svg", opticalWidth: "59.2%", aspectRatio: 6.7742 },
  { id: "fieldcraft-survival", name: "Fieldcraft Survival", logoPath: "/brand/client-logos/fieldcraft-survival.svg", opticalWidth: "36.5%", aspectRatio: 1.4457 },
  { id: "vortex", name: "Vortex", logoPath: "/brand/client-logos/vortex.svg", opticalWidth: "29.6%", aspectRatio: 1.4375 },
  { id: "hornady", name: "Hornady", logoPath: "/brand/client-logos/hornady.svg", opticalWidth: "56.1%", aspectRatio: 4.3263 },
  { id: "magpul", name: "Magpul", logoPath: "/brand/client-logos/magpul.svg", opticalWidth: "59.2%", aspectRatio: 7 },
  { id: "christensen-arms", name: "Christensen Arms", logoPath: "/brand/client-logos/christensen-arms.svg", opticalWidth: "45.2%", aspectRatio: 2.2516 },
  { id: "pse-archery", name: "PSE Archery", logoPath: "/brand/client-logos/pse-archery.svg", opticalWidth: "45.2%", aspectRatio: 2.1646 },
  { id: "badlands", name: "Badlands", logoPath: "/brand/client-logos/badlands.svg", opticalWidth: "56.1%", aspectRatio: 3.6606 },
  { id: "crispi", name: "Crispi", logoPath: "/brand/client-logos/crispi.svg", opticalWidth: "32.7%", aspectRatio: 1.5864 },
  { id: "argali", name: "Argali", logoPath: "/brand/client-logos/argali.svg", opticalWidth: "29.3%", aspectRatio: 1.4163 },
  { id: "initial-ascent", name: "Initial Ascent", logoPath: "/brand/client-logos/initial-ascent.svg", opticalWidth: "42.7%", aspectRatio: 2.0632 },
  { id: "eastmans", name: "Eastmans", logoPath: "/brand/client-logos/eastmans.svg", opticalWidth: "57.7%", aspectRatio: 5.4789 },
  { id: "field-ethos", name: "Field Ethos", logoPath: "/brand/client-logos/field-ethos.svg", opticalWidth: "59.2%", aspectRatio: 6.6441 },
  { id: "ironclad", name: "Ironclad", logoPath: "/brand/client-logos/ironclad.svg", opticalWidth: "59.2%", aspectRatio: 6.4655 },
  { id: "jack-carr", name: "Jack Carr", logoPath: "/brand/client-logos/jack-carr.svg", opticalWidth: "59.2%", aspectRatio: 5.8676 },
  { id: "winfield-watch-company", name: "Winfield Watch Company", logoPath: "/brand/client-logos/winfield-watch-company.svg", opticalWidth: "26.2%", aspectRatio: 1.2661 },
  { id: "revol-entertainment", name: "REVOL Entertainment", logoPath: "/brand/client-logos/revol-entertainment.svg", opticalWidth: "59.2%", aspectRatio: 2.9646 },
] as const satisfies readonly ClientLogo[];

export const testimonialDefinitions = [
  { id: "shawn-herald", clientId: "bergara", quoteKey: "about.testimonials.shawn_herald.quote", nameKey: "about.testimonials.shawn_herald.name", roleKey: "about.testimonials.shawn_herald.role", organizationKey: "about.testimonials.shawn_herald.organization" },
  { id: "greg-williams", clientId: "eberlestock", quoteKey: "about.testimonials.greg_williams.quote", nameKey: "about.testimonials.greg_williams.name", roleKey: "about.testimonials.greg_williams.role", organizationKey: "about.testimonials.greg_williams.organization" },
  { id: "bradley-farris", clientId: "cz-firearms", quoteKey: "about.testimonials.bradley_farris.quote", nameKey: "about.testimonials.bradley_farris.name", roleKey: "about.testimonials.bradley_farris.role", organizationKey: "about.testimonials.bradley_farris.organization" },
  { id: "clint-easley", clientId: "revol-entertainment", quoteKey: "about.testimonials.clint_easley.quote", nameKey: "about.testimonials.clint_easley.name", roleKey: "about.testimonials.clint_easley.role", organizationKey: "about.testimonials.clint_easley.organization" },
  { id: "mark-miller", clientId: "winfield-watch-company", quoteKey: "about.testimonials.mark_miller.quote", nameKey: "about.testimonials.mark_miller.name", roleKey: "about.testimonials.mark_miller.role", organizationKey: "about.testimonials.mark_miller.organization" },
] as const satisfies readonly TestimonialDefinition[];

type CopySource = Readonly<Record<string, string>> | ((key: string) => string);

function readCopy(copy: CopySource, key: string): string {
  const value = (typeof copy === "function" ? copy(key) : copy[key])?.trim();
  if (!value) throw new Error(`Missing social-proof copy: ${key}`);
  return value;
}

export function resolveTestimonials(copy: CopySource): Testimonial[] {
  return testimonialDefinitions.map((definition) => {
    const client = clientLogos.find(({ id }) => id === definition.clientId);
    if (!client) throw new Error(`Missing testimonial client: ${definition.clientId}`);

    return {
      id: definition.id,
      quote: readCopy(copy, definition.quoteKey),
      name: readCopy(copy, definition.nameKey),
      role: readCopy(copy, definition.roleKey),
      organization: readCopy(copy, definition.organizationKey),
      logoPath: client.logoPath,
      logoOpticalWidth: client.opticalWidth,
      logoAspectRatio: client.aspectRatio,
    };
  });
}
