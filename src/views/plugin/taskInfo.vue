<script lang="ts" setup>
import { onBeforeMount, ref } from "vue";
import { useRouter } from "vue-router";
import {
  getPluginList,
  getPluginRuntimeMessages,
  getPluginTask,
  PluginList,
  PluginMsgRes
} from "@/api/plugin";
import dayjs from "dayjs";
import { dateFormater } from "@/utils/dateUtil";
import { FriendlyTime } from "@/utils/DateFormat.ts";
import { message } from "@/utils/message";
import Wbutton from "@/components/button/index.vue";
import ShowLoading from "@/components/ShowLoading/ShowLoading.vue";

const taskId = ref();
let timing = null;

const pluginTaskInfoList = ref<PluginMsgRes[]>();

const timerFlag = ref<boolean>();
const circulate = (id: any) => {
  // 定时执行
  timing = setInterval(async () => {
    timerFlag.value = true;
    // 获取插件运行日志
    pluginTaskInfoList.value = (await getPluginRuntimeMessages(id)).data;
    refreshFlag.value = false;
    // 检测插件当前是否执行完成
    getPluginTask({
      id: id,
      pluginId: null,
      status: null,
      userId: null,
      createTime: null,
      updateTime: null
    }).then(res => {
      if (res.data.length > 0 && res.data[0] != null) {
        if (res.data[0].status == 1 || res.data[0].status == 2) {
          clearInterval(timing);
          timerFlag.value = false;
          console.log("插件运行完成");
        }
      }
    });
  }, 1000);
};
const plugin = ref<PluginList>({
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

onBeforeMount(() => {
  taskId.value = useRouter().currentRoute.value.query.id;
  circulate(taskId.value);
  getPluginTask({
    createTime: null,
    id: taskId.value,
    pluginId: null,
    status: null,
    updateTime: "",
    userId: null
  }).then(res => {
    getPluginList(res.data[0].pluginId.toString()).then(res => {
      plugin.value = res.data[0];
    });
  });
});
</script>

<template>
  <div>
    <h1>{{ plugin.pluginName }}</h1>
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
      <el-scrollbar height="400px">
        <div>
          <div
            v-for="(item, index) in pluginTaskInfoList"
            :key="item.id"
            class="show-log"
          >
            <span class="text-sm pr-1 pl-1 flex items-center text-black/30">{{
              index + 1
            }}</span>
            <div class="text-black/50 truncate text-ellipsis">
              {{
                FriendlyTime(
                  dateFormater("YYYY-MM-dd HH:mm:ss", item.createTime),
                  dayjs()
                )
              }}
            </div>
            <div class="ml-4 truncate text-ellipsis">{{ item.msg }}</div>
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
  border: 1px #868686;
  border-top-style: solid;
  border-bottom-style: solid;
}

.log-container {
  border: 1px solid #c7c6c6;
  border-radius: 0.5rem;
}
</style>
