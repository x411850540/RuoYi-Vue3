<template>
  <div class="app-container">
    <el-alert title="这里展示候选被选入待拍时冻结的标题、来源钩子、变化值和口播。台账只能回写执行状态、计划时间和拍摄备注，不能改写冻结内容。" type="warning" :closable="false" class="mb16" />
    <el-form ref="queryRef" :model="queryParams" :inline="true" v-show="showSearch" label-width="76px">
      <el-form-item label="租户" prop="tenantId"><el-input v-model="queryParams.tenantId" clearable style="width:170px" /></el-form-item>
      <el-form-item label="客户标识" prop="clientId"><el-input v-model="queryParams.clientId" clearable style="width:180px" /></el-form-item>
      <el-form-item label="问题标识" prop="problemId"><el-input v-model="queryParams.problemId" clearable style="width:180px" /></el-form-item>
      <el-form-item label="冻结标题" prop="candidateTitleSnapshot"><el-input v-model="queryParams.candidateTitleSnapshot" clearable @keyup.enter="handleQuery" /></el-form-item>
      <el-form-item label="待拍状态" prop="lifecycleStatus"><el-select v-model="queryParams.lifecycleStatus" clearable style="width:140px"><el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item>
      <el-form-item><el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button><el-button icon="Refresh" @click="resetQuery">重置</el-button></el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8"><el-col :span="1.5"><el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['topic:shooting:edit']">执行回写</el-button></el-col><el-col :span="1.5"><el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['topic:shooting:export']">导出</el-button></el-col><right-toolbar v-model:showSearch="showSearch" @queryTable="getList" /></el-row>
    <el-table v-loading="loading" :data="shootingList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="冻结标题" prop="candidateTitleSnapshot" min-width="230" show-overflow-tooltip />
      <el-table-column label="来源钩子" prop="sourceHookSnapshot" min-width="220" show-overflow-tooltip />
      <el-table-column label="变化值" prop="variantValueSnapshot" min-width="160" show-overflow-tooltip />
      <el-table-column label="口播摘要" min-width="250" show-overflow-tooltip><template #default="scope">{{ copySummary(scope.row.copySnapshot) }}</template></el-table-column>
      <el-table-column label="状态" width="110"><template #default="scope"><el-tag :type="tagType(scope.row.lifecycleStatus)">{{ statusLabel(scope.row.lifecycleStatus) }}</el-tag></template></el-table-column>
      <el-table-column label="计划时间" prop="plannedAt" width="170" />
      <el-table-column label="操作" fixed="right" width="120"><template #default="scope"><el-button link type="primary" icon="View" @click="handleDetail(scope.row)" v-hasPermi="['topic:shooting:query']">详情</el-button><el-button link type="success" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['topic:shooting:edit']">回写</el-button></template></el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    <el-dialog title="待拍冻结快照" v-model="detailOpen" width="760px" append-to-body><el-descriptions :column="1" border><el-descriptions-item label="冻结标题">{{ detail.candidateTitleSnapshot || '-' }}</el-descriptions-item><el-descriptions-item label="来源钩子">{{ detail.sourceHookSnapshot || '-' }}</el-descriptions-item><el-descriptions-item label="变化值">{{ detail.variantValueSnapshot || '-' }}</el-descriptions-item><el-descriptions-item label="完整口播"><div class="copy-content">{{ detail.copySnapshot || '-' }}</div></el-descriptions-item><el-descriptions-item label="优先拍摄原因">{{ detail.selectionReason || '-' }}</el-descriptions-item><el-descriptions-item label="拍摄备注">{{ detail.shootNotes || '-' }}</el-descriptions-item></el-descriptions><template #footer><el-button @click="detailOpen = false">关 闭</el-button></template></el-dialog>
    <el-dialog title="回写待拍执行" v-model="open" width="600px" append-to-body><el-form ref="shootingRef" :model="form" :rules="rules" label-width="100px"><el-alert title="冻结标题、来源钩子、变化值与口播不可在此修改。如需改文案，请回到候选审阅重新生成并重新选入待拍。" type="info" :closable="false" class="mb16" /><el-form-item label="当前标题"><el-input :model-value="form.candidateTitleSnapshot" disabled /></el-form-item><el-form-item label="待拍状态" prop="lifecycleStatus"><el-select v-model="form.lifecycleStatus" style="width:100%"><el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item><el-form-item label="计划时间"><el-date-picker v-model="form.plannedAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" style="width:100%" /></el-form-item><el-form-item label="拍摄备注"><el-input v-model="form.shootNotes" type="textarea" :rows="4" placeholder="例如：真人出镜、需要补拍哪个服务镜头" /></el-form-item><el-form-item label="备注"><el-input v-model="form.remark" type="textarea" :rows="2" /></el-form-item></el-form><template #footer><el-button type="primary" @click="submitForm">保 存</el-button><el-button @click="cancel">取 消</el-button></template></el-dialog>
  </div>
