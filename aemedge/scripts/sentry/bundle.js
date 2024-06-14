(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.unsafeCSS = exports.supportsAdoptingStyleSheets = exports.getCompatibleStyle = exports.css = exports.adoptStyles = exports.CSSResult = void 0;

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t = window,
      e = exports.supportsAdoptingStyleSheets = t.ShadowRoot && (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype,
      s = Symbol(),
      n = new WeakMap();

class o {
  constructor(t, e, n) {
    if (this._$cssResult$ = !0, n !== s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }

  get styleSheet() {
    let t = this.o;
    const s = this.t;

    if (e && void 0 === t) {
      const e = void 0 !== s && 1 === s.length;
      e && (t = n.get(s)), void 0 === t && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), e && n.set(s, t));
    }

    return t;
  }

  toString() {
    return this.cssText;
  }

}

exports.CSSResult = o;

const r = t => new o("string" == typeof t ? t : t + "", void 0, s),
      i = (t, ...e) => {
  const n = 1 === t.length ? t[0] : e.reduce((e, s, n) => e + (t => {
    if (!0 === t._$cssResult$) return t.cssText;
    if ("number" == typeof t) return t;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s) + t[n + 1], t[0]);
  return new o(n, t, s);
},
      S = (s, n) => {
  e ? s.adoptedStyleSheets = n.map(t => t instanceof CSSStyleSheet ? t : t.styleSheet) : n.forEach(e => {
    const n = document.createElement("style"),
          o = t.litNonce;
    void 0 !== o && n.setAttribute("nonce", o), n.textContent = e.cssText, s.appendChild(n);
  });
},
      c = exports.getCompatibleStyle = e ? t => t : t => t instanceof CSSStyleSheet ? (t => {
  let e = "";

  for (const s of t.cssRules) e += s.cssText;

  return r(e);
})(t) : t;

exports.adoptStyles = S;
exports.css = i;
exports.unsafeCSS = r;

},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.standardPrototypeMethod = exports.legacyPrototypeMethod = exports.decorateProperty = void 0;

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const e = (e, t, o) => {
  Object.defineProperty(t, o, e);
},
      t = (e, t) => ({
  kind: "method",
  placement: "prototype",
  key: t.key,
  descriptor: e
}),
      o = ({
  finisher: e,
  descriptor: t
}) => (o, n) => {
  var r;

  if (void 0 === n) {
    const n = null !== (r = o.originalKey) && void 0 !== r ? r : o.key,
          i = null != t ? {
      kind: "method",
      placement: "prototype",
      key: n,
      descriptor: t(o.key)
    } : { ...o,
      key: n
    };
    return null != e && (i.finisher = function (t) {
      e(t, n);
    }), i;
  }

  {
    const r = o.constructor;
    void 0 !== t && Object.defineProperty(o, n, t(n)), null == e || e(r, n);
  }
};

exports.decorateProperty = o;
exports.standardPrototypeMethod = t;
exports.legacyPrototypeMethod = e;

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.customElement = void 0;

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const e = e => n => "function" == typeof n ? ((e, n) => (customElements.define(e, n), n))(e, n) : ((e, n) => {
  const {
    kind: t,
    elements: s
  } = n;
  return {
    kind: t,
    elements: s,

    finisher(n) {
      customElements.define(e, n);
    }

  };
})(e, n);

exports.customElement = e;

},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.eventOptions = e;

var _base = require("./base.js");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function e(e) {
  return (0, _base.decorateProperty)({
    finisher: (r, t) => {
      Object.assign(r.prototype[t], e);
    }
  });
}

},{"./base.js":2}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.property = n;

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const i = (i, e) => "method" === e.kind && e.descriptor && !("value" in e.descriptor) ? { ...e,

  finisher(n) {
    n.createProperty(e.key, i);
  }

} : {
  kind: "field",
  key: Symbol(),
  placement: "own",
  descriptor: {},
  originalKey: e.key,

  initializer() {
    "function" == typeof e.initializer && (this[e.key] = e.initializer.call(this));
  },

  finisher(n) {
    n.createProperty(e.key, i);
  }

},
      e = (i, e, n) => {
  e.constructor.createProperty(n, i);
};

function n(n) {
  return (t, o) => void 0 !== o ? e(n, t, o) : i(n, t);
}

},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.queryAll = e;

var _base = require("./base.js");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function e(e) {
  return (0, _base.decorateProperty)({
    descriptor: r => ({
      get() {
        var r, o;
        return null !== (o = null === (r = this.renderRoot) || void 0 === r ? void 0 : r.querySelectorAll(e)) && void 0 !== o ? o : [];
      },

      enumerable: !0,
      configurable: !0
    })
  });
}

},{"./base.js":2}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.queryAssignedElements = l;

var _base = require("./base.js");

/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var n;
const e = null != (null === (n = window.HTMLSlotElement) || void 0 === n ? void 0 : n.prototype.assignedElements) ? (o, n) => o.assignedElements(n) : (o, n) => o.assignedNodes(n).filter(o => o.nodeType === Node.ELEMENT_NODE);

function l(n) {
  const {
    slot: l,
    selector: t
  } = null != n ? n : {};
  return (0, _base.decorateProperty)({
    descriptor: o => ({
      get() {
        var o;
        const r = "slot" + (l ? `[name=${l}]` : ":not([name])"),
              i = null === (o = this.renderRoot) || void 0 === o ? void 0 : o.querySelector(r),
              s = null != i ? e(i, n) : [];
        return t ? s.filter(o => o.matches(t)) : s;
      },

      enumerable: !0,
      configurable: !0
    })
  });
}

},{"./base.js":2}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.queryAssignedNodes = o;

var _base = require("./base.js");

var _queryAssignedElements = require("./query-assigned-elements.js");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function o(o, n, r) {
  let l,
      s = o;
  return "object" == typeof o ? (s = o.slot, l = o) : l = {
    flatten: n
  }, r ? (0, _queryAssignedElements.queryAssignedElements)({
    slot: s,
    flatten: n,
    selector: r
  }) : (0, _base.decorateProperty)({
    descriptor: e => ({
      get() {
        var e, t;
        const o = "slot" + (s ? `[name=${s}]` : ":not([name])"),
              n = null === (e = this.renderRoot) || void 0 === e ? void 0 : e.querySelector(o);
        return null !== (t = null == n ? void 0 : n.assignedNodes(l)) && void 0 !== t ? t : [];
      },

      enumerable: !0,
      configurable: !0
    })
  });
}

},{"./base.js":2,"./query-assigned-elements.js":7}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.queryAsync = e;

var _base = require("./base.js");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function e(e) {
  return (0, _base.decorateProperty)({
    descriptor: r => ({
      async get() {
        var r;
        return await this.updateComplete, null === (r = this.renderRoot) || void 0 === r ? void 0 : r.querySelector(e);
      },

      enumerable: !0,
      configurable: !0
    })
  });
}

},{"./base.js":2}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.query = i;

var _base = require("./base.js");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function i(i, n) {
  return (0, _base.decorateProperty)({
    descriptor: o => {
      const t = {
        get() {
          var o, n;
          return null !== (n = null === (o = this.renderRoot) || void 0 === o ? void 0 : o.querySelector(i)) && void 0 !== n ? n : null;
        },

        enumerable: !0,
        configurable: !0
      };

      if (n) {
        const n = "symbol" == typeof o ? Symbol() : "__" + o;

        t.get = function () {
          var o, t;
          return void 0 === this[n] && (this[n] = null !== (t = null === (o = this.renderRoot) || void 0 === o ? void 0 : o.querySelector(i)) && void 0 !== t ? t : null), this[n];
        };
      }

      return t;
    }
  });
}

},{"./base.js":2}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.state = t;

