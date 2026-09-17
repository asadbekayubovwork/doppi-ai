import {
  computed,
  onScopeDispose,
  shallowRef,
  toValue,
  watchEffect,
  type MaybeRefOrGetter,
} from "vue"

export interface PageHeading {
  title?: string
  subtitle?: string
}

interface HeadingClaim {
  owner: symbol
  heading: PageHeading
}

const claim = shallowRef<HeadingClaim | null>(null)

/**
 * Replaces the dashboard header's route-meta heading with one derived from the
 * page's own data — an agent name, a chat id. The claim is released with the
 * page's scope, and the owner check stops a page that is transitioning out
 * from clearing the heading its successor has already set.
 */
export function usePageHeading(heading: MaybeRefOrGetter<PageHeading>) {
  const owner = Symbol("page-heading")

  watchEffect(() => {
    claim.value = { owner, heading: toValue(heading) }
  })

  onScopeDispose(() => {
    if (claim.value?.owner === owner) claim.value = null
  })
}

/** The heading the current page has claimed, if any. */
export function useClaimedPageHeading() {
  return computed(() => claim.value?.heading ?? null)
}
