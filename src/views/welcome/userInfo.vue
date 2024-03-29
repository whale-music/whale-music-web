<script lang="ts" setup>
import {
  genFileId,
  UploadInstance,
  UploadProps,
  UploadRawFile
} from "element-plus";
import { defineComponent, onMounted, reactive, ref } from "vue";

import { SaveOrUpdateUserRes } from "@/api/model/User";
import { getUserInfo, updateUserPassword } from "@/api/user";
import { getUserData } from "@/utils/auth";
import { message } from "@/utils/message";

defineComponent({
  name: "userInfo"
});

const { VITE_PROXY_HOST } = import.meta.env;
const proxyHost = VITE_PROXY_HOST == null ? "" : VITE_PROXY_HOST;
const picUpload = ref<UploadInstance>();
const state = reactive({
  dialog: {
    viewerFlagAvatarPic: false,
    viewerFlagBackgroundPic: false
  },
  userInfo: {} as SaveOrUpdateUserRes,
  subAccount: Array<Map<string, string>>([]),
  uploadPicAction: `${proxyHost}/admin/pic/upload`
});

onMounted(() => {
  initInfo();
});

const initInfo = async () => {
  const item = getUserData();
  const userInfo = await getUserInfo(Number(item.id));
  if (userInfo.code === "200") {
    state.userInfo = userInfo.data;
    state.subAccount = JSON.parse(userInfo.data.subAccountPassword);
  }
};

const updateUser = async () => {
  state.userInfo.subAccountPassword = JSON.stringify(state.subAccount);
  const r = await updateUserPassword(state.userInfo);
  if (r.code === "200") {
    message("保存成功", { type: "success" });
    await initInfo();
  }
};

const addSubAccount = () => {
  if (!state.subAccount) {
    state.subAccount = [];
  }
  state.subAccount.push({});
};

const removeSubAccount = index => {
  state.subAccount.splice(index, 1);
};

// 上传封面
const handleExceed: UploadProps["onExceed"] = files => {
  picUpload.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  picUpload.value!.handleStart(file);
};

const handleSuccess = (response: any) => {
  if (response.code == 200) {
    initInfo();
    message("封面更新成功", { type: "success" });
  } else {
    message("封面更新失败", { type: "error" });
  }
};
</script>

<template>
  <div>
    <el-form label-position="top">
      <el-form-item label="用户名">
        <el-input v-model="state.userInfo.username" />
      </el-form-item>
      <el-form-item label="昵称">
        <el-input v-model="state.userInfo.nickname" />
      </el-form-item>
      <el-form-item label="头像">
        <div class="flex w-full gap-1">
          <el-input v-model="state.userInfo.avatarUrl" disabled />
          <el-image-viewer
            v-if="state.dialog.viewerFlagAvatarPic"
            :url-list="[state.userInfo.avatarUrl]"
            @close="state.dialog.viewerFlagAvatarPic = false"
          />
          <el-button
            type="primary"
            @click="state.dialog.viewerFlagAvatarPic = true"
            >预览</el-button
          >
          <el-upload
            ref="picUpload"
            class="flex justify-center items-center"
            :data="{ id: state.userInfo.id, type: 'userAvatar' }"
            :action="state.uploadPicAction"
            :limit="1"
            :show-file-list="false"
            :on-exceed="handleExceed"
            :on-success="handleSuccess"
            :auto-upload="true"
          >
            <template #trigger>
              <el-button type="success">上传</el-button>
            </template>
          </el-upload>
        </div>
      </el-form-item>
      <el-form-item label="背景">
        <div class="flex w-full gap-1">
          <el-input v-model="state.userInfo.backgroundPicUrl" disabled />
          <el-image-viewer
            v-if="state.dialog.viewerFlagBackgroundPic"
            :url-list="[state.userInfo.backgroundPicUrl]"
            @close="state.dialog.viewerFlagBackgroundPic = false"
          />
          <el-button
            type="primary"
            @click="state.dialog.viewerFlagBackgroundPic = true"
            >预览</el-button
          >
          <el-upload
            ref="picUpload"
            class="flex justify-center items-center"
            :data="{ id: state.userInfo.id, type: 'userBackground' }"
            :action="state.uploadPicAction"
            :limit="1"
            :show-file-list="false"
            :on-exceed="handleExceed"
            :on-success="handleSuccess"
            :auto-upload="true"
          >
            <template #trigger>
              <el-button type="success">上传</el-button>
            </template>
          </el-upload>
        </div>
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="state.userInfo.password" show-password />
      </el-form-item>
      <br />
      <div class="flex gap-4">
        <h3>子账户</h3>
        <el-button type="primary" @click="addSubAccount">添加</el-button>
      </div>
      <div>
        <div
          v-for="(item, index) in state.subAccount"
          :key="item"
          class="flex gap-4"
        >
          <el-form-item required>
            <template #label>
              <el-tooltip
                content="无实际作用，仅用于账户标识。方便用户分辨子账户"
              >
                <b>子账户名备注 ⓘ</b>
              </el-tooltip>
            </template>
            <el-input v-model="item['name']" placeholder="请输入账户备注" />
          </el-form-item>
          <el-form-item label="账户" required>
            <el-input v-model="item['account']" placeholder="请输入账户" />
          </el-form-item>
          <el-form-item label="密码" required>
            <el-input
              v-model="item['password']"
              show-password
              clearable
              style="width: 200px"
              placeholder="请输入密码"
            />
          </el-form-item>
          <el-form-item label="操作">
            <el-button type="danger" @click="removeSubAccount(index)">
              删除
            </el-button>
          </el-form-item>
        </div>
      </div>
      <br />
      <el-form-item>
        <div class="flex flex-row-reverse w-full">
          <el-button type="primary" @click="updateUser">保存</el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>
