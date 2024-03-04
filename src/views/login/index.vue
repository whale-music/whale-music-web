<script setup lang="ts">
import Check from "@iconify-icons/ep/check";
import Lock from "@iconify-icons/ri/lock-fill";
import User from "@iconify-icons/ri/user-3-fill";
import { debounce, isAllEmpty } from "@pureadmin/utils";
import type { FormInstance } from "element-plus";
import { onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import darkIcon from "@/assets/svg/dark.svg?component";
import dayIcon from "@/assets/svg/day.svg?component";
import globalization from "@/assets/svg/globalization.svg?component";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { useDataThemeChange } from "@/layout/hooks/useDataThemeChange";
import { useLayout } from "@/layout/hooks/useLayout";
import { useNav } from "@/layout/hooks/useNav";
import { useTranslationLang } from "@/layout/hooks/useTranslationLang";
import { $t, transformI18n } from "@/plugins/i18n";
import { getTopMenu, initRouter } from "@/router/utils";
import { useUserStoreHook } from "@/store/modules/user";
import { message } from "@/utils/message";

import Motion from "./utils/motion";
import { loginRules } from "./utils/rule";
import { avatar } from "./utils/static";

defineOptions({
  name: "Login"
});
const router = useRouter();
const loading = ref(false);
const ruleFormRef = ref<FormInstance>();

const { initStorage } = useLayout();
initStorage();

const { t } = useI18n();
const { dataTheme, dataThemeChange } = useDataThemeChange();
dataThemeChange();
const { title, getDropdownItemStyle, getDropdownItemClass } = useNav();
const { locale, translationCh, translationEn } = useTranslationLang();

const ruleForm = reactive({
  username: "admin",
  password: "PeZUX5Mkc1vm"
});

const onLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      loading.value = true;
      useUserStoreHook()
        .loginByUsername({
          username: ruleForm.username,
          password: ruleForm.password
        })
        .then(res => {
          if (res.code === "200") {
            // 获取后端路由
            initRouter().then(() => {
              const redirect = router.currentRoute.value.query["redirect"];
              const to = isAllEmpty(redirect)
                ? getTopMenu(true).path
                : redirect;
              router.push(to).then(() => {
                message(t("msg.loginSuccess"), { type: "success" });
              });
            });
          } else {
            loading.value = false;
            message(res.message, { type: "error" });
          }
        })
        .catch(error => {
          console.log(error);
          if (error.response.status === 500) {
            message(t("msg.serverError"), { type: "error" });
          }
        });
    } else {
      loading.value = false;
      return fields;
    }
    loading.value = false;
    return fields;
  });
};

const immediateDebounceParams: any = debounce(onLogin, 1000, true);

/** 使用公共函数，避免`removeEventListener`失效 */
function onkeypress({ code }: KeyboardEvent) {
  if (code === "Enter") {
    onLogin(ruleFormRef.value);
  }
}
const rules = [
  {
    required: true,
    message: transformI18n($t("login.usernameReg")),
    trigger: "blur"
  }
];

onMounted(() => {
  window.document.addEventListener("keypress", onkeypress);
});

onBeforeUnmount(() => {
  window.document.removeEventListener("keypress", onkeypress);
});
</script>

<template>
  <div class="select-none">
    <!--<img :src="bg" class="wave" />-->
    <div class="absolute flex-c right-5 top-3">
      <!-- 主题 -->
      <el-switch
        v-model="dataTheme"
        inline-prompt
        :active-icon="dayIcon"
        :inactive-icon="darkIcon"
        @change="dataThemeChange"
      />
      <!-- 国际化 -->
      <el-dropdown trigger="click">
        <globalization
          class="hover:text-primary hover:!bg-[transparent] w-[20px] h-[20px] ml-1.5 cursor-pointer outline-none duration-300"
        />
        <template #dropdown>
          <el-dropdown-menu class="translation">
            <el-dropdown-item
              :style="getDropdownItemStyle(locale, 'zh')"
              :class="['dark:!text-white', getDropdownItemClass(locale, 'zh')]"
              @click="translationCh"
            >
              <IconifyIconOffline
                v-show="locale === 'zh'"
                class="check-zh"
                :icon="Check"
              />
              简体中文
            </el-dropdown-item>
            <el-dropdown-item
              :style="getDropdownItemStyle(locale, 'en')"
              :class="['dark:!text-white', getDropdownItemClass(locale, 'en')]"
              @click="translationEn"
            >
              <span v-show="locale === 'en'" class="check-en">
                <IconifyIconOffline :icon="Check" />
              </span>
              English
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <div class="login-container">
      <!--<div class="img">
        <component :is="toRaw(illustration)" />
      </div>-->
      <div class="login-box">
        <div class="login-form">
          <avatar class="avatar" />
          <Motion>
            <h2 class="outline-none">{{ title }}</h2>
          </Motion>

          <el-form
            ref="ruleFormRef"
            :model="ruleForm"
            :rules="loginRules"
            size="large"
          >
            <Motion :delay="100">
              <el-form-item :rules="rules" prop="username">
                <el-input
                  v-model="ruleForm.username"
                  clearable
                  :placeholder="t('login.username')"
                  :prefix-icon="useRenderIcon(User)"
                />
              </el-form-item>
            </Motion>

            <Motion :delay="150">
              <el-form-item prop="password">
                <el-input
                  v-model="ruleForm.password"
                  clearable
                  show-password
                  :placeholder="t('login.password')"
                  :prefix-icon="useRenderIcon(Lock)"
                />
              </el-form-item>
            </Motion>

            <Motion :delay="250">
              <el-button
                class="w-full mt-4"
                size="large"
                type="primary"
                :loading="loading"
                @click="immediateDebounceParams(ruleFormRef)"
              >
                {{ t("login.login") }}
              </el-button>
            </Motion>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url("@/style/login.css");
</style>

<style lang="scss" scoped>
:deep(.el-input-group__append, .el-input-group__prepend) {
  padding: 0;
}

.translation {
  ::v-deep(.el-dropdown-menu__item) {
    padding: 5px 40px;
  }

  .check-zh {
    position: absolute;
    left: 20px;
  }

  .check-en {
    position: absolute;
    left: 20px;
  }
}
</style>
