# AGENTS.md — suunto-just-time

Instrukce pro AI agenty (Claude Code, Codex, Copilot…) pracující v tomto repozitáři.

## Co to je

**SuuntoPlus sports app „Just time“** pro hodinky Suunto (UI2: display `q` 466×466 px — Race, Race S,
Race 2, Vertical 2, Ocean; `o` 280×280 px — Vertical; `n` 240×240 px — 9 Peak Pro). Během aktivity zobrazuje jen velký čas (HH:MM) jako ciferník
vykreslený z obrázků (sprite pásy číslic, font Sarabun Bold). Hodinové a minutové číslice mají každé
svůj font (`solid` = plné číslice `solid-<display>.png`, `outline` = obrysové `outline-<display>.png`) a svou barvu. Nastavení jde měnit přímo na hodinkách
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
| `solid-{q,o,n}.png`, `outline-{q,o,n}.png` | Sprite pásy číslic 0–9 pro jednotlivé displeje (bílé na průhledném, barvu dává CSS `color`): `q` buňka 80×110 px (pás 800×110), `o` 48×66 px (480×66), `n` 40×56 px (400×56). `solid-*` (plné), `outline-*` (obrys). Reference povoluje max. 2 obrázky na app — při buildu pro jeden displej se použijí dva |
| `ext01.js`, `ext02.js`, `ext04.js`, `ext05.js` | Externí funkce načítané z flash přes `evalFile` (šetří stack/heap) |
| `data.json` | Výchozí hodnoty nastavení (`fontType`, `hourColor`, `minuteColor`) |
| `~/.vscode/extensions/suunto.suuntoplus-editor-1.42.0/developer-doc/reference.html` | Oficiální SuuntoPlus reference dodaná s rozšířením — **primární zdroj pravdy o API** (cesta platí pro verzi 1.42.0, po aktualizaci rozšíření ji ověř) |
| `private/` | Složka v `.gitignore` — necommitovat, nevkládat do veřejných výstupů. Obsahuje i `private/font-strip` (generátor pásů číslic z TTF, `node generate.mjs`) |
| `*.fea`, `*.zip` | Build výstup editoru, v `.gitignore` — necommitovat, neupravovat |

### Obrázky číslic (jak se generují)

Pásy se vyrábějí lokálním skriptem (není v repozitáři, je v `private/`) z fontu Sarabun Bold
(`private/font-strip/fonts/Sarabun-Bold.ttf`, licence OFL). Z adresáře `private/font-strip`:

    node generate.mjs fonts/Sarabun-Bold.ttf --display all --prefix solid --style fill --out ../..
    node generate.mjs fonts/Sarabun-Bold.ttf --display q --prefix outline --style outline --stroke 3 --out ../..
    node generate.mjs fonts/Sarabun-Bold.ttf --display o,n --prefix outline --style outline --stroke 2 --out ../..

Při změně velikosti buňky v `generate.mjs` uprav i rozměry skupiny číslic v šablonách (viz níže).

### Externí funkce (`loadExt('NN')`)

| ID | Funkce | Používá se |
|---|---|---|
| 01 | další / předchozí `fontType` podle id (`step` 1 / -1) | ano |
| 02 | název `fontType` → id (0–3) | ano |
| 04 | další / předchozí barva (`step` 1 / -1) | ano |
| 05 | název barvy → RGB int | ano |

Každý `extNN.js` obsahuje **jeden anonymní výraz** (funkci nebo literál) bez středníku a bez
deklarace jména — `evalFile` vrací jeho hodnotu. Seznam ID je okomentovaný v `loadExt` v `main.js`;
při přidání/změně ext souboru ho aktualizuj.

## Jak aplikace funguje

- **Stav šablony** drží proměnná `t` v `main.js` (`'t'` | `'u'` | `'v'`). Přepnutí: nastav `t` a zavolej
  `unload("_cm")`, hodinky pak znovu zavolají `getUserInterface()`.
- **Čas**: šablony si čas berou samy z `/Dev/Time/LocalTime/Min` (`$.get` + `$.subscribe`) a posouvají
  sprite pásy číslic (`left: -100*číslice %`). `main.js` čas nezpracovává.
