export interface SocialLink {
  /** Icon key understood by CIcon. */
  icon: string
  href: string
  label: string
}

/**
 * Company social profiles — the single source for the footer and the service
 * landings. Leave `href` empty for a network with no account yet: empty entries
 * are filtered out, so nothing links to a generic instagram.com/linkedin.com
 * homepage (which reads as "no profile" to anyone checking the site).
 */
export const SOCIALS: SocialLink[] = [
  {
    icon: "twitter",
    href: "https://x.com/doppi_ai",
    label: "X",
  },
  {
    icon: "telegram",
    href: "https://t.me/doppi_ai",
    label: "Telegram",
  },
  {
    icon: "instagram",
    href: "https://instagram.com/doppi_ai",
    label: "Instagram",
  },
  {
    icon: "linkedin",
    href: "",
    label: "LinkedIn",
  },
].filter((social) => social.href)
