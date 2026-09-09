export interface SocialLink {
  /** Icon key understood by CIcon. */
  icon: string
  href: string
  label: string
  /** Shown next to the icon in the contact block. */
  handle: string
}

/**
 * Company social profiles — the single source for the footer and the contact
 * section. Leave `href` empty for a network with no account yet: empty entries
 * are filtered out, so nothing links to a generic instagram.com/linkedin.com
 * homepage (which reads as "no profile" to anyone checking the site).
 */
export const SOCIALS: SocialLink[] = [
  {
    icon: "telegram",
    href: "https://t.me/doppi_ai",
    label: "Telegram",
    handle: "@doppi_ai",
  },
  {
    icon: "instagram",
    href: "https://instagram.com/doppi_ai",
    label: "Instagram",
    handle: "@doppi_ai",
  },
  {
    icon: "linkedin",
    href: "",
    label: "LinkedIn",
    handle: "",
  },
].filter((social) => social.href)
