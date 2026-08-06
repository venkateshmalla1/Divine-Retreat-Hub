---
name: API schema generation
description: Compatibility rule for the workspace's OpenAPI-to-Zod generation.
---

When the workspace uses Zod 3, configure Orval's Zod generator with `override.zod.version: 3`; otherwise newer Orval releases can emit Zod 4-only helpers such as `zod.int()` and `zod.email()`.

**Why:** The generated client can look successful while the chained library typecheck fails because the workspace runtime and generated syntax are on different Zod majors.

**How to apply:** Check the catalog-pinned Zod version before changing OpenAPI or Orval configuration, then run codegen and `pnpm run typecheck:libs` together.