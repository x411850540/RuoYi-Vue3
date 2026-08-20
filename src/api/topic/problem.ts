import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, TopicProblem, TopicProblemQueryParams } from '@/types'

export function listTopicProblem(query: TopicProblemQueryParams): Promise<TableDataInfo<TopicProblem[]>> {
  return request({ url: '/topic/problem/list', method: 'get', params: query })
}
export function getTopicProblem(id: string): Promise<AjaxResult<TopicProblem>> {
  return request({ url: '/topic/problem/' + id, method: 'get' })
}
export function addTopicProblem(data: TopicProblem): Promise<AjaxResult> {
  return request({ url: '/topic/problem', method: 'post', data })
}
export function updateTopicProblem(data: TopicProblem): Promise<AjaxResult> {
  return request({ url: '/topic/problem', method: 'put', data })
}
export function changeTopicProblemStatus(data: TopicProblem): Promise<AjaxResult> {
  return request({ url: '/topic/problem/changeStatus', method: 'put', data })
}
