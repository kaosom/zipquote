import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const user_id = req.query.user_id;

  if (!user_id) {
    return res.status(400).json({ error: "user_id es requerido" });
  }

  const { data, error } = await supabase
    .from("estimates")
    .select("*, items(*)")
    .eq("user_id", user_id);

  if (error) {
    console.error("Error al obtener estimates:", error);
    return res.status(500).json({ error: "Error al obtener estimates" });
  }

  res.json(data);
});

router.post("/", async (req, res) => {
  const estimate = req.body;

  const { error: upsertError } = await supabase.from("estimates").upsert({
    id: estimate.id,
    user_id: estimate.user_id,
    date: estimate.date,
    contractor: estimate.contractor,
    client: estimate.client,
    tax_rate: estimate.tax_rate || 0,
    subtotal: estimate.subtotal || 0,
    tax: estimate.tax || 0,
    total: estimate.total || 0,
    pdf_data: estimate.pdf_data || null,
  });

  if (upsertError) {
    console.error("Error al guardar estimate:", upsertError);
    return res.status(500).json({ error: "Error al guardar estimate" });
  }

  await supabase.from("items").delete().eq("estimate_id", estimate.id);

  const items = (estimate.items || []).map((item) => ({
    estimate_id: estimate.id,
    name: item.name || "",
    quantity: item.quantity ?? 1,
    price: item.price || 0,
  }));

  const { error: insertError } = await supabase.from("items").insert(items);

  if (insertError) {
    console.error("Error al insertar items:", insertError);
    return res.status(500).json({ error: "Error al insertar items" });
  }

  res.sendStatus(200);
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  await supabase.from("items").delete().eq("estimate_id", id);
  const { error } = await supabase.from("estimates").delete().eq("id", id);

  if (error) {
    console.error("Error al eliminar estimate:", error);
    return res.status(500).json({ error: "Error al eliminar estimate" });
  }

  res.sendStatus(200);
});

export default router;
