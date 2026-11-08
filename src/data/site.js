// Coordonnées issues de Desktop-apres. Les profils restent masqués tant que leurs URL ne sont pas renseignées.
export const site = {
  name: "Melvyn Philippon",
  email: import.meta.env.CONTACT_EMAIL || "melvyn.philippon7@gmail.com",
  phone: "06 08 17 58 74",
  phoneHref: "+33608175874",
  location: "Chenebier, France",
  description:
    "Portfolio de Melvyn Philippon, étudiant en BUT MMI, parcours Création numérique. Identité visuelle, design graphique et conception numérique.",
  socials: [
    {
      name: "LinkedIn",
      url: import.meta.env.LINKEDIN_URL,
      icon: "social-linkedin.svg",
    },
    {
      name: "GitHub",
      url: import.meta.env.GITHUB_URL,
      icon: "social-github.svg",
    },
    {
      name: "Behance",
      url: import.meta.env.BEHANCE_URL,
      icon: "social-behance.png",
    },
    {
      name: "Instagram",
      url: import.meta.env.INSTAGRAM_URL,
      icon: "social-instagram.svg",
    },
  ].filter((social) => /^https:\/\//.test(social.url || "")),
};
