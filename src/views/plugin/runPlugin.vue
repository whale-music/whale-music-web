<template>
  <div>
    <div class="flex items-center">
      <h1>{{ pluginInfo.pluginName }}</h1>
      <span class="ml-2" v-show="!loadFlag">
        <IconifyIconOffline
          icon="loading3Fill"
          class="animate-spin"
          style="color: var(--el-color-primary)"
          width="2rem"
          height="2rem"
        />
      </span>
    </div>
    <div class="inputs">
      <el-collapse-transition>
        <div v-show="loadFlag">
          <div class="m-1" v-for="(i, index) in inputs" :key="index">
            <span>{{ i.label }}</span>
            <el-input
              @change="saveOrUpdateCache(pluginId, inputs)"
              v-model="i.value"
              placeholder="请输入"
            />
          </div>
        </div>
      </el-collapse-transition>
    </div>
    <el-button class="mt-4 mb-4" type="primary" @click="save">运行</el-button>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from "vue-router";
import { h, onMounted, ref } from "vue";
import {
  execPluginTask,
  getPluginList,
  getCommonPluginParams,
  Params,
  PluginList
} from "@/api/plugin";
import { message } from "@/utils/message";
import { saveOrUpdateCache } from "@/utils/pluginCache";
import { ElNotification } from "element-plus";

const inputs = ref<Params[]>();

const pluginId = ref();
const save = () => {
  console.log("start run");
  execPluginTask(pluginId.value, inputs.value, false).then(res => {
    if (res.code == "200") {
      ElNotification({
        title: "成功",
        message: h("i", { style: "color: teal" }, "请在插件任务中查看"),
        duration: 1000
      });
    } else {
      message(`运行错误${res.message}`, { type: "error" });
    }
  });
};

const pluginInfo = ref<PluginList>({
  code: "",
  createName: "",
  createTime: "",
  description: "",
  id: 0,
  pluginName: "Run Plugin",
  updateTime: "",
  userId: 0
});

const loadFlag = ref<boolean>(false);
onMounted(() => {
  pluginId.value = useRouter().currentRoute.value.query.id;
  loadFlag.value = false;
  getCommonPluginParams(Number.parseInt(pluginId.value)).then(res => {
    loadFlag.value = true;
    if (res.code === "200") {
      inputs.value = res.data.params;
      saveOrUpdateCache(pluginId.value, inputs.value);
    } else {
      message(`获取参数错误: ${res.message}`, { type: "error" });
    }
  });
  getPluginList(pluginId.value).then(res => {
    if (res.code == "200" && res.data.length > 0 && res.data[0] != null) {
      pluginInfo.value = res.data[0];
    }
  });
});
</script>

<style lang="scss" scoped>
.inputs {
  transition: height ease 1s;
}

.inputs > div {
  flex: 1;
}
</style>
