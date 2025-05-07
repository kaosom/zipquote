import { createSignal, Show } from "solid-js";
import { supabase } from "./supabaseClient";
import { useNavigate } from "@solidjs/router";
import { saveUser } from "./lib/estimateApi";

export default function AuthPage() {
  const navigate = useNavigate();

  // Campos del formulario
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [fullName, setFullName] = createSignal("");
  const [company, setCompany] = createSignal("");
  const [phone, setPhone] = createSignal("");
  const [address, setAddress] = createSignal("");

  const [message, setMessage] = createSignal("");
  const [mode, setMode] = createSignal<"login" | "register">("login");

  const handleSubmit = async () => {
    setMessage("");

    if (!email() || !password()) {
      setMessage("Please fill in email and password.");
      return;
    }

    if (mode() === "register") {
      const { data, error } = await supabase.auth.signUp({
        email: email(),
        password: password(),
      });

      if (error) {
        setMessage(error.message);
      } else {
        try {
          await saveUser(
            email(),
            data.user?.id ?? "",
            fullName(),
            company(),
            phone(),
            address()
          );
          setMessage("User registered successfully!");
          navigate("/", { replace: true });
        } catch (err) {
          setMessage("Error saving user in database");
          console.error(err);
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email(),
        password: password(),
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Success!");
        navigate("/", { replace: true });
      }
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
            class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
          />
          <input
            type="password"
            placeholder="Password"
            value={password()}
            onInput={(e) => setPassword(e.currentTarget.value)}
            class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
          />

          <Show when={mode() === "register"}>
            <input
              type="text"
              placeholder="Full Name"
              value={fullName()}
              onInput={(e) => setFullName(e.currentTarget.value)}
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
            />
            <input
              type="text"
              placeholder="Company"
              value={company()}
              onInput={(e) => setCompany(e.currentTarget.value)}
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
            />
            <input
              type="text"
              placeholder="Phone"
              value={phone()}
              onInput={(e) => setPhone(e.currentTarget.value)}
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
            />
            <input
              type="text"
              placeholder="Address"
              value={address()}
              onInput={(e) => setAddress(e.currentTarget.value)}
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
            />
          </Show>

          <button
            onClick={handleSubmit}
            class="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md"
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

          <Show when={mode() === "register"}>
            <div class="text-xs text-gray-400 mt-2">
              <strong>Debug:</strong>
              <br />
              Name: {fullName()} <br />
              Email: {email()} <br />
              Password: {password()} <br />
              Company: {company()} <br />
              Phone: {phone()} <br />
              Address: {address()}
            </div>
          </Show>
        </form>
      </div>
    </div>
  );
}
