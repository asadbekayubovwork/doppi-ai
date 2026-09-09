export interface IntegrationGroup {
  groupTitle: string
  integrations: Integration[]
}

export interface Integration {
  id: string
  title?: string
  icon: string
}
