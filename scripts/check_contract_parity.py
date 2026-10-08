#!/usr/bin/env python3
"""
Verify that the backend and frontend still agree with each other.

Both test suites can pass while the two codebases disagree, because neither
exercises the boundary between them. During MYT-81 exactly that happened twice:
the backend served POST /{id}/image while the frontend had moved to /thumbnail,
so image upload would have 404'd in production; and the ApprovalTests fixtures
were left named for a class that no longer existed, so a characterization test
could not find them.

This script asserts the contracts that span the boundary. It reads source files
rather than running anything, so it is fast and needs no database.

A check that cannot find what it expects FAILS rather than passing quietly --
a parity check that silently degrades is worse than no check at all, because it
looks like coverage.

Usage:  python scripts/check_contract_parity.py
Exit:   0 all checks pass, 1 otherwise.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BE = ROOT / "mytherion-backend" / "src" / "main" / "kotlin" / "io" / "mytherion"
BE_TEST = ROOT / "mytherion-backend" / "src" / "test" / "kotlin" / "io" / "mytherion"
BE_RES = ROOT / "mytherion-backend" / "src" / "main" / "resources"
FE = ROOT / "mytherion-frontend" / "app"

failures: list[str] = []
checks_run = 0


def check(label: str, ok: bool, detail: str = "") -> None:
    global checks_run
    checks_run += 1
    print(f"{'PASS' if ok else 'FAIL'}  {label}")
    if not ok:
        failures.append(f"{label}\n        {detail}" if detail else label)


def read(path: Path) -> str:
    """Read a file, or record a failure and return '' so later checks still run."""
    if not path.exists():
        failures.append(f"missing file: {path.relative_to(ROOT)}")
        print(f"FAIL  cannot read {path.relative_to(ROOT)}")
        return ""
    return path.read_text(encoding="utf-8")


def extract(pattern: str, text: str, what: str, flags: int = re.S) -> str:
    """Pull a required region out of a file; a miss is a failure, not a pass."""
    m = re.search(pattern, text, flags)
    if not m:
        failures.append(f"could not locate {what} -- has the file been restructured?")
        print(f"FAIL  could not locate {what}")
        return ""
    return m.group(1)


# ────────────────────────────────────────────────────────────────
#  Enum parity: the codex enums both sides switch on
# ────────────────────────────────────────────────────────────────

codex_ts = read(FE / "types" / "codex.ts")


def kotlin_enum(name: str, path: Path) -> list[str]:
    body = extract(rf"enum class {name} \{{(.*?)\}}", read(path), f"enum class {name} in {path.name}")
    return sorted(t.strip().rstrip(",") for t in body.split() if t.strip().rstrip(","))


def ts_enum(name: str) -> list[str]:
    body = extract(rf"enum {name} \{{(.*?)\n\}}", codex_ts, f"{name} enum in types/codex.ts")
    return sorted(set(re.findall(r"([A-Z_]+)\s*=\s*'", body)))


for enum_name, kotlin_file in [
    ("EntryType", BE / "codex" / "model" / "CodexEntry.kt"),
    ("ContextRole", BE / "codex" / "model" / "EntryContent.kt"),
    ("TemplateLevel", BE / "codex" / "model" / "EntryTemplate.kt"),
]:
    be_values = kotlin_enum(enum_name, kotlin_file)
    fe_values = ts_enum(enum_name)
    check(
        f"{enum_name} in sync ({len(be_values)} backend / {len(fe_values)} frontend)",
        bool(be_values) and be_values == fe_values,
        f"only backend: {sorted(set(be_values) - set(fe_values))}  "
        f"only frontend: {sorted(set(fe_values) - set(be_values))}",
    )

# ────────────────────────────────────────────────────────────────
#  HTTP contract: the routes each side believes in
# ────────────────────────────────────────────────────────────────

controller = read(BE / "codex" / "rest" / "CodexEntryController.kt")
api_routes = read(FE / "config" / "apiRoutes.ts")

be_base = extract(r'@RequestMapping\("([^"]+)"\)', controller,
                  "@RequestMapping on CodexEntryController", flags=0)
check(
    "codex entry base path is /entries",
    be_base == "/api/projects/{projectId}/entries",
    f"backend base is {be_base!r}",
)
check(
    "frontend calls the same base path",
    "/entries`" in api_routes,
    "apiRoutes.entries does not build /entries",
)

be_sub = sorted(set(re.findall(
    r'@(?:Get|Post|Put|Patch|Delete)Mapping\("([^"]*)"', controller)))
check(
    "thumbnail endpoint agreed on both sides",
    "/{id}/thumbnail" in be_sub
    and "/{id}/image" not in be_sub
    and "/thumbnail`" in api_routes
    and "/image`" not in api_routes,
    f"backend sub-mappings {be_sub}; "
    f"frontend thumbnail={'/thumbnail`' in api_routes} image={'/image`' in api_routes}",
)

template_controller = read(BE / "codex" / "rest" / "EntryTemplateController.kt")
be_templates = extract(r'@RequestMapping\("([^"]+)"\)', template_controller,
                       "@RequestMapping on EntryTemplateController", flags=0)
check(
    "entry templates path agreed on both sides",
    be_templates == "/api/codex/templates" and f"'{be_templates}'" in api_routes,
    f"backend {be_templates!r}; frontend apiRoutes.codex.templates must be the same literal",
)

# ────────────────────────────────────────────────────────────────
#  JSON payload contract: stats DTOs the frontend types mirror
# ────────────────────────────────────────────────────────────────

be_dash = sorted(re.findall(
    r"val (\w+):", read(BE / "dashboard" / "dto" / "DashboardStatsDTO.kt")))
fe_dash = sorted(re.findall(r"^\s{2}(\w+)\??:", extract(
    r"interface DashboardStats \{(.*?)\n\}",
    read(FE / "services" / "dashboardService.ts"),
    "DashboardStats interface"), re.M))
check(
    "DashboardStats fields match",
    bool(be_dash) and be_dash == fe_dash,
    f"backend={be_dash}\n        frontend={fe_dash}",
)

# ────────────────────────────────────────────────────────────────
#  Error contract (MYT-23): the one body every failure returns
# ────────────────────────────────────────────────────────────────

be_error_codes = re.findall(r"^\s*([A-Z][A-Z_]+),?\s*(?://.*)?$", extract(
    r"enum class ErrorCode \{(.*?)\n\}",
    read(BE / "common" / "web" / "ErrorCode.kt"),
    "ErrorCode enum in ErrorCode.kt"), re.M)
api_error_ts = read(FE / "types" / "apiError.ts")
fe_error_codes = re.findall(r"\|\s*'([A-Z_]+)'", extract(
    r"export type ErrorCode =(.*?);", api_error_ts, "ErrorCode union in types/apiError.ts"))
check(
    f"ErrorCode in sync ({len(be_error_codes)} backend / {len(fe_error_codes)} frontend)",
    bool(be_error_codes) and sorted(be_error_codes) == sorted(fe_error_codes),
    f"only backend: {sorted(set(be_error_codes) - set(fe_error_codes))}  "
    f"only frontend: {sorted(set(fe_error_codes) - set(be_error_codes))}",
)

be_error_fields = sorted(re.findall(r"val (\w+):", extract(
    r"data class ErrorResponse\((.*?)\n\)",
    read(BE / "common" / "web" / "ErrorResponse.kt"),
    "ErrorResponse data class")))
fe_error_fields = sorted(re.findall(r"^\s{2}(\w+)\??:", extract(
    r"export interface ApiErrorResponse \{(.*?)\n\}", api_error_ts,
    "ApiErrorResponse interface"), re.M))
check(
    "ErrorResponse fields match ApiErrorResponse",
    bool(be_error_fields) and be_error_fields == fe_error_fields,
    f"backend={be_error_fields}\n        frontend={fe_error_fields}",
)

be_upload_mb = extract(r"max-file-size: \$\{MAX_UPLOAD_FILE_SIZE:(\d+)MB\}",
                       read(BE_RES / "application.yml"),
                       "max-file-size default (in MB) in application.yml", flags=0)
fe_upload_mb = extract(r"const MAX_SIZE_MB = (\d+);",
                       read(FE / "services" / "mediaService.ts"),
                       "MAX_SIZE_MB in mediaService.ts", flags=0)
check(
    "upload size limit defaults agree",
    bool(be_upload_mb) and be_upload_mb == fe_upload_mb,
    f"backend allows {be_upload_mb}MB, frontend pre-check allows {fe_upload_mb}MB, so users "
    f"would be told one limit and refused at another",
)

# ────────────────────────────────────────────────────────────────
#  Observability contract: MDC keys must match the log pattern
# ────────────────────────────────────────────────────────────────

log_props = read(BE_RES / "logging.properties")
mdc_keys = set(re.findall(r"%X\{(\w+)\}", log_props))
code_keys = set(re.findall(r'"(\w+)" to ', controller))
missing = sorted(k for k in mdc_keys if k not in {"requestId", "userId", "projectId"}
                 and k not in code_keys)
check(
    "log pattern MDC keys are actually populated",
    not missing,
    f"logging.properties references " + ", ".join(f'%X{{{k}}}' for k in missing) +
        f" but no code puts those keys -- "
    f"they would render empty. Controller puts: {sorted(code_keys)}",
)

# ────────────────────────────────────────────────────────────────
#  Persistence contract: schema matches the JPA model
# ────────────────────────────────────────────────────────────────

sql = read(BE_RES / "db" / "migration" / "V1__init.sql")
model = read(BE / "codex" / "model" / "CodexEntry.kt")
table = extract(r'@Table\(name = "(\w+)"\)', model, "@Table on CodexEntry", flags=0)
check(
    "codex entry table name matches the migration",
    bool(table) and f"CREATE TABLE {table}" in sql,
    f"model maps to {table!r} but the migration does not create it",
)

jsonb_field = "content" if re.search(r"var content:", model) else None
check(
    "entry content column matches the model field",
    jsonb_field is not None and re.search(rf"\b{jsonb_field} JSONB", sql) is not None,
    f"model field {jsonb_field!r} has no matching JSONB column in V1__init.sql",
)

# ────────────────────────────────────────────────────────────────
#  Test fixture contract: ApprovalTests resolves by class + method name
# ────────────────────────────────────────────────────────────────

approval_dir = BE_TEST / "codex" / "service"
approval_files = {p.name for p in approval_dir.glob("*.approved.json")}
if approval_files:
    cls_path = approval_dir / "CodexEntryServiceCharacterizationTest.kt"
    methods = re.findall(r"fun `([^`]+)`", read(cls_path))
    expected = {f"{cls_path.stem}.{m}.approved.json" for m in methods}
    check(
        "ApprovalTests fixtures match their class and method names",
        expected == approval_files,
        f"orphaned (no matching test): {sorted(approval_files - expected)}\n"
        f"        missing (test has no fixture): {sorted(expected - approval_files)}",
    )
else:
    check("ApprovalTests fixtures present", False,
          f"no .approved.json found under {approval_dir.relative_to(ROOT)}")

# ────────────────────────────────────────────────────────────────
#  Toolchain contract: one exact Node version everywhere, sourced from .nvmrc
# ────────────────────────────────────────────────────────────────
#  Local (nvm/fnm) and CI (setup-node node-version-file) read .nvmrc directly.
#  Docker cannot read it in a FROM line, so docker-compose.yml carries a copy.

FE_ROOT = ROOT / "mytherion-frontend"
nvmrc = read(FE_ROOT / ".nvmrc").strip()
node_version = extract(r"^v?(\d+\.\d+\.\d+)$", nvmrc, ".nvmrc exact Node version (x.y.z)", re.M)
node_major = node_version.split(".")[0]

compose_node = extract(r"NODE_VERSION:\s*\"?([\d.]+)", read(ROOT / "docker-compose.yml"),
                       "NODE_VERSION build arg in docker-compose.yml")
check(f"docker-compose NODE_VERSION matches .nvmrc ({compose_node} / {node_version})",
      bool(node_version) and compose_node == node_version,
      "update the frontend build arg in docker-compose.yml to the .nvmrc version")

dockerfile = read(FE_ROOT / "Dockerfile")
pinned = sorted(set(re.findall(r"FROM\s+node:(\d+)", dockerfile)))
check("Dockerfile takes its Node version from the NODE_VERSION build arg",
      not pinned and "node:${NODE_VERSION}" in dockerfile,
      f"hardcoded node image tags: {pinned}")

package_json = read(FE_ROOT / "package.json")
# engines may allow the whole major (e.g. "24.x") so any 24 works locally, while
# .nvmrc, Docker and CI pin the exact version. @types/node is published per major.
engines_node = extract(r'"engines"\s*:\s*\{[^}]*"node"\s*:\s*"[\^~]?(\d+)', package_json,
                       "engines.node in package.json")
types_node = extract(r'"@types/node"\s*:\s*"[\^~]?(\d+)', package_json,
                     "@types/node in package.json")
check(f"package.json engines.node major matches .nvmrc ({engines_node} / {node_major})",
      bool(node_major) and engines_node == node_major)
check(f"@types/node major matches .nvmrc ({types_node} / {node_major})",
      bool(node_major) and types_node == node_major,
      "types for a newer Node let code use APIs the runtime does not have")

ci_yml = read(ROOT / ".github" / "workflows" / "ci.yml")
check("CI reads the Node version from .nvmrc instead of hardcoding it",
      "node-version-file:" in ci_yml and not re.search(r"node-version:\s*['\"]?\d", ci_yml))

# ────────────────────────────────────────────────────────────────

print()
if failures:
    print(f"{len(failures)} of {checks_run} contract checks FAILED:\n")
    for f in failures:
        print(f"  - {f}")
    print("\nThese contracts span backend and frontend, so the unit suites can all")
    print("pass while one of them is broken. See docs/terminology.md.")
    sys.exit(1)

print(f"All {checks_run} contract parity checks passed.")
