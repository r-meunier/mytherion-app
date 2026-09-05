# CI and Environment Fix Plan

> **Historical record (Resolved).** Class names here predate [`terminology.md`](./terminology.md):
> `EntityControllerTest` is now `CodexEntryControllerTest`, `EntityDTO` is now `EntryDTO`.


## 1. Backend Fixes

### 1.1 Resolve Flyway Connection Error in CI
- The CI fails because Flyway tries to migrate the database before Postgres is ready.
- **Action**: Add a step in `ci.yml` to wait for Postgres to be ready before running tests.

### 1.2 Fix EntityControllerTest Compilation/Execution
- The CI reports missing parameters for `EntityDTO` even though they seem present.
- **Action**: Refactor `EntityDTO` instantiations in `EntityControllerTest.kt` to use named arguments for all fields and ensure consistency with the latest `EntityDTO` definition.
- **Action**: Fix the `IntegrationTests.kt` parameter resolution error by ensuring `RestTestClient` is properly configured or removing the unused constructor parameter.

### 1.3 Fix Gradle Wrapper
- The CI reports `Unable to access jarfile`.
- **Action**: Verify and fix the path in `ci.yml`. Ensure `gradle-wrapper.jar` is explicitly included in the repository.

## 2. Frontend Fixes

### 2.1 Regenerate `package-lock.json`
- Manual edits to `package-lock.json` likely broke the dependency graph or integrity checks, causing `ts-node` to be missing or failing to install in CI.
- **Action**: Delete the current `package-lock.json` and run `npm install` to regenerate it.

### 2.2 Fix Jest/ts-node setup
- Ensure `ts-node` is available for Jest to load `jest.config.ts`.
- **Action**: Verify `ts-node` version and its presence in the new `package-lock.json`.

## 3. Local Environment Fixes

### 3.1 Debug `SecurityConfig` Bean Creation
- The user reports a `BeanCreationException` when running from IntelliJ.
- **Action**: Add more logging or check for missing environment variables/properties in IntelliJ's run configuration.
- **Action**: Check for potential version conflicts with Spring Boot 4.0.1 and Kotlin 2.2.
