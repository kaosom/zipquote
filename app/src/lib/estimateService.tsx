import { supabase } from "../supabaseClient";
import { saveEstimates, loadEstimates } from "./storage";
import type { Estimate } from "./types";
import {
  saveEstimate as apiSaveEstimate,
  fetchUserEstimates as apiFetchUserEstimates,
  deleteEstimate as apiDeleteEstimate,
} from "./estimateApi";

const getUserSession = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error || !session?.user) return null;
  return session;
};

export const saveEstimate = async (estimate: Estimate): Promise<void> => {
  const session = await getUserSession();

  if (!session) {
    const localList = loadEstimates();
    const updated = localList
      .filter((e) => e.id !== estimate.id)
      .concat(estimate);
    saveEstimates(updated);
    return;
  }

  try {
    await apiSaveEstimate(estimate);
  } catch (error) {
    console.error("Error al guardar estimate:", error);
  }
};

export const fetchUserEstimates = async (): Promise<Estimate[]> => {
  const session = await getUserSession();

  if (!session) {
    return loadEstimates();
  }
  const user_id = session.user.id;

  try {
    return await apiFetchUserEstimates(user_id);
  } catch (error) {
    console.error("Error al obtener estimates:", error);
    return [];
  }
};

export const deleteEstimate = async (id: string): Promise<void> => {
  const session = await getUserSession();

  if (!session) {
    const updated = loadEstimates().filter((e) => e.id !== id);
    saveEstimates(updated);
    return;
  }

  try {
    await apiDeleteEstimate(id);
  } catch (error) {
    console.error("Error al eliminar estimate:", error);
  }
};

export const uploadLocalEstimates = async (): Promise<void> => {
  const session = await getUserSession();

  if (!session) {
    console.warn("No hay sesión activa. No se puede subir estimates locales.");
    return;
  }

  const user_id = session.user.id;
  const local = loadEstimates();

  try {
    for (const est of local) {
      const estimateWithUser = {
        ...est,
        user_id,
      };

      await apiSaveEstimate(estimateWithUser);
    }

    localStorage.removeItem("estimates");
  } catch (e) {
    console.error("Error al subir estimates locales:", e);
  }
};
