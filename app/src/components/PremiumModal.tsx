import { createSignal, Show } from "solid-js";
import { X, Zap, Check } from "lucide-solid";
import AuthForm from "../AuthForm";

export default function PremiumModal(props: {
  onClose: () => void;
  onUpgrade?: () => void;
}) {
  const [showLogin, setShowLogin] = createSignal(false);
  const [loading, setLoading] = createSignal(false);

  const handleUpgrade = () => {
    setShowLogin(true);
  };

  const handleAuthSuccess = async () => {
    setLoading(true);
    await new Promise((res) => setTimeout(res, 1500));
    props.onUpgrade?.();
    setLoading(false);
    props.onClose();
  };

  return (
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md shadow-lg p-4">
        <div class="flex justify-between border-b border-gray-200 dark:border-gray-700 mb-4">
          <div class="flex items-center gap-2">
            <Zap class="w-5 h-5 text-yellow-500" />
            <h2 class="font-semibold">Upgrade to Premium</h2>
          </div>
          <button onClick={props.onClose}>
            <X class="w-4 h-4" />
          </button>
        </div>

        <Show
          when={!showLogin()}
          fallback={<AuthForm onSuccess={handleAuthSuccess} />}
        >
          <p>You’ve reached your limit of 5 saved estimates.</p>
          <ul class="my-4 space-y-1">
            {[
              "Unlimited estimates",
              "Export to Word/Excel",
              "Priority support",
            ].map((item) => (
              <li class="flex items-center gap-2">
                <Check class="w-4 h-4 text-green-500" />
                {item}
              </li>
            ))}
          </ul>

          <button
            class="btn-primary w-full"
            onClick={handleUpgrade}
            disabled={loading()}
          >
            {loading() ? "Loading..." : "Upgrade for $9.99/mo"}
          </button>
          <button class="btn-outline w-full mt-2" onClick={props.onClose}>
            Continue with Free Plan
          </button>
        </Show>
      </div>
    </div>
  );
}
