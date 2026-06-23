import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import http, { Server as Server$1 } from 'node:http';
import https, { Server } from 'node:https';
import nodeCrypto, { createHash } from 'node:crypto';
import { EventEmitter } from 'node:events';
import { Buffer as Buffer$1 } from 'node:buffer';
import { promises, existsSync } from 'node:fs';
import { resolve as resolve$1, dirname as dirname$1, join } from 'node:path';
import mysql from 'mysql2/promise';
import { fileURLToPath } from 'node:url';

const subtle = nodeCrypto.webcrypto?.subtle || {};
const randomUUID = () => {
  return nodeCrypto.randomUUID();
};
const getRandomValues = (array) => {
  return nodeCrypto.webcrypto.getRandomValues(array);
};
const _crypto = {
  randomUUID,
  getRandomValues,
  subtle
};

const suspectProtoRx = /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/;
const suspectConstructorRx = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
const JsonSigRx = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
function jsonParseTransform(key, value) {
  if (key === "__proto__" || key === "constructor" && value && typeof value === "object" && "prototype" in value) {
    warnKeyDropped(key);
    return;
  }
  return value;
}
function warnKeyDropped(key) {
  console.warn(`[destr] Dropping "${key}" key to prevent prototype pollution.`);
}
function destr(value, options = {}) {
  if (typeof value !== "string") {
    return value;
  }
  if (value[0] === '"' && value[value.length - 1] === '"' && value.indexOf("\\") === -1) {
    return value.slice(1, -1);
  }
  const _value = value.trim();
  if (_value.length <= 9) {
    switch (_value.toLowerCase()) {
      case "true": {
        return true;
      }
      case "false": {
        return false;
      }
      case "undefined": {
        return void 0;
      }
      case "null": {
        return null;
      }
      case "nan": {
        return Number.NaN;
      }
      case "infinity": {
        return Number.POSITIVE_INFINITY;
      }
      case "-infinity": {
        return Number.NEGATIVE_INFINITY;
      }
    }
  }
  if (!JsonSigRx.test(value)) {
    if (options.strict) {
      throw new SyntaxError("[destr] Invalid JSON");
    }
    return value;
  }
  try {
    if (suspectProtoRx.test(value) || suspectConstructorRx.test(value)) {
      if (options.strict) {
        throw new Error("[destr] Possible prototype pollution");
      }
      return JSON.parse(value, jsonParseTransform);
    }
    return JSON.parse(value);
  } catch (error) {
    if (options.strict) {
      throw error;
    }
    return value;
  }
}

const HASH_RE = /#/g;
const AMPERSAND_RE = /&/g;
const SLASH_RE = /\//g;
const EQUAL_RE = /=/g;
const IM_RE = /\?/g;
const PLUS_RE = /\+/g;
const ENC_CARET_RE = /%5e/gi;
const ENC_BACKTICK_RE = /%60/gi;
const ENC_PIPE_RE = /%7c/gi;
const ENC_SPACE_RE = /%20/gi;
const ENC_SLASH_RE = /%2f/gi;
const ENC_ENC_SLASH_RE = /%252f/gi;
function encode(text) {
  return encodeURI("" + text).replace(ENC_PIPE_RE, "|");
}
function encodeQueryValue(input) {
  return encode(typeof input === "string" ? input : JSON.stringify(input)).replace(PLUS_RE, "%2B").replace(ENC_SPACE_RE, "+").replace(HASH_RE, "%23").replace(AMPERSAND_RE, "%26").replace(ENC_BACKTICK_RE, "`").replace(ENC_CARET_RE, "^").replace(SLASH_RE, "%2F");
}
function encodeQueryKey(text) {
  return encodeQueryValue(text).replace(EQUAL_RE, "%3D");
}
function encodePath(text) {
  return encode(text).replace(HASH_RE, "%23").replace(IM_RE, "%3F").replace(ENC_ENC_SLASH_RE, "%2F").replace(AMPERSAND_RE, "%26").replace(PLUS_RE, "%2B");
}
function decode$1(text = "") {
  try {
    return decodeURIComponent("" + text);
  } catch {
    return "" + text;
  }
}
function decodePath(text) {
  return decode$1(text.replace(ENC_SLASH_RE, "%252F"));
}
function decodeQueryKey(text) {
  return decode$1(text.replace(PLUS_RE, " "));
}
function decodeQueryValue(text) {
  return decode$1(text.replace(PLUS_RE, " "));
}

function parseQuery(parametersString = "") {
  const object = /* @__PURE__ */ Object.create(null);
  if (parametersString[0] === "?") {
    parametersString = parametersString.slice(1);
  }
  for (const parameter of parametersString.split("&")) {
    const s = parameter.match(/([^=]+)=?(.*)/) || [];
    if (s.length < 2) {
      continue;
    }
    const key = decodeQueryKey(s[1]);
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = decodeQueryValue(s[2] || "");
    if (object[key] === void 0) {
      object[key] = value;
    } else if (Array.isArray(object[key])) {
      object[key].push(value);
    } else {
      object[key] = [object[key], value];
    }
  }
  return object;
}
function encodeQueryItem(key, value) {
  if (typeof value === "number" || typeof value === "boolean") {
    value = String(value);
  }
  if (!value) {
    return encodeQueryKey(key);
  }
  if (Array.isArray(value)) {
    return value.map(
      (_value) => `${encodeQueryKey(key)}=${encodeQueryValue(_value)}`
    ).join("&");
  }
  return `${encodeQueryKey(key)}=${encodeQueryValue(value)}`;
}
function stringifyQuery(query) {
  return Object.keys(query).filter((k) => query[k] !== void 0).map((k) => encodeQueryItem(k, query[k])).filter(Boolean).join("&");
}

