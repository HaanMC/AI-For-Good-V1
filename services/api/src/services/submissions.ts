import { firestore } from "./firestore.js";

const MAX_SCORE_HISTORY = 12;

type ProfileScores = {
  history: number[];
  average: number | null;
};

type ProfileDoc = {
  uid: string;
  weaknesses: Record<string, number>;
  scores: ProfileScores;
  updatedAt: Date;
};

const normalizeContent = (payload: Record<string, unknown>): string => {
  if (typeof payload.text === "string") return payload.text;
  if (typeof payload.content === "string") return payload.content;
  if (typeof payload.prompt === "string") return payload.prompt;
  if (typeof payload.essay === "string") return payload.essay;
  if (Array.isArray(payload.contents)) {
    const textPart = payload.contents
      .flatMap((item) => (Array.isArray(item?.parts) ? item.parts : []))
      .find((part) => typeof part?.text === "string");
    if (textPart?.text) {
      return String(textPart.text);
    }
  }
  return "";
};

const buildDefaultProfile = (uid: string): ProfileDoc => ({
  uid,
  weaknesses: {},
  scores: {
    history: [],
    average: null,
  },
  updatedAt: new Date(),
});

export const updateProfileAggregates = async (
  uid: string,
  weaknesses: string[],
  score: number | null
) => {
  const profileRef = firestore.collection("profiles").doc(uid);
  const profileDoc = await profileRef.get();
  const profile = profileDoc.exists
    ? (profileDoc.data() as ProfileDoc)
    : buildDefaultProfile(uid);

  const weaknessCounts = { ...(profile.weaknesses || {}) };
  weaknesses.forEach((weakness) => {
    weaknessCounts[weakness] = (weaknessCounts[weakness] || 0) + 1;
  });

  const scores = profile.scores || { history: [], average: null };
  if (typeof score === "number" && !Number.isNaN(score)) {
    const nextHistory = [...scores.history, score].slice(-MAX_SCORE_HISTORY);
    const avg = nextHistory.length
      ? Math.round((nextHistory.reduce((sum, value) => sum + value, 0) / nextHistory.length) * 10) / 10
      : null;
    scores.history = nextHistory;
    scores.average = avg;
  }

  await profileRef.set(
    {
      uid,
      weaknesses: weaknessCounts,
      scores,
      updatedAt: new Date(),
    },
    { merge: true }
  );
};

export const recordSubmission = async (params: {
  uid: string;
  type: "writing" | "exam";
  payload: Record<string, unknown>;
  feedback: string;
  score: number | null;
  weaknesses: string[];
}) => {
  const { uid, type, payload, feedback, score, weaknesses } = params;
  const content = normalizeContent(payload);
  const createdAt = new Date();

  await firestore.collection("submissions").add({
    uid,
    type,
    content,
    feedback,
    score,
    weaknessesExtracted: weaknesses,
    createdAt,
  });

  await updateProfileAggregates(uid, weaknesses, score);
};
