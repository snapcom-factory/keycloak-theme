import { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { startReactDsfr } from "@codegouvfr/react-dsfr/spa";
import { kcContext } from "ui-dsfr/keycloak-theme/kcContext";
startReactDsfr({ "defaultColorScheme": "system" });

const App = lazy(() => import("ui-dsfr/App"));
const KcApp = lazy(() => import("ui-dsfr/keycloak-theme/KcApp"));

createRoot(document.getElementById("root")!).render(
    <Suspense>
        {kcContext !== undefined ? <KcApp kcContext={kcContext} /> : <App />}
    </Suspense>
);
