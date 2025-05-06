import { createSignal, onMount, onCleanup } from "solid-js";
import { toast } from "solid-toast";

import LandingPage from "./components/LandingPage";
import EstimateForm from "./components/EstimateForm";
import SavedEstimates from "./components/SavedEstimates";
import PremiumModal from "./components/PremiumModal";
import { loadEstimates, saveEstimates } from "./lib/storage";
import type { Estimate } from "./lib/types";
import { supabase } from "./supabaseClient";
import { useAuth } from "./lib/authContext";

import {
  saveEstimate,
  fetchUserEstimates,
  deleteEstimate,
  uploadLocalEstimates,
} from "./lib/estimateService";

type View = "landing" | "form" | "saved";

export default function App() {
  const [view, setView] = createSignal<View>("landing");
  const [estimates, setEstimates] = createSignal<Estimate[]>([]);
  const [editable, setEditable] = createSignal<Estimate | null>(null);
  const [showPremium, setShowPremium] = createSignal(false);
  const [askToUpload, setAskToUpload] = createSignal(false);

  const [auth, { setAuthenticated, setPremium }] = useAuth();

  const loadUserEstimates = async () => {
    const data = await fetchUserEstimates();
    if (data) setEstimates(data);
  };

  onMount(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      setAuthenticated(true);
      setPremium(true);
      await loadUserEstimates();
    } else {
      setEstimates(loadEstimates());
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setAuthenticated(true);
          setPremium(true);
          await loadUserEstimates();

          const local = loadEstimates();
          if (local.length > 0) {
            setAskToUpload(true);
          }
        } else {
          setAuthenticated(false);
          setPremium(false);
          setEstimates(loadEstimates());
        }
      }
    );

    onCleanup(() => {
      authListener?.subscription.unsubscribe();
    });
  });

  const persist = (list: Estimate[]) => {
    setEstimates(list);
    saveEstimates(list);
  };

  const saveHandler = (est: Estimate, replace?: boolean) => {
    const list = replace
      ? estimates().map((e) => (e.id === est.id ? est : e))
      : [...estimates(), est];

    if (!replace && list.length >= 5 && !auth.isPremium) {
      setShowPremium(true);
      return false;
    }

    if (auth.isAuthenticated) {
      setEstimates(list);
      saveEstimate(est);
    } else {
      persist(list);
    }

    toast.success(replace ? "Estimate updated" : "Estimate saved");
    return true;
  };

  return (
    <>
      {view() === "landing" && (
        <LandingPage
          onCreate={() => {
            setEditable(null);
            setView("form");
          }}
          onView={() => setView("saved")}
        />
      )}

      {view() === "form" && (
        <EstimateForm
          initial={editable()}
          onBack={() => setView("landing")}
          onSave={saveHandler}
          saved={estimates()}
        />
      )}

      {view() === "saved" && (
        <SavedEstimates
          list={estimates()}
          onBack={() => setView("landing")}
          onDelete={async (id) => {
            if (auth.isAuthenticated) {
              await deleteEstimate(id);
              setEstimates(estimates().filter((e) => e.id !== id));
            } else {
              const updated = estimates().filter((e) => e.id !== id);
              persist(updated);
            }

            toast.success("Estimate removed");
          }}
          onEdit={(est) => {
            setEditable(est);
            setView("form");
          }}
          onDownload={(est) => {
            if (!est.pdfData) return toast.error("No PDF found");
            const a = document.createElement("a");
            a.href = est.pdfData;
            a.download = `estimate-${est.client.name}.pdf`;
            a.click();
          }}
        />
      )}

      {showPremium() && (
        <PremiumModal
          onClose={() => setShowPremium(false)}
          onUpgrade={() => {
            setPremium(true);
            setShowPremium(false);
            setAskToUpload(true);
          }}
        />
      )}

      {askToUpload() && (
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div class="bg-white dark:bg-gray-800 p-6 rounded shadow max-w-sm w-full">
            <h2 class="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
              Upload your local estimates?
            </h2>
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
              This will send all local estimates to your account and clear them
              from this device.
            </p>
            <div class="flex justify-end gap-2">
              <button class="btn-outline" onClick={() => setAskToUpload(false)}>
                No
              </button>
              <button
                class="btn-primary"
                onClick={async () => {
                  await uploadLocalEstimates();
                  setAskToUpload(false);
                  const data = await fetchUserEstimates();
                  if (data) setEstimates(data);
                  toast.success("Estimates uploaded successfully");
                }}
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
