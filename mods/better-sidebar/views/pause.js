// Ajout perso : pause des sessions Claude avec ~/.local/bin/claude-pause. claude s'arrête et
// libère sa mémoire ; l'onglet reste, et Entrée y reprend la session.
import { div } from "gpui-kit";
import { exec, home, notify } from "herdr";
import { Icon } from "./ui.js";

// Une session Claude locale qui ne travaille pas.
export const pausable = (a) =>
  a.app === "claude-code" && a.status !== "working" && !a.address.includes("/");

// Le bouton ⏸ des lignes survolées. `onPress` remet la ligne en état (survol, glisser).
export function PauseButton(id, label, addresses, t, onPress) {
  return div()
    .id(id)
    .flex_none()
    .p(5)
    .rounded(5)
    .text_color(t.dim)
    .cursor_pointer()
    .hover((s) => s.bg(t.hover).text_color(t.foreground))
    .tooltip(label)
    .on_click((_e, cx) => {
      cx.stop_propagation();
      onPress?.();
      cx.notify();
      cx.spawn(async () => {
        const r = await exec(`${home()}/.local/bin/claude-pause`, addresses, { timeout: 120000 }).catch(
          (e) => ({ code: -1, stderr: String(e) }),
        );
        if (r.code !== 0)
          notify({ title: "Pause impossible", body: (r.stderr || r.stdout || "").trim(), level: "error" });
      });
    })
    .child(Icon("pause", 13));
}
