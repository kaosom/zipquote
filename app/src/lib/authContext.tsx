import { createContext, useContext } from "solid-js";
import { createStore } from "solid-js/store";

type AuthState = {
  isAuthenticated: boolean;
  isPremium: boolean;
};

type AuthContextType = [
  AuthState,
  {
    setAuthenticated: (value: boolean) => void;
    setPremium: (value: boolean) => void;
  }
];

const AuthContext = createContext<AuthContextType>();

export function AuthProvider(props: { children: any }) {
  const [state, setState] = createStore<AuthState>({
    isAuthenticated: false,
    isPremium: false,
  });

  const setAuthenticated = (value: boolean) =>
    setState("isAuthenticated", value);
  const setPremium = (value: boolean) => setState("isPremium", value);

  return (
    <AuthContext.Provider value={[state, { setAuthenticated, setPremium }]}>
      {props.children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
