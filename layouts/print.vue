<template>
  <div>
    <slot />
  </div>
</template>

<style>
body {
  background: #fff;
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
}
@media print {
  .no-print { display: none !important; }
}
</style>
