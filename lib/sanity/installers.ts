import { sanityClient } from "./client";
import {
  allInstallersQuery,
  allServiceTypesQuery,
  installerProvincesQuery,
} from "./queries";

export type InstallerTier = "gold" | "silver" | "authorized";

export type ServiceTypeRow = {
  _id: string;
  title_en: string;
  title_th: string | null;
  slug: string;
  icon: string | null;
};

export type SanityImageRef = {
  _type: "image";
  asset: { _ref: string; _type: "reference" };
} | null;

export type InstallerRow = {
  _id: string;
  companyName: string;
  slug: string;
  installerCode: string | null;
  tier: InstallerTier;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address_en: string | null;
  address_th: string | null;
  province: string;
  district: string | null;
  lat: number | null;
  lng: number | null;
  certifications: string[] | null;
  yearsActive: number | null;
  logo: SanityImageRef;
  photo: SanityImageRef;
  services: ServiceTypeRow[] | null;
};

export async function getAllInstallers(): Promise<InstallerRow[]> {
  return sanityClient.fetch<InstallerRow[]>(allInstallersQuery);
}

export async function getAllServiceTypes(): Promise<ServiceTypeRow[]> {
  return sanityClient.fetch<ServiceTypeRow[]>(allServiceTypesQuery);
}

export async function getInstallerProvinces(): Promise<string[]> {
  const result = await sanityClient.fetch<string[]>(installerProvincesQuery);
  return (result ?? []).filter(Boolean).sort((a, b) => a.localeCompare(b));
}
