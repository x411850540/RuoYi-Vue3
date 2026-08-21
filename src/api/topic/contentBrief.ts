import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, TopicContentBrief, TopicContentBriefQueryParams, TopicContentCandidate } from '@/types'

export const listTopicContentBrief = (q: TopicContentBriefQueryParams): Promise<TableDataInfo<TopicContentBrief[]>> => request({ url: '/topic/content-brief/list', method: 'get', params: q })
export const getTopicContentBrief = (id: string): Promise<AjaxResult<TopicContentBrief>> => request({ url: '/topic/content-brief/' + id, method: 'get' })
export const listTopicContentCandidate = (id: string): Promise<AjaxResult<TopicContentCandidate[]>> => request({ url: '/topic/content-brief/' + id + '/candidates', method: 'get' })
export const selectTopicContentCandidate = (id: string, selectionReason: string): Promise<AjaxResult<string>> => request({ url: '/topic/content-brief/candidate/' + id + '/select', method: 'post', data: { selectionReason } })
export const returnTopicContentCandidate = (id: string, reviewedNoteSnapshot: string): Promise<AjaxResult> => request({ url: '/topic/content-brief/candidate/' + id + '/return', method: 'post', data: { reviewedNoteSnapshot } })
export const generateTopicContentBrief = (id: string): Promise<AjaxResult> => request({ url: '/topic/content-brief/' + id + '/generate', method: 'post' })
