<template>
  <div>
    <div class="flex items-center">
      <h1>{{ pluginInfo.pluginName }}</h1>
      <span v-show="!loadFlag" class="ml-2">
        <IconifyIconOffline
          :icon="Loading3Fill"
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
          <div v-for="(i, index) in inputs.params" :key="index" class="m-1">
            <span>{{ i.label }}</span>
            <el-input
              v-model="i.value"
              placeholder="请输入"
              @change="saveOrUpdateCache(pluginId, inputs.params)"
            />
          </div>
        </div>
      </el-collapse-transition>
    </div>
    <div v-show="pluginInfo.type === 'common-plugin'">
      <el-button class="mt-4 mb-4" type="primary" @click="submitSave"
        >运行</el-button
      >
    </div>
    <br />
    <div v-show="pluginInfo.type === 'interactive-plugin'">
      <div class="flex items-center flex-nowrap">
        <h1>搜索</h1>
        <span v-show="itemHtmlFlag" class="ml-2">
          <IconifyIconOffline
            :icon="Loading3Fill"
            class="animate-spin"
            style="color: var(--el-color-primary)"
            width="2rem"
            height="2rem"
          />
        </span>
      </div>
      <el-input v-model="searchName" placeholder="请输入搜索数据" />
      <el-button
        class="mt-4"
        type="primary"
        @click="onRunInteractiveSearch"
        @keyup.enter="onRunInteractiveSearch"
      >
        搜索
      </el-button>
      <div v-for="(item, index) in itemHtml" :key="index">
        <div
          class="m-1 p-2 rounded-xl hover:bg-black/30"
          @click="checkSearchValue(item)"
          v-html="item.label"
        />
      </div>
      <el-dialog v-model="showInteractiveSuccessFlag">
        <div v-html="showInteractiveSuccess.html" />
      </el-dialog>
      <el-dialog v-model="searchValueFlag">
        <template #header>
          <h1>保存数据</h1>
        </template>
        <el-scrollbar height="20rem">
          <div class="scrollbar-error-content">
            <vue-json-pretty :data="JSON.parse(searchValue.value)" />
          </div>
        </el-scrollbar>
        <template #footer>
          <el-button @click="searchValueFlag = false">取消</el-button>
          <el-button type="primary" @click="submitSearchValue">保存</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script lang="ts" setup>
import "vue-json-pretty/lib/styles.css";

import { ElNotification } from "element-plus";
import { h, onMounted, ref } from "vue";
import VueJsonPretty from "vue-json-pretty";
import { useRouter } from "vue-router";
import Loading3Fill from "@iconify-icons/mingcute/loading-3-fill";

import {
  execCommonPluginTask,
  execInteractivePluginTask,
  getInteractiveSearch,
  getPluginList,
  getPluginParams,
  Params,
  PluginInput,
  PluginList,
  PluginTaskLogRes
} from "@/api/plugin";
import { message } from "@/utils/message";
import { saveOrUpdateCache } from "@/utils/pluginCache";

const inputs = ref<PluginInput>({ params: [], pluginType: "" });

const pluginId = ref();
const submitSave = () => {
  console.log("start run");
  execCommonPluginTask(pluginId.value, inputs.value.params, false).then(res => {
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
  type: null,
  description: "",
  id: null,
  pluginName: "Run Plugin",
  updateTime: "",
  userId: 0
});

const itemHtmlFlag = ref<boolean>(false);
const searchName = ref<string>();
const itemHtml = ref<Params[]>();
const onRunInteractiveSearch = async () => {
  try {
    itemHtmlFlag.value = true;
    const r = await getInteractiveSearch(
      pluginInfo.value.id,
      searchName.value,
      inputs.value.params
    );
    if (r.code === "200") {
      itemHtml.value = r.data;
    } else {
      message(`搜索失败: ${r.message}`, { type: "error" });
    }
    itemHtmlFlag.value = false;
  } catch (e) {
    message(`请求失败: ${e}`, { type: "error" });
    itemHtmlFlag.value = false;
  }
};
const searchValueFlag = ref<boolean>(false);
const searchValue = ref<Params>();
// 查看提交搜索返回值
const checkSearchValue = (item: Params) => {
  searchValueFlag.value = true;
  searchValue.value = item;
  console.log(item);
};

const showInteractiveSuccessFlag = ref<boolean>(false);
const showInteractiveSuccess = ref<PluginTaskLogRes>();
const submitSearchValue = async () => {
  try {
    const r = await execInteractivePluginTask(
      pluginInfo.value.id,
      [searchValue.value],
      null,
      null
    );
    if (r.code === "200") {
      showInteractiveSuccess.value = r.data;
      showInteractiveSuccessFlag.value = true;
    } else {
      message("保存失败", { type: "error" });
    }
  } catch (e) {
    message("请求失败", { type: "error" });
  }
};

const loadFlag = ref<boolean>(false);
onMounted(() => {
  pluginId.value = useRouter().currentRoute.value.query.id;
  loadFlag.value = false;
  getPluginParams(Number.parseInt(pluginId.value)).then(res => {
    loadFlag.value = true;
    if (res.code === "200") {
      inputs.value = res.data;
      saveOrUpdateCache(pluginId.value, inputs.value.params);
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
