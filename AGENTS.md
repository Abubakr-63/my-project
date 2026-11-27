# Project rules

- Use TypeScript in strict mode. Preserve type safety throughout the project.
- Keep components small and focused.
- Never hardcode user-facing text. Put all copy, including accessible labels and metadata, in the translation files under `src/messages`.
- Never hardcode secrets. Use `.env.local` for local credentials and commit only placeholders in `.env.example`.
- Design mobile-first and adapt layouts for larger screens.
- Explain why a library is needed before installing it.
- Upload product images under about 300 KB and at least 600 × 315 px. WhatsApp may skip large images in link previews.
- Use the session-aware Supabase client only in `src/app/[locale]/admin` and its admin helpers. The proxy refreshes that session on admin routes.
- Every admin Server Action re-checks `is_admin()` for the verified user before granting admin access.
- Never use the Supabase service role key.
- All admin forms validate on the server; product deletion is blocked when orders exist (FK restrict, SQLSTATE 23503).
- Use Material 3 color tokens in `src/app/globals.css` and shared controls in `src/components/ui`.
- Use only the inline SVG icons exported from `src/components/ui/icons.tsx`.
- Gate CSS motion with the full and reduced tiers. Keep reduced motion static.
- Show RU, TJ, and EN on the language segments and use translated full names as their accessible labels.
