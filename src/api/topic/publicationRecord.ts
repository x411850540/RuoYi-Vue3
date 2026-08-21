import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, TopicPublicationRecord, TopicPublicationRecordQueryParams } from '@/types'

export const listTopicPublicationRecord = (q: TopicPublicationRecordQueryParams): Promise<TableDataInfo<TopicPublicationRecord[]>> => request({ url: '/topic/publication-record/list', method: 'get', params: q })
export const getTopicPublicationRecord = (id: string): Promise<AjaxResult<TopicPublicationRecord>> => request({ url: '/topic/publication-record/' + id, method: 'get' })
export const addTopicPublicationRecord = (d: TopicPublicationRecord): Promise<AjaxResult> => request({ url: '/topic/publication-record', method: 'post', data: d })
export const updateTopicPublicationRecord = (d: TopicPublicationRecord): Promise<AjaxResult> => request({ url: '/topic/publication-record', method: 'put', data: d })
