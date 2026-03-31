


Zod: safeParse vs parse
parse() -> throws error if validation fails (needs try/catch)
safeParse() -> returns { success: true/false }, easier to handle validation

Bcrypt Salt Rounds
bcrypt.hash(password, 10)
10 = salt rounds
hashing runs 2^10 times
slower hashing = harder for brute-force attacks

Stateless Authentication (JWT)
JWT stores all required user data inside the token itself.
Unlike session-based auth, the server does not store sessions in memory.
Server only needs JWT_SECRET to verify:
- token is valid
- token was not tampered with



Slugification
Regex: /[^a-z0-9-]/g
matches any character that is NOT:
- lowercase letter (a-z)
- number (0-9)
- hyphen (-)
those characters are replaced with "-"
used to create clean URL slugs