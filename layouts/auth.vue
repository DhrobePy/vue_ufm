<template>
  <!-- Full-screen centered auth layout -->
  <div class="min-h-screen flex items-center justify-center relative overflow-hidden bg-surface-500">

    <!-- Ambient background orbs -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-20"
           style="background: radial-gradient(circle, #f59e0b 0%, transparent 70%); filter: blur(80px);" />
      <div class="absolute -bottom-60 -right-40 w-[700px] h-[700px] rounded-full opacity-10"
           style="background: radial-gradient(circle, #d97706 0%, transparent 70%); filter: blur(100px);" />
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-5"
           style="background: radial-gradient(circle, #fbbf24 0%, transparent 70%); filter: blur(60px);" />
    </div>

    <!-- Grid pattern overlay -->
    <div class="absolute inset-0 opacity-[0.03]"
         style="background-image: linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px); background-size: 40px 40px;" />

    <slot />
  </div>
</template>
