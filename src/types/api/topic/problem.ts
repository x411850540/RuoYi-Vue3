import type { BaseEntity, PageDomain } from '@/types'

export interface TopicProblem extends BaseEntity {
  id?: string
  tenantId?: string
  clientId?: string
  problemStatement?: string
  problemType?: string
  evidenceSnapshot?: string
  targetAudienceSnapshot?: string
  goalSnapshot?: string
  successCriteriaSnapshot?: string
  observationWindowSnapshot?: string
  lifecycleStatus?: string
}

export interface TopicProblemQueryParams extends PageDomain {
  tenantId?: string
  clientId?: string
  problemStatement?: string
  problemType?: string
  lifecycleStatus?: string
}
