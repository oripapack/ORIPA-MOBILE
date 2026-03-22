# MVP publish — do these **in order**

For each step: **send the “Info needed” items**, then we implement / you verify.

---

## Already wired in the repo

| Item | Where |
|------|--------|
| Display name (**Pull Hub**) | `src/config/app.ts` → `APP_DISPLAY_NAME` · also `app.json` → `expo.name` (home screen label) |
| Demo banner on/off + text | `SHOW_DEMO_BANNER`, `DEMO_BANNER_TEXT` |
| Terms, Privacy, Promos, Payments | In-app modals — `src/legal/inAppLegalCopy.ts` + `LegalDocumentModal` from Account |
| Mock credits disclaimer | `CREDITS_ARE_MOCK` + `PaymentPortalScreen` (Credits tab) |
| Account footer version | `APP_DISPLAY_NAME` + version from `package.json` |

**App Store:** plan bundle ID, screenshots, and **lawyer review** of `inAppLegalCopy.ts` before submission (`CREDITS_ARE_MOCK` → real IAP when ready).

**Next:** run **Step 5** (device QA) in this doc.

---

### Step 1 — **App identity & branding**

**Done:** **Pull Hub** — `APP_DISPLAY_NAME` + `app.json` `name`.

---

### Step 2 — **Legal (Terms & Privacy)**

**Done:** In-app scrollable modals — no separate hosting required. Copy lives in `src/legal/inAppLegalCopy.ts`. **Before App Store / real money:** have counsel review and add a real **support email** in-app when you have one.

---

### Step 3 — **Demo vs “looks like production”**

**Goal:** Viewers aren’t confused about mock credits / no real shipping.

**Info needed from you**

- Show a **top banner** saying it’s a demo build? **Yes / No**
- Preferred wording: **“Demo”**, **“Beta”**, or **“Preview”**?

**Done in repo:** `src/config/app.ts` → `SHOW_DEMO_BANNER` + `DEMO_BANNER_TEXT`.

---

### Step 4 — **Payments & credits (honest copy)**

**Goal:** No one thinks “Buy credits” is charging their card.

**Info needed from you**

- For this MVP: **credits are always mock / free** (no real IAP)? **Yes / No**
- If **Yes**: we keep a clear line on the Buy Credits sheet (already wired to config).

---

### Step 5 — **End-to-end happy path (manual QA)**

**Goal:** You can demo without crashes.

**Info needed from you**

- Target device: **iOS**, **Android**, or **both** (physical device recommended for QR/camera).

**Checklist (you run on device):**

1. Open app → Home → open a pack → reveal → **Won Prizes** → convert or ship → Account (pull history / tier) updates.
2. **Insufficient credits** path → Buy Credits → credits increase (mock).
3. **Friends** → lookup demo ID `TCG-100001` → add → appears in list.
4. **Friends** → Scan QR (physical device only).

---

### Step 6 — **Build you’ll hand to people**

**Goal:** Installable binary (TestFlight / internal APK) or Expo Go for quick demos.

**Info needed from you**

- Distribution: **Expo Go only**, **TestFlight**, **EAS internal build**, or **store submission**.
- **Bundle ID / package name** you want on Apple & Google (if not `com.anonymous.*`).

**Note:** Changing bundle ID requires Xcode / Play Console setup — confirm before locking.

---

### Step 7 — **Store listing (only if publishing publicly)**

**Info needed from you**

- Age rating, category, screenshots, support URL, privacy policy URL (same as Step 2).
- **Legal review** if real money + sweepstakes-style mechanics.

---

## Current single source of truth

| What            | Where                          |
|-----------------|--------------------------------|
| Display name    | `src/config/app.ts`            |
| Banner on/off   | `src/config/app.ts`            |
| External links  | `src/config/app.ts`            |
| App version     | `package.json` / `app.json`    |

Update `src/config/app.ts` with your answers from Steps 1–4, then run **Step 5** on a real device.