const PROTOCOL_STRICT_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{1,2})/;
const PROTOCOL_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{2})?/;
const PROTOCOL_RELATIVE_REGEX = /^([/\\]\s*){2,}[^/\\]/;
const PROTOCOL_SCRIPT_RE = /^[\s\0]*(blob|data|javascript|vbscript):$/i;
const TRAILING_SLASH_RE = /\/$|\/\?|\/#/;
const JOIN_LEADING_SLASH_RE = /^\.?\//;
function hasProtocol(inputString, opts = {}) {
  if (typeof opts === "boolean") {
    opts = { acceptRelative: opts };
  }
  if (opts.strict) {
    return PROTOCOL_STRICT_REGEX.test(inputString);
  }
  return PROTOCOL_REGEX.test(inputString) || (opts.acceptRelative ? PROTOCOL_RELATIVE_REGEX.test(inputString) : false);
}
function isScriptProtocol(protocol) {
  return !!protocol && PROTOCOL_SCRIPT_RE.test(protocol);
}
function hasTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return input.endsWith("/");
  }
  return TRAILING_SLASH_RE.test(input);
}
function withoutTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return (hasTrailingSlash(input) ? input.slice(0, -1) : input) || "/";
  }
  if (!hasTrailingSlash(input, true)) {
    return input || "/";
  }
  let path = input;
  let fragment = "";
  const fragmentIndex = input.indexOf("#");
  if (fragmentIndex !== -1) {
    path = input.slice(0, fragmentIndex);
    fragment = input.slice(fragmentIndex);
  }
  const [s0, ...s] = path.split("?");
  const cleanPath = s0.endsWith("/") ? s0.slice(0, -1) : s0;
  return (cleanPath || "/") + (s.length > 0 ? `?${s.join("?")}` : "") + fragment;
}
function withTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return input.endsWith("/") ? input : input + "/";
  }
  if (hasTrailingSlash(input, true)) {
    return input || "/";
  }
  let path = input;
  let fragment = "";
  const fragmentIndex = input.indexOf("#");
  if (fragmentIndex !== -1) {
    path = input.slice(0, fragmentIndex);
    fragment = input.slice(fragmentIndex);
    if (!path) {
      return fragment;
    }
  }
  const [s0, ...s] = path.split("?");
  return s0 + "/" + (s.length > 0 ? `?${s.join("?")}` : "") + fragment;
}
function hasLeadingSlash(input = "") {
  return input.startsWith("/");
}
function withLeadingSlash(input = "") {
  return hasLeadingSlash(input) ? input : "/" + input;
}
function withBase(input, base) {
  if (isEmptyURL(base) || hasProtocol(input)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (input.startsWith(_base)) {
    const nextChar = input[_base.length];
    if (!nextChar || nextChar === "/" || nextChar === "?") {
      return input;
    }
  }
  return joinURL(_base, input);
}
function withoutBase(input, base) {
  if (isEmptyURL(base)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (!input.startsWith(_base)) {
    return input;
  }
  const nextChar = input[_base.length];
  if (nextChar && nextChar !== "/" && nextChar !== "?") {
    return input;
  }
  const trimmed = input.slice(_base.length).replace(/^\/+/, "");
  return "/" + trimmed;
}
function withQuery(input, query) {
  const parsed = parseURL(input);
  const mergedQuery = { ...parseQuery(parsed.search), ...query };
  parsed.search = stringifyQuery(mergedQuery);
  return stringifyParsedURL(parsed);
}
function getQuery$1(input) {
  return parseQuery(parseURL(input).search);
}
function isEmptyURL(url) {
  return !url || url === "/";
}
function isNonEmptyURL(url) {
  return url && url !== "/";
}
function joinURL(base, ...input) {
  let url = base || "";
  for (const segment of input.filter((url2) => isNonEmptyURL(url2))) {
    if (url) {
      const _segment = segment.replace(JOIN_LEADING_SLASH_RE, "");
      url = withTrailingSlash(url) + _segment;
    } else {
      url = segment;
    }
  }
  return url;
}
function joinRelativeURL(..._input) {
  const JOIN_SEGMENT_SPLIT_RE = /\/(?!\/)/;
  const input = _input.filter(Boolean);
  const segments = [];
  let segmentsDepth = 0;
  for (const i of input) {
    if (!i || i === "/") {
      continue;
    }
    for (const [sindex, s] of i.split(JOIN_SEGMENT_SPLIT_RE).entries()) {
      if (!s || s === ".") {
        continue;
      }
      if (s === "..") {
        if (segments.length === 1 && hasProtocol(segments[0])) {
          continue;
        }
        segments.pop();
        segmentsDepth--;
        continue;
      }
      if (sindex === 1 && segments[segments.length - 1]?.endsWith(":/")) {
        segments[segments.length - 1] += "/" + s;
        continue;
      }
      segments.push(s);
      segmentsDepth++;
    }
  }
  let url = segments.join("/");
  if (segmentsDepth >= 0) {
    if (input[0]?.startsWith("/") && !url.startsWith("/")) {
      url = "/" + url;
    } else if (input[0]?.startsWith("./") && !url.startsWith("./")) {
      url = "./" + url;
    }
  } else {
    url = "../".repeat(-1 * segmentsDepth) + url;
  }
  if (input[input.length - 1]?.endsWith("/") && !url.endsWith("/")) {
    url += "/";
  }
  return url;
}

const protocolRelative = Symbol.for("ufo:protocolRelative");
function parseURL(input = "", defaultProto) {
  const _specialProtoMatch = input.match(
    /^[\s\0]*(blob:|data:|javascript:|vbscript:)(.*)/i
  );
  if (_specialProtoMatch) {
    const [, _proto, _pathname = ""] = _specialProtoMatch;
    return {
      protocol: _proto.toLowerCase(),
      pathname: _pathname,
      href: _proto + _pathname,
      auth: "",
      host: "",
      search: "",
      hash: ""
    };
  }
  if (!hasProtocol(input, { acceptRelative: true })) {
    return parsePath(input);
  }
  const [, protocol = "", auth, hostAndPath = ""] = input.replace(/\\/g, "/").match(/^[\s\0]*([\w+.-]{2,}:)?\/\/([^/@]+@)?(.*)/) || [];
  let [, host = "", path = ""] = hostAndPath.match(/([^#/?]*)(.*)?/) || [];
  if (protocol === "file:") {
    path = path.replace(/\/(?=[A-Za-z]:)/, "");
  }
  const { pathname, search, hash } = parsePath(path);
  return {
    protocol: protocol.toLowerCase(),
    auth: auth ? auth.slice(0, Math.max(0, auth.length - 1)) : "",
    host,
    pathname,
    search,
    hash,
    [protocolRelative]: !protocol
  };
}
function parsePath(input = "") {
  const [pathname = "", search = "", hash = ""] = (input.match(/([^#?]*)(\?[^#]*)?(#.*)?/) || []).splice(1);
  return {
    pathname,
    search,
    hash
  };
}
function stringifyParsedURL(parsed) {
  const pathname = parsed.pathname || "";
  const search = parsed.search ? (parsed.search.startsWith("?") ? "" : "?") + parsed.search : "";
  const hash = parsed.hash || "";
  const auth = parsed.auth ? parsed.auth + "@" : "";
  const host = parsed.host || "";
  const proto = parsed.protocol || parsed[protocolRelative] ? (parsed.protocol || "") + "//" : "";
  return proto + auth + host + pathname + search + hash;
}

const NullObject = /* @__PURE__ */ (() => {
  const C = function() {
  };
  C.prototype = /* @__PURE__ */ Object.create(null);
  return C;
})();
function parse$1(str, options) {
  if (typeof str !== "string") {
    throw new TypeError("argument str must be a string");
  }
  const obj = new NullObject();
  const opt = {};
  const dec = opt.decode || decode;
  let index = 0;
  while (index < str.length) {
    const eqIdx = str.indexOf("=", index);
    if (eqIdx === -1) {
      break;
    }
    let endIdx = str.indexOf(";", index);
    if (endIdx === -1) {
      endIdx = str.length;
    } else if (endIdx < eqIdx) {
      index = str.lastIndexOf(";", eqIdx - 1) + 1;
      continue;
    }
    const key = str.slice(index, eqIdx).trim();
    if (opt?.filter && !opt?.filter(key)) {
      index = endIdx + 1;
      continue;
    }
    if (void 0 === obj[key]) {
      let val = str.slice(eqIdx + 1, endIdx).trim();
      if (val.codePointAt(0) === 34) {
        val = val.slice(1, -1);
      }
      obj[key] = tryDecode(val, dec);
    }
    index = endIdx + 1;
  }
  return obj;
}
function decode(str) {
  return str.includes("%") ? decodeURIComponent(str) : str;
}
function tryDecode(str, decode2) {
  try {
    return decode2(str);
  } catch {
    return str;
  }
}

const fieldContentRegExp = /^[\u0009\u0020-\u007E\u0080-\u00FF]+$/;
function serialize$2(name, value, options) {
  const opt = options || {};
  const enc = opt.encode || encodeURIComponent;
  if (typeof enc !== "function") {
    throw new TypeError("option encode is invalid");
  }
  if (!fieldContentRegExp.test(name)) {
    throw new TypeError("argument name is invalid");
  }
  const encodedValue = enc(value);
  if (encodedValue && !fieldContentRegExp.test(encodedValue)) {
    throw new TypeError("argument val is invalid");
  }
  let str = name + "=" + encodedValue;
  if (void 0 !== opt.maxAge && opt.maxAge !== null) {
    const maxAge = opt.maxAge - 0;
    if (Number.isNaN(maxAge) || !Number.isFinite(maxAge)) {
      throw new TypeError("option maxAge is invalid");
    }
    str += "; Max-Age=" + Math.floor(maxAge);
  }
  if (opt.domain) {
    if (!fieldContentRegExp.test(opt.domain)) {
      throw new TypeError("option domain is invalid");
    }
    str += "; Domain=" + opt.domain;
  }
  if (opt.path) {
    if (!fieldContentRegExp.test(opt.path)) {
      throw new TypeError("option path is invalid");
    }
    str += "; Path=" + opt.path;
  }
  if (opt.expires) {
    if (!isDate(opt.expires) || Number.isNaN(opt.expires.valueOf())) {
      throw new TypeError("option expires is invalid");
    }
    str += "; Expires=" + opt.expires.toUTCString();
  }
  if (opt.httpOnly) {
    str += "; HttpOnly";
  }
  if (opt.secure) {
    str += "; Secure";
  }
  if (opt.priority) {
    const priority = typeof opt.priority === "string" ? opt.priority.toLowerCase() : opt.priority;
    switch (priority) {
      case "low": {
        str += "; Priority=Low";
        break;
      }
      case "medium": {
        str += "; Priority=Medium";
        break;
      }
      case "high": {
        str += "; Priority=High";
        break;
      }
      default: {
        throw new TypeError("option priority is invalid");
      }
    }
  }
  if (opt.sameSite) {
    const sameSite = typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite;
    switch (sameSite) {
      case true: {
        str += "; SameSite=Strict";
        break;
      }
      case "lax": {
        str += "; SameSite=Lax";
        break;
      }
      case "strict": {
        str += "; SameSite=Strict";
        break;
      }
      case "none": {
        str += "; SameSite=None";
        break;
      }
      default: {
        throw new TypeError("option sameSite is invalid");
      }
    }
  }
  if (opt.partitioned) {
    str += "; Partitioned";
  }
  return str;
}
function isDate(val) {
  return Object.prototype.toString.call(val) === "[object Date]" || val instanceof Date;
}

function parseSetCookie(setCookieValue, options) {
  const parts = (setCookieValue || "").split(";").filter((str) => typeof str === "string" && !!str.trim());
  const nameValuePairStr = parts.shift() || "";
  const parsed = _parseNameValuePair(nameValuePairStr);
  const name = parsed.name;
  let value = parsed.value;
  try {
    value = options?.decode === false ? value : (options?.decode || decodeURIComponent)(value);
  } catch {
  }
  const cookie = {
    name,
    value
  };
  for (const part of parts) {
    const sides = part.split("=");
    const partKey = (sides.shift() || "").trimStart().toLowerCase();
    const partValue = sides.join("=");
    switch (partKey) {
      case "expires": {
        cookie.expires = new Date(partValue);
        break;
      }
      case "max-age": {
        cookie.maxAge = Number.parseInt(partValue, 10);
        break;
      }
      case "secure": {
        cookie.secure = true;
        break;
      }
      case "httponly": {
        cookie.httpOnly = true;
        break;
      }
      case "samesite": {
        cookie.sameSite = partValue;
        break;
      }
      default: {
        cookie[partKey] = partValue;
      }
    }
  }
  return cookie;
}
function _parseNameValuePair(nameValuePairStr) {
  let name = "";
  let value = "";
  const nameValueArr = nameValuePairStr.split("=");
  if (nameValueArr.length > 1) {
    name = nameValueArr.shift();
    value = nameValueArr.join("=");
  } else {
    value = nameValuePairStr;
  }
  return { name, value };
}

const NODE_TYPES = {
  NORMAL: 0,
  WILDCARD: 1,
  PLACEHOLDER: 2
};

function createRouter$1(options = {}) {
  const ctx = {
    options,
    rootNode: createRadixNode(),
    staticRoutesMap: {}
  };
  const normalizeTrailingSlash = (p) => options.strictTrailingSlash ? p : p.replace(/\/$/, "") || "/";
  if (options.routes) {
    for (const path in options.routes) {
      insert(ctx, normalizeTrailingSlash(path), options.routes[path]);
    }
  }
  return {
    ctx,
    lookup: (path) => lookup(ctx, normalizeTrailingSlash(path)),
    insert: (path, data) => insert(ctx, normalizeTrailingSlash(path), data),
    remove: (path) => remove(ctx, normalizeTrailingSlash(path))
  };
}
function lookup(ctx, path) {
  const staticPathNode = ctx.staticRoutesMap[path];
  if (staticPathNode) {
    return staticPathNode.data;
  }
  const sections = path.split("/");
  const params = {};
  let paramsFound = false;
  let wildcardNode = null;
  let node = ctx.rootNode;
  let wildCardParam = null;
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (node.wildcardChildNode !== null) {
      wildcardNode = node.wildcardChildNode;
      wildCardParam = sections.slice(i).join("/");
    }
    const nextNode = node.children.get(section);
    if (nextNode === void 0) {
      if (node && node.placeholderChildren.length > 1) {
        const remaining = sections.length - i;
        node = node.placeholderChildren.find((c) => c.maxDepth === remaining) || null;
      } else {
        node = node.placeholderChildren[0] || null;
      }
      if (!node) {
        break;
      }
      if (node.paramName) {
        params[node.paramName] = section;
      }
      paramsFound = true;
    } else {
      node = nextNode;
    }
  }
  if ((node === null || node.data === null) && wildcardNode !== null) {
    node = wildcardNode;
    params[node.paramName || "_"] = wildCardParam;
    paramsFound = true;
  }
  if (!node) {
    return null;
  }
  if (paramsFound) {
    return {
      ...node.data,
      params: paramsFound ? params : void 0
    };
  }
  return node.data;
}
function insert(ctx, path, data) {
  let isStaticRoute = true;
  const sections = path.split("/");
  let node = ctx.rootNode;
  let _unnamedPlaceholderCtr = 0;
  const matchedNodes = [node];
  for (const section of sections) {
    let childNode;
    if (childNode = node.children.get(section)) {
      node = childNode;
    } else {
      const type = getNodeType(section);
      childNode = createRadixNode({ type, parent: node });
      node.children.set(section, childNode);
      if (type === NODE_TYPES.PLACEHOLDER) {
        childNode.paramName = section === "*" ? `_${_unnamedPlaceholderCtr++}` : section.slice(1);
        node.placeholderChildren.push(childNode);
        isStaticRoute = false;
      } else if (type === NODE_TYPES.WILDCARD) {
        node.wildcardChildNode = childNode;
        childNode.paramName = section.slice(
          3
          /* "**:" */
        ) || "_";
        isStaticRoute = false;
      }
      matchedNodes.push(childNode);
      node = childNode;
    }
  }
  for (const [depth, node2] of matchedNodes.entries()) {
    node2.maxDepth = Math.max(matchedNodes.length - depth, node2.maxDepth || 0);
  }
  node.data = data;
  if (isStaticRoute === true) {
    ctx.staticRoutesMap[path] = node;
  }
  return node;
}
function remove(ctx, path) {
  let success = false;
  const sections = path.split("/");
  let node = ctx.rootNode;
  for (const section of sections) {
    node = node.children.get(section);
    if (!node) {
      return success;
    }
  }
  if (node.data) {
    const lastSection = sections.at(-1) || "";
    node.data = null;
    if (Object.keys(node.children).length === 0 && node.parent) {
      node.parent.children.delete(lastSection);
      node.parent.wildcardChildNode = null;
      node.parent.placeholderChildren = [];
    }
    success = true;
  }
  return success;
}
function createRadixNode(options = {}) {
  return {
    type: options.type || NODE_TYPES.NORMAL,
    maxDepth: 0,
    parent: options.parent || null,
    children: /* @__PURE__ */ new Map(),
    data: options.data || null,
    paramName: options.paramName || null,
    wildcardChildNode: null,
    placeholderChildren: []
  };
}
function getNodeType(str) {
  if (str.startsWith("**")) {
    return NODE_TYPES.WILDCARD;
  }
  if (str[0] === ":" || str === "*") {
    return NODE_TYPES.PLACEHOLDER;
  }
  return NODE_TYPES.NORMAL;
}

function toRouteMatcher(router) {
  const table = _routerNodeToTable("", router.ctx.rootNode);
  return _createMatcher(table, router.ctx.options.strictTrailingSlash);
}
function _createMatcher(table, strictTrailingSlash) {
  return {
    ctx: { table },
    matchAll: (path) => _matchRoutes(path, table, strictTrailingSlash)
  };
}
function _createRouteTable() {
  return {
    static: /* @__PURE__ */ new Map(),
    wildcard: /* @__PURE__ */ new Map(),
    dynamic: /* @__PURE__ */ new Map()
  };
}
function _matchRoutes(path, table, strictTrailingSlash) {
  if (strictTrailingSlash !== true && path.endsWith("/")) {
    path = path.slice(0, -1) || "/";
  }
  const matches = [];
  for (const [key, value] of _sortRoutesMap(table.wildcard)) {
    if (path === key || path.startsWith(key + "/")) {
      matches.push(value);
    }
  }
  for (const [key, value] of _sortRoutesMap(table.dynamic)) {
    if (path.startsWith(key + "/")) {
      const subPath = "/" + path.slice(key.length).split("/").splice(2).join("/");
      matches.push(..._matchRoutes(subPath, value));
    }
  }
  const staticMatch = table.static.get(path);
  if (staticMatch) {
    matches.push(staticMatch);
  }
  return matches.filter(Boolean);
}
function _sortRoutesMap(m) {
  return [...m.entries()].sort((a, b) => a[0].length - b[0].length);
}
function _routerNodeToTable(initialPath, initialNode) {
  const table = _createRouteTable();
  function _addNode(path, node) {
    if (path) {
      if (node.type === NODE_TYPES.NORMAL && !(path.includes("*") || path.includes(":"))) {
        if (node.data) {
          table.static.set(path, node.data);
        }
      } else if (node.type === NODE_TYPES.WILDCARD) {
        table.wildcard.set(path.replace("/**", ""), node.data);
      } else if (node.type === NODE_TYPES.PLACEHOLDER) {
        const subTable = _routerNodeToTable("", node);
        if (node.data) {
          subTable.static.set("/", node.data);
        }
        table.dynamic.set(path.replace(/\/\*|\/:\w+/, ""), subTable);
        return;
      }
    }
    for (const [childPath, child] of node.children.entries()) {
      _addNode(`${path}/${childPath}`.replace("//", "/"), child);
    }
  }
  _addNode(initialPath, initialNode);
  return table;
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) {
    return false;
  }
  if (Symbol.iterator in value) {
    return false;
  }
  if (Symbol.toStringTag in value) {
    return Object.prototype.toString.call(value) === "[object Module]";
  }
  return true;
}

function _defu(baseObject, defaults, namespace = ".", merger) {
  if (!isPlainObject(defaults)) {
    return _defu(baseObject, {}, namespace, merger);
  }
  const object = { ...defaults };
  for (const key of Object.keys(baseObject)) {
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = baseObject[key];
    if (value === null || value === void 0) {
      continue;
    }
    if (merger && merger(object, key, value, namespace)) {
      continue;
    }
    if (Array.isArray(value) && Array.isArray(object[key])) {
      object[key] = [...value, ...object[key]];
    } else if (isPlainObject(value) && isPlainObject(object[key])) {
      object[key] = _defu(
        value,
        object[key],
        (namespace ? `${namespace}.` : "") + key.toString(),
        merger
      );
    } else {
      object[key] = value;
    }
  }
  return object;
}
function createDefu(merger) {
  return (...arguments_) => (
    // eslint-disable-next-line unicorn/no-array-reduce
    arguments_.reduce((p, c) => _defu(p, c, "", merger), {})
  );
}
const defu = createDefu();
const defuFn = createDefu((object, key, currentValue) => {
  if (object[key] !== void 0 && typeof currentValue === "function") {
    object[key] = currentValue(object[key]);
    return true;
  }
});

// src/utils.ts
var alphabetByEncoding = {};
var alphabetByValue = Array.from({ length: 64 });
for (let i = 0, start = "A".charCodeAt(0), limit = "Z".charCodeAt(0); i + start <= limit; i++) {
  const char = String.fromCharCode(i + start);
  alphabetByEncoding[char] = i;
  alphabetByValue[i] = char;
}
for (let i = 0, start = "a".charCodeAt(0), limit = "z".charCodeAt(0); i + start <= limit; i++) {
  const char = String.fromCharCode(i + start);
  const index = i + 26;
  alphabetByEncoding[char] = index;
  alphabetByValue[index] = char;
}
for (let i = 0; i < 10; i++) {
  alphabetByEncoding[i.toString(10)] = i + 52;
  const char = i.toString(10);
  const index = i + 52;
  alphabetByEncoding[char] = index;
  alphabetByValue[index] = char;
}
alphabetByEncoding["-"] = 62;
alphabetByValue[62] = "-";
alphabetByEncoding["_"] = 63;
alphabetByValue[63] = "_";
var bitsPerLetter = 6;
var bitsPerByte = 8;
var maxLetterValue = 63;
var stringToBuffer = (value) => {
  return new TextEncoder().encode(value);
};
var bufferToString = (value) => {
  return new TextDecoder().decode(value);
};
var base64urlDecode = (_input) => {
  const input = _input + "=".repeat((4 - _input.length % 4) % 4);
  let totalByteLength = input.length / 4 * 3;
  if (input.endsWith("==")) {
    totalByteLength -= 2;
  } else if (input.endsWith("=")) {
    totalByteLength--;
  }
  const out = new ArrayBuffer(totalByteLength);
  const dataView = new DataView(out);
  for (let i = 0; i < input.length; i += 4) {
    let bits = 0;
    let bitLength = 0;
    for (let j = i, limit = i + 3; j <= limit; j++) {
      if (input[j] === "=") {
        bits >>= bitsPerLetter;
      } else {
        if (!(input[j] in alphabetByEncoding)) {
          throw new TypeError(`Invalid character ${input[j]} in base64 string.`);
        }
        bits |= alphabetByEncoding[input[j]] << (limit - j) * bitsPerLetter;
        bitLength += bitsPerLetter;
      }
    }
    const chunkOffset = i / 4 * 3;
    bits >>= bitLength % bitsPerByte;
    const byteLength = Math.floor(bitLength / bitsPerByte);
    for (let k = 0; k < byteLength; k++) {
      const offset = (byteLength - k - 1) * bitsPerByte;
      dataView.setUint8(chunkOffset + k, (bits & 255 << offset) >> offset);
    }
  }
  return new Uint8Array(out);
};
var base64urlEncode = (_input) => {
  const input = typeof _input === "string" ? stringToBuffer(_input) : _input;
  let str = "";
  for (let i = 0; i < input.length; i += 3) {
    let bits = 0;
    let bitLength = 0;
    for (let j = i, limit = Math.min(i + 3, input.length); j < limit; j++) {
      bits |= input[j] << (limit - j - 1) * bitsPerByte;
      bitLength += bitsPerByte;
    }
    const bitClusterCount = Math.ceil(bitLength / bitsPerLetter);
    bits <<= bitClusterCount * bitsPerLetter - bitLength;
    for (let k = 1; k <= bitClusterCount; k++) {
      const offset = (bitClusterCount - k) * bitsPerLetter;
      str += alphabetByValue[(bits & maxLetterValue << offset) >> offset];
    }
  }
  return str;
};

// src/index.ts
var defaults = {
  encryption: { saltBits: 256, algorithm: "aes-256-cbc", iterations: 1, minPasswordlength: 32 },
  integrity: { saltBits: 256, algorithm: "sha256", iterations: 1, minPasswordlength: 32 },
  ttl: 0,
  timestampSkewSec: 60,
  localtimeOffsetMsec: 0
};
var clone = (options) => ({
  ...options,
  encryption: { ...options.encryption },
  integrity: { ...options.integrity }
});
var algorithms = {
  "aes-128-ctr": { keyBits: 128, ivBits: 128, name: "AES-CTR" },
  "aes-256-cbc": { keyBits: 256, ivBits: 128, name: "AES-CBC" },
  sha256: { keyBits: 256, name: "SHA-256" }
};
var macPrefix = "Fe26.2";
var randomBytes = (_crypto, size) => {
  const bytes = new Uint8Array(size);
  _crypto.getRandomValues(bytes);
  return bytes;
};
var randomBits = (_crypto, bits) => {
  if (bits < 1)
    throw new Error("Invalid random bits count");
  const bytes = Math.ceil(bits / 8);
  return randomBytes(_crypto, bytes);
};
var pbkdf2 = async (_crypto, password, salt, iterations, keyLength, hash) => {
  const passwordBuffer = stringToBuffer(password);
  const importedKey = await _crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const saltBuffer = stringToBuffer(salt);
  const params = { name: "PBKDF2", hash, salt: saltBuffer, iterations };
  const derivation = await _crypto.subtle.deriveBits(params, importedKey, keyLength * 8);
  return derivation;
};
var generateKey = async (_crypto, password, options) => {
  var _a;
  if (!(password == null ? void 0 : password.length))
    throw new Error("Empty password");
  if (options == null || typeof options !== "object")
    throw new Error("Bad options");
  if (!(options.algorithm in algorithms))
    throw new Error(`Unknown algorithm: ${options.algorithm}`);
  const algorithm = algorithms[options.algorithm];
  const result = {};
  const hmac = (_a = options.hmac) != null ? _a : false;
  const id = hmac ? { name: "HMAC", hash: algorithm.name } : { name: algorithm.name };
  const usage = hmac ? ["sign", "verify"] : ["encrypt", "decrypt"];
  if (typeof password === "string") {
    if (password.length < options.minPasswordlength)
      throw new Error(
        `Password string too short (min ${options.minPasswordlength} characters required)`
      );
    let { salt = "" } = options;
    if (!salt) {
      const { saltBits = 0 } = options;
      if (!saltBits)
        throw new Error("Missing salt and saltBits options");
      const randomSalt = randomBits(_crypto, saltBits);
      salt = [...new Uint8Array(randomSalt)].map((x) => x.toString(16).padStart(2, "0")).join("");
    }
    const derivedKey = await pbkdf2(
      _crypto,
      password,
      salt,
      options.iterations,
      algorithm.keyBits / 8,
      "SHA-1"
    );
    const importedEncryptionKey = await _crypto.subtle.importKey(
      "raw",
      derivedKey,
      id,
      false,
      usage
    );
    result.key = importedEncryptionKey;
    result.salt = salt;
  } else {
    if (password.length < algorithm.keyBits / 8)
      throw new Error("Key buffer (password) too small");
    result.key = await _crypto.subtle.importKey("raw", password, id, false, usage);
    result.salt = "";
  }
  if (options.iv)
    result.iv = options.iv;
  else if ("ivBits" in algorithm)
    result.iv = randomBits(_crypto, algorithm.ivBits);
  return result;
};
var getEncryptParams = (algorithm, key, data) => {
  return [
    algorithm === "aes-128-ctr" ? { name: "AES-CTR", counter: key.iv, length: 128 } : { name: "AES-CBC", iv: key.iv },
    key.key,
    typeof data === "string" ? stringToBuffer(data) : data
  ];
};
var encrypt = async (_crypto, password, options, data) => {
  const key = await generateKey(_crypto, password, options);
  const encrypted = await _crypto.subtle.encrypt(...getEncryptParams(options.algorithm, key, data));
  return { encrypted: new Uint8Array(encrypted), key };
};
var decrypt = async (_crypto, password, options, data) => {
  const key = await generateKey(_crypto, password, options);
  const decrypted = await _crypto.subtle.decrypt(...getEncryptParams(options.algorithm, key, data));
  return bufferToString(new Uint8Array(decrypted));
};
var hmacWithPassword = async (_crypto, password, options, data) => {
  const key = await generateKey(_crypto, password, { ...options, hmac: true });
  const textBuffer = stringToBuffer(data);
  const signed = await _crypto.subtle.sign({ name: "HMAC" }, key.key, textBuffer);
  const digest = base64urlEncode(new Uint8Array(signed));
  return { digest, salt: key.salt };
};
var normalizePassword = (password) => {
  if (typeof password === "string" || password instanceof Uint8Array)
    return { encryption: password, integrity: password };
  if ("secret" in password)
    return { id: password.id, encryption: password.secret, integrity: password.secret };
  return { id: password.id, encryption: password.encryption, integrity: password.integrity };
};
var seal = async (_crypto, object, password, options) => {
  if (!password)
    throw new Error("Empty password");
  const opts = clone(options);
  const now = Date.now() + (opts.localtimeOffsetMsec || 0);
  const objectString = JSON.stringify(object);
  const pass = normalizePassword(password);
  const { id = "", encryption, integrity } = pass;
  if (id && !/^\w+$/.test(id))
    throw new Error("Invalid password id");
  const { encrypted, key } = await encrypt(_crypto, encryption, opts.encryption, objectString);
  const encryptedB64 = base64urlEncode(new Uint8Array(encrypted));
  const iv = base64urlEncode(key.iv);
  const expiration = opts.ttl ? now + opts.ttl : "";
  const macBaseString = `${macPrefix}*${id}*${key.salt}*${iv}*${encryptedB64}*${expiration}`;
  const mac = await hmacWithPassword(_crypto, integrity, opts.integrity, macBaseString);
  const sealed = `${macBaseString}*${mac.salt}*${mac.digest}`;
  return sealed;
};
var fixedTimeComparison = (a, b) => {
  let mismatch = a.length === b.length ? 0 : 1;
  if (mismatch)
    b = a;
  for (let i = 0; i < a.length; i += 1)
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
};
var unseal = async (_crypto, sealed, password, options) => {
  if (!password)
    throw new Error("Empty password");
  const opts = clone(options);
  const now = Date.now() + (opts.localtimeOffsetMsec || 0);
  const parts = sealed.split("*");
  if (parts.length !== 8)
    throw new Error("Incorrect number of sealed components");
  const prefix = parts[0];
  let passwordId = parts[1];
  const encryptionSalt = parts[2];
  const encryptionIv = parts[3];
  const encryptedB64 = parts[4];
  const expiration = parts[5];
  const hmacSalt = parts[6];
  const hmac = parts[7];
  const macBaseString = `${prefix}*${passwordId}*${encryptionSalt}*${encryptionIv}*${encryptedB64}*${expiration}`;
  if (macPrefix !== prefix)
    throw new Error("Wrong mac prefix");
  if (expiration) {
    if (!/^\d+$/.test(expiration))
      throw new Error("Invalid expiration");
    const exp = Number.parseInt(expiration, 10);
    if (exp <= now - opts.timestampSkewSec * 1e3)
      throw new Error("Expired seal");
  }
  let pass = "";
  passwordId = passwordId || "default";
  if (typeof password === "string" || password instanceof Uint8Array)
    pass = password;
  else if (passwordId in password) {
    pass = password[passwordId];
  } else {
    throw new Error(`Cannot find password: ${passwordId}`);
  }
  pass = normalizePassword(pass);
  const macOptions = opts.integrity;
  macOptions.salt = hmacSalt;
  const mac = await hmacWithPassword(_crypto, pass.integrity, macOptions, macBaseString);
  if (!fixedTimeComparison(mac.digest, hmac))
    throw new Error("Bad hmac value");
  const encrypted = base64urlDecode(encryptedB64);
  const decryptOptions = opts.encryption;
  decryptOptions.salt = encryptionSalt;
  decryptOptions.iv = base64urlDecode(encryptionIv);
  const decrypted = await decrypt(_crypto, pass.encryption, decryptOptions, encrypted);
  if (decrypted)
    return JSON.parse(decrypted);
  return null;
};

function o(n){throw new Error(`${n} is not implemented yet!`)}let i$1 = class i extends EventEmitter{__unenv__={};readableEncoding=null;readableEnded=true;readableFlowing=false;readableHighWaterMark=0;readableLength=0;readableObjectMode=false;readableAborted=false;readableDidRead=false;closed=false;errored=null;readable=false;destroyed=false;static from(e,t){return new i(t)}constructor(e){super();}_read(e){}read(e){}setEncoding(e){return this}pause(){return this}resume(){return this}isPaused(){return  true}unpipe(e){return this}unshift(e,t){}wrap(e){return this}push(e,t){return  false}_destroy(e,t){this.removeAllListeners();}destroy(e){return this.destroyed=true,this._destroy(e),this}pipe(e,t){return {}}compose(e,t){throw new Error("Method not implemented.")}[Symbol.asyncDispose](){return this.destroy(),Promise.resolve()}async*[Symbol.asyncIterator](){throw o("Readable.asyncIterator")}iterator(e){throw o("Readable.iterator")}map(e,t){throw o("Readable.map")}filter(e,t){throw o("Readable.filter")}forEach(e,t){throw o("Readable.forEach")}reduce(e,t,r){throw o("Readable.reduce")}find(e,t){throw o("Readable.find")}findIndex(e,t){throw o("Readable.findIndex")}some(e,t){throw o("Readable.some")}toArray(e){throw o("Readable.toArray")}every(e,t){throw o("Readable.every")}flatMap(e,t){throw o("Readable.flatMap")}drop(e,t){throw o("Readable.drop")}take(e,t){throw o("Readable.take")}asIndexedPairs(e){throw o("Readable.asIndexedPairs")}};let l$1 = class l extends EventEmitter{__unenv__={};writable=true;writableEnded=false;writableFinished=false;writableHighWaterMark=0;writableLength=0;writableObjectMode=false;writableCorked=0;closed=false;errored=null;writableNeedDrain=false;writableAborted=false;destroyed=false;_data;_encoding="utf8";constructor(e){super();}pipe(e,t){return {}}_write(e,t,r){if(this.writableEnded){r&&r();return}if(this._data===void 0)this._data=e;else {const s=typeof this._data=="string"?Buffer$1.from(this._data,this._encoding||t||"utf8"):this._data,a=typeof e=="string"?Buffer$1.from(e,t||this._encoding||"utf8"):e;this._data=Buffer$1.concat([s,a]);}this._encoding=t,r&&r();}_writev(e,t){}_destroy(e,t){}_final(e){}write(e,t,r){const s=typeof t=="string"?this._encoding:"utf8",a=typeof t=="function"?t:typeof r=="function"?r:void 0;return this._write(e,s,a),true}setDefaultEncoding(e){return this}end(e,t,r){const s=typeof e=="function"?e:typeof t=="function"?t:typeof r=="function"?r:void 0;if(this.writableEnded)return s&&s(),this;const a=e===s?void 0:e;if(a){const u=t===s?void 0:t;this.write(a,u,s);}return this.writableEnded=true,this.writableFinished=true,this.emit("close"),this.emit("finish"),this}cork(){}uncork(){}destroy(e){return this.destroyed=true,delete this._data,this.removeAllListeners(),this}compose(e,t){throw new Error("Method not implemented.")}[Symbol.asyncDispose](){return Promise.resolve()}};const c$1=class c{allowHalfOpen=true;_destroy;constructor(e=new i$1,t=new l$1){Object.assign(this,e),Object.assign(this,t),this._destroy=m(e._destroy,t._destroy);}};function _(){return Object.assign(c$1.prototype,i$1.prototype),Object.assign(c$1.prototype,l$1.prototype),c$1}function m(...n){return function(...e){for(const t of n)t(...e);}}const g=_();class A extends g{__unenv__={};bufferSize=0;bytesRead=0;bytesWritten=0;connecting=false;destroyed=false;pending=false;localAddress="";localPort=0;remoteAddress="";remoteFamily="";remotePort=0;autoSelectFamilyAttemptedAddresses=[];readyState="readOnly";constructor(e){super();}write(e,t,r){return  false}connect(e,t,r){return this}end(e,t,r){return this}setEncoding(e){return this}pause(){return this}resume(){return this}setTimeout(e,t){return this}setNoDelay(e){return this}setKeepAlive(e,t){return this}address(){return {}}unref(){return this}ref(){return this}destroySoon(){this.destroy();}resetAndDestroy(){const e=new Error("ERR_SOCKET_CLOSED");return e.code="ERR_SOCKET_CLOSED",this.destroy(e),this}}class y extends i$1{aborted=false;httpVersion="1.1";httpVersionMajor=1;httpVersionMinor=1;complete=true;connection;socket;headers={};trailers={};method="GET";url="/";statusCode=200;statusMessage="";closed=false;errored=null;readable=false;constructor(e){super(),this.socket=this.connection=e||new A;}get rawHeaders(){const e=this.headers,t=[];for(const r in e)if(Array.isArray(e[r]))for(const s of e[r])t.push(r,s);else t.push(r,e[r]);return t}get rawTrailers(){return []}setTimeout(e,t){return this}get headersDistinct(){return p(this.headers)}get trailersDistinct(){return p(this.trailers)}}function p(n){const e={};for(const[t,r]of Object.entries(n))t&&(e[t]=(Array.isArray(r)?r:[r]).filter(Boolean));return e}class w extends l$1{statusCode=200;statusMessage="";upgrading=false;chunkedEncoding=false;shouldKeepAlive=false;useChunkedEncodingByDefault=false;sendDate=false;finished=false;headersSent=false;strictContentLength=false;connection=null;socket=null;req;_headers={};constructor(e){super(),this.req=e;}assignSocket(e){e._httpMessage=this,this.socket=e,this.connection=e,this.emit("socket",e),this._flush();}_flush(){this.flushHeaders();}detachSocket(e){}writeContinue(e){}writeHead(e,t,r){e&&(this.statusCode=e),typeof t=="string"&&(this.statusMessage=t,t=void 0);const s=r||t;if(s&&!Array.isArray(s))for(const a in s)this.setHeader(a,s[a]);return this.headersSent=true,this}writeProcessing(){}setTimeout(e,t){return this}appendHeader(e,t){e=e.toLowerCase();const r=this._headers[e],s=[...Array.isArray(r)?r:[r],...Array.isArray(t)?t:[t]].filter(Boolean);return this._headers[e]=s.length>1?s:s[0],this}setHeader(e,t){return this._headers[e.toLowerCase()]=t,this}setHeaders(e){for(const[t,r]of Object.entries(e))this.setHeader(t,r);return this}getHeader(e){return this._headers[e.toLowerCase()]}getHeaders(){return this._headers}getHeaderNames(){return Object.keys(this._headers)}hasHeader(e){return e.toLowerCase()in this._headers}removeHeader(e){delete this._headers[e.toLowerCase()];}addTrailers(e){}flushHeaders(){}writeEarlyHints(e,t){typeof t=="function"&&t();}}const E=(()=>{const n=function(){};return n.prototype=Object.create(null),n})();function R(n={}){const e=new E,t=Array.isArray(n)||H(n)?n:Object.entries(n);for(const[r,s]of t)if(s){if(e[r]===void 0){e[r]=s;continue}e[r]=[...Array.isArray(e[r])?e[r]:[e[r]],...Array.isArray(s)?s:[s]];}return e}function H(n){return typeof n?.entries=="function"}function v(n={}){if(n instanceof Headers)return n;const e=new Headers;for(const[t,r]of Object.entries(n))if(r!==void 0){if(Array.isArray(r)){for(const s of r)e.append(t,String(s));continue}e.set(t,String(r));}return e}const S=new Set([101,204,205,304]);async function b(n,e){const t=new y,r=new w(t);t.url=e.url?.toString()||"/";let s;if(!t.url.startsWith("/")){const d=new URL(t.url);s=d.host,t.url=d.pathname+d.search+d.hash;}t.method=e.method||"GET",t.headers=R(e.headers||{}),t.headers.host||(t.headers.host=e.host||s||"localhost"),t.connection.encrypted=t.connection.encrypted||e.protocol==="https",t.body=e.body||null,t.__unenv__=e.context,await n(t,r);let a=r._data;(S.has(r.statusCode)||t.method.toUpperCase()==="HEAD")&&(a=null,delete r._headers["content-length"]);const u={status:r.statusCode,statusText:r.statusMessage,headers:r._headers,body:a};return t.destroy(),r.destroy(),u}async function C(n,e,t={}){try{const r=await b(n,{url:e,...t});return new Response(r.body,{status:r.status,statusText:r.statusText,headers:v(r.headers)})}catch(r){return new Response(r.toString(),{status:Number.parseInt(r.statusCode||r.code)||500,statusText:r.statusText})}}

function hasProp(obj, prop) {
  try {
    return prop in obj;
  } catch {
    return false;
  }
}

class H3Error extends Error {
  static __h3_error__ = true;
  statusCode = 500;
  fatal = false;
  unhandled = false;
  statusMessage;
  data;
  cause;
  constructor(message, opts = {}) {
    super(message, opts);
    if (opts.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
  toJSON() {
    const obj = {
      message: this.message,
      statusCode: sanitizeStatusCode(this.statusCode, 500)
    };
    if (this.statusMessage) {
      obj.statusMessage = sanitizeStatusMessage(this.statusMessage);
    }
    if (this.data !== void 0) {
      obj.data = this.data;
    }
    return obj;
  }
}
function createError$1(input) {
  if (typeof input === "string") {
    return new H3Error(input);
  }
  if (isError(input)) {
    return input;
  }
  const err = new H3Error(input.message ?? input.statusMessage ?? "", {
    cause: input.cause || input
  });
  if (hasProp(input, "stack")) {
    try {
      Object.defineProperty(err, "stack", {
        get() {
          return input.stack;
        }
      });
    } catch {
      try {
        err.stack = input.stack;
      } catch {
      }
    }
  }
  if (input.data) {
    err.data = input.data;
  }
  if (input.statusCode) {
    err.statusCode = sanitizeStatusCode(input.statusCode, err.statusCode);
  } else if (input.status) {
    err.statusCode = sanitizeStatusCode(input.status, err.statusCode);
  }
  if (input.statusMessage) {
    err.statusMessage = input.statusMessage;
  } else if (input.statusText) {
    err.statusMessage = input.statusText;
  }
  if (err.statusMessage) {
    const originalMessage = err.statusMessage;
    const sanitizedMessage = sanitizeStatusMessage(err.statusMessage);
    if (sanitizedMessage !== originalMessage) {
      console.warn(
        "[h3] Please prefer using `message` for longer error messages instead of `statusMessage`. In the future, `statusMessage` will be sanitized by default."
      );
    }
  }
  if (input.fatal !== void 0) {
    err.fatal = input.fatal;
  }
  if (input.unhandled !== void 0) {
    err.unhandled = input.unhandled;
  }
  return err;
}
function sendError(event, error, debug) {
  if (event.handled) {
    return;
  }
  const h3Error = isError(error) ? error : createError$1(error);
  const responseBody = {
    statusCode: h3Error.statusCode,
    statusMessage: h3Error.statusMessage,
    stack: [],
    data: h3Error.data
  };
  if (debug) {
    responseBody.stack = (h3Error.stack || "").split("\n").map((l) => l.trim());
  }
  if (event.handled) {
    return;
  }
  const _code = Number.parseInt(h3Error.statusCode);
  setResponseStatus(event, _code, h3Error.statusMessage);
  event.node.res.setHeader("content-type", MIMES.json);
  event.node.res.end(JSON.stringify(responseBody, void 0, 2));
}
function isError(input) {
  return input?.constructor?.__h3_error__ === true;
}

function parse(multipartBodyBuffer, boundary) {
  let lastline = "";
  let state = 0 /* INIT */;
  let buffer = [];
  const allParts = [];
  let currentPartHeaders = [];
  for (let i = 0; i < multipartBodyBuffer.length; i++) {
    const prevByte = i > 0 ? multipartBodyBuffer[i - 1] : null;
    const currByte = multipartBodyBuffer[i];
    const newLineChar = currByte === 10 || currByte === 13;
    if (!newLineChar) {
      lastline += String.fromCodePoint(currByte);
    }
    const newLineDetected = currByte === 10 && prevByte === 13;
    if (0 /* INIT */ === state && newLineDetected) {
      if ("--" + boundary === lastline) {
        state = 1 /* READING_HEADERS */;
      }
      lastline = "";
    } else if (1 /* READING_HEADERS */ === state && newLineDetected) {
      if (lastline.length > 0) {
        const i2 = lastline.indexOf(":");
        if (i2 > 0) {
          const name = lastline.slice(0, i2).toLowerCase();
          const value = lastline.slice(i2 + 1).trim();
          currentPartHeaders.push([name, value]);
        }
      } else {
        state = 2 /* READING_DATA */;
        buffer = [];
      }
      lastline = "";
    } else if (2 /* READING_DATA */ === state) {
      if (lastline.length > boundary.length + 4) {
        lastline = "";
      }
      if ("--" + boundary === lastline) {
        const j = buffer.length - lastline.length;
        const part = buffer.slice(0, j - 1);
        allParts.push(process$1(part, currentPartHeaders));
        buffer = [];
        currentPartHeaders = [];
        lastline = "";
        state = 3 /* READING_PART_SEPARATOR */;
      } else {
        buffer.push(currByte);
      }
      if (newLineDetected) {
        lastline = "";
      }
    } else if (3 /* READING_PART_SEPARATOR */ === state && newLineDetected) {
      state = 1 /* READING_HEADERS */;
    }
  }
  return allParts;
}
function process$1(data, headers) {
  const dataObj = {};
  const contentDispositionHeader = headers.find((h) => h[0] === "content-disposition")?.[1] || "";
  for (const i of contentDispositionHeader.split(";")) {
    const s = i.split("=");
    if (s.length !== 2) {
      continue;
    }
    const key = (s[0] || "").trim();
    if (key === "name" || key === "filename") {
      const _value = (s[1] || "").trim().replace(/"/g, "");
      dataObj[key] = Buffer.from(_value, "latin1").toString("utf8");
    }
  }
  const contentType = headers.find((h) => h[0] === "content-type")?.[1] || "";
  if (contentType) {
    dataObj.type = contentType;
  }
  dataObj.data = Buffer.from(data);
  return dataObj;
}

function getQuery(event) {
  return getQuery$1(event.path || "");
}
function getRouterParams(event, opts = {}) {
  let params = event.context.params || {};
  if (opts.decode) {
    params = { ...params };
    for (const key in params) {
      params[key] = decode$1(params[key]);
    }
  }
  return params;
}
function getRouterParam(event, name, opts = {}) {
  const params = getRouterParams(event, opts);
  return params[name];
}
function getMethod(event, defaultMethod = "GET") {
  return (event.node.req.method || defaultMethod).toUpperCase();
}
function isMethod(event, expected, allowHead) {
  if (typeof expected === "string") {
    if (event.method === expected) {
      return true;
    }
  } else if (expected.includes(event.method)) {
    return true;
  }
  return false;
}
function assertMethod(event, expected, allowHead) {
  if (!isMethod(event, expected)) {
    throw createError$1({
      statusCode: 405,
      statusMessage: "HTTP method is not allowed."
    });
  }
}
function getRequestHeaders(event) {
  const _headers = {};
  for (const key in event.node.req.headers) {
    const val = event.node.req.headers[key];
    _headers[key] = Array.isArray(val) ? val.filter(Boolean).join(", ") : val;
  }
  return _headers;
}
function getRequestHeader(event, name) {
  const headers = getRequestHeaders(event);
  const value = headers[name.toLowerCase()];
  return value;
}
function getRequestHost(event, opts = {}) {
  if (opts.xForwardedHost) {
    const _header = event.node.req.headers["x-forwarded-host"];
    const xForwardedHost = (_header || "").split(",").shift()?.trim();
    if (xForwardedHost) {
      return xForwardedHost;
    }
  }
  return event.node.req.headers.host || "localhost";
}
function getRequestProtocol(event, opts = {}) {
  if (opts.xForwardedProto !== false && event.node.req.headers["x-forwarded-proto"] === "https") {
    return "https";
  }
  return event.node.req.connection?.encrypted ? "https" : "http";
}
function getRequestURL(event, opts = {}) {
  const host = getRequestHost(event, opts);
  const protocol = getRequestProtocol(event, opts);
  const path = (event.node.req.originalUrl || event.path).replace(
    /^[/\\]+/g,
    "/"
  );
  return new URL(path, `${protocol}://${host}`);
}
function getRequestIP(event, opts = {}) {
  if (event.context.clientAddress) {
    return event.context.clientAddress;
  }
  if (opts.xForwardedFor) {
    const xForwardedFor = getRequestHeader(event, "x-forwarded-for")?.split(",").shift()?.trim();
    if (xForwardedFor) {
      return xForwardedFor;
    }
  }
  if (event.node.req.socket.remoteAddress) {
    return event.node.req.socket.remoteAddress;
  }
}

const RawBodySymbol = Symbol.for("h3RawBody");
const ParsedBodySymbol = Symbol.for("h3ParsedBody");
const PayloadMethods$1 = ["PATCH", "POST", "PUT", "DELETE"];
function readRawBody(event, encoding = "utf8") {
  assertMethod(event, PayloadMethods$1);
  const _rawBody = event._requestBody || event.web?.request?.body || event.node.req[RawBodySymbol] || event.node.req.rawBody || event.node.req.body;
  if (_rawBody) {
    const promise2 = Promise.resolve(_rawBody).then((_resolved) => {
      if (Buffer.isBuffer(_resolved)) {
        return _resolved;
      }
      if (typeof _resolved.pipeTo === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.pipeTo(
            new WritableStream({
              write(chunk) {
                chunks.push(chunk);
              },
              close() {
                resolve(Buffer.concat(chunks));
              },
              abort(reason) {
                reject(reason);
              }
            })
          ).catch(reject);
        });
      } else if (typeof _resolved.pipe === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.on("data", (chunk) => {
            chunks.push(chunk);
          }).on("end", () => {
            resolve(Buffer.concat(chunks));
          }).on("error", reject);
        });
      }
      if (_resolved.constructor === Object) {
        return Buffer.from(JSON.stringify(_resolved));
      }
      if (_resolved instanceof URLSearchParams) {
        return Buffer.from(_resolved.toString());
      }
      if (_resolved instanceof FormData) {
        return new Response(_resolved).bytes().then((uint8arr) => Buffer.from(uint8arr));
      }
      return Buffer.from(_resolved);
    });
    return encoding ? promise2.then((buff) => buff.toString(encoding)) : promise2;
  }
  if (!Number.parseInt(event.node.req.headers["content-length"] || "") && !/\bchunked\b/i.test(
    String(event.node.req.headers["transfer-encoding"] ?? "")
  )) {
    return Promise.resolve(void 0);
  }
  const promise = event.node.req[RawBodySymbol] = new Promise(
    (resolve, reject) => {
      const bodyData = [];
      event.node.req.on("error", (err) => {
        reject(err);
      }).on("data", (chunk) => {
        bodyData.push(chunk);
      }).on("end", () => {
        resolve(Buffer.concat(bodyData));
      });
    }
  );
  const result = encoding ? promise.then((buff) => buff.toString(encoding)) : promise;
  return result;
}
async function readBody(event, options = {}) {
  const request = event.node.req;
  if (hasProp(request, ParsedBodySymbol)) {
    return request[ParsedBodySymbol];
  }
  const contentType = request.headers["content-type"] || "";
  const body = await readRawBody(event);
  let parsed;
  if (contentType === "application/json") {
    parsed = _parseJSON(body, options.strict ?? true);
  } else if (contentType.startsWith("application/x-www-form-urlencoded")) {
    parsed = _parseURLEncodedBody(body);
  } else if (contentType.startsWith("text/")) {
    parsed = body;
  } else {
    parsed = _parseJSON(body, options.strict ?? false);
  }
  request[ParsedBodySymbol] = parsed;
  return parsed;
}
async function readMultipartFormData(event) {
  const contentType = getRequestHeader(event, "content-type");
  if (!contentType || !contentType.startsWith("multipart/form-data")) {
    return;
  }
  const boundary = contentType.match(/boundary=([^;]*)(;|$)/i)?.[1];
  if (!boundary) {
    return;
  }
  const body = await readRawBody(event, false);
  if (!body) {
    return;
  }
  return parse(body, boundary);
}
function getRequestWebStream(event) {
  if (!PayloadMethods$1.includes(event.method)) {
    return;
  }
  const bodyStream = event.web?.request?.body || event._requestBody;
  if (bodyStream) {
    return bodyStream;
  }
  const _hasRawBody = RawBodySymbol in event.node.req || "rawBody" in event.node.req || "body" in event.node.req || "__unenv__" in event.node.req;
  if (_hasRawBody) {
    return new ReadableStream({
      async start(controller) {
        const _rawBody = await readRawBody(event, false);
        if (_rawBody) {
          controller.enqueue(_rawBody);
        }
        controller.close();
      }
    });
  }
  return new ReadableStream({
    start: (controller) => {
      event.node.req.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      event.node.req.on("end", () => {
        controller.close();
      });
      event.node.req.on("error", (err) => {
        controller.error(err);
      });
    }
  });
}
function _parseJSON(body = "", strict) {
  if (!body) {
    return void 0;
  }
  try {
    return destr(body, { strict });
  } catch {
    throw createError$1({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Invalid JSON body"
    });
  }
}
function _parseURLEncodedBody(body) {
  const form = new URLSearchParams(body);
  const parsedForm = /* @__PURE__ */ Object.create(null);
  for (const [key, value] of form.entries()) {
    if (hasProp(parsedForm, key)) {
      if (!Array.isArray(parsedForm[key])) {
        parsedForm[key] = [parsedForm[key]];
      }
      parsedForm[key].push(value);
    } else {
      parsedForm[key] = value;
    }
  }
  return parsedForm;
}

function handleCacheHeaders(event, opts) {
  const cacheControls = ["public", ...opts.cacheControls || []];
  let cacheMatched = false;
  if (opts.maxAge !== void 0) {
    cacheControls.push(`max-age=${+opts.maxAge}`, `s-maxage=${+opts.maxAge}`);
  }
  if (opts.modifiedTime) {
    const modifiedTime = new Date(opts.modifiedTime);
    const ifModifiedSince = event.node.req.headers["if-modified-since"];
    event.node.res.setHeader("last-modified", modifiedTime.toUTCString());
    if (ifModifiedSince && new Date(ifModifiedSince) >= modifiedTime) {
      cacheMatched = true;
    }
  }
  if (opts.etag) {
    event.node.res.setHeader("etag", opts.etag);
    const ifNonMatch = event.node.req.headers["if-none-match"];
    if (ifNonMatch === opts.etag) {
      cacheMatched = true;
    }
  }
  event.node.res.setHeader("cache-control", cacheControls.join(", "));
  if (cacheMatched) {
    event.node.res.statusCode = 304;
    if (!event.handled) {
      event.node.res.end();
    }
    return true;
  }
  return false;
}

const MIMES = {
  html: "text/html",
  json: "application/json"
};

const DISALLOWED_STATUS_CHARS = /[^\u0009\u0020-\u007E]/g;
function sanitizeStatusMessage(statusMessage = "") {
  return statusMessage.replace(DISALLOWED_STATUS_CHARS, "");
}
function sanitizeStatusCode(statusCode, defaultStatusCode = 200) {
  if (!statusCode) {
    return defaultStatusCode;
  }
  if (typeof statusCode === "string") {
    statusCode = Number.parseInt(statusCode, 10);
  }
  if (statusCode < 100 || statusCode > 999) {
    return defaultStatusCode;
  }
  return statusCode;
}

function getDistinctCookieKey(name, opts) {
  return [name, opts.domain || "", opts.path || "/"].join(";");
}
function setCookie(event, name, value, serializeOptions = {}) {
  if (!serializeOptions.path) {
    serializeOptions = { path: "/", ...serializeOptions };
  }
  const newCookie = serialize$2(name, value, serializeOptions);
  const currentCookies = splitCookiesString(
    event.node.res.getHeader("set-cookie")
  );
  if (currentCookies.length === 0) {
    event.node.res.setHeader("set-cookie", newCookie);
    return;
  }
  const newCookieKey = getDistinctCookieKey(name, serializeOptions);
  event.node.res.removeHeader("set-cookie");
  for (const cookie of currentCookies) {
    const parsed = parseSetCookie(cookie);
    const key = getDistinctCookieKey(parsed.name, parsed);
    if (key === newCookieKey) {
      continue;
    }
    event.node.res.appendHeader("set-cookie", cookie);
  }
  event.node.res.appendHeader("set-cookie", newCookie);
}
function splitCookiesString(cookiesString) {
  if (Array.isArray(cookiesString)) {
    return cookiesString.flatMap((c) => splitCookiesString(c));
  }
  if (typeof cookiesString !== "string") {
    return [];
  }
  const cookiesStrings = [];
  let pos = 0;
  let start;
  let ch;
  let lastComma;
  let nextStart;
  let cookiesSeparatorFound;
  const skipWhitespace = () => {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
      pos += 1;
    }
    return pos < cookiesString.length;
  };
  const notSpecialChar = () => {
    ch = cookiesString.charAt(pos);
    return ch !== "=" && ch !== ";" && ch !== ",";
  };
  while (pos < cookiesString.length) {
    start = pos;
    cookiesSeparatorFound = false;
    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos);
      if (ch === ",") {
        lastComma = pos;
        pos += 1;
        skipWhitespace();
        nextStart = pos;
        while (pos < cookiesString.length && notSpecialChar()) {
          pos += 1;
        }
        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
          cookiesSeparatorFound = true;
          pos = nextStart;
          cookiesStrings.push(cookiesString.slice(start, lastComma));
          start = pos;
        } else {
          pos = lastComma + 1;
        }
      } else {
        pos += 1;
      }
    }
    if (!cookiesSeparatorFound || pos >= cookiesString.length) {
      cookiesStrings.push(cookiesString.slice(start));
    }
  }
  return cookiesStrings;
}

const defer = typeof setImmediate === "undefined" ? (fn) => fn() : setImmediate;
function send(event, data, type) {
  if (type) {
    defaultContentType(event, type);
  }
  return new Promise((resolve) => {
    defer(() => {
      if (!event.handled) {
        event.node.res.end(data);
      }
      resolve();
    });
  });
}
function sendNoContent(event, code) {
  if (event.handled) {
    return;
  }
  if (!code && event.node.res.statusCode !== 200) {
    code = event.node.res.statusCode;
  }
  const _code = sanitizeStatusCode(code, 204);
  if (_code === 204) {
    event.node.res.removeHeader("content-length");
  }
  event.node.res.writeHead(_code);
  event.node.res.end();
}
function setResponseStatus(event, code, text) {
  if (code) {
    event.node.res.statusCode = sanitizeStatusCode(
      code,
      event.node.res.statusCode
    );
  }
  if (text) {
    event.node.res.statusMessage = sanitizeStatusMessage(text);
  }
}
function getResponseStatus(event) {
  return event.node.res.statusCode;
}
function getResponseStatusText(event) {
  return event.node.res.statusMessage;
}
function defaultContentType(event, type) {
  if (type && event.node.res.statusCode !== 304 && !event.node.res.getHeader("content-type")) {
    event.node.res.setHeader("content-type", type);
  }
}
function sendRedirect(event, location, code = 302) {
  event.node.res.statusCode = sanitizeStatusCode(
    code,
    event.node.res.statusCode
  );
  event.node.res.setHeader("location", location);
  const encodedLoc = location.replace(/"/g, "%22");
  const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`;
  return send(event, html, MIMES.html);
}
function getResponseHeader(event, name) {
  return event.node.res.getHeader(name);
}
function setResponseHeaders(event, headers) {
  for (const [name, value] of Object.entries(headers)) {
    event.node.res.setHeader(
      name,
      value
    );
  }
}
const setHeaders = setResponseHeaders;
function setResponseHeader(event, name, value) {
  event.node.res.setHeader(name, value);
}
function appendResponseHeader(event, name, value) {
  let current = event.node.res.getHeader(name);
  if (!current) {
    event.node.res.setHeader(name, value);
    return;
  }
  if (!Array.isArray(current)) {
    current = [current.toString()];
  }
  event.node.res.setHeader(name, [...current, value]);
}
function removeResponseHeader(event, name) {
  return event.node.res.removeHeader(name);
}
function isStream(data) {
  if (!data || typeof data !== "object") {
    return false;
  }
  if (typeof data.pipe === "function") {
    if (typeof data._read === "function") {
      return true;
    }
    if (typeof data.abort === "function") {
      return true;
    }
  }
  if (typeof data.pipeTo === "function") {
    return true;
  }
  return false;
}
function isWebResponse(data) {
  return typeof Response !== "undefined" && data instanceof Response;
}
function sendStream(event, stream) {
  if (!stream || typeof stream !== "object") {
    throw new Error("[h3] Invalid stream provided.");
  }
  event.node.res._data = stream;
  if (!event.node.res.socket) {
    event._handled = true;
    return Promise.resolve();
  }
  if (hasProp(stream, "pipeTo") && typeof stream.pipeTo === "function") {
    return stream.pipeTo(
      new WritableStream({
        write(chunk) {
          event.node.res.write(chunk);
        }
      })
    ).then(() => {
      event.node.res.end();
    });
  }
  if (hasProp(stream, "pipe") && typeof stream.pipe === "function") {
    return new Promise((resolve, reject) => {
      stream.pipe(event.node.res);
      if (stream.on) {
        stream.on("end", () => {
          event.node.res.end();
          resolve();
        });
        stream.on("error", (error) => {
          reject(error);
        });
      }
      event.node.res.on("close", () => {
        if (stream.abort) {
          stream.abort();
        }
      });
    });
  }
  throw new Error("[h3] Invalid or incompatible stream provided.");
}
function sendWebResponse(event, response) {
  for (const [key, value] of response.headers) {
    if (key === "set-cookie") {
      event.node.res.appendHeader(key, splitCookiesString(value));
    } else {
      event.node.res.setHeader(key, value);
    }
  }
  if (response.status) {
    event.node.res.statusCode = sanitizeStatusCode(
      response.status,
      event.node.res.statusCode
    );
  }
  if (response.statusText) {
    event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  }
  if (response.redirected) {
    event.node.res.setHeader("location", response.url);
  }
  if (!response.body) {
    event.node.res.end();
    return;
  }
  return sendStream(event, response.body);
}

const PayloadMethods = /* @__PURE__ */ new Set(["PATCH", "POST", "PUT", "DELETE"]);
const ignoredHeaders = /* @__PURE__ */ new Set([
  "transfer-encoding",
  "accept-encoding",
  "connection",
  "keep-alive",
  "upgrade",
  "expect",
  "host",
  "accept"
]);
async function proxyRequest(event, target, opts = {}) {
  let body;
  let duplex;
  if (PayloadMethods.has(event.method)) {
    if (opts.streamRequest) {
      body = getRequestWebStream(event);
      duplex = "half";
    } else {
      body = await readRawBody(event, false).catch(() => void 0);
    }
  }
  const method = opts.fetchOptions?.method || event.method;
  const fetchHeaders = mergeHeaders$1(
    getProxyRequestHeaders(event, { host: target.startsWith("/") }),
    opts.fetchOptions?.headers,
    opts.headers
  );
  return sendProxy(event, target, {
    ...opts,
    fetchOptions: {
      method,
      body,
      duplex,
      ...opts.fetchOptions,
      headers: fetchHeaders
    }
  });
}
async function sendProxy(event, target, opts = {}) {
  let response;
  try {
    response = await _getFetch(opts.fetch)(target, {
      headers: opts.headers,
      ignoreResponseError: true,
      // make $ofetch.raw transparent
      ...opts.fetchOptions
    });
  } catch (error) {
    throw createError$1({
      status: 502,
      statusMessage: "Bad Gateway",
      cause: error
    });
  }
  event.node.res.statusCode = sanitizeStatusCode(
    response.status,
    event.node.res.statusCode
  );
  event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  const cookies = [];
  for (const [key, value] of response.headers.entries()) {
    if (key === "content-encoding") {
      continue;
    }
    if (key === "content-length") {
      continue;
    }
    if (key === "set-cookie") {
      cookies.push(...splitCookiesString(value));
      continue;
    }
    event.node.res.setHeader(key, value);
  }
  if (cookies.length > 0) {
    event.node.res.setHeader(
      "set-cookie",
      cookies.map((cookie) => {
        if (opts.cookieDomainRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookieDomainRewrite,
            "domain"
          );
        }
        if (opts.cookiePathRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookiePathRewrite,
            "path"
          );
        }
        return cookie;
      })
    );
  }
  if (opts.onResponse) {
    await opts.onResponse(event, response);
  }
  if (response._data !== void 0) {
    return response._data;
  }
  if (event.handled) {
    return;
  }
  if (opts.sendStream === false) {
    const data = new Uint8Array(await response.arrayBuffer());
    return event.node.res.end(data);
  }
  if (response.body) {
    for await (const chunk of response.body) {
      event.node.res.write(chunk);
    }
  }
  return event.node.res.end();
}
function getProxyRequestHeaders(event, opts) {
  const headers = /* @__PURE__ */ Object.create(null);
  const reqHeaders = getRequestHeaders(event);
  for (const name in reqHeaders) {
    if (!ignoredHeaders.has(name) || name === "host" && opts?.host) {
      headers[name] = reqHeaders[name];
    }
  }
  return headers;
}
function fetchWithEvent(event, req, init, options) {
  return _getFetch(options?.fetch)(req, {
    ...init,
    context: init?.context || event.context,
    headers: {
      ...getProxyRequestHeaders(event, {
        host: typeof req === "string" && req.startsWith("/")
      }),
      ...init?.headers
    }
  });
}
function _getFetch(_fetch) {
  if (_fetch) {
    return _fetch;
  }
  if (globalThis.fetch) {
    return globalThis.fetch;
  }
  throw new Error(
    "fetch is not available. Try importing `node-fetch-native/polyfill` for Node.js."
  );
}
function rewriteCookieProperty(header, map, property) {
  const _map = typeof map === "string" ? { "*": map } : map;
  return header.replace(
    new RegExp(`(;\\s*${property}=)([^;]+)`, "gi"),
    (match, prefix, previousValue) => {
      let newValue;
      if (previousValue in _map) {
        newValue = _map[previousValue];
      } else if ("*" in _map) {
        newValue = _map["*"];
      } else {
        return match;
      }
      return newValue ? prefix + newValue : "";
    }
  );
}
function mergeHeaders$1(defaults, ...inputs) {
  const _inputs = inputs.filter(Boolean);
  if (_inputs.length === 0) {
    return defaults;
  }
  const merged = new Headers(defaults);
  for (const input of _inputs) {
    const entries = Array.isArray(input) ? input : typeof input.entries === "function" ? input.entries() : Object.entries(input);
    for (const [key, value] of entries) {
      if (value !== void 0) {
        merged.set(key, value);
      }
    }
  }
  return merged;
}

const getSessionPromise = Symbol("getSession");
const DEFAULT_NAME = "h3";
const DEFAULT_COOKIE = {
  path: "/",
  secure: true,
  httpOnly: true
};
async function useSession(event, config) {
  const sessionName = config.name || DEFAULT_NAME;
  await getSession(event, config);
  const sessionManager = {
    get id() {
      return event.context.sessions?.[sessionName]?.id;
    },
    get data() {
      return event.context.sessions?.[sessionName]?.data || {};
    },
    update: async (update) => {
      if (!isEvent(event)) {
        throw new Error("[h3] Cannot update read-only session.");
      }
      await updateSession(event, config, update);
      return sessionManager;
    },
    clear: () => {
      if (!isEvent(event)) {
        throw new Error("[h3] Cannot clear read-only session.");
      }
      clearSession(event, config);
      return Promise.resolve(sessionManager);
    }
  };
  return sessionManager;
}
async function getSession(event, config) {
  const sessionName = config.name || DEFAULT_NAME;
  if (!event.context.sessions) {
    event.context.sessions = /* @__PURE__ */ Object.create(null);
  }
  const existingSession = event.context.sessions[sessionName];
  if (existingSession) {
    return existingSession[getSessionPromise] || existingSession;
  }
  const session = {
    id: "",
    createdAt: 0,
    data: /* @__PURE__ */ Object.create(null)
  };
  event.context.sessions[sessionName] = session;
  let sealedSession;
  if (config.sessionHeader !== false) {
    const headerName = typeof config.sessionHeader === "string" ? config.sessionHeader.toLowerCase() : `x-${sessionName.toLowerCase()}-session`;
    const headerValue = _getReqHeader(event, headerName);
    if (typeof headerValue === "string") {
      sealedSession = headerValue;
    }
  }
  if (!sealedSession) {
    const cookieHeader = _getReqHeader(event, "cookie");
    if (cookieHeader) {
      sealedSession = parse$1(cookieHeader + "")[sessionName];
    }
  }
  if (sealedSession) {
    const promise = unsealSession(event, config, sealedSession).catch(() => {
    }).then((unsealed) => {
      Object.assign(session, unsealed);
      delete event.context.sessions[sessionName][getSessionPromise];
      return session;
    });
    event.context.sessions[sessionName][getSessionPromise] = promise;
    await promise;
  }
  if (!session.id) {
    if (!isEvent(event)) {
      throw new Error(
        "Cannot initialize a new session. Make sure using `useSession(event)` in main handler."
      );
    }
    session.id = config.generateId?.() ?? (config.crypto || _crypto).randomUUID();
    session.createdAt = Date.now();
    await updateSession(event, config);
  }
  return session;
}
function _getReqHeader(event, name) {
  if (event.node) {
    return event.node?.req.headers[name];
  }
  if (event.request) {
    return event.request.headers?.get(name);
  }
  if (event.headers) {
    return event.headers.get(name);
  }
}
async function updateSession(event, config, update) {
  const sessionName = config.name || DEFAULT_NAME;
  const session = event.context.sessions?.[sessionName] || await getSession(event, config);
  if (typeof update === "function") {
    update = update(session.data);
  }
  if (update) {
    Object.assign(session.data, update);
  }
  if (config.cookie !== false) {
    const sealed = await sealSession(event, config);
    setCookie(event, sessionName, sealed, {
      ...DEFAULT_COOKIE,
      expires: config.maxAge ? new Date(session.createdAt + config.maxAge * 1e3) : void 0,
      ...config.cookie
    });
  }
  return session;
}
async function sealSession(event, config) {
  const sessionName = config.name || DEFAULT_NAME;
  const session = event.context.sessions?.[sessionName] || await getSession(event, config);
  const sealed = await seal(
    config.crypto || _crypto,
    session,
    config.password,
    {
      ...defaults,
      ttl: config.maxAge ? config.maxAge * 1e3 : 0,
      ...config.seal
    }
  );
  return sealed;
}
async function unsealSession(_event, config, sealed) {
  const unsealed = await unseal(
    config.crypto || _crypto,
    sealed,
    config.password,
    {
      ...defaults,
      ttl: config.maxAge ? config.maxAge * 1e3 : 0,
      ...config.seal
    }
  );
  if (config.maxAge) {
    const age = Date.now() - (unsealed.createdAt || Number.NEGATIVE_INFINITY);
    if (age > config.maxAge * 1e3) {
      throw new Error("Session expired!");
    }
  }
  return unsealed;
}
function clearSession(event, config) {
  const sessionName = config.name || DEFAULT_NAME;
  if (event.context.sessions?.[sessionName]) {
    delete event.context.sessions[sessionName];
  }
  setCookie(event, sessionName, "", {
    ...DEFAULT_COOKIE,
    ...config.cookie
  });
  return Promise.resolve();
}

class H3Event {
  "__is_event__" = true;
  // Context
  node;
  // Node
  web;
  // Web
  context = {};
  // Shared
  // Request
  _method;
  _path;
  _headers;
  _requestBody;
  // Response
  _handled = false;
  // Hooks
  _onBeforeResponseCalled;
  _onAfterResponseCalled;
  constructor(req, res) {
    this.node = { req, res };
  }
  // --- Request ---
  get method() {
    if (!this._method) {
      this._method = (this.node.req.method || "GET").toUpperCase();
    }
    return this._method;
  }
  get path() {
    return this._path || this.node.req.url || "/";
  }
  get headers() {
    if (!this._headers) {
      this._headers = _normalizeNodeHeaders(this.node.req.headers);
    }
    return this._headers;
  }
  // --- Respoonse ---
  get handled() {
    return this._handled || this.node.res.writableEnded || this.node.res.headersSent;
  }
  respondWith(response) {
    return Promise.resolve(response).then(
      (_response) => sendWebResponse(this, _response)
    );
  }
  // --- Utils ---
  toString() {
    return `[${this.method}] ${this.path}`;
  }
  toJSON() {
    return this.toString();
  }
  // --- Deprecated ---
  /** @deprecated Please use `event.node.req` instead. */
  get req() {
    return this.node.req;
  }
  /** @deprecated Please use `event.node.res` instead. */
  get res() {
    return this.node.res;
  }
}
function isEvent(input) {
  return hasProp(input, "__is_event__");
}
function createEvent(req, res) {
  return new H3Event(req, res);
}
function _normalizeNodeHeaders(nodeHeaders) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(nodeHeaders)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    } else if (value) {
      headers.set(name, value);
    }
  }
  return headers;
}

function defineEventHandler(handler) {
  if (typeof handler === "function") {
    handler.__is_handler__ = true;
    return handler;
  }
  const _hooks = {
    onRequest: _normalizeArray(handler.onRequest),
    onBeforeResponse: _normalizeArray(handler.onBeforeResponse)
  };
  const _handler = (event) => {
    return _callHandler(event, handler.handler, _hooks);
  };
  _handler.__is_handler__ = true;
  _handler.__resolve__ = handler.handler.__resolve__;
  _handler.__websocket__ = handler.websocket;
  return _handler;
}
function _normalizeArray(input) {
  return input ? Array.isArray(input) ? input : [input] : void 0;
}
async function _callHandler(event, handler, hooks) {
  if (hooks.onRequest) {
    for (const hook of hooks.onRequest) {
      await hook(event);
      if (event.handled) {
        return;
      }
    }
  }
  const body = await handler(event);
  const response = { body };
  if (hooks.onBeforeResponse) {
    for (const hook of hooks.onBeforeResponse) {
      await hook(event, response);
    }
  }
  return response.body;
}
const eventHandler = defineEventHandler;
function isEventHandler(input) {
  return hasProp(input, "__is_handler__");
}
function toEventHandler(input, _, _route) {
  return input;
}
function defineLazyEventHandler(factory) {
  let _promise;
  let _resolved;
  const resolveHandler = () => {
    if (_resolved) {
      return Promise.resolve(_resolved);
    }
    if (!_promise) {
      _promise = Promise.resolve(factory()).then((r) => {
        const handler2 = r.default || r;
        if (typeof handler2 !== "function") {
          throw new TypeError(
            "Invalid lazy handler result. It should be a function:",
            handler2
          );
        }
        _resolved = { handler: toEventHandler(r.default || r) };
        return _resolved;
      });
    }
    return _promise;
  };
  const handler = eventHandler((event) => {
    if (_resolved) {
      return _resolved.handler(event);
    }
    return resolveHandler().then((r) => r.handler(event));
  });
  handler.__resolve__ = resolveHandler;
  return handler;
}
const lazyEventHandler = defineLazyEventHandler;

function createApp(options = {}) {
  const stack = [];
  const handler = createAppEventHandler(stack, options);
  const resolve = createResolver(stack);
  handler.__resolve__ = resolve;
  const getWebsocket = cachedFn(() => websocketOptions(resolve, options));
  const app = {
    // @ts-expect-error
    use: (arg1, arg2, arg3) => use(app, arg1, arg2, arg3),
    resolve,
    handler,
    stack,
    options,
    get websocket() {
      return getWebsocket();
    }
  };
  return app;
}
function use(app, arg1, arg2, arg3) {
  if (Array.isArray(arg1)) {
    for (const i of arg1) {
      use(app, i, arg2, arg3);
    }
  } else if (Array.isArray(arg2)) {
    for (const i of arg2) {
      use(app, arg1, i, arg3);
    }
  } else if (typeof arg1 === "string") {
    app.stack.push(
      normalizeLayer({ ...arg3, route: arg1, handler: arg2 })
    );
  } else if (typeof arg1 === "function") {
    app.stack.push(normalizeLayer({ ...arg2, handler: arg1 }));
  } else {
    app.stack.push(normalizeLayer({ ...arg1 }));
  }
  return app;
}
function createAppEventHandler(stack, options) {
  const spacing = options.debug ? 2 : void 0;
  return eventHandler(async (event) => {
    event.node.req.originalUrl = event.node.req.originalUrl || event.node.req.url || "/";
    const _rawReqUrl = event.node.req.url || "/";
    const _reqPath = _decodePath(event._path || _rawReqUrl);
    event._path = _reqPath;
    const _needsRawUrl = _reqPath !== _rawReqUrl;
    let _layerPath;
    if (options.onRequest) {
      await options.onRequest(event);
    }
    for (const layer of stack) {
      if (layer.route.length > 1) {
        if (!_reqPath.startsWith(layer.route)) {
          continue;
        }
        _layerPath = _reqPath.slice(layer.route.length) || "/";
      } else {
        _layerPath = _reqPath;
      }
      if (layer.match && !layer.match(_layerPath, event)) {
        continue;
      }
      event._path = _layerPath;
      event.node.req.url = _needsRawUrl ? layer.route.length > 1 ? _rawReqUrl.slice(layer.route.length) || "/" : _rawReqUrl : _layerPath;
      const val = await layer.handler(event);
      const _body = val === void 0 ? void 0 : await val;
      if (_body !== void 0) {
        const _response = { body: _body };
        if (options.onBeforeResponse) {
          event._onBeforeResponseCalled = true;
          await options.onBeforeResponse(event, _response);
        }
        await handleHandlerResponse(event, _response.body, spacing);
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, _response);
        }
        return;
      }
      if (event.handled) {
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, void 0);
        }
        return;
      }
    }
    if (!event.handled) {
      throw createError$1({
        statusCode: 404,
        statusMessage: `Cannot find any path matching ${event.path || "/"}.`
      });
    }
    if (options.onAfterResponse) {
      event._onAfterResponseCalled = true;
      await options.onAfterResponse(event, void 0);
    }
  });
}
function createResolver(stack) {
  return async (path) => {
    let _layerPath;
    for (const layer of stack) {
      if (layer.route === "/" && !layer.handler.__resolve__) {
        continue;
      }
      if (!path.startsWith(layer.route)) {
        continue;
      }
      _layerPath = path.slice(layer.route.length) || "/";
      if (layer.match && !layer.match(_layerPath, void 0)) {
        continue;
      }
      let res = { route: layer.route, handler: layer.handler };
      if (res.handler.__resolve__) {
        const _res = await res.handler.__resolve__(_layerPath);
        if (!_res) {
          continue;
        }
        res = {
          ...res,
          ..._res,
          route: joinURL(res.route || "/", _res.route || "/")
        };
      }
      return res;
    }
  };
}
function normalizeLayer(input) {
  let handler = input.handler;
  if (handler.handler) {
    handler = handler.handler;
  }
  if (input.lazy) {
    handler = lazyEventHandler(handler);
  } else if (!isEventHandler(handler)) {
    handler = toEventHandler(handler, void 0, input.route);
  }
  return {
    route: withoutTrailingSlash(input.route),
    match: input.match,
    handler
  };
}
function handleHandlerResponse(event, val, jsonSpace) {
  if (val === null) {
    return sendNoContent(event);
  }
  if (val) {
    if (isWebResponse(val)) {
      return sendWebResponse(event, val);
    }
    if (isStream(val)) {
      return sendStream(event, val);
    }
    if (val.buffer) {
      return send(event, val);
    }
    if (val.arrayBuffer && typeof val.arrayBuffer === "function") {
      return val.arrayBuffer().then((arrayBuffer) => {
        return send(event, Buffer.from(arrayBuffer), val.type);
      });
    }
    if (val instanceof Error) {
      throw createError$1(val);
    }
    if (typeof val.end === "function") {
      return true;
    }
  }
  const valType = typeof val;
  if (valType === "string") {
    return send(event, val, MIMES.html);
  }
  if (valType === "object" || valType === "boolean" || valType === "number") {
    return send(event, JSON.stringify(val, void 0, jsonSpace), MIMES.json);
  }
  if (valType === "bigint") {
    return send(event, val.toString(), MIMES.json);
  }
  throw createError$1({
    statusCode: 500,
    statusMessage: `[h3] Cannot send ${valType} as response.`
  });
}
function cachedFn(fn) {
  let cache;
  return () => {
    if (!cache) {
      cache = fn();
    }
    return cache;
  };
}
function _decodePath(url) {
  const qIndex = url.indexOf("?");
  const path = qIndex === -1 ? url : url.slice(0, qIndex);
  const query = qIndex === -1 ? "" : url.slice(qIndex);
  const decodedPath = path.includes("%25") ? decodePath(path.replace(/%25/g, "%2525")) : decodePath(path);
  return decodedPath + query;
}
function websocketOptions(evResolver, appOptions) {
  return {
    ...appOptions.websocket,
    async resolve(info) {
      const url = info.request?.url || info.url || "/";
      const { pathname } = typeof url === "string" ? parseURL(url) : url;
      const resolved = await evResolver(pathname);
      return resolved?.handler?.__websocket__ || {};
    }
  };
}

const RouterMethods = [
  "connect",
  "delete",
  "get",
  "head",
  "options",
  "post",
  "put",
  "trace",
  "patch"
];
function createRouter(opts = {}) {
  const _router = createRouter$1({});
  const routes = {};
  let _matcher;
  const router = {};
  const addRoute = (path, handler, method) => {
    let route = routes[path];
    if (!route) {
      routes[path] = route = { path, handlers: {} };
      _router.insert(path, route);
    }
    if (Array.isArray(method)) {
      for (const m of method) {
        addRoute(path, handler, m);
      }
    } else {
      route.handlers[method] = toEventHandler(handler);
    }
    return router;
  };
  router.use = router.add = (path, handler, method) => addRoute(path, handler, method || "all");
  for (const method of RouterMethods) {
    router[method] = (path, handle) => router.add(path, handle, method);
  }
  const matchHandler = (path = "/", method = "get") => {
    const qIndex = path.indexOf("?");
    if (qIndex !== -1) {
      path = path.slice(0, Math.max(0, qIndex));
    }
    const matched = _router.lookup(path);
    if (!matched || !matched.handlers) {
      return {
        error: createError$1({
          statusCode: 404,
          name: "Not Found",
          statusMessage: `Cannot find any route matching ${path || "/"}.`
        })
      };
    }
    let handler = matched.handlers[method] || matched.handlers.all;
    if (!handler) {
      if (!_matcher) {
        _matcher = toRouteMatcher(_router);
      }
      const _matches = _matcher.matchAll(path).reverse();
      for (const _match of _matches) {
        if (_match.handlers[method]) {
          handler = _match.handlers[method];
          matched.handlers[method] = matched.handlers[method] || handler;
          break;
        }
        if (_match.handlers.all) {
          handler = _match.handlers.all;
          matched.handlers.all = matched.handlers.all || handler;
          break;
        }
      }
    }
    if (!handler) {
      return {
        error: createError$1({
          statusCode: 405,
          name: "Method Not Allowed",
          statusMessage: `Method ${method} is not allowed on this route.`
        })
      };
    }
    return { matched, handler };
  };
  const isPreemptive = opts.preemptive || opts.preemtive;
  router.handler = eventHandler((event) => {
    const match = matchHandler(
      event.path,
      event.method.toLowerCase()
    );
    if ("error" in match) {
      if (isPreemptive) {
        throw match.error;
      } else {
        return;
      }
    }
    event.context.matchedRoute = match.matched;
    const params = match.matched.params || {};
    event.context.params = params;
    return Promise.resolve(match.handler(event)).then((res) => {
      if (res === void 0 && isPreemptive) {
        return null;
      }
      return res;
    });
  });
  router.handler.__resolve__ = async (path) => {
    path = withLeadingSlash(path);
    const match = matchHandler(path);
    if ("error" in match) {
      return;
    }
    let res = {
      route: match.matched.path,
      handler: match.handler
    };
    if (match.handler.__resolve__) {
      const _res = await match.handler.__resolve__(path);
      if (!_res) {
        return;
      }
      res = { ...res, ..._res };
    }
    return res;
  };
  return router;
}
function toNodeListener(app) {
  const toNodeHandle = async function(req, res) {
    const event = createEvent(req, res);
    try {
      await app.handler(event);
    } catch (_error) {
      const error = createError$1(_error);
      if (!isError(_error)) {
        error.unhandled = true;
      }
      setResponseStatus(event, error.statusCode, error.statusMessage);
      if (app.options.onError) {
        await app.options.onError(error, event);
      }
      if (event.handled) {
        return;
      }
      if (error.unhandled || error.fatal) {
        console.error("[h3]", error.fatal ? "[fatal]" : "[unhandled]", error);
      }
      if (app.options.onBeforeResponse && !event._onBeforeResponseCalled) {
        await app.options.onBeforeResponse(event, { body: error });
      }
      await sendError(event, error, !!app.options.debug);
      if (app.options.onAfterResponse && !event._onAfterResponseCalled) {
        await app.options.onAfterResponse(event, { body: error });
      }
    }
  };
  return toNodeHandle;
}

function flatHooks(configHooks, hooks = {}, parentName) {
  for (const key in configHooks) {
    const subHook = configHooks[key];
    const name = parentName ? `${parentName}:${key}` : key;
    if (typeof subHook === "object" && subHook !== null) {
      flatHooks(subHook, hooks, name);
    } else if (typeof subHook === "function") {
      hooks[name] = subHook;
    }
  }
  return hooks;
}
const defaultTask = { run: (function_) => function_() };
const _createTask = () => defaultTask;
const createTask = typeof console.createTask !== "undefined" ? console.createTask : _createTask;
function serialTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return hooks.reduce(
    (promise, hookFunction) => promise.then(() => task.run(() => hookFunction(...args))),
    Promise.resolve()
  );
}
function parallelTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return Promise.all(hooks.map((hook) => task.run(() => hook(...args))));
}
function callEachWith(callbacks, arg0) {
  for (const callback of [...callbacks]) {
    callback(arg0);
  }
}

class Hookable {
  constructor() {
    this._hooks = {};
    this._before = void 0;
    this._after = void 0;
    this._deprecatedMessages = void 0;
    this._deprecatedHooks = {};
    this.hook = this.hook.bind(this);
    this.callHook = this.callHook.bind(this);
    this.callHookWith = this.callHookWith.bind(this);
  }
  hook(name, function_, options = {}) {
    if (!name || typeof function_ !== "function") {
      return () => {
      };
    }
    const originalName = name;
    let dep;
    while (this._deprecatedHooks[name]) {
      dep = this._deprecatedHooks[name];
      name = dep.to;
    }
    if (dep && !options.allowDeprecated) {
      let message = dep.message;
      if (!message) {
        message = `${originalName} hook has been deprecated` + (dep.to ? `, please use ${dep.to}` : "");
      }
      if (!this._deprecatedMessages) {
        this._deprecatedMessages = /* @__PURE__ */ new Set();
      }
      if (!this._deprecatedMessages.has(message)) {
        console.warn(message);
        this._deprecatedMessages.add(message);
      }
    }
    if (!function_.name) {
      try {
        Object.defineProperty(function_, "name", {
          get: () => "_" + name.replace(/\W+/g, "_") + "_hook_cb",
          configurable: true
        });
      } catch {
      }
    }
    this._hooks[name] = this._hooks[name] || [];
    this._hooks[name].push(function_);
    return () => {
      if (function_) {
        this.removeHook(name, function_);
        function_ = void 0;
      }
    };
  }
  hookOnce(name, function_) {
    let _unreg;
    let _function = (...arguments_) => {
      if (typeof _unreg === "function") {
        _unreg();
      }
      _unreg = void 0;
      _function = void 0;
      return function_(...arguments_);
    };
    _unreg = this.hook(name, _function);
    return _unreg;
  }
  removeHook(name, function_) {
    if (this._hooks[name]) {
      const index = this._hooks[name].indexOf(function_);
      if (index !== -1) {
        this._hooks[name].splice(index, 1);
      }
      if (this._hooks[name].length === 0) {
        delete this._hooks[name];
      }
    }
  }
  deprecateHook(name, deprecated) {
    this._deprecatedHooks[name] = typeof deprecated === "string" ? { to: deprecated } : deprecated;
    const _hooks = this._hooks[name] || [];
    delete this._hooks[name];
    for (const hook of _hooks) {
      this.hook(name, hook);
    }
  }
  deprecateHooks(deprecatedHooks) {
    Object.assign(this._deprecatedHooks, deprecatedHooks);
    for (const name in deprecatedHooks) {
      this.deprecateHook(name, deprecatedHooks[name]);
    }
  }
  addHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    const removeFns = Object.keys(hooks).map(
      (key) => this.hook(key, hooks[key])
    );
    return () => {
      for (const unreg of removeFns.splice(0, removeFns.length)) {
        unreg();
      }
    };
  }
  removeHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    for (const key in hooks) {
      this.removeHook(key, hooks[key]);
    }
  }
  removeAllHooks() {
    for (const key in this._hooks) {
      delete this._hooks[key];
    }
  }
  callHook(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(serialTaskCaller, name, ...arguments_);
  }
  callHookParallel(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(parallelTaskCaller, name, ...arguments_);
  }
  callHookWith(caller, name, ...arguments_) {
    const event = this._before || this._after ? { name, args: arguments_, context: {} } : void 0;
    if (this._before) {
      callEachWith(this._before, event);
    }
    const result = caller(
      name in this._hooks ? [...this._hooks[name]] : [],
      arguments_
    );
    if (result instanceof Promise) {
      return result.finally(() => {
        if (this._after && event) {
          callEachWith(this._after, event);
        }
      });
    }
    if (this._after && event) {
      callEachWith(this._after, event);
    }
    return result;
  }
  beforeEach(function_) {
    this._before = this._before || [];
    this._before.push(function_);
    return () => {
      if (this._before !== void 0) {
        const index = this._before.indexOf(function_);
        if (index !== -1) {
          this._before.splice(index, 1);
        }
      }
    };
  }
  afterEach(function_) {
    this._after = this._after || [];
    this._after.push(function_);
    return () => {
      if (this._after !== void 0) {
        const index = this._after.indexOf(function_);
        if (index !== -1) {
          this._after.splice(index, 1);
        }
      }
    };
  }
}
function createHooks() {
  return new Hookable();
}

const s$1=globalThis.Headers,i=globalThis.AbortController,l=globalThis.fetch||(()=>{throw new Error("[node-fetch-native] Failed to fetch: `globalThis.fetch` is not available!")});

class FetchError extends Error {
  constructor(message, opts) {
    super(message, opts);
    this.name = "FetchError";
    if (opts?.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
}
function createFetchError(ctx) {
  const errorMessage = ctx.error?.message || ctx.error?.toString() || "";
  const method = ctx.request?.method || ctx.options?.method || "GET";
  const url = ctx.request?.url || String(ctx.request) || "/";
  const requestStr = `[${method}] ${JSON.stringify(url)}`;
  const statusStr = ctx.response ? `${ctx.response.status} ${ctx.response.statusText}` : "<no response>";
  const message = `${requestStr}: ${statusStr}${errorMessage ? ` ${errorMessage}` : ""}`;
  const fetchError = new FetchError(
    message,
    ctx.error ? { cause: ctx.error } : void 0
  );
  for (const key of ["request", "options", "response"]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx[key];
      }
    });
  }
  for (const [key, refKey] of [
    ["data", "_data"],
    ["status", "status"],
    ["statusCode", "status"],
    ["statusText", "statusText"],
    ["statusMessage", "statusText"]
  ]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx.response && ctx.response[refKey];
      }
    });
  }
  return fetchError;
}

const payloadMethods = new Set(
  Object.freeze(["PATCH", "POST", "PUT", "DELETE"])
);
function isPayloadMethod(method = "GET") {
  return payloadMethods.has(method.toUpperCase());
}
function isJSONSerializable(value) {
  if (value === void 0) {
    return false;
  }
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean" || t === null) {
    return true;
  }
  if (t !== "object") {
    return false;
  }
  if (Array.isArray(value)) {
    return true;
  }
  if (value.buffer) {
    return false;
  }
  if (value instanceof FormData || value instanceof URLSearchParams) {
    return false;
  }
  return value.constructor && value.constructor.name === "Object" || typeof value.toJSON === "function";
}
const textTypes = /* @__PURE__ */ new Set([
  "image/svg",
  "application/xml",
  "application/xhtml",
  "application/html"
]);
const JSON_RE = /^application\/(?:[\w!#$%&*.^`~-]*\+)?json(;.+)?$/i;
function detectResponseType(_contentType = "") {
  if (!_contentType) {
    return "json";
  }
  const contentType = _contentType.split(";").shift() || "";
  if (JSON_RE.test(contentType)) {
    return "json";
  }
  if (contentType === "text/event-stream") {
    return "stream";
  }
  if (textTypes.has(contentType) || contentType.startsWith("text/")) {
    return "text";
  }
  return "blob";
}
function resolveFetchOptions(request, input, defaults, Headers) {
  const headers = mergeHeaders(
    input?.headers ?? request?.headers,
    defaults?.headers,
    Headers
  );
  let query;
  if (defaults?.query || defaults?.params || input?.params || input?.query) {
    query = {
      ...defaults?.params,
      ...defaults?.query,
      ...input?.params,
      ...input?.query
    };
  }
  return {
    ...defaults,
    ...input,
    query,
    params: query,
    headers
  };
}
function mergeHeaders(input, defaults, Headers) {
  if (!defaults) {
    return new Headers(input);
  }
  const headers = new Headers(defaults);
  if (input) {
    for (const [key, value] of Symbol.iterator in input || Array.isArray(input) ? input : new Headers(input)) {
      headers.set(key, value);
    }
  }
  return headers;
}
async function callHooks(context, hooks) {
  if (hooks) {
    if (Array.isArray(hooks)) {
      for (const hook of hooks) {
        await hook(context);
      }
    } else {
      await hooks(context);
    }
  }
}

const retryStatusCodes = /* @__PURE__ */ new Set([
  408,
  // Request Timeout
  409,
  // Conflict
  425,
  // Too Early (Experimental)
  429,
  // Too Many Requests
  500,
  // Internal Server Error
  502,
  // Bad Gateway
  503,
  // Service Unavailable
  504
  // Gateway Timeout
]);
const nullBodyResponses = /* @__PURE__ */ new Set([101, 204, 205, 304]);
function createFetch(globalOptions = {}) {
  const {
    fetch = globalThis.fetch,
    Headers = globalThis.Headers,
    AbortController = globalThis.AbortController
  } = globalOptions;
  async function onError(context) {
    const isAbort = context.error && context.error.name === "AbortError" && !context.options.timeout || false;
    if (context.options.retry !== false && !isAbort) {
      let retries;
      if (typeof context.options.retry === "number") {
        retries = context.options.retry;
      } else {
        retries = isPayloadMethod(context.options.method) ? 0 : 1;
      }
      const responseCode = context.response && context.response.status || 500;
      if (retries > 0 && (Array.isArray(context.options.retryStatusCodes) ? context.options.retryStatusCodes.includes(responseCode) : retryStatusCodes.has(responseCode))) {
        const retryDelay = typeof context.options.retryDelay === "function" ? context.options.retryDelay(context) : context.options.retryDelay || 0;
        if (retryDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
        return $fetchRaw(context.request, {
          ...context.options,
          retry: retries - 1
        });
      }
    }
    const error = createFetchError(context);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(error, $fetchRaw);
    }
    throw error;
  }
  const $fetchRaw = async function $fetchRaw2(_request, _options = {}) {
    const context = {
      request: _request,
      options: resolveFetchOptions(
        _request,
        _options,
        globalOptions.defaults,
        Headers
      ),
      response: void 0,
      error: void 0
    };
    if (context.options.method) {
      context.options.method = context.options.method.toUpperCase();
    }
    if (context.options.onRequest) {
      await callHooks(context, context.options.onRequest);
      if (!(context.options.headers instanceof Headers)) {
        context.options.headers = new Headers(
          context.options.headers || {}
          /* compat */
        );
      }
    }
    if (typeof context.request === "string") {
      if (context.options.baseURL) {
        context.request = withBase(context.request, context.options.baseURL);
      }
      if (context.options.query) {
        context.request = withQuery(context.request, context.options.query);
        delete context.options.query;
      }
      if ("query" in context.options) {
        delete context.options.query;
      }
      if ("params" in context.options) {
        delete context.options.params;
      }
    }
    if (context.options.body && isPayloadMethod(context.options.method)) {
      if (isJSONSerializable(context.options.body)) {
        const contentType = context.options.headers.get("content-type");
        if (typeof context.options.body !== "string") {
          context.options.body = contentType === "application/x-www-form-urlencoded" ? new URLSearchParams(
            context.options.body
          ).toString() : JSON.stringify(context.options.body);
        }
        if (!contentType) {
          context.options.headers.set("content-type", "application/json");
        }
        if (!context.options.headers.has("accept")) {
          context.options.headers.set("accept", "application/json");
        }
      } else if (
        // ReadableStream Body
        "pipeTo" in context.options.body && typeof context.options.body.pipeTo === "function" || // Node.js Stream Body
        typeof context.options.body.pipe === "function"
      ) {
        if (!("duplex" in context.options)) {
          context.options.duplex = "half";
        }
      }
    }
    let abortTimeout;
    if (!context.options.signal && context.options.timeout) {
      const controller = new AbortController();
      abortTimeout = setTimeout(() => {
        const error = new Error(
          "[TimeoutError]: The operation was aborted due to timeout"
        );
        error.name = "TimeoutError";
        error.code = 23;
        controller.abort(error);
      }, context.options.timeout);
      context.options.signal = controller.signal;
    }
    try {
      context.response = await fetch(
        context.request,
        context.options
      );
    } catch (error) {
      context.error = error;
      if (context.options.onRequestError) {
        await callHooks(
          context,
          context.options.onRequestError
        );
      }
      return await onError(context);
    } finally {
      if (abortTimeout) {
        clearTimeout(abortTimeout);
      }
    }
    const hasBody = (context.response.body || // https://github.com/unjs/ofetch/issues/324
    // https://github.com/unjs/ofetch/issues/294
    // https://github.com/JakeChampion/fetch/issues/1454
    context.response._bodyInit) && !nullBodyResponses.has(context.response.status) && context.options.method !== "HEAD";
    if (hasBody) {
      const responseType = (context.options.parseResponse ? "json" : context.options.responseType) || detectResponseType(context.response.headers.get("content-type") || "");
      switch (responseType) {
        case "json": {
          const data = await context.response.text();
          const parseFunction = context.options.parseResponse || destr;
          context.response._data = parseFunction(data);
          break;
        }
        case "stream": {
          context.response._data = context.response.body || context.response._bodyInit;
          break;
        }
        default: {
          context.response._data = await context.response[responseType]();
        }
      }
    }
    if (context.options.onResponse) {
      await callHooks(
        context,
        context.options.onResponse
      );
    }
    if (!context.options.ignoreResponseError && context.response.status >= 400 && context.response.status < 600) {
      if (context.options.onResponseError) {
        await callHooks(
          context,
          context.options.onResponseError
        );
      }
      return await onError(context);
    }
    return context.response;
  };
  const $fetch = async function $fetch2(request, options) {
    const r = await $fetchRaw(request, options);
    return r._data;
  };
  $fetch.raw = $fetchRaw;
  $fetch.native = (...args) => fetch(...args);
  $fetch.create = (defaultOptions = {}, customGlobalOptions = {}) => createFetch({
    ...globalOptions,
    ...customGlobalOptions,
    defaults: {
      ...globalOptions.defaults,
      ...customGlobalOptions.defaults,
      ...defaultOptions
    }
  });
  return $fetch;
}

function createNodeFetch() {
  const useKeepAlive = JSON.parse(process.env.FETCH_KEEP_ALIVE || "false");
  if (!useKeepAlive) {
    return l;
  }
  const agentOptions = { keepAlive: true };
  const httpAgent = new http.Agent(agentOptions);
  const httpsAgent = new https.Agent(agentOptions);
  const nodeFetchOptions = {
    agent(parsedURL) {
      return parsedURL.protocol === "http:" ? httpAgent : httpsAgent;
    }
  };
  return function nodeFetchWithKeepAlive(input, init) {
    return l(input, { ...nodeFetchOptions, ...init });
  };
}
const fetch = globalThis.fetch ? (...args) => globalThis.fetch(...args) : createNodeFetch();
const Headers$1 = globalThis.Headers || s$1;
const AbortController = globalThis.AbortController || i;
const ofetch = createFetch({ fetch, Headers: Headers$1, AbortController });
const $fetch$1 = ofetch;

function wrapToPromise(value) {
  if (!value || typeof value.then !== "function") {
    return Promise.resolve(value);
  }
  return value;
}
function asyncCall(function_, ...arguments_) {
  try {
    return wrapToPromise(function_(...arguments_));
  } catch (error) {
    return Promise.reject(error);
  }
}
function isPrimitive(value) {
  const type = typeof value;
  return value === null || type !== "object" && type !== "function";
}
function isPureObject(value) {
  const proto = Object.getPrototypeOf(value);
  return !proto || proto.isPrototypeOf(Object);
}
function stringify(value) {
  if (isPrimitive(value)) {
    return String(value);
  }
  if (isPureObject(value) || Array.isArray(value)) {
    return JSON.stringify(value);
  }
  if (typeof value.toJSON === "function") {
    return stringify(value.toJSON());
  }
  throw new Error("[unstorage] Cannot stringify value!");
}
const BASE64_PREFIX = "base64:";
function serializeRaw(value) {
  if (typeof value === "string") {
    return value;
  }
  return BASE64_PREFIX + base64Encode(value);
}
function deserializeRaw(value) {
  if (typeof value !== "string") {
    return value;
  }
  if (!value.startsWith(BASE64_PREFIX)) {
    return value;
  }
  return base64Decode(value.slice(BASE64_PREFIX.length));
}
function base64Decode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input, "base64");
  }
  return Uint8Array.from(
    globalThis.atob(input),
    (c) => c.codePointAt(0)
  );
}
function base64Encode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input).toString("base64");
  }
  return globalThis.btoa(String.fromCodePoint(...input));
}

