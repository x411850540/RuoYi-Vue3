import type { BaseEntity, PageDomain } from '@/types'

export interface TopicPublicationRecord extends BaseEntity {
  id?: string
  tenantId?: string
  clientId?: string
  problemId?: string
  shootingItemId?: string
  candidateId?: string
  publicationUrl?: string
  publishedAt?: string
  metrics24hSnapshot?: string
  metrics72hSnapshot?: string
  targetSignalSnapshot?: string
  executionDeviationSnapshot?: string
  problemJudgement?: string
  judgementReason?: string
  nextDecision?: string
}

export interface TopicPublicationRecordQueryParams extends PageDomain {
  tenantId?: string
  clientId?: string
  problemId?: string
  problemJudgement?: string
}
