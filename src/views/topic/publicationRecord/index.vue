<template>
  <div class="app-container">
    <el-alert title="实发记录只接受真实抖音作品链接和实际发布时间。24小时、72小时指标与“问题是否改善”均由运营人员回填；没有足够证据时请选择“证据不足”，禁止补造数据。" type="error" :closable="false" class="mb16" />
    <el-form ref="queryRef" :model="queryParams" :inline="true" v-show="showSearch" label-width="76px">
      <el-form-item label="租户" prop="tenantId"><el-input v-model="queryParams.tenantId" clearable style="width:170px" /></el-form-item>
      <el-form-item label="客户标识" prop="clientId"><el-input v-model="queryParams.clientId" clearable style="width:180px" /></el-form-item>
      <el-form-item label="问题标识" prop="problemId"><el-input v-model="queryParams.problemId" clearable style="width:180px" /></el-form-item>
      <el-form-item label="人工判定" prop="problemJudgement"><el-select v-model="queryParams.problemJudgement" clearable style="width:150px"><el-option v-for="item in judgementOptions" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item>
      <el-form-item><el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button><el-button icon="Refresh" @click="resetQuery">重置</el-button></el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8"><el-col :span="1.5"><el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['topic:publication:add']">登记实发</el-button></el-col><el-col :span="1.5"><el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['topic:publication:edit']">回写复盘</el-button></el-col><el-col :span="1.5"><el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['topic:publication:export']">导出</el-button></el-col><right-toolbar v-model:showSearch="showSearch" @queryTable="getList" /></el-row>
    <el-table v-loading="loading" :data="publicationList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="真实作品链接" min-width="220" show-overflow-tooltip><template #default="scope"><a :href="scope.row.publicationUrl" target="_blank" rel="noopener">{{ scope.row.publicationUrl }}</a></template></el-table-column>
      <el-table-column label="实际发布时间" prop="publishedAt" width="170" />
      <el-table-column label="24h指标" prop="metrics24hSnapshot" min-width="180" show-overflow-tooltip />
      <el-table-column label="72h指标" prop="metrics72hSnapshot" min-width="180" show-overflow-tooltip />
      <el-table-column label="人工判定" width="130"><template #default="scope"><el-tag :type="judgementTag(scope.row.problemJudgement)">{{ judgementLabel(scope.row.problemJudgement) }}</el-tag></template></el-table-column>
      <el-table-column label="下一步" prop="nextDecision" width="145"><template #default="scope">{{ decisionLabel(scope.row.nextDecision) }}</template></el-table-column>
      <el-table-column label="操作" fixed="right" width="120"><template #default="scope"><el-button link type="primary" icon="View" @click="handleDetail(scope.row)" v-hasPermi="['topic:publication:query']">详情</el-button><el-button link type="success" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['topic:publication:edit']">复盘</el-button></template></el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    <el-dialog title="实发与复盘详情" v-model="detailOpen" width="800px" append-to-body><el-descriptions :column="1" border><el-descriptions-item label="真实作品链接"><a :href="detail.publicationUrl" target="_blank" rel="noopener">{{ detail.publicationUrl }}</a></el-descriptions-item><el-descriptions-item label="实际发布时间">{{ detail.publishedAt || '-' }}</el-descriptions-item><el-descriptions-item label="24小时真实指标"><div class="text-content">{{ detail.metrics24hSnapshot || '-' }}</div></el-descriptions-item><el-descriptions-item label="72小时真实指标"><div class="text-content">{{ detail.metrics72hSnapshot || '-' }}</div></el-descriptions-item><el-descriptions-item label="目标信号"><div class="text-content">{{ detail.targetSignalSnapshot || '-' }}</div></el-descriptions-item><el-descriptions-item label="执行偏差"><div class="text-content">{{ detail.executionDeviationSnapshot || '-' }}</div></el-descriptions-item><el-descriptions-item label="人工判定">{{ judgementLabel(detail.problemJudgement) }}</el-descriptions-item><el-descriptions-item label="判定理由"><div class="text-content">{{ detail.judgementReason || '-' }}</div></el-descriptions-item><el-descriptions-item label="下一步决策">{{ decisionLabel(detail.nextDecision) }}</el-descriptions-item></el-descriptions><template #footer><el-button @click="detailOpen = false">关 闭</el-button></template></el-dialog>
    <el-dialog :title="title" v-model="open" width="720px" append-to-body><el-form ref="publicationRef" :model="form" :rules="rules" label-width="116px"><el-alert title="请仅输入已经真实发布的抖音作品链接和真实数据；不能确认的数据留空，并把人工判定保留为“证据不足”。" type="warning" :closable="false" class="mb16" /><el-form-item label="来源待拍文案" prop="shootingItemId"><el-select v-model="form.shootingItemId" filterable style="width:100%" :disabled="!!form.id" placeholder="请选择实际已拍摄并发布的待拍文案"><el-option v-for="item in shootingOptions" :key="item.id" :label="shootingLabel(item)" :value="item.id" /></el-select></el-form-item><el-form-item label="真实抖音链接" prop="publicationUrl"><el-input v-model="form.publicationUrl" placeholder="粘贴实际发布作品的 https://v.douyin.com/... 链接" /></el-form-item><el-form-item label="实际发布时间" prop="publishedAt"><el-date-picker v-model="form.publishedAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" style="width:100%" /></el-form-item><el-row :gutter="16"><el-col :span="12"><el-form-item label="24小时真实指标"><el-input v-model="form.metrics24hSnapshot" type="textarea" :rows="3" placeholder="例如：播放、完播、同城、私信等真实截图/数值摘要" /></el-form-item></el-col><el-col :span="12"><el-form-item label="72小时真实指标"><el-input v-model="form.metrics72hSnapshot" type="textarea" :rows="3" placeholder="例如：播放、完播、同城、私信等真实截图/数值摘要" /></el-form-item></el-col></el-row><el-form-item label="目标信号"><el-input v-model="form.targetSignalSnapshot" type="textarea" :rows="2" placeholder="目标人群识别、咨询、预约、到店等可核验信号" /></el-form-item><el-form-item label="执行偏差"><el-input v-model="form.executionDeviationSnapshot" type="textarea" :rows="2" placeholder="与冻结脚本、拍摄计划相比的真实差异" /></el-form-item><el-row :gutter="16"><el-col :span="12"><el-form-item label="人工判定" prop="problemJudgement"><el-select v-model="form.problemJudgement" style="width:100%"><el-option v-for="item in judgementOptions" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item></el-col><el-col :span="12"><el-form-item label="下一步决策"><el-select v-model="form.nextDecision" clearable style="width:100%"><el-option v-for="item in decisionOptions" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item></el-col></el-row><el-form-item label="判定理由"><el-input v-model="form.judgementReason" type="textarea" :rows="3" placeholder="说明为什么判断问题改善、未改善或证据不足" /></el-form-item><el-form-item label="备注"><el-input v-model="form.remark" type="textarea" :rows="2" /></el-form-item></el-form><template #footer><el-button type="primary" @click="submitForm">保 存</el-button><el-button @click="cancel">取 消</el-button></template></el-dialog>
  </div>
