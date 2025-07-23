import express from "express";

const app = express();

if (process.argv.includes("--serve-client")) {
  app.use("/", express.static("dist"));
}

app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.get("/api", (_req, res) => {
  res.status(200).sendFile("mockData.json", { root: "." });
});

app.listen(8000, () => {
  console.log("Server is running at http://localhost:8000");
});