const storageKeyProperties = [
  "has",
  "hasItem",
  "get",
  "getItem",
  "getItemRaw",
  "set",
  "setItem",
  "setItemRaw",
  "del",
  "remove",
  "removeItem",
  "getMeta",
  "setMeta",
  "removeMeta",
  "getKeys",
  "clear",
  "mount",
  "unmount"
];
function prefixStorage(storage, base) {
  base = normalizeBaseKey(base);
  if (!base) {
    return storage;
  }
  const nsStorage = { ...storage };
  for (const property of storageKeyProperties) {
    nsStorage[property] = (key = "", ...args) => (
      // @ts-ignore
      storage[property](base + key, ...args)
    );
  }
  nsStorage.getKeys = (key = "", ...arguments_) => storage.getKeys(base + key, ...arguments_).then((keys) => keys.map((key2) => key2.slice(base.length)));
  nsStorage.keys = nsStorage.getKeys;
  nsStorage.getItems = async (items, commonOptions) => {
    const prefixedItems = items.map(
      (item) => typeof item === "string" ? base + item : { ...item, key: base + item.key }
    );
    const results = await storage.getItems(prefixedItems, commonOptions);
    return results.map((entry) => ({
      key: entry.key.slice(base.length),
      value: entry.value
    }));
  };
  nsStorage.setItems = async (items, commonOptions) => {
    const prefixedItems = items.map((item) => ({
      key: base + item.key,
      value: item.value,
      options: item.options
    }));
    return storage.setItems(prefixedItems, commonOptions);
  };
  return nsStorage;
}
function normalizeKey$1(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
}
function joinKeys(...keys) {
  return normalizeKey$1(keys.join(":"));
}
function normalizeBaseKey(base) {
  base = normalizeKey$1(base);
  return base ? base + ":" : "";
}
function filterKeyByDepth(key, depth) {
  if (depth === void 0) {
    return true;
  }
  let substrCount = 0;
  let index = key.indexOf(":");
  while (index > -1) {
    substrCount++;
    index = key.indexOf(":", index + 1);
  }
  return substrCount <= depth;
}
function filterKeyByBase(key, base) {
  if (base) {
    return key.startsWith(base) && key[key.length - 1] !== "$";
  }
  return key[key.length - 1] !== "$";
}

function defineDriver$1(factory) {
  return factory;
}

const DRIVER_NAME$1 = "memory";
const memory = defineDriver$1(() => {
  const data = /* @__PURE__ */ new Map();
  return {
    name: DRIVER_NAME$1,
    getInstance: () => data,
    hasItem(key) {
      return data.has(key);
    },
    getItem(key) {
      return data.get(key) ?? null;
    },
    getItemRaw(key) {
      return data.get(key) ?? null;
    },
    setItem(key, value) {
      data.set(key, value);
    },
    setItemRaw(key, value) {
      data.set(key, value);
    },
    removeItem(key) {
      data.delete(key);
    },
    getKeys() {
      return [...data.keys()];
    },
    clear() {
      data.clear();
    },
    dispose() {
      data.clear();
    }
  };
});

function createStorage(options = {}) {
  const context = {
    mounts: { "": options.driver || memory() },
    mountpoints: [""],
    watching: false,
    watchListeners: [],
    unwatch: {}
  };
  const getMount = (key) => {
    for (const base of context.mountpoints) {
      if (key.startsWith(base)) {
        return {
          base,
          relativeKey: key.slice(base.length),
          driver: context.mounts[base]
        };
      }
    }
    return {
      base: "",
      relativeKey: key,
      driver: context.mounts[""]
    };
  };
  const getMounts = (base, includeParent) => {
    return context.mountpoints.filter(
      (mountpoint) => mountpoint.startsWith(base) || includeParent && base.startsWith(mountpoint)
    ).map((mountpoint) => ({
      relativeBase: base.length > mountpoint.length ? base.slice(mountpoint.length) : void 0,
      mountpoint,
      driver: context.mounts[mountpoint]
    }));
  };
  const onChange = (event, key) => {
    if (!context.watching) {
      return;
    }
    key = normalizeKey$1(key);
    for (const listener of context.watchListeners) {
      listener(event, key);
    }
  };
  const startWatch = async () => {
    if (context.watching) {
      return;
    }
    context.watching = true;
    for (const mountpoint in context.mounts) {
      context.unwatch[mountpoint] = await watch(
        context.mounts[mountpoint],
        onChange,
        mountpoint
      );
    }
  };
  const stopWatch = async () => {
    if (!context.watching) {
      return;
    }
    for (const mountpoint in context.unwatch) {
      await context.unwatch[mountpoint]();
    }
    context.unwatch = {};
    context.watching = false;
  };
  const runBatch = (items, commonOptions, cb) => {
    const batches = /* @__PURE__ */ new Map();
    const getBatch = (mount) => {
      let batch = batches.get(mount.base);
      if (!batch) {
        batch = {
          driver: mount.driver,
          base: mount.base,
          items: []
        };
        batches.set(mount.base, batch);
      }
      return batch;
    };
    for (const item of items) {
      const isStringItem = typeof item === "string";
      const key = normalizeKey$1(isStringItem ? item : item.key);
      const value = isStringItem ? void 0 : item.value;
      const options2 = isStringItem || !item.options ? commonOptions : { ...commonOptions, ...item.options };
      const mount = getMount(key);
      getBatch(mount).items.push({
        key,
        value,
        relativeKey: mount.relativeKey,
        options: options2
      });
    }
    return Promise.all([...batches.values()].map((batch) => cb(batch))).then(
      (r) => r.flat()
    );
  };
  const storage = {
    // Item
    hasItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.hasItem, relativeKey, opts);
    },
    getItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => destr(value)
      );
    },
    getItems(items, commonOptions = {}) {
      return runBatch(items, commonOptions, (batch) => {
        if (batch.driver.getItems) {
          return asyncCall(
            batch.driver.getItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              options: item.options
            })),
            commonOptions
          ).then(
            (r) => r.map((item) => ({
              key: joinKeys(batch.base, item.key),
              value: destr(item.value)
            }))
          );
        }
        return Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.getItem,
              item.relativeKey,
              item.options
            ).then((value) => ({
              key: item.key,
              value: destr(value)
            }));
          })
        );
      });
    },
    getItemRaw(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.getItemRaw) {
        return asyncCall(driver.getItemRaw, relativeKey, opts);
      }
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => deserializeRaw(value)
      );
    },
    async setItem(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.setItem) {
        return;
      }
      await asyncCall(driver.setItem, relativeKey, stringify(value), opts);
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async setItems(items, commonOptions) {
      await runBatch(items, commonOptions, async (batch) => {
        if (batch.driver.setItems) {
          return asyncCall(
            batch.driver.setItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              value: stringify(item.value),
              options: item.options
            })),
            commonOptions
          );
        }
        if (!batch.driver.setItem) {
          return;
        }
        await Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.setItem,
              item.relativeKey,
              stringify(item.value),
              item.options
            );
          })
        );
      });
    },
    async setItemRaw(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key, opts);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.setItemRaw) {
        await asyncCall(driver.setItemRaw, relativeKey, value, opts);
      } else if (driver.setItem) {
        await asyncCall(driver.setItem, relativeKey, serializeRaw(value), opts);
      } else {
        return;
      }
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async removeItem(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { removeMeta: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.removeItem) {
        return;
      }
      await asyncCall(driver.removeItem, relativeKey, opts);
      if (opts.removeMeta || opts.removeMata) {
        await asyncCall(driver.removeItem, relativeKey + "$", opts);
      }
      if (!driver.watch) {
        onChange("remove", key);
      }
    },
    // Meta
    async getMeta(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { nativeOnly: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      const meta = /* @__PURE__ */ Object.create(null);
      if (driver.getMeta) {
        Object.assign(meta, await asyncCall(driver.getMeta, relativeKey, opts));
      }
      if (!opts.nativeOnly) {
        const value = await asyncCall(
          driver.getItem,
          relativeKey + "$",
          opts
        ).then((value_) => destr(value_));
        if (value && typeof value === "object") {
          if (typeof value.atime === "string") {
            value.atime = new Date(value.atime);
          }
          if (typeof value.mtime === "string") {
            value.mtime = new Date(value.mtime);
          }
          Object.assign(meta, value);
        }
      }
      return meta;
    },
    setMeta(key, value, opts = {}) {
      return this.setItem(key + "$", value, opts);
    },
    removeMeta(key, opts = {}) {
      return this.removeItem(key + "$", opts);
    },
    // Keys
    async getKeys(base, opts = {}) {
      base = normalizeBaseKey(base);
      const mounts = getMounts(base, true);
      let maskedMounts = [];
      const allKeys = [];
      let allMountsSupportMaxDepth = true;
      for (const mount of mounts) {
        if (!mount.driver.flags?.maxDepth) {
          allMountsSupportMaxDepth = false;
        }
        const rawKeys = await asyncCall(
          mount.driver.getKeys,
          mount.relativeBase,
          opts
        );
        for (const key of rawKeys) {
          const fullKey = mount.mountpoint + normalizeKey$1(key);
          if (!maskedMounts.some((p) => fullKey.startsWith(p))) {
            allKeys.push(fullKey);
          }
        }
        maskedMounts = [
          mount.mountpoint,
          ...maskedMounts.filter((p) => !p.startsWith(mount.mountpoint))
        ];
      }
      const shouldFilterByDepth = opts.maxDepth !== void 0 && !allMountsSupportMaxDepth;
      return allKeys.filter(
        (key) => (!shouldFilterByDepth || filterKeyByDepth(key, opts.maxDepth)) && filterKeyByBase(key, base)
      );
    },
    // Utils
    async clear(base, opts = {}) {
      base = normalizeBaseKey(base);
      await Promise.all(
        getMounts(base, false).map(async (m) => {
          if (m.driver.clear) {
            return asyncCall(m.driver.clear, m.relativeBase, opts);
          }
          if (m.driver.removeItem) {
            const keys = await m.driver.getKeys(m.relativeBase || "", opts);
            return Promise.all(
              keys.map((key) => m.driver.removeItem(key, opts))
            );
          }
        })
      );
    },
    async dispose() {
      await Promise.all(
        Object.values(context.mounts).map((driver) => dispose(driver))
      );
    },
    async watch(callback) {
      await startWatch();
      context.watchListeners.push(callback);
      return async () => {
        context.watchListeners = context.watchListeners.filter(
          (listener) => listener !== callback
        );
        if (context.watchListeners.length === 0) {
          await stopWatch();
        }
      };
    },
    async unwatch() {
      context.watchListeners = [];
      await stopWatch();
    },
    // Mount
    mount(base, driver) {
      base = normalizeBaseKey(base);
      if (base && context.mounts[base]) {
        throw new Error(`already mounted at ${base}`);
      }
      if (base) {
        context.mountpoints.push(base);
        context.mountpoints.sort((a, b) => b.length - a.length);
      }
      context.mounts[base] = driver;
      if (context.watching) {
        Promise.resolve(watch(driver, onChange, base)).then((unwatcher) => {
          context.unwatch[base] = unwatcher;
        }).catch(console.error);
      }
      return storage;
    },
    async unmount(base, _dispose = true) {
      base = normalizeBaseKey(base);
      if (!base || !context.mounts[base]) {
        return;
      }
      if (context.watching && base in context.unwatch) {
        context.unwatch[base]?.();
        delete context.unwatch[base];
      }
      if (_dispose) {
        await dispose(context.mounts[base]);
      }
      context.mountpoints = context.mountpoints.filter((key) => key !== base);
      delete context.mounts[base];
    },
    getMount(key = "") {
      key = normalizeKey$1(key) + ":";
      const m = getMount(key);
      return {
        driver: m.driver,
        base: m.base
      };
    },
    getMounts(base = "", opts = {}) {
      base = normalizeKey$1(base);
      const mounts = getMounts(base, opts.parents);
      return mounts.map((m) => ({
        driver: m.driver,
        base: m.mountpoint
      }));
    },
    // Aliases
    keys: (base, opts = {}) => storage.getKeys(base, opts),
    get: (key, opts = {}) => storage.getItem(key, opts),
    set: (key, value, opts = {}) => storage.setItem(key, value, opts),
    has: (key, opts = {}) => storage.hasItem(key, opts),
    del: (key, opts = {}) => storage.removeItem(key, opts),
    remove: (key, opts = {}) => storage.removeItem(key, opts)
  };
  return storage;
}
function watch(driver, onChange, base) {
  return driver.watch ? driver.watch((event, key) => onChange(event, base + key)) : () => {
  };
}
async function dispose(driver) {
  if (typeof driver.dispose === "function") {
    await asyncCall(driver.dispose);
  }
}

