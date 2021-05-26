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
      <aside>サイドバー</aside>
    </div>
    <footer>フッタ</footer>
  </div>
</template>

<style lang="scss" scoped>
.html {
  max-width: 102.4rem;
  margin: 0 auto;
  font-size: 1.3rem;
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
    }
  }
  footer {
    background-color: #121;
    color: #fff;
    padding: 1rem;
  }
  .body {
    display: flex;
    aside {
      width: 20rem;
      padding: 1rem;
      @media (max-width: 320px) {
        display: none;
      }
      background-color: #aaa;
    }
    .main {
      flex: 1 1 auto;
      background-color: #0b7b7b;
      color: #f1f1f1;
      padding: 1rem;
      min-height: 90rem;
    }
  }
}
</style>