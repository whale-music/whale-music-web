<script lang="ts" setup>
import Segmented from "@/components/ReSegmented";
import MenuButton from "@/components/MenuButton/index.vue";
import { useI18n } from "vue-i18n";
import { reactive, watch } from "vue";
import MenuFill from "@iconify-icons/mingcute/menu-fill";
import ListCheckFill from "@iconify-icons/mingcute/list-check-fill";
import AddMvSidebar from "@/views/components/addMvSidebar/index.vue";

const { t } = useI18n();

const props = defineProps({
  multiple: {
    type: Boolean,
    default: false
  },
  orderConfig: {
    type: String,
    default: "asc"
  },
  sortConfig: {
    type: String,
    default: "createTime"
  }
});

const state = reactive({
  menuFlag: false,
  flag: {
    addMvFlag: false
  },
  multiple: props.multiple,
  options: {
    order: [
      {
        value: "asc",
        label: "升序"
      },
      {
        value: "desc",
        label: "降序"
      }
    ],
    orderConfig: props.orderConfig,
    menuFlag: false,
    sortConfig: props.sortConfig,
    sortData: [
      {
        value: "createTime",
        label: "上传日期"
      },
      {
        value: "updateTime",
        label: "修改日期"
      },
      {
        value: "publishTime",
        label: "发布日期"
      }
    ]
  },
  layout: {
    show: {
      sort: true
    }
  },
  dialog: { creatMv: false },
  page: {
    pageIndex: 0
  },
  t: useI18n().t,
  list: {
    optionSwitch: [
      {
        value: "radio",
        icon: MenuFill
      },
      {
        value: "multiple",
        icon: ListCheckFill
      }
    ]
  }
});

const emits = defineEmits([
  "updateOrderConfig",
  "sortConfig",
  "updateMultiple"
]);

watch(
  () => state.options.orderConfig,
  newVal => {
    emits("updateOrderConfig", newVal);
  }
);

watch(
  () => state.multiple,
  newVal => {
    emits("updateMultiple", newVal);
  }
);

const onShowListChangeOptionSwitch = ({ option }) => {
  state.multiple = option.value === "radio";
};

const sortOnSubmit = () => {
  emits("sortConfig", state.options.sortConfig);
};

const createMvMethod = () => {
  state.flag.addMvFlag = true;
};
</script>
<template>
  <div>
    <add-mv-sidebar v-model="state.flag.addMvFlag" title="添加MV" />
    <div class="option">
      <div class="flex items-center">
        <MenuButton @click="state.menuFlag = !state.menuFlag">
          <span>{{ t("input.menuBotton") }}</span>
        </MenuButton>
      </div>

      <div class="flex justify-center items-center flex-wrap gap-4">
        <Segmented
          :options="state.list.optionSwitch"
          :defaultValue="
            state.list.optionSwitch.findIndex(value => value.value === 'radio')
          "
          @change="onShowListChangeOptionSwitch"
        />
        <el-select
          v-if="state.layout.show.sort"
          v-model="state.options.sortConfig"
          placeholder="排序"
          size="large"
          style="width: 8rem"
          @change="sortOnSubmit"
        >
          <el-option
            v-for="item in state.options.sortData"
            :key="item.value"
            :label="item.label"
            :value="item.value"
            suffix-icon="download"
          />
        </el-select>
        <el-select
          v-if="state.layout.show.sort"
          v-model="state.options.orderConfig"
          placeholder="排序"
          size="large"
          style="width: 8rem"
          @change="sortOnSubmit"
        >
          <el-option
            v-for="item in state.options.order"
            :key="item.value"
            :label="item.label"
            :value="item.value"
            suffix-icon="download"
          />
        </el-select>
        <el-button
          v-if="state.layout.show.sort"
          type="primary"
          @click="createMvMethod"
        >
          新建
        </el-button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.option {
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: nowrap;
  align-items: center;
}
</style>
