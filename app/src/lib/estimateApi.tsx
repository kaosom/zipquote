import type { Estimate } from "./types";

const API_URL = "http://localhost:3001/api/estimates";

export const saveEstimate = async (estimate: Estimate): Promise<void> => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(estimate),
  });

  if (!res.ok) {
    throw new Error("Error al guardar el estimate");
  }
};

export const fetchUserEstimates = async (
  user_id: string
): Promise<Estimate[]> => {
  const res = await fetch(`${API_URL}?user_id=${user_id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Error al obtener estimates");
  }

  return await res.json();
};

export const deleteEstimate = async (id: string): Promise<void> => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Error al eliminar el estimate");
  }
};

export const uploadLocalEstimates = async (): Promise<void> => {
  const res = await fetch(`${API_URL}/upload-local`, {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error("Error al subir estimates locales");
  }
};
