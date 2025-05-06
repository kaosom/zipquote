import type { Estimate } from "./types";

const KEY = "estimates";

export const loadEstimates = (): Estimate[] => {
  const data = localStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
};

export const saveEstimates = (list: Estimate[]) => {
  localStorage.setItem(KEY, JSON.stringify(list));
};

export const getEstimateById = (id: string): Estimate | undefined => {
  return loadEstimates().find((e) => e.id === id);
};

export const deleteEstimateById = (id: string): void => {
  const updated = loadEstimates().filter((e) => e.id !== id);
  saveEstimates(updated);
};

export const addOrUpdateEstimate = (estimate: Estimate): void => {
  const list = loadEstimates();
  const index = list.findIndex((e) => e.id === estimate.id);

  if (index >= 0) {
    list[index] = estimate;
  } else {
    list.push(estimate);
  }

  saveEstimates(list);
};
