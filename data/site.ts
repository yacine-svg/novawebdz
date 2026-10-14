/* Your contact details, in one place. */
export const site = {
  name: "Mohammed Yassine Sekhri",
  firstName: "Yassine",
  studio: "Nova Web Dz",
  /** Final address of the site (used for link previews). Change it once deployed. */
  url: "https://novawebdz.vercel.app",
  whatsapp: "213561913869", // international format, no + and no spaces
  phoneDisplay: "+213 561 91 38 69",
  email: "", // add your e-mail here; the e-mail link stays hidden while it is empty
  instagram: "nova_webdz",
  github: "yacine-svg",
  location: "Algérie",
  /** Your photo: put it in public/ (e.g. public/portrait.jpg) and write "/portrait.jpg" here. */
  portrait: "",
};

export const links = {
  whatsapp: (text: string) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`,
  instagram: `https://www.instagram.com/${site.instagram}/`,
  github: `https://github.com/${site.github}`,
  email: site.email ? `mailto:${site.email}` : "",
};
