# Security Specification: RBAC for Projects and Tasks

## Data Invariants
1. Projects and Tasks have an optional `allowedMembers` array of strings (member names).
2. If `allowedMembers` is provided, only users whose names (or roles?) are in this list can access the document.
3. Access control is enforced at the UI level for usability and `firestore.rules` level for security.

## The "Dirty Dozen" Payloads (Examples)
1. Project with empty `allowedMembers` -> Visible to all? (Decide: Yes, public by default).
2. Project with `allowedMembers: ["Mr Lee"]` -> Visible only to Mr Lee.
3. Project with `allowedMembers: ["Mr Lee", "Demy"]` -> Visible to Lee and Demy.
4. Attempt to access project restricted to "Mr Lee" as "Demy" -> Forbidden.
...

## Test Runner (firestore.rules.test.ts)
- Define tests to verify permission denial for unauthorized users.
