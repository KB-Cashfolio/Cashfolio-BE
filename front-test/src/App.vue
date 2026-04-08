<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
/* 전역 스타일 설정 */
body {
  margin: 0;
  padding: 0;
  background-color: #f8fafc;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.main-nav {
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  padding: 15px 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-content {
  max-width: 430px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.nav-logo {
  font-weight: 800;
  text-decoration: none;
  color: #0f172a;
}

.nav-links a {
  text-decoration: none;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
}

.nav-links a.active {
  color: #0f172a;
}
</style>
