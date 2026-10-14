import type { L } from "@/locales/translations";
import type { ArchStyle, ShopKind, ShopSpec } from "@/scene/street/types";

/* ==========================================================================
   ALL THE SHOPS OF THE STREET — one entry per project.
   To add a project: copy an entry, change the texts and colours, put its
   screenshots in public/projects/<slug>/. The street, the cards, the
   case-study page and the "next project" link update on their own.
   ========================================================================== */

export type Project = {
  slug: string;
  name: string;
  url: string; // live site
  city: string;
  year: string;
  /** 3D storefront */
  kind: ShopKind; // animated detail: barber, gym, garage, restaurant, beauty, dental, realestate, wedding, travel
  arch: ArchStyle; // round, horseshoe, pointed, square
  sign: string; // neon sign text
  colors: {
    bg: string; // case-study hero background
    ink: string; // text on bg
    accent: string; // buttons and highlights
    neon: string; // neon sign
    interiorTop: string; // lit shop interior (top → bottom gradient)
    interiorBottom: string;
  };
  type: L;
  tagline: L;
  features: [L, L, L];
  tech: string[];
  problem: L;
  built: L;
  standouts: { title: L; text: L; media?: string }[];
  design: L;
  palette: { name: string; hex: string }[];
  fonts: { name: string; role: L }[];
  /** Images in public/. `mobile` is a phone screenshot (shown when the live site can't be embedded). */
  screens: { mobile?: string; poster: string };
};

const role = {
  title: { fr: "Titres", en: "Headings" },
  body: { fr: "Texte", en: "Body" },
  label: { fr: "Étiquettes", en: "Labels" },
  ar: { fr: "Arabe", en: "Arabic" },
};

