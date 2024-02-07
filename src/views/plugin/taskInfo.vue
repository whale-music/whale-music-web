<script lang="ts" setup>
import "vue-json-pretty/lib/styles.css";

import dayjs from "dayjs";
import { ElNotification } from "element-plus";
import { ElScrollbar } from "element-plus";
import { h, onBeforeMount, onMounted, onUnmounted, ref } from "vue";
import VueJsonPretty from "vue-json-pretty";
import { useRouter } from "vue-router";

import {
  getPluginList,
  getPluginRuntimeMessages,
  getPluginTask,
  PluginList,
  PluginMsgRes,
  PluginTask
} from "@/api/plugin";
import Wbutton from "@/components/button/index.vue";
import ShowLoading from "@/components/ShowLoading/ShowLoading.vue";
import { FriendlyTime } from "@/utils/DateFormat.ts";
import { dateFormater } from "@/utils/dateUtil";
import { message } from "@/utils/message";

const taskId = ref();
let timing = null;

const pluginTaskInfoList = ref<PluginMsgRes[]>();
const pluginTask = ref<PluginTask>({
  createTime: "",
  id: 0,
  params: "",
  pluginId: 0,
  status: 0,
  updateTime: "",
  userId: 0
});
onBeforeMount(() => {
  taskId.value = useRouter().currentRoute.value.query.id;
});
onMounted(() => {
  circulate(taskId.value);
  getPluginTask({
    params: "",
    createTime: null,
    id: taskId.value,
    pluginId: null,
    status: null,
    updateTime: "",
    userId: null
  }).then(res => {
    pluginTask.value = res.data[0];
    getPluginList(res.data[0].pluginId.toString()).then(res => {
      plugin.value = res.data[0];
    });
  });
});
// 控制滚动条
const scroll = ref<InstanceType<typeof ElScrollbar>>();
const scrollContainer = ref<HTMLDivElement>();
const timerFlag = ref<boolean>();
const circulate = (id: any) => {
  // 定时执行
  timing = setInterval(async () => {
    scroll.value.setScrollTop(scrollContainer.value.clientHeight);
    timerFlag.value = true;
    // 获取插件运行日志
    pluginTaskInfoList.value = (await getPluginRuntimeMessages(id)).data;
    refreshFlag.value = false;
    // 检测插件当前是否执行完成
    getPluginTask({
      params: "",
      id: id,
      pluginId: null,
      status: null,
      userId: null,
      createTime: null,
      updateTime: null
    }).then(res => {
      // 判断是否返回成功
      if (res.data.length > 0 && res.data[0] != null) {
        // 判断是否完成，或者是否遇到错误
        // 0: 运行停止
        // 1: 运行中
        // 2: 运行错误
        if (res.data[0].status == 0 || res.data[0].status == 2) {
          clearInterval(timing);
          timerFlag.value = false;
          ElNotification({
            title: "插件",
            message: h("b", { style: "color: teal" }, "插件运行完成"),
            duration: 1000
          });
          console.log("插件运行完成");
        }
      }
    });
  }, 2000);
};

onUnmounted(() => {
  clearInterval(timing);
});
const plugin = ref<PluginList>({
  type: null,
  code: "",
  createName: "",
  createTime: "",
  description: "",
  id: 0,
  pluginName: "",
  updateTime: "",
  userId: 0
});

const refreshFlag = ref<boolean>(true);

const refreshButton = async (id: number) => {
  refreshFlag.value = true;
  // 获取插件运行日志
  try {
    pluginTaskInfoList.value = (await getPluginRuntimeMessages(id)).data;
  } catch (e) {
    refreshFlag.value = false;
    message("刷新失败", { type: "error" });
  }
  refreshFlag.value = false;
};

const showPluginParamsFlag = ref<boolean>(false);
const pluginTaskShowParams = () => {
  if (pluginTask.value.params == null || pluginTask.value.params === "") {
    message("入参为空", { type: "success" });
  } else {
    showPluginParamsFlag.value = true;
  }
};

