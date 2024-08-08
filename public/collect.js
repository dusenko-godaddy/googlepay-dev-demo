(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

},{}],2:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');
var callBind = require('./');
var $indexOf = callBind(GetIntrinsic('String.prototype.indexOf'));
module.exports = function callBoundIntrinsic(name, allowMissing) {
  var intrinsic = GetIntrinsic(name, !!allowMissing);
  if (typeof intrinsic === 'function' && $indexOf(name, '.prototype.') > -1) {
    return callBind(intrinsic);
  }
  return intrinsic;
};

},{"./":3,"get-intrinsic":6}],3:[function(require,module,exports){
'use strict';

var bind = require('function-bind');
var GetIntrinsic = require('get-intrinsic');
var $apply = GetIntrinsic('%Function.prototype.apply%');
var $call = GetIntrinsic('%Function.prototype.call%');
var $reflectApply = GetIntrinsic('%Reflect.apply%', true) || bind.call($call, $apply);
var $gOPD = GetIntrinsic('%Object.getOwnPropertyDescriptor%', true);
var $defineProperty = GetIntrinsic('%Object.defineProperty%', true);
var $max = GetIntrinsic('%Math.max%');
if ($defineProperty) {
  try {
    $defineProperty({}, 'a', {
      value: 1
    });
  } catch (e) {
    // IE 8 has a broken defineProperty
    $defineProperty = null;
  }
}
module.exports = function callBind(originalFunction) {
  var func = $reflectApply(bind, $call, arguments);
  if ($gOPD && $defineProperty) {
    var desc = $gOPD(func, 'length');
    if (desc.configurable) {
      // original length, plus the receiver, minus any additional arguments (after the receiver)
      $defineProperty(func, 'length', {
        value: 1 + $max(0, originalFunction.length - (arguments.length - 1))
      });
    }
  }
  return func;
};
var applyBind = function applyBind() {
  return $reflectApply(bind, $apply, arguments);
};
if ($defineProperty) {
  $defineProperty(module.exports, 'apply', {
    value: applyBind
  });
} else {
  module.exports.apply = applyBind;
}

},{"function-bind":5,"get-intrinsic":6}],4:[function(require,module,exports){
'use strict';

/* eslint no-invalid-this: 1 */
var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
var toStr = Object.prototype.toString;
var max = Math.max;
var funcType = '[object Function]';
var concatty = function concatty(a, b) {
  var arr = [];
  for (var i = 0; i < a.length; i += 1) {
    arr[i] = a[i];
  }
  for (var j = 0; j < b.length; j += 1) {
    arr[j + a.length] = b[j];
  }
  return arr;
};
var slicy = function slicy(arrLike, offset) {
  var arr = [];
  for (var i = offset || 0, j = 0; i < arrLike.length; i += 1, j += 1) {
    arr[j] = arrLike[i];
  }
  return arr;
};
var joiny = function joiny(arr, joiner) {
  var str = '';
  for (var i = 0; i < arr.length; i += 1) {
    str += arr[i];
    if (i + 1 < arr.length) {
      str += joiner;
    }
  }
  return str;
};
module.exports = function bind(that) {
  var target = this;
  if (typeof target !== 'function' || toStr.apply(target) !== funcType) {
    throw new TypeError(ERROR_MESSAGE + target);
  }
  var args = slicy(arguments, 1);
  var bound;
  var binder = function binder() {
    if (this instanceof bound) {
      var result = target.apply(this, concatty(args, arguments));
      if (Object(result) === result) {
        return result;
      }
      return this;
    }
    return target.apply(that, concatty(args, arguments));
  };
  var boundLength = max(0, target.length - args.length);
  var boundArgs = [];
  for (var i = 0; i < boundLength; i++) {
    boundArgs[i] = '$' + i;
  }
  bound = Function('binder', 'return function (' + joiny(boundArgs, ',') + '){ return binder.apply(this,arguments); }')(binder);
  if (target.prototype) {
    var Empty = function Empty() {};
    Empty.prototype = target.prototype;
    bound.prototype = new Empty();
    Empty.prototype = null;
  }
  return bound;
};

},{}],5:[function(require,module,exports){
'use strict';

var implementation = require('./implementation');
module.exports = Function.prototype.bind || implementation;

},{"./implementation":4}],6:[function(require,module,exports){
'use strict';

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
var undefined;
var $SyntaxError = SyntaxError;
var $Function = Function;
var $TypeError = TypeError;

// eslint-disable-next-line consistent-return
var getEvalledConstructor = function getEvalledConstructor(expressionSyntax) {
  try {
    return $Function('"use strict"; return (' + expressionSyntax + ').constructor;')();
  } catch (e) {}
};
var $gOPD = Object.getOwnPropertyDescriptor;
if ($gOPD) {
  try {
    $gOPD({}, '');
  } catch (e) {
    $gOPD = null; // this is IE 8, which has a broken gOPD
  }
}

var throwTypeError = function throwTypeError() {
  throw new $TypeError();
};
var ThrowTypeError = $gOPD ? function () {
  try {
    // eslint-disable-next-line no-unused-expressions, no-caller, no-restricted-properties
    arguments.callee; // IE 8 does not throw here
    return throwTypeError;
  } catch (calleeThrows) {
    try {
      // IE 8 throws on Object.getOwnPropertyDescriptor(arguments, '')
      return $gOPD(arguments, 'callee').get;
    } catch (gOPDthrows) {
      return throwTypeError;
    }
  }
}() : throwTypeError;
var hasSymbols = require('has-symbols')();
var hasProto = require('has-proto')();
var getProto = Object.getPrototypeOf || (hasProto ? function (x) {
  return x.__proto__;
} // eslint-disable-line no-proto
: null);
var needsEval = {};
var TypedArray = typeof Uint8Array === 'undefined' || !getProto ? undefined : getProto(Uint8Array);
var INTRINSICS = {
  '%AggregateError%': typeof AggregateError === 'undefined' ? undefined : AggregateError,
  '%Array%': Array,
  '%ArrayBuffer%': typeof ArrayBuffer === 'undefined' ? undefined : ArrayBuffer,
  '%ArrayIteratorPrototype%': hasSymbols && getProto ? getProto([][Symbol.iterator]()) : undefined,
  '%AsyncFromSyncIteratorPrototype%': undefined,
  '%AsyncFunction%': needsEval,
  '%AsyncGenerator%': needsEval,
  '%AsyncGeneratorFunction%': needsEval,
  '%AsyncIteratorPrototype%': needsEval,
  '%Atomics%': typeof Atomics === 'undefined' ? undefined : Atomics,
  '%BigInt%': typeof BigInt === 'undefined' ? undefined : BigInt,
  '%BigInt64Array%': typeof BigInt64Array === 'undefined' ? undefined : BigInt64Array,
  '%BigUint64Array%': typeof BigUint64Array === 'undefined' ? undefined : BigUint64Array,
  '%Boolean%': Boolean,
  '%DataView%': typeof DataView === 'undefined' ? undefined : DataView,
  '%Date%': Date,
  '%decodeURI%': decodeURI,
  '%decodeURIComponent%': decodeURIComponent,
  '%encodeURI%': encodeURI,
  '%encodeURIComponent%': encodeURIComponent,
  '%Error%': Error,
  '%eval%': eval,
  // eslint-disable-line no-eval
  '%EvalError%': EvalError,
  '%Float32Array%': typeof Float32Array === 'undefined' ? undefined : Float32Array,
  '%Float64Array%': typeof Float64Array === 'undefined' ? undefined : Float64Array,
  '%FinalizationRegistry%': typeof FinalizationRegistry === 'undefined' ? undefined : FinalizationRegistry,
  '%Function%': $Function,
  '%GeneratorFunction%': needsEval,
  '%Int8Array%': typeof Int8Array === 'undefined' ? undefined : Int8Array,
  '%Int16Array%': typeof Int16Array === 'undefined' ? undefined : Int16Array,
  '%Int32Array%': typeof Int32Array === 'undefined' ? undefined : Int32Array,
  '%isFinite%': isFinite,
  '%isNaN%': isNaN,
  '%IteratorPrototype%': hasSymbols && getProto ? getProto(getProto([][Symbol.iterator]())) : undefined,
  '%JSON%': (typeof JSON === "undefined" ? "undefined" : _typeof(JSON)) === 'object' ? JSON : undefined,
  '%Map%': typeof Map === 'undefined' ? undefined : Map,
  '%MapIteratorPrototype%': typeof Map === 'undefined' || !hasSymbols || !getProto ? undefined : getProto(new Map()[Symbol.iterator]()),
  '%Math%': Math,
  '%Number%': Number,
  '%Object%': Object,
  '%parseFloat%': parseFloat,
  '%parseInt%': parseInt,
  '%Promise%': typeof Promise === 'undefined' ? undefined : Promise,
  '%Proxy%': typeof Proxy === 'undefined' ? undefined : Proxy,
  '%RangeError%': RangeError,
  '%ReferenceError%': ReferenceError,
  '%Reflect%': typeof Reflect === 'undefined' ? undefined : Reflect,
  '%RegExp%': RegExp,
  '%Set%': typeof Set === 'undefined' ? undefined : Set,
  '%SetIteratorPrototype%': typeof Set === 'undefined' || !hasSymbols || !getProto ? undefined : getProto(new Set()[Symbol.iterator]()),
  '%SharedArrayBuffer%': typeof SharedArrayBuffer === 'undefined' ? undefined : SharedArrayBuffer,
  '%String%': String,
  '%StringIteratorPrototype%': hasSymbols && getProto ? getProto(''[Symbol.iterator]()) : undefined,
  '%Symbol%': hasSymbols ? Symbol : undefined,
  '%SyntaxError%': $SyntaxError,
  '%ThrowTypeError%': ThrowTypeError,
  '%TypedArray%': TypedArray,
  '%TypeError%': $TypeError,
  '%Uint8Array%': typeof Uint8Array === 'undefined' ? undefined : Uint8Array,
  '%Uint8ClampedArray%': typeof Uint8ClampedArray === 'undefined' ? undefined : Uint8ClampedArray,
  '%Uint16Array%': typeof Uint16Array === 'undefined' ? undefined : Uint16Array,
  '%Uint32Array%': typeof Uint32Array === 'undefined' ? undefined : Uint32Array,
  '%URIError%': URIError,
  '%WeakMap%': typeof WeakMap === 'undefined' ? undefined : WeakMap,
  '%WeakRef%': typeof WeakRef === 'undefined' ? undefined : WeakRef,
  '%WeakSet%': typeof WeakSet === 'undefined' ? undefined : WeakSet
};
if (getProto) {
  try {
    null.error; // eslint-disable-line no-unused-expressions
  } catch (e) {
    // https://github.com/tc39/proposal-shadowrealm/pull/384#issuecomment-1364264229
    var errorProto = getProto(getProto(e));
    INTRINSICS['%Error.prototype%'] = errorProto;
  }
}
var doEval = function doEval(name) {
  var value;
  if (name === '%AsyncFunction%') {
    value = getEvalledConstructor('async function () {}');
  } else if (name === '%GeneratorFunction%') {
    value = getEvalledConstructor('function* () {}');
  } else if (name === '%AsyncGeneratorFunction%') {
    value = getEvalledConstructor('async function* () {}');
  } else if (name === '%AsyncGenerator%') {
    var fn = doEval('%AsyncGeneratorFunction%');
    if (fn) {
      value = fn.prototype;
    }
  } else if (name === '%AsyncIteratorPrototype%') {
    var gen = doEval('%AsyncGenerator%');
    if (gen && getProto) {
      value = getProto(gen.prototype);
    }
  }
  INTRINSICS[name] = value;
  return value;
};
var LEGACY_ALIASES = {
  '%ArrayBufferPrototype%': ['ArrayBuffer', 'prototype'],
  '%ArrayPrototype%': ['Array', 'prototype'],
  '%ArrayProto_entries%': ['Array', 'prototype', 'entries'],
  '%ArrayProto_forEach%': ['Array', 'prototype', 'forEach'],
  '%ArrayProto_keys%': ['Array', 'prototype', 'keys'],
  '%ArrayProto_values%': ['Array', 'prototype', 'values'],
  '%AsyncFunctionPrototype%': ['AsyncFunction', 'prototype'],
  '%AsyncGenerator%': ['AsyncGeneratorFunction', 'prototype'],
  '%AsyncGeneratorPrototype%': ['AsyncGeneratorFunction', 'prototype', 'prototype'],
  '%BooleanPrototype%': ['Boolean', 'prototype'],
  '%DataViewPrototype%': ['DataView', 'prototype'],
  '%DatePrototype%': ['Date', 'prototype'],
  '%ErrorPrototype%': ['Error', 'prototype'],
  '%EvalErrorPrototype%': ['EvalError', 'prototype'],
  '%Float32ArrayPrototype%': ['Float32Array', 'prototype'],
  '%Float64ArrayPrototype%': ['Float64Array', 'prototype'],
  '%FunctionPrototype%': ['Function', 'prototype'],
  '%Generator%': ['GeneratorFunction', 'prototype'],
  '%GeneratorPrototype%': ['GeneratorFunction', 'prototype', 'prototype'],
  '%Int8ArrayPrototype%': ['Int8Array', 'prototype'],
  '%Int16ArrayPrototype%': ['Int16Array', 'prototype'],
  '%Int32ArrayPrototype%': ['Int32Array', 'prototype'],
  '%JSONParse%': ['JSON', 'parse'],
  '%JSONStringify%': ['JSON', 'stringify'],
  '%MapPrototype%': ['Map', 'prototype'],
  '%NumberPrototype%': ['Number', 'prototype'],
  '%ObjectPrototype%': ['Object', 'prototype'],
  '%ObjProto_toString%': ['Object', 'prototype', 'toString'],
  '%ObjProto_valueOf%': ['Object', 'prototype', 'valueOf'],
  '%PromisePrototype%': ['Promise', 'prototype'],
  '%PromiseProto_then%': ['Promise', 'prototype', 'then'],
  '%Promise_all%': ['Promise', 'all'],
  '%Promise_reject%': ['Promise', 'reject'],
  '%Promise_resolve%': ['Promise', 'resolve'],
  '%RangeErrorPrototype%': ['RangeError', 'prototype'],
  '%ReferenceErrorPrototype%': ['ReferenceError', 'prototype'],
  '%RegExpPrototype%': ['RegExp', 'prototype'],
  '%SetPrototype%': ['Set', 'prototype'],
  '%SharedArrayBufferPrototype%': ['SharedArrayBuffer', 'prototype'],
  '%StringPrototype%': ['String', 'prototype'],
  '%SymbolPrototype%': ['Symbol', 'prototype'],
  '%SyntaxErrorPrototype%': ['SyntaxError', 'prototype'],
  '%TypedArrayPrototype%': ['TypedArray', 'prototype'],
  '%TypeErrorPrototype%': ['TypeError', 'prototype'],
  '%Uint8ArrayPrototype%': ['Uint8Array', 'prototype'],
  '%Uint8ClampedArrayPrototype%': ['Uint8ClampedArray', 'prototype'],
  '%Uint16ArrayPrototype%': ['Uint16Array', 'prototype'],
  '%Uint32ArrayPrototype%': ['Uint32Array', 'prototype'],
  '%URIErrorPrototype%': ['URIError', 'prototype'],
  '%WeakMapPrototype%': ['WeakMap', 'prototype'],
  '%WeakSetPrototype%': ['WeakSet', 'prototype']
};
var bind = require('function-bind');
var hasOwn = require('has');
var $concat = bind.call(Function.call, Array.prototype.concat);
var $spliceApply = bind.call(Function.apply, Array.prototype.splice);
var $replace = bind.call(Function.call, String.prototype.replace);
var $strSlice = bind.call(Function.call, String.prototype.slice);
var $exec = bind.call(Function.call, RegExp.prototype.exec);

/* adapted from https://github.com/lodash/lodash/blob/4.17.15/dist/lodash.js#L6735-L6744 */
var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
var reEscapeChar = /\\(\\)?/g; /** Used to match backslashes in property paths. */
var stringToPath = function stringToPath(string) {
  var first = $strSlice(string, 0, 1);
  var last = $strSlice(string, -1);
  if (first === '%' && last !== '%') {
    throw new $SyntaxError('invalid intrinsic syntax, expected closing `%`');
  } else if (last === '%' && first !== '%') {
    throw new $SyntaxError('invalid intrinsic syntax, expected opening `%`');
  }
  var result = [];
  $replace(string, rePropName, function (match, number, quote, subString) {
    result[result.length] = quote ? $replace(subString, reEscapeChar, '$1') : number || match;
  });
  return result;
};
/* end adaptation */

var getBaseIntrinsic = function getBaseIntrinsic(name, allowMissing) {
  var intrinsicName = name;
  var alias;
  if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
    alias = LEGACY_ALIASES[intrinsicName];
    intrinsicName = '%' + alias[0] + '%';
  }
  if (hasOwn(INTRINSICS, intrinsicName)) {
    var value = INTRINSICS[intrinsicName];
    if (value === needsEval) {
      value = doEval(intrinsicName);
    }
    if (typeof value === 'undefined' && !allowMissing) {
      throw new $TypeError('intrinsic ' + name + ' exists, but is not available. Please file an issue!');
    }
    return {
      alias: alias,
      name: intrinsicName,
      value: value
    };
  }
  throw new $SyntaxError('intrinsic ' + name + ' does not exist!');
};
module.exports = function GetIntrinsic(name, allowMissing) {
  if (typeof name !== 'string' || name.length === 0) {
    throw new $TypeError('intrinsic name must be a non-empty string');
  }
  if (arguments.length > 1 && typeof allowMissing !== 'boolean') {
    throw new $TypeError('"allowMissing" argument must be a boolean');
  }
  if ($exec(/^%?[^%]*%?$/, name) === null) {
    throw new $SyntaxError('`%` may not be present anywhere but at the beginning and end of the intrinsic name');
  }
  var parts = stringToPath(name);
  var intrinsicBaseName = parts.length > 0 ? parts[0] : '';
  var intrinsic = getBaseIntrinsic('%' + intrinsicBaseName + '%', allowMissing);
  var intrinsicRealName = intrinsic.name;
  var value = intrinsic.value;
  var skipFurtherCaching = false;
  var alias = intrinsic.alias;
  if (alias) {
    intrinsicBaseName = alias[0];
    $spliceApply(parts, $concat([0, 1], alias));
  }
  for (var i = 1, isOwn = true; i < parts.length; i += 1) {
    var part = parts[i];
    var first = $strSlice(part, 0, 1);
    var last = $strSlice(part, -1);
    if ((first === '"' || first === "'" || first === '`' || last === '"' || last === "'" || last === '`') && first !== last) {
      throw new $SyntaxError('property names with quotes must have matching quotes');
    }
    if (part === 'constructor' || !isOwn) {
      skipFurtherCaching = true;
    }
    intrinsicBaseName += '.' + part;
    intrinsicRealName = '%' + intrinsicBaseName + '%';
    if (hasOwn(INTRINSICS, intrinsicRealName)) {
      value = INTRINSICS[intrinsicRealName];
    } else if (value != null) {
      if (!(part in value)) {
        if (!allowMissing) {
          throw new $TypeError('base intrinsic for ' + name + ' exists, but the property is not available.');
        }
        return void undefined;
      }
      if ($gOPD && i + 1 >= parts.length) {
        var desc = $gOPD(value, part);
        isOwn = !!desc;

        // By convention, when a data property is converted to an accessor
        // property to emulate a data property that does not suffer from
        // the override mistake, that accessor's getter is marked with
        // an `originalValue` property. Here, when we detect this, we
        // uphold the illusion by pretending to see that original data
        // property, i.e., returning the value rather than the getter
        // itself.
        if (isOwn && 'get' in desc && !('originalValue' in desc.get)) {
          value = desc.get;
        } else {
          value = value[part];
        }
      } else {
        isOwn = hasOwn(value, part);
        value = value[part];
      }
      if (isOwn && !skipFurtherCaching) {
        INTRINSICS[intrinsicRealName] = value;
      }
    }
  }
  return value;
};

},{"function-bind":5,"has":10,"has-proto":7,"has-symbols":8}],7:[function(require,module,exports){
'use strict';

var test = {
  foo: {}
};
var $Object = Object;
module.exports = function hasProto() {
  return {
    __proto__: test
  }.foo === test.foo && !({
    __proto__: null
  } instanceof $Object);
};

},{}],8:[function(require,module,exports){
'use strict';

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
var origSymbol = typeof Symbol !== 'undefined' && Symbol;
var hasSymbolSham = require('./shams');
module.exports = function hasNativeSymbols() {
  if (typeof origSymbol !== 'function') {
    return false;
  }
  if (typeof Symbol !== 'function') {
    return false;
  }
  if (_typeof(origSymbol('foo')) !== 'symbol') {
    return false;
  }
  if (_typeof(Symbol('bar')) !== 'symbol') {
    return false;
  }
  return hasSymbolSham();
};

},{"./shams":9}],9:[function(require,module,exports){
'use strict';

/* eslint complexity: [2, 18], max-statements: [2, 33] */
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
module.exports = function hasSymbols() {
  if (typeof Symbol !== 'function' || typeof Object.getOwnPropertySymbols !== 'function') {
    return false;
  }
  if (_typeof(Symbol.iterator) === 'symbol') {
    return true;
  }
  var obj = {};
  var sym = Symbol('test');
  var symObj = Object(sym);
  if (typeof sym === 'string') {
    return false;
  }
  if (Object.prototype.toString.call(sym) !== '[object Symbol]') {
    return false;
  }
  if (Object.prototype.toString.call(symObj) !== '[object Symbol]') {
    return false;
  }

  // temp disabled per https://github.com/ljharb/object.assign/issues/17
  // if (sym instanceof Symbol) { return false; }
  // temp disabled per https://github.com/WebReflection/get-own-property-symbols/issues/4
  // if (!(symObj instanceof Symbol)) { return false; }

  // if (typeof Symbol.prototype.toString !== 'function') { return false; }
  // if (String(sym) !== Symbol.prototype.toString.call(sym)) { return false; }

  var symVal = 42;
  obj[sym] = symVal;
  for (sym in obj) {
    return false;
  } // eslint-disable-line no-restricted-syntax, no-unreachable-loop
  if (typeof Object.keys === 'function' && Object.keys(obj).length !== 0) {
    return false;
  }
  if (typeof Object.getOwnPropertyNames === 'function' && Object.getOwnPropertyNames(obj).length !== 0) {
    return false;
  }
  var syms = Object.getOwnPropertySymbols(obj);
  if (syms.length !== 1 || syms[0] !== sym) {
    return false;
  }
  if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) {
    return false;
  }
  if (typeof Object.getOwnPropertyDescriptor === 'function') {
    var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
    if (descriptor.value !== symVal || descriptor.enumerable !== true) {
      return false;
    }
  }
  return true;
};

},{}],10:[function(require,module,exports){
'use strict';

var hasOwnProperty = {}.hasOwnProperty;
var call = Function.prototype.call;
module.exports = call.bind ? call.bind(hasOwnProperty) : function (O, P) {
  return call.call(hasOwnProperty, O, P);
};

},{}],11:[function(require,module,exports){
"use strict";

function e(e) {
  this.message = e;
}
e.prototype = new Error(), e.prototype.name = "InvalidCharacterError";
var r = "undefined" != typeof window && window.atob && window.atob.bind(window) || function (r) {
  var t = String(r).replace(/=+$/, "");
  if (t.length % 4 == 1) throw new e("'atob' failed: The string to be decoded is not correctly encoded.");
  for (var n, o, a = 0, i = 0, c = ""; o = t.charAt(i++); ~o && (n = a % 4 ? 64 * n + o : o, a++ % 4) ? c += String.fromCharCode(255 & n >> (-2 * a & 6)) : 0) o = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(o);
  return c;
};
function t(e) {
  var t = e.replace(/-/g, "+").replace(/_/g, "/");
  switch (t.length % 4) {
    case 0:
      break;
    case 2:
      t += "==";
      break;
    case 3:
      t += "=";
      break;
    default:
      throw "Illegal base64url string!";
  }
  try {
    return function (e) {
      return decodeURIComponent(r(e).replace(/(.)/g, function (e, r) {
        var t = r.charCodeAt(0).toString(16).toUpperCase();
        return t.length < 2 && (t = "0" + t), "%" + t;
      }));
    }(t);
  } catch (e) {
    return r(t);
  }
}
function n(e) {
  this.message = e;
}
function o(e, r) {
  if ("string" != typeof e) throw new n("Invalid token specified");
  var o = !0 === (r = r || {}).header ? 0 : 1;
  try {
    return JSON.parse(t(e.split(".")[o]));
  } catch (e) {
    throw new n("Invalid token specified: " + e.message);
  }
}
n.prototype = new Error(), n.prototype.name = "InvalidTokenError";
var a = o;
a["default"] = o, a.InvalidTokenError = n, module.exports = a;

},{}],12:[function(require,module,exports){
module.exports={
  "cardOnFile.termsAndConditions": "Terms & Conditions",
  "cardOnFile.accept": "ACCEPT",
  "cardOnFile.decline": "DECLINE"
}

},{}],13:[function(require,module,exports){
arguments[4][12][0].apply(exports,arguments)
},{"dup":12}],14:[function(require,module,exports){
module.exports={
  "cardOnFile.termsAndConditions": "Conditions d’utilisation",
  "cardOnFile.accept": "ACCEPTER",
  "cardOnFile.decline": "REFUSER"
}
},{}],15:[function(require,module,exports){
(function (global){(function (){
"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
var hasMap = typeof Map === 'function' && Map.prototype;
var mapSizeDescriptor = Object.getOwnPropertyDescriptor && hasMap ? Object.getOwnPropertyDescriptor(Map.prototype, 'size') : null;
var mapSize = hasMap && mapSizeDescriptor && typeof mapSizeDescriptor.get === 'function' ? mapSizeDescriptor.get : null;
var mapForEach = hasMap && Map.prototype.forEach;
var hasSet = typeof Set === 'function' && Set.prototype;
var setSizeDescriptor = Object.getOwnPropertyDescriptor && hasSet ? Object.getOwnPropertyDescriptor(Set.prototype, 'size') : null;
var setSize = hasSet && setSizeDescriptor && typeof setSizeDescriptor.get === 'function' ? setSizeDescriptor.get : null;
var setForEach = hasSet && Set.prototype.forEach;
var hasWeakMap = typeof WeakMap === 'function' && WeakMap.prototype;
var weakMapHas = hasWeakMap ? WeakMap.prototype.has : null;
var hasWeakSet = typeof WeakSet === 'function' && WeakSet.prototype;
var weakSetHas = hasWeakSet ? WeakSet.prototype.has : null;
var hasWeakRef = typeof WeakRef === 'function' && WeakRef.prototype;
var weakRefDeref = hasWeakRef ? WeakRef.prototype.deref : null;
var booleanValueOf = Boolean.prototype.valueOf;
var objectToString = Object.prototype.toString;
var functionToString = Function.prototype.toString;
var $match = String.prototype.match;
var $slice = String.prototype.slice;
var $replace = String.prototype.replace;
var $toUpperCase = String.prototype.toUpperCase;
var $toLowerCase = String.prototype.toLowerCase;
var $test = RegExp.prototype.test;
var $concat = Array.prototype.concat;
var $join = Array.prototype.join;
var $arrSlice = Array.prototype.slice;
var $floor = Math.floor;
var bigIntValueOf = typeof BigInt === 'function' ? BigInt.prototype.valueOf : null;
var gOPS = Object.getOwnPropertySymbols;
var symToString = typeof Symbol === 'function' && _typeof(Symbol.iterator) === 'symbol' ? Symbol.prototype.toString : null;
var hasShammedSymbols = typeof Symbol === 'function' && _typeof(Symbol.iterator) === 'object';
// ie, `has-tostringtag/shams
var toStringTag = typeof Symbol === 'function' && Symbol.toStringTag && (_typeof(Symbol.toStringTag) === hasShammedSymbols ? 'object' : 'symbol') ? Symbol.toStringTag : null;
var isEnumerable = Object.prototype.propertyIsEnumerable;
var gPO = (typeof Reflect === 'function' ? Reflect.getPrototypeOf : Object.getPrototypeOf) || ([].__proto__ === Array.prototype // eslint-disable-line no-proto
? function (O) {
  return O.__proto__; // eslint-disable-line no-proto
} : null);
function addNumericSeparator(num, str) {
  if (num === Infinity || num === -Infinity || num !== num || num && num > -1000 && num < 1000 || $test.call(/e/, str)) {
    return str;
  }
  var sepRegex = /[0-9](?=(?:[0-9]{3})+(?![0-9]))/g;
  if (typeof num === 'number') {
    var _int = num < 0 ? -$floor(-num) : $floor(num); // trunc(num)
    if (_int !== num) {
      var intStr = String(_int);
      var dec = $slice.call(str, intStr.length + 1);
      return $replace.call(intStr, sepRegex, '$&_') + '.' + $replace.call($replace.call(dec, /([0-9]{3})/g, '$&_'), /_$/, '');
    }
  }
  return $replace.call(str, sepRegex, '$&_');
}
var utilInspect = require('./util.inspect');
var inspectCustom = utilInspect.custom;
var inspectSymbol = isSymbol(inspectCustom) ? inspectCustom : null;
module.exports = function inspect_(obj, options, depth, seen) {
  var opts = options || {};
  if (has(opts, 'quoteStyle') && opts.quoteStyle !== 'single' && opts.quoteStyle !== 'double') {
    throw new TypeError('option "quoteStyle" must be "single" or "double"');
  }
  if (has(opts, 'maxStringLength') && (typeof opts.maxStringLength === 'number' ? opts.maxStringLength < 0 && opts.maxStringLength !== Infinity : opts.maxStringLength !== null)) {
    throw new TypeError('option "maxStringLength", if provided, must be a positive integer, Infinity, or `null`');
  }
  var customInspect = has(opts, 'customInspect') ? opts.customInspect : true;
  if (typeof customInspect !== 'boolean' && customInspect !== 'symbol') {
    throw new TypeError('option "customInspect", if provided, must be `true`, `false`, or `\'symbol\'`');
  }
  if (has(opts, 'indent') && opts.indent !== null && opts.indent !== '\t' && !(parseInt(opts.indent, 10) === opts.indent && opts.indent > 0)) {
    throw new TypeError('option "indent" must be "\\t", an integer > 0, or `null`');
  }
  if (has(opts, 'numericSeparator') && typeof opts.numericSeparator !== 'boolean') {
    throw new TypeError('option "numericSeparator", if provided, must be `true` or `false`');
  }
  var numericSeparator = opts.numericSeparator;
  if (typeof obj === 'undefined') {
    return 'undefined';
  }
  if (obj === null) {
    return 'null';
  }
  if (typeof obj === 'boolean') {
    return obj ? 'true' : 'false';
  }
  if (typeof obj === 'string') {
    return inspectString(obj, opts);
  }
  if (typeof obj === 'number') {
    if (obj === 0) {
      return Infinity / obj > 0 ? '0' : '-0';
    }
    var str = String(obj);
    return numericSeparator ? addNumericSeparator(obj, str) : str;
  }
  if (typeof obj === 'bigint') {
    var bigIntStr = String(obj) + 'n';
    return numericSeparator ? addNumericSeparator(obj, bigIntStr) : bigIntStr;
  }
  var maxDepth = typeof opts.depth === 'undefined' ? 5 : opts.depth;
  if (typeof depth === 'undefined') {
    depth = 0;
  }
  if (depth >= maxDepth && maxDepth > 0 && _typeof(obj) === 'object') {
    return isArray(obj) ? '[Array]' : '[Object]';
  }
  var indent = getIndent(opts, depth);
  if (typeof seen === 'undefined') {
    seen = [];
  } else if (indexOf(seen, obj) >= 0) {
    return '[Circular]';
  }
  function inspect(value, from, noIndent) {
    if (from) {
      seen = $arrSlice.call(seen);
      seen.push(from);
    }
    if (noIndent) {
      var newOpts = {
        depth: opts.depth
      };
      if (has(opts, 'quoteStyle')) {
        newOpts.quoteStyle = opts.quoteStyle;
      }
      return inspect_(value, newOpts, depth + 1, seen);
    }
    return inspect_(value, opts, depth + 1, seen);
  }
  if (typeof obj === 'function' && !isRegExp(obj)) {
    // in older engines, regexes are callable
    var name = nameOf(obj);
    var keys = arrObjKeys(obj, inspect);
    return '[Function' + (name ? ': ' + name : ' (anonymous)') + ']' + (keys.length > 0 ? ' { ' + $join.call(keys, ', ') + ' }' : '');
  }
  if (isSymbol(obj)) {
    var symString = hasShammedSymbols ? $replace.call(String(obj), /^(Symbol\(.*\))_[^)]*$/, '$1') : symToString.call(obj);
    return _typeof(obj) === 'object' && !hasShammedSymbols ? markBoxed(symString) : symString;
  }
  if (isElement(obj)) {
    var s = '<' + $toLowerCase.call(String(obj.nodeName));
    var attrs = obj.attributes || [];
    for (var i = 0; i < attrs.length; i++) {
      s += ' ' + attrs[i].name + '=' + wrapQuotes(quote(attrs[i].value), 'double', opts);
    }
    s += '>';
    if (obj.childNodes && obj.childNodes.length) {
      s += '...';
    }
    s += '</' + $toLowerCase.call(String(obj.nodeName)) + '>';
    return s;
  }
  if (isArray(obj)) {
    if (obj.length === 0) {
      return '[]';
    }
    var xs = arrObjKeys(obj, inspect);
    if (indent && !singleLineValues(xs)) {
      return '[' + indentedJoin(xs, indent) + ']';
    }
    return '[ ' + $join.call(xs, ', ') + ' ]';
  }
  if (isError(obj)) {
    var parts = arrObjKeys(obj, inspect);
    if (!('cause' in Error.prototype) && 'cause' in obj && !isEnumerable.call(obj, 'cause')) {
      return '{ [' + String(obj) + '] ' + $join.call($concat.call('[cause]: ' + inspect(obj.cause), parts), ', ') + ' }';
    }
    if (parts.length === 0) {
      return '[' + String(obj) + ']';
    }
    return '{ [' + String(obj) + '] ' + $join.call(parts, ', ') + ' }';
  }
  if (_typeof(obj) === 'object' && customInspect) {
    if (inspectSymbol && typeof obj[inspectSymbol] === 'function' && utilInspect) {
      return utilInspect(obj, {
        depth: maxDepth - depth
      });
    } else if (customInspect !== 'symbol' && typeof obj.inspect === 'function') {
      return obj.inspect();
    }
  }
  if (isMap(obj)) {
    var mapParts = [];
    if (mapForEach) {
      mapForEach.call(obj, function (value, key) {
        mapParts.push(inspect(key, obj, true) + ' => ' + inspect(value, obj));
      });
    }
    return collectionOf('Map', mapSize.call(obj), mapParts, indent);
  }
  if (isSet(obj)) {
    var setParts = [];
    if (setForEach) {
      setForEach.call(obj, function (value) {
        setParts.push(inspect(value, obj));
      });
    }
    return collectionOf('Set', setSize.call(obj), setParts, indent);
  }
  if (isWeakMap(obj)) {
    return weakCollectionOf('WeakMap');
  }
  if (isWeakSet(obj)) {
    return weakCollectionOf('WeakSet');
  }
  if (isWeakRef(obj)) {
    return weakCollectionOf('WeakRef');
  }
  if (isNumber(obj)) {
    return markBoxed(inspect(Number(obj)));
  }
  if (isBigInt(obj)) {
    return markBoxed(inspect(bigIntValueOf.call(obj)));
  }
  if (isBoolean(obj)) {
    return markBoxed(booleanValueOf.call(obj));
  }
  if (isString(obj)) {
    return markBoxed(inspect(String(obj)));
  }
  if (obj === global) {
    /* eslint-env browser */
    if (typeof window !== 'undefined') {
      return '{ [object Window] }';
    }
    return '{ [object global] }';
  }
  if (!isDate(obj) && !isRegExp(obj)) {
    var ys = arrObjKeys(obj, inspect);
    var isPlainObject = gPO ? gPO(obj) === Object.prototype : obj instanceof Object || obj.constructor === Object;
    var protoTag = obj instanceof Object ? '' : 'null prototype';
    var stringTag = !isPlainObject && toStringTag && Object(obj) === obj && toStringTag in obj ? $slice.call(toStr(obj), 8, -1) : protoTag ? 'Object' : '';
    var constructorTag = isPlainObject || typeof obj.constructor !== 'function' ? '' : obj.constructor.name ? obj.constructor.name + ' ' : '';
    var tag = constructorTag + (stringTag || protoTag ? '[' + $join.call($concat.call([], stringTag || [], protoTag || []), ': ') + '] ' : '');
    if (ys.length === 0) {
      return tag + '{}';
    }
    if (indent) {
      return tag + '{' + indentedJoin(ys, indent) + '}';
    }
    return tag + '{ ' + $join.call(ys, ', ') + ' }';
  }
  return String(obj);
};
function wrapQuotes(s, defaultStyle, opts) {
  var quoteChar = (opts.quoteStyle || defaultStyle) === 'double' ? '"' : "'";
  return quoteChar + s + quoteChar;
}
function quote(s) {
  return $replace.call(String(s), /"/g, '&quot;');
}
function isArray(obj) {
  return toStr(obj) === '[object Array]' && (!toStringTag || !(_typeof(obj) === 'object' && toStringTag in obj));
}
function isDate(obj) {
  return toStr(obj) === '[object Date]' && (!toStringTag || !(_typeof(obj) === 'object' && toStringTag in obj));
}
function isRegExp(obj) {
  return toStr(obj) === '[object RegExp]' && (!toStringTag || !(_typeof(obj) === 'object' && toStringTag in obj));
}
function isError(obj) {
  return toStr(obj) === '[object Error]' && (!toStringTag || !(_typeof(obj) === 'object' && toStringTag in obj));
}
function isString(obj) {
  return toStr(obj) === '[object String]' && (!toStringTag || !(_typeof(obj) === 'object' && toStringTag in obj));
}
function isNumber(obj) {
  return toStr(obj) === '[object Number]' && (!toStringTag || !(_typeof(obj) === 'object' && toStringTag in obj));
}
function isBoolean(obj) {
  return toStr(obj) === '[object Boolean]' && (!toStringTag || !(_typeof(obj) === 'object' && toStringTag in obj));
}

// Symbol and BigInt do have Symbol.toStringTag by spec, so that can't be used to eliminate false positives
function isSymbol(obj) {
  if (hasShammedSymbols) {
    return obj && _typeof(obj) === 'object' && obj instanceof Symbol;
  }
  if (_typeof(obj) === 'symbol') {
    return true;
  }
  if (!obj || _typeof(obj) !== 'object' || !symToString) {
    return false;
  }
  try {
    symToString.call(obj);
    return true;
  } catch (e) {}
  return false;
}
function isBigInt(obj) {
  if (!obj || _typeof(obj) !== 'object' || !bigIntValueOf) {
    return false;
  }
  try {
    bigIntValueOf.call(obj);
    return true;
  } catch (e) {}
  return false;
}
var hasOwn = Object.prototype.hasOwnProperty || function (key) {
  return key in this;
};
function has(obj, key) {
  return hasOwn.call(obj, key);
}
function toStr(obj) {
  return objectToString.call(obj);
}
function nameOf(f) {
  if (f.name) {
    return f.name;
  }
  var m = $match.call(functionToString.call(f), /^function\s*([\w$]+)/);
  if (m) {
    return m[1];
  }
  return null;
}
function indexOf(xs, x) {
  if (xs.indexOf) {
    return xs.indexOf(x);
  }
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) {
      return i;
    }
  }
  return -1;
}
function isMap(x) {
  if (!mapSize || !x || _typeof(x) !== 'object') {
    return false;
  }
  try {
    mapSize.call(x);
    try {
      setSize.call(x);
    } catch (s) {
      return true;
    }
    return x instanceof Map; // core-js workaround, pre-v2.5.0
  } catch (e) {}
  return false;
}
function isWeakMap(x) {
  if (!weakMapHas || !x || _typeof(x) !== 'object') {
    return false;
  }
  try {
    weakMapHas.call(x, weakMapHas);
    try {
      weakSetHas.call(x, weakSetHas);
    } catch (s) {
      return true;
    }
    return x instanceof WeakMap; // core-js workaround, pre-v2.5.0
  } catch (e) {}
  return false;
}
function isWeakRef(x) {
  if (!weakRefDeref || !x || _typeof(x) !== 'object') {
    return false;
  }
  try {
    weakRefDeref.call(x);
    return true;
  } catch (e) {}
  return false;
}
function isSet(x) {
  if (!setSize || !x || _typeof(x) !== 'object') {
    return false;
  }
  try {
    setSize.call(x);
    try {
      mapSize.call(x);
    } catch (m) {
      return true;
    }
    return x instanceof Set; // core-js workaround, pre-v2.5.0
  } catch (e) {}
  return false;
}
function isWeakSet(x) {
  if (!weakSetHas || !x || _typeof(x) !== 'object') {
    return false;
  }
  try {
    weakSetHas.call(x, weakSetHas);
    try {
      weakMapHas.call(x, weakMapHas);
    } catch (s) {
      return true;
    }
    return x instanceof WeakSet; // core-js workaround, pre-v2.5.0
  } catch (e) {}
  return false;
}
function isElement(x) {
  if (!x || _typeof(x) !== 'object') {
    return false;
  }
  if (typeof HTMLElement !== 'undefined' && x instanceof HTMLElement) {
    return true;
  }
  return typeof x.nodeName === 'string' && typeof x.getAttribute === 'function';
}
function inspectString(str, opts) {
  if (str.length > opts.maxStringLength) {
    var remaining = str.length - opts.maxStringLength;
    var trailer = '... ' + remaining + ' more character' + (remaining > 1 ? 's' : '');
    return inspectString($slice.call(str, 0, opts.maxStringLength), opts) + trailer;
  }
  // eslint-disable-next-line no-control-regex
  var s = $replace.call($replace.call(str, /(['\\])/g, '\\$1'), /[\x00-\x1f]/g, lowbyte);
  return wrapQuotes(s, 'single', opts);
}
function lowbyte(c) {
  var n = c.charCodeAt(0);
  var x = {
    8: 'b',
    9: 't',
    10: 'n',
    12: 'f',
    13: 'r'
  }[n];
  if (x) {
    return '\\' + x;
  }
  return '\\x' + (n < 0x10 ? '0' : '') + $toUpperCase.call(n.toString(16));
}
function markBoxed(str) {
  return 'Object(' + str + ')';
}
function weakCollectionOf(type) {
  return type + ' { ? }';
}
function collectionOf(type, size, entries, indent) {
  var joinedEntries = indent ? indentedJoin(entries, indent) : $join.call(entries, ', ');
  return type + ' (' + size + ') {' + joinedEntries + '}';
}
function singleLineValues(xs) {
  for (var i = 0; i < xs.length; i++) {
    if (indexOf(xs[i], '\n') >= 0) {
      return false;
    }
  }
  return true;
}
function getIndent(opts, depth) {
  var baseIndent;
  if (opts.indent === '\t') {
    baseIndent = '\t';
  } else if (typeof opts.indent === 'number' && opts.indent > 0) {
    baseIndent = $join.call(Array(opts.indent + 1), ' ');
  } else {
    return null;
  }
  return {
    base: baseIndent,
    prev: $join.call(Array(depth + 1), baseIndent)
  };
}
function indentedJoin(xs, indent) {
  if (xs.length === 0) {
    return '';
  }
  var lineJoiner = '\n' + indent.prev + indent.base;
  return lineJoiner + $join.call(xs, ',' + lineJoiner) + '\n' + indent.prev;
}
function arrObjKeys(obj, inspect) {
  var isArr = isArray(obj);
  var xs = [];
  if (isArr) {
    xs.length = obj.length;
    for (var i = 0; i < obj.length; i++) {
      xs[i] = has(obj, i) ? inspect(obj[i], obj) : '';
    }
  }
  var syms = typeof gOPS === 'function' ? gOPS(obj) : [];
  var symMap;
  if (hasShammedSymbols) {
    symMap = {};
    for (var k = 0; k < syms.length; k++) {
      symMap['$' + syms[k]] = syms[k];
    }
  }
  for (var key in obj) {
    // eslint-disable-line no-restricted-syntax
    if (!has(obj, key)) {
      continue;
    } // eslint-disable-line no-restricted-syntax, no-continue
    if (isArr && String(Number(key)) === key && key < obj.length) {
      continue;
    } // eslint-disable-line no-restricted-syntax, no-continue
    if (hasShammedSymbols && symMap['$' + key] instanceof Symbol) {
      // this is to prevent shammed Symbols, which are stored as strings, from being included in the string key section
      continue; // eslint-disable-line no-restricted-syntax, no-continue
    } else if ($test.call(/[^\w$]/, key)) {
      xs.push(inspect(key, obj) + ': ' + inspect(obj[key], obj));
    } else {
      xs.push(key + ': ' + inspect(obj[key], obj));
    }
  }
  if (typeof gOPS === 'function') {
    for (var j = 0; j < syms.length; j++) {
      if (isEnumerable.call(obj, syms[j])) {
        xs.push('[' + inspect(syms[j]) + ']: ' + inspect(obj[syms[j]], obj));
      }
    }
  }
  return xs;
}

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./util.inspect":1}],16:[function(require,module,exports){
'use strict';

var replace = String.prototype.replace;
var percentTwenties = /%20/g;
var Format = {
  RFC1738: 'RFC1738',
  RFC3986: 'RFC3986'
};
module.exports = {
  'default': Format.RFC3986,
  formatters: {
    RFC1738: function RFC1738(value) {
      return replace.call(value, percentTwenties, '+');
    },
    RFC3986: function RFC3986(value) {
      return String(value);
    }
  },
  RFC1738: Format.RFC1738,
  RFC3986: Format.RFC3986
};

},{}],17:[function(require,module,exports){
'use strict';

var stringify = require('./stringify');
var parse = require('./parse');
var formats = require('./formats');
module.exports = {
  formats: formats,
  parse: parse,
  stringify: stringify
};

},{"./formats":16,"./parse":18,"./stringify":19}],18:[function(require,module,exports){
'use strict';

var utils = require('./utils');
var has = Object.prototype.hasOwnProperty;
var isArray = Array.isArray;
var defaults = {
  allowDots: false,
  allowPrototypes: false,
  allowSparse: false,
  arrayLimit: 20,
  charset: 'utf-8',
  charsetSentinel: false,
  comma: false,
  decoder: utils.decode,
  delimiter: '&',
  depth: 5,
  ignoreQueryPrefix: false,
  interpretNumericEntities: false,
  parameterLimit: 1000,
  parseArrays: true,
  plainObjects: false,
  strictNullHandling: false
};
var interpretNumericEntities = function interpretNumericEntities(str) {
  return str.replace(/&#(\d+);/g, function ($0, numberStr) {
    return String.fromCharCode(parseInt(numberStr, 10));
  });
};
var parseArrayValue = function parseArrayValue(val, options) {
  if (val && typeof val === 'string' && options.comma && val.indexOf(',') > -1) {
    return val.split(',');
  }
  return val;
};

// This is what browsers will submit when the ✓ character occurs in an
// application/x-www-form-urlencoded body and the encoding of the page containing
// the form is iso-8859-1, or when the submitted form has an accept-charset
// attribute of iso-8859-1. Presumably also with other charsets that do not contain
// the ✓ character, such as us-ascii.
var isoSentinel = 'utf8=%26%2310003%3B'; // encodeURIComponent('&#10003;')

// These are the percent-encoded utf-8 octets representing a checkmark, indicating that the request actually is utf-8 encoded.
var charsetSentinel = 'utf8=%E2%9C%93'; // encodeURIComponent('✓')

var parseValues = function parseQueryStringValues(str, options) {
  var obj = {
    __proto__: null
  };
  var cleanStr = options.ignoreQueryPrefix ? str.replace(/^\?/, '') : str;
  var limit = options.parameterLimit === Infinity ? undefined : options.parameterLimit;
  var parts = cleanStr.split(options.delimiter, limit);
  var skipIndex = -1; // Keep track of where the utf8 sentinel was found
  var i;
  var charset = options.charset;
  if (options.charsetSentinel) {
    for (i = 0; i < parts.length; ++i) {
      if (parts[i].indexOf('utf8=') === 0) {
        if (parts[i] === charsetSentinel) {
          charset = 'utf-8';
        } else if (parts[i] === isoSentinel) {
          charset = 'iso-8859-1';
        }
        skipIndex = i;
        i = parts.length; // The eslint settings do not allow break;
      }
    }
  }

  for (i = 0; i < parts.length; ++i) {
    if (i === skipIndex) {
      continue;
    }
    var part = parts[i];
    var bracketEqualsPos = part.indexOf(']=');
    var pos = bracketEqualsPos === -1 ? part.indexOf('=') : bracketEqualsPos + 1;
    var key, val;
    if (pos === -1) {
      key = options.decoder(part, defaults.decoder, charset, 'key');
      val = options.strictNullHandling ? null : '';
    } else {
      key = options.decoder(part.slice(0, pos), defaults.decoder, charset, 'key');
      val = utils.maybeMap(parseArrayValue(part.slice(pos + 1), options), function (encodedVal) {
        return options.decoder(encodedVal, defaults.decoder, charset, 'value');
      });
    }
    if (val && options.interpretNumericEntities && charset === 'iso-8859-1') {
      val = interpretNumericEntities(val);
    }
    if (part.indexOf('[]=') > -1) {
      val = isArray(val) ? [val] : val;
    }
    if (has.call(obj, key)) {
      obj[key] = utils.combine(obj[key], val);
    } else {
      obj[key] = val;
    }
  }
  return obj;
};
var parseObject = function parseObject(chain, val, options, valuesParsed) {
  var leaf = valuesParsed ? val : parseArrayValue(val, options);
  for (var i = chain.length - 1; i >= 0; --i) {
    var obj;
    var root = chain[i];
    if (root === '[]' && options.parseArrays) {
      obj = [].concat(leaf);
    } else {
      obj = options.plainObjects ? Object.create(null) : {};
      var cleanRoot = root.charAt(0) === '[' && root.charAt(root.length - 1) === ']' ? root.slice(1, -1) : root;
      var index = parseInt(cleanRoot, 10);
      if (!options.parseArrays && cleanRoot === '') {
        obj = {
          0: leaf
        };
      } else if (!isNaN(index) && root !== cleanRoot && String(index) === cleanRoot && index >= 0 && options.parseArrays && index <= options.arrayLimit) {
        obj = [];
        obj[index] = leaf;
      } else if (cleanRoot !== '__proto__') {
        obj[cleanRoot] = leaf;
      }
    }
    leaf = obj;
  }
  return leaf;
};
var parseKeys = function parseQueryStringKeys(givenKey, val, options, valuesParsed) {
  if (!givenKey) {
    return;
  }

  // Transform dot notation to bracket notation
  var key = options.allowDots ? givenKey.replace(/\.([^.[]+)/g, '[$1]') : givenKey;

  // The regex chunks

  var brackets = /(\[[^[\]]*])/;
  var child = /(\[[^[\]]*])/g;

  // Get the parent

  var segment = options.depth > 0 && brackets.exec(key);
  var parent = segment ? key.slice(0, segment.index) : key;

  // Stash the parent if it exists

  var keys = [];
  if (parent) {
    // If we aren't using plain objects, optionally prefix keys that would overwrite object prototype properties
    if (!options.plainObjects && has.call(Object.prototype, parent)) {
      if (!options.allowPrototypes) {
        return;
      }
    }
    keys.push(parent);
  }

  // Loop through children appending to the array until we hit depth

  var i = 0;
  while (options.depth > 0 && (segment = child.exec(key)) !== null && i < options.depth) {
    i += 1;
    if (!options.plainObjects && has.call(Object.prototype, segment[1].slice(1, -1))) {
      if (!options.allowPrototypes) {
        return;
      }
    }
    keys.push(segment[1]);
  }

  // If there's a remainder, just add whatever is left

  if (segment) {
    keys.push('[' + key.slice(segment.index) + ']');
  }
  return parseObject(keys, val, options, valuesParsed);
};
var normalizeParseOptions = function normalizeParseOptions(opts) {
  if (!opts) {
    return defaults;
  }
  if (opts.decoder !== null && opts.decoder !== undefined && typeof opts.decoder !== 'function') {
    throw new TypeError('Decoder has to be a function.');
  }
  if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
    throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined');
  }
  var charset = typeof opts.charset === 'undefined' ? defaults.charset : opts.charset;
  return {
    allowDots: typeof opts.allowDots === 'undefined' ? defaults.allowDots : !!opts.allowDots,
    allowPrototypes: typeof opts.allowPrototypes === 'boolean' ? opts.allowPrototypes : defaults.allowPrototypes,
    allowSparse: typeof opts.allowSparse === 'boolean' ? opts.allowSparse : defaults.allowSparse,
    arrayLimit: typeof opts.arrayLimit === 'number' ? opts.arrayLimit : defaults.arrayLimit,
    charset: charset,
    charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults.charsetSentinel,
    comma: typeof opts.comma === 'boolean' ? opts.comma : defaults.comma,
    decoder: typeof opts.decoder === 'function' ? opts.decoder : defaults.decoder,
    delimiter: typeof opts.delimiter === 'string' || utils.isRegExp(opts.delimiter) ? opts.delimiter : defaults.delimiter,
    // eslint-disable-next-line no-implicit-coercion, no-extra-parens
    depth: typeof opts.depth === 'number' || opts.depth === false ? +opts.depth : defaults.depth,
    ignoreQueryPrefix: opts.ignoreQueryPrefix === true,
    interpretNumericEntities: typeof opts.interpretNumericEntities === 'boolean' ? opts.interpretNumericEntities : defaults.interpretNumericEntities,
    parameterLimit: typeof opts.parameterLimit === 'number' ? opts.parameterLimit : defaults.parameterLimit,
    parseArrays: opts.parseArrays !== false,
    plainObjects: typeof opts.plainObjects === 'boolean' ? opts.plainObjects : defaults.plainObjects,
    strictNullHandling: typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults.strictNullHandling
  };
};
module.exports = function (str, opts) {
  var options = normalizeParseOptions(opts);
  if (str === '' || str === null || typeof str === 'undefined') {
    return options.plainObjects ? Object.create(null) : {};
  }
  var tempObj = typeof str === 'string' ? parseValues(str, options) : str;
  var obj = options.plainObjects ? Object.create(null) : {};

  // Iterate over the keys and setup the new object

  var keys = Object.keys(tempObj);
  for (var i = 0; i < keys.length; ++i) {
    var key = keys[i];
    var newObj = parseKeys(key, tempObj[key], options, typeof str === 'string');
    obj = utils.merge(obj, newObj, options);
  }
  if (options.allowSparse === true) {
    return obj;
  }
  return utils.compact(obj);
};

},{"./utils":20}],19:[function(require,module,exports){
'use strict';

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
var getSideChannel = require('side-channel');
var utils = require('./utils');
var formats = require('./formats');
var has = Object.prototype.hasOwnProperty;
var arrayPrefixGenerators = {
  brackets: function brackets(prefix) {
    return prefix + '[]';
  },
  comma: 'comma',
  indices: function indices(prefix, key) {
    return prefix + '[' + key + ']';
  },
  repeat: function repeat(prefix) {
    return prefix;
  }
};
var isArray = Array.isArray;
var push = Array.prototype.push;
var pushToArray = function pushToArray(arr, valueOrArray) {
  push.apply(arr, isArray(valueOrArray) ? valueOrArray : [valueOrArray]);
};
var toISO = Date.prototype.toISOString;
var defaultFormat = formats['default'];
var defaults = {
  addQueryPrefix: false,
  allowDots: false,
  charset: 'utf-8',
  charsetSentinel: false,
  delimiter: '&',
  encode: true,
  encoder: utils.encode,
  encodeValuesOnly: false,
  format: defaultFormat,
  formatter: formats.formatters[defaultFormat],
  // deprecated
  indices: false,
  serializeDate: function serializeDate(date) {
    return toISO.call(date);
  },
  skipNulls: false,
  strictNullHandling: false
};
var isNonNullishPrimitive = function isNonNullishPrimitive(v) {
  return typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' || _typeof(v) === 'symbol' || typeof v === 'bigint';
};
var sentinel = {};
var stringify = function stringify(object, prefix, generateArrayPrefix, commaRoundTrip, strictNullHandling, skipNulls, encoder, filter, sort, allowDots, serializeDate, format, formatter, encodeValuesOnly, charset, sideChannel) {
  var obj = object;
  var tmpSc = sideChannel;
  var step = 0;
  var findFlag = false;
  while ((tmpSc = tmpSc.get(sentinel)) !== void undefined && !findFlag) {
    // Where object last appeared in the ref tree
    var pos = tmpSc.get(object);
    step += 1;
    if (typeof pos !== 'undefined') {
      if (pos === step) {
        throw new RangeError('Cyclic object value');
      } else {
        findFlag = true; // Break while
      }
    }

    if (typeof tmpSc.get(sentinel) === 'undefined') {
      step = 0;
    }
  }
  if (typeof filter === 'function') {
    obj = filter(prefix, obj);
  } else if (obj instanceof Date) {
    obj = serializeDate(obj);
  } else if (generateArrayPrefix === 'comma' && isArray(obj)) {
    obj = utils.maybeMap(obj, function (value) {
      if (value instanceof Date) {
        return serializeDate(value);
      }
      return value;
    });
  }
  if (obj === null) {
    if (strictNullHandling) {
      return encoder && !encodeValuesOnly ? encoder(prefix, defaults.encoder, charset, 'key', format) : prefix;
    }
    obj = '';
  }
  if (isNonNullishPrimitive(obj) || utils.isBuffer(obj)) {
    if (encoder) {
      var keyValue = encodeValuesOnly ? prefix : encoder(prefix, defaults.encoder, charset, 'key', format);
      return [formatter(keyValue) + '=' + formatter(encoder(obj, defaults.encoder, charset, 'value', format))];
    }
    return [formatter(prefix) + '=' + formatter(String(obj))];
  }
  var values = [];
  if (typeof obj === 'undefined') {
    return values;
  }
  var objKeys;
  if (generateArrayPrefix === 'comma' && isArray(obj)) {
    // we need to join elements in
    if (encodeValuesOnly && encoder) {
      obj = utils.maybeMap(obj, encoder);
    }
    objKeys = [{
      value: obj.length > 0 ? obj.join(',') || null : void undefined
    }];
  } else if (isArray(filter)) {
    objKeys = filter;
  } else {
    var keys = Object.keys(obj);
    objKeys = sort ? keys.sort(sort) : keys;
  }
  var adjustedPrefix = commaRoundTrip && isArray(obj) && obj.length === 1 ? prefix + '[]' : prefix;
  for (var j = 0; j < objKeys.length; ++j) {
    var key = objKeys[j];
    var value = _typeof(key) === 'object' && typeof key.value !== 'undefined' ? key.value : obj[key];
    if (skipNulls && value === null) {
      continue;
    }
    var keyPrefix = isArray(obj) ? typeof generateArrayPrefix === 'function' ? generateArrayPrefix(adjustedPrefix, key) : adjustedPrefix : adjustedPrefix + (allowDots ? '.' + key : '[' + key + ']');
    sideChannel.set(object, step);
    var valueSideChannel = getSideChannel();
    valueSideChannel.set(sentinel, sideChannel);
    pushToArray(values, stringify(value, keyPrefix, generateArrayPrefix, commaRoundTrip, strictNullHandling, skipNulls, generateArrayPrefix === 'comma' && encodeValuesOnly && isArray(obj) ? null : encoder, filter, sort, allowDots, serializeDate, format, formatter, encodeValuesOnly, charset, valueSideChannel));
  }
  return values;
};
var normalizeStringifyOptions = function normalizeStringifyOptions(opts) {
  if (!opts) {
    return defaults;
  }
  if (opts.encoder !== null && typeof opts.encoder !== 'undefined' && typeof opts.encoder !== 'function') {
    throw new TypeError('Encoder has to be a function.');
  }
  var charset = opts.charset || defaults.charset;
  if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
    throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined');
  }
  var format = formats['default'];
  if (typeof opts.format !== 'undefined') {
    if (!has.call(formats.formatters, opts.format)) {
      throw new TypeError('Unknown format option provided.');
    }
    format = opts.format;
  }
  var formatter = formats.formatters[format];
  var filter = defaults.filter;
  if (typeof opts.filter === 'function' || isArray(opts.filter)) {
    filter = opts.filter;
  }
  return {
    addQueryPrefix: typeof opts.addQueryPrefix === 'boolean' ? opts.addQueryPrefix : defaults.addQueryPrefix,
    allowDots: typeof opts.allowDots === 'undefined' ? defaults.allowDots : !!opts.allowDots,
    charset: charset,
    charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults.charsetSentinel,
    delimiter: typeof opts.delimiter === 'undefined' ? defaults.delimiter : opts.delimiter,
    encode: typeof opts.encode === 'boolean' ? opts.encode : defaults.encode,
    encoder: typeof opts.encoder === 'function' ? opts.encoder : defaults.encoder,
    encodeValuesOnly: typeof opts.encodeValuesOnly === 'boolean' ? opts.encodeValuesOnly : defaults.encodeValuesOnly,
    filter: filter,
    format: format,
    formatter: formatter,
    serializeDate: typeof opts.serializeDate === 'function' ? opts.serializeDate : defaults.serializeDate,
    skipNulls: typeof opts.skipNulls === 'boolean' ? opts.skipNulls : defaults.skipNulls,
    sort: typeof opts.sort === 'function' ? opts.sort : null,
    strictNullHandling: typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults.strictNullHandling
  };
};
module.exports = function (object, opts) {
  var obj = object;
  var options = normalizeStringifyOptions(opts);
  var objKeys;
  var filter;
  if (typeof options.filter === 'function') {
    filter = options.filter;
    obj = filter('', obj);
  } else if (isArray(options.filter)) {
    filter = options.filter;
    objKeys = filter;
  }
  var keys = [];
  if (_typeof(obj) !== 'object' || obj === null) {
    return '';
  }
  var arrayFormat;
  if (opts && opts.arrayFormat in arrayPrefixGenerators) {
    arrayFormat = opts.arrayFormat;
  } else if (opts && 'indices' in opts) {
    arrayFormat = opts.indices ? 'indices' : 'repeat';
  } else {
    arrayFormat = 'indices';
  }
  var generateArrayPrefix = arrayPrefixGenerators[arrayFormat];
  if (opts && 'commaRoundTrip' in opts && typeof opts.commaRoundTrip !== 'boolean') {
    throw new TypeError('`commaRoundTrip` must be a boolean, or absent');
  }
  var commaRoundTrip = generateArrayPrefix === 'comma' && opts && opts.commaRoundTrip;
  if (!objKeys) {
    objKeys = Object.keys(obj);
  }
  if (options.sort) {
    objKeys.sort(options.sort);
  }
  var sideChannel = getSideChannel();
  for (var i = 0; i < objKeys.length; ++i) {
    var key = objKeys[i];
    if (options.skipNulls && obj[key] === null) {
      continue;
    }
    pushToArray(keys, stringify(obj[key], key, generateArrayPrefix, commaRoundTrip, options.strictNullHandling, options.skipNulls, options.encode ? options.encoder : null, options.filter, options.sort, options.allowDots, options.serializeDate, options.format, options.formatter, options.encodeValuesOnly, options.charset, sideChannel));
  }
  var joined = keys.join(options.delimiter);
  var prefix = options.addQueryPrefix === true ? '?' : '';
  if (options.charsetSentinel) {
    if (options.charset === 'iso-8859-1') {
      // encodeURIComponent('&#10003;'), the "numeric entity" representation of a checkmark
      prefix += 'utf8=%26%2310003%3B&';
    } else {
      // encodeURIComponent('✓')
      prefix += 'utf8=%E2%9C%93&';
    }
  }
  return joined.length > 0 ? prefix + joined : '';
};

},{"./formats":16,"./utils":20,"side-channel":21}],20:[function(require,module,exports){
'use strict';

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
var formats = require('./formats');
var has = Object.prototype.hasOwnProperty;
var isArray = Array.isArray;
var hexTable = function () {
  var array = [];
  for (var i = 0; i < 256; ++i) {
    array.push('%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase());
  }
  return array;
}();
var compactQueue = function compactQueue(queue) {
  while (queue.length > 1) {
    var item = queue.pop();
    var obj = item.obj[item.prop];
    if (isArray(obj)) {
      var compacted = [];
      for (var j = 0; j < obj.length; ++j) {
        if (typeof obj[j] !== 'undefined') {
          compacted.push(obj[j]);
        }
      }
      item.obj[item.prop] = compacted;
    }
  }
};
var arrayToObject = function arrayToObject(source, options) {
  var obj = options && options.plainObjects ? Object.create(null) : {};
  for (var i = 0; i < source.length; ++i) {
    if (typeof source[i] !== 'undefined') {
      obj[i] = source[i];
    }
  }
  return obj;
};
var merge = function merge(target, source, options) {
  /* eslint no-param-reassign: 0 */
  if (!source) {
    return target;
  }
  if (_typeof(source) !== 'object') {
    if (isArray(target)) {
      target.push(source);
    } else if (target && _typeof(target) === 'object') {
      if (options && (options.plainObjects || options.allowPrototypes) || !has.call(Object.prototype, source)) {
        target[source] = true;
      }
    } else {
      return [target, source];
    }
    return target;
  }
  if (!target || _typeof(target) !== 'object') {
    return [target].concat(source);
  }
  var mergeTarget = target;
  if (isArray(target) && !isArray(source)) {
    mergeTarget = arrayToObject(target, options);
  }
  if (isArray(target) && isArray(source)) {
    source.forEach(function (item, i) {
      if (has.call(target, i)) {
        var targetItem = target[i];
        if (targetItem && _typeof(targetItem) === 'object' && item && _typeof(item) === 'object') {
          target[i] = merge(targetItem, item, options);
        } else {
          target.push(item);
        }
      } else {
        target[i] = item;
      }
    });
    return target;
  }
  return Object.keys(source).reduce(function (acc, key) {
    var value = source[key];
    if (has.call(acc, key)) {
      acc[key] = merge(acc[key], value, options);
    } else {
      acc[key] = value;
    }
    return acc;
  }, mergeTarget);
};
var assign = function assignSingleSource(target, source) {
  return Object.keys(source).reduce(function (acc, key) {
    acc[key] = source[key];
    return acc;
  }, target);
};
var decode = function decode(str, decoder, charset) {
  var strWithoutPlus = str.replace(/\+/g, ' ');
  if (charset === 'iso-8859-1') {
    // unescape never throws, no try...catch needed:
    return strWithoutPlus.replace(/%[0-9a-f]{2}/gi, unescape);
  }
  // utf-8
  try {
    return decodeURIComponent(strWithoutPlus);
  } catch (e) {
    return strWithoutPlus;
  }
};
var encode = function encode(str, defaultEncoder, charset, kind, format) {
  // This code was originally written by Brian White (mscdex) for the io.js core querystring library.
  // It has been adapted here for stricter adherence to RFC 3986
  if (str.length === 0) {
    return str;
  }
  var string = str;
  if (_typeof(str) === 'symbol') {
    string = Symbol.prototype.toString.call(str);
  } else if (typeof str !== 'string') {
    string = String(str);
  }
  if (charset === 'iso-8859-1') {
    return escape(string).replace(/%u[0-9a-f]{4}/gi, function ($0) {
      return '%26%23' + parseInt($0.slice(2), 16) + '%3B';
    });
  }
  var out = '';
  for (var i = 0; i < string.length; ++i) {
    var c = string.charCodeAt(i);
    if (c === 0x2D // -
    || c === 0x2E // .
    || c === 0x5F // _
    || c === 0x7E // ~
    || c >= 0x30 && c <= 0x39 // 0-9
    || c >= 0x41 && c <= 0x5A // a-z
    || c >= 0x61 && c <= 0x7A // A-Z
    || format === formats.RFC1738 && (c === 0x28 || c === 0x29) // ( )
    ) {
      out += string.charAt(i);
      continue;
    }
    if (c < 0x80) {
      out = out + hexTable[c];
      continue;
    }
    if (c < 0x800) {
      out = out + (hexTable[0xC0 | c >> 6] + hexTable[0x80 | c & 0x3F]);
      continue;
    }
    if (c < 0xD800 || c >= 0xE000) {
      out = out + (hexTable[0xE0 | c >> 12] + hexTable[0x80 | c >> 6 & 0x3F] + hexTable[0x80 | c & 0x3F]);
      continue;
    }
    i += 1;
    c = 0x10000 + ((c & 0x3FF) << 10 | string.charCodeAt(i) & 0x3FF);
    /* eslint operator-linebreak: [2, "before"] */
    out += hexTable[0xF0 | c >> 18] + hexTable[0x80 | c >> 12 & 0x3F] + hexTable[0x80 | c >> 6 & 0x3F] + hexTable[0x80 | c & 0x3F];
  }
  return out;
};
var compact = function compact(value) {
  var queue = [{
    obj: {
      o: value
    },
    prop: 'o'
  }];
  var refs = [];
  for (var i = 0; i < queue.length; ++i) {
    var item = queue[i];
    var obj = item.obj[item.prop];
    var keys = Object.keys(obj);
    for (var j = 0; j < keys.length; ++j) {
      var key = keys[j];
      var val = obj[key];
      if (_typeof(val) === 'object' && val !== null && refs.indexOf(val) === -1) {
        queue.push({
          obj: obj,
          prop: key
        });
        refs.push(val);
      }
    }
  }
  compactQueue(queue);
  return value;
};
var isRegExp = function isRegExp(obj) {
  return Object.prototype.toString.call(obj) === '[object RegExp]';
};
var isBuffer = function isBuffer(obj) {
  if (!obj || _typeof(obj) !== 'object') {
    return false;
  }
  return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
};
var combine = function combine(a, b) {
  return [].concat(a, b);
};
var maybeMap = function maybeMap(val, fn) {
  if (isArray(val)) {
    var mapped = [];
    for (var i = 0; i < val.length; i += 1) {
      mapped.push(fn(val[i]));
    }
    return mapped;
  }
  return fn(val);
};
module.exports = {
  arrayToObject: arrayToObject,
  assign: assign,
  combine: combine,
  compact: compact,
  decode: decode,
  encode: encode,
  isBuffer: isBuffer,
  isRegExp: isRegExp,
  maybeMap: maybeMap,
  merge: merge
};

},{"./formats":16}],21:[function(require,module,exports){
'use strict';

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
var GetIntrinsic = require('get-intrinsic');
var callBound = require('call-bind/callBound');
var inspect = require('object-inspect');
var $TypeError = GetIntrinsic('%TypeError%');
var $WeakMap = GetIntrinsic('%WeakMap%', true);
var $Map = GetIntrinsic('%Map%', true);
var $weakMapGet = callBound('WeakMap.prototype.get', true);
var $weakMapSet = callBound('WeakMap.prototype.set', true);
var $weakMapHas = callBound('WeakMap.prototype.has', true);
var $mapGet = callBound('Map.prototype.get', true);
var $mapSet = callBound('Map.prototype.set', true);
var $mapHas = callBound('Map.prototype.has', true);

/*
 * This function traverses the list returning the node corresponding to the
 * given key.
 *
 * That node is also moved to the head of the list, so that if it's accessed
 * again we don't need to traverse the whole list. By doing so, all the recently
 * used nodes can be accessed relatively quickly.
 */
var listGetNode = function listGetNode(list, key) {
  // eslint-disable-line consistent-return
  for (var prev = list, curr; (curr = prev.next) !== null; prev = curr) {
    if (curr.key === key) {
      prev.next = curr.next;
      curr.next = list.next;
      list.next = curr; // eslint-disable-line no-param-reassign
      return curr;
    }
  }
};
var listGet = function listGet(objects, key) {
  var node = listGetNode(objects, key);
  return node && node.value;
};
var listSet = function listSet(objects, key, value) {
  var node = listGetNode(objects, key);
  if (node) {
    node.value = value;
  } else {
    // Prepend the new node to the beginning of the list
    objects.next = {
      // eslint-disable-line no-param-reassign
      key: key,
      next: objects.next,
      value: value
    };
  }
};
var listHas = function listHas(objects, key) {
  return !!listGetNode(objects, key);
};
module.exports = function getSideChannel() {
  var $wm;
  var $m;
  var $o;
  var channel = {
    assert: function assert(key) {
      if (!channel.has(key)) {
        throw new $TypeError('Side channel does not contain ' + inspect(key));
      }
    },
    get: function get(key) {
      // eslint-disable-line consistent-return
      if ($WeakMap && key && (_typeof(key) === 'object' || typeof key === 'function')) {
        if ($wm) {
          return $weakMapGet($wm, key);
        }
      } else if ($Map) {
        if ($m) {
          return $mapGet($m, key);
        }
      } else {
        if ($o) {
          // eslint-disable-line no-lonely-if
          return listGet($o, key);
        }
      }
    },
    has: function has(key) {
      if ($WeakMap && key && (_typeof(key) === 'object' || typeof key === 'function')) {
        if ($wm) {
          return $weakMapHas($wm, key);
        }
      } else if ($Map) {
        if ($m) {
          return $mapHas($m, key);
        }
      } else {
        if ($o) {
          // eslint-disable-line no-lonely-if
          return listHas($o, key);
        }
      }
      return false;
    },
    set: function set(key, value) {
      if ($WeakMap && key && (_typeof(key) === 'object' || typeof key === 'function')) {
        if (!$wm) {
          $wm = new $WeakMap();
        }
        $weakMapSet($wm, key, value);
      } else if ($Map) {
        if (!$m) {
          $m = new $Map();
        }
        $mapSet($m, key, value);
      } else {
        if (!$o) {
          /*
           * Initialize the linked list as an empty node, so that we don't have
           * to special-case handling of the first node: we can always refer to
           * it as (previous node).next, instead of something like (list).head
           */
          $o = {
            key: {},
            next: null
          };
        }
        listSet($o, key, value);
      }
    }
  };
  return channel;
};

},{"call-bind/callBound":2,"get-intrinsic":6,"object-inspect":15}],22:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "NIL", {
  enumerable: true,
  get: function get() {
    return _nil["default"];
  }
});
Object.defineProperty(exports, "parse", {
  enumerable: true,
  get: function get() {
    return _parse["default"];
  }
});
Object.defineProperty(exports, "stringify", {
  enumerable: true,
  get: function get() {
    return _stringify["default"];
  }
});
Object.defineProperty(exports, "v1", {
  enumerable: true,
  get: function get() {
    return _v["default"];
  }
});
Object.defineProperty(exports, "v3", {
  enumerable: true,
  get: function get() {
    return _v2["default"];
  }
});
Object.defineProperty(exports, "v4", {
  enumerable: true,
  get: function get() {
    return _v3["default"];
  }
});
Object.defineProperty(exports, "v5", {
  enumerable: true,
  get: function get() {
    return _v4["default"];
  }
});
Object.defineProperty(exports, "validate", {
  enumerable: true,
  get: function get() {
    return _validate["default"];
  }
});
Object.defineProperty(exports, "version", {
  enumerable: true,
  get: function get() {
    return _version["default"];
  }
});
var _v = _interopRequireDefault(require("./v1.js"));
var _v2 = _interopRequireDefault(require("./v3.js"));
var _v3 = _interopRequireDefault(require("./v4.js"));
var _v4 = _interopRequireDefault(require("./v5.js"));
var _nil = _interopRequireDefault(require("./nil.js"));
var _version = _interopRequireDefault(require("./version.js"));
var _validate = _interopRequireDefault(require("./validate.js"));
var _stringify = _interopRequireDefault(require("./stringify.js"));
var _parse = _interopRequireDefault(require("./parse.js"));
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

},{"./nil.js":25,"./parse.js":26,"./stringify.js":30,"./v1.js":31,"./v3.js":32,"./v4.js":34,"./v5.js":35,"./validate.js":36,"./version.js":37}],23:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

/*
 * Browser-compatible JavaScript MD5
 *
 * Modification of JavaScript MD5
 * https://github.com/blueimp/JavaScript-MD5
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 *
 * Based on
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */
function md5(bytes) {
  if (typeof bytes === 'string') {
    var msg = unescape(encodeURIComponent(bytes)); // UTF8 escape

    bytes = new Uint8Array(msg.length);
    for (var i = 0; i < msg.length; ++i) {
      bytes[i] = msg.charCodeAt(i);
    }
  }
  return md5ToHexEncodedArray(wordsToMd5(bytesToWords(bytes), bytes.length * 8));
}
/*
 * Convert an array of little-endian words to an array of bytes
 */

function md5ToHexEncodedArray(input) {
  var output = [];
  var length32 = input.length * 32;
  var hexTab = '0123456789abcdef';
  for (var i = 0; i < length32; i += 8) {
    var x = input[i >> 5] >>> i % 32 & 0xff;
    var hex = parseInt(hexTab.charAt(x >>> 4 & 0x0f) + hexTab.charAt(x & 0x0f), 16);
    output.push(hex);
  }
  return output;
}
/**
 * Calculate output length with padding and bit length
 */

function getOutputLength(inputLength8) {
  return (inputLength8 + 64 >>> 9 << 4) + 14 + 1;
}
/*
 * Calculate the MD5 of an array of little-endian words, and a bit length.
 */

function wordsToMd5(x, len) {
  /* append padding */
  x[len >> 5] |= 0x80 << len % 32;
  x[getOutputLength(len) - 1] = len;
  var a = 1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d = 271733878;
  for (var i = 0; i < x.length; i += 16) {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;
    a = md5ff(a, b, c, d, x[i], 7, -680876936);
    d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
    c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
    b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
    a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
    d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
    c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
    b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
    a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
    d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
    c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
    b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
    a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
    d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
    c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
    b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
    a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
    d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
    c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
    b = md5gg(b, c, d, a, x[i], 20, -373897302);
    a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
    d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
    c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
    b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
    a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
    d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
    c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
    b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
    a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
    d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
    c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
    b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
    a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
    d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
    c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
    b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
    a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
    d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
    c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
    b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
    a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
    d = md5hh(d, a, b, c, x[i], 11, -358537222);
    c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
    b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
    a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
    d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
    c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
    b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);
    a = md5ii(a, b, c, d, x[i], 6, -198630844);
    d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
    c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
    b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
    a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
    d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
    c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
    b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
    a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
    d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
    c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
    b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
    a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
    d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
    c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
    b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);
    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
  }
  return [a, b, c, d];
}
/*
 * Convert an array bytes to an array of little-endian words
 * Characters >255 have their high-byte silently ignored.
 */

