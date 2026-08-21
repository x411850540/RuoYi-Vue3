import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, TopicShootingItem, TopicShootingItemQueryParams } from '@/types'

export const listTopicShootingItem = (q: TopicShootingItemQueryParams): Promise<TableDataInfo<TopicShootingItem[]>> => request({ url: '/topic/shooting-item/list', method: 'get', params: q })
export const getTopicShootingItem = (id: string): Promise<AjaxResult<TopicShootingItem>> => request({ url: '/topic/shooting-item/' + id, method: 'get' })
export const updateTopicShootingItemStatus = (d: TopicShootingItem): Promise<AjaxResult> => request({ url: '/topic/shooting-item', method: 'put', data: d })
