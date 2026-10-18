# Project rules for restaurant-app-mvp (university assignments A1 and A2)

The assignment texts are in `A1-FA2026.md` and `A2-FA2026.md` in this folder.
Read the relevant Question section there before coding. The text is the specification.

## Current state
- A1 Questions 3, 4 and 5 were already built and work. Treat all existing code as working.
- The app is Expo (SDK 57), JavaScript only. React Navigation is already installed.

## Hard rules (never break these)
1. Do ONE question per request. Never start the next question.
2. Existing code works. Make the smallest possible edits to existing files.
   - Never rewrite a whole existing file unless the task cannot be done otherwise. If you must, say so in the plan first.
   - Keep existing names, structure, spacing, fonts and colour VALUES. Do not reformat or "clean up" code you were not asked to change.
   - Never remove an existing feature (validation, debounce, pull to refresh, back to top, render counter, search suggestions, header title count, and so on).
3. Write a short plan first (under 12 lines) and WAIT for my approval before changing any file.
4. Do NOT run `npx expo start`, `npm run dev`, or any command that keeps running. I run those myself in another terminal.
5. Do NOT run `git commit`, `git push`, `git reset`, `git clean`, `git checkout`, `git restore` or any `git stash` command. I do all git actions. There is an old stash in this repo: do not touch it.
6. Never open, print, or change real secrets. Never write a real MongoDB connection string anywhere. `server/.env` is filled in by me.
7. No new libraries except what the assignment needs. No Redux, Zustand, MobX or other state libraries. No TypeScript.
   If a package must be installed and the install fails because of the sandbox or network, tell me the exact command and I will run it myself.
8. Do not edit anything inside the `A1/` or `A2/` folders, except the Postman collection that goes into `A2/` when the task says so.
9. Put a simple English comment on every React hook use and every custom hook, saying what it does and why it is used. I must explain this code in a viva.

## Final reply format (always)
- Files created or changed (one line each)
- Checklist: one line per requirement of the question, marked done or missing
- Anything you were unsure about or assumed
- Exact steps for me to test on my phone
Keep it short. Do not repeat the code.
