<script lang="ts" setup>
import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { SaveOrUpdateUserReq } from "@/api/model/User";
import { getUserInfo, saveOrUpdateUser } from "@/api/user";
import { genFileId, UploadRawFile } from "element-plus";
import { message } from "@/utils/message";
import { useUserStoreHook } from "@/store/modules/user";
import { loginRules } from "./utils/rule";

defineComponent({
  name: "userInfo"
});

const { VITE_PROXY_HOST } = import.meta.env;
const proxyHost = VITE_PROXY_HOST == null ? "" : VITE_PROXY_HOST;

const avatarPicUpload = ref();
const backgroundPicUpload = ref();
const state = reactive({
  show: {
    userAvatarFlag: false,
    userBackgroundFlag: false,
    userAvatarPreviewPic: false,
    userBackgroundPreviewPic: false
  },
  uploadPicAction: `${proxyHost}/admin/pic/upload`,
  previewPic: `${proxyHost}/admin/pic/get/temp/`,
  userInfo: {} as SaveOrUpdateUserReq
});
onMounted(() => {
  const path = useRouter().currentRoute.value.params.id;
  if (path != null && !isNaN(Number(path))) {
    state.userInfo.id = Number(path);
    getUserInfoMethod();
  }
});

const getUserInfoMethod = async () => {
  const r = await getUserInfo(state.userInfo.id);
  state.userInfo = r.data as SaveOrUpdateUserReq;
};

const avatarHandleExceed = (files: File[]) => {
  avatarPicUpload.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  avatarPicUpload.value!.handleStart(file);
};

const backgroundHandleExceed = (files: File[]) => {
  backgroundPicUpload.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  backgroundPicUpload.value!.handleStart(file);
};

const avatarHandleSuccess = (response: any) => {
  if (response?.code === "200") {
    message("上传成功", { type: "success" });
    state.userInfo.avatarTempFile = response.data;
    state.userInfo.avatarUrl = state.previewPic + state.userInfo.avatarTempFile;
  }
};

const backgroundHandleSuccess = (response: any) => {
  if (response?.code === "200") {
    message("上传成功", { type: "success" });
    state.userInfo.backgroundTempFile = response.data;
    state.userInfo.backgroundPicUrl =
      state.previewPic + state.userInfo.backgroundTempFile;
  }
};

const router = useRouter();
const saveOrUpdateUserButton = async () => {
  const r = await saveOrUpdateUser(state.userInfo);
  if (r.code === "200") {
    message("保存成功", { type: "success" });
    const userStoreHook = useUserStoreHook();
    if (userStoreHook.roles.filter(value => value === "admin") !== -1) {
      await router.push({
        path: "/users"
      });
    }
  }
};
</script>

<template>
  <div>
    <el-form label-position="top" :model="state.userInfo" :rules="loginRules">
      <el-form-item
        label="用户名"
        :rules="[
          {
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
          }
        ]"
        prop="username"
      >
        <el-input v-model="state.userInfo.username" />
      </el-form-item>
      <el-form-item
        label="昵称"
        :rules="[
          {
            required: true,
            message: '请输入昵称',
            trigger: 'blur'
          }
        ]"
        prop="nickname"
      >
        <el-input v-model="state.userInfo.nickname" />
      </el-form-item>
      <el-form-item
        label="密码"
        :rules="[
          {
            required: true,
            message: '请输入密码',
            trigger: 'input'
          }
        ]"
        prop="password"
      >
        <el-input show-password v-model="state.userInfo.password" />
      </el-form-item>
      <el-form-item label="用户头像">
        <div class="w-full flex">
          <el-input :disabled="true" v-model="state.userInfo.avatarUrl" />
          <el-image-viewer
            v-if="state.show.userAvatarPreviewPic"
            :url-list="[state.userInfo.avatarUrl]"
            @close="state.show.userAvatarPreviewPic = false"
          />
          <el-button
            :disabled="
              state.userInfo.avatarUrl == null ||
              state.userInfo.avatarUrl === ''
            "
            @click="state.show.userAvatarPreviewPic = true"
          >
            预览
          </el-button>
          <el-upload
            class="flex justify-center items-center"
            ref="avatarPicUpload"
            :action="state.uploadPicAction"
            :limit="1"
            :show-file-list="false"
            :on-exceed="avatarHandleExceed"
            :on-success="avatarHandleSuccess"
            :auto-upload="true"
          >
            <template #trigger>
              <el-button type="primary"> 上传 </el-button>
            </template>
          </el-upload>
        </div>
      </el-form-item>
      <el-form-item label="用户背景">
        <div class="w-full flex">
          <el-input
            :disabled="true"
            v-model="state.userInfo.backgroundPicUrl"
          />
          <!--
          state.previewPic + state.userInfo.backgroundTempFile
          -->
          <el-image-viewer
            v-if="state.show.userBackgroundPreviewPic"
            :url-list="[state.userInfo.backgroundPicUrl]"
            @close="state.show.userBackgroundPreviewPic = false"
          />
          <el-button
            :disabled="
              state.userInfo.backgroundPicUrl == null ||
              state.userInfo.backgroundPicUrl === ''
            "
            @click="state.show.userBackgroundPreviewPic = true"
          >
            预览
          </el-button>
          <el-upload
            class="flex justify-center items-center"
            ref="backgroundPicUpload"
            :action="state.uploadPicAction"
            :limit="1"
            :show-file-list="false"
            :on-exceed="backgroundHandleExceed"
            :on-success="backgroundHandleSuccess"
            :auto-upload="true"
          >
            <template #trigger>
              <el-button type="primary"> 上传 </el-button>
            </template>
          </el-upload>
        </div>
      </el-form-item>
      <el-form-item label="权限">
        <el-input v-model="state.userInfo.roleName" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="saveOrUpdateUserButton">
          保存
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss" scoped></style>
