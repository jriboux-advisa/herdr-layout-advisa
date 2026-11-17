# Bureau

Un layout de travail pour des sessions Claude Code réparties par projet. À gauche, une barre latérale liste les espaces : chacun a le logo de son projet PhpStorm et sa branche Git, et sous lui ses onglets, ses agents et les sous-agents de chaque session Claude. À droite, les onglets en pastilles, les volets du terminal encadrés, une barre d'état. La fenêtre est translucide (90 %). Pas d'aperçu : une capture montrerait des projets réels.

## Ce qu'on voit

De gauche à droite :

1. **Barre latérale** (colonne de 268 px, non redimensionnable, sans fond propre) :
   - en haut, 46 px : le mod livré `workspace-chrome` (marque, recherche, repli), qui sert aussi de poignée pour déplacer la fenêtre ;
   - au milieu : better-sidebar, vue `lists`, avec deux onglets en haut, Spaces et Agents (et le nombre d'agents) ;
   - en bas, 37 px : better-sidebar, vue `footer`.
2. **Zone de travail** (colonne) :
   - 42 px : les onglets en pastilles (mod livré `tabs`, poignée de fenêtre), et à droite, sur 36 px, le bouton du panneau latéral (better-sidebar, vue `panel-toggle`) ;
   - le corps (`work-body`, marge de 8 px, écart de 8 px, fond `#2d353be6`) : les volets de l'onglet actif, cadrés (rayon 10, bordure 1 px `border`, focus `accent`, écart 8), avec un en-tête de 30 px (mod `pane-perso`) ; à droite, un panneau masqué de 368 px empilant les mods livrés `files` et `changes` ;
   - 28 px : la barre d'état (mod livré `workspace-status`) ;
   - un bloc de 0 px pour le mod `tab-titles`, invisible.

Racine : thème Everforest (`everforest-dark-medium`), `titlebar: none`, `terminal_padding: [14, 12]`, séparateur de 1 px `border`.

Une ligne d'espace : flèche de pliage, logo (icône PhpStorm, sinon pastille de couleur avec l'initiale), nom (coupé au bout de la ligne seulement), branche en gris calée à droite (absente pour `main`, `master` ou si elle répète le nom), état de la pull request. Sous l'espace, en retrait de 32 px sans traits d'arbre : ses onglets (icône du programme, titre, nom du programme) et ses agents (icône, titre de l'onglet, durée, état). Sous un agent Claude, en retrait : ses sous-agents, en texte seul (type de l'agent, par exemple `advanced-dev-opus`) avec leur état.

En-tête de volet (`pane-perso`) : « Claude Code ~/dossier · titre de la session », le titre seulement pour un agent.

## Comment il se comporte

- États d'agent : `working` = spinner ; `blocked` = « Needs you » (ou « ! » en compact) ; `done` = point plein ; `idle` = anneau. Un sous-agent Claude : spinner tant qu'il tourne, point une fois fini, et il disparaît 15 min après.
- Clic sur une ligne d'espace : sélectionne l'espace ; glisser : réordonne les espaces d'une même machine. Clic droit : menu de l'espace.
- Flèche à gauche du logo, toujours visible : `⌄` déplié, `›` plié. Un espace plié cache ses onglets et ses agents ; l'état est retenu (`localStorage` `spaces.folded`). Quand un agent d'un espace plié passe à `done` ou `blocked`, l'espace se déplie, au changement d'état seulement (on peut le replier ensuite). Un espace plié dont l'agent sélectionné est caché s'allume à sa place.
- Survol d'un espace : bouton pause à droite, qui met en pause toutes ses sessions Claude locales qui ne travaillent pas. Survol d'un agent : boutons pause et épingle, collés. Boutons : marge intérieure de 5 px, coins de 5 px.
- Pause : `claude-pause` envoie SIGHUP à claude puis tue la racine du terminal ; herdr-core le récupère avec `hc-shell`, qui affiche « Session Claude en pause » et reprend la session sur Entrée (Ctrl+C donne un shell). Au redémarrage de la machine, toutes les sessions reviennent ainsi en pause.
- Noms d'onglets : `tab-titles` donne à un onglet non nommé le titre de sa session Claude (40 caractères au plus).
- Transparence : `window_blur: true` rend la fenêtre transparente (le flou dépend du compositeur ; GNOME n'en fait pas).

## Construit avec

- Layout `layouts/bureau.json` : clone de `main`. Arbre : `root` (row) → `sidebar` (column : `brand`, `sidebar-lists` → `spaces`, `sidebar-footer`) et `work` (column : `tabs-row` → `tabs` + `panel-toggle`, `work-body` → `main` (tab active) + `panel` (stack `files`/`changes`), `status`, `tab-titles`).
- Mods livrés : `workspace-chrome`, `tabs`, `workspace-status`, `files`, `changes`.
- `better-sidebar` (munza/herdr-mods 3.2.0, modifié), props `{view: "lists" | "footer" | "panel-toggle"}`. Fonctions herdr : `agents`, `spaces`, `terminals`, `panes`, `machines`, `run`, `exec`, `hc`, `shared`/`setShared`, `watchFolder`, `notify`, `localStorage`. Programmes : `git`, `gh`, `ls`/`cksum`/`cp`/`find` (icônes PhpStorm copiées dans `mods/better-sidebar/phpstorm-icons`, nommées par empreinte), `~/.local/bin/claude-pause`.
- `pane-perso` : copie du mod livré `pane`, titre de session ajouté (`p.title`).
- `tab-titles` : adhikasp/herdr-app-mods, config `{"follow_new_sessions": true}`.
- Couleurs (racine, `colors`) : `background` `#2d353b00`, `canvas` `#272e3300`, `chrome` `#232a2ee6` ; colonne `sidebar` `#00000000` ; `work-body` `#2d353be6` ; `terminal_opacity: 0`.
- Scripts (`extras/bin`) : `hc-claude-hook` (hooks Claude Code SessionStart, SessionEnd, SubagentStart, SubagentStop ; labels herdr-core `claude.session` et `claude.subagents` = `[{id, type, state, at}]`, sous `flock`) ; `hc-shell` (shell de herdr-core) ; `claude-pause`.

## Attention

- Un fond posé sur le nœud d'un mod qui peint déjà `.bg(t.chrome)` (better-sidebar, workspace-chrome, tabs, workspace-status) s'y empile : 90 % sur 90 % donne 99 %. D'où la colonne `sidebar` transparente et le fond sur `work-body` plutôt que sur `work`.
- Le terminal peint son propre fond opaque (fond du thème) : seul `terminal_opacity: 0` le retire, les cases colorées restent opaques.
- `window_blur` est appliqué au rendu ; la couleur `background` du thème, si elle reste opaque, bouche toute la fenêtre.
- Dans un mod, un élément ne s'insère qu'une fois : créer une icône par ligne, jamais une icône partagée entre lignes.
- Les sous-agents de herdr (`parent` dans `terminals()`) sont des terminaux lancés par `hc run` ; ceux de l'outil Agent de Claude Code n'en sont pas, d'où le label `claude.subagents` écrit par le hook. `hc ls --json` ne donne pas les labels ; `terminals()` et `hc get` les donnent.
- `hc-shell` doit lancer claude depuis un zsh interactif (`zsh -ic`) pour que claude soit au premier plan du terminal : `hc-claude-hook` n'agit que pour le claude au premier plan.
- Les logos PhpStorm supposent les projets dans le dossier de l'espace ou dans `~/web/<nom de l'espace>`.
