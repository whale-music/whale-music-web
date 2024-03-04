<script lang="ts" setup>
import { cloneDeep } from "@pureadmin/utils";
import { useVModel } from "@vueuse/core";
import { ElTable } from "element-plus";
import { defineExpose, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import ShowLoading from "@/components/ShowLoading/ShowLoading.vue";
import { pageIndexKey, pageNumKey } from "@/utils/SearchParse";

defineOptions({
  name: "RePageTable",
  inheritAttrs: false
});

const emit = defineEmits<{
  (e: "update:selectCount", value: number): boolean;
}>();

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
    required: true
  },
  selectCount: Array,
  page: {
    type: Object as PropType<{
      total: number;
      size: number;
      current: number;
      content: [];
    }>,
    required: true
  }
});
const selectCount = useVModel(props, "selectCount", emit);

const router = useRouter();
const route = useRoute();
const handleSizeChange = (val: number) => {
  const query = cloneDeep(route.query);
  query[pageNumKey] = `${val}`;
  router.push({ query: query, replace: true });
};
const handleCurrentChange = (val: number) => {
  const query = cloneDeep(route.query);
  query[pageIndexKey] = `${val}`;
  router.push({ query: query, replace: true });
};

const tableRef = ref<InstanceType<typeof ElTable>>();
defineExpose({
  tableRef
});
const selectPageSize = [10, 50, 100, 500, 1000];

const handleClickChange = (row: any) => {
  tableRef.value.toggleRowSelection(row, undefined);
};
const handleSelectionChange = (val: []) => {
  selectCount.value = val;
};
</script>

<template>
  <ShowLoading :loading="loading" />
  <div v-if="!loading && page.total !== 0">
    <ElTable
      v-bind="$attrs"
      ref="tableRef"
      v-loading="loading"
      class="table-container"
      :data="props.page.content"
      @row-click="handleClickChange"
      @selection-change="handleSelectionChange"
    >
      <template v-for="(slot, slotName) in $slots" #[slotName]="slotProps">
        <slot :name="slotName" v-bind="slotProps" />
      </template>
    </ElTable>
    <div class="relative">
      <ElPagination
        class="mt-4 pb-4 ml-auto w-min"
        background
        :hide-on-single-page="props.page.total === 0"
        :default-current-page="1"
        :default-page-size="props.page.size"
        :current-page="props.page.current"
        :page-size="props.page.size"
        :total="props.page.total"
        :page-sizes="selectPageSize"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
  <div v-else>
    <ElEmpty
      v-if="!loading && page.total === 0"
      description="这里没有音乐, 你可以首页添加音乐"
    />
  </div>
</template>

<style lang="scss" scoped>
.table-container {
  --el-table-border-color: transparent;
  //--el-table-border: none;
  border-radius: 10px;
}
</style>
