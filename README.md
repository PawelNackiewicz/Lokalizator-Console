# lokalizator-console

Monorepo z konsolą do przeglądania szkół: ekran logowania oraz moduł prezentujący
listę i mapę placówek.

- **`apps/api`** — NestJS + Drizzle ORM + PostgreSQL, auth na JWT w ciasteczku `httpOnly`
- **`apps/web`** — React + Vite + TanStack Router/Query + Tailwind v4 + shadcn/ui + Leaflet
- **`packages/*`** — współdzielone kontrakty API i konfiguracja (TS, ESLint)

---

## Uruchomienie od zera

Wymagania: **Node ≥ 22.13** (plik `.nvmrc` przypina 22.13.1), **pnpm ≥ 10**, **Docker**.

```bash
git clone <repo> lokalizator-console
cd lokalizator-console

# 1. Wersja Node zgodna z .nvmrc
fnm use          # albo: nvm use

# 2. Zależności
pnpm install

# 3. Konfiguracja — JEDEN plik .env dla całego monorepo
cp .env.example .env

# 4. Baza danych (jedyna rzecz w Dockerze)
pnpm docker:up   # docker compose up -d

# 5. Schemat + dane startowe
pnpm db:migrate  # tworzy tabele users i schools
pnpm db:seed     # użytkownik admin + 15 szkół

# 6. Backend i frontend równolegle
pnpm dev
```

| Adres                        | Co to                |
| ---------------------------- | -------------------- |
| http://localhost:5173        | frontend             |
| http://localhost:3000        | API                  |
| http://localhost:3000/health | probe „czy API żyje” |

Logowanie: **`admin` / `admin`** (wartości z `SEED_ADMIN_USER` / `SEED_ADMIN_PASSWORD`).

### Przydatne komendy

```bash
pnpm dev            # turbo run dev — api + web + watch na shared-types
pnpm build          # build produkcyjny wszystkich pakietów
pnpm lint           # ESLint w całym monorepo
pnpm typecheck      # tsc --noEmit w całym monorepo
pnpm --filter @lokalizator/api test   # testy jednostkowe (vitest)

pnpm db:generate    # wygeneruj migrację po zmianie src/db/schema.ts
pnpm db:migrate     # zastosuj migracje
pnpm db:seed        # zasil danymi (pomija szkoły, jeśli tabela niepusta)
pnpm db:seed --reset  # wyczyść szkoły i wstaw od nowa
pnpm db:studio      # Drizzle Studio

pnpm docker:up / docker:down    # start / stop Postgresa
pnpm docker:reset               # stop + usunięcie wolumenu (kasuje dane!)
```

---

## Architektura i podjęte decyzje

### Monorepo

Turborepo + pnpm workspaces. Zadania `dev`, `build`, `lint`, `typecheck` deklarują
`dependsOn: ["^build"]`, więc `@lokalizator/shared-types` zawsze jest zbudowany,
zanim aplikacje go użyją.

```
apps/
  api/       NestJS + Drizzle
  web/       React + Vite
packages/
  shared-types/   kontrakty API (schematy zod) — jedno źródło prawdy dla web i api
  tsconfig/       bazowe configi TypeScript (base / library / nest / vite)
  eslint-config/  flat config ESLint (base / react / nest)
```

**Dlaczego `shared-types` to zod, a nie same typy?** Schemat `loginInputSchema`
waliduje request po stronie API (przez `ZodValidationPipe`) i formularz po stronie
frontendu. Komunikaty walidacji i ograniczenia nie mogą się rozjechać, bo są
w jednym pliku. Pakiet buduje się przez `tsup` do ESM + CJS, bo NestJS działa
w CommonJS, a Vite w ESM.

### Zmienne środowiskowe

**Jeden plik `.env` w rootcie repo** obsługuje cały monorepo:

- `docker-compose.yml` czyta go automatycznie (leży obok),
- `apps/api` ładuje go przez `ConfigModule` (`envFilePath` wskazuje root),
- `apps/web` czyta go przez Vite (`envDir` wskazuje root), ale do bundla trafiają
  wyłącznie zmienne z prefiksem `VITE_`.

Dzięki temu `POSTGRES_*` z docker-compose i `DATABASE_URL` z aplikacji nie mogą się
rozjechać. Konfiguracja backendu jest walidowana schematem zod przy starcie
(`apps/api/src/config/env.schema.ts`) — błąd w `.env` ujawnia się natychmiast,
a nie przy pierwszym requeście.

Dane admina (`SEED_ADMIN_USER`, `SEED_ADMIN_PASSWORD`) celowo **nie są** częścią
konfiguracji aplikacji — czyta je wyłącznie skrypt seed, więc hasło nigdy nie
trafia do runtime'u API.

### Autoryzacja

`POST /auth/login` → weryfikacja w bazie (bcrypt) → JWT podpisany `JWT_SECRET`
→ ciasteczko `httpOnly`.

