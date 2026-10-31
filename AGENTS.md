<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules

- Portfolio content lives in `src/data/*.ts` mock files typed by `src/data/types.ts`; pages read only from there so the future CMS backend can replace the data source without touching UI.
- Every placeholder/demo entry carries `status: "placeholder" | "sample"` and must render a visible StatusBadge — never present unverified content as real.
- Public pages wrap content in `SiteLayout` (navy header/footer); inner pages start with `PageHero`.
- Admin routes live under `src/routes/admin.*.tsx` inside the `admin.tsx` sidebar layout; `/admin/login` uses `admin_.login.tsx` to escape that layout.
- Admin content screens reuse `components/admin/ResourceManager` (in-memory CRUD only) until the backend exists; admin is an unprotected UI prototype and must stay labeled as such.
- Per-route head metadata is built with `pageMeta()` from `src/lib/seo.ts`; admin routes pass `noindex`.
- Colors/shadows/gradients are tokens in `src/styles.css`; components use semantic classes only.
