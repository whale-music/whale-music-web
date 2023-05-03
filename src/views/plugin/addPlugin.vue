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
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import {
  execPluginTask,
  getPluginList,
  getCommonPluginParams,
  PluginInput,
  savePluginInfo
} from "@/api/plugin";
import { message } from "@/utils/message";
import { dateFormater } from "@/utils/dateUtil";
import { saveOrUpdateCache } from "@/utils/pluginCache";

export default defineComponent({
  components: {
    Codemirror
  },
  setup() {
    const code = ref("");
    const extensions = [javascript(), oneDark];
    const createName = ref("");
    const id = ref();
    const name = ref("");
    const description = ref("");

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

    // 保存插件
    const save = () => {
      savePluginInfo({
        id: id.value,
        code: code.value,
        createName: createName.value,
        pluginName: name.value,
        description: description.value,
        createTime: "",
        updateTime: "",
        userId: null
      })
        .then(res => {
          id.value = res.data.id;
          message(`${name.value}保存成功`, { type: "success" });
        })
        .catch(() => {
          message(`${name.value}保存失败`, { type: "error" });
        });
    };

    const errorFlag = ref(false);
    const errorMsg = ref("");
    // 获取插件入参
    const run = () => {
      save();
      getCommonPluginParams(id.value)
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
            saveOrUpdateCache(id.value, inputs.value.params);
          } else {
            errorFlag.value = true;
            errorMsg.value = res.message;
          }
        })
        .catch(reason => {
          message(`请求错误${reason}`, { type: "error" });
        });
    };

    // 代码存储变量
    const resultTextarea = ref("");

    // 点击运行测试代码
    const onRunSubmit = () => {
      save();
      resultTextarea.value = "";
      execPluginTask(id.value, inputs.value.params).then(task => {
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
      });
    };

    // 监听保存快捷键
    const saveContent = e => {
      const key =
        window.event.keyCode === undefined
          ? window.event.keyCode
          : window.event.which;
      if (key === 83 && e.ctrlKey) {
        window.event.preventDefault();
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
            code.value = `console.log('Hello, world!')`;
            return;
          }
          const pluginInfo = res.data[0];
          name.value = pluginInfo.pluginName;
          createName.value = pluginInfo.createName;
          code.value = pluginInfo.code;
          id.value = pluginInfo.id;
          description.value = pluginInfo.description;
        });
      }
      document.addEventListener("keydown", saveContent);
    });
    onBeforeMount(() => {
      document.removeEventListener("keydown", saveContent);
    });
    return {
      id,
      saveOrUpdateCache,
      errorFlag,
      errorMsg,
      createName,
      editNameFlag,
      description,
      editDescribeFlag,
      editCreateNameFlag,
      onRunSubmit,
      run,
      commonPluginDrawer,
      interactivePluginDrawer,
      inputs,
      resultTextarea,
      save,
      name,
      code,
      extensions,
      handleReady,
      log: console.log
    };
  }
});
</script>
<template>
  <div>
    <el-dialog v-model="errorFlag" width="30%">
      <template #footer>
        <el-scrollbar>
          <div class="scrollbar-error-content">
            {{ errorMsg }}
          </div>
        </el-scrollbar>
      </template>
    </el-dialog>
    <h1>添加插件</h1>
    <div class="top">
      <div class="flex items-center">
        <span class="mr-4 cursor-pointer" @click="editNameFlag = true">
          {{ name === "" ? "未命名插件" : name }}
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
                  v-model="name"
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
          {{ createName === "" ? "@未命名作者" : createName }}
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
                  v-model="createName"
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
                  v-model="description"
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
        size="30%"
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
        <el-button class="mt-4" type="primary" @click="onRunSubmit">
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
        size="30%"
        title="I am the title"
        :with-header="false"
      >
        <div>
          <el-row :gutter="20" v-for="(i, index) in inputs.params" :key="index">
            <span>{{ i.label }}</span>
            <el-input
              v-model="i.value"
              @change="saveOrUpdateCache(id, inputs.params)"
              placeholder="请输入"
            />
          </el-row>
        </div>
        <el-button class="mt-4" type="primary" @click="onRunSubmit">
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
    </div>
    <codemirror
      v-model="code"
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

.dialog {
  :deep(.el-dialog) {
    border-radius: 1rem;
  }
}

.scrollbar-error-content {
  height: 20rem;
  width: 80rem;
}
</style>
