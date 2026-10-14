# Nova Web Dz — portfolio "La Rue"

Portfolio of **Mohammed Yassine Sekhri** (Nova Web Dz). A low-poly night street in Algiers: each storefront is a project, scrolling walks the camera down the street, and red and blue threads light up from shop to shop.

- **Next.js 15** (App Router) + TypeScript + Tailwind CSS 4
- **React Three Fiber** + drei for the 3D street (everything built in code: no 3D models to download)
- **GSAP + ScrollTrigger** and **Lenis** smooth scrolling, all running on one clock (GSAP's ticker drives Lenis, ScrollTrigger and the 3D render loop)
- French by default, English toggle (top right)

## Run it on your computer

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Useful test switches (add to the address):

- `?street=2d` forces the light 2D street (what phones and weak computers get)
- `?street=3d` forces the 3D street

## Folders

```
app/                 pages (home, /projets/[slug], 404), metadata, icons, sitemap
components/home/     street, shop card, loader, about, lab, process, contact
components/case/     case-study page and the 3D laptop + phone
components/layout/   header, footer, cursor light + film grain
scene/               the 3D street (plain three.js, no React inside)
  street/            layout, facades, shops, threads, camera path, controller
data/projects.ts     ← your projects (one entry = one storefront + one case study)
data/site.ts         ← your contact details
data/lab.ts          ← AI / data lab cards and the skills web
locales/translations.ts  ← every sentence of the site, in French and English
public/projects/<slug>/  screenshots and clips of each project
public/og/           link-preview images (WhatsApp, Instagram, Facebook...)
```

## Your details

Edit `data/site.ts`:

- `email`: empty for now, so the e-mail link is hidden. Write your address and it appears everywhere.
- `portrait`: put your photo in `public/` (for example `public/portrait.jpg`) and write `"/portrait.jpg"`.
- `url`: the final address of the site, once deployed (used in link previews and the sitemap).

The lab cards (`data/lab.ts`) link to your GitHub profile. When a project has its own repository, replace `repo` with its link.

## Add a shop (a new client)

1. In `data/projects.ts`, copy one project block and change it:
   - `slug`: the address of the case study (`/projets/your-slug`)
   - `name`, `url`, `city`, `year`
   - `kind`: the shop decoration on the street: `barber`, `gym`, `garage`, `restaurant`, `beauty`, `dental`, `realestate`, `wedding` or `travel`
   - `arch`: `round`, `horseshoe`, `pointed` or `square`
   - `sign`: the neon text above the door (short, in capitals)
   - `colors`: `bg` and `ink` for the case study, `accent`, `neon` for the sign, `interiorTop` / `interiorBottom` for the light inside the shop
   - the texts (`type`, `tagline`, `features`, `problem`, `built`, `standouts`, `design`) each have `fr` and `en`
2. Create `public/projects/your-slug/` with:
   - `poster.jpg`: a desktop screenshot, 1280 × 800
   - `mobile.jpg`: a phone screenshot (about 390 × 844, or 2× that)
   - optional clips `clip-1.mp4`, `clip-2.mp4`, `clip-3.mp4` (short, muted, under 6 s) and a `clip-1.jpg` etc. (first frame)
3. Add `public/og/your-slug.jpg` (1200 × 630) for the link preview.

The order of the array is the order of the shops in the street. The street gets longer by itself, the threads, the shop index and the "Projet suivant" link follow. The empty shop "Votre commerce ici" always stays last.

## Replace a screenshot, a clip or a link

- Overwrite the file in `public/projects/<slug>/` with the same name. Keep the sizes above.
- To record a clip from your phone: screen-record the site, then cut 4–6 seconds per feature. A `standouts` entry without `media` shows a "clip coming soon" placeholder.
- A project's live link is its `url` in `data/projects.ts`. It is what opens in the "Tester le site ici" preview (click a screen or the button on the case-study page). The laptop and phone screens themselves show `poster.jpg` and `mobile.jpg`.

Five projects have no clips yet (Barber 16, Atlas Iron, Cirta Motors, Dar Yemma, Nour Beauty). Record them like the four others and add `media: "/projects/<slug>/clip-1.mp4"` to their `standouts`.

## Change a text

Every sentence is in `locales/translations.ts` (French first, English below, with the same structure). Project texts live in `data/projects.ts`.

## Put it online (Vercel)

1. Create a new GitHub repository (for example `novawebdz`) and upload this folder, without `node_modules`.
2. On vercel.com: **Add New → Project**, pick the repository, keep the defaults (Next.js is detected), **Deploy**.
3. The site will be at `https://<project-name>.vercel.app`. If the name is taken, choose another in the project settings, then update `url` in `data/site.ts`.
4. Every push to GitHub redeploys the site.

To check the link previews after deploying, paste the address in a WhatsApp chat with yourself.

## Performance and accessibility

- Phones, small screens, data-saver mode, weak or WebGL-less devices get the 2D street (same scroll story, much lighter). The 3D canvas and the laptop and phone load only when needed, and the live site loads only when someone opens the preview; pixel ratio is capped at 2 and drops when the frame rate does.
- With "reduce motion" turned on in the system settings: no camera flights, no smooth scrolling, fades only.
- Keyboard: ← → move between shops while the street is on screen; the shop index (right side on desktop) and every button are reachable with Tab, with visible focus.

## Checking types

`npm run typecheck`. Type errors do not block a Vercel deploy (see `next.config.ts`), so you can publish first and tidy later.
