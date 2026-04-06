# PocketBase schema change for profile bio

This feature expects a new `bio` field on the built-in users collection.

Apply this in the PocketBase admin UI before merging/deploying:

1. Open the `_pb_users_auth_` collection.
2. Add a new field:
   - Type: `text`
   - Name: `bio`
   - Required: `false`
   - Presentable: `false`
   - Min length: leave empty or `0`
   - Max length: choose a reasonable limit for profile bios (for example `280`)
3. Save the collection.
4. Regenerate PocketBase types with:
   - `pnpm run typegen`
5. Verify profile edit + profile display still work.

Notes:
- No API rule changes should be needed for users updating their own profile if existing auth rules already allow self-updates.
- If you want stricter validation later, enforce it in both PocketBase field validation and the profile form.