</template>

<script setup lang="ts">
import { getCurrentInstance, reactive, ref, toRefs } from 'vue'
import type { ComponentInternalInstance } from 'vue'
import { getTopicShootingItem, listTopicShootingItem, updateTopicShootingItemStatus } from '@/api/topic/shootingItem'
import type { TopicShootingItem, TopicShootingItemQueryParams } from '@/types'

const { proxy } = getCurrentInstance() as ComponentInternalInstance
const shootingList = ref<TopicShootingItem[]>([]); const loading = ref(true); const showSearch = ref(true); const total = ref(0); const open = ref(false); const detailOpen = ref(false); const title = ref(''); const ids = ref<string[]>([]); const single = ref(true); const detail = ref<TopicShootingItem>({})
const statusOptions = [{ value: 'TODO', label: '待拍' }, { value: 'READY', label: '准备完成' }, { value: 'SHOT', label: '已拍摄' }, { value: 'DROPPED', label: '已放弃' }]
const data = reactive({ form: {} as TopicShootingItem, queryParams: { pageNum: 1, pageSize: 10, tenantId: 'local-preview' } as TopicShootingItemQueryParams, rules: { lifecycleStatus: [{ required: true, message: '待拍状态不能为空', trigger: 'change' }] } })
const { form, queryParams, rules } = toRefs(data)
function getList() { loading.value = true; listTopicShootingItem(queryParams.value).then(r => { shootingList.value = r.rows; total.value = r.total; loading.value = false }).catch(() => { loading.value = false }) }
function reset() { form.value = {}; proxy?.resetForm('shootingRef') }
function cancel() { open.value = false; reset() }
function handleQuery() { queryParams.value.pageNum = 1; getList() }
function resetQuery() { proxy?.resetForm('queryRef'); queryParams.value.tenantId = 'local-preview'; handleQuery() }
function handleSelectionChange(rows: TopicShootingItem[]) { ids.value = rows.map(row => row.id as string); single.value = rows.length !== 1 }
function handleDetail(row: TopicShootingItem) { getTopicShootingItem(row.id as string).then(r => { detail.value = r.data || {}; detailOpen.value = true }) }
function handleUpdate(row?: TopicShootingItem) { reset(); getTopicShootingItem(row?.id || ids.value[0]).then(r => { form.value = r.data || {}; open.value = true; title.value = '回写待拍执行' }) }
function submitForm() { proxy?.$refs.shootingRef.validate((valid: boolean) => { if (!valid) return; updateTopicShootingItemStatus({ id: form.value.id, lifecycleStatus: form.value.lifecycleStatus, shootNotes: form.value.shootNotes, plannedAt: form.value.plannedAt, remark: form.value.remark }).then(() => { proxy?.$modal.msgSuccess('待拍执行已回写，冻结快照未被修改'); open.value = false; getList() }) }) }
function handleExport() { proxy?.download('topic/shooting-item/export', { ...queryParams.value }, `选题待拍清单_${new Date().getTime()}.xlsx`) }
function statusLabel(value?: string) { return statusOptions.find(item => item.value === value)?.label || value || '-' }
function tagType(value?: string) { return value === 'SHOT' ? 'success' : value === 'DROPPED' ? 'info' : value === 'READY' ? 'warning' : '' }
function copySummary(value?: string) { if (!value) return '-'; return value.length > 80 ? value.slice(0, 80) + '…' : value }
getList()
</script>

<style scoped>
.copy-content { white-space: pre-wrap; line-height: 1.75; }
</style>