const _assets = {

};

const normalizeKey = function normalizeKey(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
};

const assets$1 = {
  getKeys() {
    return Promise.resolve(Object.keys(_assets))
  },
  hasItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(id in _assets)
  },
  getItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].import() : null)
  },
  getMeta (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].meta : {})
  }
};

function defineDriver(factory) {
  return factory;
}
function createError(driver, message, opts) {
  const err = new Error(`[unstorage] [${driver}] ${message}`, opts);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(err, createError);
  }
  return err;
}
function createRequiredError(driver, name) {
  if (Array.isArray(name)) {
    return createError(
      driver,
      `Missing some of the required options ${name.map((n) => "`" + n + "`").join(", ")}`
    );
  }
  return createError(driver, `Missing required option \`${name}\`.`);
}

function ignoreNotfound(err) {
  return err.code === "ENOENT" || err.code === "EISDIR" ? null : err;
}
function ignoreExists(err) {
  return err.code === "EEXIST" ? null : err;
}
async function writeFile(path, data, encoding) {
  await ensuredir(dirname$1(path));
  return promises.writeFile(path, data, encoding);
}
function readFile(path, encoding) {
  return promises.readFile(path, encoding).catch(ignoreNotfound);
}
function unlink(path) {
  return promises.unlink(path).catch(ignoreNotfound);
}
function readdir(dir) {
  return promises.readdir(dir, { withFileTypes: true }).catch(ignoreNotfound).then((r) => r || []);
}
async function ensuredir(dir) {
  if (existsSync(dir)) {
    return;
  }
  await ensuredir(dirname$1(dir)).catch(ignoreExists);
  await promises.mkdir(dir).catch(ignoreExists);
}
async function readdirRecursive(dir, ignore, maxDepth) {
  if (ignore && ignore(dir)) {
    return [];
  }
  const entries = await readdir(dir);
  const files = [];
  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = resolve$1(dir, entry.name);
      if (entry.isDirectory()) {
        if (maxDepth === void 0 || maxDepth > 0) {
          const dirFiles = await readdirRecursive(
            entryPath,
            ignore,
            maxDepth === void 0 ? void 0 : maxDepth - 1
          );
          files.push(...dirFiles.map((f) => entry.name + "/" + f));
        }
      } else {
        if (!(ignore && ignore(entry.name))) {
          files.push(entry.name);
        }
      }
    })
  );
  return files;
}
async function rmRecursive(dir) {
  const entries = await readdir(dir);
  await Promise.all(
    entries.map((entry) => {
      const entryPath = resolve$1(dir, entry.name);
      if (entry.isDirectory()) {
        return rmRecursive(entryPath).then(() => promises.rmdir(entryPath));
      } else {
        return promises.unlink(entryPath);
      }
    })
  );
}

const PATH_TRAVERSE_RE = /\.\.:|\.\.$/;
const DRIVER_NAME = "fs-lite";
const unstorage_47drivers_47fs_45lite = defineDriver((opts = {}) => {
  if (!opts.base) {
    throw createRequiredError(DRIVER_NAME, "base");
  }
  opts.base = resolve$1(opts.base);
  const r = (key) => {
    if (PATH_TRAVERSE_RE.test(key)) {
      throw createError(
        DRIVER_NAME,
        `Invalid key: ${JSON.stringify(key)}. It should not contain .. segments`
      );
    }
    const resolved = join(opts.base, key.replace(/:/g, "/"));
    return resolved;
  };
  return {
    name: DRIVER_NAME,
    options: opts,
    flags: {
      maxDepth: true
    },
    hasItem(key) {
      return existsSync(r(key));
    },
    getItem(key) {
      return readFile(r(key), "utf8");
    },
    getItemRaw(key) {
      return readFile(r(key));
    },
    async getMeta(key) {
      const { atime, mtime, size, birthtime, ctime } = await promises.stat(r(key)).catch(() => ({}));
      return { atime, mtime, size, birthtime, ctime };
    },
    setItem(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value, "utf8");
    },
    setItemRaw(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value);
    },
    removeItem(key) {
      if (opts.readOnly) {
        return;
      }
      return unlink(r(key));
    },
    getKeys(_base, topts) {
      return readdirRecursive(r("."), opts.ignore, topts?.maxDepth);
    },
    async clear() {
      if (opts.readOnly || opts.noClear) {
        return;
      }
      await rmRecursive(r("."));
    }
  };
});

const storage = createStorage({});

storage.mount('/assets', assets$1);

storage.mount('data', unstorage_47drivers_47fs_45lite({"driver":"fsLite","base":"./.data/kv"}));

function useStorage(base = "") {
  return base ? prefixStorage(storage, base) : storage;
}

function serialize$1(o){return typeof o=="string"?`'${o}'`:new c().serialize(o)}const c=/*@__PURE__*/function(){class o{#t=new Map;compare(t,r){const e=typeof t,n=typeof r;return e==="string"&&n==="string"?t.localeCompare(r):e==="number"&&n==="number"?t-r:String.prototype.localeCompare.call(this.serialize(t,true),this.serialize(r,true))}serialize(t,r){if(t===null)return "null";switch(typeof t){case "string":return r?t:`'${t}'`;case "bigint":return `${t}n`;case "object":return this.$object(t);case "function":return this.$function(t)}return String(t)}serializeObject(t){const r=Object.prototype.toString.call(t);if(r!=="[object Object]")return this.serializeBuiltInType(r.length<10?`unknown:${r}`:r.slice(8,-1),t);const e=t.constructor,n=e===Object||e===void 0?"":e.name;if(n!==""&&globalThis[n]===e)return this.serializeBuiltInType(n,t);if(typeof t.toJSON=="function"){const i=t.toJSON();return n+(i!==null&&typeof i=="object"?this.$object(i):`(${this.serialize(i)})`)}return this.serializeObjectEntries(n,Object.entries(t))}serializeBuiltInType(t,r){const e=this["$"+t];if(e)return e.call(this,r);if(typeof r?.entries=="function")return this.serializeObjectEntries(t,r.entries());throw new Error(`Cannot serialize ${t}`)}serializeObjectEntries(t,r){const e=Array.from(r).sort((i,a)=>this.compare(i[0],a[0]));let n=`${t}{`;for(let i=0;i<e.length;i++){const[a,l]=e[i];n+=`${this.serialize(a,true)}:${this.serialize(l)}`,i<e.length-1&&(n+=",");}return n+"}"}$object(t){let r=this.#t.get(t);return r===void 0&&(this.#t.set(t,`#${this.#t.size}`),r=this.serializeObject(t),this.#t.set(t,r)),r}$function(t){const r=Function.prototype.toString.call(t);return r.slice(-15)==="[native code] }"?`${t.name||""}()[native]`:`${t.name}(${t.length})${r.replace(/\s*\n\s*/g,"")}`}$Array(t){let r="[";for(let e=0;e<t.length;e++)r+=this.serialize(t[e]),e<t.length-1&&(r+=",");return r+"]"}$Date(t){try{return `Date(${t.toISOString()})`}catch{return "Date(null)"}}$ArrayBuffer(t){return `ArrayBuffer[${new Uint8Array(t).join(",")}]`}$Set(t){return `Set${this.$Array(Array.from(t).sort((r,e)=>this.compare(r,e)))}`}$Map(t){return this.serializeObjectEntries("Map",t.entries())}}for(const s of ["Error","RegExp","URL"])o.prototype["$"+s]=function(t){return `${s}(${t})`};for(const s of ["Int8Array","Uint8Array","Uint8ClampedArray","Int16Array","Uint16Array","Int32Array","Uint32Array","Float32Array","Float64Array"])o.prototype["$"+s]=function(t){return `${s}[${t.join(",")}]`};for(const s of ["BigInt64Array","BigUint64Array"])o.prototype["$"+s]=function(t){return `${s}[${t.join("n,")}${t.length>0?"n":""}]`};return o}();

const e=globalThis.process?.getBuiltinModule?.("crypto")?.hash,r="sha256",s="base64url";function digest(t){if(e)return e(r,t,s);const o=createHash(r).update(t);return globalThis.process?.versions?.webcontainer?o.digest().toString(s):o.digest(s)}

function hash$1(input) {
  return digest(serialize$1(input));
}

const Hasher = /* @__PURE__ */ (() => {
  class Hasher2 {
    buff = "";
    #context = /* @__PURE__ */ new Map();
    write(str) {
      this.buff += str;
    }
    dispatch(value) {
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    }
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      objType = objectLength < 10 ? "unknown:[" + objString + "]" : objString.slice(8, objectLength - 1);
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = this.#context.get(object)) === void 0) {
        this.#context.set(object, this.#context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        this.write("buffer:");
        return this.write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else {
          this.unknown(object, objType);
        }
      } else {
        const keys = Object.keys(object).sort();
        const extraKeys = [];
        this.write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          this.write(":");
          this.dispatch(object[key]);
          this.write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    }
    array(arr, unordered) {
      unordered = unordered === void 0 ? false : unordered;
      this.write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = new Hasher2();
        hasher.dispatch(entry);
        for (const [key, value] of hasher.#context) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      this.#context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    }
    date(date) {
      return this.write("date:" + date.toJSON());
    }
    symbol(sym) {
      return this.write("symbol:" + sym.toString());
    }
    unknown(value, type) {
      this.write(type);
      if (!value) {
        return;
      }
      this.write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          [...value.entries()],
          true
          /* ordered */
        );
      }
    }
    error(err) {
      return this.write("error:" + err.toString());
    }
    boolean(bool) {
      return this.write("bool:" + bool);
    }
    string(string) {
      this.write("string:" + string.length + ":");
      this.write(string);
    }
    function(fn) {
      this.write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
    }
    number(number) {
      return this.write("number:" + number);
    }
    null() {
      return this.write("Null");
    }
    undefined() {
      return this.write("Undefined");
    }
    regexp(regex) {
      return this.write("regex:" + regex.toString());
    }
    arraybuffer(arr) {
      this.write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    }
    url(url) {
      return this.write("url:" + url.toString());
    }
    map(map) {
      this.write("map:");
      const arr = [...map];
      return this.array(arr, false);
    }
    set(set) {
      this.write("set:");
      const arr = [...set];
      return this.array(arr, false);
    }
    bigint(number) {
      return this.write("bigint:" + number.toString());
    }
  }
  for (const type of [
    "uint8array",
    "uint8clampedarray",
    "unt8array",
    "uint16array",
    "unt16array",
    "uint32array",
    "unt32array",
    "float32array",
    "float64array"
  ]) {
    Hasher2.prototype[type] = function(arr) {
      this.write(type + ":");
      return this.array([...arr], false);
    };
  }
  function isNativeFunction(f) {
    if (typeof f !== "function") {
      return false;
    }
    return Function.prototype.toString.call(f).slice(
      -15
      /* "[native code] }".length */
    ) === "[native code] }";
  }
  return Hasher2;
})();
function serialize(object) {
  const hasher = new Hasher();
  hasher.dispatch(object);
  return hasher.buff;
}
function hash(value) {
  return digest(typeof value === "string" ? value : serialize(value)).replace(/[-_]/g, "").slice(0, 10);
}

function defaultCacheOptions() {
  return {
    name: "_",
    base: "/cache",
    swr: true,
    maxAge: 1
  };
}
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions(), ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== void 0);
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    let entry = await useStorage().getItem(cacheKey).catch((error) => {
      console.error(`[cache] Cache read error.`, error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }) || {};
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }
    const ttl = (opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || validate(entry) === false;
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          let setOpts;
          if (opts.maxAge && !opts.swr) {
            setOpts = { ttl: opts.maxAge };
          }
          const promise = useStorage().setItem(cacheKey, entry, setOpts).catch((error) => {
            console.error(`[cache] Cache write error.`, error);
            useNitroApp().captureError(error, { event, tags: ["cache"] });
          });
          if (event?.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (entry.value === void 0) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    );
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
function cachedFunction(fn, opts = {}) {
  return defineCachedFunction(fn, opts);
}
function getKey(...args) {
  return args.length > 0 ? hash(args) : "";
}
function escapeKey(key) {
  return String(key).replace(/\W/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions()) {
  const variableHeaderNames = (opts.varies || []).filter(Boolean).map((h) => h.toLowerCase()).sort();
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      const _path = event.node.req.originalUrl || event.node.req.url || event.path;
      let _pathname;
      try {
        _pathname = escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      } catch {
        _pathname = "-";
      }
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames.map((header) => [header, event.node.req.headers[header]]).map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      if (entry.value.headers.etag === "undefined" || entry.value.headers["last-modified"] === "undefined") {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts])
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const variableHeaders = {};
      for (const header of variableHeaderNames) {
        const value = incomingEvent.node.req.headers[header];
        if (value !== void 0) {
          variableHeaders[header] = value;
        }
      }
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders
      });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2(void 0);
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return true;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            if (Array.isArray(headers2) || typeof headers2 === "string") {
              throw new TypeError("Raw headers  is not supported.");
            }
            for (const header in headers2) {
              const value = headers2[header];
              if (value !== void 0) {
                this.setHeader(
                  header,
                  value
                );
              }
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      });
      event.$fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      });
      event.waitUntil = incomingEvent.waitUntil;
      event.context = incomingEvent.context;
      event.context.cache = {
        options: _opts
      };
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString()
      );
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(
      event
    );
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        event.node.res.appendHeader(
          name,
          splitCookiesString(value)
        );
      } else {
        if (value !== void 0) {
          event.node.res.setHeader(name, value);
        }
      }
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

function klona(x) {
	if (typeof x !== 'object') return x;

	var k, tmp, str=Object.prototype.toString.call(x);

	if (str === '[object Object]') {
		if (x.constructor !== Object && typeof x.constructor === 'function') {
			tmp = new x.constructor();
			for (k in x) {
				if (x.hasOwnProperty(k) && tmp[k] !== x[k]) {
					tmp[k] = klona(x[k]);
				}
			}
		} else {
			tmp = {}; // null
			for (k in x) {
				if (k === '__proto__') {
					Object.defineProperty(tmp, k, {
						value: klona(x[k]),
						configurable: true,
						enumerable: true,
						writable: true,
					});
				} else {
					tmp[k] = klona(x[k]);
				}
			}
		}
		return tmp;
	}

	if (str === '[object Array]') {
		k = x.length;
		for (tmp=Array(k); k--;) {
			tmp[k] = klona(x[k]);
		}
		return tmp;
	}

	if (str === '[object Set]') {
		tmp = new Set;
		x.forEach(function (val) {
			tmp.add(klona(val));
		});
		return tmp;
	}

	if (str === '[object Map]') {
		tmp = new Map;
		x.forEach(function (val, key) {
			tmp.set(klona(key), klona(val));
		});
		return tmp;
	}

	if (str === '[object Date]') {
		return new Date(+x);
	}

	if (str === '[object RegExp]') {
		tmp = new RegExp(x.source, x.flags);
		tmp.lastIndex = x.lastIndex;
		return tmp;
	}

	if (str === '[object DataView]') {
		return new x.constructor( klona(x.buffer) );
	}

	if (str === '[object ArrayBuffer]') {
		return x.slice(0);
	}

	// ArrayBuffer.isView(x)
	// ~> `new` bcuz `Buffer.slice` => ref
	if (str.slice(-6) === 'Array]') {
		return new x.constructor(x);
	}

	return x;
}

const inlineAppConfig = {
  "nuxt": {}
};



const appConfig = defuFn(inlineAppConfig);

const NUMBER_CHAR_RE = /\d/;
const STR_SPLITTERS = ["-", "_", "/", "."];
function isUppercase(char = "") {
  if (NUMBER_CHAR_RE.test(char)) {
    return void 0;
  }
  return char !== char.toLowerCase();
}
function splitByCase(str, separators) {
  const splitters = STR_SPLITTERS;
  const parts = [];
  if (!str || typeof str !== "string") {
    return parts;
  }
  let buff = "";
  let previousUpper;
  let previousSplitter;
  for (const char of str) {
    const isSplitter = splitters.includes(char);
    if (isSplitter === true) {
      parts.push(buff);
      buff = "";
      previousUpper = void 0;
      continue;
    }
    const isUpper = isUppercase(char);
    if (previousSplitter === false) {
      if (previousUpper === false && isUpper === true) {
        parts.push(buff);
        buff = char;
        previousUpper = isUpper;
        continue;
      }
      if (previousUpper === true && isUpper === false && buff.length > 1) {
        const lastChar = buff.at(-1);
        parts.push(buff.slice(0, Math.max(0, buff.length - 1)));
        buff = lastChar + char;
        previousUpper = isUpper;
        continue;
      }
    }
    buff += char;
    previousUpper = isUpper;
    previousSplitter = isSplitter;
  }
  parts.push(buff);
  return parts;
}
function kebabCase(str, joiner) {
  return str ? (Array.isArray(str) ? str : splitByCase(str)).map((p) => p.toLowerCase()).join(joiner) : "";
}
function snakeCase(str) {
  return kebabCase(str || "", "_");
}

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[opts.prefix + envKey] ?? process.env[opts.altPrefix + envKey]
  );
}
function _isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
        applyEnv(obj[key], opts, subKey);
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey);
      } else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key]);
    }
  }
  return obj;
}
const envExpandRx = /\{\{([^{}]*)\}\}/g;
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return process.env[key] || match;
  });
}

const _inlineRuntimeConfig = {
  "app": {
    "baseURL": "/",
    "buildId": "cfcadaa3-5c37-4ccf-b20c-230702f5792d",
    "buildAssetsDir": "/_nuxt/",
    "cdnURL": ""
  },
  "nitro": {
    "envPrefix": "NUXT_",
    "routeRules": {
      "/__nuxt_error": {
        "cache": false
      },
      "/api/**": {
        "cors": false
      },
      "/_nuxt/builds/meta/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      },
      "/_nuxt/builds/**": {
        "headers": {
          "cache-control": "public, max-age=1, immutable"
        }
      },
      "/_nuxt/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      }
    }
  },
  "public": {
    "appName": "Ujjal FMC ERP",
    "appUrl": "http://localhost:3000",
    "currency": "BDT",
    "timezone": "Asia/Dhaka"
  },
  "dbHost": "localhost",
  "dbPort": 3306,
  "dbName": "ujjalfmc_saas",
  "dbUser": "root",
  "dbPass": "",
  "devLogin": "",
  "sessionSecret": "change-this-to-a-long-random-secret-min-32-chars!!",
  "session": {
    "name": "nuxt-session",
    "password": "f72edbfd95eb4e42ac6c59f6d04badb0",
    "cookie": {
      "sameSite": "lax"
    }
  },
  "oauth": {
    "github": {
      "clientId": "",
      "clientSecret": "",
      "redirectURL": ""
    },
    "gitlab": {
      "clientId": "",
      "clientSecret": "",
      "redirectURL": ""
    },
    "spotify": {
      "clientId": "",
      "clientSecret": "",
      "redirectURL": ""
    },
    "google": {
      "clientId": "",
      "clientSecret": "",
      "redirectURL": ""
    },
    "twitch": {
      "clientId": "",
      "clientSecret": "",
      "redirectURL": ""
    },
    "auth0": {
      "clientId": "",
      "clientSecret": "",
      "domain": "",
      "audience": "",
      "redirectURL": ""
    },
    "microsoft": {
      "clientId": "",
      "clientSecret": "",
      "tenant": "",
      "scope": [],
      "authorizationURL": "",
      "tokenURL": "",
      "userURL": "",
      "redirectURL": ""
    },
    "discord": {
      "clientId": "",
      "clientSecret": "",
      "redirectURL": ""
    },
    "battledotnet": {
      "clientId": "",
      "clientSecret": "",
      "redirectURL": ""
    },
    "keycloak": {
      "clientId": "",
      "clientSecret": "",
      "serverUrl": "",
      "realm": "",
      "redirectURL": ""
    },
    "linkedin": {
      "clientId": "",
      "clientSecret": "",
      "redirectURL": ""
    },
    "cognito": {
      "clientId": "",
      "clientSecret": "",
      "region": "",
      "userPoolId": "",
      "redirectURL": ""
    },
    "facebook": {
      "clientId": "",
      "clientSecret": "",
      "redirectURL": ""
    },
    "instagram": {
      "clientId": "",
      "clientSecret": "",
      "redirectURL": ""
    },
    "paypal": {
      "clientId": "",
      "clientSecret": "",
      "redirectURL": ""
    },
    "steam": {
      "apiKey": "",
      "redirectURL": ""
    },
    "x": {
      "clientId": "",
      "clientSecret": "",
      "redirectURL": ""
    },
    "xsuaa": {
      "clientId": "",
      "clientSecret": "",
      "domain": "",
      "redirectURL": ""
    },
    "vk": {
      "clientId": "",
      "clientSecret": "",
      "redirectURL": ""
    },
    "yandex": {
      "clientId": "",
      "clientSecret": "",
      "redirectURL": ""
    },
    "tiktok": {
      "clientKey": "",
      "clientSecret": "",
      "redirectURL": ""
    }
  }
};
const envOptions = {
  prefix: "NITRO_",
  altPrefix: _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_",
  envExpansion: _inlineRuntimeConfig.nitro.envExpansion ?? process.env.NITRO_ENV_EXPANSION ?? false
};
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
);
function useRuntimeConfig(event) {
  if (!event) {
    return _sharedRuntimeConfig;
  }
  if (event.context.nitro.runtimeConfig) {
    return event.context.nitro.runtimeConfig;
  }
  const runtimeConfig = klona(_inlineRuntimeConfig);
  applyEnv(runtimeConfig, envOptions);
  event.context.nitro.runtimeConfig = runtimeConfig;
  return runtimeConfig;
}
_deepFreeze(klona(appConfig));
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop];
    }
    return void 0;
  }
});

function createContext(opts = {}) {
  let currentInstance;
  let isSingleton = false;
  const checkConflict = (instance) => {
    if (currentInstance && currentInstance !== instance) {
      throw new Error("Context conflict");
    }
  };
  let als;
  if (opts.asyncContext) {
    const _AsyncLocalStorage = opts.AsyncLocalStorage || globalThis.AsyncLocalStorage;
    if (_AsyncLocalStorage) {
      als = new _AsyncLocalStorage();
    } else {
      console.warn("[unctx] `AsyncLocalStorage` is not provided.");
    }
  }
  const _getCurrentInstance = () => {
    if (als) {
      const instance = als.getStore();
      if (instance !== void 0) {
        return instance;
      }
    }
    return currentInstance;
  };
  return {
    use: () => {
      const _instance = _getCurrentInstance();
      if (_instance === void 0) {
        throw new Error("Context is not available");
      }
      return _instance;
    },
    tryUse: () => {
      return _getCurrentInstance();
    },
    set: (instance, replace) => {
      if (!replace) {
        checkConflict(instance);
      }
      currentInstance = instance;
      isSingleton = true;
    },
    unset: () => {
      currentInstance = void 0;
      isSingleton = false;
    },
    call: (instance, callback) => {
      checkConflict(instance);
      currentInstance = instance;
      try {
        return als ? als.run(instance, callback) : callback();
      } finally {
        if (!isSingleton) {
          currentInstance = void 0;
        }
      }
    },
    async callAsync(instance, callback) {
      currentInstance = instance;
      const onRestore = () => {
        currentInstance = instance;
      };
      const onLeave = () => currentInstance === instance ? onRestore : void 0;
      asyncHandlers.add(onLeave);
      try {
        const r = als ? als.run(instance, callback) : callback();
        if (!isSingleton) {
          currentInstance = void 0;
        }
        return await r;
      } finally {
        asyncHandlers.delete(onLeave);
      }
    }
  };
}
function createNamespace(defaultOpts = {}) {
  const contexts = {};
  return {
    get(key, opts = {}) {
      if (!contexts[key]) {
        contexts[key] = createContext({ ...defaultOpts, ...opts });
      }
      return contexts[key];
    }
  };
}
const _globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof global !== "undefined" ? global : {};
const globalKey = "__unctx__";
const defaultNamespace = _globalThis[globalKey] || (_globalThis[globalKey] = createNamespace());
const getContext = (key, opts = {}) => defaultNamespace.get(key, opts);
const asyncHandlersKey = "__unctx_async_handlers__";
const asyncHandlers = _globalThis[asyncHandlersKey] || (_globalThis[asyncHandlersKey] = /* @__PURE__ */ new Set());
function executeAsync(function_) {
  const restores = [];
  for (const leaveHandler of asyncHandlers) {
    const restore2 = leaveHandler();
    if (restore2) {
      restores.push(restore2);
    }
  }
  const restore = () => {
    for (const restore2 of restores) {
      restore2();
    }
  };
  let awaitable = function_();
  if (awaitable && typeof awaitable === "object" && "catch" in awaitable) {
    awaitable = awaitable.catch((error) => {
      restore();
      throw error;
    });
  }
  return [awaitable, restore];
}

getContext("nitro-app", {
  asyncContext: false,
  AsyncLocalStorage: void 0
});

function isPathInScope(pathname, base) {
  let canonical;
  try {
    const pre = pathname.replace(/%2f/gi, "/").replace(/%5c/gi, "\\");
    canonical = new URL(pre, "http://_").pathname;
  } catch {
    return false;
  }
  return !base || canonical === base || canonical.startsWith(base + "/");
}

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter$1({ routes: config.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.redirect._redirectStripBase;
        if (strpBase) {
          if (!isPathInScope(event.path.split("?")[0], strpBase)) {
            throw createError$1({ statusCode: 400 });
          }
          targetPath = withoutBase(targetPath, strpBase);
        } else if (targetPath.startsWith("//")) {
          targetPath = targetPath.replace(/^\/+/, "/");
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery$1(event.path);
        target = withQuery(target, query);
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode);
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          if (!isPathInScope(event.path.split("?")[0], strpBase)) {
            throw createError$1({ statusCode: 400 });
          }
          targetPath = withoutBase(targetPath, strpBase);
        } else if (targetPath.startsWith("//")) {
          targetPath = targetPath.replace(/^\/+/, "/");
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery$1(event.path);
        target = withQuery(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError(error, { tags: [type] });
}
function trapUnhandledNodeErrors() {
  process.on(
    "unhandledRejection",
    (error) => _captureError(error, "unhandledRejection")
  );
  process.on(
    "uncaughtException",
    (error) => _captureError(error, "uncaughtException")
  );
}
function joinHeaders(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
function normalizeFetchResponse(response) {
  if (!response.headers.has("set-cookie")) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  });
}
function normalizeCookieHeader(header = "") {
  return splitCookiesString(joinHeaders(header));
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers();
  for (const [name, header] of headers) {
    if (name === "set-cookie") {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append("set-cookie", cookie);
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header));
    }
  }
  return outgoingHeaders;
}

function isJsonRequest(event) {
	
	if (hasReqHeader(event, "accept", "text/html")) {
		return false;
	}
	return hasReqHeader(event, "accept", "application/json") || hasReqHeader(event, "user-agent", "curl/") || hasReqHeader(event, "user-agent", "httpie/") || hasReqHeader(event, "sec-fetch-mode", "cors") || event.path.startsWith("/api/") || event.path.endsWith(".json");
}
function hasReqHeader(event, name, includes) {
	const value = getRequestHeader(event, name);
	return !!(value && typeof value === "string" && value.toLowerCase().includes(includes));
}

const errorHandler$0 = (async function errorhandler(error, event, { defaultHandler }) {
	if (event.handled || isJsonRequest(event)) {
		
		return;
	}
	
	const defaultRes = await defaultHandler(error, event, { json: true });
	
	const status = error.status || error.statusCode || 500;
	if (status === 404 && defaultRes.status === 302) {
		setResponseHeaders(event, defaultRes.headers);
		setResponseStatus(event, defaultRes.status, defaultRes.statusText);
		return send(event, JSON.stringify(defaultRes.body, null, 2));
	}
	const errorObject = defaultRes.body;
	
	const url = new URL(errorObject.url);
	errorObject.url = withoutBase(url.pathname, useRuntimeConfig(event).app.baseURL) + url.search + url.hash;
	
	errorObject.message = error.unhandled ? errorObject.message || "Server Error" : error.message || errorObject.message || "Server Error";
	
	errorObject.data ||= error.data;
	errorObject.statusText ||= error.statusText || error.statusMessage;
	delete defaultRes.headers["content-type"];
	delete defaultRes.headers["content-security-policy"];
	setResponseHeaders(event, defaultRes.headers);
	
	const reqHeaders = getRequestHeaders(event);
	
	const isRenderingError = event.path.startsWith("/__nuxt_error") || !!reqHeaders["x-nuxt-error"] || !!event.context.nuxt?.["~rendering-error"];
	if (!isRenderingError) {
		event.context.nuxt ||= {};
		event.context.nuxt["~rendering-error"] = true;
	}
	
	const res = isRenderingError ? null : await useNitroApp().localFetch(withQuery(joinURL(useRuntimeConfig(event).app.baseURL, "/__nuxt_error"), errorObject), {
		headers: {
			...reqHeaders,
			"x-nuxt-error": "true"
		},
		redirect: "manual"
	}).catch(() => null);
	if (event.handled) {
		return;
	}
	
	if (!res) {
		const { template } = await import('../_/error-500.mjs');
		setResponseHeader(event, "Content-Type", "text/html;charset=UTF-8");
		return send(event, template(errorObject));
	}
	const html = await res.text();
	for (const [header, value] of res.headers.entries()) {
		if (header === "set-cookie") {
			appendResponseHeader(event, header, value);
			continue;
		}
		setResponseHeader(event, header, value);
	}
	setResponseStatus(event, res.status && res.status !== 200 ? res.status : defaultRes.status, res.statusText || defaultRes.statusText);
	return send(event, html);
});

function defineNitroErrorHandler(handler) {
  return handler;
}

const errorHandler$1 = defineNitroErrorHandler(
  function defaultNitroErrorHandler(error, event) {
    const res = defaultHandler(error, event);
    setResponseHeaders(event, res.headers);
    setResponseStatus(event, res.status, res.statusText);
    return send(event, JSON.stringify(res.body, null, 2));
  }
);
function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled || error.fatal;
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage || "Server Error";
  const url = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true });
  if (statusCode === 404) {
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      const redirectTo = `${baseURL}${url.pathname.slice(1)}${url.search}`;
      return {
        status: 302,
        statusText: "Found",
        headers: { location: redirectTo },
        body: `Redirecting...`
      };
    }
  }
  if (isSensitive && !opts?.silent) {
    const tags = [error.unhandled && "[unhandled]", error.fatal && "[fatal]"].filter(Boolean).join(" ");
    console.error(`[request error] ${tags} [${event.method}] ${url}
`, error);
  }
  const headers = {
    "content-type": "application/json",
    // Prevent browser from guessing the MIME types of resources.
    "x-content-type-options": "nosniff",
    // Prevent error page from being embedded in an iframe
    "x-frame-options": "DENY",
    // Prevent browsers from sending the Referer header
    "referrer-policy": "no-referrer",
    // Disable the execution of any js
    "content-security-policy": "script-src 'none'; frame-ancestors 'none';"
  };
  setResponseStatus(event, statusCode, statusMessage);
  if (statusCode === 404 || !getResponseHeader(event, "cache-control")) {
    headers["cache-control"] = "no-cache";
  }
  const body = {
    error: true,
    url: url.href,
    statusCode,
    statusMessage,
    message: isSensitive ? "Server Error" : error.message,
    data: isSensitive ? void 0 : error.data
  };
  return {
    status: statusCode,
    statusText: statusMessage,
    headers,
    body
  };
}

const errorHandlers = [errorHandler$0, errorHandler$1];

async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      await handler(error, event, { defaultHandler });
      if (event.handled) {
        return; // Response handled
      }
    } catch(error) {
      // Handler itself thrown, log and continue
      console.error(error);
    }
  }
  // H3 will handle fallback
}

const _A0rTAkqQKHycO7CrrtLZ2oMw5IS2SKVeyO4RUEyJ3Q = defineNitroPlugin((nitroApp) => {
  if (process.env.NUXT_OAUTH_FACEBOOK_CLIENT_ID && process.env.NUXT_OAUTH_FACEBOOK_CLIENT_SECRET || process.env.NUXT_OAUTH_INSTAGRAM_CLIENT_ID && process.env.NUXT_OAUTH_INSTAGRAM_CLIENT_SECRET) {
    nitroApp.hooks.hook("render:html", (html) => {
      html.head.unshift(`
      <script>
        if (window.location.hash === "#_=_"){
          history.replaceState
              ? history.replaceState(null, null, window.location.href.split("#")[0])
              : window.location.hash = "";
        }
      <\/script>
    `);
    });
  }
});

function defineNitroPlugin(def) {
  return def;
}

let pool = null;
function getDb() {
  if (!pool) {
    const config = useRuntimeConfig();
    pool = mysql.createPool({
      host: config.dbHost || "localhost",
      port: Number(config.dbPort) || 3306,
      database: config.dbName || "ujjalfmc_saas",
      user: config.dbUser || "root",
      password: config.dbPass || "",
      waitForConnections: true,
      connectionLimit: 5,
      // shared hosting: keep process count low (was 30)
      queueLimit: 50,
      // queue waiting requests instead of spawning more connections
      connectTimeout: 1e4,
      // 10 s — fail fast on DB unreachable
      charset: "utf8mb4",
      timezone: "+00:00",
      decimalNumbers: true,
      enableKeepAlive: true,
      // prevents "Connection lost" after idle periods
      keepAliveInitialDelay: 3e4
    });
  }
  return pool;
}
async function query(sql, params = []) {
  const [rows] = await getDb().query(sql, params);
  return rows;
}
async function queryOne(sql, params = []) {
  var _a;
  const rows = await query(sql, params);
  return (_a = rows[0]) != null ? _a : null;
}
function paginate(page, perPage) {
  const p = Math.max(1, page);
  const pp = Math.min(500, Math.max(1, perPage));
  return { limit: pp, offset: (p - 1) * pp };
}