var _property = require("./property.js");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function t(t) {
  return (0, _property.property)({ ...t,
    state: !0
  });
}

},{"./property.js":5}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "CSSResult", {
  enumerable: true,
  get: function () {
    return _cssTag.CSSResult;
  }
});
exports.ReactiveElement = void 0;
Object.defineProperty(exports, "adoptStyles", {
  enumerable: true,
  get: function () {
    return _cssTag.adoptStyles;
  }
});
Object.defineProperty(exports, "css", {
  enumerable: true,
  get: function () {
    return _cssTag.css;
  }
});
exports.defaultConverter = void 0;
Object.defineProperty(exports, "getCompatibleStyle", {
  enumerable: true,
  get: function () {
    return _cssTag.getCompatibleStyle;
  }
});
exports.notEqual = void 0;
Object.defineProperty(exports, "supportsAdoptingStyleSheets", {
  enumerable: true,
  get: function () {
    return _cssTag.supportsAdoptingStyleSheets;
  }
});
Object.defineProperty(exports, "unsafeCSS", {
  enumerable: true,
  get: function () {
    return _cssTag.unsafeCSS;
  }
});

var _cssTag = require("./css-tag.js");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var s;

const e = window,
      r = e.trustedTypes,
      h = r ? r.emptyScript : "",
      o = e.reactiveElementPolyfillSupport,
      n = exports.defaultConverter = {
  toAttribute(t, i) {
    switch (i) {
      case Boolean:
        t = t ? h : null;
        break;

      case Object:
      case Array:
        t = null == t ? t : JSON.stringify(t);
    }

    return t;
  },

  fromAttribute(t, i) {
    let s = t;

    switch (i) {
      case Boolean:
        s = null !== t;
        break;

      case Number:
        s = null === t ? null : Number(t);
        break;

      case Object:
      case Array:
        try {
          s = JSON.parse(t);
        } catch (t) {
          s = null;
        }

    }

    return s;
  }

},
      a = (t, i) => i !== t && (i == i || t == t),
      l = {
  attribute: !0,
  type: String,
  converter: n,
  reflect: !1,
  hasChanged: a
},
      d = "finalized";

exports.notEqual = a;

class u extends HTMLElement {
  constructor() {
    super(), this._$Ei = new Map(), this.isUpdatePending = !1, this.hasUpdated = !1, this._$El = null, this._$Eu();
  }

  static addInitializer(t) {
    var i;
    this.finalize(), (null !== (i = this.h) && void 0 !== i ? i : this.h = []).push(t);
  }

  static get observedAttributes() {
    this.finalize();
    const t = [];
    return this.elementProperties.forEach((i, s) => {
      const e = this._$Ep(s, i);

      void 0 !== e && (this._$Ev.set(e, s), t.push(e));
    }), t;
  }

  static createProperty(t, i = l) {
    if (i.state && (i.attribute = !1), this.finalize(), this.elementProperties.set(t, i), !i.noAccessor && !this.prototype.hasOwnProperty(t)) {
      const s = "symbol" == typeof t ? Symbol() : "__" + t,
            e = this.getPropertyDescriptor(t, s, i);
      void 0 !== e && Object.defineProperty(this.prototype, t, e);
    }
  }

  static getPropertyDescriptor(t, i, s) {
    return {
      get() {
        return this[i];
      },

      set(e) {
        const r = this[t];
        this[i] = e, this.requestUpdate(t, r, s);
      },

      configurable: !0,
      enumerable: !0
    };
  }

  static getPropertyOptions(t) {
    return this.elementProperties.get(t) || l;
  }

  static finalize() {
    if (this.hasOwnProperty(d)) return !1;
    this[d] = !0;
    const t = Object.getPrototypeOf(this);

    if (t.finalize(), void 0 !== t.h && (this.h = [...t.h]), this.elementProperties = new Map(t.elementProperties), this._$Ev = new Map(), this.hasOwnProperty("properties")) {
      const t = this.properties,
            i = [...Object.getOwnPropertyNames(t), ...Object.getOwnPropertySymbols(t)];

      for (const s of i) this.createProperty(s, t[s]);
    }

    return this.elementStyles = this.finalizeStyles(this.styles), !0;
  }

  static finalizeStyles(i) {
    const s = [];

    if (Array.isArray(i)) {
      const e = new Set(i.flat(1 / 0).reverse());

      for (const i of e) s.unshift((0, _cssTag.getCompatibleStyle)(i));
    } else void 0 !== i && s.push((0, _cssTag.getCompatibleStyle)(i));

    return s;
  }

  static _$Ep(t, i) {
    const s = i.attribute;
    return !1 === s ? void 0 : "string" == typeof s ? s : "string" == typeof t ? t.toLowerCase() : void 0;
  }

  _$Eu() {
    var t;
    this._$E_ = new Promise(t => this.enableUpdating = t), this._$AL = new Map(), this._$Eg(), this.requestUpdate(), null === (t = this.constructor.h) || void 0 === t || t.forEach(t => t(this));
  }

  addController(t) {
    var i, s;
    (null !== (i = this._$ES) && void 0 !== i ? i : this._$ES = []).push(t), void 0 !== this.renderRoot && this.isConnected && (null === (s = t.hostConnected) || void 0 === s || s.call(t));
  }

  removeController(t) {
    var i;
    null === (i = this._$ES) || void 0 === i || i.splice(this._$ES.indexOf(t) >>> 0, 1);
  }

  _$Eg() {
    this.constructor.elementProperties.forEach((t, i) => {
      this.hasOwnProperty(i) && (this._$Ei.set(i, this[i]), delete this[i]);
    });
  }

  createRenderRoot() {
    var t;
    const s = null !== (t = this.shadowRoot) && void 0 !== t ? t : this.attachShadow(this.constructor.shadowRootOptions);
    return (0, _cssTag.adoptStyles)(s, this.constructor.elementStyles), s;
  }

  connectedCallback() {
    var t;
    void 0 === this.renderRoot && (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), null === (t = this._$ES) || void 0 === t || t.forEach(t => {
      var i;
      return null === (i = t.hostConnected) || void 0 === i ? void 0 : i.call(t);
    });
  }

  enableUpdating(t) {}

  disconnectedCallback() {
    var t;
    null === (t = this._$ES) || void 0 === t || t.forEach(t => {
      var i;
      return null === (i = t.hostDisconnected) || void 0 === i ? void 0 : i.call(t);
    });
  }

  attributeChangedCallback(t, i, s) {
    this._$AK(t, s);
  }

  _$EO(t, i, s = l) {
    var e;

    const r = this.constructor._$Ep(t, s);

    if (void 0 !== r && !0 === s.reflect) {
      const h = (void 0 !== (null === (e = s.converter) || void 0 === e ? void 0 : e.toAttribute) ? s.converter : n).toAttribute(i, s.type);
      this._$El = t, null == h ? this.removeAttribute(r) : this.setAttribute(r, h), this._$El = null;
    }
  }

  _$AK(t, i) {
    var s;

    const e = this.constructor,
          r = e._$Ev.get(t);

    if (void 0 !== r && this._$El !== r) {
      const t = e.getPropertyOptions(r),
            h = "function" == typeof t.converter ? {
        fromAttribute: t.converter
      } : void 0 !== (null === (s = t.converter) || void 0 === s ? void 0 : s.fromAttribute) ? t.converter : n;
      this._$El = r, this[r] = h.fromAttribute(i, t.type), this._$El = null;
    }
  }

  requestUpdate(t, i, s) {
    let e = !0;
    void 0 !== t && (((s = s || this.constructor.getPropertyOptions(t)).hasChanged || a)(this[t], i) ? (this._$AL.has(t) || this._$AL.set(t, i), !0 === s.reflect && this._$El !== t && (void 0 === this._$EC && (this._$EC = new Map()), this._$EC.set(t, s))) : e = !1), !this.isUpdatePending && e && (this._$E_ = this._$Ej());
  }

  async _$Ej() {
    this.isUpdatePending = !0;

    try {
      await this._$E_;
    } catch (t) {
      Promise.reject(t);
    }

    const t = this.scheduleUpdate();
    return null != t && (await t), !this.isUpdatePending;
  }

  scheduleUpdate() {
    return this.performUpdate();
  }

