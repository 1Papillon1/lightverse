# CChain Crypto Dashboard

Interactive Laravel 12 + Inertia/React showcase for tracking crypto ecosystems, wallet flows, and experimental 3D roadmap visualisations.

## Prerequisites

- PHP 8.2 with Composer
- Node.js 20.x with npm
- SQLite (default) or configure your preferred database in `.env`

## Installation

1. Copy the environment scaffold if needed:

   ```bash
   cp .env.example .env
   ```

2. Install PHP dependencies and generate the application key:

   ```bash
   composer install
   php artisan key:generate
   ```

3. Install Node dependencies:

   ```bash
   npm install
   ```

4. Build front-end assets (hot reload shown below):

   ```bash
   npm run dev
   ```

5. Run database migrations and seeders:

   ```bash
   php artisan migrate --seed
   ```

## Running Locally

- API / backend: `php artisan serve`
- Front-end (Vite): `npm run dev`
- Full-stack dev loop: run both commands above or use the combined composer script `composer run dev`.

## Authentication

- `GET /login` and `GET /register` render the Inertia `Authorization` page.
- `POST /login` and `POST /register` submit credentials via `AuthController`.
- Successful registration logs the user in and redirects to `/dashboard`.

## Maintenance Notes

- Security/audit log: see `cchain.md` for the latest recovery notes.
- After package upgrades run:

  ```bash
  composer test
  php artisan test
  npm run lint
  ```

- Generated assets live under `public/build` (managed by Vite).

## Troubleshooting

- Clear caches: `php artisan optimize:clear`
- Rebuild assets: `npm run build`
- Re-sync vendors: `rm -rf vendor composer.lock && composer install`
- If login/register still fail, confirm CSRF token is present in the form and that sessions are writable under `storage/framework/sessions`.

## Observability

- Authenticated users can browse recent logs at `/logs`, which redirects to the bundled Log Viewer UI (`opcodesio/log-viewer`).
- Dashboard visits from logged-in users are written to the application log with JSON context (`dashboard.visit` events).
- Clockwork profiler is published (`config/clockwork.php`) and enabled via `.env`; access the UI at `/clockwork` or connect using the Clockwork browser extension.
- `config/app.php` now defaults `APP_URL` to `https://cchain.fitapp.cloud` so artisan-generated links remain correct even if `.env` is missing the variable.

