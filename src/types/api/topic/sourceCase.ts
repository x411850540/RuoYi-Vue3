import type { BaseEntity, PageDomain } from '@/types'
export interface TopicSourceCase extends BaseEntity { id?: string; tenantId?: string; sourceUrl?: string; sourcePlatform?: string; titleSnapshot?: string; hookTextSnapshot?: string; transcriptSnapshot?: string; performanceSnapshot?: string; audienceType?: string; reviewStatus?: string }
export interface TopicSourceCaseQueryParams extends PageDomain { tenantId?: string; titleSnapshot?: string; audienceType?: string; reviewStatus?: string }
export interface TopicProblemCase extends BaseEntity { id?: string; tenantId?: string; problemId?: string; sourceCaseId?: string; relevanceReason?: string; likelyAudienceSnapshot?: string; learnableSnapshot?: string; nonReusableSnapshot?: string; reviewStatus?: string }