export const projects: Project[] = [
  {
    slug: "barber-16",
    name: "Barber 16",
    url: "https://barber-16.vercel.app",
    city: "Alger-Centre",
    year: "2026",
    kind: "barber",
    arch: "round",
    sign: "BARBER 16",
    colors: { bg: "#123B2E", ink: "#F3EADB", accent: "#D2382A", neon: "#FF3B30", interiorTop: "#E8D9BC", interiorBottom: "#1C5140" },
    type: { fr: "Salon de barbier", en: "Barbershop" },
    tagline: {
      fr: "Un salon de quartier qui remplit ses fauteuils depuis WhatsApp.",
      en: "A neighbourhood barbershop that fills its chairs through WhatsApp.",
    },
    features: [
      { fr: "Essai de coupe avec curseur avant / après", en: "Haircut preview with a before / after slider" },
      { fr: "Carte des prestations qui remplit un ticket", en: "Service menu that fills a ticket" },
      { fr: "Réservation du fauteuil envoyée sur WhatsApp", en: "Chair booking sent to WhatsApp" },
    ],
    tech: ["HTML", "CSS", "JavaScript", "Lenis"],
    problem: {
      fr: "Le salon prend ses rendez-vous au téléphone, pendant qu'il coupe. Les clients ne savent pas quelle coupe demander ni combien elle coûte, et les créneaux du soir partent en double.",
      en: "The shop takes bookings by phone while cutting hair. Clients don't know which cut to ask for or what it costs, and evening slots get double-booked.",
    },
    built: {
      fr: "Un site d'une page, rapide sur téléphone : la carte avec les prix, un essai de coupe pour montrer le résultat, et un ticket qui se remplit pendant qu'on choisit, puis part sur WhatsApp avec le barbier et l'heure.",
      en: "A fast one-page site for phones: the price list, a haircut preview to show the result, and a ticket that fills in as you choose, then goes to WhatsApp with the barber and the time.",
    },
    standouts: [
      {
        title: { fr: "Essayez votre coupe", en: "Try your cut" },
        text: {
          fr: "On choisit une coupe et une barbe, puis on glisse la barre pour comparer avec l'avant. Le client arrive en sachant ce qu'il veut.",
          en: "Pick a cut and a beard style, then drag the bar to compare with the before. Clients arrive knowing what they want.",
        },
      },
      {
        title: { fr: "Le ticket", en: "The ticket" },
        text: {
          fr: "Chaque prestation ajoutée s'imprime sur un ticket de caisse, avec le total en dinars.",
          en: "Every service added prints on a receipt, with the total in dinars.",
        },
      },
      {
        title: { fr: "Les barbiers", en: "The barbers" },
        text: {
          fr: "Chaque barbier a sa fiche et ses spécialités ; la demande part au bon fauteuil.",
          en: "Each barber has a profile and specialties; the request reaches the right chair.",
        },
      },
    ],
    design: {
      fr: "Crème, vert bouteille et rouge enseigne : les couleurs d'un vieux salon d'Alger-Centre, avec une typo condensée comme une devanture peinte.",
      en: "Cream, bottle green and sign red: the colours of an old Algiers barbershop, with a condensed typeface like a painted shopfront.",
    },
    palette: [
      { name: "Crème", hex: "#F3EADB" },
      { name: "Vert", hex: "#123B2E" },
      { name: "Rouge", hex: "#D2382A" },
      { name: "Laiton", hex: "#C9A24D" },
      { name: "Encre", hex: "#16130F" },
    ],
    fonts: [
      { name: "Big Shoulders Display", role: role.title },
      { name: "Barlow", role: role.body },
      { name: "Space Mono", role: role.label },
    ],
    screens: { mobile: "/projects/barber-16/mobile.jpg", poster: "/projects/barber-16/poster.jpg" },
  },
  {
    slug: "atlas-iron",
    name: "Atlas Iron",
    url: "https://atlas-iron.vercel.app",
    city: "Alger",
    year: "2026",
    kind: "gym",
    arch: "square",
    sign: "ATLAS IRON",
    colors: { bg: "#14161A", ink: "#ECEDF0", accent: "#2F4BFF", neon: "#3D6BFF", interiorTop: "#B9C6F2", interiorBottom: "#1B2240" },
    type: { fr: "Salle de sport", en: "Gym" },
    tagline: {
      fr: "Une salle de musculation qui vend ses abonnements avant la première visite.",
      en: "A gym that sells memberships before the first visit.",
    },
    features: [
      { fr: "Planning de la semaine, cours réservé sur WhatsApp", en: "Weekly timetable, classes booked on WhatsApp" },
      { fr: "Calculateur d'abonnement au prix en direct", en: "Membership calculator with live pricing" },
      { fr: "Première séance offerte en un formulaire", en: "Free first session in one form" },
    ],
    tech: ["HTML", "CSS", "JavaScript", "Lenis"],
    problem: {
      fr: "Les prix changent selon la formule et la durée, et l'accueil répète les mêmes réponses toute la journée. Les débutants hésitent à pousser la porte.",
      en: "Prices change with the plan and duration, and the front desk repeats the same answers all day. Beginners hesitate to walk in.",
    },
    built: {
      fr: "Un site brut, comme la salle : programmes, planning cliquable, calculateur qui montre l'économie selon la durée, coachs et FAQ. Chaque bouton ouvre WhatsApp avec le bon message.",
      en: "A raw site, like the gym itself: programmes, a clickable timetable, a calculator showing the savings by duration, coaches and FAQ. Every button opens WhatsApp with the right message.",
    },
    standouts: [
      {
        title: { fr: "Le planning", en: "The timetable" },
        text: {
          fr: "On touche un cours dans la semaine et la réservation part sur WhatsApp, avec le jour et l'heure.",
          en: "Tap a class in the week and the booking goes to WhatsApp with the day and time.",
        },
      },
      {
        title: { fr: "Votre abonnement", en: "Your membership" },
        text: {
          fr: "Formule, durée, options : le prix se calcule en direct et l'économie s'affiche. Plus besoin de demander « c'est combien ? ».",
          en: "Plan, duration, extras: the price updates live and shows the savings. No more 'how much?'.",
        },
      },
      {
        title: { fr: "1ʳᵉ séance offerte", en: "Free first session" },
        text: {
          fr: "Un formulaire court pour les débutants, qui transforme une hésitation en visite.",
          en: "A short form for beginners that turns hesitation into a visit.",
        },
      },
    ],
    design: {
      fr: "Gris béton, noir et bleu cobalt électrique ; Anton en très grand, comme les chiffres peints sur les murs d'une salle.",
      en: "Concrete grey, black and electric cobalt; Anton set huge, like numbers painted on gym walls.",
    },
    palette: [
      { name: "Béton", hex: "#ECEDF0" },
      { name: "Noir", hex: "#14161A" },
      { name: "Cobalt", hex: "#2F4BFF" },
      { name: "Rouge", hex: "#E5484D" },
    ],
    fonts: [
      { name: "Anton", role: role.title },
      { name: "Archivo", role: role.body },
      { name: "IBM Plex Mono", role: role.label },
    ],
    screens: { mobile: "/projects/atlas-iron/mobile.jpg", poster: "/projects/atlas-iron/poster.jpg" },
  },
  {
    slug: "cirta-motors",
    name: "Cirta Motors",
    url: "https://cirta-motors.vercel.app",
    city: "Constantine · Alger · Oran",
    year: "2026",
    kind: "garage",
    arch: "square",
    sign: "CIRTA MOTORS",
    colors: { bg: "#0A0A0B", ink: "#ECE8E1", accent: "#FFB547", neon: "#FFB547", interiorTop: "#55555F", interiorBottom: "#0A0A0B" },
    type: { fr: "Location de voitures", en: "Car rental" },
    tagline: {
      fr: "Une agence de location premium qui donne envie de prendre la route.",
      en: "A premium rental agency that makes you want to hit the road.",
    },
    features: [
      { fr: "Flotte filtrable avec animations fluides", en: "Filterable fleet with smooth animations" },
      { fr: "Fiche voiture avec modèle 3D", en: "Car pages with a 3D model" },
      { fr: "Réservation en étapes avec confirmation", en: "Step-by-step booking with confirmation" },
    ],
    tech: ["Next.js", "TypeScript", "Tailwind CSS", "GSAP", "Lenis", "model-viewer"],
    problem: {
      fr: "Les clients comparent les agences sur Facebook avec des photos floues et des prix « en privé ». L'agence perd ceux qui veulent réserver tout de suite.",
      en: "Clients compare agencies on Facebook with blurry photos and 'DM for price'. The agency loses people who want to book right away.",
    },
    built: {
      fr: "Une application Next.js : flotte avec filtres et tri animés, une page par voiture avec modèle 3D et tarifs par durée, réservation en étapes, et des agences à Constantine, Alger et Oran.",
      en: "A Next.js app: fleet with animated filters and sorting, a page per car with a 3D model and prices by duration, step-by-step booking, and branches in Constantine, Algiers and Oran.",
    },
    standouts: [
      {
        title: { fr: "La flotte épinglée", en: "The pinned fleet" },
        text: {
          fr: "Les voitures défilent à l'horizontale pendant qu'on descend la page, puis se filtrent sans saut grâce à GSAP Flip.",
          en: "Cars slide horizontally as you scroll, then filter without jumps thanks to GSAP Flip.",
        },
      },
      {
        title: { fr: "Le modèle 3D", en: "The 3D model" },
        text: {
          fr: "Chaque fiche montre la voiture en 3D, à tourner du doigt, avec les caractéristiques et le prix par jour.",
          en: "Each car page shows a 3D model you can spin, with specs and the daily price.",
        },
      },
      {
        title: { fr: "La réservation", en: "The booking" },
        text: {
          fr: "Dates, agence, options, conducteur : le total se met à jour à chaque étape, jusqu'à la confirmation.",
          en: "Dates, branch, extras, driver: the total updates at every step, up to the confirmation.",
        },
      },
    ],
    design: {
      fr: "Nuit profonde et ambre de phares, typographie haute et étroite : l'ambiance d'un showroom le soir.",
      en: "Deep night and headlight amber, tall narrow type: a showroom at night.",
    },
    palette: [
      { name: "Nuit", hex: "#0A0A0B" },
      { name: "Acier", hex: "#1A1A1D" },
      { name: "Os", hex: "#ECE8E1" },
      { name: "Ambre", hex: "#FFB547" },
    ],
    fonts: [
      { name: "Antonio", role: role.title },
      { name: "Manrope", role: role.body },
      { name: "IBM Plex Mono", role: role.label },
    ],
    screens: { mobile: "/projects/cirta-motors/mobile.jpg", poster: "/projects/cirta-motors/poster.jpg" },
  },
  {
    slug: "dar-yemma",
    name: "Dar Yemma",
    url: "https://dar-yemma.vercel.app",
    city: "Alger",
    year: "2026",
    kind: "restaurant",
    arch: "round",
    sign: "DAR YEMMA",
    colors: { bg: "#0E2654", ink: "#F3F5F8", accent: "#D9952B", neon: "#FFB23F", interiorTop: "#F2C27A", interiorBottom: "#6A3412" },
    type: { fr: "Restaurant traditionnel", en: "Traditional restaurant" },
    tagline: { fr: "La cuisine de la maison, commandée en trois étapes.", en: "Home cooking, ordered in three steps." },
    features: [
      { fr: "Menu par catégories, en français et en arabe", en: "Menu by category, in French and Arabic" },
      { fr: "Commande en 3 étapes envoyée sur WhatsApp", en: "3-step order sent to WhatsApp" },
      { fr: "Page fêtes et événements pour le traiteur", en: "Events page for catering" },
    ],
    tech: ["HTML", "CSS", "JavaScript"],
    problem: {
      fr: "Les commandes arrivent en vocal WhatsApp, sans adresse ni quantités claires. Le menu n'existe qu'en photo d'un tableau.",
      en: "Orders arrive as WhatsApp voice notes, with no clear address or quantities. The menu only exists as a photo of a board.",
    },
    built: {
      fr: "Un menu en ligne clair, un panier simple et une commande en trois étapes qui arrive sur WhatsApp déjà rédigée : plats, quantités, adresse, heure.",
      en: "A clear online menu, a simple cart and a three-step order that lands on WhatsApp already written: dishes, quantities, address, time.",
    },
    standouts: [
      {
        title: { fr: "Dans nos assiettes", en: "On our plates" },
        text: {
          fr: "Les plats par catégorie, avec prix et mentions « fait maison ». On ajoute au panier en un geste.",
          en: "Dishes by category with prices and 'homemade' tags. Add to cart in one tap.",
        },
      },
      {
        title: { fr: "Commander en 3 étapes", en: "Order in 3 steps" },
        text: {
          fr: "Panier, livraison ou à emporter, coordonnées : la commande part sur WhatsApp, lisible du premier coup.",
          en: "Cart, delivery or pickup, contact details: the order goes to WhatsApp, readable at first glance.",
        },
      },
      {
        title: { fr: "Fêtes & événements", en: "Parties & events" },
        text: {
          fr: "Une page pour les mariages et les fêtes, qui amène des commandes de traiteur plus importantes.",
          en: "A page for weddings and parties that brings in larger catering orders.",
        },
      },
    ],
    design: {
      fr: "Bleu cobalt des faïences et safran des épices, Rakkas pour les titres : une table familiale algéroise.",
      en: "Cobalt blue from the tiles and saffron from the spices, Rakkas for headings: an Algiers family table.",
    },
    palette: [
      { name: "Cobalt", hex: "#1E4E9C" },
      { name: "Safran", hex: "#D9952B" },
      { name: "Menthe", hex: "#2C7A69" },
      { name: "Nuit", hex: "#0E2654" },
    ],
    fonts: [
      { name: "Rakkas", role: role.title },
      { name: "Figtree", role: role.body },
      { name: "Noto Kufi Arabic", role: role.ar },
    ],
    screens: { mobile: "/projects/dar-yemma/mobile.jpg", poster: "/projects/dar-yemma/poster.jpg" },
  },
  {
    slug: "nour-beauty",
    name: "Nour Beauty",
    url: "https://nourbeauty.vercel.app",
    city: "58 wilayas",
    year: "2026",
    kind: "beauty",
    arch: "pointed",
    sign: "NOUR BEAUTY",
    colors: { bg: "#4A1D3F", ink: "#FBF4F3", accent: "#E0528E", neon: "#FF5FA2", interiorTop: "#F0D2D8", interiorBottom: "#6B2C5A" },
    type: { fr: "Cosmétiques naturels", en: "Natural cosmetics" },
    tagline: {
      fr: "Une boutique en ligne de soins du Maghreb, livrés dans les 58 wilayas.",
      en: "An online shop for Maghreb skincare, delivered to all 58 wilayas.",
    },
    features: [
      { fr: "Catalogue avec panier", en: "Catalogue with a cart" },
      { fr: "Routine de soins guidée", en: "Guided skincare routine" },
      { fr: "Paiement à la livraison, commande sur WhatsApp", en: "Cash on delivery, order on WhatsApp" },
    ],
    tech: ["HTML", "CSS", "JavaScript"],
    problem: {
      fr: "La marque vend sur Instagram en répondant un par un au même « prix ? ». Impossible de montrer les ingrédients ni de prendre une commande complète.",
      en: "The brand sells on Instagram, answering 'price?' one message at a time. No way to show ingredients or take a full order.",
    },
    built: {
      fr: "Une boutique légère sans paiement en ligne : produits, ingrédients (figue de Barbarie, nigelle, eau de rose, ghassoul), une routine en étapes et un panier qui envoie la commande et la wilaya sur WhatsApp.",
      en: "A lightweight shop without online payment: products, ingredients (prickly pear, nigella, rose water, ghassoul), a step-by-step routine and a cart that sends the order and wilaya to WhatsApp.",
    },
    standouts: [
      {
        title: { fr: "Nos soins", en: "Our products" },
        text: {
          fr: "Chaque produit avec son prix, son usage et ses ingrédients, ajouté au panier sans quitter la page.",
          en: "Each product with its price, use and ingredients, added to the cart without leaving the page.",
        },
      },
      {
        title: { fr: "Ce qui pousse chez nous", en: "What grows here" },
        text: {
          fr: "Les ingrédients locaux racontés simplement, pour vendre la qualité plutôt que le prix.",
          en: "Local ingredients explained simply, to sell quality rather than price.",
        },
      },
      {
        title: { fr: "Partout en Algérie", en: "All over Algeria" },
        text: {
          fr: "Livraison dans les 58 wilayas, paiement à la livraison : la commande part sur WhatsApp avec l'adresse.",
          en: "Delivery to all 58 wilayas, cash on delivery: the order goes to WhatsApp with the address.",
        },
      },
    ],
    design: {
      fr: "Prune, figue et touches d'or sur un rose poudré ; Bodoni Moda pour l'élégance d'une étiquette de flacon.",
      en: "Plum, fig and touches of gold on powder pink; Bodoni Moda for bottle-label elegance.",
    },
    palette: [
      { name: "Prune", hex: "#4A1D3F" },
      { name: "Figue", hex: "#B3306B" },
      { name: "Olive", hex: "#5F7F63" },
      { name: "Or", hex: "#C49A4F" },
      { name: "Poudre", hex: "#F6E3E4" },
    ],
    fonts: [
      { name: "Bodoni Moda", role: role.title },
      { name: "Outfit", role: role.body },
      { name: "Noto Kufi Arabic", role: role.ar },
    ],
    screens: { mobile: "/projects/nour-beauty/mobile.jpg", poster: "/projects/nour-beauty/poster.jpg" },
  },
  {
    slug: "cabinet-ibtissama",
    name: "Cabinet Ibtissama",
    url: "https://cabinet-ibtissama.vercel.app",
    city: "Alger",
    year: "2026",
    kind: "dental",
    arch: "round",
    sign: "IBTISSAMA",
    colors: { bg: "#124A45", ink: "#F4F7F6", accent: "#E8684A", neon: "#FF7A5C", interiorTop: "#DCECE7", interiorBottom: "#124A45" },
    type: { fr: "Cabinet dentaire", en: "Dental clinic" },
    tagline: { fr: "Un cabinet qui rassure avant même le premier rendez-vous.", en: "A clinic that reassures before the first appointment." },
    features: [
      { fr: "Tarifs affichés avant la consultation", en: "Prices shown before the visit" },
      { fr: "Rendez-vous en 4 étapes, en moins d'une minute", en: "Booking in 4 steps, in under a minute" },
      { fr: "Section enfants, carte Chifa et FAQ", en: "Kids section, Chifa card and FAQ" },
    ],
    tech: ["HTML", "CSS", "JavaScript"],
    problem: {
      fr: "Les patients appellent pour les prix et les horaires, et beaucoup repoussent le rendez-vous par peur. Le secrétariat est débordé.",
      en: "Patients call about prices and hours, and many put off the visit out of fear. The front desk is overwhelmed.",
    },
    built: {
      fr: "Un site doux et clair : prix par soin, prise de rendez-vous (soin, jour, heure, infos) avec les créneaux pris barrés, demande envoyée sur WhatsApp, et une section pour rassurer les parents. Mode sombre inclus.",
      en: "A calm, clear site: prices per treatment, booking (treatment, day, time, details) with taken slots crossed out, the request sent to WhatsApp, and a section to reassure parents. Dark mode included.",
    },
    standouts: [
      {
        title: { fr: "Des prix clairs", en: "Clear prices" },
        text: {
          fr: "Consultation, détartrage, soins : les tarifs indicatifs en dinars, avant de venir.",
          en: "Check-up, scaling, fillings: indicative prices in dinars, before coming in.",
        },
        media: "/projects/cabinet-ibtissama/clip-1.mp4",
      },
      {
        title: { fr: "Rendez-vous en moins d'une minute", en: "Booked in under a minute" },
        text: {
          fr: "Soin, jour, heure, coordonnées. Les créneaux déjà pris sont barrés : pas d'aller-retour au téléphone.",
          en: "Treatment, day, time, details. Taken slots are crossed out: no back-and-forth on the phone.",
        },
        media: "/projects/cabinet-ibtissama/clip-2.mp4",
      },
      {
        title: { fr: "Demande envoyée sur WhatsApp", en: "Request sent on WhatsApp" },
        text: {
          fr: "Le récapitulatif part déjà rédigé ; le cabinet confirme d'un message.",
          en: "The summary goes out already written; the clinic confirms in one message.",
        },
        media: "/projects/cabinet-ibtissama/clip-3.mp4",
      },
    ],
    design: {
      fr: "Vert pin apaisant et corail chaleureux, DM Serif Display pour une touche humaine.",
      en: "Calming pine green and warm coral, DM Serif Display for a human touch.",
    },
    palette: [
      { name: "Pin", hex: "#124A45" },
      { name: "Corail", hex: "#E8684A" },
      { name: "Sauge", hex: "#E3EFEB" },
      { name: "Or", hex: "#C99A3D" },
    ],
    fonts: [
      { name: "DM Serif Display", role: role.title },
      { name: "Plus Jakarta Sans", role: role.body },
      { name: "Noto Kufi Arabic", role: role.ar },
    ],
    screens: { mobile: "/projects/cabinet-ibtissama/mobile.jpg", poster: "/projects/cabinet-ibtissama/poster.jpg" },
  },
  {
    slug: "bayt-immobilier",
    name: "Bayt Immobilier",
    url: "https://bayt-immobilier.vercel.app",
    city: "Alger · Oran",
    year: "2026",
    kind: "realestate",
    arch: "square",
    sign: "BAYT IMMOBILIER",
    colors: { bg: "#1F4F9E", ink: "#F6F7F4", accent: "#F2C14E", neon: "#F2C14E", interiorTop: "#DCE6F4", interiorBottom: "#163C7A" },
    type: { fr: "Agence immobilière", en: "Real estate agency" },
    tagline: {
      fr: "Des annonces qu'on cherche comme on parle, en centimes ou en dinars.",
      en: "Listings you search the way you talk, in centimes or dinars.",
    },
    features: [
      { fr: "Recherche en une phrase et carte des biens", en: "One-sentence search and a map of listings" },
      { fr: "Prix au m² par quartier et simulateur de crédit", en: "Price per m² by area and a loan simulator" },
      { fr: "Une page par bien, partageable sur WhatsApp", en: "A page per listing, shareable on WhatsApp" },
    ],
    tech: ["HTML", "CSS", "JavaScript", "Node.js", "Leaflet", "Lenis"],
    problem: {
      fr: "Les annonces circulent en photos sur les groupes Facebook, sans prix clair (« 3 milliards » ou « 30 millions » ?) ni adresse. Les visites inutiles s'enchaînent.",
      en: "Listings circulate as photos in Facebook groups, with unclear prices ('3 milliards' or '30 millions'?) and no address. Pointless visits pile up.",
    },
    built: {
      fr: "Un site multi-pages généré par un petit script Node : recherche en phrase, filtres et carte, une page par bien avec plan, papiers et crédit, prix au m² par quartier, et un bouton pour passer des centimes aux dinars.",
      en: "A multi-page site generated by a small Node script: sentence search, filters and map, a page per listing with floor plan, paperwork and loan, price per m² by area, and a switch between centimes and dinars.",
    },
    standouts: [
      {
        title: { fr: "« Je cherche un F3 à Hydra »", en: "'I'm looking for a 3-room in Hydra'" },
        text: {
          fr: "La recherche se lit comme une phrase : type, achat ou location, quartier, budget.",
          en: "The search reads like a sentence: type, buy or rent, area, budget.",
        },
        media: "/projects/bayt-immobilier/clip-1.mp4",
      },
      {
        title: { fr: "Prix au m² par quartier", en: "Price per m² by area" },
        text: {
          fr: "Un classement des quartiers d'après les ventes de l'agence, pour savoir si un prix est juste.",
          en: "Areas ranked from the agency's sales, to tell whether a price is fair.",
        },
        media: "/projects/bayt-immobilier/clip-2.mp4",
      },
      {
        title: { fr: "Combien coûtera votre crédit ?", en: "What will your loan cost?" },
        text: {
          fr: "Prix, apport, durée, taux : la mensualité se calcule pendant qu'on glisse les curseurs.",
          en: "Price, down payment, duration, rate: the monthly payment updates as you drag the sliders.",
        },
        media: "/projects/bayt-immobilier/clip-3.mp4",
      },
    ],
    design: {
      fr: "Bleu des volets d'Alger, blanc chaux et une touche de mimosa ; Sofia Sans, nette et lisible.",
      en: "Algiers shutter blue, lime white and a touch of mimosa; Sofia Sans, crisp and readable.",
    },
    palette: [
      { name: "Volet", hex: "#1F4F9E" },
      { name: "Chaux", hex: "#F6F7F4" },
      { name: "Mimosa", hex: "#F2C14E" },
      { name: "Encre", hex: "#0F1B2D" },
    ],
    fonts: [
      { name: "Sofia Sans", role: role.body },
      { name: "Sofia Sans Condensed", role: role.title },
      { name: "Noto Kufi Arabic", role: role.ar },
    ],
    screens: { mobile: "/projects/bayt-immobilier/mobile.jpg", poster: "/projects/bayt-immobilier/poster.jpg" },
  },
  {
    slug: "palais-el-andalous",
    name: "Palais El Andalous",
    url: "https://palais-el-andalous.vercel.app",
    city: "Tlemcen",
    year: "2026",
    kind: "wedding",
    arch: "horseshoe",
    sign: "PALAIS EL ANDALOUS",
    colors: { bg: "#0F3D33", ink: "#F7F1E6", accent: "#CDAE6C", neon: "#E9C77A", interiorTop: "#EBD3A0", interiorBottom: "#0F3D33" },
    type: { fr: "Salle des fêtes", en: "Wedding hall" },
    tagline: {
      fr: "Une salle de mariage qu'on visite à 360° depuis son canapé.",
      en: "A wedding hall you can tour in 360° from your sofa.",
    },
    features: [
      { fr: "Visite virtuelle de la salle à 360°", en: "360° virtual tour of the hall" },
      { fr: "Calendrier des dates libres", en: "Calendar of free dates" },
      { fr: "Configurateur de soirée avec devis", en: "Event configurator with a quote" },
    ],
    tech: ["HTML", "CSS", "JavaScript", "Pannellum", "Lenis"],
    problem: {
      fr: "Les familles viennent de loin pour voir la salle et demander si leur date est libre. Beaucoup repartent : la date est prise ou le budget flou.",
      en: "Families travel far to see the hall and ask whether their date is free. Many leave: the date is taken or the budget unclear.",
    },
    built: {
      fr: "Un site élégant : visite 360° (grande salle, scène, entrée), calendrier des disponibilités et configurateur (invités, formule, menu, options) qui calcule une estimation et l'envoie sur WhatsApp.",
      en: "An elegant site: 360° tour (main hall, stage, entrance), an availability calendar and a configurator (guests, package, menu, extras) that calculates an estimate and sends it to WhatsApp.",
    },
    standouts: [
      {
        title: { fr: "Entrez dans la salle", en: "Step inside" },
        text: {
          fr: "La salle, la scène et l'entrée en 360°, à explorer du doigt avant de se déplacer.",
          en: "The hall, the stage and the entrance in 360°, to explore with a finger before travelling.",
        },
        media: "/projects/palais-el-andalous/clip-1.mp4",
      },
      {
        title: { fr: "Votre date est-elle libre ?", en: "Is your date free?" },
        text: {
          fr: "Le calendrier montre les dates libres, en haute saison et réservées. Un clic garde la date de côté.",
          en: "The calendar shows free, high-season and booked dates. One click puts a date aside.",
        },
        media: "/projects/palais-el-andalous/clip-2.mp4",
      },
      {
        title: { fr: "Votre soirée, votre estimation", en: "Your evening, your estimate" },
        text: {
          fr: "Invités, formule, menu, options : le total se calcule en direct et la demande part sur WhatsApp.",
          en: "Guests, package, menu, extras: the total updates live and the request goes to WhatsApp.",
        },
        media: "/projects/palais-el-andalous/clip-3.mp4",
      },
    ],
    design: {
      fr: "Émeraude profonde, or et ivoire, Cormorant Garamond en italique : le raffinement andalou de Tlemcen.",
      en: "Deep emerald, gold and ivory, Cormorant Garamond italics: the Andalusian refinement of Tlemcen.",
    },
    palette: [
      { name: "Émeraude", hex: "#0F3D33" },
      { name: "Or", hex: "#B08A43" },
      { name: "Or clair", hex: "#E9D7A6" },
      { name: "Ivoire", hex: "#F7F1E6" },
    ],
    fonts: [
      { name: "Cormorant Garamond", role: role.title },
      { name: "Jost", role: role.body },
      { name: "Amiri", role: role.ar },
    ],
    screens: { mobile: "/projects/palais-el-andalous/mobile.jpg", poster: "/projects/palais-el-andalous/poster.jpg" },
  },
  {
    slug: "safa-voyages",
    name: "Safa Voyages",
    url: "https://safa-voyages.vercel.app",
    city: "Constantine",
    year: "2026",
    kind: "travel",
    arch: "pointed",
    sign: "SAFA VOYAGES",
    colors: { bg: "#0E1A33", ink: "#F3EBDC", accent: "#D9B872", neon: "#E2C27F", interiorTop: "#34477A", interiorBottom: "#08111F" },
    type: { fr: "Agence de voyages · Omra", en: "Travel agency · Umrah" },
    tagline: {
      fr: "Des départs pour l'Omra clairs, places restantes et prix compris.",
      en: "Clear Umrah departures, with seats left and prices included.",
    },
    features: [
      { fr: "Départs filtrés par ville, mois et budget", en: "Departures filtered by city, month and budget" },
      { fr: "Programme jour par jour et prix par chambre", en: "Day-by-day itinerary and price per room" },
      { fr: "Réservation avec carte d'embarquement, sur WhatsApp", en: "Booking with a boarding pass, on WhatsApp" },
    ],
    tech: ["HTML", "CSS", "JavaScript", "Lenis"],
    problem: {
      fr: "Les pèlerins, souvent âgés, demandent les mêmes informations au téléphone : dates, hôtels, distance du Haram, places restantes, documents. L'agence répond à tout à la main.",
      en: "Pilgrims, often older, ask the same questions by phone: dates, hotels, distance to the Haram, seats left, documents. The agency answers everything by hand.",
    },
    built: {
      fr: "Un site lisible à tout âge : départs avec barres de places restantes, fiche voyage (chambre de 4, 3 ou 2, programme, hôtels), réservation en 4 étapes avec carte d'embarquement, paiement en 3 fois et liste des documents à cocher.",
      en: "A site readable at any age: departures with seats-left bars, trip pages (room for 4, 3 or 2, itinerary, hotels), 4-step booking with a boarding pass, pay in 3 and a document checklist.",
    },
    standouts: [
      {
        title: { fr: "Trouver un départ", en: "Find a departure" },
        text: {
          fr: "Ville, mois, durée, budget : les départs se filtrent, avec les places restantes qui passent à l'orange puis au rouge.",
          en: "City, month, duration, budget: departures filter instantly, with seats left turning orange then red.",
        },
        media: "/projects/safa-voyages/clip-1.mp4",
      },
      {
        title: { fr: "La fiche du voyage", en: "The trip page" },
        text: {
          fr: "Chambre de 4, 3 ou 2 : le prix change en direct. Programme jour par jour, hôtels et distance du Haram.",
          en: "Room for 4, 3 or 2: the price changes live. Day-by-day itinerary, hotels and distance to the Haram.",
        },
        media: "/projects/safa-voyages/clip-2.mp4",
      },
      {
        title: { fr: "La carte d'embarquement", en: "The boarding pass" },
        text: {
          fr: "Pendant la réservation, une carte d'embarquement se remplit ; la demande part sur WhatsApp avec le total et l'acompte.",
          en: "During booking, a boarding pass fills in; the request goes to WhatsApp with the total and deposit.",
        },
        media: "/projects/safa-voyages/clip-3.mp4",
      },
    ],
    design: {
      fr: "Bleu nuit, sable et or, motifs géométriques et arches ; Marcellus pour les titres et Atkinson Hyperlegible pour être lu sans lunettes.",
      en: "Night blue, sand and gold, geometric patterns and arches; Marcellus for headings and Atkinson Hyperlegible to be read without glasses.",
    },
    palette: [
      { name: "Nuit", hex: "#0E1A33" },
      { name: "Sable", hex: "#F3EBDC" },
      { name: "Or", hex: "#A97F33" },
      { name: "Or clair", hex: "#D9B872" },
    ],
    fonts: [
      { name: "Marcellus", role: role.title },
      { name: "Atkinson Hyperlegible Next", role: role.body },
      { name: "Aref Ruqaa", role: role.ar },
    ],
    screens: { mobile: "/projects/safa-voyages/mobile.jpg", poster: "/projects/safa-voyages/poster.jpg" },
  },
];

