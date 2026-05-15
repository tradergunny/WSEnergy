import { sanityClient } from "./client";
import {
  nextUpcomingTrainingSessionsQuery,
  upcomingTrainingSessionsQuery,
} from "./queries";

export type TrainingFormat = "in-person" | "online" | "hybrid";
export type TrainingLanguage = "th" | "en" | "both";

export type TrainingSessionRow = {
  _id: string;
  title_en: string;
  title_th: string | null;
  startDate: string;
  endDate: string;
  format: TrainingFormat;
  province: string | null;
  host: string | null;
  capacity: number | null;
  seatsRemaining: number | null;
  registrationUrl: string | null;
  language: TrainingLanguage;
};

const todayISO = () => new Date().toISOString().slice(0, 10);

export async function getUpcomingTrainingSessions(): Promise<TrainingSessionRow[]> {
  return sanityClient.fetch<TrainingSessionRow[]>(upcomingTrainingSessionsQuery, {
    today: todayISO(),
  });
}

export async function getNextUpcomingTrainingSessions(): Promise<TrainingSessionRow[]> {
  return sanityClient.fetch<TrainingSessionRow[]>(nextUpcomingTrainingSessionsQuery, {
    today: todayISO(),
  });
}
