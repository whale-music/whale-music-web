<script lang="ts" setup>
import { onBeforeMount, ref } from "vue";
import {
  deletePluginTask,
  getPluginList,
  getPluginTask,
  PluginTask
} from "@/api/plugin";
import { message } from "@/utils/message";
import Wbutton from "@/components/button/index.vue";
import { FriendlyTime } from "@/utils/DateFormat";
import { dateFormater } from "@/utils/dateUtil";
import dayjs from "dayjs";
import { useRouter } from "vue-router";

const router = useRouter();

interface PluginTaskList extends PluginTask {
  name?: string;
  loading?: boolean;
  pluginType?: string;
}

const taskList = ref<PluginTaskList[]>();

function initPluginList() {
  getPluginTask(
    {
      createTime: null,
      id: null,
      params: null,
      pluginId: null,
      status: pluginStatusOptions.value,
      updateTime: null,
      userId: null
    },
    pluginTypeOptions.value
  )
    .then(value => {
      taskList.value = value.data;
      const pluginIdArr = [];
      value.data.forEach(value1 => pluginIdArr.push(value1.pluginId));
      getPluginList(pluginIdArr).then(value1 => {
        for (const element of taskList.value) {
          for (const datum of value1.data) {
            if (datum.id === element.pluginId) {
              element.name = datum.pluginName;
              element.pluginType = datum.type;
            }
          }
        }
      });
    })
    .catch(reason => {
      message(`接口错误${reason}`);
    });
}

const updateTypeSelect = () => {
  initPluginList();
};

const typeOptions = [
  {
    value: "null",
    label: "全部插件"
  },
  {
    value: "common-plugin",
    label: "普通插件"
  },
  {
    value: "interactive-plugin",
    label: "聚合插件"
  }
];

const pluginTypeOptions = ref<string>("");

const pluginStatusOptions = ref<number>();
const statusOptions = [
  {
    value: "null",
    label: "全部状态"
  },
  {
    value: "0",
    label: "stop"
  },
  {
    value: "1",
    label: "run"
  },
  {
    value: "2",
    label: "error"
  }
];

const updateStatusSelect = () => {
  initPluginList();
};

const showPluginType = (type: string) => {
  switch (type) {
    case "common-plugin":
      return "solar:crown-minimalistic-outline";
    case "interactive-plugin":
      return "solar:magnifer-line-duotone";
  }
};

onBeforeMount(() => {
  initPluginList();
});

const showStatus = (status: number) => {
  const tagClass = {
    color: "",
    background: "",
    borderColor: ""
  };
  switch (status) {
    // "stop"
    case 0:
      tagClass.color = `#7b19f1`;
      break;
    // run
    case 1:
      tagClass.color = `#1ac2ff`;
      break;
    // error
    case 2:
      tagClass.color = `#ff0000`;
      break;
  }
  tagClass.background = `${tagClass.color}40`;
  return tagClass;
};

const deleteTaskArr = async (id: number, index: number) => {
  taskList.value[index].loading = true;
  try {
    const r = await deletePluginTask([id]);
    if (r.code === "200") {
      message("删除成功", { type: "success" });
      taskList.value[index].loading = false;
      taskList.value.splice(index, 1);
    }
    taskList.value[index].loading = false;
  } catch (e) {
    taskList.value[index].loading = false;
    message(`删除失败${e}`, { type: "error" });
  }
};

const deleteTaskAll = async () => {
  const r = await deletePluginTask(taskList.value.map(value => value.id));
  if (r.code === "200") {
    taskList.value = [];
    message("删除成功", { type: "success" });
  }
};

const underdevelopment = () => {
  message("未开发，敬请期待", { type: "warning" });
};

const toTaskInfo = (id: number) => {
  router.push({
    path: "/plugin/taskInfo",
    query: { id: id }
  });
};

const showStatusText = (status: number) => {
  // "stop"
  if (status === 0) {
    return "success";
  }
  // run
  if (status === 1) {
    return "run";
  }
  // error
  if (status === 2) {
    return "error";
  }
  return "unknown";
};
</script>

<template>
  <div>
    <el-select
      v-model="pluginStatusOptions"
      class="m-2"
      placeholder="Select"
      size="large"
      @change="updateStatusSelect"
    >
      <el-option
        v-for="item in statusOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
    <el-select
      v-model="pluginTypeOptions"
      class="m-2"
      placeholder="Select"
      size="large"
      @change="updateTypeSelect"
    >
      <el-option
        v-for="item in typeOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
    <wbutton @click="deleteTaskAll">清除所有插件任务</wbutton>
    <div class="task-grid">
      <div v-for="(item, index) in taskList" :key="item.id">
        <div class="task">
          <div class="title">
            <div class="flex items-center">
              <span class="ml-3">
                {{ item.name }}
              </span>
              <el-tooltip
                effect="dark"
                :content="item.pluginType"
                placement="top"
              >
                <IconifyIconOnline
                  class="cursor-pointer ml-1"
                  style="color: var(--el-color-primary-light-3)"
                  :icon="showPluginType(item.pluginType)"
                  width="1rem"
                  height="1rem"
                />
              </el-tooltip>
            </div>
            <span class="mr-4 text-sm font-bold"
              >{{
                FriendlyTime(
                  dateFormater("YYYY-MM-dd HH:mm:ss", item.createTime),
                  dayjs()
                )
              }}创建</span
            >
          </div>
          <div class="flex justify-around items-center">
            <div class="flex flex-col justify-center">
              <div>
                <span>状态: </span>
                <span :class="[{ tag: true }]" :style="showStatus(item.status)">
                  {{ showStatusText(item.status) }}
                </span>
              </div>
            </div>
          </div>
          <div class="flex justify-around">
            <Wbutton @click="toTaskInfo(item.id)">查看</Wbutton>
            <Wbutton type="warning" @click="underdevelopment">停止</Wbutton>

            <el-popconfirm
              confirm-button-text="是"
              cancel-button-text="否"
              icon-color="#626AEF"
              title="确定需要删除吗"
              @confirm="deleteTaskArr(item.id, index)"
            >
              <template #reference>
                <Wbutton
                  :loading="!(item.loading == null || item.loading === false)"
                  type="danger"
                  >删除</Wbutton
                >
              </template>
            </el-popconfirm>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
* {
  //border: 1px solid red;
}

.task-grid {
  display: grid;
  /*  声明列的宽度  */
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  /*  声明行间距和列间距  */
  grid-gap: 25px;
}

.task {
  @apply rounded-md border border-black/20;
  height: 10rem;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.title {
  display: flex;
  justify-content: space-between;
}

.tag {
  display: inline-block;
  width: fit-content;
  height: fit-content;
  padding-right: 1rem;
  padding-left: 1rem;
  text-align: center;
  line-height: 2rem;
  border-radius: 8px;
}
</style>