function bytesToWords(input) {
  if (input.length === 0) {
    return [];
  }
  var length8 = input.length * 8;
  var output = new Uint32Array(getOutputLength(length8));
  for (var i = 0; i < length8; i += 8) {
    output[i >> 5] |= (input[i / 8] & 0xff) << i % 32;
  }
  return output;
}
/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */

function safeAdd(x, y) {
  var lsw = (x & 0xffff) + (y & 0xffff);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return msw << 16 | lsw & 0xffff;
}
/*
 * Bitwise rotate a 32-bit number to the left.
 */

function bitRotateLeft(num, cnt) {
  return num << cnt | num >>> 32 - cnt;
}
/*
 * These functions implement the four basic operations the algorithm uses.
 */

function md5cmn(q, a, b, x, s, t) {
  return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
}
function md5ff(a, b, c, d, x, s, t) {
  return md5cmn(b & c | ~b & d, a, b, x, s, t);
}
function md5gg(a, b, c, d, x, s, t) {
  return md5cmn(b & d | c & ~d, a, b, x, s, t);
}
function md5hh(a, b, c, d, x, s, t) {
  return md5cmn(b ^ c ^ d, a, b, x, s, t);
}
function md5ii(a, b, c, d, x, s, t) {
  return md5cmn(c ^ (b | ~d), a, b, x, s, t);
}
var _default = md5;
exports["default"] = _default;

},{}],24:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var randomUUID = typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID.bind(crypto);
var _default = {
  randomUUID: randomUUID
};
exports["default"] = _default;

},{}],25:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _default = '00000000-0000-0000-0000-000000000000';
exports["default"] = _default;

},{}],26:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _validate = _interopRequireDefault(require("./validate.js"));
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}
function parse(uuid) {
  if (!(0, _validate["default"])(uuid)) {
    throw TypeError('Invalid UUID');
  }
  var v;
  var arr = new Uint8Array(16); // Parse ########-....-....-....-............

  arr[0] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
  arr[1] = v >>> 16 & 0xff;
  arr[2] = v >>> 8 & 0xff;
  arr[3] = v & 0xff; // Parse ........-####-....-....-............

  arr[4] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
  arr[5] = v & 0xff; // Parse ........-....-####-....-............

  arr[6] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
  arr[7] = v & 0xff; // Parse ........-....-....-####-............

  arr[8] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
  arr[9] = v & 0xff; // Parse ........-....-....-....-############
  // (Use "/" to avoid 32-bit truncation when bit-shifting high-order bytes)

  arr[10] = (v = parseInt(uuid.slice(24, 36), 16)) / 0x10000000000 & 0xff;
  arr[11] = v / 0x100000000 & 0xff;
  arr[12] = v >>> 24 & 0xff;
  arr[13] = v >>> 16 & 0xff;
  arr[14] = v >>> 8 & 0xff;
  arr[15] = v & 0xff;
  return arr;
}
var _default = parse;
exports["default"] = _default;

},{"./validate.js":36}],27:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
exports["default"] = _default;

},{}],28:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = rng;
// Unique ID creation requires a high quality random # generator. In the browser we therefore
// require the crypto API and do not support built-in fallback to lower quality random number
// generators (like Math.random()).
var getRandomValues;
var rnds8 = new Uint8Array(16);
function rng() {
  // lazy load so that environments that need to polyfill have a chance to do so
  if (!getRandomValues) {
    // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation.
    getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);
    if (!getRandomValues) {
      throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
    }
  }
  return getRandomValues(rnds8);
}

},{}],29:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

