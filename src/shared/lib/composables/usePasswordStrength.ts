import { computed, type Ref } from "vue"

export interface PasswordRequirement {
  label: string
  met: boolean
}

/**
 * Strength levels indexed by score, so `levels[score]` is the copy and the
 * colours for the meter. Index 0 is only reached by an empty field, which the
 * auth pages hide anyway.
 */
const levels = [
  { label: "Juda kuchsiz", bar: "bg-[#E5484D]", text: "text-[#C42121]" },
  { label: "Kuchsiz", bar: "bg-[#E5484D]", text: "text-[#C42121]" },
  { label: "O'rtacha", bar: "bg-[#E8A33D]", text: "text-[#B0730B]" },
  { label: "Kuchli", bar: "bg-[#15803D]", text: "text-[#15803D]" },
  { label: "Juda kuchli", bar: "bg-[#15803D]", text: "text-[#15803D]" },
]

/**
 * One scoring rule shared by the register and password-reset forms: the score
 * is simply how many of the four published requirements the password meets, so
 * the meter and the checklist can never disagree.
 */
export const usePasswordStrength = (password: Ref<string>) => {
  const requirements = computed<PasswordRequirement[]>(() => {
    const value = password.value

    return [
      { label: "Kamida 12 ta belgi", met: value.length >= 12 },
      {
        label: "Katta va kichik harf",
        met: /[a-z]/.test(value) && /[A-Z]/.test(value),
      },
      { label: "Kamida bitta raqam", met: /\d/.test(value) },
      { label: "Kamida bitta maxsus belgi", met: /[^A-Za-z0-9]/.test(value) },
    ]
  })

  const score = computed(() => {
    if (!password.value) return 0
    const met = requirements.value.filter((item) => item.met).length
    return Math.max(1, met)
  })

  const level = computed(() => levels[score.value])

  return { requirements, score, level }
}
