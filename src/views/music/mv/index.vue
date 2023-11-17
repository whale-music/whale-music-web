<script lang="ts">
import NameSearch from "@/components/nameSearch/index.vue";
import Options from "./components/options/index.vue";
import VideoCard from "./components/videoCard/index.vue";

import { useI18n } from "vue-i18n";
import { getMvPage, MvPageRes, MvPageReq, removeMvList } from "@/api/mv";
import SelectVideoCard from "@/views/music/mv/components/selectedVideoCard/index.vue";
import ShowLoading from "@/components/ShowLoading/ShowLoading.vue";
import MvFloatingOperatingPanel from "@/views/music/mv/components/mvFloatingOperatingPanel/index.vue";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import { Data } from "@/api/model/common";
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
  mounted() {
    this.init();
  },
  watch: {},
  computed: {
    selectCount() {
      return this.checkList.filter(Boolean).length;
    },
    isShowFloatOperaPanel() {
      return !(this.selectCount === 0);
    }
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
        v-model="this.search.name"
        v-model:dropdownValue="this.search.type"
        :loading="this.search.loadFlag"
        :dropdown="this.search.typeData"
        :buttonName="this.t('buttons.search')"
        @onSearch="
          () => {
            this.mvSearchReq.pageIndex = 0;
            onSubmit();
          }
        "
        @onClean="
          () => {
            this.search.name = '';
            this.mvSearchReq.pageIndex = 0;
            onSubmit();
          }
        "
      />
    </div>
    <Options
      :multiple="this.isMultiple"
      @update-multiple="this.handelUpdateMultiple"
      :sortConfig="this.filter.order"
      @sort-config="this.handelUpdateSortConfig"
      @update-order-config="this.handelUpdateOrderConfig"
    />
    <transition name="el-fade-in">
      <ShowLoading :loading="this.search.loadFlag" />
    </transition>
    <div ref="mvContainerRef" v-if="!this.search.loadFlag">
      <div class="mv-layout" v-if="this.isMultiple">
        <div
          v-for="item in this.mvDataRes.records"
          :key="item.id"
          class="mv-item"
        >
          <video-card
            :id="item.id"
            :cover-img="item.picUrl"
            :name="item.title"
            :author="item.artists"
            :scroll-container-ref="this.$refs.scrollContainer"
          />
        </div>
      </div>
      <div v-else class="mv-layout">
        <div
          v-for="(item, index) in this.mvDataRes.records"
          :key="item.id"
          class="mv-item"
        >
          <select-video-card
            :is-check="checkList[index]"
            :index="index"
            @update-check="updateCheckList"
            :id="item.id"
            :cover-img="item.picUrl"
            :name="item.title"
            :author="item.artists"
            :scroll-container-ref="this.$refs.scrollContainer"
          />
        </div>
      </div>
      <div class="flex-c mt-4">
        <el-pagination
          background
          :hide-on-single-page="this.mvDataRes.total === 0"
          :default-current-page="this.mvDataRes.current"
          :default-page-size="this.mvDataRes.size"
          :current-page="this.mvDataRes.current"
          :page-size="this.mvDataRes.size"
          :page-sizes="[5, 10, 100, 200, 500, 1000]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="this.mvDataRes.total"
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
  justify-content: flex-start;
  flex-wrap: wrap;
  margin-top: 1rem;
  gap: 2rem;
}

.mv-item-error {
  display: flex;
  width: 16rem;
  height: 10rem;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-placeholder);
  vertical-align: middle;
}
</style>
