# Home Value Enhancer (Frontend)

React + Vite frontend for the Home Value Enhancer project.

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create a local env file:

```powershell
Copy-Item .env.example .env
```

3. Set backend API URL in `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

4. Start dev server:

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Deploying updated frontend (important)

If an old frontend is still showing, it is usually one of these issues:

- Wrong branch was deployed
- Latest commit was not pushed
- Environment variable still points to old backend or localhost
- CDN/browser cache still serving old build

### Pre-deploy checklist

1. Make sure your latest changes are committed and pushed.
2. Confirm deployment platform is connected to the correct repository and branch.
3. Set environment variable on hosting platform:

```env
VITE_API_BASE_URL=https://your-backend-domain/api
```

4. Trigger a fresh redeploy (not just preview).
5. Hard refresh browser (`Ctrl+Shift+R`) or open in incognito.

### Platform notes

- Vercel: Project Settings -> Environment Variables -> add `VITE_API_BASE_URL`, then Redeploy latest production deployment.
- Netlify: Site Settings -> Environment Variables -> add `VITE_API_BASE_URL`, then Trigger deploy -> Clear cache and deploy site.
- Render Static Site: Environment -> add `VITE_API_BASE_URL`, then Manual Deploy -> Deploy latest commit.

## Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build locally
