# Inspiration app screenshots — what each screen is for

Reference: **clove**-style Oripa / mystery-pack apps (store → open packs → account). Use this when extending flows (shipping, points, animations).

---

### 1–2. **Won Prizes (ship vs convert)**

- **What it shows:** After a draw, a list of items you won with **checkboxes**.
- **Copy pattern:** *“Choose the prizes you want shipped. Any unselected prizes will be converted into points.”*
- **Behavior:** Checked = **ship**; unchecked = **convert to points** when the user confirms.
- **Footer CTA:** Either **“Convert all into Points”** (with total coins, e.g. 550) or **“N items to ship”** when something is selected.
- **Skip:** Top-right — usually a fast path (we map **Skip → convert to points** in MVP).

---

### 3. **Store / home (Oripa tab)**

- **What it shows:** Brand header, promos (e.g. signup bonus **500pt**), category tabs (TOP, RUSH, Pokémon, etc.), **Filter + Recommended** row, and large **pack / gacha cards** with tags (“New user”, “High chance”, **min guarantee in pt**).
- **Use for:** Home feed layout, pack cards, point (**pt**) language, tab structure (**Store / Oripa / My Page**).

---

### 4. **Trial / simulation modal (“Try Drawing Mystery Packs”)**

- **What it shows:** Centered modal: free trial draw, **warning** that it’s a simulation — **no points consumed**, no real items.
- **Use for:** Distinguishing **trial vs real** opens (you can reuse this pattern if you add a practice mode).

---

### 5. **Convert confirmation**

- **What it shows:** *“Convert items to points”* with **“Points to be Received”** + coin amount, then **Confirm** (red).
- **Use for:** Second step before crediting the wallet — we mirrored this in `WonPrizesModal`’s confirm sheet.

---

### 6. **Registration / rewards applied**

- **What it shows:** Progress stepper, *“Rewards were successfully applied”*, list rows (**500pt gift**, **gacha ticket**, **coupon**).
- **Use for:** Post-signup or post-action success screens — list + icons + chevrons.

---

### 7. **Draw results (trial)**

- **What it shows:** *“Draw Results”* with a **banner**: trial version — **cannot ship or convert to points**.
- **Use for:** Same results layout as live, but with clear **legal/UX** limits on trial.

---

### 8. **My Page / account**

- **What it shows:** Membership card, **Address**, **Bank account**, **Identification**, help, terms.
- **Use for:** Where **shipping** and **payouts** eventually connect (address book, bank for cash-out).

---

### 9. **Interactive opening (“PUSH” / rapid tap)**

- **What it shows:** Minigame phase — **progress bar**, **連打 (rapid tap)** on a **PUSH** button, **Skip**.
- **Use for:** Making the opening feel interactive (optional upgrade to our `PackOpeningModal`).

---

## What we implemented from this

| Inspiration | In repo |
|-------------|---------|
| Won Prizes list + checkbox + convert vs ship | `WonPrizesModal.tsx` |
| Convert confirmation | Nested confirm in `WonPrizesModal` |
| Defer wallet credits until user chooses | `finalizePullFulfillment` in `useAppStore.ts` |
| Pull History hides pending rows | `AccountScreen` filters `fulfillment !== 'pending'` |

Next steps you might add: address picker for ship, API for fulfillment, Lottie/video for step 9-style minigame.
