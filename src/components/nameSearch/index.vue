<script lang="ts" setup>
import { reactive, watch } from "vue";

const props = defineProps({
  loading: Boolean,
  modelValue: {
    type: String,
    required: true
  },
  buttonName: {
    type: String,
    required: true,
    default: "搜索"
  },
  dropdown: {
    type: Object,
    required: true
  },
  dropdownValue: {
    type: String,
    required: true
  }
});

const state = reactive({
  musicSearchName: "",
  dropdownValue: props.dropdownValue,
  dropdownMap: undefined,
  dropIcon: 360
});

const emits = defineEmits([
  "update:modelValue",
  "on-search",
  "update:dropdownValue",
  "on-clean"
]);

watch(
  () => state.musicSearchName,
  value => {
    emits("update:modelValue", value);
  }
);
watch(
  () => props.modelValue,
  value => {
    state.musicSearchName = value;
  }
);

const clickDropdown = val => {
  state.dropdownValue = val.value;
  emits("update:dropdownValue", val.value);
};

const rotateDropdownIcon = val => {
  if (val) {
    state.dropIcon = 180;
  } else {
    state.dropIcon = 360;
  }
};

const map = new Map();
props.dropdown.forEach(val => {
  map.set(val.value, val.label);
});
state.dropdownMap = map;
</script>
<template>
  <div class="flex flex-nowrap items-center justify-center">
    <div class="group">
      <div class="dropdown">
        <el-dropdown @visible-change="rotateDropdownIcon">
          <div class="flex flex-nowrap items-center gap-2">
            <div class="whitespace-nowrap">
              {{ state.dropdownMap.get(state.dropdownValue) }}
            </div>
            <div
              :style="{
                transform: `rotate(${state.dropIcon}deg)`,
                transition: 'transform 0.4s'
              }"
            >
              <IconifyIconOnline icon="mingcute:down-fill" />
            </div>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="item in props.dropdown"
                :key="item.value"
                @click="clickDropdown(item)"
              >
                {{ item.label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <input
        v-model="state.musicSearchName"
        placeholder="搜索音乐专辑歌手名"
        type="text"
        class="input"
        @keyup.enter="emits('on-search')"
      />
      <transition name="el-fade-in-linear">
        <i
          v-show="state.musicSearchName !== ''"
          class="m-1"
          @click="emits('on-clean')"
        >
          <IconifyIconOnline icon="solar:close-circle-outline" />
        </i>
      </transition>
      <!--todo 删除 Transition-->
      <div class="flex flex-col justify-center m-1 search-bg">
        <el-button
          class="search-button"
          type="primary"
          size="large"
          round
          @click="emits('on-search')"
        >
          {{ props.buttonName }}
        </el-button>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
* {
  //border: 1px solid red;
}

.group {
  position: relative;
  display: -webkit-box;
  display: flexbox;
  display: flex;
  align-items: center;
  width: 70%;
  height: 3.2rem;
  line-height: 28px;
  background-color: var(--el-color-info-light-9);
  border-radius: 1rem;
  -webkit-box-align: center;
  -ms-flex-align: center;

  @media screen and (width <= 720px) {
    width: 100%;
  }
}

.group::placeholder {
  color: #9e9ea7;
}

.group:focus,
.group:hover {
  background-color: var(--el-color-info-light-9);
  border-color: rgb(var(--el-color-primary-rgb) 0.4);
  outline: none;
  box-shadow: 0 0 0 4px var(--el-color-primary-light-8);
}

.dropdown {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: center;
  width: 6rem;
  height: 3.2rem;
  margin-left: 1rem;
  background: transparent;
  border-radius: 1rem;
}

.input {
  width: 100%;
  line-height: 28px;
  color: var(--el-text-color-primary);
  background-color: var(--el-color-info-light-9);
  border: 2px solid transparent;
  outline: none;
  transition: 0.3s ease;
}

.search-bg {
  background-color: var(--el-color-info-light-9);
}

.icon {
  position: absolute;
  left: 1rem;
  height: 1rem;
  fill: #9e9ea7;
}
</style>
