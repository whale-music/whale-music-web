<template>
  <div>
    <h1>{{ pluginInfo.pluginName }}</h1>

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
    <div>
      <el-input
        v-show="resultTextarea !== ''"
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
import { saveOrUpdateCache } from "@/utils/pluginCache";

const inputs = ref<InputInter[]>();
const resultTextarea = ref<string>();

const pluginId = ref();
let timing = null;
const save = () => {
  console.log("start run");
  execPluginTask(pluginId.value, inputs.value, false).then(res => {
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
        console.log(i.msg, dateFormater("YYYY-MM-dd HH:mm:ss", i.createTime));
        resultTextarea.value = `${resultTextarea.value}${dateFormater(
          "YYYY-MM-dd HH:mm:ss",
          i.createTime
        )} - ${i.msg}\n`;
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

const loadFlag = ref<boolean>(false);
onMounted(() => {
  pluginId.value = useRouter().currentRoute.value.query.id;
  loadFlag.value = false;
  getPluginParams(Number.parseInt(pluginId.value)).then(res => {
    loadFlag.value = true;
    inputs.value = res.data;
    saveOrUpdateCache(pluginId.value, inputs.value);
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
