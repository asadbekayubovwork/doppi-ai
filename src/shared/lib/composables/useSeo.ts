import { computed, toValue, type MaybeRefOrGetter } from "vue"
import { useI18n } from "vue-i18n"
import { useHead } from "@unhead/vue"
import { OG_IMAGE, SITE_NAME, absoluteUrl } from "@/shared/config/site"
import { findSeoPage, ogImageFor } from "@/shared/config/seoPages"

/**
 * Title, description, canonical link and social tags for a page listed in
 * SEO_PAGES. The build writes the same tags into each page's static HTML for
 * crawlers (build/seo.ts); this keeps them right during client-side navigation
 * and when the visitor switches language.
 */
export function useSeo(path: MaybeRefOrGetter<string>) {
  const { t } = useI18n()

  const page = computed(() => {
    const found = findSeoPage(toValue(path))
    if (!found) throw new Error(`useSeo: ${toValue(path)} is not listed in SEO_PAGES`)
    return found
  })

  const title = computed(() => t(`seo.${page.value.seoKey}.title`))
  const description = computed(() => t(`seo.${page.value.seoKey}.description`))
  const url = computed(() => absoluteUrl(page.value.path))
  const image = computed(() => absoluteUrl(ogImageFor(page.value)))

  useHead({
    title,
    link: [{ rel: "canonical", href: url }],
    meta: [
      { name: "description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:url", content: url },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:image", content: image },
      { property: "og:image:width", content: String(OG_IMAGE.width) },
      { property: "og:image:height", content: String(OG_IMAGE.height) },
      { property: "og:image:type", content: OG_IMAGE.type },
      { property: "og:image:alt", content: title },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
    ],
  })
}
