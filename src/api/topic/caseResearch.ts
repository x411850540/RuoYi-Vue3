import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, TopicCaseResearch, TopicCaseResearchQueryParams } from '@/types'
export const listTopicCaseResearch=(q:TopicCaseResearchQueryParams):Promise<TableDataInfo<TopicCaseResearch[]>>=>request({url:'/topic/case-research/list',method:'get',params:q})
export const getTopicCaseResearch=(id:string):Promise<AjaxResult<TopicCaseResearch>>=>request({url:'/topic/case-research/'+id,method:'get'})