  performUpdate() {
    var t;
    if (!this.isUpdatePending) return;
    this.hasUpdated, this._$Ei && (this._$Ei.forEach((t, i) => this[i] = t), this._$Ei = void 0);
    let i = !1;
    const s = this._$AL;

    try {
      i = this.shouldUpdate(s), i ? (this.willUpdate(s), null === (t = this._$ES) || void 0 === t || t.forEach(t => {
        var i;
        return null === (i = t.hostUpdate) || void 0 === i ? void 0 : i.call(t);
      }), this.update(s)) : this._$Ek();
    } catch (t) {
      throw i = !1, this._$Ek(), t;
    }

    i && this._$AE(s);
  }

  willUpdate(t) {}

  _$AE(t) {
    var i;
    null === (i = this._$ES) || void 0 === i || i.forEach(t => {
      var i;
      return null === (i = t.hostUpdated) || void 0 === i ? void 0 : i.call(t);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }

  _$Ek() {
    this._$AL = new Map(), this.isUpdatePending = !1;
  }

  get updateComplete() {
    return this.getUpdateComplete();
  }

  getUpdateComplete() {
    return this._$E_;
  }

  shouldUpdate(t) {
    return !0;
  }

  update(t) {
    void 0 !== this._$EC && (this._$EC.forEach((t, i) => this._$EO(i, this[i], t)), this._$EC = void 0), this._$Ek();
  }

  updated(t) {}

  firstUpdated(t) {}

}

exports.ReactiveElement = u;
u[d] = !0, u.elementProperties = new Map(), u.elementStyles = [], u.shadowRootOptions = {
  mode: "open"
}, null == o || o({
  ReactiveElement: u
}), (null !== (s = e.reactiveElementVersions) && void 0 !== s ? s : e.reactiveElementVersions = []).push("1.6.3");

},{"./css-tag.js":1}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppEnv = exports.getWrapperEnv = void 0;
const environments_1 = require("./environments");
exports.getWrapperEnv = (0, environments_1.environmentMapper)({
    'https://localhost.corp.adobe.com:8080': environments_1.ENVIRONMENTS.local,
    'https://auth-light-sample.identity-stage.adobe.com': environments_1.ENVIRONMENTS.stage,
});
exports.getAppEnv = (0, environments_1.environmentMapper)({
    'https://localhost.corp.adobe.com:25000': environments_1.ENVIRONMENTS.local,
    'https://auth-light.identity-stage.adobe.com': environments_1.ENVIRONMENTS.stage,
});

},{"./environments":14}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.byEnvironment = exports.environmentMapper = exports.ENVIRONMENTS = void 0;
exports.ENVIRONMENTS = {
    local: 'local',
    stage: 'stage',
    prod: 'prod',
};
function environmentMapper(map) {
    return (url = window.origin) => { var _a; return (_a = map[url]) !== null && _a !== void 0 ? _a : exports.ENVIRONMENTS.prod; };
}
exports.environmentMapper = environmentMapper;
const isEnvironment = (getEnvironment) => (env) => {
    return getEnvironment() === env;
};
function byEnvironment(getEnvironment) {
    return function byEnvironment(envToFnMap) {
        const env = getEnvironment();
        return envToFnMap[env]();
    };
}
exports.byEnvironment = byEnvironment;
function default_1(getEnvironment) {
    return {
        isEnvironment: isEnvironment(getEnvironment),
        byEnvironment: byEnvironment(getEnvironment),
    };
}
exports.default = default_1;

},{}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertError = exports.UnrecoverableError = exports.CriticalError = exports.GenericError = exports.SentryError = exports.ERROR_REASONS = void 0;
exports.ERROR_REASONS = {
    undefined: 'undefined',
    critical: 'critical',
    generic: 'generic',
    unrecoverable: 'unrecoverable',
};
function toStringError(error) {
    if (error instanceof SentryError) {
        return error.toString();
    }
    if (error instanceof Error) {
        const message = error.message ? `: ${error.message}` : '';
        return error.name + message;
    }
    return '';
}
class SentryError extends Error {
    constructor() {
        super(...arguments);
        this.type = exports.ERROR_REASONS.undefined;
        this.cause = '';
    }
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            stack: this.stack,
        };
    }
    toString() {
        const error = `${this.name}: ${this.message}`;
        const originalErrorString = toStringError(this.originalError).replaceAll('\n', '\n\t');
        return `${error}\n\t<- ${originalErrorString}`;
    }
    get name() {
        return this.type;
    }
    get stack() {
        var _a, _b;
        return (_b = (_a = this.originalError) === null || _a === void 0 ? void 0 : _a.stack) !== null && _b !== void 0 ? _b : this.stack;
    }
    static extendError(sentryError, originalError) {
        if (originalError && originalError instanceof Error) {
            sentryError.originalError = originalError;
        }
        return sentryError;
    }
    static generic(originalError) {
        const error = new GenericError();
        return SentryError.extendError(error, originalError);
    }
    static critical(causeMessage, originalError) {
        const error = new CriticalError(causeMessage);
        return SentryError.extendError(error, originalError);
    }
    static unrecoverable(causeMessage, originalError) {
        const error = new UnrecoverableError(causeMessage);
        return SentryError.extendError(error, originalError);
    }
}
exports.SentryError = SentryError;
class GenericError extends SentryError {
    constructor() {
        super(...arguments);
        this.type = exports.ERROR_REASONS.generic;
    }
}
exports.GenericError = GenericError;
class CriticalError extends SentryError {
    constructor() {
        super(...arguments);
        this.type = exports.ERROR_REASONS.critical;
    }
}
exports.CriticalError = CriticalError;
class UnrecoverableError extends SentryError {
    constructor() {
        super(...arguments);
        this.type = exports.ERROR_REASONS.unrecoverable;
    }
}
exports.UnrecoverableError = UnrecoverableError;
function convertError(input) {
    if (input instanceof SentryError) {
        return input;
    }
    if (input instanceof Error) {
        return SentryError.generic(input);
    }
    return SentryError.generic(new Error(String(input)));
}
exports.convertError = convertError;

},{}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventFactory = exports.EventListener = exports.EventScheduler = exports.EventEmitter = exports.startListening = exports.completeConnection = exports.establishConnection = exports.createConnection = exports.PopupQueryStateEvent = exports.OpenPopupErrorEvent = exports.OpenPopupBlockedEvent = exports.OpenPopupCompleteEvent = exports.OpenPopupEvent = exports.UnrecoverableErrorEvent = exports.CompleteEvent = exports.ResponseEvent = exports.InitEvent = exports.Event = exports.splitEvent = void 0;
const errors_1 = require("./errors");
function splitEvent(eventStr) {
    const prefixLength = eventStr.indexOf('-');
    const metaDataLength = eventStr.indexOf(':');
    const event = eventStr.substring(0, prefixLength);
    const side = eventStr.substring(prefixLength + 1, metaDataLength);
    const data = eventStr.substring(metaDataLength + 1);
    return {
        event,
        side,
        data,
    };
}
exports.splitEvent = splitEvent;
class Event {
    constructor({ name, side, data }) {
        this.name = name;
        this.side = side;
        this.data = data;
    }
    setData(data) {
        if (data) {
            return Event.create({ name: this.name, side: this.side, data });
        }
        else {
            return this;
        }
    }
    compareTo(event) {
        return this.name === event.name && this.side === event.side;
    }
    of(base) {
        return this.compareTo(base);
    }
    toString() {
        return JSON.stringify(this);
    }
    static fromString(eventStr) {
        if (typeof eventStr !== 'string') {
            throw new TypeError("Event: Event couldn't be created. Invalid value.");
        }
        const parse = JSON.parse(eventStr);
        if (parse &&
            Object.prototype.hasOwnProperty.call(parse, 'side') &&
            Object.prototype.hasOwnProperty.call(parse, 'name')) {
            return new Event(JSON.parse(eventStr));
        }
        else {
            throw new TypeError('Event: Event incorrectly formatted. Missing side or name.');
        }
    }
    static parse(eventStr, assertedEvent) {
        const event = this.fromString(eventStr);
        if (event.compareTo(assertedEvent)) {
            return event;
        }
        else {
            return null;
        }
    }
    static create(params) {
        return new Event(params);
    }
}
exports.Event = Event;
// CONNECTION
exports.InitEvent = Event.create({ name: 'init', side: 'app' });
exports.ResponseEvent = Event.create({
    name: 'response',
    side: 'wrapper',
    data: {},
});
exports.CompleteEvent = Event.create({ name: 'complete', side: 'app' });
exports.UnrecoverableErrorEvent = Event.create({
    name: 'error',
    side: 'app',
    data: errors_1.SentryError.unrecoverable('Unknown error.'),
});
exports.OpenPopupEvent = Event.create({
    name: 'open-popup',
    side: 'app',
    data: '',
});
exports.OpenPopupCompleteEvent = Event.create({
    name: 'open-popup-complete',
    side: 'wrapper',
});
exports.OpenPopupBlockedEvent = Event.create({
    name: 'open-popup-blocked',
    side: 'wrapper',
});
exports.OpenPopupErrorEvent = Event.create({
    name: 'open-popup-error',
    side: 'popup',
    data: '',
});
exports.PopupQueryStateEvent = Event.create({
    name: 'query-state',
    side: 'popup',
    data: '',
});
/**
  Page includes wrapper, establishConnection() - waits for init [<- INIT]
  Iframe loads, createConnection() - sends init event and listens for response [-> INIT, <- RESPONSE]
  Wrapper receives init with port, sends response, listens for complete [<- INIT, -> RESPONSE, <- COMPLETE]
  Iframe receives response, sends complete [<- RESPONSE, -> COMPLETE]
 */
