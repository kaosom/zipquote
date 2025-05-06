import { render } from "solid-js/web";
import MainRouter from "./MainRouter";
import { AuthProvider } from "./lib/authContext";
import "./index.css";

render(
  () => (
    <AuthProvider>
      <MainRouter />
    </AuthProvider>
  ),
  document.getElementById("root")!
);
