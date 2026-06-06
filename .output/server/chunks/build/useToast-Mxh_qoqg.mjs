import { readonly, ref } from 'vue';

const toasts = ref([]);
function useToast() {
  function add(toast) {
    var _a;
    const id = Math.random().toString(36).slice(2);
    toasts.value.push({ id, duration: 4e3, ...toast });
    if (toast.duration !== 0) {
      setTimeout(() => remove(id), (_a = toast.duration) != null ? _a : 4e3);
    }
    return id;
  }
  function remove(id) {
    const idx = toasts.value.findIndex((t) => t.id === id);
    if (idx >= 0) toasts.value.splice(idx, 1);
  }
  const success = (title, message) => add({ type: "success", title, message });
  const error = (title, message) => add({ type: "error", title, message, duration: 6e3 });
  const warning = (title, message) => add({ type: "warning", title, message });
  const info = (title, message) => add({ type: "info", title, message });
  return { toasts: readonly(toasts), add, remove, success, error, warning, info };
}

export { useToast as u };
//# sourceMappingURL=useToast-Mxh_qoqg.mjs.map
