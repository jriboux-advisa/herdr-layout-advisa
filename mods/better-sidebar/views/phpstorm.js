// Ajout perso : l'icône et la couleur qu'un espace a dans PhpStorm.
// Le projet est le dossier de l'espace s'il contient un .idea, sinon
// ~/web/<nom de l'espace>. L'icône est .idea/icon.svg (ou icon.png), la
// couleur le customColor du ProjectColorInfo de .idea/workspace.xml
// (RRGGBBAA : l'alpha, intensité du dégradé de la barre d'outils, est ignoré).
//
// image() ne lit que sous le dossier de l'app, et n'affiche pas une icône
// atteinte par un lien symbolique : elle y est recopiée, sous
// phpstorm-icons/<dossier du projet>@<empreinte>.svg. L'app garde une image en
// cache par chemin : l'empreinte du contenu donne un chemin neuf à une icône
// changée dans PhpStorm.
import { appHome, exec, home, readTextFile } from "herdr";

const ICONS = "mods/better-sidebar/phpstorm-icons";

export async function readPhpStorm(space) {
  if (space.machine) return null; // projets locaux seulement
  for (const dir of [space.folder, `${home()}/web/${space.name}`]) {
    if (!dir) continue;
    const ls = await exec("ls", [`${dir}/.idea`]);
    if (ls.code !== 0) continue;
    const files = new Set(ls.stdout.split("\n"));
    const icon = ["icon.svg", "icon.png"].find((f) => files.has(f));
    let color = null;
    const xml = files.has("workspace.xml") ? await readTextFile(`${dir}/.idea/workspace.xml`) : null;
    const m = xml?.match(/<component name="ProjectColorInfo">([\s\S]*?)<\/component>/);
    try {
      const c = m && JSON.parse(m[1].replace(/&quot;/g, '"'));
      if (/^[0-9a-f]{6}/i.test(c?.customColor ?? "")) color = `#${c.customColor.slice(0, 6)}`;
    } catch {
      /* ProjectColorInfo illisible : pas de couleur */
    }
    return { icon: icon ? await expose(dir, icon) : null, color };
  }
  return null;
}

async function expose(dir, icon) {
  const source = `${dir}/.idea/${icon}`;
  const sum = await exec("cksum", [source]);
  if (sum.code !== 0) return null;
  const base = dir.replace(/\/+$/, "").split("/").pop();
  const name = `${base}@${sum.stdout.split(" ")[0]}${icon.slice(icon.indexOf("."))}`;
  const folder = `${appHome()}/${ICONS}`;
  if ((await exec("test", ["-f", `${folder}/${name}`])).code !== 0) {
    await exec("mkdir", ["-p", folder]);
    await exec("cp", [source, `${folder}/${name}`]);
    // Les versions précédentes de cette icône.
    await exec("find", [folder, "-name", `${base}@*`, "!", "-name", name, "-delete"]);
  }
  return `${ICONS}/${name}`;
}
