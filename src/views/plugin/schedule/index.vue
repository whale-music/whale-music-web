<script lang="ts" setup>
import "vue-json-pretty/lib/styles.css";

import { ElMessageBox, ElScrollbar } from "element-plus";
import { h, onMounted, reactive } from "vue";
import VueJsonPretty from "vue-json-pretty";

import {
  deleteSchedule,
  getScheduleList,
  modifyStateDynamicTask,
  PluginList,
  Schedule,
  ScheduleInfo
} from "@/api/plugin";
import Wbutton from "@/components/button/index.vue";
import { message } from "@/utils/message";

const state = reactive<{
  scheduleReq: Schedule;
  scheduleRes: ScheduleInfo[];
  pluginInfoList: PluginList[];
}>({
  scheduleReq: undefined,
  scheduleRes: undefined,
  pluginInfoList: []
});
onMounted(async () => {
  const r = await getScheduleList(state.scheduleReq);
  if (r.code === "200") {
    state.scheduleRes = r.data;
  } else {
    message("请求错误", { type: "error" });
  }
});

const deleteScheduleEvent = async (id: number, index?: number) => {
  const r = await deleteSchedule(id);
  if (r.code == "200") {
    message("删除成功", { type: "success" });
    state.scheduleRes.splice(index, 1);
  } else {
    message(r.message, { type: "error" });
  }
};

const startOrStopSchedule = async (id: number, index: number) => {
  const status = !state.scheduleRes[index].status;
  const r = await modifyStateDynamicTask(id, status);
  if (r.code == "200") {
    const msgStr = state ? "启动成功" : "停止成功";
    message(msgStr, { type: "success" });
    state.scheduleRes[index].status = status;
  } else {
    message(r.message, { type: "error" });
  }
};

const showParamsJsonDialog = async (json: string) => {
  ElMessageBox({
    title: "插件参数",
    message: h("div", null, [
      h(ElScrollbar, { height: "10rem" }, [
        h(VueJsonPretty, { data: JSON.parse(json) }, "VNode")
      ])
    ]),
    showCancelButton: false,
    showClose: false
  });
};
</script>
<template>
  <div>
    <div class="grid-list">
      <div
        v-for="(item, index) in state.scheduleRes"
        :key="item.id"
        class="card"
      >
        <div class="w-full flex flex-col items-center">
          <div class="w-full flex">
            <div class="flex-1" />
            <h1 class="flex-1 whitespace-nowrap text-center">
              {{ item.name }}
            </h1>
            <div class="flex-1 text-right">
              <router-link
                :to="{
                  name: 'ScheduleEdit',
                  query: { id: item.pluginId, scheduleId: item.id }
                }"
              >
                <Wbutton> 编辑 </Wbutton>
              </router-link>
            </div>
          </div>
          <span class="text-sm" style="color: var(--el-text-color-disabled)">{{
            item.pluginName
          }}</span>
        </div>
        <div class="flex flex-nowrap items-center gap-1">
          <span>状态: </span>
          <el-tag
            effect="light"
            :type="item.status ? '' : 'danger'"
            :disable-transitions="false"
            round
          >
            {{ item.status ? "run" : "stop" }}
          </el-tag>
        </div>
        <div class="flex flex-nowrap">
          <Wbutton
            :type="!item.status ? 'primary' : 'warning'"
            @click="startOrStopSchedule(item.id, index)"
          >
            {{ !item.status ? "启用" : "禁用" }}
          </Wbutton>
          <Wbutton type="success" @click="showParamsJsonDialog(item.params)"
            >参数</Wbutton
          >
          <el-popconfirm
            width="220"
            confirm-button-text="确认"
            cancel-button-text="取消"
            icon-color="#626AEF"
            title="确认删除吗?"
            @confirm="deleteScheduleEvent(item.id, index)"
          >
            <template #reference>
              <Wbutton type="danger">删除</Wbutton>
            </template>
          </el-popconfirm>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss">
.grid-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  grid-gap: 25px;
}

.card {
  display: flex;
  flex-direction: column;
  row-gap: 0.8rem;
  align-items: center;
  justify-content: space-between;
  width: 20rem;
  height: 12rem;
  padding: 0.8rem;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-color-info-light-7);
  border-radius: 1rem;
}

.card:hover {
  border: 1px solid var(--el-color-primary);
}
</style>
