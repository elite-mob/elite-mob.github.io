import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initFirebaseAnalytics } from "./integrations/firebase/analytics";

void initFirebaseAnalytics();

createRoot(document.getElementById("root")!).render(<App />);