// Adapted from Chris Veness' SHA1 code at
// http://www.movable-type.co.uk/scripts/sha1.html
function f(s, x, y, z) {
  switch (s) {
    case 0:
      return x & y ^ ~x & z;
    case 1:
      return x ^ y ^ z;
    case 2:
      return x & y ^ x & z ^ y & z;
    case 3:
      return x ^ y ^ z;
  }
}
function ROTL(x, n) {
  return x << n | x >>> 32 - n;
}
function sha1(bytes) {
  var K = [0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6];
  var H = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];
  if (typeof bytes === 'string') {
    var msg = unescape(encodeURIComponent(bytes)); // UTF8 escape

    bytes = [];
    for (var i = 0; i < msg.length; ++i) {
      bytes.push(msg.charCodeAt(i));
    }
  } else if (!Array.isArray(bytes)) {
    // Convert Array-like to Array
    bytes = Array.prototype.slice.call(bytes);
  }
  bytes.push(0x80);
  var l = bytes.length / 4 + 2;
  var N = Math.ceil(l / 16);
  var M = new Array(N);
  for (var _i = 0; _i < N; ++_i) {
    var arr = new Uint32Array(16);
    for (var j = 0; j < 16; ++j) {
      arr[j] = bytes[_i * 64 + j * 4] << 24 | bytes[_i * 64 + j * 4 + 1] << 16 | bytes[_i * 64 + j * 4 + 2] << 8 | bytes[_i * 64 + j * 4 + 3];
    }
    M[_i] = arr;
  }
  M[N - 1][14] = (bytes.length - 1) * 8 / Math.pow(2, 32);
  M[N - 1][14] = Math.floor(M[N - 1][14]);
  M[N - 1][15] = (bytes.length - 1) * 8 & 0xffffffff;
  for (var _i2 = 0; _i2 < N; ++_i2) {
    var W = new Uint32Array(80);
    for (var t = 0; t < 16; ++t) {
      W[t] = M[_i2][t];
    }
    for (var _t = 16; _t < 80; ++_t) {
      W[_t] = ROTL(W[_t - 3] ^ W[_t - 8] ^ W[_t - 14] ^ W[_t - 16], 1);
    }
    var a = H[0];
    var b = H[1];
    var c = H[2];
    var d = H[3];
    var e = H[4];
    for (var _t2 = 0; _t2 < 80; ++_t2) {
      var s = Math.floor(_t2 / 20);
      var T = ROTL(a, 5) + f(s, b, c, d) + e + K[s] + W[_t2] >>> 0;
      e = d;
      d = c;
      c = ROTL(b, 30) >>> 0;
      b = a;
      a = T;
    }
    H[0] = H[0] + a >>> 0;
    H[1] = H[1] + b >>> 0;
    H[2] = H[2] + c >>> 0;
    H[3] = H[3] + d >>> 0;
    H[4] = H[4] + e >>> 0;
  }
  return [H[0] >> 24 & 0xff, H[0] >> 16 & 0xff, H[0] >> 8 & 0xff, H[0] & 0xff, H[1] >> 24 & 0xff, H[1] >> 16 & 0xff, H[1] >> 8 & 0xff, H[1] & 0xff, H[2] >> 24 & 0xff, H[2] >> 16 & 0xff, H[2] >> 8 & 0xff, H[2] & 0xff, H[3] >> 24 & 0xff, H[3] >> 16 & 0xff, H[3] >> 8 & 0xff, H[3] & 0xff, H[4] >> 24 & 0xff, H[4] >> 16 & 0xff, H[4] >> 8 & 0xff, H[4] & 0xff];
}
var _default = sha1;
exports["default"] = _default;

},{}],30:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
exports.unsafeStringify = unsafeStringify;
var _validate = _interopRequireDefault(require("./validate.js"));
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
var byteToHex = [];
for (var i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).slice(1));
}
function unsafeStringify(arr) {
  var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  // Note: Be careful editing this code!  It's been tuned for performance
  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
  return byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]];
}
function stringify(arr) {
  var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var uuid = unsafeStringify(arr, offset); // Consistency check for valid UUID.  If this throws, it's likely due to one
  // of the following:
  // - One or more input array values don't map to a hex octet (leading to
  // "undefined" in the uuid)
  // - Invalid input values for the RFC `version` or `variant` fields

  if (!(0, _validate["default"])(uuid)) {
    throw TypeError('Stringified UUID is invalid');
  }
  return uuid;
}
var _default = stringify;
exports["default"] = _default;

},{"./validate.js":36}],31:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _rng = _interopRequireDefault(require("./rng.js"));
var _stringify = require("./stringify.js");
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

