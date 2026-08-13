# KnowMate V2 — Real Rooms

## 1. Supabase
Create a Supabase project, open SQL Editor, and run `supabase.sql`.

Then open Project Settings → API and copy:
- Project URL
- anon / publishable key

Paste them into `config.js`.

## 2. Vercel
Push all files to GitHub and import the repo in Vercel.
Framework: Other
Build command: empty
Output directory: .

## 3. Test
Open the deployed URL on two devices:
1. Device A → Create room.
2. Copy the 4–6 character room code.
3. Device B → Join room using the same password.
4. Device A will see the second player in realtime.

Security note:
This MVP uses anonymous browser access and public RLS policies for simplicity. Before a public launch, add Supabase Auth and tighter RLS policies. Never put a service_role key in config.js.
