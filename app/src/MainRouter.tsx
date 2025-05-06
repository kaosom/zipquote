import { Router, Route } from "@solidjs/router";
import { Toaster } from "solid-toast";
import App from "./App";
import AuthPage from "./Auth";

export default function MainRouter() {
  return (
    <>
      <Router>
        <Route path="/" component={App} />
        <Route path="/auth" component={AuthPage} />
      </Router>
      <Toaster position="top-right" gutter={8} />
    </>
  );
}
