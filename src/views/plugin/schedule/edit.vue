<script lang="ts" setup>
import { storageLocal, throttle } from "@pureadmin/utils";
import { ElMessageBox } from "element-plus";
import { onMounted, reactive } from "vue";
import { useRouter } from "vue-router";

import {
  getPluginList,
  getPluginParams,
  getScheduleList,
  PluginInput,
  PluginList,
  saveOrUpdateSchedule,
  Schedule
} from "@/api/plugin";
import { message } from "@/utils/message";

const state = reactive<{
  id: string | string[];
  scheduleId: number;
  loadingFlag: boolean;
  paramsInput: PluginInput;
  pluginInfo: PluginList;
  schedulerInfo: Schedule;
  cronOptions: {
    label: string;
    options: {
      value: string;
      label: string;
    }[];
  }[];
  isRun: boolean;
}>({
  id: undefined,
  scheduleId: undefined,
  loadingFlag: false,
  paramsInput: undefined,
  pluginInfo: undefined,
  schedulerInfo: undefined,
  cronOptions: undefined,
  isRun: storageLocal().getItem("isRun")
});

state.schedulerInfo = {
  createTime: "",
  cron: "",
  id: null,
  name: "",
  params: "",
  pluginId: 0,
  status: false,
  updateTime: "",
  userId: null
};

state.paramsInput = {
  params: undefined,
  pluginType: ""
};

state.cronOptions = [
  {
    label: "测试",
    options: [
      {
        label: "每一分钟执行一次",
        value: "0 */1 * * * ?"
      },
      {
        label: "每五分钟执行一次",
        value: "0 */5 * * * ?"
      }
    ]
  },
  {
    label: "每天",
    options: [
      {
        label: "每天7点30执行",
        value: "0 30 7 * * ?"
      },
      {
        label: "每天凌晨00执行",
        value: "0 0 0 * * ?"
      },
      {
        label: "每天12点执行",
        value: "0 0 12 * * ?"
      },
      {
        label: "每天14点30执行",
        value: "0 30 14 * * ?"
      }
    ]
  },
  {
    label: "每周",
    options: [
      {
        label: "每周一凌晨执行",
        value: "0 0 0 ? * MON"
      },
      {
        label: "每周二凌晨执行",
        value: "0 0 0 ? * TUE"
      },
      {
        label: "每周三凌晨执行",
        value: "0 0 0 ? * WED"
      },
      {
        label: "每周四凌晨执行",
        value: "0 0 0 ? * THU"
      },
      {
        label: "每周五凌晨执行",
        value: "0 0 0 ? * FRI"
      },
      {
        label: "每周六凌晨执行",
        value: "0 0 0 ? * SAT"
      },
      {
        label: "每周日凌晨执行",
        value: "0 0 0 ? * SUN"
      }
    ]
  }
];
onMounted(async () => {
  state.loadingFlag = true;
  state.id = useRouter().currentRoute.value.query.id;
  state.scheduleId = parseInt(
    useRouter().currentRoute.value.query.scheduleId?.toString()
  );
  const info = await getPluginList(state.id);
  if (info.code == "200" && info.data.length > 0 && info.data[0] != null) {
    state.pluginInfo = info.data[0];
  } else {
    message(`获取插件错误${info.message}`, { type: "error" });
  }
  const r = await getPluginParams(parseInt(state.id.toString()));
  if (r.code === "200") {
    state.paramsInput = r.data;
  } else {
    message(`运行错误${r.message}`, { type: "error" });
    return;
  }
  if (!isNaN(state.scheduleId) && state.scheduleId != null) {
    const scheduleRes = await getScheduleList({
      createTime: "",
      cron: "",
      id: parseInt(state.scheduleId.toString()),
      name: null,
      params: "",
      pluginId: null,
      status: null,
      updateTime: "",
      userId: 0
    });
    if (scheduleRes.code === "200") {
      state.schedulerInfo = scheduleRes.data[0];
      state.paramsInput.params = JSON.parse(state.schedulerInfo.params);
    }
  }

  state.loadingFlag = false;
  console.log(state, "state");
});

const manuallyAdd = async () => {
  try {
    const msg = await ElMessageBox.prompt("请输入cron表达式", "cron", {
      confirmButtonText: "保存",
      cancelButtonText: "取消",
      showClose: false
    });
    const { value } = msg;
    state.schedulerInfo.cron = value;
  } catch (e) {
    console.log(`取消选择${e}`);
  }
};

const saveScheduler = async () => {
  state.schedulerInfo.params = JSON.stringify(state.paramsInput.params);
  state.schedulerInfo.pluginId = state.pluginInfo.id;
  const r = await saveOrUpdateSchedule(state.schedulerInfo, state.isRun);
  if (r.code === "200") {
    message("保存成功", { type: "success" });
  } else {
    message(`保存失败${r.message}`, { type: "error" });
  }
};
const throttleClickSaveScheduler = throttle(saveScheduler, 500);

const switchIsRun = val => {
  storageLocal().setItem("isRun", val);
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <div class="flex">
        <h1>{{ state.pluginInfo?.pluginName }}</h1>
        <span v-show="state.loadingFlag" class="ml-2">
          <IconifyIconOffline
            icon="loading3Fill"
            class="animate-spin"
            style="color: var(--el-color-primary)"
            width="2rem"
            height="2rem"
          />
        </span>
      </div>
      <el-button type="primary" @click="throttleClickSaveScheduler">
        保存
      </el-button>
    </div>
    <div class="flex items-center gap-2 flex-nowrap">
      <h1>定时任务</h1>
      <el-switch v-model="state.isRun" size="large" @change="switchIsRun" />
      <span class="font-bold" style="color: var(--el-text-color-placeholder)">
        保存后自动运行
      </span>
    </div>
    <el-form label-position="top" :inline="true">
      <el-form-item label="定时任务名">
        <el-input
          v-model="state.schedulerInfo.name"
          placeholder="请输入定时任务名"
        />
      </el-form-item>
      <el-form-item label="cron">
        <el-select
          v-model="state.schedulerInfo.cron"
          placeholder="请输入cron表达式"
        >
          <el-option-group
            v-for="group in state.cronOptions"
            :key="group.label"
            :label="group.label"
          >
            <el-option
              v-for="item in group.options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
              <span style="float: left">{{ item.label }}</span>
              <span
                style="
                  float: right;
                  font-size: 13px;
                  color: var(--el-text-color-secondary);
                "
              >
                {{ item.value }}
              </span>
            </el-option>
          </el-option-group>
        </el-select>
        <el-button type="primary" class="ml-4" @click="manuallyAdd"
          >手动添加</el-button
        >
      </el-form-item>
    </el-form>
    <h1>插件运行参数</h1>
    <el-collapse-transition>
      <div v-show="!state.loadingFlag">
        <div
          v-for="(i, index) in state.paramsInput?.params"
          :key="index"
          class="m-1"
        >
          <span>{{ i.label }}</span>
          <el-input v-model="i.value" placeholder="请输入" />
        </div>
      </div>
    </el-collapse-transition>
  </div>
</template>

<style lang="scss">
//* {
//  border: 1px solid red;
//}
</style>