async function addCol(db, table, col, def) {
  var _a;
  try {
    await db.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${col}\` ${def}`);
  } catch (e) {
    if ((e == null ? void 0 : e.errno) !== 1060 && !String((_a = e == null ? void 0 : e.message) != null ? _a : "").includes("Duplicate column")) {
      console.warn(`[db-migrate] ${table}.${col} ADD COLUMN failed:`, e);
    }
  }
}
const _87WoZIZQivakNKczWODrKTUCsM9p4H9wZ2LxqmDpdjo = defineNitroPlugin(async () => {
  const db = getDb();
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS purchase_orders_adnan (
        id                         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        po_number                  VARCHAR(30)  NOT NULL UNIQUE,
        po_date                    DATE         NOT NULL,
        supplier_id                INT UNSIGNED,
        supplier_name              VARCHAR(180),
        wheat_origin               VARCHAR(80),
        expected_delivery_date     DATE,
        quantity_kg                DECIMAL(12,3) NOT NULL,
        unit_price_per_kg          DECIMAL(10,4) NOT NULL,
        total_order_value          DECIMAL(15,2) NOT NULL,
        total_received_qty         DECIMAL(12,3) DEFAULT 0,
        qty_yet_to_receive         DECIMAL(12,3),
        total_paid                 DECIMAL(15,2) DEFAULT 0,
        balance_payable            DECIMAL(15,2),
        po_status                  ENUM('pending','confirmed','partial','closed','cancelled') DEFAULT 'pending',
        delivery_status            ENUM('pending','partial','completed') DEFAULT 'pending',
        payment_status             ENUM('unpaid','partial','paid') DEFAULT 'unpaid',
        is_delivery_locked         TINYINT(1) DEFAULT 0,
        delivery_lock_reason       TEXT,
        delivery_locked_by_user_id INT UNSIGNED,
        delivery_locked_at         DATETIME,
        branch_id                  INT UNSIGNED,
        created_by_user_id         INT UNSIGNED,
        remarks                    TEXT,
        created_at                 DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at                 DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (e) {
    console.warn("[db-migrate] purchase_orders_adnan create failed:", e);
  }
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS goods_received_adnan (
        id                       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        grn_number               VARCHAR(30) NOT NULL UNIQUE,
        grn_date                 DATE NOT NULL,
        purchase_order_id        INT UNSIGNED,
        po_number                VARCHAR(30),
        supplier_id              INT UNSIGNED,
        supplier_name            VARCHAR(180),
        quantity_received_kg     DECIMAL(12,3) NOT NULL,
        unit_price_per_kg        DECIMAL(10,4),
        total_value              DECIMAL(15,2),
        weight_variance          DECIMAL(10,3) DEFAULT 0,
        variance_percentage      DECIMAL(8,4)  DEFAULT 0,
        quality_grade            ENUM('A','B','C','R') DEFAULT 'A',
        truck_number             VARCHAR(40),
        transporter_name         VARCHAR(120),
        unload_point_name        VARCHAR(120),
        unload_point_branch_id   INT UNSIGNED,
        grn_status               ENUM('draft','confirmed','rejected') DEFAULT 'confirmed',
        notes                    TEXT,
        created_by_user_id       INT UNSIGNED,
        created_at               DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at               DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (e) {
    console.warn("[db-migrate] goods_received_adnan create failed:", e);
  }
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS purchase_payments_adnan (
        id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        purchase_order_id    INT UNSIGNED,
        payment_date         DATE NOT NULL,
        amount               DECIMAL(15,2) NOT NULL DEFAULT 0,
        payment_method       ENUM('bank','cash','cheque','other') DEFAULT 'bank',
        reference_number     VARCHAR(80),
        bank_account_id      INT UNSIGNED,
        payment_status       ENUM('pending','approved','rejected') DEFAULT 'approved',
        created_by_user_id   INT UNSIGNED,
        approved_by_user_id  INT UNSIGNED,
        notes                TEXT,
        created_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at           DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (e) {
    console.warn("[db-migrate] purchase_payments_adnan create failed:", e);
  }
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS supplier_ledger (
        id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        supplier_id      INT UNSIGNED NOT NULL,
        entry_date       DATE NOT NULL,
        entry_type       ENUM('Purchase Order','Payment Made','Credit Note','Opening Balance','Adjustment') NOT NULL,
        reference_number VARCHAR(80),
        description      TEXT,
        debit_amount     DECIMAL(15,2) DEFAULT 0,
        credit_amount    DECIMAL(15,2) DEFAULT 0,
        running_balance  DECIMAL(15,2) DEFAULT 0,
        created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (e) {
    console.warn("[db-migrate] supplier_ledger create failed:", e);
  }
  const paymentCols = [
    ["payment_voucher_number", "VARCHAR(30)  NULL DEFAULT NULL"],
    ["po_number", "VARCHAR(30)  NULL DEFAULT NULL"],
    ["supplier_id", "INT UNSIGNED NULL DEFAULT NULL"],
    ["supplier_name", "VARCHAR(180) NULL DEFAULT NULL"],
    ["amount_paid", "DECIMAL(15,2) NULL DEFAULT NULL"],
    ["bank_name", "VARCHAR(120) NULL DEFAULT NULL"],
    ["payment_type", "VARCHAR(30)  NOT NULL DEFAULT 'regular'"],
    ["remarks", "TEXT         NULL DEFAULT NULL"]
  ];
  for (const [col, def] of paymentCols) {
    await addCol(db, "purchase_payments_adnan", col, def);
  }
  const cpCols = [
    ["order_id", "INT NULL DEFAULT NULL COMMENT 'credit_orders.id this payment was collected for'"],
    ["payment_number", "VARCHAR(30) NULL DEFAULT NULL"],
    ["payment_type", "VARCHAR(30) NULL DEFAULT 'invoice_payment'"],
    ["cash_account_id", "INT UNSIGNED NULL DEFAULT NULL"],
    ["cheque_number", "VARCHAR(50) NULL DEFAULT NULL"],
    ["cheque_date", "DATE NULL DEFAULT NULL"],
    ["bank_transaction_type", "VARCHAR(50) NULL DEFAULT NULL"],
    ["journal_entry_id", "INT UNSIGNED NULL DEFAULT NULL"],
    ["collected_by_employee_id", "INT UNSIGNED NULL DEFAULT NULL"],
    ["allocated_amount", "DECIMAL(15,2) NULL DEFAULT NULL"],
    ["allocation_status", "VARCHAR(30) NULL DEFAULT NULL COMMENT 'allocated | partial | unallocated'"]
  ];
  for (const [col, def] of cpCols) {
    await addCol(db, "customer_payments", col, def);
  }
  try {
    await db.query(
      `ALTER TABLE customer_payments MODIFY COLUMN payment_method VARCHAR(50) NULL DEFAULT NULL`
    );
  } catch (e) {
    console.warn("[db-migrate] customer_payments.payment_method widen failed:", e);
  }
  await addCol(
    db,
    "credit_orders",
    "production_seq",
    "INT NOT NULL DEFAULT 0 COMMENT 'Manual production priority rank set by admin (0 = unset)'"
  );
  await addCol(
    db,
    "bank_accounts",
    "opening_balance",
    "DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT 'Pre-GL seed balance \u2014 balance at the time this account was first connected to GL'"
  );
  try {
    await db.query(
      `ALTER TABLE customer_ledger MODIFY COLUMN transaction_type VARCHAR(50) NULL DEFAULT NULL`
    );
  } catch (e) {
    console.warn("[db-migrate] customer_ledger.transaction_type widen failed:", e);
  }
  try {
    await db.query(
      `ALTER TABLE customer_ledger MODIFY COLUMN reference_type VARCHAR(50) NULL DEFAULT NULL`
    );
  } catch (e) {
    console.warn("[db-migrate] customer_ledger.reference_type widen failed:", e);
  }
  await addCol(db, "purchase_payments_adnan", "is_posted", "TINYINT(1) NOT NULL DEFAULT 1");
  await addCol(db, "purchase_payments_adnan", "journal_entry_id", "INT DEFAULT NULL");
  await addCol(db, "purchase_orders_adnan", "po_payment_terms", "VARCHAR(50) DEFAULT 'Credit 30'");
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id           INT          AUTO_INCREMENT PRIMARY KEY,
        stable_id    VARCHAR(150) NOT NULL,
        user_id      INT          NOT NULL,
        text         VARCHAR(500) NOT NULL,
        type         ENUM('info','success','warning','error') NOT NULL DEFAULT 'info',
        route        VARCHAR(300) NOT NULL DEFAULT '/',
        module       VARCHAR(50),
        reference_id INT,
        created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_stable (stable_id),
        INDEX  idx_user_time (user_id, created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  } catch (e) {
    console.warn("[db-migrate] notifications create failed:", e);
  }
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        setting_key   VARCHAR(120) NOT NULL PRIMARY KEY,
        setting_value MEDIUMTEXT,
        updated_by    INT          DEFAULT NULL,
        updated_at    DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  } catch (e) {
    console.warn("[db-migrate] system_settings create failed:", e);
  }
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS order_deletion_log (
        id                 INT AUTO_INCREMENT PRIMARY KEY,
        order_id           INT NOT NULL,
        order_number       VARCHAR(50) NOT NULL,
        customer_id        INT,
        customer_name      VARCHAR(200),
        total_amount       DECIMAL(15,2),
        amount_paid        DECIMAL(15,2),
        balance_due        DECIMAL(15,2),
        order_status       VARCHAR(50),
        deleted_by_user_id INT,
        deleted_by_name    VARCHAR(200),
        deletion_reason    TEXT,
        deleted_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
        ip_address         VARCHAR(45),
        INDEX idx_order_id (order_id),
        INDEX idx_deleted_at (deleted_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  } catch (e) {
    console.warn("[db-migrate] order_deletion_log create failed:", e);
  }
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_permissions (
        user_id          BIGINT UNSIGNED NOT NULL PRIMARY KEY,
        data_scope       VARCHAR(20)     NOT NULL DEFAULT 'branch'
                           COMMENT 'all | branch | own',
        allowed_branches LONGTEXT        NULL     COMMENT 'JSON array of branch slugs',
        permissions      LONGTEXT        NOT NULL COMMENT 'JSON: {module_key:{enabled,pages:[],actions:{pg:{act:bool}}}}',
        updated_by       BIGINT UNSIGNED NULL,
        updated_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                           ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_updated_at (updated_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (e) {
    console.warn("[db-migrate] user_permissions create failed:", e);
  }
  await addCol(
    db,
    "product_variants",
    "reorder_level",
    "INT NOT NULL DEFAULT 0 COMMENT 'Minimum stock level \u2014 triggers low-stock indicator in Products Hub'"
  );
  await addCol(
    db,
    "products",
    "description",
    "TEXT NULL DEFAULT NULL"
  );
  await addCol(
    db,
    "product_variants",
    "barcode",
    "VARCHAR(100) NULL DEFAULT NULL"
  );
  await addCol(
    db,
    "product_variants",
    "stock_qty",
    "DECIMAL(12,3) NOT NULL DEFAULT 0 COMMENT 'Authoritative stock quantity'"
  );
  await addCol(
    db,
    "product_variants",
    "reserved_qty",
    "DECIMAL(12,3) NOT NULL DEFAULT 0 COMMENT 'Reserved for pending orders'"
  );
  await addCol(
    db,
    "product_variants",
    "unit_price",
    "DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT 'Fallback base price if no branch price set'"
  );
  await addCol(
    db,
    "credit_orders",
    "dispatch_pin",
    "VARCHAR(10) NULL DEFAULT NULL COMMENT '6-digit PIN for dispatcher to confirm dispatch via QR scan'"
  );
  await addCol(
    db,
    "credit_orders",
    "delivery_pin",
    "VARCHAR(10) NULL DEFAULT NULL COMMENT '6-digit PIN for driver delivery confirmation (provisioned, not active)'"
  );
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS order_delivery_scans (
        id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        order_id     INT UNSIGNED NOT NULL,
        order_number VARCHAR(50)  NOT NULL,
        scan_type    ENUM('view','dispatch','delivery') NOT NULL DEFAULT 'view',
        pin_used     VARCHAR(10)  NULL,
        pin_correct  TINYINT(1)   NOT NULL DEFAULT 0,
        scanned_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        ip_address   VARCHAR(45)  NULL,
        user_agent   VARCHAR(500) NULL,
        notes        VARCHAR(255) NULL,
        INDEX idx_order_id  (order_id),
        INDEX idx_order_num (order_number),
        INDEX idx_scanned   (scanned_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (e) {
    console.warn("[db-migrate] order_delivery_scans create failed:", e);
  }
  try {
    await db.query(`
      ALTER TABLE credit_orders MODIFY COLUMN status
      ENUM('pending_approval','escalated','approved','in_production',
           'ready_to_ship','partial_delivery','delivered','completed',
           'rejected','cancelled','dispatched')
      DEFAULT 'pending_approval'
    `);
  } catch (e) {
    console.warn("[db-migrate] credit_orders.status ENUM widen failed:", e);
  }
  try {
    const [nullRows] = await db.query(
      `SELECT id FROM credit_orders WHERE dispatch_pin IS NULL LIMIT 500`
    );
    if (Array.isArray(nullRows) && nullRows.length > 0) {
      for (const row of nullRows) {
        const dp = Math.floor(1e5 + Math.random() * 9e5).toString();
        const delp = Math.floor(1e5 + Math.random() * 9e5).toString();
        await db.query(
          `UPDATE credit_orders SET dispatch_pin = ?, delivery_pin = ? WHERE id = ?`,
          [dp, delp, row.id]
        );
      }
      console.log(`[db-migrate] backfilled dispatch_pin for ${nullRows.length} order(s)`);
    }
  } catch (e) {
    console.warn("[db-migrate] backfill dispatch_pin failed:", e);
  }
  await addCol(db, "products", "base_sku", "VARCHAR(50) NULL DEFAULT NULL COMMENT 'Short unique SKU prefix, e.g. UFF'");
  await addCol(db, "product_variants", "sku", "VARCHAR(100) NULL DEFAULT NULL COMMENT 'Full auto-generated SKU, e.g. UFF-50KG-A'");
  await addCol(db, "product_variants", "grade", "VARCHAR(50) NULL DEFAULT NULL COMMENT 'e.g. A-Grade, B'");
  await addCol(db, "product_variants", "unit_of_measure", "VARCHAR(20) NOT NULL DEFAULT 'bag' COMMENT 'pcs | litre | kg | gm | bag'");
  await addCol(db, "product_variants", "weight_kg", "DECIMAL(8,2) NULL DEFAULT NULL COMMENT 'Numeric weight for calculations'");
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS price_change_log (
        id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        variant_id  INT UNSIGNED NOT NULL,
        branch_id   INT UNSIGNED NOT NULL,
        old_price   DECIMAL(10,2) NULL,
        new_price   DECIMAL(10,2) NULL,
        change_type VARCHAR(20)  NOT NULL DEFAULT 'set'
                      COMMENT 'set | update | archive | engine',
        changed_by  VARCHAR(150) NULL,
        changed_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        note        VARCHAR(255) NULL,
        INDEX idx_variant  (variant_id),
        INDEX idx_branch   (branch_id),
        INDEX idx_changed  (changed_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (e) {
    console.warn("[db-migrate] price_change_log create failed:", e);
  }
  console.log("[db-migrate] startup migrations complete");
});

const plugins = [
  _A0rTAkqQKHycO7CrrtLZ2oMw5IS2SKVeyO4RUEyJ3Q,
_87WoZIZQivakNKczWODrKTUCsM9p4H9wZ2LxqmDpdjo
];

const assets = {
  "/models/face_landmark_68_tiny_model-weights_manifest.json": {
    "type": "application/json",
    "etag": "\"12c6-uiOOLccQ5M4dIu4xjnt8MXzWjrI\"",
    "mtime": "2026-06-23T12:51:35.611Z",
    "size": 4806,
    "path": "../public/models/face_landmark_68_tiny_model-weights_manifest.json"
  },
  "/models/tiny_face_detector_model-weights_manifest.json": {
    "type": "application/json",
    "etag": "\"c93-1fFvS33OBi7EWgUx6fZDwoVVPCI\"",
    "mtime": "2026-06-23T12:51:35.611Z",
    "size": 3219,
    "path": "../public/models/tiny_face_detector_model-weights_manifest.json"
  },
  "/models/face_landmark_68_tiny_model.bin": {
    "type": "application/octet-stream",
    "etag": "\"12da8-O/wXA0Tpx1GiFR3yFaK0/8/W7nU\"",
    "mtime": "2026-06-23T12:51:35.612Z",
    "size": 77224,
    "path": "../public/models/face_landmark_68_tiny_model.bin"
  },
  "/models/face_recognition_model-weights_manifest.json": {
    "type": "application/json",
    "etag": "\"4c9f-jYqLwDX2HEyGhjqRlNGh1rJ0FQY\"",
    "mtime": "2026-06-23T12:51:35.612Z",
    "size": 19615,
    "path": "../public/models/face_recognition_model-weights_manifest.json"
  },
  "/_nuxt/1QQdHHDi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1213-rLa5cFyt1BDrBIf183XVUQx7b4U\"",
    "mtime": "2026-06-23T12:51:35.531Z",
    "size": 4627,
    "path": "../public/_nuxt/1QQdHHDi.js"
  },
  "/_nuxt/1T-u1cVF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"20b3-0M2Wav3XKVCdxKmYMyPY1YHHhfs\"",
    "mtime": "2026-06-23T12:51:35.532Z",
    "size": 8371,
    "path": "../public/_nuxt/1T-u1cVF.js"
  },
  "/_nuxt/2EQbG1eR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d45-wF2R55qoKz5G5ki0jpcSF6lCKjM\"",
    "mtime": "2026-06-23T12:51:35.531Z",
    "size": 3397,
    "path": "../public/_nuxt/2EQbG1eR.js"
  },
  "/_nuxt/3D5Hn44l.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"163c-XLlKzyRHM2dbx+ErWgGd3euRGlI\"",
    "mtime": "2026-06-23T12:51:35.532Z",
    "size": 5692,
    "path": "../public/_nuxt/3D5Hn44l.js"
  },
  "/models/tiny_face_detector_model.bin": {
    "type": "application/octet-stream",
    "etag": "\"2f329-8wIN668Hg0e1yq/0v23OLzedILw\"",
    "mtime": "2026-06-23T12:51:35.614Z",
    "size": 193321,
    "path": "../public/models/tiny_face_detector_model.bin"
  },
  "/_nuxt/3B0fHZIC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"44ad-/3WOS0ijTzRxe306yZhxxRxyNqo\"",
    "mtime": "2026-06-23T12:51:35.532Z",
    "size": 17581,
    "path": "../public/_nuxt/3B0fHZIC.js"
  },
  "/_nuxt/3IJtoIKX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"715-IVCoOk0tqRv8qErjh7vLeNHUMoY\"",
    "mtime": "2026-06-23T12:51:35.533Z",
    "size": 1813,
    "path": "../public/_nuxt/3IJtoIKX.js"
  },
  "/_nuxt/3tAG6gCG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1506-2W52LOfvOXhx347bG49k3P0iyLA\"",
    "mtime": "2026-06-23T12:51:35.532Z",
    "size": 5382,
    "path": "../public/_nuxt/3tAG6gCG.js"
  },
  "/_nuxt/4tIPgHq_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"6c0a-+NLceDtvoxoKtA3k6NmETECXzrw\"",
    "mtime": "2026-06-23T12:51:35.533Z",
    "size": 27658,
    "path": "../public/_nuxt/4tIPgHq_.js"
  },
  "/_nuxt/55JygmDa.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5da9-y5Wfp0eCNjiED+5EWRmvHXiV+mk\"",
    "mtime": "2026-06-23T12:51:35.533Z",
    "size": 23977,
    "path": "../public/_nuxt/55JygmDa.js"
  },
  "/_nuxt/64_DEgYG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ebb6-uCeCeZy9aXohnlsuwcgkk16YYxs\"",
    "mtime": "2026-06-23T12:51:35.534Z",
    "size": 60342,
    "path": "../public/_nuxt/64_DEgYG.js"
  },
  "/_nuxt/6rQeZvfQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b6-ZCvPWokukbnp0I6n6qBhiU3XRuw\"",
    "mtime": "2026-06-23T12:51:35.533Z",
    "size": 182,
    "path": "../public/_nuxt/6rQeZvfQ.js"
  },
  "/_nuxt/95N3u5xc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1b04-ydGni31I2U0XcU2QhTMf2m3nmiQ\"",
    "mtime": "2026-06-23T12:51:35.534Z",
    "size": 6916,
    "path": "../public/_nuxt/95N3u5xc.js"
  },
  "/_nuxt/B215CzEb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2b55-XrLEUyVmsLAfxDbTCMeSnzXJ/94\"",
    "mtime": "2026-06-23T12:51:35.534Z",
    "size": 11093,
    "path": "../public/_nuxt/B215CzEb.js"
  },
  "/_nuxt/B6TiQbf6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"897-zmK6Gq/Z8ugnBH/8UmoCWWj68yE\"",
    "mtime": "2026-06-23T12:51:35.536Z",
    "size": 2199,
    "path": "../public/_nuxt/B6TiQbf6.js"
  },
  "/_nuxt/B7DTvjCb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3c4d-mhkagWod6EYFSyeppJUp/DmOtdw\"",
    "mtime": "2026-06-23T12:51:35.536Z",
    "size": 15437,
    "path": "../public/_nuxt/B7DTvjCb.js"
  },
  "/_nuxt/B2qiVnoz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2832-OGjwXvu2RZgvdta/Sx8rMZ0WD2s\"",
    "mtime": "2026-06-23T12:51:35.534Z",
    "size": 10290,
    "path": "../public/_nuxt/B2qiVnoz.js"
  },
  "/_nuxt/B7qJs6F_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2695-Xde5PSLZUu92OW9fXwvDV/ou1zs\"",
    "mtime": "2026-06-23T12:51:35.536Z",
    "size": 9877,
    "path": "../public/_nuxt/B7qJs6F_.js"
  },
  "/_nuxt/B83gl-Je.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"17c9-jQPTLj8xvMsxtdQB7BeuJVKSzUI\"",
    "mtime": "2026-06-23T12:51:35.536Z",
    "size": 6089,
    "path": "../public/_nuxt/B83gl-Je.js"
  },
  "/_nuxt/B98ZQWz2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1d9e-8MBUBENxAFAo1R3c+6qoxnd1hk0\"",
    "mtime": "2026-06-23T12:51:35.537Z",
    "size": 7582,
    "path": "../public/_nuxt/B98ZQWz2.js"
  },
  "/_nuxt/B9TSoxyY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"23cf-zoDP4pnciVHkZe8eyMMnhhQJHDc\"",
    "mtime": "2026-06-23T12:51:35.537Z",
    "size": 9167,
    "path": "../public/_nuxt/B9TSoxyY.js"
  },
  "/_nuxt/B9XpJ4lq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"13bc-wt5P+just9+3Bhj+VG/DKig24g8\"",
    "mtime": "2026-06-23T12:51:35.538Z",
    "size": 5052,
    "path": "../public/_nuxt/B9XpJ4lq.js"
  },
  "/_nuxt/B9nXINpt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"14ed-g6wBAeMxVMrvi9Du8RZXwAEwN88\"",
    "mtime": "2026-06-23T12:51:35.538Z",
    "size": 5357,
    "path": "../public/_nuxt/B9nXINpt.js"
  },
  "/_nuxt/B9h7HjPf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3b5b-yIaL3uWMfrI9fJODX7ceVMmI1IU\"",
    "mtime": "2026-06-23T12:51:35.539Z",
    "size": 15195,
    "path": "../public/_nuxt/B9h7HjPf.js"
  },
  "/_nuxt/BDdJs4-J.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3270-3rFfRtCWl2EMVlCmRntQZDmSP70\"",
    "mtime": "2026-06-23T12:51:35.539Z",
    "size": 12912,
    "path": "../public/_nuxt/BDdJs4-J.js"
  },
  "/_nuxt/BE6EAXLN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"dda-2TvXO3VJoR2trySjpkzNDlXSVS4\"",
    "mtime": "2026-06-23T12:51:35.540Z",
    "size": 3546,
    "path": "../public/_nuxt/BE6EAXLN.js"
  },
  "/_nuxt/BGQ0N9wl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1ce3-kUaYp7MNW09upsFNewISIPZwN8E\"",
    "mtime": "2026-06-23T12:51:35.540Z",
    "size": 7395,
    "path": "../public/_nuxt/BGQ0N9wl.js"
  },
  "/_nuxt/BIQbVt4Q.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2d7b-5PTg/wHS35ag2UYDcxL8B7P6Dug\"",
    "mtime": "2026-06-23T12:51:35.540Z",
    "size": 11643,
    "path": "../public/_nuxt/BIQbVt4Q.js"
  },
  "/_nuxt/BLb-1oY0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3098-Jl4OPg9QN8rNS89PPFx3F04l7G8\"",
    "mtime": "2026-06-23T12:51:35.540Z",
    "size": 12440,
    "path": "../public/_nuxt/BLb-1oY0.js"
  },
  "/_nuxt/BMZcox5f.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f02-w3PlkqFE4rdBfnJwPey0byPTQjs\"",
    "mtime": "2026-06-23T12:51:35.541Z",
    "size": 3842,
    "path": "../public/_nuxt/BMZcox5f.js"
  },
  "/_nuxt/BNYg8yRs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2de-bw6ad2kfcYb2wrpCc4ZMccxdhqE\"",
    "mtime": "2026-06-23T12:51:35.540Z",
    "size": 734,
    "path": "../public/_nuxt/BNYg8yRs.js"
  },
  "/_nuxt/BO3xaU-T.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b7a-nFLQKOFIO4eQcqUDj9CVkRVnwuc\"",
    "mtime": "2026-06-23T12:51:35.541Z",
    "size": 2938,
    "path": "../public/_nuxt/BO3xaU-T.js"
  },
  "/_nuxt/BQPlSDxh.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"12e0-LWmM97MT6HbBHxgJP5qsb18jFY0\"",
    "mtime": "2026-06-23T12:51:35.542Z",
    "size": 4832,
    "path": "../public/_nuxt/BQPlSDxh.js"
  },
  "/_nuxt/BQhWCmhH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"13e7-CHL9pUohKGuBlsIadSmyMyCk2PU\"",
    "mtime": "2026-06-23T12:51:35.542Z",
    "size": 5095,
    "path": "../public/_nuxt/BQhWCmhH.js"
  },
  "/_nuxt/BSqddvqs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f4f-HL2ncslZJ08kNUZ/+B81GPmBAU4\"",
    "mtime": "2026-06-23T12:51:35.542Z",
    "size": 3919,
    "path": "../public/_nuxt/BSqddvqs.js"
  },
  "/_nuxt/BTMH0zjS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f93-UpDfW9DnfPRbrHtyLcvOlblh1uc\"",
    "mtime": "2026-06-23T12:51:35.542Z",
    "size": 3987,
    "path": "../public/_nuxt/BTMH0zjS.js"
  },
  "/_nuxt/BY0W6Jx9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"13fc-ag+MrP+4PtGq1qCZcjDDBv/CzmY\"",
    "mtime": "2026-06-23T12:51:35.544Z",
    "size": 5116,
    "path": "../public/_nuxt/BY0W6Jx9.js"
  },
  "/_nuxt/BYefR1T8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3313-3Wlwty0Elgf7qmOStAr7yE5CTC8\"",
    "mtime": "2026-06-23T12:51:35.544Z",
    "size": 13075,
    "path": "../public/_nuxt/BYefR1T8.js"
  },
  "/_nuxt/B_NSyajo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d3a-zen7RO5o6+9jgu57o0cdX3rc0Go\"",
    "mtime": "2026-06-23T12:51:35.543Z",
    "size": 3386,
    "path": "../public/_nuxt/B_NSyajo.js"
  },
  "/_nuxt/Ba4eCOX3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1633-Hd6tq/hIIZP10oV2LDfN+hesoEI\"",
    "mtime": "2026-06-23T12:51:35.544Z",
    "size": 5683,
    "path": "../public/_nuxt/Ba4eCOX3.js"
  },
  "/_nuxt/BbBxm5pu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"fff-qPs1h+HmeDicjUZitpsiASeTGN4\"",
    "mtime": "2026-06-23T12:51:35.544Z",
    "size": 4095,
    "path": "../public/_nuxt/BbBxm5pu.js"
  },
  "/_nuxt/BdM7_8gf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"258d-3WroB4d4OX/TKSj5XtLJTfiK85Q\"",
    "mtime": "2026-06-23T12:51:35.546Z",
    "size": 9613,
    "path": "../public/_nuxt/BdM7_8gf.js"
  },
  "/_nuxt/BdzbXbXb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"25f8-MwKLYdyDGtEXKxJVDE0DJTsYSoU\"",
    "mtime": "2026-06-23T12:51:35.546Z",
    "size": 9720,
    "path": "../public/_nuxt/BdzbXbXb.js"
  },
  "/_nuxt/Bf0CFvaT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"161a-Mcjk4jsz+AsKIjkbR3PW5rhdkt4\"",
    "mtime": "2026-06-23T12:51:35.546Z",
    "size": 5658,
    "path": "../public/_nuxt/Bf0CFvaT.js"
  },
  "/_nuxt/Bg1mMFHQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1840-tUG0+SUZCBZ5BCjG6ekbNJa2zlc\"",
    "mtime": "2026-06-23T12:51:35.546Z",
    "size": 6208,
    "path": "../public/_nuxt/Bg1mMFHQ.js"
  },
  "/_nuxt/Bmsf2KhZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1ec9-HLUUV9BqrY6xRH/lACvQ1WVy/V0\"",
    "mtime": "2026-06-23T12:51:35.547Z",
    "size": 7881,
    "path": "../public/_nuxt/Bmsf2KhZ.js"
  },
  "/_nuxt/BnHUKdYg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"133b-2NFpvyeIOxw8jvO0dK6LbwjSyrw\"",
    "mtime": "2026-06-23T12:51:35.547Z",
    "size": 4923,
    "path": "../public/_nuxt/BnHUKdYg.js"
  },
  "/_nuxt/BnMcDjgF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2cda-KKT9g6aiQ0yrGXwNQk2H5DpjY28\"",
    "mtime": "2026-06-23T12:51:35.548Z",
    "size": 11482,
    "path": "../public/_nuxt/BnMcDjgF.js"
  },
  "/_nuxt/BoSnoaW4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1dd2-xRMkzHYU8A71DtlTW1ZZ0LEBzac\"",
    "mtime": "2026-06-23T12:51:35.548Z",
    "size": 7634,
    "path": "../public/_nuxt/BoSnoaW4.js"
  },
  "/_nuxt/Bov1_nqf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"19bc-CXDpSL8BOBSxOJbieX1NQTcYOMY\"",
    "mtime": "2026-06-23T12:51:35.548Z",
    "size": 6588,
    "path": "../public/_nuxt/Bov1_nqf.js"
  },
  "/_nuxt/BsSek6hK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1222-IrqJvFFPOZ7ikrvJE1RFLD0F6yw\"",
    "mtime": "2026-06-23T12:51:35.549Z",
    "size": 4642,
    "path": "../public/_nuxt/BsSek6hK.js"
  },
  "/_nuxt/BuHWTkvT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7d9f-KoylvsZO0m36O03dbFOzHJwdvts\"",
    "mtime": "2026-06-23T12:51:35.550Z",
    "size": 32159,
    "path": "../public/_nuxt/BuHWTkvT.js"
  },
  "/_nuxt/Bw2ViriP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1478-0iNJxxX0knJR2wVsJr0nyVvhfhw\"",
    "mtime": "2026-06-23T12:51:35.549Z",
    "size": 5240,
    "path": "../public/_nuxt/Bw2ViriP.js"
  },
  "/_nuxt/ByGZgKBA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d2b-6o8qJ2tFMVA5r6Z3LDHwRfwlulw\"",
    "mtime": "2026-06-23T12:51:35.549Z",
    "size": 3371,
    "path": "../public/_nuxt/ByGZgKBA.js"
  },
  "/_nuxt/C0T7PoLJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"23b7-xB9bEpGmTVftDn/UFO+ectw4OIQ\"",
    "mtime": "2026-06-23T12:51:35.550Z",
    "size": 9143,
    "path": "../public/_nuxt/C0T7PoLJ.js"
  },
  "/_nuxt/C0lQ2uH5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"217c-LrmE8foYmwdAVW5JY+4bciR0WVU\"",
    "mtime": "2026-06-23T12:51:35.550Z",
    "size": 8572,
    "path": "../public/_nuxt/C0lQ2uH5.js"
  },
  "/_nuxt/C2ZaMiDu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2120-MPE1B5l8ddbyoghpAZzbEeuWpfw\"",
    "mtime": "2026-06-23T12:51:35.550Z",
    "size": 8480,
    "path": "../public/_nuxt/C2ZaMiDu.js"
  },
  "/_nuxt/C2dnf-GN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"509a-aZ4Pop0wYLggKUFxz8diZzJqoQY\"",
    "mtime": "2026-06-23T12:51:35.551Z",
    "size": 20634,
    "path": "../public/_nuxt/C2dnf-GN.js"
  },
  "/_nuxt/C22ExHNY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d007-aSy8u7K+cJB2PjKn5OaaP/7zfgY\"",
    "mtime": "2026-06-23T12:51:35.551Z",
    "size": 53255,
    "path": "../public/_nuxt/C22ExHNY.js"
  },
  "/_nuxt/C2f5pssJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"650b-CODnDAga3zEdHVqKlka4zYeQ1DM\"",
    "mtime": "2026-06-23T12:51:35.552Z",
    "size": 25867,
    "path": "../public/_nuxt/C2f5pssJ.js"
  },
  "/_nuxt/C32B3ETP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"17ef-5R87iaXDbZn6BMbxvaA3fT+V7ww\"",
    "mtime": "2026-06-23T12:51:35.551Z",
    "size": 6127,
    "path": "../public/_nuxt/C32B3ETP.js"
  },
  "/_nuxt/C5CkGgTu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"98d-smCd1w5KxyVONe9ocSKNSvvMzOI\"",
    "mtime": "2026-06-23T12:51:35.551Z",
    "size": 2445,
    "path": "../public/_nuxt/C5CkGgTu.js"
  },
  "/_nuxt/C5eO-xzg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16f6-Xb+qRLGAFJZ7Em2BIezjlGKiFZE\"",
    "mtime": "2026-06-23T12:51:35.552Z",
    "size": 5878,
    "path": "../public/_nuxt/C5eO-xzg.js"
  },
  "/_nuxt/C6Huz4i5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"9a7-b4Q4+N/G0pUSvYf5VkhGEJCA0JQ\"",
    "mtime": "2026-06-23T12:51:35.552Z",
    "size": 2471,
    "path": "../public/_nuxt/C6Huz4i5.js"
  },
  "/_nuxt/C7F0aZyg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b649-NhVb8/zQ8oAdHu4attDvpwT+GuY\"",
    "mtime": "2026-06-23T12:51:35.553Z",
    "size": 46665,
    "path": "../public/_nuxt/C7F0aZyg.js"
  },
  "/_nuxt/C8YUF2Pu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1bc1-Z4dkp/ljS0Kfb+59wqyXhIUHSck\"",
    "mtime": "2026-06-23T12:51:35.554Z",
    "size": 7105,
    "path": "../public/_nuxt/C8YUF2Pu.js"
  },
  "/_nuxt/CAAJZGfd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4be8-Xmk7/EExc2FN8lrkFD+gOYKmqH4\"",
    "mtime": "2026-06-23T12:51:35.554Z",
    "size": 19432,
    "path": "../public/_nuxt/CAAJZGfd.js"
  },
  "/_nuxt/CAEEOB5R.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1a74-I0qkKj+E029z5WN5lCNOzv4orE0\"",
    "mtime": "2026-06-23T12:51:35.554Z",
    "size": 6772,
    "path": "../public/_nuxt/CAEEOB5R.js"
  },
  "/_nuxt/CC3z-ImD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1c67-jkbdiM/mlewPBFYUTbFZ0dVTxDw\"",
    "mtime": "2026-06-23T12:51:35.554Z",
    "size": 7271,
    "path": "../public/_nuxt/CC3z-ImD.js"
  },
  "/_nuxt/CDzBvjtx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3ba6-9O5aw+4Dnn7yt8TyLeu/BYCMpPg\"",
    "mtime": "2026-06-23T12:51:35.556Z",
    "size": 15270,
    "path": "../public/_nuxt/CDzBvjtx.js"
  },
  "/_nuxt/CGgCLt28.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"12b7-7XRzL8/D0pr1Tfd2KyuL6QraKug\"",
    "mtime": "2026-06-23T12:51:35.556Z",
    "size": 4791,
    "path": "../public/_nuxt/CGgCLt28.js"
  },
  "/_nuxt/CG8LTNLD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1cdc-u43RjZZS52bXeNImDMJ5m7pdqD8\"",
    "mtime": "2026-06-23T12:51:35.555Z",
    "size": 7388,
    "path": "../public/_nuxt/CG8LTNLD.js"
  },
  "/_nuxt/CKHNwHRa.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1d88-LQtcRgimMPUwIfLNYmwYOysFyGY\"",
    "mtime": "2026-06-23T12:51:35.556Z",
    "size": 7560,
    "path": "../public/_nuxt/CKHNwHRa.js"
  },
  "/_nuxt/CKiQzFPB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f32-fXJ5qe+Wyw6uJhyuXzjVLmMZfCk\"",
    "mtime": "2026-06-23T12:51:35.557Z",
    "size": 3890,
    "path": "../public/_nuxt/CKiQzFPB.js"
  },
  "/_nuxt/CPUzhmnZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"20d9-Xj23RDkOXKgfczcQ++VPqOvMqiA\"",
    "mtime": "2026-06-23T12:51:35.557Z",
    "size": 8409,
    "path": "../public/_nuxt/CPUzhmnZ.js"
  },
  "/_nuxt/CPho2Kc3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"fc7-A3yEJxvvD/z/Z3wEBlvXwapPcak\"",
    "mtime": "2026-06-23T12:51:35.557Z",
    "size": 4039,
    "path": "../public/_nuxt/CPho2Kc3.js"
  },
  "/_nuxt/CPrQaBIR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4032-iM4KMD+HZ2iw7wOq4n/edanH7fM\"",
    "mtime": "2026-06-23T12:51:35.558Z",
    "size": 16434,
    "path": "../public/_nuxt/CPrQaBIR.js"
  },
  "/_nuxt/CSoeqQsP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3554-JXpeDXoeHFgKQnyeub3/Qj83dmg\"",
    "mtime": "2026-06-23T12:51:35.558Z",
    "size": 13652,
    "path": "../public/_nuxt/CSoeqQsP.js"
  },
  "/_nuxt/CTCXxJhe.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"eb4-15XivtVuOlIWyQAb5WerqE19P7I\"",
    "mtime": "2026-06-23T12:51:35.558Z",
    "size": 3764,
    "path": "../public/_nuxt/CTCXxJhe.js"
  },
  "/_nuxt/CVSWmcjG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d41-ipgcLTwR/RVEZZTxr4c7Ub8OiEk\"",
    "mtime": "2026-06-23T12:51:35.558Z",
    "size": 3393,
    "path": "../public/_nuxt/CVSWmcjG.js"
  },
  "/_nuxt/CX6iD2eC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"415b-eDuOaEcA7wpfR61OyDfVPaX0zo0\"",
    "mtime": "2026-06-23T12:51:35.559Z",
    "size": 16731,
    "path": "../public/_nuxt/CX6iD2eC.js"
  },
  "/_nuxt/C_I1OgtK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2649-co7phY3uf2442ZfHvlBN4J86dF8\"",
    "mtime": "2026-06-23T12:51:35.559Z",
    "size": 9801,
    "path": "../public/_nuxt/C_I1OgtK.js"
  },
  "/_nuxt/CeaOg7wG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4e8-LtgkEQjz/XbC+IBpnjwyc1qeLRU\"",
    "mtime": "2026-06-23T12:51:35.559Z",
    "size": 1256,
    "path": "../public/_nuxt/CeaOg7wG.js"
  },
  "/_nuxt/CgJWIViB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f38-7wLhVuuBYFDzNSauYPx6kf1gefQ\"",
    "mtime": "2026-06-23T12:51:35.560Z",
    "size": 3896,
    "path": "../public/_nuxt/CgJWIViB.js"
  },
  "/_nuxt/Ch1HEQ2e.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"270e-oT+K2xRzzgvA8q5TCf+YOGsuPwY\"",
    "mtime": "2026-06-23T12:51:35.561Z",
    "size": 9998,
    "path": "../public/_nuxt/Ch1HEQ2e.js"
  },
  "/_nuxt/CnOpQqHS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"19f6-uNc2NmuAkmyMOfKUO3KKbJEbZys\"",
    "mtime": "2026-06-23T12:51:35.561Z",
    "size": 6646,
    "path": "../public/_nuxt/CnOpQqHS.js"
  },
  "/_nuxt/CneXOSXK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2f06-UiEQI7B2D8vQs5H3cPqb6Fh1JSA\"",
    "mtime": "2026-06-23T12:51:35.563Z",
    "size": 12038,
    "path": "../public/_nuxt/CneXOSXK.js"
  },
  "/_nuxt/CqSvucNy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2ae3-RlRAjqorHTafe8BzckIMs7cHaaA\"",
    "mtime": "2026-06-23T12:51:35.563Z",
    "size": 10979,
    "path": "../public/_nuxt/CqSvucNy.js"
  },
  "/_nuxt/CqDbEFy1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"64ec-KYpEt1UVC30c+Gc9tJ/Zm1GOaQo\"",
    "mtime": "2026-06-23T12:51:35.563Z",
    "size": 25836,
    "path": "../public/_nuxt/CqDbEFy1.js"
  },
  "/_nuxt/Cvfx5HKF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"75c-oOvjQ50kVEc1Us8qhY8aMet8zQ8\"",
    "mtime": "2026-06-23T12:51:35.565Z",
    "size": 1884,
    "path": "../public/_nuxt/Cvfx5HKF.js"
  },
  "/_nuxt/CvuEnVX_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5c20-mppKcauUbtv858FAIc7YoA2jBRc\"",
    "mtime": "2026-06-23T12:51:35.564Z",
    "size": 23584,
    "path": "../public/_nuxt/CvuEnVX_.js"
  },
  "/models/face_recognition_model.bin": {
    "type": "application/octet-stream",
    "etag": "\"625400-WARdwHLPE+xrp5Xpv2Pq7E0NlV0\"",
    "mtime": "2026-06-23T12:51:35.624Z",
    "size": 6444032,
    "path": "../public/models/face_recognition_model.bin"
  },
  "/_nuxt/CD9jNrC-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"144352-MC/1dsuDkIyoCChjicM2gjfMECs\"",
    "mtime": "2026-06-23T12:51:35.562Z",
    "size": 1327954,
    "path": "../public/_nuxt/CD9jNrC-.js"
  },
  "/_nuxt/CxZV5o_m.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2cba-Pr7nEtWEIVmWU7q8GX5ETKjzyrc\"",
    "mtime": "2026-06-23T12:51:35.565Z",
    "size": 11450,
    "path": "../public/_nuxt/CxZV5o_m.js"
  },
  "/_nuxt/D-QWzmjL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"af7-MPdyVaav97qkR41t4PcAzZetI8g\"",
    "mtime": "2026-06-23T12:51:35.564Z",
    "size": 2807,
    "path": "../public/_nuxt/D-QWzmjL.js"
  },
  "/_nuxt/D0bPwGRE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"17b2-kUtMHlhgUe5Y9RomL4GajaQ5U10\"",
    "mtime": "2026-06-23T12:51:35.565Z",
    "size": 6066,
    "path": "../public/_nuxt/D0bPwGRE.js"
  },
  "/_nuxt/D2ZmlPm5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1ab3-mXpK887rS5fyZwL7GN8aWPL0LQk\"",
    "mtime": "2026-06-23T12:51:35.566Z",
    "size": 6835,
    "path": "../public/_nuxt/D2ZmlPm5.js"
  },
  "/_nuxt/D5H7-PhJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3c6c-ClM5kPwMHYJd4Vi9lC+4fUBJx3c\"",
    "mtime": "2026-06-23T12:51:35.565Z",
    "size": 15468,
    "path": "../public/_nuxt/D5H7-PhJ.js"
  },
  "/_nuxt/D6Z1Ljf7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"29f8-mFmv364qVliU8HjoLg4t2uOpINo\"",
    "mtime": "2026-06-23T12:51:35.566Z",
    "size": 10744,
    "path": "../public/_nuxt/D6Z1Ljf7.js"
  },
  "/_nuxt/D74ookOQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"39c0-rwJ4U+GpGEscKzIsh7CIAaeJRls\"",
    "mtime": "2026-06-23T12:51:35.566Z",
    "size": 14784,
    "path": "../public/_nuxt/D74ookOQ.js"
  },
  "/_nuxt/D9Zst3aX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1e52-wWUwLrmvURcAZ3swfMt1XljUx5Y\"",
    "mtime": "2026-06-23T12:51:35.566Z",
    "size": 7762,
    "path": "../public/_nuxt/D9Zst3aX.js"
  },
  "/_nuxt/DAi_abQj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1a78-DBxK2iV7Ik5Eq9AQve5cLd+a6jI\"",
    "mtime": "2026-06-23T12:51:35.567Z",
    "size": 6776,
    "path": "../public/_nuxt/DAi_abQj.js"
  },
  "/_nuxt/DCLzprJn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2d82-rZEavunRKHu+Vcs+ZfEN+0/LRj4\"",
    "mtime": "2026-06-23T12:51:35.568Z",
    "size": 11650,
    "path": "../public/_nuxt/DCLzprJn.js"
  },
  "/_nuxt/DCkEl-cF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1b2a-dU+G7cgSiathQlPa4IwfAg+0XGU\"",
    "mtime": "2026-06-23T12:51:35.567Z",
    "size": 6954,
    "path": "../public/_nuxt/DCkEl-cF.js"
  },
  "/_nuxt/DDGhmipO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"40-vOpuS8vCTxZkh2LLnscmYXnnHKE\"",
    "mtime": "2026-06-23T12:51:35.568Z",
    "size": 64,
    "path": "../public/_nuxt/DDGhmipO.js"
  },
  "/_nuxt/DEvAXg3J.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3fcc-sM/oIkshda0o9UMwnlOBqDdDW2Y\"",
    "mtime": "2026-06-23T12:51:35.567Z",
    "size": 16332,
    "path": "../public/_nuxt/DEvAXg3J.js"
  },
  "/_nuxt/DFENhfCm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"60f3-5HHFJZDBPZuoiNgiXY0Tx9jt68s\"",
    "mtime": "2026-06-23T12:51:35.568Z",
    "size": 24819,
    "path": "../public/_nuxt/DFENhfCm.js"
  },
  "/_nuxt/DFb-U-wd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"168c-zVHq0P7HtZhSD0d3IDYuAQom1po\"",
    "mtime": "2026-06-23T12:51:35.568Z",
    "size": 5772,
    "path": "../public/_nuxt/DFb-U-wd.js"
  },
  "/_nuxt/DKnpuAHs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1729-GMZ+t2L9j2TAdVrIXrQIyhIG8Wc\"",
    "mtime": "2026-06-23T12:51:35.569Z",
    "size": 5929,
    "path": "../public/_nuxt/DKnpuAHs.js"
  },
  "/_nuxt/DO1AYmeA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2475-hee6u9jpAW9zbo43z+Ef11M8wCE\"",
    "mtime": "2026-06-23T12:51:35.569Z",
    "size": 9333,
    "path": "../public/_nuxt/DO1AYmeA.js"
  },
  "/_nuxt/DL6oaSum.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2fe-vTzoFTyg+d9Ln7EyLmnmYtt6s4o\"",
    "mtime": "2026-06-23T12:51:35.568Z",
    "size": 766,
    "path": "../public/_nuxt/DL6oaSum.js"
  },
  "/_nuxt/DSGpiInN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1d94-7QnTb+y0fUF8itD4mtyiucicCBk\"",
    "mtime": "2026-06-23T12:51:35.569Z",
    "size": 7572,
    "path": "../public/_nuxt/DSGpiInN.js"
  },
  "/_nuxt/DSMSGibv.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1e31-6QCKM8Z6buQsOqHbb6JunqZyrw0\"",
    "mtime": "2026-06-23T12:51:35.569Z",
    "size": 7729,
    "path": "../public/_nuxt/DSMSGibv.js"
  },
  "/_nuxt/DSthZRQ-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"45e6-DH34yVEt3m6vvOrSiYbiJkXoBiQ\"",
    "mtime": "2026-06-23T12:51:35.570Z",
    "size": 17894,
    "path": "../public/_nuxt/DSthZRQ-.js"
  },
  "/_nuxt/DU14MCAc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4427-7mEOU8cb7twPRUFEWRuMUW/o4o4\"",
    "mtime": "2026-06-23T12:51:35.570Z",
    "size": 17447,
    "path": "../public/_nuxt/DU14MCAc.js"
  },
  "/_nuxt/DVVRyoCL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1cec-uwtAEjiDEB2vv3frSWjvIwVMJy0\"",
    "mtime": "2026-06-23T12:51:35.570Z",
    "size": 7404,
    "path": "../public/_nuxt/DVVRyoCL.js"
  },
  "/_nuxt/DX7vwjiV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"214f-fuOf0fkLEZQ3HALfBaoOpZgTmiI\"",
    "mtime": "2026-06-23T12:51:35.571Z",
    "size": 8527,
    "path": "../public/_nuxt/DX7vwjiV.js"
  },
  "/_nuxt/DXXofdsG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1bed-oPPGPzsDLAj8BxImv3mCPyH/E1Y\"",
    "mtime": "2026-06-23T12:51:35.571Z",
    "size": 7149,
    "path": "../public/_nuxt/DXXofdsG.js"
  },
  "/_nuxt/DY4qVkhl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2193-iOI5pQ6n4qelFiNNv5SX7MrcAEQ\"",
    "mtime": "2026-06-23T12:51:35.571Z",
    "size": 8595,
    "path": "../public/_nuxt/DY4qVkhl.js"
  },
  "/_nuxt/DYmV-n8F.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"c5c-KzsqxReaEihof5Y54yMBTHH+nbk\"",
    "mtime": "2026-06-23T12:51:35.571Z",
    "size": 3164,
    "path": "../public/_nuxt/DYmV-n8F.js"
  },
  "/_nuxt/DYrQU4mm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d60-Nepv3sBOs1CYg84adcTtWjsltds\"",
    "mtime": "2026-06-23T12:51:35.572Z",
    "size": 3424,
    "path": "../public/_nuxt/DYrQU4mm.js"
  },
  "/_nuxt/Dd3LyEMU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1c0f-qlsQYIThJ9+tkKI4g8MNiyyjSNM\"",
    "mtime": "2026-06-23T12:51:35.572Z",
    "size": 7183,
    "path": "../public/_nuxt/Dd3LyEMU.js"
  },
  "/_nuxt/DebuLtrV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"242e-gKMQv4VqvXnm0wEjfUDypp1OCDg\"",
    "mtime": "2026-06-23T12:51:35.572Z",
    "size": 9262,
    "path": "../public/_nuxt/DebuLtrV.js"
  },
  "/_nuxt/Delnfth8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b6-H1TxF3s2zJ9N1oeE3Bz3IyPsRQA\"",
    "mtime": "2026-06-23T12:51:35.572Z",
    "size": 182,
    "path": "../public/_nuxt/Delnfth8.js"
  },
  "/_nuxt/DgbvudlD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1679-/GyZQjkNfq4PFpLBHFjng+4787U\"",
    "mtime": "2026-06-23T12:51:35.573Z",
    "size": 5753,
    "path": "../public/_nuxt/DgbvudlD.js"
  },
  "/_nuxt/DZK6dx59.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"35a3f-vHl8A6gC/pQpmNXJtoex+0wziTw\"",
    "mtime": "2026-06-23T12:51:35.574Z",
    "size": 219711,
    "path": "../public/_nuxt/DZK6dx59.js"
  },
  "/_nuxt/Dh1mgUoO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"82cf-NSJ39I4HSl7OPBuWIR6hLHUArs0\"",
    "mtime": "2026-06-23T12:51:35.574Z",
    "size": 33487,
    "path": "../public/_nuxt/Dh1mgUoO.js"
  },
  "/_nuxt/DhkozyCL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2a7d-XXLcFKTO22tEuLZ5EDgv1hUJf54\"",
    "mtime": "2026-06-23T12:51:35.573Z",
    "size": 10877,
    "path": "../public/_nuxt/DhkozyCL.js"
  },
  "/_nuxt/DkdRuwzi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16ea-Fbh4HvizLB8ZWPLPOdMDI9f0VfU\"",
    "mtime": "2026-06-23T12:51:35.574Z",
    "size": 5866,
    "path": "../public/_nuxt/DkdRuwzi.js"
  },
  "/_nuxt/DkfdlBU9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2034-j1LzmysSQrM2UxZlH7Dmx4Eb/YE\"",
    "mtime": "2026-06-23T12:51:35.575Z",
    "size": 8244,
    "path": "../public/_nuxt/DkfdlBU9.js"
  },
  "/_nuxt/Dm2AVJvU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f9-/EcdCRTUnX0Huy34HUc19jy3WVI\"",
    "mtime": "2026-06-23T12:51:35.575Z",
    "size": 249,
    "path": "../public/_nuxt/Dm2AVJvU.js"
  },
  "/_nuxt/Drj5S1V0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16a0-9I+qeLekwNEy36AD4tlz0BSHyoE\"",
    "mtime": "2026-06-23T12:51:35.575Z",
    "size": 5792,
    "path": "../public/_nuxt/Drj5S1V0.js"
  },
  "/_nuxt/DsTvshnx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27e9-JLzPSz5g61uDuBajXILbI6S5K+c\"",
    "mtime": "2026-06-23T12:51:35.575Z",
    "size": 10217,
    "path": "../public/_nuxt/DsTvshnx.js"
  },
  "/_nuxt/DtZW9RDM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"15e7-bHJVSU2mpTNk6d7SaElNwkGrnws\"",
    "mtime": "2026-06-23T12:51:35.576Z",
    "size": 5607,
    "path": "../public/_nuxt/DtZW9RDM.js"
  },
  "/_nuxt/Dt_IpE6K.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1229-KUkp2JukZgQOLqBR1JN4LwCy1qA\"",
    "mtime": "2026-06-23T12:51:35.576Z",
    "size": 4649,
    "path": "../public/_nuxt/Dt_IpE6K.js"
  },
  "/_nuxt/GFmyUIAe.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5f54-3n+lHOwrE/DeWUob128xJLjBFrY\"",
    "mtime": "2026-06-23T12:51:35.576Z",
    "size": 24404,
    "path": "../public/_nuxt/GFmyUIAe.js"
  },
  "/_nuxt/HL-fLtRW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1e06-FbZ+wKPwhLgSBBTzMLRvRstMe2g\"",
    "mtime": "2026-06-23T12:51:35.577Z",
    "size": 7686,
    "path": "../public/_nuxt/HL-fLtRW.js"
  },
  "/_nuxt/DzdMra1A.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1cba-kr59y831Sykf6vcebda07m73U5A\"",
    "mtime": "2026-06-23T12:51:35.576Z",
    "size": 7354,
    "path": "../public/_nuxt/DzdMra1A.js"
  },
  "/_nuxt/JluDDP_D.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2f20-VCDVc6NItFNeWikA1YUd4C/0KAI\"",
    "mtime": "2026-06-23T12:51:35.578Z",
    "size": 12064,
    "path": "../public/_nuxt/JluDDP_D.js"
  },
  "/_nuxt/LD5y8F0g.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8f0-5287KsOExLNIX8UL41sZS1zS0oI\"",
    "mtime": "2026-06-23T12:51:35.578Z",
    "size": 2288,
    "path": "../public/_nuxt/LD5y8F0g.js"
  },
  "/_nuxt/K-UzJM5o.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1bd0-UvvFoZQYHUYYwMqkwxIDG3fzQrI\"",
    "mtime": "2026-06-23T12:51:35.578Z",
    "size": 7120,
    "path": "../public/_nuxt/K-UzJM5o.js"
  },
  "/_nuxt/LTLMvJdt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1fa0-jFwdBT+LCvouixFVN27V2tzbR7I\"",
    "mtime": "2026-06-23T12:51:35.579Z",
    "size": 8096,
    "path": "../public/_nuxt/LTLMvJdt.js"
  },
  "/_nuxt/MGYTw26Z.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"334b-ZCIdWuT6bXOugxvPPB675GxGm34\"",
    "mtime": "2026-06-23T12:51:35.580Z",
    "size": 13131,
    "path": "../public/_nuxt/MGYTw26Z.js"
  },
  "/_nuxt/NCJp8G27.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16f5-Yh9YJMW/iBfmqk9ya67Dcqkwy4Y\"",
    "mtime": "2026-06-23T12:51:35.579Z",
    "size": 5877,
    "path": "../public/_nuxt/NCJp8G27.js"
  },
  "/_nuxt/NdIcbGkd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1855-kDkpHUQSowBMO059FIrb5sI6XaM\"",
    "mtime": "2026-06-23T12:51:35.580Z",
    "size": 6229,
    "path": "../public/_nuxt/NdIcbGkd.js"
  },
  "/_nuxt/NzFrvbqM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"814-yxqHpjqM9CE6nAxQlYtbIA3Dmv8\"",
    "mtime": "2026-06-23T12:51:35.580Z",
    "size": 2068,
    "path": "../public/_nuxt/NzFrvbqM.js"
  },
  "/_nuxt/S03TCXTQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ec8-PZlff70qnvjcnNJnLp1J+FEFJts\"",
    "mtime": "2026-06-23T12:51:35.580Z",
    "size": 3784,
    "path": "../public/_nuxt/S03TCXTQ.js"
  },
  "/_nuxt/UFEtKjqZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"252-YSI7tqVq3E/dO0GKdzifUU4QELk\"",
    "mtime": "2026-06-23T12:51:35.580Z",
    "size": 594,
    "path": "../public/_nuxt/UFEtKjqZ.js"
  },
  "/_nuxt/VMIUqWy0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3254-+MmZ4JxbQI9MXboHQGUsDknZ5iU\"",
    "mtime": "2026-06-23T12:51:35.581Z",
    "size": 12884,
    "path": "../public/_nuxt/VMIUqWy0.js"
  },
  "/_nuxt/WsR_9Cst.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"107a-nhVRpFPcEiXNreZhvK0bXzjtmxQ\"",
    "mtime": "2026-06-23T12:51:35.581Z",
    "size": 4218,
    "path": "../public/_nuxt/WsR_9Cst.js"
  },
  "/_nuxt/Xmjr0JWR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"142d-swgyxRRTbL4X9cSozMnvGIPeIT4\"",
    "mtime": "2026-06-23T12:51:35.581Z",
    "size": 5165,
    "path": "../public/_nuxt/Xmjr0JWR.js"
  },
  "/_nuxt/_4e-sJ7E.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"19ad-Vj2rvD+F71Mg6WC2gKBOqavoWPM\"",
    "mtime": "2026-06-23T12:51:35.581Z",
    "size": 6573,
    "path": "../public/_nuxt/_4e-sJ7E.js"
  },
  "/_nuxt/_EpBGru4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"224b-cKEvO+egihktdHIpAs/P1uuQEJI\"",
    "mtime": "2026-06-23T12:51:35.581Z",
    "size": 8779,
    "path": "../public/_nuxt/_EpBGru4.js"
  },
  "/_nuxt/_id_.-BW_Z4_e.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"a3-1EznUbe+V+1YmlY4kkXS+B7F3/g\"",
    "mtime": "2026-06-23T12:51:35.582Z",
    "size": 163,
    "path": "../public/_nuxt/_id_.-BW_Z4_e.css"
  },
  "/_nuxt/_id_.C0N9G5ny.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"c75-RwiouuzyPhDcjBuaQhSiRrdAJRc\"",
    "mtime": "2026-06-23T12:51:35.582Z",
    "size": 3189,
    "path": "../public/_nuxt/_id_.C0N9G5ny.css"
  },
  "/_nuxt/_order_.BzRlZlUZ.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"113-tBvMi19jfghTOT2uLCJ9uGIr3EI\"",
    "mtime": "2026-06-23T12:51:35.582Z",
    "size": 275,
    "path": "../public/_nuxt/_order_.BzRlZlUZ.css"
  },
  "/_nuxt/approve.CsU0F9la.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"c9-mMlsCa+AkrlwkUtL0VvoVxasYag\"",
    "mtime": "2026-06-23T12:51:35.582Z",
    "size": 201,
    "path": "../public/_nuxt/approve.CsU0F9la.css"
  },
  "/_nuxt/bQOcr3Tt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1b1c-ROrqc6Z1TXNJ+Azof4X9KKzCENI\"",
    "mtime": "2026-06-23T12:51:35.582Z",
    "size": 6940,
    "path": "../public/_nuxt/bQOcr3Tt.js"
  },
  "/_nuxt/bXW1q59F.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"c4b-h90mcfuyKq0NhTUFr4xerS8K95U\"",
    "mtime": "2026-06-23T12:51:35.583Z",
    "size": 3147,
    "path": "../public/_nuxt/bXW1q59F.js"
  },
  "/_nuxt/base.ByFTD2Xc.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"b5-zebxk6JgBKDJ5wB6LtewZrMr8DQ\"",
    "mtime": "2026-06-23T12:51:35.583Z",
    "size": 181,
    "path": "../public/_nuxt/base.ByFTD2Xc.css"
  },
  "/_nuxt/biometric.D0is3mi_.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"59c-L9qD4U+l+qFc78+XSgEni+20jjo\"",
    "mtime": "2026-06-23T12:51:35.583Z",
    "size": 1436,
    "path": "../public/_nuxt/biometric.D0is3mi_.css"
  },
  "/_nuxt/create.DdDvMnqg.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"fa-g4qA6RyNaNgEWX/zs1jyckvvTp4\"",
    "mtime": "2026-06-23T12:51:35.583Z",
    "size": 250,
    "path": "../public/_nuxt/create.DdDvMnqg.css"
  },
  "/_nuxt/create.RBW53SWr.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"ee-ZHqrluBQEmomHhQWXpUOipWdK2c\"",
    "mtime": "2026-06-23T12:51:35.583Z",
    "size": 238,
    "path": "../public/_nuxt/create.RBW53SWr.css"
  },
  "/_nuxt/d9cE2P7M.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2a40-CFw/WfhKhBhbFKa/Gflfwr8qmBQ\"",
    "mtime": "2026-06-23T12:51:35.583Z",
    "size": 10816,
    "path": "../public/_nuxt/d9cE2P7M.js"
  },
  "/_nuxt/default.EMHx74P8.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"c4b-PdkwAs4uUYZ+TDKWWH3uittiFI0\"",
    "mtime": "2026-06-23T12:51:35.583Z",
    "size": 3147,
    "path": "../public/_nuxt/default.EMHx74P8.css"
  },
  "/_nuxt/edit.LIeWoiFz.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"190-T//b7o4UHrYq1YNNY1+loUEkhcE\"",
    "mtime": "2026-06-23T12:51:35.584Z",
    "size": 400,
    "path": "../public/_nuxt/edit.LIeWoiFz.css"
  },
  "/_nuxt/edit.XbB5EWUi.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1e4-iuxRSbPNbHpX72yPeifgBbGl4s4\"",
    "mtime": "2026-06-23T12:51:35.584Z",
    "size": 484,
    "path": "../public/_nuxt/edit.XbB5EWUi.css"
  },
  "/_nuxt/error-404.DL_4WIao.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"dca-KnjyV0UbpsrliiJzZx69defY74k\"",
    "mtime": "2026-06-23T12:51:35.584Z",
    "size": 3530,
    "path": "../public/_nuxt/error-404.DL_4WIao.css"
  },
  "/_nuxt/f4vDT6HH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3585-188ImoW22utDmhBhISZQX1qO7L4\"",
    "mtime": "2026-06-23T12:51:35.584Z",
    "size": 13701,
    "path": "../public/_nuxt/f4vDT6HH.js"
  },
  "/_nuxt/fuel.BnSRpMlB.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"b5-rAGasX6D7WUeJopsryk3/lPvKzI\"",
    "mtime": "2026-06-23T12:51:35.585Z",
    "size": 181,
    "path": "../public/_nuxt/fuel.BnSRpMlB.css"
  },
  "/_nuxt/error-500.I1Dtv2V5.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"75a-vEGyJqldBVJrnMfcLsrGaHcxYl0\"",
    "mtime": "2026-06-23T12:51:35.584Z",
    "size": 1882,
    "path": "../public/_nuxt/error-500.I1Dtv2V5.css"
  },
  "/_nuxt/h98rb950.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1092-lAMRW0SpNv+msSz+vcyV8m7Dw/I\"",
    "mtime": "2026-06-23T12:51:35.585Z",
    "size": 4242,
    "path": "../public/_nuxt/h98rb950.js"
  },
  "/_nuxt/hFUZhe25.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5b1c-DsbFTyaN6ZTfgBYDImsbfwMEmxQ\"",
    "mtime": "2026-06-23T12:51:35.585Z",
    "size": 23324,
    "path": "../public/_nuxt/hFUZhe25.js"
  },
  "/_nuxt/hi7_YbcU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"12cc-2A+i2j46xXOSQsI/a98iNrmoDJk\"",
    "mtime": "2026-06-23T12:51:35.586Z",
    "size": 4812,
    "path": "../public/_nuxt/hi7_YbcU.js"
  },
  "/_nuxt/ifnkXhfq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1d95-v+nGzU5Gok6CASbpu+kiL0JoQYI\"",
    "mtime": "2026-06-23T12:51:35.585Z",
    "size": 7573,
    "path": "../public/_nuxt/ifnkXhfq.js"
  },
  "/_nuxt/index.B9kvx-dZ.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"b5-B1ICULVGb6LT+eB6JM+l0gcFJVE\"",
    "mtime": "2026-06-23T12:51:35.586Z",
    "size": 181,
    "path": "../public/_nuxt/index.B9kvx-dZ.css"
  },
  "/_nuxt/index.BKk-C8ST.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"c9-KPmCy9rLF1eum8vWq0Dtg81irL8\"",
    "mtime": "2026-06-23T12:51:35.586Z",
    "size": 201,
    "path": "../public/_nuxt/index.BKk-C8ST.css"
  },
  "/_nuxt/index.BLdAtjQE.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"b1-cbz+ertHH/8WNzwg2f9WwN2ApbM\"",
    "mtime": "2026-06-23T12:51:35.586Z",
    "size": 177,
    "path": "../public/_nuxt/index.BLdAtjQE.css"
  },
  "/_nuxt/index.BjuCZNBA.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"3f7-/eNTMJtZXh6AKQLj6ebmggt6L58\"",
    "mtime": "2026-06-23T12:51:35.588Z",
    "size": 1015,
    "path": "../public/_nuxt/index.BjuCZNBA.css"
  },
  "/_nuxt/index.BtTulfbB.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"273-L4wSgLl/sJpV+M8B6tiWu9z2UqU\"",
    "mtime": "2026-06-23T12:51:35.587Z",
    "size": 627,
    "path": "../public/_nuxt/index.BtTulfbB.css"
  },
  "/_nuxt/index.ByXZOrRu.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"b5-12/xTLUSyF9zDfNmnx3pLIbmDJg\"",
    "mtime": "2026-06-23T12:51:35.587Z",
    "size": 181,
    "path": "../public/_nuxt/index.ByXZOrRu.css"
  },
  "/_nuxt/index.CSh2L2Ko.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"20f-Ro/qeAZsCk4AgqEXjL45KvVjVp8\"",
    "mtime": "2026-06-23T12:51:35.588Z",
    "size": 527,
    "path": "../public/_nuxt/index.CSh2L2Ko.css"
  },
  "/_nuxt/index.D2A3Irpv.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1524-rvqSIAywh0DESfT3fznMd8J4Ob8\"",
    "mtime": "2026-06-23T12:51:35.589Z",
    "size": 5412,
    "path": "../public/_nuxt/index.D2A3Irpv.css"
  },
  "/_nuxt/index.De0fTHU2.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"c5-mPnGSRW6u0FaFFqzDm5Jzc0g6+Y\"",
    "mtime": "2026-06-23T12:51:35.589Z",
    "size": 197,
    "path": "../public/_nuxt/index.De0fTHU2.css"
  },
  "/_nuxt/index.Ck7a5-5W.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"2eb-JQCbOqRbbaOwLqpdsVDBGHIzai8\"",
    "mtime": "2026-06-23T12:51:35.587Z",
    "size": 747,
    "path": "../public/_nuxt/index.Ck7a5-5W.css"
  },
  "/_nuxt/index.dn_f8pW9.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"b1-3k46jFxGhktHPgP+cxuQUhyhjIQ\"",
    "mtime": "2026-06-23T12:51:35.589Z",
    "size": 177,
    "path": "../public/_nuxt/index.dn_f8pW9.css"
  },
  "/_nuxt/index.rXmTXfvj.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1cf-WiEUOuS+RAU7mx4Bx6u2LtmFQf8\"",
    "mtime": "2026-06-23T12:51:35.589Z",
    "size": 463,
    "path": "../public/_nuxt/index.rXmTXfvj.css"
  },
  "/_nuxt/invoice.DKtuAQSE.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"116-J72hqQGmTbVtfdStiZQ85orck2A\"",
    "mtime": "2026-06-23T12:51:35.590Z",
    "size": 278,
    "path": "../public/_nuxt/invoice.DKtuAQSE.css"
  },
  "/_nuxt/isyAV1IS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2106-nrBlcrpp/0T7rpsoUUmkt5v5byo\"",
    "mtime": "2026-06-23T12:51:35.590Z",
    "size": 8454,
    "path": "../public/_nuxt/isyAV1IS.js"
  },
  "/_nuxt/l-JgK5fx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4a0-7UY7jnTNpKJ6jBdBNO6kno7d/TU\"",
    "mtime": "2026-06-23T12:51:35.590Z",
    "size": 1184,
    "path": "../public/_nuxt/l-JgK5fx.js"
  },
  "/_nuxt/jrEUlBoi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1547-1IAKPMtUSs2SrP2tppt8pJ2IvSM\"",
    "mtime": "2026-06-23T12:51:35.590Z",
    "size": 5447,
    "path": "../public/_nuxt/jrEUlBoi.js"
  },
  "/_nuxt/l57k-Q2r.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1f50-DLqqqAjydC3nk/CyszhQaomFKTQ\"",
    "mtime": "2026-06-23T12:51:35.591Z",
    "size": 8016,
    "path": "../public/_nuxt/l57k-Q2r.js"
  },
  "/_nuxt/login.D70RJ2FX.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"101-+/g0ye1hFAbM9YPBRaxIDMaL3n8\"",
    "mtime": "2026-06-23T12:51:35.591Z",
    "size": 257,
    "path": "../public/_nuxt/login.D70RJ2FX.css"
  },
  "/_nuxt/m_Wk9SSs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"24d6-qbeRAMH3+pRk3D7SyFOvitwRVKI\"",
    "mtime": "2026-06-23T12:51:35.591Z",
    "size": 9430,
    "path": "../public/_nuxt/m_Wk9SSs.js"
  },
  "/_nuxt/maintenance.C1lO4Aub.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"b1-zv1HqkzuRprePA6YpmMinhUCD6M\"",
    "mtime": "2026-06-23T12:51:35.591Z",
    "size": 177,
    "path": "../public/_nuxt/maintenance.C1lO4Aub.css"
  },
  "/_nuxt/pSfNPKZQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"c617-Lgsw222a0a2r4vtbACX8AOOYBiU\"",
    "mtime": "2026-06-23T12:51:35.593Z",
    "size": 50711,
    "path": "../public/_nuxt/pSfNPKZQ.js"
  },
  "/_nuxt/permissions.1DbC-Vg_.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"141-2AGdYK1BpPaD4d+p0OD/K5U2t9o\"",
    "mtime": "2026-06-23T12:51:35.592Z",
    "size": 321,
    "path": "../public/_nuxt/permissions.1DbC-Vg_.css"
  },
  "/_nuxt/payments.DqzWwy8W.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"b5-P/cEssTaBP+wrEw6FUinH5INL74\"",
    "mtime": "2026-06-23T12:51:35.592Z",
    "size": 181,
    "path": "../public/_nuxt/payments.DqzWwy8W.css"
  },
  "/_nuxt/pkoi3y1H.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"543b-9FofhVnPmog7cc3MDf9iwFtcXhk\"",
    "mtime": "2026-06-23T12:51:35.593Z",
    "size": 21563,
    "path": "../public/_nuxt/pkoi3y1H.js"
  },
  "/_nuxt/pricing.DpvMDtRn.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"165-4B1qb+aM3rQkshPLSqtA7kxGrqE\"",
    "mtime": "2026-06-23T12:51:35.593Z",
    "size": 357,
    "path": "../public/_nuxt/pricing.DpvMDtRn.css"
  },
  "/_nuxt/print.B3yEUJUm.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"69-zdbagVEybvpkjFYF+8AaVl4Gee0\"",
    "mtime": "2026-06-23T12:51:35.593Z",
    "size": 105,
    "path": "../public/_nuxt/print.B3yEUJUm.css"
  },
  "/_nuxt/print.BK1152hr.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"75-A5jUZFB/38XPuui3oaK2xMo5GMc\"",
    "mtime": "2026-06-23T12:51:35.594Z",
    "size": 117,
    "path": "../public/_nuxt/print.BK1152hr.css"
  },
  "/_nuxt/print.Cb5j83df.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"73-MZ4PGoFSYSaJNQyMMiNExihtB6U\"",
    "mtime": "2026-06-23T12:51:35.594Z",
    "size": 115,
    "path": "../public/_nuxt/print.Cb5j83df.css"
  },
  "/_nuxt/print.Cl-cp2nd.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1404-5jrHBOZWC896wzYNCb6Xt/g0hmQ\"",
    "mtime": "2026-06-23T12:51:35.595Z",
    "size": 5124,
    "path": "../public/_nuxt/print.Cl-cp2nd.css"
  },
  "/_nuxt/production.DU613ahS.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"cb-5GcbhDMae7iKQly2jDPcJBk3Lcs\"",
    "mtime": "2026-06-23T12:51:35.595Z",
    "size": 203,
    "path": "../public/_nuxt/production.DU613ahS.css"
  },
  "/_nuxt/rxGlNKMC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1a41-sBU+1FIj0Hp7csPuKA0xeYdEI8Y\"",
    "mtime": "2026-06-23T12:51:35.596Z",
    "size": 6721,
    "path": "../public/_nuxt/rxGlNKMC.js"
  },
  "/_nuxt/s-3gJaQY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"199f-RstZjicIoR+qXIvE95dWDLaZdgM\"",
    "mtime": "2026-06-23T12:51:35.595Z",
    "size": 6559,
    "path": "../public/_nuxt/s-3gJaQY.js"
  },
  "/_nuxt/types.B6vvKMZI.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"b5-YQIYUoQmgMzeZQNfopqu+ynfB38\"",
    "mtime": "2026-06-23T12:51:35.596Z",
    "size": 181,
    "path": "../public/_nuxt/types.B6vvKMZI.css"
  },
  "/_nuxt/u3lMB4DW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"29b2-VECjHW8n0vpHoU2z7/yntCZXYts\"",
    "mtime": "2026-06-23T12:51:35.596Z",
    "size": 10674,
    "path": "../public/_nuxt/u3lMB4DW.js"
  },
  "/_nuxt/uHPdaIz2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"22b2-Sh4S2bKNkObgScYpoLbVid43LSg\"",
    "mtime": "2026-06-23T12:51:35.597Z",
    "size": 8882,
    "path": "../public/_nuxt/uHPdaIz2.js"
  },
  "/_nuxt/vD0C3kwU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1bfa-6SiU0sQhJIf+cMxOpNFlQ99KwFw\"",
    "mtime": "2026-06-23T12:51:35.597Z",
    "size": 7162,
    "path": "../public/_nuxt/vD0C3kwU.js"
  },
  "/_nuxt/variants.Cx7om7FD.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"b5-Qs+fGjwtdoaD/peaaL4Yu3XQQfc\"",
    "mtime": "2026-06-23T12:51:35.597Z",
    "size": 181,
    "path": "../public/_nuxt/variants.Cx7om7FD.css"
  },
  "/_nuxt/variants.DmjtmX35.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"b5-CqV70WGFsIqIlCzH7IkzuJg8TTE\"",
    "mtime": "2026-06-23T12:51:35.597Z",
    "size": 181,
    "path": "../public/_nuxt/variants.DmjtmX35.css"
  },
  "/_nuxt/voucher.Dtakk1We.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"d3-db8p4DqDY2Oypspwt0H2DDRf4+0\"",
    "mtime": "2026-06-23T12:51:35.598Z",
    "size": 211,
    "path": "../public/_nuxt/voucher.Dtakk1We.css"
  },
  "/_nuxt/vouchers.DM0VuNSG.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"148-g1Pf2ZpCoYweMEp+jMKH+kAJFyM\"",
    "mtime": "2026-06-23T12:51:35.598Z",
    "size": 328,
    "path": "../public/_nuxt/vouchers.DM0VuNSG.css"
  },
  "/_nuxt/w4B8xLiG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1983-vYb6tYKreKnUHOmlF/U84VmD8oc\"",
    "mtime": "2026-06-23T12:51:35.599Z",
    "size": 6531,
    "path": "../public/_nuxt/w4B8xLiG.js"
  },
  "/_nuxt/xdqkVKLu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"122e-Vr/W2pwWEEYamMQS/QlrOPeXdzA\"",
    "mtime": "2026-06-23T12:51:35.599Z",
    "size": 4654,
    "path": "../public/_nuxt/xdqkVKLu.js"
  },
  "/_nuxt/zNBlwaDF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"18b5-vRcMt8BI3C7NBn77X3CFhCKXm+s\"",
    "mtime": "2026-06-23T12:51:35.600Z",
    "size": 6325,
    "path": "../public/_nuxt/zNBlwaDF.js"
  },
  "/_nuxt/zZ3cZ2Wy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"20ba-4KGeHsDCf3ypZ8U5j3dqMDO4t0o\"",
    "mtime": "2026-06-23T12:51:35.600Z",
    "size": 8378,
    "path": "../public/_nuxt/zZ3cZ2Wy.js"
  },
  "/_nuxt/builds/latest.json": {
    "type": "application/json",
    "etag": "\"47-c1r0y738GREVOHo5P4uAHa7J5V0\"",
    "mtime": "2026-06-23T12:51:35.466Z",
    "size": 71,
    "path": "../public/_nuxt/builds/latest.json"
  },
  "/_nuxt/builds/meta/cfcadaa3-5c37-4ccf-b20c-230702f5792d.json": {
    "type": "application/json",
    "etag": "\"58-TRRVKpOJZLnfVWDqDayCAf954aA\"",
    "mtime": "2026-06-23T12:51:35.457Z",
    "size": 88,
    "path": "../public/_nuxt/builds/meta/cfcadaa3-5c37-4ccf-b20c-230702f5792d.json"
  }
};

