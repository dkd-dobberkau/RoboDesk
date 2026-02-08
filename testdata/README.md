# Test Data

Sample data for testing RoboDesk with 120 contacts and 700+ interactions across the TYPO3 ecosystem.

## Files

| File | Contents | Use |
|------|----------|-----|
| `contacts.csv` | 120 contacts (no interactions) | Import via UI: Data menu > Import CSV |
| `seed.json` | 120 contacts + 700+ interactions | Load via browser console (see below) |
| `generate.mjs` | Generator script | Re-generate with `node generate.mjs` |

## Loading the full dataset (with interactions)

The CSV import only creates contacts without interactions. To load the complete dataset including all timeline entries, open the browser console on the RoboDesk page and run:

```js
fetch('testdata/seed.json')
  .then(r => r.json())
  .then(data => {
    localStorage.setItem('robodesk-contacts', JSON.stringify(data));
    location.reload();
  });
```

Or if running locally, paste the JSON directly:

```js
const data = await fetch('/testdata/seed.json').then(r => r.json());
localStorage.setItem('robodesk-contacts', JSON.stringify(data));
location.reload();
```

## Resetting

To clear all test data:

```js
localStorage.removeItem('robodesk-contacts');
localStorage.removeItem('robodesk-tags');
location.reload();
```

## Re-generating

```bash
node testdata/generate.mjs
```

This creates fresh `contacts.csv` and `seed.json` files with randomized data.
