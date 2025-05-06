import { createSignal, Show, For } from "solid-js";
import {
  ArrowLeft,
  Download,
  Trash2,
  Calendar,
  User,
  Pencil,
} from "lucide-solid";

import type { Estimate } from "../lib/types";
import { supabase } from "../supabaseClient";
import { useAuth } from "../lib/authContext";

interface SavedProps {
  list: Estimate[];
  onBack: () => void;
  onDelete: (id: string) => void;
  onEdit: (e: Estimate) => void;
  onDownload: (e: Estimate) => void;
}

export default function SavedEstimates(props: SavedProps) {
  const [expandedId, setExpandedId] = createSignal<string | null>(null);
  const [auth] = useAuth();

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const handleDelete = async (id: string) => {
    props.onDelete(id);

    if (auth.isAuthenticated) {
      await supabase.from("estimates").delete().eq("id", id);
    }
  };

  return (
    <div class="container mx-auto px-4 py-8">
      <button
        class="btn-ghost flex items-center gap-2 mb-6"
        onClick={props.onBack}
      >
        <ArrowLeft class="w-4 h-4" /> Back
      </button>

      <h1 class="text-3xl font-bold mb-8 text-center">Saved estimates</h1>

      <Show
        when={props.list.length > 0}
        fallback={<p class="text-center">There are no saved estimates.</p>}
      >
        <For each={props.list}>
          {(est) => (
            <div class="border rounded-lg mb-4 overflow-hidden">
              <div
                class="p-4 flex justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                onClick={() =>
                  setExpandedId(expandedId() === est.id ? null : est.id)
                }
              >
                <div>
                  <h3 class="font-semibold">{est.client.name}</h3>

                  <div class="text-sm text-gray-500 flex gap-4 mt-1">
                    <span class="flex items-center gap-1">
                      <Calendar class="w-3 h-3" />
                      {fmtDate(est.date)}
                    </span>

                    <span class="flex items-center gap-1">
                      <User class="w-3 h-3" />
                      {est.contractor.name}
                    </span>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <span class="font-bold text-purple-600">
                    ${est.total.toFixed(2)}
                  </span>

                  <button
                    class="btn-outline text-xs"
                    title="Edit"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      props.onEdit(est);
                    }}
                  >
                    <Pencil class="w-3 h-3" />
                  </button>

                  <button
                    class="btn-outline text-xs"
                    title="Download PDF"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      props.onDownload(est);
                    }}
                  >
                    <Download class="w-3 h-3" />
                  </button>

                  <button
                    class="btn-outline text-xs text-red-500 border-red-300"
                    title="Delete"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      handleDelete(est.id);
                    }}
                  >
                    <Trash2 class="w-3 h-3" />
                  </button>
                </div>
              </div>

              <Show when={expandedId() === est.id}>
                <div class="p-4 bg-gray-50 dark:bg-gray-800/50 text-sm">
                  <p class="font-medium mb-2">Items ({est.items.length})</p>

                  <ul class="list-disc pl-5 space-y-1">
                    <For each={est.items}>
                      {(it) => (
                        <li>
                          {it.quantity} × {it.name} — $
                          {(it.price * it.quantity).toFixed(2)}
                        </li>
                      )}
                    </For>
                  </ul>

                  <div class="border-t pt-3 mt-3 space-y-1 text-right">
                    <p>Subtotal: ${est.subtotal.toFixed(2)}</p>
                    <p>
                      Tax ({est.taxRate}%): ${est.tax.toFixed(2)}
                    </p>
                    <p class="font-bold">Total: ${est.total.toFixed(2)}</p>
                  </div>
                </div>
              </Show>
            </div>
          )}
        </For>
      </Show>
    </div>
  );
}
