import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import estimatesRouter from "./routes/estimates.js";
import usersRouter from "./routes/users.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/estimates", estimatesRouter);
app.use("/api/users", usersRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
