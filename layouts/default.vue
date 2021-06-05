<template>
  <div class="html">
    <header>
      <a href="/">ぷみてく</a>
      <nav>
        <font-awesome-icon icon="search" />
        <font-awesome-icon icon="bell" />
        <font-awesome-icon icon="user-circle" />
      </nav>
    </header>
    <div class="body">
      <div class="main"><Nuxt /></div>
      <aside v-if="!sidebar_disabled" :class="{ visible }">
        <ul>
          <li><a href="/map">地図</a></li>
          <li><a href="/typing">タイピング練習</a></li>
          <li><a href="/todo">Todo</a></li>
        </ul>
      </aside>
    </div>
    <footer><a href="https://twitter.com/intent/tweet?text=%E3%81%B7%E3%81%BF%E3%81%A6%E3%81%8F&url=https%3A%2F%2Fpumi.tech">&copy; 2021 nakazawaken1</a></footer>
    <menu
      ><font-awesome-icon
        :icon="visible ? 'times' : 'bars'"
        @click="visible = !visible"
    /></menu>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  data() {
    return {
      visible: false,
      sidebar_disabled: false,
    };
  },
  created() {
    this.$nuxt.$on(
      "sidebar_disabled",
      (value: boolean) => (this.sidebar_disabled = value)
    );
  },
});
</script>

<style lang="scss" scoped>
.html {
  max-width: 102.4rem;
  margin: 0 auto;
  font-size: 1.3rem;
  @media (max-width: 320px) {
    padding-bottom: 5rem;
  }
  header {
    display: flex;
    align-items: center;
    background-color: #121;
    color: #fff;
    padding: 1rem;
    > a {
      font-size: 1.5rem;
    }
    nav {
      text-align: right;
      flex: 1 1 auto;
      font-size: 2rem;
      letter-spacing: 1rem;
    }
  }
  footer {
    background-color: #121;
    color: #fff;
    padding: 1rem;
  }
  .body {
    display: flex;
    position: relative;
    aside {
      width: 25rem;
      padding: 1rem;
      @media (max-width: 320px) {
        white-space: nowrap;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        width: 0;
        opacity: 0;
        transition: 0.5s;
        transition-timing-function: ease-in-out;
        &.visible {
          width: 25rem;
          opacity: 1;
        }
      }
      background-color: #aaa;
      min-height: 90rem;
    }
    .main {
      flex: 1 1 auto;
      background-color: #0b7b7b;
      color: #f1f1f1;
      padding: 1rem;
      min-height: 90rem;
    }
  }
  menu {
    @media (min-width: 321px) {
      display: none;
    }
    ul {
      padding: 0;
      list-style-type: none;
    }
    z-index: 999;
    padding: 1rem 2rem;
    font-size: 2rem;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #eee;
  }
}
</style>