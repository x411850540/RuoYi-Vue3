import type { BaseEntity, PageDomain } from '@/types'

export interface TopicShootingItem extends BaseEntity {
  id?: string
  tenantId?: string
  clientId?: string
  problemId?: string
  briefId?: string
  candidateId?: string
  ordinalNo?: number
  candidateTitleSnapshot?: string
  sourceHookSnapshot?: string
  variantValueSnapshot?: string
  copySnapshot?: string
  selectionReason?: string
  shootNotes?: string
  plannedAt?: string
  lifecycleStatus?: string
  selectedAt?: string
}

export interface TopicShootingItemQueryParams extends PageDomain {
  tenantId?: string
  clientId?: string
  problemId?: string
  candidateTitleSnapshot?: string
  lifecycleStatus?: string
}
