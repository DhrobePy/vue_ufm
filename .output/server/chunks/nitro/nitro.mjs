import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import crypto, { createHash } from 'node:crypto';
import http, { Server as Server$1 } from 'node:http';
import https, { Server } from 'node:https';
import { EventEmitter } from 'node:events';
import { Buffer as Buffer$1 } from 'node:buffer';
import { promises, existsSync } from 'node:fs';
import { resolve as resolve$1, dirname as dirname$1, join } from 'node:path';
import mysql from 'mysql2/promise';
import { fileURLToPath } from 'node:url';

const subtle = crypto.webcrypto?.subtle || {};
const randomUUID = () => {
  return crypto.randomUUID();
};
const getRandomValues = (array) => {
  return crypto.webcrypto.getRandomValues(array);
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
const setHeader = setResponseHeader;
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
    "buildId": "993ad688-8346-4602-b478-bb136fa47488",
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
  "cronSecret": "",
  "session": {
    "name": "nuxt-session",
    "password": "",
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
async function renameCol(db, table, oldName, newName, def) {
  try {
    await db.query(`ALTER TABLE \`${table}\` CHANGE COLUMN \`${oldName}\` \`${newName}\` ${def}`);
  } catch (e) {
    if ((e == null ? void 0 : e.errno) !== 1054 && (e == null ? void 0 : e.errno) !== 1060) {
      console.warn(`[db-migrate] ${table} rename ${oldName}->${newName} failed:`, e);
    }
  }
}
async function addUnique(db, table, keyName, cols) {
  try {
    await db.query(`ALTER TABLE \`${table}\` ADD UNIQUE KEY \`${keyName}\` (${cols})`);
  } catch (e) {
    if (![1061, 1557, 1062].includes(e == null ? void 0 : e.errno)) {
      console.warn(`[db-migrate] ${table} ADD UNIQUE ${keyName} failed:`, e);
    }
  }
}
const _5ZkFlqQ83wbPb4N4Hy3qo0yaLtHyvx32m900MHxj3Oo = defineNitroPlugin(async () => {
  var _a, _b, _c, _d;
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
  try {
    await db.query(
      `ALTER TABLE customer_payments MODIFY COLUMN payment_type VARCHAR(30) NULL DEFAULT 'invoice_payment'`
    );
  } catch (e) {
    console.warn("[db-migrate] customer_payments.payment_type widen failed:", e);
  }
  try {
    await db.query(
      `ALTER TABLE customer_payments MODIFY COLUMN allocation_status VARCHAR(30) NULL DEFAULT 'unallocated'`
    );
  } catch (e) {
    console.warn("[db-migrate] customer_payments.allocation_status widen failed:", e);
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
      ALTER TABLE credit_orders MODIFY COLUMN status VARCHAR(30) NOT NULL DEFAULT 'pending_approval'
    `);
  } catch (e) {
    console.warn("[db-migrate] credit_orders.status VARCHAR widen failed:", e);
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
  await addCol(db, "branches", "branch_type", "VARCHAR(20) NULL DEFAULT NULL COMMENT 'factory | sales_region | office'");
  await addCol(db, "branches", "source_branch_id", "INT UNSIGNED NULL DEFAULT NULL COMMENT 'Factory branch that feeds this sales region'");
  await addCol(db, "branches", "is_factory", "TINYINT(1) NOT NULL DEFAULT 0");
  try {
    await db.query(`UPDATE branches SET branch_type = 'factory' WHERE branch_type IS NULL AND id IN (1, 2)`);
    await db.query(`UPDATE branches SET branch_type = 'office' WHERE branch_type IS NULL AND code = 'HO'`);
    await db.query(`UPDATE branches SET branch_type = 'sales_region' WHERE branch_type IS NULL`);
    await db.query(`UPDATE branches SET is_factory = (branch_type = 'factory')`);
  } catch (e) {
    console.warn("[db-migrate] branch_type seed failed:", e);
  }
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS branch_price_components (
        id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        branch_id    INT UNSIGNED NOT NULL,
        name         VARCHAR(100) NOT NULL COMMENT 'e.g. Freight (Big Truck), Handling, Toll',
        weight_class VARCHAR(10)  NOT NULL DEFAULT 'all' COMMENT '50 | 74 | all',
        charge_type  VARCHAR(20)  NOT NULL DEFAULT 'base' COMMENT 'base | mini_truck',
        amount       DECIMAL(10,2) NOT NULL DEFAULT 0,
        is_active    TINYINT(1)   NOT NULL DEFAULT 1,
        sort_order   INT          NOT NULL DEFAULT 0,
        created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_bpc_branch (branch_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (e) {
    console.warn("[db-migrate] branch_price_components create failed:", e);
  }
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_approval_limits (
        id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id          INT UNSIGNED NOT NULL UNIQUE,
        max_order_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
        set_by_user_id   INT UNSIGNED NULL,
        created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (e) {
    console.warn("[db-migrate] user_approval_limits failed:", e);
  }
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS order_approval_conditions (
        id                     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        order_id               INT UNSIGNED NOT NULL UNIQUE,
        production_hold        TINYINT(1) NOT NULL DEFAULT 0,
        production_hold_note   VARCHAR(255) NULL,
        production_released_by INT UNSIGNED NULL,
        production_released_at DATETIME NULL,
        dispatch_hold          TINYINT(1) NOT NULL DEFAULT 0,
        condition_type         VARCHAR(30) NULL COMMENT 'manual | outstanding_below | outstanding_after_ship | amount_received',
        condition_amount       DECIMAL(14,2) NULL,
        auto_release           TINYINT(1) NOT NULL DEFAULT 0,
        accounts_note          VARCHAR(255) NULL,
        dispatch_cleared       TINYINT(1) NOT NULL DEFAULT 0,
        dispatch_cleared_by    INT UNSIGNED NULL,
        dispatch_cleared_at    DATETIME NULL,
        dispatch_cleared_note  VARCHAR(255) NULL,
        created_by_user_id     INT UNSIGNED NULL,
        created_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_oac_order (order_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (e) {
    console.warn("[db-migrate] order_approval_conditions failed:", e);
  }
  await renameCol(db, "order_approval_conditions", "production_note", "production_hold_note", "VARCHAR(255) NULL DEFAULT NULL");
  await renameCol(db, "order_approval_conditions", "cleared_by", "dispatch_cleared_by", "INT UNSIGNED NULL DEFAULT NULL");
  await renameCol(db, "order_approval_conditions", "cleared_at", "dispatch_cleared_at", "DATETIME NULL DEFAULT NULL");
  await renameCol(db, "order_approval_conditions", "clearance_note", "dispatch_cleared_note", "VARCHAR(255) NULL DEFAULT NULL");
  await addCol(db, "order_approval_conditions", "created_by_user_id", "INT UNSIGNED NULL DEFAULT NULL");
  await addCol(db, "order_approval_conditions", "approved_by_user_id", "BIGINT UNSIGNED NULL DEFAULT NULL");
  try {
    await db.query(`ALTER TABLE order_approval_conditions MODIFY COLUMN approved_by_user_id BIGINT UNSIGNED NULL DEFAULT NULL`);
  } catch (e) {
    console.warn("[db-migrate] order_approval_conditions.approved_by_user_id widen failed:", e);
  }
  try {
    await db.query(`ALTER TABLE order_approval_conditions MODIFY COLUMN condition_type VARCHAR(30) NULL DEFAULT NULL`);
  } catch (e) {
    console.warn("[db-migrate] order_approval_conditions.condition_type widen failed:", e);
  }
  await addUnique(db, "order_approval_conditions", "uniq_oac_order", "order_id");
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS order_amendments (
        id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        amendment_number   VARCHAR(30) NOT NULL UNIQUE,
        order_id           INT UNSIGNED NOT NULL,
        regime             VARCHAR(10) NOT NULL COMMENT 'pre | post (dispatch)',
        amend_type         VARCHAR(30) NOT NULL COMMENT 'transport | price | qty | correction | freight | rebate',
        description        VARCHAR(500) NULL,
        old_values         LONGTEXT NULL COMMENT 'JSON snapshot before',
        new_values         LONGTEXT NULL COMMENT 'JSON snapshot after / requested',
        flat_amount        DECIMAL(14,2) NULL COMMENT 'post regime: signed \xB1 posted as debit/credit note',
        status             VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT 'pending | approved | rejected',
        requested_by       INT UNSIGNED NOT NULL,
        decided_by         INT UNSIGNED NULL,
        decided_at         DATETIME NULL,
        decision_note      VARCHAR(255) NULL,
        journal_entry_id   INT UNSIGNED NULL,
        created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_amd_order (order_id),
        INDEX idx_amd_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (e) {
    console.warn("[db-migrate] order_amendments failed:", e);
  }
  await addCol(db, "credit_orders", "delivery_type", "VARCHAR(20) NOT NULL DEFAULT 'big_truck' COMMENT 'big_truck | mini_truck'");
  await addCol(db, "credit_orders", "mini_truck_surcharge", "DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT 'order-level surcharge included in total_amount'");
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS payment_allocations (
        id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        payment_id       INT UNSIGNED NOT NULL,
        order_id         INT UNSIGNED NOT NULL,
        allocated_amount DECIMAL(14,2) NOT NULL,
        as_advance       TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 = order not dispatched yet, counts as advance',
        created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_pa_payment (payment_id),
        INDEX idx_pa_order (order_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (e) {
    console.warn("[db-migrate] payment_allocations failed:", e);
  }
  await addCol(
    db,
    "payment_allocations",
    "as_advance",
    "TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 = order not dispatched yet, counts as advance'"
  );
  await addCol(
    db,
    "user_approval_limits",
    "max_transaction_amount",
    "DECIMAL(14,2) NOT NULL DEFAULT 0 COMMENT 'Max single payment/transaction this user may record; 0 = no personal cap'"
  );
  try {
    const [[flag]] = await db.query(
      `SELECT setting_value FROM system_settings WHERE setting_key = 'migrated_goods_on_board_split'`
    );
    if (!flag) {
      const [result] = await db.query(
        `UPDATE credit_orders SET status = 'goods_on_board' WHERE status IN ('shipped', 'dispatched')`
      );
      await db.query(
        `INSERT INTO system_settings (setting_key, setting_value) VALUES ('migrated_goods_on_board_split', ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [String((_a = result == null ? void 0 : result.affectedRows) != null ? _a : 0)]
      );
      console.log(`[db-migrate] goods_on_board split: relabelled ${(_b = result == null ? void 0 : result.affectedRows) != null ? _b : 0} order(s)`);
    }
  } catch (e) {
    console.warn("[db-migrate] goods_on_board split backfill failed:", e);
  }
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS credit_pending_requests (
        id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        request_type        VARCHAR(30)  NOT NULL COMMENT 'payment | collect_payment',
        payload              LONGTEXT     NOT NULL COMMENT 'JSON \u2014 exact original request body',
        order_id             INT UNSIGNED NULL,
        customer_id          INT UNSIGNED NULL,
        amount               DECIMAL(14,2) NOT NULL,
        reference_label      VARCHAR(255) NULL,
        requested_by_user_id INT UNSIGNED NOT NULL,
        requested_reason     VARCHAR(255) NULL COMMENT 'why it was queued, e.g. limit exceeded',
        status               VARCHAR(20)  NOT NULL DEFAULT 'pending' COMMENT 'pending | approved | rejected',
        decided_by_user_id   INT UNSIGNED NULL,
        decided_at           DATETIME     NULL,
        decision_note        VARCHAR(255) NULL,
        result_payment_id    INT UNSIGNED NULL COMMENT 'customer_payments.id once posted',
        created_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_cpr_status (status),
        INDEX idx_cpr_customer (customer_id),
        INDEX idx_cpr_order (order_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (e) {
    console.warn("[db-migrate] credit_pending_requests failed:", e);
  }
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS credit_order_over_deliveries (
        id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        od_number            VARCHAR(30)  NOT NULL UNIQUE,
        order_id             INT UNSIGNED NOT NULL,
        customer_id          INT UNSIGNED NOT NULL,
        od_date              DATE         NOT NULL,
        total_extra_qty      DECIMAL(12,2) NOT NULL DEFAULT 0,
        total_extra_amount   DECIMAL(14,2) NOT NULL DEFAULT 0,
        resolution           VARCHAR(20)  NOT NULL DEFAULT 'bill' COMMENT 'bill | retrieve | writeoff',
        notes                VARCHAR(500) NULL,
        status               VARCHAR(20)  NOT NULL DEFAULT 'pending' COMMENT 'pending | approved | rejected',
        created_by_user_id   INT UNSIGNED NOT NULL,
        approved_by_user_id  INT UNSIGNED NULL,
        approved_at          DATETIME     NULL,
        decision_note        VARCHAR(255) NULL,
        retrieved_at         DATETIME     NULL,
        retrieved_by_user_id INT UNSIGNED NULL,
        journal_entry_id     INT UNSIGNED NULL,
        created_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_od_order (order_id),
        INDEX idx_od_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS credit_order_over_delivery_items (
        id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        od_id          INT UNSIGNED NOT NULL,
        order_item_id  INT UNSIGNED NULL,
        product_id     INT UNSIGNED NULL,
        variant_id     INT UNSIGNED NULL,
        extra_qty      DECIMAL(12,2) NOT NULL,
        unit_price     DECIMAL(12,2) NOT NULL,
        line_total     DECIMAL(14,2) NOT NULL,
        INDEX idx_odi_od (od_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (e) {
    console.warn("[db-migrate] over-delivery tables failed:", e);
  }
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS stock_adjustments (
        id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        adj_number          VARCHAR(30)  NOT NULL UNIQUE,
        variant_id          INT UNSIGNED NOT NULL,
        delta               INT          NOT NULL COMMENT 'signed \u2014 negative = decrease, positive = increase',
        reason              VARCHAR(255) NOT NULL,
        notes               VARCHAR(500) NULL,
        status              VARCHAR(20)  NOT NULL DEFAULT 'pending' COMMENT 'pending | approved | rejected',
        created_by_user_id  INT UNSIGNED NOT NULL,
        approved_by_user_id INT UNSIGNED NULL,
        approved_at         DATETIME     NULL,
        decision_note       VARCHAR(255) NULL,
        journal_entry_id    INT UNSIGNED NULL,
        created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_sa_variant (variant_id),
        INDEX idx_sa_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (e) {
    console.warn("[db-migrate] stock_adjustments failed:", e);
  }
  await addCol(
    db,
    "customer_payments",
    "reversed_at",
    "DATETIME NULL COMMENT 'set when this payment is reversed'"
  );
  await addCol(
    db,
    "customer_payments",
    "reversed_by_user_id",
    "INT UNSIGNED NULL"
  );
  await addCol(
    db,
    "customer_payments",
    "reversal_reason",
    "VARCHAR(255) NULL"
  );
  await addCol(
    db,
    "customer_payments",
    "reversal_journal_entry_id",
    "INT UNSIGNED NULL COMMENT 'the reversing JE, distinct from journal_entry_id (the original posting)'"
  );
  await addCol(
    db,
    "payment_allocations",
    "reversed",
    "TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 once the parent payment has been reversed'"
  );
  try {
    await db.query(`
      UPDATE customer_ledger l
      JOIN customer_payments p ON p.id = l.reference_id
      SET l.invoice_number = p.payment_number
      WHERE l.reference_type = 'customer_payment'
        AND (l.invoice_number IS NULL OR l.invoice_number <> p.payment_number)
    `);
  } catch (e) {
    console.warn("[db-migrate] customer_ledger invoice_number backfill failed:", e);
  }
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS cr_delivery_confirmations (
        id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        order_id              INT UNSIGNED NOT NULL,
        order_number          VARCHAR(50)  NULL,
        gate_out_at           DATETIME     NULL,
        gate_out_by_user_id   INT UNSIGNED NULL,
        gate_out_by_name      VARCHAR(120) NULL,
        driver_name           VARCHAR(150) NULL,
        vehicle_number        VARCHAR(100) NULL,
        gate_note             VARCHAR(500) NULL,
        confirmed_at          DATETIME     NULL,
        confirmed_by_user_id  INT UNSIGNED NULL,
        confirmed_by_name     VARCHAR(120) NULL,
        received_by           VARCHAR(150) NULL,
        note                  VARCHAR(500) NULL,
        created_at            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_dc_order (order_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS cr_qr_scan_log (
        id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        order_id           INT UNSIGNED NOT NULL,
        order_number       VARCHAR(50)  NULL,
        stage              VARCHAR(20)  NULL,
        reused             TINYINT(1)   NOT NULL DEFAULT 0,
        scanned_by_user_id INT UNSIGNED NULL,
        scanned_by_name    VARCHAR(120) NULL,
        ip                 VARCHAR(64)  NULL,
        scanned_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_qsl_order (order_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (e) {
    console.warn("[db-migrate] two-stage QR delivery tables failed:", e);
  }
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS recycle_bin_batches (
        id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        entity_type         VARCHAR(50)  NOT NULL COMMENT 'credit_order | customer | ...',
        label                VARCHAR(200) NOT NULL COMMENT 'human-readable \u2014 order number, customer name, etc.',
        customer_id          INT UNSIGNED NULL,
        item_count           INT UNSIGNED NOT NULL DEFAULT 0,
        status               VARCHAR(20)  NOT NULL DEFAULT 'active' COMMENT 'active | restored | purged',
        deleted_by_user_id   INT UNSIGNED NULL,
        deleted_by_name      VARCHAR(120) NULL,
        deleted_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        restored_by_user_id  INT UNSIGNED NULL,
        restored_at          DATETIME     NULL,
        purged_by_user_id    INT UNSIGNED NULL,
        purged_at            DATETIME     NULL,
        notes                VARCHAR(500) NULL,
        INDEX idx_rbb_entity (entity_type),
        INDEX idx_rbb_status (status),
        INDEX idx_rbb_customer (customer_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS recycle_bin_items (
        id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        batch_id       INT UNSIGNED NOT NULL,
        table_name     VARCHAR(100) NOT NULL,
        op             VARCHAR(10)  NOT NULL COMMENT 'delete | update \u2014 what restore must undo',
        row_pk_col     VARCHAR(64)  NOT NULL,
        row_pk_val     VARCHAR(64)  NOT NULL,
        snapshot_json  LONGTEXT     NOT NULL,
        created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_rbi_batch (batch_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (e) {
    console.warn("[db-migrate] recycle bin tables failed:", e);
  }
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS purchase_commodities (
        id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name                  VARCHAR(100) NOT NULL,
        unit                  VARCHAR(10)  NOT NULL DEFAULT 'KG' COMMENT 'KG|MT|pcs|bag|litre|ton|box',
        inventory_account_id  INT UNSIGNED NULL COMMENT 'chart_of_accounts.id \u2014 reserved for future GRN GL posting',
        status                VARCHAR(20)  NOT NULL DEFAULT 'active' COMMENT 'active | inactive',
        sort_order            INT UNSIGNED NOT NULL DEFAULT 0,
        created_at            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_commodity_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS purchase_commodity_origins (
        id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        commodity_id  INT UNSIGNED NOT NULL,
        origin_name   VARCHAR(100) NOT NULL,
        sort_order    INT UNSIGNED NOT NULL DEFAULT 0,
        INDEX idx_pco_commodity (commodity_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS supplier_commodities (
        id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        supplier_id   INT UNSIGNED NOT NULL,
        commodity_id  INT UNSIGNED NOT NULL,
        UNIQUE KEY uq_supplier_commodity (supplier_id, commodity_id),
        INDEX idx_sc_commodity (commodity_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (e) {
    console.warn("[db-migrate] purchase commodity tables failed:", e);
  }
  await addCol(db, "purchase_orders_adnan", "commodity_id", "INT UNSIGNED NULL DEFAULT NULL");
  try {
    await db.query(
      `INSERT IGNORE INTO purchase_commodities (name, unit, status, sort_order) VALUES ('Wheat', 'MT', 'active', 0)`
    );
    const [[wheat]] = await db.query(`SELECT id FROM purchase_commodities WHERE name = 'Wheat'`);
    if (wheat == null ? void 0 : wheat.id) {
      await db.query(
        `UPDATE purchase_orders_adnan SET commodity_id = ? WHERE commodity_id IS NULL`,
        [wheat.id]
      );
      const [[originCnt]] = await db.query(
        `SELECT COUNT(*) AS n FROM purchase_commodity_origins WHERE commodity_id = ?`,
        [wheat.id]
      );
      if (!originCnt.n) {
        const origins = ["\u0995\u09BE\u09A8\u09BE\u09A1\u09BE", "\u09B0\u09BE\u09B6\u09BF\u09AF\u09BC\u09BE", "Australia", "Ukraine", "India", "USA", "Argentina", "Local", "Brazil", "Other"];
        for (let i = 0; i < origins.length; i++) {
          await db.query(
            `INSERT INTO purchase_commodity_origins (commodity_id, origin_name, sort_order) VALUES (?, ?, ?)`,
            [wheat.id, origins[i], i]
          );
        }
      }
    }
  } catch (e) {
    console.warn("[db-migrate] wheat commodity seed failed:", e);
  }
  await addCol(db, "bank_transactions", "source_payment_id", "INT UNSIGNED NULL DEFAULT NULL");
  await addCol(db, "bank_transactions", "reconciled_at", "DATETIME NULL DEFAULT NULL");
  await addCol(db, "bank_transactions", "reconciled_by_user_id", "INT UNSIGNED NULL DEFAULT NULL");
  await addCol(db, "bank_accounts", "legacy_tx_account_id", "INT UNSIGNED NULL DEFAULT NULL");
  await addCol(db, "bank_tx_transaction_types", "chart_of_account_id", "INT UNSIGNED NULL DEFAULT NULL");
  await addCol(db, "bank_transactions", "journal_entry_id", "INT UNSIGNED NULL DEFAULT NULL");
  await addCol(db, "bank_transactions", "transfer_pair_id", "INT UNSIGNED NULL DEFAULT NULL");
  try {
    const [txAccounts] = await db.query(`SELECT * FROM bank_tx_accounts`);
    for (const txAcc of txAccounts) {
      const [[match]] = await db.query(
        `SELECT id, legacy_tx_account_id FROM bank_accounts WHERE account_number = ? LIMIT 1`,
        [txAcc.account_number]
      );
      if (match) {
        if (!match.legacy_tx_account_id) {
          await db.query(`UPDATE bank_accounts SET legacy_tx_account_id = ? WHERE id = ?`, [txAcc.id, match.id]);
        }
        continue;
      }
      const [coaRes] = await db.query(
        `INSERT INTO chart_of_accounts
           (account_number, account_type, account_type_group, normal_balance, status, is_active, description, name)
         VALUES (?, 'Bank', 'Asset', 'Debit', 'active', 1, ?, ?)`,
        [
          txAcc.account_number || null,
          `Auto-created from bank account "${txAcc.bank_name}" during account-list unification`,
          `${txAcc.bank_name} \u2014 ${txAcc.account_name}`.slice(0, 255)
        ]
      );
      await db.query(
        `INSERT INTO bank_accounts
           (chart_of_account_id, bank_name, branch_name, account_name, account_number,
            account_type, initial_balance, current_balance, status, legacy_tx_account_id)
         VALUES (?, ?, ?, ?, ?, 'Other', ?, ?, ?, ?)`,
        [
          coaRes.insertId,
          txAcc.bank_name,
          txAcc.branch_name || null,
          txAcc.account_name,
          txAcc.account_number,
          Number((_c = txAcc.opening_balance) != null ? _c : 0),
          Number((_d = txAcc.opening_balance) != null ? _d : 0),
          txAcc.status === "active" ? "active" : "inactive",
          txAcc.id
        ]
      );
    }
  } catch (e) {
    console.warn("[db-migrate] bank account unification backfill failed:", e);
  }
  await addCol(db, "product_variants", "cost_price", "DECIMAL(12,2) NULL DEFAULT NULL COMMENT 'Purchase/production cost, for margin reporting'");
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_action_limits (
        id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id        INT UNSIGNED NOT NULL,
        action_key     VARCHAR(40)  NOT NULL,
        max_amount     DECIMAL(14,2) NOT NULL DEFAULT 0,
        set_by_user_id INT UNSIGNED NULL,
        created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_ual_user_action (user_id, action_key),
        INDEX idx_ual_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (e) {
    console.warn("[db-migrate] user_action_limits create failed:", e);
  }
  await addCol(db, "customers", "business_address", "VARCHAR(255) NULL DEFAULT NULL");
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS business_partners (
        id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name               VARCHAR(180) NOT NULL,
        notes              VARCHAR(500) NULL,
        created_by_user_id INT UNSIGNED NULL,
        created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (e) {
    console.warn("[db-migrate] business_partners create failed:", e);
  }
  await addCol(db, "customers", "business_partner_id", "INT UNSIGNED NULL DEFAULT NULL");
  await addCol(db, "suppliers", "business_partner_id", "INT UNSIGNED NULL DEFAULT NULL");
  await addCol(db, "purchase_commodities", "is_sellable", "TINYINT(1) NOT NULL DEFAULT 0");
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS commodity_inventory (
        id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        commodity_id      INT UNSIGNED NOT NULL,
        branch_id         INT UNSIGNED NOT NULL DEFAULT 0,
        origin            VARCHAR(100) NOT NULL DEFAULT '',
        qty_on_hand       DECIMAL(14,3) NOT NULL DEFAULT 0,
        weighted_avg_cost DECIMAL(14,4) NOT NULL DEFAULT 0,
        updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_ci_commodity_branch_origin (commodity_id, branch_id, origin)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (e) {
    console.warn("[db-migrate] commodity_inventory create failed:", e);
  }
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS commodity_sales (
        id                       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        sale_number              VARCHAR(30)  NOT NULL UNIQUE,
        customer_id              INT UNSIGNED NOT NULL,
        commodity_id             INT UNSIGNED NOT NULL,
        branch_id                INT UNSIGNED NULL,
        origin                   VARCHAR(100) NOT NULL DEFAULT '',
        source_purchase_order_id INT UNSIGNED NULL COMMENT 'optional traceability tag, no FK by convention',
        sale_date                DATE NOT NULL,
        quantity                 DECIMAL(14,3) NOT NULL,
        unit                     VARCHAR(10) NOT NULL DEFAULT 'KG',
        unit_price               DECIMAL(14,4) NOT NULL,
        total_amount             DECIMAL(14,2) NOT NULL,
        advance_paid             DECIMAL(14,2) NOT NULL DEFAULT 0,
        amount_paid              DECIMAL(14,2) NOT NULL DEFAULT 0,
        balance_due              DECIMAL(14,2) NOT NULL DEFAULT 0,
        cogs_amount              DECIMAL(14,2) NOT NULL DEFAULT 0,
        stock_override           TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'sold past on-hand stock with explicit override',
        status                   VARCHAR(20) NOT NULL DEFAULT 'posted' COMMENT 'posted | pending_approval | rejected',
        journal_entry_id         INT UNSIGNED NULL,
        customer_ledger_id       INT UNSIGNED NULL COMMENT 'the invoice ledger row this sale created',
        notes                    VARCHAR(500) NULL,
        created_by_user_id       INT UNSIGNED NOT NULL,
        created_at               DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at               DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_cs_customer (customer_id),
        INDEX idx_cs_commodity (commodity_id),
        INDEX idx_cs_date (sale_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (e) {
    console.warn("[db-migrate] commodity_sales create failed:", e);
  }
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS commodity_sale_payments (
        id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        payment_number     VARCHAR(30) NOT NULL UNIQUE,
        sale_id            INT UNSIGNED NOT NULL,
        customer_id        INT UNSIGNED NOT NULL,
        payment_date       DATE NOT NULL,
        amount             DECIMAL(14,2) NOT NULL,
        payment_method     VARCHAR(50) NOT NULL DEFAULT 'Cash',
        bank_account_id    INT UNSIGNED NULL,
        cash_account_id    INT UNSIGNED NULL,
        reference_number   VARCHAR(80) NULL,
        journal_entry_id   INT UNSIGNED NULL,
        customer_ledger_id INT UNSIGNED NULL,
        notes              VARCHAR(500) NULL,
        created_by_user_id INT UNSIGNED NOT NULL,
        created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_csp_sale (sale_id),
        INDEX idx_csp_customer (customer_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (e) {
    console.warn("[db-migrate] commodity_sale_payments create failed:", e);
  }
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS commodity_sale_edits (
        id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        old_sale_id          INT UNSIGNED NOT NULL,
        old_sale_number      VARCHAR(30) NOT NULL,
        new_sale_id          INT UNSIGNED NULL,
        new_sale_number      VARCHAR(30) NULL,
        change_summary       LONGTEXT NULL COMMENT 'JSON field diff',
        reason               VARCHAR(500) NOT NULL,
        status               VARCHAR(20) NOT NULL DEFAULT 'pending_approval' COMMENT 'pending_approval | approved | rejected',
        requested_by_user_id INT UNSIGNED NOT NULL,
        decided_by_user_id   INT UNSIGNED NULL,
        decided_at           DATETIME NULL,
        created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_cse_old (old_sale_id),
        INDEX idx_cse_new (new_sale_id),
        INDEX idx_cse_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (e) {
    console.warn("[db-migrate] commodity_sale_edits create failed:", e);
  }
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS business_partner_settlements (
        id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        settlement_number  VARCHAR(30) NOT NULL UNIQUE,
        partner_id         INT UNSIGNED NOT NULL,
        customer_id        INT UNSIGNED NOT NULL,
        supplier_id        INT UNSIGNED NOT NULL,
        amount             DECIMAL(14,2) NOT NULL,
        settlement_date    DATE NOT NULL,
        journal_entry_id   INT UNSIGNED NULL,
        customer_ledger_id INT UNSIGNED NULL,
        supplier_ledger_id INT UNSIGNED NULL,
        status             VARCHAR(20) NOT NULL DEFAULT 'posted' COMMENT 'posted | reversed',
        notes              VARCHAR(500) NULL,
        created_by_user_id INT UNSIGNED NOT NULL,
        created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_bps_partner (partner_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (e) {
    console.warn("[db-migrate] business_partner_settlements create failed:", e);
  }
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS commodity_dispatch_confirmations (
        id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        sale_id              INT UNSIGNED NOT NULL,
        sale_number          VARCHAR(30) NULL,
        gate_out_at          DATETIME NULL,
        gate_out_by_user_id  INT UNSIGNED NULL,
        gate_out_by_name     VARCHAR(120) NULL,
        driver_name          VARCHAR(150) NULL,
        vehicle_number       VARCHAR(100) NULL,
        gate_note            VARCHAR(500) NULL,
        confirmed_at         DATETIME NULL,
        confirmed_by_user_id INT UNSIGNED NULL,
        confirmed_by_name    VARCHAR(120) NULL,
        received_by          VARCHAR(150) NULL,
        note                 VARCHAR(500) NULL,
        created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_cdc_sale (sale_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS commodity_qr_scan_log (
        id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        sale_id            INT UNSIGNED NOT NULL,
        sale_number        VARCHAR(30) NULL,
        stage              VARCHAR(20) NULL,
        reused             TINYINT(1) NOT NULL DEFAULT 0,
        scanned_by_user_id INT UNSIGNED NULL,
        scanned_by_name    VARCHAR(120) NULL,
        ip                 VARCHAR(64) NULL,
        scanned_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_cqsl_sale (sale_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (e) {
    console.warn("[db-migrate] commodity dispatch tables failed:", e);
  }
  await addCol(db, "goods_received_adnan", "unload_point_branch_id", "INT UNSIGNED NULL DEFAULT NULL");
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS loans (
        id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        loan_number          VARCHAR(30) NOT NULL UNIQUE,
        customer_id          INT UNSIGNED NULL,
        supplier_id          INT UNSIGNED NULL,
        principal_amount     DECIMAL(14,2) NOT NULL,
        amount_repaid        DECIMAL(14,2) NOT NULL DEFAULT 0,
        balance_due          DECIMAL(14,2) NOT NULL DEFAULT 0,
        loan_date            DATE NOT NULL,
        expected_return_date DATE NULL,
        purpose              VARCHAR(500) NULL,
        payment_method       VARCHAR(50) NOT NULL DEFAULT 'Cash',
        bank_account_id      INT UNSIGNED NULL,
        cash_account_id      INT UNSIGNED NULL,
        reference_number     VARCHAR(80) NULL,
        status               VARCHAR(20) NOT NULL DEFAULT 'active' COMMENT 'pending_approval | active | closed | rejected',
        journal_entry_id     INT UNSIGNED NULL,
        created_by_user_id   INT UNSIGNED NOT NULL,
        created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_loans_customer (customer_id),
        INDEX idx_loans_supplier (supplier_id),
        INDEX idx_loans_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS loan_repayments (
        id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        repayment_number   VARCHAR(30) NOT NULL UNIQUE,
        loan_id            INT UNSIGNED NOT NULL,
        customer_id        INT UNSIGNED NULL,
        supplier_id        INT UNSIGNED NULL,
        amount             DECIMAL(14,2) NOT NULL,
        repayment_date     DATE NOT NULL,
        payment_method     VARCHAR(50) NOT NULL DEFAULT 'Cash',
        bank_account_id    INT UNSIGNED NULL,
        cash_account_id    INT UNSIGNED NULL,
        reference_number   VARCHAR(80) NULL,
        journal_entry_id   INT UNSIGNED NULL,
        notes              VARCHAR(500) NULL,
        created_by_user_id INT UNSIGNED NOT NULL,
        created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_lr_loan (loan_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (e) {
    console.warn("[db-migrate] loans tables failed:", e);
  }
  await addCol(db, "credit_orders", "is_other_sales", "TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Trading commodity sale via credit-order flow \u2014 skips production'");
  await addCol(db, "credit_order_items", "commodity_id", "INT UNSIGNED NULL DEFAULT NULL");
  await addCol(db, "credit_order_items", "commodity_origin", "VARCHAR(100) NULL DEFAULT NULL");
  try {
    await db.query(`ALTER TABLE credit_order_items MODIFY COLUMN product_id INT UNSIGNED NULL DEFAULT NULL`);
  } catch {
    try {
      await db.query(`ALTER TABLE credit_order_items MODIFY COLUMN product_id INT NULL DEFAULT NULL`);
    } catch (e) {
      console.warn("[db-migrate] credit_order_items.product_id nullable failed:", e);
    }
  }
  await addCol(db, "orders", "cash_amount", "DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT 'Paid now (cash/card/mobile banking/bank)'");
  await addCol(db, "orders", "credit_amount", "DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT 'Left on customer account (POS credit)'");
  await addCol(db, "orders", "exit_status", "VARCHAR(20) NOT NULL DEFAULT 'cleared' COMMENT 'cleared | pending_approval'");
  await addCol(db, "orders", "exit_cleared_by_user_id", "INT UNSIGNED NULL DEFAULT NULL");
  await addCol(db, "orders", "exit_cleared_at", "DATETIME NULL DEFAULT NULL");
  await addCol(db, "orders", "exit_requested_by_user_id", "INT UNSIGNED NULL DEFAULT NULL");
  await addCol(db, "orders", "exit_requested_at", "DATETIME NULL DEFAULT NULL");
  await addCol(db, "orders", "exit_verify_sig", "VARCHAR(32) NULL DEFAULT NULL");
  await addCol(db, "orders", "cash_account_id", "INT UNSIGNED NULL DEFAULT NULL");
  await addCol(db, "orders", "bank_account_id", "INT UNSIGNED NULL DEFAULT NULL");
  await addCol(db, "orders", "recycled_at", "DATETIME NULL DEFAULT NULL");
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS pos_customer_ledger (
        id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        customer_id        INT UNSIGNED NOT NULL,
        order_id           INT UNSIGNED NULL,
        transaction_date   DATE NOT NULL,
        transaction_type   VARCHAR(20) NOT NULL COMMENT 'sale | payment | adjustment',
        description        VARCHAR(255) NULL,
        debit_amount       DECIMAL(12,2) NOT NULL DEFAULT 0,
        credit_amount      DECIMAL(12,2) NOT NULL DEFAULT 0,
        reference_number   VARCHAR(50) NULL,
        created_by_user_id INT UNSIGNED NOT NULL,
        created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_pcl_customer (customer_id),
        INDEX idx_pcl_order (order_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (e) {
    console.warn("[db-migrate] pos_customer_ledger failed:", e);
  }
  await addCol(db, "cash_verification_log", "deposited_at", "DATETIME NULL DEFAULT NULL");
  await addCol(db, "cash_verification_log", "deposited_by_user_id", "INT UNSIGNED NULL DEFAULT NULL");
  await addCol(db, "cash_verification_log", "deposit_reference", "VARCHAR(100) NULL DEFAULT NULL");
  await addCol(db, "cash_verification_log", "cash_account_id", "INT UNSIGNED NULL DEFAULT NULL");
  await addCol(db, "production_schedule", "bags_completed", "INT UNSIGNED NOT NULL DEFAULT 0");
  await addCol(db, "production_schedule", "target_bags", "INT UNSIGNED NULL DEFAULT NULL");
  await addCol(db, "fleet_fuel_logs", "payment_method", "VARCHAR(10) NULL DEFAULT NULL COMMENT 'cash | bank'");
  await addCol(db, "fleet_fuel_logs", "cash_account_id", "INT UNSIGNED NULL DEFAULT NULL");
  await addCol(db, "fleet_fuel_logs", "bank_account_id", "INT UNSIGNED NULL DEFAULT NULL");
  await addCol(db, "fleet_fuel_logs", "journal_entry_id", "INT UNSIGNED NULL DEFAULT NULL");
  await addCol(db, "maintenance_requests", "payment_method", "VARCHAR(10) NULL DEFAULT NULL COMMENT 'cash | bank'");
  await addCol(db, "maintenance_requests", "cash_account_id", "INT UNSIGNED NULL DEFAULT NULL");
  await addCol(db, "maintenance_requests", "bank_account_id", "INT UNSIGNED NULL DEFAULT NULL");
  await addCol(db, "maintenance_requests", "journal_entry_id", "INT UNSIGNED NULL DEFAULT NULL");
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS pos_qr_scan_log (
        id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        order_id           BIGINT UNSIGNED NOT NULL,
        order_number       VARCHAR(50) NULL,
        reused             TINYINT(1) NOT NULL DEFAULT 0,
        scanned_by_user_id BIGINT UNSIGNED NULL,
        scanned_by_name    VARCHAR(120) NULL,
        ip                 VARCHAR(64) NULL,
        scanned_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id), KEY idx_pqsl_order (order_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (e) {
    console.warn("[db-migrate] pos_qr_scan_log failed:", e);
  }
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS fleet_trip_consolidation_dismissals (
        id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        trip_id_a             INT UNSIGNED NOT NULL,
        trip_id_b             INT UNSIGNED NOT NULL,
        dismissed_by_user_id  INT UNSIGNED NULL,
        dismissed_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_ftcd_pair (trip_id_a, trip_id_b)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (e) {
    console.warn("[db-migrate] fleet_trip_consolidation_dismissals failed:", e);
  }
  console.log("[db-migrate] startup migrations complete");
});

const plugins = [
  _A0rTAkqQKHycO7CrrtLZ2oMw5IS2SKVeyO4RUEyJ3Q,
_5ZkFlqQ83wbPb4N4Hy3qo0yaLtHyvx32m900MHxj3Oo
];

const assets = {
  "/models/face_landmark_68_tiny_model-weights_manifest.json": {
    "type": "application/json",
    "etag": "\"12c6-uiOOLccQ5M4dIu4xjnt8MXzWjrI\"",
    "mtime": "2026-08-10T02:20:23.768Z",
    "size": 4806,
    "path": "../public/models/face_landmark_68_tiny_model-weights_manifest.json"
  },
  "/models/face_recognition_model-weights_manifest.json": {
    "type": "application/json",
    "etag": "\"4c9f-jYqLwDX2HEyGhjqRlNGh1rJ0FQY\"",
    "mtime": "2026-08-10T02:20:23.769Z",
    "size": 19615,
    "path": "../public/models/face_recognition_model-weights_manifest.json"
  },
  "/models/face_landmark_68_tiny_model.bin": {
    "type": "application/octet-stream",
    "etag": "\"12da8-O/wXA0Tpx1GiFR3yFaK0/8/W7nU\"",
    "mtime": "2026-08-10T02:20:23.769Z",
    "size": 77224,
    "path": "../public/models/face_landmark_68_tiny_model.bin"
  },
  "/models/tiny_face_detector_model-weights_manifest.json": {
    "type": "application/json",
    "etag": "\"c93-1fFvS33OBi7EWgUx6fZDwoVVPCI\"",
    "mtime": "2026-08-10T02:20:23.768Z",
    "size": 3219,
    "path": "../public/models/tiny_face_detector_model-weights_manifest.json"
  },
  "/_nuxt/-9N9bo6O.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"12d3-AmGbiSLJXu9RtAt3N79gEJxHnNE\"",
    "mtime": "2026-08-10T02:20:23.754Z",
    "size": 4819,
    "path": "../public/_nuxt/-9N9bo6O.js"
  },
  "/_nuxt/0tr5OsS4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1db5-zZoFxignETPUyGz/7A3/TvjkP+A\"",
    "mtime": "2026-08-10T02:20:23.671Z",
    "size": 7605,
    "path": "../public/_nuxt/0tr5OsS4.js"
  },
  "/_nuxt/1YAKU1Cj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"22b2-CF/gGLPG697/DlL4b2/9qL+HrU8\"",
    "mtime": "2026-08-10T02:20:23.671Z",
    "size": 8882,
    "path": "../public/_nuxt/1YAKU1Cj.js"
  },
  "/_nuxt/1YvP9o-j.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"157a-GcY7DiOHGW+9kGNw2pA68Lb6LzM\"",
    "mtime": "2026-08-10T02:20:23.671Z",
    "size": 5498,
    "path": "../public/_nuxt/1YvP9o-j.js"
  },
  "/_nuxt/2EQbG1eR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d45-wF2R55qoKz5G5ki0jpcSF6lCKjM\"",
    "mtime": "2026-08-10T02:20:23.671Z",
    "size": 3397,
    "path": "../public/_nuxt/2EQbG1eR.js"
  },
  "/_nuxt/4swppn3N.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"74d9-YBbf6+e1XPbUrPgu/nCFzLtlFqM\"",
    "mtime": "2026-08-10T02:20:23.673Z",
    "size": 29913,
    "path": "../public/_nuxt/4swppn3N.js"
  },
  "/_nuxt/4bdKK39j.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f38-n9jsbMXM/zHBIrdWE8pMhYwtOfI\"",
    "mtime": "2026-08-10T02:20:23.672Z",
    "size": 3896,
    "path": "../public/_nuxt/4bdKK39j.js"
  },
  "/_nuxt/7odiGrML.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4d40-VwoE6nb3vlYMDnCf+0OdiBLZNUc\"",
    "mtime": "2026-08-10T02:20:23.674Z",
    "size": 19776,
    "path": "../public/_nuxt/7odiGrML.js"
  },
  "/_nuxt/7GXmr2Qk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"e57b-9CLLlacIFmU5icePlt+PQGcTwT0\"",
    "mtime": "2026-08-10T02:20:23.673Z",
    "size": 58747,
    "path": "../public/_nuxt/7GXmr2Qk.js"
  },
  "/_nuxt/B1WTQHXa.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"190d-vRLt8gGdJ3wpya+5H3pvgKxAitY\"",
    "mtime": "2026-08-10T02:20:23.674Z",
    "size": 6413,
    "path": "../public/_nuxt/B1WTQHXa.js"
  },
  "/_nuxt/B1QluFfh.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f4d3-h13mmIJ42+/0td0zVC8A7r//eL0\"",
    "mtime": "2026-08-10T02:20:23.675Z",
    "size": 62675,
    "path": "../public/_nuxt/B1QluFfh.js"
  },
  "/_nuxt/9GouxMbU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1a4f-V862wPsXD93wmijG/75Q4jW6UgU\"",
    "mtime": "2026-08-10T02:20:23.675Z",
    "size": 6735,
    "path": "../public/_nuxt/9GouxMbU.js"
  },
  "/_nuxt/B1dptxqR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f4f-YbLeSbPBUY1gYRO1yfB1FqdxrYM\"",
    "mtime": "2026-08-10T02:20:23.674Z",
    "size": 3919,
    "path": "../public/_nuxt/B1dptxqR.js"
  },
  "/_nuxt/B3ceVaD9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1ec9-OxjI7NENW4Lm2y/4T/jpZ7tYYTE\"",
    "mtime": "2026-08-10T02:20:23.675Z",
    "size": 7881,
    "path": "../public/_nuxt/B3ceVaD9.js"
  },
  "/_nuxt/B24TwTN3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"26e3-aF/rmBr3ft/qUUt8hq0osubnpkM\"",
    "mtime": "2026-08-10T02:20:23.675Z",
    "size": 9955,
    "path": "../public/_nuxt/B24TwTN3.js"
  },
  "/_nuxt/B4Zi-qNN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"e4a-3yO/Jdk1w8EC26mgb9CI2vodwUw\"",
    "mtime": "2026-08-10T02:20:23.676Z",
    "size": 3658,
    "path": "../public/_nuxt/B4Zi-qNN.js"
  },
  "/_nuxt/BBCoi-Np.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1bfa-L3laYze67F2en5MeSPz8V/3AwzA\"",
    "mtime": "2026-08-10T02:20:23.676Z",
    "size": 7162,
    "path": "../public/_nuxt/BBCoi-Np.js"
  },
  "/_nuxt/BBQmIbw7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3eb0-eDMFPnwz19Q1HSTT3cVMlNmgHCo\"",
    "mtime": "2026-08-10T02:20:23.676Z",
    "size": 16048,
    "path": "../public/_nuxt/BBQmIbw7.js"
  },
  "/models/tiny_face_detector_model.bin": {
    "type": "application/octet-stream",
    "etag": "\"2f329-8wIN668Hg0e1yq/0v23OLzedILw\"",
    "mtime": "2026-08-10T02:20:23.770Z",
    "size": 193321,
    "path": "../public/models/tiny_face_detector_model.bin"
  },
  "/_nuxt/BBkUJ3cW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2193-hOf7qtRKkH/lp+23jbpWfZYzvuU\"",
    "mtime": "2026-08-10T02:20:23.676Z",
    "size": 8595,
    "path": "../public/_nuxt/BBkUJ3cW.js"
  },
  "/_nuxt/BCDUkCyo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"9a7-HY0canx7nw0ldnG+1EbvoHop4Zw\"",
    "mtime": "2026-08-10T02:20:23.677Z",
    "size": 2471,
    "path": "../public/_nuxt/BCDUkCyo.js"
  },
  "/_nuxt/BCFbMYtV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"45e6-J89msl7bBiRDK99zFVKAeZN9k6k\"",
    "mtime": "2026-08-10T02:20:23.677Z",
    "size": 17894,
    "path": "../public/_nuxt/BCFbMYtV.js"
  },
  "/_nuxt/BCKDMxCb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"17e4-zEQvRru0l7lH3s5fsmXXWwkgnRk\"",
    "mtime": "2026-08-10T02:20:23.677Z",
    "size": 6116,
    "path": "../public/_nuxt/BCKDMxCb.js"
  },
  "/_nuxt/BG7bIoXd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1c0b-Hq/0W4ys6vTt/LRQxNF2vPD2zN0\"",
    "mtime": "2026-08-10T02:20:23.678Z",
    "size": 7179,
    "path": "../public/_nuxt/BG7bIoXd.js"
  },
  "/_nuxt/BI_0r0LB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d60-XYmjRwqzuBRsySPOpoAMYVY0hAk\"",
    "mtime": "2026-08-10T02:20:23.678Z",
    "size": 3424,
    "path": "../public/_nuxt/BI_0r0LB.js"
  },
  "/_nuxt/BMNVZkZL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"142d-Ygsp3522pHGV6HDI3iSii56c0aw\"",
    "mtime": "2026-08-10T02:20:23.678Z",
    "size": 5165,
    "path": "../public/_nuxt/BMNVZkZL.js"
  },
  "/_nuxt/BHgydmkI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"65dd-5tCXwd8LZC7riyixydWFR0heq2E\"",
    "mtime": "2026-08-10T02:20:23.678Z",
    "size": 26077,
    "path": "../public/_nuxt/BHgydmkI.js"
  },
  "/_nuxt/BPLYAgHC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1c06-d7kcK3MJQo3uXGxSVGPlP2cGsYA\"",
    "mtime": "2026-08-10T02:20:23.680Z",
    "size": 7174,
    "path": "../public/_nuxt/BPLYAgHC.js"
  },
  "/_nuxt/BPbDvSMx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1478-ZWpV/oTzhnPtfi5WjAEMKyI4DvA\"",
    "mtime": "2026-08-10T02:20:23.680Z",
    "size": 5240,
    "path": "../public/_nuxt/BPbDvSMx.js"
  },
  "/_nuxt/BNrhn9y0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1a78-7HENuiG6jLgo1NTZfzwGCsNlM+4\"",
    "mtime": "2026-08-10T02:20:23.678Z",
    "size": 6776,
    "path": "../public/_nuxt/BNrhn9y0.js"
  },
  "/_nuxt/BQoM7R6z.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1cba-JNwGWCUiryKxkMmulMKJjYIlJDA\"",
    "mtime": "2026-08-10T02:20:23.680Z",
    "size": 7354,
    "path": "../public/_nuxt/BQoM7R6z.js"
  },
  "/_nuxt/BSGLFL75.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"fff-RSbjyx00ZDXyLpXxwf9x6RY1BIg\"",
    "mtime": "2026-08-10T02:20:23.680Z",
    "size": 4095,
    "path": "../public/_nuxt/BSGLFL75.js"
  },
  "/_nuxt/BTQP00Bq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"763-YJKZg3JlPV4hJaQYtsXQxs0Lcgw\"",
    "mtime": "2026-08-10T02:20:23.681Z",
    "size": 1891,
    "path": "../public/_nuxt/BTQP00Bq.js"
  },
  "/_nuxt/BTfcyrVK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2810-hD9+ge0Qpy/+Odzk8YH3ZJ9BshE\"",
    "mtime": "2026-08-10T02:20:23.679Z",
    "size": 10256,
    "path": "../public/_nuxt/BTfcyrVK.js"
  },
  "/_nuxt/BUuKFMHu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b6-0FA4gExO2XjAiPR/6/RpzCEDZPQ\"",
    "mtime": "2026-08-10T02:20:23.680Z",
    "size": 182,
    "path": "../public/_nuxt/BUuKFMHu.js"
  },
  "/_nuxt/BV-zmPto.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3c32-M/piUCiEJOFTXv3gX4ZZXs0Hb28\"",
    "mtime": "2026-08-10T02:20:23.681Z",
    "size": 15410,
    "path": "../public/_nuxt/BV-zmPto.js"
  },
  "/_nuxt/BV8lDo2L.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1a16-7/qfVjKfSqUMsEf8nImUuCo5SdA\"",
    "mtime": "2026-08-10T02:20:23.682Z",
    "size": 6678,
    "path": "../public/_nuxt/BV8lDo2L.js"
  },
  "/_nuxt/BVWsLtAR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"12cc-Oeibrq0daZ+QY8/ugiS1SCJg7kE\"",
    "mtime": "2026-08-10T02:20:23.682Z",
    "size": 4812,
    "path": "../public/_nuxt/BVWsLtAR.js"
  },
  "/_nuxt/BVXVOoAY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"223c-Du3zjn8lfnYL3TxBywFkWCJSxBI\"",
    "mtime": "2026-08-10T02:20:23.682Z",
    "size": 8764,
    "path": "../public/_nuxt/BVXVOoAY.js"
  },
  "/_nuxt/BXdHABye.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1a32-o9547DOeHco0sJczs2DbVfa2YV8\"",
    "mtime": "2026-08-10T02:20:23.682Z",
    "size": 6706,
    "path": "../public/_nuxt/BXdHABye.js"
  },
  "/_nuxt/BZU80-v-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1d94-vaY1fQ79JKELxW1eJlGXWEfkzsQ\"",
    "mtime": "2026-08-10T02:20:23.683Z",
    "size": 7572,
    "path": "../public/_nuxt/BZU80-v-.js"
  },
  "/_nuxt/B_g5w2je.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"c79-dtEjeqlFj5R9fgSX1zt+utpbTVI\"",
    "mtime": "2026-08-10T02:20:23.683Z",
    "size": 3193,
    "path": "../public/_nuxt/B_g5w2je.js"
  },
  "/_nuxt/BYEGzEI8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b6-v1taK5si++WBg3plKLMCH6X4ack\"",
    "mtime": "2026-08-10T02:20:23.682Z",
    "size": 182,
    "path": "../public/_nuxt/BYEGzEI8.js"
  },
  "/_nuxt/B_GOwVOC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"362d-SVs5tVK/8z3f5jc5Hix4T5u1Jik\"",
    "mtime": "2026-08-10T02:20:23.683Z",
    "size": 13869,
    "path": "../public/_nuxt/B_GOwVOC.js"
  },
  "/_nuxt/Ba2RqLs5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3499-zRe8bomEb0XqCAl+2+MK4Kb5eZE\"",
    "mtime": "2026-08-10T02:20:23.683Z",
    "size": 13465,
    "path": "../public/_nuxt/Ba2RqLs5.js"
  },
  "/_nuxt/BbtA9y_R.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1d34-KD4jm7Wt8wABkb2Feq4TRARamNU\"",
    "mtime": "2026-08-10T02:20:23.684Z",
    "size": 7476,
    "path": "../public/_nuxt/BbtA9y_R.js"
  },
  "/_nuxt/BcU4hzv0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"247c-BoooRHMp1leIz3UgmBsq7zlIEak\"",
    "mtime": "2026-08-10T02:20:23.684Z",
    "size": 9340,
    "path": "../public/_nuxt/BcU4hzv0.js"
  },
  "/_nuxt/BcRhaDRl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"34bf-/fDCcSH92jV4pDfLIcQgV3Yvm+E\"",
    "mtime": "2026-08-10T02:20:23.684Z",
    "size": 13503,
    "path": "../public/_nuxt/BcRhaDRl.js"
  },
  "/_nuxt/Becaryo3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2cba-JesLmNkA+QOSR+xGvcjiqBw6PYw\"",
    "mtime": "2026-08-10T02:20:23.684Z",
    "size": 11450,
    "path": "../public/_nuxt/Becaryo3.js"
  },
  "/_nuxt/BhbNHvVQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"298-NGf4uhoLlcnZ84K4MTTryJA+Lso\"",
    "mtime": "2026-08-10T02:20:23.685Z",
    "size": 664,
    "path": "../public/_nuxt/BhbNHvVQ.js"
  },
  "/_nuxt/Besj0VMm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7543-fETqz3eBsiIuZkzJ97RSqqKs8Tk\"",
    "mtime": "2026-08-10T02:20:23.697Z",
    "size": 30019,
    "path": "../public/_nuxt/Besj0VMm.js"
  },
  "/_nuxt/BkeuTrQF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"107a-w5/wJGgCjkJQPKRpiDqoaPpe9bo\"",
    "mtime": "2026-08-10T02:20:23.686Z",
    "size": 4218,
    "path": "../public/_nuxt/BkeuTrQF.js"
  },
  "/_nuxt/BjDdBrK7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"15fa-xcE02KRxIN4BKZjh2d77b1HqrN0\"",
    "mtime": "2026-08-10T02:20:23.685Z",
    "size": 5626,
    "path": "../public/_nuxt/BjDdBrK7.js"
  },
  "/_nuxt/Binl-yOZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"308e-xSzKxLEHXDeZ4nKjhdmN7jnglg4\"",
    "mtime": "2026-08-10T02:20:23.685Z",
    "size": 12430,
    "path": "../public/_nuxt/Binl-yOZ.js"
  },
  "/_nuxt/Bkzvs5wl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"17b2-EBOBdIM208YKkjfyfYtoM0jvcd4\"",
    "mtime": "2026-08-10T02:20:23.686Z",
    "size": 6066,
    "path": "../public/_nuxt/Bkzvs5wl.js"
  },
  "/_nuxt/BrCRSjN2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16ea-+b7QpIDMgjH9pD0WmCA0+pbXuds\"",
    "mtime": "2026-08-10T02:20:23.687Z",
    "size": 5866,
    "path": "../public/_nuxt/BrCRSjN2.js"
  },
  "/_nuxt/BpnvxmH9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"715-f8xVhTn+xpwynWmbJswR5D798fI\"",
    "mtime": "2026-08-10T02:20:23.686Z",
    "size": 1813,
    "path": "../public/_nuxt/BpnvxmH9.js"
  },
  "/_nuxt/BtsAqPnS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2832-/4cNyC61HTiYnlsUoUowip7o6qo\"",
    "mtime": "2026-08-10T02:20:23.687Z",
    "size": 10290,
    "path": "../public/_nuxt/BtsAqPnS.js"
  },
  "/_nuxt/BuWtKGug.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1ce7-++/Ao/rCsQgkwDwdXrbjCuX7ve4\"",
    "mtime": "2026-08-10T02:20:23.688Z",
    "size": 7399,
    "path": "../public/_nuxt/BuWtKGug.js"
  },
  "/_nuxt/Bl9G3YjM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2588-ErkEnNc5Bsbf3pKxwWqrmkcqJaE\"",
    "mtime": "2026-08-10T02:20:23.686Z",
    "size": 9608,
    "path": "../public/_nuxt/Bl9G3YjM.js"
  },
  "/_nuxt/Bv6s2SNz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d2b-spniUhhwdx+Sl8frrQP1X0slZC4\"",
    "mtime": "2026-08-10T02:20:23.688Z",
    "size": 3371,
    "path": "../public/_nuxt/Bv6s2SNz.js"
  },
  "/_nuxt/Bw-fBBL1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1bed-ADg7YxFWhrZCbgbr8wodnMbZL7o\"",
    "mtime": "2026-08-10T02:20:23.688Z",
    "size": 7149,
    "path": "../public/_nuxt/Bw-fBBL1.js"
  },
  "/_nuxt/C0QEPJsZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"18ea-Vj3DfEDwXeWsO+d0vMulLLLlMBk\"",
    "mtime": "2026-08-10T02:20:23.689Z",
    "size": 6378,
    "path": "../public/_nuxt/C0QEPJsZ.js"
  },
  "/_nuxt/C0xuxyjF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"227f-8UegRfjFxNDS2LS360xM9uRr7so\"",
    "mtime": "2026-08-10T02:20:23.690Z",
    "size": 8831,
    "path": "../public/_nuxt/C0xuxyjF.js"
  },
  "/_nuxt/C1kh_4BX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"98d-KOUz26iSQcN8SazhdTiKTpJPW+8\"",
    "mtime": "2026-08-10T02:20:23.691Z",
    "size": 2445,
    "path": "../public/_nuxt/C1kh_4BX.js"
  },
  "/_nuxt/C7DaiQSP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"348-3lhddqk6OfTrGQeDy4DD3OR6/mU\"",
    "mtime": "2026-08-10T02:20:23.691Z",
    "size": 840,
    "path": "../public/_nuxt/C7DaiQSP.js"
  },
  "/_nuxt/C8RKbD8j.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"106d-tQcNZgfzwBQunh+ZIjPfK6Tx2eY\"",
    "mtime": "2026-08-10T02:20:23.692Z",
    "size": 4205,
    "path": "../public/_nuxt/C8RKbD8j.js"
  },
  "/_nuxt/C9jehbTH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1fa0-/vEoJ7bDV5Guuw8JLYNH7ju1pyc\"",
    "mtime": "2026-08-10T02:20:23.692Z",
    "size": 8096,
    "path": "../public/_nuxt/C9jehbTH.js"
  },
  "/_nuxt/CE0UAYMr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"40-AOcz0c2ml9Y34SZXwwnK2t7YGq8\"",
    "mtime": "2026-08-10T02:20:23.693Z",
    "size": 64,
    "path": "../public/_nuxt/CE0UAYMr.js"
  },
  "/_nuxt/CDAhmGe4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b7a-IMi4YJcuUQ5BeMxN/ZYxdyvyQaw\"",
    "mtime": "2026-08-10T02:20:23.693Z",
    "size": 2938,
    "path": "../public/_nuxt/CDAhmGe4.js"
  },
  "/_nuxt/CFiosn0E.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"509a-GWfI/YQAP7z2N1qhQms5NfdVBLk\"",
    "mtime": "2026-08-10T02:20:23.694Z",
    "size": 20634,
    "path": "../public/_nuxt/CFiosn0E.js"
  },
  "/_nuxt/CHHD_oEE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"14ed-WFgqJNF0/mj6+HYHjuA/oK3Et/g\"",
    "mtime": "2026-08-10T02:20:23.694Z",
    "size": 5357,
    "path": "../public/_nuxt/CHHD_oEE.js"
  },
  "/_nuxt/CHmDL7Eu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"18a1-kbWzisn0kM5bWpAeDaPH61wtXnk\"",
    "mtime": "2026-08-10T02:20:23.695Z",
    "size": 6305,
    "path": "../public/_nuxt/CHmDL7Eu.js"
  },
  "/_nuxt/CFyKFsvl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"849-so9Urn9adBPOU25Xnd51r2vitQM\"",
    "mtime": "2026-08-10T02:20:23.694Z",
    "size": 2121,
    "path": "../public/_nuxt/CFyKFsvl.js"
  },
  "/_nuxt/CIXocFYY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"44ad-TSTemIk0xGVJklNTTZrEcBiYD2w\"",
    "mtime": "2026-08-10T02:20:23.695Z",
    "size": 17581,
    "path": "../public/_nuxt/CIXocFYY.js"
  },
  "/_nuxt/CLXLVhRE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2757-U2GoipX4CDaLViwbouBx75t3fjo\"",
    "mtime": "2026-08-10T02:20:23.695Z",
    "size": 10071,
    "path": "../public/_nuxt/CLXLVhRE.js"
  },
  "/_nuxt/CLoH5_Q3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1cdc-FQlUareoU5seaCQEdlTb2OcBync\"",
    "mtime": "2026-08-10T02:20:23.696Z",
    "size": 7388,
    "path": "../public/_nuxt/CLoH5_Q3.js"
  },
  "/_nuxt/COBVo61_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1a22-6TsyRvtvNGmAyqPGO2341ikyoMY\"",
    "mtime": "2026-08-10T02:20:23.698Z",
    "size": 6690,
    "path": "../public/_nuxt/COBVo61_.js"
  },
  "/_nuxt/COlj8q_u.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"176d-w30uxnUCfd2r1cB4DoFeYMOYwt4\"",
    "mtime": "2026-08-10T02:20:23.697Z",
    "size": 5997,
    "path": "../public/_nuxt/COlj8q_u.js"
  },
  "/_nuxt/CRpDrsnj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1fff-XCHxtMRYFRQp3HprlQiRa3z1x50\"",
    "mtime": "2026-08-10T02:20:23.697Z",
    "size": 8191,
    "path": "../public/_nuxt/CRpDrsnj.js"
  },
  "/_nuxt/CRvts0Ps.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f39-70Yh6gcgmVQD90nvwF1u2vspMLo\"",
    "mtime": "2026-08-10T02:20:23.698Z",
    "size": 3897,
    "path": "../public/_nuxt/CRvts0Ps.js"
  },
  "/_nuxt/CTN8dY-S.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"c06-a3ps0zTvn9G4dhZeDHpgNj8cPAM\"",
    "mtime": "2026-08-10T02:20:23.698Z",
    "size": 3078,
    "path": "../public/_nuxt/CTN8dY-S.js"
  },
  "/_nuxt/CTPdlhxz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"cbd-WQJY2VjMhS/F+/CBExqBfIt3yZw\"",
    "mtime": "2026-08-10T02:20:23.698Z",
    "size": 3261,
    "path": "../public/_nuxt/CTPdlhxz.js"
  },
  "/_nuxt/CTgQQoPt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"fc7-15aFpZ5BEmIpWQCQX3EykQ5FhAY\"",
    "mtime": "2026-08-10T02:20:23.698Z",
    "size": 4039,
    "path": "../public/_nuxt/CTgQQoPt.js"
  },
  "/_nuxt/CUiZfxra.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2ede-r+3IchobQrrMQIc1LKErhROcVmY\"",
    "mtime": "2026-08-10T02:20:23.698Z",
    "size": 11998,
    "path": "../public/_nuxt/CUiZfxra.js"
  },
  "/_nuxt/CXSPM1nj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"20d4-6AvDcLRz1nMLC9mla0AMhXiCvr0\"",
    "mtime": "2026-08-10T02:20:23.699Z",
    "size": 8404,
    "path": "../public/_nuxt/CXSPM1nj.js"
  },
  "/_nuxt/CYiuy6cw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"eec-MjaqLMpvOtHusSkGnf0VZIDrl5c\"",
    "mtime": "2026-08-10T02:20:23.699Z",
    "size": 3820,
    "path": "../public/_nuxt/CYiuy6cw.js"
  },
  "/_nuxt/CZYgdfRe.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"23cf-WcPEWwGMlnp6nBZv7702qnc68fE\"",
    "mtime": "2026-08-10T02:20:23.699Z",
    "size": 9167,
    "path": "../public/_nuxt/CZYgdfRe.js"
  },
  "/_nuxt/Cbl232LR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1724-qPa31UYVh5hM7qswzTdz1RsIFkU\"",
    "mtime": "2026-08-10T02:20:23.700Z",
    "size": 5924,
    "path": "../public/_nuxt/Cbl232LR.js"
  },
  "/_nuxt/Cbzr5aME.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"13e7-ERjHP41dtNXVAcUz96coDVxHyJk\"",
    "mtime": "2026-08-10T02:20:23.701Z",
    "size": 5095,
    "path": "../public/_nuxt/Cbzr5aME.js"
  },
  "/_nuxt/CdfhBbTL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2b3f-iZVIgh3lPweEV9Hu5rv4ZPJvAkI\"",
    "mtime": "2026-08-10T02:20:23.701Z",
    "size": 11071,
    "path": "../public/_nuxt/CdfhBbTL.js"
  },
  "/models/face_recognition_model.bin": {
    "type": "application/octet-stream",
    "etag": "\"625400-WARdwHLPE+xrp5Xpv2Pq7E0NlV0\"",
    "mtime": "2026-08-10T02:20:23.784Z",
    "size": 6444032,
    "path": "../public/models/face_recognition_model.bin"
  },
  "/_nuxt/CD9jNrC-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"144352-MC/1dsuDkIyoCChjicM2gjfMECs\"",
    "mtime": "2026-08-10T02:20:23.696Z",
    "size": 1327954,
    "path": "../public/_nuxt/CD9jNrC-.js"
  },
  "/_nuxt/Ce5SyMoq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"12e0-1ddfQ30VIo6XlbXClrYNOvesmDo\"",
    "mtime": "2026-08-10T02:20:23.701Z",
    "size": 4832,
    "path": "../public/_nuxt/Ce5SyMoq.js"
  },
  "/_nuxt/CepvNWHk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"12e7-i+AcalMlHjo0O1uelH9X48MWT/g\"",
    "mtime": "2026-08-10T02:20:23.702Z",
    "size": 4839,
    "path": "../public/_nuxt/CepvNWHk.js"
  },
  "/_nuxt/CgvRsAnm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1e05-2HlgRwvgmD/hPdeY+w56FI7tUMc\"",
    "mtime": "2026-08-10T02:20:23.703Z",
    "size": 7685,
    "path": "../public/_nuxt/CgvRsAnm.js"
  },
  "/_nuxt/CgwqMTWq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2b55-7I6B5zIG6DYReycB0G4IYUxsTMw\"",
    "mtime": "2026-08-10T02:20:23.703Z",
    "size": 11093,
    "path": "../public/_nuxt/CgwqMTWq.js"
  },
  "/_nuxt/ChUre6e_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5d0b-yROMurmSE2EFRzaNbX+/Ffd0/xY\"",
    "mtime": "2026-08-10T02:20:23.703Z",
    "size": 23819,
    "path": "../public/_nuxt/ChUre6e_.js"
  },
  "/_nuxt/CiAa1AiL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1a78-jZNcb1ICpV2Z42hrWR4bHSMUDks\"",
    "mtime": "2026-08-10T02:20:23.703Z",
    "size": 6776,
    "path": "../public/_nuxt/CiAa1AiL.js"
  },
  "/_nuxt/CifgGL_R.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1447-fvOUbOggZwDBP2kks6/nZOYBQpA\"",
    "mtime": "2026-08-10T02:20:23.702Z",
    "size": 5191,
    "path": "../public/_nuxt/CifgGL_R.js"
  },
  "/_nuxt/Cin5WjTa.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2335-mb5pyvnsWqlBhw9E6mmb636jCUE\"",
    "mtime": "2026-08-10T02:20:23.704Z",
    "size": 9013,
    "path": "../public/_nuxt/Cin5WjTa.js"
  },
  "/_nuxt/Ck1VD2C2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"28ae-vsQ4E2nDhwB9lEU/GszZc43vZ7s\"",
    "mtime": "2026-08-10T02:20:23.703Z",
    "size": 10414,
    "path": "../public/_nuxt/Ck1VD2C2.js"
  },
  "/_nuxt/Cl8R6w2h.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ec0-xSlXnCs+lXsK1vUtkH8BEwsRSWE\"",
    "mtime": "2026-08-10T02:20:23.704Z",
    "size": 3776,
    "path": "../public/_nuxt/Cl8R6w2h.js"
  },
  "/_nuxt/ClFUB_Bn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1547-KPeGsHP4y6DlBivjkgSSpxgYQAc\"",
    "mtime": "2026-08-10T02:20:23.706Z",
    "size": 5447,
    "path": "../public/_nuxt/ClFUB_Bn.js"
  },
  "/_nuxt/CnPXL5qL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"20ba-B3wWSOaNIUyJy0Um6ARTUDbeTtY\"",
    "mtime": "2026-08-10T02:20:23.706Z",
    "size": 8378,
    "path": "../public/_nuxt/CnPXL5qL.js"
  },
  "/_nuxt/Co9GRX9V.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7e07-VlPUixH7MZEddjE3n4wmGSpLE6c\"",
    "mtime": "2026-08-10T02:20:23.707Z",
    "size": 32263,
    "path": "../public/_nuxt/Co9GRX9V.js"
  },
  "/_nuxt/Coic2-3B.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16f5-crkipW/1r20Th+bFsnbNst3x6ys\"",
    "mtime": "2026-08-10T02:20:23.708Z",
    "size": 5877,
    "path": "../public/_nuxt/Coic2-3B.js"
  },
  "/_nuxt/Cp_AhuT0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2f06-Bj49xBYqIkjxV12xtyj8RuyFElA\"",
    "mtime": "2026-08-10T02:20:23.708Z",
    "size": 12038,
    "path": "../public/_nuxt/Cp_AhuT0.js"
  },
  "/_nuxt/CqDbEFy1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"64ec-KYpEt1UVC30c+Gc9tJ/Zm1GOaQo\"",
    "mtime": "2026-08-10T02:20:23.709Z",
    "size": 25836,
    "path": "../public/_nuxt/CqDbEFy1.js"
  },
  "/_nuxt/CqPeluFc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4213-kumZFPKEEkdG73I/NAc+ye+Xvwk\"",
    "mtime": "2026-08-10T02:20:23.709Z",
    "size": 16915,
    "path": "../public/_nuxt/CqPeluFc.js"
  },
  "/_nuxt/Cs9-OUEF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1229-aUySrk2tU/ZECyD48WVmbExbIOA\"",
    "mtime": "2026-08-10T02:20:23.720Z",
    "size": 4649,
    "path": "../public/_nuxt/Cs9-OUEF.js"
  },
  "/_nuxt/CsAbr16d.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"30f9-A8O+KuOFQCRrb496rmKGljP+UTo\"",
    "mtime": "2026-08-10T02:20:23.709Z",
    "size": 12537,
    "path": "../public/_nuxt/CsAbr16d.js"
  },
  "/_nuxt/CsLyy0vF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"252-c6uFmTCmKpjji2lwrXxhoQvB0Yk\"",
    "mtime": "2026-08-10T02:20:23.709Z",
    "size": 594,
    "path": "../public/_nuxt/CsLyy0vF.js"
  },
  "/_nuxt/CslESysB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"122e-CGcZaDfK1bRiF+mvcymMqsiwIaM\"",
    "mtime": "2026-08-10T02:20:23.710Z",
    "size": 4654,
    "path": "../public/_nuxt/CslESysB.js"
  },
  "/_nuxt/Cv7FF-ZT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d007-5neYIhOksaHSfkvAHkRQR9S6wyA\"",
    "mtime": "2026-08-10T02:20:23.712Z",
    "size": 53255,
    "path": "../public/_nuxt/Cv7FF-ZT.js"
  },
  "/_nuxt/Cve-6ruA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f9-nmjdhrUs92Gdhji+fd/14lKYmRk\"",
    "mtime": "2026-08-10T02:20:23.710Z",
    "size": 249,
    "path": "../public/_nuxt/Cve-6ruA.js"
  },
  "/_nuxt/CvpPC9tX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2106-D24aUEytZVZ70QVuyhjX5Y19xlI\"",
    "mtime": "2026-08-10T02:20:23.710Z",
    "size": 8454,
    "path": "../public/_nuxt/CvpPC9tX.js"
  },
  "/_nuxt/Cw4pWLg_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27e9-8OSn63VKqXUaAaQQysbwiFpOwik\"",
    "mtime": "2026-08-10T02:20:23.710Z",
    "size": 10217,
    "path": "../public/_nuxt/Cw4pWLg_.js"
  },
  "/_nuxt/Cwhywol1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2d77-h8zVeJt8glLeiS2Jv/cxpEfYJXE\"",
    "mtime": "2026-08-10T02:20:23.711Z",
    "size": 11639,
    "path": "../public/_nuxt/Cwhywol1.js"
  },
  "/_nuxt/CyU2vACN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1563-c9oJsR8fiGGe8DaYqILpPJ9B4a4\"",
    "mtime": "2026-08-10T02:20:23.711Z",
    "size": 5475,
    "path": "../public/_nuxt/CyU2vACN.js"
  },
  "/_nuxt/Cyfp0DSR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"18b5-hMjPTtGjDX4X2bt26voATlyLn3I\"",
    "mtime": "2026-08-10T02:20:23.712Z",
    "size": 6325,
    "path": "../public/_nuxt/Cyfp0DSR.js"
  },
  "/_nuxt/CylQ4wHU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1679-dEahv0BphJ6CDsFlpeC4GaFyJ2o\"",
    "mtime": "2026-08-10T02:20:23.711Z",
    "size": 5753,
    "path": "../public/_nuxt/CylQ4wHU.js"
  },
  "/_nuxt/CzIDoRIK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3c56-xdEcNfmDqUDWluh5+Gmef1BfFCQ\"",
    "mtime": "2026-08-10T02:20:23.712Z",
    "size": 15446,
    "path": "../public/_nuxt/CzIDoRIK.js"
  },
  "/_nuxt/D-c-XhJ4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1801-P1SOKQFnn9XK8i+gWVyPbzuJ1Ls\"",
    "mtime": "2026-08-10T02:20:23.712Z",
    "size": 6145,
    "path": "../public/_nuxt/D-c-XhJ4.js"
  },
  "/_nuxt/D17nQdyz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2a45-085UxATU9dsv2dj/so2uDkB9ikI\"",
    "mtime": "2026-08-10T02:20:23.713Z",
    "size": 10821,
    "path": "../public/_nuxt/D17nQdyz.js"
  },
  "/_nuxt/D1v2WDOv.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2de-XdFnC4NLxcePt55uvUpUyksdngM\"",
    "mtime": "2026-08-10T02:20:23.713Z",
    "size": 734,
    "path": "../public/_nuxt/D1v2WDOv.js"
  },
  "/_nuxt/D23ORnGZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1e7d-vteeKAhy7fzvBTk4TYqgrypFSyw\"",
    "mtime": "2026-08-10T02:20:23.713Z",
    "size": 7805,
    "path": "../public/_nuxt/D23ORnGZ.js"
  },
  "/_nuxt/D2_NzJQD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1d88-TY3RP1Uj5PZiHz9DJATHM18rA3o\"",
    "mtime": "2026-08-10T02:20:23.714Z",
    "size": 7560,
    "path": "../public/_nuxt/D2_NzJQD.js"
  },
  "/_nuxt/D3PQVYeF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3ae6-k3OwnQdhgDKlLJAnfSCGkeNhhBQ\"",
    "mtime": "2026-08-10T02:20:23.713Z",
    "size": 15078,
    "path": "../public/_nuxt/D3PQVYeF.js"
  },
  "/_nuxt/D3wi_Yuc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"efb-Wvh4n+2AD7OGKRBWZoNUkzvJy1I\"",
    "mtime": "2026-08-10T02:20:23.714Z",
    "size": 3835,
    "path": "../public/_nuxt/D3wi_Yuc.js"
  },
  "/_nuxt/D50Ofaep.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2475-M9Qf2/J+XfnzHl7t8p1GZ6OVO/4\"",
    "mtime": "2026-08-10T02:20:23.714Z",
    "size": 9333,
    "path": "../public/_nuxt/D50Ofaep.js"
  },
  "/_nuxt/D54UuRe5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2695-UwD/7oYbVVeZHSJUZDVENMyHWRg\"",
    "mtime": "2026-08-10T02:20:23.715Z",
    "size": 9877,
    "path": "../public/_nuxt/D54UuRe5.js"
  },
  "/_nuxt/D5I0fjqI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1e52-PvxbDHW0Z5lUHBX1KN9F1fGxC3U\"",
    "mtime": "2026-08-10T02:20:23.715Z",
    "size": 7762,
    "path": "../public/_nuxt/D5I0fjqI.js"
  },
  "/_nuxt/D6s8wyIK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1d9e-4vSkWL9nGueiSSPi62O6idtmGi0\"",
    "mtime": "2026-08-10T02:20:23.715Z",
    "size": 7582,
    "path": "../public/_nuxt/D6s8wyIK.js"
  },
  "/_nuxt/D72HY0KT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"25b0-hCGlirB0UYezP5l5384fRZIUUiE\"",
    "mtime": "2026-08-10T02:20:23.716Z",
    "size": 9648,
    "path": "../public/_nuxt/D72HY0KT.js"
  },
  "/_nuxt/D8lrAn2H.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"267d-TbmgMFk0yPkcVyrQ8MIhOcAMZuk\"",
    "mtime": "2026-08-10T02:20:23.715Z",
    "size": 9853,
    "path": "../public/_nuxt/D8lrAn2H.js"
  },
  "/_nuxt/D8yO2lDn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d41-91KuwVNVlI7MGQt8iHt+KvC9YWQ\"",
    "mtime": "2026-08-10T02:20:23.716Z",
    "size": 3393,
    "path": "../public/_nuxt/D8yO2lDn.js"
  },
  "/_nuxt/D9Cc4oE5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"13bc-FA9B/O4zhgEQDbNTKBivZyV1rQs\"",
    "mtime": "2026-08-10T02:20:23.717Z",
    "size": 5052,
    "path": "../public/_nuxt/D9Cc4oE5.js"
  },
  "/_nuxt/DAW_OUkv.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1ba1-MjWgd+TVqTQi9RKed3GkbY2ygN4\"",
    "mtime": "2026-08-10T02:20:23.717Z",
    "size": 7073,
    "path": "../public/_nuxt/DAW_OUkv.js"
  },
  "/_nuxt/DBhlpgmL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4a0-ARneqQgZmKXCNMp7O9sBUzTW3ZM\"",
    "mtime": "2026-08-10T02:20:23.717Z",
    "size": 1184,
    "path": "../public/_nuxt/DBhlpgmL.js"
  },
  "/_nuxt/DEE_5Ud9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"eb4-kMINPPf3pUoC4ZtCfod8ZModxD4\"",
    "mtime": "2026-08-10T02:20:23.718Z",
    "size": 3764,
    "path": "../public/_nuxt/DEE_5Ud9.js"
  },
  "/_nuxt/DFBWGtLD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2383-6F04h9fy/KX3rBYGnX+k3IgHkxc\"",
    "mtime": "2026-08-10T02:20:23.717Z",
    "size": 9091,
    "path": "../public/_nuxt/DFBWGtLD.js"
  },
  "/_nuxt/DHkp8YaM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1b1c-sdA8chIUvp8DcB5WVxoOblQMIq8\"",
    "mtime": "2026-08-10T02:20:23.718Z",
    "size": 6940,
    "path": "../public/_nuxt/DHkp8YaM.js"
  },
  "/_nuxt/DJpVt44G.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"290e-/QKAljXHRyMhCF/kgYwF/pKDJoM\"",
    "mtime": "2026-08-10T02:20:23.718Z",
    "size": 10510,
    "path": "../public/_nuxt/DJpVt44G.js"
  },
  "/_nuxt/DKd7sOMR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1092-WtZQ/1pPdPd8IikSeZNBuKAYwwo\"",
    "mtime": "2026-08-10T02:20:23.719Z",
    "size": 4242,
    "path": "../public/_nuxt/DKd7sOMR.js"
  },
  "/_nuxt/DKkU07Lx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2cda-cpvR9w/kpRfFosUYzicz4ydb0Eg\"",
    "mtime": "2026-08-10T02:20:23.720Z",
    "size": 11482,
    "path": "../public/_nuxt/DKkU07Lx.js"
  },
  "/_nuxt/DLnM479d.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1bc1-mKzYYbLfBp+nf+L2/VddoEDERek\"",
    "mtime": "2026-08-10T02:20:23.720Z",
    "size": 7105,
    "path": "../public/_nuxt/DLnM479d.js"
  },
  "/_nuxt/DMJhnVdG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"c4b-XJkSAgDC4FeAIVsm0tI0TsolDhE\"",
    "mtime": "2026-08-10T02:20:23.721Z",
    "size": 3147,
    "path": "../public/_nuxt/DMJhnVdG.js"
  },
  "/_nuxt/DLxMX4sJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"19bc-6857RImvX1r4OYMdnVZ6SmhK/HM\"",
    "mtime": "2026-08-10T02:20:23.721Z",
    "size": 6588,
    "path": "../public/_nuxt/DLxMX4sJ.js"
  },
  "/_nuxt/DMWjGM56.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2d7b-YqkZxevV3ihmkH4FUyDrpJIiB0k\"",
    "mtime": "2026-08-10T02:20:23.721Z",
    "size": 11643,
    "path": "../public/_nuxt/DMWjGM56.js"
  },
  "/_nuxt/DVQqXW85.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"75c-+ZORiqZEkU12d6U/6ZSHxDOp69U\"",
    "mtime": "2026-08-10T02:20:23.721Z",
    "size": 1884,
    "path": "../public/_nuxt/DVQqXW85.js"
  },
  "/_nuxt/DPghwS8U.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3b5b-IXdP3opUW1M+woZ2dX/5TbO5qwY\"",
    "mtime": "2026-08-10T02:20:23.721Z",
    "size": 15195,
    "path": "../public/_nuxt/DPghwS8U.js"
  },
  "/_nuxt/DWA0HWGg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2ebd-XqcdbmckfdAgrPG4455meXHadEo\"",
    "mtime": "2026-08-10T02:20:23.724Z",
    "size": 11965,
    "path": "../public/_nuxt/DWA0HWGg.js"
  },
  "/_nuxt/DXl0amOB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1213-rOXpjdYLia69v2y0H4Kr0RW5LbE\"",
    "mtime": "2026-08-10T02:20:23.725Z",
    "size": 4627,
    "path": "../public/_nuxt/DXl0amOB.js"
  },
  "/_nuxt/DYMdW2XR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2310-w64WIepMN0dhz08iWn2lGxie5G4\"",
    "mtime": "2026-08-10T02:20:23.725Z",
    "size": 8976,
    "path": "../public/_nuxt/DYMdW2XR.js"
  },
  "/_nuxt/DZjKse6x.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2429-e2i2l5Nm1FPUd+8pmvrrH7BCyYg\"",
    "mtime": "2026-08-10T02:20:23.726Z",
    "size": 9257,
    "path": "../public/_nuxt/DZjKse6x.js"
  },
  "/_nuxt/Df_qdMWg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"18cc-SGaoIRa5xmfNqWQSZ48eFxbPq0Q\"",
    "mtime": "2026-08-10T02:20:23.726Z",
    "size": 6348,
    "path": "../public/_nuxt/Df_qdMWg.js"
  },
  "/_nuxt/DiBaLA-F.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3fca-fXeEAX0hiVhUftWru+T3KCMg5h4\"",
    "mtime": "2026-08-10T02:20:23.727Z",
    "size": 16330,
    "path": "../public/_nuxt/DiBaLA-F.js"
  },
  "/_nuxt/DgBUYKuQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"23b7-foOOilXnx0X4odtmHriDJ/VD6MU\"",
    "mtime": "2026-08-10T02:20:23.727Z",
    "size": 9143,
    "path": "../public/_nuxt/DgBUYKuQ.js"
  },
  "/_nuxt/Dj61u5nn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1ce3-rm9tLkAVaknwKHCeTwjnYrjwy+g\"",
    "mtime": "2026-08-10T02:20:23.727Z",
    "size": 7395,
    "path": "../public/_nuxt/Dj61u5nn.js"
  },
  "/_nuxt/Dj9QhEqg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"403d-TfR7oZWvNdQLprs7C6nPGkmRq+s\"",
    "mtime": "2026-08-10T02:20:23.728Z",
    "size": 16445,
    "path": "../public/_nuxt/Dj9QhEqg.js"
  },
  "/_nuxt/DjOYKjgC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d3a-uBK0BHRhg1Q3ANbzAJPq+Q+p7jI\"",
    "mtime": "2026-08-10T02:20:23.727Z",
    "size": 3386,
    "path": "../public/_nuxt/DjOYKjgC.js"
  },
  "/_nuxt/Dk95y8WE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"12b7-Y7fSTRcmp2Bea9IIYvESRv56Vhs\"",
    "mtime": "2026-08-10T02:20:23.729Z",
    "size": 4791,
    "path": "../public/_nuxt/Dk95y8WE.js"
  },
  "/_nuxt/Dq8k9k53.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1d97-PrBARDuZzXXyvlv1Atw+IOETqfw\"",
    "mtime": "2026-08-10T02:20:23.728Z",
    "size": 7575,
    "path": "../public/_nuxt/Dq8k9k53.js"
  },
  "/_nuxt/DuLLX7DV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"163c-/r9x+L5+XM8rYjNFF7jWot8JK90\"",
    "mtime": "2026-08-10T02:20:23.729Z",
    "size": 5692,
    "path": "../public/_nuxt/DuLLX7DV.js"
  },
  "/_nuxt/DZ9Kr4po.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"37663-/DyGMqKFieMGivrAVvFbSPAywrQ\"",
    "mtime": "2026-08-10T02:20:23.728Z",
    "size": 226915,
    "path": "../public/_nuxt/DZ9Kr4po.js"
  },
  "/_nuxt/DvGAHQp0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1ab3-Cuqtx7e/inJ5EqorE2YXGH/VTtg\"",
    "mtime": "2026-08-10T02:20:23.729Z",
    "size": 6835,
    "path": "../public/_nuxt/DvGAHQp0.js"
  },
  "/_nuxt/DvSxdJVd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1aa0-QBmFuIPs4Yr5PJsAb6ufjz3qryk\"",
    "mtime": "2026-08-10T02:20:23.729Z",
    "size": 6816,
    "path": "../public/_nuxt/DvSxdJVd.js"
  },
  "/_nuxt/DwCSAE7b.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2649-Wqa1EwS7wkFyhO9PJqjG1Ms43HY\"",
    "mtime": "2026-08-10T02:20:23.729Z",
    "size": 9801,
    "path": "../public/_nuxt/DwCSAE7b.js"
  },
  "/_nuxt/FxkZYKKe.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1c67-yvvZgXh2CleKQYcEuc2AkAaGxcY\"",
    "mtime": "2026-08-10T02:20:23.730Z",
    "size": 7271,
    "path": "../public/_nuxt/FxkZYKKe.js"
  },
  "/_nuxt/Ek_r9NYp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"21e1-xrNPOmFo9MIkUeX5C1bxGkRHt9g\"",
    "mtime": "2026-08-10T02:20:23.730Z",
    "size": 8673,
    "path": "../public/_nuxt/Ek_r9NYp.js"
  },
  "/_nuxt/HTEinZny.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1875-04Fb85xqPJgc/q1alWitLKhlVX0\"",
    "mtime": "2026-08-10T02:20:23.731Z",
    "size": 6261,
    "path": "../public/_nuxt/HTEinZny.js"
  },
  "/_nuxt/HlWbC7Em.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"6177-PIr+hA389Ef884prg0hUYLY2Elo\"",
    "mtime": "2026-08-10T02:20:23.731Z",
    "size": 24951,
    "path": "../public/_nuxt/HlWbC7Em.js"
  },
  "/_nuxt/I5qlH50z.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2678-LOgjJp5q4MdA/r78JOXFahqiTn0\"",
    "mtime": "2026-08-10T02:20:23.731Z",
    "size": 9848,
    "path": "../public/_nuxt/I5qlH50z.js"
  },
  "/_nuxt/KKmrDVSp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1633-ITPK8cKJauOD66nK2XW7yFyWQKA\"",
    "mtime": "2026-08-10T02:20:23.732Z",
    "size": 5683,
    "path": "../public/_nuxt/KKmrDVSp.js"
  },
  "/_nuxt/LC0aQVfE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1e31-ogGfpCQEyt8sNcdXVm+wio30RXk\"",
    "mtime": "2026-08-10T02:20:23.733Z",
    "size": 7729,
    "path": "../public/_nuxt/LC0aQVfE.js"
  },
  "/_nuxt/MqdsedBX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3313-UZ0dhmM8Ij4z8l9LK79rE6L0r28\"",
    "mtime": "2026-08-10T02:20:23.733Z",
    "size": 13075,
    "path": "../public/_nuxt/MqdsedBX.js"
  },
  "/_nuxt/NYXsBnAa.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1de1-uV2TMXiDhOm68Bt1GvjULp3XMyc\"",
    "mtime": "2026-08-10T02:20:23.733Z",
    "size": 7649,
    "path": "../public/_nuxt/NYXsBnAa.js"
  },
  "/_nuxt/OWK_uxCi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1d2b-4EFr9vZfzt5cDrcrbcodL/dbi2s\"",
    "mtime": "2026-08-10T02:20:23.733Z",
    "size": 7467,
    "path": "../public/_nuxt/OWK_uxCi.js"
  },
  "/_nuxt/OX9mKyDY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"40e2-rEAjufG1lC0XO/48DH2PYAnjzMo\"",
    "mtime": "2026-08-10T02:20:23.735Z",
    "size": 16610,
    "path": "../public/_nuxt/OX9mKyDY.js"
  },
  "/_nuxt/OzAwJ0ZZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"38ae-46tCDq5LNBFc2LXgV1mmoDkvea0\"",
    "mtime": "2026-08-10T02:20:23.735Z",
    "size": 14510,
    "path": "../public/_nuxt/OzAwJ0ZZ.js"
  },
  "/_nuxt/P5-bz6jM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8f0-G44fCnYbgppSgH54NKnMD0xW4bo\"",
    "mtime": "2026-08-10T02:20:23.734Z",
    "size": 2288,
    "path": "../public/_nuxt/P5-bz6jM.js"
  },
  "/_nuxt/RX7acfP9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"224b-fqvN2hcWTnIeHFsdZsxF0VdhXHY\"",
    "mtime": "2026-08-10T02:20:23.734Z",
    "size": 8779,
    "path": "../public/_nuxt/RX7acfP9.js"
  },
  "/_nuxt/SwZ86tw0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"24d6-HQqxQbJ6mLZ1Le48Jg/C2cNyPBw\"",
    "mtime": "2026-08-10T02:20:23.735Z",
    "size": 9430,
    "path": "../public/_nuxt/SwZ86tw0.js"
  },
  "/_nuxt/T2G9Juim.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2034-nOetUAZ7UVWy2Sg/Hiaf39qAXfI\"",
    "mtime": "2026-08-10T02:20:23.735Z",
    "size": 8244,
    "path": "../public/_nuxt/T2G9Juim.js"
  },
  "/_nuxt/TbqFF32X.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2120-b2RjuClXMkGlMjZYJzkN3XXzAXY\"",
    "mtime": "2026-08-10T02:20:23.736Z",
    "size": 8480,
    "path": "../public/_nuxt/TbqFF32X.js"
  },
  "/_nuxt/U7SS5cIE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1dd2-KFGCJLEOi5vZqUC9/M+swNY3Ess\"",
    "mtime": "2026-08-10T02:20:23.736Z",
    "size": 7634,
    "path": "../public/_nuxt/U7SS5cIE.js"
  },
  "/_nuxt/U9HOJxv-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2fe-anoPXCYyVzAJFBvO4zFcLriDc7o\"",
    "mtime": "2026-08-10T02:20:23.736Z",
    "size": 766,
    "path": "../public/_nuxt/U9HOJxv-.js"
  },
  "/_nuxt/WZmvg1Kd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"426e-kr5KkBB6JgeBAYhVydfxgaCoNSY\"",
    "mtime": "2026-08-10T02:20:23.737Z",
    "size": 17006,
    "path": "../public/_nuxt/WZmvg1Kd.js"
  },
  "/_nuxt/WdvnkDmO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"29b2-jfGTeqb2tPL5nbdfo1XzX2dJSug\"",
    "mtime": "2026-08-10T02:20:23.736Z",
    "size": 10674,
    "path": "../public/_nuxt/WdvnkDmO.js"
  },
  "/_nuxt/XcbupQha.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1070-EXrHwvOn7fyIHvMeRJHieE+MOdY\"",
    "mtime": "2026-08-10T02:20:23.737Z",
    "size": 4208,
    "path": "../public/_nuxt/XcbupQha.js"
  },
  "/_nuxt/YK4aA7Re.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"fc7-kBUiU36zIDxbdN6iyf8hHWe0ZIg\"",
    "mtime": "2026-08-10T02:20:23.737Z",
    "size": 4039,
    "path": "../public/_nuxt/YK4aA7Re.js"
  },
  "/_nuxt/_Sw_hXcs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"892-Um8EtAOf9wTpmm0FUDiw0cahZec\"",
    "mtime": "2026-08-10T02:20:23.737Z",
    "size": 2194,
    "path": "../public/_nuxt/_Sw_hXcs.js"
  },
  "/_nuxt/_id_.-BW_Z4_e.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"a3-1EznUbe+V+1YmlY4kkXS+B7F3/g\"",
    "mtime": "2026-08-10T02:20:23.737Z",
    "size": 163,
    "path": "../public/_nuxt/_id_.-BW_Z4_e.css"
  },
  "/_nuxt/_l2QgJkD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1c4c-Qipw81iEcymdJCnL856wkMQgRlo\"",
    "mtime": "2026-08-10T02:20:23.738Z",
    "size": 7244,
    "path": "../public/_nuxt/_l2QgJkD.js"
  },
  "/_nuxt/_id_.C0N9G5ny.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"c75-RwiouuzyPhDcjBuaQhSiRrdAJRc\"",
    "mtime": "2026-08-10T02:20:23.738Z",
    "size": 3189,
    "path": "../public/_nuxt/_id_.C0N9G5ny.css"
  },
  "/_nuxt/_order_.DAHLpBIt.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"36-tJiAMQlnqBDXR6R17ZKirgfjr3A\"",
    "mtime": "2026-08-10T02:20:23.738Z",
    "size": 54,
    "path": "../public/_nuxt/_order_.DAHLpBIt.css"
  },
  "/_nuxt/_paymentId_.CeSB7TkW.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"a4d-EjHk4JR1yAYkyOg8acMH//6BdTk\"",
    "mtime": "2026-08-10T02:20:23.738Z",
    "size": 2637,
    "path": "../public/_nuxt/_paymentId_.CeSB7TkW.css"
  },
  "/_nuxt/amF3k1mp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4224-lgMVyHPSGA1miG0ejClQ1KZESKM\"",
    "mtime": "2026-08-10T02:20:23.741Z",
    "size": 16932,
    "path": "../public/_nuxt/amF3k1mp.js"
  },
  "/_nuxt/approve.CsU0F9la.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"c9-mMlsCa+AkrlwkUtL0VvoVxasYag\"",
    "mtime": "2026-08-10T02:20:23.741Z",
    "size": 201,
    "path": "../public/_nuxt/approve.CsU0F9la.css"
  },
  "/_nuxt/base.ByFTD2Xc.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"b5-zebxk6JgBKDJ5wB6LtewZrMr8DQ\"",
    "mtime": "2026-08-10T02:20:23.740Z",
    "size": 181,
    "path": "../public/_nuxt/base.ByFTD2Xc.css"
  },
  "/_nuxt/biometric.D0is3mi_.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"59c-L9qD4U+l+qFc78+XSgEni+20jjo\"",
    "mtime": "2026-08-10T02:20:23.741Z",
    "size": 1436,
    "path": "../public/_nuxt/biometric.D0is3mi_.css"
  },
  "/_nuxt/byBOg4Kk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3270-A+oEqIDKevwN4/GPYz5TB2C7hQM\"",
    "mtime": "2026-08-10T02:20:23.742Z",
    "size": 12912,
    "path": "../public/_nuxt/byBOg4Kk.js"
  },
  "/_nuxt/c0aZIr2o.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"80e4-b4zwqYN5ehCfwJrQpOq0UcUzpwQ\"",
    "mtime": "2026-08-10T02:20:23.742Z",
    "size": 32996,
    "path": "../public/_nuxt/c0aZIr2o.js"
  },
  "/_nuxt/ce843G8i.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"245e-Kj4v+yrGZPawz1Cbl87TOrnyD2k\"",
    "mtime": "2026-08-10T02:20:23.741Z",
    "size": 9310,
    "path": "../public/_nuxt/ce843G8i.js"
  },
  "/_nuxt/create.DdDvMnqg.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"fa-g4qA6RyNaNgEWX/zs1jyckvvTp4\"",
    "mtime": "2026-08-10T02:20:23.741Z",
    "size": 250,
    "path": "../public/_nuxt/create.DdDvMnqg.css"
  },
  "/_nuxt/create.RBW53SWr.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"ee-ZHqrluBQEmomHhQWXpUOipWdK2c\"",
    "mtime": "2026-08-10T02:20:23.742Z",
    "size": 238,
    "path": "../public/_nuxt/create.RBW53SWr.css"
  },
  "/_nuxt/default.BaaCi4ib.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"c4b-Vx051lgT/7R/83dXI3LdxnDkZd4\"",
    "mtime": "2026-08-10T02:20:23.742Z",
    "size": 3147,
    "path": "../public/_nuxt/default.BaaCi4ib.css"
  },
  "/_nuxt/dispatch-slip.DQ1V1YN0.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"113-udI0L7tI3P+5brPxi6yuCHBuBNs\"",
    "mtime": "2026-08-10T02:20:23.742Z",
    "size": 275,
    "path": "../public/_nuxt/dispatch-slip.DQ1V1YN0.css"
  },
  "/_nuxt/edit.COUdmHwK.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"190-mIEAqq4rfLL88T7XOjvYKQeu+dE\"",
    "mtime": "2026-08-10T02:20:23.743Z",
    "size": 400,
    "path": "../public/_nuxt/edit.COUdmHwK.css"
  },
  "/_nuxt/edit.DP5kNvJi.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"fa-UTh5sw9G8txZ9FkHFzNHhhaEDO8\"",
    "mtime": "2026-08-10T02:20:23.743Z",
    "size": 250,
    "path": "../public/_nuxt/edit.DP5kNvJi.css"
  },
  "/_nuxt/edit.XbB5EWUi.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1e4-iuxRSbPNbHpX72yPeifgBbGl4s4\"",
    "mtime": "2026-08-10T02:20:23.743Z",
    "size": 484,
    "path": "../public/_nuxt/edit.XbB5EWUi.css"
  },
  "/_nuxt/eqDKLyHb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4553-WfPrQKfzraupc59ocZ9CtPwCjgg\"",
    "mtime": "2026-08-10T02:20:23.743Z",
    "size": 17747,
    "path": "../public/_nuxt/eqDKLyHb.js"
  },
  "/_nuxt/error-404.Clpuh0Az.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"dca-a4Azlgveo0CIpCMEsxA2QStrIpw\"",
    "mtime": "2026-08-10T02:20:23.743Z",
    "size": 3530,
    "path": "../public/_nuxt/error-404.Clpuh0Az.css"
  },
  "/_nuxt/error-500.Dl3abuLl.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"75a-d05dV3W51WtVmkkQfeNAwWZILNk\"",
    "mtime": "2026-08-10T02:20:23.744Z",
    "size": 1882,
    "path": "../public/_nuxt/error-500.Dl3abuLl.css"
  },
  "/_nuxt/fYXP41s9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2d82-txeqaKWzWcR0mu80deHouwwwOeE\"",
    "mtime": "2026-08-10T02:20:23.743Z",
    "size": 11650,
    "path": "../public/_nuxt/fYXP41s9.js"
  },
  "/_nuxt/fuel.BnSRpMlB.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"b5-rAGasX6D7WUeJopsryk3/lPvKzI\"",
    "mtime": "2026-08-10T02:20:23.743Z",
    "size": 181,
    "path": "../public/_nuxt/fuel.BnSRpMlB.css"
  },
  "/_nuxt/g0SLhrM-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1983-RQ+woSAs4EmldDN/LUqoGnWEGaI\"",
    "mtime": "2026-08-10T02:20:23.744Z",
    "size": 6531,
    "path": "../public/_nuxt/g0SLhrM-.js"
  },
  "/_nuxt/gZv1jtcT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"60f3-+qStzqe6jNpXAIehkhB0Vr4WSrg\"",
    "mtime": "2026-08-10T02:20:23.745Z",
    "size": 24819,
    "path": "../public/_nuxt/gZv1jtcT.js"
  },
  "/_nuxt/gdr5-2EO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"214f-iUsk903aJo6N0Fjkjp9oB9vnk/U\"",
    "mtime": "2026-08-10T02:20:23.745Z",
    "size": 8527,
    "path": "../public/_nuxt/gdr5-2EO.js"
  },
  "/_nuxt/ihx6OeKU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7487-pYvnIldEdT7VvL70pUMmzrUEDIs\"",
    "mtime": "2026-08-10T02:20:23.745Z",
    "size": 29831,
    "path": "../public/_nuxt/ihx6OeKU.js"
  },
  "/_nuxt/index.B6o8l0HM.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"b1-TsLHHxmIGIdIrm9/usoZeMUhjfc\"",
    "mtime": "2026-08-10T02:20:23.745Z",
    "size": 177,
    "path": "../public/_nuxt/index.B6o8l0HM.css"
  },
  "/_nuxt/index.B9kvx-dZ.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"b5-B1ICULVGb6LT+eB6JM+l0gcFJVE\"",
    "mtime": "2026-08-10T02:20:23.745Z",
    "size": 181,
    "path": "../public/_nuxt/index.B9kvx-dZ.css"
  },
  "/_nuxt/index.BLdAtjQE.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"b1-cbz+ertHH/8WNzwg2f9WwN2ApbM\"",
    "mtime": "2026-08-10T02:20:23.745Z",
    "size": 177,
    "path": "../public/_nuxt/index.BLdAtjQE.css"
  },
  "/_nuxt/index.BtTulfbB.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"273-L4wSgLl/sJpV+M8B6tiWu9z2UqU\"",
    "mtime": "2026-08-10T02:20:23.745Z",
    "size": 627,
    "path": "../public/_nuxt/index.BtTulfbB.css"
  },
  "/_nuxt/index.Bz7EKr82.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"2eb-Ow9FbnkXsLZ54kThiqxjHDMPoJ4\"",
    "mtime": "2026-08-10T02:20:23.746Z",
    "size": 747,
    "path": "../public/_nuxt/index.Bz7EKr82.css"
  },
  "/_nuxt/index.CHN-XoVP.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"c9-/Y595HRkJcIo8cIjjpJbeSpUEUs\"",
    "mtime": "2026-08-10T02:20:23.746Z",
    "size": 201,
    "path": "../public/_nuxt/index.CHN-XoVP.css"
  },
  "/_nuxt/index.CP5VssZS.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1ae-6U7OTvZH3J22bpLkSSd3K2PS/tg\"",
    "mtime": "2026-08-10T02:20:23.746Z",
    "size": 430,
    "path": "../public/_nuxt/index.CP5VssZS.css"
  },
  "/_nuxt/index.D2A3Irpv.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1524-rvqSIAywh0DESfT3fznMd8J4Ob8\"",
    "mtime": "2026-08-10T02:20:23.746Z",
    "size": 5412,
    "path": "../public/_nuxt/index.D2A3Irpv.css"
  },
  "/_nuxt/index.De0fTHU2.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"c5-mPnGSRW6u0FaFFqzDm5Jzc0g6+Y\"",
    "mtime": "2026-08-10T02:20:23.746Z",
    "size": 197,
    "path": "../public/_nuxt/index.De0fTHU2.css"
  },
  "/_nuxt/index.DjNj_IeG.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"3f7-uDWEaNTdY3LWs3oo4Cc7Z5chEzI\"",
    "mtime": "2026-08-10T02:20:23.746Z",
    "size": 1015,
    "path": "../public/_nuxt/index.DjNj_IeG.css"
  },
  "/_nuxt/index.Dy6_NAWC.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"b5-Sl332wHARAlbQwqj4h5986s6oXg\"",
    "mtime": "2026-08-10T02:20:23.747Z",
    "size": 181,
    "path": "../public/_nuxt/index.Dy6_NAWC.css"
  },
  "/_nuxt/index._teQJJkP.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"20f-7cRGf7cEmOZYBA3ZQuc9kMX2PD4\"",
    "mtime": "2026-08-10T02:20:23.747Z",
    "size": 527,
    "path": "../public/_nuxt/index._teQJJkP.css"
  },
  "/_nuxt/invoice.BT2O4bX7.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"30-uGMf3YxC2hTWuDuEVSO+B5cf0+U\"",
    "mtime": "2026-08-10T02:20:23.747Z",
    "size": 48,
    "path": "../public/_nuxt/invoice.BT2O4bX7.css"
  },
  "/_nuxt/invoice.qdlmT_h1.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1b4-4e4p+3IrAbzXVfPd3mxxeCr2AIE\"",
    "mtime": "2026-08-10T02:20:23.747Z",
    "size": 436,
    "path": "../public/_nuxt/invoice.qdlmT_h1.css"
  },
  "/_nuxt/jruu0FdI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2d84-1GzSqkM5YYPOMGYjg+bCq+yjkko\"",
    "mtime": "2026-08-10T02:20:23.747Z",
    "size": 11652,
    "path": "../public/_nuxt/jruu0FdI.js"
  },
  "/_nuxt/l2lRD5dX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"354f-pca9pmmcbBcUpedxFaWxXPkv4xg\"",
    "mtime": "2026-08-10T02:20:23.748Z",
    "size": 13647,
    "path": "../public/_nuxt/l2lRD5dX.js"
  },
  "/_nuxt/lK1nxuoy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"bc7c-PU8AEE/iv9HF4fzuBROmapTE6tQ\"",
    "mtime": "2026-08-10T02:20:23.748Z",
    "size": 48252,
    "path": "../public/_nuxt/lK1nxuoy.js"
  },
  "/_nuxt/login.BC62QHdL.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"101-S9hhaen3bemWJCnhBlybHrJkQ4M\"",
    "mtime": "2026-08-10T02:20:23.748Z",
    "size": 257,
    "path": "../public/_nuxt/login.BC62QHdL.css"
  },
  "/_nuxt/ledger.kzUocUmQ.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"b5-2H6uQq/FGXjKMUNgpB0PgE6L/hg\"",
    "mtime": "2026-08-10T02:20:23.748Z",
    "size": 181,
    "path": "../public/_nuxt/ledger.kzUocUmQ.css"
  },
  "/_nuxt/maintenance.C1lO4Aub.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"b1-zv1HqkzuRprePA6YpmMinhUCD6M\"",
    "mtime": "2026-08-10T02:20:23.749Z",
    "size": 177,
    "path": "../public/_nuxt/maintenance.C1lO4Aub.css"
  },
  "/_nuxt/n_vxyLB8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1c0f-UHCnlAiLu+j4Vn4ZYqIhYeNPDXY\"",
    "mtime": "2026-08-10T02:20:23.749Z",
    "size": 7183,
    "path": "../public/_nuxt/n_vxyLB8.js"
  },
  "/_nuxt/o0gE9f93.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1a17-EULJb0waJlMqqg5b2C2aj9rBI5Y\"",
    "mtime": "2026-08-10T02:20:23.749Z",
    "size": 6679,
    "path": "../public/_nuxt/o0gE9f93.js"
  },
  "/_nuxt/oCP8iUg1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1f50-wiDYqr321tiAY7py9XlDN8lXxG0\"",
    "mtime": "2026-08-10T02:20:23.750Z",
    "size": 8016,
    "path": "../public/_nuxt/oCP8iUg1.js"
  },
  "/_nuxt/ocp3_UKu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16a8-A/5MUbwa9pQBBKPTL1oa9/JF1vw\"",
    "mtime": "2026-08-10T02:20:23.750Z",
    "size": 5800,
    "path": "../public/_nuxt/ocp3_UKu.js"
  },
  "/_nuxt/p_0yL7Fk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2a40-Tld/0pQGsjQA2ejoD6Awhilf6IE\"",
    "mtime": "2026-08-10T02:20:23.750Z",
    "size": 10816,
    "path": "../public/_nuxt/p_0yL7Fk.js"
  },
  "/_nuxt/payments.DdxYiYem.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"b5-Ri1XmDG8Lw/53VlxJ0ef4vCS7FU\"",
    "mtime": "2026-08-10T02:20:23.749Z",
    "size": 181,
    "path": "../public/_nuxt/payments.DdxYiYem.css"
  },
  "/_nuxt/permissions.Dlg1KaXz.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"141-gMDsCadJYckzGwono+Ho87hRD84\"",
    "mtime": "2026-08-10T02:20:23.750Z",
    "size": 321,
    "path": "../public/_nuxt/permissions.Dlg1KaXz.css"
  },
  "/_nuxt/pricing.CWKqM6Pu.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"165-HTUHrpxO0+6W9yaoKzEgGrPwn6w\"",
    "mtime": "2026-08-10T02:20:23.751Z",
    "size": 357,
    "path": "../public/_nuxt/pricing.CWKqM6Pu.css"
  },
  "/_nuxt/print.B3yEUJUm.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"69-zdbagVEybvpkjFYF+8AaVl4Gee0\"",
    "mtime": "2026-08-10T02:20:23.751Z",
    "size": 105,
    "path": "../public/_nuxt/print.B3yEUJUm.css"
  },
  "/_nuxt/print.BK1152hr.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"75-A5jUZFB/38XPuui3oaK2xMo5GMc\"",
    "mtime": "2026-08-10T02:20:23.751Z",
    "size": 117,
    "path": "../public/_nuxt/print.BK1152hr.css"
  },
  "/_nuxt/print.Cb5j83df.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"73-MZ4PGoFSYSaJNQyMMiNExihtB6U\"",
    "mtime": "2026-08-10T02:20:23.752Z",
    "size": 115,
    "path": "../public/_nuxt/print.Cb5j83df.css"
  },
  "/_nuxt/print.Cl-cp2nd.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1404-5jrHBOZWC896wzYNCb6Xt/g0hmQ\"",
    "mtime": "2026-08-10T02:20:23.752Z",
    "size": 5124,
    "path": "../public/_nuxt/print.Cl-cp2nd.css"
  },
  "/_nuxt/production.Dyb4zG7y.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"cb-gpiFRbk8hsHMUad/fgOu/R/7K4M\"",
    "mtime": "2026-08-10T02:20:23.752Z",
    "size": 203,
    "path": "../public/_nuxt/production.Dyb4zG7y.css"
  },
  "/_nuxt/sAtCNEAB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1615-U2Al+G0Je+/x1rVX0sA4LoKeA8c\"",
    "mtime": "2026-08-10T02:20:23.752Z",
    "size": 5653,
    "path": "../public/_nuxt/sAtCNEAB.js"
  },
  "/_nuxt/settings.DNIJCNOQ.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"b5-9Yo5P4WxyT0aotfOYLpFqdYBgno\"",
    "mtime": "2026-08-10T02:20:23.753Z",
    "size": 181,
    "path": "../public/_nuxt/settings.DNIJCNOQ.css"
  },
  "/_nuxt/t5Zt8D3A.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"c5c-zyR8kDDhY6MB7l9Z8DP/o5yJAuE\"",
    "mtime": "2026-08-10T02:20:23.753Z",
    "size": 3164,
    "path": "../public/_nuxt/t5Zt8D3A.js"
  },
  "/_nuxt/types.CzVhB6Wt.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"b5-Bxe+FT3zuTexhjomd+K04oZ79LU\"",
    "mtime": "2026-08-10T02:20:23.753Z",
    "size": 181,
    "path": "../public/_nuxt/types.CzVhB6Wt.css"
  },
  "/_nuxt/u6TyLCFD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"6dad-69pRAlbGEdsH/gDtgB7NcMf0FY4\"",
    "mtime": "2026-08-10T02:20:23.753Z",
    "size": 28077,
    "path": "../public/_nuxt/u6TyLCFD.js"
  },
  "/_nuxt/variants.Cx7om7FD.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"b5-Qs+fGjwtdoaD/peaaL4Yu3XQQfc\"",
    "mtime": "2026-08-10T02:20:23.753Z",
    "size": 181,
    "path": "../public/_nuxt/variants.Cx7om7FD.css"
  },
  "/_nuxt/variants.DmjtmX35.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"b5-CqV70WGFsIqIlCzH7IkzuJg8TTE\"",
    "mtime": "2026-08-10T02:20:23.753Z",
    "size": 181,
    "path": "../public/_nuxt/variants.DmjtmX35.css"
  },
  "/_nuxt/voucher.Dtakk1We.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"d3-db8p4DqDY2Oypspwt0H2DDRf4+0\"",
    "mtime": "2026-08-10T02:20:23.759Z",
    "size": 211,
    "path": "../public/_nuxt/voucher.Dtakk1We.css"
  },
  "/_nuxt/vouchers.DM0VuNSG.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"148-g1Pf2ZpCoYweMEp+jMKH+kAJFyM\"",
    "mtime": "2026-08-10T02:20:23.754Z",
    "size": 328,
    "path": "../public/_nuxt/vouchers.DM0VuNSG.css"
  },
  "/_nuxt/builds/latest.json": {
    "type": "application/json",
    "etag": "\"47-r3/EgCXNoTLCc5J6eyPY4lUlFIw\"",
    "mtime": "2026-08-10T02:20:23.578Z",
    "size": 71,
    "path": "../public/_nuxt/builds/latest.json"
  },
  "/_nuxt/builds/meta/993ad688-8346-4602-b478-bb136fa47488.json": {
    "type": "application/json",
    "etag": "\"58-3IZ/SngHCGjFPRlATfAhJ8P/8sA\"",
    "mtime": "2026-08-10T02:20:23.568Z",
    "size": 88,
    "path": "../public/_nuxt/builds/meta/993ad688-8346-4602-b478-bb136fa47488.json"
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

const ADMIN_ROLES = ["admin", "superadmin"];
const ACCOUNTS_ROLES = ["accounts", "accounts-srg", "accounts-demra"];
const SALES_ROLES = ["sales-srg", "sales-demra", "sales-other"];
const PRODUCTION_ROLES = ["production manager-srg", "production manager-demra"];
const DISPATCH_ROLES = ["dispatch-srg", "dispatch-demra", "dispatchpos-srg", "dispatchpos-demra"];
const isAdminRole = (r) => ADMIN_ROLES.includes(r);
const isAccountsRole = (r) => ACCOUNTS_ROLES.includes(r) || ADMIN_ROLES.includes(r);
async function getCustomerOutstanding(conn, customerId, opts = {}) {
  var _a, _b;
  const [[led]] = await conn.query(
    `SELECT COALESCE(SUM(debit_amount), 0) - COALESCE(SUM(credit_amount), 0) AS bal
     FROM customer_ledger WHERE customer_id = ?`,
    [customerId]
  );
  const ledgerOutstanding = Number((_a = led == null ? void 0 : led.bal) != null ? _a : 0);
  const params = [customerId];
  let excludeSql = "";
  if (opts.excludeOrderId) {
    excludeSql = " AND id != ?";
    params.push(opts.excludeOrderId);
  }
  const [[pend]] = await conn.query(
    `SELECT COALESCE(SUM(balance_due), 0) AS pending
     FROM credit_orders
     WHERE customer_id = ?${excludeSql}
       AND status IN ('pending_approval','escalated','approved','in_production','produced','ready_to_ship')`,
    params
  );
  const pendingExposure = Number((_b = pend == null ? void 0 : pend.pending) != null ? _b : 0);
  return { ledgerOutstanding, pendingExposure, totalExposure: ledgerOutstanding + pendingExposure };
}
function creditUsagePct(exposure, creditLimit) {
  if (creditLimit <= 0) return 999;
  if (exposure > creditLimit) return 999;
  return Math.round(exposure / creditLimit * 100);
}
const ACTION_LIMIT_KEYS = [
  "approve_order",
  "amend_order",
  "collect_payment",
  "partial_delivery",
  "commodity_sale",
  "loan_disbursement",
  "pos_exit_release"
];
async function getUserActionLimit(conn, userId, key) {
  var _a;
  try {
    const [[row]] = await conn.query(
      `SELECT max_amount FROM user_action_limits WHERE user_id = ? AND action_key = ?`,
      [userId, key]
    );
    const amt = Number((_a = row == null ? void 0 : row.max_amount) != null ? _a : 0);
    return amt > 0 ? amt : null;
  } catch {
    return null;
  }
}
async function getUserApprovalLimit(conn, userId, role) {
  if (isAdminRole(role)) return { limit: Infinity, source: "admin" };
  const actionCap = await getUserActionLimit(conn, userId, "approve_order");
  if (actionCap !== null) return { limit: actionCap, source: "personal" };
  const [[row]] = await conn.query(
    `SELECT max_order_amount FROM user_approval_limits WHERE user_id = ?`,
    [userId]
  );
  if (row && Number(row.max_order_amount) > 0)
    return { limit: Number(row.max_order_amount), source: "personal" };
  return { limit: 0, source: "none" };
}
async function checkTransactionLimit(conn, userId, role, amount, isCheckerReview = false) {
  var _a;
  if (isAdminRole(role)) return { allowed: true, cap: Infinity };
  const actionCap = await getUserActionLimit(conn, userId, "collect_payment");
  let cap = actionCap != null ? actionCap : 0;
  if (cap <= 0) {
    const [[row]] = await conn.query(
      `SELECT max_transaction_amount FROM user_approval_limits WHERE user_id = ?`,
      [userId]
    );
    cap = Number((_a = row == null ? void 0 : row.max_transaction_amount) != null ? _a : 0);
  }
  if (isCheckerReview) return { allowed: true, cap };
  const { paymentRequireApproval } = await getCreditWorkflowSettings(conn);
  if (paymentRequireApproval) return { allowed: false, cap, reason: "policy" };
  if (cap <= 0) return { allowed: false, cap: 0, reason: "no_cap" };
  return { allowed: amount <= cap, cap, reason: amount <= cap ? void 0 : "over_cap" };
}
async function queuePendingRequest(conn, opts) {
  var _a, _b;
  const [res] = await conn.query(
    `INSERT INTO credit_pending_requests
       (request_type, payload, order_id, customer_id, amount, reference_label,
        requested_by_user_id, requested_reason)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      opts.requestType,
      JSON.stringify(opts.payload),
      (_a = opts.orderId) != null ? _a : null,
      (_b = opts.customerId) != null ? _b : null,
      opts.amount,
      opts.referenceLabel,
      opts.requestedBy,
      opts.requestedReason
    ]
  );
  return res.insertId;
}
async function getCreditWorkflowSettings(conn) {
  const defaults = { dispatchGlobalHold: true, creditLimitAutoRelease: false, paymentRequireApproval: true };
  try {
    const [[row]] = await conn.query(
      `SELECT setting_value FROM system_settings WHERE setting_key = 'credit_workflow_policy'`
    );
    if (row == null ? void 0 : row.setting_value) {
      const parsed = JSON.parse(row.setting_value);
      return {
        dispatchGlobalHold: parsed.dispatch_global_hold !== void 0 ? Boolean(parsed.dispatch_global_hold) : defaults.dispatchGlobalHold,
        creditLimitAutoRelease: parsed.credit_limit_auto_release !== void 0 ? Boolean(parsed.credit_limit_auto_release) : defaults.creditLimitAutoRelease,
        paymentRequireApproval: parsed.payment_require_approval !== void 0 ? Boolean(parsed.payment_require_approval) : defaults.paymentRequireApproval
      };
    }
  } catch {
  }
  return defaults;
}
const PRE_DISPATCH_STATUSES = [
  "draft",
  "pending_approval",
  "escalated",
  "approved",
  "in_production",
  "produced",
  "ready_to_ship"
];
async function getOrderGateState(conn, orderId) {
  var _a, _b, _c, _d;
  const none = {
    exists: false,
    productionHold: false,
    productionReleased: false,
    dispatchHold: false,
    dispatchCleared: false,
    conditionType: null,
    conditionAmount: null,
    autoRelease: false,
    accountsNote: null,
    conditionMet: true,
    currentValue: null,
    raw: null
  };
  let c;
  try {
    const [[row]] = await conn.query(
      `SELECT * FROM order_approval_conditions WHERE order_id = ? ORDER BY id DESC LIMIT 1`,
      [orderId]
    );
    c = row;
  } catch (e) {
    console.warn("[gates] order_approval_conditions unavailable:", e == null ? void 0 : e.message);
    return none;
  }
  if (!c) {
    const { dispatchGlobalHold } = await getCreditWorkflowSettings(conn);
    if (!dispatchGlobalHold) return none;
    const [[ord]] = await conn.query(`SELECT status FROM credit_orders WHERE id = ?`, [orderId]);
    if (!ord || !PRE_DISPATCH_STATUSES.includes(ord.status)) return none;
    return {
      ...none,
      dispatchHold: true,
      conditionType: "manual",
      conditionMet: false,
      accountsNote: "Held by default dispatch policy \u2014 no explicit clearance yet"
    };
  }
  const [[order]] = await conn.query(
    `SELECT customer_id, total_amount, amount_paid, advance_paid, balance_due
     FROM credit_orders WHERE id = ?`,
    [orderId]
  );
  let conditionMet = true;
  let currentValue = null;
  const condAmt = c.condition_amount !== null ? Number(c.condition_amount) : null;
  if (c.dispatch_hold && c.condition_type && c.condition_type !== "manual" && order) {
    const exp = await getCustomerOutstanding(conn, order.customer_id, { excludeOrderId: orderId });
    switch (c.condition_type) {
      case "outstanding_below":
        currentValue = exp.ledgerOutstanding;
        conditionMet = condAmt !== null && exp.ledgerOutstanding <= condAmt;
        break;
      case "outstanding_after_ship":
        currentValue = exp.ledgerOutstanding + Number((_a = order.balance_due) != null ? _a : 0);
        conditionMet = condAmt !== null && currentValue <= condAmt;
        break;
      case "amount_received":
        currentValue = Number((_b = order.amount_paid) != null ? _b : 0);
        conditionMet = condAmt !== null && currentValue >= condAmt;
        break;
      default:
        conditionMet = false;
    }
  } else if (c.dispatch_hold && c.condition_type === "manual") {
    conditionMet = false;
  }
  return {
    exists: true,
    productionHold: !!c.production_hold,
    productionReleased: !!c.production_released_at,
    dispatchHold: !!c.dispatch_hold,
    dispatchCleared: !!c.dispatch_cleared,
    conditionType: (_c = c.condition_type) != null ? _c : null,
    conditionAmount: condAmt,
    autoRelease: !!c.auto_release,
    accountsNote: (_d = c.accounts_note) != null ? _d : null,
    conditionMet,
    currentValue,
    raw: c
  };
}
async function postGoodsOnBoardInvoice(conn, opts) {
  var _a, _b;
  const gate = await getOrderGateState(conn, opts.orderId);
  let autoReleased = false;
  if (gate.dispatchHold && !gate.dispatchCleared) {
    if (gate.conditionMet && gate.autoRelease) {
      await conn.query(
        `UPDATE order_approval_conditions
         SET dispatch_cleared = 1, dispatch_cleared_by = ?, dispatch_cleared_at = NOW(),
             dispatch_cleared_note = 'Auto-released: condition met at goods-on-board'
         WHERE order_id = ?`,
        [opts.userId, opts.orderId]
      );
      autoReleased = true;
    } else {
      throw createError$1({
        statusCode: 423,
        statusMessage: gate.conditionMet ? "Payment condition met but clearance is manual \u2014 ask accounts to grant it (Payment Watch)" : `Dispatch blocked \u2014 payment clearance pending (${(_a = gate.conditionType) != null ? _a : "manual"}${gate.conditionAmount ? ` \u09F3${gate.conditionAmount.toLocaleString()}` : ""})`
      });
    }
  }
  const [[already]] = await conn.query(
    `SELECT id FROM customer_ledger
     WHERE reference_type = 'credit_order' AND reference_id = ? AND transaction_type = 'invoice'
     LIMIT 1`,
    [opts.orderId]
  );
  const alreadyPosted = !!already;
  if (!already) {
    const postDate = (_b = opts.postDate) != null ? _b : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    let jeId = null;
    const arId = await getGLAccountId(conn, "Accounts Receivable");
    const revId = await getGLAccountId(conn, "Revenue");
    if (arId && revId) {
      jeId = await postJournalEntry(conn, {
        date: postDate,
        description: `Sales invoice \u2014 ${opts.orderNumber} (${opts.customerName}) \u2014 goods on board`,
        docType: "CreditOrder",
        docId: opts.orderId,
        userId: opts.userId,
        lines: [
          { accountId: arId, debit: opts.totalAmount, credit: 0, memo: opts.orderNumber },
          { accountId: revId, debit: 0, credit: opts.totalAmount, memo: opts.orderNumber }
        ]
      });
    } else {
      console.warn(`[goods_on_board] Missing GL accounts (AR=${arId}, Rev=${revId}) \u2014 ledger posted without JE`);
    }
    await postCustomerLedger(conn, {
      customerId: opts.customerId,
      date: postDate,
      transactionType: "invoice",
      referenceType: "credit_order",
      referenceId: opts.orderId,
      invoiceNumber: opts.orderNumber,
      description: `Invoice \u2014 ${opts.orderNumber} goods on board (full order value)`,
      debit: opts.totalAmount,
      credit: 0,
      journalEntryId: jeId,
      userId: opts.userId
    });
  }
  const telegramMsg = `\u{1F69A} <b>Goods on Board</b>
${opts.orderNumber} \u2014 ${opts.customerName}
Invoice \u09F3${opts.totalAmount.toLocaleString()} posted \xB7 balance due \u09F3${opts.balanceDue.toLocaleString()}
by ${opts.userName}` + (autoReleased ? "\n\u{1F7E2} Dispatch clearance auto-released" : "");
  return { alreadyPosted, autoReleased, telegramMsg };
}
async function getGLAccountId(conn, accountType) {
  var _a;
  const [[row]] = await conn.query(
    `SELECT id FROM chart_of_accounts WHERE account_type = ? ORDER BY id ASC LIMIT 1`,
    [accountType]
  );
  return (_a = row == null ? void 0 : row.id) != null ? _a : null;
}
async function postJournalEntry(conn, opts) {
  var _a;
  const dr = opts.lines.reduce((s, l) => s + l.debit, 0);
  const cr = opts.lines.reduce((s, l) => s + l.credit, 0);
  if (Math.abs(dr - cr) > 5e-3)
    throw new Error(`Unbalanced journal entry: DR ${dr} != CR ${cr} (${opts.description})`);
  const [jeRes] = await conn.query(
    `INSERT INTO journal_entries
       (transaction_date, description, related_document_type, related_document_id, created_by_user_id)
     VALUES (?, ?, ?, ?, ?)`,
    [opts.date, opts.description.slice(0, 255), opts.docType, opts.docId, opts.userId]
  );
  const jeId = jeRes.insertId;
  for (const l of opts.lines) {
    await conn.query(
      `INSERT INTO transaction_lines
         (journal_entry_id, account_id, debit_amount, credit_amount, description)
       VALUES (?, ?, ?, ?, ?)`,
      [jeId, l.accountId, l.debit, l.credit, ((_a = l.memo) != null ? _a : "").slice(0, 255) || null]
    );
  }
  return jeId;
}
async function postCustomerLedger(conn, opts) {
  var _a, _b;
  const [[led]] = await conn.query(
    `SELECT COALESCE(SUM(debit_amount), 0) - COALESCE(SUM(credit_amount), 0) AS bal
     FROM customer_ledger WHERE customer_id = ?`,
    [opts.customerId]
  );
  const balanceAfter = Number((_a = led == null ? void 0 : led.bal) != null ? _a : 0) + opts.debit - opts.credit;
  const [res] = await conn.query(
    `INSERT INTO customer_ledger
       (customer_id, transaction_date, transaction_type, reference_type, reference_id,
        invoice_number, description, debit_amount, credit_amount, balance_after,
        journal_entry_id, created_by_user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      opts.customerId,
      opts.date,
      opts.transactionType,
      opts.referenceType,
      opts.referenceId,
      opts.invoiceNumber.slice(0, 50),
      opts.description,
      opts.debit,
      opts.credit,
      balanceAfter,
      (_b = opts.journalEntryId) != null ? _b : null,
      opts.userId
    ]
  );
  await conn.query(
    `UPDATE customers SET current_balance = ?, updated_at = NOW() WHERE id = ?`,
    [Math.max(0, balanceAfter), opts.customerId]
  );
  return res.insertId;
}
async function nextDocNumber(conn, prefix, table, column) {
  const [[row]] = await conn.query(`SELECT DATE_FORMAT(CURDATE(), '%Y%m%d') AS d`);
  const datePart = row.d;
  const [[last]] = await conn.query(
    `SELECT MAX(CAST(SUBSTRING_INDEX(\`${column}\`, '-', -1) AS UNSIGNED)) AS maxSeq
     FROM \`${table}\` WHERE \`${column}\` LIKE ?`,
    [`${prefix}-${datePart}-%`]
  );
  const nextSeq = (Number(last == null ? void 0 : last.maxSeq) || 0) + 1;
  return `${prefix}-${datePart}-${String(nextSeq).padStart(4, "0")}`;
}
async function getUserBranchScope(conn, userId, role) {
  var _a;
  if (isAdminRole(role) || ACCOUNTS_ROLES.includes(role)) return null;
  const suffixed = (_a = /-(srg|demra)$/.exec(role)) == null ? void 0 : _a[1];
  const [[emp]] = await conn.query(
    `SELECT branch_id FROM employees WHERE user_id = ? LIMIT 1`,
    [userId]
  );
  if (emp == null ? void 0 : emp.branch_id) return Number(emp.branch_id);
  if (suffixed) {
    const [[br]] = await conn.query(
      `SELECT id FROM branches WHERE LOWER(code) = ? LIMIT 1`,
      [suffixed]
    );
    if (br) return Number(br.id);
  }
  return null;
}

const AMD_PRE_STATUSES = ["pending_approval", "escalated", "approved", "in_production", "ready_to_ship"];
const AMD_POST_STATUSES = ["goods_on_board", "shipped", "dispatched", "delivered", "completed"];
async function applyAmendment(conn, opts) {
  var _a, _b, _c, _d, _e;
  const { order, regime, flatAmount, newValues, amdNo, userId } = opts;
  if (regime === "pre") {
    const [[fresh]] = await conn.query(
      `SELECT status, advance_paid, amount_paid FROM credit_orders WHERE id = ? FOR UPDATE`,
      [order.id]
    );
    if (!AMD_PRE_STATUSES.includes(fresh.status))
      throw createError$1({ statusCode: 409, statusMessage: "Order was dispatched after this amendment was requested \u2014 use a post-dispatch amendment instead" });
    await conn.query(`DELETE FROM credit_order_items WHERE order_id = ?`, [order.id]);
    for (const it of newValues.items) {
      const lineTotal = Number(it.quantity) * Number(it.unit_price) - Number((_a = it.discount_amount) != null ? _a : 0);
      await conn.query(
        `INSERT INTO credit_order_items
           (order_id, product_id, variant_id, quantity, unit_price, discount_amount, line_total)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          order.id,
          it.product_id,
          (_b = it.variant_id) != null ? _b : null,
          Number(it.quantity),
          Number(it.unit_price),
          Number((_c = it.discount_amount) != null ? _c : 0),
          lineTotal
        ]
      );
    }
    const newTotal = Number(newValues.total_amount);
    const newBalance = Math.max(0, newTotal - Number((_d = fresh.advance_paid) != null ? _d : 0) - Number((_e = fresh.amount_paid) != null ? _e : 0));
    await conn.query(
      `UPDATE credit_orders SET subtotal = ?, total_amount = ?, balance_due = ?, updated_at = NOW()
       WHERE id = ?`,
      [newTotal, newTotal, newBalance, order.id]
    );
    return;
  }
  const amt = Number(flatAmount);
  const abs = Math.abs(amt);
  const date = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const arId = await getGLAccountId(conn, "Accounts Receivable");
  const revId = await getGLAccountId(conn, "Revenue");
  let jeId = null;
  if (arId && revId) {
    jeId = await postJournalEntry(conn, {
      date,
      description: `${amt > 0 ? "Debit" : "Credit"} note ${amdNo} \u2014 Order ${order.order_number}`,
      docType: "OrderAmendment",
      docId: opts.amendmentId,
      userId,
      lines: amt > 0 ? [
        { accountId: arId, debit: abs, credit: 0, memo: amdNo },
        { accountId: revId, debit: 0, credit: abs, memo: amdNo }
      ] : [
        { accountId: revId, debit: abs, credit: 0, memo: amdNo },
        { accountId: arId, debit: 0, credit: abs, memo: amdNo }
      ]
    });
  }
  await postCustomerLedger(conn, {
    customerId: order.customer_id,
    date,
    transactionType: amt > 0 ? "debit_note" : "credit_note",
    referenceType: "order_amendment",
    referenceId: opts.amendmentId,
    invoiceNumber: amdNo,
    description: `${amt > 0 ? "Debit" : "Credit"} note ${amdNo} \u2014 Order ${order.order_number}`,
    debit: amt > 0 ? abs : 0,
    credit: amt < 0 ? abs : 0,
    journalEntryId: jeId,
    userId
  });
  await conn.query(
    `UPDATE order_amendments SET journal_entry_id = ? WHERE id = ?`,
    [jeId, opts.amendmentId]
  );
  await conn.query(
    `UPDATE credit_orders
     SET total_amount = GREATEST(0, total_amount + ?),
         balance_due  = GREATEST(0, balance_due + ?),
         updated_at   = NOW()
     WHERE id = ?`,
    [amt, amt, order.id]
  );
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

async function bridgeCustomerPayment(conn, opts) {
  var _a, _b;
  try {
    const [[bankAcct]] = await conn.query(
      `SELECT account_number FROM bank_accounts WHERE id = ?`,
      [opts.bankAccountId]
    );
    if (!(bankAcct == null ? void 0 : bankAcct.account_number)) return;
    const [[txAcct]] = await conn.query(
      `SELECT id FROM bank_tx_accounts WHERE account_number = ? AND status = 'active' LIMIT 1`,
      [bankAcct.account_number]
    );
    if (!(txAcct == null ? void 0 : txAcct.id)) return;
    const txnNo = await nextDocNumber(conn, "BTX", "bank_transactions", "transaction_number");
    await conn.query(
      `INSERT INTO bank_transactions
         (transaction_number, transaction_date, entry_type, bank_tx_account_id,
          amount, reference_number, cheque_number, payee_payer_name, description,
          status, created_by_user_id, source_payment_id, created_at, updated_at)
       VALUES (?, ?, 'credit', ?, ?, ?, ?, ?, ?, 'pending', ?, ?, NOW(), NOW())`,
      [
        txnNo,
        opts.date,
        txAcct.id,
        opts.amount,
        (_a = opts.referenceNumber) != null ? _a : null,
        (_b = opts.chequeNumber) != null ? _b : null,
        opts.payerName,
        `Auto-bridged from customer payment \u2014 ${opts.method}`,
        opts.userId,
        opts.paymentId
      ]
    );
  } catch (e) {
    console.warn("[bank-bridge] best-effort bridge failed (payment still posted fine):", e);
  }
}
async function voidBridgedTransaction(conn, paymentId) {
  try {
    await conn.query(
      `UPDATE bank_transactions SET status = 'cancelled', updated_at = NOW()
       WHERE source_payment_id = ? AND status = 'pending'`,
      [paymentId]
    );
  } catch (e) {
    console.warn("[bank-bridge] void-on-reversal failed (reversal still succeeded):", e);
  }
}

async function resolveBankGLAccount(conn, bankTxAccountId) {
  var _a;
  const [[row]] = await conn.query(
    `SELECT chart_of_account_id FROM bank_accounts WHERE legacy_tx_account_id = ? LIMIT 1`,
    [bankTxAccountId]
  );
  return (_a = row == null ? void 0 : row.chart_of_account_id) != null ? _a : null;
}
async function postBankTransactionJE(conn, opts) {
  var _a;
  const bankGLId = await resolveBankGLAccount(conn, opts.bankTxAccountId);
  if (!bankGLId) {
    throw createError$1({
      statusCode: 409,
      statusMessage: "This bank account isn't linked to the chart of accounts yet \u2014 link it from Bank Accounts before approving transactions."
    });
  }
  let offsetGLId = null;
  if (opts.transactionTypeId) {
    const [[type]] = await conn.query(
      `SELECT name, chart_of_account_id FROM bank_tx_transaction_types WHERE id = ?`,
      [opts.transactionTypeId]
    );
    offsetGLId = (_a = type == null ? void 0 : type.chart_of_account_id) != null ? _a : null;
    if (type && !offsetGLId) {
      throw createError$1({
        statusCode: 409,
        statusMessage: `Transaction type "${type.name}" isn't mapped to a GL account yet \u2014 set it in Bank > Transaction Types before approving.`
      });
    }
  }
  if (!offsetGLId) {
    throw createError$1({
      statusCode: 409,
      statusMessage: "This transaction has no transaction type set \u2014 pick one (mapped to a GL account) before approving."
    });
  }
  const lines = opts.entryType === "credit" ? [{ accountId: bankGLId, debit: opts.amount, credit: 0 }, { accountId: offsetGLId, debit: 0, credit: opts.amount }] : [{ accountId: offsetGLId, debit: opts.amount, credit: 0 }, { accountId: bankGLId, debit: 0, credit: opts.amount }];
  return postJournalEntry(conn, {
    date: opts.date,
    description: `${opts.description} \u2014 ${opts.transactionNumber}`.slice(0, 255),
    docType: "BankTransaction",
    docId: opts.txnId,
    userId: opts.userId,
    lines
  });
}
async function postBankTransferJE(conn, opts) {
  const fromGLId = await resolveBankGLAccount(conn, opts.fromBankTxAccountId);
  const toGLId = await resolveBankGLAccount(conn, opts.toBankTxAccountId);
  if (!fromGLId || !toGLId) {
    throw createError$1({
      statusCode: 409,
      statusMessage: "Both accounts in this transfer need to be linked to the chart of accounts before it can be approved."
    });
  }
  return postJournalEntry(conn, {
    date: opts.date,
    description: opts.description.slice(0, 255),
    docType: "BankTransfer",
    docId: opts.fromTxnId,
    userId: opts.userId,
    lines: [
      { accountId: toGLId, debit: opts.amount, credit: 0 },
      { accountId: fromGLId, debit: 0, credit: opts.amount }
    ]
  });
}
async function reverseBankTransactionJE(conn, journalEntryId, userId, reason) {
  var _a;
  const [lines] = await conn.query(
    `SELECT account_id, debit_amount, credit_amount FROM transaction_lines WHERE journal_entry_id = ?`,
    [journalEntryId]
  );
  const [[je]] = await conn.query(`SELECT description, transaction_date FROM journal_entries WHERE id = ?`, [journalEntryId]);
  const reversalId = await postJournalEntry(conn, {
    date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    description: `Reversal \u2014 ${(_a = je == null ? void 0 : je.description) != null ? _a : `JE-${journalEntryId}`} (${reason})`.slice(0, 255),
    docType: "BankTransactionReversal",
    docId: journalEntryId,
    userId,
    lines: lines.map((l) => ({
      accountId: l.account_id,
      debit: Number(l.credit_amount),
      credit: Number(l.debit_amount)
    }))
  });
  await conn.query(
    `UPDATE journal_entries SET is_reversed = 1, reversed_by_entry_id = ? WHERE id = ?`,
    [reversalId, journalEntryId]
  );
  await conn.query(`UPDATE journal_entries SET reverses_entry_id = ? WHERE id = ?`, [journalEntryId, reversalId]);
  return reversalId;
}

