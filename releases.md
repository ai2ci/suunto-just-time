# Pravidla vydávání (releases)

Závazná pravidla pro agenta i člověka. Platí jen pro tento projekt (suunto-just-time).
Nový projekt suunto-apps má vlastní pravidla.

## Větve

- `master` je hlavní vývojová větev (featury, opravy). Do `master` se NEdostávají releasy
  (žádné release commity). Release vzniká jen ve větvi `releases`.
- Větev `releases` je „orphan“: začíná prázdná, bez historie. Každý commit v ní je jeden release.
  Commity se nepřepisují; `releases` se nikdy neforce-pushuje ani nerebasuje.

## Commity, verze a tagy

- Zpráva commitu je pouze číslo verze (např. `1.0`). Shoduje se s `version` v `manifest.json`
  v témže commitu a s názvem tagu.
- Tělo commitu obsahuje hash zdrojového commitu, ze kterého release vznikl, případně větev,
  např. `Source: <hash> (master)`.
- `version` v manifestu má podle schématu max 4 znaky, proto se čísluje `MAJOR.MINOR`
  (`1.0`, `1.1`, `2.0`), nikdy `1.0.0`.
- Číslo verze se nesmí opakovat ani přepisovat; oprava = nová verze.
- Každý commit má svůj tag; název tagu = verze (např. `1.0`), doporučen anotovaný tag.
  Tag se nepřepisuje.

## První release

- První release je `1.0`. Vznikne v prázdné orphan větvi `releases` squashem všech dosavadních
  změn (jeden commit).
- Dosavadní verze v manifestu (např. `2.0`) a dřívější tagy se ignorují (tagy neexistují).
  Před prvním releasem se `version` v manifestu nastaví na `1.0`.

## Obsah releasu

- Jen zdrojový kód: `manifest.json`, `main.js`, `ext*.js`, šablony, `data.json`, obrázky,
  `LICENSE`, `README.md`, `AGENTS.md` atd.
- NIKDY buildy (`*.fea`, `*.zip`, výstupy builderu, `dist`).
- Složka `test/` je v `.gitignore` a do releasu nepatří.

## Postup vydání

1. Zdroj na `master` je hotový a otestovaný na hodinkách (studený start dle `AGENTS.md`).
2. Zvýšit `version` v manifestu a zkontrolovat limit 4 znaků.
3. `git switch releases` (poprvé: `git switch --orphan releases`).
4. Nahrát stav zdroje z `master`: `git restore --source=<commit na master> --staged --worktree .`
   (nebo checkout souborů; u prvního releasu totéž po `git switch --orphan`).
5. Ověřit, že nejsou buildy ani `test/`.
6. Commit se zprávou = verze, tělo = zdrojový hash.
7. `git tag -a <verze>` a push větve i tagu.
8. Zpět na `master`.

## Kontroly

Žádné skripty; hlídá agent podle tohoto popisu:

- verze v manifestu = zpráva commitu = tag,
- délka verze ≤ 4,
- verze dosud neexistuje,
- tělo commitu obsahuje zdrojový hash,
- v commitu nejsou buildy.

## Chybný release

Nepřepisovat. Vydat novou verzi.
