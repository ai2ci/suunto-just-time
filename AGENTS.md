# AGENTS.md — suunto-just-time

Instrukce pro AI agenty (Claude Code, Codex, Copilot…) pracující v tomto repozitáři.

## Co to je

**SuuntoPlus sports app „Just time“** pro hodinky Suunto (UI2, primárně display `q` 466×466 px —
Race, Race S, Race 2, Vertical 2, Ocean). Během aktivity zobrazuje jen velký čas (HH:MM) jako ciferník,
s volitelnou barvou a stylem ciferníku. Nastavení jde měnit přímo na hodinkách tlačítky
nebo přes `settings` v aplikaci Suunto.

Nejde o webovou aplikaci. Kód běží v omezeném JS enginu hodinek (ESW), ne v prohlížeči ani v Node.js.
Žádné `npm`, žádný bundler, žádné testy — build, simulace a nahrání do hodinek dělá
VS Code rozšíření **SuuntoPlus Editor** (`~/.vscode/extensions/suunto.suuntoplus-editor-1.42.0`).

## Struktura

| Soubor | Účel |
|---|---|
| `manifest.json` | Metadata, `in` (zdroje), `out` (výstupy), `template`, `settings` |
| `main.js` | Logika aplikace — callbacky volané hodinkami (`onLoad`, `onEvent`, `getUserInterface`, `onExercisePause`, …) |
| `t.html` | Hlavní šablona během aktivity; dlouhý stisk **down** → nastavení |
| `u.html` | Stejný ciferník bez `<userInput>` — používá se během pauzy (tlačítka patří systému) |
| `v.html` | Režim nastavení (blikání vybrané části, změna barvy / ciferníku) |
| `w.html` | Starší varianta (čas počítaný přímo v šabloně), v manifestu, ale `getUserInterface` ji nevrací |
| `v-touching.html` | Experiment s dotykovým ovládáním — **není v manifestu** |
| `ext01.js`–`ext08.js` | Externí funkce načítané z flash přes `evalFile` (šetří stack/heap) |
| `data.json` | Výchozí hodnoty nastavení (`watchFace`, `color`) |
| `~/.vscode/extensions/suunto.suuntoplus-editor-1.42.0/developer-doc/reference.html` | Oficiální SuuntoPlus reference dodaná s rozšířením — **primární zdroj pravdy o API** (cesta platí pro verzi 1.42.0, po aktualizaci rozšíření ji ověř) |
| `private/` | Složka v `.gitignore` — necommitovat, nevkládat do veřejných výstupů |
| `*.fea`, `*.zip` | Build výstup editoru, v `.gitignore` — necommitovat, neupravovat |

### Externí funkce (`loadExt('NN')`)

| ID | Funkce | Používá se |
|---|---|---|
| 01 | další ciferník podle id (zatím jen `basic` ↔ `line`) | ano |
| 02 | název ciferníku → id (0–3) | ano |
| 03 | název barvy → index | ne |
| 04 | další barva v cyklu | ano |
| 05 | název barvy → RGB int | ano |
| 06 | tabulka barev (pole) | ne |
| 07 | id šablony → písmeno šablony | ne (zakomentováno) |
| 08 | rozpad minut dne do `output.hour_10/…` | ne (logika je zatím inline v `main.js`) |

Každý `extNN.js` obsahuje **jeden anonymní výraz** (funkci nebo literál) bez středníku a bez
deklarace jména — `evalFile` vrací jeho hodnotu. Seznam ID je okomentovaný v `loadExt` v `main.js`;
při přidání/změně ext souboru ho aktualizuj.

## Jak aplikace funguje

- **Stav šablony** drží proměnná `t` v `main.js` (`'t'` | `'u'` | `'v'`). Přepnutí: nastav `t` a zavolej
  `unload("_cm")`, hodinky pak znovu zavolají `getUserInterface()`.
- **Čas**: šablony odebírají `/Dev/Time/LocalTime/Min` a posílají do `main.js` event `1000 + minuta_dne`.
  `onEvent` z toho vypočte číslice `hour_10`, `hour_01`, `minute_10`, `minute_01` do `output`.
