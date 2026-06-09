## Plan: Fix staff login and lock down signup

**The issue:** Your Gmail registration created an account, but it requires email confirmation. Until you click the link in the confirmation email Lovable Cloud sent to your Gmail, sign-in will fail.

### What I'll do

1. **Disable public signup** in Lovable Cloud auth settings. New staff accounts can only be created by an admin from the backend Users panel — not from the `/auth` page.
2. **Remove the "Create account" toggle** from `src/routes/auth.tsx` so the page only shows sign-in (no confusing signup UI that would just fail).
3. **Keep email confirmation on** as you requested.

### What you need to do (one-time, to get in today)

1. Open your Gmail inbox — look for an email from Lovable / Multiwings with subject like "Confirm your signup". Check spam too.
2. Click the confirmation link.
3. Return to `/auth` and sign in with the same email + password.

If you can't find the confirmation email, tell me and I'll either:
- Manually confirm your account from the backend, or
- Resend it.

### Going forward

To add more staff, you (as admin) go to **View Backend → Users → Add user**, set their email + password, and check "Auto Confirm User". They can then sign in immediately. I can also wire up a small admin "Invite staff" page later if you'd prefer that over the backend panel.
