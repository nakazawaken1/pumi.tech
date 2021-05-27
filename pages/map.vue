<template>
  <main id="map" style="height: 100%"></main>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  head() {
    return {
      script: [
        {
          src: "https://api.mapbox.com/mapbox-gl-js/v2.2.0/mapbox-gl.js",
          defer: true,
          body: true,
        },
        {
          src: "/map.js",
          defer: true,
          body: true,
        },
      ],
      link: [
        {
          rel: "stylesheet",
          href: "https://api.mapbox.com/mapbox-gl-js/v2.2.0/mapbox-gl.css",
          body: true,
        },
      ],
    };
  },
});
</script>