const _DRIVE_LETTER_START_RE = /^[A-Za-z]:\//;
function normalizeWindowsPath(input = "") {
  if (!input) {
    return input;
  }
  return input.replace(/\\/g, "/").replace(_DRIVE_LETTER_START_RE, (r) => r.toUpperCase());
}
const _IS_ABSOLUTE_RE = /^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[A-Za-z]:[/\\]/;
const _DRIVE_LETTER_RE = /^[A-Za-z]:$/;
function cwd() {
  if (typeof process !== "undefined" && typeof process.cwd === "function") {
    return process.cwd().replace(/\\/g, "/");
  }
  return "/";
}
const resolve = function(...arguments_) {
  arguments_ = arguments_.map((argument) => normalizeWindowsPath(argument));
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for (let index = arguments_.length - 1; index >= -1 && !resolvedAbsolute; index--) {
    const path = index >= 0 ? arguments_[index] : cwd();
    if (!path || path.length === 0) {
      continue;
    }
    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = isAbsolute(path);
  }
  resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute);
  if (resolvedAbsolute && !isAbsolute(resolvedPath)) {
    return `/${resolvedPath}`;
  }
  return resolvedPath.length > 0 ? resolvedPath : ".";
};
function normalizeString(path, allowAboveRoot) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let char = null;
  for (let index = 0; index <= path.length; ++index) {
    if (index < path.length) {
      char = path[index];
    } else if (char === "/") {
      break;
    } else {
      char = "/";
    }
    if (char === "/") {
      if (lastSlash === index - 1 || dots === 1) ; else if (dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res[res.length - 1] !== "." || res[res.length - 2] !== ".") {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
            }
            lastSlash = index;
            dots = 0;
            continue;
          } else if (res.length > 0) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = index;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          res += res.length > 0 ? "/.." : "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) {
          res += `/${path.slice(lastSlash + 1, index)}`;
        } else {
          res = path.slice(lastSlash + 1, index);
        }
        lastSegmentLength = index - lastSlash - 1;
      }
      lastSlash = index;
      dots = 0;
    } else if (char === "." && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}
