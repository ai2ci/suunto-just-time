# AGENTS.md — suunto-just-time

Instrukce pro AI agenty (Claude Code, Codex, Copilot…) pracující v tomto repozitáři.

## Co to je

**SuuntoPlus sports app „Just time“** pro hodinky Suunto (UI2, primárně display `q` 466×466 px —
Race, Race S, Race 2, Vertical 2, Ocean). Během aktivity zobrazuje jen velký čas (HH:MM) jako ciferník
vykreslený z obrázků (sprite pásy číslic). Hodinové a minutové číslice mají každé svůj font
(`basic` = `font-q.png`, `line` = `aod-q.png`) a svou barvu. Nastavení jde měnit přímo na hodinkách
tlačítky nebo přes `settings` v aplikaci Suunto.

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
| `v.html` | Režim nastavení (blikání vybrané části, změna fontu / barev) |
| `w.html` | Starší varianta (čas počítaný přímo v šabloně), v manifestu, ale `getUserInterface` ji nevrací |
| `font-q.png`, `aod-q.png` | Sprite pásy číslic 0–9 (800×110 px, bílé; barvu dává CSS `color`). `font-q.png` = font `basic`, `aod-q.png` = font `line`. Reference povoluje max. 2 obrázky na app |
| `ext01.js`–`ext07.js` | Externí funkce načítané z flash přes `evalFile` (šetří stack/heap) |
| `data.json` | Výchozí hodnoty nastavení (`fontType`, `hourColor`, `minuteColor`) |
| `~/.vscode/extensions/suunto.suuntoplus-editor-1.42.0/developer-doc/reference.html` | Oficiální SuuntoPlus reference dodaná s rozšířením — **primární zdroj pravdy o API** (cesta platí pro verzi 1.42.0, po aktualizaci rozšíření ji ověř) |
| `private/` | Složka v `.gitignore` — necommitovat, nevkládat do veřejných výstupů |
| `*.fea`, `*.zip` | Build výstup editoru, v `.gitignore` — necommitovat, neupravovat |

### Externí funkce (`loadExt('NN')`)

| ID | Funkce | Používá se |
|---|---|---|
| 01 | další / předchozí `fontType` podle id (`step` 1 / -1) | ano |
| 02 | název `fontType` → id (0–3) | ano |
| 03 | název barvy → index | ne |
| 04 | další / předchozí barva (`step` 1 / -1) | ano |
| 05 | název barvy → RGB int | ano |
| 06 | tabulka barev (pole) | ne |
| 07 | id šablony → písmeno šablony | ne (zakomentováno) |

Každý `extNN.js` obsahuje **jeden anonymní výraz** (funkci nebo literál) bez středníku a bez
deklarace jména — `evalFile` vrací jeho hodnotu. Seznam ID je okomentovaný v `loadExt` v `main.js`;
při přidání/změně ext souboru ho aktualizuj.

## Jak aplikace funguje

- **Stav šablony** drží proměnná `t` v `main.js` (`'t'` | `'u'` | `'v'`). Přepnutí: nastav `t` a zavolej
  `unload("_cm")`, hodinky pak znovu zavolají `getUserInterface()`.
- **Čas**: šablony si čas berou samy z `/Dev/Time/LocalTime/Min` (`$.get` + `$.subscribe`) a posouvají
  sprite pásy číslic (`left: -100*číslice %`). `main.js` čas nezpracovává.
- **Číslice**: každá pozice (hodina 1/2, minuta 1/2) má dva `<img>` (`hb1`/`hl1`, `hb2`/`hl2`, `mb1`/`ml1`,
  `mb2`/`ml2` — `b` = basic, `l` = line), viditelný je jen ten ve zvoleném fontu. Čtyři buňky 80×110 px
  jsou vycentrované v procentech (`calc(50% - 50%e)`), ne v pixelech.
- **Bez bliknutí**: číslice jsou zprvu `visibility:hidden` a odkryjí se až po příchodu času, obou fontů
  a obou barev (`pending`/`setReady` v šabloně); po 1 s se odkryjí i tak (záloha).
- **Kódy eventů** (`$.put('/Zapp/{zapp_index}/Event', id, null, 'int32')`):
  - `1` down click, `3` next (middle) click, `5` up click
  - `2` / `4` / `6` long press down / next / up
- **Nastavení (`v`)**: tři nastavení, mezi kterými přepíná middle (`setting_mode` 0 → 1 → 2 → 0):
  - `0` `fontType` — `hh-basic mm-basic`, `hh-line mm-basic`, `hh-basic mm-line`, `hh-line mm-line` (bliká vše),
  - `1` `hourColor` (blikají hodinové číslice),
  - `2` `minuteColor` (blikají minutové číslice).

  Horní tlačítko (`5`) posouvá hodnotu dopředu, dolní (`1`) dozadu, libovolný long press se vrací do `t`.
  Hodnoty se ukládají do `localStorage` (klíče `fontType`, `hourColor`, `minuteColor` — shodné s `path`
  v `manifest.json` → `settings` a s klíči v `data.json`).
- **Výstupy do šablon**: `output.hourFont`, `output.minuteFont` (0 = basic, 1 = line, odvozeno z `fontType`
  v `setFontOutputs`), `output.hourColor`, `output.minuteColor` (RGB int → v šabloně `toHex` na `#rrggbb`),
  `output.settingMode` (0–2, podle něj `v.html` bliká). Šablony je čtou přes
  `$.subscribe('/Zapp/{zapp_index}/Output/<name>')`.
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
   V atributech šablon (`onLoad`, `onActivate`…) nepoužívej `<` ani `&` (`&&`) — jsou to XML atributy.
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
