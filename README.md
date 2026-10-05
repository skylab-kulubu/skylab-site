<div align="center">
  <br />
  <img src="public/img/skylablogo.svg" alt="SKY LAB Logo" width="160" />
  
  <br />
  
  # SKY LAB
  **Yıldız Technical University Computer Science Club**

  <a href="https://yildizskylab.com" target="_blank">
    <img src="https://img.shields.io/badge/Visit_Official_Website-0A66C2?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Official Website" />
  </a>

  <br />
  <br />

  <p>
    <img src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js 16" />
    <img src="https://img.shields.io/badge/React-19-20232a?style=flat-square&logo=react&logoColor=61DAFB" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5-20232a?style=flat-square&logo=typescript&logoColor=3178C6" alt="TypeScript 5" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS 4" />
  </p>

  ---

  <p align="center" style="max-width: 600px;">
    <i>The official SKY LAB website — presenting the club’s identity, teams, and projects with a modern, fast, and mobile-friendly experience.</i>
  </p>

  <br />

  <p align="center">
    <kbd>Developed by</kbd> <br />
    <br />
    <img src="public/img/teams/weblablogorenkli.svg" alt="WebLab Team Logo" width="120" />
  </p>
</div>

## Local development

```bash
npm install
npm run dev   # http://localhost:3000
```

Local development runs against the **sandbox**, never the production API or realm. `.env.local`:

```env
# The CMS through `npm run dev`'s proxy to the sandbox API (next.config.ts, `next dev` only):
# the editor in the browser only talks to localhost, since the edge does not let
# http://localhost:3000 call the club's hosts cross-origin. Change the port with the dev server's.
CMS_URL=http://localhost:3000/sandbox-api/api
# Core, for the CMS image bridge (server to server)
API_BASE_URL=https://sandbox-api.yildizskylab.com
KEYCLOAK_ISSUER=https://e.yildizskylab.com/realms/e-skylab-sandbox
KEYCLOAK_CLIENT_ID=frontend-main
KEYCLOAK_CLIENT_SECRET=
NEXTAUTH_URL=http://localhost:3000
# openssl rand -base64 32
NEXTAUTH_SECRET=
```

Without `CMS_URL` the server reads the sandbox CMS directly, which is enough for the public pages. The sandbox `frontend-main` client does not accept a localhost redirect URI, so the editor is tried on https://sandbox.yildizskylab.com. The deployed values come from the image build (`.github/workflows/ghcr.yml`) and Dokploy.
