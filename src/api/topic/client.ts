import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, TopicClient, TopicClientQueryParams } from '@/types'

// 查询选题客户档案列表
export function listTopicClient(query: TopicClientQueryParams): Promise<TableDataInfo<TopicClient[]>> {
  return request({
    url: '/topic/client/list',
    method: 'get',
    params: query
  })
}

// 查询选题客户档案详情
export function getTopicClient(id: string): Promise<AjaxResult<TopicClient>> {
  return request({
    url: '/topic/client/' + id,
    method: 'get'
  })
}

// 新增选题客户档案
export function addTopicClient(data: TopicClient): Promise<AjaxResult> {
  return request({
    url: '/topic/client',
    method: 'post',
    data
  })
}

// 修改选题客户档案
export function updateTopicClient(data: TopicClient): Promise<AjaxResult> {
  return request({
    url: '/topic/client',
    method: 'put',
    data
  })
}

// 归档选题客户档案
export function archiveTopicClient(id: string | string[]): Promise<AjaxResult> {
  return request({
    url: '/topic/client/' + id,
    method: 'delete'
  })
}
