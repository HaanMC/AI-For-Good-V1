# Bootstrap Admin Role

Use a one-time local script to grant admin claim to a UID. Do **not** expose a permanent bootstrap endpoint in production.

## Example script

Create a local script (not committed) such as `scripts/setAdmin.js`:

```js
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import fs from 'node:fs';

const serviceAccount = JSON.parse(fs.readFileSync('./service-account.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });

const uid = process.argv[2];
if (!uid) {
  console.error('Usage: node scripts/setAdmin.js <uid>');
  process.exit(1);
}

await getAuth().setCustomUserClaims(uid, { role: 'admin' });
console.log(`Admin role set for UID ${uid}`);
```

Run it locally:

```bash
node scripts/setAdmin.js <uid>
```

After this, the user must sign out and sign in again to refresh claims.

