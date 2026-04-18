# 🍋 AFK Bypass — Iframe Edition

> **Made by Nanodevs** &nbsp;|&nbsp; Browser Console Script &nbsp;|&nbsp; JavaScript

---

## 📖 Description

**AFK Bypass** is a lightweight, zero-dependency browser console script crafted by **Nanodevs** that lets you earn AFK rewards on sites like [LemonHost](https://lemonhost.me) without keeping the tab active or visible.

Most AFK reward systems pause your session the moment you switch tabs — they do this by listening to browser visibility events inside a sandboxed `afk.html` iframe. This script surgically patches that iframe from the inside:

- 🔒 Locks `document.visibilityState` to `'visible'` permanently
- 🚫 Silently drops all pause-triggering event listeners before they register
- 🌐 Intercepts network requests to block pause signals from reaching the server
- ✅ Lets all credit-earning API calls through normally

The result: your AFK timer keeps ticking, credits keep accumulating, and you can freely use other tabs or minimize the browser. No extensions. No installations. Just paste and go.

> ⚠️ **Disclaimer:** This script is for educational purposes only. Using it may violate the Terms of Service of the target website. Use at your own risk.

---

## ✅ Compatibility

Works on **any site** that uses an `afk.html` iframe for AFK detection, including:

- ✅ `dash.lemonhost.me/dashboard/earn/afk`
- ✅ Any site checking `document.visibilityState` or `document.hidden`
- ✅ Any site using `addEventListener('visibilitychange', ...)` to pause sessions
- ✅ Any site sending credits via `fetch` / `axios` / `XHR` POST requests

---

## 🚀 How to Use

### Step 1 — Open the AFK page

Navigate to the AFK rewards page. For LemonHost:

```
https://dash.lemonhost.me/dashboard/earn/afk
```

### Step 2 — Open DevTools Console

Press `F12` (or right-click anywhere → **Inspect**), then click the **Console** tab.

### Step 3 — Switch to the iframe context ⚠️ CRITICAL

This is the most important step. All bypass attempts fail if you skip this.

1. Look at the **top-left of the Console panel**
2. Click the **`top ▼`** dropdown
3. Select the entry labelled **`afk.html`** (listed under `dash.lemonhost.me`)

> You are now running code inside the iframe — not the parent page.

### Step 4 — Paste and run the script

Copy the entire contents of [`afk-bypass.js`](./afk-bypass.js), paste it into the console, and press **Enter**.

You should see:

```
[AFK] ✅ Bypass active — visibilityState locked, listeners blocked, fetch/XHR patched.
[AFK] Now click "Start AFK" on the page, then switch tabs freely.
[AFK] To stop: call stopAFK()
```

### Step 5 — Click Start AFK

Click the **Start AFK** button on the page. The timer will begin running.

### Step 6 — Switch tabs freely 🎉

You can now switch to other tabs, minimize the browser, or work on other things. The AFK timer will keep running and credits will accumulate as normal.

---

## 🛑 How to Stop

Type the following in the console (while still in the `afk.html` context):

```javascript
stopAFK()
```

Or simply reload the page.

---

## ❓ Troubleshooting

| Problem | Solution |
|---|---|
| AFK still pauses after running script | You ran it in the wrong context — make sure you selected `afk.html` in the dropdown, not `top` |
| `afk.html` not visible in dropdown | Click **Start AFK** first so the iframe loads, then check the dropdown again |
| Network Error toast appears | Normal — temporary server hiccup, not caused by the script |
| Errors about Workers / blob | Ignore — the site blocks Workers via CSP. This script uses `setInterval` instead |
| Credits not increasing | Open the **Network tab** and check for failed POST requests to `/api/user/billingafk/work` |

---

## ⚙️ What Gets Patched

```
document.visibilityState      →  always returns 'visible'
document.hidden               →  always returns false
document.hasFocus()           →  always returns true
EventTarget.addEventListener  →  drops visibilitychange / blur / pagehide listeners
EventTarget.dispatchEvent     →  blocks visibilitychange / blur events
window.fetch                  →  allows credit POSTs, blocks pause signals
XMLHttpRequest.send           →  blocks pause/stop XHR requests
setInterval                   →  simulates mousemove + keypress activity
```

---

## 📁 Files

```
afk-bypass/
├── afk-bypass.js   ← The bypass script — paste this in the console
└── README.md       ← This file
```

---

*Made with 🍋 by **Nanodevs***
