<script lang="ts">
import { ElMessageBox } from "element-plus";
import { useI18n } from "vue-i18n";

import { Data } from "@/api/model/common";
import { getMvPage, MvPageReq, MvPageRes, removeMvList } from "@/api/mv";
import NameSearch from "@/components/nameSearch/index.vue";
import ShowLoading from "@/components/ShowLoading/ShowLoading.vue";
import { message } from "@/utils/message";
import VideoCard from "@/views/components/videoCard/index.vue";
import MvFloatingOperatingPanel from "@/views/library/mv/components/mvFloatingOperatingPanel/index.vue";
import SelectVideoCard from "@/views/library/mv/components/selectedVideoCard/index.vue";

import Options from "./components/options/index.vue";
export default {
  components: {
    MvFloatingOperatingPanel,
    SelectVideoCard,
    NameSearch,
    VideoCard,
    Options,
    ShowLoading
  },
  data() {
    return {
      mvSearchReq: {} as MvPageReq,
      mvDataRes: {
        records: []
      } as Data<MvPageRes>,
      arrCount: 10,
      t: useI18n().t,
      isMultiple: true,
      filter: {
        order: "createTime"
      },
      checkList: [] as Array<boolean>,
      search: {
        type: "all",
        loadFlag: false,
        name: "",
        typeData: [
          {
            value: "all",
            label: "全部"
          },
          {
            value: "mv",
            label: "MV"
          },
          {
            value: "artist",
            label: "歌手"
          }
        ]
      }
    };
  },
  computed: {
    selectCount() {
      return this.checkList.filter(Boolean).length;
    },
    isShowFloatOperaPanel() {
      return !(this.selectCount === 0);
    }
  },
  watch: {},
  mounted() {
    this.init();
  },
  methods: {
    async init() {
      await this.searchPage();
    },
    async searchPage() {
      this.search.loadFlag = true;
      try {
        const r = await getMvPage(this.mvSearchReq);
        this.mvDataRes = r.data;
        this.mvSearchReq.index = r.data.current;
        this.mvSearchReq.size = r.data.size;
        this.checkList = new Array(this.mvDataRes.records.length).fill(false);
      } catch (e) {
        this.search.loadFlag = false;
      }
      this.search.loadFlag = false;
    },
    handelUpdateSortConfig(modifiedData) {
      this.filter.order = modifiedData;
      this.searchPage();
    },
    handelUpdateMultiple(flag: boolean) {
      this.isMultiple = flag;
      this.checkList = new Array(this.mvDataRes.records.length).fill(false);
      // this.searchPage();
    },
    handelUpdateOrderConfig(order: string) {
      this.mvSearchReq.order = order;
      this.searchPage();
    },
    async onSubmit() {
      this.mvSearchReq.artists = [];
      if (this.search.type === "all") {
        this.mvSearchReq.title = this.search.name;
        this.mvSearchReq.artists.push(this.search.name);
      } else if (this.search.type === "mv") {
        this.mvSearchReq.title = this.search.name;
      } else if (this.search.type === "artist") {
        this.mvSearchReq.artists.push(this.search.name);
      }
      await this.searchPage();
    },
    updateCheckList(index: number, flag: boolean) {
      this.checkList[index] = flag;
    },
    cleanCheckList() {
      this.checkList.fill(false);
    },
    async removeMvListReq() {
      ElMessageBox.confirm("是否删除MV", "确认", {
        confirmButtonText: "OK",
        cancelButtonText: "Cancel",
        type: "warning"
      }).then(async () => {
        const mvIds = this.checkList.map((value, index) => {
          if (value) {
            return this.mvDataRes.records[index].id;
          }
        });
        const r = await removeMvList(mvIds);
        await this.searchPage();
        message(r.message, { type: "success" });
      });
    },
    handleSizeChange(val) {
      this.mvSearchReq.size = val;
      this.onSubmit();
    },
    handleCurrentChange(val) {
      this.mvSearchReq.index = val;
      this.onSubmit();
    }
  }
};
</script>
<template>
  <div>
    <mv-floating-operating-panel
      v-if="isShowFloatOperaPanel"
      :select-count="selectCount"
      @clean-check="cleanCheckList"
      @remove-event="removeMvListReq"
    />
    <div>
      <!--搜索框-->
      <name-search
        v-model="search.name"
        v-model:dropdownValue="search.type"
        :loading="search.loadFlag"
        :dropdown="search.typeData"
        :buttonName="t('buttons.search')"
        @onSearch="
          () => {
            mvSearchReq.pageIndex = 0;
            onSubmit();
          }
        "
        @onClean="
          () => {
            search.name = '';
            mvSearchReq.pageIndex = 0;
            onSubmit();
          }
        "
      />
    </div>
    <Options
      :multiple="isMultiple"
      :sortConfig="filter.order"
      @update-multiple="handelUpdateMultiple"
      @sort-config="handelUpdateSortConfig"
      @update-order-config="handelUpdateOrderConfig"
      @change="init"
    />
    <transition name="el-fade-in">
      <ShowLoading :loading="search.loadFlag" />
    </transition>
    <div v-if="!search.loadFlag" ref="mvContainerRef">
      <div v-if="isMultiple" class="mv-layout">
        <div v-for="item in mvDataRes.records" :key="item.id" class="mv-item">
          <video-card
            :id="item.id"
            :cover-img="item.picUrl"
            :name="item.title"
            :author="item.artists"
            :scroll-container-ref="$refs.scrollContainer"
          />
        </div>
      </div>
      <div v-else class="mv-layout">
        <div
          v-for="(item, index) in mvDataRes.records"
          :key="item.id"
          class="mv-item"
        >
          <select-video-card
            :id="item.id"
            :is-check="checkList[index]"
            :index="index"
            :cover-img="item.picUrl"
            :name="item.title"
            :author="item.artists"
            :scroll-container-ref="$refs.scrollContainer"
            @update-check="updateCheckList"
          />
        </div>
      </div>
      <div class="flex-c mt-4">
        <el-pagination
          background
          :hide-on-single-page="mvDataRes.total === 0"
          :default-current-page="mvDataRes.current"
          :default-page-size="mvDataRes.size"
          :current-page="mvDataRes.current"
          :page-size="mvDataRes.size"
          :page-sizes="[5, 10, 100, 200, 500, 1000]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="mvDataRes.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.mv-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: flex-start;
  margin-top: 1rem;
}

.mv-item-error {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16rem;
  height: 10rem;
  font-size: 14px;
  color: var(--el-text-color-placeholder);
  vertical-align: middle;
  background: var(--el-fill-color-light);
}
</style>