// **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html
var _nodeId;
var _clockseq; // Previous uuid creation time

var _lastMSecs = 0;
var _lastNSecs = 0; // See https://github.com/uuidjs/uuid for API details

function v1(options, buf, offset) {
  var i = buf && offset || 0;
  var b = buf || new Array(16);
  options = options || {};
  var node = options.node || _nodeId;
  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq; // node and clockseq need to be initialized to random values if they're not
  // specified.  We do this lazily to minimize issues related to insufficient
  // system entropy.  See #189

  if (node == null || clockseq == null) {
    var seedBytes = options.random || (options.rng || _rng["default"])();
    if (node == null) {
      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
      node = _nodeId = [seedBytes[0] | 0x01, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
    }
    if (clockseq == null) {
      // Per 4.2.2, randomize (14 bit) clockseq
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
    }
  } // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.

  var msecs = options.msecs !== undefined ? options.msecs : Date.now(); // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock

  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1; // Time since last uuid creation (in msecs)

  var dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 10000; // Per 4.2.1.2, Bump clockseq on clock regression

  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  } // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval

  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  } // Per 4.2.1.2 Throw error if too many uuids are requested

  if (nsecs >= 10000) {
    throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
  }
  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq; // Per 4.1.4 - Convert from unix epoch to Gregorian epoch

  msecs += 12219292800000; // `time_low`

  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff; // `time_mid`

  var tmh = msecs / 0x100000000 * 10000 & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff; // `time_high_and_version`

  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version

  b[i++] = tmh >>> 16 & 0xff; // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)

  b[i++] = clockseq >>> 8 | 0x80; // `clock_seq_low`

  b[i++] = clockseq & 0xff; // `node`

  for (var n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }
  return buf || (0, _stringify.unsafeStringify)(b);
}
var _default = v1;
exports["default"] = _default;

},{"./rng.js":28,"./stringify.js":30}],32:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _v = _interopRequireDefault(require("./v35.js"));
var _md = _interopRequireDefault(require("./md5.js"));
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}
var v3 = (0, _v["default"])('v3', 0x30, _md["default"]);
var _default = v3;
exports["default"] = _default;

},{"./md5.js":23,"./v35.js":33}],33:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.URL = exports.DNS = void 0;
exports["default"] = v35;
var _stringify = require("./stringify.js");
var _parse = _interopRequireDefault(require("./parse.js"));
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}
function stringToBytes(str) {
  str = unescape(encodeURIComponent(str)); // UTF8 escape

  var bytes = [];
  for (var i = 0; i < str.length; ++i) {
    bytes.push(str.charCodeAt(i));
  }
  return bytes;
}
var DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
exports.DNS = DNS;
var URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
exports.URL = URL;
function v35(name, version, hashfunc) {
  function generateUUID(value, namespace, buf, offset) {
    var _namespace;
    if (typeof value === 'string') {
      value = stringToBytes(value);
    }
    if (typeof namespace === 'string') {
      namespace = (0, _parse["default"])(namespace);
    }
    if (((_namespace = namespace) === null || _namespace === void 0 ? void 0 : _namespace.length) !== 16) {
      throw TypeError('Namespace must be array-like (16 iterable integer values, 0-255)');
    } // Compute hash of namespace and value, Per 4.3
    // Future: Use spread syntax when supported on all platforms, e.g. `bytes =
    // hashfunc([...namespace, ... value])`

    var bytes = new Uint8Array(16 + value.length);
    bytes.set(namespace);
    bytes.set(value, namespace.length);
    bytes = hashfunc(bytes);
    bytes[6] = bytes[6] & 0x0f | version;
    bytes[8] = bytes[8] & 0x3f | 0x80;
    if (buf) {
      offset = offset || 0;
      for (var i = 0; i < 16; ++i) {
        buf[offset + i] = bytes[i];
      }
      return buf;
    }
    return (0, _stringify.unsafeStringify)(bytes);
  } // Function#name is not settable on some platforms (#270)

  try {
    generateUUID.name = name; // eslint-disable-next-line no-empty
  } catch (err) {} // For CommonJS default export support

  generateUUID.DNS = DNS;
  generateUUID.URL = URL;
  return generateUUID;
}

},{"./parse.js":26,"./stringify.js":30}],34:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _native = _interopRequireDefault(require("./native.js"));
var _rng = _interopRequireDefault(require("./rng.js"));
var _stringify = require("./stringify.js");
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}
function v4(options, buf, offset) {
  if (_native["default"].randomUUID && !buf && !options) {
    return _native["default"].randomUUID();
  }
  options = options || {};
  var rnds = options.random || (options.rng || _rng["default"])(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

  rnds[6] = rnds[6] & 0x0f | 0x40;
  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

  if (buf) {
    offset = offset || 0;
    for (var i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return (0, _stringify.unsafeStringify)(rnds);
}
var _default = v4;
exports["default"] = _default;

},{"./native.js":24,"./rng.js":28,"./stringify.js":30}],35:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _v = _interopRequireDefault(require("./v35.js"));
var _sha = _interopRequireDefault(require("./sha1.js"));
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}
var v5 = (0, _v["default"])('v5', 0x50, _sha["default"]);
var _default = v5;
exports["default"] = _default;

},{"./sha1.js":29,"./v35.js":33}],36:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _regex = _interopRequireDefault(require("./regex.js"));
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}
function validate(uuid) {
  return typeof uuid === 'string' && _regex["default"].test(uuid);
}
var _default = validate;
exports["default"] = _default;

},{"./regex.js":27}],37:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _validate = _interopRequireDefault(require("./validate.js"));
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}
function version(uuid) {
  if (!(0, _validate["default"])(uuid)) {
    throw TypeError('Invalid UUID');
  }
  return parseInt(uuid.slice(14, 15), 16);
}
var _default = version;
exports["default"] = _default;

},{"./validate.js":36}],38:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var collect_1 = require("./collect.js");
if (typeof window !== "undefined") {
  // @ts-ignore
  window.TokenizeJs = collect_1.TokenizeJs;
}

},{"./collect":39}],39:[function(require,module,exports){
"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw new Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw new Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var __createBinding = void 0 && (void 0).__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = {
      enumerable: true,
      get: function get() {
        return m[k];
      }
    };
  }
  Object.defineProperty(o, k2, desc);
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});
var __setModuleDefault = void 0 && (void 0).__setModuleDefault || (Object.create ? function (o, v) {
  Object.defineProperty(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});
var __importStar = void 0 && (void 0).__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
  __setModuleDefault(result, mod);
  return result;
};
var __awaiter = void 0 && (void 0).__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TokenizeJs = void 0;
var uuid_1 = require("uuid");
var constants = __importStar(require("./lib/constants"));
var shared_1 = __importDefault(require("./lib/services/shared"));
var applepay_1 = __importDefault(require("./lib/services/applepay"));
var googlepay_1 = __importDefault(require("./lib/services/googlepay"));
var paze_1 = __importDefault(require("./lib/services/paze"));
var card_on_file_1 = __importDefault(require("./lib/services/card-on-file"));
var helpers = __importStar(require("./lib/helpers/common"));
/**
 * TokenizeJs class for managing the Poynt Collect integration.
 */
var TokenizeJs = /*#__PURE__*/function () {
  function TokenizeJs(businessId, applicationId, walletRequest) {
    _classCallCheck(this, TokenizeJs);
    this.sharedService = new shared_1["default"](businessId, applicationId, walletRequest);
    this.applePayService = new applepay_1["default"](this.sharedService);
    this.googlePayService = new googlepay_1["default"](this.sharedService);
    this.pazeService = new paze_1["default"](this.sharedService);
    this.cardOnFileService = new card_on_file_1["default"](this.sharedService);
  }
  /**
   * Adds a callback listener for a specific event.
   *
   * @param {string} eventName - The name of the event.
   * @param {Function} callback - The callback function.
   * @returns {void}
   */
  _createClass(TokenizeJs, [{
    key: "on",
    value: function on(eventName, callback) {
      this.sharedService.on(eventName, callback);
    }
    /**
     * Mounts the Poynt Collet to the DOM.
     *
     * @param {string} domElement - The DOM element ID to mount the library.
     * @param {Document} document - The document object.
     * @param {MountOptions} mountOptions - The mount options.
     * @returns {void}
     */
  }, {
    key: "mount",
    value: function mount(domElement, document, mountOptions) {
      var _a, _b, _c;
      var options = helpers.getAllOptions(this.sharedService.businessId, this.sharedService.applicationId, this.sharedService.sessionId, mountOptions);
      if (options.enableCardOnFile) {
        this.cardOnFileService.mount(options.locale, options.forceSaveCardOnFile, options.cardAgreementOptions);
      }
      var isPaymentFormEnabled = helpers.isPaymentFormEnabled(options);
      var applePay = (_a = options.paymentMethods) === null || _a === void 0 ? void 0 : _a.includes("apple_pay" /* WalletType.ApplePay */);
      var googlePay = (_b = options.paymentMethods) === null || _b === void 0 ? void 0 : _b.includes("google_pay" /* WalletType.GooglePay */);
      var paze = (_c = options.paymentMethods) === null || _c === void 0 ? void 0 : _c.includes("paze" /* WalletType.Paze */);
      if (isPaymentFormEnabled) {
        this.sharedService.mountPaymentForm(domElement, document, options);
      }
      if (applePay || googlePay || paze) {
        this.sharedService.mountButtonsContainer(domElement, document, options);
        if (applePay) {
          this.applePayService.mount(options.buttonOptions, options.applePayButtonOptions);
        }
        if (googlePay) {
          this.googlePayService.mount(options.buttonOptions, options.googlePayButtonOptions);
        }
        if (paze) {
          this.pazeService.mount(options.buttonOptions, options.pazeButtonOptions);
        }
      }
      if (!isPaymentFormEnabled) {
        //process ready events in case iframe with payment form is not loaded
        this.sharedService.processCallbacks("ready" /* EventType.Ready */, {
          type: "ready" /* EventType.Ready */,
          data: {}
        });
        this.sharedService.processCallbacks("iframe_ready" /* EventType.IFrameContentReady */, {
          type: "iframe_ready" /* EventType.IFrameContentReady */,
          data: {}
        });
      }
    }
    /**
     * Unmounts the Poynt Collect from the DOM.
     *
     * @param {string} domElement - The DOM element ID to unmount the library.
     * @param {Document} document - The document object.
     * @returns {void}
     */
  }, {
    key: "unmount",
    value: function unmount(domElement, document) {
      this.sharedService.unmount(domElement, document);
      this.cardOnFileService.unmount();
    }
    /**
     * Gets the iframe element.
     *
     * @returns {HTMLIFrameElement | null} The iframe element or null if not found.
     */
  }, {
    key: "getIFrame",
    value: function getIFrame() {
      return this.sharedService.iFrame;
    }
    /**
     * Reloads the iframe.
     *
     * @returns {void}
     */
  }, {
    key: "reload",
    value: function reload() {
      var _a, _b;
      (_b = (_a = this.sharedService.iFrame) === null || _a === void 0 ? void 0 : _a.contentWindow) === null || _b === void 0 ? void 0 : _b.location.reload();
    }
    /**
     * Calls the webview to get the nonce.
     *
     * @param {GetNonceOptions} getNonceOptions - The options for getting the nonce.
     * @returns {void}
     */
  }, {
    key: "getNonce",
    value: function getNonce() {
      var getNonceOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      if (!this.sharedService.iFrame) {
        return this.sharedService.handleError("CARD_PAYMENT" /* ErrorType.CARD_PAYMENT */, new Error("iFrame not found"));
      }
      getNonceOptions.requestId = (0, uuid_1.v4)();
      if (this.cardOnFileService.cardAgreementData) {
        getNonceOptions.cardAgreementMetadata = this.cardOnFileService.cardAgreementData.metadata;
      }
      this.sharedService.postIFrameMessage({
        type: "op_get_nonce" /* EventType.OpGetNonce */,
        options: getNonceOptions
      });
    }
    /**
     * Starts a Google Pay session.
     *
     * @param {WalletRequestUpdate} walletRequest - The updated wallet request.
     * @returns {void}
     */
  }, {
    key: "startGooglePaySession",
    value: function startGooglePaySession(walletRequest) {
      this.googlePayService.startSession(walletRequest);
    }
    /**
     * Starts a Apple Pay session.
     *
     * @param {WalletRequestUpdate} walletRequest - The updated wallet request.
     * @returns {void}
     */
  }, {
    key: "startApplePaySession",
    value: function startApplePaySession(walletRequest) {
      this.applePayService.startSession(walletRequest);
    }
    /**
     * Starts a Paze Wallet session.
     *
     * @param {WalletRequestUpdate} walletRequest - The updated wallet request.
     * @returns {void}
     */
  }, {
    key: "startPazeSession",
    value: function startPazeSession(walletRequest) {
      this.pazeService.startSession(walletRequest);
    }
    /**
     * Aborts the current Apple Pay session.
     *
     * @returns {void}
     */
  }, {
    key: "abortApplePaySession",
    value: function abortApplePaySession() {
      this.applePayService.abortSession();
    }
    /**
     * Checks if wallet payment is supported based on the browser and wallet request.
     *
     * @returns {Promise<SupportWalletPaymentsResponse>} A promise that resolves to an object indicating wallet payment support.
     */
  }, {
    key: "supportWalletPayments",
    value: function supportWalletPayments() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var _a;
      return __awaiter(this, void 0, void 0, /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
        var result, domainName, promises;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              result = {
                googlePay: false,
                applePay: false,
                paze: false
              };
              domainName = ((_a = window.top) === null || _a === void 0 ? void 0 : _a.location.hostname) || document.location.hostname;
              if (!constants.DOMAIN_BLACKLIST.includes(domainName)) {
                _context.next = 5;
                break;
              }
              this.sharedService.handleError("WALLET" /* ErrorType.WALLET */, new Error(domainName + " is blacklisted. Please reach out GDP support."));
              return _context.abrupt("return", result);
            case 5:
              _context.prev = 5;
              promises = [this.applePayService.initialize(), this.googlePayService.initialize(), this.pazeService.initialize(options.emailAddress)];
              _context.next = 9;
              return Promise.all(promises);
            case 9:
              result.applePay = this.applePayService.isReady();
              result.googlePay = this.googlePayService.isReady();
              result.paze = this.pazeService.isReady();
              _context.next = 17;
              break;
            case 14:
              _context.prev = 14;
              _context.t0 = _context["catch"](5);
              this.sharedService.handleError("WALLET" /* ErrorType.WALLET */, _context.t0);
            case 17:
              return _context.abrupt("return", result);
            case 18:
            case "end":
              return _context.stop();
          }
        }, _callee, this, [[5, 14]]);
      }));
    }
  }]);
  return TokenizeJs;
}();
exports.TokenizeJs = TokenizeJs;

},{"./lib/constants":41,"./lib/helpers/common":44,"./lib/services/applepay":49,"./lib/services/card-on-file":50,"./lib/services/googlepay":51,"./lib/services/paze":52,"./lib/services/shared":53,"uuid":22}],40:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.declineButton = exports.acceptButton = exports.actionButtonsContainer = exports.businessPhoneText = exports.businessWebsiteLink = exports.businessNameText = exports.mainText = exports.closeIcon = exports.closeIconContainer = exports.title = exports.agreementContainer = exports.globalContainer = void 0;
exports.globalContainer = {
  "position": "fixed",
  "top": "0",
  "left": "0",
  "width": "100%",
  "height": "100%",
  "display": "flex",
  "justify-content": "center",
  "align-items": "center",
  "background-color": "rgb(186 166 192 / 50%)",
  "z-index": "9999"
};
exports.agreementContainer = {
  "max-width": "600px",
  "width": "100%",
  "background-color": "#ffffff",
  "font-family": "Roboto, Open Sans, Segoe UI, sans-serif",
  "padding": "20px 40px 40px 40px",
  "border-radius": "10px"
};
exports.title = {
  "font-size": "1.2rem",
  "font-weight": "bold",
  "margin-bottom": "10px"
};
exports.closeIconContainer = {
  "text-align": "right"
};
exports.closeIcon = {
  "font-size": "1.6rem",
  "cursor": "pointer",
  "color": "#8a8a8a"
};
exports.mainText = {
  "font-size": "1rem"
};
exports.businessNameText = {
  "font-weight": "bold"
};
exports.businessWebsiteLink = {
  "text-decoration": "underline",
  "color": "#0946ED"
};
exports.businessPhoneText = {
  "font-style": "italic"
};
exports.actionButtonsContainer = {
  "display": "flex",
  "justify-content": "center",
  "align-items": "center",
  "flex-wrap": "wrap",
  "gap": "10px",
  "margin-top": "20px"
};
exports.acceptButton = {
  "padding": "10px 50px",
  "background-color": "#0946ED",
  "border-radius": "15px",
  "color": "#ffffff",
  "max-width": "200px",
  "width": "100%"
};
exports.declineButton = {
  "padding": "10px 50px",
  "background-color": "#627792",
  "border-radius": "15px",
  "color": "#ffffff",
  "max-width": "200px",
  "width": "100%"
};

},{}],41:[function(require,module,exports){
"use strict";

var _exports$GOOGLE_PAY_E, _exports$GOOGLE_PAY_I;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.COF_DEFAULT_COUNTRY_CODE = exports.COF_DEFAULT_LANGUAGE = exports.ASSETS_CDN_URL = exports.DOMAIN_BLACKLIST = exports.WALLET_SHIPPING_COUNTRY_CODES = exports.DEFAULT_TIMEOUT = exports.PAZE_ALLOWED_CARD_NETWORKS = exports.APPLEPAY_SUPPORTED_NETWORKS = exports.APPLEPAY_MERCHANT_CAPABILITIES = exports.APPLEPAY_VERSION = exports.GOOGLEPAY_ALLOWED_CARD_NETWORKS = exports.GOOGLEPAY_ALLOWED_AUTHN_METHODS = exports.GOOGLEPAY_VERSION_MINOR = exports.GOOGLEPAY_VERSION = exports.GOOGLEPAY_GATEWAY = exports.GOOGLEPAY_MERCHANT_ID = exports.GOOGLEPAY_SCRIPT_URL = exports.GOOGLE_PAY_INTENT_MAP = exports.GOOGLE_PAY_EVENT_MAP = exports.DEFAULT_LOCALE = exports.IFRAME_NAME = void 0;
/**
 * Payment form constants
 */
exports.IFRAME_NAME = "poynt-collect-v2-iframe";
exports.DEFAULT_LOCALE = "en-US";
/**
 * Google Pay constants
 */
exports.GOOGLE_PAY_EVENT_MAP = (_exports$GOOGLE_PAY_E = {}, _defineProperty(_exports$GOOGLE_PAY_E, "INITIALIZE" /* CallbackType.INITIALIZE */, "shipping_address_change"), _defineProperty(_exports$GOOGLE_PAY_E, "SHIPPING_ADDRESS" /* CallbackType.SHIPPING_ADDRESS */, "shipping_address_change"), _defineProperty(_exports$GOOGLE_PAY_E, "SHIPPING_OPTION" /* CallbackType.SHIPPING_OPTION */, "shipping_method_change"), _defineProperty(_exports$GOOGLE_PAY_E, "OFFER" /* CallbackType.OFFER */, "coupon_code_change"), _exports$GOOGLE_PAY_E);
exports.GOOGLE_PAY_INTENT_MAP = (_exports$GOOGLE_PAY_I = {}, _defineProperty(_exports$GOOGLE_PAY_I, "INITIALIZE" /* CallbackType.INITIALIZE */, "SHIPPING_ADDRESS"), _defineProperty(_exports$GOOGLE_PAY_I, "SHIPPING_ADDRESS" /* CallbackType.SHIPPING_ADDRESS */, "SHIPPING_ADDRESS"), _defineProperty(_exports$GOOGLE_PAY_I, "SHIPPING_OPTION" /* CallbackType.SHIPPING_OPTION */, "SHIPPING_OPTION"), _defineProperty(_exports$GOOGLE_PAY_I, "OFFER" /* CallbackType.OFFER */, "OFFER"), _exports$GOOGLE_PAY_I);
exports.GOOGLEPAY_SCRIPT_URL = "https://pay.google.com/gp/p/js/pay.js";
exports.GOOGLEPAY_MERCHANT_ID = "BCR2DN4T3D32TPA6";
exports.GOOGLEPAY_GATEWAY = "godaddypayments";
exports.GOOGLEPAY_VERSION = 2;
exports.GOOGLEPAY_VERSION_MINOR = 0;
exports.GOOGLEPAY_ALLOWED_AUTHN_METHODS = ["PAN_ONLY", "CRYPTOGRAM_3DS"];
exports.GOOGLEPAY_ALLOWED_CARD_NETWORKS = ["AMEX", "DISCOVER", "JCB", "MASTERCARD", "VISA"];
/**
 * Apple Pay constants
 */
exports.APPLEPAY_VERSION = 6;
exports.APPLEPAY_MERCHANT_CAPABILITIES = ["supports3DS"];
exports.APPLEPAY_SUPPORTED_NETWORKS = ["visa", "masterCard", "amex", "discover", "interac"];
/**
 * Paze constants
 */
exports.PAZE_ALLOWED_CARD_NETWORKS = ["VISA" /* PaymentCardNetwork.VISA */, "MASTERCARD" /* PaymentCardNetwork.MASTERCARD */];
/**
 * Generic wallet constants
 */
exports.DEFAULT_TIMEOUT = 15000;
// Array of ISO 3166-1 alpha-2 country codes for shipping address,
// e.g. ["US", "CA", "JP"]. [] means supports all
exports.WALLET_SHIPPING_COUNTRY_CODES = [];
exports.DOMAIN_BLACKLIST = ["websites.godaddy.com"];
exports.ASSETS_CDN_URL = "https://d85ecz8votkqa.cloudfront.net/images/collect/";
/**
 * Card-on-file constants
 */
exports.COF_DEFAULT_LANGUAGE = "EN";
exports.COF_DEFAULT_COUNTRY_CODE = "US";

},{}],42:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildMaskedPaymentRequest = exports.buildPaymentRequest = exports.buildWalletNonceError = exports.buildErrors = exports.buildShippingMethods = exports.buildTotal = exports.buildLineItems = void 0;
var constants_1 = require("../constants");
/**
 * Builds Apple Pay line items based on the provided wallet request.
 *
 * @param {WalletRequest} request - The wallet request object.
 * @returns {ApplePayJS.ApplePayLineItem[]} - The array of Apple Pay line items.
 */
var buildLineItems = function buildLineItems(request) {
  if (!request.lineItems) {
    return [];
  }
  return request.lineItems.map(function (_ref) {
    var label = _ref.label,
      amount = _ref.amount,
      isPending = _ref.isPending;
    return {
      label: label,
      amount: amount,
      type: isPending ? "pending" : "final"
    };
  });
};
exports.buildLineItems = buildLineItems;
/**
 * Builds the total line item for Apple Pay based on the provided wallet request.
 *
 * @param {WalletRequest} request - The wallet request object.
 * @returns {ApplePayJS.ApplePayLineItem} - The Apple Pay total line item.
 */
var buildTotal = function buildTotal(request) {
  if (!request.total) {
    return {
      label: "",
      amount: "0.00"
    };
  }
  return {
    label: request.total.label,
    amount: request.total.amount,
    type: request.total.isPending ? "pending" : "final"
  };
};
exports.buildTotal = buildTotal;
/**
 * Builds Apple Pay shipping methods based on the provided wallet request.
 *
 * @param {WalletRequest} request - The wallet request object.
 * @returns {ApplePayJS.ApplePayShippingMethod[] | undefined} - The array of Apple Pay shipping methods or undefined.
 */
var buildShippingMethods = function buildShippingMethods(request) {
  var _a;
  if (!((_a = request.shippingMethods) === null || _a === void 0 ? void 0 : _a.length)) {
    return;
  }
  return request.shippingMethods.map(function (_ref2) {
    var id = _ref2.id,
      label = _ref2.label,
      amount = _ref2.amount,
      detail = _ref2.detail;
    return {
      identifier: id,
      label: label,
      amount: amount,
      detail: detail
    };
  });
};
exports.buildShippingMethods = buildShippingMethods;
/**
 * Builds Apple Pay errors based on the provided wallet request.
 *
 * @param {WalletRequest} request - The wallet request object.
 * @returns {ApplePayJS.ApplePayError[] | undefined} - The array of Apple Pay errors or undefined if no error exists.
 */
var buildErrors = function buildErrors(request) {
  var errorCodes = {
    invalid_shipping_address: "shippingContactInvalid" /* ErrorType.SHIPPING_CONTACT_INVALID */,
    unserviceable_address: "addressUnserviceable" /* ErrorType.ADDRESS_UNSERVICEABLE */,
    invalid_billing_address: "billingContactInvalid" /* ErrorType.BILLING_CONTACT_INVALID */,
    invalid_coupon_code: "couponCodeInvalid" /* ErrorType.COUPON_CODE_INVALID */,
    expired_coupon_code: "couponCodeExpired" /* ErrorType.COUPON_CODE_EXPIRED */,
    invalid_payment_data: "unknown" /* ErrorType.UNKNOWN */,
    unknown: "unknown" /* ErrorType.UNKNOWN */
  };

  var error = request.error;
  if (!error) {
    return;
  }
  return [
  //@ts-ignore
  new ApplePayError(error.code ? errorCodes[error.code] : "unknown" /* ErrorType.UNKNOWN */, error.contactField, error.message ? error.message : "")];
};
exports.buildErrors = buildErrors;
/**
 * Builds Apple Pay error for wallet nonce based on the provided API service error.
 *
 * @param {ApiServiceError} error - The API service error object.
 * @returns {ApplePayJS.ApplePayError[]} - The array of Apple Pay errors for wallet nonce.
 */