function createConnection(targetOrigin, targetWindow = window.parent) {
    return new Promise((resolve, reject) => {
        if (!targetOrigin) {
            reject(errors_1.SentryError.unrecoverable('Invalid target origin.'));
        }
        // Send Init event and second port to establish connection
        const channel = new MessageChannel();
        targetWindow.postMessage(exports.InitEvent.toString(), targetOrigin, [
            channel.port2,
        ]);
        // Wait for ResponseEvent from Wrapper
        channel.port1.onmessage = function (e) {
            const response = Event.parse(e.data, exports.ResponseEvent);
            if (response) {
                channel.port1.postMessage(exports.CompleteEvent.toString());
                // Resolve with Wrapper data and port
                resolve({ port: channel.port1, channel, state: response.data });
            }
            else {
                reject(exports.UnrecoverableErrorEvent.setData(errors_1.SentryError.unrecoverable('Wrong wrapper response.')));
            }
        };
    });
}
exports.createConnection = createConnection;
function establishConnection(allowedOrigin) {
    return new Promise((resolve, reject) => {
        window.addEventListener('message', function listener(e) {
            if (e.origin !== allowedOrigin)
                return;
            const event = Event.fromString(e.data);
            if (event.of(exports.InitEvent)) {
                resolve(e.ports[0]);
            }
            if (event.of(exports.UnrecoverableErrorEvent)) {
                reject(event);
            }
            window.removeEventListener('message', listener);
        });
    });
}
exports.establishConnection = establishConnection;
function completeConnection(port, state) {
    return new Promise((resolve, reject) => {
        // Wait for Complete event
        port.onmessage = function (e) {
            const event = Event.parse(e.data, exports.CompleteEvent);
            if (event) {
                resolve(port);
            }
            else {
                reject(exports.UnrecoverableErrorEvent.setData(errors_1.SentryError.unrecoverable('Invalid Sentry reponse to the connection.')));
            }
        };
        // Send Response event
        exports.ResponseEvent.data = state;
        port.postMessage(exports.ResponseEvent.toString());
    });
}
exports.completeConnection = completeConnection;
function startListening(port) {
    const eventEmitter = new EventEmitter();
    port.onmessage = function (event) {
        eventEmitter.broadcast(Event.fromString(event.data));
    };
    port.onmessageerror = function () {
        eventEmitter.broadcast(exports.UnrecoverableErrorEvent.setData(errors_1.SentryError.unrecoverable('Port message error.')));
    };
    window.addEventListener('storage', ({ key, newValue }) => {
        try {
            if (key === 'popupEvent' && newValue) {
                const event = Event.fromString(newValue);
                if (event.of(exports.PopupQueryStateEvent)) {
                    const returnEvent = Event.fromString(event.data);
                    eventEmitter.broadcast(returnEvent);
                }
            }
        }
        catch (e) {
            console.error(e);
        }
        finally {
            if (key) {
                localStorage.removeItem(key);
            }
        }
    });
    const eventScheduler = new EventScheduler(eventEmitter);
    return function () {
        return eventScheduler;
    };
}
exports.startListening = startListening;
class EventEmitter {
    constructor() {
        this.listeners = new Set();
    }
    get numListeners() {
        return this.listeners.size;
    }
    add(listener) {
        this.listeners.add(listener);
    }
    remove(listener) {
        this.listeners.delete(listener);
    }
    broadcast(event) {
        this.listeners.forEach(listener => {
            listener.emit(event);
        });
    }
}
exports.EventEmitter = EventEmitter;
class EventScheduler {
    constructor(emitter) {
        this.emitter = emitter;
    }
    subscribe(fn) {
        const listener = new EventListener(fn);
        this.emitter.add(listener);
        return () => {
            this.emitter.remove(listener);
        };
    }
    once(fn) {
        let disposer;
        const promise = new Promise(res => {
            disposer = this.subscribe(event => res(event));
        });
        promise.catch(() => disposer());
        if (fn) {
            return promise.then(event => fn(event)).then(() => disposer());
        }
        else {
            return promise;
        }
    }
    listenFor(listenedEvent) {
        return new Promise((res, rej) => {
            const disposer = this.subscribe((event) => {
                if (listenedEvent.compareTo(event)) {
                    res(event);
                    disposer();
                }
            });
        });
    }
}
exports.EventScheduler = EventScheduler;
class EventListener {
    constructor(listener) {
        this.listener = listener;
    }
    emit(event) {
        this.listener(event);
    }
}
exports.EventListener = EventListener;
function eventFactory(port) {
    return (event) => ((data) => {
        event.data = data;
        port.postMessage(event.toString());
        return null;
    });
}
exports.eventFactory = eventFactory;

},{"./errors":15}],17:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.urls = exports.createLogger = exports.environments = exports.envs = void 0;
exports.envs = __importStar(require("./environment-mappers"));
exports.environments = __importStar(require("./environments"));
__exportStar(require("./errors"), exports);
__exportStar(require("./events"), exports);
var logger_1 = require("./logger");
Object.defineProperty(exports, "createLogger", { enumerable: true, get: function () { return logger_1.createLogger; } });
exports.urls = __importStar(require("./urls"));

},{"./environment-mappers":13,"./environments":14,"./errors":15,"./events":16,"./logger":18,"./urls":19}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLogger = void 0;
const environments_1 = require("./environments");
function createLogger(getEnv, clientId, relay = '', name = 'default') {
    const env = (0, environments_1.byEnvironment)(getEnv);
    const endpoint = env({
        [environments_1.ENVIRONMENTS.local]: () => 'https://localhost.corp.adobe.com:8081/signin',
        [environments_1.ENVIRONMENTS.stage]: () => 'https://auth-stg1.services.adobe.com/signin/v1/audit',
        [environments_1.ENVIRONMENTS.prod]: () => 'https://auth.services.adobe.com/signin/v1/audit',
    });
    const envName = env({
        [environments_1.ENVIRONMENTS.local]: () => 'susi-light-local',
        [environments_1.ENVIRONMENTS.stage]: () => 'susi-light-stage',
        [environments_1.ENVIRONMENTS.prod]: () => 'susi-light-prod',
    });
    return function logger(message) {
        fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-IMS-CLIENTID': clientId,
                'X-DEBUG-ID': relay,
            },
            body: JSON.stringify({
                name,
                envName,
                clientId,
                message,
            }),
        }).catch(e => { });
    };
}
exports.createLogger = createLogger;

},{"./environments":14}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = exports.sentryUrl = exports.getPopupUrl = exports.getAppUrl = exports.getApiUrl = void 0;
const environments_1 = require("./environments");
function getApiUrl(getEnvironment) {
    return () => (0, environments_1.byEnvironment)(getEnvironment)({
        [environments_1.ENVIRONMENTS.local]: () => 'https://ims-na1-stg1.adobelogin.com',
        [environments_1.ENVIRONMENTS.stage]: () => 'https://ims-na1-stg1.adobelogin.com',
        [environments_1.ENVIRONMENTS.prod]: () => 'https://ims-na1.adobelogin.com',
    });
}
exports.getApiUrl = getApiUrl;
function getAppUrl(getEnvironment) {
    return () => (0, environments_1.byEnvironment)(getEnvironment)({
        [environments_1.ENVIRONMENTS.local]: () => 'https://localhost.corp.adobe.com:25000',
        [environments_1.ENVIRONMENTS.stage]: () => 'https://auth-light.identity-stage.adobe.com',
        [environments_1.ENVIRONMENTS.prod]: () => 'https://auth-light.identity.adobe.com',
    });
}
exports.getAppUrl = getAppUrl;
function getPopupUrl(getEnvironment) {
    return () => (0, environments_1.byEnvironment)(getEnvironment)({
        [environments_1.ENVIRONMENTS.local]: () => 'https://localhost.corp.adobe.com:25000/wrapper-popup-helper',
        [environments_1.ENVIRONMENTS.stage]: () => 'https://auth-light.identity-stage.adobe.com/wrapper-popup-helper/index.html',
        [environments_1.ENVIRONMENTS.prod]: () => 'https://auth-light.identity.adobe.com/wrapper-popup-helper/index.html',
    });
}
exports.getPopupUrl = getPopupUrl;
const sentryUrl = (getEnvironment, forceStage = false) => function sentryUrl(variant) {
    const envUrl = getAppUrl(forceStage ? () => environments_1.ENVIRONMENTS.stage : getEnvironment)();
    const url = new URL(envUrl || '');
    url.hash = variant;
    return url;
};
exports.sentryUrl = sentryUrl;
function create(getEnvironment) {
    return {
        getApiUrl: getApiUrl(getEnvironment),
        getAppUrl: getAppUrl(getEnvironment),
        getPopupUrl: getPopupUrl(getEnvironment),
        sentryUrl: (0, exports.sentryUrl)(getEnvironment),
    };
}
exports.create = create;

},{"./environments":14}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.popupCenter = void 0;
function popupCenter({ url, title, w, h, }) {
    const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
    const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;
    const width = window.innerWidth
        ? window.innerWidth
        : document.documentElement.clientWidth
            ? document.documentElement.clientWidth
            : screen.width;
    const height = window.innerHeight
        ? window.innerHeight
        : document.documentElement.clientHeight
            ? document.documentElement.clientHeight
            : screen.height;
    const left = (width - w) / 2 + dualScreenLeft;
    const top = (height - h) / 2 + dualScreenTop;
    const openedWindow = window.open(url, title, `
    menubar=0,
    resizable=0,
    scrollbars=no,
    width=${w}, 
    height=${h}, 
    top=${top}, 
    left=${left}
    `);
    return openedWindow;
}
exports.popupCenter = popupCenter;

},{}],21:[function(require,module,exports){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const shared_1 = require("@sentry/shared");
const environments_1 = require("@sentry/shared/dist/environments");
const lit_1 = require("lit");
const decorators_js_1 = require("lit/decorators.js");
const class_map_js_1 = require("lit/directives/class-map.js");
const helpers_1 = require("./helpers");
const version_1 = require("./version");
function getWrapperEnv(forceStage = false) {
    return forceStage ? () => environments_1.ENVIRONMENTS.stage : shared_1.envs.getWrapperEnv;
}
function getAppUrl(forceStage = false) {
    const { getAppUrl } = shared_1.urls.create(getWrapperEnv(forceStage));
    return getAppUrl();
}
const { sentryUrl } = shared_1.urls;
window.__sentry__ = {
    info: {
        version: version_1.version,
        build: version_1.build,
        buildTime: version_1.buildTime,
    },
};
let Sentry = class Sentry extends lit_1.LitElement {
    constructor() {
        super(...arguments);
        this.container = null;
        this.root = null;
        this._port = null;
        this.variant = 'large-buttons';
        this.popup = false;
        this.stage = false;
        this.modalOpen = false;
        this.modalTransitionable = false;
        this.authParams = {};
        this.config = {
            version: version_1.version,
            build: version_1.build,
            buildTime: version_1.buildTime,
        };
        this.onLastResort = (e) => {
            const appUrl = getAppUrl(this.stage);
            if (e.origin === appUrl) {
                try {
                    const event = shared_1.Event.fromString(e.data);
                    if (event && event.of(shared_1.UnrecoverableErrorEvent)) {
                        this.dispatchError(event.data);
                    }
                }
                catch (e) {
                    this.dispatchError();
                }
            }
        };
    }
    connectedCallback() {
        const _super = Object.create(null, {
            connectedCallback: { get: () => super.connectedCallback }
        });
        return __awaiter(this, void 0, void 0, function* () {
            _super.connectedCallback.call(this);
            const iframe = yield this._iframe;
            iframe === null || iframe === void 0 ? void 0 : iframe.addEventListener('load', () => setTimeout(() => {
                if (!this._port) {
                    this.dispatchError();
                }
            }, 2000));
            iframe === null || iframe === void 0 ? void 0 : iframe.addEventListener('error', () => this.dispatchError());
            if (this.authParams && this.authParams.client_id) {
                this.connectToApp();
            }
        });
    }
    updated(changedProperties) {
        if (changedProperties.has('authParams') ||
            changedProperties.has('config')) {
            this.connectToApp();
        }
    }
    connectToApp() {
        window.addEventListener('message', this.onLastResort, { once: true });
        const environment = getAppUrl(this.stage);
        (0, shared_1.establishConnection)(environment)
            .then(port => (0, shared_1.completeConnection)(port, this.appState))
            .then(port => {
            this._port = port;
            this.events = {
                popupOpenComplete: (0, shared_1.eventFactory)(port)(shared_1.OpenPopupCompleteEvent),
                popupOpenBlocked: (0, shared_1.eventFactory)(port)(shared_1.OpenPopupBlockedEvent),
                modalOpenComplete: (0, shared_1.eventFactory)(port)(shared_1.OpenModalCompleteEvent),
            };
            if (this.shadowRoot) {
                this.container = this.shadowRoot.getElementById('sentry-container');
                this.root = this.shadowRoot.getElementById('sentry');
            }
            return port;
        })
            .then(port => {
            const eventListener = (0, shared_1.startListening)(port)();
            eventListener.subscribe(event => this.onReceiveSentryEvent(event));
        })
            .catch(e => this.dispatchError(e.data));
    }
    onReceiveSentryEvent(event) {
        if (event.side === 'proxy') {
            this.dispatchEvent(new CustomEvent(event.name, { detail: event.data }));
        }
        if (event.side === 'app' && event.of(shared_1.OpenPopupEvent)) {
            return this.openPopup(event.data);
        }
        if (event.side === 'app' && event.of(shared_1.OpenModalEvent)) {
            const { width, height } = event.data;
            const firstOpen = !this.modalOpen;
            this.activateModal();
            if (this.root) {
                this.root.style.width = width;
                this.root.style.height = height;
                setTimeout(() => {
                    this.events.modalOpenComplete();
                }, firstOpen ? 0 : 500);
            }
        }
    }
    openPopup(url) {
        var _a, _b;
        const popupWindow = (0, helpers_1.popupCenter)({
            url,
            title: 'SUSI Light Login',
            w: 459,
            h: 768,
        });
        if (popupWindow) {
            (_a = this.events) === null || _a === void 0 ? void 0 : _a.popupOpenComplete();
        }
        else {
            (_b = this.events) === null || _b === void 0 ? void 0 : _b.popupOpenBlocked();
        }
    }
    activateModal() {
        if (!this.modalOpen && this.root) {
            this.modalOpen = true;
            this.requestUpdate();
            setTimeout(() => {
                var _a;
                (_a = this.root) === null || _a === void 0 ? void 0 : _a.classList.add('modal--transitionable');
            }, 1000);
        }
    }
    dispatchError(detail = { name: 'unrecoverable' }) {
        this.dispatchEvent(new CustomEvent('on-error', { detail }));
    }
    get appConfig() {
        return Object.assign(Object.assign({}, this.config), { popup: this.popup, variant: this.variant });
    }
    get authState() {
        return Object.assign(Object.assign({}, this.authParams), { wrapper: 'true', popup: this.popup.toString(), asserted_origin: window.origin, sl_version: version_1.version, sl_build: version_1.build, sl_buildtime: version_1.buildTime });
    }
    get appState() {
        return {
            authParams: this.authState,
            config: this.appConfig,
        };
    }
    get url() {
        const baseUrl = sentryUrl(getWrapperEnv(this.stage));
        const url = baseUrl(this.variant);
        for (const property in this.appState.authParams) {
            url.searchParams.append(property, this.appState.authParams[property]);
        }
        return url.href;
    }
    get isDarkMode() {
        return this.config.modal && !!this.authParams.dt;
    }
    render() {
        return (0, lit_1.html) `<section
      id="sentry-container"
      class=${(0, class_map_js_1.classMap)({
            'modal-mode': this.config.modal,
            'modal--dark-mode': this.isDarkMode,
            modal: this.modalOpen,
        })}
    >
      <section id="sentry">
        <iframe
          allowtransparency="true"
          frameborder="0"
          id="iframe"
          src="${this.url}"
        ></iframe>
      </section>
    </section>`;
    }
};
Sentry.styles = (0, lit_1.css) `
    s :host {
      display: block;
    }

    :host,
    section,
    iframe {
      width: 100%;
      height: 100%;
      background: transparent;
      color-scheme: normal;
      border: 0;
    }

    #sentry-container.modal-mode {
      display: none;
    }

    #sentry-container.modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 9999;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .modal #sentry {
      box-sizing: border-box;
      padding: 40px;
      border-radius: 5px;

      background-color: #fff;
    }

    .modal.modal--dark-mode #sentry {
      background-color: #262626;
    }

    .modal--transitionable {
      transition: all 0.5s ease-in-out;
    }
  `;
__decorate([
    (0, decorators_js_1.queryAsync)('#iframe')
], Sentry.prototype, "_iframe", void 0);
__decorate([
    (0, decorators_js_1.property)()
], Sentry.prototype, "variant", void 0);
__decorate([
    (0, decorators_js_1.property)({ type: Boolean })
], Sentry.prototype, "popup", void 0);
__decorate([
    (0, decorators_js_1.property)({ type: Boolean })
], Sentry.prototype, "stage", void 0);
__decorate([
    (0, decorators_js_1.property)({ type: Boolean })
], Sentry.prototype, "modalTransitionable", void 0);
__decorate([
    (0, decorators_js_1.property)({
        type: Object,
    })
], Sentry.prototype, "authParams", void 0);
__decorate([
    (0, decorators_js_1.property)({
        type: Object,
    })
], Sentry.prototype, "config", void 0);
__decorate([
    (0, decorators_js_1.property)()
], Sentry.prototype, "appConfig", null);
Sentry = __decorate([
    (0, decorators_js_1.customElement)('susi-sentry')
], Sentry);
exports.default = Sentry;

},{"./helpers":20,"./version":22,"@sentry/shared":17,"@sentry/shared/dist/environments":14,"lit":30,"lit/decorators.js":28,"lit/directives/class-map.js":29}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTime = exports.build = exports.version = void 0;
exports.version = '1.0.1';
exports.build = '95b8817';
exports.buildTime = '1699452288390';

},{}],23:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  LitElement: true,
  UpdatingElement: true,
  _$LE: true
};
exports._$LE = exports.UpdatingElement = exports.LitElement = void 0;

