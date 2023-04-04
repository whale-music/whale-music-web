<template>
  <div>
    <h1>{{ pluginInfo.pluginName }}</h1>
    <div class="inputs">
      <div class="m-1" v-for="(i, index) in inputs" :key="index">
        <span>{{ i.label }}</span>
        <el-input v-model="i.value" placeholder="请输入" />
      </div>
    </div>
    <el-button class="mt-4" type="primary" @click="save">运行</el-button>

    <div>
      <el-input
        v-if="resultTextarea !== ''"
        v-model="resultTextarea"
        maxlength="60"
        rows="20"
        show-word-limit
        type="textarea"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from "vue-router";
import { onMounted, ref } from "vue";
import {
  execPluginTask,
  getPluginList,
  getPluginParams,
  getPluginRuntimeMessages,
  getPluginRuntimeTask,
  InputInter,
  PluginList
} from "@/api/plugin";
import { dateFormater } from "@/utils/dateUtil";
import { message } from "@/utils/message";

const inputs = ref<InputInter[]>();
const resultTextarea = ref<string>();

let plugin = null;
let timing = null;
const save = () => {
  console.log("start run");
  execPluginTask(plugin, inputs.value, false).then(res => {
    if (res.code == "200") {
      circulate(res.data);
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

const circulate = (id: any) => {
  // 定时执行
  timing = setInterval(() => {
    console.log("定时器运行");
    // 获取插件运行日志
    getPluginRuntimeMessages(id).then(res => {
      resultTextarea.value = "";
      res.data.forEach(i => {
        console.log(
          JSON.parse(i.msg),
          dateFormater("YYYY-MM-dd HH:mm:ss", i.createTime)
        );
        resultTextarea.value =
          resultTextarea.value +
          "\n" +
          dateFormater("YYYY-MM-dd HH:mm:ss", i.createTime) +
          ": " +
          JSON.parse(i.msg).params +
          "\n";
      });
    });

    // 检测插件当前是否执行完成
    getPluginRuntimeTask({
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
          console.log("插件运行完成");
        }
      }
    });
  }, 1000);
};
onMounted(() => {
  plugin = useRouter().currentRoute.value.query.id;
  getPluginParams(Number.parseInt(plugin.toString())).then(res => {
    inputs.value = res.data;
  });
  getPluginList(plugin).then(res => {
    if (res.code == "200" && res.data.length > 0 && res.data[0] != null) {
      pluginInfo.value = res.data[0];
    }
  });
});
</script>

<style lang="scss" scoped>
.inputs {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  flex-wrap: nowrap;
  align-items: flex-end;
}

.inputs > div {
  flex: 1;
}
</style>
