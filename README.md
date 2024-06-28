
# Simple shop

## Opis projektu
Ten projekt zawiera zarówno frontend, jak i backend aplikacji webowej. Backend jest odpowiedzialny za zarządzanie danymi użytkowników i produktów, natomiast frontend zajmuje się wyświetlaniem interfejsu użytkownika.

## Struktura projektu
Projekt jest podzielony na dwa główne katalogi:
- `backend` - zawiera kod serwera backendowego.
- `frontend` - zawiera kod aplikacji frontendowej.

### Backend
- `index.js` - Główny plik serwera backendowego.
- `package.json` - Plik konfiguracyjny npm dla backendu.
- `package-lock.json` - Plik blokujący wersje pakietów dla backendu.
- `products.json` - Przykładowe dane produktów.
- `users.json` - Przykładowe dane użytkowników.

### Frontend
- `server.js` - Serwer dla aplikacji frontendowej.
- `package.json` - Plik konfiguracyjny npm dla frontend.
- `package-lock.json` - Plik blokujący wersje pakietów dla frontend.
- `public/` - Zawiera zasoby statyczne takie jak obrazy i pliki CSS.
  - `background.jpg` - Tło strony.
  - `logo.svg` - Logo strony.
  - `wbp.png` - Inny obraz.
  - `css/styles.css` - Arkusz stylów CSS.
- `views/` - Zawiera pliki szablonów widoków.
  - `index.hbs` - Główny widok strony.
  - `login.hbs` - Widok strony logowania.
  - `partials/header.hbs` - Częściowy widok nagłówka.

## Instalacja
Aby uruchomić projekt lokalnie, postępuj zgodnie z poniższymi krokami:

### Backend
1. Przejdź do katalogu `backend`:
    ```bash
    cd backend
    ```
2. Zainstaluj zależności:
    ```bash
    npm install
    ```
3. Uruchom serwer backendowy:
    ```bash
    node index.js
    ```

### Frontend
1. Przejdź do katalogu `frontend`:
    ```bash
    cd frontend
    ```
2. Zainstaluj zależności:
    ```bash
    npm install
    ```
3. Uruchom serwer frontendowy:
    ```bash
    node server.js
    ```

## Wymagania
- Node.js
- npm (Node Package Manager)

## Licencja
Ten projekt jest licencjonowany na warunkach licencji MIT. Zobacz plik [LICENSE](LICENSE) aby uzyskać więcej informacji.