var _reactiveElement = require("@lit/reactive-element");

Object.keys(_reactiveElement).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _reactiveElement[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _reactiveElement[key];
    }
  });
});

var _litHtml = require("lit-html");

Object.keys(_litHtml).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _litHtml[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _litHtml[key];
    }
  });
});

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var l, o;
const r = exports.UpdatingElement = _reactiveElement.ReactiveElement;

class s extends _reactiveElement.ReactiveElement {
  constructor() {
    super(...arguments), this.renderOptions = {
      host: this
    }, this._$Do = void 0;
  }

  createRenderRoot() {
    var t, e;
    const i = super.createRenderRoot();
    return null !== (t = (e = this.renderOptions).renderBefore) && void 0 !== t || (e.renderBefore = i.firstChild), i;
  }

  update(t) {
    const i = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = (0, _litHtml.render)(i, this.renderRoot, this.renderOptions);
  }

  connectedCallback() {
    var t;
    super.connectedCallback(), null === (t = this._$Do) || void 0 === t || t.setConnected(!0);
  }

  disconnectedCallback() {
    var t;
    super.disconnectedCallback(), null === (t = this._$Do) || void 0 === t || t.setConnected(!1);
  }

  render() {
    return _litHtml.noChange;
  }

}

exports.LitElement = s;
s.finalized = !0, s._$litElement$ = !0, null === (l = globalThis.litElementHydrateSupport) || void 0 === l || l.call(globalThis, {
  LitElement: s
});
const n = globalThis.litElementPolyfillSupport;
null == n || n({
  LitElement: s
});
const h = exports._$LE = {
  _$AK: (t, e, i) => {
    t._$AK(e, i);
  },
  _$AL: t => t._$AL
};
(null !== (o = globalThis.litElementVersions) && void 0 !== o ? o : globalThis.litElementVersions = []).push("3.3.3");

},{"@lit/reactive-element":12,"lit-html":27}],24:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.directive = exports.PartType = exports.Directive = void 0;

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t = exports.PartType = {
  ATTRIBUTE: 1,
  CHILD: 2,
  PROPERTY: 3,
  BOOLEAN_ATTRIBUTE: 4,
  EVENT: 5,
  ELEMENT: 6
},
      e = t => (...e) => ({
  _$litDirective$: t,
  values: e
});

