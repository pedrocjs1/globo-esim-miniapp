import "dotenv/config";
import express from "express";
import cors from "cors";
import airaloRouter from "./routes/airalo";   // 👈 NUEVO

const app = express();

app.use(cors());
app.use(express.json());


app.use("/api/airalo", airaloRouter);

const port = process.env.PORT || 4000;

app.get("/", (_req, res) => {
  res.send("Backend Globo eSIM funcionando ✅");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
