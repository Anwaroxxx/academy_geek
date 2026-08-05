# Central Host Integration and .env Setup

This document describes how the `academy_geek` app connects to a central host system (often referenced in comments as `mylionsgeek`) and how to configure the `.env` file for that integration.

## What is implemented ??

The project integrates with a central host for:
- authentication and login flow
- syncing classes, coaches, students, and assignments
- fetching avatars, socials, and WakaTime keys

Key implementation points:
- `AuthController` redirects users to the central host login URL
- `AuthController::loginCallback()` kiyakhod wahed l callback code and exchanges it for a token
- `GetClassesDataController::getClasses()` fetches central class data and syncs local records
- `GetAvatarsService`, `GetSocialsService`, and `GetWakaTimeKeys` call central host APIs with an API key
- `CLIENT_SECRET` is used as the `x-api-key` header for all central host requests

## Required `.env` variables

These values are used by the academy app to talk to the central host.

```env
APP_URL=http://127.0.0.1:8001

CENTRAL_HOST_URL=http://127.0.0.1:8000/
CENTRAL_HOST_AUTH=/auth/academy
CENTRAL_HOST_TOKEN=/api/academy/token
CENTRAL_HOST_CLASSES_URL=/api/academy/classes
CLIENT_SECRET=YOUR_SECRET_KEY
```

> Important:
> - `CENTRAL_HOST_AUTH`, `CENTRAL_HOST_TOKEN`, and `CENTRAL_HOST_CLASSES_URL` khass darori ybdaw b `/` (la route khassha tbdaw b slash).
> - `CLIENT_SECRET` khass ykoun nafs value li f `.env` dyal `mylionsgeek`.
> - `APP_URL` khass ykoun `http://127.0.0.1:8001` li huwa `academy`, u `CENTRAL_HOST_URL` khass ykoun `http://127.0.0.1:8000/` li huwa `mylionsgeek`.

### Port assignment for local development

To keep `mylionsgeek` on port `8000` and `academy` on port `8001`, use these values:

- `APP_URL=http://127.0.0.1:8001`
- `CENTRAL_HOST_URL=http://127.0.0.1:8000/`

If you run the apps with Laravel's built-in server:

```bash
# academy app
php artisan serve --host=127.0.0.1 --port=8001

# central host (mylionsgeek) in its own repo or service
php artisan serve --host=127.0.0.1 --port=8000
```

> Note: The central host code is not included in this workspace, so ensure the separate `mylionsgeek` app is started on port `8000` before testing login and sync flows.

### Variable explanations

- `APP_URL`
  - The URL where the academy app is served.
  - Example: `http://127.0.0.1:8001`

- `CENTRAL_HOST_URL`
  - The base URL of the central host system li howa `mylionsgeek`.
  - Example: `http://127.0.0.1:8000/`

- `CENTRAL_HOST_AUTH`
  - The central host login/auth endpoint path.
  - Khass tbdaw b `/`.
  - Example: `/auth/academy`
  - Used by `AuthController@login()` to build the redirect URL.

- `CENTRAL_HOST_TOKEN`
  - The token exchange endpoint path.
  - Khass tbdaw b `/`.
  - Example: `/api/academy/token`
  - Used by `AuthController::loginCallback()` to exchange the callback code.

- `CENTRAL_HOST_CLASSES_URL`
  - The classes sync endpoint path.
  - Khass tbdaw b `/`.
  - Example: `/api/academy/classes`
  - Used by `GetClassesDataController::getClasses()` to sync class data.

- `CLIENT_SECRET`
  - Shared secret used for central host requests.
  - Khass ykoun nafs value li f `.env` dyal `mylionsgeek`.
  - Sent in the `x-api-key` header for all calls to central host endpoints.

## Login flow

- Hna l academy katsift request l central host (`mylionsgeek`) bach tverify l user w tjib token.

1. User opens `/login`.
2. `AuthController@login()` yredirecti l:
   `CENTRAL_HOST_URL + CENTRAL_HOST_AUTH`
3. mylionsgeek kay authenticate l user.
4. central host kayrj3 lik `/callback/{code}`.
5. `AuthController::loginCallback($code)` kayb3at request l:
   `CENTRAL_HOST_URL + CENTRAL_HOST_TOKEN`
   m3a headers:
   - `x-api-key: CLIENT_SECRET`
   - `code: {code}`
6. central host kay3tik token m3a user details.
7. l app katsajjl aw kat update l local `users` record b `central_id` w katloginih.


## Local setup example

1. Copy the example env file:
   ```bash
   cp .env.example .env
   ```

2. Set the required values:
   - `APP_URL`
   - `CENTRAL_HOST_URL`
   - `CENTRAL_HOST_AUTH`
   - `CENTRAL_HOST_TOKEN`
   - `CENTRAL_HOST_CLASSES_URL`
   - `CLIENT_SECRET`

3. Generate the application key:
   ```bash
   php artisan key:generate
   ```

4. Configure database settings (`DB_CONNECTION`, `DB_DATABASE`, etc.).

5. Run migrations:
   ```bash
   php artisan migrate
   ```

6. Start the app and central host services.