async function getOrCreateGLAccount(conn, accountNumber, name, accountType, group, normal) {
  const [[existing]] = await conn.query(
    `SELECT id FROM chart_of_accounts WHERE account_number = ? LIMIT 1`,
    [accountNumber]
  );
  if (existing) return Number(existing.id);
  const [res] = await conn.query(
    `INSERT INTO chart_of_accounts
       (account_number, account_type, account_type_group, normal_balance, status, is_active, description, name)
     VALUES (?, ?, ?, ?, 'active', 1, ?, ?)`,
    [accountNumber, accountType, group, normal, `Auto-created for the Commodity Trading module`, name]
  );
  return Number(res.insertId);
}
async function getTradingRevenueAccountId(conn) {
  return getOrCreateGLAccount(conn, "4900", "Commodity Trading Revenue", "Revenue", "Revenue", "Credit");
}
async function getTradingCOGSAccountId(conn) {
  return getOrCreateGLAccount(conn, "5900", "Commodity Cost of Goods Sold", "Cost of Goods Sold", "Expense", "Debit");
}
async function getLoansReceivableAccountId(conn) {
  return getOrCreateGLAccount(conn, "1450", "Loans & Advances Receivable", "Other Current Asset", "Asset", "Debit");
}
async function getCommodityInventory(conn, commodityId, branchId, origin = "") {
  var _a, _b;
  const [[row]] = await conn.query(
    `SELECT qty_on_hand, weighted_avg_cost FROM commodity_inventory
     WHERE commodity_id = ? AND branch_id = ? AND origin = ?`,
    [commodityId, branchId, origin]
  );
  return { qty: Number((_a = row == null ? void 0 : row.qty_on_hand) != null ? _a : 0), avgCost: Number((_b = row == null ? void 0 : row.weighted_avg_cost) != null ? _b : 0) };
}
async function postCommodityGRNCost(conn, opts) {
  var _a;
  const origin = (_a = opts.origin) != null ? _a : "";
  const { qty: oldQty, avgCost: oldAvg } = await getCommodityInventory(conn, opts.commodityId, opts.branchId, origin);
  const newQty = oldQty + opts.qty;
  const newAvg = oldQty > 0 && newQty > 0 ? (oldQty * oldAvg + opts.qty * opts.unitCost) / newQty : opts.unitCost;
  await conn.query(
    `INSERT INTO commodity_inventory (commodity_id, branch_id, origin, qty_on_hand, weighted_avg_cost)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE qty_on_hand = VALUES(qty_on_hand), weighted_avg_cost = VALUES(weighted_avg_cost)`,
    [opts.commodityId, opts.branchId, origin, newQty, newAvg]
  );
}
async function postCommoditySaleCost(conn, opts) {
  var _a;
  const origin = (_a = opts.origin) != null ? _a : "";
  const { qty: oldQty, avgCost } = await getCommodityInventory(conn, opts.commodityId, opts.branchId, origin);
  const cogs = Math.round(opts.qty * avgCost * 100) / 100;
  await conn.query(
    `INSERT INTO commodity_inventory (commodity_id, branch_id, origin, qty_on_hand, weighted_avg_cost)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE qty_on_hand = VALUES(qty_on_hand)`,
    [opts.commodityId, opts.branchId, origin, oldQty - opts.qty, avgCost]
  );
  return { cogs, avgCost };
}
async function restoreCommodityStock(conn, opts) {
  var _a;
  const origin = (_a = opts.origin) != null ? _a : "";
  await conn.query(
    `INSERT INTO commodity_inventory (commodity_id, branch_id, origin, qty_on_hand, weighted_avg_cost)
     VALUES (?, ?, ?, ?, 0)
     ON DUPLICATE KEY UPDATE qty_on_hand = qty_on_hand + VALUES(qty_on_hand)`,
    [opts.commodityId, opts.branchId, origin, opts.qty]
  );
}
async function postOtherSalesCOGS(conn, opts) {
  var _a, _b;
  const [[already]] = await conn.query(
    `SELECT id FROM journal_entries
     WHERE related_document_type = 'OtherSalesCOGS' AND related_document_id = ? LIMIT 1`,
    [opts.orderId]
  );
  if (already) return 0;
  const [items] = await conn.query(
    `SELECT commodity_id, commodity_origin, quantity FROM credit_order_items
     WHERE order_id = ? AND commodity_id IS NOT NULL`,
    [opts.orderId]
  );
  if (!items.length) return 0;
  const branchId = Number((_a = opts.branchId) != null ? _a : 0);
  const cogsId = await getTradingCOGSAccountId(conn);
  const lines = [];
  let totalCogs = 0;
  for (const it of items) {
    const { cogs } = await postCommoditySaleCost(conn, {
      commodityId: Number(it.commodity_id),
      branchId,
      origin: (_b = it.commodity_origin) != null ? _b : "",
      qty: Number(it.quantity)
    });
    if (cogs <= 0) continue;
    const [[commodity]] = await conn.query(
      `SELECT inventory_account_id FROM purchase_commodities WHERE id = ?`,
      [it.commodity_id]
    );
    if (!(commodity == null ? void 0 : commodity.inventory_account_id)) continue;
    totalCogs += cogs;
    lines.push({ accountId: Number(commodity.inventory_account_id), debit: 0, credit: cogs, memo: `${opts.orderNumber} inventory` });
  }
  if (totalCogs > 0) {
    lines.unshift({ accountId: cogsId, debit: totalCogs, credit: 0, memo: `${opts.orderNumber} COGS` });
    await postJournalEntry(conn, {
      date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      description: `Other Sales COGS \u2014 ${opts.orderNumber}`,
      docType: "OtherSalesCOGS",
      docId: opts.orderId,
      userId: opts.userId,
      lines
    });
  }
  return totalCogs;
}
async function postCommoditySale(conn, s) {
  var _a, _b, _c, _d, _e;
  const [[commodity]] = await conn.query(
    `SELECT id, name, unit, is_sellable, inventory_account_id FROM purchase_commodities WHERE id = ?`,
    [s.commodityId]
  );
  if (!commodity) throw createError$1({ statusCode: 404, statusMessage: "Commodity not found" });
  if (!commodity.is_sellable) throw createError$1({ statusCode: 400, statusMessage: `${commodity.name} is not marked sellable \u2014 enable it in the Procurement Catalog first` });
  if (!commodity.inventory_account_id)
    throw createError$1({ statusCode: 400, statusMessage: `${commodity.name} has no inventory GL account \u2014 set it in the Procurement Catalog before selling` });
  const qty = Number(s.quantity);
  const price = Number(s.unitPrice);
  if (qty <= 0 || price <= 0) throw createError$1({ statusCode: 400, statusMessage: "Quantity and unit price must be positive" });
  const totalAmount = Math.round(qty * price * 100) / 100;
  const origin = (_a = s.origin) != null ? _a : "";
  const branchId = Number((_b = s.branchId) != null ? _b : 0);
  const { qty: onHand } = await getCommodityInventory(conn, s.commodityId, branchId, origin);
  if (qty > onHand && !s.stockOverride)
    throw createError$1({
      statusCode: 409,
      statusMessage: `Only ${onHand.toLocaleString()} ${commodity.unit} on hand${origin ? ` (${origin})` : ""} \u2014 confirm the override to sell past stock`
    });
  const { cogs } = await postCommoditySaleCost(conn, { commodityId: s.commodityId, branchId, origin, qty });
  const saleNumber = await nextDocNumber(conn, "CTS", "commodity_sales");
  const arId = await getGLAccountId(conn, "Accounts Receivable");
  const revId = await getTradingRevenueAccountId(conn);
  const cogsId = await getTradingCOGSAccountId(conn);
  let jeId = null;
  if (arId) {
    const lines = [
      { accountId: arId, debit: totalAmount, credit: 0, memo: saleNumber },
      { accountId: revId, debit: 0, credit: totalAmount, memo: saleNumber }
    ];
    if (cogs > 0) {
      lines.push({ accountId: cogsId, debit: cogs, credit: 0, memo: `${saleNumber} COGS` });
      lines.push({ accountId: Number(commodity.inventory_account_id), debit: 0, credit: cogs, memo: `${saleNumber} inventory` });
    }
    jeId = await postJournalEntry(conn, {
      date: s.saleDate,
      description: `Commodity sale \u2014 ${saleNumber} (${commodity.name}${origin ? `, ${origin}` : ""})`,
      docType: "CommoditySale",
      docId: 0,
      userId: s.userId,
      lines
    });
  } else {
    console.warn(`[trading] Missing AR account \u2014 sale ${saleNumber} posted without JE`);
  }
  const [saleRes] = await conn.query(
    `INSERT INTO commodity_sales
       (sale_number, customer_id, commodity_id, branch_id, origin, source_purchase_order_id,
        sale_date, quantity, unit, unit_price, total_amount, balance_due, cogs_amount,
        stock_override, status, journal_entry_id, notes, created_by_user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'posted', ?, ?, ?)`,
    [
      saleNumber,
      s.customerId,
      s.commodityId,
      (_c = s.branchId) != null ? _c : null,
      origin,
      (_d = s.sourcePurchaseOrderId) != null ? _d : null,
      s.saleDate,
      qty,
      commodity.unit,
      price,
      totalAmount,
      totalAmount,
      cogs,
      s.stockOverride ? 1 : 0,
      jeId,
      (_e = s.notes) != null ? _e : null,
      s.userId
    ]
  );
  const saleId = Number(saleRes.insertId);
  if (jeId) {
    await conn.query(`UPDATE journal_entries SET related_document_id = ? WHERE id = ?`, [saleId, jeId]);
  }
  const ledgerId = await postCustomerLedger(conn, {
    customerId: s.customerId,
    date: s.saleDate,
    transactionType: "invoice",
    referenceType: "commodity_sale",
    referenceId: saleId,
    invoiceNumber: saleNumber,
    description: `Commodity sale \u2014 ${saleNumber} (${commodity.name}${origin ? `, ${origin}` : ""}) ${qty.toLocaleString()} ${commodity.unit} @ \u09F3${price.toLocaleString()}`,
    debit: totalAmount,
    credit: 0,
    journalEntryId: jeId,
    userId: s.userId
  });
  await conn.query(`UPDATE commodity_sales SET customer_ledger_id = ? WHERE id = ?`, [ledgerId, saleId]);
  return { saleId, saleNumber, totalAmount, cogs };
}

