import "dotenv/config";
import cors from "cors";
import crypto from "node:crypto";
import express from "express";
import { MongoClient } from "mongodb";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

const app = express();
const port = Number(process.env.PORT ?? 8787);
const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "zx_media";
const googleClientId = process.env.GOOGLE_CLIENT_ID;

if (!mongoUri) {
  console.error("Missing MONGODB_URI environment variable.");
  process.exit(1);
}

if (!googleClientId) {
  console.error("Missing GOOGLE_CLIENT_ID environment variable.");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET not set. Sessions will not survive server restarts.");
}

const JWT_SECRET = process.env.JWT_SECRET ?? crypto.randomBytes(32).toString("hex");
const oauthClient = new OAuth2Client(googleClientId);
const client = new MongoClient(mongoUri);
let isConnected = false;

const profilesCollection = async () => {
  if (!isConnected) {
    await client.connect();
    isConnected = true;
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
        $setOnInsert: { library: [], createdAt: now, updatedAt: now },
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
      res.json({ library: [], updatedAt: now.toISOString() });
      return;
    }

    await collection.updateOne({ _id: req.user.sub }, { $set: { lastSeenAt: now } });

    res.json({
      library: normalizeLibrary(profile.library),
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
    const collection = await profilesCollection();
    const now = new Date();

    await collection.updateOne(
      { _id: req.user.sub },
      {
        $set: { library, updatedAt: now, lastSeenAt: now },
        $setOnInsert: { email: req.user.email ?? "", createdAt: now },
      },
      { upsert: true }
    );

    res.json({ library, updatedAt: now.toISOString() });
  } catch (error) {
    console.error("push library error", error);
    res.status(500).json({ message: "Could not save library" });
  }
});

app.listen(port, () => {
  console.log(`Sync API listening on http://localhost:${port}`);
});

process.on("SIGINT", async () => {
  await client.close();
  process.exit(0);
});
