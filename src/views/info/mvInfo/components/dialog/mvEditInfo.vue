<script lang="ts">
import { storageSession } from "@pureadmin/utils";
import { AutocompleteFetchSuggestionsCallback } from "element-plus";
import { defineComponent } from "vue";

import { SelectArtist } from "@/api/model/Artist";
import { updateMvInfo } from "@/api/mv";
import { getSelectSingerList } from "@/api/singer";
import { DataInfo, sessionKey } from "@/utils/auth";
import { message } from "@/utils/message";
const { VITE_PROXY_HOST } = import.meta.env;
export default defineComponent({
  name: "mvEditInfo",
  props: {
    value: Boolean,
    mvInfo: Object
  },
  mounted() {},
  computed: {
    isShow: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      }
    },
    editInfo: {
      get() {
        return this.mvInfo;
      },
      set(value) {
        this.$emit("update:mvInfo", value);
      }
    }
  },
  data() {
    return {
      uploadAction: `${VITE_PROXY_HOST ?? ""}/admin/pic/temp/upload`,
      artistName: "",
      userId: storageSession().getItem<DataInfo>(sessionKey)
    };
  },
  methods: {
    handleClose(index) {
      this.editInfo.artists.splice(index, 1);
    },
    artistQuerySearchAsync(
      queryString: string,
      cb: AutocompleteFetchSuggestionsCallback
    ) {
      getSelectSingerList(queryString).then(selectArtists => {
        if (selectArtists.code === "200" && selectArtists.data.length !== 0) {
          cb(selectArtists.data);
        }
      });
    },
    artistHandleSelect(item: SelectArtist) {
      if (
        this.editInfo.artists.findIndex(value => value.id === item.id) === -1
      ) {
        this.editInfo.artists.push({ id: item.id, name: item.artistName });
      }
      this.artistName = "";
    },
    async updateMvInfo() {
      try {
        const r = await updateMvInfo(this.editInfo);
        if (r.code === "200") {
          message("保存成功", { type: "success" });
        }
      } finally {
        this.$emit("updateChange");
      }
    }
  }
});
</script>

<template>
  <el-dialog v-model="this.isShow">
    <template #header>
      <h1>编辑MV信息</h1>
    </template>
    <el-form label-position="top">
      <el-form-item label="标题">
        <el-input v-model="this.editInfo.title" />
      </el-form-item>
      <el-form-item label="艺术家">
        <el-tag
          v-for="(item, index) in this.editInfo.artists"
          :key="item.id"
          @close="handleClose(index)"
          closable
          round
        >
          {{ item.name }}
        </el-tag>
        <el-autocomplete
          class="w-full mt-1"
          v-model="this.artistName"
          :fetch-suggestions="artistQuerySearchAsync"
          placeholder="请输入歌手名"
          @select="artistHandleSelect"
        />
      </el-form-item>
      <el-form-item label="描述">
        <el-input type="textarea" v-model="this.editInfo.description" />
      </el-form-item>
      <el-form-item label="发布时间">
        <el-date-picker v-model="this.editInfo.publishTime" />
      </el-form-item>
      <el-form-item label="视频播放时间(单位秒)">
        <el-input-number v-model="this.editInfo.duration" :min="1" />
      </el-form-item>
      <el-form-item>
        <div class="flex flex-row-reverse w-full">
          <el-button type="primary" @click="this.updateMvInfo">保存</el-button>
        </div>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<style scoped lang="scss"></style>
