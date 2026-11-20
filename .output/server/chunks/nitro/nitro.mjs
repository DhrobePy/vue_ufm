import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import { spawn } from 'node:child_process';
import { createGzip } from 'node:zlib';
import { PassThrough, Readable } from 'node:stream';
import crypto, { createHash } from 'node:crypto';
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
const fetch$1 = globalThis.fetch ? (...args) => globalThis.fetch(...args) : createNodeFetch();
const Headers$1 = globalThis.Headers || s$1;
const AbortController = globalThis.AbortController || i;
const ofetch = createFetch({ fetch: fetch$1, Headers: Headers$1, AbortController });
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
    "buildId": "ccb958fb-2ab0-4a85-af8c-4380dbb7ceee",
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
  "googleOauthClientId": "",
  "googleOauthClientSecret": "",
  "googleOauthRefreshToken": "",
  "googleDriveBackupFolderId": "",
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
const _87WoZIZQivakNKczWODrKTUCsM9p4H9wZ2LxqmDpdjo = defineNitroPlugin(async () => {
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
  await addCol(db, "goods_received_adnan", "value_basis", "VARCHAR(10) NULL DEFAULT NULL");
  await addCol(db, "purchase_payments_adnan", "cash_account_id", "INT UNSIGNED NULL DEFAULT NULL");
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
      UPDATE chart_of_accounts SET account_type_group = CASE
        WHEN account_type IN ('Revenue','Other Income') THEN 'Revenue'
        WHEN account_type IN ('Cost of Goods Sold','Expense','Operating Expense','Other Expense') THEN 'Expense'
        WHEN account_type IN ('Bank','Cash','Petty Cash','Accounts Receivable','Other Current Asset','Fixed Asset','Inventory','Other Asset') THEN 'Asset'
        WHEN account_type IN ('Accounts Payable','Other Current Liability','Long Term Liability','Credit Card') THEN 'Liability'
        WHEN account_type IN ('Equity','Retained Earnings') THEN 'Equity'
        ELSE account_type_group END
      WHERE account_type_group IS NULL OR account_type_group = ''
    `);
  } catch (e) {
    console.warn("[db-migrate] account_type_group backfill failed:", e);
  }
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS customer_balance_reconciliations (
        id                    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        customer_id           BIGINT UNSIGNED NOT NULL,
        old_balance           DECIMAL(15,2) NOT NULL,
        new_balance           DECIMAL(15,2) NOT NULL,
        status                ENUM('active','reverted') NOT NULL DEFAULT 'active',
        reconciled_by_user_id BIGINT UNSIGNED NULL,
        reconciled_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        reverted_by_user_id   BIGINT UNSIGNED NULL,
        reverted_at           TIMESTAMP NULL,
        KEY idx_cbr_customer (customer_id),
        KEY idx_cbr_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  } catch (e) {
    console.warn("[db-migrate] customer_balance_reconciliations create failed:", e);
  }
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
  await addCol(db, "payment_allocations", "target", "VARCHAR(10) NOT NULL DEFAULT 'order' COMMENT 'order | opening'");
  await addCol(db, "payment_allocations", "released_at", "DATETIME NULL DEFAULT NULL");
  await addCol(db, "payment_allocations", "allocated_by_user_id", "INT UNSIGNED NULL DEFAULT NULL");
  await addCol(db, "order_amendments", "reverts_amendment_id", "INT UNSIGNED NULL DEFAULT NULL");
  await addCol(db, "credit_order_returns", "return_category", "VARCHAR(30) NULL COMMENT 'damaged | quality | wrong_product | excess | other'");
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS customer_refunds (
        id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        refund_number    VARCHAR(30)  NOT NULL UNIQUE,
        customer_id      INT UNSIGNED NOT NULL,
        return_id        INT UNSIGNED NULL,
        order_id         INT UNSIGNED NULL,
        refund_date      DATE         NOT NULL,
        amount           DECIMAL(14,2) NOT NULL,
        payment_method   VARCHAR(30)  NOT NULL DEFAULT 'Cash',
        bank_account_id  INT UNSIGNED NULL,
        cash_account_id  INT UNSIGNED NULL,
        reference_number VARCHAR(100) NULL,
        notes            VARCHAR(500) NULL,
        journal_entry_id INT UNSIGNED NULL,
        created_by_user_id INT UNSIGNED NOT NULL,
        created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_refund_customer (customer_id),
        INDEX idx_refund_return (return_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (e) {
    console.warn("[db-migrate] customer_refunds failed:", e);
  }
  try {
    await db.query(`UPDATE credit_orders SET amount_paid = 0, balance_due = GREATEST(0, total_amount - advance_paid), updated_at = NOW()
      WHERE id >= 1000000 AND advance_paid > 0 AND ABS(amount_paid - advance_paid) < 0.005
        AND NOT EXISTS (SELECT 1 FROM customer_payments p WHERE p.order_id = credit_orders.id AND p.payment_type <> 'advance')
        AND NOT EXISTS (SELECT 1 FROM payment_allocations a WHERE a.order_id = credit_orders.id)`);
  } catch (e) {
    console.warn("[db-migrate] advance double-count fix failed:", e);
  }
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
  await addCol(db, "purchase_orders_adnan", "is_service_purchase", "TINYINT(1) NOT NULL DEFAULT 0");
  await addCol(db, "purchase_orders_adnan", "unit", "VARCHAR(20) NOT NULL DEFAULT 'KG'");
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
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS production_daily_stock (
        id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        production_date  DATE NOT NULL,
        branch_id        INT UNSIGNED NOT NULL,
        variant_id       BIGINT UNSIGNED NOT NULL,
        in_hand_qty      DECIMAL(10,2) NOT NULL DEFAULT 0,
        produced_qty     DECIMAL(10,2) NOT NULL DEFAULT 0,
        updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uniq_pds_slot (production_date, branch_id, variant_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (e) {
    console.warn("[db-migrate] production_daily_stock failed:", e);
  }
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS production_daily_log (
        id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        production_date  DATE NOT NULL,
        branch_id        INT UNSIGNED NOT NULL,
        variant_id       BIGINT UNSIGNED NOT NULL,
        event_type       ENUM('in_hand_set','produced_added') NOT NULL,
        qty              DECIMAL(10,2) NOT NULL,
        performed_by_user_id BIGINT UNSIGNED NULL,
        performed_by_name    VARCHAR(120) NULL,
        performed_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id), KEY idx_pdl_slot (production_date, branch_id, variant_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (e) {
    console.warn("[db-migrate] production_daily_log failed:", e);
  }
  try {
    await db.query(`
      ALTER TABLE purchase_payments_adnan
      MODIFY COLUMN payment_type
        ENUM('advance','regular','final','credit','against_delivery','contra')
        NULL DEFAULT 'regular'
    `);
  } catch (e) {
    console.warn("[db-migrate] purchase_payments_adnan.payment_type widen failed:", e);
  }
  await addCol(db, "cash_verification_log", "deposit_bank_account_id", "BIGINT UNSIGNED NULL DEFAULT NULL");
  await addCol(db, "cash_verification_log", "deposit_journal_entry_id", "BIGINT UNSIGNED NULL DEFAULT NULL");
  await addCol(db, "cr_delivery_confirmations", "delivery_id", "INT UNSIGNED NULL DEFAULT NULL");
  try {
    await db.query(`ALTER TABLE cr_delivery_confirmations DROP INDEX uk_dc_order`);
  } catch (e) {
    if ((e == null ? void 0 : e.errno) !== 1091) console.warn("[db-migrate] cr_delivery_confirmations DROP INDEX uk_dc_order failed:", e);
  }
  await addCol(db, "credit_order_shipping", "bags_boarded", "INT UNSIGNED NULL");
  await addCol(db, "credit_order_shipping", "bag_size_kg", "DECIMAL(8,2) NULL");
  await addCol(db, "credit_order_shipping", "delivery_slip_number", "VARCHAR(30) NULL");
  await addCol(db, "credit_order_shipping", "extra_discount_amount", "DECIMAL(12,2) NOT NULL DEFAULT 0.00");
  await addCol(db, "credit_order_shipping", "extra_discount_reason", "TEXT NULL");
  await addCol(db, "credit_order_shipping", "extra_discount_by_user_id", "BIGINT UNSIGNED NULL");
  await addCol(db, "credit_order_shipping", "extra_discount_at", "TIMESTAMP NULL");
  await addCol(db, "credit_order_deliveries", "bags_boarded", "INT UNSIGNED NULL");
  await addCol(db, "credit_order_deliveries", "bag_size_kg", "DECIMAL(8,2) NULL");
  await addCol(db, "credit_order_deliveries", "delivery_slip_number", "VARCHAR(30) NULL");
  await addCol(db, "credit_order_deliveries", "extra_discount_amount", "DECIMAL(12,2) NOT NULL DEFAULT 0.00");
  await addCol(db, "credit_order_deliveries", "extra_discount_reason", "TEXT NULL");
  await addCol(db, "credit_order_deliveries", "extra_discount_by_user_id", "BIGINT UNSIGNED NULL");
  await addCol(db, "credit_order_deliveries", "extra_discount_at", "TIMESTAMP NULL");
  await addCol(db, "branches", "delivery_slip_prefix", "VARCHAR(3) NULL");
  for (const [name, code] of [["Sirajgonj", "SRG"], ["Demra", "DEM"], ["Rampura", "RAM"], ["Head Office", "HOF"], ["Coxsbazar Branch", "COX"]]) {
    try {
      await db.query(`UPDATE branches SET delivery_slip_prefix = ? WHERE name = ? AND (delivery_slip_prefix IS NULL OR delivery_slip_prefix = '')`, [code, name]);
    } catch {
    }
  }
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS credit_order_collection_hides (
        id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        order_id          BIGINT UNSIGNED NOT NULL,
        customer_id       BIGINT UNSIGNED NOT NULL,
        hidden_by_user_id BIGINT UNSIGNED NULL,
        hidden_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        reason            VARCHAR(255) NULL,
        PRIMARY KEY (id), UNIQUE KEY uk_cochide_order (order_id), KEY idx_cochide_customer (customer_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (e) {
    console.warn("[db-migrate] credit_order_collection_hides failed:", e);
  }
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS credit_order_price_revisions (
        id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        order_id           BIGINT UNSIGNED NOT NULL,
        order_item_id      BIGINT UNSIGNED NULL,
        product_id         BIGINT UNSIGNED NOT NULL,
        variant_id         BIGINT UNSIGNED NULL,
        quantity           DECIMAL(10,2) NOT NULL,
        old_unit_price     DECIMAL(12,2) NOT NULL,
        new_unit_price     DECIMAL(12,2) NOT NULL,
        reason             TEXT NOT NULL,
        changed_by_user_id BIGINT UNSIGNED NOT NULL,
        created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id), KEY idx_copr_order (order_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (e) {
    console.warn("[db-migrate] credit_order_price_revisions failed:", e);
  }
  await addCol(db, "order_amendments", "customer_consent_note", "VARCHAR(255) NULL");
  await addCol(db, "credit_orders", "delivery_priority", "INT NOT NULL DEFAULT 0");
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS customer_notes (
        id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        customer_id        BIGINT UNSIGNED NOT NULL,
        note               TEXT NOT NULL,
        kind               VARCHAR(20) NOT NULL DEFAULT 'note' COMMENT 'note | status',
        created_by_user_id BIGINT UNSIGNED NULL,
        created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id), KEY idx_cnotes_customer (customer_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (e) {
    console.warn("[db-migrate] customer_notes failed:", e);
  }
  await addCol(db, "customer_ledger", "review_status", "VARCHAR(10) NOT NULL DEFAULT 'ok' COMMENT 'ok | review | kept'");
  await addCol(db, "customer_ledger", "review_reason", "VARCHAR(40) NULL");
  await addCol(db, "customer_ledger", "reviewed_by_user_id", "BIGINT UNSIGNED NULL");
  await addCol(db, "customer_ledger", "reviewed_at", "DATETIME NULL");
  await addCol(db, "customer_ledger", "review_note", "VARCHAR(255) NULL");
  try {
    await db.query("CREATE INDEX idx_cl_review ON customer_ledger (review_status)");
  } catch (e) {
    if ((e == null ? void 0 : e.errno) !== 1061) console.warn("[db-migrate] idx_cl_review failed:", e);
  }
  for (const t of [
    "customer_ledger",
    "customer_payments",
    "payment_allocations",
    "credit_orders",
    "credit_order_items",
    "credit_order_workflow",
    "journal_entries",
    "transaction_lines",
    "credit_order_deliveries",
    "credit_order_delivery_items",
    "credit_order_returns",
    "credit_order_return_items",
    "order_amendments",
    "credit_order_shipping"
  ]) {
    try {
      const [[r]] = await db.query(`SELECT AUTO_INCREMENT a FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`, [t]);
      if (r && Number(r.a) < 1e6) await db.query(`ALTER TABLE \`${t}\` AUTO_INCREMENT = 1000000`);
    } catch (e) {
      console.warn(`[db-migrate] AUTO_INCREMENT bump on ${t} failed:`, e);
    }
  }
  console.log("[db-migrate] startup migrations complete");
});

const plugins = [
  _A0rTAkqQKHycO7CrrtLZ2oMw5IS2SKVeyO4RUEyJ3Q,
_87WoZIZQivakNKczWODrKTUCsM9p4H9wZ2LxqmDpdjo
];

