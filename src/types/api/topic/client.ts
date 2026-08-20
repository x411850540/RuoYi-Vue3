import type { BaseEntity, PageDomain } from '@/types'

export interface TopicClient extends BaseEntity {
  id?: string
  tenantId?: string
  clientCode?: string
  clientName?: string
  lifecycleStatus?: string
}

export interface TopicClientQueryParams extends PageDomain {
  tenantId?: string
  clientCode?: string
  clientName?: string
  lifecycleStatus?: string
}
