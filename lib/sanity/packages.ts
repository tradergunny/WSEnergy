import { sanityClient } from "./client";
import { allSolarPackagesQuery } from "./queries";

export type SolarPackagePhase = "single" | "three" | "both";
export type SolarPackageSegment = "residential" | "business" | "both";

/**
 * One active solar package tier, as consumed by the Solar Rooftop Estimator.
 * The estimator snaps its computed kWp to the nearest package whose `phase`
 * and `segment` are compatible with the user's inputs, then shows `price`.
 */
export type SolarPackageRow = {
  _id: string;
  sizeKw: number;
  phase: SolarPackagePhase;
  segment: SolarPackageSegment;
  price: number;
  panelCount: number | null;
  includedComponents: string[] | null;
};

export async function getSolarPackages(): Promise<SolarPackageRow[]> {
  return sanityClient.fetch<SolarPackageRow[]>(allSolarPackagesQuery);
}
