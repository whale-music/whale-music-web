<script lang="ts" setup>
import { computed, ref } from "vue";

import { FilterTermsRes } from "@/api/storefile";

const checkAll = ref(true);
const isIndeterminate = ref(false);

const props = defineProps<{
  modelValue: string[];
  cities: FilterTermsRes[];
}>();

const emit = defineEmits([
  "update:modelValue",
  "update:checkedCities",
  "update:cities",
  "updateCheckout"
]);

const checkedCities = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  }
});

const cities = computed({
  get() {
    return props.cities;
  },
  set(value) {
    emit("update:cities", value);
  }
});

const handleCheckAllChange = (val: boolean) => {
  checkedCities.value = val
    ? cities.value.map(value => value.name)
    : ([] as string[]);
  isIndeterminate.value = false;
  emit("updateCheckout", checkedCities.value);
};
const handleCheckedCitiesChange = (value: string[]) => {
  const checkedCount = value.length;
  checkAll.value = checkedCount === cities.value.length;
  isIndeterminate.value =
    checkedCount > 0 && checkedCount < cities.value.length;
  emit("updateCheckout", checkedCities.value);
};
</script>
<template>
  <el-checkbox
    v-model="checkAll"
    :indeterminate="isIndeterminate"
    @change="handleCheckAllChange"
  >
    全选
  </el-checkbox>
  <el-checkbox-group
    v-model="checkedCities"
    class="flex flex-col"
    @change="handleCheckedCitiesChange"
  >
    <el-checkbox v-for="city in cities" :key="city.name" :value="city.name">
      <div class="w-full flex justify-between">
        <span>{{ city.name }}</span>
        <span>{{ city.count }}</span>
      </div>
    </el-checkbox>
  </el-checkbox-group>
</template>
<style lang="scss" scoped>
:deep(.el-checkbox__label) {
  width: 100%;
}

:deep(.el-checkbox:last-of-type) {
  margin-right: 30px;
}
</style>
