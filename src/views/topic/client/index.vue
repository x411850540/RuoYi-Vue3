<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="76px">
      <el-form-item label="租户标识" prop="tenantId">
        <el-input v-model="queryParams.tenantId" placeholder="请输入租户标识" clearable style="width: 180px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="客户编号" prop="clientCode">
        <el-input v-model="queryParams.clientCode" placeholder="请输入客户编号" clearable style="width: 180px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="客户名称" prop="clientName">
        <el-input v-model="queryParams.clientName" placeholder="请输入客户名称" clearable style="width: 180px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="lifecycleStatus">
        <el-select v-model="queryParams.lifecycleStatus" placeholder="客户状态" clearable style="width: 140px">
          <el-option label="启用" value="ACTIVE" />
          <el-option label="已归档" value="ARCHIVED" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['topic:client:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['topic:client:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="FolderDelete" :disabled="multiple" @click="handleArchive()" v-hasPermi="['topic:client:archive']">归档</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['topic:client:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="clientList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="客户编号" align="center" prop="clientCode" min-width="120" />
      <el-table-column label="客户名称" align="left" prop="clientName" min-width="170" show-overflow-tooltip />
      <el-table-column label="租户标识" align="center" prop="tenantId" min-width="150" show-overflow-tooltip />
      <el-table-column label="状态" align="center" prop="lifecycleStatus" width="100">
        <template #default="scope"><el-tag :type="scope.row.lifecycleStatus === 'ACTIVE' ? 'success' : 'info'">{{ scope.row.lifecycleStatus === 'ACTIVE' ? '启用' : '已归档' }}</el-tag></template>
      </el-table-column>
      <el-table-column label="最后更新" align="center" prop="updateTime" width="170" />
      <el-table-column label="备注" align="left" prop="remark" min-width="160" show-overflow-tooltip />
      <el-table-column label="操作" align="center" fixed="right" width="110" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-tooltip content="修改" placement="top"><el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['topic:client:edit']" /></el-tooltip>
          <el-tooltip content="归档" placement="top" v-if="scope.row.lifecycleStatus === 'ACTIVE'"><el-button link type="warning" icon="FolderDelete" @click="handleArchive(scope.row)" v-hasPermi="['topic:client:archive']" /></el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" v-model="open" width="560px" append-to-body>
      <el-form ref="clientRef" :model="form" :rules="rules" label-width="92px">
        <el-form-item label="租户标识" prop="tenantId"><el-input v-model="form.tenantId" :disabled="!!form.id" placeholder="例如 local-preview" maxlength="36" /></el-form-item>
        <el-form-item label="客户编号" prop="clientCode"><el-input v-model="form.clientCode" placeholder="例如 M100122" maxlength="64" /></el-form-item>
        <el-form-item label="客户名称" prop="clientName"><el-input v-model="form.clientName" placeholder="请输入门店或账号名称" maxlength="128" /></el-form-item>
        <el-form-item label="状态" prop="lifecycleStatus"><el-radio-group v-model="form.lifecycleStatus"><el-radio value="ACTIVE">启用</el-radio><el-radio value="ARCHIVED">已归档</el-radio></el-radio-group></el-form-item>
        <el-form-item label="备注" prop="remark"><el-input v-model="form.remark" type="textarea" :rows="3" placeholder="记录客户归属、账号范围或运营备注" maxlength="500" show-word-limit /></el-form-item>
      </el-form>
      <template #footer><div class="dialog-footer"><el-button type="primary" @click="submitForm">确 定</el-button><el-button @click="cancel">取 消</el-button></div></template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { getCurrentInstance, reactive, ref, toRefs } from 'vue'
import type { ComponentInternalInstance } from 'vue'
import { addTopicClient, archiveTopicClient, getTopicClient, listTopicClient, updateTopicClient } from '@/api/topic/client'
import type { TopicClient, TopicClientQueryParams } from '@/types'

const { proxy } = getCurrentInstance() as ComponentInternalInstance
const clientList = ref<TopicClient[]>([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref<string[]>([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')

const data = reactive({
  form: {} as TopicClient,
  queryParams: { pageNum: 1, pageSize: 10, tenantId: 'local-preview', clientCode: undefined, clientName: undefined, lifecycleStatus: undefined } as TopicClientQueryParams,
  rules: {
    tenantId: [{ required: true, message: '租户标识不能为空', trigger: 'blur' }],
    clientCode: [{ required: true, message: '客户编号不能为空', trigger: 'blur' }],
    clientName: [{ required: true, message: '客户名称不能为空', trigger: 'blur' }]
  }
})
const { form, queryParams, rules } = toRefs(data)

function getList() {
  loading.value = true
  listTopicClient(queryParams.value).then(response => {
    clientList.value = response.rows
    total.value = response.total
    loading.value = false
  }).catch(() => { loading.value = false })
}

function cancel() { open.value = false; reset() }
function reset() {
  form.value = { lifecycleStatus: 'ACTIVE', tenantId: queryParams.value.tenantId || 'local-preview' }
  proxy?.resetForm('clientRef')
}
function handleQuery() { queryParams.value.pageNum = 1; getList() }
function resetQuery() { proxy?.resetForm('queryRef'); queryParams.value.tenantId = 'local-preview'; handleQuery() }
function handleSelectionChange(selection: TopicClient[]) { ids.value = selection.map(item => item.id as string); single.value = selection.length !== 1; multiple.value = !selection.length }
function handleAdd() { reset(); open.value = true; title.value = '新增选题客户档案' }
function handleUpdate(row?: TopicClient) {
  reset()
  const id = row?.id || ids.value[0]
  getTopicClient(id).then(response => { form.value = response.data || {}; open.value = true; title.value = '修改选题客户档案' })
}
function submitForm() {
  proxy?.$refs.clientRef.validate((valid: boolean) => {
    if (!valid) return
    const request = form.value.id ? updateTopicClient(form.value) : addTopicClient(form.value)
    request.then(() => { proxy?.$modal.msgSuccess(form.value.id ? '修改成功' : '新增成功'); open.value = false; getList() })
  })
}
function handleArchive(row?: TopicClient) {
  const archiveIds = row?.id || ids.value
  proxy?.$modal.confirm(`确认归档客户档案编号为“${archiveIds}”的数据项？`).then(() => archiveTopicClient(archiveIds)).then(() => { getList(); proxy?.$modal.msgSuccess('归档成功') }).catch(() => {})
}
function handleExport() { proxy?.download('topic/client/export', { ...queryParams.value }, `选题客户档案_${new Date().getTime()}.xlsx`) }

getList()
</script>
