# Angelo Besas — Portfolio

Personal portfolio for **Angelo Besas** (Young IT · BS Information Technology, Holy Name University), with an admin UI prototype for a future CMS.

## Milestone status

**Milestone 1 — frontend only.**

- ✅ Public pages: `/`, `/about`, `/achievements`, `/certificates`, `/projects`, `/skills`, `/contact`
- ✅ Admin UI shell: `/admin/login`, `/admin`, `/admin/profile`, `/admin/achievements`, `/admin/certificates`, `/admin/projects`, `/admin/skills`, `/admin/education`, `/admin/messages`, `/admin/settings`
- ❌ **Not implemented yet:** database schema, authentication, file storage, Row Level Security, real CMS CRUD, and contact message delivery.

> The admin area is a **UI prototype**. It has no sign-in and **no access control** — anyone who knows the URL can open it. It does not save anything: add/edit/delete only changes in-memory state and resets on reload. Hiding links in the UI is not security; real protection arrives with the backend milestone.

## Editing content

All content lives in centralized mock data files:

| File | Content |
| --- | --- |
| `src/data/profile.ts` | Name, headline, course, school, intro, education, interests |
| `src/data/projects.ts` | Projects (sample/demo, clearly labeled) |
| `src/data/achievements.ts` | Achievements (placeholders) |
| `src/data/certificates.ts` | Certificates (placeholders) |
| `src/data/skills.ts` | Grouped skills (no proficiency scores) |
| `src/data/admin.ts` | Sample admin inbox + activity |

Each entry has a `status` of `"placeholder"` or `"sample"`, which renders a visible badge. Replace entries with verified content and remove the status badge when real data is in place.

## Local development

```bash
bun install
bun run dev      # start the dev server
bun run test     # run tests
bun run build    # production build
```

## Tech

React 19 + TypeScript, TanStack Start/Router, Tailwind CSS v4, shadcn/ui, react-hook-form + zod.

## Repository

Kept **private** during development. No analytics, payments, or third-party tracking are included.
