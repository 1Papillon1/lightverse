# CChain Recovery Notes

Updated: 2025-11-12

## Repository State

- Base repo: `1Papillon1/uniweb`, branch `main`.
- Latest upstream commit (`1e96561a`): “Cleaned infection, hardened .htaccess security, removed malicious files.”
- Malicious artifacts removed in that commit: `public/defauit.php`, suspicious JPEG payloads, overwritten `public/index.php`.
- `DashboardController.php` was deleted upstream and has now been restored with minimal logic for Inertia dashboard routing.

## Audit & Remediation Steps

- `composer validate` → **pass**.
- `composer audit` → 2 advisories outstanding (`league/commonmark <2.7.0`, `symfony/http-foundation <7.3.7`). Upstream framework update required—track via `composer update league/commonmark symfony/http-foundation` once Laravel 12.x publishes patched dependencies.
- `npm install` (Node 20+) → complete with 30 advisories (1 critical). Run `npm audit` for details; most originate from front-end toolchain (Vite/Tailwind ecosystem).
- `composer install` executed to verify vendor tree matches lock file.

## Fixes Applied

- Restored `app/Http/Controllers/DashboardController.php` with typed helper methods for `/dashboard` routes.
- Added GET routes for `/login` and `/register` serving the `Authorization` Inertia page to resolve “Method Not Allowed” errors while keeping POST handlers for submission.
- Ensured `AuthController` imports `App\Models\User` so registration persists new users.
- Guarded `/dashboard` routes with the `auth` middleware and made `/` route send guests to `/login`, so unauthenticated visitors land on the login screen instead of a half-loaded dashboard scene.

## Outstanding Work

- Review Laravel/Composer advisories once patches are available.
- Run `npm audit` and evaluate dependency upgrades (expect breaking changes with Tailwind 4 beta).
- Re-test login, registration, and dashboard flows after clearing browser cache (malware may have set aggressive caching headers).
- Consider adding automated security scans (e.g., Dependabot, `laravel/pail security:scan`).

## Quick Validation Commands

```bash
composer validate
composer audit
npm audit
php artisan test
npm run lint
```

### Test Run Snapshot (2025-11-12)

- `php artisan test` currently fails: legacy Jetstream feature tests expect a `name` column and default auth scaffolding routes that are no longer present. Align the database schema (add `name` support or adjust factories/tests) before relying on the suite.

Document maintainer: Mkpc / GitHub Copilot session log.