</template>

<script setup lang="ts">
import { getCurrentInstance, reactive, ref, toRefs } from 'vue'
import type { ComponentInternalInstance } from 'vue'
import { addTopicPublicationRecord, getTopicPublicationRecord, listTopicPublicationRecord, updateTopicPublicationRecord } from '@/api/topic/publicationRecord'
import { listTopicShootingItem } from '@/api/topic/shootingItem'
import type { TopicPublicationRecord, TopicPublicationRecordQueryParams, TopicShootingItem } from '@/types'

const { proxy } = getCurrentInstance() as ComponentInternalInstance
const publicationList = ref<TopicPublicationRecord[]>([]); const shootingOptions = ref<TopicShootingItem[]>([]); const loading = ref(true); const showSearch = ref(true); const total = ref(0); const open = ref(false); const detailOpen = ref(false); const title = ref(''); const ids = ref<string[]>([]); const single = ref(true); const detail = ref<TopicPublicationRecord>({})
const judgementOptions = [{ value: 'IMPROVED', label: '问题改善' }, { value: 'NOT_IMPROVED', label: '未改善' }, { value: 'EVIDENCE_INSUFFICIENT', label: '证据不足' }]
const decisionOptions = [{ value: 'RETEST', label: '继续复测' }, { value: 'CHANGE_INTERVENTION', label: '更换干预方式' }, { value: 'CHANGE_CASE', label: '更换参考案例' }, { value: 'REDIAGNOSE', label: '重新诊断问题' }, { value: 'PAUSE', label: '暂停' }]
const data = reactive({ form: {} as TopicPublicationRecord, queryParams: { pageNum: 1, pageSize: 10, tenantId: 'local-preview' } as TopicPublicationRecordQueryParams, rules: { shootingItemId: [{ required: true, message: '请选择来源待拍文案', trigger: 'change' }], publicationUrl: [{ required: true, message: '真实抖音链接不能为空', trigger: 'blur' }], publishedAt: [{ required: true, message: '实际发布时间不能为空', trigger: 'change' }], problemJudgement: [{ required: true, message: '人工判定不能为空', trigger: 'change' }] } })
const { form, queryParams, rules } = toRefs(data)
function getList() { loading.value = true; listTopicPublicationRecord(queryParams.value).then(r => { publicationList.value = r.rows; total.value = r.total; loading.value = false }).catch(() => { loading.value = false }) }
function loadShootingOptions() { listTopicShootingItem({ pageNum: 1, pageSize: 100, tenantId: queryParams.value.tenantId || 'local-preview' }).then(r => { shootingOptions.value = r.rows.filter(item => item.lifecycleStatus !== 'DROPPED') }) }
function reset() { form.value = { problemJudgement: 'EVIDENCE_INSUFFICIENT' }; proxy?.resetForm('publicationRef') }
function cancel() { open.value = false; reset() }
function handleQuery() { queryParams.value.pageNum = 1; getList() }
function resetQuery() { proxy?.resetForm('queryRef'); queryParams.value.tenantId = 'local-preview'; handleQuery() }
function handleSelectionChange(rows: TopicPublicationRecord[]) { ids.value = rows.map(row => row.id as string); single.value = rows.length !== 1 }
function handleAdd() { reset(); loadShootingOptions(); open.value = true; title.value = '登记真实实发' }
function handleDetail(row: TopicPublicationRecord) { getTopicPublicationRecord(row.id as string).then(r => { detail.value = r.data || {}; detailOpen.value = true }) }
function handleUpdate(row?: TopicPublicationRecord) { reset(); getTopicPublicationRecord(row?.id || ids.value[0]).then(r => { form.value = r.data || {}; loadShootingOptions(); open.value = true; title.value = '回写真实指标与人工判定' }) }
function submitForm() { proxy?.$refs.publicationRef.validate((valid: boolean) => { if (!valid) return; const request = form.value.id ? updateTopicPublicationRecord(form.value) : addTopicPublicationRecord(form.value); request.then(() => { proxy?.$modal.msgSuccess(form.value.id ? '实发复盘已回写' : '真实实发已登记'); open.value = false; getList() }) }) }
function handleExport() { proxy?.download('topic/publication-record/export', { ...queryParams.value }, `选题实发与复盘_${new Date().getTime()}.xlsx`) }
function shootingLabel(item: TopicShootingItem) { return `${item.candidateTitleSnapshot || '未命名候选'}（${item.lifecycleStatus || 'TODO'}）` }
function judgementLabel(value?: string) { return judgementOptions.find(item => item.value === value)?.label || value || '-' }
function judgementTag(value?: string) { return value === 'IMPROVED' ? 'success' : value === 'NOT_IMPROVED' ? 'danger' : 'warning' }
function decisionLabel(value?: string) { return decisionOptions.find(item => item.value === value)?.label || '-' }
getList()
</script>

<style scoped>
.text-content { white-space: pre-wrap; line-height: 1.75; }
</style>
