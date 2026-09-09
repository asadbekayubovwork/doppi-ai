export interface TeamSocial {
  icon: string
  href: string
  label: string
}

export interface TeamMember {
  id: string
  name: string
  initials: string
  /** Optional photo from `public/team`; falls back to the initials disc. */
  image?: string
  socials: TeamSocial[]
}

/**
 * The roster lives here (language-independent) so every layout variant renders
 * the same people; the role and bio come from i18n under `team.roles.<id>` /
 * `team.bios.<id>`.
 */
export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "rifat",
    name: "Rifat Mamayusupov",
    initials: "RM",
    image: "/team/Rifat_mamayusupov.jpg",
    socials: [
      {
        icon: "linkedin",
        href: "https://www.linkedin.com/in/rifat-mamayusupov-ba840428b/",
        label: "LinkedIn",
      },
      { icon: "instagram", href: "#", label: "Instagram" },
    ],
  },
  {
    id: "jaxongir",
    name: "Jaxongir Abduxamidov",
    initials: "JA",
    image: "/team/jaxongir_abduxamidov.jpg",
    socials: [
      {
        icon: "linkedin",
        href: "https://www.linkedin.com/in/jaxongir-abduxamidov/",
        label: "LinkedIn",
      },
      { icon: "github", href: "#", label: "GitHub" },
    ],
  },
  {
    id: "nodirbek",
    name: "Nodirbek Kamalov",
    initials: "NK",
    image: "/team/nodirbek_kamalov.jpg",
    socials: [
      {
        icon: "linkedin",
        href: "https://www.linkedin.com/in/nodirbek-kamalov",
        label: "LinkedIn",
      },
    ],
  },
  {
    id: "asadbek",
    name: "Asadbek Ayubov",
    initials: "AA",
    image: "/team/asadbek_ayubov.jpg",
    socials: [
      {
        icon: "linkedin",
        href: "https://www.linkedin.com/in/asadbek-ayubov/",
        label: "LinkedIn",
      },
    ],
  },
  {
    id: "aziz",
    name: "Abdumalikov Aziz",
    initials: "AA",
    image: "/team/abdumalikov_a.jpg",
    socials: [
      { icon: "linkedin", href: "https://www.linkedin.com/in/abdumalikov/", label: "LinkedIn" },
      { icon: "telegram", href: "#", label: "Telegram" },
    ],
  },
]

/** Placeholder "#" links would open a blank tab, so only real profiles render. */
export const realSocials = (member: TeamMember) =>
  member.socials.filter((s) => s.href && s.href !== "#")
