### How to local update

#### 1️⃣ Build version 1.0.0

```bash
npm run build
```

This creates something like:

```
dist/
 ├─ MyApp-1.0.0.dmg
 ├─ latest-mac.yml
```

#### 2️⃣ Serve update files locally

```bash
cd dist
npx serve .
```

→ http://localhost:3000

---

#### 3️⃣ Point autoUpdater to local server

```ts
autoUpdater.setFeedURL({
  provider: "generic",
  url: "http://localhost:3000",
});
```

---

#### 4️⃣ Bump version → 1.0.1

```json
{
  "version": "1.0.1"
}
```

Build again and replace files in `dist/`.

✅ autoUpdater will now detect an update locally.