const assets = {
  "/models/tiny_face_detector_model-weights_manifest.json": {
    "type": "application/json",
    "etag": "\"c93-1fFvS33OBi7EWgUx6fZDwoVVPCI\"",
    "mtime": "2026-11-20T09:40:30.742Z",
    "size": 3219,
    "path": "../public/models/tiny_face_detector_model-weights_manifest.json"
  },
  "/models/face_landmark_68_tiny_model-weights_manifest.json": {
    "type": "application/json",
    "etag": "\"12c6-uiOOLccQ5M4dIu4xjnt8MXzWjrI\"",
    "mtime": "2026-11-20T09:40:30.740Z",
    "size": 4806,
    "path": "../public/models/face_landmark_68_tiny_model-weights_manifest.json"
  },
  "/models/face_landmark_68_tiny_model.bin": {
    "type": "application/octet-stream",
    "etag": "\"12da8-O/wXA0Tpx1GiFR3yFaK0/8/W7nU\"",
    "mtime": "2026-11-20T09:40:30.745Z",
    "size": 77224,
    "path": "../public/models/face_landmark_68_tiny_model.bin"
  },
  "/models/face_recognition_model-weights_manifest.json": {
    "type": "application/json",
    "etag": "\"4c9f-jYqLwDX2HEyGhjqRlNGh1rJ0FQY\"",
    "mtime": "2026-11-20T09:40:30.740Z",
    "size": 19615,
    "path": "../public/models/face_recognition_model-weights_manifest.json"
  },
  "/_nuxt/1N0C3e_A.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2035-RR9CX3p4QdZ8nG1icTek+0EvLLg\"",
    "mtime": "2026-11-20T09:40:30.516Z",
    "size": 8245,
    "path": "../public/_nuxt/1N0C3e_A.js"
  },
  "/_nuxt/-VLc3lCq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3c4a-UBrR6heYN7Tym4FnhvyxdPqRiR4\"",
    "mtime": "2026-11-20T09:40:30.715Z",
    "size": 15434,
    "path": "../public/_nuxt/-VLc3lCq.js"
  },
  "/_nuxt/-wgmyURm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2f08-15RXN54iM3MvmjG8R/mgW++Z5vM\"",
    "mtime": "2026-11-20T09:40:30.715Z",
    "size": 12040,
    "path": "../public/_nuxt/-wgmyURm.js"
  },
  "/_nuxt/21GGXwtV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"eed-gAFKRhziJoMWlcSrQq/+hlPrh7c\"",
    "mtime": "2026-11-20T09:40:30.519Z",
    "size": 3821,
    "path": "../public/_nuxt/21GGXwtV.js"
  },
  "/models/tiny_face_detector_model.bin": {
    "type": "application/octet-stream",
    "etag": "\"2f329-8wIN668Hg0e1yq/0v23OLzedILw\"",
    "mtime": "2026-11-20T09:40:30.743Z",
    "size": 193321,
    "path": "../public/models/tiny_face_detector_model.bin"
  },
  "/_nuxt/2zZ3ETw2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1e56-+gqjQ8d9lpnBqGOi0mWwxD6ndww\"",
    "mtime": "2026-11-20T09:40:30.516Z",
    "size": 7766,
    "path": "../public/_nuxt/2zZ3ETw2.js"
  },
  "/_nuxt/2EQbG1eR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d45-wF2R55qoKz5G5ki0jpcSF6lCKjM\"",
    "mtime": "2026-11-20T09:40:30.519Z",
    "size": 3397,
    "path": "../public/_nuxt/2EQbG1eR.js"
  },
  "/_nuxt/3Kgz2iAW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2000-wQUOGZStb6gD/UtHF96O1wew+BA\"",
    "mtime": "2026-11-20T09:40:30.516Z",
    "size": 8192,
    "path": "../public/_nuxt/3Kgz2iAW.js"
  },
  "/_nuxt/7bX6Q9ao.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"23b8-9/10AENu9Q7/iuCDBSG4f22OJOY\"",
    "mtime": "2026-11-20T09:40:30.521Z",
    "size": 9144,
    "path": "../public/_nuxt/7bX6Q9ao.js"
  },
  "/_nuxt/8Ofaf2n-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3632-QVBh+M1xjrcsoFHyFQVCtXIOvvk\"",
    "mtime": "2026-11-20T09:40:30.523Z",
    "size": 13874,
    "path": "../public/_nuxt/8Ofaf2n-.js"
  },
  "/_nuxt/4mIxq-a-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4662-YUsgw3jsdh70AosIYd/XYRDr+0c\"",
    "mtime": "2026-11-20T09:40:30.516Z",
    "size": 18018,
    "path": "../public/_nuxt/4mIxq-a-.js"
  },
  "/_nuxt/5V0TMHXq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"490-AuirCUkUy/8DHUzYScksX8+NPF8\"",
    "mtime": "2026-11-20T09:40:30.519Z",
    "size": 1168,
    "path": "../public/_nuxt/5V0TMHXq.js"
  },
  "/_nuxt/4y-ibQWs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1e9e-OfymCQlI2O9Y0pi1qb9CTH5KB1c\"",
    "mtime": "2026-11-20T09:40:30.519Z",
    "size": 7838,
    "path": "../public/_nuxt/4y-ibQWs.js"
  },
  "/_nuxt/8lUory_u.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"c7a-hVOcCMEieFfduvn0Hy3MzftfK+4\"",
    "mtime": "2026-11-20T09:40:30.523Z",
    "size": 3194,
    "path": "../public/_nuxt/8lUory_u.js"
  },
  "/_nuxt/A6dwXKzK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"18eb-81VFoMHod43vRU4VDaKmnAWXGHc\"",
    "mtime": "2026-11-20T09:40:30.526Z",
    "size": 6379,
    "path": "../public/_nuxt/A6dwXKzK.js"
  },
  "/_nuxt/AH0sBb4E.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1c4d-BVT6K9pZyNprbevMiORmRcbc53k\"",
    "mtime": "2026-11-20T09:40:30.523Z",
    "size": 7245,
    "path": "../public/_nuxt/AH0sBb4E.js"
  },
  "/_nuxt/Ags-yBt1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"40-w/z1i6rpqrMkeZnp5ohcqmix1BM\"",
    "mtime": "2026-11-20T09:40:30.524Z",
    "size": 64,
    "path": "../public/_nuxt/Ags-yBt1.js"
  },
  "/_nuxt/B0izvTzb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1b1e-t0TnR+iNz1skRKd3uvMtLx2f5/s\"",
    "mtime": "2026-11-20T09:40:30.526Z",
    "size": 6942,
    "path": "../public/_nuxt/B0izvTzb.js"
  },
  "/_nuxt/B-PM-C9P.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1866-L+jTm9EpaF2z9FIKBt8U2P6Hr6M\"",
    "mtime": "2026-11-20T09:40:30.527Z",
    "size": 6246,
    "path": "../public/_nuxt/B-PM-C9P.js"
  },
  "/_nuxt/B215pERd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2192-bgR1LDhRIxluQi6WvpvEWzIFxG8\"",
    "mtime": "2026-11-20T09:40:30.528Z",
    "size": 8594,
    "path": "../public/_nuxt/B215pERd.js"
  },
  "/_nuxt/B3uQmEbJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"13b0-KQdMmiXniry5p+sxCU3+8JhxkoI\"",
    "mtime": "2026-11-20T09:40:30.529Z",
    "size": 5040,
    "path": "../public/_nuxt/B3uQmEbJ.js"
  },
  "/_nuxt/B5OSXae4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1f52-4pMlM5MXXX0P2cpcevk+DKQR2E8\"",
    "mtime": "2026-11-20T09:40:30.531Z",
    "size": 8018,
    "path": "../public/_nuxt/B5OSXae4.js"
  },
  "/_nuxt/B4RGaztn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"12e1-fIYQR83BNSjTkZex1gGWKFj6wQ0\"",
    "mtime": "2026-11-20T09:40:30.530Z",
    "size": 4833,
    "path": "../public/_nuxt/B4RGaztn.js"
  },
  "/_nuxt/B7WkWb0e.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1b3b-Jl/6A7zrYcWH4336lhLYPtPSGHk\"",
    "mtime": "2026-11-20T09:40:30.533Z",
    "size": 6971,
    "path": "../public/_nuxt/B7WkWb0e.js"
  },
  "/_nuxt/B7ZbWB3a.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1548-8kQODv6hMF6M+xnSW7sf9XYdP/E\"",
    "mtime": "2026-11-20T09:40:30.532Z",
    "size": 5448,
    "path": "../public/_nuxt/B7ZbWB3a.js"
  },
  "/_nuxt/B647w6RV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2a2f-eDvaFKTWyvi3keTLe65EbWZlGes\"",
    "mtime": "2026-11-20T09:40:30.532Z",
    "size": 10799,
    "path": "../public/_nuxt/B647w6RV.js"
  },
  "/_nuxt/BGauR_Ku.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1d36-2e8QRWc4vdWJ7Rd1NQ6tq8mM+6E\"",
    "mtime": "2026-11-20T09:40:30.536Z",
    "size": 7478,
    "path": "../public/_nuxt/BGauR_Ku.js"
  },
  "/_nuxt/BEHIvdZ7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7c87-GE2jjgRkGcWU09wkoiTSLTFGAww\"",
    "mtime": "2026-11-20T09:40:30.531Z",
    "size": 31879,
    "path": "../public/_nuxt/BEHIvdZ7.js"
  },
  "/_nuxt/BFfIArdc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"75c-mfoxvEYYZjTkqGWwUPl2qDmbmBU\"",
    "mtime": "2026-11-20T09:40:30.533Z",
    "size": 1884,
    "path": "../public/_nuxt/BFfIArdc.js"
  },
  "/_nuxt/BG68dnfk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3390-MQaoaxdlmYRiEJ7+BFhRX5kr5ZM\"",
    "mtime": "2026-11-20T09:40:30.536Z",
    "size": 13200,
    "path": "../public/_nuxt/BG68dnfk.js"
  },
  "/_nuxt/BGbtjUGg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1a33-vmbj6jv47bFUP71t/mIozBZJNyg\"",
    "mtime": "2026-11-20T09:40:30.537Z",
    "size": 6707,
    "path": "../public/_nuxt/BGbtjUGg.js"
  },
  "/_nuxt/BGoVIYdw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"19a6-pClGyz9scTsW3ejt4OFxL96OF6w\"",
    "mtime": "2026-11-20T09:40:30.537Z",
    "size": 6566,
    "path": "../public/_nuxt/BGoVIYdw.js"
  },
  "/_nuxt/BKoFAbXx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"11e-uB4zji26cgviOW3n+b25xIwYb6A\"",
    "mtime": "2026-11-20T09:40:30.539Z",
    "size": 286,
    "path": "../public/_nuxt/BKoFAbXx.js"
  },
  "/_nuxt/BI-JNbhE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"6ddd-5zbGHVdQv/74rxUd8Mt+cVB5QYM\"",
    "mtime": "2026-11-20T09:40:30.539Z",
    "size": 28125,
    "path": "../public/_nuxt/BI-JNbhE.js"
  },
  "/_nuxt/BITwu1xV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1cdf-oiBj1gIgGW3lAe21dKJr/FNYlRg\"",
    "mtime": "2026-11-20T09:40:30.538Z",
    "size": 7391,
    "path": "../public/_nuxt/BITwu1xV.js"
  },
  "/_nuxt/BNM70BaW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1b15-MvRrxUcgrTKkO46xSGkVpl4EJ1w\"",
    "mtime": "2026-11-20T09:40:30.542Z",
    "size": 6933,
    "path": "../public/_nuxt/BNM70BaW.js"
  },
  "/_nuxt/BLhaBIxB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3556-/knKeBe/N8MT0LpKdZvwCfzvpVo\"",
    "mtime": "2026-11-20T09:40:30.543Z",
    "size": 13654,
    "path": "../public/_nuxt/BLhaBIxB.js"
  },
  "/_nuxt/BOsmtUGK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1bc2-AXFoFtxAeK4hSsgwAshKuElmxxA\"",
    "mtime": "2026-11-20T09:40:30.540Z",
    "size": 7106,
    "path": "../public/_nuxt/BOsmtUGK.js"
  },
  "/_nuxt/BQCyRO5e.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"eb9-WhaaIOGVhKl9yxR90n1zFcNDpDo\"",
    "mtime": "2026-11-20T09:40:30.542Z",
    "size": 3769,
    "path": "../public/_nuxt/BQCyRO5e.js"
  },
  "/_nuxt/BQE9x2lK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4226-TCXZETsCftnJEpzEkiL5BrvaiuA\"",
    "mtime": "2026-11-20T09:40:30.543Z",
    "size": 16934,
    "path": "../public/_nuxt/BQE9x2lK.js"
  },
  "/_nuxt/BQGb0GMO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"6f34-/Vjl18Jah/kdybW071LLQuF4eKU\"",
    "mtime": "2026-11-20T09:40:30.545Z",
    "size": 28468,
    "path": "../public/_nuxt/BQGb0GMO.js"
  },
  "/_nuxt/BRjNya28.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"12b-pBjAix9rP4hCvjsf2iYshFS1bHw\"",
    "mtime": "2026-11-20T09:40:30.545Z",
    "size": 299,
    "path": "../public/_nuxt/BRjNya28.js"
  },
  "/_nuxt/BTHLBs7q.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4d42-1RT3k9VJGo4fxLL8MEMLs6YMlcM\"",
    "mtime": "2026-11-20T09:40:30.546Z",
    "size": 19778,
    "path": "../public/_nuxt/BTHLBs7q.js"
  },
  "/_nuxt/BT1DCNWd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1cbc-udgkHWpel6Vs307rtTS2L2O7rCo\"",
    "mtime": "2026-11-20T09:40:30.545Z",
    "size": 7356,
    "path": "../public/_nuxt/BT1DCNWd.js"
  },
  "/_nuxt/BXdjuvzu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"10b0-6xLj3S5b4P7DpFwhuMWb485csQg\"",
    "mtime": "2026-11-20T09:40:30.547Z",
    "size": 4272,
    "path": "../public/_nuxt/BXdjuvzu.js"
  },
  "/_nuxt/BXfvdJM-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1a1f-EMNxCMcoyFV7zSKLUBlFV2ZnenY\"",
    "mtime": "2026-11-20T09:40:30.551Z",
    "size": 6687,
    "path": "../public/_nuxt/BXfvdJM-.js"
  },
  "/_nuxt/BXLxGDX9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27a3-STAlOceewHYtHzZYO2iiYSLrCco\"",
    "mtime": "2026-11-20T09:40:30.548Z",
    "size": 10147,
    "path": "../public/_nuxt/BXLxGDX9.js"
  },
  "/_nuxt/BZ97X9-x.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2d73-XvMw4gJYSnKj+1kBanaITlWDRVE\"",
    "mtime": "2026-11-20T09:40:30.548Z",
    "size": 11635,
    "path": "../public/_nuxt/BZ97X9-x.js"
  },
  "/_nuxt/B_PeMzXs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2259-fZTTnqbhmkmukdK3s/DneP348D8\"",
    "mtime": "2026-11-20T09:40:30.549Z",
    "size": 8793,
    "path": "../public/_nuxt/B_PeMzXs.js"
  },
  "/_nuxt/B__v_jOQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"25bc-Im+pJ+bh8T+1Au6cBFp/XwE+/Zw\"",
    "mtime": "2026-11-20T09:40:30.550Z",
    "size": 9660,
    "path": "../public/_nuxt/B__v_jOQ.js"
  },
  "/_nuxt/B_nUD7T1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"6a0-o4Js2OL4jF/EIGbJJvKIM31yQlM\"",
    "mtime": "2026-11-20T09:40:30.550Z",
    "size": 1696,
    "path": "../public/_nuxt/B_nUD7T1.js"
  },
  "/_nuxt/BdgPNplV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1de3-RbbGiDGl5tHJ+Akd2N33WvO8FVE\"",
    "mtime": "2026-11-20T09:40:30.552Z",
    "size": 7651,
    "path": "../public/_nuxt/BdgPNplV.js"
  },
  "/_nuxt/BaVG768l.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ddf-gO2aX84wVl+ngl+ux1oHgWHP9oU\"",
    "mtime": "2026-11-20T09:40:30.552Z",
    "size": 3551,
    "path": "../public/_nuxt/BaVG768l.js"
  },
  "/_nuxt/Be6U0iZo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1c11-hINcp5+57E9GObuLCQ2xCn/36ME\"",
    "mtime": "2026-11-20T09:40:30.553Z",
    "size": 7185,
    "path": "../public/_nuxt/Be6U0iZo.js"
  },
  "/_nuxt/BfQp2iWo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2834-+oZu/WyAnaczxNVR36uF2fmHv2c\"",
    "mtime": "2026-11-20T09:40:30.554Z",
    "size": 10292,
    "path": "../public/_nuxt/BfQp2iWo.js"
  },
  "/_nuxt/BfeXhTjb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2312-FBUAx17tXn3GJ9mmgQOwuvjIJyk\"",
    "mtime": "2026-11-20T09:40:30.554Z",
    "size": 8978,
    "path": "../public/_nuxt/BfeXhTjb.js"
  },
  "/_nuxt/Biy_g7U1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2ca4-UnOYnm2S+QIQ6B6Ssa2UqOOzYXo\"",
    "mtime": "2026-11-20T09:40:30.556Z",
    "size": 11428,
    "path": "../public/_nuxt/Biy_g7U1.js"
  },
  "/_nuxt/BiE_sxsy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3b80-EBSMDAKZALJYOQZlU6gI7ZH+ntk\"",
    "mtime": "2026-11-20T09:40:30.555Z",
    "size": 15232,
    "path": "../public/_nuxt/BiE_sxsy.js"
  },
  "/_nuxt/Bkj0RUbF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1f93-fhVOTF7y4KPORC6zFL8DIcu/2E0\"",
    "mtime": "2026-11-20T09:40:30.557Z",
    "size": 8083,
    "path": "../public/_nuxt/Bkj0RUbF.js"
  },
  "/_nuxt/Bkxlt0QA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"21e8-txcRRHHBJ6ezUh0oqw55PNYIjVM\"",
    "mtime": "2026-11-20T09:40:30.558Z",
    "size": 8680,
    "path": "../public/_nuxt/Bkxlt0QA.js"
  },
  "/_nuxt/Bl8VJMfJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1e2d-BjBT/QNasoL0mRjEayYtqr+Qk4w\"",
    "mtime": "2026-11-20T09:40:30.559Z",
    "size": 7725,
    "path": "../public/_nuxt/Bl8VJMfJ.js"
  },
  "/_nuxt/BmCBqdON.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1989-Pd3BFBQUjQU1POSJEw0zIhck/3M\"",
    "mtime": "2026-11-20T09:40:30.560Z",
    "size": 6537,
    "path": "../public/_nuxt/BmCBqdON.js"
  },
  "/_nuxt/Bmenw7v_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"18a2-xpcMdNYK6J4I6/Ale7Cv94Krfa4\"",
    "mtime": "2026-11-20T09:40:30.561Z",
    "size": 6306,
    "path": "../public/_nuxt/Bmenw7v_.js"
  },
  "/_nuxt/BlNodYCD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"24d7-ISqJeaVruxjNgXfU7iHAUAOexmI\"",
    "mtime": "2026-11-20T09:40:30.558Z",
    "size": 9431,
    "path": "../public/_nuxt/BlNodYCD.js"
  },
  "/_nuxt/Bn2EkrID.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1503-UP1NWw3sywqTH5HPv/zYRfwlaeE\"",
    "mtime": "2026-11-20T09:40:30.562Z",
    "size": 5379,
    "path": "../public/_nuxt/Bn2EkrID.js"
  },
  "/_nuxt/Bnwz8LJH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"163d-zQwbSKTv0dR0vw5Rp7T1R9NuZ1M\"",
    "mtime": "2026-11-20T09:40:30.563Z",
    "size": 5693,
    "path": "../public/_nuxt/Bnwz8LJH.js"
  },
  "/_nuxt/BpLXiHOG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"403f-zVRSBbcYfwbY3C2xKW18buPqCfM\"",
    "mtime": "2026-11-20T09:40:30.563Z",
    "size": 16447,
    "path": "../public/_nuxt/BpLXiHOG.js"
  },
  "/_nuxt/BpS8Z61Y.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4a0-0xTpRO4iTty0K5HARYH2swkccPI\"",
    "mtime": "2026-11-20T09:40:30.564Z",
    "size": 1184,
    "path": "../public/_nuxt/BpS8Z61Y.js"
  },
  "/_nuxt/BqxyAmys.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"13e8-wn2fHDtn8mzPi4pqXpS+WaHnqdk\"",
    "mtime": "2026-11-20T09:40:30.563Z",
    "size": 5096,
    "path": "../public/_nuxt/BqxyAmys.js"
  },
  "/_nuxt/Bs6lN5u7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1ca0-8TcgX+LyATflQzxVSRypZbCtfsY\"",
    "mtime": "2026-11-20T09:40:30.566Z",
    "size": 7328,
    "path": "../public/_nuxt/Bs6lN5u7.js"
  },
  "/_nuxt/Bs3_A5Aq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1d96-78gw7e+yaQI2JoLAnR2NW97BHMI\"",
    "mtime": "2026-11-20T09:40:30.567Z",
    "size": 7574,
    "path": "../public/_nuxt/Bs3_A5Aq.js"
  },
  "/_nuxt/BrxOq_Dq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1635-yBkjPayDvQRRf4mokHaVnGP0mSs\"",
    "mtime": "2026-11-20T09:40:30.566Z",
    "size": 5685,
    "path": "../public/_nuxt/BrxOq_Dq.js"
  },
  "/_nuxt/BsHf28P9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"12d2-UJNzUT/Lk3zesCySeDkmktCw3/Q\"",
    "mtime": "2026-11-20T09:40:30.567Z",
    "size": 4818,
    "path": "../public/_nuxt/BsHf28P9.js"
  },
  "/_nuxt/BsEGK3aL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1071-PecjOUmtMMoyZ8YN1dnaCeTp4D4\"",
    "mtime": "2026-11-20T09:40:30.569Z",
    "size": 4209,
    "path": "../public/_nuxt/BsEGK3aL.js"
  },
  "/_nuxt/BuamYyzy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"14f5-aR8dcqLbfz6mx2rIeRDP1vxPqYQ\"",
    "mtime": "2026-11-20T09:40:30.569Z",
    "size": 5365,
    "path": "../public/_nuxt/BuamYyzy.js"
  },
  "/_nuxt/BskC1VPV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3eb2-iYhnpT/EbNxTrb/G6/r9jYMFM4E\"",
    "mtime": "2026-11-20T09:40:30.569Z",
    "size": 16050,
    "path": "../public/_nuxt/BskC1VPV.js"
  },
  "/_nuxt/BvfRb-7d.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"22ff-4Bc9/B3i0Dfa1/xF8UzupvfPFmI\"",
    "mtime": "2026-11-20T09:40:30.570Z",
    "size": 8959,
    "path": "../public/_nuxt/BvfRb-7d.js"
  },
  "/_nuxt/BxQKT-6c.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2122-HmSZtwsORY+IUwLPZG61JU6Jric\"",
    "mtime": "2026-11-20T09:40:30.571Z",
    "size": 8482,
    "path": "../public/_nuxt/BxQKT-6c.js"
  },
  "/_nuxt/By4k_KJ9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2b57-gKK3N4KFiD9FZD9bd1sajyPnlO8\"",
    "mtime": "2026-11-20T09:40:30.573Z",
    "size": 11095,
    "path": "../public/_nuxt/By4k_KJ9.js"
  },
  "/_nuxt/C1Wm82ax.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"15e5-oexsAcU2lGV/OGp2RkI3KYdsJXQ\"",
    "mtime": "2026-11-20T09:40:30.573Z",
    "size": 5605,
    "path": "../public/_nuxt/C1Wm82ax.js"
  },
  "/_nuxt/BwCQAefe.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5a4e-esB/MjS8PYZPKS0dgvjynWJgayk\"",
    "mtime": "2026-11-20T09:40:30.573Z",
    "size": 23118,
    "path": "../public/_nuxt/BwCQAefe.js"
  },
  "/_nuxt/C2nhPVn6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7fd-0HOrdE0eonQv/b7RaFpGfDiViOs\"",
    "mtime": "2026-11-20T09:40:30.575Z",
    "size": 2045,
    "path": "../public/_nuxt/C2nhPVn6.js"
  },
  "/_nuxt/C2z4Z4Fs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"260-Y+e3cVV4ppXPvThZs3BU4+wrSfc\"",
    "mtime": "2026-11-20T09:40:30.574Z",
    "size": 608,
    "path": "../public/_nuxt/C2z4Z4Fs.js"
  },
  "/_nuxt/C5pURZFX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2d7d-3bJgBqd4SpOqDBKWb7TffFH3pV8\"",
    "mtime": "2026-11-20T09:40:30.576Z",
    "size": 11645,
    "path": "../public/_nuxt/C5pURZFX.js"
  },
  "/_nuxt/C4x198ix.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"399e-8urNlay3YNGcDKWJ0OTQrC5SPdU\"",
    "mtime": "2026-11-20T09:40:30.576Z",
    "size": 14750,
    "path": "../public/_nuxt/C4x198ix.js"
  },
  "/_nuxt/C62hIbig.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"362f-TYYgMc86gk0w4ySsrTVg2HZXDwQ\"",
    "mtime": "2026-11-20T09:40:30.576Z",
    "size": 13871,
    "path": "../public/_nuxt/C62hIbig.js"
  },
  "/_nuxt/C77Y3FPu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"26e5-Em/qctKg1leWxtY0bC8m4kcxC1E\"",
    "mtime": "2026-11-20T09:40:30.578Z",
    "size": 9957,
    "path": "../public/_nuxt/C77Y3FPu.js"
  },
  "/_nuxt/C73VWZy1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1ad0-78heVjNPCLYaPO9mo6zo255MyE4\"",
    "mtime": "2026-11-20T09:40:30.577Z",
    "size": 6864,
    "path": "../public/_nuxt/C73VWZy1.js"
  },
  "/_nuxt/C8SHTURA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"81d-zmrINqDKwNdVOaCFxzTNSlpE3nY\"",
    "mtime": "2026-11-20T09:40:30.579Z",
    "size": 2077,
    "path": "../public/_nuxt/C8SHTURA.js"
  },
  "/_nuxt/C8eNZRQW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"df1-HprvPqTTpoKCEooaIhG3OrpFNO4\"",
    "mtime": "2026-11-20T09:40:30.579Z",
    "size": 3569,
    "path": "../public/_nuxt/C8eNZRQW.js"
  },
  "/_nuxt/C9R92V3y.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2812-wvZya84PjZq/cX3rnch7oacgcZg\"",
    "mtime": "2026-11-20T09:40:30.580Z",
    "size": 10258,
    "path": "../public/_nuxt/C9R92V3y.js"
  },
  "/_nuxt/C9N6loC2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"c5d-rHjaNFsuMcZyEYyZEr/DUGevtdI\"",
    "mtime": "2026-11-20T09:40:30.581Z",
    "size": 3165,
    "path": "../public/_nuxt/C9N6loC2.js"
  },
  "/models/face_recognition_model.bin": {
    "type": "application/octet-stream",
    "etag": "\"625400-WARdwHLPE+xrp5Xpv2Pq7E0NlV0\"",
    "mtime": "2026-11-20T09:40:30.775Z",
    "size": 6444032,
    "path": "../public/models/face_recognition_model.bin"
  },
  "/_nuxt/CAVADUrr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"cbd-7xYL3al4sWoAupbr71uFXGUIUMg\"",
    "mtime": "2026-11-20T09:40:30.581Z",
    "size": 3261,
    "path": "../public/_nuxt/CAVADUrr.js"
  },
  "/_nuxt/C9jCErW_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1d9e-/qMRQa9UOPqDVwQuZ48dQfcE5W8\"",
    "mtime": "2026-11-20T09:40:30.581Z",
    "size": 7582,
    "path": "../public/_nuxt/C9jCErW_.js"
  },
  "/_nuxt/CCtNgDVw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"437f-3vYRxJFjtlrGJi89o9AOvaNq4kY\"",
    "mtime": "2026-11-20T09:40:30.584Z",
    "size": 17279,
    "path": "../public/_nuxt/CCtNgDVw.js"
  },
  "/_nuxt/CBtkSJIM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"176e-4xJ0jfHof8Ngz/vRHYJ1q0BPDPw\"",
    "mtime": "2026-11-20T09:40:30.583Z",
    "size": 5998,
    "path": "../public/_nuxt/CBtkSJIM.js"
  },
  "/_nuxt/CDemAe5D.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2cdc-xtcSNmwFXZRvX7yXUmKl0rQgEV0\"",
    "mtime": "2026-11-20T09:40:30.584Z",
    "size": 11484,
    "path": "../public/_nuxt/CDemAe5D.js"
  },
  "/_nuxt/CE2oHgO6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f39-o+4jTKd6MVsgDO6q8Gm6YvHb3og\"",
    "mtime": "2026-11-20T09:40:30.586Z",
    "size": 3897,
    "path": "../public/_nuxt/CE2oHgO6.js"
  },
  "/_nuxt/CEE5PB-p.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1d89-TnvqTRCmxyEQ/5ycAobi/bFhNSA\"",
    "mtime": "2026-11-20T09:40:30.586Z",
    "size": 7561,
    "path": "../public/_nuxt/CEE5PB-p.js"
  },
  "/_nuxt/CF7mTcdz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"13bd-VZTU5ARPBXSJdg02hm8BmTGfPaw\"",
    "mtime": "2026-11-20T09:40:30.588Z",
    "size": 5053,
    "path": "../public/_nuxt/CF7mTcdz.js"
  },
  "/_nuxt/CFgCRU96.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1dd2-DelwscwUFujMHvSgyDXtyTcDVdk\"",
    "mtime": "2026-11-20T09:40:30.586Z",
    "size": 7634,
    "path": "../public/_nuxt/CFgCRU96.js"
  },
  "/_nuxt/CGe1BoXc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"264a-6+Lv+PnGAf+AfGNkzg6lwzWXZao\"",
    "mtime": "2026-11-20T09:40:30.589Z",
    "size": 9802,
    "path": "../public/_nuxt/CGe1BoXc.js"
  },
  "/_nuxt/CJJ6Tg1d.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"17c2-l89mVkRsvU1Kd/sC6A2bqrxWcPc\"",
    "mtime": "2026-11-20T09:40:30.591Z",
    "size": 6082,
    "path": "../public/_nuxt/CJJ6Tg1d.js"
  },
  "/_nuxt/CJuzoyqU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2fe-3hm1YlhOBiQlHLv6auO5RujIgzk\"",
    "mtime": "2026-11-20T09:40:30.594Z",
    "size": 766,
    "path": "../public/_nuxt/CJuzoyqU.js"
  },
  "/_nuxt/CIYkzLp_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"6e65-Zau8TuDN8jnZCspZ3fOFIaJByrU\"",
    "mtime": "2026-11-20T09:40:30.589Z",
    "size": 28261,
    "path": "../public/_nuxt/CIYkzLp_.js"
  },
  "/_nuxt/CN1Ai90z.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4562-adscoKqcAXAxb2xEL6nltn0M5XM\"",
    "mtime": "2026-11-20T09:40:30.593Z",
    "size": 17762,
    "path": "../public/_nuxt/CN1Ai90z.js"
  },
  "/_nuxt/CLkt7mYi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"efc-/HYX0TrDSYIa0HZa14JmwSHc93U\"",
    "mtime": "2026-11-20T09:40:30.589Z",
    "size": 3836,
    "path": "../public/_nuxt/CLkt7mYi.js"
  },
  "/_nuxt/CNGFIHJv.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"9676-pwSfxlEagV93hfEZVQCsLA7ruak\"",
    "mtime": "2026-11-20T09:40:30.592Z",
    "size": 38518,
    "path": "../public/_nuxt/CNGFIHJv.js"
  },
  "/_nuxt/COF8z84s.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1bfc-GEjY6c5EALIvXk1ZtbKriUqSYsI\"",
    "mtime": "2026-11-20T09:40:30.599Z",
    "size": 7164,
    "path": "../public/_nuxt/COF8z84s.js"
  },
  "/_nuxt/CQa-WBCZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2fb0-jZo7ubcAxHiT+yXueHO4JhImLIA\"",
    "mtime": "2026-11-20T09:40:30.596Z",
    "size": 12208,
    "path": "../public/_nuxt/CQa-WBCZ.js"
  },
  "/_nuxt/COh1OzWO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1fa2-51W6Y5v3dM7vC8sPtGt77wbNNSI\"",
    "mtime": "2026-11-20T09:40:30.596Z",
    "size": 8098,
    "path": "../public/_nuxt/COh1OzWO.js"
  },
  "/_nuxt/CNerDvZX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"68c87-iYcdqLSg6nl18J6BABJp3meqVNI\"",
    "mtime": "2026-11-20T09:40:30.601Z",
    "size": 429191,
    "path": "../public/_nuxt/CNerDvZX.js"
  },
  "/_nuxt/CRkU_Tba.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3272-BeY3xAuLcIeqk+0fzSZDDMlGrhs\"",
    "mtime": "2026-11-20T09:40:30.599Z",
    "size": 12914,
    "path": "../public/_nuxt/CRkU_Tba.js"
  },
  "/_nuxt/CTN8dY-S.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"c06-a3ps0zTvn9G4dhZeDHpgNj8cPAM\"",
    "mtime": "2026-11-20T09:40:30.597Z",
    "size": 3078,
    "path": "../public/_nuxt/CTN8dY-S.js"
  },
  "/_nuxt/CTi0VwPL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"20f6-LsibWOBRfuF488wYcxQL8jPUvuM\"",
    "mtime": "2026-11-20T09:40:30.600Z",
    "size": 8438,
    "path": "../public/_nuxt/CTi0VwPL.js"
  },
  "/_nuxt/CU5GXoDg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"30fa-MCS7HEjW+4OdsbvkGd3qOL7bZHM\"",
    "mtime": "2026-11-20T09:40:30.602Z",
    "size": 12538,
    "path": "../public/_nuxt/CU5GXoDg.js"
  },
  "/_nuxt/CD9jNrC-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"144352-MC/1dsuDkIyoCChjicM2gjfMECs\"",
    "mtime": "2026-11-20T09:40:30.595Z",
    "size": 1327954,
    "path": "../public/_nuxt/CD9jNrC-.js"
  },
  "/_nuxt/CWemfMko.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16ea-cC7tYltDes1tCSQfS0O70nF37sg\"",
    "mtime": "2026-11-20T09:40:30.602Z",
    "size": 5866,
    "path": "../public/_nuxt/CWemfMko.js"
  },
  "/_nuxt/CWm5Jrof.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"18cd-5bLXOZN/82kTXNLDbUmsYmJcBFQ\"",
    "mtime": "2026-11-20T09:40:30.605Z",
    "size": 6349,
    "path": "../public/_nuxt/CWm5Jrof.js"
  },
  "/_nuxt/CUf93tPM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2a19-ihHym9K5H4lgAdPNjsWf0E8dhoU\"",
    "mtime": "2026-11-20T09:40:30.603Z",
    "size": 10777,
    "path": "../public/_nuxt/CUf93tPM.js"
  },
  "/_nuxt/CX1sQlK2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4158-m4wjiqAbNw6LnAoKU0HdAcBOzkU\"",
    "mtime": "2026-11-20T09:40:30.605Z",
    "size": 16728,
    "path": "../public/_nuxt/CX1sQlK2.js"
  },
  "/_nuxt/Cb4Tnxnq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1ab4-8UFX8xP6pFx5+UDVtl/2PRVsSE4\"",
    "mtime": "2026-11-20T09:40:30.608Z",
    "size": 6836,
    "path": "../public/_nuxt/Cb4Tnxnq.js"
  },
  "/_nuxt/CX_wj8xl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16a9-VsWb084L4/L1D47ogmozM9dDpJY\"",
    "mtime": "2026-11-20T09:40:30.605Z",
    "size": 5801,
    "path": "../public/_nuxt/CX_wj8xl.js"
  },
  "/_nuxt/CaUURd6k.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2075-y2cbBZtDab11f36Qd4yH51l4nUA\"",
    "mtime": "2026-11-20T09:40:30.607Z",
    "size": 8309,
    "path": "../public/_nuxt/CaUURd6k.js"
  },
  "/_nuxt/CcIr4Iug.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1a79-ItXeaAiPhGX12ZUmjq6YIFJinWE\"",
    "mtime": "2026-11-20T09:40:30.607Z",
    "size": 6777,
    "path": "../public/_nuxt/CcIr4Iug.js"
  },
  "/_nuxt/CeM3c7Wh.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"254-umJNrs4Rg5mpBbpxJ0iJnP6JLm8\"",
    "mtime": "2026-11-20T09:40:30.610Z",
    "size": 596,
    "path": "../public/_nuxt/CeM3c7Wh.js"
  },
  "/_nuxt/CbsdXfYs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f78b-ct9wXXOa20X/NsrqQQ5nzGS4QpY\"",
    "mtime": "2026-11-20T09:40:30.609Z",
    "size": 63371,
    "path": "../public/_nuxt/CbsdXfYs.js"
  },
  "/_nuxt/CdS28_1H.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2de-lzYnduc13KHf+jat7XIDi0vo+Uc\"",
    "mtime": "2026-11-20T09:40:30.609Z",
    "size": 734,
    "path": "../public/_nuxt/CdS28_1H.js"
  },
  "/_nuxt/CegoMatF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1cee-jHTVE5NyI9SJ6DjrABHYO3VpDlM\"",
    "mtime": "2026-11-20T09:40:30.610Z",
    "size": 7406,
    "path": "../public/_nuxt/CegoMatF.js"
  },
  "/_nuxt/Cgry9DzY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"14be-kNaqh4ZrOjshk8jFY/vqltsLXp8\"",
    "mtime": "2026-11-20T09:40:30.613Z",
    "size": 5310,
    "path": "../public/_nuxt/Cgry9DzY.js"
  },
  "/_nuxt/Cemf9ZcY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"814-ZUGNMFoCxcLdNKV1TFm5DE3TlKM\"",
    "mtime": "2026-11-20T09:40:30.611Z",
    "size": 2068,
    "path": "../public/_nuxt/Cemf9ZcY.js"
  },
  "/_nuxt/Cexr4_87.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2336-Dm7W6dYMP11D9l49zTHJH5xl4oU\"",
    "mtime": "2026-11-20T09:40:30.612Z",
    "size": 9014,
    "path": "../public/_nuxt/Cexr4_87.js"
  },
  "/_nuxt/ChFikhpC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8aa-hBimObSsXyDTT8iYV/HbSYfJRF4\"",
    "mtime": "2026-11-20T09:40:30.612Z",
    "size": 2218,
    "path": "../public/_nuxt/ChFikhpC.js"
  },
  "/_nuxt/Cldh_2td.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d2c-5e6iyrvTOTX5l3raRk8Aw/MQ7ZM\"",
    "mtime": "2026-11-20T09:40:30.615Z",
    "size": 3372,
    "path": "../public/_nuxt/Cldh_2td.js"
  },
  "/_nuxt/ClIgp2gW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"988-EDcEz0Iaj2j+QYU9JUwpoQMA1U0\"",
    "mtime": "2026-11-20T09:40:30.613Z",
    "size": 2440,
    "path": "../public/_nuxt/ClIgp2gW.js"
  },
  "/_nuxt/Cm61rjHF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a9a-/fIa1g2/CIkdK0/uONoQveMAnoY\"",
    "mtime": "2026-11-20T09:40:30.615Z",
    "size": 2714,
    "path": "../public/_nuxt/Cm61rjHF.js"
  },
  "/_nuxt/Cmuc3AdF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1644-ZOcbFKqgI2DWNs7SMJG9SuNSp3Y\"",
    "mtime": "2026-11-20T09:40:30.615Z",
    "size": 5700,
    "path": "../public/_nuxt/Cmuc3AdF.js"
  },
  "/_nuxt/Coag3nLC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"61ac-5uM91Zp3JjAukv4fRL+qcP40hiM\"",
    "mtime": "2026-11-20T09:40:30.617Z",
    "size": 25004,
    "path": "../public/_nuxt/Coag3nLC.js"
  },
  "/_nuxt/CpjkSC5B.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"18b6-KGAesyWw9cS4vbKi//FssOjHlsY\"",
    "mtime": "2026-11-20T09:40:30.617Z",
    "size": 6326,
    "path": "../public/_nuxt/CpjkSC5B.js"
  },
  "/_nuxt/CqDbEFy1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"64ec-KYpEt1UVC30c+Gc9tJ/Zm1GOaQo\"",
    "mtime": "2026-11-20T09:40:30.618Z",
    "size": 25836,
    "path": "../public/_nuxt/CqDbEFy1.js"
  },
  "/_nuxt/Cqlnz5Uc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"fc8-ndv4EVj8H8VWsSlCsuZhy5szWeo\"",
    "mtime": "2026-11-20T09:40:30.617Z",
    "size": 4040,
    "path": "../public/_nuxt/Cqlnz5Uc.js"
  },
  "/_nuxt/CrlbwFEK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2b44-yWJXPzJG/X8p3ookRMlIwd0/BR0\"",
    "mtime": "2026-11-20T09:40:30.619Z",
    "size": 11076,
    "path": "../public/_nuxt/CrlbwFEK.js"
  },
  "/_nuxt/CsKpEvez.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"30f3-9CQVcjpvg4G3ZTQHi5tgD87WJ/o\"",
    "mtime": "2026-11-20T09:40:30.618Z",
    "size": 12531,
    "path": "../public/_nuxt/CsKpEvez.js"
  },
  "/_nuxt/Cv76Aaux.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"106e-VFyFYHsYfeilYJ3Y49G2hRAtMeo\"",
    "mtime": "2026-11-20T09:40:30.620Z",
    "size": 4206,
    "path": "../public/_nuxt/Cv76Aaux.js"
  },
  "/_nuxt/CustomerRefund.DCoJcIrU.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"161-1+O4Zi8HJUs4GHqqV/9WFJwaxEA\"",
    "mtime": "2026-11-20T09:40:30.621Z",
    "size": 353,
    "path": "../public/_nuxt/CustomerRefund.DCoJcIrU.css"
  },
  "/_nuxt/CtRYaV5A.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2a44-sqt+QPg571NGqifBwX5jim683Tw\"",
    "mtime": "2026-11-20T09:40:30.620Z",
    "size": 10820,
    "path": "../public/_nuxt/CtRYaV5A.js"
  },
  "/_nuxt/Cw9ZZNTI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1225-WjKbGG/6lQzW5PSyDjU0yyk0jX8\"",
    "mtime": "2026-11-20T09:40:30.622Z",
    "size": 4645,
    "path": "../public/_nuxt/Cw9ZZNTI.js"
  },
  "/_nuxt/CxpJ-jeq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b6-YA3nYPJadChCZcA65QImHDgjAYk\"",
    "mtime": "2026-11-20T09:40:30.622Z",
    "size": 182,
    "path": "../public/_nuxt/CxpJ-jeq.js"
  },
  "/_nuxt/CwSRHWjP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1e7e-O44MRAN62gX5BxyfvgmuRRXMtBs\"",
    "mtime": "2026-11-20T09:40:30.623Z",
    "size": 7806,
    "path": "../public/_nuxt/CwSRHWjP.js"
  },
  "/_nuxt/Cy7UOsCi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"12d4-HpCvRuWuCxjR0yFh9wNI7FkXED8\"",
    "mtime": "2026-11-20T09:40:30.623Z",
    "size": 4820,
    "path": "../public/_nuxt/Cy7UOsCi.js"
  },
  "/_nuxt/D17jWrcV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2a82-tS5BphDwJ4zQeFJUVIzLllQxh4U\"",
    "mtime": "2026-11-20T09:40:30.624Z",
    "size": 10882,
    "path": "../public/_nuxt/D17jWrcV.js"
  },
  "/_nuxt/D23QVdOo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"21e2-uQkTo9qYZiB/DfSgh97xbtRfZ3Q\"",
    "mtime": "2026-11-20T09:40:30.625Z",
    "size": 8674,
    "path": "../public/_nuxt/D23QVdOo.js"
  },
  "/_nuxt/D2tXPLIk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1a13-U2zAwjF/Po8KkKz8qDWHNZ3O6tg\"",
    "mtime": "2026-11-20T09:40:30.625Z",
    "size": 6675,
    "path": "../public/_nuxt/D2tXPLIk.js"
  },
  "/_nuxt/D5ZHeDJC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ec5-duF9hXuzWdDcpzChr4hZQOFZcOM\"",
    "mtime": "2026-11-20T09:40:30.628Z",
    "size": 3781,
    "path": "../public/_nuxt/D5ZHeDJC.js"
  },
  "/_nuxt/D5i7LW5-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2697-nZrOevh+Kh0Br2Zio4mW122AH+0\"",
    "mtime": "2026-11-20T09:40:30.626Z",
    "size": 9879,
    "path": "../public/_nuxt/D5i7LW5-.js"
  },
  "/_nuxt/D4MCvo81.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"247e-F1+BMUICpxfn+GuFX8mxn9HyvQo\"",
    "mtime": "2026-11-20T09:40:30.626Z",
    "size": 9342,
    "path": "../public/_nuxt/D4MCvo81.js"
  },
  "/_nuxt/D2xjyH--.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"393e1-7IHMmqXqs8OuHeMwYcBaIhRBS9U\"",
    "mtime": "2026-11-20T09:40:30.628Z",
    "size": 234465,
    "path": "../public/_nuxt/D2xjyH--.js"
  },
  "/_nuxt/D6-OTm0T.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2dfb-vpcmkFFbNfI4R+pk6EPNRV8DqQQ\"",
    "mtime": "2026-11-20T09:40:30.629Z",
    "size": 11771,
    "path": "../public/_nuxt/D6-OTm0T.js"
  },
  "/_nuxt/D86vTjKg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f50-Q4zOsWpnvO9rOOqngYqC9x0+eSM\"",
    "mtime": "2026-11-20T09:40:30.627Z",
    "size": 3920,
    "path": "../public/_nuxt/D86vTjKg.js"
  },
  "/_nuxt/D9N6OmD0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4be0-nJgLe2ZHGNbfKQKbLlFP1gFeYc0\"",
    "mtime": "2026-11-20T09:40:30.629Z",
    "size": 19424,
    "path": "../public/_nuxt/D9N6OmD0.js"
  },
  "/_nuxt/DA3T0RuZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"509c-3KEuD/nONEgzzR72IMoIBvmGsaY\"",
    "mtime": "2026-11-20T09:40:30.631Z",
    "size": 20636,
    "path": "../public/_nuxt/DA3T0RuZ.js"
  },
  "/_nuxt/DArrJDcI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"177e-CI38DTOAx3wADTN8GPfxhEUIgqY\"",
    "mtime": "2026-11-20T09:40:30.631Z",
    "size": 6014,
    "path": "../public/_nuxt/DArrJDcI.js"
  },
  "/_nuxt/DC2FO7ML.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"356d-rHyyUi5usrABkmsJzA343JBhHfk\"",
    "mtime": "2026-11-20T09:40:30.632Z",
    "size": 13677,
    "path": "../public/_nuxt/DC2FO7ML.js"
  },
  "/_nuxt/DCn35s4p.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"715-5WyVXoHSeS2P1ojk8Lty0eZGzmE\"",
    "mtime": "2026-11-20T09:40:30.632Z",
    "size": 1813,
    "path": "../public/_nuxt/DCn35s4p.js"
  },
  "/_nuxt/DDMRmdc0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"15fb-MwQTIfVn4bq+tUz3ZgwtK7yrdBw\"",
    "mtime": "2026-11-20T09:40:30.633Z",
    "size": 5627,
    "path": "../public/_nuxt/DDMRmdc0.js"
  },
  "/_nuxt/DEZT1q1u.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"267f-CE1i9Btvr88Utt6MgtmstYLfzY0\"",
    "mtime": "2026-11-20T09:40:30.633Z",
    "size": 9855,
    "path": "../public/_nuxt/DEZT1q1u.js"
  },
  "/_nuxt/DFvlKKIq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4324-4P5YMpJjciOFnSMBmYXEwKzP61k\"",
    "mtime": "2026-11-20T09:40:30.634Z",
    "size": 17188,
    "path": "../public/_nuxt/DFvlKKIq.js"
  },
  "/_nuxt/DNuZJbHH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1225-Fn0ASqd4nqzrSQPiwyWFT97ioAE\"",
    "mtime": "2026-11-20T09:40:30.638Z",
    "size": 4645,
    "path": "../public/_nuxt/DNuZJbHH.js"
  },
  "/_nuxt/DMP-SLtg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"12ff-ajfXFJ7yc3ll8ZcQRJAM6JgVPeY\"",
    "mtime": "2026-11-20T09:40:30.634Z",
    "size": 4863,
    "path": "../public/_nuxt/DMP-SLtg.js"
  },
  "/_nuxt/DN9LHgHg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"161b-g3CxfP7ZK8LlIiINdDUgpgKQ9uI\"",
    "mtime": "2026-11-20T09:40:30.635Z",
    "size": 5659,
    "path": "../public/_nuxt/DN9LHgHg.js"
  },
  "/_nuxt/DOGleTHl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"343-W+10lGr8hkCJxoNUJJGZ11wQJeI\"",
    "mtime": "2026-11-20T09:40:30.635Z",
    "size": 835,
    "path": "../public/_nuxt/DOGleTHl.js"
  },
  "/_nuxt/DOJl7lbM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1ce2-A5YTIW9YRbq9EyUov8oMdnT95X0\"",
    "mtime": "2026-11-20T09:40:30.635Z",
    "size": 7394,
    "path": "../public/_nuxt/DOJl7lbM.js"
  },
  "/_nuxt/DP6xqKMB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"17e6-qsqaFYuP1rrQDvyIls4GSAciGTU\"",
    "mtime": "2026-11-20T09:40:30.639Z",
    "size": 6118,
    "path": "../public/_nuxt/DP6xqKMB.js"
  },
  "/_nuxt/DR0YSyj7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"9a7-z2t64X5az8UcYEWImCF0RIUuC80\"",
    "mtime": "2026-11-20T09:40:30.640Z",
    "size": 2471,
    "path": "../public/_nuxt/DR0YSyj7.js"
  },
  "/_nuxt/DSIH9pHz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"940-yngSlzvkjW9hnvQolz/SC9uCKLs\"",
    "mtime": "2026-11-20T09:40:30.641Z",
    "size": 2368,
    "path": "../public/_nuxt/DSIH9pHz.js"
  },
  "/_nuxt/DPY4hjTs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"135d4-utfBBxKRxfIDGlB5zE825FODpS0\"",
    "mtime": "2026-11-20T09:40:30.643Z",
    "size": 79316,
    "path": "../public/_nuxt/DPY4hjTs.js"
  },
  "/_nuxt/DTjg1Zh6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"12d6-sCODaT1p00Ox5j2Ww7WDJ8obUmQ\"",
    "mtime": "2026-11-20T09:40:30.641Z",
    "size": 4822,
    "path": "../public/_nuxt/DTjg1Zh6.js"
  },
  "/_nuxt/DU-xFiOD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"293-Nb9ZCnTopTSjAPQ/2fwGTfwY5Es\"",
    "mtime": "2026-11-20T09:40:30.643Z",
    "size": 659,
    "path": "../public/_nuxt/DU-xFiOD.js"
  },
  "/_nuxt/DUgE_ClO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7707-5w0bp3wTEkya8Pu5mbRn/opZfLo\"",
    "mtime": "2026-11-20T09:40:30.643Z",
    "size": 30471,
    "path": "../public/_nuxt/DUgE_ClO.js"
  },
  "/_nuxt/DU7NwqKO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1a79-Rex6Xru/dQsMWhGS0YxwVW9QVOE\"",
    "mtime": "2026-11-20T09:40:30.642Z",
    "size": 6777,
    "path": "../public/_nuxt/DU7NwqKO.js"
  },
  "/_nuxt/DV-AchEE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1a24-OBR7ezMFUvD4QF/P1MXpWa/XEH4\"",
    "mtime": "2026-11-20T09:40:30.643Z",
    "size": 6692,
    "path": "../public/_nuxt/DV-AchEE.js"
  },
  "/_nuxt/DXCF32xs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8f0-OXuRm+166LItDmvHfb2naiyalx0\"",
    "mtime": "2026-11-20T09:40:30.645Z",
    "size": 2288,
    "path": "../public/_nuxt/DXCF32xs.js"
  },
  "/_nuxt/DYEzUccX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2337-El8yA6S1vUXyizXfaFyVDTjjhic\"",
    "mtime": "2026-11-20T09:40:30.645Z",
    "size": 9015,
    "path": "../public/_nuxt/DYEzUccX.js"
  },
  "/_nuxt/DYk0Kohd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"6ef8-7CvIKSwBzVBNLZB4zz3PdsPhqxs\"",
    "mtime": "2026-11-20T09:40:30.646Z",
    "size": 28408,
    "path": "../public/_nuxt/DYk0Kohd.js"
  },
  "/_nuxt/DYqSKMiv.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3b5d-HUPE+vjOITgPkW5uOIaudjAf9fA\"",
    "mtime": "2026-11-20T09:40:30.646Z",
    "size": 15197,
    "path": "../public/_nuxt/DYqSKMiv.js"
  },
  "/_nuxt/DZ3UAMVP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1760-OS32NsH7LrGxfNktHkpAvhLhqAU\"",
    "mtime": "2026-11-20T09:40:30.647Z",
    "size": 5984,
    "path": "../public/_nuxt/DZ3UAMVP.js"
  },
  "/_nuxt/DZiCa7k5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"12b8-h+C/6NnkBxCh+tDTMZi8O+adzQI\"",
    "mtime": "2026-11-20T09:40:30.647Z",
    "size": 4792,
    "path": "../public/_nuxt/DZiCa7k5.js"
  },
  "/_nuxt/Db1XSA5N.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f35-n5JbbE2a57g9E2PM4I57VoAbEqI\"",
    "mtime": "2026-11-20T09:40:30.648Z",
    "size": 3893,
    "path": "../public/_nuxt/Db1XSA5N.js"
  },
  "/_nuxt/DbI1DJ6i.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"224d-+40Sxswbd4T+5QEipF3Q1EWQCi8\"",
    "mtime": "2026-11-20T09:40:30.649Z",
    "size": 8781,
    "path": "../public/_nuxt/DbI1DJ6i.js"
  },
  "/_nuxt/De63PbYg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ca4-bSSiyCAEJJlAzBIQqGhuXQDjqqA\"",
    "mtime": "2026-11-20T09:40:30.649Z",
    "size": 3236,
    "path": "../public/_nuxt/De63PbYg.js"
  },
  "/_nuxt/DeSfd9Jx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1336-BS9Cs54i1gihzW0Y93Qu5q6d64Q\"",
    "mtime": "2026-11-20T09:40:30.649Z",
    "size": 4918,
    "path": "../public/_nuxt/DeSfd9Jx.js"
  },
  "/_nuxt/DehYmCF6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"cb17-CcdI6FZAYlOggxucenRCq5rt1nM\"",
    "mtime": "2026-11-20T09:40:30.651Z",
    "size": 51991,
    "path": "../public/_nuxt/DehYmCF6.js"
  },
  "/_nuxt/Dh0gBFNk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"14ef-sHnBsNDXtnb4E3njfq78dKqN2pA\"",
    "mtime": "2026-11-20T09:40:30.651Z",
    "size": 5359,
    "path": "../public/_nuxt/Dh0gBFNk.js"
  },
  "/_nuxt/DgS_dbi9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"245f-J3nInkkneEajkqQpOUsS2ro9+64\"",
    "mtime": "2026-11-20T09:40:30.651Z",
    "size": 9311,
    "path": "../public/_nuxt/DgS_dbi9.js"
  },
  "/_nuxt/Dl6dl1GT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"167b-KmyeTDW6tB9oZ5ve38jAMA6J0dE\"",
    "mtime": "2026-11-20T09:40:30.654Z",
    "size": 5755,
    "path": "../public/_nuxt/Dl6dl1GT.js"
  },
  "/_nuxt/Di9k-y99.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2193-HdagyBj4tbIowYawa2aszN03xac\"",
    "mtime": "2026-11-20T09:40:30.652Z",
    "size": 8595,
    "path": "../public/_nuxt/Di9k-y99.js"
  },
  "/_nuxt/Dsip0uW2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"23d1-gs/Wh9oOPS+Gad15jwWZ3FCK22c\"",
    "mtime": "2026-11-20T09:40:30.655Z",
    "size": 9169,
    "path": "../public/_nuxt/Dsip0uW2.js"
  },
  "/_nuxt/Du9Zv8Zp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"14ee-e3QoikPgiD3k8kbFV7RsINjj7tU\"",
    "mtime": "2026-11-20T09:40:30.654Z",
    "size": 5358,
    "path": "../public/_nuxt/Du9Zv8Zp.js"
  },
  "/_nuxt/DnGHQtKD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"431-SeVHJro5QcB2Pj8P3m7DBBCtIEU\"",
    "mtime": "2026-11-20T09:40:30.653Z",
    "size": 1073,
    "path": "../public/_nuxt/DnGHQtKD.js"
  },
  "/_nuxt/Dn7q1ZRj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"e97-MQ4Y78YVvgykR8mzbcqKP8rHysQ\"",
    "mtime": "2026-11-20T09:40:30.653Z",
    "size": 3735,
    "path": "../public/_nuxt/Dn7q1ZRj.js"
  },
  "/_nuxt/DuTf_kMr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1426-uEs/yVGvGICip7JoYeti5TDZetA\"",
    "mtime": "2026-11-20T09:40:30.655Z",
    "size": 5158,
    "path": "../public/_nuxt/DuTf_kMr.js"
  },
  "/_nuxt/DwDDDWtF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1ecb-3OI8DXLAXczc27gPI03cgPt2AGM\"",
    "mtime": "2026-11-20T09:40:30.657Z",
    "size": 7883,
    "path": "../public/_nuxt/DwDDDWtF.js"
  },
  "/_nuxt/DwUjrOy9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1d4f-zy1yxiBi7OfoAGPlG3pXlQd9vNQ\"",
    "mtime": "2026-11-20T09:40:30.656Z",
    "size": 7503,
    "path": "../public/_nuxt/DwUjrOy9.js"
  },
  "/_nuxt/Dxu0-nj4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4294-l7oxplBjeVbYEHs9HkVLxXHMtzQ\"",
    "mtime": "2026-11-20T09:40:30.658Z",
    "size": 17044,
    "path": "../public/_nuxt/Dxu0-nj4.js"
  },
  "/_nuxt/Dx6Gceke.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"80e6-NyO6XcIrwN2bHtaFeOPDH/7Q/f4\"",
    "mtime": "2026-11-20T09:40:30.658Z",
    "size": 32998,
    "path": "../public/_nuxt/Dx6Gceke.js"
  },
  "/_nuxt/InMer-1c.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1ba2-XijK6ARDLJ2YL/xpAvPasD4WhKU\"",
    "mtime": "2026-11-20T09:40:30.660Z",
    "size": 7074,
    "path": "../public/_nuxt/InMer-1c.js"
  },
  "/_nuxt/DyspOVI6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2759-fi9GNoENzHWJySgPIginxDdgSQg\"",
    "mtime": "2026-11-20T09:40:30.659Z",
    "size": 10073,
    "path": "../public/_nuxt/DyspOVI6.js"
  },
  "/_nuxt/Igk75N-D.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d009-yLg72ORh/UWHjnOSqLpmBsEhvX8\"",
    "mtime": "2026-11-20T09:40:30.660Z",
    "size": 53257,
    "path": "../public/_nuxt/Igk75N-D.js"
  },
  "/_nuxt/K1xOOU0O.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2dc3-5C9ajmbjO1JJH3bMRIZk4EfD+PQ\"",
    "mtime": "2026-11-20T09:40:30.661Z",
    "size": 11715,
    "path": "../public/_nuxt/K1xOOU0O.js"
  },
  "/_nuxt/MHz83MDq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1872-K+l7JBUD5lu4oN5cFFaQKuqWlTg\"",
    "mtime": "2026-11-20T09:40:30.663Z",
    "size": 6258,
    "path": "../public/_nuxt/MHz83MDq.js"
  },
  "/_nuxt/KTTnsQco.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7e09-mW9p3wm3JYf7f/X3UYiEQJ9UcZ0\"",
    "mtime": "2026-11-20T09:40:30.662Z",
    "size": 32265,
    "path": "../public/_nuxt/KTTnsQco.js"
  },
  "/_nuxt/KHS9JCqU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"24f8-BnY5/84KGu05w30r1skvMRTSGNk\"",
    "mtime": "2026-11-20T09:40:30.663Z",
    "size": 9464,
    "path": "../public/_nuxt/KHS9JCqU.js"
  },
  "/_nuxt/OnwpKw2C.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"147a-ImFTSyftn1AMOCbF45shzVxcRO0\"",
    "mtime": "2026-11-20T09:40:30.664Z",
    "size": 5242,
    "path": "../public/_nuxt/OnwpKw2C.js"
  },
  "/_nuxt/PageHeader.B_NWTxLj.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"a6-trpa+BucuBrZqZXXidb2ErpYldk\"",
    "mtime": "2026-11-20T09:40:30.664Z",
    "size": 166,
    "path": "../public/_nuxt/PageHeader.B_NWTxLj.css"
  },
  "/_nuxt/QErxBDTD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1c8a-L+QqupvjsLm7I9frAarqP6gWqH4\"",
    "mtime": "2026-11-20T09:40:30.666Z",
    "size": 7306,
    "path": "../public/_nuxt/QErxBDTD.js"
  },
  "/_nuxt/ReportFrame.DvS7QMT9.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"546-o6BLSVs5R9M2H1ar+CnK+70ZPRg\"",
    "mtime": "2026-11-20T09:40:30.665Z",
    "size": 1350,
    "path": "../public/_nuxt/ReportFrame.DvS7QMT9.css"
  },
  "/_nuxt/RfBBbI62.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3b0-yqA54gDKd9xemLJkSnreIT+mWLw\"",
    "mtime": "2026-11-20T09:40:30.666Z",
    "size": 944,
    "path": "../public/_nuxt/RfBBbI62.js"
  },
  "/_nuxt/SOko1kU8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"29b4-oo5Kp+fJASBTAdO6ehXxwT3VJso\"",
    "mtime": "2026-11-20T09:40:30.667Z",
    "size": 10676,
    "path": "../public/_nuxt/SOko1kU8.js"
  },
  "/_nuxt/TlMgHcf6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b6-PxHNoL0pf5xxmO8OAcILAAb2AOs\"",
    "mtime": "2026-11-20T09:40:30.668Z",
    "size": 182,
    "path": "../public/_nuxt/TlMgHcf6.js"
  },
  "/_nuxt/U-gGH8b5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3fcb-7kI2wCgJo/pkAvaLPnYZ8rylnfQ\"",
    "mtime": "2026-11-20T09:40:30.669Z",
    "size": 16331,
    "path": "../public/_nuxt/U-gGH8b5.js"
  },
  "/_nuxt/TNYO4g5_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1ce7-phsOcW11ROjzZOolQRy8lP5dLd0\"",
    "mtime": "2026-11-20T09:40:30.666Z",
    "size": 7399,
    "path": "../public/_nuxt/TNYO4g5_.js"
  },
  "/_nuxt/UiSlideOver.CK6ds4dl.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"205-VT2r6P1poX+W1yS83yvUMqPT7MU\"",
    "mtime": "2026-11-20T09:40:30.668Z",
    "size": 517,
    "path": "../public/_nuxt/UiSlideOver.CK6ds4dl.css"
  },
  "/_nuxt/WF9ocz7W.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"152b-j1LMx2OzgqbXd6JvNzCVEIywuzA\"",
    "mtime": "2026-11-20T09:40:30.670Z",
    "size": 5419,
    "path": "../public/_nuxt/WF9ocz7W.js"
  },
  "/_nuxt/WS9V28_v.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1115-AQMwOue7Na/oCUPPgYnq7p4hwQY\"",
    "mtime": "2026-11-20T09:40:30.671Z",
    "size": 4373,
    "path": "../public/_nuxt/WS9V28_v.js"
  },
  "/_nuxt/UiStyleToggle.B2UI6Rnb.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"330-6IsfPLrxRLGojVHbygFEU34Jw4M\"",
    "mtime": "2026-11-20T09:40:30.671Z",
    "size": 816,
    "path": "../public/_nuxt/UiStyleToggle.B2UI6Rnb.css"
  },
  "/_nuxt/Z5GJwzFV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2f3d-DcBqitLhGtSCyByx6Cir6X7BKjU\"",
    "mtime": "2026-11-20T09:40:30.674Z",
    "size": 12093,
    "path": "../public/_nuxt/Z5GJwzFV.js"
  },
  "/_nuxt/YbFIPXPH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"e47-fhYVGVQvJM60FFUvDH8mz78ikqg\"",
    "mtime": "2026-11-20T09:40:30.671Z",
    "size": 3655,
    "path": "../public/_nuxt/YbFIPXPH.js"
  },
  "/_nuxt/YwpuwJRp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"c46-Lbo9vbm+m6fz21p+ZwoVbt82RKA\"",
    "mtime": "2026-11-20T09:40:30.672Z",
    "size": 3142,
    "path": "../public/_nuxt/YwpuwJRp.js"
  },
  "/_nuxt/Z3AQBRLw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1a51-4rp8u1O/bfZg3NVltO9czZV13ME\"",
    "mtime": "2026-11-20T09:40:30.674Z",
    "size": 6737,
    "path": "../public/_nuxt/Z3AQBRLw.js"
  },
  "/_nuxt/ZvtD7f6q.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1bf8-HgA5b+lkgA7yT/ozHNkCxqSAPBw\"",
    "mtime": "2026-11-20T09:40:30.673Z",
    "size": 7160,
    "path": "../public/_nuxt/ZvtD7f6q.js"
  },
  "/_nuxt/ZnplZj5J.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1cc0-oXTH4gia+XtbRD/1JL+qbp8z55o\"",
    "mtime": "2026-11-20T09:40:30.676Z",
    "size": 7360,
    "path": "../public/_nuxt/ZnplZj5J.js"
  },
  "/_nuxt/_id_.-BW_Z4_e.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"a3-1EznUbe+V+1YmlY4kkXS+B7F3/g\"",
    "mtime": "2026-11-20T09:40:30.674Z",
    "size": 163,
    "path": "../public/_nuxt/_id_.-BW_Z4_e.css"
  },
  "/_nuxt/_id_.C0N9G5ny.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"c75-RwiouuzyPhDcjBuaQhSiRrdAJRc\"",
    "mtime": "2026-11-20T09:40:30.676Z",
    "size": 3189,
    "path": "../public/_nuxt/_id_.C0N9G5ny.css"
  },
  "/_nuxt/_paymentId_.zaSaL9xD.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"f7a-XbzOlygPbW7nhU1pTYhOxIAr1xE\"",
    "mtime": "2026-11-20T09:40:30.676Z",
    "size": 3962,
    "path": "../public/_nuxt/_paymentId_.zaSaL9xD.css"
  },
  "/_nuxt/_order_.DCYG54kA.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"36-68YIvGOIbIh+hum8dbtuq5H8jok\"",
    "mtime": "2026-11-20T09:40:30.676Z",
    "size": 54,
    "path": "../public/_nuxt/_order_.DCYG54kA.css"
  },
  "/_nuxt/approve.CsU0F9la.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"c9-mMlsCa+AkrlwkUtL0VvoVxasYag\"",
    "mtime": "2026-11-20T09:40:30.677Z",
    "size": 201,
    "path": "../public/_nuxt/approve.CsU0F9la.css"
  },
  "/_nuxt/base.ByFTD2Xc.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"b5-zebxk6JgBKDJ5wB6LtewZrMr8DQ\"",
    "mtime": "2026-11-20T09:40:30.677Z",
    "size": 181,
    "path": "../public/_nuxt/base.ByFTD2Xc.css"
  },
  "/_nuxt/biometric.D0is3mi_.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"59c-L9qD4U+l+qFc78+XSgEni+20jjo\"",
    "mtime": "2026-11-20T09:40:30.678Z",
    "size": 1436,
    "path": "../public/_nuxt/biometric.D0is3mi_.css"
  },
  "/_nuxt/bnwsnVY3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"217e-hLhAiJpo3AASvujcKlIT4ZJzDFQ\"",
    "mtime": "2026-11-20T09:40:30.678Z",
    "size": 8574,
    "path": "../public/_nuxt/bnwsnVY3.js"
  },
  "/_nuxt/create.DZDJFR_h.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"44d-XNMEeXvdJQCap9tDhqLlimj5aOk\"",
    "mtime": "2026-11-20T09:40:30.679Z",
    "size": 1101,
    "path": "../public/_nuxt/create.DZDJFR_h.css"
  },
  "/_nuxt/create.DdDvMnqg.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"fa-g4qA6RyNaNgEWX/zs1jyckvvTp4\"",
    "mtime": "2026-11-20T09:40:30.679Z",
    "size": 250,
    "path": "../public/_nuxt/create.DdDvMnqg.css"
  },
  "/_nuxt/create.RBW53SWr.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"ee-ZHqrluBQEmomHhQWXpUOipWdK2c\"",
    "mtime": "2026-11-20T09:40:30.679Z",
    "size": 238,
    "path": "../public/_nuxt/create.RBW53SWr.css"
  },
  "/_nuxt/dCtyZ_tr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2cc0-nq2zX+Xv26OX/vUs8OprzmcT+JM\"",
    "mtime": "2026-11-20T09:40:30.680Z",
    "size": 11456,
    "path": "../public/_nuxt/dCtyZ_tr.js"
  },
  "/_nuxt/dM3zDtkc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1bef-F/Rh8O11ojAYwM41hL1Nf9g3+oA\"",
    "mtime": "2026-11-20T09:40:30.681Z",
    "size": 7151,
    "path": "../public/_nuxt/dM3zDtkc.js"
  },
  "/_nuxt/default.DP41HstD.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"c4b-bYHWZpEe9wr11Q3LdJ3sXzvYj0c\"",
    "mtime": "2026-11-20T09:40:30.681Z",
    "size": 3147,
    "path": "../public/_nuxt/default.DP41HstD.css"
  },
  "/_nuxt/dispatch-slip.DQ1V1YN0.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"113-udI0L7tI3P+5brPxi6yuCHBuBNs\"",
    "mtime": "2026-11-20T09:40:30.681Z",
    "size": 275,
    "path": "../public/_nuxt/dispatch-slip.DQ1V1YN0.css"
  },
  "/_nuxt/edit.DP5kNvJi.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"fa-UTh5sw9G8txZ9FkHFzNHhhaEDO8\"",
    "mtime": "2026-11-20T09:40:30.682Z",
    "size": 250,
    "path": "../public/_nuxt/edit.DP5kNvJi.css"
  },
  "/_nuxt/dvmlyjoB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"264b-CfOyDNLGyeuwm63FKTQgNxdlKhE\"",
    "mtime": "2026-11-20T09:40:30.683Z",
    "size": 9803,
    "path": "../public/_nuxt/dvmlyjoB.js"
  },
  "/_nuxt/edit.XbB5EWUi.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1e4-iuxRSbPNbHpX72yPeifgBbGl4s4\"",
    "mtime": "2026-11-20T09:40:30.683Z",
    "size": 484,
    "path": "../public/_nuxt/edit.XbB5EWUi.css"
  },
  "/_nuxt/edit.COUdmHwK.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"190-mIEAqq4rfLL88T7XOjvYKQeu+dE\"",
    "mtime": "2026-11-20T09:40:30.683Z",
    "size": 400,
    "path": "../public/_nuxt/edit.COUdmHwK.css"
  },
  "/_nuxt/exoLBd-T.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"128-lEAHMeyyMkWN/YBR5djTVinMxZo\"",
    "mtime": "2026-11-20T09:40:30.685Z",
    "size": 296,
    "path": "../public/_nuxt/exoLBd-T.js"
  },
  "/_nuxt/fuel.BnSRpMlB.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"b5-rAGasX6D7WUeJopsryk3/lPvKzI\"",
    "mtime": "2026-11-20T09:40:30.685Z",
    "size": 181,
    "path": "../public/_nuxt/fuel.BnSRpMlB.css"
  },
  "/_nuxt/gTdV6U7O.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"19bc-ZEI7cXSfSCK/g5I8FIS+bRxH3p8\"",
    "mtime": "2026-11-20T09:40:30.686Z",
    "size": 6588,
    "path": "../public/_nuxt/gTdV6U7O.js"
  },
  "/_nuxt/hD3gB4ZE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2430-RN9V3aJ9VD1ZW5JiVAmqBdYgirg\"",
    "mtime": "2026-11-20T09:40:30.687Z",
    "size": 9264,
    "path": "../public/_nuxt/hD3gB4ZE.js"
  },
  "/_nuxt/fw6mz_Uz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3ccc-lNpq8SvD4b9WBKE4DSQF/CWGknY\"",
    "mtime": "2026-11-20T09:40:30.686Z",
    "size": 15564,
    "path": "../public/_nuxt/fw6mz_Uz.js"
  },
  "/_nuxt/index.B6ruolcm.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"20f-x7dA2TmO5ZFOSvWCell8L2w2bUY\"",
    "mtime": "2026-11-20T09:40:30.689Z",
    "size": 527,
    "path": "../public/_nuxt/index.B6ruolcm.css"
  },
  "/_nuxt/index.B6o8l0HM.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"b1-TsLHHxmIGIdIrm9/usoZeMUhjfc\"",
    "mtime": "2026-11-20T09:40:30.687Z",
    "size": 177,
    "path": "../public/_nuxt/index.B6o8l0HM.css"
  },
  "/_nuxt/index.B9kvx-dZ.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"b5-B1ICULVGb6LT+eB6JM+l0gcFJVE\"",
    "mtime": "2026-11-20T09:40:30.689Z",
    "size": 181,
    "path": "../public/_nuxt/index.B9kvx-dZ.css"
  },
  "/_nuxt/index.C3O-2RnC.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"c5-ABYEIMdK/ab52ZIp/K/jNtquBJ8\"",
    "mtime": "2026-11-20T09:40:30.691Z",
    "size": 197,
    "path": "../public/_nuxt/index.C3O-2RnC.css"
  },
  "/_nuxt/index.BLdAtjQE.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"b1-cbz+ertHH/8WNzwg2f9WwN2ApbM\"",
    "mtime": "2026-11-20T09:40:30.688Z",
    "size": 177,
    "path": "../public/_nuxt/index.BLdAtjQE.css"
  },
  "/_nuxt/index.C-wKaL0t.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"50a-6Y7rwPMVs5kd4ANd+KEiqduxrt0\"",
    "mtime": "2026-11-20T09:40:30.690Z",
    "size": 1290,
    "path": "../public/_nuxt/index.C-wKaL0t.css"
  },
  "/_nuxt/index.BwamBwOZ.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"e7-cU8MY4B0yogAGmtKhQtMZUOcTrk\"",
    "mtime": "2026-11-20T09:40:30.691Z",
    "size": 231,
    "path": "../public/_nuxt/index.BwamBwOZ.css"
  },
  "/_nuxt/index.CHN-XoVP.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"c9-/Y595HRkJcIo8cIjjpJbeSpUEUs\"",
    "mtime": "2026-11-20T09:40:30.691Z",
    "size": 201,
    "path": "../public/_nuxt/index.CHN-XoVP.css"
  },
  "/_nuxt/index.CaPhnNuP.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"312-JOPSwA3A9gncmue1DfIjUBgTmTk\"",
    "mtime": "2026-11-20T09:40:30.692Z",
    "size": 786,
    "path": "../public/_nuxt/index.CaPhnNuP.css"
  },
  "/_nuxt/index.D2A3Irpv.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1524-rvqSIAywh0DESfT3fznMd8J4Ob8\"",
    "mtime": "2026-11-20T09:40:30.694Z",
    "size": 5412,
    "path": "../public/_nuxt/index.D2A3Irpv.css"
  },
  "/_nuxt/index.DjNj_IeG.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"3f7-uDWEaNTdY3LWs3oo4Cc7Z5chEzI\"",
    "mtime": "2026-11-20T09:40:30.693Z",
    "size": 1015,
    "path": "../public/_nuxt/index.DjNj_IeG.css"
  },
  "/_nuxt/index.dczfHaAe.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"b5-1iYfsPp1FM1NmpuVLA4/jesmODo\"",
    "mtime": "2026-11-20T09:40:30.695Z",
    "size": 181,
    "path": "../public/_nuxt/index.dczfHaAe.css"
  },
  "/_nuxt/index.mSbhJHvo.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"273-6aIfymzmXlCYq3zpULGVQAUaxuo\"",
    "mtime": "2026-11-20T09:40:30.693Z",
    "size": 627,
    "path": "../public/_nuxt/index.mSbhJHvo.css"
  },
  "/_nuxt/invoice.BT2O4bX7.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"30-uGMf3YxC2hTWuDuEVSO+B5cf0+U\"",
    "mtime": "2026-11-20T09:40:30.694Z",
    "size": 48,
    "path": "../public/_nuxt/invoice.BT2O4bX7.css"
  },
  "/_nuxt/invoice.qdlmT_h1.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1b4-4e4p+3IrAbzXVfPd3mxxeCr2AIE\"",
    "mtime": "2026-11-20T09:40:30.695Z",
    "size": 436,
    "path": "../public/_nuxt/invoice.qdlmT_h1.css"
  },
  "/_nuxt/ledger-review.BecUDR8T.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"30a-zuxe0fE83x4snHcB1Mwa2MtXKlA\"",
    "mtime": "2026-11-20T09:40:30.697Z",
    "size": 778,
    "path": "../public/_nuxt/ledger-review.BecUDR8T.css"
  },
  "/_nuxt/ledger.Cz1RvH4J.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"b5-08pTnP+dwHr/QOkbiJKC92/6M5E\"",
    "mtime": "2026-11-20T09:40:30.697Z",
    "size": 181,
    "path": "../public/_nuxt/ledger.Cz1RvH4J.css"
  },
  "/_nuxt/login.BC62QHdL.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"101-S9hhaen3bemWJCnhBlybHrJkQ4M\"",
    "mtime": "2026-11-20T09:40:30.697Z",
    "size": 257,
    "path": "../public/_nuxt/login.BC62QHdL.css"
  },
  "/_nuxt/mWJYyY0S.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1448-Aw7vEvZCejIXzu1rLRWglkeHw1A\"",
    "mtime": "2026-11-20T09:40:30.699Z",
    "size": 5192,
    "path": "../public/_nuxt/mWJYyY0S.js"
  },
  "/_nuxt/nYZCZqvQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"17b4-JpVe9K+ankdHRrCIlPWHmVFhToM\"",
    "mtime": "2026-11-20T09:40:30.700Z",
    "size": 6068,
    "path": "../public/_nuxt/nYZCZqvQ.js"
  },
  "/_nuxt/maintenance.C1lO4Aub.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"b1-zv1HqkzuRprePA6YpmMinhUCD6M\"",
    "mtime": "2026-11-20T09:40:30.699Z",
    "size": 177,
    "path": "../public/_nuxt/maintenance.C1lO4Aub.css"
  },
  "/_nuxt/m9WK5YEE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4601-8WUXJ3BoVF/LpNhuJkqUpdmdpRM\"",
    "mtime": "2026-11-20T09:40:30.699Z",
    "size": 17921,
    "path": "../public/_nuxt/m9WK5YEE.js"
  },
  "/_nuxt/permissions.4mcu3V8b.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"141-xFgHfmn20v8rJdOFnTZgbsdXgZU\"",
    "mtime": "2026-11-20T09:40:30.702Z",
    "size": 321,
    "path": "../public/_nuxt/permissions.4mcu3V8b.css"
  },
  "/_nuxt/payments.BdQBsAUm.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"b5-iIhm+L1aQrpdns8zNBEd2jRNRMQ\"",
    "mtime": "2026-11-20T09:40:30.702Z",
    "size": 181,
    "path": "../public/_nuxt/payments.BdQBsAUm.css"
  },
  "/_nuxt/pricing.CWKqM6Pu.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"165-HTUHrpxO0+6W9yaoKzEgGrPwn6w\"",
    "mtime": "2026-11-20T09:40:30.702Z",
    "size": 357,
    "path": "../public/_nuxt/pricing.CWKqM6Pu.css"
  },
  "/_nuxt/print.B3yEUJUm.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"69-zdbagVEybvpkjFYF+8AaVl4Gee0\"",
    "mtime": "2026-11-20T09:40:30.702Z",
    "size": 105,
    "path": "../public/_nuxt/print.B3yEUJUm.css"
  },
  "/_nuxt/print.BK1152hr.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"75-A5jUZFB/38XPuui3oaK2xMo5GMc\"",
    "mtime": "2026-11-20T09:40:30.703Z",
    "size": 117,
    "path": "../public/_nuxt/print.BK1152hr.css"
  },
  "/_nuxt/print.Cb5j83df.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"73-MZ4PGoFSYSaJNQyMMiNExihtB6U\"",
    "mtime": "2026-11-20T09:40:30.705Z",
    "size": 115,
    "path": "../public/_nuxt/print.Cb5j83df.css"
  },
  "/_nuxt/print.Cl-cp2nd.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1404-5jrHBOZWC896wzYNCb6Xt/g0hmQ\"",
    "mtime": "2026-11-20T09:40:30.705Z",
    "size": 5124,
    "path": "../public/_nuxt/print.Cl-cp2nd.css"
  },
  "/_nuxt/settings.ClnxKTrR.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"b5-G/l9xDxpF6NdLRB5oLftobMyKbA\"",
    "mtime": "2026-11-20T09:40:30.705Z",
    "size": 181,
    "path": "../public/_nuxt/settings.ClnxKTrR.css"
  },
  "/_nuxt/production.CHvzPcD_.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"cb-TWXOvNnr1ymyOSTAJbfVWwysXHQ\"",
    "mtime": "2026-11-20T09:40:30.705Z",
    "size": 203,
    "path": "../public/_nuxt/production.CHvzPcD_.css"
  },
  "/_nuxt/teFtM6S7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"267a-qV1I9JAK3uTttWkacwLGNOYq4OQ\"",
    "mtime": "2026-11-20T09:40:30.707Z",
    "size": 9850,
    "path": "../public/_nuxt/teFtM6S7.js"
  },
  "/_nuxt/statement.CqFGpKTL.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"8c-lo7q2zL+AP/TDDLiP9WH+1ddoys\"",
    "mtime": "2026-11-20T09:40:30.707Z",
    "size": 140,
    "path": "../public/_nuxt/statement.CqFGpKTL.css"
  },
  "/_nuxt/uqKrC25m.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"db3-w4LfflJ1Bf4rKKqz13VtbLADuUU\"",
    "mtime": "2026-11-20T09:40:30.707Z",
    "size": 3507,
    "path": "../public/_nuxt/uqKrC25m.js"
  },
  "/_nuxt/types.sSX3SIf7.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"b5-uQvT7kRmwo2T3ihxzjkPOLtCtn8\"",
    "mtime": "2026-11-20T09:40:30.708Z",
    "size": 181,
    "path": "../public/_nuxt/types.sSX3SIf7.css"
  },
  "/_nuxt/v8GOr8Zq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2a46-Fj0JPbx11g1L0IrmZAlj4ucu/X4\"",
    "mtime": "2026-11-20T09:40:30.710Z",
    "size": 10822,
    "path": "../public/_nuxt/v8GOr8Zq.js"
  },
  "/_nuxt/vQ_MoBmO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2154-9y+EXaZIkafveQKnehOl9fOtlL8\"",
    "mtime": "2026-11-20T09:40:30.710Z",
    "size": 8532,
    "path": "../public/_nuxt/vQ_MoBmO.js"
  },
  "/_nuxt/variants.Cx7om7FD.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"b5-Qs+fGjwtdoaD/peaaL4Yu3XQQfc\"",
    "mtime": "2026-11-20T09:40:30.710Z",
    "size": 181,
    "path": "../public/_nuxt/variants.Cx7om7FD.css"
  },
  "/_nuxt/variants.DmjtmX35.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"b5-CqV70WGFsIqIlCzH7IkzuJg8TTE\"",
    "mtime": "2026-11-20T09:40:30.710Z",
    "size": 181,
    "path": "../public/_nuxt/variants.DmjtmX35.css"
  },
  "/_nuxt/vouchers.DM0VuNSG.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"148-g1Pf2ZpCoYweMEp+jMKH+kAJFyM\"",
    "mtime": "2026-11-20T09:40:30.712Z",
    "size": 328,
    "path": "../public/_nuxt/vouchers.DM0VuNSG.css"
  },
  "/_nuxt/wJccGnKa.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1000-Dom9if9FbOfoS3/MxzwxsfjkJ0I\"",
    "mtime": "2026-11-20T09:40:30.713Z",
    "size": 4096,
    "path": "../public/_nuxt/wJccGnKa.js"
  },
  "/_nuxt/voucher.Dtakk1We.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"d3-db8p4DqDY2Oypspwt0H2DDRf4+0\"",
    "mtime": "2026-11-20T09:40:30.712Z",
    "size": 211,
    "path": "../public/_nuxt/voucher.Dtakk1We.css"
  },
  "/_nuxt/y29sMj63.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"897-ejAiwFxhp6xFIve0f3PJCeb2xUY\"",
    "mtime": "2026-11-20T09:40:30.714Z",
    "size": 2199,
    "path": "../public/_nuxt/y29sMj63.js"
  },
  "/_nuxt/y7k61UTY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3c5c-VUawcY/8ADOeIOCztcf16/4R+CM\"",
    "mtime": "2026-11-20T09:40:30.714Z",
    "size": 15452,
    "path": "../public/_nuxt/y7k61UTY.js"
  },
  "/_nuxt/builds/meta/ccb958fb-2ab0-4a85-af8c-4380dbb7ceee.json": {
    "type": "application/json",
    "etag": "\"58-ahD3bLWYlAjbytWDvsvtZ39Lvmk\"",
    "mtime": "2026-11-20T09:40:30.237Z",
    "size": 88,
    "path": "../public/_nuxt/builds/meta/ccb958fb-2ab0-4a85-af8c-4380dbb7ceee.json"
  },
  "/_nuxt/builds/latest.json": {
    "type": "application/json",
    "etag": "\"47-msVYoBj6iUWbIcTatcZDeOfh5Wc\"",
    "mtime": "2026-11-20T09:40:30.258Z",
    "size": 71,
    "path": "../public/_nuxt/builds/latest.json"
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
const ACTION_LIMIT_KEYS = [
  "approve_order",
  "amend_order",
  "collect_payment",
  "partial_delivery",
  "commodity_sale",
  "loan_disbursement",
  "pos_exit_release",
  "early_release"
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
async function assertDispatchClear(conn, orderId, userId) {
  var _a;
  const gate = await getOrderGateState(conn, orderId);
  if (!(gate.dispatchHold && !gate.dispatchCleared)) return { autoReleased: false };
  if (gate.conditionMet && gate.autoRelease) {
    await conn.query(
      `UPDATE order_approval_conditions
       SET dispatch_cleared = 1, dispatch_cleared_by = ?, dispatch_cleared_at = NOW(),
           dispatch_cleared_note = 'Auto-released: condition met'
       WHERE order_id = ?`,
      [userId, orderId]
    );
    return { autoReleased: true };
  }
  throw createError$1({
    statusCode: 423,
    statusMessage: gate.conditionMet ? "Payment condition met but clearance is manual \u2014 ask accounts to grant it (Payment Watch)" : `Dispatch blocked \u2014 payment clearance pending (${(_a = gate.conditionType) != null ? _a : "manual"}${gate.conditionAmount ? ` \u09F3${gate.conditionAmount.toLocaleString()}` : ""})`
  });
}
async function postGoodsOnBoardInvoice(conn, opts) {
  var _a;
  const { autoReleased } = await assertDispatchClear(conn, opts.orderId, opts.userId);
  const [[already]] = await conn.query(
    `SELECT id FROM customer_ledger
     WHERE reference_type = 'credit_order' AND reference_id = ? AND transaction_type = 'invoice'
     LIMIT 1`,
    [opts.orderId]
  );
  const alreadyPosted = !!already;
  if (!already) {
    const postDate = (_a = opts.postDate) != null ? _a : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    let jeId = null;
    const arId = await getGLAccountId(conn, "Accounts Receivable");
    const revId = await getCreditRevenueAccountId(conn, opts.orderId);
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
    [balanceAfter, opts.customerId]
    // signed: negative = customer holds an advance / credit
  );
  return res.insertId;
}
async function nextDocNumber(conn, prefix, table, column, onDate) {
  const [[row]] = await conn.query(`SELECT DATE_FORMAT(COALESCE(?, CURDATE()), '%Y%m%d') AS d`, [onDate != null ? onDate : null]);
  const datePart = row.d;
  const [[last]] = await conn.query(
    `SELECT MAX(CAST(SUBSTRING_INDEX(\`${column}\`, '-', -1) AS UNSIGNED)) AS maxSeq
     FROM \`${table}\` WHERE \`${column}\` LIKE ?`,
    [`${prefix}-${datePart}-%`]
  );
  const nextSeq = (Number(last == null ? void 0 : last.maxSeq) || 0) + 1;
  return `${prefix}-${datePart}-${String(nextSeq).padStart(4, "0")}`;
}
async function getUserBranchIds(conn, userId, role) {
  var _a, _b;
  if (isAdminRole(role)) return null;
  try {
    const [[row]] = await conn.query(`SELECT data_scope, allowed_branches FROM user_permissions WHERE user_id = ?`, [userId]);
    if (row) {
      if (row.data_scope === "all") return null;
      if (row.data_scope === "branch") {
        let slugs = [];
        try {
          slugs = JSON.parse((_a = row.allowed_branches) != null ? _a : "[]");
        } catch {
        }
        slugs = slugs.map((x) => String(x).toLowerCase()).filter(Boolean);
        if (slugs.length) {
          const [rows] = await conn.query(`SELECT id FROM branches WHERE LOWER(code) IN (?) OR LOWER(name) IN (?)`, [slugs, slugs]);
          if (rows.length) return rows.map((r) => Number(r.id));
        }
      }
    }
  } catch {
  }
  const suffixed = (_b = /-(srg|demra)$/.exec(role)) == null ? void 0 : _b[1];
  const [[emp]] = await conn.query(`SELECT branch_id FROM employees WHERE user_id = ? LIMIT 1`, [userId]);
  if ((emp == null ? void 0 : emp.branch_id) && (suffixed || !ACCOUNTS_ROLES.includes(role))) return [Number(emp.branch_id)];
  if (suffixed) {
    const [[br]] = await conn.query(`SELECT id FROM branches WHERE LOWER(code) = ? LIMIT 1`, [suffixed]);
    if (br) return [Number(br.id)];
  }
  return null;
}
async function getUserBranchScope(conn, userId, role) {
  var _a;
  const ids = await getUserBranchIds(conn, userId, role);
  return (ids == null ? void 0 : ids.length) ? (_a = ids[0]) != null ? _a : null : null;
}
async function generateDeliverySlipNumber(conn, branchId, date) {
  var _a;
  const d = date ? new Date(date) : /* @__PURE__ */ new Date();
  const [[branch]] = await conn.query(`SELECT name, delivery_slip_prefix FROM branches WHERE id = ?`, [branchId != null ? branchId : 0]);
  let code = (branch == null ? void 0 : branch.delivery_slip_prefix) || "";
  if (!code) {
    const letters = String((_a = branch == null ? void 0 : branch.name) != null ? _a : "BRN").replace(/[^A-Za-z]/g, "");
    code = (letters || "BRN").slice(0, 3).toUpperCase();
    if (branch) await conn.query(`UPDATE branches SET delivery_slip_prefix = ? WHERE id = ? AND (delivery_slip_prefix IS NULL OR delivery_slip_prefix = '')`, [code, branchId]);
  }
  const prefix = `${code}-${d.getFullYear()}-${d.getMonth() + 1}-`;
  const maxOf = async (table) => {
    var _a2;
    const [[r]] = await conn.query(
      `SELECT MAX(CAST(SUBSTRING_INDEX(delivery_slip_number, '-', -1) AS UNSIGNED)) m FROM ${table} WHERE delivery_slip_number LIKE ?`,
      [prefix + "%"]
    );
    return Number((_a2 = r == null ? void 0 : r.m) != null ? _a2 : 0);
  };
  const seq = Math.max(await maxOf("credit_order_shipping"), await maxOf("credit_order_deliveries")) + 1;
  return prefix + String(seq).padStart(3, "0");
}
async function transitionOrder(conn, o) {
  var _a;
  if (o.to !== o.from)
    await conn.query(`UPDATE credit_orders SET status = ?, updated_at = NOW() WHERE id = ?`, [o.to, o.orderId]);
  await conn.query(
    `INSERT INTO credit_order_workflow (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
     VALUES (?, ?, ?, ?, ?, ?, NOW())`,
    [o.orderId, o.from, o.to, (_a = o.action) != null ? _a : o.to, o.userId, o.comment || null]
  );
}
async function branchScopeFor(event, col) {
  var _a, _b;
  const session = await getUserSession(event);
  if (!((_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id)) return { sql: "", params: [] };
  const conn = await getDb().getConnection();
  try {
    const ids = await getUserBranchIds(conn, Number(session.user.id), String((_b = session.user.role) != null ? _b : "").toLowerCase());
    return ids ? { sql: ` AND ${col} IN (?)`, params: [ids] } : { sql: "", params: [] };
  } finally {
    conn.release();
  }
}
async function getCreditRevenueAccountId(conn, orderId) {
  var _a, _b;
  const [[def]] = await conn.query(
    `SELECT id FROM chart_of_accounts WHERE account_type = 'Revenue' AND branch_id IS NULL
       AND (LOWER(name) LIKE '%credit%' OR LOWER(description) LIKE '%credit%') ORDER BY id ASC LIMIT 1`
  );
  let id = (_a = def == null ? void 0 : def.id) != null ? _a : null;
  if (!id) {
    const [[fb]] = await conn.query(
      `SELECT id FROM chart_of_accounts WHERE account_type = 'Revenue' AND branch_id IS NULL AND LOWER(name) NOT LIKE '%pos%' ORDER BY id ASC LIMIT 1`
    );
    id = (_b = fb == null ? void 0 : fb.id) != null ? _b : null;
  }
  const [[o]] = await conn.query(`SELECT assigned_branch_id FROM credit_orders WHERE id = ?`, [orderId]);
  if (o == null ? void 0 : o.assigned_branch_id) {
    const [[br]] = await conn.query(
      `SELECT id FROM chart_of_accounts WHERE account_type = 'Revenue' AND branch_id = ?
         AND (LOWER(name) LIKE '%credit%' OR LOWER(description) LIKE '%credit%') AND LOWER(name) NOT LIKE '%pos%' ORDER BY id ASC LIMIT 1`,
      [o.assigned_branch_id]
    );
    if (br == null ? void 0 : br.id) id = br.id;
  }
  return id != null ? id : await getGLAccountId(conn, "Revenue");
}

const DISPATCHED_STATUSES = ["goods_on_board", "shipped", "dispatched", "delivered", "completed"];
const OPEN_STATUSES = ["pending_approval", "escalated", "approved", "in_production", "produced", "ready_to_ship", ...DISPATCHED_STATUSES.filter((s) => s !== "completed")];
const NATIVE_FROM = 1e6;
const r2 = (n) => Math.round(n * 100) / 100;
async function getAdvanceCredit(conn, customerId, lock = false) {
  var _a, _b;
  const [pays] = await conn.query(
    `SELECT p.id, p.payment_number, p.payment_date, p.amount, p.payment_method,
            COALESCE((SELECT SUM(a.allocated_amount) FROM payment_allocations a
                      WHERE a.payment_id = p.id AND a.released_at IS NULL), 0) AS alloc
     FROM customer_payments p
     WHERE p.customer_id = ? AND p.reversed_at IS NULL AND p.order_id IS NULL
       AND (p.payment_type = 'advance' OR p.id >= ?)
       AND COALESCE(p.payment_type, '') <> 'refund'
     ORDER BY p.payment_date ASC, p.id ASC ${lock ? "FOR UPDATE" : ""}`,
    [customerId, NATIVE_FROM]
  );
  const payments = pays.map((p) => ({
    id: Number(p.id),
    payment_number: p.payment_number,
    payment_date: String(p.payment_date).slice(0, 10),
    amount: Number(p.amount),
    method: p.payment_method,
    remaining: r2(Number(p.amount) - Number(p.alloc)),
    legacy: Number(p.id) < NATIVE_FROM
  })).filter((p) => p.remaining > 5e-3);
  const [orders] = await conn.query(
    `SELECT id, order_number, order_date, status, total_amount, balance_due FROM credit_orders
     WHERE customer_id = ? AND status IN (${OPEN_STATUSES.map(() => "?").join(",")}) AND balance_due > 0.005
     ORDER BY order_date ASC, id ASC`,
    [customerId, ...OPEN_STATUSES]
  );
  const openOrders = orders.map((o) => ({
    id: Number(o.id),
    order_number: o.order_number,
    order_date: String(o.order_date).slice(0, 10),
    status: o.status,
    total_amount: Number(o.total_amount),
    balance_due: Number(o.balance_due)
  }));
  const [[cust]] = await conn.query(`SELECT initial_due FROM customers WHERE id = ?`, [customerId]);
  const [[set]] = await conn.query(
    `SELECT COALESCE(SUM(a.allocated_amount), 0) s FROM payment_allocations a
     JOIN customer_payments p ON p.id = a.payment_id
     WHERE p.customer_id = ? AND a.target = 'opening' AND a.released_at IS NULL`,
    [customerId]
  );
  const openingDue = Math.max(0, r2(Number((_a = cust == null ? void 0 : cust.initial_due) != null ? _a : 0) - Number((_b = set == null ? void 0 : set.s) != null ? _b : 0)));
  return {
    payments,
    openOrders,
    openingDue,
    total: r2(payments.reduce((s, p) => s + p.remaining, 0))
  };
}
function suggestAllotment(credit, strategy = "orders_first", opts = {}) {
  const pays = credit.payments.filter((p) => !(opts.onlyNative && p.legacy)).map((p) => ({ ...p }));
  const orders = credit.openOrders.filter((o) => !opts.onlyOrderId || o.id === opts.onlyOrderId).map((o) => ({ ...o }));
  let opening = opts.onlyOrderId ? 0 : credit.openingDue;
  const out = [];
  const targets = [];
  const orderT = orders.map((o) => ({ kind: "order", o }));
  if (strategy === "opening_first") {
    if (opening > 0) targets.push({ kind: "opening" });
    targets.push(...orderT);
  } else {
    targets.push(...orderT);
    if (opening > 0) targets.push({ kind: "opening" });
  }
  for (const t of targets) {
    for (const p of pays) {
      if (p.remaining <= 5e-3) continue;
      const need = t.kind === "order" ? t.o.balance_due : opening;
      if (need <= 5e-3) break;
      const amt = r2(Math.min(p.remaining, need));
      if (t.kind === "order") {
        t.o.balance_due = r2(t.o.balance_due - amt);
        out.push({ payment_id: p.id, target: "order", order_id: t.o.id, amount: amt });
      } else {
        opening = r2(opening - amt);
        out.push({ payment_id: p.id, target: "opening", amount: amt });
      }
      p.remaining = r2(p.remaining - amt);
    }
  }
  return out;
}
async function applyAllotment(conn, customerId, userId, allots, note = "") {
  var _a, _b;
  if (!allots.length) return { applied: 0, total: 0, autoReleased: [] };
  await conn.query(`SELECT id FROM customers WHERE id = ? FOR UPDATE`, [customerId]);
  const credit = await getAdvanceCredit(conn, customerId, true);
  const remain = new Map(credit.payments.map((p) => [p.id, p.remaining]));
  const payNo = new Map(credit.payments.map((p) => [p.id, p.payment_number]));
  let opening = credit.openingDue;
  const autoReleased = [];
  let total = 0;
  for (const a of allots) {
    const amt = r2(Number(a.amount));
    if (!(amt > 0)) continue;
    const left = remain.get(a.payment_id);
    if (left === void 0) throw createError$1({ statusCode: 400, statusMessage: `Payment ${a.payment_id} has no advance credit available` });
    if (amt > left + 5e-3) throw createError$1({ statusCode: 400, statusMessage: `${payNo.get(a.payment_id)} has only \u09F3${left.toLocaleString()} left to allot` });
    remain.set(a.payment_id, r2(left - amt));
    if (a.target === "opening") {
      if (amt > opening + 5e-3) throw createError$1({ statusCode: 400, statusMessage: `Only \u09F3${opening.toLocaleString()} of opening due is left to settle` });
      opening = r2(opening - amt);
      await conn.query(
        `INSERT INTO payment_allocations (payment_id, order_id, allocated_amount, as_advance, target, allocated_by_user_id)
         VALUES (?, 0, ?, 0, 'opening', ?)`,
        [a.payment_id, amt, userId]
      );
    } else {
      const [[o]] = await conn.query(
        `SELECT id, order_number, customer_id, status, total_amount, amount_paid, advance_paid, balance_due
         FROM credit_orders WHERE id = ? FOR UPDATE`,
        [a.order_id]
      );
      if (!o || Number(o.customer_id) !== customerId)
        throw createError$1({ statusCode: 400, statusMessage: `Order ${a.order_id} does not belong to this customer` });
      if (["cancelled", "rejected", "draft"].includes(o.status))
        throw createError$1({ statusCode: 400, statusMessage: `${o.order_number} is ${o.status} \u2014 it cannot take payment` });
      if (amt > Number(o.balance_due) + 5e-3)
        throw createError$1({ statusCode: 400, statusMessage: `${o.order_number} only owes \u09F3${Number(o.balance_due).toLocaleString()}` });
      const asAdvance = !DISPATCHED_STATUSES.includes(o.status);
      const newPaid = Number((_a = o.amount_paid) != null ? _a : 0) + (asAdvance ? 0 : amt);
      const newAdv = Number((_b = o.advance_paid) != null ? _b : 0) + (asAdvance ? amt : 0);
      const newBal = Math.max(0, r2(Number(o.total_amount) - newPaid - newAdv));
      const nowComplete = newBal === 0 && o.status === "delivered";
      await conn.query(
        `INSERT INTO payment_allocations (payment_id, order_id, allocated_amount, as_advance, target, allocated_by_user_id)
         VALUES (?, ?, ?, ?, 'order', ?)`,
        [a.payment_id, o.id, amt, asAdvance ? 1 : 0, userId]
      );
      await conn.query(
        `UPDATE credit_orders SET amount_paid = ?, advance_paid = ?, balance_due = ?, status = ?, updated_at = NOW() WHERE id = ?`,
        [newPaid, newAdv, newBal, nowComplete ? "completed" : o.status, o.id]
      );
      await conn.query(
        `INSERT INTO credit_order_workflow (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          o.id,
          o.status,
          nowComplete ? "completed" : o.status,
          nowComplete ? "completed" : "advance_allotted",
          userId,
          `${payNo.get(a.payment_id)} \u2014 \u09F3${amt.toLocaleString()} of earlier advance allotted${asAdvance ? " as ADVANCE" : ""}${note ? ` (${note})` : ""}`
        ]
      );
      const gate = await getOrderGateState(conn, o.id);
      if (gate.dispatchHold && !gate.dispatchCleared && gate.autoRelease && gate.conditionMet) {
        await conn.query(
          `UPDATE order_approval_conditions SET dispatch_cleared = 1, dispatch_cleared_by = ?, dispatch_cleared_at = NOW(),
             dispatch_cleared_note = ? WHERE order_id = ?`,
          [userId, `Auto-released \u2014 advance ${payNo.get(a.payment_id)} satisfied ${gate.conditionType}`, o.id]
        );
        autoReleased.push(o.order_number);
      }
    }
    total += amt;
    await syncPaymentAllocation(conn, a.payment_id);
  }
  return { applied: allots.length, total: r2(total), autoReleased };
}
async function syncPaymentAllocation(conn, paymentId) {
  const [[p]] = await conn.query(
    `SELECT amount, COALESCE((SELECT SUM(allocated_amount) FROM payment_allocations WHERE payment_id = ? AND released_at IS NULL), 0) alloc
     FROM customer_payments WHERE id = ?`,
    [paymentId, paymentId]
  );
  if (!p) return;
  const alloc = Number(p.alloc), amt = Number(p.amount);
  await conn.query(
    `UPDATE customer_payments SET allocated_amount = ?, allocation_status = ? WHERE id = ?`,
    [alloc, alloc >= amt - 5e-3 ? "allocated" : alloc > 0 ? "partial" : "unallocated", paymentId]
  );
}
async function releaseOrderPayments(conn, orderId, userId, orderNumber) {
  let released = 0;
  const [direct] = await conn.query(
    `SELECT id, payment_number, amount FROM customer_payments WHERE order_id = ? AND reversed_at IS NULL`,
    [orderId]
  );
  for (const p of direct) {
    await conn.query(
      `UPDATE customer_payments SET order_id = NULL, allocated_amount = 0, allocation_status = 'unallocated',
         notes = CONCAT(COALESCE(notes, ''), ?) WHERE id = ?`,
      [` | released from cancelled ${orderNumber}`, p.id]
    );
    released += Number(p.amount);
  }
  const [allocs] = await conn.query(
    `SELECT id, payment_id, allocated_amount FROM payment_allocations WHERE order_id = ? AND target = 'order' AND released_at IS NULL`,
    [orderId]
  );
  for (const a of allocs) {
    await conn.query(`UPDATE payment_allocations SET released_at = NOW() WHERE id = ?`, [a.id]);
    await syncPaymentAllocation(conn, a.payment_id);
    released += Number(a.allocated_amount);
  }
  if (released > 0) {
    await conn.query(`UPDATE credit_orders SET advance_paid = 0, amount_paid = 0, balance_due = total_amount, updated_at = NOW() WHERE id = ?`, [orderId]);
    await conn.query(
      `INSERT INTO credit_order_workflow (order_id, from_status, to_status, action, performed_by_user_id, comments, performed_at)
       SELECT id, status, status, 'advance_released', ?, ?, NOW() FROM credit_orders WHERE id = ?`,
      [userId, `\u09F3${released.toLocaleString()} received on this order was released back to the customer's advance credit`, orderId]
    );
  }
  return Math.round(released * 100) / 100;
}

const AMD_PRE_STATUSES = ["pending_approval", "escalated", "approved", "in_production", "produced", "ready_to_ship"];
const AMD_POST_STATUSES = ["goods_on_board", "shipped", "dispatched", "delivered", "completed"];
async function applyAmendment(conn, opts) {
  var _a, _b;
  const { order, regime, newValues, amdNo, userId } = opts;
  let flatAmount = opts.flatAmount;
  if (regime === "pre") {
    const [[fresh]] = await conn.query(
      `SELECT status, advance_paid, amount_paid FROM credit_orders WHERE id = ? FOR UPDATE`,
      [order.id]
    );
    if (!AMD_PRE_STATUSES.includes(fresh.status))
      throw createError$1({ statusCode: 409, statusMessage: "Order was dispatched after this amendment was requested \u2014 use a post-dispatch amendment instead" });
    const { newSub, delta } = await applyItemGrid(conn, order.id, newValues.items, amdNo, opts.reason, userId, "pre");
    const [[cur]] = await conn.query(`SELECT total_amount FROM credit_orders WHERE id = ?`, [order.id]);
    const newTotal = Math.round((Number(cur.total_amount) + delta) * 100) / 100;
    const newBalance = Math.max(0, newTotal - Number((_a = fresh.advance_paid) != null ? _a : 0) - Number((_b = fresh.amount_paid) != null ? _b : 0));
    await conn.query(
      `UPDATE credit_orders SET subtotal = ?, total_amount = ?, balance_due = ?, updated_at = NOW()
       WHERE id = ?`,
      [newSub, newTotal, newBalance, order.id]
    );
    return;
  }
  let itemSub = null;
  if (Array.isArray(newValues == null ? void 0 : newValues.items) && newValues.items.length) {
    const g = await applyItemGrid(conn, order.id, newValues.items, amdNo, opts.reason, userId, "post");
    itemSub = g.newSub;
    flatAmount = g.delta;
  }
  const amt = Number(flatAmount);
  const abs = Math.abs(amt);
  const date = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const arId = await getGLAccountId(conn, "Accounts Receivable");
  const revId = await getCreditRevenueAccountId(conn, order.id);
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
     SET subtotal     = COALESCE(?, subtotal),
         total_amount = GREATEST(0, total_amount + ?),
         balance_due  = GREATEST(0, balance_due + ?),
         updated_at   = NOW()
     WHERE id = ?`,
    [itemSub, amt, amt, order.id]
  );
}
async function applyItemGrid(conn, orderId, grid, amdNo, reason, userId, regime) {
  var _a, _b, _c, _d;
  const [oldItems] = await conn.query(
    `SELECT id, product_id, variant_id, quantity, unit_price, discount_amount, line_total FROM credit_order_items WHERE order_id = ?`,
    [orderId]
  );
  const byId = new Map(oldItems.map((i) => [Number(i.id), i]));
  const oldSub = oldItems.reduce((s, i) => s + Number(i.line_total), 0);
  const note = `Amendment ${amdNo}${reason ? `: ${reason}` : ""}`.slice(0, 500);
  const keep = /* @__PURE__ */ new Set();
  let newSub = 0;
  for (const it of grid) {
    const qty = Number(it.quantity), price = Number(it.unit_price), disc = Number((_a = it.discount_amount) != null ? _a : 0);
    const lineTotal = Math.round((qty * price - disc) * 100) / 100;
    newSub += lineTotal;
    const old = it.item_id ? byId.get(Number(it.item_id)) : null;
    if (it.item_id && !old)
      throw createError$1({ statusCode: 409, statusMessage: "An order line changed since this amendment was requested \u2014 please redo it" });
    if (!old) {
      if (regime === "post") throw createError$1({ statusCode: 400, statusMessage: "Lines cannot be added after dispatch" });
      await conn.query(
        `INSERT INTO credit_order_items (order_id, product_id, variant_id, quantity, unit_price, discount_amount, line_total)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orderId, it.product_id, (_b = it.variant_id) != null ? _b : null, qty, price, disc, lineTotal]
      );
      continue;
    }
    keep.add(Number(old.id));
    if (regime === "post") {
      const [[d]] = await conn.query(
        `SELECT COALESCE(SUM(qty_delivered),0) q FROM credit_order_delivery_items WHERE order_item_id = ?`,
        [old.id]
      );
      if (qty < Number(d.q))
        throw createError$1({ statusCode: 400, statusMessage: `Quantity cannot go below what is already delivered (${Number(d.q)})` });
    }
    const newProduct = it.product_id != null ? Number(it.product_id) : Number(old.product_id);
    const newVariant = it.variant_id != null ? Number(it.variant_id) : old.variant_id != null ? Number(old.variant_id) : null;
    const productChanged = newProduct !== Number(old.product_id) || (newVariant != null ? newVariant : 0) !== Number((_c = old.variant_id) != null ? _c : 0);
    if (productChanged) {
      for (const t of ["credit_order_delivery_items", "credit_order_return_items", "credit_order_over_delivery_items"]) {
        const [[ref]] = await conn.query(`SELECT COUNT(*) c FROM ${t} WHERE order_item_id = ?`, [old.id]);
        if (Number(ref.c) > 0)
          throw createError$1({ statusCode: 409, statusMessage: "This line already has a delivery / return / over-delivery recorded \u2014 its product cannot be changed. Record a return for it and raise a new order for the correct product." });
      }
      if (newVariant != null) {
        const [[v]] = await conn.query(`SELECT id FROM product_variants WHERE id = ? AND product_id = ?`, [newVariant, newProduct]);
        if (!v) throw createError$1({ statusCode: 400, statusMessage: "The chosen variant does not belong to the chosen product" });
      }
      await conn.query(`UPDATE credit_order_items SET product_id = ?, variant_id = ? WHERE id = ?`, [newProduct, newVariant, old.id]);
    }
    await conn.query(
      `UPDATE credit_order_items SET quantity = ?, unit_price = ?, discount_amount = ?, line_total = ? WHERE id = ?`,
      [qty, price, disc, lineTotal, old.id]
    );
    if (Math.abs(Number(old.unit_price) - price) > 4e-3) {
      await conn.query(
        `INSERT INTO credit_order_price_revisions
           (order_id, order_item_id, product_id, variant_id, quantity, old_unit_price, new_unit_price, reason, changed_by_user_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, old.id, old.product_id, (_d = old.variant_id) != null ? _d : null, qty, Number(old.unit_price), price, note, userId]
      );
    }
  }
  if (regime === "post" && keep.size !== byId.size)
    throw createError$1({ statusCode: 400, statusMessage: "Lines cannot be removed after dispatch" });
  for (const [oid] of byId) if (!keep.has(oid)) await conn.query(`DELETE FROM credit_order_items WHERE id = ?`, [oid]);
  newSub = Math.round(newSub * 100) / 100;
  return { newSub, delta: Math.round((newSub - oldSub) * 100) / 100 };
}

const APP_SETTING_GROUPS = {
  company_profile: {
    name: "Ujjal Flour Mills Co.",
    tradeName: "Ujjal FMC",
    regNo: "TL-SRG-2018-4821",
    tin: "",
    bin: "002148694",
    address: "Sirajgonj Sadar, Sirajgonj-6700 \xB7 Demra, Dhaka-1361",
    phone: "+880 1711-000000",
    email: "accounts@ujjalfmc.com"
  },
  finance_settings: { fyStart: 7, defaultCreditLimit: 0, defaultPaymentTerms: 30, lateRate: 0, grnValueBasis: "expected" },
  // grnValueBasis: how a goods-received note is valued by default — 'expected' (billed qty) or 'received' (weighed qty)
  order_policy: { auto_approve: false, allow_partial: true, block_overdue: false },
  security_policy: { sessionTimeout: 0, maxLoginAttempts: 5 },
  notify_policy: { telegram: true },
  backup_policy: { enabled: true }
  // scheduled DB backups (scripts/server-backup.sh reads this row); Admin → Settings → Maintenance
};
let cache$1 = null;
async function getAppSettings(fresh = false) {
  if (!fresh && cache$1 && Date.now() - cache$1.at < 15e3) return cache$1.value;
  const out = {};
  for (const [k, d] of Object.entries(APP_SETTING_GROUPS)) out[k] = { ...d };
  try {
    const rows = await query(
      `SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN (${Object.keys(APP_SETTING_GROUPS).map(() => "?").join(",")})`,
      Object.keys(APP_SETTING_GROUPS)
    );
    for (const r of rows) {
      try {
        out[r.setting_key] = { ...out[r.setting_key], ...JSON.parse(r.setting_value) };
      } catch {
      }
    }
  } catch {
  }
  cache$1 = { at: Date.now(), value: out };
  return out;
}
function resetAppSettingsCache() {
  cache$1 = null;
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

const M = (key, label, sum = true) => ({ key, label, fmt: "money", sum });
const T = (key, label) => ({ key, label });
const live = "cp.reversed_at IS NULL";
const day = (v) => v ? String(v).slice(0, 10) : "";
const REPORT_TYPES = {
  completed_sales: "Completed Sales",
  receivables: "Receivables",
  customer_wise: "Customer-wise Summary",
  collections: "Collections",
  products_sold: "Products Sold",
  user_actions: "User-wise Actions",
  expenses: "Expenses",
  amendments: "Modifications & Amendments",
  transports: "Transports",
  exceptions: "Exceptions & Corrections",
  daily_reconciliation: "Day-wise Reconciliation",
  purchase_orders: "Purchase Orders",
  goods_received: "Goods Received (GRN)",
  supplier_payments: "Supplier Payments"
};
async function buildChairmanReport(type, p) {
  const bco = p.branch ? ` AND co.assigned_branch_id = ${Number(p.branch)}` : "";
  const bev = p.branch ? ` AND ev.branch_id = ${Number(p.branch)}` : "";
  switch (type) {
    case "completed_sales": {
      const rows = await query(
        `SELECT COALESCE(DATE(cos.delivered_date), co.order_date) AS date, co.order_number, c.name AS customer, b.name AS factory,
                p.base_name AS product, COALESCE(pv.weight_variant,'') AS variant, coi.quantity AS qty, coi.unit_price AS price, coi.line_total AS line_total,
                co.total_amount AS order_total, co.amount_paid AS paid, co.balance_due AS due, cos.truck_number AS truck, cos.driver_name AS driver
         FROM credit_orders co JOIN customers c ON c.id = co.customer_id
         LEFT JOIN branches b ON b.id = co.assigned_branch_id LEFT JOIN credit_order_shipping cos ON cos.order_id = co.id
         JOIN credit_order_items coi ON coi.order_id = co.id JOIN products p ON p.id = coi.product_id LEFT JOIN product_variants pv ON pv.id = coi.variant_id
         WHERE co.status = 'delivered' AND COALESCE(DATE(cos.delivered_date), co.order_date) BETWEEN ? AND ? ${bco}
         ORDER BY COALESCE(cos.delivered_date, co.order_date), co.order_number, coi.id`,
        [p.from, p.to]
      );
      const seen = /* @__PURE__ */ new Set();
      return {
        cols: [T("date", "Date"), T("order_number", "Order #"), T("customer", "Customer"), T("factory", "Factory"), T("product", "Product"), T("variant", "Variant"), { key: "qty", label: "Qty", fmt: "qty", sum: true }, M("price", "Unit price \u09F3", false), M("line_total", "Line total \u09F3"), M("order_total", "Order total \u09F3"), M("paid", "Paid \u09F3"), M("due", "Due \u09F3"), T("truck", "Truck"), T("driver", "Driver")],
        rows: rows.map((r) => {
          const first = !seen.has(r.order_number);
          seen.add(r.order_number);
          return { ...r, date: day(r.date), order_total: first ? r.order_total : null, paid: first ? r.paid : null, due: first ? r.due : null };
        })
      };
    }
    case "receivables": {
      const rows = await query(
        `SELECT c.name AS customer, c.credit_limit AS credit_limit,
                SUM(CASE WHEN DATEDIFF(?, co.order_date) BETWEEN 0 AND 30 THEN co.balance_due ELSE 0 END) AS b0,
                SUM(CASE WHEN DATEDIFF(?, co.order_date) BETWEEN 31 AND 60 THEN co.balance_due ELSE 0 END) AS b31,
                SUM(CASE WHEN DATEDIFF(?, co.order_date) BETWEEN 61 AND 90 THEN co.balance_due ELSE 0 END) AS b61,
                SUM(CASE WHEN DATEDIFF(?, co.order_date) > 90 THEN co.balance_due ELSE 0 END) AS b90,
                SUM(co.balance_due) AS total
         FROM customers c JOIN credit_orders co ON co.customer_id = c.id
         WHERE co.balance_due > 0.01 AND co.status NOT IN ('cancelled','rejected','draft') AND c.customer_type = 'Credit' AND c.status = 'active' ${bco}
         GROUP BY c.id HAVING total > 0.01 ORDER BY total DESC`,
        [p.to, p.to, p.to, p.to]
      );
      return {
        cols: [T("customer", "Customer"), M("credit_limit", "Credit limit \u09F3"), M("b0", "0\u201330 d \u09F3"), M("b31", "31\u201360 d \u09F3"), M("b61", "61\u201390 d \u09F3"), M("b90", "90 d+ \u09F3"), M("total", "Total due \u09F3")],
        rows,
        note: `Snapshot as of ${p.to} (end of the selected period); same age buckets as the Ageing Report.`
      };
    }
    case "customer_wise": {
      const rows = await query(
        `SELECT c.name AS customer,
                (SELECT COUNT(*) FROM credit_orders co WHERE co.customer_id = c.id AND co.order_date BETWEEN ? AND ? AND co.status NOT IN ('draft','cancelled','rejected')) AS orders,
                (SELECT COALESCE(SUM(co.total_amount),0) FROM credit_orders co WHERE co.customer_id = c.id AND co.order_date BETWEEN ? AND ? AND co.status NOT IN ('draft','cancelled','rejected')) AS sales,
                (SELECT COALESCE(SUM(cp.amount),0) FROM customer_payments cp WHERE cp.customer_id = c.id AND cp.payment_date BETWEEN ? AND ? AND ${live}) AS collected,
                (SELECT COALESCE(SUM(l.debit_amount - l.credit_amount),0) FROM customer_ledger l WHERE l.customer_id = c.id) AS balance
         FROM customers c WHERE c.customer_type = 'Credit' AND c.status = 'active'
         HAVING orders > 0 OR collected > 0 ORDER BY sales DESC`,
        [p.from, p.to, p.from, p.to, p.from, p.to]
      );
      return {
        cols: [T("customer", "Customer"), { key: "orders", label: "Orders", fmt: "qty", sum: true }, M("sales", "Sales (period) \u09F3"), M("collected", "Collected (period) \u09F3"), M("balance", "Current balance \u09F3")],
        rows,
        note: "Current balance is the live ledger total (same as the Customer Ledger), including activity outside this period."
      };
    }
    case "collections": {
      const rows = await query(
        `SELECT cp.payment_date AS date, cp.payment_number AS payment_no, c.name AS customer, cp.payment_type AS type, cp.payment_method AS method,
                COALESCE(ba.account_name, 'Cash') AS paid_into, cp.cheque_number, cp.reference_number AS reference, cp.amount,
                (SELECT GROUP_CONCAT(co.order_number SEPARATOR ', ') FROM payment_allocations pa JOIN credit_orders co ON co.id = pa.order_id WHERE pa.payment_id = cp.id) AS orders,
                (SELECT COALESCE(SUM(pa.allocated_amount),0) FROM payment_allocations pa WHERE pa.payment_id = cp.id) AS allocated,
                u.display_name AS recorded_by, cp.notes
         FROM customer_payments cp JOIN customers c ON c.id = cp.customer_id LEFT JOIN users u ON u.id = cp.created_by_user_id LEFT JOIN bank_accounts ba ON ba.id = cp.bank_account_id
         WHERE cp.payment_date BETWEEN ? AND ? AND ${live} ORDER BY cp.payment_date, cp.payment_number`,
        [p.from, p.to]
      );
      return {
        cols: [T("date", "Date"), T("payment_no", "Receipt"), T("customer", "Customer"), T("type", "Type"), T("method", "Method"), T("paid_into", "Paid into"), T("cheque_number", "Cheque #"), T("reference", "Reference"), M("amount", "Amount \u09F3"), T("orders", "Applied to orders"), M("allocated", "Applied \u09F3"), T("recorded_by", "Recorded by"), T("notes", "Notes")],
        rows: rows.map((r) => ({ ...r, date: day(r.date) }))
      };
    }
    case "products_sold": {
      const rows = await query(
        `SELECT p.base_name AS product, COALESCE(pv.grade,'') AS grade, COALESCE(pv.weight_variant,'') AS variant, SUM(coi.quantity) AS qty, SUM(coi.line_total) AS revenue
         FROM credit_order_items coi JOIN credit_orders co ON co.id = coi.order_id JOIN products p ON p.id = coi.product_id LEFT JOIN product_variants pv ON pv.id = coi.variant_id
         WHERE co.status = 'delivered' AND co.order_date BETWEEN ? AND ? ${bco} GROUP BY p.id, pv.id ORDER BY revenue DESC`,
        [p.from, p.to]
      );
      return { cols: [T("product", "Product"), T("grade", "Grade"), T("variant", "Variant"), { key: "qty", label: "Quantity", fmt: "qty", sum: true }, M("revenue", "Revenue \u09F3")], rows };
    }
    case "user_actions": {
      const rows = await query(
        `SELECT COALESCE(u.display_name, 'System') AS user, u.role AS role, sal.module AS module, COUNT(*) AS actions, MAX(sal.created_at) AS last_activity
         FROM system_audit_log sal LEFT JOIN users u ON u.id = sal.user_id WHERE DATE(sal.created_at) BETWEEN ? AND ?
         GROUP BY sal.user_id, sal.module ORDER BY u.display_name, actions DESC`,
        [p.from, p.to]
      );
      return { cols: [T("user", "User"), T("role", "Role"), T("module", "Module"), { key: "actions", label: "Actions", fmt: "qty", sum: true }, T("last_activity", "Last activity")], rows: rows.map((r) => {
        var _a;
        return { ...r, last_activity: String((_a = r.last_activity) != null ? _a : "").slice(0, 16) };
      }) };
    }
    case "expenses": {
      const rows = await query(
        `SELECT ev.voucher_number AS voucher, ev.expense_date AS date, ec.category_name AS category, b.name AS branch, ev.status, ap.display_name AS approved_by, ev.total_amount AS amount
         FROM expense_vouchers ev LEFT JOIN expense_categories ec ON ec.id = ev.category_id LEFT JOIN branches b ON b.id = ev.branch_id LEFT JOIN users ap ON ap.id = ev.approved_by_user_id
         WHERE ev.expense_date BETWEEN ? AND ? AND ev.status <> 'cancelled' ${bev} ORDER BY ev.expense_date, ev.voucher_number`,
        [p.from, p.to]
      );
      return { cols: [T("voucher", "Voucher #"), T("date", "Date"), T("category", "Category"), T("branch", "Branch"), T("status", "Status"), T("approved_by", "Approved by"), M("amount", "Amount \u09F3")], rows: rows.map((r) => ({ ...r, date: day(r.date) })) };
    }
    case "amendments": {
      const a = await query(
        `SELECT oa.created_at AS at, 'Amendment' AS kind, co.order_number AS order_no, oa.amend_type AS detail, COALESCE(oa.flat_amount,0) AS amount, oa.description AS reason, u.display_name AS by_whom
         FROM order_amendments oa JOIN credit_orders co ON co.id = oa.order_id LEFT JOIN users u ON u.id = oa.requested_by
         WHERE DATE(oa.created_at) BETWEEN ? AND ? AND oa.status = 'approved'`,
        [p.from, p.to]
      );
      const r = await query(
        `SELECT pr.created_at AS at, 'Price change' AS kind, co.order_number AS order_no, CONCAT(COALESCE(p.base_name,''), ': ', pr.old_unit_price, ' \u2192 ', pr.new_unit_price) AS detail,
                (pr.new_unit_price - pr.old_unit_price) * pr.quantity AS amount, pr.reason AS reason, u.display_name AS by_whom
         FROM credit_order_price_revisions pr JOIN credit_orders co ON co.id = pr.order_id LEFT JOIN products p ON p.id = pr.product_id LEFT JOIN users u ON u.id = pr.changed_by_user_id
         WHERE DATE(pr.created_at) BETWEEN ? AND ?`,
        [p.from, p.to]
      );
      const rows = [...a, ...r].sort((x, y) => String(x.at).localeCompare(String(y.at))).map((x) => ({ ...x, at: String(x.at).slice(0, 16) }));
      return { cols: [T("at", "Date"), T("kind", "Type"), T("order_no", "Order #"), T("detail", "Detail"), M("amount", "Amount / change \u09F3"), T("reason", "Reason"), T("by_whom", "By")], rows };
    }
    case "transports": {
      const rows = await query(
        `SELECT co.order_number AS order_no, cos.truck_number AS truck, cos.driver_name AS driver, c.name AS customer, cos.shipped_date AS shipped, cos.delivered_date AS delivered, co.total_amount AS value
         FROM credit_order_shipping cos JOIN credit_orders co ON co.id = cos.order_id JOIN customers c ON c.id = co.customer_id
         WHERE cos.shipped_date IS NOT NULL AND DATE(cos.shipped_date) BETWEEN ? AND ? ${bco} ORDER BY cos.shipped_date`,
        [p.from, p.to]
      );
      return {
        cols: [T("order_no", "Order #"), T("truck", "Truck"), T("driver", "Driver"), T("customer", "Customer"), T("shipped", "Shipped"), T("delivered", "Delivered"), M("value", "Value \u09F3")],
        rows: rows.map((r) => {
          var _a, _b;
          return { ...r, shipped: String((_a = r.shipped) != null ? _a : "").slice(0, 16), delivered: String((_b = r.delivered) != null ? _b : "").slice(0, 16) };
        })
      };
    }
    case "exceptions": {
      const a = await query(
        `SELECT r.reconciled_at AS at, 'Balance reconciliation' AS kind, c.name AS subject, CONCAT('\u09F3', r.old_balance, ' \u2192 \u09F3', r.new_balance) AS what, r.status AS status, u.display_name AS by_whom
         FROM customer_balance_reconciliations r JOIN customers c ON c.id = r.customer_id LEFT JOIN users u ON u.id = r.reconciled_by_user_id WHERE DATE(r.reconciled_at) BETWEEN ? AND ?`,
        [p.from, p.to]
      );
      const w = await query(
        `SELECT w.performed_at AS at, 'Admin correction' AS kind, co.order_number AS subject, w.comments AS what, w.action AS status, u.display_name AS by_whom
         FROM credit_order_workflow w JOIN credit_orders co ON co.id = w.order_id LEFT JOIN users u ON u.id = w.performed_by_user_id
         WHERE w.action IN ('admin_correction','admin_override') AND DATE(w.performed_at) BETWEEN ? AND ?`,
        [p.from, p.to]
      );
      const rows = [...a, ...w].sort((x, y) => String(x.at).localeCompare(String(y.at))).map((x) => ({ ...x, at: String(x.at).slice(0, 16) }));
      return { cols: [T("at", "Date"), T("kind", "Type"), T("subject", "Subject"), T("what", "What changed"), T("status", "Status"), T("by_whom", "By")], rows };
    }
    case "daily_reconciliation": {
      const g = async (sql) => new Map((await query(sql, [p.from, p.to])).map((r) => [String(r.d).slice(0, 10), Number(r.v)]));
      const [created, approved, produced, shipped, delivered, sales, collected, expensed] = await Promise.all([
        g(`SELECT DATE(order_date) d, COUNT(*) v FROM credit_orders WHERE order_date BETWEEN ? AND ? GROUP BY d`),
        g(`SELECT DATE(performed_at) d, COUNT(*) v FROM credit_order_workflow WHERE action = 'approved' AND DATE(performed_at) BETWEEN ? AND ? GROUP BY d`),
        g(`SELECT DATE(performed_at) d, COUNT(*) v FROM credit_order_workflow WHERE action = 'complete_production' AND DATE(performed_at) BETWEEN ? AND ? GROUP BY d`),
        g(`SELECT DATE(performed_at) d, COUNT(*) v FROM credit_order_workflow WHERE action IN ('goods_on_board','ship','shipped') AND DATE(performed_at) BETWEEN ? AND ? GROUP BY d`),
        g(`SELECT DATE(performed_at) d, COUNT(*) v FROM credit_order_workflow WHERE to_status = 'delivered' AND (from_status IS NULL OR from_status <> to_status) AND DATE(performed_at) BETWEEN ? AND ? GROUP BY d`),
        g(`SELECT DATE(order_date) d, SUM(total_amount) v FROM credit_orders WHERE status NOT IN ('draft','cancelled','rejected') AND order_date BETWEEN ? AND ? GROUP BY d`),
        g(`SELECT DATE(payment_date) d, SUM(amount) v FROM customer_payments WHERE reversed_at IS NULL AND payment_date BETWEEN ? AND ? GROUP BY d`),
        g(`SELECT DATE(expense_date) d, SUM(total_amount) v FROM expense_vouchers WHERE status = 'approved' AND expense_date BETWEEN ? AND ? GROUP BY d`)
      ]);
      const days = /* @__PURE__ */ new Set([...created.keys(), ...approved.keys(), ...produced.keys(), ...shipped.keys(), ...delivered.keys(), ...sales.keys(), ...collected.keys(), ...expensed.keys()]);
      const rows = [...days].sort().map((d) => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return { date: d, created: (_a = created.get(d)) != null ? _a : 0, approved: (_b = approved.get(d)) != null ? _b : 0, produced: (_c = produced.get(d)) != null ? _c : 0, shipped: (_d = shipped.get(d)) != null ? _d : 0, delivered: (_e = delivered.get(d)) != null ? _e : 0, sales: (_f = sales.get(d)) != null ? _f : 0, collected: (_g = collected.get(d)) != null ? _g : 0, expenses: (_h = expensed.get(d)) != null ? _h : 0 };
      });
      const Q = (k, l) => ({ key: k, label: l, fmt: "qty", sum: true });
      return { cols: [T("date", "Date"), Q("created", "Created"), Q("approved", "Approved"), Q("produced", "Produced"), Q("shipped", "Shipped"), Q("delivered", "Delivered"), M("sales", "Sales \u09F3"), M("collected", "Collected \u09F3"), M("expenses", "Expenses \u09F3")], rows };
    }
    case "purchase_orders": {
      const rows = await query(
        `SELECT po.po_number AS po, po.po_date AS date, po.supplier_name AS supplier, pc.name AS commodity, po.wheat_origin AS origin, po.quantity_kg AS qty_kg, po.unit_price_per_kg AS rate,
                po.total_order_value AS value, po.total_received_qty AS received_kg, po.total_paid AS paid, po.delivery_status AS delivery, po.payment_status AS payment, u.display_name AS created_by
         FROM purchase_orders_adnan po LEFT JOIN purchase_commodities pc ON pc.id = po.commodity_id LEFT JOIN users u ON u.id = po.created_by_user_id
         WHERE po.po_date BETWEEN ? AND ? ORDER BY po.po_date, po.po_number`,
        [p.from, p.to]
      );
      return { cols: [T("po", "PO #"), T("date", "Date"), T("supplier", "Supplier"), T("commodity", "Commodity"), T("origin", "Origin"), { key: "qty_kg", label: "Ordered kg", fmt: "qty", sum: true }, M("rate", "Rate \u09F3/kg", false), M("value", "Value \u09F3"), { key: "received_kg", label: "Received kg", fmt: "qty", sum: true }, M("paid", "Paid \u09F3"), T("delivery", "Delivery"), T("payment", "Payment"), T("created_by", "Created by")], rows: rows.map((r) => ({ ...r, date: day(r.date) })) };
    }
    case "goods_received": {
      const rows = await query(
        `SELECT g.grn_number AS grn, g.grn_date AS date, g.po_number AS po, g.supplier_name AS supplier, g.truck_number AS truck, g.quantity_received_kg AS received_kg, g.expected_quantity AS expected_kg,
                g.weight_variance AS variance_kg, g.variance_percentage AS variance_pct, g.unit_price_per_kg AS rate, g.total_value AS value, g.grn_status AS status, u.display_name AS received_by
         FROM goods_received_adnan g LEFT JOIN users u ON u.id = g.receiver_user_id WHERE g.grn_date BETWEEN ? AND ? ORDER BY g.grn_date, g.grn_number`,
        [p.from, p.to]
      );
      return { cols: [T("grn", "GRN #"), T("date", "Date"), T("po", "PO #"), T("supplier", "Supplier"), T("truck", "Truck"), { key: "received_kg", label: "Received kg", fmt: "qty", sum: true }, { key: "expected_kg", label: "Expected kg", fmt: "qty", sum: true }, { key: "variance_kg", label: "Variance kg", fmt: "qty", sum: true }, { key: "variance_pct", label: "Variance %", fmt: "qty" }, M("rate", "Rate \u09F3/kg", false), M("value", "Value \u09F3"), T("status", "Status"), T("received_by", "Received by")], rows: rows.map((r) => ({ ...r, date: day(r.date) })) };
    }
    case "supplier_payments": {
      const rows = await query(
        `SELECT pp.payment_voucher_number AS voucher, pp.payment_date AS date, pp.po_number AS po, pp.supplier_name AS supplier, pp.amount_paid AS amount, pp.payment_method AS method, pp.bank_name AS paid_from,
                pp.reference_number AS reference, pp.payment_type AS type, IF(pp.is_posted = 1, 'Yes', 'Deleted') AS posted, pp.handled_by_employee AS handled_by, u.display_name AS recorded_by, pp.remarks
         FROM purchase_payments_adnan pp LEFT JOIN users u ON u.id = pp.created_by_user_id WHERE pp.payment_date BETWEEN ? AND ? ORDER BY pp.payment_date, pp.payment_voucher_number`,
        [p.from, p.to]
      );
      return { cols: [T("voucher", "Voucher #"), T("date", "Date"), T("po", "PO #"), T("supplier", "Supplier"), M("amount", "Amount \u09F3"), T("method", "Method"), T("paid_from", "Paid from"), T("reference", "Reference"), T("type", "Type"), T("posted", "Posted"), T("handled_by", "Handled by"), T("recorded_by", "Recorded by"), T("remarks", "Remarks")], rows: rows.map((r) => ({ ...r, date: day(r.date) })) };
    }
  }
  throw createError$1({ statusCode: 400, statusMessage: "Unknown report type" });
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
  const saleNumber = await nextDocNumber(conn, "CTS", "commodity_sales", "sale_number");
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

const TELEGRAM_CATEGORIES = [
  "orders",
  "production",
  "payment_received",
  "dispatch",
  "purchase",
  "payment",
  "goods_received",
  "bank_approved",
  "expense",
  "backup"
];
let cached;
let cachedAt = 0;
async function loadCreds() {
  var _a;
  if (cached !== void 0 && Date.now() - cachedAt < 3e4) return cached;
  cachedAt = Date.now();
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
    if ((await getAppSettings()).notify_policy.telegram === false) return;
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

function timestamp() {
  const d = /* @__PURE__ */ new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
}
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
async function getDriveAccessToken(clientId, clientSecret, refreshToken) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken
    })
  });
  if (!res.ok) throw new Error(`Drive auth failed (${res.status}): ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  return data.access_token;
}
async function streamBackupToDrive(dbConfig, oauth, folderId, driveName) {
  const accessToken = await getDriveAccessToken(oauth.clientId, oauth.clientSecret, oauth.refreshToken);
  const dump = spawn("mysqldump", [
    "--no-defaults",
    `--host=${dbConfig.dbHost}`,
    `--port=${dbConfig.dbPort}`,
    `--user=${dbConfig.dbUser}`,
    `--password=${dbConfig.dbPass}`,
    "--single-transaction",
    "--quick",
    "--routines",
    dbConfig.dbName
  ]);
  let dumpStderr = "";
  dump.stderr.on("data", (d) => {
    dumpStderr += d.toString();
  });
  const gzip = createGzip();
  const boundary = `boundary-${Date.now()}`;
  const metadata = JSON.stringify({ name: driveName, parents: [folderId] });
  const preamble = Buffer.from(
    `--${boundary}\r
Content-Type: application/json; charset=UTF-8\r
\r
${metadata}\r
--${boundary}\r
Content-Type: application/gzip\r
\r
`
  );
  const epilogue = Buffer.from(`\r
--${boundary}--`);
  const body = new PassThrough();
  let sizeBytes = 0;
  body.write(preamble);
  dump.stdout.pipe(gzip);
  gzip.on("data", (chunk) => {
    sizeBytes += chunk.length;
  });
  gzip.pipe(body, { end: false });
  const failure = new Promise((_, reject) => {
    dump.on("error", reject);
    gzip.on("error", reject);
    dump.on("close", (code) => {
      if (code !== 0) {
        const err = new Error(`mysqldump exited ${code}: ${dumpStderr.slice(0, 500)}`);
        gzip.destroy(err);
        body.destroy(err);
        reject(err);
      }
    });
  });
  const gzipDone = new Promise((resolve, reject) => {
    gzip.on("end", () => {
      body.end(epilogue);
      resolve();
    });
    gzip.on("error", reject);
  });
  const uploadPromise = fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id&supportsAllDrives=true",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`
      },
      // @ts-expect-error - Node's fetch (undici) accepts a web ReadableStream body with duplex:'half'
      body: Readable.toWeb(body),
      duplex: "half"
    }
  ).then(async (res) => {
    if (!res.ok) throw new Error(`Drive upload failed (${res.status}): ${(await res.text()).slice(0, 300)}`);
    return await res.json();
  });
  const [, result] = await Promise.all([
    Promise.race([gzipDone, failure]),
    Promise.race([uploadPromise, failure])
  ]);
  return { id: result.id, sizeBytes };
}
async function runDbBackupNow() {
  var _a, _b, _c, _d, _e, _f;
  const config = useRuntimeConfig();
  const clientId = String((_a = config.googleOauthClientId) != null ? _a : "");
  const clientSecret = String((_b = config.googleOauthClientSecret) != null ? _b : "");
  const refreshToken = String((_c = config.googleOauthRefreshToken) != null ? _c : "");
  const folderId = String((_d = config.googleDriveBackupFolderId) != null ? _d : "");
  if (!clientId || !clientSecret || !refreshToken || !folderId) {
    const msg = "DB backup skipped: NUXT_GOOGLE_OAUTH_CLIENT_ID / _CLIENT_SECRET / _REFRESH_TOKEN / NUXT_GOOGLE_DRIVE_BACKUP_FOLDER_ID not configured";
    console.warn(`[db-backup] ${msg}`);
    return { ok: false, error: msg };
  }
  const ts = timestamp();
  const dbName = String((_e = config.dbName) != null ? _e : "db");
  const fileName = `vueapp-backup-${dbName}-${ts}.sql.gz`;
  const startedAt = Date.now();
  try {
    const { sizeBytes } = await streamBackupToDrive(
      { dbHost: String(config.dbHost), dbPort: Number(config.dbPort), dbUser: String(config.dbUser), dbPass: String(config.dbPass), dbName },
      { clientId, clientSecret, refreshToken },
      folderId,
      fileName
    );
    const seconds = ((Date.now() - startedAt) / 1e3).toFixed(1);
    await sendTelegram(
      `\u{1F4BE} <b>Vue App DB Backup</b> \u2014 success
File: <code>${fileName}</code>
Size: ${formatBytes(sizeBytes)} \xB7 ${seconds}s`,
      "backup"
    );
    return { ok: true, file: fileName, sizeBytes };
  } catch (e) {
    const errMsg = (_f = e == null ? void 0 : e.message) != null ? _f : String(e);
    console.error("[db-backup] failed:", errMsg);
    await sendTelegram(`\u{1F534} <b>Vue App DB Backup</b> \u2014 FAILED
<code>${errMsg.slice(0, 300)}</code>`, "backup").catch(() => {
    });
    return { ok: false, error: errMsg };
  }
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

async function getGrnPendingAccountId(conn) {
  var _a;
  const [[acc]] = await conn.query(
    `SELECT id FROM chart_of_accounts WHERE account_number = '2110' OR name LIKE 'GRN Pending%' ORDER BY (account_number = '2110') DESC, id ASC LIMIT 1`
  );
  if (acc == null ? void 0 : acc.id) return Number(acc.id);
  const [[ap]] = await conn.query(`SELECT id FROM chart_of_accounts WHERE account_type = 'Accounts Payable' ORDER BY id ASC LIMIT 1`);
  return (_a = ap == null ? void 0 : ap.id) != null ? _a : null;
}
async function resolvePaymentSource(conn, opts) {
  var _a;
  if (opts.method === "cash") {
    const [[pc]] = await conn.query(
      `SELECT p.id, p.account_name, p.chart_of_account_id, b.name AS branch FROM branch_petty_cash_accounts p LEFT JOIN branches b ON b.id = p.branch_id WHERE p.id = ? AND p.status = 'active'`,
      [Number(opts.cashAccountId) || 0]
    );
    if (!pc) throw createError$1({ statusCode: 400, statusMessage: "Select the cash (petty-cash) account this payment was made from" });
    if (!pc.chart_of_account_id) throw createError$1({ statusCode: 400, statusMessage: "That cash account is not linked to the chart of accounts \u2014 ask an admin to link it" });
    return { bankName: `${pc.account_name}${pc.branch ? " - " + pc.branch : ""}`, glAccountId: Number(pc.chart_of_account_id), cashAccountId: Number(pc.id) };
  }
  if (opts.method === "contra") return { bankName: null, glAccountId: null, cashAccountId: null };
  const [[ba]] = await conn.query(`SELECT bank_name, branch_name, account_name, chart_of_account_id FROM bank_accounts WHERE id = ?`, [Number(opts.bankAccountId) || 0]);
  if (!ba) throw createError$1({ statusCode: 400, statusMessage: "Select the company bank account this payment was made from" });
  return { bankName: opts.method === "cheque" ? `Cheque - ${ba.bank_name}` : `${ba.bank_name} - ${ba.branch_name || ba.account_name}`, glAccountId: (_a = ba.chart_of_account_id) != null ? _a : null, cashAccountId: null };
}
async function resolvePurchasePaymentGLAccounts(conn, paymentType, bankGlAccountId) {
  var _a;
  const payable = await getGrnPendingAccountId(conn);
  if (paymentType === "contra") {
    const [[arAcc]] = await conn.query(
      `SELECT id FROM chart_of_accounts WHERE account_type = 'Accounts Receivable' ORDER BY id ASC LIMIT 1`
    );
    return { drAccountId: payable, crAccountId: (_a = arAcc == null ? void 0 : arAcc.id) != null ? _a : null };
  }
  return { drAccountId: payable, crAccountId: bankGlAccountId };
}
function jeDescription(paymentType, voucherNo, amt, supplierName, bankLabel, referenceNumber) {
  if (paymentType === "contra")
    return `Contra offset ${voucherNo} \u2014 AP \u2193 / AR \u2193 \xB7 \u09F3${amt.toLocaleString()} \xB7 ref ${referenceNumber != null ? referenceNumber : ""}`;
  if (paymentType === "advance")
    return `Advance payment ${voucherNo} \u2014 \u09F3${amt.toLocaleString()} to ${supplierName} via ${bankLabel}`;
  const typeLabel = paymentType === "against_delivery" ? "Delivery expense" : "Credit payment";
  return `${typeLabel} ${voucherNo} \u2014 \u09F3${amt.toLocaleString()} to ${supplierName} via ${bankLabel}`;
}
async function postPurchasePaymentJE(conn, opts) {
  var _a;
  const { drAccountId, crAccountId } = await resolvePurchasePaymentGLAccounts(conn, opts.paymentType, opts.bankGlAccountId);
  if (!drAccountId || !crAccountId) {
    console.warn(`[purchasePaymentGL] Skipping JE for ${opts.voucherNo}: dr=${drAccountId}, cr=${crAccountId}`);
    return null;
  }
  const bankLabel = (_a = opts.bankName) != null ? _a : opts.paymentMethod;
  const jeDesc = jeDescription(opts.paymentType, opts.voucherNo, opts.pmtAmt, opts.supplierName, bankLabel, opts.referenceNumber);
  const [jeRes] = await conn.query(
    `INSERT INTO journal_entries
       (transaction_date, description, related_document_type, related_document_id, created_by_user_id)
     VALUES (?, ?, 'PurchasePayment', ?, ?)`,
    [opts.pmtDate, jeDesc.slice(0, 255), opts.paymentId, opts.userId]
  );
  const jeId = jeRes.insertId;
  await conn.query(
    `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
     VALUES (?, ?, ?, 0.00, ?)`,
    [jeId, drAccountId, opts.pmtAmt, opts.voucherNo]
  );
  await conn.query(
    `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
     VALUES (?, ?, 0.00, ?, ?)`,
    [jeId, crAccountId, opts.pmtAmt, opts.voucherNo]
  );
  await conn.query(`UPDATE purchase_payments_adnan SET journal_entry_id = ? WHERE id = ?`, [jeId, opts.paymentId]);
  return jeId;
}
async function reversePurchasePaymentJE(conn, opts) {
  const [origLines] = await conn.query(
    `SELECT account_id, debit_amount, credit_amount FROM transaction_lines WHERE journal_entry_id = ?`,
    [opts.journalEntryId]
  );
  if (!origLines.length) return null;
  const [jeRes] = await conn.query(
    `INSERT INTO journal_entries
       (transaction_date, description, related_document_type, related_document_id, created_by_user_id)
     VALUES (?, ?, 'PurchasePaymentReversal', ?, ?)`,
    [opts.pmtDate, `Reversal of ${opts.voucherNo}${opts.reason ? ` (${opts.reason})` : ""}`.slice(0, 255), opts.paymentId, opts.userId]
  );
  const reversalJeId = jeRes.insertId;
  for (const l of origLines) {
    await conn.query(
      `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
       VALUES (?, ?, ?, ?, ?)`,
      [reversalJeId, l.account_id, Number(l.credit_amount), Number(l.debit_amount), `REV-${opts.voucherNo}`]
    );
  }
  return reversalJeId;
}

async function postGRNJournalEntry(conn, opts) {
  var _a, _b, _c, _d, _e, _f;
  const [[po]] = await conn.query(
    `SELECT commodity_id, wheat_origin FROM purchase_orders_adnan WHERE id = ?`,
    [opts.poId]
  );
  const [[commodity]] = (po == null ? void 0 : po.commodity_id) ? await conn.query(`SELECT inventory_account_id, name FROM purchase_commodities WHERE id = ?`, [po.commodity_id]) : [[null]];
  const isWheat = !commodity || String(commodity.name).toLowerCase() === "wheat";
  let inventoryId = null;
  if (isWheat) {
    const canadian = /কানাডা|canad/i.test(String((_a = po == null ? void 0 : po.wheat_origin) != null ? _a : ""));
    const [[inv]] = await conn.query(`SELECT id FROM chart_of_accounts WHERE account_number = ?`, [canadian ? "1400" : "1401"]);
    inventoryId = (_c = (_b = inv == null ? void 0 : inv.id) != null ? _b : commodity == null ? void 0 : commodity.inventory_account_id) != null ? _c : null;
  } else inventoryId = (_d = commodity == null ? void 0 : commodity.inventory_account_id) != null ? _d : null;
  if (!inventoryId) {
    console.warn(`[grn-gl] Skipping JE for ${opts.grnNumber}: no inventory account for this PO/commodity`);
    return null;
  }
  const payableId = await getGrnPendingAccountId(conn);
  if (!payableId) {
    console.warn(`[grn-gl] Skipping JE for ${opts.grnNumber}: no GRN Pending / Accounts Payable account in chart_of_accounts`);
    return null;
  }
  const jeId = await postJournalEntry(conn, {
    date: opts.grnDate,
    description: `GRN ${opts.grnNumber} \u2014 PO ${opts.poNumber} \xB7 ${(_e = commodity == null ? void 0 : commodity.name) != null ? _e : "Wheat"} ${(_f = po == null ? void 0 : po.wheat_origin) != null ? _f : ""} \xB7 \u09F3${opts.totalValue.toLocaleString()}`.slice(0, 250),
    docType: "grn_adnan",
    docId: opts.grnId,
    userId: opts.userId,
    lines: [
      { accountId: Number(inventoryId), debit: opts.totalValue, credit: 0, memo: opts.grnNumber },
      { accountId: payableId, debit: 0, credit: opts.totalValue, memo: opts.grnNumber }
    ]
  });
  await conn.query(`UPDATE goods_received_adnan SET journal_entry_id = ? WHERE id = ?`, [jeId, opts.grnId]);
  return jeId;
}
async function reverseGRNJournalEntry(conn, opts) {
  const [origLines] = await conn.query(
    `SELECT account_id, debit_amount, credit_amount FROM transaction_lines WHERE journal_entry_id = ?`,
    [opts.journalEntryId]
  );
  if (!origLines.length) return null;
  const [jeRes] = await conn.query(
    `INSERT INTO journal_entries
       (transaction_date, description, related_document_type, related_document_id, created_by_user_id)
     VALUES (CURDATE(), ?, 'grn_adnan_reversal', ?, ?)`,
    [`Reversal of ${opts.grnNumber}${opts.reason ? ` (${opts.reason})` : ""}`.slice(0, 255), opts.grnId, opts.userId]
  );
  const reversalJeId = jeRes.insertId;
  for (const l of origLines) {
    await conn.query(
      `INSERT INTO transaction_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
       VALUES (?, ?, ?, ?, ?)`,
      [reversalJeId, l.account_id, Number(l.credit_amount), Number(l.debit_amount), `REV-${opts.grnNumber}`]
    );
  }
  return reversalJeId;
}

async function defaultGrnBasis() {
  return (await getAppSettings()).finance_settings.grnValueBasis === "received" ? "received" : "expected";
}
const grnPricedQty = (basis, received, expected) => basis === "expected" && expected > 0 ? expected : received;
function grnBasisOf(g) {
  if (g.value_basis === "expected" || g.value_basis === "received") return g.value_basis;
  const tv = Number(g.total_value), p = Number(g.unit_price_per_kg), r = Number(g.quantity_received_kg), e = Number(g.expected_quantity) || 0;
  return e > 0 && Math.abs(tv - e * p) < 1 && Math.abs(tv - r * p) >= 1 ? "expected" : "received";
}

const AUDIT_TITLES = {
  DISPATCHED_ORDER_NO_INVOICE: "Delivered order with no invoice in the ledger",
  OB_ORDER_NO_INVOICE_ROW: "Opening-balance order (covered by the opening line)",
  INVOICE_FOR_UNDISPATCHED_ORDER: "Invoice for an order that is not shipped",
  INVOICE_AMOUNT_DIFFERS: "Invoice differs from the order total (after credit/debit notes)",
  PAYMENT_NO_LEDGER_ROW: "Payment not in the ledger",
  LEDGER_PAYMENT_NO_DOCUMENT: "Ledger payment with no payment record",
  REVERSED_PAYMENT_STILL_CREDITED: "Reversed payment still credited",
  APPROVED_RETURN_NO_CREDIT_NOTE: "Approved return with no credit note",
  RETURN_CREDIT_NOTE_NO_APPROVED_RETURN: "Credit note without an approved return",
  POST_DISPATCH_AMENDMENT_NO_NOTE: "Approved amendment with no ledger note",
  AMENDMENT_NOTE_NO_APPROVED_AMENDMENT: "Ledger note without an approved amendment",
  INITIAL_DUE_NOT_IN_LEDGER: "Opening due on the customer record, none in the ledger",
  LEDGER_ROW_NO_CUSTOMER: "Ledger line with no customer",
  POSSIBLE_DUPLICATE_LINE: "Possible duplicate line",
  LARGE_MANUAL_ADJUSTMENT: "Large manual adjustment (\u09F35 lakh or more)",
  STORED_BALANCE_WRONG: "Stored balance differs from the ledger",
  ORDER_PAID_VS_ALLOCATIONS: 'Order "paid" differs from its payment allocations'
};
async function runLedgerAudit() {
  const DISP = `('goods_on_board','shipped','dispatched','delivered','completed')`;
  const INV = `('credit_orders','credit_order')`;
  const exceptions = [];
  const add = (code, severity, r) => {
    var _a, _b, _c, _d;
    return exceptions.push({ code, severity, customer_id: r.customer_id, customer: r.customer, ref: (_a = r.ref) != null ? _a : "", date: (_b = r.date) != null ? _b : "", amount: (_c = r.amount) != null ? _c : "", detail: (_d = r.detail) != null ? _d : "" });
  };
  const run = async (sql, p = []) => await query(sql, p);
  for (const r of await run(`SELECT o.id, o.order_number ref, o.order_date date, o.total_amount amount, o.customer_id, c.name customer, o.status, o.order_number LIKE 'OB-%' is_ob
    FROM credit_orders o JOIN customers c ON c.id = o.customer_id
    WHERE o.status IN ${DISP} AND o.total_amount > 0
      AND NOT EXISTS (SELECT 1 FROM customer_ledger l WHERE l.reference_type IN ${INV} AND l.reference_id = o.id AND l.transaction_type = 'invoice')`))
    add(r.is_ob ? "OB_ORDER_NO_INVOICE_ROW" : "DISPATCHED_ORDER_NO_INVOICE", r.is_ob ? "info" : "high", { ...r, detail: `${r.status} order has no invoice line in the ledger${r.is_ob ? " (opening-balance order \u2014 covered by the opening row?)" : ""}` });
  for (const r of await run(`SELECT l.id lid, o.order_number ref, l.transaction_date date, l.debit_amount amount, l.customer_id, c.name customer, o.status
    FROM customer_ledger l JOIN credit_orders o ON o.id = l.reference_id JOIN customers c ON c.id = l.customer_id
    WHERE l.reference_type IN ${INV} AND l.transaction_type = 'invoice' AND o.status NOT IN ${DISP}`))
    add("INVOICE_FOR_UNDISPATCHED_ORDER", "high", { ...r, detail: `ledger invoice exists but the order is "${r.status}"` });
  for (const r of await run(`SELECT o.order_number ref, o.order_date date, l.debit_amount amount, o.total_amount order_total, o.customer_id, c.name customer,
        COALESCE((SELECT SUM(n.debit_amount - n.credit_amount) FROM customer_ledger n
                  LEFT JOIN credit_order_returns r2 ON n.reference_type IN ('credit_order_returns','credit_order_return') AND r2.id = n.reference_id
                  LEFT JOIN order_amendments a2 ON n.reference_type IN ('order_amendments','order_amendment') AND a2.id = n.reference_id
                  WHERE n.transaction_type IN ('credit_note','debit_note') AND n.customer_id = o.customer_id
                    AND ((n.reference_type IN ('credit_orders','credit_order') AND n.reference_id = o.id) OR r2.order_id = o.id OR a2.order_id = o.id)), 0) notes
    FROM customer_ledger l JOIN credit_orders o ON o.id = l.reference_id JOIN customers c ON c.id = l.customer_id
    WHERE l.reference_type IN ${INV} AND l.transaction_type = 'invoice' AND o.status IN ${DISP}`)) {
    const explained = Number(r.amount) + Number(r.notes);
    if (Math.abs(explained - Number(r.order_total)) > 0.01)
      add(
        "INVOICE_AMOUNT_DIFFERS",
        Math.abs(explained - r.order_total) > 1e3 ? "high" : "medium",
        { ...r, amount: Number(explained) - Number(r.order_total), detail: `invoice \u09F3${r.amount} ${Number(r.notes) ? `(net of notes \u09F3${explained})` : ""} vs order total \u09F3${r.order_total}` }
      );
  }
  for (const r of await run(`SELECT p.payment_number ref, p.payment_date date, p.amount, p.customer_id, c.name customer, p.payment_type
    FROM customer_payments p JOIN customers c ON c.id = p.customer_id
    WHERE p.reversed_at IS NULL AND NOT EXISTS (SELECT 1 FROM customer_ledger l WHERE l.reference_type = 'customer_payments' AND l.reference_id = p.id AND l.customer_id = p.customer_id)`))
    add("PAYMENT_NO_LEDGER_ROW", "high", { ...r, detail: `${r.payment_type} payment is not in the customer's ledger` });
  for (const r of await run(`SELECT l.invoice_number ref, l.transaction_date date, l.credit_amount amount, l.customer_id, c.name customer, l.id lid
    FROM customer_ledger l JOIN customers c ON c.id = l.customer_id LEFT JOIN customer_payments p ON p.id = l.reference_id
    WHERE l.reference_type = 'customer_payments' AND (p.id IS NULL OR p.customer_id <> l.customer_id)`))
    add("LEDGER_PAYMENT_NO_DOCUMENT", "high", { ...r, detail: "ledger shows a payment with no matching payment record" });
  for (const r of await run(`SELECT p.payment_number ref, p.payment_date date, p.amount, p.customer_id, c.name customer FROM customer_payments p JOIN customers c ON c.id = p.customer_id
    WHERE p.reversed_at IS NOT NULL AND EXISTS (SELECT 1 FROM customer_ledger l WHERE l.reference_type = 'customer_payments' AND l.reference_id = p.id AND l.credit_amount > 0)
      AND NOT EXISTS (SELECT 1 FROM customer_ledger l WHERE l.reference_type = 'customer_payments' AND l.reference_id = p.id AND l.debit_amount > 0)`))
    add("REVERSED_PAYMENT_STILL_CREDITED", "high", { ...r, detail: "payment is marked reversed but its credit is still in the ledger with no reversing entry" });
  for (const r of await run(`SELECT r.return_number ref, r.return_date date, r.total_returned_amount amount, r.customer_id, c.name customer, r.status
    FROM credit_order_returns r JOIN customers c ON c.id = r.customer_id
    WHERE r.status = 'approved' AND NOT EXISTS (SELECT 1 FROM customer_ledger l WHERE l.reference_type IN ('credit_order_returns','credit_order_return') AND l.reference_id = r.id)`))
    add("APPROVED_RETURN_NO_CREDIT_NOTE", "high", { ...r, detail: "approved return has no credit note in the ledger" });
  for (const r of await run(`SELECT l.invoice_number ref, l.transaction_date date, l.credit_amount amount, l.customer_id, c.name customer
    FROM customer_ledger l JOIN customers c ON c.id = l.customer_id LEFT JOIN credit_order_returns r ON r.id = l.reference_id
    WHERE l.reference_type IN ('credit_order_returns','credit_order_return') AND (r.id IS NULL OR r.status <> 'approved')`))
    add("RETURN_CREDIT_NOTE_NO_APPROVED_RETURN", "high", { ...r, detail: "credit note refers to a return that is missing or not approved" });
  for (const r of await run(`SELECT a.amendment_number ref, a.created_at date, a.flat_amount amount, o.customer_id, c.name customer, a.regime
    FROM order_amendments a JOIN credit_orders o ON o.id = a.order_id JOIN customers c ON c.id = o.customer_id
    WHERE a.status = 'approved' AND a.regime = 'post' AND a.flat_amount IS NOT NULL AND a.flat_amount <> 0
      AND NOT EXISTS (SELECT 1 FROM customer_ledger l WHERE l.reference_type IN ('order_amendments','order_amendment') AND l.reference_id = a.id)`))
    add("POST_DISPATCH_AMENDMENT_NO_NOTE", "medium", { ...r, detail: "approved post-dispatch amendment has no debit/credit note in the ledger" });
  for (const r of await run(`SELECT l.invoice_number ref, l.transaction_date date, GREATEST(l.debit_amount, l.credit_amount) amount, l.customer_id, c.name customer
    FROM customer_ledger l JOIN customers c ON c.id = l.customer_id LEFT JOIN order_amendments a ON a.id = l.reference_id
    WHERE l.reference_type IN ('order_amendments','order_amendment') AND (a.id IS NULL OR a.status <> 'approved')`))
    add("AMENDMENT_NOTE_NO_APPROVED_AMENDMENT", "medium", { ...r, detail: "ledger note refers to an amendment that is missing or not approved" });
  for (const r of await run(`SELECT c.id customer_id, c.name customer, c.initial_due amount FROM customers c
    WHERE c.initial_due <> 0 AND NOT EXISTS (SELECT 1 FROM customer_ledger l WHERE l.customer_id = c.id AND l.transaction_type = 'opening_balance')`))
    add("INITIAL_DUE_NOT_IN_LEDGER", "high", { ...r, ref: "initial_due", detail: `customer record says opening due \u09F3${r.amount} but the ledger has no opening-balance line \u2014 is it owed or already settled?` });
  for (const r of await run(`SELECT l.customer_id, IFNULL(c.name, '(no such customer)') customer, l.transaction_date date, l.debit_amount - l.credit_amount amount, l.id ref
    FROM customer_ledger l LEFT JOIN customers c ON c.id = l.customer_id WHERE c.id IS NULL OR l.customer_id = 0`))
    add("LEDGER_ROW_NO_CUSTOMER", "high", { ...r, detail: "ledger line is attached to customer 0 / a missing customer" });
  for (const r of await run(`SELECT l.customer_id, c.name customer, l.transaction_date date, GREATEST(l.debit_amount, l.credit_amount) amount, l.transaction_type ref, COUNT(*) n
    FROM customer_ledger l JOIN customers c ON c.id = l.customer_id GROUP BY l.customer_id, c.name, l.transaction_date, l.transaction_type, l.debit_amount, l.credit_amount, l.invoice_number HAVING n > 1`))
    add("POSSIBLE_DUPLICATE_LINE", "medium", { ...r, detail: `${r.n} identical lines on the same day` });
  for (const r of await run(`SELECT l.customer_id, c.name customer, l.transaction_date date, GREATEST(l.debit_amount, l.credit_amount) amount, l.transaction_type ref, l.description
    FROM customer_ledger l JOIN customers c ON c.id = l.customer_id WHERE l.reference_type = 'manual_adjustment' AND GREATEST(l.debit_amount, l.credit_amount) >= 500000 ORDER BY amount DESC`))
    add("LARGE_MANUAL_ADJUSTMENT", "review", { ...r, detail: r.description });
  for (const r of await run(`SELECT c.id customer_id, c.name customer, c.current_balance stored, COALESCE(l.b, 0) ledger FROM customers c
    LEFT JOIN (SELECT customer_id, SUM(debit_amount) - SUM(credit_amount) b FROM customer_ledger GROUP BY customer_id) l ON l.customer_id = c.id
    WHERE ABS(c.current_balance - COALESCE(l.b, 0)) > 0.01`))
    add("STORED_BALANCE_WRONG", "medium", { ...r, ref: "current_balance", amount: Number(r.stored) - Number(r.ledger), detail: `stored \u09F3${r.stored} vs ledger \u09F3${Number(r.ledger).toFixed(2)}` });
  for (const r of await run(`SELECT o.order_number ref, o.order_date date, o.customer_id, c.name customer, o.amount_paid + o.advance_paid recorded, COALESCE(a.s, 0) allocated
    FROM credit_orders o JOIN customers c ON c.id = o.customer_id
    LEFT JOIN (SELECT pa.order_id, SUM(pa.allocated_amount) s FROM payment_allocations pa WHERE pa.reversed = 0 GROUP BY pa.order_id) a ON a.order_id = o.id
    WHERE o.status IN ${DISP} AND ABS((o.amount_paid + o.advance_paid) - COALESCE(a.s, 0)) > 1`))
    add("ORDER_PAID_VS_ALLOCATIONS", "medium", { ...r, amount: Number(r.recorded) - Number(r.allocated), detail: `order says paid \u09F3${r.recorded}, payment allocations add up to \u09F3${r.allocated}` });
  return exceptions;
}

const RUNNING_BALANCE_SQL = `SUM(l.debit_amount - l.credit_amount) OVER (PARTITION BY l.customer_id ORDER BY l.transaction_date, l.id)`;

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

const STATUSES = ["shipped", "goods_on_board", "delivered"];
const ROW_CAP = 2e4;
const iso = (s, fallback) => /^\d{4}-\d{2}-\d{2}$/.test(String(s != null ? s : "")) ? String(s) : fallback;
const num = (v) => Number(v != null ? v : 0);
async function buildOrderReport(event, mode) {
  var _a, _b, _c;
  const q = getQuery(event);
  const today = new Date(Date.now() + 6 * 36e5).toISOString().slice(0, 10);
  let from = iso(q.date_from, today.slice(0, 8) + "01"), to = iso(q.date_to, today);
  if (from > to) [from, to] = [to, from];
  const branchId = Number(q.branch_id) || 0;
  const product = String((_a = q.product) != null ? _a : "").trim();
  const statuses = String((_b = q.status) != null ? _b : "").split(",").filter((s) => STATUSES.includes(s));
  const session = await getUserSession(event);
  const conn = await getDb().getConnection();
  try {
    const where = [];
    const params = [];
    let dateExpr, join;
    if (mode === "sales") {
      dateExpr = "COALESCE(DATE(cos.shipped_date), DATE(co.order_date))";
      join = "LEFT JOIN credit_order_shipping cos ON cos.order_id = co.id";
      where.push(`co.status IN (${STATUSES.map(() => "?").join(",")})`);
      params.push(...STATUSES);
    } else if (mode === "dispatch") {
      dateExpr = "DATE(cos.shipped_date)";
      join = "JOIN credit_order_shipping cos ON cos.order_id = co.id";
      const st = statuses.length ? statuses : STATUSES;
      where.push(`co.status IN (${st.map(() => "?").join(",")})`, "cos.shipped_date IS NOT NULL");
      params.push(...st);
    } else {
      dateExpr = "DATE(cos.delivered_date)";
      join = "JOIN credit_order_shipping cos ON cos.order_id = co.id";
      where.push(`co.status = 'delivered'`, "cos.delivered_date IS NOT NULL");
    }
    where.push(`${dateExpr} BETWEEN ? AND ?`);
    params.push(from, to);
    if (session == null ? void 0 : session.user) {
      const scope = await getUserBranchIds(conn, Number(session.user.id), ((_c = session.user.role) != null ? _c : "").toLowerCase());
      if (scope !== null) {
        where.push("co.assigned_branch_id IN (?)");
        params.push(scope.length ? scope : [0]);
      }
    }
    if (branchId) {
      where.push("co.assigned_branch_id = ?");
      params.push(branchId);
    }
    if (product) {
      where.push("p.base_name LIKE ?");
      params.push(`%${product}%`);
    }
    const [rows] = await conn.query(`
      SELECT ${dateExpr} AS d, co.id AS order_id, co.order_number, c.id AS customer_id, c.name AS customer, COALESCE(b.name, '\u2014') AS branch,
             p.id AS product_id, p.base_name AS product, COALESCE(pv.id, 0) AS variant_id, COALESCE(pv.weight_variant, '\u2014') AS variant, COALESCE(pv.grade, '') AS grade,
             coi.quantity AS qty, coi.unit_price AS price, COALESCE(coi.discount_amount, 0) AS discount, coi.line_total AS total,
             cos.truck_number AS truck, cos.driver_name AS driver
      FROM credit_orders co
      JOIN customers c ON c.id = co.customer_id
      LEFT JOIN branches b ON b.id = co.assigned_branch_id
      JOIN credit_order_items coi ON coi.order_id = co.id
      JOIN products p ON p.id = coi.product_id
      LEFT JOIN product_variants pv ON pv.id = coi.variant_id
      ${join}
      WHERE ${where.join(" AND ")}
      ORDER BY d DESC, co.id, coi.id`, params);
    const all = rows.map((r) => ({ ...r, d: String(r.d).slice(0, 10), qty: num(r.qty), price: num(r.price), discount: num(r.discount), total: num(r.total), gross: num(r.qty) * num(r.price) }));
    const fold = (keyOf, init) => {
      var _a2;
      const m = /* @__PURE__ */ new Map();
      for (const r of all) {
        const k = keyOf(r);
        const g = (_a2 = m.get(k)) != null ? _a2 : { ...init(r), qty: 0, gross: 0, discount: 0, net: 0, orders: /* @__PURE__ */ new Set() };
        g.qty += r.qty;
        g.gross += r.gross;
        g.discount += r.discount;
        g.net += r.total;
        g.orders.add(r.order_id);
        m.set(k, g);
      }
      return [...m.values()].map((g) => ({ ...g, orders: g.orders.size }));
    };
    const products = fold(
      (r) => mode === "product" ? `${r.product_id}|${r.variant_id}|${r.price}` : `${r.product_id}|${r.variant_id}`,
      (r) => ({ product: r.product, variant: r.variant, grade: r.grade, ...mode === "product" ? { price: r.price } : {} })
    ).sort((a, b) => b.qty - a.qty);
    const customers = fold((r) => String(r.customer_id), (r) => ({ customer_id: r.customer_id, customer: r.customer })).sort((a, b) => b.net - a.net);
    const branches = fold((r) => r.branch, (r) => ({ branch: r.branch })).sort((a, b) => b.net - a.net);
    const daily = fold((r) => r.d, (r) => ({ date: r.d })).sort((a, b) => b.date.localeCompare(a.date));
    const orderIds = new Set(all.map((r) => r.order_id));
    const sum = (k) => all.reduce((a, r) => a + r[k], 0);
    const summary = { orders: orderIds.size, customers: new Set(all.map((r) => r.customer_id)).size, units: sum("qty"), gross: sum("gross"), discount: sum("discount"), net: sum("total") };
    return {
      mode,
      from,
      to,
      branch_id: branchId || null,
      summary,
      products,
      customers,
      branches,
      daily,
      rows: all.slice(0, ROW_CAP),
      truncated: all.length > ROW_CAP,
      branch_options: (await conn.query(`SELECT id, name FROM branches WHERE status = 'active' ORDER BY name`))[0]
    };
  } finally {
    conn.release();
  }
}

const SETTING_KEY$1 = "last_owner_digest";
async function claimDigestSlotForToday() {
  const db = getDb();
  const [[today]] = await db.query(`SELECT CURDATE() AS d`);
  const todayStr = String(today.d);
  const [[row]] = await db.query(
    `SELECT setting_value FROM system_settings WHERE setting_key = ?`,
    [SETTING_KEY$1]
  );
  if ((row == null ? void 0 : row.setting_value) === todayStr) return false;
  await db.query(
    `INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
    [SETTING_KEY$1, todayStr]
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
function clearAllPerms() {
  cache.clear();
}

const on = (pages = [], actions = {}) => ({ enabled: true, pages, actions });
const NO_ADMIN_EDITS = { edit: false, delete: false, cancel: false, telegram: false };
const CS_COMMON = ["dashboard", "all"];
const CUSTOMERS_VIEW_ONLY = { list: { edit: false, blacklist: false, delete: false } };
const PRESETS = {
  // Accounts family: approvals, collection, ledger, credit limits, Payment Watch, returns
  "accounts": {
    dashboard: on(["main"]),
    credit_sales: on([
      ...CS_COMMON,
      "create",
      "approve",
      "payment-watch",
      "approval-requests",
      "over-deliveries",
      "returns",
      "collect",
      "payments",
      "amendments",
      "ledger",
      "ageing",
      "credit-limits",
      "delivery-schedule"
    ], { all: { ...NO_ADMIN_EDITS } }),
    customers: on(["list"]),
    collector: on(["collections"]),
    sales: on(["report"]),
    products: on(["overview"])
  },
  "sales-group": {
    dashboard: on(["main"]),
    credit_sales: on(
      [...CS_COMMON, "create", "ledger", "amendments", "returns"],
      { all: { ...NO_ADMIN_EDITS, collect_payment: false, record_delivery: false } }
    ),
    customers: on(["list"], CUSTOMERS_VIEW_ONLY),
    products: on(["overview"])
  },
  "production-group": {
    dashboard: on(["main"]),
    credit_sales: on(
      [...CS_COMMON, "production", "over-deliveries", "returns", "amendments", "delivery-schedule"],
      { all: { ...NO_ADMIN_EDITS, collect_payment: false } }
    ),
    production: on(),
    products: on(["overview", "base", "variants", "inventory"])
  },
  "dispatch-group": {
    dashboard: on(["main"]),
    credit_sales: on(
      [...CS_COMMON, "dispatch", "over-deliveries", "returns"],
      { all: { ...NO_ADMIN_EDITS, collect_payment: false } }
    ),
    dispatch: on(),
    products: on(["inventory"])
  },
  "accountspos-group": {
    credit_sales: on(["ledger"]),
    customers: on(["list"], CUSTOMERS_VIEW_ONLY)
  },
  "collector": {
    credit_sales: on(["collect", "payments", "ledger", "approval-requests"]),
    collector: on(["collections"]),
    customers: on(["list"], CUSTOMERS_VIEW_ONLY)
  },
  "transport manager": { dashboard: on(["main"]), fleet: on() },
  "expense initiator": { dashboard: on(["main"]), expenses: on(["dashboard", "create", "history"]) },
  "expense approver": { dashboard: on(["main"]), expenses: on(["dashboard", "history", "approve"]) },
  "bank transaction initiator": { dashboard: on(["main"]), bank: on(["dashboard", "transaction", "statement"]) },
  "bank transaction approver": { dashboard: on(["main"]), bank: on(["dashboard", "statement", "reconciliation"]) },
  "staff": { dashboard: on(["main"]) }
};
function presetKey(role) {
  const r = role.trim().toLowerCase();
  if (r === "accounts" || r.startsWith("accounts-")) return "accounts";
  if (r.startsWith("accountspos-")) return "accountspos-group";
  if (r.startsWith("sales-")) return "sales-group";
  if (r.startsWith("production manager")) return "production-group";
  if (r.startsWith("dispatch")) return "dispatch-group";
  return r in PRESETS ? r : null;
}
function presetPermissions(role) {
  const k = presetKey(role);
  return k ? JSON.parse(JSON.stringify(PRESETS[k])) : {};
}
function presetBranches(role) {
  const m = role.trim().toLowerCase().match(/-(srg|demra)$/);
  return (m == null ? void 0 : m[1]) ? [m[1]] : [];
}

async function resolvePermissions(userId, role) {
  var _a;
  const cached = getCachedPerms(userId);
  if (cached) return cached;
  let perms = null;
  try {
    const conn = await getDb().getConnection();
    try {
      const [[row]] = await conn.query(`SELECT permissions FROM user_permissions WHERE user_id = ?`, [userId]);
      if (row) {
        perms = {};
        try {
          perms = JSON.parse((_a = row.permissions) != null ? _a : "{}");
        } catch {
        }
      }
    } finally {
      conn.release();
    }
  } catch {
    return { __preset: true };
  }
  perms != null ? perms : perms = { ...presetPermissions(role), __preset: true };
  setCachedPerms(userId, perms);
  return perms;
}
async function userCanAction(opts) {
  var _a, _b, _c, _d;
  const role = opts.role.toLowerCase();
  if (["admin", "superadmin"].includes(role)) return true;
  const perms = await resolvePermissions(opts.userId, role);
  if (opts.explicit)
    return !perms.__preset && ((_a = perms[opts.module]) == null ? void 0 : _a.enabled) === true && Array.isArray(perms[opts.module].pages) && perms[opts.module].pages.includes(opts.page) && ((_c = (_b = perms[opts.module].actions) == null ? void 0 : _b[opts.page]) == null ? void 0 : _c[opts.action]) === true;
  const deny = () => !!perms.__preset && opts.roleFallback.includes(role);
  const mod = perms[opts.module];
  if (!(mod == null ? void 0 : mod.enabled)) return deny();
  if (!Array.isArray(mod.pages) || mod.pages.length === 0) return true;
  if (!mod.pages.includes(opts.page)) return deny();
  const pageActions = (_d = mod.actions) == null ? void 0 : _d[opts.page];
  if (!pageActions || !(opts.action in pageActions)) return true;
  return pageActions[opts.action] === true || deny();
}
async function requireAction(event, rule, deniedMessage = "Your account is not allowed to do this") {
  var _a, _b;
  const session = await getUserSession(event);
  if (!((_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id)) throw createError$1({ statusCode: 401, statusMessage: "Not authenticated" });
  const userId = Number(session.user.id);
  const role = String((_b = session.user.role) != null ? _b : "").toLowerCase();
  if (!await userCanAction({ userId, role, ...rule }))
    throw createError$1({ statusCode: 403, statusMessage: deniedMessage });
  return { userId, role };
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

async function priceAutoApplyEnabled(conn) {
  var _a;
  try {
    const [[row]] = await conn.query(`SELECT setting_value FROM system_settings WHERE setting_key = 'pricing_engine_config'`);
    return !!JSON.parse((_a = row == null ? void 0 : row.setting_value) != null ? _a : "{}").auto_apply_to_orders;
  } catch {
    return false;
  }
}
async function applyPriceChangeToOpenOrders(conn, opts) {
  var _a;
  const out = { orders: 0, items: 0 };
  if (opts.oldPrice == null || opts.newPrice == null) return out;
  const delta = Math.round((opts.newPrice - opts.oldPrice) * 100) / 100;
  if (Math.abs(delta) < 5e-3) return out;
  const [items] = await conn.query(
    `SELECT coi.id AS item_id, coi.order_id, coi.product_id, coi.variant_id, coi.quantity, coi.unit_price, coi.discount_amount
     FROM credit_order_items coi
     JOIN credit_orders co ON co.id = coi.order_id
     WHERE coi.variant_id = ? AND co.assigned_branch_id = ?
       AND co.status NOT IN ('goods_on_board','shipped','dispatched','delivered','completed','cancelled','rejected')
       AND NOT EXISTS (SELECT 1 FROM journal_entries je
                       WHERE je.related_document_type IN ('credit_orders','CreditOrder') AND je.related_document_id = co.id)
       AND NOT EXISTS (SELECT 1 FROM customer_ledger cl
                       WHERE cl.reference_type IN ('credit_order','credit_orders') AND cl.reference_id = co.id AND cl.transaction_type = 'invoice')`,
    [opts.variantId, opts.branchId]
  );
  if (!items.length) return out;
  const reason = `Auto-applied: Pricing Engine changed the catalog price from \u09F3${opts.oldPrice.toFixed(2)} to \u09F3${opts.newPrice.toFixed(2)} (change made by ${opts.label}).`;
  const touched = /* @__PURE__ */ new Set();
  for (const it of items) {
    const oldUnit = Number(it.unit_price);
    const newUnit = Math.max(0, Math.round((oldUnit + delta) * 100) / 100);
    const newLine = Math.round((Number(it.quantity) * newUnit - Number((_a = it.discount_amount) != null ? _a : 0)) * 100) / 100;
    await conn.query(`UPDATE credit_order_items SET unit_price = ?, line_total = ? WHERE id = ?`, [newUnit, newLine, it.item_id]);
    await conn.query(
      `INSERT INTO credit_order_price_revisions
         (order_id, order_item_id, product_id, variant_id, quantity, old_unit_price, new_unit_price, reason, changed_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [it.order_id, it.item_id, it.product_id, it.variant_id, it.quantity, oldUnit, newUnit, reason, opts.userId]
    );
    touched.add(it.order_id);
    out.items++;
  }
  for (const orderId of touched) {
    const [[agg]] = await conn.query(`SELECT COALESCE(SUM(line_total),0) s FROM credit_order_items WHERE order_id = ?`, [orderId]);
    const [[o]] = await conn.query(`SELECT subtotal, total_amount, advance_paid, amount_paid FROM credit_orders WHERE id = ?`, [orderId]);
    const newSub = Math.round(Number(agg.s) * 100) / 100;
    const newTotal = Math.round((Number(o.total_amount) + (newSub - Number(o.subtotal))) * 100) / 100;
    const newBal = Math.max(0, Math.round((newTotal - Number(o.advance_paid) - Number(o.amount_paid)) * 100) / 100);
    await conn.query(`UPDATE credit_orders SET subtotal = ?, total_amount = ?, balance_due = ?, updated_at = NOW() WHERE id = ?`, [newSub, newTotal, newBal, orderId]);
    out.orders++;
  }
  return out;
}

const SETTING_KEY = "last_production_shortfall_alert";
async function claimHourSlot(slot) {
  const db = getDb();
  const [[row]] = await db.query(
    `SELECT setting_value FROM system_settings WHERE setting_key = ?`,
    [SETTING_KEY]
  );
  if ((row == null ? void 0 : row.setting_value) === slot) return false;
  await db.query(
    `INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
    [SETTING_KEY, slot]
  );
  return true;
}
function maybeTriggerProductionShortfallAlert(date, rows) {
  (async () => {
    try {
      const short = rows.filter((r) => r.still_needed_bags > 0);
      if (!short.length) return;
      const now = /* @__PURE__ */ new Date();
      const slot = `${date} ${now.getHours()}`;
      const claimed = await claimHourSlot(slot);
      if (!claimed) return;
      const lines = short.slice(0, 10).map((r) => `  \xB7 ${r.branch_name} \u2014 ${r.product}: short <b>${r.still_needed_bags}</b> bags` + (r.still_needed_kg ? ` (${r.still_needed_kg} kg)` : "")).join("\n");
      await sendTelegram(
        `\u26A0\uFE0F <b>Production Shortfall \u2014 ${date}</b>

${lines}` + (short.length > 10 ? `
  \u2026and ${short.length - 10} more` : ""),
        "production"
      );
    } catch (e) {
      console.warn("[production-requirement] shortfall alert failed:", e);
    }
  })();
}

async function nextNoteNumber(conn, noteType) {
  const prefix = noteType === "debit" ? "DAN" : "CAN", year = new Date(Date.now() + 6 * 36e5).getUTCFullYear();
  const [[last]] = await conn.query(`SELECT MAX(CAST(SUBSTRING_INDEX(note_number, '-', -1) AS UNSIGNED)) AS m FROM purchase_adjustment_notes WHERE note_number LIKE ?`, [`${prefix}-${year}-%`]);
  return `${prefix}-${year}-${String((Number(last == null ? void 0 : last.m) || 0) + 1).padStart(4, "0")}`;
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
function deliveryQrSignature(orderNumber, secret, deliveryId) {
  const payload = deliveryId ? `DELIV|${orderNumber}|${deliveryId}` : `DELIV|${orderNumber}`;
  return crypto.createHmac("sha256", secret).update(payload).digest("hex").slice(0, 16);
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
async function verifyDeliveryQrSignature(conn, orderNumber, sig, deliveryId) {
  const secret = await getDeliveryQrSecret(conn);
  const expected = deliveryQrSignature(orderNumber, secret, deliveryId);
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
          WHERE purchase_order_id = po.id AND is_posted = 1), 0),
       balance_payable      = GREATEST(0, COALESCE(po.total_adjustment_amount, 0) + COALESCE(
         (SELECT SUM(total_value) FROM goods_received_adnan
          WHERE purchase_order_id = po.id AND grn_status != 'cancelled'), 0)
         - COALESCE(
         (SELECT SUM(amount_paid) FROM purchase_payments_adnan
          WHERE purchase_order_id = po.id AND is_posted = 1), 0)),
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
               WHERE purchase_order_id = po.id AND is_posted = 1), 0) <= 0
              THEN 'unpaid'
         WHEN COALESCE(
              (SELECT SUM(amount_paid) FROM purchase_payments_adnan
               WHERE purchase_order_id = po.id AND is_posted = 1), 0) <
              COALESCE(
              (SELECT SUM(total_value) FROM goods_received_adnan
               WHERE purchase_order_id = po.id AND grn_status != 'cancelled'), 0)
              THEN 'partial'
         WHEN COALESCE(
              (SELECT SUM(amount_paid) FROM purchase_payments_adnan
               WHERE purchase_order_id = po.id AND is_posted = 1), 0) >=
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

const PUBLIC_PREFIXES = [
  "/api/auth/",
  "/api/_",
  // nuxt-auth-utils session endpoint, nuxt icon, etc.
  "/api/kiosk/",
  "/api/device/",
  "/api/verify/",
  "/api/cron/"
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
  var _a, _b, _c, _d;
  const path = (_a = event.path) != null ? _a : "";
  if (!path.startsWith("/api/")) return;
  if (PUBLIC_PREFIXES.some((p) => path.startsWith(p))) return;
  if (path.split("?")[0] === "/api/branches" && event.method === "GET") return;
  const session = await getUserSession(event);
  if (!((_b = session == null ? void 0 : session.user) == null ? void 0 : _b.id)) {
    throw createError$1({ statusCode: 401, statusMessage: "Not authenticated" });
  }
  const timeoutMin = Number((await getAppSettings()).security_policy.sessionTimeout) || 0;
  const signedInAt = Number((_c = session.loggedInAt) != null ? _c : 0);
  if (timeoutMin > 0 && signedInAt && Date.now() - signedInAt > timeoutMin * 6e4) {
    await clearUserSession(event);
    throw createError$1({ statusCode: 401, statusMessage: "Session expired \u2014 please sign in again" });
  }
  const role = ((_d = session.user.role) != null ? _d : "").toLowerCase();
  if (["admin", "superadmin"].includes(role)) return;
  if (path.startsWith("/api/me/")) return;
  if (path.startsWith("/api/settings") && event.method === "GET") return;
  const entry = PATH_MODULE_MAP.find((e) => path.startsWith(e.prefix));
  if (!entry) return;
  const permissions = await resolvePermissions(session.user.id, role);
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

const _lazy_c01xCl = () => import('../routes/api/accounts/all-accounts.get.mjs');
const _lazy_UwcocH = () => import('../routes/api/accounts/balance-sheet.get.mjs');
const _lazy_Fe97__ = () => import('../routes/api/accounts/coa.get.mjs');
const _lazy_qiBco1 = () => import('../routes/api/accounts/coa.post.mjs');
const _lazy_ihl7rh = () => import('../routes/api/accounts/coa/_id_.patch.mjs');
const _lazy_riUI4y = () => import('../routes/api/accounts/daily-log.get.mjs');
const _lazy_Ip5HZO = () => import('../routes/api/accounts/dashboard.get.mjs');
const _lazy_XKhvTr = () => import('../routes/api/accounts/day-end-reconciliation.get.mjs');
const _lazy_1qDgJI = () => import('../routes/api/accounts/journal.get.mjs');
const _lazy_OpekTI = () => import('../routes/api/accounts/journal.post.mjs');
const _lazy_hMd_YS = () => import('../routes/api/accounts/journal/_id_.delete.mjs');
const _lazy_459SU6 = () => import('../routes/api/accounts/journal/_id/reverse.post.mjs');
const _lazy_0lzoxt = () => import('../routes/api/accounts/statements.get.mjs');
const _lazy_VQd24Q = () => import('../routes/api/accounts/tax-statement.get.mjs');
const _lazy_yxxaN3 = () => import('../routes/api/accounts/transfer.get.mjs');
const _lazy_CxiRaD = () => import('../routes/api/accounts/transfer.post.mjs');
const _lazy__AGdha = () => import('../routes/api/accounts/vouchers.get.mjs');
const _lazy_TWu8R9 = () => import('../routes/api/accounts/vouchers.post.mjs');
const _lazy__LZl1t = () => import('../routes/api/admin/audit-logs.get.mjs');
const _lazy_26UgKa = () => import('../routes/api/admin/cashflow.get.mjs');
const _lazy_4UIlKv = () => import('../routes/api/admin/chairman-report.get.mjs');
const _lazy_Zs6Bvx = () => import('../routes/api/admin/clear-cache.post.mjs');
const _lazy_mrgV68 = () => import('../routes/api/admin/customer-reconciliation.get.mjs');
const _lazy_K9luYl = () => import('../routes/api/admin/customer-reconciliation.post.mjs');
const _lazy_KxtpLQ = () => import('../routes/api/admin/daily-summary.get.mjs');
const _lazy_4nNUBp = () => import('../routes/api/admin/dashboard.get.mjs');
const _lazy_39pdOm = () => import('../routes/api/admin/db-viewer.get.mjs');
const _lazy_R2WSrk = () => import('../routes/api/admin/employees.get.mjs');
const _lazy_XlwqFl = () => import('../routes/api/admin/employees.post.mjs');
const _lazy_ajoDdT = () => import('../routes/api/admin/ledger-repair.get.mjs');
const _lazy_U0QWjc = () => import('../routes/api/admin/ledger-repair.post.mjs');
const _lazy_vcfvGL = () => import('../routes/api/admin/operations-center.get.mjs');
const _lazy_TMoPHG = () => import('../routes/api/admin/recycle-bin.get.mjs');
const _lazy_F5l1dn = () => import('../routes/api/admin/recycle-bin/_id_.get.mjs');
const _lazy_BUFBFO = () => import('../routes/api/admin/recycle-bin/_id/purge.post.mjs');
const _lazy_NLbZIc = () => import('../routes/api/admin/recycle-bin/_id/restore.post.mjs');
const _lazy_m4ZNW3 = () => import('../routes/api/admin/role-matrix.get.mjs');
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
const _lazy_xFbBLO = () => import('../routes/api/bank/accounts/_id_.patch.mjs');
const _lazy_uoSNHx = () => import('../routes/api/bank/index.get.mjs');
const _lazy_ZBPP_8 = () => import('../routes/api/bank/index.post.mjs');
const _lazy_8GiNMM = () => import('../routes/api/bank/dashboard.get.mjs');
const _lazy_Qe6VsI = () => import('../routes/api/bank/gl-ledger.get.mjs');
const _lazy_BdYgwb = () => import('../routes/api/bank/reconciliation.get.mjs');
const _lazy_Fkj2cV = () => import('../routes/api/bank/reconciliation/_id/toggle.post.mjs');
const _lazy_eOUsS8 = () => import('../routes/api/bank/transaction-types/_id_.patch.mjs');
const _lazy_UYZKgl = () => import('../routes/api/bank/index.get2.mjs');
const _lazy_yS6X56 = () => import('../routes/api/bank/index.post2.mjs');
const _lazy_7F428h = () => import('../routes/api/bank/transactions/_id_.delete.mjs');
const _lazy_d4KynI = () => import('../routes/api/bank/transactions/_id_.get.mjs');
const _lazy__ue7Ll = () => import('../routes/api/bank/transactions/_id_.patch.mjs');
const _lazy_0qs2_a = () => import('../routes/api/bank/transactions/bulk.post.mjs');
const _lazy_wJleyC = () => import('../routes/api/bank/index.get3.mjs');
const _lazy_WGi3N9 = () => import('../routes/api/bank/index.post3.mjs');
const _lazy_1HBQXn = () => import('../routes/api/bank/transfer.post.mjs');
const _lazy_LI7zQS = () => import('../routes/api/bank/unified-ledger.get.mjs');
const _lazy_dbWO0f = () => import('../routes/api/branches.get.mjs');
const _lazy_D_ZcEq = () => import('../routes/api/branches.post.mjs');
const _lazy_bg3qDK = () => import('../routes/api/branches/_id_.put.mjs');
const _lazy_Dmsgl1 = () => import('../routes/api/collector/collect.post.mjs');
const _lazy__w2iwx = () => import('../routes/api/collector/schedule.get.mjs');
const _lazy_4RXjT0 = () => import('../routes/api/credit-sales/_id_.delete.mjs');
const _lazy_bTiciI = () => import('../routes/api/credit-sales/_id_.get.mjs');
const _lazy_umPnM9 = () => import('../routes/api/credit-sales/_id/admin-edit.put.mjs');
const _lazy_51kZFP = () => import('../routes/api/credit-sales/_id/amendments.get.mjs');
const _lazy_orDMr_ = () => import('../routes/api/credit-sales/_id/amendments.post.mjs');
const _lazy_Nvf_LD = () => import('../routes/api/credit-sales/_id/deliver.post.mjs');
const _lazy_4ZBbUp = () => import('../routes/api/credit-sales/_id/dispatch-slip.get.mjs');
const _lazy_F5_GMF = () => import('../routes/api/credit-sales/_id/gates.get.mjs');
const _lazy_OlFXlX = () => import('../routes/api/credit-sales/_id/gates.post.mjs');
const _lazy_vz1Nqn = () => import('../routes/api/credit-sales/_id/over-deliveries.get.mjs');
const _lazy_InwNG6 = () => import('../routes/api/credit-sales/_id/over-delivery.post.mjs');
const _lazy_99iR_P = () => import('../routes/api/credit-sales/_id/override-status.post.mjs');
const _lazy_r935Lm = () => import('../routes/api/credit-sales/_id/payment.post.mjs');
const _lazy_NgHcoJ = () => import('../routes/api/credit-sales/_id/price-impact.get.mjs');
const _lazy_6PzKYU = () => import('../routes/api/credit-sales/_id/return.post.mjs');
const _lazy_HhRfDu = () => import('../routes/api/credit-sales/_id/returns.get.mjs');
const _lazy_7KZFwE = () => import('../routes/api/credit-sales/_id/reverse-dispatch.post.mjs');
const _lazy_S8fogo = () => import('../routes/api/credit-sales/_id/workflow.post.mjs');
const _lazy_LvHlQ8 = () => import('../routes/api/credit-sales/ageing.get.mjs');
const _lazy_BwGF78 = () => import('../routes/api/credit-sales/amendments/_amendmentId/decide.post.mjs');
const _lazy_1V8kcE = () => import('../routes/api/credit-sales/amendments/_amendmentId/revert.post.mjs');
const _lazy_2PTEKN = () => import('../routes/api/credit-sales/approval-limits.get.mjs');
const _lazy_oJFtlF = () => import('../routes/api/credit-sales/approval-limits.post.mjs');
const _lazy_r3MgYa = () => import('../routes/api/credit-sales/attention.get.mjs');
const _lazy_0Iz3pB = () => import('../routes/api/credit-sales/backdated.post.mjs');
const _lazy_iLqkaJ = () => import('../routes/api/credit-sales/credit-limits.get.mjs');
const _lazy_SsPH3p = () => import('../routes/api/credit-sales/credit-limits.patch.mjs');
const _lazy_tKZ1zK = () => import('../routes/api/credit-sales/delivery-schedule.get.mjs');
const _lazy_VeSQXe = () => import('../routes/api/credit-sales/delivery-schedule.post.mjs');
const _lazy_JfJGS6 = () => import('../routes/api/credit-sales/dispatch.get.mjs');
const _lazy_1T13Sq = () => import('../routes/api/credit-sales/export/ledger.csv.get.mjs');
const _lazy_HfsloQ = () => import('../routes/api/credit-sales/export/orders-detail.csv.get.mjs');
const _lazy_XZ8XKe = () => import('../routes/api/credit-sales/export/orders.csv.get.mjs');
const _lazy_DPPv1G = () => import('../routes/api/credit-sales/export/payments.csv.get.mjs');
const _lazy_jTqAsf = () => import('../routes/api/index.get.mjs');
const _lazy_Bmlovq = () => import('../routes/api/index.post.mjs');
const _lazy_7wRNOq = () => import('../routes/api/credit-sales/ledger.get.mjs');
const _lazy_ozFVkq = () => import('../routes/api/credit-sales/ledger/adjustment.post.mjs');
const _lazy_0NjJP9 = () => import('../routes/api/credit-sales/over-deliveries.get.mjs');
const _lazy_jxtTGI = () => import('../routes/api/credit-sales/over-deliveries/_odId/retrieve.post.mjs');
const _lazy_3t8D6T = () => import('../routes/api/credit-sales/over-deliveries/_odId/status.patch.mjs');
const _lazy_KS3_HC = () => import('../routes/api/credit-sales/payment-watch.get.mjs');
const _lazy_Xiu7kP = () => import('../routes/api/credit-sales/payments.get.mjs');
const _lazy_RsSmbp = () => import('../routes/api/credit-sales/payments/_paymentId_.get.mjs');
const _lazy_RrYPg4 = () => import('../routes/api/credit-sales/payments/reverse.post.mjs');
const _lazy_2mLxSG = () => import('../routes/api/credit-sales/pending-requests.get.mjs');
const _lazy_n3t0VF = () => import('../routes/api/credit-sales/pending-requests/_id/link-result.post.mjs');
const _lazy_z_AM0p = () => import('../routes/api/credit-sales/pending-requests/_id/reject.post.mjs');
const _lazy_AZv5Ti = () => import('../routes/api/credit-sales/production-queue.get.mjs');
const _lazy_ic0vEj = () => import('../routes/api/credit-sales/production-queue/reorder.patch.mjs');
const _lazy_MkwgIS = () => import('../routes/api/credit-sales/qr-scan-log.get.mjs');
const _lazy_87fzbq = () => import('../routes/api/credit-sales/reports/product-sales.get.mjs');
const _lazy_tDlibw = () => import('../routes/api/credit-sales/reports/sales.get.mjs');
const _lazy_1XcB5i = () => import('../routes/api/credit-sales/returns.get.mjs');
const _lazy_2ra6RC = () => import('../routes/api/credit-sales/returns/_returnId_.delete.mjs');
const _lazy_YJ8ACN = () => import('../routes/api/credit-sales/returns/_returnId/status.patch.mjs');
const _lazy_16Y6DB = () => import('../routes/api/cron/backup-alert.get.mjs');
const _lazy_aqOjmC = () => import('../routes/api/cron/daily-digest.get.mjs');
const _lazy_cLnt8L = () => import('../routes/api/cron/db-backup.get.mjs');
const _lazy_D9rGt5 = () => import('../routes/api/customers/_id_.delete.mjs');
const _lazy_ynvw5A = () => import('../routes/api/customers/_id_.get.mjs');
const _lazy_R3CrZB = () => import('../routes/api/customers/_id_.patch.mjs');
const _lazy_NuXCtB = () => import('../routes/api/customers/_id/advance-credit.get.mjs');
const _lazy_vHdMNk = () => import('../routes/api/customers/_id/allot-advance.post.mjs');
const _lazy_UQ9kUi = () => import('../routes/api/customers/_id/collect-payment.post.mjs');
const _lazy_dtYaK6 = () => import('../routes/api/customers/_id/collection-hide.post.mjs');
const _lazy_cA2yih = () => import('../routes/api/customers/_id/credit-exposure.get.mjs');
const _lazy_2D6XxH = () => import('../routes/api/customers/_id/notes.post.mjs');
const _lazy_Gf0b_8 = () => import('../routes/api/customers/_id/notes/_noteId_.delete.mjs');
const _lazy_VHwm3o = () => import('../routes/api/customers/_id/open-orders.get.mjs');
const _lazy_ePG5aP = () => import('../routes/api/customers/_id/profile.get.mjs');
const _lazy_tz2RcQ = () => import('../routes/api/customers/_id/refund-info.get.mjs');
const _lazy_GeBUbB = () => import('../routes/api/customers/_id/refund.post.mjs');
const _lazy_IuABBZ = () => import('../routes/api/customers/_id/statement.get.mjs');
const _lazy_yUIFst = () => import('../routes/api/customers/_id/status.post.mjs');
const _lazy_wIAsBb = () => import('../routes/api/customers/export.csv.get.mjs');
const _lazy_MA8PYW = () => import('../routes/api/index.get2.mjs');
const _lazy_uiriQK = () => import('../routes/api/index.post2.mjs');
const _lazy_YfO4V7 = () => import('../routes/api/dashboard/activity.get.mjs');
const _lazy_zeYMC4 = () => import('../routes/api/dashboard/exception-radar.get.mjs');
const _lazy_VpOmuS = () => import('../routes/api/dashboard/monthly-revenue.get.mjs');
const _lazy_knfzfj = () => import('../routes/api/dashboard/stats.get.mjs');
const _lazy_TvzntP = () => import('../routes/api/device/adms.mjs');
const _lazy_Wp6TH_ = () => import('../routes/api/expenses/_id_.delete.mjs');
const _lazy_kP_mAq = () => import('../routes/api/expenses/_id_.get.mjs');
const _lazy_bmO76T = () => import('../routes/api/expenses/_id_.patch.mjs');
const _lazy_6LOCAy = () => import('../routes/api/expenses/_id/approve.post.mjs');
const _lazy_hDaep0 = () => import('../routes/api/expenses/categories.get.mjs');
const _lazy_w3SXNT = () => import('../routes/api/expenses/categories.post.mjs');
const _lazy_2omFql = () => import('../routes/api/expenses/categories/_id_.patch.mjs');
const _lazy_NQB3hT = () => import('../routes/api/expenses/dashboard.get.mjs');
const _lazy_31Agz1 = () => import('../routes/api/index.get3.mjs');
const _lazy_MCTcez = () => import('../routes/api/index.post3.mjs');
const _lazy_TXnAPQ = () => import('../routes/api/expenses/petty-cash-accounts.get.mjs');
const _lazy_ff7tsb = () => import('../routes/api/expenses/subcategories.get.mjs');
const _lazy_ADzc7K = () => import('../routes/api/expenses/subcategories/_id_.patch.mjs');
const _lazy_NJxOMT = () => import('../routes/api/fleet/dashboard.get.mjs');
const _lazy_HzjYJ7 = () => import('../routes/api/fleet/drivers.get.mjs');
const _lazy_bVQlNR = () => import('../routes/api/fleet/drivers.post.mjs');
const _lazy_b_mrA9 = () => import('../routes/api/fleet/drivers/_id_.get.mjs');
const _lazy_4l5Qn9 = () => import('../routes/api/fleet/drivers/_id_.put.mjs');
const _lazy_jzpAEP = () => import('../routes/api/fleet/drivers/_id/documents.post.mjs');
const _lazy_wLUF0P = () => import('../routes/api/fleet/drivers/documents/_id_.delete.mjs');
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
const _lazy_RAENK7 = () => import('../routes/api/fleet/rentals.get.mjs');
const _lazy_GWzH6C = () => import('../routes/api/fleet/rentals.post.mjs');
const _lazy_JmYAT4 = () => import('../routes/api/fleet/rentals/_id_.patch.mjs');
const _lazy_94_5Fx = () => import('../routes/api/fleet/reports/drivers.get.mjs');
const _lazy_URfypq = () => import('../routes/api/fleet/reports/maintenance.get.mjs');
const _lazy_imTY17 = () => import('../routes/api/fleet/reports/pnl.get.mjs');
const _lazy_MUr2lK = () => import('../routes/api/fleet/reports/trips.get.mjs');
const _lazy_eLjU_4 = () => import('../routes/api/fleet/reports/vehicles.get.mjs');
const _lazy_SN6hHA = () => import('../routes/api/fleet/trips.get.mjs');
const _lazy_zwHKxS = () => import('../routes/api/fleet/trips.post.mjs');
const _lazy_jRGkRo = () => import('../routes/api/fleet/trips/_id_.get.mjs');
const _lazy_DOo6lb = () => import('../routes/api/fleet/trips/_id_.patch.mjs');
const _lazy_eaOHKy = () => import('../routes/api/fleet/trips/consolidation-suggestions.get.mjs');
const _lazy_rX8BnN = () => import('../routes/api/fleet/trips/consolidation-suggestions.post.mjs');
const _lazy_C2lvSy = () => import('../routes/api/fleet/vehicles.get.mjs');
const _lazy_CxlcjP = () => import('../routes/api/fleet/vehicles.post.mjs');
const _lazy_owOEk4 = () => import('../routes/api/fleet/vehicles/_id_.get.mjs');
const _lazy_j0OJys = () => import('../routes/api/fleet/vehicles/_id_.put.mjs');
const _lazy_kQONX0 = () => import('../routes/api/fleet/vehicles/_id/documents.post.mjs');
const _lazy_NEu1ac = () => import('../routes/api/fleet/vehicles/documents/_id_.delete.mjs');
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
const _lazy_94zPLK = () => import('../routes/api/ledger/audit.get.mjs');
const _lazy_5JHpyC = () => import('../routes/api/ledger/review.get.mjs');
const _lazy_HA3Jl5 = () => import('../routes/api/ledger/review.post.mjs');
const _lazy_7enrrG = () => import('../routes/api/loans/_id_.delete.mjs');
const _lazy_2EyevL = () => import('../routes/api/loans/_id_.get.mjs');
const _lazy_JNFp6Q = () => import('../routes/api/loans/_id/repay.post.mjs');
const _lazy_XyWAof = () => import('../routes/api/index.get4.mjs');
const _lazy_uoVthA = () => import('../routes/api/index.post4.mjs');
const _lazy_dKhNcz = () => import('../routes/api/loans/repayments/_repayId_.delete.mjs');
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
const _lazy_qgeiK9 = () => import('../routes/api/pos/_id_.delete.mjs');
const _lazy_z2bagg = () => import('../routes/api/pos/_id_.get.mjs');
const _lazy_KI_xof = () => import('../routes/api/pos/_id_.patch.mjs');
const _lazy_ROa0XS = () => import('../routes/api/pos/complete.post.mjs');
const _lazy_iu5TWk = () => import('../routes/api/pos/customers/_id/collect-payment.post.mjs');
const _lazy_rF1qvx = () => import('../routes/api/pos/customers/_id/ledger.get.mjs');
const _lazy_AwfnFM = () => import('../routes/api/pos/dashboard.get.mjs');
const _lazy_xYyX9K = () => import('../routes/api/pos/eod.get.mjs');
const _lazy_CLalkh = () => import('../routes/api/pos/eod.post.mjs');
const _lazy_0rYDtk = () => import('../routes/api/pos/eod/_id/deposit.post.mjs');
const _lazy_CYj4iS = () => import('../routes/api/pos/exit/_order_.get.mjs');
const _lazy_fF0Jsm = () => import('../routes/api/pos/exit/_order/clear.post.mjs');
const _lazy_SjGOvy = () => import('../routes/api/pos/exit/_order/request-approval.post.mjs');
const _lazy_796rAP = () => import('../routes/api/pos/pending-approvals.get.mjs');
const _lazy_iTXZA1 = () => import('../routes/api/pos/pending-approvals/_id/approve.post.mjs');
const _lazy_vlDYWZ = () => import('../routes/api/pos/pending-approvals/_id/reject.post.mjs');
const _lazy_8KbvOw = () => import('../routes/api/pos/products.get.mjs');
const _lazy_KMIskq = () => import('../routes/api/pos/reports.get.mjs');
const _lazy_1zvWiv = () => import('../routes/api/pos/today.get.mjs');
const _lazy_7rIu_E = () => import('../routes/api/positions.get.mjs');
const _lazy_OQ_2F0 = () => import('../routes/api/production/_id_.get.mjs');
const _lazy_KqcQ1r = () => import('../routes/api/production/_id_.patch.mjs');
const _lazy_ipbJup = () => import('../routes/api/production/dispatch-report.get.mjs');
const _lazy_kPQQ0a = () => import('../routes/api/index.get5.mjs');
const _lazy_usmPap = () => import('../routes/api/index.post5.mjs');
const _lazy_te9Rfa = () => import('../routes/api/production/requirement.get.mjs');
const _lazy_eL2s6T = () => import('../routes/api/production/requirement.post.mjs');
const _lazy_nPu_cq = () => import('../routes/api/production/totals.get.mjs');
const _lazy_cVKdHK = () => import('../routes/api/products/base.get.mjs');
const _lazy_E8SIPx = () => import('../routes/api/products/base.post.mjs');
const _lazy_QUxQuf = () => import('../routes/api/products/base/_id_.delete.mjs');
const _lazy_iABFz4 = () => import('../routes/api/products/base/_id_.put.mjs');
const _lazy_JIlqRp = () => import('../routes/api/products/export/csv.get.mjs');
const _lazy_oKSIbI = () => import('../routes/api/products/hub.get.mjs');
const _lazy_SjH7cD = () => import('../routes/api/index.get6.mjs');
const _lazy_nYxeI6 = () => import('../routes/api/products/inventory.get.mjs');
const _lazy_DPwLId = () => import('../routes/api/products/pricing-engine.get.mjs');
const _lazy_Uy2SlM = () => import('../routes/api/products/pricing-engine.post.mjs');
const _lazy_uI7Ond = () => import('../routes/api/products/pricing.get.mjs');
const _lazy_PerWog = () => import('../routes/api/products/pricing.post.mjs');
const _lazy_Pw3uxj = () => import('../routes/api/products/pricing/_variantId_.get.mjs');
const _lazy_26nAdM = () => import('../routes/api/products/pricing/_variantId_.post.mjs');
const _lazy_bqRQIr = () => import('../routes/api/products/pricing/_variantId/archive.post.mjs');
const _lazy_fVQACU = () => import('../routes/api/products/pricing/history.get.mjs');
const _lazy_40S7QS = () => import('../routes/api/products/stock-adjustments.get.mjs');
const _lazy_WtXym0 = () => import('../routes/api/products/stock-adjustments.post.mjs');
const _lazy_JeCPZf = () => import('../routes/api/products/stock-adjustments/_id/status.patch.mjs');
const _lazy_WtNgBq = () => import('../routes/api/products/variants.get.mjs');
const _lazy_P3mEsN = () => import('../routes/api/products/variants.post.mjs');
const _lazy_1ldj69 = () => import('../routes/api/products/variants/_id_.delete.mjs');
const _lazy_oUf_op = () => import('../routes/api/products/variants/_id_.put.mjs');
const _lazy_t4EWGv = () => import('../routes/api/purchase/adjustments.get.mjs');
const _lazy_NWb1BO = () => import('../routes/api/purchase/adjustments.post.mjs');
const _lazy_z0l6Xz = () => import('../routes/api/purchase/adjustments/_id_.delete.mjs');
const _lazy_YbVCQg = () => import('../routes/api/purchase/adjustments/_id_.get.mjs');
const _lazy_KhFKQ0 = () => import('../routes/api/purchase/adjustments/_id_.patch.mjs');
const _lazy_6ScyJe = () => import('../routes/api/purchase/analytics.get.mjs');
const _lazy_fATQAP = () => import('../routes/api/purchase/bank-statement.get.mjs');
const _lazy_qRyy5s = () => import('../routes/api/purchase/commodities.get.mjs');
const _lazy_PtLhhl = () => import('../routes/api/purchase/commodities.post.mjs');
const _lazy_tyS575 = () => import('../routes/api/purchase/commodities/_id_.patch.mjs');
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
const _lazy_4vKnfl = () => import('../routes/api/search.get.mjs');
const _lazy_IJc5D3 = () => import('../routes/api/settings/app.get.mjs');
const _lazy_Oege2o = () => import('../routes/api/settings/app.put.mjs');
const _lazy_p0TZFF = () => import('../routes/api/settings/credit-workflow.get.mjs');
const _lazy_JXkU1g = () => import('../routes/api/settings/credit-workflow.put.mjs');
const _lazy_ZCBnco = () => import('../routes/api/settings/delivery.get.mjs');
const _lazy_Ork_6h = () => import('../routes/api/settings/delivery.put.mjs');
const _lazy_l9ZXLd = () => import('../routes/api/settings/documents.get.mjs');
const _lazy_QE_mkM = () => import('../routes/api/settings/documents.put.mjs');
const _lazy_4qluUQ = () => import('../routes/api/settings/tax.get.mjs');
const _lazy_yjanKr = () => import('../routes/api/settings/tax.put.mjs');
const _lazy_OhhMch = () => import('../routes/api/settings/telegram.get.mjs');
const _lazy_6xxkxz = () => import('../routes/api/settings/telegram.put.mjs');
const _lazy_3YOaFH = () => import('../routes/api/index.get7.mjs');
const _lazy_1TJH3n = () => import('../routes/api/trading/commodities.get.mjs');
const _lazy_VGz0Vx = () => import('../routes/api/trading/dashboard.get.mjs');
const _lazy_EHSq1U = () => import('../routes/api/trading/margin-report.get.mjs');
const _lazy_WGPTHc = () => import('../routes/api/trading/partners.get.mjs');
const _lazy_aKBrbb = () => import('../routes/api/trading/partners.post.mjs');
const _lazy_UnZTdH = () => import('../routes/api/trading/payments/_paymentId_.delete.mjs');
const _lazy_JPyUYM = () => import('../routes/api/trading/sales.get.mjs');
const _lazy_9s38uD = () => import('../routes/api/trading/sales.post.mjs');
const _lazy_tRL9Ke = () => import('../routes/api/trading/sales/_id_.delete.mjs');
const _lazy_9HHYYz = () => import('../routes/api/trading/sales/_id_.get.mjs');
const _lazy_jB2IyJ = () => import('../routes/api/trading/sales/_id/dispatch.post.mjs');
const _lazy_zfx68K = () => import('../routes/api/trading/sales/_id/edit.post.mjs');
const _lazy_awT02x = () => import('../routes/api/trading/sales/_id/gate-pass.get.mjs');
const _lazy_FOvFxP = () => import('../routes/api/trading/sales/_id/invoice.get.mjs');
const _lazy_2EpK0U = () => import('../routes/api/trading/sales/_id/payment.post.mjs');
const _lazy_WVzSrk = () => import('../routes/api/trading/settlement.post.mjs');
const _lazy_LUII98 = () => import('../routes/api/verify/_order_.get.mjs');
const _lazy_537Ql6 = () => import('../routes/api/verify/_order/deliver.post.mjs');
const _lazy_aeL9WM = () => import('../routes/api/verify/_order/gate.post.mjs');
const _lazy_fz2BBz = () => import('../routes/renderer.mjs').then(function (n) { return n.r; });

const handlers = [
  { route: '', handler: _6tTLGT, lazy: false, middleware: true, method: undefined },
  { route: '', handler: _IPFo7m, lazy: false, middleware: true, method: undefined },
  { route: '/api/accounts/all-accounts', handler: _lazy_c01xCl, lazy: true, middleware: false, method: "get" },
  { route: '/api/accounts/balance-sheet', handler: _lazy_UwcocH, lazy: true, middleware: false, method: "get" },
  { route: '/api/accounts/coa', handler: _lazy_Fe97__, lazy: true, middleware: false, method: "get" },
  { route: '/api/accounts/coa', handler: _lazy_qiBco1, lazy: true, middleware: false, method: "post" },
  { route: '/api/accounts/coa/:id', handler: _lazy_ihl7rh, lazy: true, middleware: false, method: "patch" },
  { route: '/api/accounts/daily-log', handler: _lazy_riUI4y, lazy: true, middleware: false, method: "get" },
  { route: '/api/accounts/dashboard', handler: _lazy_Ip5HZO, lazy: true, middleware: false, method: "get" },
  { route: '/api/accounts/day-end-reconciliation', handler: _lazy_XKhvTr, lazy: true, middleware: false, method: "get" },
  { route: '/api/accounts/journal', handler: _lazy_1qDgJI, lazy: true, middleware: false, method: "get" },
  { route: '/api/accounts/journal', handler: _lazy_OpekTI, lazy: true, middleware: false, method: "post" },
  { route: '/api/accounts/journal/:id', handler: _lazy_hMd_YS, lazy: true, middleware: false, method: "delete" },
  { route: '/api/accounts/journal/:id/reverse', handler: _lazy_459SU6, lazy: true, middleware: false, method: "post" },
  { route: '/api/accounts/statements', handler: _lazy_0lzoxt, lazy: true, middleware: false, method: "get" },
  { route: '/api/accounts/tax-statement', handler: _lazy_VQd24Q, lazy: true, middleware: false, method: "get" },
  { route: '/api/accounts/transfer', handler: _lazy_yxxaN3, lazy: true, middleware: false, method: "get" },
  { route: '/api/accounts/transfer', handler: _lazy_CxiRaD, lazy: true, middleware: false, method: "post" },
  { route: '/api/accounts/vouchers', handler: _lazy__AGdha, lazy: true, middleware: false, method: "get" },
  { route: '/api/accounts/vouchers', handler: _lazy_TWu8R9, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/audit-logs', handler: _lazy__LZl1t, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/cashflow', handler: _lazy_26UgKa, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/chairman-report', handler: _lazy_4UIlKv, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/clear-cache', handler: _lazy_Zs6Bvx, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/customer-reconciliation', handler: _lazy_mrgV68, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/customer-reconciliation', handler: _lazy_K9luYl, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/daily-summary', handler: _lazy_KxtpLQ, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/dashboard', handler: _lazy_4nNUBp, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/db-viewer', handler: _lazy_39pdOm, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/employees', handler: _lazy_R2WSrk, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/employees', handler: _lazy_XlwqFl, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/ledger-repair', handler: _lazy_ajoDdT, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/ledger-repair', handler: _lazy_U0QWjc, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/operations-center', handler: _lazy_vcfvGL, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/recycle-bin', handler: _lazy_TMoPHG, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/recycle-bin/:id', handler: _lazy_F5l1dn, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/recycle-bin/:id/purge', handler: _lazy_BUFBFO, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/recycle-bin/:id/restore', handler: _lazy_NLbZIc, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/role-matrix', handler: _lazy_m4ZNW3, lazy: true, middleware: false, method: "get" },
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
  { route: '/api/bank/accounts/:id', handler: _lazy_xFbBLO, lazy: true, middleware: false, method: "patch" },
  { route: '/api/bank/accounts', handler: _lazy_uoSNHx, lazy: true, middleware: false, method: "get" },
  { route: '/api/bank/accounts', handler: _lazy_ZBPP_8, lazy: true, middleware: false, method: "post" },
  { route: '/api/bank/dashboard', handler: _lazy_8GiNMM, lazy: true, middleware: false, method: "get" },
  { route: '/api/bank/gl-ledger', handler: _lazy_Qe6VsI, lazy: true, middleware: false, method: "get" },
  { route: '/api/bank/reconciliation', handler: _lazy_BdYgwb, lazy: true, middleware: false, method: "get" },
  { route: '/api/bank/reconciliation/:id/toggle', handler: _lazy_Fkj2cV, lazy: true, middleware: false, method: "post" },
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
  { route: '/api/branches', handler: _lazy_D_ZcEq, lazy: true, middleware: false, method: "post" },
  { route: '/api/branches/:id', handler: _lazy_bg3qDK, lazy: true, middleware: false, method: "put" },
  { route: '/api/collector/collect', handler: _lazy_Dmsgl1, lazy: true, middleware: false, method: "post" },
  { route: '/api/collector/schedule', handler: _lazy__w2iwx, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/:id', handler: _lazy_4RXjT0, lazy: true, middleware: false, method: "delete" },
  { route: '/api/credit-sales/:id', handler: _lazy_bTiciI, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/:id/admin-edit', handler: _lazy_umPnM9, lazy: true, middleware: false, method: "put" },
  { route: '/api/credit-sales/:id/amendments', handler: _lazy_51kZFP, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/:id/amendments', handler: _lazy_orDMr_, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/:id/deliver', handler: _lazy_Nvf_LD, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/:id/dispatch-slip', handler: _lazy_4ZBbUp, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/:id/gates', handler: _lazy_F5_GMF, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/:id/gates', handler: _lazy_OlFXlX, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/:id/over-deliveries', handler: _lazy_vz1Nqn, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/:id/over-delivery', handler: _lazy_InwNG6, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/:id/override-status', handler: _lazy_99iR_P, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/:id/payment', handler: _lazy_r935Lm, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/:id/price-impact', handler: _lazy_NgHcoJ, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/:id/return', handler: _lazy_6PzKYU, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/:id/returns', handler: _lazy_HhRfDu, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/:id/reverse-dispatch', handler: _lazy_7KZFwE, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/:id/workflow', handler: _lazy_S8fogo, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/ageing', handler: _lazy_LvHlQ8, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/amendments/:amendmentId/decide', handler: _lazy_BwGF78, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/amendments/:amendmentId/revert', handler: _lazy_1V8kcE, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/approval-limits', handler: _lazy_2PTEKN, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/approval-limits', handler: _lazy_oJFtlF, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/attention', handler: _lazy_r3MgYa, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/backdated', handler: _lazy_0Iz3pB, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/credit-limits', handler: _lazy_iLqkaJ, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/credit-limits', handler: _lazy_SsPH3p, lazy: true, middleware: false, method: "patch" },
  { route: '/api/credit-sales/delivery-schedule', handler: _lazy_tKZ1zK, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/delivery-schedule', handler: _lazy_VeSQXe, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/dispatch', handler: _lazy_JfJGS6, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/export/ledger.csv', handler: _lazy_1T13Sq, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/export/orders-detail.csv', handler: _lazy_HfsloQ, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/export/orders.csv', handler: _lazy_XZ8XKe, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/export/payments.csv', handler: _lazy_DPPv1G, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales', handler: _lazy_jTqAsf, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales', handler: _lazy_Bmlovq, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/ledger', handler: _lazy_7wRNOq, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/ledger/adjustment', handler: _lazy_ozFVkq, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/over-deliveries', handler: _lazy_0NjJP9, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/over-deliveries/:odId/retrieve', handler: _lazy_jxtTGI, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/over-deliveries/:odId/status', handler: _lazy_3t8D6T, lazy: true, middleware: false, method: "patch" },
  { route: '/api/credit-sales/payment-watch', handler: _lazy_KS3_HC, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/payments', handler: _lazy_Xiu7kP, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/payments/:paymentId', handler: _lazy_RsSmbp, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/payments/reverse', handler: _lazy_RrYPg4, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/pending-requests', handler: _lazy_2mLxSG, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/pending-requests/:id/link-result', handler: _lazy_n3t0VF, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/pending-requests/:id/reject', handler: _lazy_z_AM0p, lazy: true, middleware: false, method: "post" },
  { route: '/api/credit-sales/production-queue', handler: _lazy_AZv5Ti, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/production-queue/reorder', handler: _lazy_ic0vEj, lazy: true, middleware: false, method: "patch" },
  { route: '/api/credit-sales/qr-scan-log', handler: _lazy_MkwgIS, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/reports/product-sales', handler: _lazy_87fzbq, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/reports/sales', handler: _lazy_tDlibw, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/returns', handler: _lazy_1XcB5i, lazy: true, middleware: false, method: "get" },
  { route: '/api/credit-sales/returns/:returnId', handler: _lazy_2ra6RC, lazy: true, middleware: false, method: "delete" },
  { route: '/api/credit-sales/returns/:returnId/status', handler: _lazy_YJ8ACN, lazy: true, middleware: false, method: "patch" },
  { route: '/api/cron/backup-alert', handler: _lazy_16Y6DB, lazy: true, middleware: false, method: "get" },
  { route: '/api/cron/daily-digest', handler: _lazy_aqOjmC, lazy: true, middleware: false, method: "get" },
  { route: '/api/cron/db-backup', handler: _lazy_cLnt8L, lazy: true, middleware: false, method: "get" },
  { route: '/api/customers/:id', handler: _lazy_D9rGt5, lazy: true, middleware: false, method: "delete" },
  { route: '/api/customers/:id', handler: _lazy_ynvw5A, lazy: true, middleware: false, method: "get" },
  { route: '/api/customers/:id', handler: _lazy_R3CrZB, lazy: true, middleware: false, method: "patch" },
  { route: '/api/customers/:id/advance-credit', handler: _lazy_NuXCtB, lazy: true, middleware: false, method: "get" },
  { route: '/api/customers/:id/allot-advance', handler: _lazy_vHdMNk, lazy: true, middleware: false, method: "post" },
  { route: '/api/customers/:id/collect-payment', handler: _lazy_UQ9kUi, lazy: true, middleware: false, method: "post" },
  { route: '/api/customers/:id/collection-hide', handler: _lazy_dtYaK6, lazy: true, middleware: false, method: "post" },
  { route: '/api/customers/:id/credit-exposure', handler: _lazy_cA2yih, lazy: true, middleware: false, method: "get" },
  { route: '/api/customers/:id/notes', handler: _lazy_2D6XxH, lazy: true, middleware: false, method: "post" },
  { route: '/api/customers/:id/notes/:noteId', handler: _lazy_Gf0b_8, lazy: true, middleware: false, method: "delete" },
  { route: '/api/customers/:id/open-orders', handler: _lazy_VHwm3o, lazy: true, middleware: false, method: "get" },
  { route: '/api/customers/:id/profile', handler: _lazy_ePG5aP, lazy: true, middleware: false, method: "get" },
  { route: '/api/customers/:id/refund-info', handler: _lazy_tz2RcQ, lazy: true, middleware: false, method: "get" },
  { route: '/api/customers/:id/refund', handler: _lazy_GeBUbB, lazy: true, middleware: false, method: "post" },
  { route: '/api/customers/:id/statement', handler: _lazy_IuABBZ, lazy: true, middleware: false, method: "get" },
  { route: '/api/customers/:id/status', handler: _lazy_yUIFst, lazy: true, middleware: false, method: "post" },
  { route: '/api/customers/export.csv', handler: _lazy_wIAsBb, lazy: true, middleware: false, method: "get" },
  { route: '/api/customers', handler: _lazy_MA8PYW, lazy: true, middleware: false, method: "get" },
  { route: '/api/customers', handler: _lazy_uiriQK, lazy: true, middleware: false, method: "post" },
  { route: '/api/dashboard/activity', handler: _lazy_YfO4V7, lazy: true, middleware: false, method: "get" },
  { route: '/api/dashboard/exception-radar', handler: _lazy_zeYMC4, lazy: true, middleware: false, method: "get" },
  { route: '/api/dashboard/monthly-revenue', handler: _lazy_VpOmuS, lazy: true, middleware: false, method: "get" },
  { route: '/api/dashboard/stats', handler: _lazy_knfzfj, lazy: true, middleware: false, method: "get" },
  { route: '/api/device/adms', handler: _lazy_TvzntP, lazy: true, middleware: false, method: undefined },
  { route: '/api/expenses/:id', handler: _lazy_Wp6TH_, lazy: true, middleware: false, method: "delete" },
  { route: '/api/expenses/:id', handler: _lazy_kP_mAq, lazy: true, middleware: false, method: "get" },
  { route: '/api/expenses/:id', handler: _lazy_bmO76T, lazy: true, middleware: false, method: "patch" },
  { route: '/api/expenses/:id/approve', handler: _lazy_6LOCAy, lazy: true, middleware: false, method: "post" },
  { route: '/api/expenses/categories', handler: _lazy_hDaep0, lazy: true, middleware: false, method: "get" },
  { route: '/api/expenses/categories', handler: _lazy_w3SXNT, lazy: true, middleware: false, method: "post" },
  { route: '/api/expenses/categories/:id', handler: _lazy_2omFql, lazy: true, middleware: false, method: "patch" },
  { route: '/api/expenses/dashboard', handler: _lazy_NQB3hT, lazy: true, middleware: false, method: "get" },
  { route: '/api/expenses', handler: _lazy_31Agz1, lazy: true, middleware: false, method: "get" },
  { route: '/api/expenses', handler: _lazy_MCTcez, lazy: true, middleware: false, method: "post" },
  { route: '/api/expenses/petty-cash-accounts', handler: _lazy_TXnAPQ, lazy: true, middleware: false, method: "get" },
  { route: '/api/expenses/subcategories', handler: _lazy_ff7tsb, lazy: true, middleware: false, method: "get" },
  { route: '/api/expenses/subcategories/:id', handler: _lazy_ADzc7K, lazy: true, middleware: false, method: "patch" },
  { route: '/api/fleet/dashboard', handler: _lazy_NJxOMT, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/drivers', handler: _lazy_HzjYJ7, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/drivers', handler: _lazy_bVQlNR, lazy: true, middleware: false, method: "post" },
  { route: '/api/fleet/drivers/:id', handler: _lazy_b_mrA9, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/drivers/:id', handler: _lazy_4l5Qn9, lazy: true, middleware: false, method: "put" },
  { route: '/api/fleet/drivers/:id/documents', handler: _lazy_jzpAEP, lazy: true, middleware: false, method: "post" },
  { route: '/api/fleet/drivers/documents/:id', handler: _lazy_wLUF0P, lazy: true, middleware: false, method: "delete" },
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
  { route: '/api/fleet/rentals', handler: _lazy_RAENK7, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/rentals', handler: _lazy_GWzH6C, lazy: true, middleware: false, method: "post" },
  { route: '/api/fleet/rentals/:id', handler: _lazy_JmYAT4, lazy: true, middleware: false, method: "patch" },
  { route: '/api/fleet/reports/drivers', handler: _lazy_94_5Fx, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/reports/maintenance', handler: _lazy_URfypq, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/reports/pnl', handler: _lazy_imTY17, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/reports/trips', handler: _lazy_MUr2lK, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/reports/vehicles', handler: _lazy_eLjU_4, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/trips', handler: _lazy_SN6hHA, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/trips', handler: _lazy_zwHKxS, lazy: true, middleware: false, method: "post" },
  { route: '/api/fleet/trips/:id', handler: _lazy_jRGkRo, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/trips/:id', handler: _lazy_DOo6lb, lazy: true, middleware: false, method: "patch" },
  { route: '/api/fleet/trips/consolidation-suggestions', handler: _lazy_eaOHKy, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/trips/consolidation-suggestions', handler: _lazy_rX8BnN, lazy: true, middleware: false, method: "post" },
  { route: '/api/fleet/vehicles', handler: _lazy_C2lvSy, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/vehicles', handler: _lazy_CxlcjP, lazy: true, middleware: false, method: "post" },
  { route: '/api/fleet/vehicles/:id', handler: _lazy_owOEk4, lazy: true, middleware: false, method: "get" },
  { route: '/api/fleet/vehicles/:id', handler: _lazy_j0OJys, lazy: true, middleware: false, method: "put" },
  { route: '/api/fleet/vehicles/:id/documents', handler: _lazy_kQONX0, lazy: true, middleware: false, method: "post" },
  { route: '/api/fleet/vehicles/documents/:id', handler: _lazy_NEu1ac, lazy: true, middleware: false, method: "delete" },
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
  { route: '/api/ledger/audit', handler: _lazy_94zPLK, lazy: true, middleware: false, method: "get" },
  { route: '/api/ledger/review', handler: _lazy_5JHpyC, lazy: true, middleware: false, method: "get" },
  { route: '/api/ledger/review', handler: _lazy_HA3Jl5, lazy: true, middleware: false, method: "post" },
  { route: '/api/loans/:id', handler: _lazy_7enrrG, lazy: true, middleware: false, method: "delete" },
  { route: '/api/loans/:id', handler: _lazy_2EyevL, lazy: true, middleware: false, method: "get" },
  { route: '/api/loans/:id/repay', handler: _lazy_JNFp6Q, lazy: true, middleware: false, method: "post" },
  { route: '/api/loans', handler: _lazy_XyWAof, lazy: true, middleware: false, method: "get" },
  { route: '/api/loans', handler: _lazy_uoVthA, lazy: true, middleware: false, method: "post" },
  { route: '/api/loans/repayments/:repayId', handler: _lazy_dKhNcz, lazy: true, middleware: false, method: "delete" },
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
  { route: '/api/pos/:id', handler: _lazy_qgeiK9, lazy: true, middleware: false, method: "delete" },
  { route: '/api/pos/:id', handler: _lazy_z2bagg, lazy: true, middleware: false, method: "get" },
  { route: '/api/pos/:id', handler: _lazy_KI_xof, lazy: true, middleware: false, method: "patch" },
  { route: '/api/pos/complete', handler: _lazy_ROa0XS, lazy: true, middleware: false, method: "post" },
  { route: '/api/pos/customers/:id/collect-payment', handler: _lazy_iu5TWk, lazy: true, middleware: false, method: "post" },
  { route: '/api/pos/customers/:id/ledger', handler: _lazy_rF1qvx, lazy: true, middleware: false, method: "get" },
  { route: '/api/pos/dashboard', handler: _lazy_AwfnFM, lazy: true, middleware: false, method: "get" },
  { route: '/api/pos/eod', handler: _lazy_xYyX9K, lazy: true, middleware: false, method: "get" },
  { route: '/api/pos/eod', handler: _lazy_CLalkh, lazy: true, middleware: false, method: "post" },
  { route: '/api/pos/eod/:id/deposit', handler: _lazy_0rYDtk, lazy: true, middleware: false, method: "post" },
  { route: '/api/pos/exit/:order', handler: _lazy_CYj4iS, lazy: true, middleware: false, method: "get" },
  { route: '/api/pos/exit/:order/clear', handler: _lazy_fF0Jsm, lazy: true, middleware: false, method: "post" },
  { route: '/api/pos/exit/:order/request-approval', handler: _lazy_SjGOvy, lazy: true, middleware: false, method: "post" },
  { route: '/api/pos/pending-approvals', handler: _lazy_796rAP, lazy: true, middleware: false, method: "get" },
  { route: '/api/pos/pending-approvals/:id/approve', handler: _lazy_iTXZA1, lazy: true, middleware: false, method: "post" },
  { route: '/api/pos/pending-approvals/:id/reject', handler: _lazy_vlDYWZ, lazy: true, middleware: false, method: "post" },
  { route: '/api/pos/products', handler: _lazy_8KbvOw, lazy: true, middleware: false, method: "get" },
  { route: '/api/pos/reports', handler: _lazy_KMIskq, lazy: true, middleware: false, method: "get" },
  { route: '/api/pos/today', handler: _lazy_1zvWiv, lazy: true, middleware: false, method: "get" },
  { route: '/api/positions', handler: _lazy_7rIu_E, lazy: true, middleware: false, method: "get" },
  { route: '/api/production/:id', handler: _lazy_OQ_2F0, lazy: true, middleware: false, method: "get" },
  { route: '/api/production/:id', handler: _lazy_KqcQ1r, lazy: true, middleware: false, method: "patch" },
  { route: '/api/production/dispatch-report', handler: _lazy_ipbJup, lazy: true, middleware: false, method: "get" },
  { route: '/api/production', handler: _lazy_kPQQ0a, lazy: true, middleware: false, method: "get" },
  { route: '/api/production', handler: _lazy_usmPap, lazy: true, middleware: false, method: "post" },
  { route: '/api/production/requirement', handler: _lazy_te9Rfa, lazy: true, middleware: false, method: "get" },
  { route: '/api/production/requirement', handler: _lazy_eL2s6T, lazy: true, middleware: false, method: "post" },
  { route: '/api/production/totals', handler: _lazy_nPu_cq, lazy: true, middleware: false, method: "get" },
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
  { route: '/api/products/pricing/:variantId', handler: _lazy_Pw3uxj, lazy: true, middleware: false, method: "get" },
  { route: '/api/products/pricing/:variantId', handler: _lazy_26nAdM, lazy: true, middleware: false, method: "post" },
  { route: '/api/products/pricing/:variantId/archive', handler: _lazy_bqRQIr, lazy: true, middleware: false, method: "post" },
  { route: '/api/products/pricing/history', handler: _lazy_fVQACU, lazy: true, middleware: false, method: "get" },
  { route: '/api/products/stock-adjustments', handler: _lazy_40S7QS, lazy: true, middleware: false, method: "get" },
  { route: '/api/products/stock-adjustments', handler: _lazy_WtXym0, lazy: true, middleware: false, method: "post" },
  { route: '/api/products/stock-adjustments/:id/status', handler: _lazy_JeCPZf, lazy: true, middleware: false, method: "patch" },
  { route: '/api/products/variants', handler: _lazy_WtNgBq, lazy: true, middleware: false, method: "get" },
  { route: '/api/products/variants', handler: _lazy_P3mEsN, lazy: true, middleware: false, method: "post" },
  { route: '/api/products/variants/:id', handler: _lazy_1ldj69, lazy: true, middleware: false, method: "delete" },
  { route: '/api/products/variants/:id', handler: _lazy_oUf_op, lazy: true, middleware: false, method: "put" },
  { route: '/api/purchase/adjustments', handler: _lazy_t4EWGv, lazy: true, middleware: false, method: "get" },
  { route: '/api/purchase/adjustments', handler: _lazy_NWb1BO, lazy: true, middleware: false, method: "post" },
  { route: '/api/purchase/adjustments/:id', handler: _lazy_z0l6Xz, lazy: true, middleware: false, method: "delete" },
  { route: '/api/purchase/adjustments/:id', handler: _lazy_YbVCQg, lazy: true, middleware: false, method: "get" },
  { route: '/api/purchase/adjustments/:id', handler: _lazy_KhFKQ0, lazy: true, middleware: false, method: "patch" },
  { route: '/api/purchase/analytics', handler: _lazy_6ScyJe, lazy: true, middleware: false, method: "get" },
  { route: '/api/purchase/bank-statement', handler: _lazy_fATQAP, lazy: true, middleware: false, method: "get" },
  { route: '/api/purchase/commodities', handler: _lazy_qRyy5s, lazy: true, middleware: false, method: "get" },
  { route: '/api/purchase/commodities', handler: _lazy_PtLhhl, lazy: true, middleware: false, method: "post" },
  { route: '/api/purchase/commodities/:id', handler: _lazy_tyS575, lazy: true, middleware: false, method: "patch" },
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
  { route: '/api/search', handler: _lazy_4vKnfl, lazy: true, middleware: false, method: "get" },
  { route: '/api/settings/app', handler: _lazy_IJc5D3, lazy: true, middleware: false, method: "get" },
  { route: '/api/settings/app', handler: _lazy_Oege2o, lazy: true, middleware: false, method: "put" },
  { route: '/api/settings/credit-workflow', handler: _lazy_p0TZFF, lazy: true, middleware: false, method: "get" },
  { route: '/api/settings/credit-workflow', handler: _lazy_JXkU1g, lazy: true, middleware: false, method: "put" },
  { route: '/api/settings/delivery', handler: _lazy_ZCBnco, lazy: true, middleware: false, method: "get" },
  { route: '/api/settings/delivery', handler: _lazy_Ork_6h, lazy: true, middleware: false, method: "put" },
  { route: '/api/settings/documents', handler: _lazy_l9ZXLd, lazy: true, middleware: false, method: "get" },
  { route: '/api/settings/documents', handler: _lazy_QE_mkM, lazy: true, middleware: false, method: "put" },
  { route: '/api/settings/tax', handler: _lazy_4qluUQ, lazy: true, middleware: false, method: "get" },
  { route: '/api/settings/tax', handler: _lazy_yjanKr, lazy: true, middleware: false, method: "put" },
  { route: '/api/settings/telegram', handler: _lazy_OhhMch, lazy: true, middleware: false, method: "get" },
  { route: '/api/settings/telegram', handler: _lazy_6xxkxz, lazy: true, middleware: false, method: "put" },
  { route: '/api/suppliers', handler: _lazy_3YOaFH, lazy: true, middleware: false, method: "get" },
  { route: '/api/trading/commodities', handler: _lazy_1TJH3n, lazy: true, middleware: false, method: "get" },
  { route: '/api/trading/dashboard', handler: _lazy_VGz0Vx, lazy: true, middleware: false, method: "get" },
  { route: '/api/trading/margin-report', handler: _lazy_EHSq1U, lazy: true, middleware: false, method: "get" },
  { route: '/api/trading/partners', handler: _lazy_WGPTHc, lazy: true, middleware: false, method: "get" },
  { route: '/api/trading/partners', handler: _lazy_aKBrbb, lazy: true, middleware: false, method: "post" },
  { route: '/api/trading/payments/:paymentId', handler: _lazy_UnZTdH, lazy: true, middleware: false, method: "delete" },
  { route: '/api/trading/sales', handler: _lazy_JPyUYM, lazy: true, middleware: false, method: "get" },
  { route: '/api/trading/sales', handler: _lazy_9s38uD, lazy: true, middleware: false, method: "post" },
  { route: '/api/trading/sales/:id', handler: _lazy_tRL9Ke, lazy: true, middleware: false, method: "delete" },
  { route: '/api/trading/sales/:id', handler: _lazy_9HHYYz, lazy: true, middleware: false, method: "get" },
  { route: '/api/trading/sales/:id/dispatch', handler: _lazy_jB2IyJ, lazy: true, middleware: false, method: "post" },
  { route: '/api/trading/sales/:id/edit', handler: _lazy_zfx68K, lazy: true, middleware: false, method: "post" },
  { route: '/api/trading/sales/:id/gate-pass', handler: _lazy_awT02x, lazy: true, middleware: false, method: "get" },
  { route: '/api/trading/sales/:id/invoice', handler: _lazy_FOvFxP, lazy: true, middleware: false, method: "get" },
  { route: '/api/trading/sales/:id/payment', handler: _lazy_2EpK0U, lazy: true, middleware: false, method: "post" },
  { route: '/api/trading/settlement', handler: _lazy_WVzSrk, lazy: true, middleware: false, method: "post" },
  { route: '/api/verify/:order', handler: _lazy_LUII98, lazy: true, middleware: false, method: "get" },
  { route: '/api/verify/:order/deliver', handler: _lazy_537Ql6, lazy: true, middleware: false, method: "post" },
  { route: '/api/verify/:order/gate', handler: _lazy_aeL9WM, lazy: true, middleware: false, method: "post" },
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

export { $fetch$1 as $, ACCOUNTS_ROLES as A, defineEventHandler as B, defineRenderHandler as C, DISPATCH_ROLES as D, defu as E, deliveryQrSignature as F, encodePath as G, executeAsync as H, generateDeliverySlipNumber as I, getAdvanceCredit as J, getAppSettings as K, getContext as L, getCreditRevenueAccountId as M, getCreditWorkflowSettings as N, getCustomerOutstanding as O, POS_VALID_METHODS as P, getDb as Q, REPORT_TYPES as R, SALES_ROLES as S, TELEGRAM_CATEGORIES as T, getDeliveryQrSecret as U, getExceptionRadar as V, getGLAccountId as W, getLoansReceivableAccountId as X, getMethod as Y, getOrderGateState as Z, getPosCustomerOutstanding as _, ACTION_LIMIT_KEYS as a, releaseOrderPayments as a$, getQuery as a0, getRequestHeader as a1, getRequestIP as a2, getRequestURL as a3, getResponseStatus as a4, getResponseStatusText as a5, getRouteRules as a6, getRouterParam as a7, getUserActionLimit as a8, getUserApprovalLimit as a9, postCommoditySale as aA, postCustomerLedger as aB, postFleetExpenseGl as aC, postGRNJournalEntry as aD, postGoodsOnBoardInvoice as aE, postJournalEntry as aF, postOtherSalesCOGS as aG, postPosSale as aH, postPurchasePaymentJE as aI, presetBranches as aJ, priceAutoApplyEnabled as aK, publicAssetsURL as aL, query as aM, queryOne as aN, queuePendingRequest as aO, readBody as aP, readMultipartFormData as aQ, readRawBody as aR, recalcPO as aS, recordPosExitScan as aT, recordQrScan as aU, recycleArchiveDelete as aV, recycleBegin as aW, recycleFinalize as aX, recyclePurge as aY, recycleRestore as aZ, recycleSnapshotBefore as a_, getUserBranchIds as aa, getUserBranchScope as ab, getUserSession as ac, grnBasisOf as ad, grnPricedQty as ae, hasProtocol as af, hash$1 as ag, invalidatePermCache as ah, isAccountsRole as ai, isAdminRole as aj, isScriptProtocol as ak, joinURL as al, maybeTriggerOwnerDigest as am, maybeTriggerProductionShortfallAlert as an, nextDocNumber as ao, nextNoteNumber as ap, nodeServer as aq, notify as ar, notifyAdmins as as, paginate as at, parseQuery as au, parseURL as av, posExitQrSignature as aw, postBankTransactionJE as ax, postBankTransferJE as ay, postCommodityGRNCost as az, ADMIN_ROLES as b, requireAction as b0, resetAppSettingsCache as b1, resetTelegramCache as b2, resolvePaymentSource as b3, resolvePermissions as b4, restoreCommodityStock as b5, reverseBankTransactionJE as b6, reverseGRNJournalEntry as b7, reversePurchasePaymentJE as b8, runDbBackupNow as b9, runLedgerAudit as ba, sanitizeStatusCode as bb, sendOwnerDigestNow as bc, sendTelegram as bd, serializeRow as be, setHeader as bf, setResponseHeader as bg, setUserSession as bh, suggestAllotment as bi, syncPaymentAllocation as bj, transitionOrder as bk, useNitroApp as bl, useRuntimeConfig as bm, userCanAction as bn, verifyDeliveryQrSignature as bo, voidBridgedTransaction as bp, withQuery as bq, withTrailingSlash as br, withoutTrailingSlash as bs, AMD_POST_STATUSES as c, AMD_PRE_STATUSES as d, APP_SETTING_GROUPS as e, AUDIT_TITLES as f, PRODUCTION_ROLES as g, RUNNING_BALANCE_SQL as h, applyAllotment as i, applyAmendment as j, applyPriceChangeToOpenOrders as k, assertDispatchClear as l, auditLog as m, baseURL as n, branchScopeFor as o, bridgeCustomerPayment as p, buildAssetsURL as q, buildChairmanReport as r, buildOrderReport as s, checkTransactionLimit as t, clearAllPerms as u, clearUserSession as v, createError$1 as w, createHooks as x, decodePath as y, defaultGrnBasis as z };
//# sourceMappingURL=nitro.mjs.map