- **Token wyłącznie w ciasteczku, nigdy w nagłówku `Authorization`.** Frontend nie
  ma do niego dostępu z JS, więc XSS go nie wykradnie. `JwtCookieGuard` czyta go
  tylko z ciasteczka.
- **`sameSite=lax`**, nie `strict`. Front (`:5173`) i API (`:3000`) to z punktu
  widzenia przeglądarki ten sam site — SameSite patrzy na domenę rejestrowalną,
  nie na port — więc `lax` wystarcza i blokuje CSRF przy cross-site POST.
  `strict` zerwałby powrót do aplikacji z zewnętrznego linku, co nic tu nie daje.
- **`secure`** włączone tylko w produkcji (`NODE_ENV=production`); localhost chodzi po http.
- **Guard jest globalny** (`APP_GUARD`). Domyślnie chronione jest wszystko;
  publiczne endpointy trzeba oznaczyć jawnie dekoratorem `@Public()`.
  Nowy kontroler jest bezpieczny „z automatu”.
- **`POST /auth/logout` jest publiczny** celowo — wylogowanie ma czyścić ciasteczko
  także wtedy, gdy token już wygasł. Operacja jest idempotentna.
- **Ochrona przed user enumeration**: gdy użytkownik nie istnieje, `AuthService`
  i tak wykonuje `bcrypt.compare` względem stałego hasha, więc czas odpowiedzi
  nie zdradza, które loginy są zajęte. Błąd jest identyczny dla złego loginu i złego hasła.

Frontend **nie przechowuje tokena** — stan zalogowania to wynik zapytania
`GET /auth/me` w TanStack Query. Wszystkie żądania idą z `credentials: 'include'`,
a API ma `cors({ credentials: true, origin: WEB_ORIGIN })` (dokładny origin,
bo przy credentials przeglądarka odrzuca wildcard).

### Routing (TanStack Router, tryb plikowy)

Trasy są generowane z plików w `apps/web/src/routes/` przez `@tanstack/router-plugin`
(plugin Vite). Wygenerowany `routeTree.gen.ts` jest **commitowany** — dzięki temu
`tsc` i ESLint działają bez wcześniejszego uruchomienia Vite.

```
src/routes/
├── __root.tsx           layout główny + typ kontekstu (queryClient) + 404
├── login.tsx            /login — publiczny
├── _authed.tsx          trasa bezścieżkowa: GUARD + nagłówek z nawigacją i wylogowaniem
├── _authed.index.tsx              / → redirect na /schools
├── _authed.schools.tsx            /schools — panel z zakładkami lista/mapa
├── _authed.schools_.import.tsx    /schools/import — wybór: ręcznie (TODO) / CSV
└── _authed.schools_.import_.csv.tsx  /schools/import/csv — import z pliku CSV
```

Podział na publiczne/chronione realizuje **trasa bezścieżkowa `_authed`**: jej
`beforeLoad` pobiera `/auth/me` przez `queryClient.ensureQueryData`. Przy 401
rzuca `redirect({ to: '/login', search: { redirect: location.href } })`, więc po
zalogowaniu wracamy tam, gdzie użytkownik chciał wejść. Każdy nowy ekran wymagający
sesji wystarczy dodać jako dziecko `_authed` — nie trzeba pamiętać o guardzie.

Istotny szczegół: rozróżniamy 401 od awarii sieci. `fetchCurrentUser` zwraca `null`
tylko przy 401; każdy inny błąd leci dalej, żeby nie udawać wylogowania, gdy
w rzeczywistości padło API.

### Mapa

Leaflet + kafelki OpenStreetMap (bez klucza API, z wymaganą licencją ODbL atrybucją).
Domyślne ikony markerów Leafletu są rozwiązywane względem CSS-a, co nie działa po
zbundlowaniu — podajemy je jawnie jako assety Vite (`schools-map.tsx`).

Layout: lista po lewej, mapa po prawej. Zaznaczenie działa w obie strony — klik
w wiersz listy przelatuje kamerą do szkoły i otwiera popup, klik w pinezkę
podświetla wiersz.

### Dane

`schools.rating` to `numeric(2,1)` — typ wymusza dokładnie jedno miejsce po
przecinku i jest chroniony `CHECK` (1.0–5.0); szerokość i długość geograficzna mają
własne `CHECK`. Sterownik zwraca `numeric` jako string (Postgres nie gwarantuje,
że zmieści się w `double`), więc `school.mapper.ts` konwertuje go na `number`,
a `timestamptz` na ISO-8601 — JSON nie ma typu daty.

Seed zawiera 15 szkół rozrzuconych po Polsce (Warszawa, Kraków, Łódź, Wrocław,
Poznań, Gdańsk, Gdynia, Szczecin, Bydgoszcz, Lublin, Białystok, Katowice, Rzeszów).
Mapa startuje wyśrodkowana na kraju (zoom 6). Nazwy i adresy odpowiadają istniejącym
placówkom, współrzędne są przybliżone. **Ratingi są w całości fikcyjne** — w MVP nie
ma źródła ocen.