var buildWalletNonceError = function buildWalletNonceError(error) {
  return [
  //@ts-ignore
  new ApplePayError("unknown" /* ErrorType.UNKNOWN */, undefined, (error === null || error === void 0 ? void 0 : error.developerMessage) || (error === null || error === void 0 ? void 0 : error.message) || "")];
};
exports.buildWalletNonceError = buildWalletNonceError;
/**
 * Maps the wallet request object to Apple Pay payment request.
 *
 * @param {WalletRequest} request - The wallet request object.
 * @returns {ApplePayJS.ApplePayPaymentRequest} - The Apple Pay payment request.
 */
var buildPaymentRequest = function buildPaymentRequest(request) {
  var _a;
  var requiredShippingContactFields = [];
  if (request.requireShippingAddress) {
    requiredShippingContactFields.push("name");
    requiredShippingContactFields.push("postalAddress");
  }
  if (request.requireEmail) {
    requiredShippingContactFields.push("email");
  }
  if (request.requirePhone) {
    requiredShippingContactFields.push("phone");
  }
  return {
    countryCode: request.country,
    currencyCode: request.currency,
    merchantCapabilities: constants_1.APPLEPAY_MERCHANT_CAPABILITIES,
    supportedNetworks: constants_1.APPLEPAY_SUPPORTED_NETWORKS,
    total: (0, exports.buildTotal)(request),
    lineItems: (0, exports.buildLineItems)(request),
    requiredBillingContactFields: ["name", "postalAddress"],
    requiredShippingContactFields: requiredShippingContactFields.length ? requiredShippingContactFields : undefined,
    supportsCouponCode: request.supportCouponCode,
    couponCode: request.supportCouponCode ? (_a = request.couponCode) === null || _a === void 0 ? void 0 : _a.code : undefined
  };
};
exports.buildPaymentRequest = buildPaymentRequest;
/**
 * Builds a masked payment request object by replacing sensitive data with masked values.
 *
 * @param {ApplePayJS.ApplePayPaymentRequest} request - The Apple Pay payment request.
 * @returns {ApplePayJS.ApplePayPaymentRequest} - The masked payment request object.
 */
var buildMaskedPaymentRequest = function buildMaskedPaymentRequest(request) {
  try {
    var masked = "**masked**";
    var requestCopy = structuredClone(request);
    if (requestCopy.total) {
      requestCopy.total = masked;
    }
    if (requestCopy.lineItems) {
      requestCopy.lineItems = masked;
    }
    if (requestCopy.couponCode) {
      requestCopy.couponCode = masked;
    }
    return requestCopy;
  } catch (error) {
    console.warn(error);
    return {};
  }
};
exports.buildMaskedPaymentRequest = buildMaskedPaymentRequest;

},{"../constants":41}],43:[function(require,module,exports){
"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw new Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw new Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
var __createBinding = void 0 && (void 0).__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = {
      enumerable: true,
      get: function get() {
        return m[k];
      }
    };
  }
  Object.defineProperty(o, k2, desc);
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});
var __setModuleDefault = void 0 && (void 0).__setModuleDefault || (Object.create ? function (o, v) {
  Object.defineProperty(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});
var __importStar = void 0 && (void 0).__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
  __setModuleDefault(result, mod);
  return result;
};
var __awaiter = void 0 && (void 0).__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCardAgreement = void 0;
var constants_1 = require("../constants");
var localization_1 = require("./localization");
var defaultStyles = __importStar(require("../assets/card-on-file/styles"));
var isStaticTemplate = function isStaticTemplate(metadata) {
  return !metadata.businessName || !metadata.businessWebsite || !metadata.businessPhone;
};
var getCardAgreementFilePath = function getCardAgreementFilePath(isStatic, lang, countryCode) {
  var filename = isStatic ? "DEFAULT.html" : "SAVE_COF.hbs";
  return "https://d1oxd31ykxugjs.cloudfront.net".concat("/", lang, "/").concat(countryCode, "/").concat(filename);
};
var createElement = function createElement(elementName, defaultStyles, customStyles) {
  var element = document.createElement(elementName);
  if (defaultStyles) {
    Object.keys(defaultStyles).forEach(function (property) {
      element.style.setProperty(property, defaultStyles[property]);
    });
  }
  if (customStyles) {
    Object.keys(customStyles).forEach(function (property) {
      element.style.setProperty(property, customStyles[property]);
    });
  }
  return element;
};
var compileCardAgreementTemplate = function compileCardAgreementTemplate(template, metadata, customStyles) {
  var agreement = template.replace(new RegExp("\n", "g"), ' ').replace(new RegExp("<.*?>", "g"), '');
  if (!isStaticTemplate(metadata)) {
    var businessNameElement = createElement("span", defaultStyles.businessNameText, customStyles.businessNameText);
    var businessWebsiteElement = createElement("a", defaultStyles.businessWebsiteLink, customStyles.businessWebsiteLink);
    var businessPhoneElement = createElement("span", defaultStyles.businessPhoneText, customStyles.businessPhoneText);
    businessNameElement.textContent = metadata.businessName || "";
    businessWebsiteElement.textContent = metadata.businessWebsite || "";
    businessPhoneElement.textContent = metadata.businessPhone || "";
    businessWebsiteElement.setAttribute("href", metadata.businessWebsite || "");
    businessWebsiteElement.setAttribute("target", "_blank");
    businessWebsiteElement.setAttribute("rel", "noopener noreferrer");
    return agreement.replace(new RegExp("{{business_name}}", "g"), businessNameElement.outerHTML).replace(new RegExp("{{business_website}}", "g"), businessWebsiteElement.outerHTML).replace(new RegExp("{{business_contact_phone}}", "g"), businessPhoneElement.outerHTML);
  }
  return agreement;
};
var genereteCardAgreementHtml = function genereteCardAgreementHtml(agreement, locale, customStyles, hideActionButtons, onAcceptClick, onDeclineClick) {
  var globalContainer = createElement("div", defaultStyles.globalContainer, customStyles.globalContainer);
  var agreementContainer = createElement("div", defaultStyles.agreementContainer, customStyles.agreementContainer);
  var title = createElement("h1", defaultStyles.title, customStyles.title);
  var closeIconContainer = createElement("div", defaultStyles.closeIconContainer, customStyles.closeIconContainer);
  var closeIcon = createElement("span", defaultStyles.closeIcon, customStyles.closeIcon);
  var mainText = createElement("p", defaultStyles.mainText, customStyles.mainText);
  var actionButtonsContainer = createElement("div", defaultStyles.actionButtonsContainer, customStyles.actionButtonsContainer);
  var acceptButton = createElement("button", defaultStyles.acceptButton, customStyles.acceptButton);
  var declineButton = createElement("button", defaultStyles.declineButton, customStyles.declineButton);
  var messages = (0, localization_1.getMessages)(locale);
  mainText.innerHTML = agreement;
  closeIcon.innerHTML = "&#215;";
  title.textContent = messages["cardOnFile.termsAndConditions"];
  acceptButton.textContent = messages["cardOnFile.accept"];
  declineButton.textContent = messages["cardOnFile.decline"];
  closeIconContainer.appendChild(closeIcon);
  actionButtonsContainer.appendChild(declineButton);
  actionButtonsContainer.appendChild(acceptButton);
  agreementContainer.appendChild(closeIconContainer);
  agreementContainer.appendChild(title);
  agreementContainer.appendChild(mainText);
  if (!hideActionButtons) {
    agreementContainer.appendChild(actionButtonsContainer);
  }
  globalContainer.appendChild(agreementContainer);
  globalContainer.onclick = function (event) {
    var isClickInside = agreementContainer.contains(event.target);
    if (!isClickInside && document.body.contains(globalContainer)) {
      document.body.removeChild(globalContainer);
    }
  };
  closeIcon.onclick = function () {
    if (document.body.contains(globalContainer)) {
      document.body.removeChild(globalContainer);
    }
  };
  if (onAcceptClick) {
    acceptButton.onclick = onAcceptClick;
  }
  if (onDeclineClick) {
    declineButton.onclick = onDeclineClick;
  }
  return globalContainer;
};
var requestTemplate = function requestTemplate(isStatic, lang, countryCode) {
  return __awaiter(void 0, void 0, void 0, /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
    var response, template;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return fetch(getCardAgreementFilePath(isStatic, lang, countryCode));
        case 3:
          response = _context.sent;
          if (response.ok) {
            _context.next = 8;
            break;
          }
          console.warn("Unable to fetch template for language \"".concat(lang, "\" and countryCode \"").concat(countryCode, "\""));
          _context.next = 12;
          break;
        case 8:
          _context.next = 10;
          return response.text();
        case 10:
          template = _context.sent;
          return _context.abrupt("return", {
            template: template,
            lang: lang,
            countryCode: countryCode
          });
        case 12:
          _context.next = 17;
          break;
        case 14:
          _context.prev = 14;
          _context.t0 = _context["catch"](0);
          console.error(_context.t0);
        case 17:
          return _context.abrupt("return", null);
        case 18:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[0, 14]]);
  }));
};
var findTemplate = function findTemplate(metadata) {
  return __awaiter(void 0, void 0, void 0, /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
    var isStatic, localizedTemplate, defaultTemplate;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          isStatic = isStaticTemplate(metadata);
          _context2.next = 3;
          return requestTemplate(isStatic, metadata.lang, metadata.countryCode);
        case 3:
          localizedTemplate = _context2.sent;
          if (!localizedTemplate) {
            _context2.next = 6;
            break;
          }
          return _context2.abrupt("return", localizedTemplate);
        case 6:
          _context2.next = 8;
          return requestTemplate(isStatic, constants_1.COF_DEFAULT_LANGUAGE, constants_1.COF_DEFAULT_COUNTRY_CODE);
        case 8:
          defaultTemplate = _context2.sent;
          if (!defaultTemplate) {
            _context2.next = 11;
            break;
          }
          return _context2.abrupt("return", defaultTemplate);
        case 11:
          return _context2.abrupt("return", null);
        case 12:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  }));
};
var getCardAgreement = function getCardAgreement(locale, hideActionButtons, options, onAcceptClick, onDeclineClick) {
  return __awaiter(void 0, void 0, void 0, /*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
    var metadata, templateResponse, customStyles, agreement, container;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          metadata = {
            lang: (locale === null || locale === void 0 ? void 0 : locale.length) === 5 ? locale.slice(0, 2).toUpperCase() : constants_1.COF_DEFAULT_LANGUAGE,
            countryCode: (locale === null || locale === void 0 ? void 0 : locale.length) === 5 ? locale.slice(-2).toUpperCase() : constants_1.COF_DEFAULT_COUNTRY_CODE,
            businessName: options === null || options === void 0 ? void 0 : options.businessName,
            businessWebsite: options === null || options === void 0 ? void 0 : options.businessWebsite,
            businessPhone: options === null || options === void 0 ? void 0 : options.businessPhone
          };
          _context3.next = 3;
          return findTemplate(metadata);
        case 3:
          templateResponse = _context3.sent;
          if (!(!templateResponse || !templateResponse.template)) {
            _context3.next = 6;
            break;
          }
          throw new Error("Card agreement template not found");
        case 6:
          //update metadata with actual lang and countryCode from template
          metadata.lang = templateResponse.lang;
          metadata.countryCode = templateResponse.countryCode;
          customStyles = (options === null || options === void 0 ? void 0 : options.style) || {};
          agreement = compileCardAgreementTemplate(templateResponse.template, metadata, customStyles);
          container = genereteCardAgreementHtml(agreement, locale || constants_1.DEFAULT_LOCALE, customStyles, hideActionButtons, onAcceptClick, onDeclineClick);
          return _context3.abrupt("return", {
            container: container,
            metadata: metadata
          });
        case 12:
        case "end":
          return _context3.stop();
      }
    }, _callee3);
  }));
};
exports.getCardAgreement = getCardAgreement;

},{"../assets/card-on-file/styles":40,"../constants":41,"./localization":46}],44:[function(require,module,exports){
"use strict";

function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
var __createBinding = void 0 && (void 0).__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = {
      enumerable: true,
      get: function get() {
        return m[k];
      }
    };
  }
  Object.defineProperty(o, k2, desc);
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});
var __setModuleDefault = void 0 && (void 0).__setModuleDefault || (Object.create ? function (o, v) {
  Object.defineProperty(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});
var __importStar = void 0 && (void 0).__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
  __setModuleDefault(result, mod);
  return result;
};
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createDefaultWalletRequest = exports.setButtonsContainerProperties = exports.setButtonProperties = exports.createIFrame = exports.getAllOptions = exports.shouldEnableCardOnFile = exports.isPaymentFormEnabled = exports.parseMessage = exports.loadScript = exports.removeCachedScripts = exports.getCachedScripts = void 0;
var qs_1 = require("qs");
var constants = __importStar(require("../constants"));
var cachedScripts = {};
var getCachedScripts = function getCachedScripts() {
  return _extends({}, cachedScripts);
};
exports.getCachedScripts = getCachedScripts;
var removeCachedScripts = function removeCachedScripts() {
  Object.keys(cachedScripts).forEach(function (key) {
    return cachedScripts[key] = null;
  });
};
exports.removeCachedScripts = removeCachedScripts;
var loadScript = function loadScript(src) {
  var existing = cachedScripts[src];
  if (existing) {
    return existing;
  }
  var promise = new Promise(function (resolve, reject) {
    var script = document.createElement('script');
    script.src = src;
    script.async = true;
    var onScriptLoad = function onScriptLoad() {
      resolve();
    };
    var onScriptError = function onScriptError() {
      script.removeEventListener('load', onScriptLoad);
      script.removeEventListener('error', onScriptError);
      cachedScripts[src] = null;
      script.remove();
      reject(new Error("Unable to load script ".concat(src)));
    };
    script.addEventListener('load', onScriptLoad);
    script.addEventListener('error', onScriptError);
    document.body.appendChild(script);
  });
  cachedScripts[src] = promise;
  return promise;
};
exports.loadScript = loadScript;
var parseMessage = function parseMessage(event) {
  try {
    return JSON.parse(event.data);
  } catch (error) {
    console.error(error);
  }
  return null;
};
exports.parseMessage = parseMessage;
var isPaymentFormEnabled = function isPaymentFormEnabled(options) {
  var _a;
  return !((_a = options.paymentMethods) === null || _a === void 0 ? void 0 : _a.length) || options.paymentMethods.includes("card") || options.paymentMethods.includes("ach");
};
exports.isPaymentFormEnabled = isPaymentFormEnabled;
var shouldEnableCardOnFile = function shouldEnableCardOnFile(options) {
  if (!(0, exports.isPaymentFormEnabled)(options)) {
    return false;
  }
  return !!options.enableCardOnFile;
};
exports.shouldEnableCardOnFile = shouldEnableCardOnFile;
var getAllOptions = function getAllOptions(businessId, applicationId, sessionId, mountOptions) {
  var options = mountOptions || {};
  options.businessId = businessId;
  options.applicationId = applicationId;
  options.sessionId = sessionId;
  options.enableReCaptcha = !!options.enableReCaptcha;
  options.enableCardOnFile = (0, exports.shouldEnableCardOnFile)(options);
  return options;
};
exports.getAllOptions = getAllOptions;
var createIFrame = function createIFrame(options) {
  var iFrame = document.createElement("iframe");
  iFrame.setAttribute("name", constants.IFRAME_NAME);
  iFrame.setAttribute("id", constants.IFRAME_NAME);
  var iFrameUrl = "https://cdn.poynt.net/collect/index.html".concat("?", (0, qs_1.stringify)(options));
  if (options.iFrame) {
    iFrame.style.cssText = JSON.stringify(options.iFrame);
    if (options.iFrame.height) {
      iFrame.style["height"] = options.iFrame.height;
    }
    if (options.iFrame.width) {
      iFrame.style["width"] = options.iFrame.width;
    }
    if (options.iFrame.border) {
      iFrame.style["border"] = options.iFrame.border;
    }
    if (options.iFrame.borderRadius) {
      iFrame.style["borderRadius"] = options.iFrame.borderRadius;
    }
    if (options.iFrame.boxShadow) {
      iFrame.style["boxShadow"] = options.iFrame.boxShadow;
    }
  }
  //iFrame will render card form by default, so we set display none here if its for GooglePay/ApplePay only
  if (!(0, exports.isPaymentFormEnabled)(options)) {
    iFrame.setAttribute("style", "display: none");
  }
  iFrame.setAttribute("src", iFrameUrl);
  return iFrame;
};
exports.createIFrame = createIFrame;
var setButtonProperties = function setButtonProperties(container, buttonOptions) {
  var button = container.getElementsByTagName("button")[0];
  var minWidth = (buttonOptions === null || buttonOptions === void 0 ? void 0 : buttonOptions.type) === "plain" ? "160px" : "240px";
  var minHeight = "40px";
  var margin = "8px";
  button.style.setProperty("width", "100%");
  button.style.setProperty("height", "100%");
  button.style.setProperty("min-height", minHeight);
  button.style.setProperty("min-width", minWidth);
  button.style.setProperty("border", (buttonOptions === null || buttonOptions === void 0 ? void 0 : buttonOptions.border) || "unset");
  button.style.setProperty("border-radius", (buttonOptions === null || buttonOptions === void 0 ? void 0 : buttonOptions.borderRadius) || "5px");
  container.style.setProperty("min-width", minWidth);
  container.style.setProperty("min-height", minHeight);
  container.style.setProperty("margin", (buttonOptions === null || buttonOptions === void 0 ? void 0 : buttonOptions.margin) || margin);
  container.style.setProperty("width", (buttonOptions === null || buttonOptions === void 0 ? void 0 : buttonOptions.width) || minWidth);
  container.style.setProperty("height", (buttonOptions === null || buttonOptions === void 0 ? void 0 : buttonOptions.height) || minHeight);
  return container;
};
exports.setButtonProperties = setButtonProperties;
var setButtonsContainerProperties = function setButtonsContainerProperties(container, buttonsContainerOptions) {
  container.style.setProperty("display", "flex");
  container.style.setProperty("justify-content", (buttonsContainerOptions === null || buttonsContainerOptions === void 0 ? void 0 : buttonsContainerOptions.justifyContent) || "center");
  container.style.setProperty("align-items", (buttonsContainerOptions === null || buttonsContainerOptions === void 0 ? void 0 : buttonsContainerOptions.alignItems) || "center");
  container.style.setProperty("flex-direction", (buttonsContainerOptions === null || buttonsContainerOptions === void 0 ? void 0 : buttonsContainerOptions.flexDirection) || "row");
  if (buttonsContainerOptions === null || buttonsContainerOptions === void 0 ? void 0 : buttonsContainerOptions.style) {
    var cssRules = Object.entries(buttonsContainerOptions.style);
    cssRules.forEach(function (cssRule) {
      container.style.setProperty(cssRule[0], cssRule[1]);
    });
  }
  return container;
};
exports.setButtonsContainerProperties = setButtonsContainerProperties;
var createDefaultWalletRequest = function createDefaultWalletRequest() {
  return {
    currency: "USD",
    country: "US",
    merchantName: "",
    total: {
      label: "",
      amount: "0.00"
    }
  };
};
exports.createDefaultWalletRequest = createDefaultWalletRequest;

},{"../constants":41,"qs":17}],45:[function(require,module,exports){
"use strict";

function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildMaskedPaymentRequest = exports.buildPaymentRequest = exports.buildPaymentDataChangedHandlerError = exports.buildWalletNonceError = exports.buildMissedHandlerError = exports.buildDuplicateCouponCodeError = exports.buildError = exports.buildOfferInfo = exports.buildShippingMethods = exports.buildTransactionInfo = exports.buildLineItems = exports.getCardPaymentMethod = exports.getBaseCardPaymentMethod = void 0;
var constants_1 = require("../constants");
/**
 * Fetches GooglePay payment method configs that are supported by GoDaddy Payments
 * which determine supported authentication methods, card networks, and billing
 * information requirements
 *
 * @param {WalletRequest} request - The wallet request object
 * @returns {GooglePayJS.IsReadyToPayPaymentMethodSpecification} - GooglePay payment configuration
 */
var getBaseCardPaymentMethod = function getBaseCardPaymentMethod(request) {
  var result = {
    type: "CARD",
    parameters: {
      allowedAuthMethods: constants_1.GOOGLEPAY_ALLOWED_AUTHN_METHODS,
      allowedCardNetworks: constants_1.GOOGLEPAY_ALLOWED_CARD_NETWORKS
    }
  };
  result.parameters.billingAddressRequired = true;
  result.parameters.billingAddressParameters = {
    format: "FULL"
  };
  if (request.requirePhone) {
    result.parameters.billingAddressParameters.phoneNumberRequired = true;
  }
  return result;
};
exports.getBaseCardPaymentMethod = getBaseCardPaymentMethod;
/**
 * Fetches GooglePay tokenization and payment configs that are supported by Godaddy Payments
 * which includes tokenization specs, GoDaddy gateway ID, and payment method configs.
 *
 * @param {WalletRequest} request - The wallet request object
 * @param {string} businessId - GoDaddy Payments business UUID
 * @returns {GooglePayJS.PaymentMethodSpecification} - GooglePay payment and tokenization configuration
 */
var getCardPaymentMethod = function getCardPaymentMethod(request, businessId) {
  var baseCardPaymentMethod = (0, exports.getBaseCardPaymentMethod)(request);
  return _extends({
    tokenizationSpecification: {
      type: "PAYMENT_GATEWAY",
      parameters: {
        gateway: constants_1.GOOGLEPAY_GATEWAY,
        gatewayMerchantId: businessId
      }
    }
  }, baseCardPaymentMethod);
};
exports.getCardPaymentMethod = getCardPaymentMethod;
/**
 * Builds GooglePay representation of line items from the generic WalletRequest interface.
 * DisplayItem.type defaults to "LINE_ITEM" because it's a required field for which it will
 * not have any UI side-effects.
 *
 * @param {WalletRequest} request - The wallet request object
 * @returns {GooglePayJS.DisplayItem[]} - GooglePay line items
 */
var buildLineItems = function buildLineItems(request) {
  if (!request.lineItems) {
    return [];
  }
  return request.lineItems.map(function (lineItem) {
    return {
      label: lineItem.label,
      price: lineItem.amount,
      type: "LINE_ITEM",
      status: lineItem.isPending ? "PENDING" : "FINAL"
    };
  });
};
exports.buildLineItems = buildLineItems;
/**
 * Builds GooglePay representation of a transaction unit that determines payer's ability
 * to pay. This method is mostly used for updating wallet session when payer interacts
 * with payment sheet and trigger these events (see EventType definition):
 * - ShippingAddressChange
 * - ShippingMethodChange
 * - CouponCodeChange
 *
 * @param {WalletRequest} request - The wallet request object
 * @returns {GooglePayJS.TransactionInfo} - GooglePay transaction unit containing line items
 */
var buildTransactionInfo = function buildTransactionInfo(request) {
  var items = (0, exports.buildLineItems)(request);
  if (!request.total) {
    return {
      countryCode: request.country,
      currencyCode: request.currency || "",
      totalPrice: "0.00",
      totalPriceStatus: "ESTIMATED",
      displayItems: items
    };
  }
  return {
    countryCode: request.country,
    currencyCode: request.currency,
    totalPrice: request.total.amount,
    totalPriceLabel: request.total.label,
    totalPriceStatus: request.total.isPending ? "ESTIMATED" : "FINAL",
    displayItems: items
  };
};
exports.buildTransactionInfo = buildTransactionInfo;
/**
 * Builds GooglePay representation of shipping methods. This method is mostly used for
 * updating wallet session when payer interacts with payment sheet and trigger these
 * events (see EventType definition):
 * - ShippingAddressChange
 * - CouponCodeChange
 *
 * @param {WalletRequest} request - The wallet request object
 * @returns {GooglePayJS.ShippingOptionParameters | undefined} - GooglePay shipping option parameters or undefined.
 */
var buildShippingMethods = function buildShippingMethods(request) {
  var _a;
  if (!((_a = request.shippingMethods) === null || _a === void 0 ? void 0 : _a.length)) {
    return;
  }
  var options = request.shippingMethods.map(function (shippingMethod) {
    return {
      id: shippingMethod.id,
      label: shippingMethod.label,
      description: shippingMethod.detail
    };
  });
  return {
    shippingOptions: options
  };
};
exports.buildShippingMethods = buildShippingMethods;
/**
 * Builds GooglePay representation of coupon code. This method is mostly used for updating
 * wallet session when payer interacts with payment sheet (handles one coupon per action)
 * and trigger these events (see EventType definition):
 * - CouponCodeChange
 *
 * @param {WalletRequest} request - The wallet request object
 * @returns {GooglePayJS.OfferInfo} - GooglePay coupon code
 */
var buildOfferInfo = function buildOfferInfo(request) {
  var _a;
  if (!((_a = request.couponCode) === null || _a === void 0 ? void 0 : _a.code)) {
    return {
      offers: []
    };
  }
  return {
    offers: [{
      redemptionCode: request.couponCode.code,
      description: request.couponCode.label
    }]
  };
};
exports.buildOfferInfo = buildOfferInfo;
/**
 * Builds GooglePay representation of error objects. This method is mostly used for
 * updating wallet session when payer interacts with payment sheet and trigger these
 * events (see EventType definition):
 * - ShippingAddressChange
 * - CouponCodeChange
 * - PaymentAuthorized
 *
 * @param {WalletRequest} request - The wallet request object
 * @param {GooglePayJS.CallbackIntent} callbackIntent - Field indicator of error input
 * @returns {GooglePayJS.PaymentDataError | undefined} - GooglePay error object
 */
var buildError = function buildError(request, callbackIntent) {
  var errorCodes = {
    invalid_shipping_address: "SHIPPING_ADDRESS_INVALID" /* ErrorType.SHIPPING_ADDRESS_INVALID */,
    unserviceable_address: "SHIPPING_ADDRESS_UNSERVICEABLE" /* ErrorType.SHIPPING_ADDRESS_UNSERVICEABLE */,
    invalid_billing_address: "PAYMENT_DATA_INVALID" /* ErrorType.PAYMENT_DATA_INVALID */,
    invalid_coupon_code: "OFFER_INVALID" /* ErrorType.OFFER_INVALID */,
    expired_coupon_code: "OFFER_INVALID" /* ErrorType.OFFER_INVALID */,
    invalid_payment_data: "PAYMENT_DATA_INVALID" /* ErrorType.PAYMENT_DATA_INVALID */,
    unknown: "OTHER_ERROR" /* ErrorType.OTHER_ERROR */
  };

  var error = request.error;
  if (!error) {
    return;
  }
  return {
    reason: error.code ? errorCodes[error.code] : errorCodes.unknown,
    intent: callbackIntent,
    message: error.message || ""
  };
};
exports.buildError = buildError;
/**
 * Builds GooglePay representation of duplicate coupon code error.
 *
 * @param {GooglePayJS.CallbackIntent} callbackIntent - Field indicator of error input
 * @returns {GooglePayJS.PaymentDataError} - GooglePay error object
 */
var buildDuplicateCouponCodeError = function buildDuplicateCouponCodeError(callbackIntent) {
  return {
    reason: "OFFER_INVALID" /* ErrorType.OFFER_INVALID */,
    intent: callbackIntent,
    message: "Coupon code already applied"
  };
};
exports.buildDuplicateCouponCodeError = buildDuplicateCouponCodeError;
/**
 * Builds GooglePay representation of missed handler error.
 *
 * @param {EventType} eventType - The event type
 * @param {GooglePayJS.CallbackIntent} callbackIntent - Field indicator of error input
 * @returns {GooglePayJS.PaymentDataError} - GooglePay error object
 */
var buildMissedHandlerError = function buildMissedHandlerError(eventType, callbackIntent) {
  return {
    reason: "OTHER_ERROR" /* ErrorType.OTHER_ERROR */,
    intent: callbackIntent,
    message: "".concat(eventType, " callback handler not found")
  };
};
exports.buildMissedHandlerError = buildMissedHandlerError;
/**
 * Builds GooglePay representation of wallet nonce error.
 *
 * @param {GooglePayJS.CallbackIntent} callbackIntent - Field indicator of error input
 * @param {ApiServiceError} error - The error object
 * @returns {GooglePayJS.PaymentDataError} - GooglePay error object
 */
var buildWalletNonceError = function buildWalletNonceError(callbackIntent, error) {
  return {
    reason: "OTHER_ERROR" /* ErrorType.OTHER_ERROR */,
    intent: callbackIntent,
    message: (error === null || error === void 0 ? void 0 : error.developerMessage) || (error === null || error === void 0 ? void 0 : error.message) || ""
  };
};
exports.buildWalletNonceError = buildWalletNonceError;
/**
 * Builds GooglePay representation of payment data changed handler error.
 *
 * @param {GooglePayJS.CallbackTrigger} callbackTrigger - The callback trigger
 * @returns {GooglePayJS.PaymentDataError} - GooglePay error object
 */
var buildPaymentDataChangedHandlerError = function buildPaymentDataChangedHandlerError(callbackTrigger) {
  return {
    reason: "OTHER_ERROR" /* ErrorType.OTHER_ERROR */,
    intent: constants_1.GOOGLE_PAY_INTENT_MAP[callbackTrigger],
    message: "Callback trigger \"".concat(callbackTrigger, "\" not found or intermediate payment data does not exist")
  };
};
exports.buildPaymentDataChangedHandlerError = buildPaymentDataChangedHandlerError;
/**
 * Builds GooglePay payment request configs containing GoDaddy gateway merchant ID,
 * GooglePay API version, payment configuration, and payment sheet input options:
 * - Shipping Address
 * - Shipping Method
 * - Coupon Code
 *
 * @param {WalletRequest} request - The wallet request object
 * @param {string} businessId - GoDaddy Payments business UUID
 * @param {string} authJwt - Authentication JWT token
 * @returns {GooglePayJS.PaymentDataRequest} - GooglePay payment request model
 */
var buildPaymentRequest = function buildPaymentRequest(request, businessId, authJwt) {
  var _a, _b, _c;
  var merchantInfo = {
    merchantId: constants_1.GOOGLEPAY_MERCHANT_ID,
    merchantOrigin: ((_a = window.top) === null || _a === void 0 ? void 0 : _a.location.hostname) || document.location.hostname,
    merchantName: request.merchantName,
    authJwt: authJwt
  };
  var result = {
    apiVersion: constants_1.GOOGLEPAY_VERSION,
    apiVersionMinor: constants_1.GOOGLEPAY_VERSION_MINOR,
    merchantInfo: merchantInfo,
    allowedPaymentMethods: [(0, exports.getCardPaymentMethod)(request, businessId)],
    transactionInfo: (0, exports.buildTransactionInfo)(request)
  };
  var callbackIntents = ["PAYMENT_AUTHORIZATION" /* CallbackType.PAYMENT_AUTHORIZATION */];
  if (request.requireShippingAddress) {
    callbackIntents.push("SHIPPING_ADDRESS" /* CallbackType.SHIPPING_ADDRESS */);
    result.shippingAddressRequired = true;
    if (typeof request.requireShippingMethods === "undefined" || request.requireShippingMethods) {
      result.shippingOptionRequired = true;
      callbackIntents.push("SHIPPING_OPTION" /* CallbackType.SHIPPING_OPTION */);
    }

    result.shippingAddressParameters = {
      allowedCountryCodes: constants_1.WALLET_SHIPPING_COUNTRY_CODES,
      phoneNumberRequired: request.requirePhone
    };
    if ((_b = request.shippingMethods) === null || _b === void 0 ? void 0 : _b.length) {
      result.shippingOptionParameters = (0, exports.buildShippingMethods)(request);
    }
  }
  if (request.supportCouponCode) {
    callbackIntents.push("OFFER" /* CallbackType.OFFER */);
    if ((_c = request.couponCode) === null || _c === void 0 ? void 0 : _c.code) {
      result.offerInfo = {
        offers: [{
          redemptionCode: request.couponCode.code,
          description: request.couponCode.label
        }]
      };
    }
  }
  if (request.requireEmail) {
    result.emailRequired = true;
  }
  result.callbackIntents = callbackIntents;
  return result;
};
exports.buildPaymentRequest = buildPaymentRequest;
/**
 * Builds a masked payment request object by replacing sensitive data with masked values.
 *
 * @param {GooglePayJS.PaymentDataRequest} request - The payment request object
 * @returns {object} - Masked payment request object
 */
var buildMaskedPaymentRequest = function buildMaskedPaymentRequest(request) {
  try {
    var masked = "**masked**";
    var requestCopy = structuredClone(request);
    if (requestCopy.merchantInfo) {
      requestCopy.merchantInfo = masked;
    }
    if (requestCopy.transactionInfo) {
      requestCopy.transactionInfo = masked;
    }
    if (requestCopy.shippingOptionParameters) {
      requestCopy.shippingOptionParameters = masked;
    }
    if (requestCopy.offerInfo) {
      requestCopy.offerInfo = masked;
    }
    return requestCopy;
  } catch (error) {
    console.warn(error);
    return {};
  }
};
exports.buildMaskedPaymentRequest = buildMaskedPaymentRequest;

},{"../constants":41}],46:[function(require,module,exports){
"use strict";

function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMessages = void 0;
var constants_1 = require("../constants");
var snippet_json_1 = __importDefault(require("l10n/collect/en-us/snippet.json"));
var snippet_json_2 = __importDefault(require("l10n/collect/en-ca/snippet.json"));
var snippet_json_3 = __importDefault(require("l10n/collect/fr-ca/snippet.json"));
var messages = {
  "en-US": snippet_json_1["default"],
  "en-CA": snippet_json_2["default"],
  "fr-CA": snippet_json_3["default"]
};
var getMessages = function getMessages(locale) {
  return messages[locale] ? _extends(_extends({}, messages[constants_1.DEFAULT_LOCALE]), messages[locale]) : messages[constants_1.DEFAULT_LOCALE];
};
exports.getMessages = getMessages;

},{"../constants":41,"l10n/collect/en-ca/snippet.json":12,"l10n/collect/en-us/snippet.json":13,"l10n/collect/fr-ca/snippet.json":14}],47:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildMaskedCompleteRequest = exports.buildMaskedCheckoutRequest = exports.buildPaymentAuthorizedResponse = exports.buildAddress = exports.buildWalletNonceRequest = exports.buildCompleteRequest = exports.buildCheckoutRequest = exports.formatAmountWithCents = exports.getOrderQuantity = exports.getPazeScriptUrl = void 0;
var constants_1 = require("../constants");
/**
 * Constructs the Paze script URL with the provided client ID and returns it.
 * The URL is built using the environment variables PAZE_URL and PAZE_CLIENT_ID.
 * The PAZE_URL environment variable should contain the base URL for the Paze script,
 * and the PAZE_CLIENT_ID environment variable should contain the client ID.
 *
 * @returns {string} - The Paze script URL with the client ID appended as a query parameter.
 */
