<template>
  <!-- This is where pages get injected -->
  <router-view />
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ChildrenLayout',
});
</script>
