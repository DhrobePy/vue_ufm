import { defineComponent, ref, computed, watch, mergeProps, unref, getCurrentScope, onScopeDispose, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderStyle, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';

function tryOnScopeDispose(fn) {
  if (getCurrentScope()) {
    onScopeDispose(fn);
    return true;
  }
  return false;
}
function toValue(r) {
  return typeof r === "function" ? r() : unref(r);
}
typeof WorkerGlobalScope !== "undefined" && globalThis instanceof WorkerGlobalScope;
const toString = Object.prototype.toString;
const isObject = (val) => toString.call(val) === "[object Object]";
const noop = () => {
};
const defaultWindow = void 0;
function unrefElement(elRef) {
  var _a;
  const plain = toValue(elRef);
  return (_a = plain == null ? void 0 : plain.$el) != null ? _a : plain;
}
function useEventListener(...args) {
  let target;
  let events2;
  let listeners;
  let options;
  if (typeof args[0] === "string" || Array.isArray(args[0])) {
    [events2, listeners, options] = args;
    target = defaultWindow;
  } else {
    [target, events2, listeners, options] = args;
  }
  if (!target)
    return noop;
  if (!Array.isArray(events2))
    events2 = [events2];
  if (!Array.isArray(listeners))
    listeners = [listeners];
  const cleanups = [];
  const cleanup = () => {
    cleanups.forEach((fn) => fn());
    cleanups.length = 0;
  };
  const register = (el, event, listener, options2) => {
    el.addEventListener(event, listener, options2);
    return () => el.removeEventListener(event, listener, options2);
  };
  const stopWatch = watch(
    () => [unrefElement(target), toValue(options)],
    ([el, options2]) => {
      cleanup();
      if (!el)
        return;
      const optionsClone = isObject(options2) ? { ...options2 } : options2;
      cleanups.push(
        ...events2.flatMap((event) => {
          return listeners.map((listener) => register(el, event, listener, optionsClone));
        })
      );
    },
    { immediate: true, flush: "post" }
  );
  const stop = () => {
    stopWatch();
    cleanup();
  };
  tryOnScopeDispose(stop);
  return stop;
}
function onClickOutside(target, handler, options = {}) {
  const { window: window2 = defaultWindow, ignore = [], capture = true, detectIframe = false } = options;
  if (!window2)
    return noop;
  let shouldListen = true;
  const shouldIgnore = (event) => {
    return toValue(ignore).some((target2) => {
      if (typeof target2 === "string") {
        return Array.from(window2.document.querySelectorAll(target2)).some((el) => el === event.target || event.composedPath().includes(el));
      } else {
        const el = unrefElement(target2);
        return el && (event.target === el || event.composedPath().includes(el));
      }
    });
  };
  function hasMultipleRoots(target2) {
    const vm = toValue(target2);
    return vm && vm.$.subTree.shapeFlag === 16;
  }
  function checkMultipleRoots(target2, event) {
    const vm = toValue(target2);
    const children = vm.$.subTree && vm.$.subTree.children;
    if (children == null || !Array.isArray(children))
      return false;
    return children.some((child) => child.el === event.target || event.composedPath().includes(child.el));
  }
  const listener = (event) => {
    const el = unrefElement(target);
    if (event.target == null)
      return;
    if (!(el instanceof Element) && hasMultipleRoots(target) && checkMultipleRoots(target, event))
      return;
    if (!el || el === event.target || event.composedPath().includes(el))
      return;
    if (event.detail === 0)
      shouldListen = !shouldIgnore(event);
    if (!shouldListen) {
      shouldListen = true;
      return;
    }
    handler(event);
  };
  let isProcessingClick = false;
  const cleanup = [
    useEventListener(window2, "click", (event) => {
      if (!isProcessingClick) {
        isProcessingClick = true;
        setTimeout(() => {
          isProcessingClick = false;
        }, 0);
        listener(event);
      }
    }, { passive: true, capture }),
    useEventListener(window2, "pointerdown", (e) => {
      const el = unrefElement(target);
      shouldListen = !shouldIgnore(e) && !!(el && !e.composedPath().includes(el));
    }, { passive: true }),
    detectIframe && useEventListener(window2, "blur", (event) => {
      setTimeout(() => {
        var _a;
        const el = unrefElement(target);
        if (((_a = window2.document.activeElement) == null ? void 0 : _a.tagName) === "IFRAME" && !(el == null ? void 0 : el.contains(window2.document.activeElement))) {
          handler(event);
        }
      }, 0);
    })
  ].filter(Boolean);
  const stop = () => cleanup.forEach((fn) => fn());
  return stop;
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "SearchSelect",
  __ssrInlineRender: true,
  props: {
    modelValue: {},
    options: {},
    placeholder: {}
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const query = ref("");
    const open = ref(false);
    const rootRef = ref(null);
    onClickOutside(rootRef, () => {
      open.value = false;
      syncQueryToSelection();
    });
    const selected = computed(
      () => {
        var _a;
        return (_a = props.options.find((o) => {
          var _a2;
          return String(o.value) === String((_a2 = props.modelValue) != null ? _a2 : "");
        })) != null ? _a : null;
      }
    );
    function syncQueryToSelection() {
      var _a, _b;
      query.value = (_b = (_a = selected.value) == null ? void 0 : _a.label) != null ? _b : "";
    }
    watch(selected, syncQueryToSelection, { immediate: true });
    const filtered = computed(() => {
      const q = query.value.trim().toLowerCase();
      if (!q || selected.value && q === selected.value.label.toLowerCase()) return props.options;
      return props.options.filter(
        (o) => {
          var _a;
          return o.label.toLowerCase().includes(q) || ((_a = o.sub) != null ? _a : "").toLowerCase().includes(q);
        }
      );
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "relative",
        ref_key: "rootRef",
        ref: rootRef
      }, _attrs))}><div class="relative"><input${ssrRenderAttr("value", unref(query))} type="text" class="input-glass w-full pr-8"${ssrRenderAttr("placeholder", __props.placeholder)} autocomplete="off">`);
      if (__props.modelValue) {
        _push(`<button type="button" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg></button>`);
      } else {
        _push(`<svg class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path stroke-linecap="round" d="M21 21l-4.35-4.35"></path></svg>`);
      }
      _push(`</div>`);
      if (unref(open) && unref(filtered).length) {
        _push(`<div class="absolute left-0 right-0 top-full mt-1 z-30 rounded-xl max-h-56 overflow-y-auto py-1.5" style="${ssrRenderStyle({ "background": "rgba(18,18,20,0.98)", "border": "1px solid rgba(255,255,255,0.10)", "box-shadow": "0 16px 40px rgba(0,0,0,0.65)", "backdrop-filter": "blur(20px)" })}"><!--[-->`);
        ssrRenderList(unref(filtered), (opt) => {
          _push(`<button type="button" class="w-full text-left px-4 py-2.5 hover:bg-white/[0.07] transition-colors"><span class="text-sm text-gray-100 font-medium">${ssrInterpolate(opt.label)}</span>`);
          if (opt.sub) {
            _push(`<span class="text-xs text-gray-500 ml-2">${ssrInterpolate(opt.sub)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</button>`);
        });
        _push(`<!--]--></div>`);
      } else if (unref(open) && unref(query).length >= 1 && !unref(filtered).length) {
        _push(`<div class="absolute left-0 right-0 top-full mt-1 z-30 rounded-xl py-3 text-center text-xs text-gray-500" style="${ssrRenderStyle({ "background": "rgba(18,18,20,0.98)", "border": "1px solid rgba(255,255,255,0.10)", "box-shadow": "0 16px 40px rgba(0,0,0,0.65)" })}"> No match for &quot;${ssrInterpolate(unref(query))}&quot; </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/SearchSelect.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=SearchSelect-tVsYmwju.mjs.map
