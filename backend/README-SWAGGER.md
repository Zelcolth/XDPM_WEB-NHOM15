Swagger setup and generation

Steps to generate and view API documentation locally (run from backend/):

1. Install PHP and Composer if not installed.
2. Install PHP dependencies:

```bash
composer install
```

3. Publish vendor assets for l5-swagger (optional):

```bash
php artisan vendor:publish --provider "L5Swagger\L5SwaggerServiceProvider"
```

4. Generate swagger JSON:

```bash
php artisan l5-swagger:generate
```

5. Open the Swagger UI at `http://your-app.test/api/documentation` (or the app URL configured).

Notes:
- `config/l5-swagger.php` scans `app/` for `@OA` annotations. We added basic annotations to the Auth and Category controllers.
- If you want the generated JSON committed, copy `storage/api-docs/api-docs.json` into the repo and commit.
