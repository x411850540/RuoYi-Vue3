import type { BaseEntity, PageDomain } from '@/types'

export interface TopicContentBrief extends BaseEntity {
  id?: string; tenantId?: string; clientId?: string; problemId?: string; researchId?: string; storeProfileVersionId?: string
  problemStatement?: string; contentRouteSnapshot?: string; sharedCoreSnapshot?: string; variantAxis?: string; status?: string
  batchMode?: string; audienceType?: string; createdAt?: string; clientCode?: string; clientName?: string
  latestJobId?: string; latestJobStatus?: string; candidateCount?: number
}
export interface TopicContentBriefQueryParams extends PageDomain { tenantId?: string; clientId?: string; problemId?: string; audienceType?: string; status?: string }
export interface TopicContentCandidate extends BaseEntity {
  id?: string; tenantId?: string; briefId?: string; clientId?: string; problemId?: string; ordinalNo?: number; lifecycleStatus?: string; reviewStatus?: string
  sourceHook?: string; variantAxis?: string; variantValue?: string; titleSnapshot?: string; copySnapshot?: string; shootingHintsSnapshot?: string; ctaSnapshot?: string; topicTagsSnapshot?: string
  evidenceGapSnapshot?: string; revisionNo?: number; reviewedNoteSnapshot?: string; selectedAt?: string; generationStatus?: string; generationAttempts?: number; generationFailureReason?: string; selectionReason?: string
}