Seed jest idempotentny: użytkownika aktualizuje (`onConflictDoUpdate`), a szkoły
pomija, jeśli tabela nie jest pusta. `pnpm db:seed --reset` czyści je i wstawia od nowa.

### API

| Metoda | Ścieżka        | Auth | Opis                                                 |
| ------ | -------------- | ---- | ---------------------------------------------------- |
| `GET`  | `/health`      | —    | probe                                                |
| `POST` | `/auth/login`  | —    | `{ username, password }` → `{ user }` + `Set-Cookie` |
| `POST` | `/auth/logout` | —    | `204`, czyści ciasteczko                             |
| `GET`  | `/auth/me`     | ✅   | `{ user }`                                           |
| `GET`  | `/schools`     | ✅   | lista szkół                                          |
| `GET`  | `/schools/:id` | ✅   | szczegóły; `400` przy złym UUID, `404` gdy brak      |

Błędy walidacji mają kształt `{ message, errors: { <pole>: string[] } }` — frontend
mapuje je bezpośrednio na komunikaty pod polami formularza.

---

## Świadome uproszczenia i TODO

Zakres MVP był celowo wąski. Poniższe rzeczy **nie zostały zaimplementowane** i są
znanymi brakami, a nie przeoczeniami:

**Autoryzacja**

- **Brak refresh tokenów.** Jeden access token z czasem życia `JWT_EXPIRES_IN` (domyślnie 8h).
  Po wygaśnięciu użytkownik loguje się ponownie. Wystarcza na tym etapie; wprowadzenie
  refresh tokenów wymaga tabeli sesji i rotacji.
- **Brak rejestracji i resetu hasła** — konta powstają wyłącznie przez seed.
- **Brak listy unieważnionych tokenów.** Wylogowanie usuwa ciasteczko, ale sam JWT
  pozostaje ważny do czasu wygaśnięcia. Przy realnym wdrożeniu potrzebna jest denylista
  albo krótki token + refresh.
- **Brak ról i uprawnień** — każdy zalogowany użytkownik widzi to samo.
- **Brak rate limitingu na `/auth/login`** (np. `@nestjs/throttler`).

**Szkoły**

- **Tylko odczyt.** `GET /schools` i `GET /schools/:id`. Serwis i mapper są przygotowane
  pod rozszerzenie, ale endpointy `POST/PATCH/DELETE` i UI do edycji nie powstały.
- **Brak paginacji, filtrowania i wyszukiwania.** Przy kilkunastu rekordach lista
  zwracana jest w całości — mapa i tak potrzebuje wszystkich pinezek naraz.
  Przy większym zbiorze trzeba dołożyć paginację listy i pobieranie pinezek po bounding boxie.
- **`rating` jest mockowany** — brak źródła realnych ocen.
- **`address` to jedno pole tekstowe.** Wystarcza do wyświetlenia; sortowanie/filtrowanie
  po mieście wymagałoby rozbicia na `street` / `postalCode` / `city`.
- **Import CSV kończy się na podglądzie, bez zapisu.** `/schools/import/csv` parsuje i
  waliduje plik RSPO w całości, ale przycisk "Zapisz" jest celowo wyłączony — tabela
  `schools` wymaga `latitude`/`longitude`/`rating` (NOT NULL + CHECK), których plik RSPO
  nie zawiera. Docelowa ścieżka: nowy endpoint `POST /schools/import` + geokodowanie
  adresów dla uzupełnienia `latitude`/`longitude`.

**Infrastruktura**

- **Konteneryzowana jest wyłącznie baza.** Dockerfile'e dla api i web nie powstały.
- **Migracje uruchamiane ręcznie** (`pnpm db:migrate`), bez automatycznego kroku przy starcie.
- **Brak testów e2e.** Są tylko podstawowe testy jednostkowe API (vitest):
  `ZodValidationPipe`, mapper szkoły, parser czasu życia tokena. Brak testów frontendu.
- **Brak CI** i konfiguracji zdalnego cache Turborepo.
- **Devtoole TanStacka nie są podpięte.** Rollup emitował je do `dist` jako martwe chunki
  mimo bramkowania `import.meta.env.DEV`, więc zostały usunięte, żeby build produkcyjny
  był czysty. Aby je dodać lokalnie:
  `pnpm --filter @lokalizator/web add -D @tanstack/react-router-devtools @tanstack/react-query-devtools`
  i wyrenderować obok `<RouterProvider>` w `src/main.tsx`.
- **Brak przełącznika motywu.** Zmienne CSS dla trybu ciemnego są zdefiniowane
  w `src/styles.css` (klasa `.dark`), ale nic ich nie przełącza.
