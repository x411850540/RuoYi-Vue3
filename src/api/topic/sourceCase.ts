import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, TopicProblemCase, TopicSourceCase, TopicSourceCaseQueryParams } from '@/types'
export const listTopicSourceCase = (q: TopicSourceCaseQueryParams): Promise<TableDataInfo<TopicSourceCase[]>> => request({ url: '/topic/source-case/list', method: 'get', params: q })
export const getTopicSourceCase = (id: string): Promise<AjaxResult<TopicSourceCase>> => request({ url: '/topic/source-case/' + id, method: 'get' })
export const addTopicSourceCase = (d: TopicSourceCase): Promise<AjaxResult> => request({ url: '/topic/source-case', method: 'post', data: d })
export const updateTopicSourceCase = (d: TopicSourceCase): Promise<AjaxResult> => request({ url: '/topic/source-case', method: 'put', data: d })
export const confirmTopicSourceCase = (id: string): Promise<AjaxResult> => request({ url: '/topic/source-case/confirm/' + id, method: 'put' })
export const listTopicProblemAdoptions = (id: string): Promise<AjaxResult<TopicProblemCase[]>> => request({ url: '/topic/source-case/problem/' + id + '/adoptions', method: 'get' })
export const adoptTopicProblemCase = (d: TopicProblemCase): Promise<AjaxResult> => request({ url: '/topic/source-case/problem/adoption', method: 'post', data: d })