- **Kódy eventů** (`$.put('/Zapp/{zapp_index}/Event', id, null, 'int32')`):
  - `1` down click, `3` next (middle) click, `5` up click
  - `2` / `4` / `6` long press down / next / up
  - `≥ 1000` aktualizace času
- **Nastavení (`v`)**: middle přepíná `setting_mode` (`hour` = barva, `minute` = ciferník),
  up/down mění hodnotu, libovolný long press se vrací do `t`. Hodnoty se ukládají do `localStorage`
  (klíče `color`, `watchFace` — shodné s `path` v `manifest.json` → `settings`).
- **Výstupy do šablon**: `output.color` (RGB int → v šabloně převedeno na `#rrggbb`),
  `output.watchFace` (id 0–3). Šablony je čtou přes `$.subscribe('/Zapp/{zapp_index}/Output/<name>')`
  nebo `<eval input=…>`.
- **Pauza**: `onExercisePause` přepne na `u` (bez `userInput`), `onExerciseContinue` zpět na `t`.

## Pravidla pro práci s kódem

1. **Před změnou API se podívej do referenční příručky v rozšíření** (`developer-doc/reference.html`) (sekce *The main.js file*, *Native functions*,
   *HTML templates*, *Sports app settings*, *Optimizing applications*). Necituj API z hlavy —
   engine je omezený a mnoho věcí z běžného JS/HTML/CSS neexistuje.
2. **JS v `main.js` a `ext*.js` piš v ES5**: `var`, `function`, žádné `let`/`const`, arrow funkce,
   template literály, třídy, `Array.prototype` novinky. (Arrow `script x => …` je povolen jen
   v `outputFormat` atributu šablon.)
3. **Šetři pamětí** — hodinky padají na stack/heap. Větší nebo zřídka volanou logiku dávej do nového
   `extNN.js` a volej přes `loadExt('NN')`. Krátké názvy souborů (doporučení reference).
4. **Šablony** jsou SuuntoPlus `<uiView>`, ne HTML stránky: inline styly, třídy `sp-*`,
   jednotka `%e`, `setStyle(selector, prop, value)`, `$.subscribe`, `$.put`. Placeholdery
   `{zapp_index}` a `{file_path}` nahrazuje runtime — neměň je.
5. **Konzistence napříč šablonami**: `t.html`, `u.html` a `v.html` sdílejí layout ciferníku.
   Změnu vzhledu proveď ve všech třech (liší se jen `userInput` a logikou blikání ve `v`).
6. **Manifest**: každá nová `out` hodnota, šablona nebo zdroj musí být v `manifest.json`.
   Neexistující `source` v `in` způsobí, že se aplikace na hodinkách vůbec nenačte.
   Hodnoty v `settings.values` musí odpovídat tomu, co znají `ext01/02/04/05`.
7. **Ladění**: používej `systemEvent('popis', hodnota)` — výstup je vidět v simulátoru/logu editoru.
   Před commitem zbytečné ladicí výpisy zvaž/odstraň.
8. **Komentáře v kódu anglicky**, stručně, ve stylu existujících (`// 05 - get RGB …`).
   Formátování: 2 mezery, středníky.
9. **Neupravuj** `LICENSE`, `*.fea`, ani soubory v `private/` (jsou určené jen lokálně).

## Ověření změn

Automatické testy neexistují. Změny ověř:
- kontrolou validity `manifest.json` (`python3 -m json.tool manifest.json`),
- kontrolou, že každý volaný `loadExt('NN')` má odpovídající `extNN.js`,
- a požádej uživatele o spuštění v simulátoru **SuuntoPlus Editor** (VS Code) nebo na hodinkách —
  agent to sám udělat nemůže. Uveď, co konkrétně má zkontrolovat (šablona, tlačítka, pauza).

## Git

- Hlavní větev `master`, práce probíhá ve feature větvích.
- Commity ve stylu Conventional Commits (`feat: …`, `fix: …`).
- Commituj jen na výslovnou žádost uživatele.
