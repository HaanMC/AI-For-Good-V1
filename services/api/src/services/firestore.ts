import { Firestore } from "@google-cloud/firestore";

const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT_ID;

export const firestore = new Firestore({
  projectId,
});