const showLogLevel = (level: number) => {
  let levelStr = "";
  switch (level) {
    // info
    case 0:
      levelStr = "success";
      break;
    // debug
    case 1:
      levelStr = "info";
      break;
    // warn
    case 2:
      levelStr = "warning";
      break;
    // error
    case 3:
      levelStr = "error";
      break;
  }
  return levelStr;
};

const showLogLevelText = (level: number) => {
  let levelStr = "";
  switch (level) {
    // info
    case 0:
      levelStr = "info";
      break;
    // debug
    case 1:
      levelStr = "debug";
      break;
    // warn
    case 2:
      levelStr = "warn";
      break;
    // error
    case 3:
      levelStr = "error";
      break;
  }
  return levelStr;
};
</script>

<template>
  <div>
    <h1>{{ plugin.pluginName }}</h1>
    <el-dialog v-model="showPluginParamsFlag">
      <el-scrollbar height="20rem">
        <div class="scrollbar-error-content">
          <vue-json-pretty
            :data="
              JSON.parse(pluginTask.params === '' ? '{}' : pluginTask.params)
            "
          />
        </div>
      </el-scrollbar>
    </el-dialog>
    <Wbutton @click="pluginTaskShowParams" type="danger" class="mt-4 mb-4"
      >插件入参</Wbutton
    >
    <div class="flex items-center">
      <Wbutton
        :loading="refreshFlag"
        @click="refreshButton(taskId)"
        type="danger"
        class="mt-4 mb-4"
        >刷新</Wbutton
      >
      <span class="ml-2 flex items-center" v-show="timerFlag">
        <IconifyIconOffline
          icon="loading3Fill"
          class="animate-spin"
          style="color: var(--el-color-primary)"
          width="2rem"
          height="2rem"
        />
        <span>同步插件日志</span>
      </span>
    </div>
    <ShowLoading :loading="refreshFlag" />
    <div
      class="log-container"
      v-show="
        pluginTaskInfoList != null &&
        pluginTaskInfoList.length !== 0 &&
        !refreshFlag
      "
    >
      <el-scrollbar height="400px" ref="scroll">
        <div ref="scrollContainer">
          <div
            v-for="(item, index) in pluginTaskInfoList"
            :key="item.id"
            class="show-log"
          >
            <span
              class="text-sm min-w-[2rem] pr-1 pl-1 flex items-center text-black/30"
              >{{ index + 1 }}</span
            >
            <span
              class="flex justify-center mr-1 ml-1"
              :style="{
                color: `var(--el-color-${showLogLevel(item.level)})`,
                background: `var(--el-color-${showLogLevel(
                  item.level
                )}-light-3)`,
                minWidth: `5rem`
              }"
              >{{ showLogLevelText(item.level) }}</span
            >
            <div
              class="text-black/50 truncate text-ellipsis"
              :style="{ color: `var(--el-color-${showLogLevel(item.level)})` }"
            >
              {{
                FriendlyTime(
                  dateFormater("YYYY-MM-dd HH:mm:ss", item.createTime),
                  dayjs()
                )
              }}
            </div>
            <el-tooltip
              class="box-item"
              effect="dark"
              :content="item.msg"
              placement="top-end"
            >
              <div class="ml-4 truncate text-ellipsis">{{ item.msg }}</div>
            </el-tooltip>
          </div>
        </div>
      </el-scrollbar>
    </div>
    <div
      v-show="
        (pluginTaskInfoList == null || pluginTaskInfoList.length === 0) &&
        !refreshFlag
      "
    >
      <div>无日志</div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
* {
  //border: 1px solid red;
}

.show-log {
  display: flex;
  //background: #5628ee;
  margin-top: 1rem;
  margin-bottom: 1rem;
  //border: 1px #868686;
  //border-top-style: solid;
  //border-bottom-style: solid;
}

.log-container {
  background: var(--el-bg-color);
  padding: 1rem;
  border: 1px solid #c7c6c6;
  border-radius: 0.5rem;
}
</style>