var getPazeScriptUrl = function getPazeScriptUrl() {
  if (!"https://checkout.paze.com/web/resources/js/digitalwallet-sdk.js" || !"46VM0VIBJ63520UZ7X6U14L-0rahMJIVUiE1MgKLDdBgyTXkE") {
    return '';
  }
  ;
  return "https://checkout.paze.com/web/resources/js/digitalwallet-sdk.js".concat("?id=", "46VM0VIBJ63520UZ7X6U14L-0rahMJIVUiE1MgKLDdBgyTXkE");
};
exports.getPazeScriptUrl = getPazeScriptUrl;
/**
 * Retrieves the order quantity from the line items.
 *
 * @param {LineItem[]} [lineItems] - The line items array.
 * @returns {string|undefined} - The order quantity as a string, or undefined if there are no line items.
 */
var getOrderQuantity = function getOrderQuantity(lineItems) {
  if (!(lineItems === null || lineItems === void 0 ? void 0 : lineItems.length)) {
    return;
  }
  return lineItems.length.toString();
};
exports.getOrderQuantity = getOrderQuantity;
/**
 * Formats an amount value with cents if they don't exist.
 *
 * @param {string} amount - The amount value as a string.
 * @returns {string} The formatted amount value with cents added if necessary.
 */
var formatAmountWithCents = function formatAmountWithCents(amount) {
  if (!amount || !Number(amount)) {
    // Not a valid amount, return "0.00"
    return '0.00';
  }
  var parts = amount.split('.');
  if (parts.length === 1) {
    // No cents exist, add ".00"
    return "".concat(parts[0], ".00");
  }
  if (parts.length === 2 && parts[1].length === 1) {
    // Only one cent digit exists, add a trailing zero
    return "".concat(parts[0], ".").concat(parts[1], "0");
  }
  return amount;
};
exports.formatAmountWithCents = formatAmountWithCents;
/**
 * Maps the wallet request object to Paze Wallet checkout request.
 *
 * @param {WalletRequest} request - The wallet request object.
 * @param {string} [sessionId] - The session ID.
 * @param {string} [emailAddress] - The email address.
 * @returns {PazeJS.CheckoutRequest} - The Paze Wallet checkout request.
 */
var buildCheckoutRequest = function buildCheckoutRequest(request, sessionId, emailAddress) {
  return {
    emailAddress: emailAddress,
    sessionId: sessionId,
    actionCode: "START_FLOW" /* ActionCode.START_FLOW */,
    transactionValue: {
      transactionCurrencyCode: request.currency,
      transactionAmount: (0, exports.formatAmountWithCents)(request.total.amount)
    },
    enhancedTransactionData: {
      orderQuantity: (0, exports.getOrderQuantity)(request.lineItems)
    },
    shippingPreference: "NONE" /* AddressPreference.NONE */,
    billingPreference: "ALL" /* AddressPreference.ALL */,
    acceptedShippingCountries: constants_1.WALLET_SHIPPING_COUNTRY_CODES,
    acceptedPaymentCardNetworks: constants_1.PAZE_ALLOWED_CARD_NETWORKS
  };
};
exports.buildCheckoutRequest = buildCheckoutRequest;
/**
 * Maps the wallet request object to Paze Wallet complete request.
 *
 * @param {WalletRequest} request - The wallet request object.
 * @param {string} [sessionId] - The session ID.
 * @returns {PazeJS.CompleteRequest} - The Paze Wallet complete request.
 */
var buildCompleteRequest = function buildCompleteRequest(request, sessionId) {
  return {
    sessionId: sessionId,
    transactionType: "PURCHASE" /* TransactionType.PURCHASE */,
    transactionValue: {
      transactionCurrencyCode: request.currency,
      transactionAmount: (0, exports.formatAmountWithCents)(request.total.amount)
    },
    transactionOptions: {
      billingPreference: "ALL" /* AddressPreference.ALL */,
      payloadTypeIndicator: "PAYMENT" /* PayloadTypeIndicator.PAYMENT */
    },

    enhancedTransactionData: {
      orderQuantity: (0, exports.getOrderQuantity)(request.lineItems)
    }
  };
};
exports.buildCompleteRequest = buildCompleteRequest;
/**
 * Builds the wallet nonce request.
 *
 * @param {PazeJS.DecodedCheckoutResponse} checkout - The decoded checkout response.
 * @param {PazeJS.CompleteResponse} complete - The complete response.
 * @returns {GetWalletNonceOptions} - The wallet nonce request options.
 */
var buildWalletNonceRequest = function buildWalletNonceRequest(checkout, complete, requestId) {
  var result = {
    pazePaymentToken: {
      paymentTokenJwt: complete.completeResponse
    }
  };
  var billingAddress = checkout.maskedCard.billingAddress;
  var customerInfo = checkout.consumer;
  if (billingAddress) {
    result.zip = billingAddress.zip;
    result.line1 = billingAddress.line1;
    result.line2 = billingAddress.line2;
    result.city = billingAddress.city;
    result.territory = billingAddress.state;
    result.countryCode = billingAddress.countryCode;
  }
  if (customerInfo) {
    result.firstName = customerInfo.firstName;
    result.lastName = customerInfo.lastName;
  }
  if (requestId) {
    result.requestId = requestId;
  }
  return result;
};
exports.buildWalletNonceRequest = buildWalletNonceRequest;
/**
 * Builds an address object.
 *
 * @param {PazeJS.Address | PazeJS.ShippingAddress} address - The address object.
 * @param {PazeJS.Consumer} [customerInfo] - The customer information.
 * @returns {Address} - The built address object.
 */
var buildAddress = function buildAddress(address, customerInfo) {
  var result = {
    administrativeArea: address.state,
    countryCode: address.countryCode,
    postalCode: address.zip,
    locality: address.city,
    addressLines: [address.line1 || "", address.line2 || "", address.line3 || ""].filter(function (address) {
      return address;
    })
  };
  if (customerInfo) {
    result.emailAddress = customerInfo.emailAddress;
    var phoneNumber;
    var name = customerInfo.fullName || "".concat(customerInfo.firstName, " ").concat(customerInfo.lastName).trim();
    if (customerInfo.mobileNumber) {
      phoneNumber = "".concat(customerInfo.mobileNumber.countryCode).concat(customerInfo.mobileNumber.phoneNumber).trim();
    }
    if ("deliveryContactDetails" in address) {
      result.name = address.deliveryContactDetails.contactFullName || name;
      result.phoneNumber = address.deliveryContactDetails.contactPhoneNumber || phoneNumber;
    } else {
      result.name = name;
      result.phoneNumber = phoneNumber;
    }
  }
  return result;
};
exports.buildAddress = buildAddress;
/**
 * Builds the payment authorized response.
 *
 * @param {PazeJS.DecodedCheckoutResponse} checkout - The decoded checkout response.
 * @param {GetWalletNonceResponse} nonceResponse - The wallet nonce response.
 * @param {boolean} [requireShippingAddress] - Indicates if a shipping address is required.
 * @returns {PaymentAuthorizedResponse} - The payment authorized response.
 */
var buildPaymentAuthorizedResponse = function buildPaymentAuthorizedResponse(checkout, nonceResponse, requireShippingAddress) {
  var result = {
    nonce: nonceResponse.nonce,
    source: "paze" /* WalletType.Paze */
  };

  var billingAddress = checkout.maskedCard.billingAddress;
  var shippingAddress = checkout.shippingAddress;
  var customerInfo = checkout.consumer;
  if (billingAddress) {
    result.billingAddress = (0, exports.buildAddress)(billingAddress, customerInfo);
  }
  ;
  if (requireShippingAddress && shippingAddress) {
    result.shippingAddress = (0, exports.buildAddress)(shippingAddress, customerInfo);
  }
  ;
  return result;
};
exports.buildPaymentAuthorizedResponse = buildPaymentAuthorizedResponse;
/**
 * Builds a masked checkout request object by replacing sensitive data with masked values.
 *
 * @param {PazeJS.CheckoutRequest} request - The Apple Pay payment request.
 * @returns {PazeJS.CheckoutRequest} - The masked payment request object.
 */
var buildMaskedCheckoutRequest = function buildMaskedCheckoutRequest(request) {
  try {
    var masked = "**masked**";
    var requestCopy = structuredClone(request);
    if (requestCopy.emailAddress) {
      requestCopy.emailAddress = masked;
    }
    if (requestCopy.transactionValue) {
      requestCopy.transactionValue = masked;
    }
    return requestCopy;
  } catch (error) {
    console.warn(error);
    return {};
  }
};
exports.buildMaskedCheckoutRequest = buildMaskedCheckoutRequest;
/**
 * Builds a masked complete request object by replacing sensitive data with masked values.
 *
 * @param {PazeJS.CompleteRequest} request - The Apple Pay payment request.
 * @returns {PazeJS.CompleteRequest} - The masked payment request object.
 */
var buildMaskedCompleteRequest = function buildMaskedCompleteRequest(request) {
  try {
    var masked = "**masked**";
    var requestCopy = structuredClone(request);
    if (requestCopy.transactionValue) {
      requestCopy.transactionValue = masked;
    }
    return requestCopy;
  } catch (error) {
    console.warn(error);
    return {};
  }
};
exports.buildMaskedCompleteRequest = buildMaskedCompleteRequest;

},{"../constants":41}],48:[function(require,module,exports){
"use strict";

function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
var __rest = void 0 && (void 0).__rest || function (s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildWalletNonceRequest = exports.buildPaymentAuthorizedResponse = exports.buildAddress = exports.buildCouponCodeResponse = exports.buildShippingMethodResponse = exports.buildShippingAddressResponse = void 0;
var buildShippingAddressResponse = function buildShippingAddressResponse(event) {
  return {
    shippingAddress: {
      administrativeArea: event.administrativeArea || "",
      countryCode: event.countryCode || "",
      postalCode: event.postalCode || "",
      locality: event.locality || ""
    }
  };
};
exports.buildShippingAddressResponse = buildShippingAddressResponse;
var buildShippingMethodResponse = function buildShippingMethodResponse(event, shippingMethods) {
  var result = {
    shippingMethod: {}
  };
  // ApplePay
  if ("identifier" in event) {
    result.shippingMethod = {
      id: event.identifier,
      label: event.label,
      detail: event.detail,
      amount: event.amount
    };
  }
  // GooglePay
  if ("id" in event) {
    var shippingMethod = (shippingMethods || []).find(function (item) {
      return item.id === event.id;
    });
    result.shippingMethod = {
      id: event.id,
      label: shippingMethod === null || shippingMethod === void 0 ? void 0 : shippingMethod.label,
      detail: shippingMethod === null || shippingMethod === void 0 ? void 0 : shippingMethod.detail,
      amount: shippingMethod === null || shippingMethod === void 0 ? void 0 : shippingMethod.amount
    };
  }
  return result;
};
exports.buildShippingMethodResponse = buildShippingMethodResponse;
var buildCouponCodeResponse = function buildCouponCodeResponse(event) {
  return {
    couponCode: Array.isArray(event) ? event[0] : event
  };
};
exports.buildCouponCodeResponse = buildCouponCodeResponse;
var buildAddress = function buildAddress(address, email) {
  var result = {};
  // ApplePay
  if ("givenName" in address) {
    var phoneticFamilyName = address.phoneticFamilyName,
      phoneticGivenName = address.phoneticGivenName,
      subLocality = address.subLocality,
      subAdministrativeArea = address.subAdministrativeArea,
      country = address.country,
      _address$givenName = address.givenName,
      givenName = _address$givenName === void 0 ? "" : _address$givenName,
      _address$familyName = address.familyName,
      familyName = _address$familyName === void 0 ? "" : _address$familyName,
      data = __rest(address, ["phoneticFamilyName", "phoneticGivenName", "subLocality", "subAdministrativeArea", "country", "givenName", "familyName"]);
    result = _extends(_extends({}, data), {
      name: "".concat(givenName, " ").concat(familyName)
    });
  }
  // GooglePay
  if ("name" in address) {
    var sortingCode = address.sortingCode,
      _address$address = address.address1,
      address1 = _address$address === void 0 ? "" : _address$address,
      _address$address2 = address.address2,
      address2 = _address$address2 === void 0 ? "" : _address$address2,
      _address$address3 = address.address3,
      address3 = _address$address3 === void 0 ? "" : _address$address3,
      _data = __rest(address, ["sortingCode", "address1", "address2", "address3"]);
    result = _extends(_extends({}, _data), {
      emailAddress: email,
      addressLines: [address1, address2, address3].filter(function (address) {
        return address;
      })
    });
  }
  return result;
};
exports.buildAddress = buildAddress;
var buildPaymentAuthorizedResponse = function buildPaymentAuthorizedResponse(event, nonceResponse, requireShippingAddress) {
  var _a;
  var result = {};
  // ApplePay
  if ("token" in event) {
    if (event.billingContact) {
      result.billingAddress = (0, exports.buildAddress)(event.billingContact);
    }
    if (event.shippingContact) {
      var shippingAddress = (0, exports.buildAddress)(event.shippingContact);
      if (requireShippingAddress) {
        result.shippingAddress = shippingAddress;
      }
      if (result.billingAddress) {
        if (shippingAddress.emailAddress) {
          result.billingAddress.emailAddress = shippingAddress.emailAddress;
        }
        if (shippingAddress.phoneNumber) {
          result.billingAddress.phoneNumber = shippingAddress.phoneNumber;
        }
      }
    }
    result.source = "apple_pay" /* WalletType.ApplePay */;
  }
  // GooglePay
  if ("paymentMethodData" in event) {
    if (event.shippingAddress) {
      result.shippingAddress = (0, exports.buildAddress)(event.shippingAddress, event.email);
    }
    if ((_a = event.paymentMethodData.info) === null || _a === void 0 ? void 0 : _a.billingAddress) {
      result.billingAddress = (0, exports.buildAddress)(event.paymentMethodData.info.billingAddress, event.email);
    }
    result.source = "google_pay" /* WalletType.GooglePay */;
  }

  result.nonce = nonceResponse.nonce;
  return result;
};
exports.buildPaymentAuthorizedResponse = buildPaymentAuthorizedResponse;
var buildWalletNonceRequest = function buildWalletNonceRequest(event) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z;
  var result = {};
  // ApplePay
  if ("token" in event) {
    result = {
      applePayPaymentToken: event.token,
      zip: (_a = event.billingContact) === null || _a === void 0 ? void 0 : _a.postalCode,
      line1: ((_b = event.billingContact) === null || _b === void 0 ? void 0 : _b.addressLines) && ((_c = event.billingContact) === null || _c === void 0 ? void 0 : _c.addressLines[0]),
      line2: ((_d = event.billingContact) === null || _d === void 0 ? void 0 : _d.addressLines) && ((_e = event.billingContact) === null || _e === void 0 ? void 0 : _e.addressLines[1]),
      city: (_f = event.billingContact) === null || _f === void 0 ? void 0 : _f.locality,
      territory: (_g = event.billingContact) === null || _g === void 0 ? void 0 : _g.administrativeArea,
      countryCode: (_h = event.billingContact) === null || _h === void 0 ? void 0 : _h.countryCode,
      firstName: (_j = event.billingContact) === null || _j === void 0 ? void 0 : _j.givenName,
      lastName: (_k = event.billingContact) === null || _k === void 0 ? void 0 : _k.familyName
    };
  }
  // GooglePay
  if ("paymentMethodData" in event) {
    result = {
      googlePayPaymentToken: event.paymentMethodData,
      zip: (_m = (_l = event.paymentMethodData.info) === null || _l === void 0 ? void 0 : _l.billingAddress) === null || _m === void 0 ? void 0 : _m.postalCode,
      line1: (_p = (_o = event.paymentMethodData.info) === null || _o === void 0 ? void 0 : _o.billingAddress) === null || _p === void 0 ? void 0 : _p.address1,
      line2: (_r = (_q = event.paymentMethodData.info) === null || _q === void 0 ? void 0 : _q.billingAddress) === null || _r === void 0 ? void 0 : _r.address2,
      city: (_t = (_s = event.paymentMethodData.info) === null || _s === void 0 ? void 0 : _s.billingAddress) === null || _t === void 0 ? void 0 : _t.locality,
      territory: (_v = (_u = event.paymentMethodData.info) === null || _u === void 0 ? void 0 : _u.billingAddress) === null || _v === void 0 ? void 0 : _v.administrativeArea,
      countryCode: (_x = (_w = event.paymentMethodData.info) === null || _w === void 0 ? void 0 : _w.billingAddress) === null || _x === void 0 ? void 0 : _x.countryCode,
      firstName: (_z = (_y = event.paymentMethodData.info) === null || _y === void 0 ? void 0 : _y.billingAddress) === null || _z === void 0 ? void 0 : _z.name
    };
  }
  return result;
};
exports.buildWalletNonceRequest = buildWalletNonceRequest;

},{}],49:[function(require,module,exports){
"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw new Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw new Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var __createBinding = void 0 && (void 0).__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = {
      enumerable: true,
      get: function get() {
        return m[k];
      }
    };
  }
  Object.defineProperty(o, k2, desc);
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});
var __setModuleDefault = void 0 && (void 0).__setModuleDefault || (Object.create ? function (o, v) {
  Object.defineProperty(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});
var __importStar = void 0 && (void 0).__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
  __setModuleDefault(result, mod);
  return result;
};
var __awaiter = void 0 && (void 0).__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
Object.defineProperty(exports, "__esModule", {
  value: true
});
var constants = __importStar(require("../constants"));
var walletHelpers = __importStar(require("../helpers/wallet"));
var applePayHelpers = __importStar(require("../helpers/applepay"));
var common_1 = require("../helpers/common");
/**
 * ApplePay class for handling Apple Pay integration.
 */
