<template>
  <div class="app-container">
    <el-alert title="一个问题是一段可复盘的内容实验，不是一次临时任务。关联爆款、候选、待拍和实发会在后续详情页统一追溯。" type="info" :closable="false" class="mb16" />
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="76px">
      <el-form-item label="租户标识" prop="tenantId"><el-input v-model="queryParams.tenantId" placeholder="例如 local-preview" clearable style="width:180px" @keyup.enter="handleQuery" /></el-form-item>
      <el-form-item label="客户标识" prop="clientId"><el-input v-model="queryParams.clientId" placeholder="请输入客户ID" clearable style="width:180px" @keyup.enter="handleQuery" /></el-form-item>
      <el-form-item label="问题" prop="problemStatement"><el-input v-model="queryParams.problemStatement" placeholder="按问题描述查询" clearable style="width:180px" @keyup.enter="handleQuery" /></el-form-item>
      <el-form-item label="状态" prop="lifecycleStatus"><el-select v-model="queryParams.lifecycleStatus" placeholder="问题状态" clearable style="width:140px"><el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item>
      <el-form-item><el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button><el-button icon="Refresh" @click="resetQuery">重置</el-button></el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8"><el-col :span="1.5"><el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['topic:problem:add']">新增</el-button></el-col><el-col :span="1.5"><el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['topic:problem:edit']">修改</el-button></el-col><el-col :span="1.5"><el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['topic:problem:export']">导出</el-button></el-col><right-toolbar v-model:showSearch="showSearch" @queryTable="getList" /></el-row>
    <el-table v-loading="loading" :data="problemList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="问题" prop="problemStatement" min-width="260" show-overflow-tooltip />
      <el-table-column label="问题类型" prop="problemType" width="145" show-overflow-tooltip />
      <el-table-column label="目标人群" prop="targetAudienceSnapshot" min-width="180" show-overflow-tooltip />
      <el-table-column label="目标" prop="goalSnapshot" min-width="180" show-overflow-tooltip />
      <el-table-column label="状态" prop="lifecycleStatus" width="115"><template #default="scope"><el-tag :type="tagType(scope.row.lifecycleStatus)">{{ statusLabel(scope.row.lifecycleStatus) }}</el-tag></template></el-table-column>
      <el-table-column label="最后更新" prop="updateTime" align="center" width="170" />
      <el-table-column label="操作" align="center" fixed="right" width="200"><template #default="scope"><el-button link type="info" icon="Link" @click="handleAdoptions(scope.row)">采用案例</el-button><el-tooltip content="修改" placement="top"><el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['topic:problem:edit']" /></el-tooltip><el-dropdown v-hasPermi="['topic:problem:changeStatus']" @command="(status: string) => handleStatus(scope.row, status)"><el-button link type="warning">状态<el-icon class="el-icon--right"><arrow-down /></el-icon></el-button><template #dropdown><el-dropdown-menu><el-dropdown-item v-for="item in statusOptions" :key="item.value" :command="item.value">{{ item.label }}</el-dropdown-item></el-dropdown-menu></template></el-dropdown></template></el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    <el-dialog :title="title" v-model="open" width="740px" append-to-body><el-form ref="problemRef" :model="form" :rules="rules" label-width="106px"><el-row :gutter="16"><el-col :span="12"><el-form-item label="租户标识" prop="tenantId"><el-input v-model="form.tenantId" :disabled="!!form.id" /></el-form-item></el-col><el-col :span="12"><el-form-item label="客户标识" prop="clientId"><el-input v-model="form.clientId" :disabled="!!form.id" /></el-form-item></el-col></el-row><el-form-item label="当前问题" prop="problemStatement"><el-input v-model="form.problemStatement" type="textarea" :rows="2" maxlength="512" show-word-limit /></el-form-item><el-row :gutter="16"><el-col :span="12"><el-form-item label="问题类型"><el-input v-model="form.problemType" placeholder="例如 人群不精准" /></el-form-item></el-col><el-col :span="12"><el-form-item label="观察窗口"><el-input v-model="form.observationWindowSnapshot" placeholder="例如 发布后24h、72h" /></el-form-item></el-col></el-row><el-form-item label="事实证据" prop="evidenceSnapshot"><el-input v-model="form.evidenceSnapshot" type="textarea" :rows="2" placeholder="当前数据、客户描述或运营观察" /></el-form-item><el-form-item label="目标人群" prop="targetAudienceSnapshot"><el-input v-model="form.targetAudienceSnapshot" type="textarea" :rows="2" /></el-form-item><el-form-item label="解决目标" prop="goalSnapshot"><el-input v-model="form.goalSnapshot" type="textarea" :rows="2" /></el-form-item><el-form-item label="成功口径"><el-input v-model="form.successCriteriaSnapshot" type="textarea" :rows="2" placeholder="人工判定与数据指标如何共同判断" /></el-form-item><el-form-item label="备注"><el-input v-model="form.remark" type="textarea" :rows="2" maxlength="500" show-word-limit /></el-form-item></el-form><template #footer><div class="dialog-footer"><el-button type="primary" @click="submitForm">确 定</el-button><el-button @click="cancel">取 消</el-button></div></template></el-dialog>
    <el-dialog title="本问题采用的爆款案例" v-model="adoptionOpen" width="820px" append-to-body><el-empty v-if="!adoptions.length" description="尚未采用案例。请从爆款视频库选择已确认且受众一致的案例。" /><el-card v-for="item in adoptions" :key="item.id" class="mb12"><template #header><span>来源案例：{{ item.sourceCaseId }}</span><el-tag class="ml8" type="success">{{ item.reviewStatus }}</el-tag></template><p><b>为什么采用：</b>{{ item.relevanceReason }}</p><p><b>学习点：</b>{{ item.learnableSnapshot }}</p><p><b>不可复制：</b>{{ item.nonReusableSnapshot }}</p><p><b>受众类型：</b>{{ item.likelyAudienceSnapshot }}</p></el-card></el-dialog>
  </div>