- **Číslice**: každá pozice (hodina 1/2, minuta 1/2) má dva `<img>` (`hs1`/`ho1`, `hs2`/`ho2`, `ms1`/`mo1`,
  `ms2`/`mo2` — `s` = solid, `o` = outline), viditelný je jen ten ve zvoleném fontu. Čtyři buňky jsou
  vycentrované v procentech (`calc(50% - 50%e)`), ne v pixelech. Rozměry se liší podle displeje, proto
  jsou v šabloně tři bloky `<:if test="('{{DISPLAY_ID}}' == 'q')">` / `<:elseif … 'o'>` / `<:else>` (n)
  s jinou šířkou/výškou skupiny (`4*šířka buňky / šířka displeje`, např. q = 68,670 %) a jinými obrázky.
  Šířka buňky v pixelech musí přesně sedět na buňku v pásu, jinak se posun `left: -100*číslice %` rozjede. Vpravo od minut je v dolní polovině
  řádku číslic malý text AM/PM (`f-t-s`, jen při 12hodinovém formátu hodinek).
- **Bez bliknutí**: číslice jsou zprvu `visibility:hidden` a odkryjí se až po příchodu času, obou fontů
  a obou barev (`pending`/`setReady` v šabloně); po 1 s se odkryjí i tak (záloha).
- **Kódy eventů** (`$.put('/Zapp/{zapp_index}/Event', id, null, 'int32')`):
  - `1` down click, `3` next (middle) click, `5` up click
  - `2` / `4` / `6` long press down / next / up
- **Dlouhý stisk (`t`: dolní tlačítko, `v`: všechna tři)**: `onLongPressStart` (po 0,6 s) spustí kroužek
  (`<object type="canvas">`, `ringStart(eventId)`), který se po směru hodinových ručiček plní od 12 hodin
  18 kroky po 100 ms (`RING_TICKS`), takže je plný po 2,4 s od stisku (`longPressDuration="2.4"`). Událost se pak odešle ze skriptu (`ringAction`);
  `onLongPressFull` se nepoužívá, protože se nevolá spolehlivě. `onLongPressCancel` a `onLongPress` volají
  jen `ringStop()`.
- **Nastavení (`v`)**: tři nastavení, mezi kterými přepíná middle (`setting_mode` 0 → 1 → 2 → 0):
  - `0` `fontType` — `hh-solid mm-solid`, `hh-outline mm-solid`, `hh-solid mm-outline`, `hh-outline mm-outline` (bliká vše),
  - `1` `hourColor` (blikají hodinové číslice),
  - `2` `minuteColor` (blikají minutové číslice).

  Horní tlačítko (`5`) posouvá hodnotu dopředu, dolní (`1`) dozadu, libovolný long press se vrací do `t`.
  Blikání: jediný interval 500 ms přepíná `blinkOn` a `paint()` vykreslí blikající skupinu černě. Po
  zobrazení číslic začíná zhasnutím (prvních 500 ms nic), při dlouhém stisku se blikání zastaví
  (`stopBlink`) a při zrušení stisku znovu spustí (`startBlink`).
  Hodnoty se ukládají do `localStorage` (klíče `fontType`, `hourColor`, `minuteColor` — shodné s `path`
  v `manifest.json` → `settings` a s klíči v `data.json`). Výchozí hodnoty jsou ve dvou místech, které musí
  zůstat stejné: `data.json` a objekt `DEFAULTS` na začátku `main.js` (použije se, když v `localStorage`
  ještě nic není).
- **Výstupy do šablon**: `output.hourFont`, `output.minuteFont` (0 = solid, 1 = outline, odvozeno z `fontType`
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
   Šablony mají `"displays": ["q", "o", "n"]` (UI1 displeje `s`, `m`, `l` nejsou podporované a nemají obrázky);
   každý obrázek z `src` v šablonách musí být v `image` a existovat pro všechny tři displeje.
7. **Ladění**: používej `systemEvent('popis', hodnota)` — výstup je vidět v simulátoru/logu editoru.
   Před commitem zbytečné ladicí výpisy odstraň; výjimka jsou diagnostické logy neplatných dat
   (`unknown color` v `ext04.js` / `ext05.js`).
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
