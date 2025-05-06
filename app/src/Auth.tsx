import { createSignal } from "solid-js";
import { supabase } from "./supabaseClient";
import { useNavigate } from "@solidjs/router";
export default function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [message, setMessage] = createSignal("");
  const [mode, setMode] = createSignal<"login" | "register">("login");

  const handleSubmit = async () => {
    setMessage("");
    if (!email() || !password()) {
      setMessage("Please fill in all fields.");
      return;
    }

    const { error } =
      mode() === "register"
        ? await supabase.auth.signUp({
            email: email(),
            password: password(),
          })
        : await supabase.auth.signInWithPassword({
            email: email(),
            password: password(),
          });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Success!");
      navigate("/", { replace: true });
    }
  };

  return (
    <div class="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 p-6">
      <div class="w-full max-w-sm rounded-lg shadow-lg p-6 bg-white dark:bg-gray-800">
        <h2 class="text-xl font-semibold text-center text-gray-800 dark:text-white mb-6">
          {mode() === "login" ? "Sign In" : "Register"}
        </h2>
        <form class="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="Email"
            value={email()}
            onInput={(e) => setEmail(e.currentTarget.value)}
            class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
          />
          <input
            type="password"
            placeholder="Password"
            value={password()}
            onInput={(e) => setPassword(e.currentTarget.value)}
            class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={handleSubmit}
            class="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md transition"
          >
            {mode() === "login" ? "Sign In" : "Create Account"}
          </button>
          <p class="text-sm text-center text-gray-600 dark:text-gray-400">
            {mode() === "login"
              ? "Don't have an account?"
              : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode() === "login" ? "register" : "login")}
              class="text-purple-600 hover:underline"
            >
              {mode() === "login" ? "Register" : "Sign In"}
            </button>
          </p>
          {message() && (
            <div class="text-center text-sm text-red-500">{message()}</div>
          )}
        </form>
      </div>
    </div>
  );
}