</template>

<script setup lang="ts">
import { getCurrentInstance, reactive, ref, toRefs } from 'vue'
import type { ComponentInternalInstance } from 'vue'
import { addTopicProblem, changeTopicProblemStatus, getTopicProblem, listTopicProblem, updateTopicProblem } from '@/api/topic/problem'
import { listTopicProblemAdoptions } from '@/api/topic/sourceCase'
import type { TopicProblem, TopicProblemCase, TopicProblemQueryParams } from '@/types'
const { proxy } = getCurrentInstance() as ComponentInternalInstance
const problemList = ref<TopicProblem[]>([]); const loading = ref(true); const showSearch = ref(true); const total = ref(0); const open = ref(false); const adoptionOpen = ref(false); const adoptions = ref<TopicProblemCase[]>([]); const title = ref(''); const ids = ref<string[]>([]); const single = ref(true)
const statusOptions = [{ value: 'OPEN', label: '开放' }, { value: 'IN_EXPERIMENT', label: '实验中' }, { value: 'OBSERVING', label: '观察中' }, { value: 'PAUSED', label: '已暂停' }, { value: 'CLOSED', label: '已关闭' }]
const data = reactive({ form: {} as TopicProblem, queryParams: { pageNum: 1, pageSize: 10, tenantId: 'local-preview', clientId: undefined, problemStatement: undefined, lifecycleStatus: undefined } as TopicProblemQueryParams, rules: { tenantId: [{ required: true, message: '租户标识不能为空', trigger: 'blur' }], clientId: [{ required: true, message: '客户标识不能为空', trigger: 'blur' }], problemStatement: [{ required: true, message: '当前问题不能为空', trigger: 'blur' }], evidenceSnapshot: [{ required: true, message: '事实证据不能为空', trigger: 'blur' }], targetAudienceSnapshot: [{ required: true, message: '目标人群不能为空', trigger: 'blur' }], goalSnapshot: [{ required: true, message: '解决目标不能为空', trigger: 'blur' }] } })
const { form, queryParams, rules } = toRefs(data)
function getList() { loading.value = true; listTopicProblem(queryParams.value).then(r => { problemList.value = r.rows; total.value = r.total; loading.value = false }).catch(() => { loading.value = false }) }
function cancel() { open.value = false; reset() }
function reset() { form.value = { tenantId: queryParams.value.tenantId || 'local-preview', lifecycleStatus: 'OPEN' }; proxy?.resetForm('problemRef') }
function handleQuery() { queryParams.value.pageNum = 1; getList() }
function resetQuery() { proxy?.resetForm('queryRef'); queryParams.value.tenantId = 'local-preview'; handleQuery() }
function handleSelectionChange(rows: TopicProblem[]) { ids.value = rows.map(row => row.id as string); single.value = rows.length !== 1 }
function handleAdd() { reset(); open.value = true; title.value = '新增客户问题' }
function handleUpdate(row?: TopicProblem) { reset(); getTopicProblem(row?.id || ids.value[0]).then(r => { form.value = r.data || {}; open.value = true; title.value = '修改客户问题' }) }
function submitForm() { proxy?.$refs.problemRef.validate((valid: boolean) => { if (!valid) return; const request = form.value.id ? updateTopicProblem(form.value) : addTopicProblem(form.value); request.then(() => { proxy?.$modal.msgSuccess(form.value.id ? '修改成功' : '新增成功'); open.value = false; getList() }) }) }
function handleStatus(row: TopicProblem, lifecycleStatus: string) { proxy?.$modal.confirm(`确认将当前问题调整为“${statusLabel(lifecycleStatus)}”？`).then(() => changeTopicProblemStatus({ id: row.id, lifecycleStatus })).then(() => { proxy?.$modal.msgSuccess('状态已更新'); getList() }).catch(() => {}) }
function handleAdoptions(row: TopicProblem) { listTopicProblemAdoptions(row.id as string).then(r => { adoptions.value = r.data || []; adoptionOpen.value = true }) }
function handleExport() { proxy?.download('topic/problem/export', { ...queryParams.value }, `选题问题台账_${new Date().getTime()}.xlsx`) }
function statusLabel(value?: string) { return statusOptions.find(item => item.value === value)?.label || value || '-' }
function tagType(value?: string) { return value === 'CLOSED' ? 'success' : value === 'PAUSED' ? 'info' : value === 'IN_EXPERIMENT' ? 'warning' : '' }
getList()
</script>
