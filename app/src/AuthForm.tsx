import { createSignal } from "solid-js";
import { supabase } from "./supabaseClient";

export default function AuthForm(props: { onSuccess?: () => void }) {
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

    let error;
    if (mode() === "register") {
      ({ error } = await supabase.auth.signUp({
        email: email(),
        password: password(),
      }));
    } else {
      ({ error } = await supabase.auth.signInWithPassword({
        email: email(),
        password: password(),
      }));
    }

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Success!");
      props.onSuccess?.();
    }
  };

  return (
    <div class="space-y-4">
      <input
        type="email"
        placeholder="Email"
        value={email()}
        onInput={(e) => setEmail(e.currentTarget.value)}
        class="input"
      />
      <input
        type="password"
        placeholder="Password"
        value={password()}
        onInput={(e) => setPassword(e.currentTarget.value)}
        class="input"
      />
      <button class="btn-primary w-full" onClick={handleSubmit}>
        {mode() === "login" ? "Sign In" : "Register"}
      </button>
      <p class="text-sm text-center text-gray-600 dark:text-gray-300">
        {mode() === "login"
          ? "Don't have an account?"
          : "Already have an account?"}{" "}
        <button
          class="text-purple-600 hover:underline"
          onClick={() => setMode(mode() === "login" ? "register" : "login")}
        >
          {mode() === "login" ? "Register" : "Sign In"}
        </button>
      </p>
      {message() && (
        <div class="text-center text-sm text-red-500">{message()}</div>
      )}
    </div>
  );
}
