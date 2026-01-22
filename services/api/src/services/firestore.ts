import { Firestore } from "@google-cloud/firestore";

export const firestore = new Firestore({
  projectId: process.env.GCP_PROJECT_ID,
});
