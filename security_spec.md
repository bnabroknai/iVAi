# Security Specification - Vital App

## 1. Data Invariants
- An entry must belong to the authenticated user (`userId == request.auth.uid`).
- Entry type must be one of the allowed categories.
- User profiles can only be read/written by the user themselves.
- Timestamps (`createdAt`) must be server-generated.

## 2. The "Dirty Dozen" Payloads (Deny List)
1.  **Identity Spoofing**: Creating an entry for another user.
2.  **Shadow Update**: Adding `isAdmin: true` to a user profile.
3.  **Invalid Type**: Setting entry type to `unsupported_category`.
4.  **Resource Poisoning**: Sending a 1MB string in `value`.
5.  **Time Travel**: Setting `createdAt` to a future/past date manually.
6.  **Orphaned Entry**: Creating an entry without a `userId`.
7.  **Unauthorized List**: Listing entries for a different user.
8.  **Status Shortcut**: (N/A for entries, they are immutable once created usually, but let's assume we can't update `type`).
9.  **Email Spoofing**: Accessing data with an unverified email (if we enforce email verification).
10. **Ghost Field**: Adding `verifiedByAdmin: true` to an entry.
11. **ID Poisoning**: Using a 2KB string as a document ID.
12. **Blanket Read**: Trying to `get` all entries without filtering by `userId` in the query (if query-rules are enabled).

## 3. Test Runner
(I will create a standard firestore.rules file first, but here is the logic for testing)
- `tests/firestore.rules.test.ts` (to be implemented if needed, but I'll focus on the rules first).