exports.directive = e;

class i {
  constructor(t) {}

  get _$AU() {
    return this._$AM._$AU;
  }

  _$AT(t, e, i) {
    this._$Ct = t, this._$AM = e, this._$Ci = i;
  }

  _$AS(t, e) {
    return this.update(t, e);
  }

  update(t, e) {
    return this.render(...e);
  }

}

exports.Directive = i;

},{}],25:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.classMap = void 0;

var _litHtml = require("../lit-html.js");

var _directive = require("../directive.js");

/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const o = exports.classMap = (0, _directive.directive)(class extends _directive.Directive {
  constructor(t) {
    var i;
    if (super(t), t.type !== _directive.PartType.ATTRIBUTE || "class" !== t.name || (null === (i = t.strings) || void 0 === i ? void 0 : i.length) > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
  }

  render(t) {
    return " " + Object.keys(t).filter(i => t[i]).join(" ") + " ";
  }

  update(i, [s]) {
    var r, o;

    if (void 0 === this.it) {
      this.it = new Set(), void 0 !== i.strings && (this.nt = new Set(i.strings.join(" ").split(/\s/).filter(t => "" !== t)));

      for (const t in s) s[t] && !(null === (r = this.nt) || void 0 === r ? void 0 : r.has(t)) && this.it.add(t);

      return this.render(s);
    }

    const e = i.element.classList;
    this.it.forEach(t => {
      t in s || (e.remove(t), this.it.delete(t));
    });

    for (const t in s) {
      const i = !!s[t];
      i === this.it.has(t) || (null === (o = this.nt) || void 0 === o ? void 0 : o.has(t)) || (i ? (e.add(t), this.it.add(t)) : (e.remove(t), this.it.delete(t)));
    }

    return _litHtml.noChange;
  }

});

},{"../directive.js":24,"../lit-html.js":27}],26:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isServer = void 0;