async function safeCount(sql, params = []) {
  var _a, _b;
  try {
    const rows = await query(sql, params);
    return Number((_b = (_a = rows[0]) == null ? void 0 : _a.n) != null ? _b : 0);
  } catch {
    return 0;
  }
}
async function getExceptionRadar() {
  const [
    pendingApprovals,
    escalatedOrders,
    uncleardHolds,
    inTransit,
    pendingVouchers,
    qrReuses,
    pendingReturns,
    pendingOverDeliveries,
    pendingAmendments
  ] = await Promise.all([
    safeCount(`SELECT COUNT(*) AS n FROM credit_pending_requests WHERE status = 'pending'`),
    safeCount(`SELECT COUNT(*) AS n FROM credit_orders WHERE status = 'escalated'`),
    safeCount(
      `SELECT COUNT(*) AS n FROM order_approval_conditions oac
       JOIN credit_orders o ON o.id = oac.order_id
       WHERE oac.dispatch_hold = 1 AND oac.dispatch_cleared = 0
         AND o.status NOT IN ('delivered','completed','cancelled','rejected')`
    ),
    safeCount(`SELECT COUNT(*) AS n FROM credit_orders WHERE status IN ('goods_on_board','shipped','dispatched')`),
    safeCount(`SELECT COUNT(*) AS n FROM expense_vouchers WHERE status = 'pending'`),
    safeCount(
      `SELECT COUNT(*) AS n FROM cr_qr_scan_log
       WHERE reused = 1 AND scanned_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
    ),
    safeCount(`SELECT COUNT(*) AS n FROM credit_order_returns WHERE status = 'pending'`),
    safeCount(`SELECT COUNT(*) AS n FROM credit_order_over_deliveries WHERE status = 'pending'`),
    safeCount(`SELECT COUNT(*) AS n FROM order_amendments WHERE status = 'pending'`)
  ]);
  const tiles = [
    { key: "pending_approvals", label: "Payments Awaiting Approval", count: pendingApprovals, icon: "\u23F3", route: "/credit-sales/approval-requests" },
    { key: "escalated_orders", label: "Escalated Orders", count: escalatedOrders, icon: "\u26A0\uFE0F", route: "/credit-sales/approve" },
    { key: "uncleared_holds", label: "Uncleared Dispatch Holds", count: uncleardHolds, icon: "\u{1F6AB}", route: "/credit-sales/payment-watch" },
    { key: "in_transit", label: "In Transit", count: inTransit, icon: "\u{1F69A}", route: "/credit-sales/dispatch" },
    { key: "pending_vouchers", label: "Pending Expense Vouchers", count: pendingVouchers, icon: "\u{1F9FE}", route: "/expenses/approve" },
    { key: "qr_reuses", label: "QR Re-scans (7d)", count: qrReuses, icon: "\u{1F4F7}", route: "/credit-sales/qr-scan-log?reused_only=1" },
    { key: "pending_returns", label: "Pending Returns", count: pendingReturns, icon: "\u21A9\uFE0F", route: "/credit-sales/all" },
    { key: "pending_over_deliveries", label: "Pending Over-Deliveries", count: pendingOverDeliveries, icon: "\u{1F4E6}", route: "/credit-sales/over-deliveries" },
    { key: "pending_amendments", label: "Pending Amendments", count: pendingAmendments, icon: "\u{1F4DD}", route: "/credit-sales/all" }
  ];
  return { tiles, total: tiles.reduce((s, t) => s + t.count, 0) };
}

async function postFleetExpenseGl(input) {
  var _a;
  const { conn } = input;
  if (!input.amount || input.amount <= 9e-3)
    throw createError$1({ statusCode: 400, statusMessage: "A positive amount is required to post this entry" });
  const [[expAcc]] = await conn.query(
    `SELECT id FROM chart_of_accounts WHERE name = ? LIMIT 1`,
    [input.expenseAccountName]
  );
  if (!expAcc)
    throw createError$1({ statusCode: 422, statusMessage: `GL account "${input.expenseAccountName}" not found \u2014 please seed it in Chart of Accounts first` });
  let paymentAccountId = null;
  let pettyCash = null;
  if (input.paymentMethod === "cash") {
    if (!input.cashAccountId)
      throw createError$1({ statusCode: 400, statusMessage: "A petty-cash account is required for cash payment" });
    const [[ca]] = await conn.query(
      `SELECT id, branch_id, chart_of_account_id FROM branch_petty_cash_accounts WHERE id = ?`,
      [input.cashAccountId]
    );
    if (!(ca == null ? void 0 : ca.chart_of_account_id))
      throw createError$1({ statusCode: 422, statusMessage: "Selected petty-cash account has no GL account mapped" });
    paymentAccountId = ca.chart_of_account_id;
    pettyCash = { id: ca.id, branch_id: ca.branch_id };
  } else {
    if (!input.bankAccountId)
      throw createError$1({ statusCode: 400, statusMessage: "A bank account is required for bank payment" });
    const [[ba]] = await conn.query(
      `SELECT id, chart_of_account_id FROM bank_accounts WHERE id = ?`,
      [input.bankAccountId]
    );
    if (!(ba == null ? void 0 : ba.chart_of_account_id))
      throw createError$1({ statusCode: 422, statusMessage: "Selected bank account has no GL account mapped" });
    paymentAccountId = ba.chart_of_account_id;
  }
  const [jeResult] = await conn.query(
    `INSERT INTO journal_entries
       (transaction_date, description, related_document_type, related_document_id, created_by_user_id)
     VALUES (?, ?, ?, ?, ?)`,
    [input.date, input.description.slice(0, 255), input.relatedDocumentType, input.relatedDocumentId, input.userId]
  );
  const journalEntryId = jeResult.insertId;
  await conn.query(
    `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
     VALUES (?, ?, ?, 0.00, ?)`,
    [journalEntryId, expAcc.id, input.amount, input.description.slice(0, 255)]
  );
  await conn.query(
    `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
     VALUES (?, ?, 0.00, ?, ?)`,
    [journalEntryId, paymentAccountId, input.amount, input.description.slice(0, 255)]
  );
  if (pettyCash) {
    const [[pc]] = await conn.query(
      `SELECT current_balance FROM branch_petty_cash_accounts WHERE id = ?`,
      [pettyCash.id]
    );
    const balanceAfter = Number((_a = pc == null ? void 0 : pc.current_balance) != null ? _a : 0) - input.amount;
    await conn.query(
      `INSERT INTO branch_petty_cash_transactions
         (account_id, branch_id, transaction_type, amount, balance_after,
          reference_type, reference_id, description, created_by_user_id, transaction_date)
       VALUES (?, ?, 'cash_out', ?, ?, ?, ?, ?, ?, ?)`,
      [
        pettyCash.id,
        pettyCash.branch_id,
        input.amount,
        balanceAfter,
        input.relatedDocumentType,
        input.relatedDocumentId,
        input.description.slice(0, 255),
        input.userId,
        input.date
      ]
    );
    await conn.query(
      `UPDATE branch_petty_cash_accounts SET current_balance = current_balance - ? WHERE id = ?`,
      [input.amount, pettyCash.id]
    );
  } else if (input.paymentMethod === "bank" && input.bankAccountId) {
    await conn.query(
      `UPDATE bank_accounts SET current_balance = GREATEST(0, COALESCE(current_balance, 0) - ?) WHERE id = ?`,
      [input.amount, input.bankAccountId]
    ).catch(() => {
    });
  }
  return journalEntryId;
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

const TELEGRAM_CATEGORIES = [
  "orders",
  "production",
  "payment_received",
  "dispatch",
  "purchase",
  "payment",
  "goods_received",
  "bank_approved",
  "expense"
];
let cached;
async function loadCreds() {
  var _a;
  if (cached !== void 0) return cached;
  try {
    const keys = [
      "telegram_bot_token",
      "telegram_chat_id",
      ...TELEGRAM_CATEGORIES.map((c) => `telegram_chat_id_${c}`)
    ];
    const rows = await query(
      `SELECT setting_key, setting_value FROM system_settings
       WHERE setting_key IN (${keys.map(() => "?").join(",")})`,
      keys
    );
    const map = Object.fromEntries(rows.map((r) => [r.setting_key, r.setting_value]));
    if (map.telegram_bot_token && map.telegram_chat_id) {
      const byCategory = {};
      for (const c of TELEGRAM_CATEGORIES) {
        const v = ((_a = map[`telegram_chat_id_${c}`]) != null ? _a : "").trim();
        if (v) byCategory[c] = v;
      }
      cached = { token: map.telegram_bot_token, generalChatId: map.telegram_chat_id, byCategory };
    } else {
      cached = null;
    }
  } catch {
    cached = null;
  }
  return cached;
}
function resetTelegramCache() {
  cached = void 0;
}
async function sendTelegram(html, category) {
  var _a;
  try {
    const creds = await loadCreds();
    if (!creds) return;
    const chatId = category && creds.byCategory[category] || creds.generalChatId;
    await $fetch(`https://api.telegram.org/bot${creds.token}/sendMessage`, {
      method: "POST",
      body: { chat_id: chatId, text: html.slice(0, 4e3), parse_mode: "HTML" },
      timeout: 8e3
    });
  } catch (e) {
    console.warn("[telegram] send failed:", (_a = e == null ? void 0 : e.message) != null ? _a : e);
  }
}

