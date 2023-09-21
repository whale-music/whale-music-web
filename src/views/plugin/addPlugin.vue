<script lang="ts">
import {
  defineComponent,
  onBeforeMount,
  onMounted,
  ref,
  shallowRef
} from "vue";
import { useRouter } from "vue-router";
import { Codemirror } from "vue-codemirror";
import { java } from "@codemirror/lang-java";
import { oneDark } from "@codemirror/theme-one-dark";
import {
  execCommonPluginTask,
  execInteractivePluginTask,
  getInteractiveSearch,
  getPluginList,
  getPluginParams,
  Params,
  PluginInput,
  PluginList,
  PluginTaskLogRes,
  savePluginInfo
} from "@/api/plugin";
import { message } from "@/utils/message";
import { dateFormater } from "@/utils/dateUtil";
import { saveOrUpdateCache } from "@/utils/pluginCache";
import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";

export default defineComponent({
  components: {
    Codemirror,
    VueJsonPretty
  },
  setup() {
    const extensions = [java(), oneDark];
    const pluginInfo = ref<PluginList>({
      code: "",
      createName: "",
      createTime: "",
      description: "",
      id: null,
      pluginName: "",
      type: null,
      updateTime: "",
      userId: null
    });

    // Codemirror EditorView instance ref
    const view = shallowRef();
    const handleReady = payload => {
      view.value = payload.view;
    };

    const editCreateNameFlag = ref(false);
    const editNameFlag = ref(false);
    const editDescribeFlag = ref(false);

    let timeout = null;

    const commonPluginDrawer = ref(false);
    const interactivePluginDrawer = ref(false);
    const inputs = ref<PluginInput>({ params: [], pluginType: "" });

    const searchName = ref<string>("");

    // 保存插件
    const save = () => {
      savePluginInfo(pluginInfo.value)
        .then(res => {
          pluginInfo.value.id = res.data.id;
          message(`${pluginInfo.value.pluginName}保存成功: ${res.message}`, {
            type: "success"
          });
        })
        .catch(() => {
          message(`${pluginInfo.value.pluginName}保存失败`, { type: "error" });
        });
    };

    const errorFlag = ref(false);
    const errorMsg = ref("");
    // 运行按钮, 获取插件入参
    const run = () => {
      if (pluginInfo.value.code == null || pluginInfo.value.code === "") {
        message("代码为空", { type: "error" });
        return;
      }
      save();
      getPluginParams(pluginInfo.value.id)
        .then(res => {
          if (res.code === "200") {
            switch (res.data.pluginType) {
              case "common-plugin":
                commonPluginDrawer.value = true;
                break;
              case "interactive-plugin":
                interactivePluginDrawer.value = true;
                break;
            }
            inputs.value = res.data;
            saveOrUpdateCache(pluginInfo.value.id, inputs.value.params);
          } else {
            errorFlag.value = true;
            errorMsg.value = res.message;
            message(`运行错误`, { type: "error" });
          }
        })
        .catch(reason => {
          message(`请求错误${reason}`, { type: "error" });
        });
    };

    // 代码执行日志
    const resultTextarea = ref("");

    // 点击运行测试代码
    const onRunCommonSubmit = () => {
      save();
      resultTextarea.value = "";
      execCommonPluginTask(pluginInfo.value.id, inputs.value.params).then(
        task => {
          if (task.code !== "200") {
            message(`插件运行错误: ${task.message}`, { type: "error" });
          }
          if (task.data !== null && task.data !== undefined) {
            message("执行成功", { type: "success" });
            task.data.forEach(i => {
              console.log(
                i.msg,
                dateFormater("YYYY-MM-dd HH:mm:ss", i.createTime)
              );
              resultTextarea.value =
                resultTextarea.value +
                "\n" +
                dateFormater("YYYY-MM-dd HH:mm:ss", i.createTime) +
                ": " +
                i.msg +
                "\n";
            });
          }
        }
      );
    };

    const itemHtml = ref<Params[]>([]);
    const itemHtmlFlag = ref<boolean>(false);
    const onRunInteractiveSearch = async () => {
      save();
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
          message(`保存失败${r.message}`, { type: "error" });
        }
      } catch (e) {
        message("请求失败", { type: "error" });
      }
    };
    // 监听保存快捷键
    const saveContent = e => {
      const key = e.keyCode === undefined ? e.keyCode : e.which;
      if (key === 83 && e.ctrlKey) {
        if (e.defaultPrevented == false) e.preventDefault();
        if (timeout) {
          clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
          save();
        }, 500);
      }
    };
    // 初始化，获取插件信息
    onMounted(() => {
      const plugin = useRouter().currentRoute.value.query.id;
      if (plugin !== undefined) {
        getPluginList(plugin.toString()).then(res => {
          if (res.data.length === 0) {
            pluginInfo.value.code = `console.log('Hello, world!')`;
            return;
          }
          pluginInfo.value = res.data[0];
          // name.value = pluginInfo.value.pluginName;
          // createName.value = pluginInfo.value.createName;
          // code.value = pluginInfo.value.code;
          // id.value = pluginInfo.value.id;
          // description.value = pluginInfo.value.description;
        });
      }
      document.addEventListener("keydown", saveContent);
    });
    onBeforeMount(() => {
      document.removeEventListener("keydown", saveContent);
    });
    return {
      showInteractiveSuccessFlag,
      showInteractiveSuccess,
      submitSearchValue,
      searchValue,
      searchValueFlag,
      pluginInfo,
      checkSearchValue,
      itemHtmlFlag,
      itemHtml,
      searchName,
      saveOrUpdateCache,
      errorFlag,
      errorMsg,
      editNameFlag,
      editDescribeFlag,
      editCreateNameFlag,
      onRunCommonSubmit,
      onRunInteractiveSearch,
      run,
      commonPluginDrawer,
      interactivePluginDrawer,
      inputs,
      resultTextarea,
      save,
      extensions,
      handleReady,
      log: console.log
    };
  }
});
</script>
<template>
  <div>
    <el-dialog v-model="errorFlag" width="30%" title="Run Error">
      <el-scrollbar height="20rem">
        <div class="scrollbar-error-content">
          {{ errorMsg }}
        </div>
      </el-scrollbar>
    </el-dialog>
    <h1>添加插件</h1>
    <div class="top">
      <div class="flex items-center">
        <span class="mr-4 cursor-pointer" @click="editNameFlag = true">
          {{
            pluginInfo.pluginName === "" ? "未命名插件" : pluginInfo.pluginName
          }}
        </span>
        <div class="dialog">
          <el-dialog
            v-model="editNameFlag"
            title="作者名"
            align-center
            center
            width="30%"
          >
            <div class="flex justify-center w-full">
              <div class="w-48">
                <el-input
                  v-model="pluginInfo.pluginName"
                  placeholder="输入插件名"
                  @keyup.enter="editNameFlag = false"
                />
              </div>
            </div>
            <template #footer>
              <span class="dialog-footer">
                <el-button type="primary" @click="editNameFlag = false">
                  确认
                </el-button>
              </span>
            </template>
          </el-dialog>
        </div>
        <span
          class="text-xs cursor-pointer text-neutral-500"
          @click="editCreateNameFlag = true"
        >
          {{
            pluginInfo.createName === "" ? "@未命名作者" : pluginInfo.createName
          }}
        </span>

        <div class="dialog">
          <el-dialog
            v-model="editCreateNameFlag"
            title="作者"
            align-center
            center
            width="30%"
          >
            <div class="flex justify-center w-full">
              <div class="w-48">
                <el-input
                  v-model="pluginInfo.createName"
                  placeholder="输入作者"
                  @keyup.enter="editNameFlag = false"
                />
              </div>
            </div>
            <template #footer>
              <span class="dialog-footer">
                <el-button type="primary" @click="editCreateNameFlag = false">
                  确认
                </el-button>
              </span>
            </template>
          </el-dialog>
        </div>

        <el-button
          link
          type="primary"
          class="ml-4"
          @click="editDescribeFlag = true"
        >
          编辑描述
        </el-button>

        <div class="dialog">
          <el-dialog
            v-model="editDescribeFlag"
            title="描述"
            align-center
            center
            width="30%"
          >
            <div class="flex justify-center w-full">
              <div class="w-96">
                <el-input
                  rows="12"
                  resize="none"
                  v-model="pluginInfo.description"
                  placeholder="输入描述"
                  @keyup.enter="editDescribeFlag = false"
                  type="textarea"
                />
              </div>
            </div>
            <template #footer>
              <span class="dialog-footer">
                <el-button type="primary" @click="editDescribeFlag = false">
                  确认
                </el-button>
              </span>
            </template>
          </el-dialog>
        </div>
      </div>
      <div>
        <el-button type="success" @click="run">运行</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </div>
      <!--普通插件-->
      <el-drawer
        v-model="commonPluginDrawer"
        direction="rtl"
        size="50%"
        title="I am the title"
        :with-header="false"
      >
        <div>
          <h1>普通插件</h1>
          <el-row :gutter="20" v-for="(i, index) in inputs.params" :key="index">
            <span>{{ i.label }}</span>
            <el-input
              v-model="i.value"
              @change="saveOrUpdateCache(id, inputs.params)"
              placeholder="请输入"
            />
          </el-row>
        </div>
        <el-button class="mt-4" type="primary" @click="onRunCommonSubmit">
          运行
        </el-button>
        <el-input
          v-if="resultTextarea !== ''"
          v-model="resultTextarea"
          maxlength="60"
          rows="20"
          show-word-limit
          type="textarea"
        />
      </el-drawer>
      <!--聚合插件-->
      <el-drawer
        v-model="interactivePluginDrawer"
        direction="rtl"
        size="50%"
        title="I am the title"
        :with-header="false"
      >
        <div>
          <h1>聚合插件</h1>
          <el-row :gutter="20" v-for="(i, index) in inputs.params" :key="index">
            <span>{{ i.label }}</span>
            <el-input
              v-model="i.value"
              @change="saveOrUpdateCache(pluginInfo.id, inputs.params)"
              placeholder="请输入"
            />
          </el-row>
          <br />
          <div class="flex flex-nowrap items-center">
            <h1>搜索</h1>
            <span class="ml-2" v-show="itemHtmlFlag">
              <IconifyIconOffline
                icon="loading3Fill"
                class="animate-spin"
                style="color: var(--el-color-primary)"
                width="2rem"
                height="2rem"
              />
            </span>
          </div>
          <el-input v-model="searchName" placeholder="请输入搜索数据" />
        </div>
        <el-button
          class="mt-4"
          type="primary"
          @click="onRunInteractiveSearch"
          @keyup.enter="onRunInteractiveSearch"
        >
          搜索
        </el-button>
        <h1>结果</h1>
        <el-dialog v-model="showInteractiveSuccessFlag">
          <div v-html="showInteractiveSuccess.html" />
        </el-dialog>
        <el-dialog v-model="searchValueFlag">
          <template #header>
            <h1>保存数据</h1>
          </template>
          <el-scrollbar height="20rem">
            <div>
              <vue-json-pretty :data="JSON.parse(searchValue.value)" />
            </div>
          </el-scrollbar>
          <template #footer>
            <el-button @click="searchValueFlag = false">取消</el-button>
            <el-button type="primary" @click="submitSearchValue"
              >保存</el-button
            >
          </template>
        </el-dialog>
        <div v-for="(item, index) in itemHtml" :key="index">
          <div
            class="m-1 p-2 rounded-xl hover:bg-black/30"
            v-html="item.label"
            @click="checkSearchValue(item)"
          />
        </div>
        <el-input
          v-if="resultTextarea !== ''"
          v-model="resultTextarea"
          maxlength="60"
          rows="20"
          show-word-limit
          type="textarea"
        />
      </el-drawer>
    </div>
    <codemirror
      v-model="pluginInfo.code"
      placeholder="Code goes here..."
      :style="{ height: '400px' }"
      :autofocus="true"
      :indent-with-tab="true"
      :tab-size="2"
      :extensions="extensions"
      @ready="handleReady"
      @change="log('change', $event)"
      @focus="log('focus', $event)"
      @blur="log('blur', $event)"
    />
  </div>
</template>

<style lang="scss" scoped>
.top {
  display: flex;
  justify-content: space-between;
}

.scrollbar-error-content {
  height: 20rem;
  width: 20rem;
  text-align: left;
}
</style>
