import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { collection, doc, getFirestore, onSnapshot, orderBy, query, runTransaction, serverTimestamp } from "firebase/firestore";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCN-hD-IaWS5CAt24HgdqmHHSt4x939ZHY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "jesus-raising.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "jesus-raising",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "jesus-raising.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "466148080738",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:466148080738:web:f37338903c9645efb2a53b",
};

export const firebaseEnabled = Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);

const app = firebaseEnabled ? (getApps().length ? getApp() : initializeApp(config)) : null;
const auth = app ? getAuth(app) : null;
const database = app ? getFirestore(app) : null;

export type LeaderboardEntry = {
  id: string;
  nickname: string;
  bestLove: number;
  stage: number;
};

async function currentUserId() {
  if (!auth) throw new Error("Firebase is not configured");
  if (auth.currentUser) return auth.currentUser.uid;
  const credential = await signInAnonymously(auth);
  return credential.user.uid;
}

export async function publishRanking(nickname: string, bestLove: number, stage: number) {
  if (!database || !nickname.trim()) return;
  const uid = await currentUserId();
  const scoreRef = doc(database, "rankings", uid);
  await runTransaction(database, async (transaction) => {
    const previous = await transaction.get(scoreRef);
    const oldScore = previous.exists() ? Number(previous.data().bestLove ?? 0) : 0;
    transaction.set(scoreRef, {
      nickname: nickname.trim().slice(0, 12),
      bestLove: Math.max(oldScore, Math.floor(bestLove)),
      stage: Math.max(Number(previous.data()?.stage ?? 1), stage),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  });
}

export function subscribeLeaderboard(onChange: (entries: LeaderboardEntry[]) => void, onError: () => void) {
  if (!database) return () => {};
  return onSnapshot(query(collection(database, "rankings"), orderBy("bestLove", "desc")), (snapshot) => {
    onChange(snapshot.docs.slice(0, 20).map((item) => ({
      id: item.id,
      nickname: String(item.data().nickname ?? "이름 없는 여행자"),
      bestLove: Number(item.data().bestLove ?? 0),
      stage: Number(item.data().stage ?? 1),
    })));
  }, onError);
}
