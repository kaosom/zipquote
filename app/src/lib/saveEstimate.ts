import { supabase } from "../supabaseClient";
import { saveEstimates, loadEstimates } from "./storage";
import { Estimate, Item } from "./types";

export const saveEstimate = async (estimate: Estimate) => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.user) {
    console.warn("Guardando en localStorage (sin sesión activa)");

    const localList = loadEstimates();
    const updatedList = localList
      .filter((e) => e.id !== estimate.id)
      .concat(estimate);

    saveEstimates(updatedList);
    return;
  }

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("id", session.user.id)
    .single();

  if (userError || !userData) {
    console.error("User lookup error:", userError);
    return;
  }

  const estimatePayload = {
    id: estimate.id,
    user_id: userData.id,
    date: estimate.date,
    contractor: estimate.contractor || {},
    client: estimate.client || {},
    tax_rate: isNaN(estimate.taxRate) ? 0 : estimate.taxRate,
    subtotal: isNaN(estimate.subtotal) ? 0 : estimate.subtotal,
    tax: isNaN(estimate.tax) ? 0 : estimate.tax,
    total: isNaN(estimate.total) ? 0 : estimate.total,
    pdf_data: estimate.pdfData || null,
  };

  const { error: insertEstimateError } = await supabase
    .from("estimates")
    .upsert(estimatePayload);

  if (insertEstimateError) {
    console.error("Error inserting estimate:", insertEstimateError);
    return;
  }

  await supabase.from("items").delete().eq("estimate_id", estimate.id);

  const itemInserts = estimate.items.map((item: Item) => ({
    estimate_id: estimate.id,
    name: item.name || "",
    quantity: item.quantity ?? 1,
    price: isNaN(item.price) ? 0 : item.price,
  }));

  await supabase.from("items").insert(itemInserts);
};
