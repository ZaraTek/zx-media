import "dotenv/config";
import cors from "cors";
import crypto from "node:crypto";
import express from "express";
import { MongoClient } from "mongodb";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "zx_media";
const googleClientId = process.env.GOOGLE_CLIENT_ID;

if (!mongoUri) {
  throw new Error("Missing MONGODB_URI environment variable.");
}

if (!googleClientId) {
  throw new Error("Missing GOOGLE_CLIENT_ID environment variable.");
}

if (!process.env.JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET not set. Sessions will not survive server restarts.");
}

const JWT_SECRET = process.env.JWT_SECRET ?? crypto.randomBytes(32).toString("hex");
const oauthClient = new OAuth2Client(googleClientId);

// Reuse the Mongo client across warm serverless invocations.
const globalForMongo = globalThis;
const client =
  globalForMongo.__zxMongoClient ?? (globalForMongo.__zxMongoClient = new MongoClient(mongoUri));

const profilesCollection = async () => {
  if (!globalForMongo.__zxMongoConnected) {
    await client.connect();
    globalForMongo.__zxMongoConnected = true;
  }
  return client.db(dbName).collection("syncProfiles");
};

function normalizeLibrary(raw) {
  if (!Array.isArray(raw)) return [];
  const ids = new Set();
  for (const value of raw) {
    if (typeof value === "string" && value.trim()) {
      ids.add(value.trim());
    }
  }
  return [...ids].slice(0, 1000);
}

function normalizeWatchProgress(raw) {
  if (!Array.isArray(raw)) return [];
  const byShow = new Map();
  for (const value of raw) {
    if (!value || typeof value !== "object") continue;
    const {
      showId,
      episodeId,
      seasonNumber,
      episodeNumber,
      episodeTitle,
      showTitle,
      poster,
      updatedAt,
    } = value;
    if (typeof showId !== "string" || !showId.trim()) continue;
    if (typeof episodeId !== "string" || !episodeId.trim()) continue;
    if (!Number.isFinite(seasonNumber) || !Number.isFinite(episodeNumber)) continue;
    if (!Number.isFinite(updatedAt)) continue;
    byShow.set(showId.trim(), {
      showId: showId.trim(),
      episodeId: episodeId.trim(),
      seasonNumber,
      episodeNumber,
      episodeTitle: typeof episodeTitle === "string" ? episodeTitle.slice(0, 300) : "",
      showTitle: typeof showTitle === "string" ? showTitle.slice(0, 300) : "",
      poster: typeof poster === "string" ? poster.slice(0, 2000) : "",
      updatedAt,
    });
  }
  return [...byShow.values()]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 300);
}

function signAppJwt(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  try {
    req.user = jwt.verify(auth.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Session expired. Please sign in again." });
  }
}

const app = express();

app.use(cors());
app.use(express.json({ limit: "200kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/auth/google", async (req, res) => {
  try {
    const idToken = req.body?.idToken;
    if (!idToken || typeof idToken !== "string") {
      res.status(400).json({ message: "idToken is required" });
      return;
    }

    const ticket = await oauthClient.verifyIdToken({
      idToken,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();
    const googleSub = payload.sub;
    const email = payload.email ?? "";

    const collection = await profilesCollection();
    const now = new Date();

    await collection.updateOne(
      { _id: googleSub },
      {
        $set: { email, lastSeenAt: now },
        $setOnInsert: { library: [], watchProgress: [], createdAt: now, updatedAt: now },
      },
      { upsert: true }
    );

    res.json({ jwt: signAppJwt({ sub: googleSub, email }), email });
  } catch (error) {
    console.error("google auth error", error);
    res.status(401).json({ message: "Invalid Google token" });
  }
});

app.get("/api/sync/library", requireAuth, async (req, res) => {
  try {
    const collection = await profilesCollection();
    const profile = await collection.findOne({ _id: req.user.sub });
    const now = new Date();

    if (!profile) {
      res.json({ library: [], watchProgress: [], updatedAt: now.toISOString() });
      return;
    }

    await collection.updateOne({ _id: req.user.sub }, { $set: { lastSeenAt: now } });

    res.json({
      library: normalizeLibrary(profile.library),
      watchProgress: normalizeWatchProgress(profile.watchProgress),
      updatedAt: profile.updatedAt?.toISOString?.() ?? now.toISOString(),
    });
  } catch (error) {
    console.error("pull library error", error);
    res.status(500).json({ message: "Could not fetch library" });
  }
});

app.put("/api/sync/library", requireAuth, async (req, res) => {
  try {
    const library = normalizeLibrary(req.body?.library);
    const watchProgress = normalizeWatchProgress(req.body?.watchProgress);
    const collection = await profilesCollection();
    const now = new Date();

    await collection.updateOne(
      { _id: req.user.sub },
      {
        $set: { library, watchProgress, updatedAt: now, lastSeenAt: now },
        $setOnInsert: { email: req.user.email ?? "", createdAt: now },
      },
      { upsert: true }
    );

    res.json({ library, watchProgress, updatedAt: now.toISOString() });
  } catch (error) {
    console.error("push library error", error);
    res.status(500).json({ message: "Could not save library" });
  }
});

export default app;
