import type { SchemaTypeDefinition } from "sanity";
import { product } from "./product";
import { category } from "./category";
import { brand } from "./brand";
import { project } from "./project";
import { docFile } from "./docFile";
import { article } from "./article";
import { teamMember } from "./teamMember";
import { certification } from "./certification";
import { event } from "./event";
import { rfqSubmission } from "./rfqSubmission";
import { trainingSession } from "./trainingSession";
import { serviceType } from "./serviceType";
import { installer } from "./installer";
import { solarPackage } from "./solarPackage";

export const schemaTypes: SchemaTypeDefinition[] = [
  product,
  category,
  brand,
  project,
  docFile,
  article,
  teamMember,
  certification,
  event,
  rfqSubmission,
  trainingSession,
  serviceType,
  installer,
  solarPackage,
];
