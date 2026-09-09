import { onBeforeUnmount, onMounted, type Ref } from "vue"

/**
 * Closes a popover when the pointer goes down outside `root` or Escape is
 * pressed — the two dismissals every dropdown and dialog in the dashboard
 * needs, kept in one place so they behave identically.
 */
export const useDismiss = (
  root: Ref<HTMLElement | null>,
  close: () => void
) => {
  const onPointerDown = (event: PointerEvent) => {
    const element = root.value
    if (element && !element.contains(event.target as Node)) close()
  }

  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") close()
  }

  onMounted(() => {
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeydown)
  })

  onBeforeUnmount(() => {
    document.removeEventListener("pointerdown", onPointerDown)
    document.removeEventListener("keydown", onKeydown)
  })
}
