# Contributing to WireStock

Thank you for your interest in contributing! 🎉

## Development Setup

See [README.md](README.md#-quick-start) for the full setup instructions.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow

## How to Contribute

### Reporting Bugs

Open a [GitHub Issue](https://github.com/<owner>/wire-stock/issues/new) with:

- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots / logs (if applicable)
- Environment info (OS, Node version, Docker version)

### Suggesting Features

Open an issue with the `enhancement` label. Describe:

- The problem you're solving
- Your proposed solution
- Alternatives you considered

### Submitting Pull Requests

1. Fork the repository
2. Create a branch from `main`:
   ```bash
   git checkout -b feat/my-feature
   ```
3. Make your changes
4. Follow our coding standards (see below)
5. Run lint & tests:
   ```bash
   pnpm lint
   pnpm test
   ```
6. Commit using [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat(stock): add bulk transfer endpoint"
   ```
7. Push and open a PR

## Coding Standards

### TypeScript

- Strict mode (gradually enforced — see [ROADMAP.md](ROADMAP.md))
- Prefer `type` over `interface` for plain objects
- Use `readonly` where appropriate
- Document exported functions/types with JSDoc

### File Naming

- React components: `PascalCase.tsx`
- Utilities/hooks: `kebab-case.ts`
- Prisma models: `PascalCase`
- API routes: `kebab-case`

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Use for |
|--------|---------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation only |
| `style:` | Formatting (no logic change) |
| `refactor:` | Code change (no feature/fix) |
| `perf:` | Performance improvement |
| `test:` | Adding/updating tests |
| `chore:` | Build, deps, tooling |

Examples:
```
feat(auth): add refresh token rotation
fix(stock): prevent negative inventory on transfer
docs: update API endpoint list in README
```

## Project Structure

See [README.md](README.md#-architecture) and [`packages/database/prisma/schema.prisma`](packages/database/prisma/schema.prisma).

## Versioning

We follow [Semantic Versioning](https://semver.org/). Each patch release (`v1.0.x`) is a tagged Git commit.

## Questions?

Open a [GitHub Discussion](https://github.com/<owner>/wire-stock/discussions) or email dev@wirestock.local.

---

Thank you for making WireStock better! ⚡