const SETTING_KEY = "last_owner_digest";
async function claimDigestSlotForToday() {
  const db = getDb();
  const [[today]] = await db.query(`SELECT CURDATE() AS d`);
  const todayStr = String(today.d);
  const [[row]] = await db.query(
    `SELECT setting_value FROM system_settings WHERE setting_key = ?`,
    [SETTING_KEY]
  );
  if ((row == null ? void 0 : row.setting_value) === todayStr) return false;
  await db.query(
    `INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
    [SETTING_KEY, todayStr]
  );
  return true;
}
async function buildDigestMessage() {
  var _a, _b, _c, _d;
  const [collections, orders, overdue] = await Promise.all([
    query(
      `SELECT payment_method, COALESCE(SUM(amount), 0) AS total
       FROM customer_payments
       WHERE payment_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
       GROUP BY payment_method`
    ),
    query(
      `SELECT COUNT(*) AS n, COALESCE(SUM(total_amount), 0) AS total
       FROM credit_orders WHERE order_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`
    ),
    query(
      `SELECT c.name, COALESCE(SUM(l.debit_amount), 0) - COALESCE(SUM(l.credit_amount), 0) AS outstanding
       FROM customer_ledger l JOIN customers c ON c.id = l.customer_id
       GROUP BY l.customer_id, c.name
       HAVING outstanding > 0
       ORDER BY outstanding DESC
       LIMIT 3`
    )
  ]);
  const collectedTotal = collections.reduce((s, r) => s + Number(r.total), 0);
  const collectionLines = collections.filter((r) => Number(r.total) > 0).map((r) => `  \xB7 ${r.payment_method}: \u09F3${Number(r.total).toLocaleString()}`).join("\n");
  const { tiles, total: radarTotal } = await getExceptionRadar();
  const radarLines = tiles.filter((t) => t.count > 0).map((t) => `  ${t.icon} ${t.label}: <b>${t.count}</b>`).join("\n");
  const overdueLines = overdue.map((r, i) => `  ${i + 1}. ${r.name} \u2014 \u09F3${Number(r.outstanding).toLocaleString()}`).join("\n");
  const dateLabel = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  return `\u{1F4CA} <b>Daily Digest \u2014 ${dateLabel}</b>

<b>Yesterday's Collections:</b> \u09F3${collectedTotal.toLocaleString()}
` + (collectionLines || "  \xB7 none") + `

<b>Yesterday's Orders:</b> ${(_b = (_a = orders[0]) == null ? void 0 : _a.n) != null ? _b : 0} order(s) \xB7 \u09F3${Number((_d = (_c = orders[0]) == null ? void 0 : _c.total) != null ? _d : 0).toLocaleString()}

<b>Exception Radar${radarTotal > 0 ? ` \u2014 ${radarTotal} need attention` : " \u2014 all clear \u2713"}</b>
` + (radarLines || "  \u2713 nothing outstanding") + `

<b>Top Overdue Customers:</b>
` + (overdueLines || "  \u2713 no overdue balances");
}
async function sendOwnerDigestNow() {
  const claimed = await claimDigestSlotForToday();
  if (!claimed) return { sent: false };
  try {
    const msg = await buildDigestMessage();
    await sendTelegram(msg);
    return { sent: true };
  } catch (e) {
    console.warn("[owner-digest] failed:", e);
    return { sent: false };
  }
}
function maybeTriggerOwnerDigest() {
  (async () => {
    try {
      const hour = (/* @__PURE__ */ new Date()).getHours();
      if (hour < 6) return;
      const claimed = await claimDigestSlotForToday();
      if (!claimed) return;
      const msg = await buildDigestMessage();
      await sendTelegram(msg);
    } catch (e) {
      console.warn("[owner-digest] opportunistic trigger failed:", e);
    }
  })();
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

async function loadPerms(userId) {
  var _a;
  const cached = getCachedPerms(userId);
  if (cached) return cached;
  const conn = await getDb().getConnection();
  try {
    const [[row]] = await conn.query(
      `SELECT permissions FROM user_permissions WHERE user_id = ?`,
      [userId]
    );
    if (!row) {
      setCachedPerms(userId, { __none: true });
      return null;
    }
    let perms = {};
    try {
      perms = JSON.parse((_a = row.permissions) != null ? _a : "{}");
    } catch {
    }
    setCachedPerms(userId, perms);
    return perms;
  } catch {
    return null;
  } finally {
    conn.release();
  }
}
async function userCanAction(opts) {
  var _a;
  const role = opts.role.toLowerCase();
  if (["admin", "superadmin"].includes(role)) return true;
  const perms = await loadPerms(opts.userId);
  if (!perms || perms.__none) return opts.roleFallback.includes(role);
  const mod = perms[opts.module];
  if (!(mod == null ? void 0 : mod.enabled)) return false;
  if (!Array.isArray(mod.pages) || mod.pages.length === 0) return true;
  if (!mod.pages.includes(opts.page)) return false;
  const pageActions = (_a = mod.actions) == null ? void 0 : _a[opts.page];
  if (!pageActions || !(opts.action in pageActions)) return true;
  return pageActions[opts.action] === true;
}

const POS_VALID_METHODS = ["Cash", "Card", "Bank Transfer", "bKash", "Nagad"];
const DB_METHOD = {
  Cash: "Cash",
  Card: "Card",
  "Bank Transfer": "Bank Transfer",
  bKash: "Mobile Banking",
  Nagad: "Mobile Banking"
};
async function getPosCustomerOutstanding(conn, customerId) {
  var _a;
  const [[row]] = await conn.query(
    `SELECT COALESCE(SUM(debit_amount), 0) - COALESCE(SUM(credit_amount), 0) AS bal
     FROM pos_customer_ledger WHERE customer_id = ?`,
    [customerId]
  );
  return Number((_a = row == null ? void 0 : row.bal) != null ? _a : 0);
}
async function postPosSale(conn, input) {
  var _a, _b, _c, _d, _e;
  const { items, discount, paymentMethod, cashAccountId, bankAccountId, branchId, customerId, userId } = input;
  if (!(items == null ? void 0 : items.length)) throw createError$1({ statusCode: 400, statusMessage: "No items in cart" });
  if (!POS_VALID_METHODS.includes(paymentMethod))
    throw createError$1({ statusCode: 400, statusMessage: "Invalid payment method" });
  const subtotal = items.reduce((s, i) => s + Number(i.unit_price) * Number(i.quantity), 0);
  const total = Math.max(0, subtotal - Number(discount || 0));
  const creditAmt = Math.max(0, Math.min(Number(input.creditAmount) || 0, total));
  const cashAmt = input.cashAmount !== null ? Math.max(0, Number(input.cashAmount)) : total - creditAmt;
  if (Math.abs(cashAmt + creditAmt - total) > 0.01)
    throw createError$1({ statusCode: 400, statusMessage: `Cash (\u09F3${cashAmt}) + Credit (\u09F3${creditAmt}) must equal the total (\u09F3${total})` });
  if (creditAmt > 0 && !customerId)
    throw createError$1({ statusCode: 400, statusMessage: "A customer is required for any credit portion of a sale" });
  let customer = null;
  if (customerId) {
    const [[c]] = await conn.query(`SELECT id, name FROM customers WHERE id = ?`, [customerId]);
    customer = c;
  }
  const dbMethod = creditAmt >= total - 5e-3 ? "Credit" : DB_METHOD[paymentMethod];
  let exitStatus = "cleared";
  if (creditAmt > 5e-3 && !input.isAdmin) {
    const cap = await getUserActionLimit(conn, userId, "pos_exit_release");
    exitStatus = cap !== null && creditAmt <= cap ? "cleared" : "pending_approval";
  }
  const orderNumber = await nextDocNumber(conn, "ORD", "orders", "order_number");
  const paymentStatus = creditAmt <= 5e-3 ? "Paid" : cashAmt <= 5e-3 ? "Unpaid" : "Partial";
  const [orderResult] = await conn.query(
    `INSERT INTO orders
       (order_number, branch_id, customer_id, order_date, order_type,
        subtotal, discount_amount, total_amount,
        cash_amount, credit_amount, payment_method, payment_reference,
        cash_account_id, bank_account_id,
        payment_status, order_status, exit_status,
        exit_cleared_by_user_id, exit_cleared_at,
        exit_requested_by_user_id, exit_requested_at,
        created_by_user_id)
     VALUES (?, ?, ?, NOW(), 'POS', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Completed', ?, ?, ?, ?, ?, ?)`,
    [
      orderNumber,
      branchId,
      customerId || null,
      subtotal,
      Number(discount || 0),
      total,
      cashAmt,
      creditAmt,
      dbMethod,
      input.paymentReference || null,
      cashAccountId || null,
      bankAccountId || null,
      paymentStatus,
      exitStatus,
      exitStatus === "cleared" ? userId : null,
      exitStatus === "cleared" ? /* @__PURE__ */ new Date() : null,
      exitStatus === "pending_approval" ? userId : null,
      exitStatus === "pending_approval" ? /* @__PURE__ */ new Date() : null,
      userId
    ]
  );
  const orderId = orderResult.insertId;
  for (const item of items) {
    const lineTotal = Number(item.unit_price) * Number(item.quantity);
    await conn.query(
      `INSERT INTO order_items (order_id, variant_id, quantity, unit_price, subtotal, total_amount)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [orderId, item.variant_id, item.quantity, item.unit_price, lineTotal, lineTotal]
    );
    await conn.query(
      `UPDATE product_variants SET stock_qty = GREATEST(0, stock_qty - ?) WHERE id = ?`,
      [item.quantity, item.variant_id]
    );
  }
  const jeLines = [];
  let paidAccountId = null;
  if (cashAmt > 5e-3) {
    if (paymentMethod === "Cash" && cashAccountId) {
      const [[ca]] = await conn.query(`SELECT chart_of_account_id FROM branch_petty_cash_accounts WHERE id = ?`, [cashAccountId]);
      paidAccountId = (_a = ca == null ? void 0 : ca.chart_of_account_id) != null ? _a : null;
    } else if (bankAccountId) {
      const [[ba]] = await conn.query(`SELECT chart_of_account_id FROM bank_accounts WHERE id = ?`, [bankAccountId]);
      paidAccountId = (_b = ba == null ? void 0 : ba.chart_of_account_id) != null ? _b : null;
    }
    if (paidAccountId) jeLines.push({ accountId: paidAccountId, debit: cashAmt, credit: 0, memo: orderNumber });
  }
  let arId = null;
  if (creditAmt > 5e-3) {
    arId = await getGLAccountId(conn, "Accounts Receivable");
    if (arId) jeLines.push({ accountId: arId, debit: creditAmt, credit: 0, memo: orderNumber });
  }
  const revId = await getGLAccountId(conn, "Revenue");
  let jeId = null;
  if (revId && jeLines.length && Math.abs(jeLines.reduce((s, l) => s + l.debit, 0) - total) < 0.01) {
    jeLines.push({ accountId: revId, debit: 0, credit: total, memo: orderNumber });
    jeId = await postJournalEntry(conn, {
      date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      description: `POS sale ${orderNumber}${customer ? ` \u2014 ${customer.name}` : " \u2014 walk-in"}`,
      docType: "PosOrder",
      docId: orderId,
      userId,
      lines: jeLines
    });
    await conn.query(`UPDATE orders SET journal_entry_id = ? WHERE id = ?`, [jeId, orderId]);
    if (paymentMethod === "Cash" && cashAccountId && cashAmt > 5e-3) {
      const [[pcAcc]] = await conn.query(`SELECT current_balance, branch_id FROM branch_petty_cash_accounts WHERE id = ?`, [cashAccountId]);
      await conn.query(
        `INSERT INTO branch_petty_cash_transactions
           (account_id, branch_id, transaction_type, amount, balance_after,
            reference_type, reference_id, description, created_by_user_id, transaction_date)
         VALUES (?, ?, 'cash_in', ?, ?, 'pos_order', ?, ?, ?, CURDATE())`,
        [
          cashAccountId,
          (_c = pcAcc == null ? void 0 : pcAcc.branch_id) != null ? _c : branchId,
          cashAmt,
          Number((_d = pcAcc == null ? void 0 : pcAcc.current_balance) != null ? _d : 0) + cashAmt,
          orderId,
          `POS sale ${orderNumber}`,
          userId
        ]
      );
      await conn.query(`UPDATE branch_petty_cash_accounts SET current_balance = current_balance + ? WHERE id = ?`, [cashAmt, cashAccountId]);
    }
  } else {
    console.warn(`[pos-sale] Skipping JE for ${orderNumber}: lines=${jeLines.length}, rev=${revId}`);
  }
  if (creditAmt > 5e-3 && customerId) {
    await conn.query(
      `INSERT INTO pos_customer_ledger
         (customer_id, order_id, transaction_date, transaction_type, description, debit_amount, credit_amount, reference_number, created_by_user_id)
       VALUES (?, ?, CURDATE(), 'sale', ?, ?, 0, ?, ?)`,
      [customerId, orderId, `POS sale ${orderNumber}`, creditAmt, orderNumber, userId]
    );
  }
  return { orderNumber, orderId, total, cashAmount: cashAmt, creditAmount: creditAmt, exitStatus, customerName: (_e = customer == null ? void 0 : customer.name) != null ? _e : null };
}

const SECRET_KEY = "invoice_qr_secret";
async function getDeliveryQrSecret(conn) {
  var _a;
  const [[row]] = await conn.query(
    `SELECT setting_value FROM system_settings WHERE setting_key = ?`,
    [SECRET_KEY]
  );
  if (row == null ? void 0 : row.setting_value) return row.setting_value;
  const secret = crypto.randomBytes(24).toString("hex");
  await conn.query(
    `INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE setting_value = setting_value`,
    [SECRET_KEY, secret]
  );
  const [[row2]] = await conn.query(
    `SELECT setting_value FROM system_settings WHERE setting_key = ?`,
    [SECRET_KEY]
  );
  return (_a = row2 == null ? void 0 : row2.setting_value) != null ? _a : secret;
}
function deliveryQrSignature(orderNumber, secret) {
  return crypto.createHmac("sha256", secret).update(`DELIV|${orderNumber}`).digest("hex").slice(0, 16);
}
function posExitQrSignature(orderNumber, secret) {
  return crypto.createHmac("sha256", secret).update(`POSEXIT|${orderNumber}`).digest("hex").slice(0, 16);
}
async function recordPosExitScan(conn, opts) {
  var _a;
  await conn.query(
    `INSERT INTO pos_qr_scan_log (order_id, order_number, reused, scanned_by_user_id, scanned_by_name, ip)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [opts.orderId, opts.orderNumber, opts.alreadyCleared ? 1 : 0, opts.scannerId, opts.scannerName, opts.ip]
  );
  const [[row]] = await conn.query(
    `SELECT COUNT(*) AS c FROM pos_qr_scan_log WHERE order_id = ?`,
    [opts.orderId]
  );
  const total = Number((_a = row == null ? void 0 : row.c) != null ? _a : 0);
  if (opts.alreadyCleared) {
    sendTelegram(
      `\u26A0\uFE0F <b>POS EXIT QR RE-SCANNED</b>
Order: ${opts.orderNumber}
Already cleared for exit \u2014 scanned again by ${opts.scannerName}
Total scans on this QR: ${total}

Possible duplicate exit / gate bypass attempt \u2014 please verify.`,
      "dispatch"
    );
  }
  return total;
}
async function verifyDeliveryQrSignature(conn, orderNumber, sig) {
  const secret = await getDeliveryQrSecret(conn);
  const expected = deliveryQrSignature(orderNumber, secret);
  if (expected.length !== sig.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
}
async function recordQrScan(conn, opts) {
  var _a;
  const reused = opts.stage === "done" ? 1 : 0;
  await conn.query(
    `INSERT INTO cr_qr_scan_log
       (order_id, order_number, stage, reused, scanned_by_user_id, scanned_by_name, ip)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [opts.orderId, opts.orderNumber, opts.stage, reused, opts.scannerId, opts.scannerName, opts.ip]
  );
  const [[row]] = await conn.query(
    `SELECT COUNT(*) AS c FROM cr_qr_scan_log WHERE order_id = ?`,
    [opts.orderId]
  );
  const total = Number((_a = row == null ? void 0 : row.c) != null ? _a : 0);
  if (reused) {
    sendTelegram(
      `\u26A0\uFE0F <b>QR RE-SCANNED AFTER DELIVERY</b>
Order: ${opts.orderNumber}
Already delivered \u2014 scanned again by ${opts.scannerName}
Total scans on this QR: ${total}

Possible duplicate-delivery attempt \u2014 please verify.`,
      "dispatch"
    );
  }
  return total;
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

function mysqlDateTimeString(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
function serializeRow(row) {
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    out[k] = v instanceof Date ? mysqlDateTimeString(v) : v;
  }
  return out;
}
async function recycleBegin(conn, opts) {
  var _a;
  const [res] = await conn.query(
    `INSERT INTO recycle_bin_batches
       (entity_type, label, customer_id, deleted_by_user_id, deleted_by_name)
     VALUES (?, ?, ?, ?, ?)`,
    [opts.entityType, opts.label.slice(0, 200), (_a = opts.customerId) != null ? _a : null, opts.userId, opts.userName]
  );
  return res.insertId;
}
async function recycleArchiveDelete(conn, batchId, table, whereCol, whereVal, pkCol = "id") {
  const [rows] = await conn.query(`SELECT * FROM \`${table}\` WHERE \`${whereCol}\` = ?`, [whereVal]);
  if (!rows.length) return 0;
  for (const row of rows) {
    await conn.query(
      `INSERT INTO recycle_bin_items (batch_id, table_name, op, row_pk_col, row_pk_val, snapshot_json)
       VALUES (?, ?, 'delete', ?, ?, ?)`,
      [batchId, table, pkCol, String(row[pkCol]), JSON.stringify(serializeRow(row))]
    );
  }
  await conn.query(`DELETE FROM \`${table}\` WHERE \`${whereCol}\` = ?`, [whereVal]);
  return rows.length;
}
async function recycleSnapshotBefore(conn, batchId, table, whereCol, whereVal, pkCol = "id") {
  const [rows] = await conn.query(`SELECT * FROM \`${table}\` WHERE \`${whereCol}\` = ?`, [whereVal]);
  for (const row of rows) {
    await conn.query(
      `INSERT INTO recycle_bin_items (batch_id, table_name, op, row_pk_col, row_pk_val, snapshot_json)
       VALUES (?, ?, 'update', ?, ?, ?)`,
      [batchId, table, pkCol, String(row[pkCol]), JSON.stringify(serializeRow(row))]
    );
  }
  return rows.length;
}
async function recycleFinalize(conn, batchId) {
  await conn.query(
    `UPDATE recycle_bin_batches
     SET item_count = (SELECT COUNT(*) FROM recycle_bin_items WHERE batch_id = ?)
     WHERE id = ?`,
    [batchId, batchId]
  );
}
async function recycleRestore(getDb2, batchId, userId) {
  const conn = await getDb2().getConnection();
  try {
    await conn.beginTransaction();
    const [[batch]] = await conn.query(`SELECT * FROM recycle_bin_batches WHERE id = ? FOR UPDATE`, [batchId]);
    if (!batch) throw createError$1({ statusCode: 404, statusMessage: "Recycle bin batch not found" });
    if (batch.status !== "active") throw createError$1({ statusCode: 409, statusMessage: `This batch is already ${batch.status}` });
    const [items] = await conn.query(
      `SELECT * FROM recycle_bin_items WHERE batch_id = ? ORDER BY id DESC`,
      [batchId]
    );
    for (const item of items) {
      const snapshot = JSON.parse(item.snapshot_json);
      if (item.op === "delete") {
        const cols = Object.keys(snapshot);
        const placeholders = cols.map(() => "?").join(", ");
        const colList = cols.map((c) => `\`${c}\``).join(", ");
        await conn.query(
          `INSERT INTO \`${item.table_name}\` (${colList}) VALUES (${placeholders})`,
          cols.map((c) => snapshot[c])
        );
      } else {
        const cols = Object.keys(snapshot).filter((c) => c !== item.row_pk_col);
        const setClause = cols.map((c) => `\`${c}\` = ?`).join(", ");
        await conn.query(
          `UPDATE \`${item.table_name}\` SET ${setClause} WHERE \`${item.row_pk_col}\` = ?`,
          [...cols.map((c) => snapshot[c]), item.row_pk_val]
        );
      }
    }
    await conn.query(
      `UPDATE recycle_bin_batches SET status = 'restored', restored_by_user_id = ?, restored_at = NOW() WHERE id = ?`,
      [userId, batchId]
    );
    await conn.commit();
    return { restored: items.length };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}
async function recyclePurge(getDb2, batchId, userId) {
  const conn = await getDb2().getConnection();
  try {
    await conn.beginTransaction();
    const [[batch]] = await conn.query(`SELECT status FROM recycle_bin_batches WHERE id = ? FOR UPDATE`, [batchId]);
    if (!batch) throw createError$1({ statusCode: 404, statusMessage: "Recycle bin batch not found" });
    if (batch.status === "purged") throw createError$1({ statusCode: 409, statusMessage: "Already purged" });
    await conn.query(`DELETE FROM recycle_bin_items WHERE batch_id = ?`, [batchId]);
    await conn.query(
      `UPDATE recycle_bin_batches SET status = 'purged', purged_by_user_id = ?, purged_at = NOW() WHERE id = ?`,
      [userId, batchId]
    );
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
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
const _2dd7U6 = defineEventHandler(async (event) => {
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

const _lazy_7Gmxds = () => import('../routes/api/accounts/coa.get.mjs');
const _lazy_73MIAO = () => import('../routes/api/accounts/coa.post.mjs');
const _lazy_Ylw9Jt = () => import('../routes/api/accounts/coa/_id_.patch.mjs');
const _lazy_Tzux1o = () => import('../routes/api/accounts/daily-log.get.mjs');
const _lazy_EMc9vu = () => import('../routes/api/accounts/dashboard.get.mjs');
const _lazy_swJKxn = () => import('../routes/api/accounts/journal.get.mjs');
const _lazy_thpHFO = () => import('../routes/api/accounts/journal.post.mjs');
const _lazy_0w75EF = () => import('../routes/api/accounts/journal/_id_.delete.mjs');
const _lazy_an82D4 = () => import('../routes/api/accounts/journal/_id/reverse.post.mjs');
const _lazy_BiAD7C = () => import('../routes/api/accounts/statements.get.mjs');
const _lazy_vu9oqh = () => import('../routes/api/accounts/tax-statement.get.mjs');
const _lazy_0k_PM4 = () => import('../routes/api/accounts/vouchers.get.mjs');
const _lazy_ch69Ug = () => import('../routes/api/accounts/vouchers.post.mjs');
const _lazy_mpkJtk = () => import('../routes/api/admin/audit-logs.get.mjs');
const _lazy_YPCcA7 = () => import('../routes/api/admin/dashboard.get.mjs');
const _lazy_brKxWN = () => import('../routes/api/admin/employees.get.mjs');
const _lazy_X3szF0 = () => import('../routes/api/admin/employees.post.mjs');
const _lazy_iB7yS6 = () => import('../routes/api/admin/recycle-bin.get.mjs');
const _lazy_BgynVF = () => import('../routes/api/admin/recycle-bin/_id_.get.mjs');
const _lazy_yJjJkf = () => import('../routes/api/admin/recycle-bin/_id/purge.post.mjs');
const _lazy_FqmTnv = () => import('../routes/api/admin/recycle-bin/_id/restore.post.mjs');
const _lazy_RupWmj = () => import('../routes/api/admin/seed-expense-journals.post.mjs');
const _lazy_stPnBQ = () => import('../routes/api/admin/users.get.mjs');
const _lazy_60Y9Ys = () => import('../routes/api/admin/users.post.mjs');
const _lazy_RlTaj_ = () => import('../routes/api/admin/users/_id_.delete.mjs');
const _lazy_GlotgY = () => import('../routes/api/admin/users/_id_.get.mjs');
const _lazy_PcmxmQ = () => import('../routes/api/admin/users/_id_.patch.mjs');
const _lazy_IZIEF0 = () => import('../routes/api/admin/users/_id/permissions.get.mjs');
const _lazy_5dopgu = () => import('../routes/api/admin/users/_id/permissions.put.mjs');
const _lazy__jFwg3 = () => import('../routes/api/auth/login.post.mjs');
const _lazy_EvF7Lp = () => import('../routes/api/auth/logout.post.mjs');
const _lazy_IPJ2yH = () => import('../routes/api/auth/me.get.mjs');
const _lazy_2B83jf = () => import('../routes/api/bank-accounts.get.mjs');
const _lazy_cfEgBm = () => import('../routes/api/bank/account-types.get.mjs');
const _lazy_XaSdT8 = () => import('../routes/api/bank/accounts/_id_.patch.mjs');
const _lazy_9rCirQ = () => import('../routes/api/bank/index.get.mjs');
const _lazy_7gpdd4 = () => import('../routes/api/bank/index.post.mjs');
const _lazy_UWUarM = () => import('../routes/api/bank/dashboard.get.mjs');
const _lazy_7oZmz3 = () => import('../routes/api/bank/gl-ledger.get.mjs');
const _lazy_chsGz4 = () => import('../routes/api/bank/reconciliation.get.mjs');
const _lazy_frdUfh = () => import('../routes/api/bank/reconciliation/_id/toggle.post.mjs');
const _lazy_kUU34N = () => import('../routes/api/bank/transaction-types/_id_.patch.mjs');
const _lazy_P8tjvp = () => import('../routes/api/bank/index.get2.mjs');
const _lazy_eKzfzv = () => import('../routes/api/bank/index.post2.mjs');
const _lazy_2AkUsw = () => import('../routes/api/bank/transactions/_id_.delete.mjs');
const _lazy_9SzWb9 = () => import('../routes/api/bank/transactions/_id_.get.mjs');
const _lazy_XBQjIK = () => import('../routes/api/bank/transactions/_id_.patch.mjs');
const _lazy_D5_aS3 = () => import('../routes/api/bank/transactions/bulk.post.mjs');
const _lazy_HeldIe = () => import('../routes/api/bank/index.get3.mjs');
const _lazy_kpbcwX = () => import('../routes/api/bank/index.post3.mjs');
const _lazy_E6BcO5 = () => import('../routes/api/bank/transfer.post.mjs');
const _lazy_MurNv9 = () => import('../routes/api/bank/unified-ledger.get.mjs');
const _lazy_4q3RxF = () => import('../routes/api/branches.get.mjs');
const _lazy_EZLV5x = () => import('../routes/api/branches.post.mjs');
const _lazy_nUwhYl = () => import('../routes/api/branches/_id_.put.mjs');
const _lazy_cCJADL = () => import('../routes/api/collector/collect.post.mjs');
const _lazy_idh7dK = () => import('../routes/api/collector/schedule.get.mjs');
const _lazy_l8NVxR = () => import('../routes/api/credit-sales/_id_.delete.mjs');
const _lazy_qE43Ct = () => import('../routes/api/credit-sales/_id_.get.mjs');
const _lazy_RhLzLp = () => import('../routes/api/credit-sales/_id/admin-edit.put.mjs');
const _lazy_TVGtXY = () => import('../routes/api/credit-sales/_id/amendments.get.mjs');
const _lazy_Z7nCSJ = () => import('../routes/api/credit-sales/_id/amendments.post.mjs');
const _lazy_7uOi6V = () => import('../routes/api/credit-sales/_id/deliver.post.mjs');
const _lazy_SNO0DP = () => import('../routes/api/credit-sales/_id/dispatch-slip.get.mjs');
const _lazy_FaA6Ut = () => import('../routes/api/credit-sales/_id/gates.get.mjs');
const _lazy_hCBGNJ = () => import('../routes/api/credit-sales/_id/gates.post.mjs');
const _lazy_s2LqTH = () => import('../routes/api/credit-sales/_id/over-deliveries.get.mjs');
const _lazy_llAvdI = () => import('../routes/api/credit-sales/_id/over-delivery.post.mjs');
const _lazy_oqyTGV = () => import('../routes/api/credit-sales/_id/override-status.post.mjs');
const _lazy_OXFFip = () => import('../routes/api/credit-sales/_id/payment.post.mjs');
const _lazy_lwtkYN = () => import('../routes/api/credit-sales/_id/return.post.mjs');
const _lazy_UZGdP0 = () => import('../routes/api/credit-sales/_id/returns.get.mjs');
const _lazy_P4UcDF = () => import('../routes/api/credit-sales/_id/workflow.post.mjs');
const _lazy_Mkugzt = () => import('../routes/api/credit-sales/ageing.get.mjs');
const _lazy_krE1cJ = () => import('../routes/api/credit-sales/amendments/_amendmentId/decide.post.mjs');
const _lazy_nbtPs9 = () => import('../routes/api/credit-sales/approval-limits.get.mjs');
const _lazy_UtppJl = () => import('../routes/api/credit-sales/approval-limits.post.mjs');
const _lazy_SNYoxD = () => import('../routes/api/credit-sales/backdated.post.mjs');
const _lazy_F7b1YN = () => import('../routes/api/credit-sales/credit-limits.get.mjs');
const _lazy_xsLtkA = () => import('../routes/api/credit-sales/credit-limits.patch.mjs');
const _lazy_n6EjbG = () => import('../routes/api/credit-sales/dispatch.get.mjs');
const _lazy_rQBxQh = () => import('../routes/api/credit-sales/export/ledger.csv.get.mjs');
const _lazy_nQ3F5s = () => import('../routes/api/credit-sales/export/orders.csv.get.mjs');
const _lazy_0ciQ3a = () => import('../routes/api/credit-sales/export/payments.csv.get.mjs');
const _lazy_u0V93m = () => import('../routes/api/index.get.mjs');
const _lazy_zvkhwr = () => import('../routes/api/index.post.mjs');
const _lazy_d0Qh9r = () => import('../routes/api/credit-sales/ledger.get.mjs');
const _lazy_eKFw5i = () => import('../routes/api/credit-sales/ledger/adjustment.post.mjs');
const _lazy_iSE3tG = () => import('../routes/api/credit-sales/over-deliveries.get.mjs');
const _lazy_bmSG8R = () => import('../routes/api/credit-sales/over-deliveries/_odId/retrieve.post.mjs');
const _lazy_p73TtG = () => import('../routes/api/credit-sales/over-deliveries/_odId/status.patch.mjs');
const _lazy_Alljar = () => import('../routes/api/credit-sales/payment-watch.get.mjs');
const _lazy_Joh4ag = () => import('../routes/api/credit-sales/payments.get.mjs');
const _lazy_1TbRPp = () => import('../routes/api/credit-sales/payments/_paymentId_.get.mjs');
const _lazy_iEGEHU = () => import('../routes/api/credit-sales/payments/reverse.post.mjs');
const _lazy_BDyeRx = () => import('../routes/api/credit-sales/pending-requests.get.mjs');
const _lazy_tRkNAq = () => import('../routes/api/credit-sales/pending-requests/_id/link-result.post.mjs');
const _lazy_fiMbOt = () => import('../routes/api/credit-sales/pending-requests/_id/reject.post.mjs');
const _lazy_F5V6xy = () => import('../routes/api/credit-sales/production-queue.get.mjs');
const _lazy_Sey619 = () => import('../routes/api/credit-sales/production-queue/reorder.patch.mjs');
const _lazy_ckFBUw = () => import('../routes/api/credit-sales/qr-scan-log.get.mjs');
const _lazy_qUnQy6 = () => import('../routes/api/credit-sales/returns/_returnId_.delete.mjs');
const _lazy_lYucwM = () => import('../routes/api/credit-sales/returns/_returnId/status.patch.mjs');
const _lazy_NT_6xs = () => import('../routes/api/cron/daily-digest.get.mjs');
const _lazy_0A7yyc = () => import('../routes/api/customers/_id_.delete.mjs');
const _lazy_irSmQq = () => import('../routes/api/customers/_id_.get.mjs');
const _lazy_nqJI7u = () => import('../routes/api/customers/_id_.patch.mjs');
const _lazy_xcuY1C = () => import('../routes/api/customers/_id/collect-payment.post.mjs');
const _lazy_J6O4db = () => import('../routes/api/customers/_id/credit-exposure.get.mjs');
const _lazy_Z7Zi7C = () => import('../routes/api/customers/_id/open-orders.get.mjs');
const _lazy_hZdoT1 = () => import('../routes/api/index.get2.mjs');
const _lazy_V0dZMg = () => import('../routes/api/index.post2.mjs');
const _lazy_ZRvdf2 = () => import('../routes/api/dashboard/activity.get.mjs');
const _lazy_l4hp6l = () => import('../routes/api/dashboard/exception-radar.get.mjs');
const _lazy_AdDW5Q = () => import('../routes/api/dashboard/monthly-revenue.get.mjs');
const _lazy_OefcLq = () => import('../routes/api/dashboard/stats.get.mjs');
const _lazy_ALVTwM = () => import('../routes/api/device/adms.mjs');
const _lazy_5vPpD1 = () => import('../routes/api/expenses/_id_.delete.mjs');
const _lazy_tbk0Jk = () => import('../routes/api/expenses/_id_.get.mjs');
const _lazy_svmmcx = () => import('../routes/api/expenses/_id_.patch.mjs');
const _lazy_tbYf2u = () => import('../routes/api/expenses/_id/approve.post.mjs');
const _lazy_XBmYmS = () => import('../routes/api/expenses/categories.get.mjs');
const _lazy_ZC0XZJ = () => import('../routes/api/expenses/categories.post.mjs');
const _lazy_3PC27x = () => import('../routes/api/expenses/categories/_id_.patch.mjs');
const _lazy_cuxzlO = () => import('../routes/api/expenses/dashboard.get.mjs');
const _lazy_FuDrDl = () => import('../routes/api/index.get3.mjs');
const _lazy_Gzym2k = () => import('../routes/api/index.post3.mjs');
const _lazy_tHfQqu = () => import('../routes/api/expenses/petty-cash-accounts.get.mjs');
const _lazy_JRrgtA = () => import('../routes/api/expenses/subcategories.get.mjs');
const _lazy_OtJXSW = () => import('../routes/api/expenses/subcategories/_id_.patch.mjs');
const _lazy_oSoXIO = () => import('../routes/api/fleet/dashboard.get.mjs');
const _lazy_Bph_Qo = () => import('../routes/api/fleet/drivers.get.mjs');
const _lazy_yPsolk = () => import('../routes/api/fleet/drivers.post.mjs');
const _lazy_mKO7nQ = () => import('../routes/api/fleet/drivers/_id_.get.mjs');
const _lazy_plUvEw = () => import('../routes/api/fleet/drivers/_id_.put.mjs');
const _lazy_bP0ilq = () => import('../routes/api/fleet/drivers/_id/documents.post.mjs');
const _lazy_XXx0Jp = () => import('../routes/api/fleet/drivers/documents/_id_.delete.mjs');
const _lazy_J5iT3J = () => import('../routes/api/fleet/fuel.get.mjs');
const _lazy_Ebdy_x = () => import('../routes/api/fleet/fuel.post.mjs');
const _lazy_TBBlEG = () => import('../routes/api/fleet/fuel/efficiency.get.mjs');
const _lazy_wlDQX7 = () => import('../routes/api/fleet/items.get.mjs');
const _lazy_YttKhn = () => import('../routes/api/fleet/items.post.mjs');
const _lazy_gXifV8 = () => import('../routes/api/fleet/maintenance.get.mjs');
const _lazy_7ivhMK = () => import('../routes/api/fleet/maintenance.post.mjs');
const _lazy__881ZA = () => import('../routes/api/fleet/maintenance/_id_.get.mjs');
const _lazy_LyN7yF = () => import('../routes/api/fleet/maintenance/_id_.patch.mjs');
const _lazy_6qBXBI = () => import('../routes/api/fleet/maintenance/rules.get.mjs');
const _lazy_J4Ot1P = () => import('../routes/api/fleet/maintenance/rules.post.mjs');
const _lazy_TVUyLw = () => import('../routes/api/fleet/maintenance/rules/_id_.delete.mjs');
const _lazy_1BX6vH = () => import('../routes/api/fleet/maintenance/rules/_id_.put.mjs');
const _lazy_h3Mhn3 = () => import('../routes/api/fleet/purchases.get.mjs');
const _lazy_TZdcP2 = () => import('../routes/api/fleet/purchases.post.mjs');
const _lazy_sME0Ys = () => import('../routes/api/fleet/purchases/_id_.get.mjs');
const _lazy_eyz6Fc = () => import('../routes/api/fleet/purchases/_id_.patch.mjs');
const _lazy_ueOLqs = () => import('../routes/api/fleet/rentals.get.mjs');
const _lazy_58xkUU = () => import('../routes/api/fleet/rentals.post.mjs');
const _lazy_hDspcd = () => import('../routes/api/fleet/rentals/_id_.patch.mjs');
const _lazy_cKC71f = () => import('../routes/api/fleet/reports/drivers.get.mjs');
const _lazy_bydq07 = () => import('../routes/api/fleet/reports/maintenance.get.mjs');
const _lazy_XvvAUY = () => import('../routes/api/fleet/reports/pnl.get.mjs');
const _lazy_2c7ktW = () => import('../routes/api/fleet/reports/trips.get.mjs');
const _lazy_Fsn8eL = () => import('../routes/api/fleet/reports/vehicles.get.mjs');
const _lazy_xzjRj6 = () => import('../routes/api/fleet/trips.get.mjs');
const _lazy_3WGNRS = () => import('../routes/api/fleet/trips.post.mjs');
const _lazy_CAU7Xi = () => import('../routes/api/fleet/trips/_id_.get.mjs');
const _lazy_wkC66D = () => import('../routes/api/fleet/trips/_id_.patch.mjs');
const _lazy_iGrB7E = () => import('../routes/api/fleet/trips/consolidation-suggestions.get.mjs');
const _lazy_8AeuBO = () => import('../routes/api/fleet/trips/consolidation-suggestions.post.mjs');
const _lazy_8JuoMC = () => import('../routes/api/fleet/vehicles.get.mjs');
const _lazy_FNENkS = () => import('../routes/api/fleet/vehicles.post.mjs');
const _lazy_ljfcAo = () => import('../routes/api/fleet/vehicles/_id_.get.mjs');
const _lazy_levgej = () => import('../routes/api/fleet/vehicles/_id_.put.mjs');
const _lazy_4HXHkt = () => import('../routes/api/fleet/vehicles/_id/documents.post.mjs');
const _lazy_ethFqZ = () => import('../routes/api/fleet/vehicles/documents/_id_.delete.mjs');
const _lazy_l733zI = () => import('../routes/api/hr/index.get.mjs');
const _lazy_zApIRH = () => import('../routes/api/hr/index.post.mjs');
const _lazy_sIn1tE = () => import('../routes/api/hr/assets.get.mjs');
const _lazy_mCH4N5 = () => import('../routes/api/hr/index.get2.mjs');
const _lazy_iTiMC7 = () => import('../routes/api/hr/index.post2.mjs');
const _lazy_7gRFiK = () => import('../routes/api/hr/biometric/face-list.get.mjs');
const _lazy_SOWQZD = () => import('../routes/api/hr/biometric/face-list.post.mjs');
const _lazy_aaPaTA = () => import('../routes/api/hr/index.get3.mjs');
const _lazy_pK7VEu = () => import('../routes/api/hr/index.post3.mjs');
const _lazy_m_MgJF = () => import('../routes/api/hr/index.get4.mjs');
const _lazy_dOF7x1 = () => import('../routes/api/hr/index.post4.mjs');
const _lazy_dsjObm = () => import('../routes/api/hr/dashboard.get.mjs');
const _lazy_c1ufjb = () => import('../routes/api/hr/index.get5.mjs');
const _lazy_7PekTb = () => import('../routes/api/hr/employees/_id_.get.mjs');
const _lazy__GMXqy = () => import('../routes/api/hr/employees/_id_.photo.post.mjs');
const _lazy_QZ_iqR = () => import('../routes/api/hr/employees/_id_.post.mjs');
const _lazy_QoSIMe = () => import('../routes/api/hr/employees/face.post.mjs');
const _lazy_mtfcY8 = () => import('../routes/api/hr/index.get6.mjs');
const _lazy_CuzurF = () => import('../routes/api/hr/index.post5.mjs');
const _lazy_5Z96Rf = () => import('../routes/api/hr/index.get7.mjs');
const _lazy_5IxlYV = () => import('../routes/api/hr/index.post6.mjs');
const _lazy_5UOQ6t = () => import('../routes/api/hr/index.get8.mjs');
const _lazy_eikuTZ = () => import('../routes/api/hr/index.post7.mjs');
const _lazy_Tmg1ta = () => import('../routes/api/hr/index.get9.mjs');
const _lazy_pSDyWZ = () => import('../routes/api/hr/index.post8.mjs');
const _lazy_ZobcyD = () => import('../routes/api/hr/index.get10.mjs');
const _lazy_PnhJ0Q = () => import('../routes/api/hr/index.post9.mjs');
const _lazy_bNgzth = () => import('../routes/api/hr/index.get11.mjs');
const _lazy_ySUTFm = () => import('../routes/api/hr/index.post10.mjs');
const _lazy_avjoBK = () => import('../routes/api/hr/index.get12.mjs');
const _lazy_qmCh6F = () => import('../routes/api/hr/index.get13.mjs');
const _lazy_Kf2iif = () => import('../routes/api/hr/index.post11.mjs');
const _lazy_9AgoAe = () => import('../routes/api/hr/index.get14.mjs');
const _lazy_aJ1Pge = () => import('../routes/api/hr/index.post12.mjs');
const _lazy_k5tC05 = () => import('../routes/api/kiosk/clock-in.post.mjs');
const _lazy_ipWS24 = () => import('../routes/api/kiosk/descriptors.get.mjs');
const _lazy_8pSKPR = () => import('../routes/api/kiosk/verify.post.mjs');
const _lazy_gd0Pq0 = () => import('../routes/api/loans/_id_.delete.mjs');
const _lazy_3N8wl1 = () => import('../routes/api/loans/_id_.get.mjs');
const _lazy_X8ySwk = () => import('../routes/api/loans/_id/repay.post.mjs');
const _lazy_T0uIMv = () => import('../routes/api/index.get4.mjs');
const _lazy_1EYzEe = () => import('../routes/api/index.post4.mjs');
const _lazy_N_hHil = () => import('../routes/api/loans/repayments/_repayId_.delete.mjs');
const _lazy_CUc_PM = () => import('../routes/api/logistics/drivers.get.mjs');
const _lazy_gEUxdl = () => import('../routes/api/logistics/drivers.post.mjs');
const _lazy_ySxInH = () => import('../routes/api/logistics/fuel.get.mjs');
const _lazy_7HHLMN = () => import('../routes/api/logistics/fuel.post.mjs');
const _lazy_ghEv3P = () => import('../routes/api/logistics/maintenance.get.mjs');
const _lazy_22UPbM = () => import('../routes/api/logistics/maintenance.post.mjs');
const _lazy_9Jnfq6 = () => import('../routes/api/logistics/trips.get.mjs');
const _lazy_8zjJkl = () => import('../routes/api/logistics/trips.post.mjs');
const _lazy_dNHqs_ = () => import('../routes/api/logistics/vehicles.get.mjs');
const _lazy_fPOVnG = () => import('../routes/api/logistics/vehicles.post.mjs');
const _lazy_rKdm4U = () => import('../routes/api/lookup/bank-accounts.get.mjs');
const _lazy_APl9jt = () => import('../routes/api/lookup/cash-accounts.get.mjs');
const _lazy_xt91AG = () => import('../routes/api/lookup/employees.get.mjs');
const _lazy_WaLK9a = () => import('../routes/api/me/permissions.get.mjs');
const _lazy_DpGmoG = () => import('../routes/api/notifications.get.mjs');
const _lazy_CiTMtj = () => import('../routes/api/pos/_id_.delete.mjs');
const _lazy_ooGvD3 = () => import('../routes/api/pos/_id_.get.mjs');
const _lazy_qqz1V4 = () => import('../routes/api/pos/_id_.patch.mjs');
const _lazy_Rwl8kv = () => import('../routes/api/pos/complete.post.mjs');
const _lazy_Cg74fS = () => import('../routes/api/pos/customers/_id/collect-payment.post.mjs');
const _lazy_8EbA6Q = () => import('../routes/api/pos/customers/_id/ledger.get.mjs');
const _lazy_g3D5Bk = () => import('../routes/api/pos/dashboard.get.mjs');
const _lazy_GSo0zy = () => import('../routes/api/pos/eod.get.mjs');
const _lazy_dANiIy = () => import('../routes/api/pos/eod.post.mjs');
const _lazy_YmW4sN = () => import('../routes/api/pos/eod/_id/deposit.post.mjs');
const _lazy_HDuRCI = () => import('../routes/api/pos/exit/_order_.get.mjs');
const _lazy_BN4nwN = () => import('../routes/api/pos/exit/_order/clear.post.mjs');
const _lazy_9X7VtK = () => import('../routes/api/pos/exit/_order/request-approval.post.mjs');
const _lazy_ZE10Bh = () => import('../routes/api/pos/pending-approvals.get.mjs');
const _lazy_p_TLnR = () => import('../routes/api/pos/pending-approvals/_id/approve.post.mjs');
const _lazy_SFMWQ6 = () => import('../routes/api/pos/pending-approvals/_id/reject.post.mjs');
const _lazy_YpL4yo = () => import('../routes/api/pos/products.get.mjs');
const _lazy_JlBecE = () => import('../routes/api/pos/reports.get.mjs');
const _lazy_7bQa3c = () => import('../routes/api/pos/today.get.mjs');
const _lazy_rDop2C = () => import('../routes/api/positions.get.mjs');
const _lazy_CLSS3I = () => import('../routes/api/production/_id_.get.mjs');
const _lazy_HbRtg5 = () => import('../routes/api/production/_id_.patch.mjs');
const _lazy_uT3Lwk = () => import('../routes/api/index.get5.mjs');
const _lazy_wgonVG = () => import('../routes/api/index.post5.mjs');
const _lazy_PwfPQl = () => import('../routes/api/products/base.get.mjs');
const _lazy_R7MZ_o = () => import('../routes/api/products/base.post.mjs');
const _lazy_EpSqex = () => import('../routes/api/products/base/_id_.delete.mjs');
const _lazy_OZfFz9 = () => import('../routes/api/products/base/_id_.put.mjs');
const _lazy_GdMRnx = () => import('../routes/api/products/export/csv.get.mjs');
const _lazy_GylLlX = () => import('../routes/api/products/hub.get.mjs');
const _lazy_BdPSvU = () => import('../routes/api/index.get6.mjs');
const _lazy_LQ4TSs = () => import('../routes/api/products/inventory.get.mjs');
const _lazy_mj7ixg = () => import('../routes/api/products/pricing-engine.get.mjs');
const _lazy_SkoWMh = () => import('../routes/api/products/pricing-engine.post.mjs');
const _lazy_zWgEtt = () => import('../routes/api/products/pricing.get.mjs');
const _lazy_c9PSQj = () => import('../routes/api/products/pricing.post.mjs');
const _lazy_fHkQdK = () => import('../routes/api/products/pricing/_variantId_.get.mjs');
const _lazy_gSY6Na = () => import('../routes/api/products/pricing/_variantId_.post.mjs');
const _lazy_TPpNRb = () => import('../routes/api/products/pricing/_variantId/archive.post.mjs');
const _lazy_djh_hZ = () => import('../routes/api/products/pricing/history.get.mjs');
const _lazy_aaxzcu = () => import('../routes/api/products/stock-adjustments.get.mjs');
const _lazy_cDNVVD = () => import('../routes/api/products/stock-adjustments.post.mjs');
const _lazy_NYhwt7 = () => import('../routes/api/products/stock-adjustments/_id/status.patch.mjs');
const _lazy_G0tQfk = () => import('../routes/api/products/variants.get.mjs');
const _lazy__y6aic = () => import('../routes/api/products/variants.post.mjs');
const _lazy_f1cA_w = () => import('../routes/api/products/variants/_id_.delete.mjs');
const _lazy_gUamsE = () => import('../routes/api/products/variants/_id_.put.mjs');
const _lazy_m3ESkD = () => import('../routes/api/purchase/adjustments.get.mjs');
const _lazy_9nMIYc = () => import('../routes/api/purchase/adjustments.post.mjs');
const _lazy_Qo4Zhw = () => import('../routes/api/purchase/adjustments/_id_.get.mjs');
const _lazy_eW4_gj = () => import('../routes/api/purchase/adjustments/_id_.patch.mjs');
const _lazy_OLaTER = () => import('../routes/api/purchase/commodities.get.mjs');
const _lazy_vRClym = () => import('../routes/api/purchase/commodities.post.mjs');
const _lazy_dKHTF6 = () => import('../routes/api/purchase/commodities/_id_.patch.mjs');
const _lazy_YwUCMt = () => import('../routes/api/purchase/dashboard.get.mjs');
const _lazy_xwtloa = () => import('../routes/api/purchase/grn.get.mjs');
const _lazy_Rgmv6O = () => import('../routes/api/purchase/grn/_id_.delete.mjs');
const _lazy_HkdotF = () => import('../routes/api/purchase/grn/_id_.get.mjs');
const _lazy_RxDl7k = () => import('../routes/api/purchase/grn/_id_.patch.mjs');
const _lazy_X7Jnzf = () => import('../routes/api/purchase/index.post.mjs');
const _lazy_4eqwcj = () => import('../routes/api/purchase/grn/variance.get.mjs');
const _lazy_b9L9QL = () => import('../routes/api/purchase/orders.get.mjs');
const _lazy_YGd6kQ = () => import('../routes/api/purchase/orders/_id_.delete.mjs');
const _lazy_3lZU04 = () => import('../routes/api/purchase/orders/_id_.get.mjs');
const _lazy_feXeRp = () => import('../routes/api/purchase/orders/_id_.patch.mjs');
const _lazy_JXXOKp = () => import('../routes/api/purchase/orders/_id/close.post.mjs');
const _lazy_Bt_S9e = () => import('../routes/api/purchase/index.post2.mjs');
const _lazy_BI90v7 = () => import('../routes/api/purchase/orders/open.get.mjs');
const _lazy_2H6pqg = () => import('../routes/api/purchase/payments.get.mjs');
const _lazy_kOCFOS = () => import('../routes/api/purchase/payments.post.mjs');
const _lazy_KRcZDa = () => import('../routes/api/purchase/payments/_id_.delete.mjs');
const _lazy_EUjPVH = () => import('../routes/api/purchase/payments/_id_.get.mjs');
const _lazy_Bvn8dn = () => import('../routes/api/purchase/payments/_id_.patch.mjs');
const _lazy_nkJFai = () => import('../routes/api/purchase/reconcile.get.mjs');
const _lazy_DjRgUK = () => import('../routes/api/purchase/suppliers/_id_.patch.mjs');
const _lazy_oTpcGN = () => import('../routes/api/purchase/suppliers/_id/credit.get.mjs');
const _lazy_sbqGBJ = () => import('../routes/api/purchase/suppliers/_id/ledger.get.mjs');
const _lazy_tRjFEk = () => import('../routes/api/purchase/index.post3.mjs');
const _lazy_HUjmpq = () => import('../routes/api/purchase/suppliers/summary.get.mjs');
const _lazy_qeOoL4 = () => import('../routes/api/sales/dashboard.get.mjs');
const _lazy_N8vI0d = () => import('../routes/api/search.get.mjs');
const _lazy_RS4crC = () => import('../routes/api/settings/credit-workflow.get.mjs');
const _lazy_Bkq2Ma = () => import('../routes/api/settings/credit-workflow.put.mjs');
const _lazy_1MEvqN = () => import('../routes/api/settings/delivery.get.mjs');
const _lazy_tsHy0t = () => import('../routes/api/settings/delivery.put.mjs');
const _lazy_7XsXm8 = () => import('../routes/api/settings/documents.get.mjs');
const _lazy_wV9pXF = () => import('../routes/api/settings/documents.put.mjs');
const _lazy_JhLVQi = () => import('../routes/api/settings/tax.get.mjs');
const _lazy_0_39sz = () => import('../routes/api/settings/tax.put.mjs');
const _lazy_4C95d3 = () => import('../routes/api/settings/telegram.get.mjs');
const _lazy_QnYBO4 = () => import('../routes/api/settings/telegram.put.mjs');
const _lazy_hMP8PQ = () => import('../routes/api/index.get7.mjs');
const _lazy_ln_1ov = () => import('../routes/api/trading/commodities.get.mjs');
const _lazy_ZqgKAw = () => import('../routes/api/trading/dashboard.get.mjs');
const _lazy_EJJMzd = () => import('../routes/api/trading/margin-report.get.mjs');
const _lazy_g57txI = () => import('../routes/api/trading/partners.get.mjs');
const _lazy_j4KOKQ = () => import('../routes/api/trading/partners.post.mjs');
const _lazy_TygH4x = () => import('../routes/api/trading/payments/_paymentId_.delete.mjs');
const _lazy_5nZFTe = () => import('../routes/api/trading/sales.get.mjs');
const _lazy_5YqTRv = () => import('../routes/api/trading/sales.post.mjs');
const _lazy_uBD1Q1 = () => import('../routes/api/trading/sales/_id_.delete.mjs');
const _lazy_tM2dba = () => import('../routes/api/trading/sales/_id_.get.mjs');
const _lazy_WYX9Ys = () => import('../routes/api/trading/sales/_id/dispatch.post.mjs');
const _lazy_UIBooL = () => import('../routes/api/trading/sales/_id/edit.post.mjs');
const _lazy_ier8ms = () => import('../routes/api/trading/sales/_id/gate-pass.get.mjs');
const _lazy_fF5Alv = () => import('../routes/api/trading/sales/_id/invoice.get.mjs');
const _lazy_oSi4jE = () => import('../routes/api/trading/sales/_id/payment.post.mjs');
const _lazy_QJZkts = () => import('../routes/api/trading/settlement.post.mjs');
const _lazy_9fNxjI = () => import('../routes/api/verify/_order_.get.mjs');
const _lazy_RPvyEn = () => import('../routes/api/verify/_order/deliver.post.mjs');
const _lazy_4XJCMP = () => import('../routes/api/verify/_order/gate.post.mjs');
const _lazy_fz2BBz = () => import('../routes/renderer.mjs').then(function (n) { return n.r; });

const handlers = [
  { route: '', handler: _6tTLGT, lazy: false, middleware: true, method: undefined },
  { route: '', handler: _2dd7U6, lazy: false, middleware: true, method: undefined },
  { route: '/api/accounts/coa', handler: _lazy_7Gmxds, lazy: true, middleware: false, method: "get" },
  { route: '/api/accounts/coa', handler: _lazy_73MIAO, lazy: true, middleware: false, method: "post" },
  { route: '/api/accounts/coa/:id', handler: _lazy_Ylw9Jt, lazy: true, middleware: false, method: "patch" },
  { route: '/api/accounts/daily-log', handler: _lazy_Tzux1o, lazy: true, middleware: false, method: "get" },
  { route: '/api/accounts/dashboard', handler: _lazy_EMc9vu, lazy: true, middleware: false, method: "get" },
  { route: '/api/accounts/journal', handler: _lazy_swJKxn, lazy: true, middleware: false, method: "get" },
  { route: '/api/accounts/journal', handler: _lazy_thpHFO, lazy: true, middleware: false, method: "post" },
  { route: '/api/accounts/journal/:id', handler: _lazy_0w75EF, lazy: true, middleware: false, method: "delete" },
  { route: '/api/accounts/journal/:id/reverse', handler: _lazy_an82D4, lazy: true, middleware: false, method: "post" },
  { route: '/api/accounts/statements', handler: _lazy_BiAD7C, lazy: true, middleware: false, method: "get" },
  { route: '/api/accounts/tax-statement', handler: _lazy_vu9oqh, lazy: true, middleware: false, method: "get" },
  { route: '/api/accounts/vouchers', handler: _lazy_0k_PM4, lazy: true, middleware: false, method: "get" },
  { route: '/api/accounts/vouchers', handler: _lazy_ch69Ug, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/audit-logs', handler: _lazy_mpkJtk, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/dashboard', handler: _lazy_YPCcA7, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/employees', handler: _lazy_brKxWN, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/employees', handler: _lazy_X3szF0, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/recycle-bin', handler: _lazy_iB7yS6, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/recycle-bin/:id', handler: _lazy_BgynVF, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/recycle-bin/:id/purge', handler: _lazy_yJjJkf, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/recycle-bin/:id/restore', handler: _lazy_FqmTnv, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/seed-expense-journals', handler: _lazy_RupWmj, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/users', handler: _lazy_stPnBQ, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/users', handler: _lazy_60Y9Ys, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/users/:id', handler: _lazy_RlTaj_, lazy: true, middleware: false, method: "delete" },
  { route: '/api/admin/users/:id', handler: _lazy_GlotgY, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/users/:id', handler: _lazy_PcmxmQ, lazy: true, middleware: false, method: "patch" },
  { route: '/api/admin/users/:id/permissions', handler: _lazy_IZIEF0, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/users/:id/permissions', handler: _lazy_5dopgu, lazy: true, middleware: false, method: "put" },
  { route: '/api/auth/login', handler: _lazy__jFwg3, lazy: true, middleware: false, method: "post" },
  { route: '/api/auth/logout', handler: _lazy_EvF7Lp, lazy: true, middleware: false, method: "post" },
  { route: '/api/auth/me', handler: _lazy_IPJ2yH, lazy: true, middleware: false, method: "get" },
  { route: '/api/bank-accounts', handler: _lazy_2B83jf, lazy: true, middleware: false, method: "get" },
  { route: '/api/bank/account-types', handler: _lazy_cfEgBm, lazy: true, middleware: false, method: "get" },
  { route: '/api/bank/accounts/:id', handler: _lazy_XaSdT8, lazy: true, middleware: false, method: "patch" },
  { route: '/api/bank/accounts', handler: _lazy_9rCirQ, lazy: true, middleware: false, method: "get" },
  { route: '/api/bank/accounts', handler: _lazy_7gpdd4, lazy: true, middleware: false, method: "post" },
  { route: '/api/bank/dashboard', handler: _lazy_UWUarM, lazy: true, middleware: false, method: "get" },
  { route: '/api/bank/gl-ledger', handler: _lazy_7oZmz3, lazy: true, middleware: false, method: "get" },
  { route: '/api/bank/reconciliation', handler: _lazy_chsGz4, lazy: true, middleware: false, method: "get" },
  { route: '/api/bank/reconciliation/:id/toggle', handler: _lazy_frdUfh, lazy: true, middleware: false, method: "post" },
  { route: '/api/bank/transaction-types/:id', handler: _lazy_kUU34N, lazy: true, middleware: false, method: "patch" },
  { route: '/api/bank/transaction-types', handler: _lazy_P8tjvp, lazy: true, middleware: false, method: "get" },
  { route: '/api/bank/transaction-types', handler: _lazy_eKzfzv, lazy: true, middleware: false, method: "post" },
  { route: '/api/bank/transactions/:id', handler: _lazy_2AkUsw, lazy: true, middleware: false, method: "delete" },
  { route: '/api/bank/transactions/:id', handler: _lazy_9SzWb9, lazy: true, middleware: false, method: "get" },
  { route: '/api/bank/transactions/:id', handler: _lazy_XBQjIK, lazy: true, middleware: false, method: "patch" },
  { route: '/api/bank/transactions/bulk', handler: _lazy_D5_aS3, lazy: true, middleware: false, method: "post" },
  { route: '/api/bank/transactions', handler: _lazy_HeldIe, lazy: true, middleware: false, method: "get" },
  { route: '/api/bank/transactions', handler: _lazy_kpbcwX, lazy: true, middleware: false, method: "post" },
  { route: '/api/bank/transfer', handler: _lazy_E6BcO5, lazy: true, middleware: false, method: "post" },
  { route: '/api/bank/unified-ledger', handler: _lazy_MurNv9, lazy: true, middleware: false, method: "get" },
  { route: '/api/branches', handler: _lazy_4q3RxF, lazy: true, middleware: false, method: "get" },
  { route: '/api/branches', handler: _lazy_EZLV5x, lazy: true, middleware: false, method: "post" },
  { route: '/api/branches/:id', handler: _lazy_nUwhYl, lazy: true, middleware: false, method: "put" },
  { route: '/api/collector/collect', handler: _lazy_cCJADL, lazy: true, middleware: false, method: "post" },
  { route: '/api/collector/schedule', handler: _lazy_idh7dK, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/:id', handler: _lazy_l8NVxR, lazy: true, middleware: false, method: "delete" },
  { route: '/api/credit-sales/:id', handler: _lazy_qE43Ct, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/:id/admin-edit', handler: _lazy_RhLzLp, lazy: true, middleware: false, method: "put" },
  { route: '/api/credit-sales/:id/amendments', handler: _lazy_TVGtXY, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/:id/amendments', handler: _lazy_Z7nCSJ, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/:id/deliver', handler: _lazy_7uOi6V, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/:id/dispatch-slip', handler: _lazy_SNO0DP, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/:id/gates', handler: _lazy_FaA6Ut, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/:id/gates', handler: _lazy_hCBGNJ, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/:id/over-deliveries', handler: _lazy_s2LqTH, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/:id/over-delivery', handler: _lazy_llAvdI, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/:id/override-status', handler: _lazy_oqyTGV, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/:id/payment', handler: _lazy_OXFFip, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/:id/return', handler: _lazy_lwtkYN, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/:id/returns', handler: _lazy_UZGdP0, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/:id/workflow', handler: _lazy_P4UcDF, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/ageing', handler: _lazy_Mkugzt, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/amendments/:amendmentId/decide', handler: _lazy_krE1cJ, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/approval-limits', handler: _lazy_nbtPs9, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/approval-limits', handler: _lazy_UtppJl, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/backdated', handler: _lazy_SNYoxD, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/credit-limits', handler: _lazy_F7b1YN, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/credit-limits', handler: _lazy_xsLtkA, lazy: true, middleware: false, method: "patch" },
  { route: '/api/credit-sales/dispatch', handler: _lazy_n6EjbG, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/export/ledger.csv', handler: _lazy_rQBxQh, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/export/orders.csv', handler: _lazy_nQ3F5s, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/export/payments.csv', handler: _lazy_0ciQ3a, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales', handler: _lazy_u0V93m, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales', handler: _lazy_zvkhwr, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/ledger', handler: _lazy_d0Qh9r, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/ledger/adjustment', handler: _lazy_eKFw5i, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/over-deliveries', handler: _lazy_iSE3tG, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/over-deliveries/:odId/retrieve', handler: _lazy_bmSG8R, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/over-deliveries/:odId/status', handler: _lazy_p73TtG, lazy: true, middleware: false, method: "patch" },
  { route: '/api/credit-sales/payment-watch', handler: _lazy_Alljar, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/payments', handler: _lazy_Joh4ag, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/payments/:paymentId', handler: _lazy_1TbRPp, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/payments/reverse', handler: _lazy_iEGEHU, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/pending-requests', handler: _lazy_BDyeRx, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/pending-requests/:id/link-result', handler: _lazy_tRkNAq, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/pending-requests/:id/reject', handler: _lazy_fiMbOt, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/production-queue', handler: _lazy_F5V6xy, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/production-queue/reorder', handler: _lazy_Sey619, lazy: true, middleware: false, method: "patch" },
  { route: '/api/credit-sales/qr-scan-log', handler: _lazy_ckFBUw, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/returns/:returnId', handler: _lazy_qUnQy6, lazy: true, middleware: false, method: "delete" },
  { route: '/api/credit-sales/returns/:returnId/status', handler: _lazy_lYucwM, lazy: true, middleware: false, method: "patch" },
  { route: '/api/cron/daily-digest', handler: _lazy_NT_6xs, lazy: true, middleware: false, method: "get" },
  { route: '/api/customers/:id', handler: _lazy_0A7yyc, lazy: true, middleware: false, method: "delete" },
  { route: '/api/customers/:id', handler: _lazy_irSmQq, lazy: true, middleware: false, method: "get" },
  { route: '/api/customers/:id', handler: _lazy_nqJI7u, lazy: true, middleware: false, method: "patch" },
  { route: '/api/customers/:id/collect-payment', handler: _lazy_xcuY1C, lazy: true, middleware: false, method: "post" },
  { route: '/api/customers/:id/credit-exposure', handler: _lazy_J6O4db, lazy: true, middleware: false, method: "get" },
  { route: '/api/customers/:id/open-orders', handler: _lazy_Z7Zi7C, lazy: true, middleware: false, method: "get" },
  { route: '/api/customers', handler: _lazy_hZdoT1, lazy: true, middleware: false, method: "get" },
  { route: '/api/customers', handler: _lazy_V0dZMg, lazy: true, middleware: false, method: "post" },
  { route: '/api/dashboard/activity', handler: _lazy_ZRvdf2, lazy: true, middleware: false, method: "get" },
  { route: '/api/dashboard/exception-radar', handler: _lazy_l4hp6l, lazy: true, middleware: false, method: "get" },
  { route: '/api/dashboard/monthly-revenue', handler: _lazy_AdDW5Q, lazy: true, middleware: false, method: "get" },
  { route: '/api/dashboard/stats', handler: _lazy_OefcLq, lazy: true, middleware: false, method: "get" },
  { route: '/api/device/adms', handler: _lazy_ALVTwM, lazy: true, middleware: false, method: undefined },
  { route: '/api/expenses/:id', handler: _lazy_5vPpD1, lazy: true, middleware: false, method: "delete" },
  { route: '/api/expenses/:id', handler: _lazy_tbk0Jk, lazy: true, middleware: false, method: "get" },
  { route: '/api/expenses/:id', handler: _lazy_svmmcx, lazy: true, middleware: false, method: "patch" },
  { route: '/api/expenses/:id/approve', handler: _lazy_tbYf2u, lazy: true, middleware: false, method: "post" },
  { route: '/api/expenses/categories', handler: _lazy_XBmYmS, lazy: true, middleware: false, method: "get" },
  { route: '/api/expenses/categories', handler: _lazy_ZC0XZJ, lazy: true, middleware: false, method: "post" },
  { route: '/api/expenses/categories/:id', handler: _lazy_3PC27x, lazy: true, middleware: false, method: "patch" },
  { route: '/api/expenses/dashboard', handler: _lazy_cuxzlO, lazy: true, middleware: false, method: "get" },
  { route: '/api/expenses', handler: _lazy_FuDrDl, lazy: true, middleware: false, method: "get" },
  { route: '/api/expenses', handler: _lazy_Gzym2k, lazy: true, middleware: false, method: "post" },
  { route: '/api/expenses/petty-cash-accounts', handler: _lazy_tHfQqu, lazy: true, middleware: false, method: "get" },
  { route: '/api/expenses/subcategories', handler: _lazy_JRrgtA, lazy: true, middleware: false, method: "get" },
  { route: '/api/expenses/subcategories/:id', handler: _lazy_OtJXSW, lazy: true, middleware: false, method: "patch" },
  { route: '/api/fleet/dashboard', handler: _lazy_oSoXIO, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/drivers', handler: _lazy_Bph_Qo, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/drivers', handler: _lazy_yPsolk, lazy: true, middleware: false, method: "post" },
  { route: '/api/fleet/drivers/:id', handler: _lazy_mKO7nQ, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/drivers/:id', handler: _lazy_plUvEw, lazy: true, middleware: false, method: "put" },
  { route: '/api/fleet/drivers/:id/documents', handler: _lazy_bP0ilq, lazy: true, middleware: false, method: "post" },
  { route: '/api/fleet/drivers/documents/:id', handler: _lazy_XXx0Jp, lazy: true, middleware: false, method: "delete" },
  { route: '/api/fleet/fuel', handler: _lazy_J5iT3J, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/fuel', handler: _lazy_Ebdy_x, lazy: true, middleware: false, method: "post" },
  { route: '/api/fleet/fuel/efficiency', handler: _lazy_TBBlEG, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/items', handler: _lazy_wlDQX7, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/items', handler: _lazy_YttKhn, lazy: true, middleware: false, method: "post" },
  { route: '/api/fleet/maintenance', handler: _lazy_gXifV8, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/maintenance', handler: _lazy_7ivhMK, lazy: true, middleware: false, method: "post" },
  { route: '/api/fleet/maintenance/:id', handler: _lazy__881ZA, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/maintenance/:id', handler: _lazy_LyN7yF, lazy: true, middleware: false, method: "patch" },
  { route: '/api/fleet/maintenance/rules', handler: _lazy_6qBXBI, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/maintenance/rules', handler: _lazy_J4Ot1P, lazy: true, middleware: false, method: "post" },
  { route: '/api/fleet/maintenance/rules/:id', handler: _lazy_TVUyLw, lazy: true, middleware: false, method: "delete" },
  { route: '/api/fleet/maintenance/rules/:id', handler: _lazy_1BX6vH, lazy: true, middleware: false, method: "put" },
  { route: '/api/fleet/purchases', handler: _lazy_h3Mhn3, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/purchases', handler: _lazy_TZdcP2, lazy: true, middleware: false, method: "post" },
  { route: '/api/fleet/purchases/:id', handler: _lazy_sME0Ys, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/purchases/:id', handler: _lazy_eyz6Fc, lazy: true, middleware: false, method: "patch" },
  { route: '/api/fleet/rentals', handler: _lazy_ueOLqs, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/rentals', handler: _lazy_58xkUU, lazy: true, middleware: false, method: "post" },
  { route: '/api/fleet/rentals/:id', handler: _lazy_hDspcd, lazy: true, middleware: false, method: "patch" },
  { route: '/api/fleet/reports/drivers', handler: _lazy_cKC71f, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/reports/maintenance', handler: _lazy_bydq07, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/reports/pnl', handler: _lazy_XvvAUY, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/reports/trips', handler: _lazy_2c7ktW, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/reports/vehicles', handler: _lazy_Fsn8eL, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/trips', handler: _lazy_xzjRj6, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/trips', handler: _lazy_3WGNRS, lazy: true, middleware: false, method: "post" },
  { route: '/api/fleet/trips/:id', handler: _lazy_CAU7Xi, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/trips/:id', handler: _lazy_wkC66D, lazy: true, middleware: false, method: "patch" },
  { route: '/api/fleet/trips/consolidation-suggestions', handler: _lazy_iGrB7E, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/trips/consolidation-suggestions', handler: _lazy_8AeuBO, lazy: true, middleware: false, method: "post" },
  { route: '/api/fleet/vehicles', handler: _lazy_8JuoMC, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/vehicles', handler: _lazy_FNENkS, lazy: true, middleware: false, method: "post" },
  { route: '/api/fleet/vehicles/:id', handler: _lazy_ljfcAo, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/vehicles/:id', handler: _lazy_levgej, lazy: true, middleware: false, method: "put" },
  { route: '/api/fleet/vehicles/:id/documents', handler: _lazy_4HXHkt, lazy: true, middleware: false, method: "post" },
  { route: '/api/fleet/vehicles/documents/:id', handler: _lazy_ethFqZ, lazy: true, middleware: false, method: "delete" },
  { route: '/api/hr/advances', handler: _lazy_l733zI, lazy: true, middleware: false, method: "get" },
  { route: '/api/hr/advances', handler: _lazy_zApIRH, lazy: true, middleware: false, method: "post" },
  { route: '/api/hr/assets', handler: _lazy_sIn1tE, lazy: true, middleware: false, method: "get" },
  { route: '/api/hr/attendance', handler: _lazy_mCH4N5, lazy: true, middleware: false, method: "get" },
  { route: '/api/hr/attendance', handler: _lazy_iTiMC7, lazy: true, middleware: false, method: "post" },
  { route: '/api/hr/biometric/face-list', handler: _lazy_7gRFiK, lazy: true, middleware: false, method: "get" },
  { route: '/api/hr/biometric/face-list', handler: _lazy_SOWQZD, lazy: true, middleware: false, method: "post" },
  { route: '/api/hr/biometric', handler: _lazy_aaPaTA, lazy: true, middleware: false, method: "get" },
  { route: '/api/hr/biometric', handler: _lazy_pK7VEu, lazy: true, middleware: false, method: "post" },
  { route: '/api/hr/bonuses', handler: _lazy_m_MgJF, lazy: true, middleware: false, method: "get" },
  { route: '/api/hr/bonuses', handler: _lazy_dOF7x1, lazy: true, middleware: false, method: "post" },
  { route: '/api/hr/dashboard', handler: _lazy_dsjObm, lazy: true, middleware: false, method: "get" },
  { route: '/api/hr/departments', handler: _lazy_c1ufjb, lazy: true, middleware: false, method: "get" },
  { route: '/api/hr/employees/:id', handler: _lazy_7PekTb, lazy: true, middleware: false, method: "get" },
  { route: '/api/hr/employees/:id.photo', handler: _lazy__GMXqy, lazy: true, middleware: false, method: "post" },
  { route: '/api/hr/employees/:id', handler: _lazy_QZ_iqR, lazy: true, middleware: false, method: "post" },
  { route: '/api/hr/employees/face', handler: _lazy_QoSIMe, lazy: true, middleware: false, method: "post" },
  { route: '/api/hr/employees', handler: _lazy_mtfcY8, lazy: true, middleware: false, method: "get" },
  { route: '/api/hr/employees', handler: _lazy_CuzurF, lazy: true, middleware: false, method: "post" },
  { route: '/api/hr/holidays', handler: _lazy_5Z96Rf, lazy: true, middleware: false, method: "get" },
  { route: '/api/hr/holidays', handler: _lazy_5IxlYV, lazy: true, middleware: false, method: "post" },
  { route: '/api/hr/leave-requests', handler: _lazy_5UOQ6t, lazy: true, middleware: false, method: "get" },
  { route: '/api/hr/leave-requests', handler: _lazy_eikuTZ, lazy: true, middleware: false, method: "post" },
  { route: '/api/hr/loans', handler: _lazy_Tmg1ta, lazy: true, middleware: false, method: "get" },
  { route: '/api/hr/loans', handler: _lazy_pSDyWZ, lazy: true, middleware: false, method: "post" },
  { route: '/api/hr/overtime', handler: _lazy_ZobcyD, lazy: true, middleware: false, method: "get" },
  { route: '/api/hr/overtime', handler: _lazy_PnhJ0Q, lazy: true, middleware: false, method: "post" },
  { route: '/api/hr/payroll', handler: _lazy_bNgzth, lazy: true, middleware: false, method: "get" },
  { route: '/api/hr/payroll', handler: _lazy_ySUTFm, lazy: true, middleware: false, method: "post" },
  { route: '/api/hr/positions', handler: _lazy_avjoBK, lazy: true, middleware: false, method: "get" },
  { route: '/api/hr/salary-structure', handler: _lazy_qmCh6F, lazy: true, middleware: false, method: "get" },
  { route: '/api/hr/salary-structure', handler: _lazy_Kf2iif, lazy: true, middleware: false, method: "post" },
  { route: '/api/hr/settings', handler: _lazy_9AgoAe, lazy: true, middleware: false, method: "get" },
  { route: '/api/hr/settings', handler: _lazy_aJ1Pge, lazy: true, middleware: false, method: "post" },
  { route: '/api/kiosk/clock-in', handler: _lazy_k5tC05, lazy: true, middleware: false, method: "post" },
  { route: '/api/kiosk/descriptors', handler: _lazy_ipWS24, lazy: true, middleware: false, method: "get" },
  { route: '/api/kiosk/verify', handler: _lazy_8pSKPR, lazy: true, middleware: false, method: "post" },
  { route: '/api/loans/:id', handler: _lazy_gd0Pq0, lazy: true, middleware: false, method: "delete" },
  { route: '/api/loans/:id', handler: _lazy_3N8wl1, lazy: true, middleware: false, method: "get" },
  { route: '/api/loans/:id/repay', handler: _lazy_X8ySwk, lazy: true, middleware: false, method: "post" },
  { route: '/api/loans', handler: _lazy_T0uIMv, lazy: true, middleware: false, method: "get" },
  { route: '/api/loans', handler: _lazy_1EYzEe, lazy: true, middleware: false, method: "post" },
  { route: '/api/loans/repayments/:repayId', handler: _lazy_N_hHil, lazy: true, middleware: false, method: "delete" },
  { route: '/api/logistics/drivers', handler: _lazy_CUc_PM, lazy: true, middleware: false, method: "get" },
  { route: '/api/logistics/drivers', handler: _lazy_gEUxdl, lazy: true, middleware: false, method: "post" },
  { route: '/api/logistics/fuel', handler: _lazy_ySxInH, lazy: true, middleware: false, method: "get" },
  { route: '/api/logistics/fuel', handler: _lazy_7HHLMN, lazy: true, middleware: false, method: "post" },
  { route: '/api/logistics/maintenance', handler: _lazy_ghEv3P, lazy: true, middleware: false, method: "get" },
  { route: '/api/logistics/maintenance', handler: _lazy_22UPbM, lazy: true, middleware: false, method: "post" },
  { route: '/api/logistics/trips', handler: _lazy_9Jnfq6, lazy: true, middleware: false, method: "get" },
  { route: '/api/logistics/trips', handler: _lazy_8zjJkl, lazy: true, middleware: false, method: "post" },
  { route: '/api/logistics/vehicles', handler: _lazy_dNHqs_, lazy: true, middleware: false, method: "get" },
  { route: '/api/logistics/vehicles', handler: _lazy_fPOVnG, lazy: true, middleware: false, method: "post" },
  { route: '/api/lookup/bank-accounts', handler: _lazy_rKdm4U, lazy: true, middleware: false, method: "get" },
  { route: '/api/lookup/cash-accounts', handler: _lazy_APl9jt, lazy: true, middleware: false, method: "get" },
  { route: '/api/lookup/employees', handler: _lazy_xt91AG, lazy: true, middleware: false, method: "get" },
  { route: '/api/me/permissions', handler: _lazy_WaLK9a, lazy: true, middleware: false, method: "get" },
  { route: '/api/notifications', handler: _lazy_DpGmoG, lazy: true, middleware: false, method: "get" },
  { route: '/api/pos/:id', handler: _lazy_CiTMtj, lazy: true, middleware: false, method: "delete" },
  { route: '/api/pos/:id', handler: _lazy_ooGvD3, lazy: true, middleware: false, method: "get" },
  { route: '/api/pos/:id', handler: _lazy_qqz1V4, lazy: true, middleware: false, method: "patch" },
  { route: '/api/pos/complete', handler: _lazy_Rwl8kv, lazy: true, middleware: false, method: "post" },
  { route: '/api/pos/customers/:id/collect-payment', handler: _lazy_Cg74fS, lazy: true, middleware: false, method: "post" },
  { route: '/api/pos/customers/:id/ledger', handler: _lazy_8EbA6Q, lazy: true, middleware: false, method: "get" },
  { route: '/api/pos/dashboard', handler: _lazy_g3D5Bk, lazy: true, middleware: false, method: "get" },
  { route: '/api/pos/eod', handler: _lazy_GSo0zy, lazy: true, middleware: false, method: "get" },
  { route: '/api/pos/eod', handler: _lazy_dANiIy, lazy: true, middleware: false, method: "post" },
  { route: '/api/pos/eod/:id/deposit', handler: _lazy_YmW4sN, lazy: true, middleware: false, method: "post" },
  { route: '/api/pos/exit/:order', handler: _lazy_HDuRCI, lazy: true, middleware: false, method: "get" },
  { route: '/api/pos/exit/:order/clear', handler: _lazy_BN4nwN, lazy: true, middleware: false, method: "post" },
  { route: '/api/pos/exit/:order/request-approval', handler: _lazy_9X7VtK, lazy: true, middleware: false, method: "post" },
  { route: '/api/pos/pending-approvals', handler: _lazy_ZE10Bh, lazy: true, middleware: false, method: "get" },
  { route: '/api/pos/pending-approvals/:id/approve', handler: _lazy_p_TLnR, lazy: true, middleware: false, method: "post" },
  { route: '/api/pos/pending-approvals/:id/reject', handler: _lazy_SFMWQ6, lazy: true, middleware: false, method: "post" },
  { route: '/api/pos/products', handler: _lazy_YpL4yo, lazy: true, middleware: false, method: "get" },
  { route: '/api/pos/reports', handler: _lazy_JlBecE, lazy: true, middleware: false, method: "get" },
  { route: '/api/pos/today', handler: _lazy_7bQa3c, lazy: true, middleware: false, method: "get" },
  { route: '/api/positions', handler: _lazy_rDop2C, lazy: true, middleware: false, method: "get" },
  { route: '/api/production/:id', handler: _lazy_CLSS3I, lazy: true, middleware: false, method: "get" },
  { route: '/api/production/:id', handler: _lazy_HbRtg5, lazy: true, middleware: false, method: "patch" },
  { route: '/api/production', handler: _lazy_uT3Lwk, lazy: true, middleware: false, method: "get" },
  { route: '/api/production', handler: _lazy_wgonVG, lazy: true, middleware: false, method: "post" },
  { route: '/api/products/base', handler: _lazy_PwfPQl, lazy: true, middleware: false, method: "get" },
  { route: '/api/products/base', handler: _lazy_R7MZ_o, lazy: true, middleware: false, method: "post" },
  { route: '/api/products/base/:id', handler: _lazy_EpSqex, lazy: true, middleware: false, method: "delete" },
  { route: '/api/products/base/:id', handler: _lazy_OZfFz9, lazy: true, middleware: false, method: "put" },
  { route: '/api/products/export/csv', handler: _lazy_GdMRnx, lazy: true, middleware: false, method: "get" },
  { route: '/api/products/hub', handler: _lazy_GylLlX, lazy: true, middleware: false, method: "get" },
  { route: '/api/products', handler: _lazy_BdPSvU, lazy: true, middleware: false, method: "get" },
  { route: '/api/products/inventory', handler: _lazy_LQ4TSs, lazy: true, middleware: false, method: "get" },
  { route: '/api/products/pricing-engine', handler: _lazy_mj7ixg, lazy: true, middleware: false, method: "get" },
  { route: '/api/products/pricing-engine', handler: _lazy_SkoWMh, lazy: true, middleware: false, method: "post" },
  { route: '/api/products/pricing', handler: _lazy_zWgEtt, lazy: true, middleware: false, method: "get" },
  { route: '/api/products/pricing', handler: _lazy_c9PSQj, lazy: true, middleware: false, method: "post" },
  { route: '/api/products/pricing/:variantId', handler: _lazy_fHkQdK, lazy: true, middleware: false, method: "get" },
  { route: '/api/products/pricing/:variantId', handler: _lazy_gSY6Na, lazy: true, middleware: false, method: "post" },
  { route: '/api/products/pricing/:variantId/archive', handler: _lazy_TPpNRb, lazy: true, middleware: false, method: "post" },
  { route: '/api/products/pricing/history', handler: _lazy_djh_hZ, lazy: true, middleware: false, method: "get" },
  { route: '/api/products/stock-adjustments', handler: _lazy_aaxzcu, lazy: true, middleware: false, method: "get" },
  { route: '/api/products/stock-adjustments', handler: _lazy_cDNVVD, lazy: true, middleware: false, method: "post" },
  { route: '/api/products/stock-adjustments/:id/status', handler: _lazy_NYhwt7, lazy: true, middleware: false, method: "patch" },
  { route: '/api/products/variants', handler: _lazy_G0tQfk, lazy: true, middleware: false, method: "get" },
  { route: '/api/products/variants', handler: _lazy__y6aic, lazy: true, middleware: false, method: "post" },
  { route: '/api/products/variants/:id', handler: _lazy_f1cA_w, lazy: true, middleware: false, method: "delete" },
  { route: '/api/products/variants/:id', handler: _lazy_gUamsE, lazy: true, middleware: false, method: "put" },
  { route: '/api/purchase/adjustments', handler: _lazy_m3ESkD, lazy: true, middleware: false, method: "get" },
  { route: '/api/purchase/adjustments', handler: _lazy_9nMIYc, lazy: true, middleware: false, method: "post" },
  { route: '/api/purchase/adjustments/:id', handler: _lazy_Qo4Zhw, lazy: true, middleware: false, method: "get" },
  { route: '/api/purchase/adjustments/:id', handler: _lazy_eW4_gj, lazy: true, middleware: false, method: "patch" },
  { route: '/api/purchase/commodities', handler: _lazy_OLaTER, lazy: true, middleware: false, method: "get" },
  { route: '/api/purchase/commodities', handler: _lazy_vRClym, lazy: true, middleware: false, method: "post" },
  { route: '/api/purchase/commodities/:id', handler: _lazy_dKHTF6, lazy: true, middleware: false, method: "patch" },
  { route: '/api/purchase/dashboard', handler: _lazy_YwUCMt, lazy: true, middleware: false, method: "get" },
  { route: '/api/purchase/grn', handler: _lazy_xwtloa, lazy: true, middleware: false, method: "get" },
  { route: '/api/purchase/grn/:id', handler: _lazy_Rgmv6O, lazy: true, middleware: false, method: "delete" },
  { route: '/api/purchase/grn/:id', handler: _lazy_HkdotF, lazy: true, middleware: false, method: "get" },
  { route: '/api/purchase/grn/:id', handler: _lazy_RxDl7k, lazy: true, middleware: false, method: "patch" },
  { route: '/api/purchase/grn', handler: _lazy_X7Jnzf, lazy: true, middleware: false, method: "post" },
  { route: '/api/purchase/grn/variance', handler: _lazy_4eqwcj, lazy: true, middleware: false, method: "get" },
  { route: '/api/purchase/orders', handler: _lazy_b9L9QL, lazy: true, middleware: false, method: "get" },
  { route: '/api/purchase/orders/:id', handler: _lazy_YGd6kQ, lazy: true, middleware: false, method: "delete" },
  { route: '/api/purchase/orders/:id', handler: _lazy_3lZU04, lazy: true, middleware: false, method: "get" },
  { route: '/api/purchase/orders/:id', handler: _lazy_feXeRp, lazy: true, middleware: false, method: "patch" },
  { route: '/api/purchase/orders/:id/close', handler: _lazy_JXXOKp, lazy: true, middleware: false, method: "post" },
  { route: '/api/purchase/orders', handler: _lazy_Bt_S9e, lazy: true, middleware: false, method: "post" },
  { route: '/api/purchase/orders/open', handler: _lazy_BI90v7, lazy: true, middleware: false, method: "get" },
  { route: '/api/purchase/payments', handler: _lazy_2H6pqg, lazy: true, middleware: false, method: "get" },
  { route: '/api/purchase/payments', handler: _lazy_kOCFOS, lazy: true, middleware: false, method: "post" },
  { route: '/api/purchase/payments/:id', handler: _lazy_KRcZDa, lazy: true, middleware: false, method: "delete" },
  { route: '/api/purchase/payments/:id', handler: _lazy_EUjPVH, lazy: true, middleware: false, method: "get" },
  { route: '/api/purchase/payments/:id', handler: _lazy_Bvn8dn, lazy: true, middleware: false, method: "patch" },
  { route: '/api/purchase/reconcile', handler: _lazy_nkJFai, lazy: true, middleware: false, method: "get" },
  { route: '/api/purchase/suppliers/:id', handler: _lazy_DjRgUK, lazy: true, middleware: false, method: "patch" },
  { route: '/api/purchase/suppliers/:id/credit', handler: _lazy_oTpcGN, lazy: true, middleware: false, method: "get" },
  { route: '/api/purchase/suppliers/:id/ledger', handler: _lazy_sbqGBJ, lazy: true, middleware: false, method: "get" },
  { route: '/api/purchase/suppliers', handler: _lazy_tRjFEk, lazy: true, middleware: false, method: "post" },
  { route: '/api/purchase/suppliers/summary', handler: _lazy_HUjmpq, lazy: true, middleware: false, method: "get" },
  { route: '/api/sales/dashboard', handler: _lazy_qeOoL4, lazy: true, middleware: false, method: "get" },
  { route: '/api/search', handler: _lazy_N8vI0d, lazy: true, middleware: false, method: "get" },
  { route: '/api/settings/credit-workflow', handler: _lazy_RS4crC, lazy: true, middleware: false, method: "get" },
  { route: '/api/settings/credit-workflow', handler: _lazy_Bkq2Ma, lazy: true, middleware: false, method: "put" },
  { route: '/api/settings/delivery', handler: _lazy_1MEvqN, lazy: true, middleware: false, method: "get" },
  { route: '/api/settings/delivery', handler: _lazy_tsHy0t, lazy: true, middleware: false, method: "put" },
  { route: '/api/settings/documents', handler: _lazy_7XsXm8, lazy: true, middleware: false, method: "get" },
  { route: '/api/settings/documents', handler: _lazy_wV9pXF, lazy: true, middleware: false, method: "put" },
  { route: '/api/settings/tax', handler: _lazy_JhLVQi, lazy: true, middleware: false, method: "get" },
  { route: '/api/settings/tax', handler: _lazy_0_39sz, lazy: true, middleware: false, method: "put" },
  { route: '/api/settings/telegram', handler: _lazy_4C95d3, lazy: true, middleware: false, method: "get" },
  { route: '/api/settings/telegram', handler: _lazy_QnYBO4, lazy: true, middleware: false, method: "put" },
  { route: '/api/suppliers', handler: _lazy_hMP8PQ, lazy: true, middleware: false, method: "get" },
  { route: '/api/trading/commodities', handler: _lazy_ln_1ov, lazy: true, middleware: false, method: "get" },
  { route: '/api/trading/dashboard', handler: _lazy_ZqgKAw, lazy: true, middleware: false, method: "get" },
  { route: '/api/trading/margin-report', handler: _lazy_EJJMzd, lazy: true, middleware: false, method: "get" },
  { route: '/api/trading/partners', handler: _lazy_g57txI, lazy: true, middleware: false, method: "get" },
  { route: '/api/trading/partners', handler: _lazy_j4KOKQ, lazy: true, middleware: false, method: "post" },
  { route: '/api/trading/payments/:paymentId', handler: _lazy_TygH4x, lazy: true, middleware: false, method: "delete" },
  { route: '/api/trading/sales', handler: _lazy_5nZFTe, lazy: true, middleware: false, method: "get" },
  { route: '/api/trading/sales', handler: _lazy_5YqTRv, lazy: true, middleware: false, method: "post" },
  { route: '/api/trading/sales/:id', handler: _lazy_uBD1Q1, lazy: true, middleware: false, method: "delete" },
  { route: '/api/trading/sales/:id', handler: _lazy_tM2dba, lazy: true, middleware: false, method: "get" },
  { route: '/api/trading/sales/:id/dispatch', handler: _lazy_WYX9Ys, lazy: true, middleware: false, method: "post" },
  { route: '/api/trading/sales/:id/edit', handler: _lazy_UIBooL, lazy: true, middleware: false, method: "post" },
  { route: '/api/trading/sales/:id/gate-pass', handler: _lazy_ier8ms, lazy: true, middleware: false, method: "get" },
  { route: '/api/trading/sales/:id/invoice', handler: _lazy_fF5Alv, lazy: true, middleware: false, method: "get" },
  { route: '/api/trading/sales/:id/payment', handler: _lazy_oSi4jE, lazy: true, middleware: false, method: "post" },
  { route: '/api/trading/settlement', handler: _lazy_QJZkts, lazy: true, middleware: false, method: "post" },
  { route: '/api/verify/:order', handler: _lazy_9fNxjI, lazy: true, middleware: false, method: "get" },
  { route: '/api/verify/:order/deliver', handler: _lazy_RPvyEn, lazy: true, middleware: false, method: "post" },
  { route: '/api/verify/:order/gate', handler: _lazy_4XJCMP, lazy: true, middleware: false, method: "post" },
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

export { $fetch$1 as $, ACCOUNTS_ROLES as A, getDeliveryQrSecret as B, getExceptionRadar as C, DISPATCH_ROLES as D, getGLAccountId as E, getLoansReceivableAccountId as F, getMethod as G, getOrderGateState as H, getPosCustomerOutstanding as I, getQuery as J, getRequestHeader as K, getRequestIP as L, getRequestURL as M, getResponseStatus as N, getResponseStatusText as O, POS_VALID_METHODS as P, getRouteRules as Q, getRouterParam as R, SALES_ROLES as S, TELEGRAM_CATEGORIES as T, getUserActionLimit as U, getUserApprovalLimit as V, getUserBranchScope as W, getUserSession as X, hasProtocol as Y, hash$1 as Z, invalidatePermCache as _, ACTION_LIMIT_KEYS as a, isAccountsRole as a0, isAdminRole as a1, isScriptProtocol as a2, joinURL as a3, maybeTriggerOwnerDigest as a4, nextDocNumber as a5, nodeServer as a6, notify as a7, notifyAdmins as a8, paginate as a9, recyclePurge as aA, recycleRestore as aB, recycleSnapshotBefore as aC, resetTelegramCache as aD, restoreCommodityStock as aE, reverseBankTransactionJE as aF, sanitizeStatusCode as aG, sendOwnerDigestNow as aH, sendTelegram as aI, serializeRow as aJ, setHeader as aK, setResponseHeader as aL, setUserSession as aM, useNitroApp as aN, useRuntimeConfig as aO, userCanAction as aP, verifyDeliveryQrSignature as aQ, voidBridgedTransaction as aR, withQuery as aS, withTrailingSlash as aT, withoutTrailingSlash as aU, parseQuery as aa, parseURL as ab, posExitQrSignature as ac, postBankTransactionJE as ad, postBankTransferJE as ae, postCommodityGRNCost as af, postCommoditySale as ag, postCustomerLedger as ah, postFleetExpenseGl as ai, postGoodsOnBoardInvoice as aj, postJournalEntry as ak, postOtherSalesCOGS as al, postPosSale as am, publicAssetsURL as an, query as ao, queryOne as ap, queuePendingRequest as aq, readBody as ar, readMultipartFormData as as, readRawBody as at, recalcPO as au, recordPosExitScan as av, recordQrScan as aw, recycleArchiveDelete as ax, recycleBegin as ay, recycleFinalize as az, ADMIN_ROLES as b, AMD_POST_STATUSES as c, AMD_PRE_STATUSES as d, PRODUCTION_ROLES as e, applyAmendment as f, auditLog as g, baseURL as h, bridgeCustomerPayment as i, buildAssetsURL as j, checkTransactionLimit as k, clearUserSession as l, createError$1 as m, createHooks as n, creditUsagePct as o, decodePath as p, defineEventHandler as q, defineRenderHandler as r, defu as s, deliveryQrSignature as t, encodePath as u, executeAsync as v, getContext as w, getCreditWorkflowSettings as x, getCustomerOutstanding as y, getDb as z };
//# sourceMappingURL=nitro.mjs.map
