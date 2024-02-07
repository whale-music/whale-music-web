<script lang="ts" setup>
import { defineComponent, onMounted, reactive } from "vue";

import { Data } from "@/api/model/common";
import {
  PageUserReq,
  PageUserRes,
  SaveOrUpdateUserReq
} from "@/api/model/User";
import { deleteUser, getUserPage, saveOrUpdateUser } from "@/api/user";
import { message } from "@/utils/message";

defineComponent({
  name: "users"
});

const state = reactive({
  loading: {
    initFlag: false
  },
  flag: {
    addUserDialog: false
  },
  pageReq: {} as PageUserReq,
  pageRes: {} as Data<PageUserRes>
});

onMounted(() => {
  initInfo();
});

function initInfo() {
  state.loading.initFlag = true;
  getPageUserMethod();
  state.loading.initFlag = false;
}

const getPageUserMethod = async () => {
  const r = await getUserPage(state.pageReq);
  state.pageRes = r.data;
};
const updateUserInfo = async (user: SaveOrUpdateUserReq) => {
  const r = await saveOrUpdateUser(user);
  if (r?.code === "200") {
    message(`${r.data.status ? "启用" : "禁用"}成功`, { type: "success" });
  }
  initInfo();
};

const deleteUserButton = async (id: number) => {
  const r = await deleteUser(id);
  if (r.code === "200") {
    message("删除成功", { type: "success" });
    initInfo();
  }
};
</script>

<template>
  <div>
    <div class="flex gap-2">
      <el-button type="success" @click="initInfo">刷新</el-button>
      <router-link to="/userManagement/">
        <el-button type="primary"> 添加用户 </el-button>
      </router-link>
    </div>
    <el-table :data="state.pageRes.records" :key="state.pageRes.records">
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="nickname" label="用户昵称" />
      <el-table-column prop="roleName" label="角色">
        <template #default="scope">
          <el-tag>{{ scope.row.roleName }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="lastLoginIp" label="登录地址" />
      <el-table-column label="用户状态">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            @change="updateUserInfo(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column>
        <template #header>
          <el-input
            v-model="state.pageReq.username"
            size="default"
            placeholder="搜索用户"
            :clearable="true"
            @change="value => value === '' && initInfo()"
            @clear="initInfo"
            @keydown.enter="initInfo"
          />
        </template>
        <template #default="scope">
          <div class="flex gap-1">
            <router-link :to="`/userManagement/${scope.row.id}`">
              <el-button type="primary"> 编辑 </el-button>
            </router-link>
            <el-popconfirm
              title="确认删除吗?"
              @confirm="deleteUserButton(scope.row.id)"
            >
              <template #reference>
                <el-button type="danger"> 删除 </el-button>
              </template>
            </el-popconfirm>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style lang="scss" scoped></style>