var ApplePay = /*#__PURE__*/function () {
  function ApplePay(sharedService) {
    _classCallCheck(this, ApplePay);
    this.sharedService = sharedService;
    this.initialized = false;
    this.applePaySession = null;
  }
  /**
   * Initializes the ApplePay class.
   * @returns {Promise<void>} A promise that resolves when initialization is complete.
   */
  _createClass(ApplePay, [{
    key: "initialize",
    value: function initialize() {
      var _a, _b;
      return __awaiter(this, void 0, void 0, /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
        var walletRequest, applePaySession;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              if (!this.initialized) {
                _context.next = 2;
                break;
              }
              return _context.abrupt("return");
            case 2:
              _context.prev = 2;
              walletRequest = this.sharedService.getWalletRequest();
              if (!((_a = walletRequest.disableWallets) === null || _a === void 0 ? void 0 : _a.applePay)) {
                _context.next = 6;
                break;
              }
              return _context.abrupt("return");
            case 6:
              if (!(window.ApplePaySession && ApplePaySession.supportsVersion(constants.APPLEPAY_VERSION) && ApplePaySession.canMakePayments())) {
                _context.next = 13;
                break;
              }
              _context.next = 9;
              return this.sharedService.walletApi.validateApplePay({
                domainName: ((_b = window.top) === null || _b === void 0 ? void 0 : _b.location.hostname) || document.location.hostname,
                displayName: walletRequest.merchantName && walletRequest.merchantName.substring(0, 64)
              });
            case 9:
              applePaySession = _context.sent;
              if (!applePaySession) {
                _context.next = 13;
                break;
              }
              this.initialized = true;
              return _context.abrupt("return");
            case 13:
              _context.next = 18;
              break;
            case 15:
              _context.prev = 15;
              _context.t0 = _context["catch"](2);
              this.sharedService.handleError("APPLE_PAY" /* ErrorType.APPLE_PAY */, _context.t0);
            case 18:
            case "end":
              return _context.stop();
          }
        }, _callee, this, [[2, 15]]);
      }));
    }
    /**
     * Checks if Apple Pay is ready for use.
     * @returns {boolean} A boolean indicating if Apple Pay is ready.
     */
  }, {
    key: "isReady",
    value: function isReady() {
      return this.initialized;
    }
    /**
     * Creates a new ApplePay session.
     * @returns The created ApplePaySession instance.
     */
  }, {
    key: "buildSession",
    value: function buildSession() {
      var paymentRequest = applePayHelpers.buildPaymentRequest(this.sharedService.getWalletRequest());
      this.applePaySession = new ApplePaySession(constants.APPLEPAY_VERSION, paymentRequest);
      return this.applePaySession;
    }
    /**
     * Starts a new ApplePay session.
     * @param {WalletRequestUpdate} [walletRequest] - The wallet request update object.
     * @returns {void}
     */
  }, {
    key: "startSession",
    value: function startSession(walletRequest) {
      this.sharedService.updateWalletRequest(walletRequest || {}, "init_wallet" /* EventType.InitWallet */);
      this.handler();
    }
    /**
     * Aborts an active ApplePay session.
     * @returns {void}
     */
  }, {
    key: "abortSession",
    value: function abortSession() {
      if (!this.applePaySession) {
        return this.sharedService.handleError("APPLE_PAY" /* ErrorType.APPLE_PAY */, new Error("ApplePay session not found"));
      }
      try {
        this.applePaySession.abort();
        this.applePaySession = null;
      } catch (error) {
        this.sharedService.handleError("APPLE_PAY" /* ErrorType.APPLE_PAY */, error);
      }
    }
    /**
     * Adds ApplePay button DOM element to parent DOM element.
     * @param {ButtonOptions} [buttonOptions] - The button options object.
     * @param {ButtonOptions} [applePayButtonOptions] - The Apple Pay button options object.
     * @returns {void}
     */
  }, {
    key: "mount",
    value: function mount(buttonOptions, applePayButtonOptions) {
      var _this = this;
      var _a;
      var options = _extends(_extends({}, buttonOptions), applePayButtonOptions);
      var container = document.createElement("div");
      container.id = "applepay-button-container";
      var button = document.createElement("button");
      var type = options.type;
      if (options.type === "checkout") {
        type = "check-out";
      }
      button.setAttribute("type", "button");
      var color = !options.color || options.color === "default" ? "black" : options.color;
      button.style.setProperty("-webkit-appearance", "-apple-pay-button");
      button.style.setProperty("-apple-pay-button-type", type || "buy");
      button.style.setProperty("-apple-pay-button-style", color);
      button.style.setProperty("cursor", "pointer");
      button.setAttribute("lang", options.locale || "en");
      button.onclick = function () {
        if (!(options === null || options === void 0 ? void 0 : options.onClick)) {
          return _this.startSession();
        }
        options.onClick({
          source: "apple_pay" /* WalletType.ApplePay */
        });
      };

      container.appendChild(button);
      (0, common_1.setButtonProperties)(container, options);
      // attach Apple Pay button to wallet container
      (_a = this.sharedService.buttonsContainer) === null || _a === void 0 ? void 0 : _a.appendChild(container);
    }
    /**
     * ApplePay button on-click handler.
     * This method will open the Apple Pay payment sheet.
     * @returns {Promise<void>} A promise that resolves when the handler is complete.
     */
  }, {
    key: "handler",
    value: function handler() {
      var _this2 = this;
      var domainName = "online-order.godaddy.com";
      if (constants.DOMAIN_BLACKLIST.includes(domainName)) {
        return this.sharedService.handleError("WALLET" /* ErrorType.WALLET */, new Error(domainName + " is blacklisted. Please reach out GDP support."));
      }
      if (!window.ApplePaySession) {
        return this.sharedService.handleError("APPLE_PAY" /* ErrorType.APPLE_PAY */, new Error("ApplePay session not found"));
      }
      this.sharedService.processCallbacks("wallet_button_click" /* EventType.WalletButtonClick */, {
        source: "apple_pay" /* WalletType.ApplePay */
      });
      var session = this.buildSession();
      var walletRequest = this.sharedService.getWalletRequest();
      // Merchant website validation
      session.onvalidatemerchant = function (event) {
        _this2.sharedService.walletApi.validateApplePay({
          domainName: domainName,
          validationUrl: event.validationURL,
          displayName: walletRequest.merchantName && walletRequest.merchantName.substring(0, 64)
        }).then(function (applePaySession) {
          session.completeMerchantValidation(applePaySession);
        })["catch"](function (error) {
          _this2.sharedService.handleError("APPLE_PAY" /* ErrorType.APPLE_PAY */, error);
        });
      };
      // end Merchant Validation
      if (walletRequest.requireShippingAddress) {
        if (this.sharedService.listenerCallbacks["shipping_address_change" /* EventType.ShippingAddressChange */]) {
          session.onshippingcontactselected = function (event) {
            var updateWith = function updateWith(walletRequestUpdate) {
              _this2.sharedService.updateWalletRequest(walletRequestUpdate, "shipping_address_change" /* EventType.ShippingAddressChange */);
              session.completeShippingContactSelection({
                newTotal: applePayHelpers.buildTotal(walletRequest),
                newLineItems: applePayHelpers.buildLineItems(walletRequest),
                newShippingMethods: applePayHelpers.buildShippingMethods(walletRequest),
                errors: applePayHelpers.buildErrors(walletRequest)
              });
            };
            _this2.sharedService.processCallbacks("shipping_address_change" /* EventType.ShippingAddressChange */, _extends(_extends({}, walletHelpers.buildShippingAddressResponse(event.shippingContact)), {
              updateWith: updateWith
            }));
          };
        }
        if (this.sharedService.listenerCallbacks["shipping_method_change" /* EventType.ShippingMethodChange */]) {
          session.onshippingmethodselected = function (event) {
            var updateWith = function updateWith(walletRequestUpdate) {
              _this2.sharedService.updateWalletRequest(walletRequestUpdate, "shipping_method_change" /* EventType.ShippingMethodChange */);
              session.completeShippingMethodSelection({
                newTotal: applePayHelpers.buildTotal(walletRequest),
                newLineItems: applePayHelpers.buildLineItems(walletRequest)
              });
            };
            _this2.sharedService.processCallbacks("shipping_method_change" /* EventType.ShippingMethodChange */, _extends(_extends({}, walletHelpers.buildShippingMethodResponse(event.shippingMethod, walletRequest.shippingMethods)), {
              updateWith: updateWith
            }));
          };
        }
      }
      if (this.sharedService.listenerCallbacks["payment_method_change" /* EventType.PaymentMethodChange */]) {
        session.onpaymentmethodselected = function (event) {
          var updateWith = function updateWith(walletRequestUpdate) {
            _this2.sharedService.updateWalletRequest(walletRequestUpdate, "payment_method_change" /* EventType.PaymentMethodChange */);
            session.completePaymentMethodSelection({
              newTotal: applePayHelpers.buildTotal(walletRequest),
              newLineItems: applePayHelpers.buildLineItems(walletRequest)
            });
          };
          _this2.sharedService.processCallbacks("payment_method_change" /* EventType.PaymentMethodChange */, _extends(_extends({}, event), {
            updateWith: updateWith
          }));
        };
      }
      if (this.sharedService.listenerCallbacks["payment_authorized" /* EventType.PaymentAuthorized */]) {
        session.onpaymentauthorized = function (event) {
          var complete = function complete(walletRequestUpdate) {
            _this2.sharedService.updateWalletRequest(walletRequestUpdate || {}, "payment_authorized" /* EventType.PaymentAuthorized */);
            var errors = applePayHelpers.buildErrors(walletRequest);
            var status = errors ? ApplePaySession.STATUS_FAILURE : ApplePaySession.STATUS_SUCCESS;
            session.completePayment({
              status: status,
              errors: errors
            });
          };
          _this2.sharedService.walletApi.getWalletNonce(walletHelpers.buildWalletNonceRequest(event.payment)).then(function (nonceResponse) {
            _this2.sharedService.processCallbacks("payment_authorized" /* EventType.PaymentAuthorized */, _extends(_extends({}, walletHelpers.buildPaymentAuthorizedResponse(event.payment, nonceResponse, walletRequest.requireShippingAddress)), {
              complete: complete
            }));
          })["catch"](function (error) {
            _this2.sharedService.handleError("APPLE_PAY_NONCE" /* ErrorType.APPLE_PAY_NONCE */, error);
            session.completePayment({
              status: ApplePaySession.STATUS_FAILURE,
              errors: applePayHelpers.buildWalletNonceError(error)
            });
          });
        };
      }
      if (this.sharedService.listenerCallbacks["close_wallet" /* EventType.CloseWallet */]) {
        session.oncancel = function (event) {
          _this2.sharedService.processCallbacks("close_wallet" /* EventType.CloseWallet */, event);
        };
      }
      if (walletRequest.supportCouponCode && this.sharedService.listenerCallbacks["coupon_code_change" /* EventType.CouponCodeChange */]) {
        session.oncouponcodechanged = function (event) {
          var updateWith = function updateWith(walletRequestUpdate) {
            _this2.sharedService.updateWalletRequest(walletRequestUpdate, "coupon_code_change" /* EventType.CouponCodeChange */);
            session.completeCouponCodeChange({
              newTotal: applePayHelpers.buildTotal(walletRequest),
              newLineItems: applePayHelpers.buildLineItems(walletRequest),
              newShippingMethods: applePayHelpers.buildShippingMethods(walletRequest),
              errors: applePayHelpers.buildErrors(walletRequest)
            });
          };
          _this2.sharedService.processCallbacks("coupon_code_change" /* EventType.CouponCodeChange */, _extends(_extends({}, walletHelpers.buildCouponCodeResponse(event.couponCode)), {
            updateWith: updateWith
          }));
        };
      }
      session.begin();
    }
  }]);
  return ApplePay;
}();
exports["default"] = ApplePay;

},{"../constants":41,"../helpers/applepay":42,"../helpers/common":44,"../helpers/wallet":48}],50:[function(require,module,exports){
"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw new Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw new Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var __awaiter = void 0 && (void 0).__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
Object.defineProperty(exports, "__esModule", {
  value: true
});
var card_on_file_1 = require("../helpers/card-on-file");
/**
 * CardOnFile class for handling card on file integration.
 */
var CardOnFile = /*#__PURE__*/function () {
  function CardOnFile(sharedService) {
    _classCallCheck(this, CardOnFile);
    this.sharedService = sharedService;
    this.cardAgreementData = null;
  }
  /**
   * Mounts the card agreement component to the DOM.
   *
   * @param {Locale} locale - The locale for the card agreement.
   * @param {boolean} hideActionButtons - Determines whether to hide the action buttons.
   * @param {CardAgreementOptions} options - Additional options for the card agreement.
   * @returns {Promise<void>} A promise that resolves when the card agreement is mounted.
   */
  _createClass(CardOnFile, [{
    key: "mount",
    value: function mount(locale, hideActionButtons, options) {
      return __awaiter(this, void 0, void 0, /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
        var _this = this;
        var actionHandler, agreement;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              actionHandler = function actionHandler(value) {
                return function () {
                  var _a;
                  _this.sharedService.postIFrameMessage({
                    type: "card_on_file_set_flag" /* EventType.CardOnFileSetFlag */,
                    options: {
                      value: value
                    }
                  });
                  var container = (_a = _this.cardAgreementData) === null || _a === void 0 ? void 0 : _a.container;
                  if (container && document.body.contains(container)) {
                    document.body.removeChild(container);
                  }
                };
              };
              _context.next = 4;
              return (0, card_on_file_1.getCardAgreement)(locale, hideActionButtons, options, actionHandler(true), actionHandler(false));
            case 4:
              agreement = _context.sent;
              this.cardAgreementData = agreement;
              this.sharedService.on("card_on_file_show_agreement" /* EventType.CardOnFileShowAgreement */, function () {
                var _a;
                if ((_a = _this.cardAgreementData) === null || _a === void 0 ? void 0 : _a.container) {
                  document.body.appendChild(_this.cardAgreementData.container);
                }
              });
              _context.next = 12;
              break;
            case 9:
              _context.prev = 9;
              _context.t0 = _context["catch"](0);
              this.sharedService.handleError("CARD_ON_FILE" /* ErrorType.CARD_ON_FILE */, _context.t0);
            case 12:
              ;
            case 13:
            case "end":
              return _context.stop();
          }
        }, _callee, this, [[0, 9]]);
      }));
    }
    /**
     * Unmounts the card agreement component from the DOM.
     * @returns {void}
     */
  }, {
    key: "unmount",
    value: function unmount() {
      if (this.cardAgreementData) {
        if (document.body.contains(this.cardAgreementData.container)) {
          document.body.removeChild(this.cardAgreementData.container);
        }
        this.sharedService.off("card_on_file_show_agreement" /* EventType.CardOnFileShowAgreement */);
        this.cardAgreementData = null;
      }
    }
  }]);
  return CardOnFile;
}();
exports["default"] = CardOnFile;

},{"../helpers/card-on-file":43}],51:[function(require,module,exports){
"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw new Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw new Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var __createBinding = void 0 && (void 0).__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = {
      enumerable: true,
      get: function get() {
        return m[k];
      }
    };
  }
  Object.defineProperty(o, k2, desc);
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});
var __setModuleDefault = void 0 && (void 0).__setModuleDefault || (Object.create ? function (o, v) {
  Object.defineProperty(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});
var __importStar = void 0 && (void 0).__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
  __setModuleDefault(result, mod);
  return result;
};
var __awaiter = void 0 && (void 0).__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
Object.defineProperty(exports, "__esModule", {
  value: true
});
var constants = __importStar(require("../constants"));
var walletHelpers = __importStar(require("../helpers/wallet"));
var googlePayHelpers = __importStar(require("../helpers/googlepay"));
var common_1 = require("../helpers/common");
/**
 * GooglePay class for handling Google Pay integration.
 */
var GooglePay = /*#__PURE__*/function () {
  function GooglePay(sharedService) {
    var _this = this;
    _classCallCheck(this, GooglePay);
    this.sharedService = sharedService;
    /**
     * Wrapper over updateWith method, which will be called by the library consumer
     *
     * Implements Hight Order Function pattern
     *
     * @param {GooglePayJS.CallbackTrigger} callbackTrigger - The Google Pay callback trigger.
     * @param {(value: GooglePayJS.PaymentDataRequestUpdate) => void} resolve - The resolve function.
     * @returns {Function} Callback function.
     */
    this.updateWithWrapper = function (callbackTrigger, resolve) {
      var callbackIntent = constants.GOOGLE_PAY_INTENT_MAP[callbackTrigger];
      var eventType = constants.GOOGLE_PAY_EVENT_MAP[callbackTrigger];
      return function (walletRequestUpdate) {
        _this.sharedService.updateWalletRequest(walletRequestUpdate, eventType);
        var walletRequest = _this.sharedService.getWalletRequest();
        var update = {};
        var transactionInfo = googlePayHelpers.buildTransactionInfo(walletRequest);
        var error = googlePayHelpers.buildError(walletRequest, callbackIntent);
        if (transactionInfo) {
          update.newTransactionInfo = transactionInfo;
        }
        if (error) {
          update.error = error;
        }
        // updating shipping options is not allowed if the data change event was 
        // triggered by changing the shipping option on the payment sheet by the customer
        if (walletRequest.requireShippingAddress && callbackTrigger !== "SHIPPING_OPTION" /* googlePayEnums.CallbackType.SHIPPING_OPTION */) {
          update.newShippingOptionParameters = googlePayHelpers.buildShippingMethods(walletRequest);
        }
        if (callbackTrigger === "OFFER" /* googlePayEnums.CallbackType.OFFER */) {
          update.newOfferInfo = googlePayHelpers.buildOfferInfo(walletRequest);
        }
        resolve(update);
      };
    };
    /**
     * Wrapper over complete method, which will be called by the library consumer
     *
     * Implements Hight Order Function pattern
     *
     * @param {(value: GooglePayJS.PaymentAuthorizationResult) => void} resolve - The resolve function.
     * @returns {Function} Callback function.
     */
    this.completeWrapper = function (resolve) {
      return function (walletRequestUpdate) {
        _this.sharedService.updateWalletRequest(walletRequestUpdate || {}, "payment_authorized" /* EventType.PaymentAuthorized */);
        var walletRequest = _this.sharedService.getWalletRequest();
        var error = googlePayHelpers.buildError(walletRequest, "PAYMENT_AUTHORIZATION" /* googlePayEnums.CallbackType.PAYMENT_AUTHORIZATION */);
        resolve({
          transactionState: error ? "ERROR" : "SUCCESS",
          error: error
        });
      };
    };
    /**
     * Event handler for the payment data changed event in Google Pay.
     * @param {GooglePayJS.IntermediatePaymentData} intermediatePaymentData - The intermediate payment data.
     * @returns {Promise<GooglePayJS.PaymentDataRequestUpdate>} A promise that resolves with the payment data request update.
     */
    this.googlePayPaymentDataChangedHandler = function (intermediatePaymentData) {
      return new Promise(function (resolve) {
        var _a;
        var callbackTrigger = intermediatePaymentData.callbackTrigger;
        var callbackIntent = constants.GOOGLE_PAY_INTENT_MAP[callbackTrigger];
        var eventType = constants.GOOGLE_PAY_EVENT_MAP[callbackTrigger];
        var updateWith = _this.updateWithWrapper(callbackTrigger, resolve);
        var walletRequest = _this.sharedService.getWalletRequest();
        if (callbackTrigger === "INITIALIZE" /* googlePayEnums.CallbackType.INITIALIZE */ && !walletRequest.requireShippingAddress) {
          return resolve({});
        }
        if (!_this.sharedService.listenerCallbacks[eventType]) {
          return resolve({
            error: googlePayHelpers.buildMissedHandlerError(eventType, callbackIntent)
          });
        }
        if (callbackIntent === "SHIPPING_OPTION" /* googlePayEnums.CallbackType.SHIPPING_OPTION */ && intermediatePaymentData.shippingOptionData) {
          return _this.sharedService.processCallbacks("shipping_method_change" /* EventType.ShippingMethodChange */, _extends(_extends({}, walletHelpers.buildShippingMethodResponse(intermediatePaymentData.shippingOptionData, walletRequest.shippingMethods)), {
            updateWith: updateWith
          }));
        }
        if (callbackIntent === "SHIPPING_ADDRESS" /* googlePayEnums.CallbackType.SHIPPING_ADDRESS */ && intermediatePaymentData.shippingAddress) {
          return _this.sharedService.processCallbacks("shipping_address_change" /* EventType.ShippingAddressChange */, _extends(_extends({}, walletHelpers.buildShippingAddressResponse(intermediatePaymentData.shippingAddress)), {
            updateWith: updateWith
          }));
        }
        if (callbackIntent === "OFFER" /* googlePayEnums.CallbackType.OFFER */ && ((_a = intermediatePaymentData.offerData) === null || _a === void 0 ? void 0 : _a.redemptionCodes)) {
          // for backwards compatibility with Apple Pay, we don't support more than 1 coupon code
          if (intermediatePaymentData.offerData.redemptionCodes.length > 1) {
            return resolve({
              newOfferInfo: googlePayHelpers.buildOfferInfo(walletRequest),
              error: googlePayHelpers.buildDuplicateCouponCodeError(callbackIntent)
            });
          }
          return _this.sharedService.processCallbacks("coupon_code_change" /* EventType.CouponCodeChange */, _extends(_extends({}, walletHelpers.buildCouponCodeResponse(intermediatePaymentData.offerData.redemptionCodes)), {
            updateWith: updateWith
          }));
        }
        //Should never happen
        var error = googlePayHelpers.buildPaymentDataChangedHandlerError(callbackTrigger);
        _this.sharedService.handleError("GOOGLE_PAY" /* ErrorType.GOOGLE_PAY */, error);
        resolve({
          error: error
        });
      });
    };
    /**
     * Event handler for the payment authorized event in Google Pay.
     * @param {GooglePayJS.PaymentData} paymentData - The payment data.
     * @returns {Promise<GooglePayJS.PaymentAuthorizationResult>} A promise that resolves with the payment authorization result.
     */
    this.googlePayPaymentAuthorizedHandler = function (paymentData) {
      return new Promise(function (resolve) {
        var complete = _this.completeWrapper(resolve);
        if (!_this.sharedService.listenerCallbacks["payment_authorized" /* EventType.PaymentAuthorized */]) {
          return resolve({
            transactionState: "ERROR",
            error: googlePayHelpers.buildMissedHandlerError("payment_authorized" /* EventType.PaymentAuthorized */, "PAYMENT_AUTHORIZATION" /* googlePayEnums.CallbackType.PAYMENT_AUTHORIZATION */)
          });
        }

        _this.sharedService.walletApi.getWalletNonce(walletHelpers.buildWalletNonceRequest(paymentData)).then(function (nonceResponse) {
          _this.sharedService.processCallbacks("payment_authorized" /* EventType.PaymentAuthorized */, _extends(_extends({}, walletHelpers.buildPaymentAuthorizedResponse(paymentData, nonceResponse)), {
            complete: complete
          }));
        })["catch"](function (error) {
          _this.sharedService.handleError("GOOGLE_PAY_NONCE" /* ErrorType.GOOGLE_PAY_NONCE */, error);
          resolve({
            transactionState: "ERROR",
            error: googlePayHelpers.buildWalletNonceError("PAYMENT_AUTHORIZATION" /* googlePayEnums.CallbackType.PAYMENT_AUTHORIZATION */, error)
          });
        });
      });
    };
    this.initialized = false;
    this.paymentsClient = null;
    this.googlePayValidationPayload = null;
  }
  /**
   * Initializes the GooglePay class.
   * @returns {Promise<void>} A promise that resolves when initialization is complete.
   */
  _createClass(GooglePay, [{
    key: "initialize",
    value: function initialize() {
      var _a, _b, _c, _d;
      return __awaiter(this, void 0, void 0, /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
        var walletRequest, googlePayValidationPayload, paymentsClient, isReadyToPay;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              if (!this.initialized) {
                _context.next = 2;
                break;
              }
              return _context.abrupt("return");
            case 2:
              _context.prev = 2;
              walletRequest = this.sharedService.getWalletRequest();
              if (!((_a = walletRequest.disableWallets) === null || _a === void 0 ? void 0 : _a.googlePay)) {
                _context.next = 6;
                break;
              }
              return _context.abrupt("return");
            case 6:
              _context.next = 8;
              return (0, common_1.loadScript)(constants.GOOGLEPAY_SCRIPT_URL);
            case 8:
              if (!((_c = (_b = window.google) === null || _b === void 0 ? void 0 : _b.payments) === null || _c === void 0 ? void 0 : _c.api)) {
                _context.next = 22;
                break;
              }
              _context.next = 11;
              return this.sharedService.walletApi.validateGooglePay({
                domain: ((_d = window.top) === null || _d === void 0 ? void 0 : _d.location.hostname) || document.location.hostname
              });
            case 11:
              googlePayValidationPayload = _context.sent;
              if (!(googlePayValidationPayload.authJwt && googlePayValidationPayload.googleEnvironment)) {
                _context.next = 22;
                break;
              }
              paymentsClient = this.buildPaymentsClient(walletRequest, googlePayValidationPayload.googleEnvironment);
              _context.next = 16;
              return paymentsClient.isReadyToPay({
                apiVersion: constants.GOOGLEPAY_VERSION,
                apiVersionMinor: constants.GOOGLEPAY_VERSION_MINOR,
                allowedPaymentMethods: [googlePayHelpers.getBaseCardPaymentMethod(walletRequest)],
                existingPaymentMethodRequired: false
              });
            case 16:
              isReadyToPay = _context.sent;
              if (!isReadyToPay.result) {
                _context.next = 22;
                break;
              }
              this.initialized = true;
              this.paymentsClient = paymentsClient;
              this.googlePayValidationPayload = googlePayValidationPayload;
              return _context.abrupt("return");
            case 22:
              _context.next = 27;
              break;
            case 24:
              _context.prev = 24;
              _context.t0 = _context["catch"](2);
              this.sharedService.handleError("GOOGLE_PAY" /* ErrorType.GOOGLE_PAY */, _context.t0);
            case 27:
            case "end":
              return _context.stop();
          }
        }, _callee, this, [[2, 24]]);
      }));
    }
    /**
     * Checks if Google Pay is ready for use.
     * @returns {boolean} A boolean indicating if Google Pay is ready.
     */
  }, {
    key: "isReady",
    value: function isReady() {
      return this.initialized;
    }
    /**
     * Creates a new GooglePay Payments Client.
     * @param {WalletRequest} walletRequest - The wallet request object.
     * @param {GooglePayJS.Environment} googleEnvironment - The Google Pay environment.
     * @returns {GooglePayJS.PaymentsClient} The created PaymentsClient instance.
     */
  }, {
    key: "buildPaymentsClient",
    value: function buildPaymentsClient(walletRequest, googleEnvironment) {
      var paymentDataCallbacks = {
        onPaymentAuthorized: this.googlePayPaymentAuthorizedHandler
      };
      if (walletRequest.requireShippingAddress || walletRequest.supportCouponCode) {
        paymentDataCallbacks.onPaymentDataChanged = this.googlePayPaymentDataChangedHandler;
      }
      var paymentsClient = new window.google.payments.api.PaymentsClient({
        environment: googleEnvironment,
        merchantInfo: {
          merchantName: walletRequest.merchantName,
          merchantId: constants.GOOGLEPAY_MERCHANT_ID
        },
        paymentDataCallbacks: paymentDataCallbacks
      });
      return paymentsClient;
    }
    /**
     * Starts a new GooglePay session.
     * @param {WalletRequestUpdate} [walletRequest] - The wallet request update object.
     * @returns {void}
     */
  }, {
    key: "startSession",
    value: function startSession(walletRequest) {
      this.sharedService.updateWalletRequest(walletRequest || {}, "init_wallet" /* EventType.InitWallet */);
      this.handler();
    }
    /**
     * Adds GooglePay button DOM element to parent DOM element.
     * @param {ButtonOptions} [buttonOptions] - The button options object.
     * @param {ButtonOptions} [googlePayButtonOptions] - The Google Pay button options object.
     * @returns {void}
     */
  }, {
    key: "mount",
    value: function mount(buttonOptions, googlePayButtonOptions) {
      var _this2 = this;
      var _a;
      var options = _extends(_extends({}, buttonOptions), googlePayButtonOptions);
      try {
        if (this.paymentsClient) {
          var container = this.paymentsClient.createButton({
            buttonColor: options === null || options === void 0 ? void 0 : options.color,
            buttonType: options === null || options === void 0 ? void 0 : options.type,
            buttonSizeMode: "fill",
            buttonLocale: options === null || options === void 0 ? void 0 : options.locale,
            allowedPaymentMethods: [googlePayHelpers.getBaseCardPaymentMethod(this.sharedService.getWalletRequest())],
            onClick: function onClick() {
              if (!(options === null || options === void 0 ? void 0 : options.onClick)) {
                return _this2.startSession();
              }
              options.onClick({
                source: "google_pay" /* WalletType.GooglePay */
              });
            }
          });

          container.id = "googlepay-button-container";
          (0, common_1.setButtonProperties)(container, options);
          // attach Google Pay button to wallet container
          (_a = this.sharedService.buttonsContainer) === null || _a === void 0 ? void 0 : _a.appendChild(container);
        }
      } catch (error) {
        this.sharedService.handleError("GOOGLE_PAY" /* ErrorType.GOOGLE_PAY */, error);
      }
    }
    /**
     * GooglePay button on-click handler.
     * This method will open the Google Pay payment sheet.
     * @returns {Promise<void>} A promise that resolves when the handler is complete.
     */
  }, {
    key: "handler",
    value: function handler() {
      var _a;
      return __awaiter(this, void 0, void 0, /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
        var domainName, paymentRequest, parsedError;
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              domainName = "online-order.godaddy.com";
              if (!constants.DOMAIN_BLACKLIST.includes(domainName)) {
                _context2.next = 3;
                break;
              }
              return _context2.abrupt("return", this.sharedService.handleError("WALLET" /* ErrorType.WALLET */, new Error(domainName + " is blacklisted. Please reach out GDP support.")));
            case 3:
              if (this.paymentsClient) {
                _context2.next = 5;
                break;
              }
              return _context2.abrupt("return", this.sharedService.handleError("GOOGLE_PAY" /* ErrorType.GOOGLE_PAY */, new Error("GooglePay payments client not found")));
            case 5:
              if ((_a = this.googlePayValidationPayload) === null || _a === void 0 ? void 0 : _a.authJwt) {
                _context2.next = 7;
                break;
              }
              return _context2.abrupt("return", this.sharedService.handleError("GOOGLE_PAY" /* ErrorType.GOOGLE_PAY */, new Error("GooglePay auth JWT token not found")));
            case 7:
              this.sharedService.processCallbacks("wallet_button_click" /* EventType.WalletButtonClick */, {
                source: "google_pay" /* WalletType.GooglePay */
              });
              paymentRequest = googlePayHelpers.buildPaymentRequest(this.sharedService.getWalletRequest(), this.sharedService.businessId, this.googlePayValidationPayload.authJwt);
              _context2.prev = 9;
              _context2.next = 12;
              return this.paymentsClient.loadPaymentData(paymentRequest);
            case 12:
              _context2.next = 19;
              break;
            case 14:
              _context2.prev = 14;
              _context2.t0 = _context2["catch"](9);
              parsedError = this.sharedService.parseError("GOOGLE_PAY" /* ErrorType.GOOGLE_PAY */, _context2.t0);
              this.sharedService.trackError(parsedError);
              this.sharedService.processCallbacks("close_wallet" /* EventType.CloseWallet */, {
                reason: parsedError.message
              });
            case 19:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this, [[9, 14]]);
      }));
    }
  }]);
  return GooglePay;
}();
exports["default"] = GooglePay;

},{"../constants":41,"../helpers/common":44,"../helpers/googlepay":45,"../helpers/wallet":48}],52:[function(require,module,exports){
"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw new Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw new Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var __createBinding = void 0 && (void 0).__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = {
      enumerable: true,
      get: function get() {
        return m[k];
      }
    };
  }
  Object.defineProperty(o, k2, desc);
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});
var __setModuleDefault = void 0 && (void 0).__setModuleDefault || (Object.create ? function (o, v) {
  Object.defineProperty(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});
var __importStar = void 0 && (void 0).__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
  __setModuleDefault(result, mod);
  return result;
};
var __awaiter = void 0 && (void 0).__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};
Object.defineProperty(exports, "__esModule", {
  value: true
});
var uuid_1 = require("uuid");
var jwt_decode_1 = __importDefault(require("jwt-decode"));
var constants = __importStar(require("../constants"));
var common_1 = require("../helpers/common");
var paze_1 = require("../helpers/paze");
var Paze = /*#__PURE__*/function () {
  function Paze(sharedService) {
    _classCallCheck(this, Paze);
    this.sharedService = sharedService;
    this.initialized = false;
  }
  /**
   * Initializes the Paze class.
   * @param {emailAddress} [emailAddress] - Customer's email address:
   * 1. If passed we will check if the email address is registered with Paze and will not initialize the Paze wallet if it is not.
   * 2. If not passed, no checks will be performed and Paze will be initialized after successful script loading.
   * @returns {Promise<void>} A promise that resolves when initialization is complete.
   */
  _createClass(Paze, [{
    key: "initialize",
    value: function initialize(emailAddress) {
      var _a;
      return __awaiter(this, void 0, void 0, /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
        var walletRequest, options, canCheckout;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              if (!this.initialized) {
                _context.next = 2;
                break;
              }
              return _context.abrupt("return");
            case 2:
              _context.prev = 2;
              walletRequest = this.sharedService.getWalletRequest();
              if (!((_a = walletRequest.disableWallets) === null || _a === void 0 ? void 0 : _a.paze)) {
                _context.next = 6;
                break;
              }
              return _context.abrupt("return");
            case 6:
              _context.next = 8;
              return (0, common_1.loadScript)((0, paze_1.getPazeScriptUrl)());
            case 8:
              if (window.DIGITAL_WALLET_SDK) {
                _context.next = 10;
                break;
              }
              throw new Error("Paze Wallet API is not available");
            case 10:
              options = {
                client: {
                  id: "46VM0VIBJ63520UZ7X6U14L-0rahMJIVUiE1MgKLDdBgyTXkE" || "",
                  name: walletRequest.merchantName,
                  profileId: "GoDaddy" || undefined
                }
              };
              _context.next = 13;
              return window.DIGITAL_WALLET_SDK.initialize(options);
            case 13:
              if (emailAddress) {
                _context.next = 16;
                break;
              }
              this.initialized = true;
              return _context.abrupt("return");
            case 16:
              _context.next = 18;
              return window.DIGITAL_WALLET_SDK.canCheckout({
                emailAddress: emailAddress
              });
            case 18:
              canCheckout = _context.sent;
              if (!canCheckout.consumerPresent) {
                _context.next = 23;
                break;
              }
              this.emailAddress = emailAddress;
              this.initialized = true;
              return _context.abrupt("return");
            case 23:
              _context.next = 28;
              break;
            case 25:
              _context.prev = 25;
              _context.t0 = _context["catch"](2);
              this.sharedService.handleError("PAZE" /* ErrorType.PAZE */, _context.t0);
            case 28:
            case "end":
              return _context.stop();
          }
        }, _callee, this, [[2, 25]]);
      }));
    }
  }, {
    key: "isReady",
    value:
    /**
     * Checks if Paze Wallet is ready for use.
     * @returns {boolean} A boolean indicating if Paze Wallet is ready.
     */
    function isReady() {
      return this.initialized;
    }
    /**
     * Starts a new Paze session.
     * @param {WalletRequestUpdate} [walletRequest] - The wallet request update object.
     * @returns {void}
     */
  }, {
    key: "startSession",
    value: function startSession(walletRequest) {
      this.sharedService.updateWalletRequest(walletRequest || {}, "init_wallet" /* EventType.InitWallet */);
      this.handler();
    }
    /**
     * Adds Paze button DOM element to parent DOM element.
     * @param {ButtonOptions} [buttonOptions] - The button options object.
     * @param {ButtonOptions} [pazeButtonOptions] - The Apple Pay button options object.
     * @returns {void}
     */
  }, {
    key: "mount",
    value: function mount(buttonOptions, pazeButtonOptions) {
      var _this = this;
      var _a;
      var options = _extends(_extends({}, buttonOptions), pazeButtonOptions);
      var container = document.createElement("div");
      container.id = "pazewallet-button-container";
      var button = document.createElement("button");
      if (options.color === "white") {
        button.style.setProperty("background-color", "#FFFFFF");
        button.style.setProperty("background-image", "url(".concat(constants.ASSETS_CDN_URL, "paze-logo-blue.svg)"));
      } else {
        button.style.setProperty("background-image", "url(".concat(constants.ASSETS_CDN_URL, "paze-logo-white.svg)"));
        button.style.setProperty("background-color", options.color === "black" ? "#151B33" : "#0F42F8");
      }
      button.style.setProperty("background-position", "center");
      button.style.setProperty("background-repeat", "no-repeat");
      button.onclick = function () {
        if (!options.onClick) {
          return _this.startSession();
        }
        options.onClick({
          source: "paze" /* WalletType.Paze */
        });
      };

      container.appendChild(button);
      (0, common_1.setButtonProperties)(container, options);
      // attach Paze Wallet button to wallet container
      (_a = this.sharedService.buttonsContainer) === null || _a === void 0 ? void 0 : _a.appendChild(container);
    }
    /**
     * Paze error handler.
     * @param {ErrorType} [type] - The error type.
     * @param {any} [originalError] - The error object.
     * This method will parse the error, track it, and process the close_wallet event.
     * @returns {void}
     */
  }, {
    key: "handleError",
    value: function handleError(type, originalError) {
      var parsedError = this.sharedService.parseError(type, originalError);
      this.sharedService.trackError(parsedError);
      this.sharedService.processCallbacks("close_wallet" /* EventType.CloseWallet */, {
        source: "paze" /* WalletType.Paze */,
        error: parsedError
      });
    }
    /**
     * Paze button on-click handler.
     * This method will open the Paze Wallet payment sheet.
     * @returns {Promise<void>} A promise that resolves when the handler is complete.
     */
  }, {
    key: "handler",
    value: function handler() {
      var _a;
      return __awaiter(this, void 0, void 0, /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
        var _this2 = this;
        var domainName, pazeSessionId, walletRequest, checkoutRequest, checkoutResult, decodedCheckoutResult, completeRequest, completeResult, nonceResponse, complete;
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              this.sharedService.processCallbacks("wallet_button_click" /* EventType.WalletButtonClick */, {
                source: "paze" /* WalletType.Paze */
              });
              domainName = ((_a = window.top) === null || _a === void 0 ? void 0 : _a.location.hostname) || document.location.hostname;
              if (!constants.DOMAIN_BLACKLIST.includes(domainName)) {
                _context2.next = 4;
                break;
              }
              return _context2.abrupt("return", this.handleError("WALLET" /* ErrorType.WALLET */, new Error(domainName + " is blacklisted. Please reach out GDP support.")));
            case 4:
              if (this.initialized) {
                _context2.next = 6;
                break;
              }
              return _context2.abrupt("return", this.handleError("PAZE" /* ErrorType.PAZE */, new Error("Paze Wallet is not initialized")));
            case 6:
              _context2.prev = 6;
              pazeSessionId = (0, uuid_1.v4)();
              walletRequest = this.sharedService.getWalletRequest();
              checkoutRequest = (0, paze_1.buildCheckoutRequest)(walletRequest, pazeSessionId, this.emailAddress);
              _context2.next = 12;
              return window.DIGITAL_WALLET_SDK.checkout(checkoutRequest);
            case 12:
              checkoutResult = _context2.sent;
              if (!(checkoutResult.result !== "COMPLETE" /* CheckoutResponseResult.COMPLETE */ || !checkoutResult.checkoutResponse)) {
                _context2.next = 15;
                break;
              }
              return _context2.abrupt("return", this.sharedService.processCallbacks("close_wallet" /* EventType.CloseWallet */, {
                source: "paze" /* WalletType.Paze */
              }));
            case 15:
              decodedCheckoutResult = (0, jwt_decode_1["default"])(checkoutResult.checkoutResponse);
              completeRequest = (0, paze_1.buildCompleteRequest)(walletRequest, pazeSessionId);
              _context2.next = 19;
              return window.DIGITAL_WALLET_SDK.complete(completeRequest);
            case 19:
              completeResult = _context2.sent;
              _context2.prev = 20;
              _context2.next = 23;
              return this.sharedService.walletApi.getWalletNonce((0, paze_1.buildWalletNonceRequest)(decodedCheckoutResult, completeResult, pazeSessionId));
            case 23:
              nonceResponse = _context2.sent;
              complete = function complete(walletRequestUpdate) {
                _this2.sharedService.updateWalletRequest(walletRequestUpdate || {}, "payment_authorized" /* EventType.PaymentAuthorized */);
              };

              this.sharedService.processCallbacks("payment_authorized" /* EventType.PaymentAuthorized */, _extends(_extends({}, (0, paze_1.buildPaymentAuthorizedResponse)(decodedCheckoutResult, nonceResponse)), {
                complete: complete
              }));
              _context2.next = 31;
              break;
            case 28:
              _context2.prev = 28;
              _context2.t0 = _context2["catch"](20);
              return _context2.abrupt("return", this.handleError("PAZE_NONCE" /* ErrorType.PAZE_NONCE */, _context2.t0));
            case 31:
              _context2.next = 36;
              break;
            case 33:
              _context2.prev = 33;
              _context2.t1 = _context2["catch"](6);
              return _context2.abrupt("return", this.handleError("PAZE" /* ErrorType.PAZE */, _context2.t1));
            case 36:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this, [[6, 33], [20, 28]]);
      }));
    }
  }]);
  return Paze;
}();
exports["default"] = Paze;
;

},{"../constants":41,"../helpers/common":44,"../helpers/paze":47,"jwt-decode":11,"uuid":22}],53:[function(require,module,exports){
"use strict";

function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var __createBinding = void 0 && (void 0).__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = {
      enumerable: true,
      get: function get() {
        return m[k];
      }
    };
  }
  Object.defineProperty(o, k2, desc);
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});
var __setModuleDefault = void 0 && (void 0).__setModuleDefault || (Object.create ? function (o, v) {
  Object.defineProperty(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});
var __importStar = void 0 && (void 0).__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
  __setModuleDefault(result, mod);
  return result;
};
var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};
Object.defineProperty(exports, "__esModule", {
  value: true
});
var uuid_1 = require("uuid");
var wallet_api_1 = __importDefault(require("../services/wallet-api"));
var helpers = __importStar(require("../helpers/common"));
/**
 * Shared class that serves as a stateful service, managing the state of the application.
 * It also contains shared properties and methods that different services can use:
 * 1. iFrame: get state, mount, unmount, post messages
 * 2. Wallet buttons container: get state, mount, unmount
 * 3. Wallet request: get state, create, update
 * 4. Error handling: method to handle different type of errors
 * 5. Wallet API service: send of wallet-related requests, such as validation and nonce generation
 * @class
 */
