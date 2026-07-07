import app from "./app.js";

const port = Number(process.env.PORT ?? 8787);

const server = app.listen(port, () => {
  console.log(`Sync API listening on http://localhost:${port}`);
});

process.on("SIGINT", () => {
  server.close(() => process.exit(0));
});
