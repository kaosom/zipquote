// routes/users.js
import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { id, full_name, company, phone, email, address, created_at } =
    req.body;

  const { error } = await supabase
    .from("users")
    .insert([{ id, full_name, company, phone, email, address, created_at }]);

  if (error) {
    console.error("Error al crear usuario:", error);
    return res.status(500).json({ error: "Error al crear usuario" });
  }

  res.status(201).json({ message: "Usuario creado con éxito" });
});

export default router;
