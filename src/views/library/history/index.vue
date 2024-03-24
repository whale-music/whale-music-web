<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import WButton from "@/components/button/index.vue";
import RePageTable from "@/components/RePageTable/index.vue";
import { deleteHistory, getPageHistory, MusicHistoryRes } from "@/api/history";
import { PageResCommon } from "@/api/model/common";
import { message } from "@/utils/message";
import { RouteLocationRaw, useRouter } from "vue-router";
import { isAllEmpty } from "@pureadmin/utils";
import UserSelect from "@/components/UserSelect/index.vue";
import { getUserData } from "@/utils/auth";

function PageTable() {
  const search = ref("");
  const loading = ref(false);
  const selectCount = ref<[]>([]);

  // 生成一个随机日期，范围在 '2022-01-01' 和 '2022-12-31' 之间
  // const fromDate = new Date("2001-01-01");
  // const toDate = new Date("2022-12-31");
  // const content = Array.from({ length: 100 }).map(() => ({
  //   id: faker.number.int(10000),
  //   name: faker.internet.userName(),
  //   count: faker.number.int(51, 100),
  //   type: "music",
  //   user: {
  //     id: faker.number.int(1000),
  //     nickname: faker.internet.userName()
  //   },
  //   updateTime: faker.date.between({ from: fromDate, to: toDate })
  // }));

  const deleteHistoryButton = async () => {
    const r = await deleteHistory(selectCount.value.map(s => s.id));
    if (r.code === "200") {
      await init();
      message("删除成功", { type: "error" });
    }
  };
  const userId = ref<number>(getUserData().id);
  const selectType = ref<number>(0);

  const page = ref<PageResCommon<MusicHistoryRes>>({
    total: 0,
    size: 10,
    current: 1,
    content: []
  });

  async function init() {
    loading.value = true;
    try {
      const r = await getPageHistory(
        userId.value,
        selectType.value,
        page.value.current,
        page.value.size
      );
      page.value = r.data;
    } finally {
      loading.value = false;
    }
  }

  watch([userId, selectType], () => {
    init();
  });

  const router = useRouter();
  const link = new Map<string, (id: number) => RouteLocationRaw>([
    ["music", (id: number) => ({ name: "MusicInfo", query: { id: id } })],
    ["album", (id: number) => ({ name: "AlbumInfo", query: { id: id } })],
    ["artist", (id: number) => ({ name: "ArtistInfo", query: { id: id } })],
    ["mv", (id: number) => ({ name: "MvInfo", query: { id: id } })],
    ["playlist", (id: number) => ({ name: `${id}` })]
  ]);
  const toLink = (id: number, type: string) => {
    const name = link.get(type);
    if (isAllEmpty(name)) {
      message("跳转参数错误", { type: "error" });
      return;
    }
    router.push(name(id));
  };

  const tagType = new Map<
    string,
    "success" | "warning" | "info" | "primary" | "danger"
  >([
    ["music", "primary"],
    ["album", "warning"],
    ["artist", "success"],
    ["mv", "info"],
    ["playlist", "danger"]
  ]);

  const optionsType = [
    {
      value: 0,
      label: "音乐"
    },
    {
      value: 1,
      label: "专辑"
    },
    {
      value: 2,
      label: "歌手"
    },
    {
      value: 3,
      label: "歌单"
    },
    {
      value: 4,
      label: "MV"
    }
  ];

  return {
    selectType,
    optionsType,
    search,
    loading,
    page,
    selectCount,
    init,
    deleteHistoryButton,
    tagType,
    toLink,
    userId
  };
}

const {
  loading,
  page,
  selectCount,
  init,
  deleteHistoryButton,
  tagType,
  toLink,
  userId,
  selectType,
  optionsType
} = PageTable();

onMounted(() => {
  init();
});
</script>

<template>
  <div class="space-y-2">
    <div class="flex gap-2">
      <ElSelect
        v-model="selectType"
        placeholder="Select"
        size="large"
        style="width: 240px"
      >
        <el-option
          v-for="item in optionsType"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </ElSelect>
      <UserSelect v-model="userId" />
      <WButton size="large" type="primary" class="ml-2">
        <span class="font-bold"> 搜索 </span>
      </WButton>
      <ElButton
        v-show="selectCount.length > 0"
        class="animate__animated animate__fadeInUp"
        type="danger"
        size="large"
        plain
        @click="deleteHistoryButton"
      >
        删除{{ selectCount.length }}项
      </ElButton>
    </div>
    <RePageTable
      v-model:select-count="selectCount"
      v-model:page="page"
      :loading="loading"
      :is-router="false"
      @handle-current-change="init"
      @handleSizeChange="init"
    >
      <ElTableColumn type="selection" width="40" />
      <ElTableColumn prop="name">
        <template #default="{ row }">
          <ElLink @click="toLink(row.middleId, row.type)">
            <span>{{ row.name }}</span>
          </ElLink>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="type" width="90" label="播放类型">
        <template #default="{ row }">
          <ElTag :type="tagType.get(row.type)" round>{{ row.type }}</ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="count" width="150" label="播放次数" />
      <ElTableColumn prop="user" label="用户名">
        <template #default="{ row }">
          <span>{{ row.nickname }}</span>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="updateTime" label="播放时长" width="200">
        <template #default="{ row }">
          <span>{{ Math.round(row.duration / 60) }}分钟</span>
        </template>
      </ElTableColumn>
    </RePageTable>
  </div>
</template>
