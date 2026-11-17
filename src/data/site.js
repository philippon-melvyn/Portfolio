// Les trois réseaux principaux restent visibles ; leurs liens sont activés via les URL d’environnement.
export const site = {
  name: "Melvyn Philippon",
  email: import.meta.env.CONTACT_EMAIL || "melvyn.philippon@outlook.com",
  phone: "06 08 17 58 74",
  location: "Chenebier, France",
  description:
    "Portfolio de Melvyn Philippon, étudiant en BUT MMI, parcours Création numérique. Identité visuelle, design graphique et conception numérique.",
  socials: [
    {
      name: "LinkedIn",
      url: import.meta.env.LINKEDIN_URL || "https://www.linkedin.com/in/melvyn-philippon-etudiantbutmmi",
    },
    {
      name: "GitHub",
      url: import.meta.env.GITHUB_URL || "https://github.com/philippon-melvyn",
    },
    {
      name: "Behance",
      url: import.meta.env.BEHANCE_URL || "https://www.behance.net/melvynphilippon1",
    },
    {
      name: "Instagram",
      url: import.meta.env.INSTAGRAM_URL,
    },
  ]
    .map((social) => ({
      ...social,
      url: /^https:\/\//.test(social.url || "") ? social.url : undefined,
    }))
    .filter((social) => social.name !== "Instagram" || social.url),
};
