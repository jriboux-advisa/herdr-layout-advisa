# herdr-layout-advisa

Le layout `bureau` pour [herdr-app](https://herdr.dev) (version 0.1.16 ou plus).

Ce qu'il ajoute au layout `main` :
- une barre latérale (better-sidebar) avec les espaces, leurs onglets et leurs agents ;
- des espaces qu'on peut plier ;
- les sous-agents de Claude Code sous leur session ;
- un bouton pause pour les sessions Claude ;
- les logos et couleurs des projets PhpStorm ;
- les noms d'onglets tirés des titres de session Claude ;
- une fenêtre translucide, opaque à 90 %.

## Contenu

| Chemin | Rôle | Origine |
|---|---|---|
| `layouts/bureau.json` | le layout | clone de `main`, modifié |
| `mods/better-sidebar` | la barre latérale | [munza/herdr-mods](https://github.com/munza/herdr-mods) v3.2.0 (Apache-2.0), modifié |
| `mods/pane-perso` | l'en-tête des volets, avec le titre de la session | mod `pane` livré avec herdr-app (Apache-2.0), modifié |
| `mods/tab-titles` | les noms d'onglets | [adhikasp/herdr-app-mods](https://github.com/adhikasp/herdr-app-mods) (MIT), tel quel |
| `themes/everforest-dark-medium.json` | le thème Everforest | |
| `config/tab-titles.json` | la config de tab-titles | |
| `extras/bin` | les scripts de la pause et des sous-agents | |

Dans les mods modifiés, chaque changement est signalé par un commentaire « Ajout perso ».

## Installer

### Avec Claude, dans herdr-app

Dans un terminal herdr-app, demande à Claude d'ajouter ce layout en lui donnant le chemin du dépôt cloné. Il suit alors la procédure « Layouts and mods other people made » de `~/.config/herdr-app/AGENTS.md`.

### À la main

```bash
git clone https://github.com/jriboux-advisa/herdr-layout-advisa.git
cd herdr-layout-advisa
H=~/.config/herdr-app
# Vérifie d'abord qu'aucun de ces noms n'existe déjà chez toi : cp les écraserait.
ls "$H/layouts/bureau.json" "$H/mods/better-sidebar" "$H/mods/pane-perso" "$H/mods/tab-titles" 2>/dev/null
mkdir -p "$H/config" "$H/themes"
cp layouts/bureau.json "$H/layouts/"
cp -r mods/better-sidebar mods/pane-perso mods/tab-titles "$H/mods/"
cp themes/everforest-dark-medium.json "$H/themes/"
cp config/tab-titles.json "$H/config/"
for m in better-sidebar pane-perso tab-titles; do herdr-app check "$H/mods/$m"; done
herdr-app do app.theme --name everforest-dark-medium
herdr-app do layout.switch --name bureau
```

Les couleurs translucides du layout sont calées sur le thème Everforest : garde ce thème, ou adapte les couleurs à la racine de `bureau.json` (`colors`, et `background` de `work-body`).

`ctrl-shift-l` fait défiler les layouts, ce qui permet de revenir au tien.

## Les fonctions et ce qu'elles demandent

| Fonction | Ce qu'il faut en plus |
|---|---|
| Plier et déplier les espaces, dépliage automatique | rien |
| Fenêtre translucide | rien (sous GNOME, pas de flou, seulement de la transparence) |
| Logos et couleurs PhpStorm | le projet dans le dossier de l'espace ou dans `~/web/<nom de l'espace>`, avec `.idea/icon.svg` (ou `.png`) et une couleur de projet |
| Bouton pause des sessions Claude | `claude-pause`, `hc-shell` et `hc-claude-hook`, plus leur configuration (ci-dessous) |
| Sous-agents de Claude Code sous leur session | `hc-claude-hook` et les hooks `SubagentStart` / `SubagentStop` |

Sans les scripts, la barre fonctionne quand même : le bouton pause affiche une erreur, et les sous-agents n'apparaissent pas.

### Installer les scripts

Ils demandent `bash`, `zsh`, `jq` et `flock` (paquet util-linux), avec herdr-core installé en `~/.local/bin/herdr-core`.

```bash
install -m 755 extras/bin/claude-pause extras/bin/hc-shell extras/bin/hc-claude-hook ~/.local/bin/
```

**`hc-shell`** devient le shell des terminaux de herdr-core. Une session Claude perdue (redémarrage, crash, pause) y revient en pause, et Entrée la reprend. Ajoute dans `~/.config/herdr-core/config.toml` (chemin absolu, herdr-core relit ce fichier à chaud) :

```toml
shell = ["/home/<ton-utilisateur>/.local/bin/hc-shell"]
```

**`hc-claude-hook`** est un hook de Claude Code. Il retient la session de chaque terminal (label `claude.session`) et ses sous-agents en cours (label `claude.subagents`). Cette commande l'ajoute aux hooks de `~/.claude/settings.json`, en gardant une copie du fichier :

```bash
f=~/.claude/settings.json; cp "$f" "$f.bak" && jq '
  ({hooks: [{type: "command", command: "$HOME/.local/bin/hc-claude-hook", timeout: 5}]}) as $h
  | .hooks.SessionStart += [$h] | .hooks.SessionEnd += [$h]
  | .hooks.SubagentStart += [$h] | .hooks.SubagentStop += [$h]' "$f.bak" > "$f"
```

**`claude-pause`** est appelé par le bouton pause de la barre latérale. Il arrête la session Claude d'un terminal, qui revient en pause grâce à `hc-shell`. Il refuse une session en train de travailler.

## À savoir

- Ce sont des copies figées : elles ne suivent pas les mises à jour du layout `main`, ni celles du mod better-sidebar d'origine.
- `hc-shell` relance une session avec la commande `claude` d'un zsh interactif. Si ton `.zshrc` définit une fonction `claude`, c'est elle qui sera utilisée.
- tab-titles peut aussi nommer les onglets avec un modèle (via `llm.js`), mais seulement si on le configure : la config fournie se contente des titres de session Claude.
- better-sidebar lance des commandes : `git`, `gh` pour l'état des pull requests, `claude-pause`, et la lecture des fichiers `.idea` des projets.