const isAbsolute = function(p) {
  return _IS_ABSOLUTE_RE.test(p);
};
const dirname = function(p) {
  const segments = normalizeWindowsPath(p).replace(/\/$/, "").split("/").slice(0, -1);
  if (segments.length === 1 && _DRIVE_LETTER_RE.test(segments[0])) {
    segments[0] += "/";
  }
  return segments.join("/") || (isAbsolute(p) ? "/" : ".");
};

function readAsset (id) {
  const serverDir = dirname(fileURLToPath(globalThis._importMeta_.url));
  return promises.readFile(resolve(serverDir, assets[id].path))
}

const publicAssetBases = {"/_nuxt/builds/meta/":{"maxAge":31536000},"/_nuxt/builds/":{"maxAge":1},"/_nuxt/":{"maxAge":31536000}};

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets[id]
}

const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = { gzip: ".gz", br: ".br" };
const _6tTLGT = eventHandler((event) => {
  if (event.method && !METHODS.has(event.method)) {
    return;
  }
  let id = decodePath(
    withLeadingSlash(withoutTrailingSlash(parseURL(event.path).pathname))
  );
  let asset;
  const encodingHeader = String(
    getRequestHeader(event, "accept-encoding") || ""
  );
  const encodings = [
    ...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(),
    ""
  ];
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      removeResponseHeader(event, "Cache-Control");
      throw createError$1({ statusCode: 404 });
    }
    return;
  }
  if (asset.encoding !== void 0) {
    appendResponseHeader(event, "Vary", "Accept-Encoding");
  }
  const ifNotMatch = getRequestHeader(event, "if-none-match") === asset.etag;
  if (ifNotMatch) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  const ifModifiedSinceH = getRequestHeader(event, "if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  if (asset.type && !getResponseHeader(event, "Content-Type")) {
    setResponseHeader(event, "Content-Type", asset.type);
  }
  if (asset.etag && !getResponseHeader(event, "ETag")) {
    setResponseHeader(event, "ETag", asset.etag);
  }
  if (asset.mtime && !getResponseHeader(event, "Last-Modified")) {
    setResponseHeader(event, "Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !getResponseHeader(event, "Content-Encoding")) {
    setResponseHeader(event, "Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !getResponseHeader(event, "Content-Length")) {
    setResponseHeader(event, "Content-Length", asset.size);
  }
  return readAsset(id);
});

function defineRenderHandler(render) {
  const runtimeConfig = useRuntimeConfig();
  return eventHandler(async (event) => {
    const nitroApp = useNitroApp();
    const ctx = { event, render, response: void 0 };
    await nitroApp.hooks.callHook("render:before", ctx);
    if (!ctx.response) {
      if (event.path === `${runtimeConfig.app.baseURL}favicon.ico`) {
        setResponseHeader(event, "Content-Type", "image/x-icon");
        return send(
          event,
          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        );
      }
      ctx.response = await ctx.render(event);
      if (!ctx.response) {
        const _currentStatus = getResponseStatus(event);
        setResponseStatus(event, _currentStatus === 200 ? 500 : _currentStatus);
        return send(
          event,
          "No response returned from render handler: " + event.path
        );
      }
    }
    await nitroApp.hooks.callHook("render:response", ctx.response, ctx);
    if (ctx.response.headers) {
      setResponseHeaders(event, ctx.response.headers);
    }
    if (ctx.response.statusCode || ctx.response.statusMessage) {
      setResponseStatus(
        event,
        ctx.response.statusCode,
        ctx.response.statusMessage
      );
    }
    return ctx.response.body;
  });
}

function baseURL() {
	
	return useRuntimeConfig().app.baseURL;
}
function buildAssetsDir() {
	
	return useRuntimeConfig().app.buildAssetsDir;
}
function buildAssetsURL(...path) {
	return joinRelativeURL(publicAssetsURL(), buildAssetsDir(), ...path);
}
function publicAssetsURL(...path) {
	
	const app = useRuntimeConfig().app;
	const publicBase = app.cdnURL || app.baseURL;
	return path.length ? joinRelativeURL(publicBase, ...path) : publicBase;
}

const ACTION_MAP = {
  // ── Credit sales ──────────────────────────────────────────────────────────
  order_deleted: "deleted",
  order_completed: "status_changed",
  payment_received: "paid",
  delivered: "dispatched",
  partial_delivery: "dispatched",
  return_submitted: "other",
  return_approved: "approved",
  return_rejected: "rejected",
  // ── Purchase module ───────────────────────────────────────────────────────
  po_created: "created",
  po_updated: "updated",
  po_cancelled: "cancelled",
  po_closed: "status_changed",
  po_reopened: "status_changed",
  po_locked: "other",
  po_unlocked: "other",
  grn_created: "received",
  grn_updated: "updated",
  grn_cancelled: "cancelled",
  grn_deleted: "deleted",
  payment_made: "paid",
  payment_updated: "updated",
  payment_deleted: "deleted",
  adj_created: "created",
  adj_approved: "approved",
  adj_posted: "status_changed",
  adj_cancelled: "cancelled",
  // ── Admin / user management ───────────────────────────────────────────────
  user_created: "created",
  user_updated: "updated",
  user_deleted: "deleted",
  user_suspended: "status_changed",
  user_activated: "status_changed",
  user_pwd_changed: "updated",
  user_role_changed: "updated"
};
const SEVERITY_MAP = {
  info: "info",
  warning: "warning",
  error: "critical",
  critical: "critical"
};
async function auditLog(conn, opts) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i;
  try {
    const dbAction = (_a = ACTION_MAP[opts.action]) != null ? _a : opts.action;
    const dbSeverity = (_c = SEVERITY_MAP[(_b = opts.severity) != null ? _b : "info"]) != null ? _c : "info";
    await conn.query(
      `INSERT INTO system_audit_log
         (user_id, module, action, record_type, record_id, reference_number,
          description, ip_address, severity, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'success')`,
      [
        (_d = opts.userId) != null ? _d : 1,
        // NOT NULL — fallback to system user id=1
        (_e = opts.module) != null ? _e : "credit_sales",
        dbAction,
        (_f = opts.recordType) != null ? _f : null,
        (_g = opts.recordId) != null ? _g : null,
        (_h = opts.referenceNumber) != null ? _h : null,
        opts.description,
        (_i = opts.ipAddress) != null ? _i : null,
        dbSeverity
      ]
    );
  } catch (e) {
  }
}

