<template>
  <article>
    <h1>{{ content.title }}</h1>
    <nuxt-content :document="content" />
  </article>
</template>

<script lang="ts">
import Vue from "vue";
import { Context } from "@nuxt/types";
export default Vue.extend({
  async asyncData({ $content, params }: Context) {
    return {
      content: await $content(params.slug).fetch(),
    };
  },
});
</script>