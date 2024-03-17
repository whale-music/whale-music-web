<script setup lang="ts">
import TagBold from "@iconify-icons/solar/tag-bold";
import { nextTick, ref, watch } from "vue";
import { ElInput } from "element-plus";
import { PageTagsReq, TagsPageRes } from "@/api/tags";
import { PageResCommon } from "@/api/model/common";
import { isAllEmpty } from "@pureadmin/utils";

defineOptions({
  name: "FilterSidebar"
});

// page
const req = defineModel<PageTagsReq>();
const page = defineModel<PageResCommon<TagsPageRes>>("page");

const emits = defineEmits([
  "onSubmit",
  "handleSizeChange",
  "handleCurrentChange"
]);

const onSubmit = () => {
  emits("onSubmit");
};
const handleSizeChange: (val: number) => void = (val: number) => {
  // console.log(val, "handleSize");
  emits("handleSizeChange", val);
};

const handleCurrentChange: (val: number) => void = val => {
  console.log(val, "handleCurrent");
  req.value.pageIndex = val;
  emits("handleCurrentChange", val);
};

const inputValue = ref("");
const inputVisible = ref(false);
const InputRef = ref<InstanceType<typeof ElInput>>();

const handleClose = (tag: string) => {
  req.value.filterTagContents.splice(
    req.value.filterTagContents.indexOf(tag),
    1
  );
};

const showInput = () => {
  inputVisible.value = true;
  nextTick(() => {
    InputRef.value!.input!.focus();
  });
};

const handleInputConfirm = () => {
  if (inputValue.value) {
    if (isAllEmpty(req.value.filterTagContents)) {
      req.value.filterTagContents = [];
    }
    req.value.filterTagContents.push(inputValue.value);
  }
  inputVisible.value = false;
  inputValue.value = "";
};
</script>

<template>
  <!--过滤控制-->
  <ElCard
    class="basis-1/3 bg-red-300 p-4 relative"
    style="

--el-card-border-radius: 1rem"
  >
    <div class="flex justify-between">
      <h1 class="text-4xl">过滤</h1>
      <ElButton size="large" type="primary" @click="onSubmit">查询</ElButton>
    </div>
    <div class="flex flex-wrap mt-4 mb-4">
      <ElCheckboxGroup v-model="req.type">
        <el-checkbox label="音乐tag" value="musicTag" />
        <el-checkbox label="音乐流派" value="musicGenre" />
        <el-checkbox label="专辑流派" value="albumGenre" />
        <el-checkbox label="歌单tag" value="collectTag" />
        <el-checkbox label="MvTag" value="mvTag" />
      </ElCheckboxGroup>
    </div>
    <h2>标签</h2>
    <div class="mt-2 flex gap-2 flex-wrap">
      <el-tag
        v-for="tag in req.filterTagContents"
        :key="tag"
        class="cursor-pointer"
        closable
        round
        :disable-transitions="false"
        @close="handleClose(tag)"
      >
        <ElIcon>
          <IconifyIconOffline :icon="TagBold" />
        </ElIcon>
        {{ tag }}
      </el-tag>
      <el-input
        v-if="inputVisible"
        ref="InputRef"
        v-model="inputValue"
        class=""
        size="small"
        @keyup.enter="handleInputConfirm"
        @blur="handleInputConfirm"
      />
      <el-button v-else class="button-new-tag" size="small" @click="showInput">
        + New Tag
      </el-button>
    </div>
    <div class="pagination">
      <el-pagination
        background
        small
        :current-page="req.pageIndex"
        :page-size="req.pageNum"
        :total="page.total"
        :page-sizes="[20, 40, 60, 80]"
        layout="total, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </ElCard>
</template>

<style scoped lang="scss">
.pagination {
  position: absolute;
  bottom: 0;
  z-index: 1000;
  width: 100%;
  padding-top: 1rem;
  padding-bottom: 2rem;
  margin-right: auto;
  margin-left: auto;
  background-color: var(--el-bg-color);
}
</style>