async function notify(opts) {
  var _a, _b;
  try {
    await opts.conn.query(
      `INSERT IGNORE INTO notifications
         (stable_id, user_id, text, type, route, module, reference_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        opts.stableId,
        opts.userId,
        opts.text.slice(0, 499),
        opts.type,
        opts.route,
        (_a = opts.module) != null ? _a : null,
        (_b = opts.referenceId) != null ? _b : null
      ]
    );
  } catch {
  }
}
async function notifyAdmins(opts) {
  try {
    const [admins] = await opts.conn.query(
      `SELECT id FROM users WHERE role IN ('admin','superadmin') AND status = 'active'`
    ).catch(() => [[]]);
    for (const admin of admins) {
      await notify({ ...opts, userId: admin.id, stableId: `${opts.stableId}-u${admin.id}` });
    }
  } catch {
  }
}

const cache = /* @__PURE__ */ new Map();
const TTL_MS = 3 * 60 * 1e3;
function getCachedPerms(userId) {
  const entry = cache.get(userId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(userId);
    return null;
  }
  return entry.permissions;
}
function setCachedPerms(userId, permissions) {
  cache.set(userId, { permissions, expiresAt: Date.now() + TTL_MS });
}
function invalidatePermCache(userId) {
  cache.delete(userId);
}

async function recalcPO(conn, poId) {
  await conn.query(
    `UPDATE purchase_orders_adnan po
     SET
       total_received_qty   = COALESCE(
         (SELECT SUM(quantity_received_kg) FROM goods_received_adnan
          WHERE purchase_order_id = po.id AND grn_status != 'cancelled'), 0),
       total_received_value = COALESCE(
         (SELECT SUM(total_value) FROM goods_received_adnan
          WHERE purchase_order_id = po.id AND grn_status != 'cancelled'), 0),
       total_paid           = COALESCE(
         (SELECT SUM(amount_paid) FROM purchase_payments_adnan
          WHERE purchase_order_id = po.id), 0),
       balance_payable      = GREATEST(0, COALESCE(
         (SELECT SUM(total_value) FROM goods_received_adnan
          WHERE purchase_order_id = po.id AND grn_status != 'cancelled'), 0)
         - COALESCE(
         (SELECT SUM(amount_paid) FROM purchase_payments_adnan
          WHERE purchase_order_id = po.id), 0)),
       delivery_status      = CASE
         WHEN delivery_status = 'closed' THEN 'closed'
         WHEN COALESCE(
              (SELECT SUM(quantity_received_kg) FROM goods_received_adnan
               WHERE purchase_order_id = po.id AND grn_status != 'cancelled'), 0) <= 0
              THEN 'pending'
         WHEN COALESCE(
              (SELECT SUM(quantity_received_kg) FROM goods_received_adnan
               WHERE purchase_order_id = po.id AND grn_status != 'cancelled'), 0) < po.quantity_kg
              THEN 'partial'
         WHEN COALESCE(
              (SELECT SUM(quantity_received_kg) FROM goods_received_adnan
               WHERE purchase_order_id = po.id AND grn_status != 'cancelled'), 0) <= po.quantity_kg * 1.05
              THEN 'completed'
         ELSE 'over_received'
       END,
       payment_status       = CASE
         WHEN COALESCE(
              (SELECT SUM(amount_paid) FROM purchase_payments_adnan
               WHERE purchase_order_id = po.id), 0) <= 0
              THEN 'unpaid'
         WHEN COALESCE(
              (SELECT SUM(amount_paid) FROM purchase_payments_adnan
               WHERE purchase_order_id = po.id), 0) <
              COALESCE(
              (SELECT SUM(total_value) FROM goods_received_adnan
               WHERE purchase_order_id = po.id AND grn_status != 'cancelled'), 0)
              THEN 'partial'
         WHEN COALESCE(
              (SELECT SUM(amount_paid) FROM purchase_payments_adnan
               WHERE purchase_order_id = po.id), 0) >=
              COALESCE(
              (SELECT SUM(total_value) FROM goods_received_adnan
               WHERE purchase_order_id = po.id AND grn_status != 'cancelled'), 0)
              THEN 'paid'
         ELSE 'partial'
       END,
       updated_at           = NOW()
     WHERE po.id = ?`,
    [poId]
  );
}

const sessionHooks = createHooks();
async function getUserSession(event) {
  return (await _useSession(event)).data;
}
async function setUserSession(event, data, config) {
  const session = await _useSession(event, config);
  await session.update(defu(data, session.data));
  return session.data;
}
async function clearUserSession(event) {
  const session = await _useSession(event);
  await sessionHooks.callHookParallel("clear", session.data, event);
  await session.clear();
  return true;
}
let sessionConfig;
function _useSession(event, config = {}) {
  if (!sessionConfig) {
    const runtimeConfig = useRuntimeConfig(event);
    const envSessionPassword = `${runtimeConfig.nitro?.envPrefix || "NUXT_"}SESSION_PASSWORD`;
    sessionConfig = defu({ password: process.env[envSessionPassword] }, runtimeConfig.session);
  }
  const finalConfig = defu(config, sessionConfig);
  return useSession(event, finalConfig);
}

const FREE_PREFIXES = [
  "/api/auth/",
  "/api/me/",
  "/api/kiosk/",
  "/api/device/",
  "/api/verify/",
  // Public QR delivery scan endpoints — no auth required
  "/_nuxt/",
  "/__nuxt"
];
const PATH_MODULE_MAP = [
  { prefix: "/api/credit-sales", modules: ["credit_sales"] },
  { prefix: "/api/fleet", modules: ["fleet"] },
  { prefix: "/api/purchase", modules: ["purchase"] },
  { prefix: "/api/suppliers", modules: ["purchase"] },
  { prefix: "/api/expenses", modules: ["expenses"] },
  { prefix: "/api/bank", modules: ["bank"] },
  { prefix: "/api/accounts", modules: ["accounts"] },
  { prefix: "/api/sales", modules: ["sales"] },
  { prefix: "/api/production", modules: ["production"] },
  { prefix: "/api/collector", modules: ["collector"] },
  { prefix: "/api/logistics", modules: ["dispatch"] },
  { prefix: "/api/pos", modules: ["pos"] },
  { prefix: "/api/hr", modules: ["hr"] },
  { prefix: "/api/admin", modules: ["admin"] },
  { prefix: "/api/settings", modules: ["admin"] },
  // GETs exempted below — config reads are needed app-wide
  // NOTE: /api/notifications intentionally unmapped — endpoint scopes to the
  // logged-in user; the bell must work for every role.
  { prefix: "/api/dashboard", modules: ["dashboard"] },
  // Shared resources — accessible if the user has any module that legitimately needs them
  { prefix: "/api/customers", modules: ["credit_sales", "pos", "collector", "customers"] },
  { prefix: "/api/products", modules: ["credit_sales", "pos", "purchase", "production", "products"] }
];
const _IPFo7m = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const path = (_a = event.path) != null ? _a : "";
  if (!path.startsWith("/api/")) return;
  if (FREE_PREFIXES.some((p) => path.startsWith(p))) return;
  const session = await getUserSession(event);
  if (!((_b = session == null ? void 0 : session.user) == null ? void 0 : _b.id)) return;
  const role = ((_c = session.user.role) != null ? _c : "").toLowerCase();
  if (["admin", "superadmin"].includes(role)) return;
  if (path.startsWith("/api/settings") && event.method === "GET") return;
  const entry = PATH_MODULE_MAP.find((e) => path.startsWith(e.prefix));
  if (!entry) return;
  const userId = session.user.id;
  let permissions = getCachedPerms(userId);
  if (permissions === null) {
    try {
      const db = getDb();
      const conn = await db.getConnection();
      try {
        const [[row]] = await conn.query(
          "SELECT permissions FROM user_permissions WHERE user_id = ?",
          [userId]
        );
        permissions = {};
        if (row == null ? void 0 : row.permissions) {
          try {
            permissions = JSON.parse(row.permissions);
          } catch {
          }
        }
      } finally {
        conn.release();
      }
    } catch {
      permissions = {};
    }
    setCachedPerms(userId, permissions);
  }
  const hasAccess = entry.modules.some((m) => {
    var _a2;
    return ((_a2 = permissions[m]) == null ? void 0 : _a2.enabled) === true;
  });
  if (!hasAccess) {
    throw createError$1({
      statusCode: 403,
      statusMessage: `Access denied \u2014 module '${entry.modules[0]}' is not enabled for your account`
    });
  }
});

const _Oy89n1 = eventHandler(async (event) => {
  await clearUserSession(event);
  return { loggedOut: true };
});

const _W9A9_0 = eventHandler(async (event) => {
  const session = await getUserSession(event);
  if (session.user) {
    await sessionHooks.callHookParallel("fetch", session, event);
  }
  const { secure, ...data } = session;
  return data;
});

const _SxA8c9 = defineEventHandler(() => {});

const _lazy_Fe97__ = () => import('../routes/api/accounts/coa.get.mjs');
const _lazy_riUI4y = () => import('../routes/api/accounts/daily-log.get.mjs');
const _lazy_Ip5HZO = () => import('../routes/api/accounts/dashboard.get.mjs');
const _lazy_1qDgJI = () => import('../routes/api/accounts/journal.get.mjs');
const _lazy_OpekTI = () => import('../routes/api/accounts/journal.post.mjs');
const _lazy_hMd_YS = () => import('../routes/api/accounts/journal/_id_.delete.mjs');
const _lazy_459SU6 = () => import('../routes/api/accounts/journal/_id/reverse.post.mjs');
const _lazy_0lzoxt = () => import('../routes/api/accounts/statements.get.mjs');
const _lazy__AGdha = () => import('../routes/api/accounts/vouchers.get.mjs');
const _lazy_TWu8R9 = () => import('../routes/api/accounts/vouchers.post.mjs');
const _lazy__LZl1t = () => import('../routes/api/admin/audit-logs.get.mjs');
const _lazy_4nNUBp = () => import('../routes/api/admin/dashboard.get.mjs');
const _lazy_R2WSrk = () => import('../routes/api/admin/employees.get.mjs');
const _lazy_XlwqFl = () => import('../routes/api/admin/employees.post.mjs');
const _lazy_jsqb40 = () => import('../routes/api/admin/seed-expense-journals.post.mjs');
const _lazy_ZT5AYU = () => import('../routes/api/admin/users.get.mjs');
const _lazy_yb2_zi = () => import('../routes/api/admin/users.post.mjs');
const _lazy_eNgKZh = () => import('../routes/api/admin/users/_id_.delete.mjs');
const _lazy_zkCbC0 = () => import('../routes/api/admin/users/_id_.get.mjs');
const _lazy_Rtkg10 = () => import('../routes/api/admin/users/_id_.patch.mjs');
const _lazy_oao19V = () => import('../routes/api/admin/users/_id/permissions.get.mjs');
const _lazy_HDyapJ = () => import('../routes/api/admin/users/_id/permissions.put.mjs');
const _lazy_GOGoGM = () => import('../routes/api/auth/login.post.mjs');
const _lazy_D98jAM = () => import('../routes/api/auth/logout.post.mjs');
const _lazy_S5lKOv = () => import('../routes/api/auth/me.get.mjs');
const _lazy_lFuqih = () => import('../routes/api/bank-accounts.get.mjs');
const _lazy_YOUswc = () => import('../routes/api/bank/account-types.get.mjs');
const _lazy_wgsQqq = () => import('../routes/api/bank/accounts.post.mjs');
const _lazy_xFbBLO = () => import('../routes/api/bank/accounts/_id_.patch.mjs');
const _lazy_8GiNMM = () => import('../routes/api/bank/dashboard.get.mjs');
const _lazy_Qe6VsI = () => import('../routes/api/bank/gl-ledger.get.mjs');
const _lazy_eOUsS8 = () => import('../routes/api/bank/transaction-types/_id_.patch.mjs');
const _lazy_UYZKgl = () => import('../routes/api/bank/index.get.mjs');
const _lazy_yS6X56 = () => import('../routes/api/bank/index.post.mjs');
const _lazy_7F428h = () => import('../routes/api/bank/transactions/_id_.delete.mjs');
const _lazy_d4KynI = () => import('../routes/api/bank/transactions/_id_.get.mjs');
const _lazy__ue7Ll = () => import('../routes/api/bank/transactions/_id_.patch.mjs');
const _lazy_0qs2_a = () => import('../routes/api/bank/transactions/bulk.post.mjs');
const _lazy_wJleyC = () => import('../routes/api/bank/index.get2.mjs');
const _lazy_WGi3N9 = () => import('../routes/api/bank/index.post2.mjs');
const _lazy_1HBQXn = () => import('../routes/api/bank/transfer.post.mjs');
const _lazy_LI7zQS = () => import('../routes/api/bank/unified-ledger.get.mjs');
const _lazy_dbWO0f = () => import('../routes/api/branches.get.mjs');
const _lazy_Dmsgl1 = () => import('../routes/api/collector/collect.post.mjs');
const _lazy__w2iwx = () => import('../routes/api/collector/schedule.get.mjs');
const _lazy_4RXjT0 = () => import('../routes/api/credit-sales/_id_.delete.mjs');
const _lazy_bTiciI = () => import('../routes/api/credit-sales/_id_.get.mjs');
const _lazy_Nvf_LD = () => import('../routes/api/credit-sales/_id/deliver.post.mjs');
const _lazy_r935Lm = () => import('../routes/api/credit-sales/_id/payment.post.mjs');
const _lazy_6PzKYU = () => import('../routes/api/credit-sales/_id/return.post.mjs');
const _lazy_HhRfDu = () => import('../routes/api/credit-sales/_id/returns.get.mjs');
const _lazy_S8fogo = () => import('../routes/api/credit-sales/_id/workflow.post.mjs');
const _lazy_LvHlQ8 = () => import('../routes/api/credit-sales/ageing.get.mjs');
const _lazy_iLqkaJ = () => import('../routes/api/credit-sales/credit-limits.get.mjs');
const _lazy_SsPH3p = () => import('../routes/api/credit-sales/credit-limits.patch.mjs');
const _lazy_JfJGS6 = () => import('../routes/api/credit-sales/dispatch.get.mjs');
const _lazy_jTqAsf = () => import('../routes/api/index.get.mjs');
const _lazy_Bmlovq = () => import('../routes/api/index.post.mjs');
const _lazy_7wRNOq = () => import('../routes/api/credit-sales/ledger.get.mjs');
const _lazy_Xiu7kP = () => import('../routes/api/credit-sales/payments.get.mjs');
const _lazy_RrYPg4 = () => import('../routes/api/credit-sales/payments/reverse.post.mjs');
const _lazy_AZv5Ti = () => import('../routes/api/credit-sales/production-queue.get.mjs');
const _lazy_ic0vEj = () => import('../routes/api/credit-sales/production-queue/reorder.patch.mjs');
const _lazy_51WbFm = () => import('../routes/api/credit-sales/returns/index.delete.mjs');
const _lazy_YJ8ACN = () => import('../routes/api/credit-sales/returns/_returnId/status.patch.mjs');
const _lazy_ynvw5A = () => import('../routes/api/customers/_id_.get.mjs');
const _lazy_R3CrZB = () => import('../routes/api/customers/_id_.patch.mjs');
const _lazy_cA2yih = () => import('../routes/api/customers/_id/credit-exposure.get.mjs');
const _lazy_MA8PYW = () => import('../routes/api/index.get2.mjs');
const _lazy_uiriQK = () => import('../routes/api/index.post2.mjs');
const _lazy_YfO4V7 = () => import('../routes/api/dashboard/activity.get.mjs');
const _lazy_VpOmuS = () => import('../routes/api/dashboard/monthly-revenue.get.mjs');
const _lazy_knfzfj = () => import('../routes/api/dashboard/stats.get.mjs');
const _lazy_TvzntP = () => import('../routes/api/device/adms.mjs');
const _lazy_Wp6TH_ = () => import('../routes/api/expenses/_id_.delete.mjs');
const _lazy_kP_mAq = () => import('../routes/api/expenses/_id_.get.mjs');
const _lazy_6LOCAy = () => import('../routes/api/expenses/_id/approve.post.mjs');
const _lazy_hDaep0 = () => import('../routes/api/expenses/categories.get.mjs');
const _lazy_w3SXNT = () => import('../routes/api/expenses/categories.post.mjs');
const _lazy_2omFql = () => import('../routes/api/expenses/categories/_id_.patch.mjs');
const _lazy_NQB3hT = () => import('../routes/api/expenses/dashboard.get.mjs');
const _lazy_31Agz1 = () => import('../routes/api/index.get3.mjs');
const _lazy_MCTcez = () => import('../routes/api/index.post3.mjs');
const _lazy_TXnAPQ = () => import('../routes/api/expenses/petty-cash-accounts.get.mjs');
const _lazy_ff7tsb = () => import('../routes/api/expenses/subcategories.get.mjs');
const _lazy_NJxOMT = () => import('../routes/api/fleet/dashboard.get.mjs');
const _lazy_HzjYJ7 = () => import('../routes/api/fleet/drivers.get.mjs');
const _lazy_bVQlNR = () => import('../routes/api/fleet/drivers.post.mjs');
const _lazy_b_mrA9 = () => import('../routes/api/fleet/drivers/_id_.get.mjs');
const _lazy_4l5Qn9 = () => import('../routes/api/fleet/drivers/_id_.put.mjs');
const _lazy_jxx05X = () => import('../routes/api/fleet/fuel.get.mjs');
const _lazy_0rApCn = () => import('../routes/api/fleet/fuel.post.mjs');
const _lazy_ZkgCRN = () => import('../routes/api/fleet/fuel/efficiency.get.mjs');
const _lazy_mTA8Bv = () => import('../routes/api/fleet/items.get.mjs');
const _lazy_vAlW5w = () => import('../routes/api/fleet/items.post.mjs');
const _lazy_gdqXdz = () => import('../routes/api/fleet/maintenance.get.mjs');
const _lazy_xcWZHL = () => import('../routes/api/fleet/maintenance.post.mjs');
const _lazy_KZralw = () => import('../routes/api/fleet/maintenance/_id_.get.mjs');
const _lazy_rhRr3A = () => import('../routes/api/fleet/maintenance/_id_.patch.mjs');
const _lazy_TCAL_U = () => import('../routes/api/fleet/maintenance/rules.get.mjs');
const _lazy_mKvJKH = () => import('../routes/api/fleet/maintenance/rules.post.mjs');
const _lazy_NFcLp8 = () => import('../routes/api/fleet/maintenance/rules/_id_.delete.mjs');
const _lazy_pmpwZ4 = () => import('../routes/api/fleet/maintenance/rules/_id_.put.mjs');
const _lazy_KcSzvF = () => import('../routes/api/fleet/purchases.get.mjs');
const _lazy_MOxpcG = () => import('../routes/api/fleet/purchases.post.mjs');
const _lazy_pD0HlN = () => import('../routes/api/fleet/purchases/_id_.get.mjs');
const _lazy_VBvnEZ = () => import('../routes/api/fleet/purchases/_id_.patch.mjs');
const _lazy_94_5Fx = () => import('../routes/api/fleet/reports/drivers.get.mjs');
const _lazy_URfypq = () => import('../routes/api/fleet/reports/maintenance.get.mjs');
const _lazy_imTY17 = () => import('../routes/api/fleet/reports/pnl.get.mjs');
const _lazy_MUr2lK = () => import('../routes/api/fleet/reports/trips.get.mjs');
const _lazy_eLjU_4 = () => import('../routes/api/fleet/reports/vehicles.get.mjs');
const _lazy_SN6hHA = () => import('../routes/api/fleet/trips.get.mjs');
const _lazy_zwHKxS = () => import('../routes/api/fleet/trips.post.mjs');
const _lazy_jRGkRo = () => import('../routes/api/fleet/trips/_id_.get.mjs');
const _lazy_DOo6lb = () => import('../routes/api/fleet/trips/_id_.patch.mjs');
const _lazy_C2lvSy = () => import('../routes/api/fleet/vehicles.get.mjs');
const _lazy_CxlcjP = () => import('../routes/api/fleet/vehicles.post.mjs');
const _lazy_owOEk4 = () => import('../routes/api/fleet/vehicles/_id_.get.mjs');
const _lazy_j0OJys = () => import('../routes/api/fleet/vehicles/_id_.put.mjs');
const _lazy_JGqYru = () => import('../routes/api/hr/index.get.mjs');
const _lazy_5ksKCF = () => import('../routes/api/hr/index.post.mjs');
const _lazy_htZxxi = () => import('../routes/api/hr/assets.get.mjs');
const _lazy_R9wKNF = () => import('../routes/api/hr/index.get2.mjs');
const _lazy_Lazkzl = () => import('../routes/api/hr/index.post2.mjs');
const _lazy_IZIZRi = () => import('../routes/api/hr/biometric/face-list.get.mjs');
const _lazy_7pr6LV = () => import('../routes/api/hr/biometric/face-list.post.mjs');
const _lazy_9kjkhE = () => import('../routes/api/hr/index.get3.mjs');
const _lazy_VW5WdI = () => import('../routes/api/hr/index.post3.mjs');
const _lazy_llJ8Rd = () => import('../routes/api/hr/index.get4.mjs');
const _lazy_Hup4JX = () => import('../routes/api/hr/index.post4.mjs');
const _lazy_wtJlsa = () => import('../routes/api/hr/dashboard.get.mjs');
const _lazy_RBGg9u = () => import('../routes/api/hr/index.get5.mjs');
const _lazy_gKoV05 = () => import('../routes/api/hr/employees/_id_.get.mjs');
const _lazy_hKDuHh = () => import('../routes/api/hr/employees/_id_.photo.post.mjs');
const _lazy_49TLqa = () => import('../routes/api/hr/employees/_id_.post.mjs');
const _lazy_Ze0jdc = () => import('../routes/api/hr/employees/face.post.mjs');
const _lazy_EHH62G = () => import('../routes/api/hr/index.get6.mjs');
const _lazy_iaMmpE = () => import('../routes/api/hr/index.post5.mjs');
const _lazy_JIJbyv = () => import('../routes/api/hr/index.get7.mjs');
const _lazy_cVZYn1 = () => import('../routes/api/hr/index.post6.mjs');
const _lazy_XKhPnX = () => import('../routes/api/hr/index.get8.mjs');
const _lazy_GI8VjK = () => import('../routes/api/hr/index.post7.mjs');
const _lazy_h0hlbY = () => import('../routes/api/hr/index.get9.mjs');
const _lazy_WSgeZ7 = () => import('../routes/api/hr/index.post8.mjs');
const _lazy_s2U5Nv = () => import('../routes/api/hr/index.get10.mjs');
const _lazy_5qeIk_ = () => import('../routes/api/hr/index.post9.mjs');
const _lazy_N81KXP = () => import('../routes/api/hr/index.get11.mjs');
const _lazy_K9Ifb1 = () => import('../routes/api/hr/index.post10.mjs');
const _lazy_kT_Oz1 = () => import('../routes/api/hr/index.get12.mjs');
const _lazy_wnMG7Z = () => import('../routes/api/hr/index.get13.mjs');
const _lazy_8zGwgD = () => import('../routes/api/hr/index.post11.mjs');
const _lazy_pzHW9i = () => import('../routes/api/hr/index.get14.mjs');
const _lazy_61VNbg = () => import('../routes/api/hr/index.post12.mjs');
const _lazy_I__0cr = () => import('../routes/api/kiosk/clock-in.post.mjs');
const _lazy_luHNqw = () => import('../routes/api/kiosk/descriptors.get.mjs');
const _lazy_mNeFNc = () => import('../routes/api/kiosk/verify.post.mjs');
const _lazy_wQDE6w = () => import('../routes/api/logistics/drivers.get.mjs');
const _lazy_ddBfMx = () => import('../routes/api/logistics/drivers.post.mjs');
const _lazy_XIlJG_ = () => import('../routes/api/logistics/fuel.get.mjs');
const _lazy_1cMmVD = () => import('../routes/api/logistics/fuel.post.mjs');
const _lazy_PizAoU = () => import('../routes/api/logistics/maintenance.get.mjs');
const _lazy_KA8TRp = () => import('../routes/api/logistics/maintenance.post.mjs');
const _lazy_ORPw7D = () => import('../routes/api/logistics/trips.get.mjs');
const _lazy_uoH4Lw = () => import('../routes/api/logistics/trips.post.mjs');
const _lazy_w4Eqg6 = () => import('../routes/api/logistics/vehicles.get.mjs');
const _lazy_Ja3_LW = () => import('../routes/api/logistics/vehicles.post.mjs');
const _lazy_yl5N0H = () => import('../routes/api/lookup/bank-accounts.get.mjs');
const _lazy_I_aa0J = () => import('../routes/api/lookup/cash-accounts.get.mjs');
const _lazy_KxYYKF = () => import('../routes/api/lookup/employees.get.mjs');
const _lazy_tRqRC1 = () => import('../routes/api/me/permissions.get.mjs');
const _lazy_s_SSgo = () => import('../routes/api/notifications.get.mjs');
const _lazy_ROa0XS = () => import('../routes/api/pos/complete.post.mjs');
const _lazy_8KbvOw = () => import('../routes/api/pos/products.get.mjs');
const _lazy_1zvWiv = () => import('../routes/api/pos/today.get.mjs');
const _lazy_7rIu_E = () => import('../routes/api/positions.get.mjs');
const _lazy_OQ_2F0 = () => import('../routes/api/production/_id_.get.mjs');
const _lazy_KqcQ1r = () => import('../routes/api/production/_id_.patch.mjs');
const _lazy_kPQQ0a = () => import('../routes/api/index.get4.mjs');
const _lazy_usmPap = () => import('../routes/api/index.post4.mjs');
const _lazy_cVKdHK = () => import('../routes/api/products/base.get.mjs');
const _lazy_E8SIPx = () => import('../routes/api/products/base.post.mjs');
const _lazy_QUxQuf = () => import('../routes/api/products/base/_id_.delete.mjs');
const _lazy_iABFz4 = () => import('../routes/api/products/base/_id_.put.mjs');
const _lazy_JIlqRp = () => import('../routes/api/products/export/csv.get.mjs');
const _lazy_oKSIbI = () => import('../routes/api/products/hub.get.mjs');
const _lazy_SjH7cD = () => import('../routes/api/index.get5.mjs');
const _lazy_nYxeI6 = () => import('../routes/api/products/inventory.get.mjs');
const _lazy_DPwLId = () => import('../routes/api/products/pricing-engine.get.mjs');
const _lazy_Uy2SlM = () => import('../routes/api/products/pricing-engine.post.mjs');
const _lazy_uI7Ond = () => import('../routes/api/products/pricing.get.mjs');
const _lazy_PerWog = () => import('../routes/api/products/pricing.post.mjs');
const _lazy_bqRQIr = () => import('../routes/api/products/pricing/_variantId/archive.post.mjs');
const _lazy_EHuTIM = () => import('../routes/api/products/pricing/index.get.mjs');
const _lazy_q1CS76 = () => import('../routes/api/products/pricing/index.post.mjs');
const _lazy_fVQACU = () => import('../routes/api/products/pricing/history.get.mjs');
const _lazy_WtNgBq = () => import('../routes/api/products/variants.get.mjs');
const _lazy_P3mEsN = () => import('../routes/api/products/variants.post.mjs');
const _lazy_1ldj69 = () => import('../routes/api/products/variants/_id_.delete.mjs');
const _lazy_oUf_op = () => import('../routes/api/products/variants/_id_.put.mjs');
const _lazy_t4EWGv = () => import('../routes/api/purchase/adjustments.get.mjs');
const _lazy_NWb1BO = () => import('../routes/api/purchase/adjustments.post.mjs');
const _lazy_YbVCQg = () => import('../routes/api/purchase/adjustments/_id_.get.mjs');
const _lazy_KhFKQ0 = () => import('../routes/api/purchase/adjustments/_id_.patch.mjs');
const _lazy_vu2QbU = () => import('../routes/api/purchase/dashboard.get.mjs');
const _lazy_75UCbj = () => import('../routes/api/purchase/grn.get.mjs');
const _lazy_1KbopA = () => import('../routes/api/purchase/grn/_id_.delete.mjs');
const _lazy_xOoclb = () => import('../routes/api/purchase/grn/_id_.get.mjs');
const _lazy_7RLZTT = () => import('../routes/api/purchase/grn/_id_.patch.mjs');
const _lazy_dbQFku = () => import('../routes/api/purchase/index.post.mjs');
const _lazy_UPwVyp = () => import('../routes/api/purchase/grn/variance.get.mjs');
const _lazy_Vo88G_ = () => import('../routes/api/purchase/orders.get.mjs');
const _lazy_2XgpUz = () => import('../routes/api/purchase/orders/_id_.delete.mjs');
const _lazy_LKjbJn = () => import('../routes/api/purchase/orders/_id_.get.mjs');
const _lazy_Ew_vAd = () => import('../routes/api/purchase/orders/_id_.patch.mjs');
const _lazy_2fK7Ih = () => import('../routes/api/purchase/orders/_id/close.post.mjs');
const _lazy_2P6zPo = () => import('../routes/api/purchase/index.post2.mjs');
const _lazy_vuff2n = () => import('../routes/api/purchase/orders/open.get.mjs');
const _lazy_hiMPuv = () => import('../routes/api/purchase/payments.get.mjs');
const _lazy_xCnAIV = () => import('../routes/api/purchase/payments.post.mjs');
const _lazy_OfaqYi = () => import('../routes/api/purchase/payments/_id_.delete.mjs');
const _lazy_GhUqlx = () => import('../routes/api/purchase/payments/_id_.get.mjs');
const _lazy_DDID_k = () => import('../routes/api/purchase/payments/_id_.patch.mjs');
const _lazy_nN45ub = () => import('../routes/api/purchase/reconcile.get.mjs');
const _lazy_6_lvmN = () => import('../routes/api/purchase/suppliers/_id_.patch.mjs');
const _lazy_30ucpN = () => import('../routes/api/purchase/suppliers/_id/credit.get.mjs');
const _lazy_m0WrUr = () => import('../routes/api/purchase/suppliers/_id/ledger.get.mjs');
const _lazy_pzWsHN = () => import('../routes/api/purchase/index.post3.mjs');
const _lazy_LYnZXE = () => import('../routes/api/purchase/suppliers/summary.get.mjs');
const _lazy_zwxdbZ = () => import('../routes/api/sales/dashboard.get.mjs');
const _lazy_ZCBnco = () => import('../routes/api/settings/delivery.get.mjs');
const _lazy_Ork_6h = () => import('../routes/api/settings/delivery.put.mjs');
const _lazy_l9ZXLd = () => import('../routes/api/settings/documents.get.mjs');
const _lazy_QE_mkM = () => import('../routes/api/settings/documents.put.mjs');
const _lazy_3YOaFH = () => import('../routes/api/index.get6.mjs');
const _lazy_LUII98 = () => import('../routes/api/verify/_order_.get.mjs');
const _lazy_Sz64Ez = () => import('../routes/api/verify/_order/confirm.post.mjs');
const _lazy_537Ql6 = () => import('../routes/api/verify/_order/deliver.post.mjs');
const _lazy_sQuoFK = () => import('../routes/api/verify/can-deliver.get.mjs');
const _lazy_fz2BBz = () => import('../routes/renderer.mjs').then(function (n) { return n.r; });

const handlers = [
  { route: '', handler: _6tTLGT, lazy: false, middleware: true, method: undefined },
  { route: '', handler: _IPFo7m, lazy: false, middleware: true, method: undefined },
  { route: '/api/accounts/coa', handler: _lazy_Fe97__, lazy: true, middleware: false, method: "get" },
  { route: '/api/accounts/daily-log', handler: _lazy_riUI4y, lazy: true, middleware: false, method: "get" },
  { route: '/api/accounts/dashboard', handler: _lazy_Ip5HZO, lazy: true, middleware: false, method: "get" },
  { route: '/api/accounts/journal', handler: _lazy_1qDgJI, lazy: true, middleware: false, method: "get" },
  { route: '/api/accounts/journal', handler: _lazy_OpekTI, lazy: true, middleware: false, method: "post" },
  { route: '/api/accounts/journal/:id', handler: _lazy_hMd_YS, lazy: true, middleware: false, method: "delete" },
  { route: '/api/accounts/journal/:id/reverse', handler: _lazy_459SU6, lazy: true, middleware: false, method: "post" },
  { route: '/api/accounts/statements', handler: _lazy_0lzoxt, lazy: true, middleware: false, method: "get" },
  { route: '/api/accounts/vouchers', handler: _lazy__AGdha, lazy: true, middleware: false, method: "get" },
  { route: '/api/accounts/vouchers', handler: _lazy_TWu8R9, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/audit-logs', handler: _lazy__LZl1t, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/dashboard', handler: _lazy_4nNUBp, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/employees', handler: _lazy_R2WSrk, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/employees', handler: _lazy_XlwqFl, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/seed-expense-journals', handler: _lazy_jsqb40, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/users', handler: _lazy_ZT5AYU, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/users', handler: _lazy_yb2_zi, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/users/:id', handler: _lazy_eNgKZh, lazy: true, middleware: false, method: "delete" },
  { route: '/api/admin/users/:id', handler: _lazy_zkCbC0, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/users/:id', handler: _lazy_Rtkg10, lazy: true, middleware: false, method: "patch" },
  { route: '/api/admin/users/:id/permissions', handler: _lazy_oao19V, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/users/:id/permissions', handler: _lazy_HDyapJ, lazy: true, middleware: false, method: "put" },
  { route: '/api/auth/login', handler: _lazy_GOGoGM, lazy: true, middleware: false, method: "post" },
  { route: '/api/auth/logout', handler: _lazy_D98jAM, lazy: true, middleware: false, method: "post" },
  { route: '/api/auth/me', handler: _lazy_S5lKOv, lazy: true, middleware: false, method: "get" },
  { route: '/api/bank-accounts', handler: _lazy_lFuqih, lazy: true, middleware: false, method: "get" },
  { route: '/api/bank/account-types', handler: _lazy_YOUswc, lazy: true, middleware: false, method: "get" },
  { route: '/api/bank/accounts', handler: _lazy_wgsQqq, lazy: true, middleware: false, method: "post" },
  { route: '/api/bank/accounts/:id', handler: _lazy_xFbBLO, lazy: true, middleware: false, method: "patch" },
  { route: '/api/bank/dashboard', handler: _lazy_8GiNMM, lazy: true, middleware: false, method: "get" },
  { route: '/api/bank/gl-ledger', handler: _lazy_Qe6VsI, lazy: true, middleware: false, method: "get" },
  { route: '/api/bank/transaction-types/:id', handler: _lazy_eOUsS8, lazy: true, middleware: false, method: "patch" },
  { route: '/api/bank/transaction-types', handler: _lazy_UYZKgl, lazy: true, middleware: false, method: "get" },
  { route: '/api/bank/transaction-types', handler: _lazy_yS6X56, lazy: true, middleware: false, method: "post" },
  { route: '/api/bank/transactions/:id', handler: _lazy_7F428h, lazy: true, middleware: false, method: "delete" },
  { route: '/api/bank/transactions/:id', handler: _lazy_d4KynI, lazy: true, middleware: false, method: "get" },
  { route: '/api/bank/transactions/:id', handler: _lazy__ue7Ll, lazy: true, middleware: false, method: "patch" },
  { route: '/api/bank/transactions/bulk', handler: _lazy_0qs2_a, lazy: true, middleware: false, method: "post" },
  { route: '/api/bank/transactions', handler: _lazy_wJleyC, lazy: true, middleware: false, method: "get" },
  { route: '/api/bank/transactions', handler: _lazy_WGi3N9, lazy: true, middleware: false, method: "post" },
  { route: '/api/bank/transfer', handler: _lazy_1HBQXn, lazy: true, middleware: false, method: "post" },
  { route: '/api/bank/unified-ledger', handler: _lazy_LI7zQS, lazy: true, middleware: false, method: "get" },
  { route: '/api/branches', handler: _lazy_dbWO0f, lazy: true, middleware: false, method: "get" },
  { route: '/api/collector/collect', handler: _lazy_Dmsgl1, lazy: true, middleware: false, method: "post" },
  { route: '/api/collector/schedule', handler: _lazy__w2iwx, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/:id', handler: _lazy_4RXjT0, lazy: true, middleware: false, method: "delete" },
  { route: '/api/credit-sales/:id', handler: _lazy_bTiciI, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/:id/deliver', handler: _lazy_Nvf_LD, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/:id/payment', handler: _lazy_r935Lm, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/:id/return', handler: _lazy_6PzKYU, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/:id/returns', handler: _lazy_HhRfDu, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/:id/workflow', handler: _lazy_S8fogo, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/ageing', handler: _lazy_LvHlQ8, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/credit-limits', handler: _lazy_iLqkaJ, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/credit-limits', handler: _lazy_SsPH3p, lazy: true, middleware: false, method: "patch" },
  { route: '/api/credit-sales/dispatch', handler: _lazy_JfJGS6, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales', handler: _lazy_jTqAsf, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales', handler: _lazy_Bmlovq, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/ledger', handler: _lazy_7wRNOq, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/payments', handler: _lazy_Xiu7kP, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/payments/reverse', handler: _lazy_RrYPg4, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/production-queue', handler: _lazy_AZv5Ti, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/production-queue/reorder', handler: _lazy_ic0vEj, lazy: true, middleware: false, method: "patch" },
  { route: '/api/credit-sales/returns/:returnId', handler: _lazy_51WbFm, lazy: true, middleware: false, method: "delete" },
  { route: '/api/credit-sales/returns/:returnId/status', handler: _lazy_YJ8ACN, lazy: true, middleware: false, method: "patch" },
  { route: '/api/customers/:id', handler: _lazy_ynvw5A, lazy: true, middleware: false, method: "get" },
  { route: '/api/customers/:id', handler: _lazy_R3CrZB, lazy: true, middleware: false, method: "patch" },
  { route: '/api/customers/:id/credit-exposure', handler: _lazy_cA2yih, lazy: true, middleware: false, method: "get" },
  { route: '/api/customers', handler: _lazy_MA8PYW, lazy: true, middleware: false, method: "get" },
  { route: '/api/customers', handler: _lazy_uiriQK, lazy: true, middleware: false, method: "post" },
  { route: '/api/dashboard/activity', handler: _lazy_YfO4V7, lazy: true, middleware: false, method: "get" },
  { route: '/api/dashboard/monthly-revenue', handler: _lazy_VpOmuS, lazy: true, middleware: false, method: "get" },
  { route: '/api/dashboard/stats', handler: _lazy_knfzfj, lazy: true, middleware: false, method: "get" },
  { route: '/api/device/adms', handler: _lazy_TvzntP, lazy: true, middleware: false, method: undefined },
  { route: '/api/expenses/:id', handler: _lazy_Wp6TH_, lazy: true, middleware: false, method: "delete" },
  { route: '/api/expenses/:id', handler: _lazy_kP_mAq, lazy: true, middleware: false, method: "get" },
  { route: '/api/expenses/:id/approve', handler: _lazy_6LOCAy, lazy: true, middleware: false, method: "post" },
  { route: '/api/expenses/categories', handler: _lazy_hDaep0, lazy: true, middleware: false, method: "get" },
  { route: '/api/expenses/categories', handler: _lazy_w3SXNT, lazy: true, middleware: false, method: "post" },
  { route: '/api/expenses/categories/:id', handler: _lazy_2omFql, lazy: true, middleware: false, method: "patch" },
  { route: '/api/expenses/dashboard', handler: _lazy_NQB3hT, lazy: true, middleware: false, method: "get" },
  { route: '/api/expenses', handler: _lazy_31Agz1, lazy: true, middleware: false, method: "get" },
  { route: '/api/expenses', handler: _lazy_MCTcez, lazy: true, middleware: false, method: "post" },
  { route: '/api/expenses/petty-cash-accounts', handler: _lazy_TXnAPQ, lazy: true, middleware: false, method: "get" },
  { route: '/api/expenses/subcategories', handler: _lazy_ff7tsb, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/dashboard', handler: _lazy_NJxOMT, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/drivers', handler: _lazy_HzjYJ7, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/drivers', handler: _lazy_bVQlNR, lazy: true, middleware: false, method: "post" },
  { route: '/api/fleet/drivers/:id', handler: _lazy_b_mrA9, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/drivers/:id', handler: _lazy_4l5Qn9, lazy: true, middleware: false, method: "put" },
  { route: '/api/fleet/fuel', handler: _lazy_jxx05X, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/fuel', handler: _lazy_0rApCn, lazy: true, middleware: false, method: "post" },
  { route: '/api/fleet/fuel/efficiency', handler: _lazy_ZkgCRN, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/items', handler: _lazy_mTA8Bv, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/items', handler: _lazy_vAlW5w, lazy: true, middleware: false, method: "post" },
  { route: '/api/fleet/maintenance', handler: _lazy_gdqXdz, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/maintenance', handler: _lazy_xcWZHL, lazy: true, middleware: false, method: "post" },
  { route: '/api/fleet/maintenance/:id', handler: _lazy_KZralw, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/maintenance/:id', handler: _lazy_rhRr3A, lazy: true, middleware: false, method: "patch" },
  { route: '/api/fleet/maintenance/rules', handler: _lazy_TCAL_U, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/maintenance/rules', handler: _lazy_mKvJKH, lazy: true, middleware: false, method: "post" },
  { route: '/api/fleet/maintenance/rules/:id', handler: _lazy_NFcLp8, lazy: true, middleware: false, method: "delete" },
  { route: '/api/fleet/maintenance/rules/:id', handler: _lazy_pmpwZ4, lazy: true, middleware: false, method: "put" },
  { route: '/api/fleet/purchases', handler: _lazy_KcSzvF, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/purchases', handler: _lazy_MOxpcG, lazy: true, middleware: false, method: "post" },
  { route: '/api/fleet/purchases/:id', handler: _lazy_pD0HlN, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/purchases/:id', handler: _lazy_VBvnEZ, lazy: true, middleware: false, method: "patch" },
  { route: '/api/fleet/reports/drivers', handler: _lazy_94_5Fx, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/reports/maintenance', handler: _lazy_URfypq, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/reports/pnl', handler: _lazy_imTY17, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/reports/trips', handler: _lazy_MUr2lK, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/reports/vehicles', handler: _lazy_eLjU_4, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/trips', handler: _lazy_SN6hHA, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/trips', handler: _lazy_zwHKxS, lazy: true, middleware: false, method: "post" },
  { route: '/api/fleet/trips/:id', handler: _lazy_jRGkRo, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/trips/:id', handler: _lazy_DOo6lb, lazy: true, middleware: false, method: "patch" },
  { route: '/api/fleet/vehicles', handler: _lazy_C2lvSy, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/vehicles', handler: _lazy_CxlcjP, lazy: true, middleware: false, method: "post" },
  { route: '/api/fleet/vehicles/:id', handler: _lazy_owOEk4, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/vehicles/:id', handler: _lazy_j0OJys, lazy: true, middleware: false, method: "put" },
  { route: '/api/hr/advances', handler: _lazy_JGqYru, lazy: true, middleware: false, method: "get" },
  { route: '/api/hr/advances', handler: _lazy_5ksKCF, lazy: true, middleware: false, method: "post" },
  { route: '/api/hr/assets', handler: _lazy_htZxxi, lazy: true, middleware: false, method: "get" },
  { route: '/api/hr/attendance', handler: _lazy_R9wKNF, lazy: true, middleware: false, method: "get" },
  { route: '/api/hr/attendance', handler: _lazy_Lazkzl, lazy: true, middleware: false, method: "post" },
  { route: '/api/hr/biometric/face-list', handler: _lazy_IZIZRi, lazy: true, middleware: false, method: "get" },
  { route: '/api/hr/biometric/face-list', handler: _lazy_7pr6LV, lazy: true, middleware: false, method: "post" },
  { route: '/api/hr/biometric', handler: _lazy_9kjkhE, lazy: true, middleware: false, method: "get" },
  { route: '/api/hr/biometric', handler: _lazy_VW5WdI, lazy: true, middleware: false, method: "post" },
  { route: '/api/hr/bonuses', handler: _lazy_llJ8Rd, lazy: true, middleware: false, method: "get" },
  { route: '/api/hr/bonuses', handler: _lazy_Hup4JX, lazy: true, middleware: false, method: "post" },
  { route: '/api/hr/dashboard', handler: _lazy_wtJlsa, lazy: true, middleware: false, method: "get" },
  { route: '/api/hr/departments', handler: _lazy_RBGg9u, lazy: true, middleware: false, method: "get" },
  { route: '/api/hr/employees/:id', handler: _lazy_gKoV05, lazy: true, middleware: false, method: "get" },
  { route: '/api/hr/employees/:id.photo', handler: _lazy_hKDuHh, lazy: true, middleware: false, method: "post" },
  { route: '/api/hr/employees/:id', handler: _lazy_49TLqa, lazy: true, middleware: false, method: "post" },
  { route: '/api/hr/employees/face', handler: _lazy_Ze0jdc, lazy: true, middleware: false, method: "post" },
  { route: '/api/hr/employees', handler: _lazy_EHH62G, lazy: true, middleware: false, method: "get" },
  { route: '/api/hr/employees', handler: _lazy_iaMmpE, lazy: true, middleware: false, method: "post" },
  { route: '/api/hr/holidays', handler: _lazy_JIJbyv, lazy: true, middleware: false, method: "get" },
  { route: '/api/hr/holidays', handler: _lazy_cVZYn1, lazy: true, middleware: false, method: "post" },
  { route: '/api/hr/leave-requests', handler: _lazy_XKhPnX, lazy: true, middleware: false, method: "get" },
  { route: '/api/hr/leave-requests', handler: _lazy_GI8VjK, lazy: true, middleware: false, method: "post" },
  { route: '/api/hr/loans', handler: _lazy_h0hlbY, lazy: true, middleware: false, method: "get" },
  { route: '/api/hr/loans', handler: _lazy_WSgeZ7, lazy: true, middleware: false, method: "post" },
  { route: '/api/hr/overtime', handler: _lazy_s2U5Nv, lazy: true, middleware: false, method: "get" },
  { route: '/api/hr/overtime', handler: _lazy_5qeIk_, lazy: true, middleware: false, method: "post" },
  { route: '/api/hr/payroll', handler: _lazy_N81KXP, lazy: true, middleware: false, method: "get" },
  { route: '/api/hr/payroll', handler: _lazy_K9Ifb1, lazy: true, middleware: false, method: "post" },
  { route: '/api/hr/positions', handler: _lazy_kT_Oz1, lazy: true, middleware: false, method: "get" },
  { route: '/api/hr/salary-structure', handler: _lazy_wnMG7Z, lazy: true, middleware: false, method: "get" },
  { route: '/api/hr/salary-structure', handler: _lazy_8zGwgD, lazy: true, middleware: false, method: "post" },
  { route: '/api/hr/settings', handler: _lazy_pzHW9i, lazy: true, middleware: false, method: "get" },
  { route: '/api/hr/settings', handler: _lazy_61VNbg, lazy: true, middleware: false, method: "post" },
  { route: '/api/kiosk/clock-in', handler: _lazy_I__0cr, lazy: true, middleware: false, method: "post" },
  { route: '/api/kiosk/descriptors', handler: _lazy_luHNqw, lazy: true, middleware: false, method: "get" },
  { route: '/api/kiosk/verify', handler: _lazy_mNeFNc, lazy: true, middleware: false, method: "post" },
  { route: '/api/logistics/drivers', handler: _lazy_wQDE6w, lazy: true, middleware: false, method: "get" },
  { route: '/api/logistics/drivers', handler: _lazy_ddBfMx, lazy: true, middleware: false, method: "post" },
  { route: '/api/logistics/fuel', handler: _lazy_XIlJG_, lazy: true, middleware: false, method: "get" },
  { route: '/api/logistics/fuel', handler: _lazy_1cMmVD, lazy: true, middleware: false, method: "post" },
  { route: '/api/logistics/maintenance', handler: _lazy_PizAoU, lazy: true, middleware: false, method: "get" },
  { route: '/api/logistics/maintenance', handler: _lazy_KA8TRp, lazy: true, middleware: false, method: "post" },
  { route: '/api/logistics/trips', handler: _lazy_ORPw7D, lazy: true, middleware: false, method: "get" },
  { route: '/api/logistics/trips', handler: _lazy_uoH4Lw, lazy: true, middleware: false, method: "post" },
  { route: '/api/logistics/vehicles', handler: _lazy_w4Eqg6, lazy: true, middleware: false, method: "get" },
  { route: '/api/logistics/vehicles', handler: _lazy_Ja3_LW, lazy: true, middleware: false, method: "post" },
  { route: '/api/lookup/bank-accounts', handler: _lazy_yl5N0H, lazy: true, middleware: false, method: "get" },
  { route: '/api/lookup/cash-accounts', handler: _lazy_I_aa0J, lazy: true, middleware: false, method: "get" },
  { route: '/api/lookup/employees', handler: _lazy_KxYYKF, lazy: true, middleware: false, method: "get" },
  { route: '/api/me/permissions', handler: _lazy_tRqRC1, lazy: true, middleware: false, method: "get" },
  { route: '/api/notifications', handler: _lazy_s_SSgo, lazy: true, middleware: false, method: "get" },
  { route: '/api/pos/complete', handler: _lazy_ROa0XS, lazy: true, middleware: false, method: "post" },
  { route: '/api/pos/products', handler: _lazy_8KbvOw, lazy: true, middleware: false, method: "get" },
  { route: '/api/pos/today', handler: _lazy_1zvWiv, lazy: true, middleware: false, method: "get" },
  { route: '/api/positions', handler: _lazy_7rIu_E, lazy: true, middleware: false, method: "get" },
  { route: '/api/production/:id', handler: _lazy_OQ_2F0, lazy: true, middleware: false, method: "get" },
  { route: '/api/production/:id', handler: _lazy_KqcQ1r, lazy: true, middleware: false, method: "patch" },
  { route: '/api/production', handler: _lazy_kPQQ0a, lazy: true, middleware: false, method: "get" },
  { route: '/api/production', handler: _lazy_usmPap, lazy: true, middleware: false, method: "post" },
  { route: '/api/products/base', handler: _lazy_cVKdHK, lazy: true, middleware: false, method: "get" },
  { route: '/api/products/base', handler: _lazy_E8SIPx, lazy: true, middleware: false, method: "post" },
  { route: '/api/products/base/:id', handler: _lazy_QUxQuf, lazy: true, middleware: false, method: "delete" },
  { route: '/api/products/base/:id', handler: _lazy_iABFz4, lazy: true, middleware: false, method: "put" },
  { route: '/api/products/export/csv', handler: _lazy_JIlqRp, lazy: true, middleware: false, method: "get" },
  { route: '/api/products/hub', handler: _lazy_oKSIbI, lazy: true, middleware: false, method: "get" },
  { route: '/api/products', handler: _lazy_SjH7cD, lazy: true, middleware: false, method: "get" },
  { route: '/api/products/inventory', handler: _lazy_nYxeI6, lazy: true, middleware: false, method: "get" },
  { route: '/api/products/pricing-engine', handler: _lazy_DPwLId, lazy: true, middleware: false, method: "get" },
  { route: '/api/products/pricing-engine', handler: _lazy_Uy2SlM, lazy: true, middleware: false, method: "post" },
  { route: '/api/products/pricing', handler: _lazy_uI7Ond, lazy: true, middleware: false, method: "get" },
  { route: '/api/products/pricing', handler: _lazy_PerWog, lazy: true, middleware: false, method: "post" },
  { route: '/api/products/pricing/:variantId/archive', handler: _lazy_bqRQIr, lazy: true, middleware: false, method: "post" },
  { route: '/api/products/pricing/:variantId', handler: _lazy_EHuTIM, lazy: true, middleware: false, method: "get" },
  { route: '/api/products/pricing/:variantId', handler: _lazy_q1CS76, lazy: true, middleware: false, method: "post" },
  { route: '/api/products/pricing/history', handler: _lazy_fVQACU, lazy: true, middleware: false, method: "get" },
  { route: '/api/products/variants', handler: _lazy_WtNgBq, lazy: true, middleware: false, method: "get" },
  { route: '/api/products/variants', handler: _lazy_P3mEsN, lazy: true, middleware: false, method: "post" },
  { route: '/api/products/variants/:id', handler: _lazy_1ldj69, lazy: true, middleware: false, method: "delete" },
  { route: '/api/products/variants/:id', handler: _lazy_oUf_op, lazy: true, middleware: false, method: "put" },
  { route: '/api/purchase/adjustments', handler: _lazy_t4EWGv, lazy: true, middleware: false, method: "get" },
  { route: '/api/purchase/adjustments', handler: _lazy_NWb1BO, lazy: true, middleware: false, method: "post" },
  { route: '/api/purchase/adjustments/:id', handler: _lazy_YbVCQg, lazy: true, middleware: false, method: "get" },
  { route: '/api/purchase/adjustments/:id', handler: _lazy_KhFKQ0, lazy: true, middleware: false, method: "patch" },
  { route: '/api/purchase/dashboard', handler: _lazy_vu2QbU, lazy: true, middleware: false, method: "get" },
  { route: '/api/purchase/grn', handler: _lazy_75UCbj, lazy: true, middleware: false, method: "get" },
  { route: '/api/purchase/grn/:id', handler: _lazy_1KbopA, lazy: true, middleware: false, method: "delete" },
  { route: '/api/purchase/grn/:id', handler: _lazy_xOoclb, lazy: true, middleware: false, method: "get" },
  { route: '/api/purchase/grn/:id', handler: _lazy_7RLZTT, lazy: true, middleware: false, method: "patch" },
  { route: '/api/purchase/grn', handler: _lazy_dbQFku, lazy: true, middleware: false, method: "post" },
  { route: '/api/purchase/grn/variance', handler: _lazy_UPwVyp, lazy: true, middleware: false, method: "get" },
  { route: '/api/purchase/orders', handler: _lazy_Vo88G_, lazy: true, middleware: false, method: "get" },
  { route: '/api/purchase/orders/:id', handler: _lazy_2XgpUz, lazy: true, middleware: false, method: "delete" },
  { route: '/api/purchase/orders/:id', handler: _lazy_LKjbJn, lazy: true, middleware: false, method: "get" },
  { route: '/api/purchase/orders/:id', handler: _lazy_Ew_vAd, lazy: true, middleware: false, method: "patch" },
  { route: '/api/purchase/orders/:id/close', handler: _lazy_2fK7Ih, lazy: true, middleware: false, method: "post" },
  { route: '/api/purchase/orders', handler: _lazy_2P6zPo, lazy: true, middleware: false, method: "post" },
  { route: '/api/purchase/orders/open', handler: _lazy_vuff2n, lazy: true, middleware: false, method: "get" },
  { route: '/api/purchase/payments', handler: _lazy_hiMPuv, lazy: true, middleware: false, method: "get" },
  { route: '/api/purchase/payments', handler: _lazy_xCnAIV, lazy: true, middleware: false, method: "post" },
  { route: '/api/purchase/payments/:id', handler: _lazy_OfaqYi, lazy: true, middleware: false, method: "delete" },
  { route: '/api/purchase/payments/:id', handler: _lazy_GhUqlx, lazy: true, middleware: false, method: "get" },
  { route: '/api/purchase/payments/:id', handler: _lazy_DDID_k, lazy: true, middleware: false, method: "patch" },
  { route: '/api/purchase/reconcile', handler: _lazy_nN45ub, lazy: true, middleware: false, method: "get" },
  { route: '/api/purchase/suppliers/:id', handler: _lazy_6_lvmN, lazy: true, middleware: false, method: "patch" },
  { route: '/api/purchase/suppliers/:id/credit', handler: _lazy_30ucpN, lazy: true, middleware: false, method: "get" },
  { route: '/api/purchase/suppliers/:id/ledger', handler: _lazy_m0WrUr, lazy: true, middleware: false, method: "get" },
  { route: '/api/purchase/suppliers', handler: _lazy_pzWsHN, lazy: true, middleware: false, method: "post" },
  { route: '/api/purchase/suppliers/summary', handler: _lazy_LYnZXE, lazy: true, middleware: false, method: "get" },
  { route: '/api/sales/dashboard', handler: _lazy_zwxdbZ, lazy: true, middleware: false, method: "get" },
  { route: '/api/settings/delivery', handler: _lazy_ZCBnco, lazy: true, middleware: false, method: "get" },
  { route: '/api/settings/delivery', handler: _lazy_Ork_6h, lazy: true, middleware: false, method: "put" },
  { route: '/api/settings/documents', handler: _lazy_l9ZXLd, lazy: true, middleware: false, method: "get" },
  { route: '/api/settings/documents', handler: _lazy_QE_mkM, lazy: true, middleware: false, method: "put" },
  { route: '/api/suppliers', handler: _lazy_3YOaFH, lazy: true, middleware: false, method: "get" },
  { route: '/api/verify/:order', handler: _lazy_LUII98, lazy: true, middleware: false, method: "get" },
  { route: '/api/verify/:order/confirm', handler: _lazy_Sz64Ez, lazy: true, middleware: false, method: "post" },
  { route: '/api/verify/:order/deliver', handler: _lazy_537Ql6, lazy: true, middleware: false, method: "post" },
  { route: '/api/verify/can-deliver', handler: _lazy_sQuoFK, lazy: true, middleware: false, method: "get" },
  { route: '/__nuxt_error', handler: _lazy_fz2BBz, lazy: true, middleware: false, method: undefined },
  { route: '/api/_auth/session', handler: _Oy89n1, lazy: false, middleware: false, method: "delete" },
  { route: '/api/_auth/session', handler: _W9A9_0, lazy: false, middleware: false, method: "get" },
  { route: '/__nuxt_island/**', handler: _SxA8c9, lazy: false, middleware: false, method: undefined },
  { route: '/**', handler: _lazy_fz2BBz, lazy: true, middleware: false, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const captureError = (error, context = {}) => {
    const promise = hooks.callHookParallel("error", error, context).catch((error_) => {
      console.error("Error while capturing another error", error_);
    });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };
  const h3App = createApp({
    debug: destr(false),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    },
    onRequest: async (event) => {
      event.context.nitro = event.context.nitro || { errors: [] };
      const fetchContext = event.node.req?.__unenv__;
      if (fetchContext?._platform) {
        event.context = {
          _platform: fetchContext?._platform,
          // #3335
          ...fetchContext._platform,
          ...event.context
        };
      }
      if (!event.context.waitUntil && fetchContext?.waitUntil) {
        event.context.waitUntil = fetchContext.waitUntil;
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, {
        fetch: $fetch
      });
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (event.context.waitUntil) {
          event.context.waitUntil(promise);
        }
      };
      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
      await nitroApp$1.hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("beforeResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    },
    onAfterResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("afterResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    }
  });
  const router = createRouter({
    preemptive: true
  });
  const nodeHandler = toNodeListener(h3App);
  const localCall = (aRequest) => b(
    nodeHandler,
    aRequest
  );
  const localFetch = (input, init) => {
    if (!input.toString().startsWith("/")) {
      return globalThis.fetch(input, init);
    }
    return C(
      nodeHandler,
      input,
      init
    ).then((response) => normalizeFetchResponse(response));
  };
  const $fetch = createFetch({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(createRouteRulesHandler({ localFetch }));
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router.handler);
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  };
  return app;
}
function runNitroPlugins(nitroApp2) {
  for (const plugin of plugins) {
    try {
      plugin(nitroApp2);
    } catch (error) {
      nitroApp2.captureError(error, { tags: ["plugin"] });
      throw error;
    }
  }
}
const nitroApp$1 = createNitroApp();
function useNitroApp() {
  return nitroApp$1;
}
runNitroPlugins(nitroApp$1);

const debug = (...args) => {
};
function GracefulShutdown(server, opts) {
  opts = opts || {};
  const options = Object.assign(
    {
      signals: "SIGINT SIGTERM",
      timeout: 3e4,
      development: false,
      forceExit: true,
      onShutdown: (signal) => Promise.resolve(signal),
      preShutdown: (signal) => Promise.resolve(signal)
    },
    opts
  );
  let isShuttingDown = false;
  const connections = {};
  let connectionCounter = 0;
  const secureConnections = {};
  let secureConnectionCounter = 0;
  let failed = false;
  let finalRun = false;
  function onceFactory() {
    let called = false;
    return (emitter, events, callback) => {
      function call() {
        if (!called) {
          called = true;
          return Reflect.apply(callback, this, arguments);
        }
      }
      for (const e of events) {
        emitter.on(e, call);
      }
    };
  }
  const signals = options.signals.split(" ").map((s) => s.trim()).filter((s) => s.length > 0);
  const once = onceFactory();
  once(process, signals, (signal) => {
    debug("received shut down signal", signal);
    shutdown(signal).then(() => {
      if (options.forceExit) {
        process.exit(failed ? 1 : 0);
      }
    }).catch((error) => {
      debug("server shut down error occurred", error);
      process.exit(1);
    });
  });
  function isFunction(functionToCheck) {
    const getType = Object.prototype.toString.call(functionToCheck);
    return /^\[object\s([A-Za-z]+)?Function]$/.test(getType);
  }
  function destroy(socket, force = false) {
    if (socket._isIdle && isShuttingDown || force) {
      socket.destroy();
      if (socket.server instanceof http.Server) {
        delete connections[socket._connectionId];
      } else {
        delete secureConnections[socket._connectionId];
      }
    }
  }
  function destroyAllConnections(force = false) {
    debug("Destroy Connections : " + (force ? "forced close" : "close"));
    let counter = 0;
    let secureCounter = 0;
    for (const key of Object.keys(connections)) {
      const socket = connections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        counter++;
        destroy(socket);
      }
    }
    debug("Connections destroyed : " + counter);
    debug("Connection Counter    : " + connectionCounter);
    for (const key of Object.keys(secureConnections)) {
      const socket = secureConnections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        secureCounter++;
        destroy(socket);
      }
    }
    debug("Secure Connections destroyed : " + secureCounter);
    debug("Secure Connection Counter    : " + secureConnectionCounter);
  }
  server.on("request", (req, res) => {
    req.socket._isIdle = false;
    if (isShuttingDown && !res.headersSent) {
      res.setHeader("connection", "close");
    }
    res.on("finish", () => {
      req.socket._isIdle = true;
      destroy(req.socket);
    });
  });
  server.on("connection", (socket) => {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = connectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      connections[id] = socket;
      socket.once("close", () => {
        delete connections[socket._connectionId];
      });
    }
  });
  server.on("secureConnection", (socket) => {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = secureConnectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      secureConnections[id] = socket;
      socket.once("close", () => {
        delete secureConnections[socket._connectionId];
      });
    }
  });
  process.on("close", () => {
    debug("closed");
  });
  function shutdown(sig) {
    function cleanupHttp() {
      destroyAllConnections();
      debug("Close http server");
      return new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            return reject(err);
          }
          return resolve(true);
        });
      });
    }
    debug("shutdown signal - " + sig);
    if (options.development) {
      debug("DEV-Mode - immediate forceful shutdown");
      return process.exit(0);
    }
    function finalHandler() {
      if (!finalRun) {
        finalRun = true;
        if (options.finally && isFunction(options.finally)) {
          debug("executing finally()");
          options.finally();
        }
      }
      return Promise.resolve();
    }
    function waitForReadyToShutDown(totalNumInterval) {
      debug(`waitForReadyToShutDown... ${totalNumInterval}`);
      if (totalNumInterval === 0) {
        debug(
          `Could not close connections in time (${options.timeout}ms), will forcefully shut down`
        );
        return Promise.resolve(true);
      }
      const allConnectionsClosed = Object.keys(connections).length === 0 && Object.keys(secureConnections).length === 0;
      if (allConnectionsClosed) {
        debug("All connections closed. Continue to shutting down");
        return Promise.resolve(false);
      }
      debug("Schedule the next waitForReadyToShutdown");
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(waitForReadyToShutDown(totalNumInterval - 1));
        }, 250);
      });
    }
    if (isShuttingDown) {
      return Promise.resolve();
    }
    debug("shutting down");
    return options.preShutdown(sig).then(() => {
      isShuttingDown = true;
      cleanupHttp();
    }).then(() => {
      const pollIterations = options.timeout ? Math.round(options.timeout / 250) : 0;
      return waitForReadyToShutDown(pollIterations);
    }).then((force) => {
      debug("Do onShutdown now");
      if (force) {
        destroyAllConnections(force);
      }
      return options.onShutdown(sig);
    }).then(finalHandler).catch((error) => {
      const errString = typeof error === "string" ? error : JSON.stringify(error);
      debug(errString);
      failed = true;
      throw errString;
    });
  }
  function shutdownManual() {
    return shutdown("manual");
  }
  return shutdownManual;
}

function getGracefulShutdownConfig() {
  return {
    disabled: !!process.env.NITRO_SHUTDOWN_DISABLED,
    signals: (process.env.NITRO_SHUTDOWN_SIGNALS || "SIGTERM SIGINT").split(" ").map((s) => s.trim()),
    timeout: Number.parseInt(process.env.NITRO_SHUTDOWN_TIMEOUT || "", 10) || 3e4,
    forceExit: !process.env.NITRO_SHUTDOWN_NO_FORCE_EXIT
  };
}
function setupGracefulShutdown(listener, nitroApp) {
  const shutdownConfig = getGracefulShutdownConfig();
  if (shutdownConfig.disabled) {
    return;
  }
  GracefulShutdown(listener, {
    signals: shutdownConfig.signals.join(" "),
    timeout: shutdownConfig.timeout,
    forceExit: shutdownConfig.forceExit,
    onShutdown: async () => {
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn("Graceful shutdown timeout, force exiting...");
          resolve();
        }, shutdownConfig.timeout);
        nitroApp.hooks.callHook("close").catch((error) => {
          console.error(error);
        }).finally(() => {
          clearTimeout(timeout);
          resolve();
        });
      });
    }
  });
}

const cert = process.env.NITRO_SSL_CERT;
const key = process.env.NITRO_SSL_KEY;
const nitroApp = useNitroApp();
const server = cert && key ? new Server({ key, cert }, toNodeListener(nitroApp.h3App)) : new Server$1(toNodeListener(nitroApp.h3App));
const port = destr(process.env.NITRO_PORT || process.env.PORT) || 3e3;
const host = process.env.NITRO_HOST || process.env.HOST;
const path = process.env.NITRO_UNIX_SOCKET;
const listener = server.listen(path ? { path } : { port, host }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  const protocol = cert && key ? "https" : "http";
  const addressInfo = listener.address();
  if (typeof addressInfo === "string") {
    console.log(`Listening on unix socket ${addressInfo}`);
    return;
  }
  const baseURL = (useRuntimeConfig().app.baseURL || "").replace(/\/$/, "");
  const url = `${protocol}://${addressInfo.family === "IPv6" ? `[${addressInfo.address}]` : addressInfo.address}:${addressInfo.port}${baseURL}`;
  console.log(`Listening on ${url}`);
});
trapUnhandledNodeErrors();
setupGracefulShutdown(listener, nitroApp);
const nodeServer = {};

export { $fetch$1 as $, invalidatePermCache as A, isScriptProtocol as B, joinURL as C, nodeServer as D, notify as E, notifyAdmins as F, paginate as G, parseQuery as H, parseURL as I, publicAssetsURL as J, query as K, queryOne as L, readBody as M, readMultipartFormData as N, readRawBody as O, recalcPO as P, sanitizeStatusCode as Q, setResponseHeader as R, setUserSession as S, useNitroApp as T, useRuntimeConfig as U, withQuery as V, withTrailingSlash as W, withoutTrailingSlash as X, auditLog as a, baseURL as b, buildAssetsURL as c, clearUserSession as d, createError$1 as e, createHooks as f, decodePath as g, defineEventHandler as h, defineRenderHandler as i, defu as j, encodePath as k, executeAsync as l, getContext as m, getDb as n, getMethod as o, getQuery as p, getRequestHeader as q, getRequestIP as r, getRequestURL as s, getResponseStatus as t, getResponseStatusText as u, getRouteRules as v, getRouterParam as w, getUserSession as x, hasProtocol as y, hash$1 as z };
//# sourceMappingURL=nitro.mjs.map