/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const o = exports.isServer = !1;

},{}],27:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.svg = exports.render = exports.nothing = exports.noChange = exports.html = exports._$LH = void 0;

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var t;

const i = window,
      s = i.trustedTypes,
      e = s ? s.createPolicy("lit-html", {
  createHTML: t => t
}) : void 0,
      o = "$lit$",
      n = `lit$${(Math.random() + "").slice(9)}$`,
      l = "?" + n,
      h = `<${l}>`,
      r = document,
      u = () => r.createComment(""),
      d = t => null === t || "object" != typeof t && "function" != typeof t,
      c = Array.isArray,
      v = t => c(t) || "function" == typeof (null == t ? void 0 : t[Symbol.iterator]),
      a = "[ \t\n\f\r]",
      f = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,
      _ = /-->/g,
      m = />/g,
      p = RegExp(`>|${a}(?:([^\\s"'>=/]+)(${a}*=${a}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"),
      g = /'/g,
      $ = /"/g,
      y = /^(?:script|style|textarea|title)$/i,
      w = t => (i, ...s) => ({
  _$litType$: t,
  strings: i,
  values: s
}),
      x = exports.html = w(1),
      b = exports.svg = w(2),
      T = exports.noChange = Symbol.for("lit-noChange"),
      A = exports.nothing = Symbol.for("lit-nothing"),
      E = new WeakMap(),
      C = r.createTreeWalker(r, 129, null, !1);

function P(t, i) {
  if (!Array.isArray(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== e ? e.createHTML(i) : i;
}

const V = (t, i) => {
  const s = t.length - 1,
        e = [];
  let l,
      r = 2 === i ? "<svg>" : "",
      u = f;

  for (let i = 0; i < s; i++) {
    const s = t[i];
    let d,
        c,
        v = -1,
        a = 0;

    for (; a < s.length && (u.lastIndex = a, c = u.exec(s), null !== c);) a = u.lastIndex, u === f ? "!--" === c[1] ? u = _ : void 0 !== c[1] ? u = m : void 0 !== c[2] ? (y.test(c[2]) && (l = RegExp("</" + c[2], "g")), u = p) : void 0 !== c[3] && (u = p) : u === p ? ">" === c[0] ? (u = null != l ? l : f, v = -1) : void 0 === c[1] ? v = -2 : (v = u.lastIndex - c[2].length, d = c[1], u = void 0 === c[3] ? p : '"' === c[3] ? $ : g) : u === $ || u === g ? u = p : u === _ || u === m ? u = f : (u = p, l = void 0);

    const w = u === p && t[i + 1].startsWith("/>") ? " " : "";
    r += u === f ? s + h : v >= 0 ? (e.push(d), s.slice(0, v) + o + s.slice(v) + n + w) : s + n + (-2 === v ? (e.push(void 0), i) : w);
  }

  return [P(t, r + (t[s] || "<?>") + (2 === i ? "</svg>" : "")), e];
};

class N {
  constructor({
    strings: t,
    _$litType$: i
  }, e) {
    let h;
    this.parts = [];
    let r = 0,
        d = 0;
    const c = t.length - 1,
          v = this.parts,
          [a, f] = V(t, i);

    if (this.el = N.createElement(a, e), C.currentNode = this.el.content, 2 === i) {
      const t = this.el.content,
            i = t.firstChild;
      i.remove(), t.append(...i.childNodes);
    }

    for (; null !== (h = C.nextNode()) && v.length < c;) {
      if (1 === h.nodeType) {
        if (h.hasAttributes()) {
          const t = [];

          for (const i of h.getAttributeNames()) if (i.endsWith(o) || i.startsWith(n)) {
            const s = f[d++];

            if (t.push(i), void 0 !== s) {
              const t = h.getAttribute(s.toLowerCase() + o).split(n),
                    i = /([.?@])?(.*)/.exec(s);
              v.push({
                type: 1,
                index: r,
                name: i[2],
                strings: t,
                ctor: "." === i[1] ? H : "?" === i[1] ? L : "@" === i[1] ? z : k
              });
            } else v.push({
              type: 6,
              index: r
            });
          }

          for (const i of t) h.removeAttribute(i);
        }

        if (y.test(h.tagName)) {
          const t = h.textContent.split(n),
                i = t.length - 1;

          if (i > 0) {
            h.textContent = s ? s.emptyScript : "";

            for (let s = 0; s < i; s++) h.append(t[s], u()), C.nextNode(), v.push({
              type: 2,
              index: ++r
            });

            h.append(t[i], u());
          }
        }
      } else if (8 === h.nodeType) if (h.data === l) v.push({
        type: 2,
        index: r
      });else {
        let t = -1;

        for (; -1 !== (t = h.data.indexOf(n, t + 1));) v.push({
          type: 7,
          index: r
        }), t += n.length - 1;
      }

      r++;
    }
  }

  static createElement(t, i) {
    const s = r.createElement("template");
    return s.innerHTML = t, s;
  }

}

function S(t, i, s = t, e) {
  var o, n, l, h;
  if (i === T) return i;
  let r = void 0 !== e ? null === (o = s._$Co) || void 0 === o ? void 0 : o[e] : s._$Cl;
  const u = d(i) ? void 0 : i._$litDirective$;
  return (null == r ? void 0 : r.constructor) !== u && (null === (n = null == r ? void 0 : r._$AO) || void 0 === n || n.call(r, !1), void 0 === u ? r = void 0 : (r = new u(t), r._$AT(t, s, e)), void 0 !== e ? (null !== (l = (h = s)._$Co) && void 0 !== l ? l : h._$Co = [])[e] = r : s._$Cl = r), void 0 !== r && (i = S(t, r._$AS(t, i.values), r, e)), i;
}

class M {
  constructor(t, i) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = i;
  }

  get parentNode() {
    return this._$AM.parentNode;
  }

  get _$AU() {
    return this._$AM._$AU;
  }

  u(t) {
    var i;
    const {
      el: {
        content: s
      },
      parts: e
    } = this._$AD,
          o = (null !== (i = null == t ? void 0 : t.creationScope) && void 0 !== i ? i : r).importNode(s, !0);
    C.currentNode = o;
    let n = C.nextNode(),
        l = 0,
        h = 0,
        u = e[0];

    for (; void 0 !== u;) {
      if (l === u.index) {
        let i;
        2 === u.type ? i = new R(n, n.nextSibling, this, t) : 1 === u.type ? i = new u.ctor(n, u.name, u.strings, this, t) : 6 === u.type && (i = new Z(n, this, t)), this._$AV.push(i), u = e[++h];
      }

      l !== (null == u ? void 0 : u.index) && (n = C.nextNode(), l++);
    }

    return C.currentNode = r, o;
  }

  v(t) {
    let i = 0;

    for (const s of this._$AV) void 0 !== s && (void 0 !== s.strings ? (s._$AI(t, s, i), i += s.strings.length - 2) : s._$AI(t[i])), i++;
  }

}

class R {
  constructor(t, i, s, e) {
    var o;
    this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t, this._$AB = i, this._$AM = s, this.options = e, this._$Cp = null === (o = null == e ? void 0 : e.isConnected) || void 0 === o || o;
  }

  get _$AU() {
    var t, i;
    return null !== (i = null === (t = this._$AM) || void 0 === t ? void 0 : t._$AU) && void 0 !== i ? i : this._$Cp;
  }

  get parentNode() {
    let t = this._$AA.parentNode;
    const i = this._$AM;
    return void 0 !== i && 11 === (null == t ? void 0 : t.nodeType) && (t = i.parentNode), t;
  }

  get startNode() {
    return this._$AA;
  }

  get endNode() {
    return this._$AB;
  }

  _$AI(t, i = this) {
    t = S(this, t, i), d(t) ? t === A || null == t || "" === t ? (this._$AH !== A && this._$AR(), this._$AH = A) : t !== this._$AH && t !== T && this._(t) : void 0 !== t._$litType$ ? this.g(t) : void 0 !== t.nodeType ? this.$(t) : v(t) ? this.T(t) : this._(t);
  }

  k(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }

  $(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.k(t));
  }

  _(t) {
    this._$AH !== A && d(this._$AH) ? this._$AA.nextSibling.data = t : this.$(r.createTextNode(t)), this._$AH = t;
  }

  g(t) {
    var i;
    const {
      values: s,
      _$litType$: e
    } = t,
          o = "number" == typeof e ? this._$AC(t) : (void 0 === e.el && (e.el = N.createElement(P(e.h, e.h[0]), this.options)), e);
    if ((null === (i = this._$AH) || void 0 === i ? void 0 : i._$AD) === o) this._$AH.v(s);else {
      const t = new M(o, this),
            i = t.u(this.options);
      t.v(s), this.$(i), this._$AH = t;
    }
  }

  _$AC(t) {
    let i = E.get(t.strings);
    return void 0 === i && E.set(t.strings, i = new N(t)), i;
  }

  T(t) {
    c(this._$AH) || (this._$AH = [], this._$AR());
    const i = this._$AH;
    let s,
        e = 0;

    for (const o of t) e === i.length ? i.push(s = new R(this.k(u()), this.k(u()), this, this.options)) : s = i[e], s._$AI(o), e++;

    e < i.length && (this._$AR(s && s._$AB.nextSibling, e), i.length = e);
  }

  _$AR(t = this._$AA.nextSibling, i) {
    var s;

    for (null === (s = this._$AP) || void 0 === s || s.call(this, !1, !0, i); t && t !== this._$AB;) {
      const i = t.nextSibling;
      t.remove(), t = i;
    }
  }

  setConnected(t) {
    var i;
    void 0 === this._$AM && (this._$Cp = t, null === (i = this._$AP) || void 0 === i || i.call(this, t));
  }

}

class k {
  constructor(t, i, s, e, o) {
    this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t, this.name = i, this._$AM = e, this.options = o, s.length > 2 || "" !== s[0] || "" !== s[1] ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = A;
  }

  get tagName() {
    return this.element.tagName;
  }

  get _$AU() {
    return this._$AM._$AU;
  }

  _$AI(t, i = this, s, e) {
    const o = this.strings;
    let n = !1;
    if (void 0 === o) t = S(this, t, i, 0), n = !d(t) || t !== this._$AH && t !== T, n && (this._$AH = t);else {
      const e = t;
      let l, h;

      for (t = o[0], l = 0; l < o.length - 1; l++) h = S(this, e[s + l], i, l), h === T && (h = this._$AH[l]), n || (n = !d(h) || h !== this._$AH[l]), h === A ? t = A : t !== A && (t += (null != h ? h : "") + o[l + 1]), this._$AH[l] = h;
    }
    n && !e && this.j(t);
  }

  j(t) {
    t === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, null != t ? t : "");
  }

}

class H extends k {
  constructor() {
    super(...arguments), this.type = 3;
  }

  j(t) {
    this.element[this.name] = t === A ? void 0 : t;
  }

}

const I = s ? s.emptyScript : "";

class L extends k {
  constructor() {
    super(...arguments), this.type = 4;
  }

  j(t) {
    t && t !== A ? this.element.setAttribute(this.name, I) : this.element.removeAttribute(this.name);
  }

}

class z extends k {
  constructor(t, i, s, e, o) {
    super(t, i, s, e, o), this.type = 5;
  }

  _$AI(t, i = this) {
    var s;
    if ((t = null !== (s = S(this, t, i, 0)) && void 0 !== s ? s : A) === T) return;
    const e = this._$AH,
          o = t === A && e !== A || t.capture !== e.capture || t.once !== e.once || t.passive !== e.passive,
          n = t !== A && (e === A || o);
    o && this.element.removeEventListener(this.name, this, e), n && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }

  handleEvent(t) {
    var i, s;
    "function" == typeof this._$AH ? this._$AH.call(null !== (s = null === (i = this.options) || void 0 === i ? void 0 : i.host) && void 0 !== s ? s : this.element, t) : this._$AH.handleEvent(t);
  }

}

class Z {
  constructor(t, i, s) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = i, this.options = s;
  }

  get _$AU() {
    return this._$AM._$AU;
  }

  _$AI(t) {
    S(this, t);
  }

}

const j = exports._$LH = {
  O: o,
  P: n,
  A: l,
  C: 1,
  M: V,
  L: M,
  R: v,
  D: S,
  I: R,
  V: k,
  H: L,
  N: z,
  U: H,
  F: Z
},
      B = i.litHtmlPolyfillSupport;
null == B || B(N, R), (null !== (t = i.litHtmlVersions) && void 0 !== t ? t : i.litHtmlVersions = []).push("2.8.0");

const D = (t, i, s) => {
  var e, o;
  const n = null !== (e = null == s ? void 0 : s.renderBefore) && void 0 !== e ? e : i;
  let l = n._$litPart$;

  if (void 0 === l) {
    const t = null !== (o = null == s ? void 0 : s.renderBefore) && void 0 !== o ? o : null;
    n._$litPart$ = l = new R(i.insertBefore(u(), t), t, void 0, null != s ? s : {});
  }

  return l._$AI(t), l;
};

exports.render = D;

},{}],28:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _customElement = require("@lit/reactive-element/decorators/custom-element.js");

Object.keys(_customElement).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _customElement[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _customElement[key];
    }
  });
});

var _property = require("@lit/reactive-element/decorators/property.js");

Object.keys(_property).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _property[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _property[key];
    }
  });
});

var _state = require("@lit/reactive-element/decorators/state.js");

Object.keys(_state).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _state[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _state[key];
    }
  });
});

var _eventOptions = require("@lit/reactive-element/decorators/event-options.js");

Object.keys(_eventOptions).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _eventOptions[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _eventOptions[key];
    }
  });
});

var _query = require("@lit/reactive-element/decorators/query.js");

Object.keys(_query).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _query[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _query[key];
    }
  });
});

var _queryAll = require("@lit/reactive-element/decorators/query-all.js");

Object.keys(_queryAll).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _queryAll[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _queryAll[key];
    }
  });
});

var _queryAsync = require("@lit/reactive-element/decorators/query-async.js");

Object.keys(_queryAsync).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _queryAsync[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _queryAsync[key];
    }
  });
});

var _queryAssignedElements = require("@lit/reactive-element/decorators/query-assigned-elements.js");

Object.keys(_queryAssignedElements).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _queryAssignedElements[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _queryAssignedElements[key];
    }
  });
});

var _queryAssignedNodes = require("@lit/reactive-element/decorators/query-assigned-nodes.js");

Object.keys(_queryAssignedNodes).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _queryAssignedNodes[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _queryAssignedNodes[key];
    }
  });
});

},{"@lit/reactive-element/decorators/custom-element.js":3,"@lit/reactive-element/decorators/event-options.js":4,"@lit/reactive-element/decorators/property.js":5,"@lit/reactive-element/decorators/query-all.js":6,"@lit/reactive-element/decorators/query-assigned-elements.js":7,"@lit/reactive-element/decorators/query-assigned-nodes.js":8,"@lit/reactive-element/decorators/query-async.js":9,"@lit/reactive-element/decorators/query.js":10,"@lit/reactive-element/decorators/state.js":11}],29:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classMap = require("lit-html/directives/class-map.js");

Object.keys(_classMap).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _classMap[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _classMap[key];
    }
  });
});

},{"lit-html/directives/class-map.js":25}],30:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

require("@lit/reactive-element");

require("lit-html");

var _litElement = require("lit-element/lit-element.js");

Object.keys(_litElement).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _litElement[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _litElement[key];
    }
  });
});

var _isServer = require("lit-html/is-server.js");

Object.keys(_isServer).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _isServer[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _isServer[key];
    }
  });
});

},{"@lit/reactive-element":12,"lit-element/lit-element.js":23,"lit-html":27,"lit-html/is-server.js":26}]},{},[21]);
