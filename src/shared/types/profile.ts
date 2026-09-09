export type ProfileForm = {
  name: string
  phone: string
  category: string
  language: string
  type: string
  address: string
  description: string
}

export type ScheduleFormItem = {
  workingDays: string[]
  workingHours: {
    from: string
    to: string
  }
  lunchHours: {
    from: string
    to: string
  }
  weekendDays: string[]
}
