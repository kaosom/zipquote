import { createSignal, onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { MoveRight, FileText, Sun, Moon, Zap, User } from "lucide-solid";
import { TextButton } from "./ui";
import { supabase } from "../supabaseClient";
import landingHero from "../assets/landing.webp";
import AuthPage from "../Auth";
import { useAuth } from "../lib/authContext";

export default function LandingPage(props: {
  onCreate: () => void;
  onView: () => void;
}) {
  const [dark, setDark] = createSignal(false);
  const [text, setText] = createSignal("");
  const fullText = "Create professional estimates in seconds";
  const [cursorVisible, setCursorVisible] = createSignal(true);
  const navigate = useNavigate();
  const [auth, { setAuthenticated, setPremium }] = useAuth();

  const toggle = () => {
    setDark(!dark());
    document.documentElement.classList.toggle("dark");
  };

  onMount(async () => {
    const { data } = await supabase.auth.getSession();
    setAuthenticated(!!data.session?.user);

    supabase.auth.onAuthStateChange((_event, session) => {
      const isLoggedIn = !!session?.user;
      setAuthenticated(isLoggedIn);
      setPremium(isLoggedIn);
    });

    let index = 0;
    const typing = setInterval(() => {
      setText(fullText.slice(0, index + 1));
      index++;
      if (index === fullText.length) {
        clearInterval(typing);
        clearInterval(cursorBlink);
        setCursorVisible(false);
      }
    }, 80);

    const cursorBlink = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 500);

    return () => {
      clearInterval(typing);
      clearInterval(cursorBlink);
    };
  });

  const handleUserClick = async () => {
    if (auth.isAuthenticated) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error.message);
      }
    } else {
      navigate("/auth");
    }
  };

  const highlighted = () => {
    const word = "estimates";
    const index = text().indexOf(word);
    const cursor = cursorVisible() ? "|" : " ";

    if (index === -1)
      return (
        <>
          {text()}
          {cursor}
        </>
      );

    return (
      <>
        {text().slice(0, index)}
        <span class="text-purple-600 dark:text-purple-400">
          {text().slice(index, index + word.length)}
        </span>
        {text().slice(index + word.length)}
        <span class="ml-1">{cursor}</span>
      </>
    );
  };

  return (
    <div class="flex flex-col min-h-screen">
      <header class="container mx-auto px-4 py-6 flex justify-between items-center">
        <div class="flex items-center gap-2">
          <Zap class="w-7 h-7 text-purple-600 dark:text-purple-400" />
          <h1 class="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
            ZipQuote
          </h1>
        </div>

        <div class="flex items-center gap-3">
          <button
            class="p-2 rounded-full bg-gray-100 dark:bg-gray-800"
            onClick={toggle}
          >
            {dark() ? (
              <Sun class="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon class="w-5 h-5 text-gray-700" />
            )}
          </button>

          <button
            class="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm"
            onClick={handleUserClick}
          >
            <User class="w-5 h-5 text-gray-700 dark:text-white" />
            {auth.isAuthenticated ? "Sign out" : "Sign in"}
          </button>
        </div>
      </header>

      <main class="flex-grow container mx-auto px-4 py-12 flex flex-col-reverse md:flex-row items-center gap-8">
        <dialog
          id="auth-modal"
          class="rounded-xl max-w-md w-full backdrop:bg-black/50 p-0 border-0"
        >
          <AuthPage />
        </dialog>
        <section class="md:w-1/2 space-y-6">
          <h2 class="text-4xl font-bold leading-tight">{highlighted()}</h2>
          <p class="text-lg text-gray-600 dark:text-gray-300">
            A minimal tool for contractors to generate, manage and share
            estimates.
          </p>
          <div class="flex flex-col sm:flex-row gap-4">
            <TextButton primary onClick={props.onCreate}>
              Create Estimate <MoveRight class="w-5 h-5" />
            </TextButton>
            <TextButton onClick={props.onView}>
              View Saved <FileText class="w-5 h-5" />
            </TextButton>
          </div>
        </section>
        <img
          src={landingHero}
          alt="Landing hero"
          class="md:w-1/2 h-72 object-cover rounded-xl shadow-inner"
        />
      </main>

      <footer class="text-center py-6 border-t border-gray-200 dark:border-gray-800 text-sm text-gray-500">
        © {new Date().getFullYear()} ZipQuote
      </footer>
    </div>
  );
}
