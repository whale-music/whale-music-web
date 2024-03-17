<script setup lang="ts">
import TagCard from "@/views/library/tags/components/TagCard/index.vue";
import ContentPlaceholder from "@/components/ContentPlaceholder/index.vue";
import FilterSidebar from "@/views/library/tags/components/FilterSidebar/index.vue";
import { onMounted, ref, watch } from "vue";
import { getPageTags, PageTagsReq, TagsPageRes } from "@/api/tags";
import { LocationQuery, useRoute, useRouter } from "vue-router";
import { clone } from "@pureadmin/utils";
import { PageResCommon } from "@/api/model/common";

defineOptions({
  name: "Tags"
});

function generateAlphabet() {
  const result = [];
  for (let i = 65; i <= 90; i++) {
    result.push(String.fromCharCode(i));
  }
  return result;
}

const alphabet = generateAlphabet();

const page = ref<PageResCommon<TagsPageRes>>({
  current: 1,
  size: 10,
  total: 0,
  content: []
});

const req = ref<PageTagsReq>({
  pageIndex: 1,
  pageNum: 10,
  type: [],
  tagIndex: "",
  filterTagContents: []
});

const router = useRouter();
const route = useRoute();

function parseTagsQuery(query: LocationQuery) {
  const queryType = query["type"] as string[];
  if (queryType) {
    req.value.type = queryType;
  } else {
    req.value.type = [
      "musicTag",
      "musicGenre",
      "albumGenre",
      "collectTag",
      "mvTag"
    ];
  }
  const queryTags = query["tags"] as string;
  if (queryTags) {
    req.value.filterTagContents = queryTags.split(",");
  }
  const queryCurrent = Number(query["current"]);
  if (queryCurrent) {
    req.value.pageIndex = queryCurrent;
  }
  const querySize = Number(query["size"]);
  if (querySize) {
    req.value.pageNum = querySize;
  }
}

const status = ref<"success" | "fail" | "loading">("success");
const msg = ref("");
const init = async (data: PageTagsReq = req.value) => {
  try {
    status.value = "loading";
    const r = await getPageTags(data);
    page.value = r.data;

    req.value.pageIndex = r.data.current;
    req.value.pageNum = r.data.size;
    status.value = "success";
  } catch (e) {
    msg.value = e;
    status.value = "fail";
  }
};

onMounted(() => {
  const query = clone(route.query);
  parseTagsQuery(query);
});

watch(
  req,
  val => {
    init(val);
  },
  { deep: true }
);

// 查询tag类型
watch(
  () => req.value.type,
  val => {
    const q = clone(route.query);
    q["type"] = val;
    router.push({ query: q });
  }
);

// 查询tag
watch(
  () => req.value.filterTagContents,
  val => {
    const q = clone(route.query, true);
    q["tags"] = val.join(",");
    router.push({ query: q });
  },
  { deep: true }
);

watch(
  () => req.value.pageIndex,
  val => {
    const q = clone(route.query, true);
    q["current"] = val;
    router.push({ query: q });
  }
);
</script>

<template>
  <div class="h-container">
    <div
      v-if="false"
      class="flex flex-wrap gap-2 justify-center mb-2 mt-2 font-bold"
    >
      <ElTag
        v-for="item in alphabet"
        :key="item"
        class="p-2 cursor-pointer select-none"
        size="large"
        round
        effect="plain"
      >
        {{ item }}
      </ElTag>
    </div>
    <div class="mt-3 h-full">
      <div class="flex md:flex-row flex-col-reverse h-full gap-4">
        <!--数据页面-->
        <div class="basis-2/3 rounded-2xl bg-[var(--el-bg-color)]">
          <ElScrollbar>
            <ElEmpty v-if="page.total === 0 && status !== 'fail'" />
            <ContentPlaceholder
              v-else
              :type="status"
              :fail="{ styleClass: 'w-full h-[78vh] bg-white', msg: msg }"
            >
              <div class="space-y-2">
                <TagCard
                  v-for="i in page.content"
                  :key="i.id"
                  :model-value="i"
                  :highlightTag="req.filterTagContents"
                />
              </div>
            </ContentPlaceholder>
          </ElScrollbar>
        </div>
        <FilterSidebar v-model="req" v-model:page="page" @onSubmit="init" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
$listHeight: 78vh;

.h-container {
  height: $listHeight;
}
</style>