/** The last storefront of the street: empty, waiting for the next client. */
export const emptyShop = {
  slug: "votre-commerce",
  sign: "VOTRE COMMERCE ICI",
  colors: { neon: "#F4F7FF", accent: "#FF2E4D", interiorTop: "#2B2F3D", interiorBottom: "#0B0D14" },
};

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

export const nextProject = (slug: string) => {
  const i = projects.findIndex((p) => p.slug === slug);
  return projects[(i + 1) % projects.length];
};

/** What the 3D street needs, in street order (the empty shop last). */
export const shopSpecs: ShopSpec[] = [
  ...projects.map((p) => ({
    slug: p.slug,
    sign: p.sign,
    kind: p.kind,
    arch: p.arch,
    neon: p.colors.neon,
    accent: p.colors.accent,
    interiorTop: p.colors.interiorTop,
    interiorBottom: p.colors.interiorBottom,
    shutter: p.kind === "realestate" ? p.colors.bg : undefined,
  })),
  {
    slug: emptyShop.slug,
    sign: emptyShop.sign,
    kind: "empty" as const,
    arch: "round" as const,
    neon: emptyShop.colors.neon,
    accent: emptyShop.colors.accent,
    interiorTop: emptyShop.colors.interiorTop,
    interiorBottom: emptyShop.colors.interiorBottom,
  },
];
