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
#  Enum parity: SectionType and EntryType
# ────────────────────────────────────────────────────────────────

section_kt = read(BE / "codex" / "model" / "sections" / "EntrySection.kt")
codex_ts = read(FE / "types" / "codex.ts")

be_sections = sorted(set(re.findall(r'name = "([A-Z_]+)"', section_kt)))
fe_sections = sorted(set(re.findall(r"([A-Z_]+)\s*=\s*'", extract(
    r"enum SectionType \{(.*?)\n\}", codex_ts, "SectionType enum in types/codex.ts"))))

check(
    f"SectionType in sync ({len(be_sections)} backend / {len(fe_sections)} frontend)",
    bool(be_sections) and be_sections == fe_sections,
    f"only backend: {sorted(set(be_sections) - set(fe_sections))}  "
    f"only frontend: {sorted(set(fe_sections) - set(be_sections))}",
)

be_entry_types = sorted(
    t.strip().rstrip(",")
    for t in extract(r"enum class EntryType \{(.*?)\}",
                     read(BE / "codex" / "model" / "CodexEntry.kt"),
                     "EntryType enum in CodexEntry.kt").split()
    if t.strip().rstrip(",")
)
fe_entry_types = sorted(set(re.findall(r"([A-Z_]+)\s*=\s*'", extract(
    r"enum EntryType \{(.*?)\n\}", codex_ts, "EntryType enum in types/codex.ts"))))

check(
    f"EntryType in sync ({len(be_entry_types)} backend / {len(fe_entry_types)} frontend)",
    bool(be_entry_types) and be_entry_types == fe_entry_types,
    f"only backend: {sorted(set(be_entry_types) - set(fe_entry_types))}  "
    f"only frontend: {sorted(set(fe_entry_types) - set(be_entry_types))}",
)

overlap = sorted(set(fe_entry_types) & set(fe_sections))
check(
    "EntryType and SectionType share no value names",
    not overlap,
    f"shared: {overlap} -- EntryType.X means 'is an X', SectionType.X means 'has X data'. "
    f"Suffix the section variant (e.g. X_DETAILS).",
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

print()
if failures:
    print(f"{len(failures)} of {checks_run} contract checks FAILED:\n")
    for f in failures:
        print(f"  - {f}")
    print("\nThese contracts span backend and frontend, so the unit suites can all")
    print("pass while one of them is broken. See docs/terminology.md.")
    sys.exit(1)

print(f"All {checks_run} contract parity checks passed.")
