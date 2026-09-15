import { toast as sonner } from "vue-sonner"

/**
 * Toast notifications. The API mirrors the one used across our other frontends
 * — `toast.success(title, content?, duration?)` — so the call sites read the
 * same everywhere. The renderer here is vue-sonner (see `CToaster` in the app
 * shell) rather than a full UI kit, because this project styles its own
 * surfaces with Tailwind.
 */
export function useToast() {
  return {
    success: (title: string, content?: string, duration = 3000): void => {
      sonner.success(title, { description: content, duration })
    },

    error: (title: string, content?: string, duration = 4000): void => {
      sonner.error(title, { description: content, duration })
    },

    warning: (title: string, content?: string, duration = 3000): void => {
      sonner.warning(title, { description: content, duration })
    },

    info: (title: string, content?: string, duration = 3000): void => {
      sonner.info(title, { description: content, duration })
    },

    /**
     * Stays until `dismiss` is called with the returned id — for work the user
     * has to wait on, such as an external auth widget coming back.
     */
    loading: (title: string, content?: string): number | string =>
      sonner.loading(title, { description: content, duration: Infinity }),

    dismiss: (id?: number | string): void => {
      sonner.dismiss(id)
    },
  }
}