var Shared = /*#__PURE__*/function () {
  function Shared(businessId, applicationId) {
    var _this = this;
    var walletRequest = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : helpers.createDefaultWalletRequest();
    _classCallCheck(this, Shared);
    /**
     * Creates a message channel for communication with the iframe.
     *
     * @returns {void}
     */
    this.createMessageChannel = function () {
      _this.messageChannel = new MessageChannel();
      _this.messageChannel.port1.onmessage = function (event) {
        var message = helpers.parseMessage(event);
        if (!message) {
          return;
        }
        _this.processCallbacks(message.type, message);
      };
      _this.postIFrameMessage({
        type: "init" /* EventType.Init */
      }, _this.messageChannel.port2);
    };
    this.businessId = businessId;
    this.applicationId = applicationId;
    this.sessionId = (0, uuid_1.v4)();
    this.listenerCallbacks = {};
    this.iFrame = null;
    this.messageChannel = null;
    this.buttonsContainer = null;
    this.walletRequest = walletRequest;
    this.walletApi = new wallet_api_1["default"](this.businessId, this.applicationId, this.sessionId);
  }
  /**
   * Adds a callback listener for a specific event.
   *
   * @param {string} eventName - The name of the event.
   * @param {Function} callback - The callback function.
   * @returns {void}
   */
  _createClass(Shared, [{
    key: "on",
    value: function on(eventName, callback) {
      this.listenerCallbacks[eventName] = callback;
    }
    /**
     * Removes a callback listener for a specific event.
     *
     * @param {string} eventName - The name of the event.
     * @returns {void}
     */
  }, {
    key: "off",
    value: function off(eventName) {
      this.listenerCallbacks[eventName] = null;
    }
    /**
     * Parses error.
     *
     * @param {ErrorType} type - The type of the error.
     * @param {any} originalError - The original error object.
     * @returns {CollectError}
     */
  }, {
    key: "parseError",
    value: function parseError(type, originalError) {
      var error = _typeof(originalError) === "object" && originalError.statusMessage ? {
        message: originalError.statusMessage,
        name: originalError.statusCode,
        type: type
      } : _typeof(originalError) === "object" && originalError.reason ? {
        message: originalError.reason,
        name: "Error",
        type: type
      } : originalError instanceof Error ? {
        message: originalError.message,
        name: originalError.name,
        type: type
      } : typeof originalError === "string" ? {
        message: originalError,
        type: type
      } : _extends(_extends({}, originalError), {
        type: type
      });
      return error;
    }
    /**
     * Tracks error.
     *
     * @param {CollectError} error - The collect error object.
     * @returns {void}
     */
  }, {
    key: "trackError",
    value: function trackError(error) {
      console.error(error);
    }
    /**
     * Handles error.
     *
     * @param {ErrorType} type - The type of the error.
     * @param {any} originalError - The original error object.
     * @returns {void}
     */
  }, {
    key: "handleError",
    value: function handleError(type, originalError) {
      var error = this.parseError(type, originalError);
      this.trackError(error);
    }
    /**
     * Posts a message to the iframe.
     *
     * @param {MessageData} data - The message data.
     * @param {MessagePort} [port] - The message port.
     * @returns {void}
     */
  }, {
    key: "postIFrameMessage",
    value: function postIFrameMessage(data, port) {
      var _a, _b;
      var stringifiedData = JSON.stringify(data);
      (_b = (_a = this.iFrame) === null || _a === void 0 ? void 0 : _a.contentWindow) === null || _b === void 0 ? void 0 : _b.postMessage(stringifiedData, "*", port ? [port] : undefined);
    }
    /**
     * Returns the wallet request object.
     *
     * @returns {WalletRequest}
     */
  }, {
    key: "getWalletRequest",
    value: function getWalletRequest() {
      return this.walletRequest;
    }
    /**
     * Updates the wallet request object based on the provided update and event.
     *
     * @param {WalletRequestUpdate} update - The update object containing total, lineItems, shippingMethods, etc.
     * @param {EventType} event - The event type.
     * @returns {void}
     */
  }, {
    key: "updateWalletRequest",
    value: function updateWalletRequest(update, event) {
      var _a;
      var request = this.walletRequest;
      // if no update on errors, then set errors as null and resolve all errors
      request.error = update.error;
      // if event type is payment_authorized, then only request error can be updated
      if (event === "payment_authorized" /* EventType.PaymentAuthorized */) {
        return;
      }
      if (update.total) {
        request.total = update.total;
      }
      if (update.lineItems) {
        request.lineItems = update.lineItems;
      }
      // Both ApplePay and GooglePay don't provide an ability to make shippingMethods empty if it was previously set.
      // Even when you pass undefined or an empty array, it will still show the previous list of shipping methods.
      // We should not update shippingMethods in the wallet request if it's undefined or an empty array
      // to make it consistent with what we see on the UI.
      if (event !== "shipping_method_change" /* EventType.ShippingMethodChange */ && ((_a = update.shippingMethods) === null || _a === void 0 ? void 0 : _a.length)) {
        request.shippingMethods = update.shippingMethods;
      }
      if ((event === "init_wallet" /* EventType.InitWallet */ || event === "coupon_code_change" /* EventType.CouponCodeChange */) && update.couponCode) {
        request.couponCode = update.couponCode;
      }
    }
    /**
     * Processes callback functions synchronously based on the event type.
     *
     * @param {string} eventType - The event type.
     * @param {any} data - The callback data.
     * @returns {void}
     */
  }, {
    key: "processCallbacks",
    value: function processCallbacks(eventType, data) {
      var _a, _b;
      (_b = (_a = this.listenerCallbacks)[eventType]) === null || _b === void 0 ? void 0 : _b.call(_a, data);
    }
    /**
     * Mounts the payment form in the specified DOM element.
     *
     * @param {string} domElement - The ID of the DOM element.
     * @param {Document} document - The document object.
     * @param {AllUrlOptions} options - The URL options.
     * @returns {void}
     */
  }, {
    key: "mountPaymentForm",
    value: function mountPaymentForm(domElement, document, options) {
      var _this2 = this;
      var container = document.getElementById(domElement);
      this.iFrame = helpers.createIFrame(options);
      this.iFrame.onload = function () {
        _this2.createMessageChannel();
      };
      container === null || container === void 0 ? void 0 : container.appendChild(this.iFrame);
    }
    /**
     * Mounts the buttons container in the specified DOM element.
     *
     * @param {string} domElement - The ID of the DOM element.
     * @param {Document} document - The document object.
     * @param {AllUrlOptions} options - The URL options.
     * @returns {void}
     */
  }, {
    key: "mountButtonsContainer",
    value: function mountButtonsContainer(domElement, document, options) {
      var _a;
      var container = document.getElementById(domElement);
      var buttonsContainer = document.createElement("div");
      buttonsContainer.setAttribute("id", "wallet-buttons-container");
      buttonsContainer.setAttribute("class", ((_a = options.buttonsContainerOptions) === null || _a === void 0 ? void 0 : _a.className) || "");
      helpers.setButtonsContainerProperties(buttonsContainer, options.buttonsContainerOptions);
      container === null || container === void 0 ? void 0 : container.appendChild(buttonsContainer);
      this.buttonsContainer = buttonsContainer;
    }
    /**
     * Unmounts the shared logic, including the iframe and buttons container.
     *
     * @param {string} [domElement] - The ID of the DOM element containing the form.
     * @param {Document} [document] - The document object.
     * @returns {void}
     */
  }, {
    key: "unmount",
    value: function unmount(domElement, document) {
      if (this.messageChannel) {
        this.messageChannel.port1.close();
        this.messageChannel.port2.close();
        this.messageChannel = null;
      }
      if (document && domElement) {
        var form = document.getElementById(domElement);
        if (this.iFrame) {
          if (form === null || form === void 0 ? void 0 : form.contains(this.iFrame)) {
            form.removeChild(this.iFrame);
          }
          this.iFrame = null;
        }
        if (this.buttonsContainer) {
          if (form === null || form === void 0 ? void 0 : form.contains(this.buttonsContainer)) {
            form.removeChild(this.buttonsContainer);
          }
          this.buttonsContainer = null;
        }
      }
      this.walletApi.unmount();
    }
  }]);
  return Shared;
}();
exports["default"] = Shared;

},{"../helpers/common":44,"../services/wallet-api":54,"uuid":22}],54:[function(require,module,exports){
"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw new Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw new Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var __awaiter = void 0 && (void 0).__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
Object.defineProperty(exports, "__esModule", {
  value: true
});
var constants_1 = require("../constants");
var common_1 = require("../helpers/common");
;
;
;
;
var WalletApi = /*#__PURE__*/function () {
  function WalletApi(businessId, applicationId, sessionId) {
    _classCallCheck(this, WalletApi);
    this.loaded = false;
    this.loadingPromise = null;
    this.businessId = businessId;
    this.applicationId = applicationId;
    this.sessionId = sessionId;
    this.iFrame = null;
    this.messageChannel = null;
    this.originMessageChannel = null;
    this.iFrameMessageChannel = null;
  }
  _createClass(WalletApi, [{
    key: "isMounted",
    value: function isMounted() {
      return !!(this.loaded && this.iFrame && document.body.contains(this.iFrame));
    }
  }, {
    key: "mount",
    value: function mount() {
      return __awaiter(this, void 0, void 0, /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
        var _this = this;
        var promise;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              if (!this.loadingPromise) {
                _context.next = 2;
                break;
              }
              return _context.abrupt("return", this.loadingPromise);
            case 2:
              promise = new Promise(function (resolve, reject) {
                var allOptions = (0, common_1.getAllOptions)(_this.businessId, _this.applicationId, _this.sessionId, {
                  paymentMethods: ["apple_pay" /* WalletType.ApplePay */, "google_pay" /* WalletType.GooglePay */, "paze" /* WalletType.Paze */]
                });

                _this.iFrame = (0, common_1.createIFrame)(allOptions);
                _this.messageChannel = new MessageChannel();
                _this.originMessageChannel = _this.messageChannel.port1;
                _this.iFrameMessageChannel = _this.messageChannel.port2;
                _this.originMessageChannel.start();
                _this.iFrameMessageChannel.start();
                var onComplete = function onComplete() {
                  var _a;
                  _this.loadingPromise = null;
                  clearTimeout(timeout);
                  (_a = _this.originMessageChannel) === null || _a === void 0 ? void 0 : _a.removeEventListener("message", eventListener);
                };
                var timeout = setTimeout(function () {
                  onComplete();
                  _this.unmount();
                  reject(new Error("Timeout mounting wallet API iFrame"));
                }, constants_1.DEFAULT_TIMEOUT);
                var eventListener = function eventListener(event) {
                  var message = (0, common_1.parseMessage)(event);
                  if ((message === null || message === void 0 ? void 0 : message.type) === "iframe_ready" /* EventType.IFrameContentReady */) {
                    onComplete();
                    _this.loaded = true;
                    resolve();
                  }
                };
                _this.originMessageChannel.addEventListener("message", eventListener);
                _this.iFrame.onload = function () {
                  var _a, _b;
                  if (!_this.iFrameMessageChannel) {
                    return;
                  }
                  (_b = (_a = _this.iFrame) === null || _a === void 0 ? void 0 : _a.contentWindow) === null || _b === void 0 ? void 0 : _b.postMessage(JSON.stringify({
                    type: "init" /* EventType.Init */
                  }), "*", [_this.iFrameMessageChannel]);
                };
                document.body.appendChild(_this.iFrame);
              });
              return _context.abrupt("return", this.loadingPromise = promise);
            case 4:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
    }
  }, {
    key: "postMessage",
    value: function postMessage(requestEvent, reponseSuccessEvent, responseFailEvent, options) {
      return __awaiter(this, void 0, void 0, /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
        var _this2 = this;
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              return _context2.abrupt("return", new Promise(function (resolve, reject) {
                var _a, _b, _c;
                var onComplete = function onComplete() {
                  var _a;
                  clearTimeout(timeout);
                  (_a = _this2.originMessageChannel) === null || _a === void 0 ? void 0 : _a.removeEventListener("message", eventListener);
                };
                var timeout = setTimeout(function () {
                  onComplete();
                  reject(new Error("Timeout posting message ".concat(requestEvent)));
                }, constants_1.DEFAULT_TIMEOUT);
                var eventListener = function eventListener(event) {
                  var message = (0, common_1.parseMessage)(event);
                  if ((message === null || message === void 0 ? void 0 : message.type) === reponseSuccessEvent) {
                    onComplete();
                    return resolve(message.data);
                  }
                  if ((message === null || message === void 0 ? void 0 : message.type) === responseFailEvent) {
                    onComplete();
                    return reject(message.data);
                  }
                };
                (_a = _this2.originMessageChannel) === null || _a === void 0 ? void 0 : _a.addEventListener("message", eventListener);
                (_c = (_b = _this2.iFrame) === null || _b === void 0 ? void 0 : _b.contentWindow) === null || _c === void 0 ? void 0 : _c.postMessage(JSON.stringify({
                  type: requestEvent,
                  options: options
                }), "*");
              }));
            case 1:
            case "end":
              return _context2.stop();
          }
        }, _callee2);
      }));
    }
  }, {
    key: "unmount",
    value: function unmount() {
      var _a, _b;
      if (this.messageChannel) {
        (_a = this.originMessageChannel) === null || _a === void 0 ? void 0 : _a.close();
        (_b = this.iFrameMessageChannel) === null || _b === void 0 ? void 0 : _b.close();
        this.originMessageChannel = null;
        this.iFrameMessageChannel = null;
        this.messageChannel = null;
      }
      if (this.iFrame && document.body.contains(this.iFrame)) {
        document.body.removeChild(this.iFrame);
      }
      this.iFrame = null;
      this.loaded = false;
    }
  }, {
    key: "mountAndPostMessage",
    value: function mountAndPostMessage(requestEvent, reponseSuccessEvent, responseFailEvent, options) {
      return __awaiter(this, void 0, void 0, /*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
        return _regeneratorRuntime().wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              if (this.isMounted()) {
                _context3.next = 3;
                break;
              }
              _context3.next = 3;
              return this.mount();
            case 3:
              return _context3.abrupt("return", this.postMessage(requestEvent, reponseSuccessEvent, responseFailEvent, options));
            case 4:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this);
      }));
    }
  }, {
    key: "validateApplePay",
    value: function validateApplePay(options) {
      return __awaiter(this, void 0, void 0, /*#__PURE__*/_regeneratorRuntime().mark(function _callee4() {
        return _regeneratorRuntime().wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              return _context4.abrupt("return", this.mountAndPostMessage("op_validate_applepay" /* EventType.OpValidateApplePay */, "validate_applepay" /* EventType.ValidateApplePay */, "validate_applepay_error" /* EventType.ValidateApplePayError */, options));
            case 1:
            case "end":
              return _context4.stop();
          }
        }, _callee4, this);
      }));
    }
  }, {
    key: "validateGooglePay",
    value: function validateGooglePay(options) {
      return __awaiter(this, void 0, void 0, /*#__PURE__*/_regeneratorRuntime().mark(function _callee5() {
        return _regeneratorRuntime().wrap(function _callee5$(_context5) {
          while (1) switch (_context5.prev = _context5.next) {
            case 0:
              return _context5.abrupt("return", this.mountAndPostMessage("op_validate_googlepay" /* EventType.OpValidateGooglePay */, "validate_googlepay" /* EventType.ValidateGooglePay */, "validate_googlepay_error" /* EventType.ValidateGooglePayError */, options));
            case 1:
            case "end":
              return _context5.stop();
          }
        }, _callee5, this);
      }));
    }
  }, {
    key: "getWalletNonce",
    value: function getWalletNonce(options) {
      return __awaiter(this, void 0, void 0, /*#__PURE__*/_regeneratorRuntime().mark(function _callee6() {
        return _regeneratorRuntime().wrap(function _callee6$(_context6) {
          while (1) switch (_context6.prev = _context6.next) {
            case 0:
              return _context6.abrupt("return", this.mountAndPostMessage("op_get_wallet_nonce" /* EventType.OpGetWalletNonce */, "wallet_nonce" /* EventType.WalletNonce */, "wallet_nonce_error" /* EventType.WalletNonceError */, options));
            case 1:
            case "end":
              return _context6.stop();
          }
        }, _callee6, this);
      }));
    }
  }]);
  return WalletApi;
}();
exports["default"] = WalletApi;
;

},{"../constants":41,"../helpers/common":44}]},{},[38]);
