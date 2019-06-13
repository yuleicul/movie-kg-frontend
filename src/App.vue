<template>
  <div id="app">
    <!-- <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/search">About</router-link>
    </div> -->
    <router-view/>
  </div>
</template>

<style>
html, body, #app, .home, .graph {
  height: 100%;
  /* width: 1 */
}

body {
  margin: 0
}
</style>
