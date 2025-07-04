// Marzipano - a 360° media viewer for the modern web (v0.10.2)
//
// Copyright 2016 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
!(function (t) {
  'object' == typeof exports && 'undefined' != typeof module
    ? (module.exports = t())
    : 'function' == typeof define && define.amd
      ? define([], t)
      : (('undefined' != typeof window
          ? window
          : 'undefined' != typeof global
            ? global
            : 'undefined' != typeof self
              ? self
              : this
        ).Marzipano = t());
})(function () {
  var Vt;
  return (function r(n, o, s) {
    function a(e, t) {
      if (!o[e]) {
        if (!n[e]) {
          var i = 'function' == typeof require && require;
          if (!t && i) return i(e, !0);
          if (h) return h(e, !0);
          throw (((i = new Error("Cannot find module '" + e + "'")).code = 'MODULE_NOT_FOUND'), i);
        }
        ((i = o[e] = { exports: {} }),
          n[e][0].call(
            i.exports,
            function (t) {
              return a(n[e][1][t] || t);
            },
            i,
            i.exports,
            r,
            n,
            o,
            s
          ));
      }
      return o[e].exports;
    }
    for (var h = 'function' == typeof require && require, t = 0; t < s.length; t++) a(s[t]);
    return a;
  })(
    {
      1: [
        function (t, e, i) {
          var r, n, o;
          ((r = this),
            (n = 'bowser'),
            (o = function () {
              var M = !0;
              function s(e) {
                function t(t) {
                  t = e.match(t);
                  return (t && 1 < t.length && t[1]) || '';
                }
                function i(t) {
                  t = e.match(t);
                  return (t && 1 < t.length && t[2]) || '';
                }
                var r,
                  n = t(/(ipod|iphone|ipad)/i).toLowerCase(),
                  o = !/like android/i.test(e) && /android/i.test(e),
                  s = /nexus\s*[0-6]\s*/i.test(e),
                  a = !s && /nexus\s*[0-9]+/i.test(e),
                  h = /CrOS/.test(e),
                  u = /silk/i.test(e),
                  l = /sailfish/i.test(e),
                  c = /tizen/i.test(e),
                  p = /(web|hpw)(o|0)s/i.test(e),
                  f = /windows phone/i.test(e),
                  d = (/SamsungBrowser/i.test(e), !f && /windows/i.test(e)),
                  m = !n && !u && /macintosh/i.test(e),
                  v = !o && !l && !c && !p && /linux/i.test(e),
                  _ = i(/edg([ea]|ios)\/(\d+(\.\d+)?)/i),
                  y = t(/version\/(\d+(\.\d+)?)/i),
                  g = /tablet/i.test(e) && !/tablet pc/i.test(e),
                  w = !g && /[^-]mobi/i.test(e),
                  b = /xbox/i.test(e);
                (/opera/i.test(e)
                  ? (r = {
                      name: 'Opera',
                      opera: M,
                      version: y || t(/(?:opera|opr|opios)[\s\/](\d+(\.\d+)?)/i),
                    })
                  : /opr\/|opios/i.test(e)
                    ? (r = {
                        name: 'Opera',
                        opera: M,
                        version: t(/(?:opr|opios)[\s\/](\d+(\.\d+)?)/i) || y,
                      })
                    : /SamsungBrowser/i.test(e)
                      ? (r = {
                          name: 'Samsung Internet for Android',
                          samsungBrowser: M,
                          version: y || t(/(?:SamsungBrowser)[\s\/](\d+(\.\d+)?)/i),
                        })
                      : /Whale/i.test(e)
                        ? (r = {
                            name: 'NAVER Whale browser',
                            whale: M,
                            version: t(/(?:whale)[\s\/](\d+(?:\.\d+)+)/i),
                          })
                        : /MZBrowser/i.test(e)
                          ? (r = {
                              name: 'MZ Browser',
                              mzbrowser: M,
                              version: t(/(?:MZBrowser)[\s\/](\d+(?:\.\d+)+)/i),
                            })
                          : /coast/i.test(e)
                            ? (r = {
                                name: 'Opera Coast',
                                coast: M,
                                version: y || t(/(?:coast)[\s\/](\d+(\.\d+)?)/i),
                              })
                            : /focus/i.test(e)
                              ? (r = {
                                  name: 'Focus',
                                  focus: M,
                                  version: t(/(?:focus)[\s\/](\d+(?:\.\d+)+)/i),
                                })
                              : /yabrowser/i.test(e)
                                ? (r = {
                                    name: 'Yandex Browser',
                                    yandexbrowser: M,
                                    version: y || t(/(?:yabrowser)[\s\/](\d+(\.\d+)?)/i),
                                  })
                                : /ucbrowser/i.test(e)
                                  ? (r = {
                                      name: 'UC Browser',
                                      ucbrowser: M,
                                      version: t(/(?:ucbrowser)[\s\/](\d+(?:\.\d+)+)/i),
                                    })
                                  : /mxios/i.test(e)
                                    ? (r = {
                                        name: 'Maxthon',
                                        maxthon: M,
                                        version: t(/(?:mxios)[\s\/](\d+(?:\.\d+)+)/i),
                                      })
                                    : /epiphany/i.test(e)
                                      ? (r = {
                                          name: 'Epiphany',
                                          epiphany: M,
                                          version: t(/(?:epiphany)[\s\/](\d+(?:\.\d+)+)/i),
                                        })
                                      : /puffin/i.test(e)
                                        ? (r = {
                                            name: 'Puffin',
                                            puffin: M,
                                            version: t(/(?:puffin)[\s\/](\d+(?:\.\d+)?)/i),
                                          })
                                        : /sleipnir/i.test(e)
                                          ? (r = {
                                              name: 'Sleipnir',
                                              sleipnir: M,
                                              version: t(/(?:sleipnir)[\s\/](\d+(?:\.\d+)+)/i),
                                            })
                                          : /k-meleon/i.test(e)
                                            ? (r = {
                                                name: 'K-Meleon',
                                                kMeleon: M,
                                                version: t(/(?:k-meleon)[\s\/](\d+(?:\.\d+)+)/i),
                                              })
                                            : f
                                              ? ((r = {
                                                  name: 'Windows Phone',
                                                  osname: 'Windows Phone',
                                                  windowsphone: M,
                                                }),
                                                _
                                                  ? ((r.msedge = M), (r.version = _))
                                                  : ((r.msie = M),
                                                    (r.version = t(/iemobile\/(\d+(\.\d+)?)/i))))
                                              : /msie|trident/i.test(e)
                                                ? (r = {
                                                    name: 'Internet Explorer',
                                                    msie: M,
                                                    version: t(/(?:msie |rv:)(\d+(\.\d+)?)/i),
                                                  })
                                                : h
                                                  ? (r = {
                                                      name: 'Chrome',
                                                      osname: 'Chrome OS',
                                                      chromeos: M,
                                                      chromeBook: M,
                                                      chrome: M,
                                                      version: t(
                                                        /(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i
                                                      ),
                                                    })
                                                  : /edg([ea]|ios)/i.test(e)
                                                    ? (r = {
                                                        name: 'Microsoft Edge',
                                                        msedge: M,
                                                        version: _,
                                                      })
                                                    : /vivaldi/i.test(e)
                                                      ? (r = {
                                                          name: 'Vivaldi',
                                                          vivaldi: M,
                                                          version:
                                                            t(/vivaldi\/(\d+(\.\d+)?)/i) || y,
                                                        })
                                                      : l
                                                        ? (r = {
                                                            name: 'Sailfish',
                                                            osname: 'Sailfish OS',
                                                            sailfish: M,
                                                            version: t(
                                                              /sailfish\s?browser\/(\d+(\.\d+)?)/i
                                                            ),
                                                          })
                                                        : /seamonkey\//i.test(e)
                                                          ? (r = {
                                                              name: 'SeaMonkey',
                                                              seamonkey: M,
                                                              version:
                                                                t(/seamonkey\/(\d+(\.\d+)?)/i),
                                                            })
                                                          : /firefox|iceweasel|fxios/i.test(e)
                                                            ? ((r = {
                                                                name: 'Firefox',
                                                                firefox: M,
                                                                version: t(
                                                                  /(?:firefox|iceweasel|fxios)[ \/](\d+(\.\d+)?)/i
                                                                ),
                                                              }),
                                                              /\((mobile|tablet);[^\)]*rv:[\d\.]+\)/i.test(
                                                                e
                                                              ) &&
                                                                ((r.firefoxos = M),
                                                                (r.osname = 'Firefox OS')))
                                                            : u
                                                              ? (r = {
                                                                  name: 'Amazon Silk',
                                                                  silk: M,
                                                                  version:
                                                                    t(/silk\/(\d+(\.\d+)?)/i),
                                                                })
                                                              : /phantom/i.test(e)
                                                                ? (r = {
                                                                    name: 'PhantomJS',
                                                                    phantom: M,
                                                                    version:
                                                                      t(
                                                                        /phantomjs\/(\d+(\.\d+)?)/i
                                                                      ),
                                                                  })
                                                                : /slimerjs/i.test(e)
                                                                  ? (r = {
                                                                      name: 'SlimerJS',
                                                                      slimer: M,
                                                                      version:
                                                                        t(
                                                                          /slimerjs\/(\d+(\.\d+)?)/i
                                                                        ),
                                                                    })
                                                                  : /blackberry|\bbb\d+/i.test(e) ||
                                                                      /rim\stablet/i.test(e)
                                                                    ? (r = {
                                                                        name: 'BlackBerry',
                                                                        osname: 'BlackBerry OS',
                                                                        blackberry: M,
                                                                        version:
                                                                          y ||
                                                                          t(
                                                                            /blackberry[\d]+\/(\d+(\.\d+)?)/i
                                                                          ),
                                                                      })
                                                                    : p
                                                                      ? ((r = {
                                                                          name: 'WebOS',
                                                                          osname: 'WebOS',
                                                                          webos: M,
                                                                          version:
                                                                            y ||
                                                                            t(
                                                                              /w(?:eb)?osbrowser\/(\d+(\.\d+)?)/i
                                                                            ),
                                                                        }),
                                                                        /touchpad\//i.test(e) &&
                                                                          (r.touchpad = M))
                                                                      : /bada/i.test(e)
                                                                        ? (r = {
                                                                            name: 'Bada',
                                                                            osname: 'Bada',
                                                                            bada: M,
                                                                            version:
                                                                              t(
                                                                                /dolfin\/(\d+(\.\d+)?)/i
                                                                              ),
                                                                          })
                                                                        : c
                                                                          ? (r = {
                                                                              name: 'Tizen',
                                                                              osname: 'Tizen',
                                                                              tizen: M,
                                                                              version:
                                                                                t(
                                                                                  /(?:tizen\s?)?browser\/(\d+(\.\d+)?)/i
                                                                                ) || y,
                                                                            })
                                                                          : /qupzilla/i.test(e)
                                                                            ? (r = {
                                                                                name: 'QupZilla',
                                                                                qupzilla: M,
                                                                                version:
                                                                                  t(
                                                                                    /(?:qupzilla)[\s\/](\d+(?:\.\d+)+)/i
                                                                                  ) || y,
                                                                              })
                                                                            : /chromium/i.test(e)
                                                                              ? (r = {
                                                                                  name: 'Chromium',
                                                                                  chromium: M,
                                                                                  version:
                                                                                    t(
                                                                                      /(?:chromium)[\s\/](\d+(?:\.\d+)?)/i
                                                                                    ) || y,
                                                                                })
                                                                              : /chrome|crios|crmo/i.test(
                                                                                    e
                                                                                  )
                                                                                ? (r = {
                                                                                    name: 'Chrome',
                                                                                    chrome: M,
                                                                                    version: t(
                                                                                      /(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i
                                                                                    ),
                                                                                  })
                                                                                : o
                                                                                  ? (r = {
                                                                                      name: 'Android',
                                                                                      version: y,
                                                                                    })
                                                                                  : /safari|applewebkit/i.test(
                                                                                        e
                                                                                      )
                                                                                    ? ((r = {
                                                                                        name: 'Safari',
                                                                                        safari: M,
                                                                                      }),
                                                                                      y &&
                                                                                        (r.version =
                                                                                          y))
                                                                                    : n
                                                                                      ? ((r = {
                                                                                          name:
                                                                                            'iphone' ==
                                                                                            n
                                                                                              ? 'iPhone'
                                                                                              : 'ipad' ==
                                                                                                  n
                                                                                                ? 'iPad'
                                                                                                : 'iPod',
                                                                                        }),
                                                                                        y &&
                                                                                          (r.version =
                                                                                            y))
                                                                                      : (r =
                                                                                          /googlebot/i.test(
                                                                                            e
                                                                                          )
                                                                                            ? {
                                                                                                name: 'Googlebot',
                                                                                                googlebot:
                                                                                                  M,
                                                                                                version:
                                                                                                  t(
                                                                                                    /googlebot\/(\d+(\.\d+))/i
                                                                                                  ) ||
                                                                                                  y,
                                                                                              }
                                                                                            : {
                                                                                                name: t(
                                                                                                  /^(.*)\/(.*) /
                                                                                                ),
                                                                                                version:
                                                                                                  i(
                                                                                                    /^(.*)\/(.*) /
                                                                                                  ),
                                                                                              }),
                  !r.msedge && /(apple)?webkit/i.test(e)
                    ? (/(apple)?webkit\/537\.36/i.test(e)
                        ? ((r.name = r.name || 'Blink'), (r.blink = M))
                        : ((r.name = r.name || 'Webkit'), (r.webkit = M)),
                      !r.version && y && (r.version = y))
                    : !r.opera &&
                      /gecko\//i.test(e) &&
                      ((r.name = r.name || 'Gecko'),
                      (r.gecko = M),
                      (r.version = r.version || t(/gecko\/(\d+(\.\d+)?)/i))),
                  r.windowsphone || (!o && !r.silk)
                    ? !r.windowsphone && n
                      ? ((r[n] = M), (r.ios = M), (r.osname = 'iOS'))
                      : m
                        ? ((r.mac = M), (r.osname = 'macOS'))
                        : b
                          ? ((r.xbox = M), (r.osname = 'Xbox'))
                          : d
                            ? ((r.windows = M), (r.osname = 'Windows'))
                            : v && ((r.linux = M), (r.osname = 'Linux'))
                    : ((r.android = M), (r.osname = 'Android')));
                v = '';
                (r.windows
                  ? (v = (function (t) {
                      switch (t) {
                        case 'NT':
                          return 'NT';
                        case 'XP':
                          return 'XP';
                        case 'NT 5.0':
                          return '2000';
                        case 'NT 5.1':
                          return 'XP';
                        case 'NT 5.2':
                          return '2003';
                        case 'NT 6.0':
                          return 'Vista';
                        case 'NT 6.1':
                          return '7';
                        case 'NT 6.2':
                          return '8';
                        case 'NT 6.3':
                          return '8.1';
                        case 'NT 10.0':
                          return '10';
                        default:
                          return;
                      }
                    })(t(/Windows ((NT|XP)( \d\d?.\d)?)/i)))
                  : r.windowsphone
                    ? (v = t(/windows phone (?:os)?\s?(\d+(\.\d+)*)/i))
                    : r.mac
                      ? (v = (v = t(/Mac OS X (\d+([_\.\s]\d+)*)/i)).replace(/[_\s]/g, '.'))
                      : n
                        ? (v = (v = t(/os (\d+([_\s]\d+)*) like mac os x/i)).replace(/[_\s]/g, '.'))
                        : o
                          ? (v = t(/android[ \/-](\d+(\.\d+)*)/i))
                          : r.webos
                            ? (v = t(/(?:web|hpw)os\/(\d+(\.\d+)*)/i))
                            : r.blackberry
                              ? (v = t(/rim\stablet\sos\s(\d+(\.\d+)*)/i))
                              : r.bada
                                ? (v = t(/bada\/(\d+(\.\d+)*)/i))
                                : r.tizen && (v = t(/tizen[\/\s](\d+(\.\d+)*)/i)),
                  v && (r.osversion = v));
                v = !r.windows && v.split('.')[0];
                return (
                  g || a || 'ipad' == n || (o && (3 == v || (4 <= v && !w))) || r.silk
                    ? (r.tablet = M)
                    : (w ||
                        'iphone' == n ||
                        'ipod' == n ||
                        o ||
                        s ||
                        r.blackberry ||
                        r.webos ||
                        r.bada) &&
                      (r.mobile = M),
                  r.msedge ||
                  (r.msie && 10 <= r.version) ||
                  (r.yandexbrowser && 15 <= r.version) ||
                  (r.vivaldi && 1 <= r.version) ||
                  (r.chrome && 20 <= r.version) ||
                  (r.samsungBrowser && 4 <= r.version) ||
                  (r.whale && 1 === x([r.version, '1.0'])) ||
                  (r.mzbrowser && 1 === x([r.version, '6.0'])) ||
                  (r.focus && 1 === x([r.version, '1.0'])) ||
                  (r.firefox && 20 <= r.version) ||
                  (r.safari && 6 <= r.version) ||
                  (r.opera && 10 <= r.version) ||
                  (r.ios && r.osversion && 6 <= r.osversion.split('.')[0]) ||
                  (r.blackberry && 10.1 <= r.version) ||
                  (r.chromium && 20 <= r.version)
                    ? (r.a = M)
                    : (r.msie && r.version < 10) ||
                        (r.chrome && r.version < 20) ||
                        (r.firefox && r.version < 20) ||
                        (r.safari && r.version < 6) ||
                        (r.opera && r.version < 10) ||
                        (r.ios && r.osversion && r.osversion.split('.')[0] < 6) ||
                        (r.chromium && r.version < 20)
                      ? (r.c = M)
                      : (r.x = M),
                  r
                );
              }
              var a = s(('undefined' != typeof navigator && navigator.userAgent) || '');
              function r(t) {
                return t.split('.').length;
              }
              function n(t, e) {
                var i,
                  r = [];
                if (Array.prototype.map) return Array.prototype.map.call(t, e);
                for (i = 0; i < t.length; i++) r.push(e(t[i]));
                return r;
              }
              function x(t) {
                for (
                  var i = Math.max(r(t[0]), r(t[1])),
                    e = n(t, function (t) {
                      var e = i - r(t);
                      return n((t += new Array(1 + e).join('.0')).split('.'), function (t) {
                        return new Array(20 - t.length).join('0') + t;
                      }).reverse();
                    });
                  0 <= --i;

                ) {
                  if (e[0][i] > e[1][i]) return 1;
                  if (e[0][i] !== e[1][i]) return -1;
                  if (0 === i) return 0;
                }
              }
              function o(t, e, i) {
                var r = a;
                ('string' == typeof e && ((i = e), (e = void 0)),
                  void 0 === e && (e = !1),
                  i && (r = s(i)));
                var n,
                  o = '' + r.version;
                for (n in t)
                  if (t.hasOwnProperty(n) && r[n]) {
                    if ('string' != typeof t[n])
                      throw new Error(
                        'Browser version in the minVersion map should be a string: ' +
                          n +
                          ': ' +
                          String(t)
                      );
                    return x([o, t[n]]) < 0;
                  }
                return e;
              }
              return (
                (a.test = function (t) {
                  for (var e = 0; e < t.length; ++e) {
                    var i = t[e];
                    if ('string' == typeof i && i in a) return !0;
                  }
                  return !1;
                }),
                (a.isUnsupportedBrowser = o),
                (a.compareVersions = x),
                (a.check = function (t, e, i) {
                  return !o(t, e, i);
                }),
                (a._detect = s),
                (a.detect = s),
                a
              );
            }),
            void 0 !== e && e.exports ? (e.exports = o()) : (r[n] = o()));
        },
        {},
      ],
      2: [
        function (t, e, i) {
          'use strict';
          (Object.defineProperty(i, '__esModule', { value: !0 }),
            (i.setMatrixArrayType = function (t) {
              i.ARRAY_TYPE = n = t;
            }),
            (i.toRadian = function (t) {
              return t * s;
            }),
            (i.equals = function (t, e) {
              return Math.abs(t - e) <= r * Math.max(1, Math.abs(t), Math.abs(e));
            }),
            (i.RANDOM = i.ARRAY_TYPE = i.EPSILON = void 0));
          var r = 1e-6;
          i.EPSILON = r;
          var n = 'undefined' != typeof Float32Array ? Float32Array : Array;
          i.ARRAY_TYPE = n;
          var o = Math.random;
          i.RANDOM = o;
          var s = Math.PI / 180;
          Math.hypot ||
            (Math.hypot = function () {
              for (var t = 0, e = arguments.length; e--; ) t += arguments[e] * arguments[e];
              return Math.sqrt(t);
            });
        },
        {},
      ],
      3: [
        function (t, e, i) {
          'use strict';
          function s(t) {
            return (s =
              'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                ? function (t) {
                    return typeof t;
                  }
                : function (t) {
                    return t &&
                      'function' == typeof Symbol &&
                      t.constructor === Symbol &&
                      t !== Symbol.prototype
                      ? 'symbol'
                      : typeof t;
                  })(t);
          }
          (Object.defineProperty(i, '__esModule', { value: !0 }),
            (i.vec4 =
              i.vec3 =
              i.vec2 =
              i.quat2 =
              i.quat =
              i.mat4 =
              i.mat3 =
              i.mat2d =
              i.mat2 =
              i.glMatrix =
                void 0));
          var r = n(t('./common.js'));
          i.glMatrix = r;
          r = n(t('./mat2.js'));
          i.mat2 = r;
          r = n(t('./mat2d.js'));
          i.mat2d = r;
          r = n(t('./mat3.js'));
          i.mat3 = r;
          r = n(t('./mat4.js'));
          i.mat4 = r;
          r = n(t('./quat.js'));
          i.quat = r;
          r = n(t('./quat2.js'));
          i.quat2 = r;
          r = n(t('./vec2.js'));
          i.vec2 = r;
          r = n(t('./vec3.js'));
          i.vec3 = r;
          t = n(t('./vec4.js'));
          function a() {
            if ('function' != typeof WeakMap) return null;
            var t = new WeakMap();
            return (
              (a = function () {
                return t;
              }),
              t
            );
          }
          function n(t) {
            if (t && t.__esModule) return t;
            if (null === t || ('object' !== s(t) && 'function' != typeof t)) return { default: t };
            var e = a();
            if (e && e.has(t)) return e.get(t);
            var i,
              r,
              n = {},
              o = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (i in t)
              Object.prototype.hasOwnProperty.call(t, i) &&
                ((r = o ? Object.getOwnPropertyDescriptor(t, i) : null) && (r.get || r.set)
                  ? Object.defineProperty(n, i, r)
                  : (n[i] = t[i]));
            return ((n.default = t), e && e.set(t, n), n);
          }
          i.vec4 = t;
        },
        {
          './common.js': 2,
          './mat2.js': 4,
          './mat2d.js': 5,
          './mat3.js': 6,
          './mat4.js': 7,
          './quat.js': 8,
          './quat2.js': 9,
          './vec2.js': 10,
          './vec3.js': 11,
          './vec4.js': 12,
        },
      ],
      4: [
        function (t, e, i) {
          'use strict';
          function s(t) {
            return (s =
              'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                ? function (t) {
                    return typeof t;
                  }
                : function (t) {
                    return t &&
                      'function' == typeof Symbol &&
                      t.constructor === Symbol &&
                      t !== Symbol.prototype
                      ? 'symbol'
                      : typeof t;
                  })(t);
          }
          (Object.defineProperty(i, '__esModule', { value: !0 }),
            (i.create = function () {
              var t = new h.ARRAY_TYPE(4);
              h.ARRAY_TYPE != Float32Array && ((t[1] = 0), (t[2] = 0));
              return ((t[0] = 1), (t[3] = 1), t);
            }),
            (i.clone = function (t) {
              var e = new h.ARRAY_TYPE(4);
              return ((e[0] = t[0]), (e[1] = t[1]), (e[2] = t[2]), (e[3] = t[3]), e);
            }),
            (i.copy = function (t, e) {
              return ((t[0] = e[0]), (t[1] = e[1]), (t[2] = e[2]), (t[3] = e[3]), t);
            }),
            (i.identity = function (t) {
              return ((t[0] = 1), (t[1] = 0), (t[2] = 0), (t[3] = 1), t);
            }),
            (i.fromValues = function (t, e, i, r) {
              var n = new h.ARRAY_TYPE(4);
              return ((n[0] = t), (n[1] = e), (n[2] = i), (n[3] = r), n);
            }),
            (i.set = function (t, e, i, r, n) {
              return ((t[0] = e), (t[1] = i), (t[2] = r), (t[3] = n), t);
            }),
            (i.transpose = function (t, e) {
              {
                var i;
                t === e
                  ? ((i = e[1]), (t[1] = e[2]), (t[2] = i))
                  : ((t[0] = e[0]), (t[1] = e[2]), (t[2] = e[1]), (t[3] = e[3]));
              }
              return t;
            }),
            (i.invert = function (t, e) {
              var i = e[0],
                r = e[1],
                n = e[2],
                o = e[3],
                e = i * o - n * r;
              return e
                ? ((e = 1 / e), (t[0] = o * e), (t[1] = -r * e), (t[2] = -n * e), (t[3] = i * e), t)
                : null;
            }),
            (i.adjoint = function (t, e) {
              var i = e[0];
              return ((t[0] = e[3]), (t[1] = -e[1]), (t[2] = -e[2]), (t[3] = i), t);
            }),
            (i.determinant = function (t) {
              return t[0] * t[3] - t[2] * t[1];
            }),
            (i.multiply = r),
            (i.rotate = function (t, e, i) {
              var r = e[0],
                n = e[1],
                o = e[2],
                s = e[3],
                e = Math.sin(i),
                i = Math.cos(i);
              return (
                (t[0] = r * i + o * e),
                (t[1] = n * i + s * e),
                (t[2] = r * -e + o * i),
                (t[3] = n * -e + s * i),
                t
              );
            }),
            (i.scale = function (t, e, i) {
              var r = e[0],
                n = e[1],
                o = e[2],
                s = e[3],
                e = i[0],
                i = i[1];
              return ((t[0] = r * e), (t[1] = n * e), (t[2] = o * i), (t[3] = s * i), t);
            }),
            (i.fromRotation = function (t, e) {
              var i = Math.sin(e),
                e = Math.cos(e);
              return ((t[0] = e), (t[1] = i), (t[2] = -i), (t[3] = e), t);
            }),
            (i.fromScaling = function (t, e) {
              return ((t[0] = e[0]), (t[1] = 0), (t[2] = 0), (t[3] = e[1]), t);
            }),
            (i.str = function (t) {
              return 'mat2(' + t[0] + ', ' + t[1] + ', ' + t[2] + ', ' + t[3] + ')';
            }),
            (i.frob = function (t) {
              return Math.hypot(t[0], t[1], t[2], t[3]);
            }),
            (i.LDU = function (t, e, i, r) {
              return (
                (t[2] = r[2] / r[0]),
                (i[0] = r[0]),
                (i[1] = r[1]),
                (i[3] = r[3] - t[2] * i[1]),
                [t, e, i]
              );
            }),
            (i.add = function (t, e, i) {
              return (
                (t[0] = e[0] + i[0]),
                (t[1] = e[1] + i[1]),
                (t[2] = e[2] + i[2]),
                (t[3] = e[3] + i[3]),
                t
              );
            }),
            (i.subtract = n),
            (i.exactEquals = function (t, e) {
              return t[0] === e[0] && t[1] === e[1] && t[2] === e[2] && t[3] === e[3];
            }),
            (i.equals = function (t, e) {
              var i = t[0],
                r = t[1],
                n = t[2],
                o = t[3],
                s = e[0],
                a = e[1],
                t = e[2],
                e = e[3];
              return (
                Math.abs(i - s) <= h.EPSILON * Math.max(1, Math.abs(i), Math.abs(s)) &&
                Math.abs(r - a) <= h.EPSILON * Math.max(1, Math.abs(r), Math.abs(a)) &&
                Math.abs(n - t) <= h.EPSILON * Math.max(1, Math.abs(n), Math.abs(t)) &&
                Math.abs(o - e) <= h.EPSILON * Math.max(1, Math.abs(o), Math.abs(e))
              );
            }),
            (i.multiplyScalar = function (t, e, i) {
              return (
                (t[0] = e[0] * i),
                (t[1] = e[1] * i),
                (t[2] = e[2] * i),
                (t[3] = e[3] * i),
                t
              );
            }),
            (i.multiplyScalarAndAdd = function (t, e, i, r) {
              return (
                (t[0] = e[0] + i[0] * r),
                (t[1] = e[1] + i[1] * r),
                (t[2] = e[2] + i[2] * r),
                (t[3] = e[3] + i[3] * r),
                t
              );
            }),
            (i.sub = i.mul = void 0));
          var h = (function (t) {
            if (t && t.__esModule) return t;
            if (null === t || ('object' !== s(t) && 'function' != typeof t)) return { default: t };
            var e = a();
            if (e && e.has(t)) return e.get(t);
            var i,
              r = {},
              n = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (i in t) {
              var o;
              Object.prototype.hasOwnProperty.call(t, i) &&
                ((o = n ? Object.getOwnPropertyDescriptor(t, i) : null) && (o.get || o.set)
                  ? Object.defineProperty(r, i, o)
                  : (r[i] = t[i]));
            }
            ((r.default = t), e && e.set(t, r));
            return r;
          })(t('./common.js'));
          function a() {
            if ('function' != typeof WeakMap) return null;
            var t = new WeakMap();
            return (
              (a = function () {
                return t;
              }),
              t
            );
          }
          function r(t, e, i) {
            var r = e[0],
              n = e[1],
              o = e[2],
              s = e[3],
              a = i[0],
              h = i[1],
              e = i[2],
              i = i[3];
            return (
              (t[0] = r * a + o * h),
              (t[1] = n * a + s * h),
              (t[2] = r * e + o * i),
              (t[3] = n * e + s * i),
              t
            );
          }
          function n(t, e, i) {
            return (
              (t[0] = e[0] - i[0]),
              (t[1] = e[1] - i[1]),
              (t[2] = e[2] - i[2]),
              (t[3] = e[3] - i[3]),
              t
            );
          }
          ((i.mul = r), (i.sub = n));
        },
        { './common.js': 2 },
      ],
      5: [
        function (t, e, i) {
          'use strict';
          function s(t) {
            return (s =
              'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                ? function (t) {
                    return typeof t;
                  }
                : function (t) {
                    return t &&
                      'function' == typeof Symbol &&
                      t.constructor === Symbol &&
                      t !== Symbol.prototype
                      ? 'symbol'
                      : typeof t;
                  })(t);
          }
          (Object.defineProperty(i, '__esModule', { value: !0 }),
            (i.create = function () {
              var t = new p.ARRAY_TYPE(6);
              p.ARRAY_TYPE != Float32Array && ((t[1] = 0), (t[2] = 0), (t[4] = 0), (t[5] = 0));
              return ((t[0] = 1), (t[3] = 1), t);
            }),
            (i.clone = function (t) {
              var e = new p.ARRAY_TYPE(6);
              return (
                (e[0] = t[0]),
                (e[1] = t[1]),
                (e[2] = t[2]),
                (e[3] = t[3]),
                (e[4] = t[4]),
                (e[5] = t[5]),
                e
              );
            }),
            (i.copy = function (t, e) {
              return (
                (t[0] = e[0]),
                (t[1] = e[1]),
                (t[2] = e[2]),
                (t[3] = e[3]),
                (t[4] = e[4]),
                (t[5] = e[5]),
                t
              );
            }),
            (i.identity = function (t) {
              return ((t[0] = 1), (t[1] = 0), (t[2] = 0), (t[3] = 1), (t[4] = 0), (t[5] = 0), t);
            }),
            (i.fromValues = function (t, e, i, r, n, o) {
              var s = new p.ARRAY_TYPE(6);
              return ((s[0] = t), (s[1] = e), (s[2] = i), (s[3] = r), (s[4] = n), (s[5] = o), s);
            }),
            (i.set = function (t, e, i, r, n, o, s) {
              return ((t[0] = e), (t[1] = i), (t[2] = r), (t[3] = n), (t[4] = o), (t[5] = s), t);
            }),
            (i.invert = function (t, e) {
              var i = e[0],
                r = e[1],
                n = e[2],
                o = e[3],
                s = e[4],
                a = e[5],
                e = i * o - r * n;
              return e
                ? ((e = 1 / e),
                  (t[0] = o * e),
                  (t[1] = -r * e),
                  (t[2] = -n * e),
                  (t[3] = i * e),
                  (t[4] = (n * a - o * s) * e),
                  (t[5] = (r * s - i * a) * e),
                  t)
                : null;
            }),
            (i.determinant = function (t) {
              return t[0] * t[3] - t[1] * t[2];
            }),
            (i.multiply = r),
            (i.rotate = function (t, e, i) {
              var r = e[0],
                n = e[1],
                o = e[2],
                s = e[3],
                a = e[4],
                h = e[5],
                e = Math.sin(i),
                i = Math.cos(i);
              return (
                (t[0] = r * i + o * e),
                (t[1] = n * i + s * e),
                (t[2] = r * -e + o * i),
                (t[3] = n * -e + s * i),
                (t[4] = a),
                (t[5] = h),
                t
              );
            }),
            (i.scale = function (t, e, i) {
              var r = e[0],
                n = e[1],
                o = e[2],
                s = e[3],
                a = e[4],
                h = e[5],
                e = i[0],
                i = i[1];
              return (
                (t[0] = r * e),
                (t[1] = n * e),
                (t[2] = o * i),
                (t[3] = s * i),
                (t[4] = a),
                (t[5] = h),
                t
              );
            }),
            (i.translate = function (t, e, i) {
              var r = e[0],
                n = e[1],
                o = e[2],
                s = e[3],
                a = e[4],
                h = e[5],
                e = i[0],
                i = i[1];
              return (
                (t[0] = r),
                (t[1] = n),
                (t[2] = o),
                (t[3] = s),
                (t[4] = r * e + o * i + a),
                (t[5] = n * e + s * i + h),
                t
              );
            }),
            (i.fromRotation = function (t, e) {
              var i = Math.sin(e),
                e = Math.cos(e);
              return ((t[0] = e), (t[1] = i), (t[2] = -i), (t[3] = e), (t[4] = 0), (t[5] = 0), t);
            }),
            (i.fromScaling = function (t, e) {
              return (
                (t[0] = e[0]),
                (t[1] = 0),
                (t[2] = 0),
                (t[3] = e[1]),
                (t[4] = 0),
                (t[5] = 0),
                t
              );
            }),
            (i.fromTranslation = function (t, e) {
              return (
                (t[0] = 1),
                (t[1] = 0),
                (t[2] = 0),
                (t[3] = 1),
                (t[4] = e[0]),
                (t[5] = e[1]),
                t
              );
            }),
            (i.str = function (t) {
              return (
                'mat2d(' +
                t[0] +
                ', ' +
                t[1] +
                ', ' +
                t[2] +
                ', ' +
                t[3] +
                ', ' +
                t[4] +
                ', ' +
                t[5] +
                ')'
              );
            }),
            (i.frob = function (t) {
              return Math.hypot(t[0], t[1], t[2], t[3], t[4], t[5], 1);
            }),
            (i.add = function (t, e, i) {
              return (
                (t[0] = e[0] + i[0]),
                (t[1] = e[1] + i[1]),
                (t[2] = e[2] + i[2]),
                (t[3] = e[3] + i[3]),
                (t[4] = e[4] + i[4]),
                (t[5] = e[5] + i[5]),
                t
              );
            }),
            (i.subtract = n),
            (i.multiplyScalar = function (t, e, i) {
              return (
                (t[0] = e[0] * i),
                (t[1] = e[1] * i),
                (t[2] = e[2] * i),
                (t[3] = e[3] * i),
                (t[4] = e[4] * i),
                (t[5] = e[5] * i),
                t
              );
            }),
            (i.multiplyScalarAndAdd = function (t, e, i, r) {
              return (
                (t[0] = e[0] + i[0] * r),
                (t[1] = e[1] + i[1] * r),
                (t[2] = e[2] + i[2] * r),
                (t[3] = e[3] + i[3] * r),
                (t[4] = e[4] + i[4] * r),
                (t[5] = e[5] + i[5] * r),
                t
              );
            }),
            (i.exactEquals = function (t, e) {
              return (
                t[0] === e[0] &&
                t[1] === e[1] &&
                t[2] === e[2] &&
                t[3] === e[3] &&
                t[4] === e[4] &&
                t[5] === e[5]
              );
            }),
            (i.equals = function (t, e) {
              var i = t[0],
                r = t[1],
                n = t[2],
                o = t[3],
                s = t[4],
                a = t[5],
                h = e[0],
                u = e[1],
                l = e[2],
                c = e[3],
                t = e[4],
                e = e[5];
              return (
                Math.abs(i - h) <= p.EPSILON * Math.max(1, Math.abs(i), Math.abs(h)) &&
                Math.abs(r - u) <= p.EPSILON * Math.max(1, Math.abs(r), Math.abs(u)) &&
                Math.abs(n - l) <= p.EPSILON * Math.max(1, Math.abs(n), Math.abs(l)) &&
                Math.abs(o - c) <= p.EPSILON * Math.max(1, Math.abs(o), Math.abs(c)) &&
                Math.abs(s - t) <= p.EPSILON * Math.max(1, Math.abs(s), Math.abs(t)) &&
                Math.abs(a - e) <= p.EPSILON * Math.max(1, Math.abs(a), Math.abs(e))
              );
            }),
            (i.sub = i.mul = void 0));
          var p = (function (t) {
            if (t && t.__esModule) return t;
            if (null === t || ('object' !== s(t) && 'function' != typeof t)) return { default: t };
            var e = a();
            if (e && e.has(t)) return e.get(t);
            var i,
              r = {},
              n = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (i in t) {
              var o;
              Object.prototype.hasOwnProperty.call(t, i) &&
                ((o = n ? Object.getOwnPropertyDescriptor(t, i) : null) && (o.get || o.set)
                  ? Object.defineProperty(r, i, o)
                  : (r[i] = t[i]));
            }
            ((r.default = t), e && e.set(t, r));
            return r;
          })(t('./common.js'));
          function a() {
            if ('function' != typeof WeakMap) return null;
            var t = new WeakMap();
            return (
              (a = function () {
                return t;
              }),
              t
            );
          }
          function r(t, e, i) {
            var r = e[0],
              n = e[1],
              o = e[2],
              s = e[3],
              a = e[4],
              h = e[5],
              u = i[0],
              l = i[1],
              c = i[2],
              p = i[3],
              e = i[4],
              i = i[5];
            return (
              (t[0] = r * u + o * l),
              (t[1] = n * u + s * l),
              (t[2] = r * c + o * p),
              (t[3] = n * c + s * p),
              (t[4] = r * e + o * i + a),
              (t[5] = n * e + s * i + h),
              t
            );
          }
          function n(t, e, i) {
            return (
              (t[0] = e[0] - i[0]),
              (t[1] = e[1] - i[1]),
              (t[2] = e[2] - i[2]),
              (t[3] = e[3] - i[3]),
              (t[4] = e[4] - i[4]),
              (t[5] = e[5] - i[5]),
              t
            );
          }
          ((i.mul = r), (i.sub = n));
        },
        { './common.js': 2 },
      ],
      6: [
        function (t, e, i) {
          'use strict';
          function s(t) {
            return (s =
              'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                ? function (t) {
                    return typeof t;
                  }
                : function (t) {
                    return t &&
                      'function' == typeof Symbol &&
                      t.constructor === Symbol &&
                      t !== Symbol.prototype
                      ? 'symbol'
                      : typeof t;
                  })(t);
          }
          (Object.defineProperty(i, '__esModule', { value: !0 }),
            (i.create = function () {
              var t = new y.ARRAY_TYPE(9);
              y.ARRAY_TYPE != Float32Array &&
                ((t[1] = 0), (t[2] = 0), (t[3] = 0), (t[5] = 0), (t[6] = 0), (t[7] = 0));
              return ((t[0] = 1), (t[4] = 1), (t[8] = 1), t);
            }),
            (i.fromMat4 = function (t, e) {
              return (
                (t[0] = e[0]),
                (t[1] = e[1]),
                (t[2] = e[2]),
                (t[3] = e[4]),
                (t[4] = e[5]),
                (t[5] = e[6]),
                (t[6] = e[8]),
                (t[7] = e[9]),
                (t[8] = e[10]),
                t
              );
            }),
            (i.clone = function (t) {
              var e = new y.ARRAY_TYPE(9);
              return (
                (e[0] = t[0]),
                (e[1] = t[1]),
                (e[2] = t[2]),
                (e[3] = t[3]),
                (e[4] = t[4]),
                (e[5] = t[5]),
                (e[6] = t[6]),
                (e[7] = t[7]),
                (e[8] = t[8]),
                e
              );
            }),
            (i.copy = function (t, e) {
              return (
                (t[0] = e[0]),
                (t[1] = e[1]),
                (t[2] = e[2]),
                (t[3] = e[3]),
                (t[4] = e[4]),
                (t[5] = e[5]),
                (t[6] = e[6]),
                (t[7] = e[7]),
                (t[8] = e[8]),
                t
              );
            }),
            (i.fromValues = function (t, e, i, r, n, o, s, a, h) {
              var u = new y.ARRAY_TYPE(9);
              return (
                (u[0] = t),
                (u[1] = e),
                (u[2] = i),
                (u[3] = r),
                (u[4] = n),
                (u[5] = o),
                (u[6] = s),
                (u[7] = a),
                (u[8] = h),
                u
              );
            }),
            (i.set = function (t, e, i, r, n, o, s, a, h, u) {
              return (
                (t[0] = e),
                (t[1] = i),
                (t[2] = r),
                (t[3] = n),
                (t[4] = o),
                (t[5] = s),
                (t[6] = a),
                (t[7] = h),
                (t[8] = u),
                t
              );
            }),
            (i.identity = function (t) {
              return (
                (t[0] = 1),
                (t[1] = 0),
                (t[2] = 0),
                (t[3] = 0),
                (t[4] = 1),
                (t[5] = 0),
                (t[6] = 0),
                (t[7] = 0),
                (t[8] = 1),
                t
              );
            }),
            (i.transpose = function (t, e) {
              {
                var i, r, n;
                t === e
                  ? ((i = e[1]),
                    (r = e[2]),
                    (n = e[5]),
                    (t[1] = e[3]),
                    (t[2] = e[6]),
                    (t[3] = i),
                    (t[5] = e[7]),
                    (t[6] = r),
                    (t[7] = n))
                  : ((t[0] = e[0]),
                    (t[1] = e[3]),
                    (t[2] = e[6]),
                    (t[3] = e[1]),
                    (t[4] = e[4]),
                    (t[5] = e[7]),
                    (t[6] = e[2]),
                    (t[7] = e[5]),
                    (t[8] = e[8]));
              }
              return t;
            }),
            (i.invert = function (t, e) {
              var i = e[0],
                r = e[1],
                n = e[2],
                o = e[3],
                s = e[4],
                a = e[5],
                h = e[6],
                u = e[7],
                l = e[8],
                c = l * s - a * u,
                p = -l * o + a * h,
                f = u * o - s * h,
                e = i * c + r * p + n * f;
              return e
                ? ((e = 1 / e),
                  (t[0] = c * e),
                  (t[1] = (-l * r + n * u) * e),
                  (t[2] = (a * r - n * s) * e),
                  (t[3] = p * e),
                  (t[4] = (l * i - n * h) * e),
                  (t[5] = (-a * i + n * o) * e),
                  (t[6] = f * e),
                  (t[7] = (-u * i + r * h) * e),
                  (t[8] = (s * i - r * o) * e),
                  t)
                : null;
            }),
            (i.adjoint = function (t, e) {
              var i = e[0],
                r = e[1],
                n = e[2],
                o = e[3],
                s = e[4],
                a = e[5],
                h = e[6],
                u = e[7],
                e = e[8];
              return (
                (t[0] = s * e - a * u),
                (t[1] = n * u - r * e),
                (t[2] = r * a - n * s),
                (t[3] = a * h - o * e),
                (t[4] = i * e - n * h),
                (t[5] = n * o - i * a),
                (t[6] = o * u - s * h),
                (t[7] = r * h - i * u),
                (t[8] = i * s - r * o),
                t
              );
            }),
            (i.determinant = function (t) {
              var e = t[0],
                i = t[1],
                r = t[2],
                n = t[3],
                o = t[4],
                s = t[5],
                a = t[6],
                h = t[7],
                t = t[8];
              return e * (t * o - s * h) + i * (-t * n + s * a) + r * (h * n - o * a);
            }),
            (i.multiply = r),
            (i.translate = function (t, e, i) {
              var r = e[0],
                n = e[1],
                o = e[2],
                s = e[3],
                a = e[4],
                h = e[5],
                u = e[6],
                l = e[7],
                c = e[8],
                e = i[0],
                i = i[1];
              return (
                (t[0] = r),
                (t[1] = n),
                (t[2] = o),
                (t[3] = s),
                (t[4] = a),
                (t[5] = h),
                (t[6] = e * r + i * s + u),
                (t[7] = e * n + i * a + l),
                (t[8] = e * o + i * h + c),
                t
              );
            }),
            (i.rotate = function (t, e, i) {
              var r = e[0],
                n = e[1],
                o = e[2],
                s = e[3],
                a = e[4],
                h = e[5],
                u = e[6],
                l = e[7],
                c = e[8],
                e = Math.sin(i),
                i = Math.cos(i);
              return (
                (t[0] = i * r + e * s),
                (t[1] = i * n + e * a),
                (t[2] = i * o + e * h),
                (t[3] = i * s - e * r),
                (t[4] = i * a - e * n),
                (t[5] = i * h - e * o),
                (t[6] = u),
                (t[7] = l),
                (t[8] = c),
                t
              );
            }),
            (i.scale = function (t, e, i) {
              var r = i[0],
                i = i[1];
              return (
                (t[0] = r * e[0]),
                (t[1] = r * e[1]),
                (t[2] = r * e[2]),
                (t[3] = i * e[3]),
                (t[4] = i * e[4]),
                (t[5] = i * e[5]),
                (t[6] = e[6]),
                (t[7] = e[7]),
                (t[8] = e[8]),
                t
              );
            }),
            (i.fromTranslation = function (t, e) {
              return (
                (t[0] = 1),
                (t[1] = 0),
                (t[2] = 0),
                (t[3] = 0),
                (t[4] = 1),
                (t[5] = 0),
                (t[6] = e[0]),
                (t[7] = e[1]),
                (t[8] = 1),
                t
              );
            }),
            (i.fromRotation = function (t, e) {
              var i = Math.sin(e),
                e = Math.cos(e);
              return (
                (t[0] = e),
                (t[1] = i),
                (t[2] = 0),
                (t[3] = -i),
                (t[4] = e),
                (t[5] = 0),
                (t[6] = 0),
                (t[7] = 0),
                (t[8] = 1),
                t
              );
            }),
            (i.fromScaling = function (t, e) {
              return (
                (t[0] = e[0]),
                (t[1] = 0),
                (t[2] = 0),
                (t[3] = 0),
                (t[4] = e[1]),
                (t[5] = 0),
                (t[6] = 0),
                (t[7] = 0),
                (t[8] = 1),
                t
              );
            }),
            (i.fromMat2d = function (t, e) {
              return (
                (t[0] = e[0]),
                (t[1] = e[1]),
                (t[2] = 0),
                (t[3] = e[2]),
                (t[4] = e[3]),
                (t[5] = 0),
                (t[6] = e[4]),
                (t[7] = e[5]),
                (t[8] = 1),
                t
              );
            }),
            (i.fromQuat = function (t, e) {
              var i = e[0],
                r = e[1],
                n = e[2],
                o = e[3],
                s = i + i,
                a = r + r,
                h = n + n,
                u = i * s,
                l = r * s,
                e = r * a,
                i = n * s,
                r = n * a,
                n = n * h,
                s = o * s,
                a = o * a,
                h = o * h;
              return (
                (t[0] = 1 - e - n),
                (t[3] = l - h),
                (t[6] = i + a),
                (t[1] = l + h),
                (t[4] = 1 - u - n),
                (t[7] = r - s),
                (t[2] = i - a),
                (t[5] = r + s),
                (t[8] = 1 - u - e),
                t
              );
            }),
            (i.normalFromMat4 = function (t, e) {
              var i = e[0],
                r = e[1],
                n = e[2],
                o = e[3],
                s = e[4],
                a = e[5],
                h = e[6],
                u = e[7],
                l = e[8],
                c = e[9],
                p = e[10],
                f = e[11],
                d = e[12],
                m = e[13],
                v = e[14],
                _ = e[15],
                y = i * a - r * s,
                g = i * h - n * s,
                w = i * u - o * s,
                b = r * h - n * a,
                M = r * u - o * a,
                x = n * u - o * h,
                E = l * m - c * d,
                T = l * v - p * d,
                e = l * _ - f * d,
                l = c * v - p * m,
                c = c * _ - f * m,
                p = p * _ - f * v,
                f = y * p - g * c + w * l + b * e - M * T + x * E;
              return f
                ? ((f = 1 / f),
                  (t[0] = (a * p - h * c + u * l) * f),
                  (t[1] = (h * e - s * p - u * T) * f),
                  (t[2] = (s * c - a * e + u * E) * f),
                  (t[3] = (n * c - r * p - o * l) * f),
                  (t[4] = (i * p - n * e + o * T) * f),
                  (t[5] = (r * e - i * c - o * E) * f),
                  (t[6] = (m * x - v * M + _ * b) * f),
                  (t[7] = (v * w - d * x - _ * g) * f),
                  (t[8] = (d * M - m * w + _ * y) * f),
                  t)
                : null;
            }),
            (i.projection = function (t, e, i) {
              return (
                (t[0] = 2 / e),
                (t[1] = 0),
                (t[2] = 0),
                (t[3] = 0),
                (t[4] = -2 / i),
                (t[5] = 0),
                (t[6] = -1),
                (t[7] = 1),
                (t[8] = 1),
                t
              );
            }),
            (i.str = function (t) {
              return (
                'mat3(' +
                t[0] +
                ', ' +
                t[1] +
                ', ' +
                t[2] +
                ', ' +
                t[3] +
                ', ' +
                t[4] +
                ', ' +
                t[5] +
                ', ' +
                t[6] +
                ', ' +
                t[7] +
                ', ' +
                t[8] +
                ')'
              );
            }),
            (i.frob = function (t) {
              return Math.hypot(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8]);
            }),
            (i.add = function (t, e, i) {
              return (
                (t[0] = e[0] + i[0]),
                (t[1] = e[1] + i[1]),
                (t[2] = e[2] + i[2]),
                (t[3] = e[3] + i[3]),
                (t[4] = e[4] + i[4]),
                (t[5] = e[5] + i[5]),
                (t[6] = e[6] + i[6]),
                (t[7] = e[7] + i[7]),
                (t[8] = e[8] + i[8]),
                t
              );
            }),
            (i.subtract = n),
            (i.multiplyScalar = function (t, e, i) {
              return (
                (t[0] = e[0] * i),
                (t[1] = e[1] * i),
                (t[2] = e[2] * i),
                (t[3] = e[3] * i),
                (t[4] = e[4] * i),
                (t[5] = e[5] * i),
                (t[6] = e[6] * i),
                (t[7] = e[7] * i),
                (t[8] = e[8] * i),
                t
              );
            }),
            (i.multiplyScalarAndAdd = function (t, e, i, r) {
              return (
                (t[0] = e[0] + i[0] * r),
                (t[1] = e[1] + i[1] * r),
                (t[2] = e[2] + i[2] * r),
                (t[3] = e[3] + i[3] * r),
                (t[4] = e[4] + i[4] * r),
                (t[5] = e[5] + i[5] * r),
                (t[6] = e[6] + i[6] * r),
                (t[7] = e[7] + i[7] * r),
                (t[8] = e[8] + i[8] * r),
                t
              );
            }),
            (i.exactEquals = function (t, e) {
              return (
                t[0] === e[0] &&
                t[1] === e[1] &&
                t[2] === e[2] &&
                t[3] === e[3] &&
                t[4] === e[4] &&
                t[5] === e[5] &&
                t[6] === e[6] &&
                t[7] === e[7] &&
                t[8] === e[8]
              );
            }),
            (i.equals = function (t, e) {
              var i = t[0],
                r = t[1],
                n = t[2],
                o = t[3],
                s = t[4],
                a = t[5],
                h = t[6],
                u = t[7],
                l = t[8],
                c = e[0],
                p = e[1],
                f = e[2],
                d = e[3],
                m = e[4],
                v = e[5],
                _ = e[6],
                t = e[7],
                e = e[8];
              return (
                Math.abs(i - c) <= y.EPSILON * Math.max(1, Math.abs(i), Math.abs(c)) &&
                Math.abs(r - p) <= y.EPSILON * Math.max(1, Math.abs(r), Math.abs(p)) &&
                Math.abs(n - f) <= y.EPSILON * Math.max(1, Math.abs(n), Math.abs(f)) &&
                Math.abs(o - d) <= y.EPSILON * Math.max(1, Math.abs(o), Math.abs(d)) &&
                Math.abs(s - m) <= y.EPSILON * Math.max(1, Math.abs(s), Math.abs(m)) &&
                Math.abs(a - v) <= y.EPSILON * Math.max(1, Math.abs(a), Math.abs(v)) &&
                Math.abs(h - _) <= y.EPSILON * Math.max(1, Math.abs(h), Math.abs(_)) &&
                Math.abs(u - t) <= y.EPSILON * Math.max(1, Math.abs(u), Math.abs(t)) &&
                Math.abs(l - e) <= y.EPSILON * Math.max(1, Math.abs(l), Math.abs(e))
              );
            }),
            (i.sub = i.mul = void 0));
          var y = (function (t) {
            if (t && t.__esModule) return t;
            if (null === t || ('object' !== s(t) && 'function' != typeof t)) return { default: t };
            var e = a();
            if (e && e.has(t)) return e.get(t);
            var i,
              r = {},
              n = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (i in t) {
              var o;
              Object.prototype.hasOwnProperty.call(t, i) &&
                ((o = n ? Object.getOwnPropertyDescriptor(t, i) : null) && (o.get || o.set)
                  ? Object.defineProperty(r, i, o)
                  : (r[i] = t[i]));
            }
            ((r.default = t), e && e.set(t, r));
            return r;
          })(t('./common.js'));
          function a() {
            if ('function' != typeof WeakMap) return null;
            var t = new WeakMap();
            return (
              (a = function () {
                return t;
              }),
              t
            );
          }
          function r(t, e, i) {
            var r = e[0],
              n = e[1],
              o = e[2],
              s = e[3],
              a = e[4],
              h = e[5],
              u = e[6],
              l = e[7],
              c = e[8],
              p = i[0],
              f = i[1],
              d = i[2],
              m = i[3],
              v = i[4],
              _ = i[5],
              y = i[6],
              e = i[7],
              i = i[8];
            return (
              (t[0] = p * r + f * s + d * u),
              (t[1] = p * n + f * a + d * l),
              (t[2] = p * o + f * h + d * c),
              (t[3] = m * r + v * s + _ * u),
              (t[4] = m * n + v * a + _ * l),
              (t[5] = m * o + v * h + _ * c),
              (t[6] = y * r + e * s + i * u),
              (t[7] = y * n + e * a + i * l),
              (t[8] = y * o + e * h + i * c),
              t
            );
          }
          function n(t, e, i) {
            return (
              (t[0] = e[0] - i[0]),
              (t[1] = e[1] - i[1]),
              (t[2] = e[2] - i[2]),
              (t[3] = e[3] - i[3]),
              (t[4] = e[4] - i[4]),
              (t[5] = e[5] - i[5]),
              (t[6] = e[6] - i[6]),
              (t[7] = e[7] - i[7]),
              (t[8] = e[8] - i[8]),
              t
            );
          }
          ((i.mul = r), (i.sub = n));
        },
        { './common.js': 2 },
      ],
      7: [
        function (t, e, i) {
          'use strict';
          function s(t) {
            return (s =
              'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                ? function (t) {
                    return typeof t;
                  }
                : function (t) {
                    return t &&
                      'function' == typeof Symbol &&
                      t.constructor === Symbol &&
                      t !== Symbol.prototype
                      ? 'symbol'
                      : typeof t;
                  })(t);
          }
          (Object.defineProperty(i, '__esModule', { value: !0 }),
            (i.create = function () {
              var t = new O.ARRAY_TYPE(16);
              O.ARRAY_TYPE != Float32Array &&
                ((t[1] = 0),
                (t[2] = 0),
                (t[3] = 0),
                (t[4] = 0),
                (t[6] = 0),
                (t[7] = 0),
                (t[8] = 0),
                (t[9] = 0),
                (t[11] = 0),
                (t[12] = 0),
                (t[13] = 0),
                (t[14] = 0));
              return ((t[0] = 1), (t[5] = 1), (t[10] = 1), (t[15] = 1), t);
            }),
            (i.clone = function (t) {
              var e = new O.ARRAY_TYPE(16);
              return (
                (e[0] = t[0]),
                (e[1] = t[1]),
                (e[2] = t[2]),
                (e[3] = t[3]),
                (e[4] = t[4]),
                (e[5] = t[5]),
                (e[6] = t[6]),
                (e[7] = t[7]),
                (e[8] = t[8]),
                (e[9] = t[9]),
                (e[10] = t[10]),
                (e[11] = t[11]),
                (e[12] = t[12]),
                (e[13] = t[13]),
                (e[14] = t[14]),
                (e[15] = t[15]),
                e
              );
            }),
            (i.copy = function (t, e) {
              return (
                (t[0] = e[0]),
                (t[1] = e[1]),
                (t[2] = e[2]),
                (t[3] = e[3]),
                (t[4] = e[4]),
                (t[5] = e[5]),
                (t[6] = e[6]),
                (t[7] = e[7]),
                (t[8] = e[8]),
                (t[9] = e[9]),
                (t[10] = e[10]),
                (t[11] = e[11]),
                (t[12] = e[12]),
                (t[13] = e[13]),
                (t[14] = e[14]),
                (t[15] = e[15]),
                t
              );
            }),
            (i.fromValues = function (t, e, i, r, n, o, s, a, h, u, l, c, p, f, d, m) {
              var v = new O.ARRAY_TYPE(16);
              return (
                (v[0] = t),
                (v[1] = e),
                (v[2] = i),
                (v[3] = r),
                (v[4] = n),
                (v[5] = o),
                (v[6] = s),
                (v[7] = a),
                (v[8] = h),
                (v[9] = u),
                (v[10] = l),
                (v[11] = c),
                (v[12] = p),
                (v[13] = f),
                (v[14] = d),
                (v[15] = m),
                v
              );
            }),
            (i.set = function (t, e, i, r, n, o, s, a, h, u, l, c, p, f, d, m, v) {
              return (
                (t[0] = e),
                (t[1] = i),
                (t[2] = r),
                (t[3] = n),
                (t[4] = o),
                (t[5] = s),
                (t[6] = a),
                (t[7] = h),
                (t[8] = u),
                (t[9] = l),
                (t[10] = c),
                (t[11] = p),
                (t[12] = f),
                (t[13] = d),
                (t[14] = m),
                (t[15] = v),
                t
              );
            }),
            (i.identity = d),
            (i.transpose = function (t, e) {
              {
                var i, r, n, o, s, a;
                t === e
                  ? ((i = e[1]),
                    (r = e[2]),
                    (n = e[3]),
                    (o = e[6]),
                    (s = e[7]),
                    (a = e[11]),
                    (t[1] = e[4]),
                    (t[2] = e[8]),
                    (t[3] = e[12]),
                    (t[4] = i),
                    (t[6] = e[9]),
                    (t[7] = e[13]),
                    (t[8] = r),
                    (t[9] = o),
                    (t[11] = e[14]),
                    (t[12] = n),
                    (t[13] = s),
                    (t[14] = a))
                  : ((t[0] = e[0]),
                    (t[1] = e[4]),
                    (t[2] = e[8]),
                    (t[3] = e[12]),
                    (t[4] = e[1]),
                    (t[5] = e[5]),
                    (t[6] = e[9]),
                    (t[7] = e[13]),
                    (t[8] = e[2]),
                    (t[9] = e[6]),
                    (t[10] = e[10]),
                    (t[11] = e[14]),
                    (t[12] = e[3]),
                    (t[13] = e[7]),
                    (t[14] = e[11]),
                    (t[15] = e[15]));
              }
              return t;
            }),
            (i.invert = function (t, e) {
              var i = e[0],
                r = e[1],
                n = e[2],
                o = e[3],
                s = e[4],
                a = e[5],
                h = e[6],
                u = e[7],
                l = e[8],
                c = e[9],
                p = e[10],
                f = e[11],
                d = e[12],
                m = e[13],
                v = e[14],
                _ = e[15],
                y = i * a - r * s,
                g = i * h - n * s,
                w = i * u - o * s,
                b = r * h - n * a,
                M = r * u - o * a,
                x = n * u - o * h,
                E = l * m - c * d,
                T = l * v - p * d,
                P = l * _ - f * d,
                L = c * v - p * m,
                S = c * _ - f * m,
                C = p * _ - f * v,
                e = y * C - g * S + w * L + b * P - M * T + x * E;
              return e
                ? ((e = 1 / e),
                  (t[0] = (a * C - h * S + u * L) * e),
                  (t[1] = (n * S - r * C - o * L) * e),
                  (t[2] = (m * x - v * M + _ * b) * e),
                  (t[3] = (p * M - c * x - f * b) * e),
                  (t[4] = (h * P - s * C - u * T) * e),
                  (t[5] = (i * C - n * P + o * T) * e),
                  (t[6] = (v * w - d * x - _ * g) * e),
                  (t[7] = (l * x - p * w + f * g) * e),
                  (t[8] = (s * S - a * P + u * E) * e),
                  (t[9] = (r * P - i * S - o * E) * e),
                  (t[10] = (d * M - m * w + _ * y) * e),
                  (t[11] = (c * w - l * M - f * y) * e),
                  (t[12] = (a * T - s * L - h * E) * e),
                  (t[13] = (i * L - r * T + n * E) * e),
                  (t[14] = (m * g - d * b - v * y) * e),
                  (t[15] = (l * b - c * g + p * y) * e),
                  t)
                : null;
            }),
            (i.adjoint = function (t, e) {
              var i = e[0],
                r = e[1],
                n = e[2],
                o = e[3],
                s = e[4],
                a = e[5],
                h = e[6],
                u = e[7],
                l = e[8],
                c = e[9],
                p = e[10],
                f = e[11],
                d = e[12],
                m = e[13],
                v = e[14],
                e = e[15];
              return (
                (t[0] = a * (p * e - f * v) - c * (h * e - u * v) + m * (h * f - u * p)),
                (t[1] = -(r * (p * e - f * v) - c * (n * e - o * v) + m * (n * f - o * p))),
                (t[2] = r * (h * e - u * v) - a * (n * e - o * v) + m * (n * u - o * h)),
                (t[3] = -(r * (h * f - u * p) - a * (n * f - o * p) + c * (n * u - o * h))),
                (t[4] = -(s * (p * e - f * v) - l * (h * e - u * v) + d * (h * f - u * p))),
                (t[5] = i * (p * e - f * v) - l * (n * e - o * v) + d * (n * f - o * p)),
                (t[6] = -(i * (h * e - u * v) - s * (n * e - o * v) + d * (n * u - o * h))),
                (t[7] = i * (h * f - u * p) - s * (n * f - o * p) + l * (n * u - o * h)),
                (t[8] = s * (c * e - f * m) - l * (a * e - u * m) + d * (a * f - u * c)),
                (t[9] = -(i * (c * e - f * m) - l * (r * e - o * m) + d * (r * f - o * c))),
                (t[10] = i * (a * e - u * m) - s * (r * e - o * m) + d * (r * u - o * a)),
                (t[11] = -(i * (a * f - u * c) - s * (r * f - o * c) + l * (r * u - o * a))),
                (t[12] = -(s * (c * v - p * m) - l * (a * v - h * m) + d * (a * p - h * c))),
                (t[13] = i * (c * v - p * m) - l * (r * v - n * m) + d * (r * p - n * c)),
                (t[14] = -(i * (a * v - h * m) - s * (r * v - n * m) + d * (r * h - n * a))),
                (t[15] = i * (a * p - h * c) - s * (r * p - n * c) + l * (r * h - n * a)),
                t
              );
            }),
            (i.determinant = function (t) {
              var e = t[0],
                i = t[1],
                r = t[2],
                n = t[3],
                o = t[4],
                s = t[5],
                a = t[6],
                h = t[7],
                u = t[8],
                l = t[9],
                c = t[10],
                p = t[11],
                f = t[12],
                d = t[13],
                m = t[14],
                t = t[15];
              return (
                (e * s - i * o) * (c * t - p * m) -
                (e * a - r * o) * (l * t - p * d) +
                (e * h - n * o) * (l * m - c * d) +
                (i * a - r * s) * (u * t - p * f) -
                (i * h - n * s) * (u * m - c * f) +
                (r * h - n * a) * (u * d - l * f)
              );
            }),
            (i.multiply = r),
            (i.translate = function (t, e, i) {
              var r,
                n,
                o,
                s,
                a,
                h,
                u,
                l,
                c,
                p,
                f,
                d = i[0],
                m = i[1],
                v = i[2];
              e === t
                ? ((t[12] = e[0] * d + e[4] * m + e[8] * v + e[12]),
                  (t[13] = e[1] * d + e[5] * m + e[9] * v + e[13]),
                  (t[14] = e[2] * d + e[6] * m + e[10] * v + e[14]),
                  (t[15] = e[3] * d + e[7] * m + e[11] * v + e[15]))
                : ((r = e[0]),
                  (n = e[1]),
                  (o = e[2]),
                  (s = e[3]),
                  (a = e[4]),
                  (h = e[5]),
                  (u = e[6]),
                  (l = e[7]),
                  (c = e[8]),
                  (p = e[9]),
                  (f = e[10]),
                  (i = e[11]),
                  (t[0] = r),
                  (t[1] = n),
                  (t[2] = o),
                  (t[3] = s),
                  (t[4] = a),
                  (t[5] = h),
                  (t[6] = u),
                  (t[7] = l),
                  (t[8] = c),
                  (t[9] = p),
                  (t[10] = f),
                  (t[11] = i),
                  (t[12] = r * d + a * m + c * v + e[12]),
                  (t[13] = n * d + h * m + p * v + e[13]),
                  (t[14] = o * d + u * m + f * v + e[14]),
                  (t[15] = s * d + l * m + i * v + e[15]));
              return t;
            }),
            (i.scale = function (t, e, i) {
              var r = i[0],
                n = i[1],
                i = i[2];
              return (
                (t[0] = e[0] * r),
                (t[1] = e[1] * r),
                (t[2] = e[2] * r),
                (t[3] = e[3] * r),
                (t[4] = e[4] * n),
                (t[5] = e[5] * n),
                (t[6] = e[6] * n),
                (t[7] = e[7] * n),
                (t[8] = e[8] * i),
                (t[9] = e[9] * i),
                (t[10] = e[10] * i),
                (t[11] = e[11] * i),
                (t[12] = e[12]),
                (t[13] = e[13]),
                (t[14] = e[14]),
                (t[15] = e[15]),
                t
              );
            }),
            (i.rotate = function (t, e, i, r) {
              var n,
                o,
                s,
                a,
                h,
                u,
                l,
                c,
                p,
                f,
                d,
                m,
                v,
                _,
                y,
                g,
                w,
                b,
                M,
                x = r[0],
                E = r[1],
                T = r[2],
                P = Math.hypot(x, E, T);
              if (P < O.EPSILON) return null;
              ((x *= P = 1 / P),
                (E *= P),
                (T *= P),
                (b = Math.sin(i)),
                (M = Math.cos(i)),
                (n = 1 - M),
                (o = e[0]),
                (s = e[1]),
                (a = e[2]),
                (h = e[3]),
                (u = e[4]),
                (l = e[5]),
                (c = e[6]),
                (p = e[7]),
                (f = e[8]),
                (d = e[9]),
                (m = e[10]),
                (v = e[11]),
                (_ = x * x * n + M),
                (y = E * x * n + T * b),
                (g = T * x * n - E * b),
                (w = x * E * n - T * b),
                (r = E * E * n + M),
                (P = T * E * n + x * b),
                (i = x * T * n + E * b),
                (b = E * T * n - x * b),
                (M = T * T * n + M),
                (t[0] = o * _ + u * y + f * g),
                (t[1] = s * _ + l * y + d * g),
                (t[2] = a * _ + c * y + m * g),
                (t[3] = h * _ + p * y + v * g),
                (t[4] = o * w + u * r + f * P),
                (t[5] = s * w + l * r + d * P),
                (t[6] = a * w + c * r + m * P),
                (t[7] = h * w + p * r + v * P),
                (t[8] = o * i + u * b + f * M),
                (t[9] = s * i + l * b + d * M),
                (t[10] = a * i + c * b + m * M),
                (t[11] = h * i + p * b + v * M),
                e !== t && ((t[12] = e[12]), (t[13] = e[13]), (t[14] = e[14]), (t[15] = e[15])));
              return t;
            }),
            (i.rotateX = function (t, e, i) {
              var r = Math.sin(i),
                n = Math.cos(i),
                o = e[4],
                s = e[5],
                a = e[6],
                h = e[7],
                u = e[8],
                l = e[9],
                c = e[10],
                i = e[11];
              e !== t &&
                ((t[0] = e[0]),
                (t[1] = e[1]),
                (t[2] = e[2]),
                (t[3] = e[3]),
                (t[12] = e[12]),
                (t[13] = e[13]),
                (t[14] = e[14]),
                (t[15] = e[15]));
              return (
                (t[4] = o * n + u * r),
                (t[5] = s * n + l * r),
                (t[6] = a * n + c * r),
                (t[7] = h * n + i * r),
                (t[8] = u * n - o * r),
                (t[9] = l * n - s * r),
                (t[10] = c * n - a * r),
                (t[11] = i * n - h * r),
                t
              );
            }),
            (i.rotateY = function (t, e, i) {
              var r = Math.sin(i),
                n = Math.cos(i),
                o = e[0],
                s = e[1],
                a = e[2],
                h = e[3],
                u = e[8],
                l = e[9],
                c = e[10],
                i = e[11];
              e !== t &&
                ((t[4] = e[4]),
                (t[5] = e[5]),
                (t[6] = e[6]),
                (t[7] = e[7]),
                (t[12] = e[12]),
                (t[13] = e[13]),
                (t[14] = e[14]),
                (t[15] = e[15]));
              return (
                (t[0] = o * n - u * r),
                (t[1] = s * n - l * r),
                (t[2] = a * n - c * r),
                (t[3] = h * n - i * r),
                (t[8] = o * r + u * n),
                (t[9] = s * r + l * n),
                (t[10] = a * r + c * n),
                (t[11] = h * r + i * n),
                t
              );
            }),
            (i.rotateZ = function (t, e, i) {
              var r = Math.sin(i),
                n = Math.cos(i),
                o = e[0],
                s = e[1],
                a = e[2],
                h = e[3],
                u = e[4],
                l = e[5],
                c = e[6],
                i = e[7];
              e !== t &&
                ((t[8] = e[8]),
                (t[9] = e[9]),
                (t[10] = e[10]),
                (t[11] = e[11]),
                (t[12] = e[12]),
                (t[13] = e[13]),
                (t[14] = e[14]),
                (t[15] = e[15]));
              return (
                (t[0] = o * n + u * r),
                (t[1] = s * n + l * r),
                (t[2] = a * n + c * r),
                (t[3] = h * n + i * r),
                (t[4] = u * n - o * r),
                (t[5] = l * n - s * r),
                (t[6] = c * n - a * r),
                (t[7] = i * n - h * r),
                t
              );
            }),
            (i.fromTranslation = function (t, e) {
              return (
                (t[0] = 1),
                (t[1] = 0),
                (t[2] = 0),
                (t[3] = 0),
                (t[4] = 0),
                (t[5] = 1),
                (t[6] = 0),
                (t[7] = 0),
                (t[8] = 0),
                (t[9] = 0),
                (t[10] = 1),
                (t[11] = 0),
                (t[12] = e[0]),
                (t[13] = e[1]),
                (t[14] = e[2]),
                (t[15] = 1),
                t
              );
            }),
            (i.fromScaling = function (t, e) {
              return (
                (t[0] = e[0]),
                (t[1] = 0),
                (t[2] = 0),
                (t[3] = 0),
                (t[4] = 0),
                (t[5] = e[1]),
                (t[6] = 0),
                (t[7] = 0),
                (t[8] = 0),
                (t[9] = 0),
                (t[10] = e[2]),
                (t[11] = 0),
                (t[12] = 0),
                (t[13] = 0),
                (t[14] = 0),
                (t[15] = 1),
                t
              );
            }),
            (i.fromRotation = function (t, e, i) {
              var r = i[0],
                n = i[1],
                o = i[2],
                s = Math.hypot(r, n, o);
              if (s < O.EPSILON) return null;
              return (
                (r *= s = 1 / s),
                (n *= s),
                (o *= s),
                (i = Math.sin(e)),
                (s = Math.cos(e)),
                (e = 1 - s),
                (t[0] = r * r * e + s),
                (t[1] = n * r * e + o * i),
                (t[2] = o * r * e - n * i),
                (t[3] = 0),
                (t[4] = r * n * e - o * i),
                (t[5] = n * n * e + s),
                (t[6] = o * n * e + r * i),
                (t[7] = 0),
                (t[8] = r * o * e + n * i),
                (t[9] = n * o * e - r * i),
                (t[10] = o * o * e + s),
                (t[11] = 0),
                (t[12] = 0),
                (t[13] = 0),
                (t[14] = 0),
                (t[15] = 1),
                t
              );
            }),
            (i.fromXRotation = function (t, e) {
              var i = Math.sin(e),
                e = Math.cos(e);
              return (
                (t[0] = 1),
                (t[1] = 0),
                (t[2] = 0),
                (t[3] = 0),
                (t[4] = 0),
                (t[5] = e),
                (t[6] = i),
                (t[7] = 0),
                (t[8] = 0),
                (t[9] = -i),
                (t[10] = e),
                (t[11] = 0),
                (t[12] = 0),
                (t[13] = 0),
                (t[14] = 0),
                (t[15] = 1),
                t
              );
            }),
            (i.fromYRotation = function (t, e) {
              var i = Math.sin(e),
                e = Math.cos(e);
              return (
                (t[0] = e),
                (t[1] = 0),
                (t[2] = -i),
                (t[3] = 0),
                (t[4] = 0),
                (t[5] = 1),
                (t[6] = 0),
                (t[7] = 0),
                (t[8] = i),
                (t[9] = 0),
                (t[10] = e),
                (t[11] = 0),
                (t[12] = 0),
                (t[13] = 0),
                (t[14] = 0),
                (t[15] = 1),
                t
              );
            }),
            (i.fromZRotation = function (t, e) {
              var i = Math.sin(e),
                e = Math.cos(e);
              return (
                (t[0] = e),
                (t[1] = i),
                (t[2] = 0),
                (t[3] = 0),
                (t[4] = -i),
                (t[5] = e),
                (t[6] = 0),
                (t[7] = 0),
                (t[8] = 0),
                (t[9] = 0),
                (t[10] = 1),
                (t[11] = 0),
                (t[12] = 0),
                (t[13] = 0),
                (t[14] = 0),
                (t[15] = 1),
                t
              );
            }),
            (i.fromRotationTranslation = p),
            (i.fromQuat2 = function (t, e) {
              var i = new O.ARRAY_TYPE(3),
                r = -e[0],
                n = -e[1],
                o = -e[2],
                s = e[3],
                a = e[4],
                h = e[5],
                u = e[6],
                l = e[7],
                c = r * r + n * n + o * o + s * s;
              0 < c
                ? ((i[0] = (2 * (a * s + l * r + h * o - u * n)) / c),
                  (i[1] = (2 * (h * s + l * n + u * r - a * o)) / c),
                  (i[2] = (2 * (u * s + l * o + a * n - h * r)) / c))
                : ((i[0] = 2 * (a * s + l * r + h * o - u * n)),
                  (i[1] = 2 * (h * s + l * n + u * r - a * o)),
                  (i[2] = 2 * (u * s + l * o + a * n - h * r)));
              return (p(t, e, i), t);
            }),
            (i.getTranslation = function (t, e) {
              return ((t[0] = e[12]), (t[1] = e[13]), (t[2] = e[14]), t);
            }),
            (i.getScaling = f),
            (i.getRotation = function (t, e) {
              var i = new O.ARRAY_TYPE(3);
              f(i, e);
              var r = 1 / i[0],
                n = 1 / i[1],
                o = 1 / i[2],
                s = e[0] * r,
                a = e[1] * n,
                h = e[2] * o,
                u = e[4] * r,
                l = e[5] * n,
                c = e[6] * o,
                i = e[8] * r,
                r = e[9] * n,
                n = e[10] * o,
                e = s + l + n,
                o = 0;
              0 < e
                ? ((o = 2 * Math.sqrt(1 + e)),
                  (t[3] = 0.25 * o),
                  (t[0] = (c - r) / o),
                  (t[1] = (i - h) / o),
                  (t[2] = (a - u) / o))
                : l < s && n < s
                  ? ((o = 2 * Math.sqrt(1 + s - l - n)),
                    (t[3] = (c - r) / o),
                    (t[0] = 0.25 * o),
                    (t[1] = (a + u) / o),
                    (t[2] = (i + h) / o))
                  : n < l
                    ? ((o = 2 * Math.sqrt(1 + l - s - n)),
                      (t[3] = (i - h) / o),
                      (t[0] = (a + u) / o),
                      (t[1] = 0.25 * o),
                      (t[2] = (c + r) / o))
                    : ((o = 2 * Math.sqrt(1 + n - s - l)),
                      (t[3] = (a - u) / o),
                      (t[0] = (i + h) / o),
                      (t[1] = (c + r) / o),
                      (t[2] = 0.25 * o));
              return t;
            }),
            (i.fromRotationTranslationScale = function (t, e, i, r) {
              var n = e[0],
                o = e[1],
                s = e[2],
                a = e[3],
                h = n + n,
                u = o + o,
                l = s + s,
                c = n * h,
                p = n * u,
                f = n * l,
                e = o * u,
                n = o * l,
                o = s * l,
                s = a * h,
                h = a * u,
                u = a * l,
                a = r[0],
                l = r[1],
                r = r[2];
              return (
                (t[0] = (1 - (e + o)) * a),
                (t[1] = (p + u) * a),
                (t[2] = (f - h) * a),
                (t[3] = 0),
                (t[4] = (p - u) * l),
                (t[5] = (1 - (c + o)) * l),
                (t[6] = (n + s) * l),
                (t[7] = 0),
                (t[8] = (f + h) * r),
                (t[9] = (n - s) * r),
                (t[10] = (1 - (c + e)) * r),
                (t[11] = 0),
                (t[12] = i[0]),
                (t[13] = i[1]),
                (t[14] = i[2]),
                (t[15] = 1),
                t
              );
            }),
            (i.fromRotationTranslationScaleOrigin = function (t, e, i, r, n) {
              var o = e[0],
                s = e[1],
                a = e[2],
                h = e[3],
                u = o + o,
                l = s + s,
                c = a + a,
                p = o * u,
                f = o * l,
                d = o * c,
                m = s * l,
                v = s * c,
                _ = a * c,
                y = h * u,
                e = h * l,
                o = h * c,
                s = r[0],
                a = r[1],
                u = r[2],
                l = n[0],
                h = n[1],
                c = n[2],
                r = (1 - (m + _)) * s,
                n = (f + o) * s,
                s = (d - e) * s,
                o = (f - o) * a,
                _ = (1 - (p + _)) * a,
                a = (v + y) * a,
                e = (d + e) * u,
                y = (v - y) * u,
                u = (1 - (p + m)) * u;
              return (
                (t[0] = r),
                (t[1] = n),
                (t[2] = s),
                (t[3] = 0),
                (t[4] = o),
                (t[5] = _),
                (t[6] = a),
                (t[7] = 0),
                (t[8] = e),
                (t[9] = y),
                (t[10] = u),
                (t[11] = 0),
                (t[12] = i[0] + l - (r * l + o * h + e * c)),
                (t[13] = i[1] + h - (n * l + _ * h + y * c)),
                (t[14] = i[2] + c - (s * l + a * h + u * c)),
                (t[15] = 1),
                t
              );
            }),
            (i.fromQuat = function (t, e) {
              var i = e[0],
                r = e[1],
                n = e[2],
                o = e[3],
                s = i + i,
                a = r + r,
                h = n + n,
                u = i * s,
                l = r * s,
                e = r * a,
                i = n * s,
                r = n * a,
                n = n * h,
                s = o * s,
                a = o * a,
                h = o * h;
              return (
                (t[0] = 1 - e - n),
                (t[1] = l + h),
                (t[2] = i - a),
                (t[3] = 0),
                (t[4] = l - h),
                (t[5] = 1 - u - n),
                (t[6] = r + s),
                (t[7] = 0),
                (t[8] = i + a),
                (t[9] = r - s),
                (t[10] = 1 - u - e),
                (t[11] = 0),
                (t[12] = 0),
                (t[13] = 0),
                (t[14] = 0),
                (t[15] = 1),
                t
              );
            }),
            (i.frustum = function (t, e, i, r, n, o, s) {
              var a = 1 / (i - e),
                h = 1 / (n - r),
                u = 1 / (o - s);
              return (
                (t[0] = 2 * o * a),
                (t[1] = 0),
                (t[2] = 0),
                (t[3] = 0),
                (t[4] = 0),
                (t[5] = 2 * o * h),
                (t[6] = 0),
                (t[7] = 0),
                (t[8] = (i + e) * a),
                (t[9] = (n + r) * h),
                (t[10] = (s + o) * u),
                (t[11] = -1),
                (t[12] = 0),
                (t[13] = 0),
                (t[14] = s * o * 2 * u),
                (t[15] = 0),
                t
              );
            }),
            (i.perspective = function (t, e, i, r, n) {
              e = 1 / Math.tan(e / 2);
              ((t[0] = e / i),
                (t[1] = 0),
                (t[2] = 0),
                (t[3] = 0),
                (t[4] = 0),
                (t[5] = e),
                (t[6] = 0),
                (t[7] = 0),
                (t[8] = 0),
                (t[9] = 0),
                (t[11] = -1),
                (t[12] = 0),
                (t[13] = 0),
                (t[15] = 0),
                null != n && n !== 1 / 0
                  ? ((e = 1 / (r - n)), (t[10] = (n + r) * e), (t[14] = 2 * n * r * e))
                  : ((t[10] = -1), (t[14] = -2 * r)));
              return t;
            }),
            (i.perspectiveFromFieldOfView = function (t, e, i, r) {
              var n = Math.tan((e.upDegrees * Math.PI) / 180),
                o = Math.tan((e.downDegrees * Math.PI) / 180),
                s = Math.tan((e.leftDegrees * Math.PI) / 180),
                a = Math.tan((e.rightDegrees * Math.PI) / 180),
                h = 2 / (s + a),
                e = 2 / (n + o);
              return (
                (t[0] = h),
                (t[1] = 0),
                (t[2] = 0),
                (t[3] = 0),
                (t[4] = 0),
                (t[5] = e),
                (t[6] = 0),
                (t[7] = 0),
                (t[8] = -(s - a) * h * 0.5),
                (t[9] = (n - o) * e * 0.5),
                (t[10] = r / (i - r)),
                (t[11] = -1),
                (t[12] = 0),
                (t[13] = 0),
                (t[14] = (r * i) / (i - r)),
                (t[15] = 0),
                t
              );
            }),
            (i.ortho = function (t, e, i, r, n, o, s) {
              var a = 1 / (e - i),
                h = 1 / (r - n),
                u = 1 / (o - s);
              return (
                (t[0] = -2 * a),
                (t[1] = 0),
                (t[2] = 0),
                (t[3] = 0),
                (t[4] = 0),
                (t[5] = -2 * h),
                (t[6] = 0),
                (t[7] = 0),
                (t[8] = 0),
                (t[9] = 0),
                (t[10] = 2 * u),
                (t[11] = 0),
                (t[12] = (e + i) * a),
                (t[13] = (n + r) * h),
                (t[14] = (s + o) * u),
                (t[15] = 1),
                t
              );
            }),
            (i.lookAt = function (t, e, i, r) {
              var n,
                o = e[0],
                s = e[1],
                a = e[2],
                h = r[0],
                u = r[1],
                l = r[2],
                c = i[0],
                p = i[1],
                f = i[2];
              if (
                Math.abs(o - c) < O.EPSILON &&
                Math.abs(s - p) < O.EPSILON &&
                Math.abs(a - f) < O.EPSILON
              )
                return d(t);
              ((n = o - c),
                (e = s - p),
                (r = a - f),
                (i = 1 / Math.hypot(n, e, r)),
                (c = u * (r *= i) - l * (e *= i)),
                (p = l * (n *= i) - h * r),
                (f = h * e - u * n),
                (i = Math.hypot(c, p, f))
                  ? ((c *= i = 1 / i), (p *= i), (f *= i))
                  : (f = p = c = 0));
              ((l = e * f - r * p),
                (h = r * c - n * f),
                (u = n * p - e * c),
                (i = Math.hypot(l, h, u))
                  ? ((l *= i = 1 / i), (h *= i), (u *= i))
                  : (u = h = l = 0));
              return (
                (t[0] = c),
                (t[1] = l),
                (t[2] = n),
                (t[3] = 0),
                (t[4] = p),
                (t[5] = h),
                (t[6] = e),
                (t[7] = 0),
                (t[8] = f),
                (t[9] = u),
                (t[10] = r),
                (t[11] = 0),
                (t[12] = -(c * o + p * s + f * a)),
                (t[13] = -(l * o + h * s + u * a)),
                (t[14] = -(n * o + e * s + r * a)),
                (t[15] = 1),
                t
              );
            }),
            (i.targetTo = function (t, e, i, r) {
              var n = e[0],
                o = e[1],
                s = e[2],
                a = r[0],
                h = r[1],
                u = r[2],
                l = n - i[0],
                c = o - i[1],
                e = s - i[2],
                r = l * l + c * c + e * e;
              0 < r && ((r = 1 / Math.sqrt(r)), (l *= r), (c *= r), (e *= r));
              ((i = h * e - u * c), (u = u * l - a * e), (h = a * c - h * l));
              0 < (r = i * i + u * u + h * h) &&
                ((r = 1 / Math.sqrt(r)), (i *= r), (u *= r), (h *= r));
              return (
                (t[0] = i),
                (t[1] = u),
                (t[2] = h),
                (t[3] = 0),
                (t[4] = c * h - e * u),
                (t[5] = e * i - l * h),
                (t[6] = l * u - c * i),
                (t[7] = 0),
                (t[8] = l),
                (t[9] = c),
                (t[10] = e),
                (t[11] = 0),
                (t[12] = n),
                (t[13] = o),
                (t[14] = s),
                (t[15] = 1),
                t
              );
            }),
            (i.str = function (t) {
              return (
                'mat4(' +
                t[0] +
                ', ' +
                t[1] +
                ', ' +
                t[2] +
                ', ' +
                t[3] +
                ', ' +
                t[4] +
                ', ' +
                t[5] +
                ', ' +
                t[6] +
                ', ' +
                t[7] +
                ', ' +
                t[8] +
                ', ' +
                t[9] +
                ', ' +
                t[10] +
                ', ' +
                t[11] +
                ', ' +
                t[12] +
                ', ' +
                t[13] +
                ', ' +
                t[14] +
                ', ' +
                t[15] +
                ')'
              );
            }),
            (i.frob = function (t) {
              return Math.hypot(
                t[0],
                t[1],
                t[2],
                t[3],
                t[4],
                t[5],
                t[6],
                t[7],
                t[8],
                t[9],
                t[10],
                t[11],
                t[12],
                t[13],
                t[14],
                t[15]
              );
            }),
            (i.add = function (t, e, i) {
              return (
                (t[0] = e[0] + i[0]),
                (t[1] = e[1] + i[1]),
                (t[2] = e[2] + i[2]),
                (t[3] = e[3] + i[3]),
                (t[4] = e[4] + i[4]),
                (t[5] = e[5] + i[5]),
                (t[6] = e[6] + i[6]),
                (t[7] = e[7] + i[7]),
                (t[8] = e[8] + i[8]),
                (t[9] = e[9] + i[9]),
                (t[10] = e[10] + i[10]),
                (t[11] = e[11] + i[11]),
                (t[12] = e[12] + i[12]),
                (t[13] = e[13] + i[13]),
                (t[14] = e[14] + i[14]),
                (t[15] = e[15] + i[15]),
                t
              );
            }),
            (i.subtract = n),
            (i.multiplyScalar = function (t, e, i) {
              return (
                (t[0] = e[0] * i),
                (t[1] = e[1] * i),
                (t[2] = e[2] * i),
                (t[3] = e[3] * i),
                (t[4] = e[4] * i),
                (t[5] = e[5] * i),
                (t[6] = e[6] * i),
                (t[7] = e[7] * i),
                (t[8] = e[8] * i),
                (t[9] = e[9] * i),
                (t[10] = e[10] * i),
                (t[11] = e[11] * i),
                (t[12] = e[12] * i),
                (t[13] = e[13] * i),
                (t[14] = e[14] * i),
                (t[15] = e[15] * i),
                t
              );
            }),
            (i.multiplyScalarAndAdd = function (t, e, i, r) {
              return (
                (t[0] = e[0] + i[0] * r),
                (t[1] = e[1] + i[1] * r),
                (t[2] = e[2] + i[2] * r),
                (t[3] = e[3] + i[3] * r),
                (t[4] = e[4] + i[4] * r),
                (t[5] = e[5] + i[5] * r),
                (t[6] = e[6] + i[6] * r),
                (t[7] = e[7] + i[7] * r),
                (t[8] = e[8] + i[8] * r),
                (t[9] = e[9] + i[9] * r),
                (t[10] = e[10] + i[10] * r),
                (t[11] = e[11] + i[11] * r),
                (t[12] = e[12] + i[12] * r),
                (t[13] = e[13] + i[13] * r),
                (t[14] = e[14] + i[14] * r),
                (t[15] = e[15] + i[15] * r),
                t
              );
            }),
            (i.exactEquals = function (t, e) {
              return (
                t[0] === e[0] &&
                t[1] === e[1] &&
                t[2] === e[2] &&
                t[3] === e[3] &&
                t[4] === e[4] &&
                t[5] === e[5] &&
                t[6] === e[6] &&
                t[7] === e[7] &&
                t[8] === e[8] &&
                t[9] === e[9] &&
                t[10] === e[10] &&
                t[11] === e[11] &&
                t[12] === e[12] &&
                t[13] === e[13] &&
                t[14] === e[14] &&
                t[15] === e[15]
              );
            }),
            (i.equals = function (t, e) {
              var i = t[0],
                r = t[1],
                n = t[2],
                o = t[3],
                s = t[4],
                a = t[5],
                h = t[6],
                u = t[7],
                l = t[8],
                c = t[9],
                p = t[10],
                f = t[11],
                d = t[12],
                m = t[13],
                v = t[14],
                _ = t[15],
                y = e[0],
                g = e[1],
                w = e[2],
                b = e[3],
                M = e[4],
                x = e[5],
                E = e[6],
                T = e[7],
                P = e[8],
                L = e[9],
                S = e[10],
                C = e[11],
                R = e[12],
                A = e[13],
                t = e[14],
                e = e[15];
              return (
                Math.abs(i - y) <= O.EPSILON * Math.max(1, Math.abs(i), Math.abs(y)) &&
                Math.abs(r - g) <= O.EPSILON * Math.max(1, Math.abs(r), Math.abs(g)) &&
                Math.abs(n - w) <= O.EPSILON * Math.max(1, Math.abs(n), Math.abs(w)) &&
                Math.abs(o - b) <= O.EPSILON * Math.max(1, Math.abs(o), Math.abs(b)) &&
                Math.abs(s - M) <= O.EPSILON * Math.max(1, Math.abs(s), Math.abs(M)) &&
                Math.abs(a - x) <= O.EPSILON * Math.max(1, Math.abs(a), Math.abs(x)) &&
                Math.abs(h - E) <= O.EPSILON * Math.max(1, Math.abs(h), Math.abs(E)) &&
                Math.abs(u - T) <= O.EPSILON * Math.max(1, Math.abs(u), Math.abs(T)) &&
                Math.abs(l - P) <= O.EPSILON * Math.max(1, Math.abs(l), Math.abs(P)) &&
                Math.abs(c - L) <= O.EPSILON * Math.max(1, Math.abs(c), Math.abs(L)) &&
                Math.abs(p - S) <= O.EPSILON * Math.max(1, Math.abs(p), Math.abs(S)) &&
                Math.abs(f - C) <= O.EPSILON * Math.max(1, Math.abs(f), Math.abs(C)) &&
                Math.abs(d - R) <= O.EPSILON * Math.max(1, Math.abs(d), Math.abs(R)) &&
                Math.abs(m - A) <= O.EPSILON * Math.max(1, Math.abs(m), Math.abs(A)) &&
                Math.abs(v - t) <= O.EPSILON * Math.max(1, Math.abs(v), Math.abs(t)) &&
                Math.abs(_ - e) <= O.EPSILON * Math.max(1, Math.abs(_), Math.abs(e))
              );
            }),
            (i.sub = i.mul = void 0));
          var O = (function (t) {
            if (t && t.__esModule) return t;
            if (null === t || ('object' !== s(t) && 'function' != typeof t)) return { default: t };
            var e = a();
            if (e && e.has(t)) return e.get(t);
            var i,
              r = {},
              n = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (i in t) {
              var o;
              Object.prototype.hasOwnProperty.call(t, i) &&
                ((o = n ? Object.getOwnPropertyDescriptor(t, i) : null) && (o.get || o.set)
                  ? Object.defineProperty(r, i, o)
                  : (r[i] = t[i]));
            }
            ((r.default = t), e && e.set(t, r));
            return r;
          })(t('./common.js'));
          function a() {
            if ('function' != typeof WeakMap) return null;
            var t = new WeakMap();
            return (
              (a = function () {
                return t;
              }),
              t
            );
          }
          function d(t) {
            return (
              (t[0] = 1),
              (t[1] = 0),
              (t[2] = 0),
              (t[3] = 0),
              (t[4] = 0),
              (t[5] = 1),
              (t[6] = 0),
              (t[7] = 0),
              (t[8] = 0),
              (t[9] = 0),
              (t[10] = 1),
              (t[11] = 0),
              (t[12] = 0),
              (t[13] = 0),
              (t[14] = 0),
              (t[15] = 1),
              t
            );
          }
          function r(t, e, i) {
            var r = e[0],
              n = e[1],
              o = e[2],
              s = e[3],
              a = e[4],
              h = e[5],
              u = e[6],
              l = e[7],
              c = e[8],
              p = e[9],
              f = e[10],
              d = e[11],
              m = e[12],
              v = e[13],
              _ = e[14],
              y = e[15],
              g = i[0],
              w = i[1],
              b = i[2],
              e = i[3];
            return (
              (t[0] = g * r + w * a + b * c + e * m),
              (t[1] = g * n + w * h + b * p + e * v),
              (t[2] = g * o + w * u + b * f + e * _),
              (t[3] = g * s + w * l + b * d + e * y),
              (g = i[4]),
              (w = i[5]),
              (b = i[6]),
              (e = i[7]),
              (t[4] = g * r + w * a + b * c + e * m),
              (t[5] = g * n + w * h + b * p + e * v),
              (t[6] = g * o + w * u + b * f + e * _),
              (t[7] = g * s + w * l + b * d + e * y),
              (g = i[8]),
              (w = i[9]),
              (b = i[10]),
              (e = i[11]),
              (t[8] = g * r + w * a + b * c + e * m),
              (t[9] = g * n + w * h + b * p + e * v),
              (t[10] = g * o + w * u + b * f + e * _),
              (t[11] = g * s + w * l + b * d + e * y),
              (g = i[12]),
              (w = i[13]),
              (b = i[14]),
              (e = i[15]),
              (t[12] = g * r + w * a + b * c + e * m),
              (t[13] = g * n + w * h + b * p + e * v),
              (t[14] = g * o + w * u + b * f + e * _),
              (t[15] = g * s + w * l + b * d + e * y),
              t
            );
          }
          function p(t, e, i) {
            var r = e[0],
              n = e[1],
              o = e[2],
              s = e[3],
              a = r + r,
              h = n + n,
              u = o + o,
              l = r * a,
              c = r * h,
              e = r * u,
              r = n * h,
              n = n * u,
              o = o * u,
              a = s * a,
              h = s * h,
              u = s * u;
            return (
              (t[0] = 1 - (r + o)),
              (t[1] = c + u),
              (t[2] = e - h),
              (t[3] = 0),
              (t[4] = c - u),
              (t[5] = 1 - (l + o)),
              (t[6] = n + a),
              (t[7] = 0),
              (t[8] = e + h),
              (t[9] = n - a),
              (t[10] = 1 - (l + r)),
              (t[11] = 0),
              (t[12] = i[0]),
              (t[13] = i[1]),
              (t[14] = i[2]),
              (t[15] = 1),
              t
            );
          }
          function f(t, e) {
            var i = e[0],
              r = e[1],
              n = e[2],
              o = e[4],
              s = e[5],
              a = e[6],
              h = e[8],
              u = e[9],
              e = e[10];
            return (
              (t[0] = Math.hypot(i, r, n)),
              (t[1] = Math.hypot(o, s, a)),
              (t[2] = Math.hypot(h, u, e)),
              t
            );
          }
          function n(t, e, i) {
            return (
              (t[0] = e[0] - i[0]),
              (t[1] = e[1] - i[1]),
              (t[2] = e[2] - i[2]),
              (t[3] = e[3] - i[3]),
              (t[4] = e[4] - i[4]),
              (t[5] = e[5] - i[5]),
              (t[6] = e[6] - i[6]),
              (t[7] = e[7] - i[7]),
              (t[8] = e[8] - i[8]),
              (t[9] = e[9] - i[9]),
              (t[10] = e[10] - i[10]),
              (t[11] = e[11] - i[11]),
              (t[12] = e[12] - i[12]),
              (t[13] = e[13] - i[13]),
              (t[14] = e[14] - i[14]),
              (t[15] = e[15] - i[15]),
              t
            );
          }
          ((i.mul = r), (i.sub = n));
        },
        { './common.js': 2 },
      ],
      8: [
        function (t, e, i) {
          'use strict';
          function s(t) {
            return (s =
              'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                ? function (t) {
                    return typeof t;
                  }
                : function (t) {
                    return t &&
                      'function' == typeof Symbol &&
                      t.constructor === Symbol &&
                      t !== Symbol.prototype
                      ? 'symbol'
                      : typeof t;
                  })(t);
          }
          (Object.defineProperty(i, '__esModule', { value: !0 }),
            (i.create = u),
            (i.identity = function (t) {
              return ((t[0] = 0), (t[1] = 0), (t[2] = 0), (t[3] = 1), t);
            }),
            (i.setAxisAngle = l),
            (i.getAxisAngle = function (t, e) {
              var i = 2 * Math.acos(e[3]),
                r = Math.sin(i / 2);
              r > f.EPSILON
                ? ((t[0] = e[0] / r), (t[1] = e[1] / r), (t[2] = e[2] / r))
                : ((t[0] = 1), (t[1] = 0), (t[2] = 0));
              return i;
            }),
            (i.getAngle = function (t, e) {
              e = y(t, e);
              return Math.acos(2 * e * e - 1);
            }),
            (i.multiply = c),
            (i.rotateX = function (t, e, i) {
              i *= 0.5;
              var r = e[0],
                n = e[1],
                o = e[2],
                s = e[3],
                e = Math.sin(i),
                i = Math.cos(i);
              return (
                (t[0] = r * i + s * e),
                (t[1] = n * i + o * e),
                (t[2] = o * i - n * e),
                (t[3] = s * i - r * e),
                t
              );
            }),
            (i.rotateY = function (t, e, i) {
              i *= 0.5;
              var r = e[0],
                n = e[1],
                o = e[2],
                s = e[3],
                e = Math.sin(i),
                i = Math.cos(i);
              return (
                (t[0] = r * i - o * e),
                (t[1] = n * i + s * e),
                (t[2] = o * i + r * e),
                (t[3] = s * i - n * e),
                t
              );
            }),
            (i.rotateZ = function (t, e, i) {
              i *= 0.5;
              var r = e[0],
                n = e[1],
                o = e[2],
                s = e[3],
                e = Math.sin(i),
                i = Math.cos(i);
              return (
                (t[0] = r * i + n * e),
                (t[1] = n * i - r * e),
                (t[2] = o * i + s * e),
                (t[3] = s * i - o * e),
                t
              );
            }),
            (i.calculateW = function (t, e) {
              var i = e[0],
                r = e[1],
                e = e[2];
              return (
                (t[0] = i),
                (t[1] = r),
                (t[2] = e),
                (t[3] = Math.sqrt(Math.abs(1 - i * i - r * r - e * e))),
                t
              );
            }),
            (i.exp = p),
            (i.ln = d),
            (i.pow = function (t, e, i) {
              return (d(t, e), _(t, t, i), p(t, t), t);
            }),
            (i.slerp = m),
            (i.random = function (t) {
              var e = f.RANDOM(),
                i = f.RANDOM(),
                r = f.RANDOM(),
                n = Math.sqrt(1 - e),
                e = Math.sqrt(e);
              return (
                (t[0] = n * Math.sin(2 * Math.PI * i)),
                (t[1] = n * Math.cos(2 * Math.PI * i)),
                (t[2] = e * Math.sin(2 * Math.PI * r)),
                (t[3] = e * Math.cos(2 * Math.PI * r)),
                t
              );
            }),
            (i.invert = function (t, e) {
              var i = e[0],
                r = e[1],
                n = e[2],
                o = e[3],
                e = i * i + r * r + n * n + o * o,
                e = e ? 1 / e : 0;
              return ((t[0] = -i * e), (t[1] = -r * e), (t[2] = -n * e), (t[3] = o * e), t);
            }),
            (i.conjugate = function (t, e) {
              return ((t[0] = -e[0]), (t[1] = -e[1]), (t[2] = -e[2]), (t[3] = e[3]), t);
            }),
            (i.fromMat3 = v),
            (i.fromEuler = function (t, e, i, r) {
              var n = (0.5 * Math.PI) / 180;
              ((e *= n), (i *= n), (r *= n));
              var o = Math.sin(e),
                s = Math.cos(e),
                n = Math.sin(i),
                e = Math.cos(i),
                i = Math.sin(r),
                r = Math.cos(r);
              return (
                (t[0] = o * e * r - s * n * i),
                (t[1] = s * n * r + o * e * i),
                (t[2] = s * e * i - o * n * r),
                (t[3] = s * e * r + o * n * i),
                t
              );
            }),
            (i.str = function (t) {
              return 'quat(' + t[0] + ', ' + t[1] + ', ' + t[2] + ', ' + t[3] + ')';
            }),
            (i.setAxes =
              i.sqlerp =
              i.rotationTo =
              i.equals =
              i.exactEquals =
              i.normalize =
              i.sqrLen =
              i.squaredLength =
              i.len =
              i.length =
              i.lerp =
              i.dot =
              i.scale =
              i.mul =
              i.add =
              i.set =
              i.copy =
              i.fromValues =
              i.clone =
                void 0));
          var f = h(t('./common.js')),
            r = h(t('./mat3.js')),
            n = h(t('./vec3.js')),
            o = h(t('./vec4.js'));
          function a() {
            if ('function' != typeof WeakMap) return null;
            var t = new WeakMap();
            return (
              (a = function () {
                return t;
              }),
              t
            );
          }
          function h(t) {
            if (t && t.__esModule) return t;
            if (null === t || ('object' !== s(t) && 'function' != typeof t)) return { default: t };
            var e = a();
            if (e && e.has(t)) return e.get(t);
            var i,
              r,
              n = {},
              o = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (i in t)
              Object.prototype.hasOwnProperty.call(t, i) &&
                ((r = o ? Object.getOwnPropertyDescriptor(t, i) : null) && (r.get || r.set)
                  ? Object.defineProperty(n, i, r)
                  : (n[i] = t[i]));
            return ((n.default = t), e && e.set(t, n), n);
          }
          function u() {
            var t = new f.ARRAY_TYPE(4);
            return (
              f.ARRAY_TYPE != Float32Array && ((t[0] = 0), (t[1] = 0), (t[2] = 0)),
              (t[3] = 1),
              t
            );
          }
          function l(t, e, i) {
            i *= 0.5;
            var r = Math.sin(i);
            return (
              (t[0] = r * e[0]),
              (t[1] = r * e[1]),
              (t[2] = r * e[2]),
              (t[3] = Math.cos(i)),
              t
            );
          }
          function c(t, e, i) {
            var r = e[0],
              n = e[1],
              o = e[2],
              s = e[3],
              a = i[0],
              h = i[1],
              e = i[2],
              i = i[3];
            return (
              (t[0] = r * i + s * a + n * e - o * h),
              (t[1] = n * i + s * h + o * a - r * e),
              (t[2] = o * i + s * e + r * h - n * a),
              (t[3] = s * i - r * a - n * h - o * e),
              t
            );
          }
          function p(t, e) {
            var i = e[0],
              r = e[1],
              n = e[2],
              o = e[3],
              s = Math.sqrt(i * i + r * r + n * n),
              e = Math.exp(o),
              o = 0 < s ? (e * Math.sin(s)) / s : 0;
            return ((t[0] = i * o), (t[1] = r * o), (t[2] = n * o), (t[3] = e * Math.cos(s)), t);
          }
          function d(t, e) {
            var i = e[0],
              r = e[1],
              n = e[2],
              o = e[3],
              e = Math.sqrt(i * i + r * r + n * n),
              e = 0 < e ? Math.atan2(e, o) / e : 0;
            return (
              (t[0] = i * e),
              (t[1] = r * e),
              (t[2] = n * e),
              (t[3] = 0.5 * Math.log(i * i + r * r + n * n + o * o)),
              t
            );
          }
          function m(t, e, i, r) {
            var n,
              o = e[0],
              s = e[1],
              a = e[2],
              h = e[3],
              u = i[0],
              l = i[1],
              c = i[2],
              p = i[3],
              e = o * u + s * l + a * c + h * p;
            return (
              e < 0 && ((e = -e), (u = -u), (l = -l), (c = -c), (p = -p)),
              (r =
                1 - e > f.EPSILON
                  ? ((i = Math.acos(e)),
                    (e = Math.sin(i)),
                    (n = Math.sin((1 - r) * i) / e),
                    Math.sin(r * i) / e)
                  : ((n = 1 - r), r)),
              (t[0] = n * o + r * u),
              (t[1] = n * s + r * l),
              (t[2] = n * a + r * c),
              (t[3] = n * h + r * p),
              t
            );
          }
          function v(t, e) {
            var i,
              r,
              n,
              o = e[0] + e[4] + e[8];
            return (
              0 < o
                ? ((n = Math.sqrt(o + 1)),
                  (t[3] = 0.5 * n),
                  (n = 0.5 / n),
                  (t[0] = (e[5] - e[7]) * n),
                  (t[1] = (e[6] - e[2]) * n),
                  (t[2] = (e[1] - e[3]) * n))
                : ((i = 0),
                  e[4] > e[0] && (i = 1),
                  e[8] > e[3 * i + i] && (i = 2),
                  (r = (i + 1) % 3),
                  (o = (i + 2) % 3),
                  (n = Math.sqrt(e[3 * i + i] - e[3 * r + r] - e[3 * o + o] + 1)),
                  (t[i] = 0.5 * n),
                  (n = 0.5 / n),
                  (t[3] = (e[3 * r + o] - e[3 * o + r]) * n),
                  (t[r] = (e[3 * r + i] + e[3 * i + r]) * n),
                  (t[o] = (e[3 * o + i] + e[3 * i + o]) * n)),
              t
            );
          }
          t = o.clone;
          i.clone = t;
          t = o.fromValues;
          i.fromValues = t;
          t = o.copy;
          i.copy = t;
          t = o.set;
          i.set = t;
          t = o.add;
          ((i.add = t), (i.mul = c));
          var _ = o.scale;
          i.scale = _;
          var y = o.dot;
          i.dot = y;
          t = o.lerp;
          i.lerp = t;
          t = o.length;
          ((i.length = t), (i.len = t));
          t = o.squaredLength;
          ((i.squaredLength = t), (i.sqrLen = t));
          var g = o.normalize;
          i.normalize = g;
          t = o.exactEquals;
          i.exactEquals = t;
          o = o.equals;
          i.equals = o;
          var w,
            b,
            M,
            o =
              ((w = n.create()),
              (b = n.fromValues(1, 0, 0)),
              (M = n.fromValues(0, 1, 0)),
              function (t, e, i) {
                var r = n.dot(e, i);
                return r < -0.999999
                  ? (n.cross(w, b, e),
                    n.len(w) < 1e-6 && n.cross(w, M, e),
                    n.normalize(w, w),
                    l(t, w, Math.PI),
                    t)
                  : 0.999999 < r
                    ? ((t[0] = 0), (t[1] = 0), (t[2] = 0), (t[3] = 1), t)
                    : (n.cross(w, e, i),
                      (t[0] = w[0]),
                      (t[1] = w[1]),
                      (t[2] = w[2]),
                      (t[3] = 1 + r),
                      g(t, t));
              });
          i.rotationTo = o;
          var x,
            E,
            o =
              ((x = u()),
              (E = u()),
              function (t, e, i, r, n, o) {
                return (m(x, e, n, o), m(E, i, r, o), m(t, x, E, 2 * o * (1 - o)), t);
              });
          i.sqlerp = o;
          var T,
            r =
              ((T = r.create()),
              function (t, e, i, r) {
                return (
                  (T[0] = i[0]),
                  (T[3] = i[1]),
                  (T[6] = i[2]),
                  (T[1] = r[0]),
                  (T[4] = r[1]),
                  (T[7] = r[2]),
                  (T[2] = -e[0]),
                  (T[5] = -e[1]),
                  (T[8] = -e[2]),
                  g(t, v(t, T))
                );
              });
          i.setAxes = r;
        },
        { './common.js': 2, './mat3.js': 6, './vec3.js': 11, './vec4.js': 12 },
      ],
      9: [
        function (t, e, i) {
          'use strict';
          function s(t) {
            return (s =
              'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                ? function (t) {
                    return typeof t;
                  }
                : function (t) {
                    return t &&
                      'function' == typeof Symbol &&
                      t.constructor === Symbol &&
                      t !== Symbol.prototype
                      ? 'symbol'
                      : typeof t;
                  })(t);
          }
          (Object.defineProperty(i, '__esModule', { value: !0 }),
            (i.create = function () {
              var t = new v.ARRAY_TYPE(8);
              v.ARRAY_TYPE != Float32Array &&
                ((t[0] = 0),
                (t[1] = 0),
                (t[2] = 0),
                (t[4] = 0),
                (t[5] = 0),
                (t[6] = 0),
                (t[7] = 0));
              return ((t[3] = 1), t);
            }),
            (i.clone = function (t) {
              var e = new v.ARRAY_TYPE(8);
              return (
                (e[0] = t[0]),
                (e[1] = t[1]),
                (e[2] = t[2]),
                (e[3] = t[3]),
                (e[4] = t[4]),
                (e[5] = t[5]),
                (e[6] = t[6]),
                (e[7] = t[7]),
                e
              );
            }),
            (i.fromValues = function (t, e, i, r, n, o, s, a) {
              var h = new v.ARRAY_TYPE(8);
              return (
                (h[0] = t),
                (h[1] = e),
                (h[2] = i),
                (h[3] = r),
                (h[4] = n),
                (h[5] = o),
                (h[6] = s),
                (h[7] = a),
                h
              );
            }),
            (i.fromRotationTranslationValues = function (t, e, i, r, n, o, s) {
              var a = new v.ARRAY_TYPE(8);
              ((a[0] = t), (a[1] = e), (a[2] = i), (a[3] = r));
              ((n *= 0.5), (o *= 0.5), (s *= 0.5));
              return (
                (a[4] = n * r + o * i - s * e),
                (a[5] = o * r + s * t - n * i),
                (a[6] = s * r + n * e - o * t),
                (a[7] = -n * t - o * e - s * i),
                a
              );
            }),
            (i.fromRotationTranslation = o),
            (i.fromTranslation = function (t, e) {
              return (
                (t[0] = 0),
                (t[1] = 0),
                (t[2] = 0),
                (t[3] = 1),
                (t[4] = 0.5 * e[0]),
                (t[5] = 0.5 * e[1]),
                (t[6] = 0.5 * e[2]),
                (t[7] = 0),
                t
              );
            }),
            (i.fromRotation = function (t, e) {
              return (
                (t[0] = e[0]),
                (t[1] = e[1]),
                (t[2] = e[2]),
                (t[3] = e[3]),
                (t[4] = 0),
                (t[5] = 0),
                (t[6] = 0),
                (t[7] = 0),
                t
              );
            }),
            (i.fromMat4 = function (t, e) {
              var i = d.create();
              n.getRotation(i, e);
              var r = new v.ARRAY_TYPE(3);
              return (n.getTranslation(r, e), o(t, i, r), t);
            }),
            (i.copy = l),
            (i.identity = function (t) {
              return (
                (t[0] = 0),
                (t[1] = 0),
                (t[2] = 0),
                (t[3] = 1),
                (t[4] = 0),
                (t[5] = 0),
                (t[6] = 0),
                (t[7] = 0),
                t
              );
            }),
            (i.set = function (t, e, i, r, n, o, s, a, h) {
              return (
                (t[0] = e),
                (t[1] = i),
                (t[2] = r),
                (t[3] = n),
                (t[4] = o),
                (t[5] = s),
                (t[6] = a),
                (t[7] = h),
                t
              );
            }),
            (i.getDual = function (t, e) {
              return ((t[0] = e[4]), (t[1] = e[5]), (t[2] = e[6]), (t[3] = e[7]), t);
            }),
            (i.setDual = function (t, e) {
              return ((t[4] = e[0]), (t[5] = e[1]), (t[6] = e[2]), (t[7] = e[3]), t);
            }),
            (i.getTranslation = function (t, e) {
              var i = e[4],
                r = e[5],
                n = e[6],
                o = e[7],
                s = -e[0],
                a = -e[1],
                h = -e[2],
                e = e[3];
              return (
                (t[0] = 2 * (i * e + o * s + r * h - n * a)),
                (t[1] = 2 * (r * e + o * a + n * s - i * h)),
                (t[2] = 2 * (n * e + o * h + i * a - r * s)),
                t
              );
            }),
            (i.translate = function (t, e, i) {
              var r = e[0],
                n = e[1],
                o = e[2],
                s = e[3],
                a = 0.5 * i[0],
                h = 0.5 * i[1],
                u = 0.5 * i[2],
                l = e[4],
                c = e[5],
                i = e[6],
                e = e[7];
              return (
                (t[0] = r),
                (t[1] = n),
                (t[2] = o),
                (t[3] = s),
                (t[4] = s * a + n * u - o * h + l),
                (t[5] = s * h + o * a - r * u + c),
                (t[6] = s * u + r * h - n * a + i),
                (t[7] = -r * a - n * h - o * u + e),
                t
              );
            }),
            (i.rotateX = function (t, e, i) {
              var r = -e[0],
                n = -e[1],
                o = -e[2],
                s = e[3],
                a = e[4],
                h = e[5],
                u = e[6],
                l = e[7],
                c = a * s + l * r + h * o - u * n,
                p = h * s + l * n + u * r - a * o,
                f = u * s + l * o + a * n - h * r,
                u = l * s - a * r - h * n - u * o;
              return (
                d.rotateX(t, e, i),
                (r = t[0]),
                (n = t[1]),
                (o = t[2]),
                (s = t[3]),
                (t[4] = c * s + u * r + p * o - f * n),
                (t[5] = p * s + u * n + f * r - c * o),
                (t[6] = f * s + u * o + c * n - p * r),
                (t[7] = u * s - c * r - p * n - f * o),
                t
              );
            }),
            (i.rotateY = function (t, e, i) {
              var r = -e[0],
                n = -e[1],
                o = -e[2],
                s = e[3],
                a = e[4],
                h = e[5],
                u = e[6],
                l = e[7],
                c = a * s + l * r + h * o - u * n,
                p = h * s + l * n + u * r - a * o,
                f = u * s + l * o + a * n - h * r,
                u = l * s - a * r - h * n - u * o;
              return (
                d.rotateY(t, e, i),
                (r = t[0]),
                (n = t[1]),
                (o = t[2]),
                (s = t[3]),
                (t[4] = c * s + u * r + p * o - f * n),
                (t[5] = p * s + u * n + f * r - c * o),
                (t[6] = f * s + u * o + c * n - p * r),
                (t[7] = u * s - c * r - p * n - f * o),
                t
              );
            }),
            (i.rotateZ = function (t, e, i) {
              var r = -e[0],
                n = -e[1],
                o = -e[2],
                s = e[3],
                a = e[4],
                h = e[5],
                u = e[6],
                l = e[7],
                c = a * s + l * r + h * o - u * n,
                p = h * s + l * n + u * r - a * o,
                f = u * s + l * o + a * n - h * r,
                u = l * s - a * r - h * n - u * o;
              return (
                d.rotateZ(t, e, i),
                (r = t[0]),
                (n = t[1]),
                (o = t[2]),
                (s = t[3]),
                (t[4] = c * s + u * r + p * o - f * n),
                (t[5] = p * s + u * n + f * r - c * o),
                (t[6] = f * s + u * o + c * n - p * r),
                (t[7] = u * s - c * r - p * n - f * o),
                t
              );
            }),
            (i.rotateByQuatAppend = function (t, e, i) {
              var r = i[0],
                n = i[1],
                o = i[2],
                s = i[3],
                a = e[0],
                h = e[1],
                u = e[2],
                i = e[3];
              return (
                (t[0] = a * s + i * r + h * o - u * n),
                (t[1] = h * s + i * n + u * r - a * o),
                (t[2] = u * s + i * o + a * n - h * r),
                (t[3] = i * s - a * r - h * n - u * o),
                (a = e[4]),
                (h = e[5]),
                (u = e[6]),
                (i = e[7]),
                (t[4] = a * s + i * r + h * o - u * n),
                (t[5] = h * s + i * n + u * r - a * o),
                (t[6] = u * s + i * o + a * n - h * r),
                (t[7] = i * s - a * r - h * n - u * o),
                t
              );
            }),
            (i.rotateByQuatPrepend = function (t, e, i) {
              var r = e[0],
                n = e[1],
                o = e[2],
                s = e[3],
                a = i[0],
                h = i[1],
                u = i[2],
                e = i[3];
              return (
                (t[0] = r * e + s * a + n * u - o * h),
                (t[1] = n * e + s * h + o * a - r * u),
                (t[2] = o * e + s * u + r * h - n * a),
                (t[3] = s * e - r * a - n * h - o * u),
                (a = i[4]),
                (h = i[5]),
                (u = i[6]),
                (e = i[7]),
                (t[4] = r * e + s * a + n * u - o * h),
                (t[5] = n * e + s * h + o * a - r * u),
                (t[6] = o * e + s * u + r * h - n * a),
                (t[7] = s * e - r * a - n * h - o * u),
                t
              );
            }),
            (i.rotateAroundAxis = function (t, e, i, r) {
              if (Math.abs(r) < v.EPSILON) return l(t, e);
              var n = Math.hypot(i[0], i[1], i[2]);
              r *= 0.5;
              var o = Math.sin(r),
                s = (o * i[0]) / n,
                a = (o * i[1]) / n,
                h = (o * i[2]) / n,
                u = Math.cos(r),
                o = e[0],
                i = e[1],
                n = e[2],
                r = e[3];
              ((t[0] = o * u + r * s + i * h - n * a),
                (t[1] = i * u + r * a + n * s - o * h),
                (t[2] = n * u + r * h + o * a - i * s),
                (t[3] = r * u - o * s - i * a - n * h));
              ((o = e[4]), (i = e[5]), (n = e[6]), (e = e[7]));
              return (
                (t[4] = o * u + e * s + i * h - n * a),
                (t[5] = i * u + e * a + n * s - o * h),
                (t[6] = n * u + e * h + o * a - i * s),
                (t[7] = e * u - o * s - i * a - n * h),
                t
              );
            }),
            (i.add = function (t, e, i) {
              return (
                (t[0] = e[0] + i[0]),
                (t[1] = e[1] + i[1]),
                (t[2] = e[2] + i[2]),
                (t[3] = e[3] + i[3]),
                (t[4] = e[4] + i[4]),
                (t[5] = e[5] + i[5]),
                (t[6] = e[6] + i[6]),
                (t[7] = e[7] + i[7]),
                t
              );
            }),
            (i.multiply = h),
            (i.scale = function (t, e, i) {
              return (
                (t[0] = e[0] * i),
                (t[1] = e[1] * i),
                (t[2] = e[2] * i),
                (t[3] = e[3] * i),
                (t[4] = e[4] * i),
                (t[5] = e[5] * i),
                (t[6] = e[6] * i),
                (t[7] = e[7] * i),
                t
              );
            }),
            (i.lerp = function (t, e, i, r) {
              var n = 1 - r;
              u(e, i) < 0 && (r = -r);
              return (
                (t[0] = e[0] * n + i[0] * r),
                (t[1] = e[1] * n + i[1] * r),
                (t[2] = e[2] * n + i[2] * r),
                (t[3] = e[3] * n + i[3] * r),
                (t[4] = e[4] * n + i[4] * r),
                (t[5] = e[5] * n + i[5] * r),
                (t[6] = e[6] * n + i[6] * r),
                (t[7] = e[7] * n + i[7] * r),
                t
              );
            }),
            (i.invert = function (t, e) {
              var i = c(e);
              return (
                (t[0] = -e[0] / i),
                (t[1] = -e[1] / i),
                (t[2] = -e[2] / i),
                (t[3] = e[3] / i),
                (t[4] = -e[4] / i),
                (t[5] = -e[5] / i),
                (t[6] = -e[6] / i),
                (t[7] = e[7] / i),
                t
              );
            }),
            (i.conjugate = function (t, e) {
              return (
                (t[0] = -e[0]),
                (t[1] = -e[1]),
                (t[2] = -e[2]),
                (t[3] = e[3]),
                (t[4] = -e[4]),
                (t[5] = -e[5]),
                (t[6] = -e[6]),
                (t[7] = e[7]),
                t
              );
            }),
            (i.normalize = function (t, e) {
              var i = c(e);
              {
                var r, n, o, s, a, h, u, l;
                0 < i &&
                  ((i = Math.sqrt(i)),
                  (r = e[0] / i),
                  (n = e[1] / i),
                  (o = e[2] / i),
                  (s = e[3] / i),
                  (a = e[4]),
                  (h = e[5]),
                  (u = e[6]),
                  (l = e[7]),
                  (e = r * a + n * h + o * u + s * l),
                  (t[0] = r),
                  (t[1] = n),
                  (t[2] = o),
                  (t[3] = s),
                  (t[4] = (a - r * e) / i),
                  (t[5] = (h - n * e) / i),
                  (t[6] = (u - o * e) / i),
                  (t[7] = (l - s * e) / i));
              }
              return t;
            }),
            (i.str = function (t) {
              return (
                'quat2(' +
                t[0] +
                ', ' +
                t[1] +
                ', ' +
                t[2] +
                ', ' +
                t[3] +
                ', ' +
                t[4] +
                ', ' +
                t[5] +
                ', ' +
                t[6] +
                ', ' +
                t[7] +
                ')'
              );
            }),
            (i.exactEquals = function (t, e) {
              return (
                t[0] === e[0] &&
                t[1] === e[1] &&
                t[2] === e[2] &&
                t[3] === e[3] &&
                t[4] === e[4] &&
                t[5] === e[5] &&
                t[6] === e[6] &&
                t[7] === e[7]
              );
            }),
            (i.equals = function (t, e) {
              var i = t[0],
                r = t[1],
                n = t[2],
                o = t[3],
                s = t[4],
                a = t[5],
                h = t[6],
                u = t[7],
                l = e[0],
                c = e[1],
                p = e[2],
                f = e[3],
                d = e[4],
                m = e[5],
                t = e[6],
                e = e[7];
              return (
                Math.abs(i - l) <= v.EPSILON * Math.max(1, Math.abs(i), Math.abs(l)) &&
                Math.abs(r - c) <= v.EPSILON * Math.max(1, Math.abs(r), Math.abs(c)) &&
                Math.abs(n - p) <= v.EPSILON * Math.max(1, Math.abs(n), Math.abs(p)) &&
                Math.abs(o - f) <= v.EPSILON * Math.max(1, Math.abs(o), Math.abs(f)) &&
                Math.abs(s - d) <= v.EPSILON * Math.max(1, Math.abs(s), Math.abs(d)) &&
                Math.abs(a - m) <= v.EPSILON * Math.max(1, Math.abs(a), Math.abs(m)) &&
                Math.abs(h - t) <= v.EPSILON * Math.max(1, Math.abs(h), Math.abs(t)) &&
                Math.abs(u - e) <= v.EPSILON * Math.max(1, Math.abs(u), Math.abs(e))
              );
            }),
            (i.sqrLen =
              i.squaredLength =
              i.len =
              i.length =
              i.dot =
              i.mul =
              i.setReal =
              i.getReal =
                void 0));
          var v = r(t('./common.js')),
            d = r(t('./quat.js')),
            n = r(t('./mat4.js'));
          function a() {
            if ('function' != typeof WeakMap) return null;
            var t = new WeakMap();
            return (
              (a = function () {
                return t;
              }),
              t
            );
          }
          function r(t) {
            if (t && t.__esModule) return t;
            if (null === t || ('object' !== s(t) && 'function' != typeof t)) return { default: t };
            var e = a();
            if (e && e.has(t)) return e.get(t);
            var i,
              r,
              n = {},
              o = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (i in t)
              Object.prototype.hasOwnProperty.call(t, i) &&
                ((r = o ? Object.getOwnPropertyDescriptor(t, i) : null) && (r.get || r.set)
                  ? Object.defineProperty(n, i, r)
                  : (n[i] = t[i]));
            return ((n.default = t), e && e.set(t, n), n);
          }
          function o(t, e, i) {
            var r = 0.5 * i[0],
              n = 0.5 * i[1],
              o = 0.5 * i[2],
              s = e[0],
              a = e[1],
              i = e[2],
              e = e[3];
            return (
              (t[0] = s),
              (t[1] = a),
              (t[2] = i),
              (t[3] = e),
              (t[4] = r * e + n * i - o * a),
              (t[5] = n * e + o * s - r * i),
              (t[6] = o * e + r * a - n * s),
              (t[7] = -r * s - n * a - o * i),
              t
            );
          }
          function l(t, e) {
            return (
              (t[0] = e[0]),
              (t[1] = e[1]),
              (t[2] = e[2]),
              (t[3] = e[3]),
              (t[4] = e[4]),
              (t[5] = e[5]),
              (t[6] = e[6]),
              (t[7] = e[7]),
              t
            );
          }
          t = d.copy;
          i.getReal = t;
          t = d.copy;
          function h(t, e, i) {
            var r = e[0],
              n = e[1],
              o = e[2],
              s = e[3],
              a = i[4],
              h = i[5],
              u = i[6],
              l = i[7],
              c = e[4],
              p = e[5],
              f = e[6],
              d = e[7],
              m = i[0],
              v = i[1],
              e = i[2],
              i = i[3];
            return (
              (t[0] = r * i + s * m + n * e - o * v),
              (t[1] = n * i + s * v + o * m - r * e),
              (t[2] = o * i + s * e + r * v - n * m),
              (t[3] = s * i - r * m - n * v - o * e),
              (t[4] = r * l + s * a + n * u - o * h + c * i + d * m + p * e - f * v),
              (t[5] = n * l + s * h + o * a - r * u + p * i + d * v + f * m - c * e),
              (t[6] = o * l + s * u + r * h - n * a + f * i + d * e + c * v - p * m),
              (t[7] = s * l - r * a - n * h - o * u + d * i - c * m - p * v - f * e),
              t
            );
          }
          ((i.setReal = t), (i.mul = h));
          var u = d.dot;
          i.dot = u;
          t = d.length;
          ((i.length = t), (i.len = t));
          var c = d.squaredLength;
          ((i.squaredLength = c), (i.sqrLen = c));
        },
        { './common.js': 2, './mat4.js': 7, './quat.js': 8 },
      ],
      10: [
        function (t, e, i) {
          'use strict';
          function s(t) {
            return (s =
              'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                ? function (t) {
                    return typeof t;
                  }
                : function (t) {
                    return t &&
                      'function' == typeof Symbol &&
                      t.constructor === Symbol &&
                      t !== Symbol.prototype
                      ? 'symbol'
                      : typeof t;
                  })(t);
          }
          (Object.defineProperty(i, '__esModule', { value: !0 }),
            (i.create = r),
            (i.clone = function (t) {
              var e = new n.ARRAY_TYPE(2);
              return ((e[0] = t[0]), (e[1] = t[1]), e);
            }),
            (i.fromValues = function (t, e) {
              var i = new n.ARRAY_TYPE(2);
              return ((i[0] = t), (i[1] = e), i);
            }),
            (i.copy = function (t, e) {
              return ((t[0] = e[0]), (t[1] = e[1]), t);
            }),
            (i.set = function (t, e, i) {
              return ((t[0] = e), (t[1] = i), t);
            }),
            (i.add = function (t, e, i) {
              return ((t[0] = e[0] + i[0]), (t[1] = e[1] + i[1]), t);
            }),
            (i.subtract = o),
            (i.multiply = h),
            (i.divide = u),
            (i.ceil = function (t, e) {
              return ((t[0] = Math.ceil(e[0])), (t[1] = Math.ceil(e[1])), t);
            }),
            (i.floor = function (t, e) {
              return ((t[0] = Math.floor(e[0])), (t[1] = Math.floor(e[1])), t);
            }),
            (i.min = function (t, e, i) {
              return ((t[0] = Math.min(e[0], i[0])), (t[1] = Math.min(e[1], i[1])), t);
            }),
            (i.max = function (t, e, i) {
              return ((t[0] = Math.max(e[0], i[0])), (t[1] = Math.max(e[1], i[1])), t);
            }),
            (i.round = function (t, e) {
              return ((t[0] = Math.round(e[0])), (t[1] = Math.round(e[1])), t);
            }),
            (i.scale = function (t, e, i) {
              return ((t[0] = e[0] * i), (t[1] = e[1] * i), t);
            }),
            (i.scaleAndAdd = function (t, e, i, r) {
              return ((t[0] = e[0] + i[0] * r), (t[1] = e[1] + i[1] * r), t);
            }),
            (i.distance = l),
            (i.squaredDistance = c),
            (i.length = p),
            (i.squaredLength = f),
            (i.negate = function (t, e) {
              return ((t[0] = -e[0]), (t[1] = -e[1]), t);
            }),
            (i.inverse = function (t, e) {
              return ((t[0] = 1 / e[0]), (t[1] = 1 / e[1]), t);
            }),
            (i.normalize = function (t, e) {
              var i = e[0],
                r = e[1],
                r = i * i + r * r;
              0 < r && (r = 1 / Math.sqrt(r));
              return ((t[0] = e[0] * r), (t[1] = e[1] * r), t);
            }),
            (i.dot = function (t, e) {
              return t[0] * e[0] + t[1] * e[1];
            }),
            (i.cross = function (t, e, i) {
              i = e[0] * i[1] - e[1] * i[0];
              return ((t[0] = t[1] = 0), (t[2] = i), t);
            }),
            (i.lerp = function (t, e, i, r) {
              var n = e[0],
                e = e[1];
              return ((t[0] = n + r * (i[0] - n)), (t[1] = e + r * (i[1] - e)), t);
            }),
            (i.random = function (t, e) {
              e = e || 1;
              var i = 2 * n.RANDOM() * Math.PI;
              return ((t[0] = Math.cos(i) * e), (t[1] = Math.sin(i) * e), t);
            }),
            (i.transformMat2 = function (t, e, i) {
              var r = e[0],
                e = e[1];
              return ((t[0] = i[0] * r + i[2] * e), (t[1] = i[1] * r + i[3] * e), t);
            }),
            (i.transformMat2d = function (t, e, i) {
              var r = e[0],
                e = e[1];
              return ((t[0] = i[0] * r + i[2] * e + i[4]), (t[1] = i[1] * r + i[3] * e + i[5]), t);
            }),
            (i.transformMat3 = function (t, e, i) {
              var r = e[0],
                e = e[1];
              return ((t[0] = i[0] * r + i[3] * e + i[6]), (t[1] = i[1] * r + i[4] * e + i[7]), t);
            }),
            (i.transformMat4 = function (t, e, i) {
              var r = e[0],
                e = e[1];
              return (
                (t[0] = i[0] * r + i[4] * e + i[12]),
                (t[1] = i[1] * r + i[5] * e + i[13]),
                t
              );
            }),
            (i.rotate = function (t, e, i, r) {
              var n = e[0] - i[0],
                o = e[1] - i[1],
                e = Math.sin(r),
                r = Math.cos(r);
              return ((t[0] = n * r - o * e + i[0]), (t[1] = n * e + o * r + i[1]), t);
            }),
            (i.angle = function (t, e) {
              var i = t[0],
                r = t[1],
                n = e[0],
                t = e[1],
                e = Math.sqrt(i * i + r * r) * Math.sqrt(n * n + t * t),
                e = e && (i * n + r * t) / e;
              return Math.acos(Math.min(Math.max(e, -1), 1));
            }),
            (i.zero = function (t) {
              return ((t[0] = 0), (t[1] = 0), t);
            }),
            (i.str = function (t) {
              return 'vec2(' + t[0] + ', ' + t[1] + ')';
            }),
            (i.exactEquals = function (t, e) {
              return t[0] === e[0] && t[1] === e[1];
            }),
            (i.equals = function (t, e) {
              var i = t[0],
                r = t[1],
                t = e[0],
                e = e[1];
              return (
                Math.abs(i - t) <= n.EPSILON * Math.max(1, Math.abs(i), Math.abs(t)) &&
                Math.abs(r - e) <= n.EPSILON * Math.max(1, Math.abs(r), Math.abs(e))
              );
            }),
            (i.forEach = i.sqrLen = i.sqrDist = i.dist = i.div = i.mul = i.sub = i.len = void 0));
          var n = (function (t) {
            if (t && t.__esModule) return t;
            if (null === t || ('object' !== s(t) && 'function' != typeof t)) return { default: t };
            var e = a();
            if (e && e.has(t)) return e.get(t);
            var i,
              r = {},
              n = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (i in t) {
              var o;
              Object.prototype.hasOwnProperty.call(t, i) &&
                ((o = n ? Object.getOwnPropertyDescriptor(t, i) : null) && (o.get || o.set)
                  ? Object.defineProperty(r, i, o)
                  : (r[i] = t[i]));
            }
            ((r.default = t), e && e.set(t, r));
            return r;
          })(t('./common.js'));
          function a() {
            if ('function' != typeof WeakMap) return null;
            var t = new WeakMap();
            return (
              (a = function () {
                return t;
              }),
              t
            );
          }
          function r() {
            var t = new n.ARRAY_TYPE(2);
            return (n.ARRAY_TYPE != Float32Array && ((t[0] = 0), (t[1] = 0)), t);
          }
          function o(t, e, i) {
            return ((t[0] = e[0] - i[0]), (t[1] = e[1] - i[1]), t);
          }
          function h(t, e, i) {
            return ((t[0] = e[0] * i[0]), (t[1] = e[1] * i[1]), t);
          }
          function u(t, e, i) {
            return ((t[0] = e[0] / i[0]), (t[1] = e[1] / i[1]), t);
          }
          function l(t, e) {
            var i = e[0] - t[0],
              t = e[1] - t[1];
            return Math.hypot(i, t);
          }
          function c(t, e) {
            var i = e[0] - t[0],
              t = e[1] - t[1];
            return i * i + t * t;
          }
          function p(t) {
            var e = t[0],
              t = t[1];
            return Math.hypot(e, t);
          }
          function f(t) {
            var e = t[0],
              t = t[1];
            return e * e + t * t;
          }
          ((i.len = p),
            (i.sub = o),
            (i.mul = h),
            (i.div = u),
            (i.dist = l),
            (i.sqrDist = c),
            (i.sqrLen = f));
          var d,
            t =
              ((d = r()),
              function (t, e, i, r, n, o) {
                var s, a;
                for (
                  e = e || 2, i = i || 0, a = r ? Math.min(r * e + i, t.length) : t.length, s = i;
                  s < a;
                  s += e
                )
                  ((d[0] = t[s]), (d[1] = t[s + 1]), n(d, d, o), (t[s] = d[0]), (t[s + 1] = d[1]));
                return t;
              });
          i.forEach = t;
        },
        { './common.js': 2 },
      ],
      11: [
        function (t, e, i) {
          'use strict';
          function s(t) {
            return (s =
              'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                ? function (t) {
                    return typeof t;
                  }
                : function (t) {
                    return t &&
                      'function' == typeof Symbol &&
                      t.constructor === Symbol &&
                      t !== Symbol.prototype
                      ? 'symbol'
                      : typeof t;
                  })(t);
          }
          (Object.defineProperty(i, '__esModule', { value: !0 }),
            (i.create = r),
            (i.clone = function (t) {
              var e = new a.ARRAY_TYPE(3);
              return ((e[0] = t[0]), (e[1] = t[1]), (e[2] = t[2]), e);
            }),
            (i.length = n),
            (i.fromValues = function (t, e, i) {
              var r = new a.ARRAY_TYPE(3);
              return ((r[0] = t), (r[1] = e), (r[2] = i), r);
            }),
            (i.copy = function (t, e) {
              return ((t[0] = e[0]), (t[1] = e[1]), (t[2] = e[2]), t);
            }),
            (i.set = function (t, e, i, r) {
              return ((t[0] = e), (t[1] = i), (t[2] = r), t);
            }),
            (i.add = function (t, e, i) {
              return ((t[0] = e[0] + i[0]), (t[1] = e[1] + i[1]), (t[2] = e[2] + i[2]), t);
            }),
            (i.subtract = o),
            (i.multiply = u),
            (i.divide = l),
            (i.ceil = function (t, e) {
              return (
                (t[0] = Math.ceil(e[0])),
                (t[1] = Math.ceil(e[1])),
                (t[2] = Math.ceil(e[2])),
                t
              );
            }),
            (i.floor = function (t, e) {
              return (
                (t[0] = Math.floor(e[0])),
                (t[1] = Math.floor(e[1])),
                (t[2] = Math.floor(e[2])),
                t
              );
            }),
            (i.min = function (t, e, i) {
              return (
                (t[0] = Math.min(e[0], i[0])),
                (t[1] = Math.min(e[1], i[1])),
                (t[2] = Math.min(e[2], i[2])),
                t
              );
            }),
            (i.max = function (t, e, i) {
              return (
                (t[0] = Math.max(e[0], i[0])),
                (t[1] = Math.max(e[1], i[1])),
                (t[2] = Math.max(e[2], i[2])),
                t
              );
            }),
            (i.round = function (t, e) {
              return (
                (t[0] = Math.round(e[0])),
                (t[1] = Math.round(e[1])),
                (t[2] = Math.round(e[2])),
                t
              );
            }),
            (i.scale = function (t, e, i) {
              return ((t[0] = e[0] * i), (t[1] = e[1] * i), (t[2] = e[2] * i), t);
            }),
            (i.scaleAndAdd = function (t, e, i, r) {
              return (
                (t[0] = e[0] + i[0] * r),
                (t[1] = e[1] + i[1] * r),
                (t[2] = e[2] + i[2] * r),
                t
              );
            }),
            (i.distance = c),
            (i.squaredDistance = p),
            (i.squaredLength = f),
            (i.negate = function (t, e) {
              return ((t[0] = -e[0]), (t[1] = -e[1]), (t[2] = -e[2]), t);
            }),
            (i.inverse = function (t, e) {
              return ((t[0] = 1 / e[0]), (t[1] = 1 / e[1]), (t[2] = 1 / e[2]), t);
            }),
            (i.normalize = function (t, e) {
              var i = e[0],
                r = e[1],
                n = e[2],
                n = i * i + r * r + n * n;
              0 < n && (n = 1 / Math.sqrt(n));
              return ((t[0] = e[0] * n), (t[1] = e[1] * n), (t[2] = e[2] * n), t);
            }),
            (i.dot = d),
            (i.cross = function (t, e, i) {
              var r = e[0],
                n = e[1],
                o = e[2],
                s = i[0],
                e = i[1],
                i = i[2];
              return ((t[0] = n * i - o * e), (t[1] = o * s - r * i), (t[2] = r * e - n * s), t);
            }),
            (i.lerp = function (t, e, i, r) {
              var n = e[0],
                o = e[1],
                e = e[2];
              return (
                (t[0] = n + r * (i[0] - n)),
                (t[1] = o + r * (i[1] - o)),
                (t[2] = e + r * (i[2] - e)),
                t
              );
            }),
            (i.hermite = function (t, e, i, r, n, o) {
              var s = o * o,
                a = s * (2 * o - 3) + 1,
                h = s * (o - 2) + o,
                u = s * (o - 1),
                o = s * (3 - 2 * o);
              return (
                (t[0] = e[0] * a + i[0] * h + r[0] * u + n[0] * o),
                (t[1] = e[1] * a + i[1] * h + r[1] * u + n[1] * o),
                (t[2] = e[2] * a + i[2] * h + r[2] * u + n[2] * o),
                t
              );
            }),
            (i.bezier = function (t, e, i, r, n, o) {
              var s = 1 - o,
                a = s * s,
                h = o * o,
                u = a * s,
                a = 3 * o * a,
                s = 3 * h * s,
                o = h * o;
              return (
                (t[0] = e[0] * u + i[0] * a + r[0] * s + n[0] * o),
                (t[1] = e[1] * u + i[1] * a + r[1] * s + n[1] * o),
                (t[2] = e[2] * u + i[2] * a + r[2] * s + n[2] * o),
                t
              );
            }),
            (i.random = function (t, e) {
              e = e || 1;
              var i = 2 * a.RANDOM() * Math.PI,
                r = 2 * a.RANDOM() - 1,
                n = Math.sqrt(1 - r * r) * e;
              return ((t[0] = Math.cos(i) * n), (t[1] = Math.sin(i) * n), (t[2] = r * e), t);
            }),
            (i.transformMat4 = function (t, e, i) {
              var r = e[0],
                n = e[1],
                o = e[2],
                e = i[3] * r + i[7] * n + i[11] * o + i[15];
              return (
                (e = e || 1),
                (t[0] = (i[0] * r + i[4] * n + i[8] * o + i[12]) / e),
                (t[1] = (i[1] * r + i[5] * n + i[9] * o + i[13]) / e),
                (t[2] = (i[2] * r + i[6] * n + i[10] * o + i[14]) / e),
                t
              );
            }),
            (i.transformMat3 = function (t, e, i) {
              var r = e[0],
                n = e[1],
                e = e[2];
              return (
                (t[0] = r * i[0] + n * i[3] + e * i[6]),
                (t[1] = r * i[1] + n * i[4] + e * i[7]),
                (t[2] = r * i[2] + n * i[5] + e * i[8]),
                t
              );
            }),
            (i.transformQuat = function (t, e, i) {
              var r = i[0],
                n = i[1],
                o = i[2],
                s = i[3],
                a = e[0],
                h = e[1],
                u = e[2],
                l = n * u - o * h,
                c = o * a - r * u,
                i = r * h - n * a,
                e = n * i - o * c,
                o = o * l - r * i,
                n = r * c - n * l,
                s = 2 * s;
              return (
                (l *= s),
                (c *= s),
                (i *= s),
                (e *= 2),
                (o *= 2),
                (n *= 2),
                (t[0] = a + l + e),
                (t[1] = h + c + o),
                (t[2] = u + i + n),
                t
              );
            }),
            (i.rotateX = function (t, e, i, r) {
              var n = [],
                o = [];
              return (
                (n[0] = e[0] - i[0]),
                (n[1] = e[1] - i[1]),
                (n[2] = e[2] - i[2]),
                (o[0] = n[0]),
                (o[1] = n[1] * Math.cos(r) - n[2] * Math.sin(r)),
                (o[2] = n[1] * Math.sin(r) + n[2] * Math.cos(r)),
                (t[0] = o[0] + i[0]),
                (t[1] = o[1] + i[1]),
                (t[2] = o[2] + i[2]),
                t
              );
            }),
            (i.rotateY = function (t, e, i, r) {
              var n = [],
                o = [];
              return (
                (n[0] = e[0] - i[0]),
                (n[1] = e[1] - i[1]),
                (n[2] = e[2] - i[2]),
                (o[0] = n[2] * Math.sin(r) + n[0] * Math.cos(r)),
                (o[1] = n[1]),
                (o[2] = n[2] * Math.cos(r) - n[0] * Math.sin(r)),
                (t[0] = o[0] + i[0]),
                (t[1] = o[1] + i[1]),
                (t[2] = o[2] + i[2]),
                t
              );
            }),
            (i.rotateZ = function (t, e, i, r) {
              var n = [],
                o = [];
              return (
                (n[0] = e[0] - i[0]),
                (n[1] = e[1] - i[1]),
                (n[2] = e[2] - i[2]),
                (o[0] = n[0] * Math.cos(r) - n[1] * Math.sin(r)),
                (o[1] = n[0] * Math.sin(r) + n[1] * Math.cos(r)),
                (o[2] = n[2]),
                (t[0] = o[0] + i[0]),
                (t[1] = o[1] + i[1]),
                (t[2] = o[2] + i[2]),
                t
              );
            }),
            (i.angle = function (t, e) {
              var i = t[0],
                r = t[1],
                n = t[2],
                o = e[0],
                s = e[1],
                a = e[2],
                n = Math.sqrt(i * i + r * r + n * n),
                a = Math.sqrt(o * o + s * s + a * a),
                a = n * a,
                a = a && d(t, e) / a;
              return Math.acos(Math.min(Math.max(a, -1), 1));
            }),
            (i.zero = function (t) {
              return ((t[0] = 0), (t[1] = 0), (t[2] = 0), t);
            }),
            (i.str = function (t) {
              return 'vec3(' + t[0] + ', ' + t[1] + ', ' + t[2] + ')';
            }),
            (i.exactEquals = function (t, e) {
              return t[0] === e[0] && t[1] === e[1] && t[2] === e[2];
            }),
            (i.equals = function (t, e) {
              var i = t[0],
                r = t[1],
                n = t[2],
                o = e[0],
                t = e[1],
                e = e[2];
              return (
                Math.abs(i - o) <= a.EPSILON * Math.max(1, Math.abs(i), Math.abs(o)) &&
                Math.abs(r - t) <= a.EPSILON * Math.max(1, Math.abs(r), Math.abs(t)) &&
                Math.abs(n - e) <= a.EPSILON * Math.max(1, Math.abs(n), Math.abs(e))
              );
            }),
            (i.forEach = i.sqrLen = i.len = i.sqrDist = i.dist = i.div = i.mul = i.sub = void 0));
          var a = (function (t) {
            if (t && t.__esModule) return t;
            if (null === t || ('object' !== s(t) && 'function' != typeof t)) return { default: t };
            var e = h();
            if (e && e.has(t)) return e.get(t);
            var i,
              r = {},
              n = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (i in t) {
              var o;
              Object.prototype.hasOwnProperty.call(t, i) &&
                ((o = n ? Object.getOwnPropertyDescriptor(t, i) : null) && (o.get || o.set)
                  ? Object.defineProperty(r, i, o)
                  : (r[i] = t[i]));
            }
            ((r.default = t), e && e.set(t, r));
            return r;
          })(t('./common.js'));
          function h() {
            if ('function' != typeof WeakMap) return null;
            var t = new WeakMap();
            return (
              (h = function () {
                return t;
              }),
              t
            );
          }
          function r() {
            var t = new a.ARRAY_TYPE(3);
            return (a.ARRAY_TYPE != Float32Array && ((t[0] = 0), (t[1] = 0), (t[2] = 0)), t);
          }
          function n(t) {
            var e = t[0],
              i = t[1],
              t = t[2];
            return Math.hypot(e, i, t);
          }
          function o(t, e, i) {
            return ((t[0] = e[0] - i[0]), (t[1] = e[1] - i[1]), (t[2] = e[2] - i[2]), t);
          }
          function u(t, e, i) {
            return ((t[0] = e[0] * i[0]), (t[1] = e[1] * i[1]), (t[2] = e[2] * i[2]), t);
          }
          function l(t, e, i) {
            return ((t[0] = e[0] / i[0]), (t[1] = e[1] / i[1]), (t[2] = e[2] / i[2]), t);
          }
          function c(t, e) {
            var i = e[0] - t[0],
              r = e[1] - t[1],
              t = e[2] - t[2];
            return Math.hypot(i, r, t);
          }
          function p(t, e) {
            var i = e[0] - t[0],
              r = e[1] - t[1],
              t = e[2] - t[2];
            return i * i + r * r + t * t;
          }
          function f(t) {
            var e = t[0],
              i = t[1],
              t = t[2];
            return e * e + i * i + t * t;
          }
          function d(t, e) {
            return t[0] * e[0] + t[1] * e[1] + t[2] * e[2];
          }
          ((i.sub = o),
            (i.mul = u),
            (i.div = l),
            (i.dist = c),
            (i.sqrDist = p),
            (i.len = n),
            (i.sqrLen = f));
          var m,
            t =
              ((m = r()),
              function (t, e, i, r, n, o) {
                var s, a;
                for (
                  e = e || 3, i = i || 0, a = r ? Math.min(r * e + i, t.length) : t.length, s = i;
                  s < a;
                  s += e
                )
                  ((m[0] = t[s]),
                    (m[1] = t[s + 1]),
                    (m[2] = t[s + 2]),
                    n(m, m, o),
                    (t[s] = m[0]),
                    (t[s + 1] = m[1]),
                    (t[s + 2] = m[2]));
                return t;
              });
          i.forEach = t;
        },
        { './common.js': 2 },
      ],
      12: [
        function (t, e, i) {
          'use strict';
          function s(t) {
            return (s =
              'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                ? function (t) {
                    return typeof t;
                  }
                : function (t) {
                    return t &&
                      'function' == typeof Symbol &&
                      t.constructor === Symbol &&
                      t !== Symbol.prototype
                      ? 'symbol'
                      : typeof t;
                  })(t);
          }
          (Object.defineProperty(i, '__esModule', { value: !0 }),
            (i.create = r),
            (i.clone = function (t) {
              var e = new u.ARRAY_TYPE(4);
              return ((e[0] = t[0]), (e[1] = t[1]), (e[2] = t[2]), (e[3] = t[3]), e);
            }),
            (i.fromValues = function (t, e, i, r) {
              var n = new u.ARRAY_TYPE(4);
              return ((n[0] = t), (n[1] = e), (n[2] = i), (n[3] = r), n);
            }),
            (i.copy = function (t, e) {
              return ((t[0] = e[0]), (t[1] = e[1]), (t[2] = e[2]), (t[3] = e[3]), t);
            }),
            (i.set = function (t, e, i, r, n) {
              return ((t[0] = e), (t[1] = i), (t[2] = r), (t[3] = n), t);
            }),
            (i.add = function (t, e, i) {
              return (
                (t[0] = e[0] + i[0]),
                (t[1] = e[1] + i[1]),
                (t[2] = e[2] + i[2]),
                (t[3] = e[3] + i[3]),
                t
              );
            }),
            (i.subtract = n),
            (i.multiply = o),
            (i.divide = h),
            (i.ceil = function (t, e) {
              return (
                (t[0] = Math.ceil(e[0])),
                (t[1] = Math.ceil(e[1])),
                (t[2] = Math.ceil(e[2])),
                (t[3] = Math.ceil(e[3])),
                t
              );
            }),
            (i.floor = function (t, e) {
              return (
                (t[0] = Math.floor(e[0])),
                (t[1] = Math.floor(e[1])),
                (t[2] = Math.floor(e[2])),
                (t[3] = Math.floor(e[3])),
                t
              );
            }),
            (i.min = function (t, e, i) {
              return (
                (t[0] = Math.min(e[0], i[0])),
                (t[1] = Math.min(e[1], i[1])),
                (t[2] = Math.min(e[2], i[2])),
                (t[3] = Math.min(e[3], i[3])),
                t
              );
            }),
            (i.max = function (t, e, i) {
              return (
                (t[0] = Math.max(e[0], i[0])),
                (t[1] = Math.max(e[1], i[1])),
                (t[2] = Math.max(e[2], i[2])),
                (t[3] = Math.max(e[3], i[3])),
                t
              );
            }),
            (i.round = function (t, e) {
              return (
                (t[0] = Math.round(e[0])),
                (t[1] = Math.round(e[1])),
                (t[2] = Math.round(e[2])),
                (t[3] = Math.round(e[3])),
                t
              );
            }),
            (i.scale = function (t, e, i) {
              return (
                (t[0] = e[0] * i),
                (t[1] = e[1] * i),
                (t[2] = e[2] * i),
                (t[3] = e[3] * i),
                t
              );
            }),
            (i.scaleAndAdd = function (t, e, i, r) {
              return (
                (t[0] = e[0] + i[0] * r),
                (t[1] = e[1] + i[1] * r),
                (t[2] = e[2] + i[2] * r),
                (t[3] = e[3] + i[3] * r),
                t
              );
            }),
            (i.distance = l),
            (i.squaredDistance = c),
            (i.length = p),
            (i.squaredLength = f),
            (i.negate = function (t, e) {
              return ((t[0] = -e[0]), (t[1] = -e[1]), (t[2] = -e[2]), (t[3] = -e[3]), t);
            }),
            (i.inverse = function (t, e) {
              return (
                (t[0] = 1 / e[0]),
                (t[1] = 1 / e[1]),
                (t[2] = 1 / e[2]),
                (t[3] = 1 / e[3]),
                t
              );
            }),
            (i.normalize = function (t, e) {
              var i = e[0],
                r = e[1],
                n = e[2],
                o = e[3],
                e = i * i + r * r + n * n + o * o;
              0 < e && (e = 1 / Math.sqrt(e));
              return ((t[0] = i * e), (t[1] = r * e), (t[2] = n * e), (t[3] = o * e), t);
            }),
            (i.dot = function (t, e) {
              return t[0] * e[0] + t[1] * e[1] + t[2] * e[2] + t[3] * e[3];
            }),
            (i.cross = function (t, e, i, r) {
              var n = i[0] * r[1] - i[1] * r[0],
                o = i[0] * r[2] - i[2] * r[0],
                s = i[0] * r[3] - i[3] * r[0],
                a = i[1] * r[2] - i[2] * r[1],
                h = i[1] * r[3] - i[3] * r[1],
                u = i[2] * r[3] - i[3] * r[2],
                l = e[0],
                i = e[1],
                r = e[2],
                e = e[3];
              return (
                (t[0] = i * u - r * h + e * a),
                (t[1] = -l * u + r * s - e * o),
                (t[2] = l * h - i * s + e * n),
                (t[3] = -l * a + i * o - r * n),
                t
              );
            }),
            (i.lerp = function (t, e, i, r) {
              var n = e[0],
                o = e[1],
                s = e[2],
                e = e[3];
              return (
                (t[0] = n + r * (i[0] - n)),
                (t[1] = o + r * (i[1] - o)),
                (t[2] = s + r * (i[2] - s)),
                (t[3] = e + r * (i[3] - e)),
                t
              );
            }),
            (i.random = function (t, e) {
              var i, r, n, o, s, a;
              e = e || 1;
              for (
                ;
                (i = 2 * u.RANDOM() - 1), (r = 2 * u.RANDOM() - 1), (s = i * i + r * r), 1 <= s;

              );
              for (
                ;
                (n = 2 * u.RANDOM() - 1), (o = 2 * u.RANDOM() - 1), (a = n * n + o * o), 1 <= a;

              );
              var h = Math.sqrt((1 - s) / a);
              return ((t[0] = e * i), (t[1] = e * r), (t[2] = e * n * h), (t[3] = e * o * h), t);
            }),
            (i.transformMat4 = function (t, e, i) {
              var r = e[0],
                n = e[1],
                o = e[2],
                e = e[3];
              return (
                (t[0] = i[0] * r + i[4] * n + i[8] * o + i[12] * e),
                (t[1] = i[1] * r + i[5] * n + i[9] * o + i[13] * e),
                (t[2] = i[2] * r + i[6] * n + i[10] * o + i[14] * e),
                (t[3] = i[3] * r + i[7] * n + i[11] * o + i[15] * e),
                t
              );
            }),
            (i.transformQuat = function (t, e, i) {
              var r = e[0],
                n = e[1],
                o = e[2],
                s = i[0],
                a = i[1],
                h = i[2],
                u = i[3],
                l = u * r + a * o - h * n,
                c = u * n + h * r - s * o,
                i = u * o + s * n - a * r,
                o = -s * r - a * n - h * o;
              return (
                (t[0] = l * u + o * -s + c * -h - i * -a),
                (t[1] = c * u + o * -a + i * -s - l * -h),
                (t[2] = i * u + o * -h + l * -a - c * -s),
                (t[3] = e[3]),
                t
              );
            }),
            (i.zero = function (t) {
              return ((t[0] = 0), (t[1] = 0), (t[2] = 0), (t[3] = 0), t);
            }),
            (i.str = function (t) {
              return 'vec4(' + t[0] + ', ' + t[1] + ', ' + t[2] + ', ' + t[3] + ')';
            }),
            (i.exactEquals = function (t, e) {
              return t[0] === e[0] && t[1] === e[1] && t[2] === e[2] && t[3] === e[3];
            }),
            (i.equals = function (t, e) {
              var i = t[0],
                r = t[1],
                n = t[2],
                o = t[3],
                s = e[0],
                a = e[1],
                t = e[2],
                e = e[3];
              return (
                Math.abs(i - s) <= u.EPSILON * Math.max(1, Math.abs(i), Math.abs(s)) &&
                Math.abs(r - a) <= u.EPSILON * Math.max(1, Math.abs(r), Math.abs(a)) &&
                Math.abs(n - t) <= u.EPSILON * Math.max(1, Math.abs(n), Math.abs(t)) &&
                Math.abs(o - e) <= u.EPSILON * Math.max(1, Math.abs(o), Math.abs(e))
              );
            }),
            (i.forEach = i.sqrLen = i.len = i.sqrDist = i.dist = i.div = i.mul = i.sub = void 0));
          var u = (function (t) {
            if (t && t.__esModule) return t;
            if (null === t || ('object' !== s(t) && 'function' != typeof t)) return { default: t };
            var e = a();
            if (e && e.has(t)) return e.get(t);
            var i,
              r = {},
              n = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (i in t) {
              var o;
              Object.prototype.hasOwnProperty.call(t, i) &&
                ((o = n ? Object.getOwnPropertyDescriptor(t, i) : null) && (o.get || o.set)
                  ? Object.defineProperty(r, i, o)
                  : (r[i] = t[i]));
            }
            ((r.default = t), e && e.set(t, r));
            return r;
          })(t('./common.js'));
          function a() {
            if ('function' != typeof WeakMap) return null;
            var t = new WeakMap();
            return (
              (a = function () {
                return t;
              }),
              t
            );
          }
          function r() {
            var t = new u.ARRAY_TYPE(4);
            return (
              u.ARRAY_TYPE != Float32Array && ((t[0] = 0), (t[1] = 0), (t[2] = 0), (t[3] = 0)),
              t
            );
          }
          function n(t, e, i) {
            return (
              (t[0] = e[0] - i[0]),
              (t[1] = e[1] - i[1]),
              (t[2] = e[2] - i[2]),
              (t[3] = e[3] - i[3]),
              t
            );
          }
          function o(t, e, i) {
            return (
              (t[0] = e[0] * i[0]),
              (t[1] = e[1] * i[1]),
              (t[2] = e[2] * i[2]),
              (t[3] = e[3] * i[3]),
              t
            );
          }
          function h(t, e, i) {
            return (
              (t[0] = e[0] / i[0]),
              (t[1] = e[1] / i[1]),
              (t[2] = e[2] / i[2]),
              (t[3] = e[3] / i[3]),
              t
            );
          }
          function l(t, e) {
            var i = e[0] - t[0],
              r = e[1] - t[1],
              n = e[2] - t[2],
              t = e[3] - t[3];
            return Math.hypot(i, r, n, t);
          }
          function c(t, e) {
            var i = e[0] - t[0],
              r = e[1] - t[1],
              n = e[2] - t[2],
              t = e[3] - t[3];
            return i * i + r * r + n * n + t * t;
          }
          function p(t) {
            var e = t[0],
              i = t[1],
              r = t[2],
              t = t[3];
            return Math.hypot(e, i, r, t);
          }
          function f(t) {
            var e = t[0],
              i = t[1],
              r = t[2],
              t = t[3];
            return e * e + i * i + r * r + t * t;
          }
          ((i.sub = n),
            (i.mul = o),
            (i.div = h),
            (i.dist = l),
            (i.sqrDist = c),
            (i.len = p),
            (i.sqrLen = f));
          var d,
            t =
              ((d = r()),
              function (t, e, i, r, n, o) {
                var s, a;
                for (
                  e = e || 4, i = i || 0, a = r ? Math.min(r * e + i, t.length) : t.length, s = i;
                  s < a;
                  s += e
                )
                  ((d[0] = t[s]),
                    (d[1] = t[s + 1]),
                    (d[2] = t[s + 2]),
                    (d[3] = t[s + 3]),
                    n(d, d, o),
                    (t[s] = d[0]),
                    (t[s + 1] = d[1]),
                    (t[s + 2] = d[2]),
                    (t[s + 3] = d[3]));
                return t;
              });
          i.forEach = t;
        },
        { './common.js': 2 },
      ],
      13: [
        function (t, Wt, e) {
          !(function (t, a, u) {
            'use strict';
            var o = ['', 'webkit', 'moz', 'MS', 'ms', 'o'],
              e = a.createElement('div'),
              i = 'function',
              s = Math.round,
              l = Math.abs,
              h = Date.now;
            function c(t, e, i) {
              return setTimeout(m(t, i), e);
            }
            function r(t, e, i) {
              return Array.isArray(t) && (n(t, i[e], i), 1);
            }
            function n(t, e, i) {
              if (t)
                if (t.forEach) t.forEach(e, i);
                else if (t.length !== u) for (r = 0; r < t.length; ) (e.call(i, t[r], r, t), r++);
                else for (var r in t) t.hasOwnProperty(r) && e.call(i, t[r], r, t);
            }
            function p(t, e, i) {
              for (var r = Object.keys(e), n = 0; n < r.length; )
                ((!i || (i && t[r[n]] === u)) && (t[r[n]] = e[r[n]]), n++);
              return t;
            }
            function f(t, e) {
              return p(t, e, !0);
            }
            function d(t, e, i) {
              var r = e.prototype,
                e = (t.prototype = Object.create(r));
              ((e.constructor = t), (e._super = r), i && p(e, i));
            }
            function m(t, e) {
              return function () {
                return t.apply(e, arguments);
              };
            }
            function v(t, e) {
              return typeof t == i ? t.apply((e && e[0]) || u, e) : t;
            }
            function _(t, e) {
              return t === u ? e : t;
            }
            function y(e, t, i) {
              n(M(t), function (t) {
                e.addEventListener(t, i, !1);
              });
            }
            function g(e, t, i) {
              n(M(t), function (t) {
                e.removeEventListener(t, i, !1);
              });
            }
            function w(t, e) {
              for (; t; ) {
                if (t == e) return !0;
                t = t.parentNode;
              }
              return !1;
            }
            function b(t, e) {
              return -1 < t.indexOf(e);
            }
            function M(t) {
              return t.trim().split(/\s+/g);
            }
            function x(t, e, i) {
              if (t.indexOf && !i) return t.indexOf(e);
              for (var r = 0; r < t.length; ) {
                if ((i && t[r][i] == e) || (!i && t[r] === e)) return r;
                r++;
              }
              return -1;
            }
            function E(t) {
              return Array.prototype.slice.call(t, 0);
            }
            function T(t, i, e) {
              for (var r = [], n = [], o = 0; o < t.length; ) {
                var s = i ? t[o][i] : t[o];
                (x(n, s) < 0 && r.push(t[o]), (n[o] = s), o++);
              }
              return (
                e &&
                  (r = i
                    ? r.sort(function (t, e) {
                        return t[i] > e[i];
                      })
                    : r.sort()),
                r
              );
            }
            function P(t, e) {
              for (var i, r = e[0].toUpperCase() + e.slice(1), n = 0; n < o.length; ) {
                if ((i = (i = o[n]) ? i + r : e) in t) return i;
                n++;
              }
              return u;
            }
            var L = 1;
            function S(t) {
              t = t.ownerDocument;
              return t.defaultView || t.parentWindow;
            }
            var C = 'ontouchstart' in t,
              R = P(t, 'PointerEvent') !== u,
              A = C && /mobile|tablet|ip(ad|hone|od)|android/i.test(navigator.userAgent),
              O = 'touch',
              I = 'mouse',
              z = 25,
              D = 1,
              j = 4,
              H = 8,
              k = 1,
              Y = 2,
              N = 4,
              F = 8,
              q = 16,
              W = Y | N,
              V = F | q,
              X = W | V,
              B = ['x', 'y'],
              G = ['clientX', 'clientY'];
            function U(e, t) {
              var i = this;
              ((this.manager = e),
                (this.callback = t),
                (this.element = e.element),
                (this.target = e.options.inputTarget),
                (this.domHandler = function (t) {
                  v(e.options.enable, [e]) && i.handler(t);
                }),
                this.init());
            }
            function K(t, e, i) {
              var r = i.pointers.length,
                n = i.changedPointers.length,
                o = e & D && r - n == 0,
                n = e & (j | H) && r - n == 0;
              ((i.isFirst = !!o),
                (i.isFinal = !!n),
                o && (t.session = {}),
                (i.eventType = e),
                (function (t, e) {
                  var i = t.session,
                    r = e.pointers,
                    n = r.length;
                  (i.firstInput || (i.firstInput = Z(e)),
                    1 < n && !i.firstMultiple
                      ? (i.firstMultiple = Z(e))
                      : 1 === n && (i.firstMultiple = !1));
                  var o = i.firstInput,
                    s = i.firstMultiple,
                    a = (s || o).center,
                    n = (e.center = Q(r));
                  ((e.timeStamp = h()),
                    (e.deltaTime = e.timeStamp - o.timeStamp),
                    (e.angle = tt(a, n)),
                    (e.distance = $(a, n)),
                    (function (t, e) {
                      var i = e.center,
                        r = t.offsetDelta || {},
                        n = t.prevDelta || {},
                        o = t.prevInput || {};
                      ((e.eventType !== D && o.eventType !== j) ||
                        ((n = t.prevDelta = { x: o.deltaX || 0, y: o.deltaY || 0 }),
                        (r = t.offsetDelta = { x: i.x, y: i.y })),
                        (e.deltaX = n.x + (i.x - r.x)),
                        (e.deltaY = n.y + (i.y - r.y)));
                    })(i, e),
                    (e.offsetDirection = J(e.deltaX, e.deltaY)),
                    (e.scale = s
                      ? (function (t, e) {
                          return $(e[0], e[1], G) / $(t[0], t[1], G);
                        })(s.pointers, r)
                      : 1),
                    (e.rotation = s
                      ? (function (t, e) {
                          return tt(e[1], e[0], G) - tt(t[1], t[0], G);
                        })(s.pointers, r)
                      : 0),
                    (function (t, e) {
                      var i,
                        r,
                        n,
                        o,
                        s,
                        a = t.lastInterval || e,
                        h = e.timeStamp - a.timeStamp;
                      (e.eventType != H && (z < h || a.velocity === u)
                        ? ((n = a.deltaX - e.deltaX),
                          (o = a.deltaY - e.deltaY),
                          (s = (function (t, e, i) {
                            return { x: e / t || 0, y: i / t || 0 };
                          })(h, n, o)),
                          (i = s.x),
                          (r = s.y),
                          (s = l(s.x) > l(s.y) ? s.x : s.y),
                          (o = J(n, o)),
                          (t.lastInterval = e))
                        : ((s = a.velocity),
                          (i = a.velocityX),
                          (r = a.velocityY),
                          (o = a.direction)),
                        (e.velocity = s),
                        (e.velocityX = i),
                        (e.velocityY = r),
                        (e.direction = o));
                    })(i, e),
                    (t = t.element),
                    w(e.srcEvent.target, t) && (t = e.srcEvent.target),
                    (e.target = t));
                })(t, i),
                t.emit('hammer.input', i),
                t.recognize(i),
                (t.session.prevInput = i));
            }
            function Z(t) {
              for (var e = [], i = 0; i < t.pointers.length; )
                ((e[i] = { clientX: s(t.pointers[i].clientX), clientY: s(t.pointers[i].clientY) }),
                  i++);
              return {
                timeStamp: h(),
                pointers: e,
                center: Q(e),
                deltaX: t.deltaX,
                deltaY: t.deltaY,
              };
            }
            function Q(t) {
              var e = t.length;
              if (1 === e) return { x: s(t[0].clientX), y: s(t[0].clientY) };
              for (var i = 0, r = 0, n = 0; n < e; )
                ((i += t[n].clientX), (r += t[n].clientY), n++);
              return { x: s(i / e), y: s(r / e) };
            }
            function J(t, e) {
              return t === e ? k : l(t) >= l(e) ? (0 < t ? Y : N) : 0 < e ? F : q;
            }
            function $(t, e, i) {
              var r = e[(i = i || B)[0]] - t[i[0]],
                i = e[i[1]] - t[i[1]];
              return Math.sqrt(r * r + i * i);
            }
            function tt(t, e, i) {
              var r = e[(i = i || B)[0]] - t[i[0]],
                i = e[i[1]] - t[i[1]];
              return (180 * Math.atan2(i, r)) / Math.PI;
            }
            U.prototype = {
              handler: function () {},
              init: function () {
                (this.evEl && y(this.element, this.evEl, this.domHandler),
                  this.evTarget && y(this.target, this.evTarget, this.domHandler),
                  this.evWin && y(S(this.element), this.evWin, this.domHandler));
              },
              destroy: function () {
                (this.evEl && g(this.element, this.evEl, this.domHandler),
                  this.evTarget && g(this.target, this.evTarget, this.domHandler),
                  this.evWin && g(S(this.element), this.evWin, this.domHandler));
              },
            };
            var et = { mousedown: D, mousemove: 2, mouseup: j },
              it = 'mousedown',
              rt = 'mousemove mouseup';
            function nt() {
              ((this.evEl = it),
                (this.evWin = rt),
                (this.allow = !0),
                (this.pressed = !1),
                U.apply(this, arguments));
            }
            d(nt, U, {
              handler: function (t) {
                var e = et[t.type];
                (e & D && 0 === t.button && (this.pressed = !0),
                  2 & e && 1 !== t.which && (e = j),
                  this.pressed &&
                    this.allow &&
                    (e & j && (this.pressed = !1),
                    this.callback(this.manager, e, {
                      pointers: [t],
                      changedPointers: [t],
                      pointerType: I,
                      srcEvent: t,
                    })));
              },
            });
            var ot = {
                pointerdown: D,
                pointermove: 2,
                pointerup: j,
                pointercancel: H,
                pointerout: H,
              },
              st = { 2: O, 3: 'pen', 4: I, 5: 'kinect' },
              at = 'pointerdown',
              ht = 'pointermove pointerup pointercancel';
            function ut() {
              ((this.evEl = at),
                (this.evWin = ht),
                U.apply(this, arguments),
                (this.store = this.manager.session.pointerEvents = []));
            }
            (t.MSPointerEvent &&
              ((at = 'MSPointerDown'), (ht = 'MSPointerMove MSPointerUp MSPointerCancel')),
              d(ut, U, {
                handler: function (t) {
                  var e = this.store,
                    i = !1,
                    r = t.type.toLowerCase().replace('ms', ''),
                    n = ot[r],
                    o = st[t.pointerType] || t.pointerType,
                    s = o == O,
                    r = x(e, t.pointerId, 'pointerId');
                  (n & D && (0 === t.button || s)
                    ? r < 0 && (e.push(t), (r = e.length - 1))
                    : n & (j | H) && (i = !0),
                    r < 0 ||
                      ((e[r] = t),
                      this.callback(this.manager, n, {
                        pointers: e,
                        changedPointers: [t],
                        pointerType: o,
                        srcEvent: t,
                      }),
                      i && e.splice(r, 1)));
                },
              }));
            var lt = { touchstart: D, touchmove: 2, touchend: j, touchcancel: H };
            function ct() {
              ((this.evTarget = 'touchstart'),
                (this.evWin = 'touchstart touchmove touchend touchcancel'),
                (this.started = !1),
                U.apply(this, arguments));
            }
            d(ct, U, {
              handler: function (t) {
                var e,
                  i = lt[t.type];
                (i === D && (this.started = !0),
                  this.started &&
                    ((e = function (t, e) {
                      var i = E(t.touches),
                        t = E(t.changedTouches);
                      e & (j | H) && (i = T(i.concat(t), 'identifier', !0));
                      return [i, t];
                    }.call(this, t, i)),
                    i & (j | H) && e[0].length - e[1].length == 0 && (this.started = !1),
                    this.callback(this.manager, i, {
                      pointers: e[0],
                      changedPointers: e[1],
                      pointerType: O,
                      srcEvent: t,
                    })));
              },
            });
            var pt = { touchstart: D, touchmove: 2, touchend: j, touchcancel: H },
              ft = 'touchstart touchmove touchend touchcancel';
            function dt() {
              ((this.evTarget = ft), (this.targetIds = {}), U.apply(this, arguments));
            }
            function mt() {
              U.apply(this, arguments);
              var t = m(this.handler, this);
              ((this.touch = new dt(this.manager, t)), (this.mouse = new nt(this.manager, t)));
            }
            (d(dt, U, {
              handler: function (t) {
                var e = pt[t.type],
                  i = function (t, e) {
                    var i = E(t.touches),
                      r = this.targetIds;
                    if (e & (2 | D) && 1 === i.length) return ((r[i[0].identifier] = !0), [i, i]);
                    var n,
                      o,
                      s = E(t.changedTouches),
                      a = [],
                      h = this.target;
                    if (
                      ((o = i.filter(function (t) {
                        return w(t.target, h);
                      })),
                      e === D)
                    )
                      for (n = 0; n < o.length; ) ((r[o[n].identifier] = !0), n++);
                    n = 0;
                    for (; n < s.length; )
                      (r[s[n].identifier] && a.push(s[n]),
                        e & (j | H) && delete r[s[n].identifier],
                        n++);
                    return a.length ? [T(o.concat(a), 'identifier', !0), a] : void 0;
                  }.call(this, t, e);
                i &&
                  this.callback(this.manager, e, {
                    pointers: i[0],
                    changedPointers: i[1],
                    pointerType: O,
                    srcEvent: t,
                  });
              },
            }),
              d(mt, U, {
                handler: function (t, e, i) {
                  var r = i.pointerType == O,
                    n = i.pointerType == I;
                  if (r) this.mouse.allow = !1;
                  else if (n && !this.mouse.allow) return;
                  (e & (j | H) && (this.mouse.allow = !0), this.callback(t, e, i));
                },
                destroy: function () {
                  (this.touch.destroy(), this.mouse.destroy());
                },
              }));
            var vt = P(e.style, 'touchAction'),
              _t = vt !== u,
              yt = 'compute',
              gt = 'manipulation',
              wt = 'none',
              bt = 'pan-x',
              Mt = 'pan-y';
            function xt(t, e) {
              ((this.manager = t), this.set(e));
            }
            xt.prototype = {
              set: function (t) {
                (t == yt && (t = this.compute()),
                  _t && (this.manager.element.style[vt] = t),
                  (this.actions = t.toLowerCase().trim()));
              },
              update: function () {
                this.set(this.manager.options.touchAction);
              },
              compute: function () {
                var e = [];
                return (
                  n(this.manager.recognizers, function (t) {
                    v(t.options.enable, [t]) && (e = e.concat(t.getTouchAction()));
                  }),
                  (function (t) {
                    if (b(t, wt)) return wt;
                    var e = b(t, bt),
                      i = b(t, Mt);
                    if (e && i) return bt + ' ' + Mt;
                    if (e || i) return e ? bt : Mt;
                    if (b(t, gt)) return gt;
                    return 'auto';
                  })(e.join(' '))
                );
              },
              preventDefaults: function (t) {
                if (!_t) {
                  var e = t.srcEvent,
                    i = t.offsetDirection;
                  if (!this.manager.session.prevented) {
                    var r = this.actions,
                      n = b(r, wt),
                      t = b(r, Mt),
                      r = b(r, bt);
                    return n || (t && i & W) || (r && i & V) ? this.preventSrc(e) : void 0;
                  }
                  e.preventDefault();
                }
              },
              preventSrc: function (t) {
                ((this.manager.session.prevented = !0), t.preventDefault());
              },
            };
            var Et = 1,
              Tt = 2,
              Pt = 4,
              Lt = 8,
              St = Lt,
              Ct = 16;
            function Rt(t) {
              ((this.id = L++),
                (this.manager = null),
                (this.options = f(t || {}, this.defaults)),
                (this.options.enable = _(this.options.enable, !0)),
                (this.state = Et),
                (this.simultaneous = {}),
                (this.requireFail = []));
            }
            function At(t) {
              return t == q ? 'down' : t == F ? 'up' : t == Y ? 'left' : t == N ? 'right' : '';
            }
            function Ot(t, e) {
              e = e.manager;
              return e ? e.get(t) : t;
            }
            function It() {
              Rt.apply(this, arguments);
            }
            function zt() {
              (It.apply(this, arguments), (this.pX = null), (this.pY = null));
            }
            function Dt() {
              It.apply(this, arguments);
            }
            function jt() {
              (Rt.apply(this, arguments), (this._timer = null), (this._input = null));
            }
            function Ht() {
              It.apply(this, arguments);
            }
            function kt() {
              It.apply(this, arguments);
            }
            function Yt() {
              (Rt.apply(this, arguments),
                (this.pTime = !1),
                (this.pCenter = !1),
                (this._timer = null),
                (this._input = null),
                (this.count = 0));
            }
            function Nt(t, e) {
              return (
                ((e = e || {}).recognizers = _(e.recognizers, Nt.defaults.preset)),
                new Ft(t, e)
              );
            }
            function Ft(t, e) {
              ((e = e || {}),
                (this.options = f(e, Nt.defaults)),
                (this.options.inputTarget = this.options.inputTarget || t),
                (this.handlers = {}),
                (this.session = {}),
                (this.recognizers = []),
                (this.element = t),
                (this.input = new ((t = this).options.inputClass ||
                  (R ? ut : A ? dt : C ? mt : nt))(t, K)),
                (this.touchAction = new xt(this, this.options.touchAction)),
                qt(this, !0),
                n(
                  e.recognizers,
                  function (t) {
                    var e = this.add(new t[0](t[1]));
                    (t[2] && e.recognizeWith(t[2]), t[3] && e.requireFailure(t[3]));
                  },
                  this
                ));
            }
            function qt(t, i) {
              var r = t.element;
              n(t.options.cssProps, function (t, e) {
                r.style[P(r.style, e)] = i ? t : '';
              });
            }
            ((Rt.prototype = {
              defaults: {},
              set: function (t) {
                return (
                  p(this.options, t),
                  this.manager && this.manager.touchAction.update(),
                  this
                );
              },
              recognizeWith: function (t) {
                if (r(t, 'recognizeWith', this)) return this;
                var e = this.simultaneous;
                return (e[(t = Ot(t, this)).id] || (e[t.id] = t).recognizeWith(this), this);
              },
              dropRecognizeWith: function (t) {
                return (
                  r(t, 'dropRecognizeWith', this) ||
                    ((t = Ot(t, this)), delete this.simultaneous[t.id]),
                  this
                );
              },
              requireFailure: function (t) {
                if (r(t, 'requireFailure', this)) return this;
                var e = this.requireFail;
                return (
                  -1 === x(e, (t = Ot(t, this))) && (e.push(t), t.requireFailure(this)),
                  this
                );
              },
              dropRequireFailure: function (t) {
                if (r(t, 'dropRequireFailure', this)) return this;
                t = Ot(t, this);
                t = x(this.requireFail, t);
                return (-1 < t && this.requireFail.splice(t, 1), this);
              },
              hasRequireFailures: function () {
                return 0 < this.requireFail.length;
              },
              canRecognizeWith: function (t) {
                return !!this.simultaneous[t.id];
              },
              emit: function (e) {
                var i = this,
                  r = this.state;
                function t(t) {
                  i.manager.emit(
                    i.options.event +
                      (t
                        ? (function (t) {
                            {
                              if (t & Ct) return 'cancel';
                              if (t & Lt) return 'end';
                              if (t & Pt) return 'move';
                              if (t & Tt) return 'start';
                            }
                            return '';
                          })(r)
                        : ''),
                    e
                  );
                }
                (r < Lt && t(!0), t(), Lt <= r && t(!0));
              },
              tryEmit: function (t) {
                if (this.canEmit()) return this.emit(t);
                this.state = 32;
              },
              canEmit: function () {
                for (var t = 0; t < this.requireFail.length; ) {
                  if (!(this.requireFail[t].state & (32 | Et))) return !1;
                  t++;
                }
                return !0;
              },
              recognize: function (t) {
                t = p({}, t);
                if (!v(this.options.enable, [this, t]))
                  return (this.reset(), void (this.state = 32));
                (this.state & (St | Ct | 32) && (this.state = Et),
                  (this.state = this.process(t)),
                  this.state & (Tt | Pt | Lt | Ct) && this.tryEmit(t));
              },
              process: function (t) {},
              getTouchAction: function () {},
              reset: function () {},
            }),
              d(It, Rt, {
                defaults: { pointers: 1 },
                attrTest: function (t) {
                  var e = this.options.pointers;
                  return 0 === e || t.pointers.length === e;
                },
                process: function (t) {
                  var e = this.state,
                    i = t.eventType,
                    r = e & (Tt | Pt),
                    t = this.attrTest(t);
                  return r && (i & H || !t)
                    ? e | Ct
                    : r || t
                      ? i & j
                        ? e | Lt
                        : e & Tt
                          ? e | Pt
                          : Tt
                      : 32;
                },
              }),
              d(zt, It, {
                defaults: { event: 'pan', threshold: 10, pointers: 1, direction: X },
                getTouchAction: function () {
                  var t = this.options.direction,
                    e = [];
                  return (t & W && e.push(Mt), t & V && e.push(bt), e);
                },
                directionTest: function (t) {
                  var e = this.options,
                    i = !0,
                    r = t.distance,
                    n = t.direction,
                    o = t.deltaX,
                    s = t.deltaY;
                  return (
                    n & e.direction ||
                      (r =
                        e.direction & W
                          ? ((n = 0 === o ? k : o < 0 ? Y : N),
                            (i = o != this.pX),
                            Math.abs(t.deltaX))
                          : ((n = 0 === s ? k : s < 0 ? F : q),
                            (i = s != this.pY),
                            Math.abs(t.deltaY))),
                    (t.direction = n),
                    i && r > e.threshold && n & e.direction
                  );
                },
                attrTest: function (t) {
                  return (
                    It.prototype.attrTest.call(this, t) &&
                    (this.state & Tt || (!(this.state & Tt) && this.directionTest(t)))
                  );
                },
                emit: function (t) {
                  ((this.pX = t.deltaX), (this.pY = t.deltaY));
                  var e = At(t.direction);
                  (e && this.manager.emit(this.options.event + e, t),
                    this._super.emit.call(this, t));
                },
              }),
              d(Dt, It, {
                defaults: { event: 'pinch', threshold: 0, pointers: 2 },
                getTouchAction: function () {
                  return [wt];
                },
                attrTest: function (t) {
                  return (
                    this._super.attrTest.call(this, t) &&
                    (Math.abs(t.scale - 1) > this.options.threshold || this.state & Tt)
                  );
                },
                emit: function (t) {
                  var e;
                  (this._super.emit.call(this, t),
                    1 !== t.scale &&
                      ((e = t.scale < 1 ? 'in' : 'out'),
                      this.manager.emit(this.options.event + e, t)));
                },
              }),
              d(jt, Rt, {
                defaults: { event: 'press', pointers: 1, time: 500, threshold: 5 },
                getTouchAction: function () {
                  return ['auto'];
                },
                process: function (t) {
                  var e = this.options,
                    i = t.pointers.length === e.pointers,
                    r = t.distance < e.threshold,
                    n = t.deltaTime > e.time;
                  if (((this._input = t), !r || !i || (t.eventType & (j | H) && !n))) this.reset();
                  else if (t.eventType & D)
                    (this.reset(),
                      (this._timer = c(
                        function () {
                          ((this.state = St), this.tryEmit());
                        },
                        e.time,
                        this
                      )));
                  else if (t.eventType & j) return St;
                  return 32;
                },
                reset: function () {
                  clearTimeout(this._timer);
                },
                emit: function (t) {
                  this.state === St &&
                    (t && t.eventType & j
                      ? this.manager.emit(this.options.event + 'up', t)
                      : ((this._input.timeStamp = h()),
                        this.manager.emit(this.options.event, this._input)));
                },
              }),
              d(Ht, It, {
                defaults: { event: 'rotate', threshold: 0, pointers: 2 },
                getTouchAction: function () {
                  return [wt];
                },
                attrTest: function (t) {
                  return (
                    this._super.attrTest.call(this, t) &&
                    (Math.abs(t.rotation) > this.options.threshold || this.state & Tt)
                  );
                },
              }),
              d(kt, It, {
                defaults: {
                  event: 'swipe',
                  threshold: 10,
                  velocity: 0.65,
                  direction: W | V,
                  pointers: 1,
                },
                getTouchAction: function () {
                  return zt.prototype.getTouchAction.call(this);
                },
                attrTest: function (t) {
                  var e,
                    i = this.options.direction;
                  return (
                    i & (W | V)
                      ? (e = t.velocity)
                      : i & W
                        ? (e = t.velocityX)
                        : i & V && (e = t.velocityY),
                    this._super.attrTest.call(this, t) &&
                      i & t.direction &&
                      t.distance > this.options.threshold &&
                      l(e) > this.options.velocity &&
                      t.eventType & j
                  );
                },
                emit: function (t) {
                  var e = At(t.direction);
                  (e && this.manager.emit(this.options.event + e, t),
                    this.manager.emit(this.options.event, t));
                },
              }),
              d(Yt, Rt, {
                defaults: {
                  event: 'tap',
                  pointers: 1,
                  taps: 1,
                  interval: 300,
                  time: 250,
                  threshold: 2,
                  posThreshold: 10,
                },
                getTouchAction: function () {
                  return [gt];
                },
                process: function (t) {
                  var e = this.options,
                    i = t.pointers.length === e.pointers,
                    r = t.distance < e.threshold,
                    n = t.deltaTime < e.time;
                  if ((this.reset(), t.eventType & D && 0 === this.count))
                    return this.failTimeout();
                  if (r && n && i) {
                    if (t.eventType != j) return this.failTimeout();
                    ((n = !this.pTime || t.timeStamp - this.pTime < e.interval),
                      (i = !this.pCenter || $(this.pCenter, t.center) < e.posThreshold));
                    if (
                      ((this.pTime = t.timeStamp),
                      (this.pCenter = t.center),
                      i && n ? (this.count += 1) : (this.count = 1),
                      (this._input = t),
                      0 == this.count % e.taps)
                    )
                      return this.hasRequireFailures()
                        ? ((this._timer = c(
                            function () {
                              ((this.state = St), this.tryEmit());
                            },
                            e.interval,
                            this
                          )),
                          Tt)
                        : St;
                  }
                  return 32;
                },
                failTimeout: function () {
                  return (
                    (this._timer = c(
                      function () {
                        this.state = 32;
                      },
                      this.options.interval,
                      this
                    )),
                    32
                  );
                },
                reset: function () {
                  clearTimeout(this._timer);
                },
                emit: function () {
                  this.state == St &&
                    ((this._input.tapCount = this.count),
                    this.manager.emit(this.options.event, this._input));
                },
              }),
              (Nt.VERSION = '2.0.4'),
              (Nt.defaults = {
                domEvents: !1,
                touchAction: yt,
                enable: !0,
                inputTarget: null,
                inputClass: null,
                preset: [
                  [Ht, { enable: !1 }],
                  [Dt, { enable: !1 }, ['rotate']],
                  [kt, { direction: W }],
                  [zt, { direction: W }, ['swipe']],
                  [Yt],
                  [Yt, { event: 'doubletap', taps: 2 }, ['tap']],
                  [jt],
                ],
                cssProps: {
                  userSelect: 'none',
                  touchSelect: 'none',
                  touchCallout: 'none',
                  contentZooming: 'none',
                  userDrag: 'none',
                  tapHighlightColor: 'rgba(0,0,0,0)',
                },
              }),
              (Ft.prototype = {
                set: function (t) {
                  return (
                    p(this.options, t),
                    t.touchAction && this.touchAction.update(),
                    t.inputTarget &&
                      (this.input.destroy(),
                      (this.input.target = t.inputTarget),
                      this.input.init()),
                    this
                  );
                },
                stop: function (t) {
                  this.session.stopped = t ? 2 : 1;
                },
                recognize: function (t) {
                  var e,
                    i = this.session;
                  if (!i.stopped) {
                    this.touchAction.preventDefaults(t);
                    var r = this.recognizers,
                      n = i.curRecognizer;
                    (!n || (n && n.state & St)) && (n = i.curRecognizer = null);
                    for (var o = 0; o < r.length; )
                      ((e = r[o]),
                        2 === i.stopped || (n && e != n && !e.canRecognizeWith(n))
                          ? e.reset()
                          : e.recognize(t),
                        !n && e.state & (Tt | Pt | Lt) && (n = i.curRecognizer = e),
                        o++);
                  }
                },
                get: function (t) {
                  if (t instanceof Rt) return t;
                  for (var e = this.recognizers, i = 0; i < e.length; i++)
                    if (e[i].options.event == t) return e[i];
                  return null;
                },
                add: function (t) {
                  if (r(t, 'add', this)) return this;
                  var e = this.get(t.options.event);
                  return (
                    e && this.remove(e),
                    this.recognizers.push(t),
                    (t.manager = this).touchAction.update(),
                    t
                  );
                },
                remove: function (t) {
                  if (r(t, 'remove', this)) return this;
                  var e = this.recognizers;
                  return ((t = this.get(t)), e.splice(x(e, t), 1), this.touchAction.update(), this);
                },
                on: function (t, e) {
                  var i = this.handlers;
                  return (
                    n(M(t), function (t) {
                      ((i[t] = i[t] || []), i[t].push(e));
                    }),
                    this
                  );
                },
                off: function (t, e) {
                  var i = this.handlers;
                  return (
                    n(M(t), function (t) {
                      e ? i[t].splice(x(i[t], e), 1) : delete i[t];
                    }),
                    this
                  );
                },
                emit: function (t, e) {
                  var i, r, n;
                  this.options.domEvents &&
                    ((i = t),
                    (r = e),
                    (n = a.createEvent('Event')).initEvent(i, !0, !0),
                    (n.gesture = r).target.dispatchEvent(n));
                  var o = this.handlers[t] && this.handlers[t].slice();
                  if (o && o.length) {
                    ((e.type = t),
                      (e.preventDefault = function () {
                        e.srcEvent.preventDefault();
                      }));
                    for (var s = 0; s < o.length; ) (o[s](e), s++);
                  }
                },
                destroy: function () {
                  (this.element && qt(this, !1),
                    (this.handlers = {}),
                    (this.session = {}),
                    this.input.destroy(),
                    (this.element = null));
                },
              }),
              p(Nt, {
                INPUT_START: D,
                INPUT_MOVE: 2,
                INPUT_END: j,
                INPUT_CANCEL: H,
                STATE_POSSIBLE: Et,
                STATE_BEGAN: Tt,
                STATE_CHANGED: Pt,
                STATE_ENDED: Lt,
                STATE_RECOGNIZED: St,
                STATE_CANCELLED: Ct,
                STATE_FAILED: 32,
                DIRECTION_NONE: k,
                DIRECTION_LEFT: Y,
                DIRECTION_RIGHT: N,
                DIRECTION_UP: F,
                DIRECTION_DOWN: q,
                DIRECTION_HORIZONTAL: W,
                DIRECTION_VERTICAL: V,
                DIRECTION_ALL: X,
                Manager: Ft,
                Input: U,
                TouchAction: xt,
                TouchInput: dt,
                MouseInput: nt,
                PointerEventInput: ut,
                TouchMouseInput: mt,
                SingleTouchInput: ct,
                Recognizer: Rt,
                AttrRecognizer: It,
                Tap: Yt,
                Pan: zt,
                Swipe: kt,
                Pinch: Dt,
                Rotate: Ht,
                Press: jt,
                on: y,
                off: g,
                each: n,
                merge: f,
                extend: p,
                inherit: d,
                bindFn: m,
                prefixed: P,
              }),
              typeof Vt == i && Vt.amd
                ? Vt(function () {
                    return Nt;
                  })
                : void 0 !== Wt && Wt.exports
                  ? (Wt.exports = Nt)
                  : (t.Hammer = Nt));
          })(window, document);
        },
        {},
      ],
      14: [
        function (t, e, i) {
          'use strict';
          function r() {}
          ((r.prototype.addEventListener = function (t, e) {
            var i = (this.__events = this.__events || {}),
              t = (i[t] = i[t] || []);
            t.indexOf(e) < 0 && t.push(e);
          }),
            (r.prototype.removeEventListener = function (t, e) {
              t = (this.__events = this.__events || {})[t];
              !t || (0 <= (e = t.indexOf(e)) && t.splice(e, 1));
            }),
            (r.prototype.emit = function (t, e) {
              var i = (this.__events = this.__events || {})[t],
                r = Array.prototype.slice.call(arguments, 1);
              if (i) for (var n = 0; n < i.length; n++) i[n].apply(this, r);
            }),
            (e.exports = function (t) {
              for (var e in r.prototype)
                r.prototype.hasOwnProperty(e) && (t.prototype[e] = r.prototype[e]);
            }));
        },
        {},
      ],
      15: [
        function (t, e, i) {
          'use strict';
          var r = t('minimal-event-emitter'),
            n = t('./util/positionAbsolutely'),
            o = t('./util/dom').setTransform,
            s = t('./util/clearOwnProperties');
          function a(t, e, i, r, n) {
            (((n = n || {}).perspective = n.perspective || {}),
              (n.perspective.extraTransforms =
                null != n.perspective.extraTransforms ? n.perspective.extraTransforms : ''),
              (this._domElement = t),
              (this._parentDomElement = e),
              (this._view = i),
              (this._coords = {}),
              (this._perspective = {}),
              this.setPosition(r),
              this._parentDomElement.appendChild(this._domElement),
              this.setPerspective(n.perspective),
              (this._visible = !0),
              (this._position = { x: 0, y: 0 }));
          }
          (r(a),
            (a.prototype.destroy = function () {
              (this._parentDomElement.removeChild(this._domElement), s(this));
            }),
            (a.prototype.domElement = function () {
              return this._domElement;
            }),
            (a.prototype.position = function () {
              return this._coords;
            }),
            (a.prototype.setPosition = function (t) {
              for (var e in t) this._coords[e] = t[e];
              this._update();
            }),
            (a.prototype.perspective = function () {
              return this._perspective;
            }),
            (a.prototype.setPerspective = function (t) {
              for (var e in t) this._perspective[e] = t[e];
              this._update();
            }),
            (a.prototype.show = function () {
              this._visible || ((this._visible = !0), this._update());
            }),
            (a.prototype.hide = function () {
              this._visible && ((this._visible = !1), this._update());
            }),
            (a.prototype._update = function () {
              var t,
                e = this._domElement,
                i = this._coords,
                r = this._position,
                n = !1;
              (this._visible &&
                ((t = this._view),
                this._perspective.radius
                  ? ((n = !0), this._setEmbeddedPosition(t, i))
                  : (t.coordinatesToScreen(i, r),
                    (i = r.x),
                    (r = r.y),
                    null != i && null != r && ((n = !0), this._setPosition(i, r)))),
                n
                  ? ((e.style.display = 'block'), (e.style.position = 'absolute'))
                  : ((e.style.display = 'none'), (e.style.position = '')));
            }),
            (a.prototype._setEmbeddedPosition = function (t, e) {
              e = t.coordinatesToPerspectiveTransform(
                e,
                this._perspective.radius,
                this._perspective.extraTransforms
              );
              o(this._domElement, e);
            }),
            (a.prototype._setPosition = function (t, e) {
              n(this._domElement, t, e, this._perspective.extraTransforms);
            }),
            (e.exports = a));
        },
        {
          './util/clearOwnProperties': 76,
          './util/dom': 85,
          './util/positionAbsolutely': 96,
          'minimal-event-emitter': 14,
        },
      ],
      16: [
        function (t, e, i) {
          'use strict';
          var r = t('minimal-event-emitter'),
            n = t('./Hotspot'),
            s = t('./util/calcRect'),
            a = t('./util/positionAbsolutely'),
            o = t('./util/dom').setAbsolute,
            h = t('./util/dom').setOverflowHidden,
            u = t('./util/dom').setOverflowVisible,
            l = t('./util/dom').setNullSize,
            c = t('./util/dom').setPixelSize,
            p = t('./util/dom').setWithVendorPrefix('pointer-events'),
            f = t('./util/clearOwnProperties');
          function d(t, e, i, r, n) {
            ((n = n || {}),
              (this._parentDomElement = t),
              (this._stage = e),
              (this._view = i),
              (this._renderLoop = r),
              (this._hotspots = []),
              (this._visible = !0),
              (this._rect = n.rect),
              (this._visibilityOrRectChanged = !0),
              (this._stageWidth = null),
              (this._stageHeight = null),
              (this._tmpRect = {}),
              (this._hotspotContainerWrapper = document.createElement('div')),
              o(this._hotspotContainerWrapper),
              p(this._hotspotContainerWrapper, 'none'),
              this._parentDomElement.appendChild(this._hotspotContainerWrapper),
              (this._hotspotContainer = document.createElement('div')),
              o(this._hotspotContainer),
              p(this._hotspotContainer, 'all'),
              this._hotspotContainerWrapper.appendChild(this._hotspotContainer),
              (this._updateHandler = this._update.bind(this)),
              this._renderLoop.addEventListener('afterRender', this._updateHandler));
          }
          (r(d),
            (d.prototype.destroy = function () {
              for (; this._hotspots.length; ) this.destroyHotspot(this._hotspots[0]);
              (this._parentDomElement.removeChild(this._hotspotContainerWrapper),
                this._renderLoop.removeEventListener('afterRender', this._updateHandler),
                f(this));
            }),
            (d.prototype.domElement = function () {
              return this._hotspotContainer;
            }),
            (d.prototype.setRect = function (t) {
              ((this._rect = t), (this._visibilityOrRectChanged = !0));
            }),
            (d.prototype.rect = function () {
              return this._rect;
            }),
            (d.prototype.createHotspot = function (t, e, i) {
              e = e || {};
              i = new n(t, this._hotspotContainer, this._view, e, i);
              return (this._hotspots.push(i), i._update(), this.emit('hotspotsChange'), i);
            }),
            (d.prototype.hasHotspot = function (t) {
              return 0 <= this._hotspots.indexOf(t);
            }),
            (d.prototype.listHotspots = function () {
              return [].concat(this._hotspots);
            }),
            (d.prototype.destroyHotspot = function (t) {
              var e = this._hotspots.indexOf(t);
              if (e < 0) throw new Error('No such hotspot');
              (this._hotspots.splice(e, 1), t.destroy(), this.emit('hotspotsChange'));
            }),
            (d.prototype.hide = function () {
              this._visible &&
                ((this._visible = !1), (this._visibilityOrRectChanged = !0), this._update());
            }),
            (d.prototype.show = function () {
              this._visible ||
                ((this._visible = !0), (this._visibilityOrRectChanged = !0), this._update());
            }),
            (d.prototype._update = function () {
              var t,
                e = this._hotspotContainerWrapper,
                i = this._stage.width(),
                r = this._stage.height(),
                n = this._tmpRect;
              (this._visibilityOrRectChanged ||
                (this._rect && (i !== this._stageWidth || r !== this._stageHeight))) &&
                ((t = this._visible),
                (e.style.display = t ? 'block' : 'none'),
                t &&
                  (this._rect
                    ? (s(i, r, this._rect, n),
                      a(e, i * n.x, r * n.y),
                      c(e, i * n.width, r * n.height),
                      h(e))
                    : (a(e, 0, 0), l(e), u(e))),
                (this._stageWidth = i),
                (this._stageHeight = r),
                (this._visibilityOrRectChanged = !1));
              for (var o = 0; o < this._hotspots.length; o++) this._hotspots[o]._update();
            }),
            (e.exports = d));
        },
        {
          './Hotspot': 15,
          './util/calcRect': 72,
          './util/clearOwnProperties': 76,
          './util/dom': 85,
          './util/positionAbsolutely': 96,
          'minimal-event-emitter': 14,
        },
      ],
      17: [
        function (t, e, i) {
          'use strict';
          var r = t('minimal-event-emitter'),
            n = t('./util/extend'),
            o = t('./util/clearOwnProperties');
          function s(t, e, i, r, n) {
            n = n || {};
            var o = this;
            ((this._source = t),
              (this._geometry = e),
              (this._view = i),
              (this._textureStore = r),
              (this._effects = n.effects || {}),
              (this._fixedLevelIndex = null),
              (this._viewChangeHandler = function () {
                o.emit('viewChange', o.view());
              }),
              this._view.addEventListener('change', this._viewChangeHandler),
              (this._textureStoreChangeHandler = function () {
                o.emit('textureStoreChange', o.textureStore());
              }),
              this._textureStore.addEventListener('textureLoad', this._textureStoreChangeHandler),
              this._textureStore.addEventListener('textureError', this._textureStoreChangeHandler),
              this._textureStore.addEventListener(
                'textureInvalid',
                this._textureStoreChangeHandler
              ));
          }
          (r(s),
            (s.prototype.destroy = function () {
              (this._view.removeEventListener('change', this._viewChangeHandler),
                this._textureStore.removeEventListener(
                  'textureLoad',
                  this._textureStoreChangeHandler
                ),
                this._textureStore.removeEventListener(
                  'textureError',
                  this._textureStoreChangeHandler
                ),
                this._textureStore.removeEventListener(
                  'textureInvalid',
                  this._textureStoreChangeHandler
                ),
                o(this));
            }),
            (s.prototype.source = function () {
              return this._source;
            }),
            (s.prototype.geometry = function () {
              return this._geometry;
            }),
            (s.prototype.view = function () {
              return this._view;
            }),
            (s.prototype.textureStore = function () {
              return this._textureStore;
            }),
            (s.prototype.effects = function () {
              return this._effects;
            }),
            (s.prototype.setEffects = function (t) {
              ((this._effects = t), this.emit('effectsChange', this._effects));
            }),
            (s.prototype.mergeEffects = function (t) {
              (n(this._effects, t), this.emit('effectsChange', this._effects));
            }),
            (s.prototype.fixedLevel = function () {
              return this._fixedLevelIndex;
            }),
            (s.prototype.setFixedLevel = function (t) {
              if (t !== this._fixedLevelIndex) {
                if (null != t && (t >= this._geometry.levelList.length || t < 0))
                  throw new Error('Level index out of range: ' + t);
                ((this._fixedLevelIndex = t), this.emit('fixedLevelChange', this._fixedLevelIndex));
              }
            }),
            (s.prototype._selectLevel = function () {
              var t =
                null != this._fixedLevelIndex
                  ? this._geometry.levelList[this._fixedLevelIndex]
                  : this._view.selectLevel(this._geometry.selectableLevelList);
              return t;
            }),
            (s.prototype.visibleTiles = function (t) {
              var e = this._selectLevel();
              return this._geometry.visibleTiles(this._view, e, t);
            }),
            (s.prototype.pinLevel = function (t) {
              for (
                var t = this._geometry.levelList[t], e = this._geometry.levelTiles(t), i = 0;
                i < e.length;
                i++
              )
                this._textureStore.pin(e[i]);
            }),
            (s.prototype.unpinLevel = function (t) {
              for (
                var t = this._geometry.levelList[t], e = this._geometry.levelTiles(t), i = 0;
                i < e.length;
                i++
              )
                this._textureStore.unpin(e[i]);
            }),
            (s.prototype.pinFirstLevel = function () {
              return this.pinLevel(0);
            }),
            (s.prototype.unpinFirstLevel = function () {
              return this.unpinLevel(0);
            }),
            (e.exports = s));
        },
        { './util/clearOwnProperties': 76, './util/extend': 86, 'minimal-event-emitter': 14 },
      ],
      18: [
        function (t, e, i) {
          'use strict';
          function r(t) {
            (this.constructor.super_.apply(this, arguments), (this.message = t));
          }
          (t('./util/inherits')(r, Error), (e.exports = r));
        },
        { './util/inherits': 89 },
      ],
      19: [
        function (t, e, i) {
          'use strict';
          var r = t('minimal-event-emitter'),
            n = t('./util/clearOwnProperties');
          function o(t) {
            var e = this;
            ((this._stage = t),
              (this._running = !1),
              (this._rendering = !1),
              (this._requestHandle = null),
              (this._boundLoop = this._loop.bind(this)),
              (this._renderInvalidHandler = function () {
                e._rendering || e.renderOnNextFrame();
              }),
              this._stage.addEventListener('renderInvalid', this._renderInvalidHandler));
          }
          (r(o),
            (o.prototype.destroy = function () {
              (this.stop(),
                this._stage.removeEventListener('renderInvalid', this._renderInvalidHandler),
                n(this));
            }),
            (o.prototype.stage = function () {
              return this._stage;
            }),
            (o.prototype.start = function () {
              ((this._running = !0), this.renderOnNextFrame());
            }),
            (o.prototype.stop = function () {
              (this._requestHandle &&
                (window.cancelAnimationFrame(this._requestHandle), (this._requestHandle = null)),
                (this._running = !1));
            }),
            (o.prototype.renderOnNextFrame = function () {
              this._running &&
                !this._requestHandle &&
                (this._requestHandle = window.requestAnimationFrame(this._boundLoop));
            }),
            (o.prototype._loop = function () {
              if (!this._running) throw new Error('Render loop running while in stopped state');
              ((this._requestHandle = null),
                (this._rendering = !0),
                this.emit('beforeRender'),
                (this._rendering = !1),
                this._stage.render(),
                this.emit('afterRender'));
            }),
            (e.exports = o));
        },
        { './util/clearOwnProperties': 76, 'minimal-event-emitter': 14 },
      ],
      20: [
        function (t, e, i) {
          'use strict';
          var a = t('./Layer'),
            h = t('./TextureStore'),
            r = t('./HotspotContainer'),
            n = t('minimal-event-emitter'),
            o = t('./util/now'),
            c = t('./util/noop'),
            p = t('./util/type'),
            f = t('./util/defaults'),
            s = t('./util/clearOwnProperties');
          function u(t, e) {
            ((this._viewer = t),
              (this._view = e),
              (this._layers = []),
              (this._hotspotContainer = new r(
                t._controlContainer,
                t.stage(),
                this._view,
                t.renderLoop()
              )),
              (this._movement = null),
              (this._movementStartTime = null),
              (this._movementStep = null),
              (this._movementParams = null),
              (this._movementCallback = null),
              (this._updateMovementHandler = this._updateMovement.bind(this)),
              (this._updateHotspotContainerHandler = this._updateHotspotContainer.bind(this)),
              this._viewer.addEventListener('sceneChange', this._updateHotspotContainerHandler),
              (this._viewChangeHandler = this.emit.bind(this, 'viewChange')),
              this._view.addEventListener('change', this._viewChangeHandler),
              this._updateHotspotContainer());
          }
          (n(u),
            (u.prototype.destroy = function () {
              (this._view.removeEventListener('change', this._viewChangeHandler),
                this._viewer.removeEventListener(
                  'sceneChange',
                  this._updateHotspotContainerHandler
                ),
                this._movement && this.stopMovement(),
                this._hotspotContainer.destroy(),
                this.destroyAllLayers(),
                s(this));
            }),
            (u.prototype.hotspotContainer = function () {
              return this._hotspotContainer;
            }),
            (u.prototype.layer = function () {
              return this._layers[0];
            }),
            (u.prototype.listLayers = function () {
              return [].concat(this._layers);
            }),
            (u.prototype.view = function () {
              return this._view;
            }),
            (u.prototype.viewer = function () {
              return this._viewer;
            }),
            (u.prototype.visible = function () {
              return this._viewer.scene() === this;
            }),
            (u.prototype.createLayer = function (t) {
              var e = (t = t || {}).textureStoreOpts || {},
                i = t.layerOpts || {},
                r = t.source,
                n = t.geometry,
                o = this._view,
                s = this._viewer.stage(),
                e = new h(r, s, e),
                i = new a(r, n, o, e, i);
              return (
                this._layers.push(i),
                t.pinFirstLevel && i.pinFirstLevel(),
                this.emit('layerChange'),
                i
              );
            }),
            (u.prototype.destroyLayer = function (t) {
              var e = this._layers.indexOf(t);
              if (e < 0) throw new Error('No such layer in scene');
              (this._layers.splice(e, 1),
                this.emit('layerChange'),
                t.textureStore().destroy(),
                t.destroy());
            }),
            (u.prototype.destroyAllLayers = function () {
              for (; 0 < this._layers.length; ) this.destroyLayer(this._layers[0]);
            }),
            (u.prototype.switchTo = function (t, e) {
              return this._viewer.switchScene(this, t, e);
            }),
            (u.prototype.lookTo = function (t, e, i) {
              var r = this;
              if (((e = e || {}), (i = i || c), 'object' !== p(t)))
                throw new Error('Target view parameters must be an object');
              var a =
                  null != e.ease
                    ? e.ease
                    : function (t) {
                        return (t *= 2) < 1 ? 0.5 * t * t : -0.5 * (--t * (t - 2) - 1);
                      },
                n = null != e.controlsInterrupt && e.controlsInterrupt,
                h = null != e.transitionDuration ? e.transitionDuration : 1e3,
                o = null == e.shortest || e.shortest,
                e = this._view,
                u = e.parameters(),
                l = {};
              (f(l, t), f(l, u), o && e.normalizeToClosest && e.normalizeToClosest(l, l));
              var s = this._viewer.controls().enabled();
              (n || this._viewer.controls().disable(),
                this.startMovement(
                  function () {
                    var s = !1;
                    return function (t, e) {
                      if (h <= e && s) return null;
                      var i,
                        r = Math.min(e / h, 1);
                      for (i in t) {
                        var n = u[i],
                          o = l[i];
                        t[i] = n + a(r) * (o - n);
                      }
                      return ((s = h <= e), t);
                    };
                  },
                  function () {
                    (s && r._viewer.controls().enable(), i());
                  }
                ));
            }),
            (u.prototype.startMovement = function (t, e) {
              var i = this._viewer.renderLoop();
              this._movement && this.stopMovement();
              var r = t();
              if ('function' != typeof r) throw new Error('Bad movement');
              ((this._movement = t),
                (this._movementStep = r),
                (this._movementStartTime = o()),
                (this._movementParams = {}),
                (this._movementCallback = e),
                i.addEventListener('beforeRender', this._updateMovementHandler),
                i.renderOnNextFrame());
            }),
            (u.prototype.stopMovement = function () {
              var t = this._movementCallback,
                e = this._viewer.renderLoop();
              this._movement &&
                ((this._movement = null),
                (this._movementStep = null),
                (this._movementStartTime = null),
                (this._movementParams = null),
                (this._movementCallback = null),
                e.removeEventListener('beforeRender', this._updateMovementHandler),
                t && t());
            }),
            (u.prototype.movement = function () {
              return this._movement;
            }),
            (u.prototype._updateMovement = function () {
              if (!this._movement) throw new Error('Should not call update');
              var t = this._viewer.renderLoop(),
                e = this._view,
                i = o() - this._movementStartTime,
                r = this._movementStep,
                n = this._movementParams;
              null == (n = r((n = e.parameters(n)), i))
                ? this.stopMovement()
                : (e.setParameters(n), t.renderOnNextFrame());
            }),
            (u.prototype._updateHotspotContainer = function () {
              this.visible() ? this._hotspotContainer.show() : this._hotspotContainer.hide();
            }),
            (e.exports = u));
        },
        {
          './HotspotContainer': 16,
          './Layer': 17,
          './TextureStore': 21,
          './util/clearOwnProperties': 76,
          './util/defaults': 81,
          './util/noop': 92,
          './util/now': 93,
          './util/type': 101,
          'minimal-event-emitter': 14,
        },
      ],
      21: [
        function (t, e, i) {
          'use strict';
          var r = t('./collections/Map'),
            n = t('./collections/Set'),
            o = t('./collections/LruSet'),
            s = t('minimal-event-emitter'),
            a = t('./util/defaults'),
            h = t('./util/retry'),
            u = t('./util/chain'),
            l = t('./util/inherits'),
            c = t('./util/clearOwnProperties'),
            p = 'undefined' != typeof MARZIPANODEBUG && MARZIPANODEBUG.textureStore,
            f = 0,
            d = 1,
            m = 2,
            v = 3,
            _ = { previouslyVisibleCacheSize: 512 },
            y = 0;
          function g() {}
          function w(n, o) {
            var s = this,
              a = y++;
            ((s._id = a),
              (s._store = n),
              (s._tile = o),
              (s._asset = null),
              (s._texture = null),
              (s._changeHandler = function () {
                n.emit('textureInvalid', o);
              }));
            var t = n.source(),
              e = n.stage(),
              i = t.loadAsset.bind(t),
              t = e.createTexture.bind(e),
              t = u(h(i), t);
            (n.emit('textureStartLoad', o),
              p && console.log('loading', a, o),
              (s._cancel = t(e, o, function (t, e, i, r) {
                return (
                  (s._cancel = null),
                  t
                    ? (i && i.destroy(),
                      r && r.destroy(),
                      void (t instanceof g
                        ? (n.emit('textureCancel', o), p && console.log('cancel', a, o))
                        : (n.emit('textureError', o, t), p && console.log('error', a, o))))
                    : ((s._texture = r),
                      i.isDynamic()
                        ? (s._asset = i).addEventListener('change', s._changeHandler)
                        : i.destroy(),
                      n.emit('textureLoad', o),
                      void (p && console.log('load', a, o)))
                );
              })));
          }
          function b(t, e, i) {
            ((i = a(i || {}, _)),
              (this._source = t),
              (this._stage = e),
              (this._state = f),
              (this._delimCount = 0),
              (this._itemMap = new r()),
              (this._visible = new n()),
              (this._previouslyVisible = new o(i.previouslyVisibleCacheSize)),
              (this._pinMap = new r()),
              (this._newVisible = new n()),
              (this._noLongerVisible = []),
              (this._visibleAgain = []),
              (this._evicted = []));
          }
          (l(g, Error),
            (w.prototype.asset = function () {
              return this._asset;
            }),
            (w.prototype.texture = function () {
              return this._texture;
            }),
            (w.prototype.destroy = function () {
              var t = this._id,
                e = this._store,
                i = this._tile,
                r = this._asset,
                n = this._texture,
                o = this._cancel;
              o
                ? o(new g())
                : (r && (r.removeEventListener('change', this._changeHandler), r.destroy()),
                  n && n.destroy(),
                  e.emit('textureUnload', i),
                  p && console.log('unload', t, i),
                  c(this));
            }),
            s(w),
            s(b),
            (b.prototype.destroy = function () {
              (this.clear(), c(this));
            }),
            (b.prototype.stage = function () {
              return this._stage;
            }),
            (b.prototype.source = function () {
              return this._source;
            }),
            (b.prototype.clear = function () {
              var e = this;
              ((e._evicted.length = 0),
                e._itemMap.forEach(function (t) {
                  e._evicted.push(t);
                }),
                e._evicted.forEach(function (t) {
                  e._unloadTile(t);
                }),
                e._itemMap.clear(),
                e._visible.clear(),
                e._previouslyVisible.clear(),
                e._pinMap.clear(),
                e._newVisible.clear(),
                (e._noLongerVisible.length = 0),
                (e._visibleAgain.length = 0),
                (e._evicted.length = 0));
            }),
            (b.prototype.clearNotPinned = function () {
              var e = this;
              ((e._evicted.length = 0),
                e._itemMap.forEach(function (t) {
                  e._pinMap.has(t) || e._evicted.push(t);
                }),
                e._evicted.forEach(function (t) {
                  e._unloadTile(t);
                }),
                e._visible.clear(),
                e._previouslyVisible.clear(),
                (e._evicted.length = 0));
            }),
            (b.prototype.startFrame = function () {
              if (this._state !== f && this._state !== d)
                throw new Error('TextureStore: startFrame called out of sequence');
              ((this._state = d), this._delimCount++);
            }),
            (b.prototype.markTile = function (t) {
              if (this._state !== d && this._state !== m)
                throw new Error('TextureStore: markTile called out of sequence');
              this._state = m;
              var e = this._itemMap.get(t),
                i = e && e.texture(),
                e = e && e.asset();
              (i && e && i.refresh(t, e), this._newVisible.add(t));
            }),
            (b.prototype.endFrame = function () {
              if (this._state !== d && this._state !== m && this._state !== v)
                throw new Error('TextureStore: endFrame called out of sequence');
              ((this._state = v),
                this._delimCount--,
                this._delimCount || (this._update(), (this._state = f)));
            }),
            (b.prototype._update = function () {
              var r = this;
              ((r._noLongerVisible.length = 0),
                r._visible.forEach(function (t) {
                  r._newVisible.has(t) || r._noLongerVisible.push(t);
                }),
                (r._visibleAgain.length = 0),
                r._newVisible.forEach(function (t) {
                  r._previouslyVisible.has(t) && r._visibleAgain.push(t);
                }),
                r._visibleAgain.forEach(function (t) {
                  r._previouslyVisible.remove(t);
                }),
                (r._evicted.length = 0),
                r._noLongerVisible.forEach(function (t) {
                  var e,
                    i = r._itemMap.get(t);
                  i && i.texture()
                    ? null != (e = r._previouslyVisible.add(t)) && r._evicted.push(e)
                    : i && r._unloadTile(t);
                }),
                r._evicted.forEach(function (t) {
                  r._pinMap.has(t) || r._unloadTile(t);
                }),
                r._newVisible.forEach(function (t) {
                  r._itemMap.get(t) || r._loadTile(t);
                }));
              var t = r._visible;
              ((r._visible = r._newVisible),
                (r._newVisible = t),
                r._newVisible.clear(),
                (r._noLongerVisible.length = 0),
                (r._visibleAgain.length = 0),
                (r._evicted.length = 0));
            }),
            (b.prototype._loadTile = function (t) {
              if (this._itemMap.has(t))
                throw new Error('TextureStore: loading texture already in cache');
              var e = new w(this, t);
              this._itemMap.set(t, e);
            }),
            (b.prototype._unloadTile = function (t) {
              t = this._itemMap.del(t);
              if (!t) throw new Error('TextureStore: unloading texture not in cache');
              t.destroy();
            }),
            (b.prototype.asset = function (t) {
              t = this._itemMap.get(t);
              return t ? t.asset() : null;
            }),
            (b.prototype.texture = function (t) {
              t = this._itemMap.get(t);
              return t ? t.texture() : null;
            }),
            (b.prototype.pin = function (t) {
              var e = (this._pinMap.get(t) || 0) + 1;
              return (this._pinMap.set(t, e), this._itemMap.has(t) || this._loadTile(t), e);
            }),
            (b.prototype.unpin = function (t) {
              var e = this._pinMap.get(t);
              if (!e) throw new Error('TextureStore: unpin when not pinned');
              return (
                0 < --e
                  ? this._pinMap.set(t, e)
                  : (this._pinMap.del(t),
                    this._visible.has(t) || this._previouslyVisible.has(t) || this._unloadTile(t)),
                e
              );
            }),
            (b.prototype.query = function (t) {
              var e = this._itemMap.get(t),
                i = this._pinMap.get(t) || 0;
              return {
                visible: this._visible.has(t),
                previouslyVisible: this._previouslyVisible.has(t),
                hasAsset: null != e && null != e.asset(),
                hasTexture: null != e && null != e.texture(),
                pinned: 0 !== i,
                pinCount: i,
              };
            }),
            (e.exports = b));
        },
        {
          './collections/LruSet': 29,
          './collections/Map': 30,
          './collections/Set': 31,
          './util/chain': 74,
          './util/clearOwnProperties': 76,
          './util/defaults': 81,
          './util/inherits': 89,
          './util/retry': 99,
          'minimal-event-emitter': 14,
        },
      ],
      22: [
        function (t, e, i) {
          'use strict';
          var r = t('./collections/Set');
          function n() {
            ((this._stack = []), (this._visited = new r()), (this._vertices = null));
          }
          ((n.prototype.search = function (t, e, i) {
            var r = this._stack,
              n = this._visited,
              o = this._vertices,
              s = 0;
            for (this._clear(), r.push(e); 0 < r.length; ) {
              var a = r.pop();
              if (!n.has(a) && t.intersects(a.vertices(o))) {
                n.add(a);
                for (var h = a.neighbors(), u = 0; u < h.length; u++) r.push(h[u]);
                (i.push(a), s++);
              }
            }
            return ((this._vertices = o), this._clear(), s);
          }),
            (n.prototype._clear = function () {
              ((this._stack.length = 0), this._visited.clear());
            }),
            (e.exports = n));
        },
        { './collections/Set': 31 },
      ],
      23: [
        function (t, e, i) {
          'use strict';
          var r = t('minimal-event-emitter'),
            n = t('./util/defaults'),
            o = t('./util/now'),
            s = { duration: 1 / 0 };
          function a(t) {
            ((t = n(t || {}, s)),
              (this._duration = t.duration),
              (this._startTime = null),
              (this._handle = null),
              (this._check = this._check.bind(this)));
          }
          (r(a),
            (a.prototype.start = function () {
              ((this._startTime = o()),
                null == this._handle && this._duration < 1 / 0 && this._setup(this._duration));
            }),
            (a.prototype.started = function () {
              return null != this._startTime;
            }),
            (a.prototype.stop = function () {
              (this._startTime = null) != this._handle &&
                (clearTimeout(this._handle), (this._handle = null));
            }),
            (a.prototype._setup = function (t) {
              this._handle = setTimeout(this._check, t);
            }),
            (a.prototype._teardown = function () {
              (clearTimeout(this._handle), (this._handle = null));
            }),
            (a.prototype._check = function () {
              var t = o() - this._startTime,
                t = this._duration - t;
              (this._teardown(),
                t <= 0
                  ? (this.emit('timeout'), (this._startTime = null))
                  : t < 1 / 0 && this._setup(t));
            }),
            (a.prototype.duration = function () {
              return this._duration;
            }),
            (a.prototype.setDuration = function (t) {
              ((this._duration = t), null != this._startTime && this._check());
            }),
            (e.exports = a));
        },
        { './util/defaults': 81, './util/now': 93, 'minimal-event-emitter': 14 },
      ],
      24: [
        function (t, e, i) {
          'use strict';
          var r = t('minimal-event-emitter'),
            n = t('./RenderLoop'),
            o = t('./controls/Controls'),
            s = t('./Scene'),
            a = t('./Timer'),
            h = t('./stages/WebGl'),
            u = t('./controls/ControlCursor'),
            l = t('./controls/HammerGestures'),
            c = t('./controls/registerDefaultControls'),
            p = t('./renderers/registerDefaultRenderers'),
            f = t('./util/dom').setOverflowHidden,
            d = t('./util/dom').setAbsolute,
            m = t('./util/dom').setFullSize,
            v = t('./util/tween'),
            _ = t('./util/noop'),
            y = t('./util/clearOwnProperties');
          function g(t, e) {
            ((e = e || {}),
              (this._domElement = t),
              f(t),
              (this._stage = new h(e.stage)),
              p(this._stage),
              this._domElement.appendChild(this._stage.domElement()),
              (this._controlContainer = document.createElement('div')),
              d(this._controlContainer),
              m(this._controlContainer),
              t.appendChild(this._controlContainer),
              (this._size = {}),
              this.updateSize(),
              (this._updateSizeListener = this.updateSize.bind(this)),
              window.addEventListener('resize', this._updateSizeListener),
              (this._renderLoop = new n(this._stage)),
              (this._controls = new o()),
              (this._controlMethods = c(this._controls, this._controlContainer, e.controls)),
              this._controls.attach(this._renderLoop),
              (this._hammerManagerTouch = l.get(this._controlContainer, 'touch')),
              (this._hammerManagerMouse = l.get(this._controlContainer, 'mouse')),
              (this._dragCursor = new u(
                this._controls,
                'mouseViewDrag',
                t,
                (e.cursors && e.cursors.drag) || {}
              )),
              this._renderLoop.start(),
              (this._scenes = []),
              (this._currentScene = null),
              (this._replacedScene = null),
              (this._cancelCurrentTween = null),
              (this._layerChangeHandler = this._updateSceneLayers.bind(this)),
              (this._viewChangeHandler = this.emit.bind(this, 'viewChange')),
              (this._idleTimer = new a()),
              this._idleTimer.start(),
              (this._resetIdleTimerHandler = this._resetIdleTimer.bind(this)),
              this.addEventListener('viewChange', this._resetIdleTimerHandler),
              (this._triggerIdleTimerHandler = this._triggerIdleTimer.bind(this)),
              this._idleTimer.addEventListener('timeout', this._triggerIdleTimerHandler),
              (this._stopMovementHandler = this.stopMovement.bind(this)),
              this._controls.addEventListener('active', this._stopMovementHandler),
              this.addEventListener('sceneChange', this._stopMovementHandler),
              (this._idleMovement = null));
          }
          (r(g),
            (g.prototype.destroy = function () {
              for (var t in (window.removeEventListener('resize', this._updateSizeListener),
              this._currentScene && this._removeSceneEventListeners(this._currentScene),
              this._replacedScene && this._removeSceneEventListeners(this._replacedScene),
              this._dragCursor.destroy(),
              this._controlMethods))
                this._controlMethods[t].destroy();
              for (; this._scenes.length; ) this.destroyScene(this._scenes[0]);
              (this._domElement.removeChild(this._stage.domElement()),
                this._stage.destroy(),
                this._renderLoop.destroy(),
                this._controls.destroy(),
                (this._controls = null),
                this._cancelCurrentTween && this._cancelCurrentTween(),
                y(this));
            }),
            (g.prototype.updateSize = function () {
              var t = this._size;
              ((t.width = this._domElement.clientWidth),
                (t.height = this._domElement.clientHeight),
                this._stage.setSize(t));
            }),
            (g.prototype.stage = function () {
              return this._stage;
            }),
            (g.prototype.renderLoop = function () {
              return this._renderLoop;
            }),
            (g.prototype.controls = function () {
              return this._controls;
            }),
            (g.prototype.domElement = function () {
              return this._domElement;
            }),
            (g.prototype.createScene = function (t) {
              t = t || {};
              var e = this.createEmptyScene({ view: t.view });
              return (
                e.createLayer({
                  source: t.source,
                  geometry: t.geometry,
                  pinFirstLevel: t.pinFirstLevel,
                  textureStoreOpts: t.textureStoreOpts,
                  layerOpts: t.layerOpts,
                }),
                e
              );
            }),
            (g.prototype.createEmptyScene = function (t) {
              t = new s(this, (t = t || {}).view);
              return (this._scenes.push(t), t);
            }),
            (g.prototype._updateSceneLayers = function () {
              var t,
                e,
                i = this._stage,
                r = this._currentScene,
                n = this._replacedScene,
                o = i.listLayers(),
                s = [];
              if (
                (n && (s = s.concat(n.listLayers())),
                r && (s = s.concat(r.listLayers())),
                1 !== Math.abs(o.length - s.length))
              )
                throw new Error('Stage and scene out of sync');
              if (s.length < o.length)
                for (t = 0; t < o.length; t++)
                  if (((e = o[t]), s.indexOf(e) < 0)) {
                    this._removeLayerFromStage(e);
                    break;
                  }
              if (s.length > o.length)
                for (t = 0; t < s.length; t++)
                  ((e = s[t]), o.indexOf(e) < 0 && this._addLayerToStage(e, t));
            }),
            (g.prototype._addLayerToStage = function (t, e) {
              (t.pinFirstLevel(), this._stage.addLayer(t, e));
            }),
            (g.prototype._removeLayerFromStage = function (t) {
              (this._stage.removeLayer(t), t.unpinFirstLevel(), t.textureStore().clearNotPinned());
            }),
            (g.prototype._addSceneEventListeners = function (t) {
              (t.addEventListener('layerChange', this._layerChangeHandler),
                t.addEventListener('viewChange', this._viewChangeHandler));
            }),
            (g.prototype._removeSceneEventListeners = function (t) {
              (t.removeEventListener('layerChange', this._layerChangeHandler),
                t.removeEventListener('viewChange', this._viewChangeHandler));
            }),
            (g.prototype.destroyScene = function (t) {
              var e,
                i,
                r = this._scenes.indexOf(t);
              if (r < 0) throw new Error('No such scene in viewer');
              if (this._currentScene === t) {
                for (
                  this._removeSceneEventListeners(t), i = t.listLayers(), e = 0;
                  e < i.length;
                  e++
                )
                  this._removeLayerFromStage(i[e]);
                (this._cancelCurrentTween &&
                  (this._cancelCurrentTween(), (this._cancelCurrentTween = null)),
                  (this._currentScene = null),
                  this.emit('sceneChange'));
              }
              if (this._replacedScene === t) {
                for (
                  this._removeSceneEventListeners(t), i = t.listLayers(), e = 0;
                  e < i.length;
                  e++
                )
                  this._removeLayerFromStage(i[e]);
                this._replacedScene = null;
              }
              (this._scenes.splice(r, 1), t.destroy());
            }),
            (g.prototype.destroyAllScenes = function () {
              for (; 0 < this._scenes.length; ) this.destroyScene(this._scenes[0]);
            }),
            (g.prototype.hasScene = function (t) {
              return 0 <= this._scenes.indexOf(t);
            }),
            (g.prototype.listScenes = function () {
              return [].concat(this._scenes);
            }),
            (g.prototype.scene = function () {
              return this._currentScene;
            }),
            (g.prototype.view = function () {
              var t = this._currentScene;
              return t ? t.view() : null;
            }),
            (g.prototype.lookTo = function (t, e, i) {
              var r = this._currentScene;
              r && r.lookTo(t, e, i);
            }),
            (g.prototype.startMovement = function (t, e) {
              var i = this._currentScene;
              i && i.startMovement(t, e);
            }),
            (g.prototype.stopMovement = function () {
              var t = this._currentScene;
              t && t.stopMovement();
            }),
            (g.prototype.movement = function () {
              var t = this._currentScene;
              if (t) return t.movement();
            }),
            (g.prototype.setIdleMovement = function (t, e) {
              (this._idleTimer.setDuration(t), (this._idleMovement = e));
            }),
            (g.prototype.breakIdleMovement = function () {
              (this.stopMovement(), this._resetIdleTimer());
            }),
            (g.prototype._resetIdleTimer = function () {
              this._idleTimer.start();
            }),
            (g.prototype._triggerIdleTimer = function () {
              var t = this._idleMovement;
              t && this.startMovement(t);
            }));
          function w(e, t, i) {
            (t.listLayers().forEach(function (t) {
              t.mergeEffects({ opacity: e });
            }),
              (t._hotspotContainer.domElement().style.opacity = e));
          }
          ((g.prototype.switchScene = function (e, t, i) {
            var r = this;
            ((t = t || {}), (i = i || _));
            var n = this._stage,
              o = this._currentScene;
            if (o !== e) {
              if (this._scenes.indexOf(e) < 0) throw new Error('No such scene in viewer');
              this._cancelCurrentTween &&
                (this._cancelCurrentTween(), (this._cancelCurrentTween = null));
              var s = o ? o.listLayers() : [],
                a = e.listLayers(),
                n = n.listLayers();
              if (o && (n.length !== s.length || (1 < n.length && n[0] != s[0])))
                throw new Error('Stage not in sync with viewer');
              for (
                var n = null != t.transitionDuration ? t.transitionDuration : 1e3,
                  h = null != t.transitionUpdate ? t.transitionUpdate : w,
                  u = 0;
                u < a.length;
                u++
              )
                this._addLayerToStage(a[u]);
              ((this._cancelCurrentTween = v(
                n,
                function (t) {
                  h(t, e, o);
                },
                function () {
                  if (r._replacedScene) {
                    (r._removeSceneEventListeners(r._replacedScene),
                      (s = r._replacedScene.listLayers()));
                    for (var t = 0; t < s.length; t++) r._removeLayerFromStage(s[t]);
                    r._replacedScene = null;
                  }
                  ((r._cancelCurrentTween = null), i());
                }
              )),
                (this._currentScene = e),
                (this._replacedScene = o),
                this.emit('sceneChange'),
                this.emit('viewChange'),
                this._addSceneEventListeners(e));
            } else i();
          }),
            (e.exports = g));
        },
        {
          './RenderLoop': 19,
          './Scene': 20,
          './Timer': 23,
          './controls/ControlCursor': 36,
          './controls/Controls': 37,
          './controls/HammerGestures': 41,
          './controls/registerDefaultControls': 47,
          './renderers/registerDefaultRenderers': 61,
          './stages/WebGl': 70,
          './util/clearOwnProperties': 76,
          './util/dom': 85,
          './util/noop': 92,
          './util/tween': 100,
          'minimal-event-emitter': 14,
        },
      ],
      25: [
        function (t, e, i) {
          'use strict';
          var r = t('./Static'),
            n = t('../util/inherits'),
            o = t('minimal-event-emitter'),
            s = t('../util/clearOwnProperties');
          function a(t) {
            (this.constructor.super_.call(this, t), (this._timestamp = 0));
          }
          (n(a, r),
            o(a),
            (a.prototype.destroy = function () {
              s(this);
            }),
            (a.prototype.timestamp = function () {
              return this._timestamp;
            }),
            (a.prototype.isDynamic = function () {
              return !0;
            }),
            (a.prototype.markDirty = function () {
              (this._timestamp++, this.emit('change'));
            }),
            (e.exports = a));
        },
        {
          '../util/clearOwnProperties': 76,
          '../util/inherits': 89,
          './Static': 26,
          'minimal-event-emitter': 14,
        },
      ],
      26: [
        function (t, e, i) {
          'use strict';
          var r = t('../util/global'),
            n = t('minimal-event-emitter'),
            o = t('../util/clearOwnProperties'),
            s = {
              HTMLImageElement: ['naturalWidth', 'naturalHeight'],
              HTMLCanvasElement: ['width', 'height'],
              ImageBitmap: ['width', 'height'],
            };
          function a(t) {
            var e,
              i = !1;
            for (e in s)
              if (r[e] && t instanceof r[e]) {
                ((i = !0), (this._widthProp = s[e][0]), (this._heightProp = s[e][1]));
                break;
              }
            if (!i) throw new Error('Unsupported pixel source');
            this._element = t;
          }
          (n(a),
            (a.prototype.destroy = function () {
              o(this);
            }),
            (a.prototype.element = function () {
              return this._element;
            }),
            (a.prototype.width = function () {
              return this._element[this._widthProp];
            }),
            (a.prototype.height = function () {
              return this._element[this._heightProp];
            }),
            (a.prototype.timestamp = function () {
              return 0;
            }),
            (a.prototype.isDynamic = function () {
              return !1;
            }),
            (e.exports = a));
        },
        { '../util/clearOwnProperties': 76, '../util/global': 87, 'minimal-event-emitter': 14 },
      ],
      27: [
        function (t, e, i) {
          'use strict';
          var r = t('./util/defaults'),
            n = {
              yawSpeed: 0.1,
              pitchSpeed: 0.1,
              fovSpeed: 0.1,
              yawAccel: 0.01,
              pitchAccel: 0.01,
              fovAccel: 0.01,
              targetPitch: 0,
              targetFov: null,
            };
          e.exports = function (t) {
            var p = (t = r(t || {}, n)).yawSpeed,
              f = t.pitchSpeed,
              d = t.fovSpeed,
              m = t.yawAccel,
              v = t.pitchAccel,
              _ = t.fovAccel,
              y = t.targetPitch,
              g = t.targetFov;
            return function () {
              var r,
                n,
                o,
                s = 0,
                a = 0,
                h = 0,
                u = 0,
                l = 0,
                c = 0;
              return function (t, e) {
                var i;
                return (
                  (o = (e - s) / 1e3),
                  (r = Math.min(a + o * m, p)),
                  (n = r * o),
                  (t.yaw = t.yaw + n),
                  null != y &&
                    t.pitch !== y &&
                    ((i = (0.5 * h * h) / v),
                    (l =
                      Math.abs(y - t.pitch) > i ? Math.min(h + o * v, f) : Math.max(h - o * v, 0)),
                    (n = l * o),
                    y < t.pitch && (t.pitch = Math.max(y, t.pitch - n)),
                    y > t.pitch && (t.pitch = Math.min(y, t.pitch + n))),
                  null != g &&
                    t.fov !== y &&
                    ((i = (0.5 * u * u) / _),
                    (c = Math.abs(g - t.fov) > i ? Math.min(u + o * _, d) : Math.max(u - o * _, 0)),
                    (o = c * o),
                    g < t.fov && (t.fov = Math.max(g, t.fov - o)),
                    g > t.fov && (t.fov = Math.min(g, t.fov + o))),
                  (s = e),
                  (a = r),
                  (h = l),
                  (u = c),
                  t
                );
              };
            };
          };
        },
        { './util/defaults': 81 },
      ],
      28: [
        function (t, e, i) {
          'use strict';
          var r = t('../util/mod');
          function n(t) {
            if (!isFinite(t) || Math.floor(t) !== t || t < 0)
              throw new Error('LruMap: invalid capacity');
            ((this._capacity = t),
              (this._keys = new Array(this._capacity)),
              (this._values = new Array(this._capacity)),
              (this._start = 0),
              (this._size = 0));
          }
          ((n.prototype._index = function (t) {
            return r(this._start + t, this._capacity);
          }),
            (n.prototype.get = function (t) {
              for (var e = 0; e < this._size; e++) {
                var i = this._keys[this._index(e)];
                if (t.equals(i)) return this._values[this._index(e)];
              }
              return null;
            }),
            (n.prototype.set = function (t, e) {
              if (0 === this._capacity) return t;
              this.del(t);
              var i = this._size === this._capacity ? this._keys[this._index(0)] : null;
              return (
                (this._keys[this._index(this._size)] = t),
                (this._values[this._index(this._size)] = e),
                this._size < this._capacity ? this._size++ : (this._start = this._index(1)),
                i
              );
            }),
            (n.prototype.del = function (t) {
              for (var e = 0; e < this._size; e++)
                if (t.equals(this._keys[this._index(e)])) {
                  for (var i = this._values[this._index(e)], r = e; r < this._size - 1; r++)
                    ((this._keys[this._index(r)] = this._keys[this._index(r + 1)]),
                      (this._values[this._index(r)] = this._values[this._index(r + 1)]));
                  return (this._size--, i);
                }
              return null;
            }),
            (n.prototype.has = function (t) {
              for (var e = 0; e < this._size; e++)
                if (t.equals(this._keys[this._index(e)])) return !0;
              return !1;
            }),
            (n.prototype.size = function () {
              return this._size;
            }),
            (n.prototype.clear = function () {
              ((this._keys.length = 0),
                (this._values.length = 0),
                (this._start = 0),
                (this._size = 0));
            }),
            (n.prototype.forEach = function (t) {
              for (var e = 0, i = 0; i < this._size; i++)
                (t(this._keys[this._index(i)], this._values[this._index(i)]), (e += 1));
              return e;
            }),
            (e.exports = n));
        },
        { '../util/mod': 91 },
      ],
      29: [
        function (t, e, i) {
          'use strict';
          var r = t('../util/mod');
          function n(t) {
            if (!isFinite(t) || Math.floor(t) !== t || t < 0)
              throw new Error('LruSet: invalid capacity');
            ((this._capacity = t),
              (this._elements = new Array(this._capacity)),
              (this._start = 0),
              (this._size = 0));
          }
          ((n.prototype._index = function (t) {
            return r(this._start + t, this._capacity);
          }),
            (n.prototype.add = function (t) {
              if (0 === this._capacity) return t;
              this.remove(t);
              var e = this._size === this._capacity ? this._elements[this._index(0)] : null;
              return (
                (this._elements[this._index(this._size)] = t),
                this._size < this._capacity ? this._size++ : (this._start = this._index(1)),
                e
              );
            }),
            (n.prototype.remove = function (t) {
              for (var e = 0; e < this._size; e++) {
                var i = this._elements[this._index(e)];
                if (t.equals(i)) {
                  for (var r = e; r < this._size - 1; r++)
                    this._elements[this._index(r)] = this._elements[this._index(r + 1)];
                  return (this._size--, i);
                }
              }
              return null;
            }),
            (n.prototype.has = function (t) {
              for (var e = 0; e < this._size; e++)
                if (t.equals(this._elements[this._index(e)])) return !0;
              return !1;
            }),
            (n.prototype.size = function () {
              return this._size;
            }),
            (n.prototype.clear = function () {
              ((this._elements.length = 0), (this._start = 0), (this._size = 0));
            }),
            (n.prototype.forEach = function (t) {
              for (var e = 0, i = 0; i < this._size; i++)
                (t(this._elements[this._index(i)]), (e += 1));
              return e;
            }),
            (e.exports = n));
        },
        { '../util/mod': 91 },
      ],
      30: [
        function (t, e, i) {
          'use strict';
          var a = t('../util/mod');
          function r(t) {
            if (null != t && (!isFinite(t) || Math.floor(t) !== t || t < 1))
              throw new Error('Map: invalid capacity');
            ((this._capacity = t || 64), (this._keyBuckets = []), (this._valBuckets = []));
            for (var e = 0; e < this._capacity; e++)
              (this._keyBuckets.push([]), this._valBuckets.push([]));
            this._size = 0;
          }
          ((r.prototype.get = function (t) {
            for (
              var e = a(t.hash(), this._capacity), i = this._keyBuckets[e], r = 0;
              r < i.length;
              r++
            ) {
              var n = i[r];
              if (t.equals(n)) return this._valBuckets[e][r];
            }
            return null;
          }),
            (r.prototype.set = function (t, e) {
              for (
                var i = a(t.hash(), this._capacity),
                  r = this._keyBuckets[i],
                  n = this._valBuckets[i],
                  o = 0;
                o < r.length;
                o++
              ) {
                var s = r[o];
                if (t.equals(s)) {
                  s = n[o];
                  return ((r[o] = t), (n[o] = e), s);
                }
              }
              return (r.push(t), n.push(e), this._size++, null);
            }),
            (r.prototype.del = function (t) {
              for (
                var e = a(t.hash(), this._capacity),
                  i = this._keyBuckets[e],
                  r = this._valBuckets[e],
                  n = 0;
                n < i.length;
                n++
              ) {
                var o = i[n];
                if (t.equals(o)) {
                  for (var o = r[n], s = n; s < i.length - 1; s++)
                    ((i[s] = i[s + 1]), (r[s] = r[s + 1]));
                  return ((i.length = i.length - 1), (r.length = r.length - 1), this._size--, o);
                }
              }
              return null;
            }),
            (r.prototype.has = function (t) {
              for (
                var e = a(t.hash(), this._capacity), i = this._keyBuckets[e], r = 0;
                r < i.length;
                r++
              ) {
                var n = i[r];
                if (t.equals(n)) return !0;
              }
              return !1;
            }),
            (r.prototype.size = function () {
              return this._size;
            }),
            (r.prototype.clear = function () {
              for (var t = 0; t < this._capacity; t++)
                ((this._keyBuckets[t].length = 0), (this._valBuckets[t].length = 0));
              this._size = 0;
            }),
            (r.prototype.forEach = function (t) {
              for (var e = 0, i = 0; i < this._capacity; i++)
                for (var r = this._keyBuckets[i], n = this._valBuckets[i], o = 0; o < r.length; o++)
                  (t(r[o], n[o]), (e += 1));
              return e;
            }),
            (e.exports = r));
        },
        { '../util/mod': 91 },
      ],
      31: [
        function (t, e, i) {
          'use strict';
          var s = t('../util/mod');
          function r(t) {
            if (null != t && (!isFinite(t) || Math.floor(t) !== t || t < 1))
              throw new Error('Set: invalid capacity');
            ((this._capacity = this._capacity || 64), (this._buckets = []));
            for (var e = 0; e < this._capacity; e++) this._buckets.push([]);
            this._size = 0;
          }
          ((r.prototype.add = function (t) {
            for (
              var e = s(t.hash(), this._capacity), i = this._buckets[e], r = 0;
              r < i.length;
              r++
            ) {
              var n = i[r];
              if (t.equals(n)) return ((i[r] = t), n);
            }
            return (i.push(t), this._size++, null);
          }),
            (r.prototype.remove = function (t) {
              for (
                var e = s(t.hash(), this._capacity), i = this._buckets[e], r = 0;
                r < i.length;
                r++
              ) {
                var n = i[r];
                if (t.equals(n)) {
                  for (var o = r; o < i.length - 1; o++) i[o] = i[o + 1];
                  return ((i.length = i.length - 1), this._size--, n);
                }
              }
              return null;
            }),
            (r.prototype.has = function (t) {
              for (
                var e = s(t.hash(), this._capacity), i = this._buckets[e], r = 0;
                r < i.length;
                r++
              ) {
                var n = i[r];
                if (t.equals(n)) return !0;
              }
              return !1;
            }),
            (r.prototype.size = function () {
              return this._size;
            }),
            (r.prototype.clear = function () {
              for (var t = 0; t < this._capacity; t++) this._buckets[t].length = 0;
              this._size = 0;
            }),
            (r.prototype.forEach = function (t) {
              for (var e = 0, i = 0; i < this._capacity; i++)
                for (var r = this._buckets[i], n = 0; n < r.length; n++) (t(r[n]), (e += 1));
              return e;
            }),
            (e.exports = r));
        },
        { '../util/mod': 91 },
      ],
      32: [
        function (t, e, i) {
          'use strict';
          var r = t('./WorkQueue'),
            n = t('../util/mod');
          function o(t) {
            ((this._concurrency = (t && t.concurrency) || 1),
              (this._paused = (t && !!t.paused) || !1),
              (this._pool = []));
            for (var e = 0; e < this._concurrency; e++) this._pool.push(new r(t));
            this._next = 0;
          }
          ((o.prototype.length = function () {
            for (var t = 0, e = 0; e < this._pool.length; e++) t += this._pool[e].length();
            return t;
          }),
            (o.prototype.push = function (t, e) {
              var i = this._next,
                e = this._pool[i].push(t, e);
              return ((this._next = n(this._next + 1, this._concurrency)), e);
            }),
            (o.prototype.pause = function () {
              if (!this._paused) {
                this._paused = !0;
                for (var t = 0; t < this._concurrency; t++) this._pool[t].pause();
              }
            }),
            (o.prototype.resume = function () {
              if (this._paused) {
                this._paused = !1;
                for (var t = 0; t < this._concurrency; t++) this._pool[t].resume();
              }
            }),
            (e.exports = o));
        },
        { '../util/mod': 91, './WorkQueue': 33 },
      ],
      33: [
        function (t, e, i) {
          'use strict';
          var r = t('../util/now');
          function n(t, e) {
            ((this.fn = t), (this.cb = e), (this.cfn = null));
          }
          function o(t) {
            ((this._queue = []),
              (this._delay = (t && t.delay) || 0),
              (this._paused = (t && !!t.paused) || !1),
              (this._currentTask = null),
              (this._lastFinished = null));
          }
          ((o.prototype.length = function () {
            return this._queue.length;
          }),
            (o.prototype.push = function (t, e) {
              ((t = new n(t, e)), (e = this._cancel.bind(this, t)));
              return (this._queue.push(t), this._next(), e);
            }),
            (o.prototype.pause = function () {
              this._paused || (this._paused = !0);
            }),
            (o.prototype.resume = function () {
              this._paused && ((this._paused = !1), this._next());
            }),
            (o.prototype._start = function (t) {
              if (this._currentTask) throw new Error('WorkQueue: called start while running task');
              this._currentTask = t;
              var e = this._finish.bind(this, t);
              if (((t.cfn = t.fn(e)), 'function' != typeof t.cfn))
                throw new Error('WorkQueue: function is not cancellable');
            }),
            (o.prototype._finish = function (t) {
              var e = Array.prototype.slice.call(arguments, 1);
              if (this._currentTask !== t)
                throw new Error('WorkQueue: called finish on wrong task');
              (t.cb.apply(null, e),
                (this._currentTask = null),
                (this._lastFinished = r()),
                this._next());
            }),
            (o.prototype._cancel = function (t) {
              var e,
                i = Array.prototype.slice.call(arguments, 1);
              this._currentTask === t
                ? t.cfn.apply(null, i)
                : 0 <= (e = this._queue.indexOf(t)) &&
                  (this._queue.splice(e, 1), t.cb.apply(null, i));
            }),
            (o.prototype._next = function () {
              if (!this._paused && this._queue.length && !this._currentTask) {
                if (null != this._lastFinished) {
                  var t = r() - this._lastFinished,
                    t = this._delay - t;
                  if (0 < t) return void setTimeout(this._next.bind(this), t);
                }
                t = this._queue.shift();
                this._start(t);
              }
            }),
            (e.exports = o));
        },
        { '../util/now': 93 },
      ],
      34: [
        function (t, e, i) {
          'use strict';
          var h = t('gl-matrix').vec4,
            r = t('gl-matrix').mat4;
          function s(t, e, i) {
            var r, n, o, s, a;
            ((r = i),
              (n = t),
              (o = e.colorMatrix),
              (s = n[0]),
              (a = n[1]),
              (t = n[2]),
              (n = n[3]),
              (r[0] = o[0] * s + o[1] * a + o[2] * t + o[3] * n),
              (r[1] = o[4] * s + o[5] * a + o[6] * t + o[7] * n),
              (r[2] = o[8] * s + o[9] * a + o[10] * t + o[11] * n),
              (r[3] = o[12] * s + o[13] * a + o[14] * t + o[15] * n),
              h.add(i, i, e.colorOffset));
          }
          var a = h.create();
          e.exports = {
            identity: function (t) {
              return (
                ((t = t || {}).colorOffset = t.colorOffset || h.create()),
                (t.colorMatrix = t.colorMatrix || r.create()),
                t
              );
            },
            applyToPixel: s,
            applyToImageData: function (t, e) {
              for (var i = t.width, r = t.height, n = t.data, o = 0; o < i * r; o++)
                (h.set(
                  a,
                  n[4 * o + 0] / 255,
                  n[4 * o + 1] / 255,
                  n[4 * o + 2] / 255,
                  n[4 * o + 3] / 255
                ),
                  s(a, e, a),
                  (n[4 * o + 0] = 255 * a[0]),
                  (n[4 * o + 1] = 255 * a[1]),
                  (n[4 * o + 2] = 255 * a[2]),
                  (n[4 * o + 3] = 255 * a[3]));
            },
          };
        },
        { 'gl-matrix': 3 },
      ],
      35: [
        function (t, e, i) {
          'use strict';
          var r = t('minimal-event-emitter'),
            n = t('./Dynamics'),
            o = t('../util/now'),
            s = t('../util/clearOwnProperties');
          function a(t) {
            ((t = t || {}),
              (this._methods = []),
              (this._parameters = [
                'x',
                'y',
                'axisScaledX',
                'axisScaledY',
                'zoom',
                'yaw',
                'pitch',
                'roll',
              ]),
              (this._now = t.nowForTesting || o),
              (this._composedOffsets = {}),
              (this._composeReturn = { offsets: this._composedOffsets, changing: null }));
          }
          (r(a),
            (a.prototype.add = function (t) {
              var e, i, r;
              this.has(t) ||
                ((e = {}),
                this._parameters.forEach(function (t) {
                  e[t] = { dynamics: new n(), time: null };
                }),
                (i = this._updateDynamics.bind(this, e)),
                (r = { instance: t, dynamics: e, parameterDynamicsHandler: i }),
                t.addEventListener('parameterDynamics', i),
                this._methods.push(r));
            }),
            (a.prototype.remove = function (t) {
              t = this._indexOfInstance(t);
              0 <= t &&
                (t = this._methods.splice(t, 1)[0]).instance.removeEventListener(
                  'parameterDynamics',
                  t.parameterDynamicsHandler
                );
            }),
            (a.prototype.has = function (t) {
              return 0 <= this._indexOfInstance(t);
            }),
            (a.prototype._indexOfInstance = function (t) {
              for (var e = 0; e < this._methods.length; e++)
                if (this._methods[e].instance === t) return e;
              return -1;
            }),
            (a.prototype.list = function () {
              for (var t = [], e = 0; e < this._methods.length; e++)
                t.push(this._methods[e].instance);
              return t;
            }),
            (a.prototype._updateDynamics = function (t, e, i) {
              t = t[e];
              if (!t) throw new Error('Unknown control parameter ' + e);
              e = this._now();
              (t.dynamics.update(i, (e - t.time) / 1e3), (t.time = e), this.emit('change'));
            }),
            (a.prototype._resetComposedOffsets = function () {
              for (var t = 0; t < this._parameters.length; t++)
                this._composedOffsets[this._parameters[t]] = 0;
            }),
            (a.prototype.offsets = function () {
              var t,
                e = !1,
                i = this._now();
              this._resetComposedOffsets();
              for (var r = 0; r < this._methods.length; r++)
                for (var n = this._methods[r].dynamics, o = 0; o < this._parameters.length; o++) {
                  var s = n[(t = this._parameters[o])],
                    a = s.dynamics;
                  null != a.offset && ((this._composedOffsets[t] += a.offset), (a.offset = null));
                  var h = (i - s.time) / 1e3,
                    u = a.offsetFromVelocity(h);
                  u && (this._composedOffsets[t] += u);
                  h = a.velocityAfter(h);
                  ((a.velocity = h) && (e = !0), (s.time = i));
                }
              return ((this._composeReturn.changing = e), this._composeReturn);
            }),
            (a.prototype.destroy = function () {
              for (var t = this.list(), e = 0; e < t.length; e++) this.remove(t[e]);
              s(this);
            }),
            (e.exports = a));
        },
        {
          '../util/clearOwnProperties': 76,
          '../util/now': 93,
          './Dynamics': 39,
          'minimal-event-emitter': 14,
        },
      ],
      36: [
        function (t, e, i) {
          'use strict';
          var n = t('../util/defaults'),
            r = t('../util/clearOwnProperties'),
            o = { active: 'move', inactive: 'default', disabled: 'default' };
          function s(t, e, i, r) {
            ((r = n(r || {}, o)),
              (this._element = i),
              (this._controls = t),
              (this._id = e),
              (this._attached = !1),
              (this._setActiveCursor = this._setCursor.bind(this, r.active)),
              (this._setInactiveCursor = this._setCursor.bind(this, r.inactive)),
              (this._setDisabledCursor = this._setCursor.bind(this, r.disabled)),
              (this._setOriginalCursor = this._setCursor.bind(this, this._element.style.cursor)),
              (this._updateAttachmentHandler = this._updateAttachment.bind(this)),
              t.addEventListener('methodEnabled', this._updateAttachmentHandler),
              t.addEventListener('methodDisabled', this._updateAttachmentHandler),
              t.addEventListener('enabled', this._updateAttachmentHandler),
              t.addEventListener('disabled', this._updateAttachmentHandler),
              this._updateAttachment());
          }
          ((s.prototype.destroy = function () {
            (this._detachFromControlMethod(this._controls.method(this._id)),
              this._setOriginalCursor(),
              this._controls.removeEventListener('methodEnabled', this._updateAttachmentHandler),
              this._controls.removeEventListener('methodDisabled', this._updateAttachmentHandler),
              this._controls.removeEventListener('enabled', this._updateAttachmentHandler),
              this._controls.removeEventListener('disabled', this._updateAttachmentHandler),
              r(this));
          }),
            (s.prototype._updateAttachment = function () {
              var t = this._controls,
                e = this._id;
              t.enabled() && t.method(e).enabled
                ? this._attachToControlMethod(t.method(e))
                : this._detachFromControlMethod(t.method(e));
            }),
            (s.prototype._attachToControlMethod = function (t) {
              this._attached ||
                (t.instance.addEventListener('active', this._setActiveCursor),
                t.instance.addEventListener('inactive', this._setInactiveCursor),
                t.active ? this._setActiveCursor() : this._setInactiveCursor(),
                (this._attached = !0));
            }),
            (s.prototype._detachFromControlMethod = function (t) {
              this._attached &&
                (t.instance.removeEventListener('active', this._setActiveCursor),
                t.instance.removeEventListener('inactive', this._setInactiveCursor),
                this._setDisabledCursor(),
                (this._attached = !1));
            }),
            (s.prototype._setCursor = function (t) {
              this._element.style.cursor = t;
            }),
            (e.exports = s));
        },
        { '../util/clearOwnProperties': 76, '../util/defaults': 81 },
      ],
      37: [
        function (t, e, i) {
          'use strict';
          var r = t('minimal-event-emitter'),
            n = t('./Composer'),
            o = t('../util/clearOwnProperties'),
            s = 'undefined' != typeof MARZIPANODEBUG && MARZIPANODEBUG.controls;
          function a(t) {
            ((t = t || {}),
              (this._methods = {}),
              (this._methodGroups = {}),
              (this._composer = new n()),
              (this._enabled = !t || !t.enabled || !!t.enabled),
              (this._activeCount = 0),
              (this.updatedViews_ = []),
              (this._attachedRenderLoop = null));
          }
          (r(a),
            (a.prototype.destroy = function () {
              (this.detach(), this._composer.destroy(), o(this));
            }),
            (a.prototype.methods = function () {
              var t,
                e = {};
              for (t in this._methods) e[t] = this._methods[t];
              return e;
            }),
            (a.prototype.method = function (t) {
              return this._methods[t];
            }),
            (a.prototype.registerMethod = function (t, e, i) {
              if (this._methods[t])
                throw new Error('Control method already registered with id ' + t);
              ((this._methods[t] = {
                instance: e,
                enabled: !1,
                active: !1,
                activeHandler: this._handleActive.bind(this, t),
                inactiveHandler: this._handleInactive.bind(this, t),
              }),
                i && this.enableMethod(t, e));
            }),
            (a.prototype.unregisterMethod = function (t) {
              var e = this._methods[t];
              if (!e) throw new Error('No control method registered with id ' + t);
              (e.enabled && this.disableMethod(t), delete this._methods[t]);
            }),
            (a.prototype.enableMethod = function (t) {
              var e = this._methods[t];
              if (!e) throw new Error('No control method registered with id ' + t);
              e.enabled ||
                ((e.enabled = !0),
                e.active && this._incrementActiveCount(),
                this._listen(t),
                this._updateComposer(),
                this.emit('methodEnabled', t));
            }),
            (a.prototype.disableMethod = function (t) {
              var e = this._methods[t];
              if (!e) throw new Error('No control method registered with id ' + t);
              e.enabled &&
                ((e.enabled = !1),
                e.active && this._decrementActiveCount(),
                this._unlisten(t),
                this._updateComposer(),
                this.emit('methodDisabled', t));
            }),
            (a.prototype.addMethodGroup = function (t, e) {
              this._methodGroups[t] = e;
            }),
            (a.prototype.removeMethodGroup = function (t) {
              delete this._methodGroups[t];
            }),
            (a.prototype.methodGroups = function () {
              var t,
                e = {};
              for (t in this._methodGroups) e[t] = this._methodGroups[t];
              return e;
            }),
            (a.prototype.enableMethodGroup = function (t) {
              var e = this;
              e._methodGroups[t].forEach(function (t) {
                e.enableMethod(t);
              });
            }),
            (a.prototype.disableMethodGroup = function (t) {
              var e = this;
              e._methodGroups[t].forEach(function (t) {
                e.disableMethod(t);
              });
            }),
            (a.prototype.enabled = function () {
              return this._enabled;
            }),
            (a.prototype.enable = function () {
              this._enabled ||
                ((this._enabled = !0),
                0 < this._activeCount && this.emit('active'),
                this.emit('enabled'),
                this._updateComposer());
            }),
            (a.prototype.disable = function () {
              this._enabled &&
                ((this._enabled = !1),
                0 < this._activeCount && this.emit('inactive'),
                this.emit('disabled'),
                this._updateComposer());
            }),
            (a.prototype.attach = function (t) {
              (this._attachedRenderLoop && this.detach(),
                (this._attachedRenderLoop = t),
                (this._beforeRenderHandler = this._updateViewsWithControls.bind(this)),
                (this._changeHandler = t.renderOnNextFrame.bind(t)),
                this._attachedRenderLoop.addEventListener(
                  'beforeRender',
                  this._beforeRenderHandler
                ),
                this._composer.addEventListener('change', this._changeHandler));
            }),
            (a.prototype.detach = function () {
              this._attachedRenderLoop &&
                (this._attachedRenderLoop.removeEventListener(
                  'beforeRender',
                  this._beforeRenderHandler
                ),
                this._composer.removeEventListener('change', this._changeHandler),
                (this._beforeRenderHandler = null),
                (this._changeHandler = null),
                (this._attachedRenderLoop = null));
            }),
            (a.prototype.attached = function () {
              return null != this._attachedRenderLoop;
            }),
            (a.prototype._listen = function (t) {
              t = this._methods[t];
              if (!t) throw new Error('Bad method id');
              (t.instance.addEventListener('active', t.activeHandler),
                t.instance.addEventListener('inactive', t.inactiveHandler));
            }),
            (a.prototype._unlisten = function (t) {
              t = this._methods[t];
              if (!t) throw new Error('Bad method id');
              (t.instance.removeEventListener('active', t.activeHandler),
                t.instance.removeEventListener('inactive', t.inactiveHandler));
            }),
            (a.prototype._handleActive = function (t) {
              t = this._methods[t];
              if (!t) throw new Error('Bad method id');
              if (!t.enabled)
                throw new Error('Should not receive event from disabled control method');
              t.active || ((t.active = !0), this._incrementActiveCount());
            }),
            (a.prototype._handleInactive = function (t) {
              t = this._methods[t];
              if (!t) throw new Error('Bad method id');
              if (!t.enabled)
                throw new Error('Should not receive event from disabled control method');
              t.active && ((t.active = !1), this._decrementActiveCount());
            }),
            (a.prototype._incrementActiveCount = function () {
              (this._activeCount++,
                s && this._checkActiveCount(),
                this._enabled && 1 === this._activeCount && this.emit('active'));
            }),
            (a.prototype._decrementActiveCount = function () {
              (this._activeCount--,
                s && this._checkActiveCount(),
                this._enabled && 0 === this._activeCount && this.emit('inactive'));
            }),
            (a.prototype._checkActiveCount = function () {
              var t,
                e = 0;
              for (t in this._methods) {
                var i = this._methods[t];
                i.enabled && i.active && e++;
              }
              if (e != this._activeCount) throw new Error('Bad control state');
            }),
            (a.prototype._updateComposer = function () {
              var t,
                e = this._composer;
              for (t in this._methods) {
                var i = this._methods[t],
                  r = this._enabled && i.enabled;
                (r && !e.has(i.instance) && e.add(i.instance),
                  !r && e.has(i.instance) && e.remove(i.instance));
              }
            }),
            (a.prototype._updateViewsWithControls = function () {
              var t = this._composer.offsets();
              (t.changing && this._attachedRenderLoop.renderOnNextFrame(),
                (this.updatedViews_.length = 0));
              for (
                var e = this._attachedRenderLoop.stage().listLayers(), i = 0;
                i < e.length;
                i++
              ) {
                var r = e[i].view();
                this.updatedViews_.indexOf(r) < 0 &&
                  (e[i].view().updateWithControlParameters(t.offsets), this.updatedViews_.push(r));
              }
            }),
            (e.exports = a));
        },
        { '../util/clearOwnProperties': 76, './Composer': 35, 'minimal-event-emitter': 14 },
      ],
      38: [
        function (t, e, i) {
          'use strict';
          var r = t('minimal-event-emitter'),
            n = t('./Dynamics'),
            o = t('./HammerGestures'),
            s = t('../util/defaults'),
            a = t('./util').maxFriction,
            h = t('../util/clearOwnProperties'),
            u = { friction: 6, maxFrictionTime: 0.3, hammerEvent: 'pan' },
            l = 'undefined' != typeof MARZIPANODEBUG && MARZIPANODEBUG.controls;
          function c(t, e, i) {
            if (
              ((this._element = t),
              (this._opts = s(i || {}, u)),
              (this._startEvent = null),
              (this._lastEvent = null),
              (this._active = !1),
              (this._dynamics = { x: new n(), y: new n() }),
              (this._hammer = o.get(t, e)),
              this._hammer.on('hammer.input', this._handleHammerEvent.bind(this)),
              'pan' != this._opts.hammerEvent && 'pinch' != this._opts.hammerEvent)
            )
              throw new Error(
                this._opts.hammerEvent + ' is not a hammerEvent managed in DragControlMethod'
              );
            (this._hammer.on(this._opts.hammerEvent + 'start', this._handleStart.bind(this)),
              this._hammer.on(this._opts.hammerEvent + 'move', this._handleMove.bind(this)),
              this._hammer.on(this._opts.hammerEvent + 'end', this._handleEnd.bind(this)),
              this._hammer.on(this._opts.hammerEvent + 'cancel', this._handleEnd.bind(this)));
          }
          (r(c),
            (c.prototype.destroy = function () {
              (this._hammer.release(), h(this));
            }),
            (c.prototype._handleHammerEvent = function (t) {
              if (t.isFirst) {
                if (l && this._active)
                  throw new Error('DragControlMethod active detected when already active');
                ((this._active = !0), this.emit('active'));
              }
              if (t.isFinal) {
                if (l && !this._active)
                  throw new Error('DragControlMethod inactive detected when already inactive');
                ((this._active = !1), this.emit('inactive'));
              }
            }),
            (c.prototype._handleStart = function (t) {
              (t.preventDefault(), (this._startEvent = t));
            }),
            (c.prototype._handleMove = function (t) {
              (t.preventDefault(),
                this._startEvent &&
                  (this._updateDynamicsMove(t),
                  this.emit('parameterDynamics', 'axisScaledX', this._dynamics.x),
                  this.emit('parameterDynamics', 'axisScaledY', this._dynamics.y)));
            }),
            (c.prototype._handleEnd = function (t) {
              (t.preventDefault(),
                this._startEvent &&
                  (this._updateDynamicsRelease(t),
                  this.emit('parameterDynamics', 'axisScaledX', this._dynamics.x),
                  this.emit('parameterDynamics', 'axisScaledY', this._dynamics.y)),
                (this._startEvent = !1),
                (this._lastEvent = !1));
            }),
            (c.prototype._updateDynamicsMove = function (t) {
              var e = t.deltaX,
                i = t.deltaY,
                r = this._lastEvent || this._startEvent;
              r && ((e -= r.deltaX), (i -= r.deltaY));
              r = this._element.getBoundingClientRect();
              ((e /= r.right - r.left),
                (i /= r.bottom - r.top),
                this._dynamics.x.reset(),
                this._dynamics.y.reset(),
                (this._dynamics.x.offset = -e),
                (this._dynamics.y.offset = -i),
                (this._lastEvent = t));
            }));
          var p = [null, null];
          ((c.prototype._updateDynamicsRelease = function (t) {
            var e = this._element.getBoundingClientRect(),
              i = e.right - e.left,
              e = e.bottom - e.top,
              i = (1e3 * t.velocityX) / i,
              e = (1e3 * t.velocityY) / e;
            (this._dynamics.x.reset(),
              this._dynamics.y.reset(),
              (this._dynamics.x.velocity = i),
              (this._dynamics.y.velocity = e),
              a(
                this._opts.friction,
                this._dynamics.x.velocity,
                this._dynamics.y.velocity,
                this._opts.maxFrictionTime,
                p
              ),
              (this._dynamics.x.friction = p[0]),
              (this._dynamics.y.friction = p[1]));
          }),
            (e.exports = c));
        },
        {
          '../util/clearOwnProperties': 76,
          '../util/defaults': 81,
          './Dynamics': 39,
          './HammerGestures': 41,
          './util': 48,
          'minimal-event-emitter': 14,
        },
      ],
      39: [
        function (t, e, i) {
          'use strict';
          function r() {
            ((this.velocity = null), (this.friction = null), (this.offset = null));
          }
          ((r.equals = function (t, e) {
            return t.velocity === e.velocity && t.friction === e.friction && t.offset === e.offset;
          }),
            (r.prototype.equals = function (t) {
              return r.equals(this, t);
            }),
            (r.prototype.update = function (t, e) {
              t.offset && ((this.offset = this.offset || 0), (this.offset += t.offset));
              e = this.offsetFromVelocity(e);
              (e && ((this.offset = this.offset || 0), (this.offset += e)),
                (this.velocity = t.velocity),
                (this.friction = t.friction));
            }),
            (r.prototype.reset = function () {
              ((this.velocity = null), (this.friction = null), (this.offset = null));
            }),
            (r.prototype.velocityAfter = function (t) {
              return this.velocity
                ? this.friction
                  ? (function (t, e) {
                      if (t < 0) return Math.min(0, t + e);
                      if (0 < t) return Math.max(0, t - e);
                      return 0;
                    })(this.velocity, this.friction * t)
                  : this.velocity
                : null;
            }),
            (r.prototype.offsetFromVelocity = function (t) {
              t = Math.min(t, this.nullVelocityTime());
              var e = this.velocityAfter(t);
              return ((this.velocity + e) / 2) * t;
            }),
            (r.prototype.nullVelocityTime = function () {
              return null == this.velocity
                ? 0
                : this.velocity && !this.friction
                  ? 1 / 0
                  : Math.abs(this.velocity / this.friction);
            }),
            (e.exports = r));
        },
        {},
      ],
      40: [
        function (t, e, i) {
          'use strict';
          var r = t('minimal-event-emitter'),
            n = t('./Dynamics'),
            o = t('../util/clearOwnProperties');
          function s(t, e, i, r) {
            if (!t) throw new Error('ElementPressControlMethod: element must be defined');
            if (!e) throw new Error('ElementPressControlMethod: parameter must be defined');
            if (!i) throw new Error('ElementPressControlMethod: velocity must be defined');
            if (!r) throw new Error('ElementPressControlMethod: friction must be defined');
            ((this._element = t),
              (this._pressHandler = this._handlePress.bind(this)),
              (this._releaseHandler = this._handleRelease.bind(this)),
              t.addEventListener('mousedown', this._pressHandler),
              t.addEventListener('mouseup', this._releaseHandler),
              t.addEventListener('mouseleave', this._releaseHandler),
              t.addEventListener('touchstart', this._pressHandler),
              t.addEventListener('touchmove', this._releaseHandler),
              t.addEventListener('touchend', this._releaseHandler),
              (this._parameter = e),
              (this._velocity = i),
              (this._friction = r),
              (this._dynamics = new n()),
              (this._pressing = !1));
          }
          (r(s),
            (s.prototype.destroy = function () {
              (this._element.removeEventListener('mousedown', this._pressHandler),
                this._element.removeEventListener('mouseup', this._releaseHandler),
                this._element.removeEventListener('mouseleave', this._releaseHandler),
                this._element.removeEventListener('touchstart', this._pressHandler),
                this._element.removeEventListener('touchmove', this._releaseHandler),
                this._element.removeEventListener('touchend', this._releaseHandler),
                o(this));
            }),
            (s.prototype._handlePress = function () {
              ((this._pressing = !0),
                (this._dynamics.velocity = this._velocity),
                (this._dynamics.friction = 0),
                this.emit('parameterDynamics', this._parameter, this._dynamics),
                this.emit('active'));
            }),
            (s.prototype._handleRelease = function () {
              (this._pressing &&
                ((this._dynamics.friction = this._friction),
                this.emit('parameterDynamics', this._parameter, this._dynamics),
                this.emit('inactive')),
                (this._pressing = !1));
            }),
            (e.exports = s));
        },
        { '../util/clearOwnProperties': 76, './Dynamics': 39, 'minimal-event-emitter': 14 },
      ],
      41: [
        function (t, e, i) {
          'use strict';
          var r = t('hammerjs'),
            n = 1,
            o = 'MarzipanoHammerElementId';
          function s(t, e) {
            return (t[o] || (t[o] = n++), e + t[o]);
          }
          function a() {
            ((this._managers = {}), (this._refCount = {}));
          }
          function h(t, e, i, r) {
            ((this._manager = e),
              (this._element = i),
              (this._type = r),
              (this._hammerGestures = t),
              (this._eventHandlers = []));
          }
          ((a.prototype.get = function (t, e) {
            var i = s(t, e);
            return (
              this._managers[i] ||
                ((this._managers[i] = this._createManager(t, e)), (this._refCount[i] = 0)),
              this._refCount[i]++,
              new h(this, this._managers[i], t, e)
            );
          }),
            (a.prototype._createManager = function (t, e) {
              t = new r.Manager(t);
              return (
                'mouse' === e
                  ? t.add(new r.Pan({ direction: r.DIRECTION_ALL, threshold: 0 }))
                  : ('touch' !== e && 'pen' !== e && 'kinect' !== e) ||
                    (t.add(new r.Pan({ direction: r.DIRECTION_ALL, threshold: 20, pointers: 1 })),
                    t.add(new r.Pinch())),
                t
              );
            }),
            (a.prototype._releaseHandle = function (t, e) {
              e = s(t, e);
              this._refCount[e] &&
                (this._refCount[e]--,
                this._refCount[e] ||
                  (this._managers[e].destroy(),
                  delete this._managers[e],
                  delete this._refCount[e]));
            }),
            (h.prototype.on = function (t, e) {
              function i(t) {
                r === t.pointerType && e(t);
              }
              var r = this._type;
              (this._eventHandlers.push({ events: t, handler: i }), this._manager.on(t, i));
            }),
            (h.prototype.release = function () {
              for (var t = 0; t < this._eventHandlers.length; t++) {
                var e = this._eventHandlers[t];
                this._manager.off(e.events, e.handler);
              }
              (this._hammerGestures._releaseHandle(this._element, this._type),
                (this._manager = null),
                (this._element = null),
                (this._type = null),
                (this._hammerGestures = null));
            }),
            (h.prototype.manager = function () {
              return this._manager;
            }),
            (e.exports = new a()));
        },
        { hammerjs: 13 },
      ],
      42: [
        function (t, e, i) {
          'use strict';
          var r = t('minimal-event-emitter'),
            o = t('./Dynamics'),
            n = t('../util/clearOwnProperties');
          function s(t, e, i, r, n) {
            if (!t) throw new Error('KeyControlMethod: keyCode must be defined');
            if (!e) throw new Error('KeyControlMethod: parameter must be defined');
            if (!i) throw new Error('KeyControlMethod: velocity must be defined');
            if (!r) throw new Error('KeyControlMethod: friction must be defined');
            ((n = n || document),
              (this._keyCode = t),
              (this._parameter = e),
              (this._velocity = i),
              (this._friction = r),
              (this._element = n),
              (this._keydownHandler = this._handlePress.bind(this)),
              (this._keyupHandler = this._handleRelease.bind(this)),
              (this._blurHandler = this._handleBlur.bind(this)),
              this._element.addEventListener('keydown', this._keydownHandler),
              this._element.addEventListener('keyup', this._keyupHandler),
              window.addEventListener('blur', this._blurHandler),
              (this._dynamics = new o()),
              (this._pressing = !1));
          }
          (r(s),
            (s.prototype.destroy = function () {
              (this._element.removeEventListener('keydown', this._keydownHandler),
                this._element.removeEventListener('keyup', this._keyupHandler),
                window.removeEventListener('blur', this._blurHandler),
                n(this));
            }),
            (s.prototype._handlePress = function (t) {
              t.keyCode === this._keyCode &&
                ((this._pressing = !0),
                (this._dynamics.velocity = this._velocity),
                (this._dynamics.friction = 0),
                this.emit('parameterDynamics', this._parameter, this._dynamics),
                this.emit('active'));
            }),
            (s.prototype._handleRelease = function (t) {
              t.keyCode === this._keyCode &&
                (this._pressing &&
                  ((this._dynamics.friction = this._friction),
                  this.emit('parameterDynamics', this._parameter, this._dynamics),
                  this.emit('inactive')),
                (this._pressing = !1));
            }),
            (s.prototype._handleBlur = function () {
              ((this._dynamics.velocity = 0),
                this.emit('parameterDynamics', this._parameter, this._dynamics),
                this.emit('inactive'),
                (this._pressing = !1));
            }),
            (e.exports = s));
        },
        { '../util/clearOwnProperties': 76, './Dynamics': 39, 'minimal-event-emitter': 14 },
      ],
      43: [
        function (t, e, i) {
          'use strict';
          var r = t('minimal-event-emitter'),
            n = t('./Dynamics'),
            o = t('./HammerGestures'),
            s = t('../util/clearOwnProperties');
          function a(t, e, i) {
            ((this._hammer = o.get(t, e)),
              (this._lastEvent = null),
              (this._active = !1),
              (this._dynamics = new n()),
              this._hammer.on('pinchstart', this._handleStart.bind(this)),
              this._hammer.on('pinch', this._handleEvent.bind(this)),
              this._hammer.on('pinchend', this._handleEnd.bind(this)),
              this._hammer.on('pinchcancel', this._handleEnd.bind(this)));
          }
          (r(a),
            (a.prototype.destroy = function () {
              (this._hammer.release(), s(this));
            }),
            (a.prototype._handleStart = function () {
              this._active || ((this._active = !0), this.emit('active'));
            }),
            (a.prototype._handleEnd = function () {
              ((this._lastEvent = null),
                this._active && ((this._active = !1), this.emit('inactive')));
            }),
            (a.prototype._handleEvent = function (t) {
              var e = t.scale;
              (this._lastEvent && (e /= this._lastEvent.scale),
                (this._dynamics.offset = -1 * (e - 1)),
                this.emit('parameterDynamics', 'zoom', this._dynamics),
                (this._lastEvent = t));
            }),
            (e.exports = a));
        },
        {
          '../util/clearOwnProperties': 76,
          './Dynamics': 39,
          './HammerGestures': 41,
          'minimal-event-emitter': 14,
        },
      ],
      44: [
        function (t, e, i) {
          'use strict';
          var r = t('minimal-event-emitter'),
            n = t('./Dynamics'),
            o = t('./HammerGestures'),
            s = t('../util/defaults'),
            a = t('./util').maxFriction,
            h = t('../util/clearOwnProperties'),
            u = { speed: 8, friction: 6, maxFrictionTime: 0.3 };
          function l(t, e, i) {
            ((this._element = t),
              (this._opts = s(i || {}, u)),
              (this._active = !1),
              (this._hammer = o.get(t, e)),
              (this._dynamics = { x: new n(), y: new n() }),
              this._hammer.on('panstart', this._handleStart.bind(this)),
              this._hammer.on('panmove', this._handleMove.bind(this)),
              this._hammer.on('panend', this._handleRelease.bind(this)),
              this._hammer.on('pancancel', this._handleRelease.bind(this)));
          }
          (r(l),
            (l.prototype.destroy = function () {
              (this._hammer.release(), h(this));
            }),
            (l.prototype._handleStart = function (t) {
              (t.preventDefault(), this._active || ((this._active = !0), this.emit('active')));
            }),
            (l.prototype._handleMove = function (t) {
              (t.preventDefault(), this._updateDynamics(t, !1));
            }),
            (l.prototype._handleRelease = function (t) {
              (t.preventDefault(),
                this._updateDynamics(t, !0),
                this._active && ((this._active = !1), this.emit('inactive')));
            }));
          var c = [null, null];
          ((l.prototype._updateDynamics = function (t, e) {
            var i = this._element.getBoundingClientRect(),
              r = i.right - i.left,
              i = i.bottom - i.top,
              r = Math.max(r, i),
              i = (t.deltaX / r) * this._opts.speed,
              r = (t.deltaY / r) * this._opts.speed;
            (this._dynamics.x.reset(),
              this._dynamics.y.reset(),
              (this._dynamics.x.velocity = i),
              (this._dynamics.y.velocity = r),
              e &&
                (a(
                  this._opts.friction,
                  this._dynamics.x.velocity,
                  this._dynamics.y.velocity,
                  this._opts.maxFrictionTime,
                  c
                ),
                (this._dynamics.x.friction = c[0]),
                (this._dynamics.y.friction = c[1])),
              this.emit('parameterDynamics', 'x', this._dynamics.x),
              this.emit('parameterDynamics', 'y', this._dynamics.y));
          }),
            (e.exports = l));
        },
        {
          '../util/clearOwnProperties': 76,
          '../util/defaults': 81,
          './Dynamics': 39,
          './HammerGestures': 41,
          './util': 48,
          'minimal-event-emitter': 14,
        },
      ],
      45: [
        function (t, e, i) {
          'use strict';
          var r = t('minimal-event-emitter'),
            n = t('./Dynamics'),
            o = t('../util/defaults'),
            s = t('../util/clearOwnProperties'),
            a = { frictionTime: 0.2, zoomDelta: 0.001 };
          function h(t, e) {
            ((this._element = t),
              (this._opts = o(e || {}, a)),
              (this._dynamics = new n()),
              (this._eventList = []));
            e = this._opts.frictionTime ? this.withSmoothing : this.withoutSmoothing;
            ((this._wheelListener = e.bind(this)),
              t.addEventListener('wheel', this._wheelListener));
          }
          function u(t) {
            var e = 1 == t.deltaMode ? 20 : 1;
            return t.deltaY * e;
          }
          (r(h),
            (h.prototype.destroy = function () {
              (this._element.removeEventListener('wheel', this._wheelListener), s(this));
            }),
            (h.prototype.withoutSmoothing = function (t) {
              ((this._dynamics.offset = u(t) * this._opts.zoomDelta),
                this.emit('parameterDynamics', 'zoom', this._dynamics),
                t.preventDefault(),
                this.emit('active'),
                this.emit('inactive'));
            }),
            (h.prototype.withSmoothing = function (t) {
              var e = t.timeStamp;
              for (
                this._eventList.push(t);
                this._eventList[0].timeStamp < e - 1e3 * this._opts.frictionTime;

              )
                this._eventList.shift(0);
              for (var i = 0, r = 0; r < this._eventList.length; r++)
                i += (u(this._eventList[r]) * this._opts.zoomDelta) / this._opts.frictionTime;
              ((this._dynamics.velocity = i),
                (this._dynamics.friction = Math.abs(i) / this._opts.frictionTime),
                this.emit('parameterDynamics', 'zoom', this._dynamics),
                t.preventDefault(),
                this.emit('active'),
                this.emit('inactive'));
            }),
            (e.exports = h));
        },
        {
          '../util/clearOwnProperties': 76,
          '../util/defaults': 81,
          './Dynamics': 39,
          'minimal-event-emitter': 14,
        },
      ],
      46: [
        function (t, e, i) {
          'use strict';
          var r = t('minimal-event-emitter'),
            n = t('./Dynamics'),
            o = t('../util/clearOwnProperties');
          function s(t) {
            if (!t) throw new Error('VelocityControlMethod: parameter must be defined');
            ((this._parameter = t), (this._dynamics = new n()));
          }
          (r(s),
            (s.prototype.destroy = function () {
              o(this);
            }),
            (s.prototype.setVelocity = function (t) {
              ((this._dynamics.velocity = t),
                this.emit('parameterDynamics', this._parameter, this._dynamics));
            }),
            (s.prototype.setFriction = function (t) {
              ((this._dynamics.friction = t),
                this.emit('parameterDynamics', this._parameter, this._dynamics));
            }),
            (e.exports = s));
        },
        { '../util/clearOwnProperties': 76, './Dynamics': 39, 'minimal-event-emitter': 14 },
      ],
      47: [
        function (t, e, i) {
          'use strict';
          var l = t('../util/defaults'),
            c = t('./Drag'),
            p = t('./Qtvr'),
            f = t('./ScrollZoom'),
            d = t('./PinchZoom'),
            m = t('./Key'),
            v = { mouseViewMode: 'drag', dragMode: 'pan' };
          e.exports = function (t, e, i) {
            i = l(i || {}, v);
            var r = {
                mouseViewDrag: new c(e, 'mouse'),
                mouseViewQtvr: new p(e, 'mouse'),
                leftArrowKey: new m(37, 'x', -0.7, 3),
                rightArrowKey: new m(39, 'x', 0.7, 3),
                upArrowKey: new m(38, 'y', -0.7, 3),
                downArrowKey: new m(40, 'y', 0.7, 3),
                plusKey: new m(107, 'zoom', -0.7, 3),
                minusKey: new m(109, 'zoom', 0.7, 3),
                wKey: new m(87, 'y', -0.7, 3),
                aKey: new m(65, 'x', -0.7, 3),
                sKey: new m(83, 'y', 0.7, 3),
                dKey: new m(68, 'x', 0.7, 3),
                qKey: new m(81, 'roll', 0.7, 3),
                eKey: new m(69, 'roll', -0.7, 3),
              },
              n = ['scrollZoom', 'touchView', 'pinch'];
            !1 !== i.scrollZoom && (r.scrollZoom = new f(e));
            var o,
              s,
              a = {
                arrowKeys: ['leftArrowKey', 'rightArrowKey', 'upArrowKey', 'downArrowKey'],
                plusMinusKeys: ['plusKey', 'minusKey'],
                wasdKeys: ['wKey', 'aKey', 'sKey', 'dKey'],
                qeKeys: ['qKey', 'eKey'],
              };
            switch (i.dragMode) {
              case 'pinch':
                r.pinch = new c(e, 'touch', { hammerEvent: 'pinch' });
                break;
              case 'pan':
                ((r.touchView = new c(e, 'touch')), (r.pinch = new d(e, 'touch')));
                break;
              default:
                throw new Error('Unknown drag mode: ' + i.dragMode);
            }
            switch (i.mouseViewMode) {
              case 'drag':
                n.push('mouseViewDrag');
                break;
              case 'qtvr':
                n.push('mouseViewQtvr');
                break;
              default:
                throw new Error('Unknown mouse view mode: ' + i.mouseViewMode);
            }
            for (o in r) {
              var h = r[o];
              (t.registerMethod(o, h), 0 <= n.indexOf(o) && t.enableMethod(o));
            }
            for (s in a) {
              var u = a[s];
              t.addMethodGroup(s, u);
            }
            return r;
          };
        },
        {
          '../util/defaults': 81,
          './Drag': 38,
          './Key': 42,
          './PinchZoom': 43,
          './Qtvr': 44,
          './ScrollZoom': 45,
        },
      ],
      48: [
        function (t, e, i) {
          'use strict';
          function s(t, e, i, r) {
            t = Math.atan(e / t);
            ((r[0] = i * Math.cos(t)), (r[1] = i * Math.sin(t)));
          }
          e.exports = {
            maxFriction: function (t, e, i, r, n) {
              var o = Math.sqrt(Math.pow(e, 2) + Math.pow(i, 2));
              (s(e, i, (t = Math.max(t, o / r)), n),
                (n[0] = Math.abs(n[0])),
                (n[1] = Math.abs(n[1])));
            },
            changeVectorNorm: s,
          };
        },
        {},
      ],
      49: [
        function (t, e, i) {
          'use strict';
          var r = t('../util/inherits'),
            n = t('../util/hash'),
            o = t('../TileSearcher'),
            s = t('../collections/LruMap'),
            a = t('./Level'),
            h = t('./common').makeLevelList,
            u = t('./common').makeSelectableLevelList,
            y = t('../util/clamp'),
            l = t('../util/cmp'),
            c = t('../util/type'),
            g = t('gl-matrix').vec3,
            p = t('gl-matrix').vec4,
            f = 'fudlrb',
            w = {
              f: { x: 0, y: 0 },
              b: { x: 0, y: Math.PI },
              l: { x: 0, y: Math.PI / 2 },
              r: { x: 0, y: -Math.PI / 2 },
              u: { x: Math.PI / 2, y: 0 },
              d: { x: -Math.PI / 2, y: 0 },
            },
            d = g.create();
          function b(t, e, i, r) {
            (e && g.rotateZ(t, t, d, e), i && g.rotateX(t, t, d, i), r && g.rotateY(t, t, d, r));
          }
          for (var m = {}, v = 0; v < f.length; v++) {
            var _ = f[v],
              M = w[_],
              x = g.fromValues(0, 0, -1);
            (b(x, 0, M.x, M.y), (m[_] = x));
          }
          var E = {
              f: ['l', 'r', 'u', 'd'],
              b: ['r', 'l', 'u', 'd'],
              l: ['b', 'f', 'u', 'd'],
              r: ['f', 'b', 'u', 'd'],
              u: ['l', 'r', 'b', 'f'],
              d: ['l', 'r', 'f', 'b'],
            },
            T = [
              [0, 1],
              [1, 0],
              [0, -1],
              [-1, 0],
            ];
          function P(t, e, i, r, n) {
            ((this.face = t),
              (this.x = e),
              (this.y = i),
              (this.z = r),
              (this._geometry = n),
              (this._level = n.levelList[r]));
          }
          function L(t) {
            if (
              (this.constructor.super_.call(this, t),
              (this._size = t.size),
              (this._tileSize = t.tileSize),
              this._size % this._tileSize != 0)
            )
              throw new Error(
                'Level size is not multiple of tile size: ' + this._size + ' ' + this._tileSize
              );
          }
          function S(t) {
            if ('array' !== c(t)) throw new Error('Level list must be an array');
            ((this.levelList = h(t, L)), (this.selectableLevelList = u(this.levelList)));
            for (var e = 1; e < this.levelList.length; e++)
              this.levelList[e]._validateWithParentLevel(this.levelList[e - 1]);
            ((this._tileSearcher = new o(this)),
              (this._neighborsCache = new s(64)),
              (this._vec = p.create()),
              (this._viewSize = {}));
          }
          ((P.prototype.rotX = function () {
            return w[this.face].x;
          }),
            (P.prototype.rotY = function () {
              return w[this.face].y;
            }),
            (P.prototype.centerX = function () {
              return (this.x + 0.5) / this._level.numHorizontalTiles() - 0.5;
            }),
            (P.prototype.centerY = function () {
              return 0.5 - (this.y + 0.5) / this._level.numVerticalTiles();
            }),
            (P.prototype.scaleX = function () {
              return 1 / this._level.numHorizontalTiles();
            }),
            (P.prototype.scaleY = function () {
              return 1 / this._level.numVerticalTiles();
            }),
            (P.prototype.vertices = function (t) {
              t = t || [g.create(), g.create(), g.create(), g.create()];
              var r = w[this.face];
              function e(t, e, i) {
                (g.set(t, e, i, -0.5), b(t, 0, r.x, r.y));
              }
              var i = this.centerX() - this.scaleX() / 2,
                n = this.centerX() + this.scaleX() / 2,
                o = this.centerY() - this.scaleY() / 2,
                s = this.centerY() + this.scaleY() / 2;
              return (e(t[0], i, s), e(t[1], n, s), e(t[2], n, o), e(t[3], i, o), t);
            }),
            (P.prototype.parent = function () {
              if (0 === this.z) return null;
              var t = this.face,
                e = this.z,
                i = this.x,
                r = this.y,
                n = this._geometry,
                o = n.levelList[e],
                s = n.levelList[e - 1];
              return new P(
                t,
                Math.floor((i / o.numHorizontalTiles()) * s.numHorizontalTiles()),
                Math.floor((r / o.numVerticalTiles()) * s.numVerticalTiles()),
                e - 1,
                n
              );
            }),
            (P.prototype.children = function (t) {
              if (this.z === this._geometry.levelList.length - 1) return null;
              var e = this.face,
                i = this.z,
                r = this.x,
                n = this.y,
                o = this._geometry,
                s = o.levelList[i],
                a = o.levelList[i + 1],
                h = a.numHorizontalTiles() / s.numHorizontalTiles(),
                u = a.numVerticalTiles() / s.numVerticalTiles();
              t = t || [];
              for (var l = 0; l < h; l++)
                for (var c = 0; c < u; c++) {
                  var p = h * r + l,
                    f = u * n + c,
                    d = i + 1;
                  t.push(new P(e, p, f, d, o));
                }
              return t;
            }),
            (P.prototype.neighbors = function () {
              var t = this._geometry,
                e = t._neighborsCache,
                i = e.get(this);
              if (i) return i;
              for (
                var r = t._vec,
                  n = this.face,
                  o = this.x,
                  s = this.y,
                  a = this.z,
                  i = this._level,
                  h = i.numHorizontalTiles(),
                  u = i.numVerticalTiles(),
                  l = [],
                  c = 0;
                c < T.length;
                c++
              ) {
                var p,
                  f,
                  d = o + T[c][0],
                  m = s + T[c][1],
                  v = a,
                  _ = n;
                ((d < 0 || h <= d || m < 0 || u <= m) &&
                  ((f = this.centerX()),
                  (p = this.centerY()),
                  d < 0
                    ? (g.set(r, -0.5, p, -0.5), (_ = E[n][0]))
                    : h <= d
                      ? (g.set(r, 0.5, p, -0.5), (_ = E[n][1]))
                      : m < 0
                        ? (g.set(r, f, 0.5, -0.5), (_ = E[n][2]))
                        : u <= m && (g.set(r, f, -0.5, -0.5), (_ = E[n][3])),
                  b(r, 0, (f = w[n]).x, f.y),
                  b(r, 0, -(f = w[_]).x, -f.y),
                  (d = y(Math.floor((0.5 + r[0]) * h), 0, h - 1)),
                  (m = y(Math.floor((0.5 - r[1]) * u), 0, u - 1))),
                  l.push(new P(_, d, m, v, t)));
              }
              return (e.set(this, l), l);
            }),
            (P.prototype.hash = function () {
              return n(f.indexOf(this.face), this.z, this.y, this.x);
            }),
            (P.prototype.equals = function (t) {
              return (
                this._geometry === t._geometry &&
                this.face === t.face &&
                this.z === t.z &&
                this.y === t.y &&
                this.x === t.x
              );
            }),
            (P.prototype.cmp = function (t) {
              return (
                l(this.z, t.z) ||
                l(f.indexOf(this.face), f.indexOf(t.face)) ||
                l(this.y, t.y) ||
                l(this.x, t.x)
              );
            }),
            (P.prototype.str = function () {
              return 'CubeTile(' + tile.face + ', ' + tile.x + ', ' + tile.y + ', ' + tile.z + ')';
            }),
            r(L, a),
            (L.prototype.width = function () {
              return this._size;
            }),
            (L.prototype.height = function () {
              return this._size;
            }),
            (L.prototype.tileWidth = function () {
              return this._tileSize;
            }),
            (L.prototype.tileHeight = function () {
              return this._tileSize;
            }),
            (L.prototype._validateWithParentLevel = function (t) {
              var e = this.width(),
                i = this.height(),
                r = this.tileWidth(),
                n = this.tileHeight(),
                o = this.numHorizontalTiles(),
                s = this.numVerticalTiles(),
                a = t.width(),
                h = t.height(),
                u = t.tileWidth(),
                l = t.tileHeight(),
                c = t.numHorizontalTiles(),
                t = t.numVerticalTiles();
              if (e % a != 0)
                throw new Error('Level width must be multiple of parent level: ' + e + ' vs. ' + a);
              if (i % h != 0)
                throw new Error(
                  'Level height must be multiple of parent level: ' + i + ' vs. ' + h
                );
              if (o % c != 0)
                throw new Error(
                  'Number of horizontal tiles must be multiple of parent level: ' +
                    o +
                    ' (' +
                    e +
                    '/' +
                    r +
                    ') vs. ' +
                    c +
                    ' (' +
                    a +
                    '/' +
                    u +
                    ')'
                );
              if (s % t != 0)
                throw new Error(
                  'Number of vertical tiles must be multiple of parent level: ' +
                    s +
                    ' (' +
                    i +
                    '/' +
                    n +
                    ') vs. ' +
                    t +
                    ' (' +
                    h +
                    '/' +
                    l +
                    ')'
                );
            }),
            (S.prototype.maxTileSize = function () {
              for (var t = 0, e = 0; e < this.levelList.length; e++)
                var i = this.levelList[e], t = Math.max(t, i.tileWidth, i.tileHeight);
              return t;
            }),
            (S.prototype.levelTiles = function (t, e) {
              var i = this.levelList.indexOf(t),
                r = t.numHorizontalTiles() - 1,
                n = t.numVerticalTiles() - 1;
              e = e || [];
              for (var o = 0; o < f.length; o++)
                for (var s = f[o], a = 0; a <= r; a++)
                  for (var h = 0; h <= n; h++) e.push(new P(s, a, h, i, this));
              return e;
            }),
            (S.prototype._closestTile = function (t, e) {
              var i = this._vec;
              (p.set(i, 0, 0, 1, 1), p.transformMat4(i, i, t.inverseProjection()));
              var r,
                n = 1 / 0,
                o = null;
              for (r in m) {
                var s = m[r],
                  s = 1 - g.dot(s, i);
                s < n && ((n = s), (o = r));
              }
              for (
                var a = Math.max(Math.abs(i[0]), Math.abs(i[1]), Math.abs(i[2])) / 0.5, h = 0;
                h < 3;
                h++
              )
                i[h] = i[h] / a;
              var u = w[o];
              b(i, 0, -u.x, -u.y);
              ((t = this.levelList.indexOf(e)),
                (u = e.numHorizontalTiles()),
                (e = e.numVerticalTiles()));
              return new P(
                o,
                y(Math.floor((0.5 + i[0]) * u), 0, u - 1),
                y(Math.floor((0.5 - i[1]) * e), 0, e - 1),
                t,
                this
              );
            }),
            (S.prototype.visibleTiles = function (t, e, i) {
              var r = this._viewSize,
                n = this._tileSearcher;
              if (((i = i || []), t.size(r), 0 === r.width || 0 === r.height)) return i;
              e = this._closestTile(t, e);
              if (!n.search(t, e, i)) throw new Error('Starting tile is not visible');
              return i;
            }),
            (S.Tile = S.prototype.Tile = P),
            (S.type = S.prototype.type = 'cube'),
            (P.type = P.prototype.type = 'cube'),
            (e.exports = S));
        },
        {
          '../TileSearcher': 22,
          '../collections/LruMap': 28,
          '../util/clamp': 75,
          '../util/cmp': 77,
          '../util/hash': 88,
          '../util/inherits': 89,
          '../util/type': 101,
          './Level': 52,
          './common': 53,
          'gl-matrix': 3,
        },
      ],
      50: [
        function (t, e, i) {
          'use strict';
          var r = t('../util/inherits'),
            n = t('../util/hash'),
            o = t('../util/cmp'),
            s = t('./common'),
            a = t('./Level'),
            h = t('../util/type');
          function u(t, e) {
            ((this.z = t), (this._geometry = e), (this._level = e.levelList[t]));
          }
          function l(t) {
            (this.constructor.super_.call(this, t), (this._width = t.width));
          }
          function c(t) {
            if ('array' !== h(t)) throw new Error('Level list must be an array');
            ((this.levelList = s.makeLevelList(t, l)),
              (this.selectableLevelList = s.makeSelectableLevelList(this.levelList)));
          }
          ((u.prototype.rotX = function () {
            return 0;
          }),
            (u.prototype.rotY = function () {
              return 0;
            }),
            (u.prototype.centerX = function () {
              return 0.5;
            }),
            (u.prototype.centerY = function () {
              return 0.5;
            }),
            (u.prototype.scaleX = function () {
              return 1;
            }),
            (u.prototype.scaleY = function () {
              return 1;
            }),
            (u.prototype.parent = function () {
              return 0 === this.z ? null : new u(this.z - 1, this._geometry);
            }),
            (u.prototype.children = function (t) {
              return this.z === this._geometry.levelList.length - 1
                ? null
                : ((t = t || []).push(new u(this.z + 1, this._geometry)), t);
            }),
            (u.prototype.neighbors = function () {
              return [];
            }),
            (u.prototype.hash = function () {
              return n(this.z);
            }),
            (u.prototype.equals = function (t) {
              return this._geometry === t._geometry && this.z === t.z;
            }),
            (u.prototype.cmp = function (t) {
              return o(this.z, t.z);
            }),
            (u.prototype.str = function () {
              return 'EquirectTile(' + tile.z + ')';
            }),
            r(l, a),
            (l.prototype.width = function () {
              return this._width;
            }),
            (l.prototype.height = function () {
              return this._width / 2;
            }),
            (l.prototype.tileWidth = function () {
              return this._width;
            }),
            (l.prototype.tileHeight = function () {
              return this._width / 2;
            }),
            (c.prototype.maxTileSize = function () {
              for (var t = 0, e = 0; e < this.levelList.length; e++)
                var i = this.levelList[e], t = Math.max(t, i.tileWidth, i.tileHeight);
              return t;
            }),
            (c.prototype.levelTiles = function (t, e) {
              t = this.levelList.indexOf(t);
              return ((e = e || []).push(new u(t, this)), e);
            }),
            (c.prototype.visibleTiles = function (t, e, i) {
              e = new u(this.levelList.indexOf(e), this);
              (((i = i || []).length = 0), i.push(e));
            }),
            (c.Tile = c.prototype.Tile = u),
            (c.type = c.prototype.type = 'equirect'),
            (u.type = u.prototype.type = 'equirect'),
            (e.exports = c));
        },
        {
          '../util/cmp': 77,
          '../util/hash': 88,
          '../util/inherits': 89,
          '../util/type': 101,
          './Level': 52,
          './common': 53,
        },
      ],
      51: [
        function (t, e, i) {
          'use strict';
          var r = t('../util/inherits'),
            n = t('../util/hash'),
            o = t('../TileSearcher'),
            s = t('../collections/LruMap'),
            a = t('./Level'),
            h = t('./common').makeLevelList,
            u = t('./common').makeSelectableLevelList,
            l = t('../util/clamp'),
            c = t('../util/mod'),
            p = t('../util/cmp'),
            f = t('../util/type'),
            d = t('gl-matrix').vec2,
            m = t('gl-matrix').vec4,
            v = [
              [0, 1],
              [1, 0],
              [0, -1],
              [-1, 0],
            ];
          function _(t, e, i, r) {
            ((this.x = t),
              (this.y = e),
              (this.z = i),
              (this._geometry = r),
              (this._level = r.levelList[i]));
          }
          function y(t) {
            (this.constructor.super_.call(this, t),
              (this._width = t.width),
              (this._height = t.height),
              (this._tileWidth = t.tileWidth),
              (this._tileHeight = t.tileHeight));
          }
          function g(t) {
            if ('array' !== f(t)) throw new Error('Level list must be an array');
            ((this.levelList = h(t, y)), (this.selectableLevelList = u(this.levelList)));
            for (var e = 1; e < this.levelList.length; e++)
              this.levelList[e]._validateWithParentLevel(this.levelList[e - 1]);
            ((this._tileSearcher = new o(this)),
              (this._neighborsCache = new s(64)),
              (this._vec = m.create()),
              (this._viewSize = {}));
          }
          ((_.prototype.rotX = function () {
            return 0;
          }),
            (_.prototype.rotY = function () {
              return 0;
            }),
            (_.prototype.centerX = function () {
              var t = this._level.width(),
                e = this._level.tileWidth();
              return (this.x * e + 0.5 * this.width()) / t - 0.5;
            }),
            (_.prototype.centerY = function () {
              var t = this._level.height(),
                e = this._level.tileHeight();
              return 0.5 - (this.y * e + 0.5 * this.height()) / t;
            }),
            (_.prototype.scaleX = function () {
              var t = this._level.width();
              return this.width() / t;
            }),
            (_.prototype.scaleY = function () {
              var t = this._level.height();
              return this.height() / t;
            }),
            (_.prototype.width = function () {
              var t = this._level.width(),
                e = this._level.tileWidth();
              return (this.x === this._level.numHorizontalTiles() - 1 && c(t, e)) || e;
            }),
            (_.prototype.height = function () {
              var t = this._level.height(),
                e = this._level.tileHeight();
              return (this.y === this._level.numVerticalTiles() - 1 && c(t, e)) || e;
            }),
            (_.prototype.levelWidth = function () {
              return this._level.width();
            }),
            (_.prototype.levelHeight = function () {
              return this._level.height();
            }),
            (_.prototype.vertices = function (t) {
              t = t || [d.create(), d.create(), d.create(), d.create()];
              var e = this.centerX() - this.scaleX() / 2,
                i = this.centerX() + this.scaleX() / 2,
                r = this.centerY() - this.scaleY() / 2,
                n = this.centerY() + this.scaleY() / 2;
              return (
                d.set(t[0], e, n),
                d.set(t[1], i, n),
                d.set(t[2], i, r),
                d.set(t[3], e, r),
                t
              );
            }),
            (_.prototype.parent = function () {
              if (0 === this.z) return null;
              var t = this._geometry,
                e = this.z - 1;
              return new _(Math.floor(this.x / 2), Math.floor(this.y / 2), e, t);
            }),
            (_.prototype.children = function (t) {
              if (this.z === this._geometry.levelList.length - 1) return null;
              var e = this._geometry,
                i = this.z + 1;
              return (
                (t = t || []).push(new _(2 * this.x, 2 * this.y, i, e)),
                t.push(new _(2 * this.x, 2 * this.y + 1, i, e)),
                t.push(new _(2 * this.x + 1, 2 * this.y, i, e)),
                t.push(new _(2 * this.x + 1, 2 * this.y + 1, i, e)),
                t
              );
            }),
            (_.prototype.neighbors = function () {
              var t = this._geometry,
                e = t._neighborsCache,
                i = e.get(this);
              if (i) return i;
              for (
                var r = this.x,
                  n = this.y,
                  o = this.z,
                  i = this._level,
                  s = i.numHorizontalTiles() - 1,
                  a = i.numVerticalTiles() - 1,
                  h = [],
                  u = 0;
                u < v.length;
                u++
              ) {
                var l = r + v[u][0],
                  c = n + v[u][1];
                0 <= l && l <= s && 0 <= c && c <= a && h.push(new _(l, c, o, t));
              }
              return (e.set(this, h), h);
            }),
            (_.prototype.hash = function () {
              return n(this.z, this.y, this.x);
            }),
            (_.prototype.equals = function (t) {
              return (
                this._geometry === t._geometry && this.z === t.z && this.y === t.y && this.x === t.x
              );
            }),
            (_.prototype.cmp = function (t) {
              return p(this.z, t.z) || p(this.y, t.y) || p(this.x, t.x);
            }),
            (_.prototype.str = function () {
              return 'FlatTile(' + tile.x + ', ' + tile.y + ', ' + tile.z + ')';
            }),
            r(y, a),
            (y.prototype.width = function () {
              return this._width;
            }),
            (y.prototype.height = function () {
              return this._height;
            }),
            (y.prototype.tileWidth = function () {
              return this._tileWidth;
            }),
            (y.prototype.tileHeight = function () {
              return this._tileHeight;
            }),
            (y.prototype._validateWithParentLevel = function (t) {
              var e = this.width(),
                i = this.height(),
                r = this.tileWidth(),
                n = this.tileHeight(),
                o = t.width(),
                s = t.height(),
                a = t.tileWidth(),
                t = t.tileHeight();
              return e % o != 0
                ? new Error('Level width must be multiple of parent level: ' + e + ' vs. ' + o)
                : i % s != 0
                  ? new Error('Level height must be multiple of parent level: ' + i + ' vs. ' + s)
                  : r % a != 0
                    ? new Error(
                        'Level tile width must be multiple of parent level: ' + r + ' vs. ' + a
                      )
                    : n % t != 0
                      ? new Error(
                          'Level tile height must be multiple of parent level: ' + n + ' vs. ' + t
                        )
                      : void 0;
            }),
            (g.prototype.maxTileSize = function () {
              for (var t = 0, e = 0; e < this.levelList.length; e++)
                var i = this.levelList[e], t = Math.max(t, i.tileWidth, i.tileHeight);
              return t;
            }),
            (g.prototype.levelTiles = function (t, e) {
              var i = this.levelList.indexOf(t),
                r = t.numHorizontalTiles() - 1,
                n = t.numVerticalTiles() - 1;
              e = e || [];
              for (var o = 0; o <= r; o++)
                for (var s = 0; s <= n; s++) e.push(new _(o, s, i, this));
              return e;
            }),
            (g.prototype._closestTile = function (t, e) {
              var i = this._vec;
              (m.set(i, 0, 0, 1, 1), m.transformMat4(i, i, t.inverseProjection()));
              var r = 0.5 + i[0],
                n = 0.5 - i[1],
                o = this.levelList.indexOf(e),
                s = e.width(),
                a = e.height(),
                h = e.tileWidth(),
                t = e.tileHeight(),
                i = e.numHorizontalTiles(),
                e = e.numVerticalTiles();
              return new _(
                l(Math.floor((r * s) / h), 0, i - 1),
                l(Math.floor((n * a) / t), 0, e - 1),
                o,
                this
              );
            }),
            (g.prototype.visibleTiles = function (t, e, i) {
              var r = this._viewSize,
                n = this._tileSearcher;
              if (((i = i || []), t.size(r), 0 === r.width || 0 === r.height)) return i;
              e = this._closestTile(t, e);
              if (!n.search(t, e, i)) throw new Error('Starting tile is not visible');
              return i;
            }),
            (g.Tile = g.prototype.Tile = _),
            (g.type = g.prototype.type = 'flat'),
            (_.type = _.prototype.type = 'flat'),
            (e.exports = g));
        },
        {
          '../TileSearcher': 22,
          '../collections/LruMap': 28,
          '../util/clamp': 75,
          '../util/cmp': 77,
          '../util/hash': 88,
          '../util/inherits': 89,
          '../util/mod': 91,
          '../util/type': 101,
          './Level': 52,
          './common': 53,
          'gl-matrix': 3,
        },
      ],
      52: [
        function (t, e, i) {
          'use strict';
          function r(t) {
            this._fallbackOnly = !!t.fallbackOnly;
          }
          ((r.prototype.numHorizontalTiles = function () {
            return Math.ceil(this.width() / this.tileWidth());
          }),
            (r.prototype.numVerticalTiles = function () {
              return Math.ceil(this.height() / this.tileHeight());
            }),
            (r.prototype.fallbackOnly = function () {
              return this._fallbackOnly;
            }),
            (e.exports = r));
        },
        {},
      ],
      53: [
        function (t, e, i) {
          'use strict';
          var n = t('../util/cmp');
          e.exports = {
            makeLevelList: function (t, e) {
              for (var i = [], r = 0; r < t.length; r++) i.push(new e(t[r]));
              return (
                i.sort(function (t, e) {
                  return n(t.width(), e.width());
                }),
                i
              );
            },
            makeSelectableLevelList: function (t) {
              for (var e = [], i = 0; i < t.length; i++) t[i]._fallbackOnly || e.push(t[i]);
              if (!e.length) throw new Error('No selectable levels in list');
              return e;
            },
          };
        },
        { '../util/cmp': 77 },
      ],
      54: [
        function (t, e, i) {
          'use strict';
          e.exports = {
            WebGlStage: t('./stages/WebGl'),
            WebGlCubeRenderer: t('./renderers/WebGlCube'),
            WebGlFlatRenderer: t('./renderers/WebGlFlat'),
            WebGlEquirectRenderer: t('./renderers/WebGlEquirect'),
            registerDefaultRenderers: t('./renderers/registerDefaultRenderers'),
            CubeGeometry: t('./geometries/Cube'),
            FlatGeometry: t('./geometries/Flat'),
            EquirectGeometry: t('./geometries/Equirect'),
            RectilinearView: t('./views/Rectilinear'),
            FlatView: t('./views/Flat'),
            ImageUrlSource: t('./sources/ImageUrl'),
            SingleAssetSource: t('./sources/SingleAsset'),
            StaticAsset: t('./assets/Static'),
            DynamicAsset: t('./assets/Dynamic'),
            TextureStore: t('./TextureStore'),
            Layer: t('./Layer'),
            RenderLoop: t('./RenderLoop'),
            KeyControlMethod: t('./controls/Key'),
            DragControlMethod: t('./controls/Drag'),
            QtvrControlMethod: t('./controls/Qtvr'),
            ScrollZoomControlMethod: t('./controls/ScrollZoom'),
            PinchZoomControlMethod: t('./controls/PinchZoom'),
            VelocityControlMethod: t('./controls/Velocity'),
            ElementPressControlMethod: t('./controls/ElementPress'),
            Controls: t('./controls/Controls'),
            Dynamics: t('./controls/Dynamics'),
            Viewer: t('./Viewer'),
            Scene: t('./Scene'),
            Hotspot: t('./Hotspot'),
            HotspotContainer: t('./HotspotContainer'),
            colorEffects: t('./colorEffects'),
            registerDefaultControls: t('./controls/registerDefaultControls'),
            autorotate: t('./autorotate'),
            util: {
              async: t('./util/async'),
              cancelize: t('./util/cancelize'),
              chain: t('./util/chain'),
              clamp: t('./util/clamp'),
              clearOwnProperties: t('./util/clearOwnProperties'),
              cmp: t('./util/cmp'),
              compose: t('./util/compose'),
              convertFov: t('./util/convertFov'),
              decimal: t('./util/decimal'),
              defaults: t('./util/defaults'),
              defer: t('./util/defer'),
              degToRad: t('./util/degToRad'),
              delay: t('./util/delay'),
              dom: t('./util/dom'),
              extend: t('./util/extend'),
              hash: t('./util/hash'),
              inherits: t('./util/inherits'),
              mod: t('./util/mod'),
              noop: t('./util/noop'),
              now: t('./util/now'),
              once: t('./util/once'),
              pixelRatio: t('./util/pixelRatio'),
              radToDeg: t('./util/radToDeg'),
              real: t('./util/real'),
              retry: t('./util/retry'),
              tween: t('./util/tween'),
              type: t('./util/type'),
            },
            dependencies: {
              bowser: t('bowser'),
              glMatrix: t('gl-matrix'),
              eventEmitter: t('minimal-event-emitter'),
              hammerjs: t('hammerjs'),
            },
          };
        },
        {
          './Hotspot': 15,
          './HotspotContainer': 16,
          './Layer': 17,
          './RenderLoop': 19,
          './Scene': 20,
          './TextureStore': 21,
          './Viewer': 24,
          './assets/Dynamic': 25,
          './assets/Static': 26,
          './autorotate': 27,
          './colorEffects': 34,
          './controls/Controls': 37,
          './controls/Drag': 38,
          './controls/Dynamics': 39,
          './controls/ElementPress': 40,
          './controls/Key': 42,
          './controls/PinchZoom': 43,
          './controls/Qtvr': 44,
          './controls/ScrollZoom': 45,
          './controls/Velocity': 46,
          './controls/registerDefaultControls': 47,
          './geometries/Cube': 49,
          './geometries/Equirect': 50,
          './geometries/Flat': 51,
          './renderers/WebGlCube': 58,
          './renderers/WebGlEquirect': 59,
          './renderers/WebGlFlat': 60,
          './renderers/registerDefaultRenderers': 61,
          './sources/ImageUrl': 66,
          './sources/SingleAsset': 67,
          './stages/WebGl': 70,
          './util/async': 71,
          './util/cancelize': 73,
          './util/chain': 74,
          './util/clamp': 75,
          './util/clearOwnProperties': 76,
          './util/cmp': 77,
          './util/compose': 78,
          './util/convertFov': 79,
          './util/decimal': 80,
          './util/defaults': 81,
          './util/defer': 82,
          './util/degToRad': 83,
          './util/delay': 84,
          './util/dom': 85,
          './util/extend': 86,
          './util/hash': 88,
          './util/inherits': 89,
          './util/mod': 91,
          './util/noop': 92,
          './util/now': 93,
          './util/once': 94,
          './util/pixelRatio': 95,
          './util/radToDeg': 97,
          './util/real': 98,
          './util/retry': 99,
          './util/tween': 100,
          './util/type': 101,
          './views/Flat': 102,
          './views/Rectilinear': 103,
          bowser: 1,
          'gl-matrix': 3,
          hammerjs: 13,
          'minimal-event-emitter': 14,
        },
      ],
      55: [
        function (t, e, i) {
          'use strict';
          var a = t('../assets/Static'),
            r = t('../NetworkError'),
            n = t('bowser'),
            h = t('../util/global'),
            u = t('../util/once'),
            l = !!h.createImageBitmap && !n.firefox,
            c = { imageOrientation: 'flipY', premultiplyAlpha: 'premultiply' };
          function o(t) {
            this._stage = t;
          }
          ((o.prototype.loadImage = function (t, e, i) {
            var r = this,
              n = new Image();
            n.crossOrigin = 'anonymous';
            var o = (e && e.x) || 0,
              s = (e && e.y) || 0,
              a = (e && e.width) || 1,
              h = (e && e.height) || 1;
            return (
              (i = u(i)),
              (n.onload = function () {
                r._handleLoad(n, o, s, a, h, i);
              }),
              (n.onerror = function () {
                r._handleError(t, i);
              }),
              (n.src = t),
              function () {
                ((n.onload = n.onerror = null), (n.src = ''), i.apply(null, arguments));
              }
            );
          }),
            (o.prototype._handleLoad = function (t, e, i, r, n, o) {
              var s;
              0 !== e || 0 !== i || 1 !== r || 1 !== n
                ? ((e *= t.naturalWidth),
                  (i *= t.naturalHeight),
                  (r *= t.naturalWidth),
                  (n *= t.naturalHeight),
                  l
                    ? h.createImageBitmap(t, e, i, r, n, c).then(function (t) {
                        o(null, new a(t));
                      })
                    : (((s = document.createElement('canvas')).width = r),
                      (s.height = n),
                      s.getContext('2d').drawImage(t, e, i, r, n, 0, 0, r, n),
                      o(null, new a(s))))
                : o(null, new a(t));
            }),
            (o.prototype._handleError = function (t, e) {
              e(new r('Network error: ' + t));
            }),
            (e.exports = o));
        },
        {
          '../NetworkError': 18,
          '../assets/Static': 26,
          '../util/global': 87,
          '../util/once': 94,
          bowser: 1,
        },
      ],
      56: [
        function (t, e, i) {
          'use strict';
          var l = t('gl-matrix').mat4,
            r = t('gl-matrix').vec3,
            n = t('../util/clearOwnProperties'),
            o = t('./WebGlCommon'),
            s = o.createConstantBuffers,
            a = o.destroyConstantBuffers,
            h = o.createShaderProgram,
            u = o.destroyShaderProgram,
            c = o.enableAttributes,
            p = o.disableAttributes,
            f = o.setViewport,
            d = o.setupPixelEffectUniforms,
            m = o.setDepth,
            v = o.setTexture,
            _ = t('../shaders/vertexNormal'),
            y = t('../shaders/fragmentNormal'),
            g = [0, 1, 2, 0, 2, 3],
            w = [-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0],
            b = [0, 0, 1, 0, 1, 1, 0, 1],
            M = ['aVertexPosition', 'aTextureCoord'],
            x = [
              'uDepth',
              'uOpacity',
              'uSampler',
              'uProjMatrix',
              'uViewportMatrix',
              'uColorOffset',
              'uColorMatrix',
            ];
          function E(t) {
            ((this.gl = t),
              (this.projMatrix = l.create()),
              (this.viewportMatrix = l.create()),
              (this.translateVector = r.create()),
              (this.scaleVector = r.create()),
              (this.constantBuffers = s(t, g, w, b)),
              (this.shaderProgram = h(t, _, y, M, x)));
          }
          ((E.prototype.destroy = function () {
            (a(this.gl, this.constantBuffers), u(this.gl, this.shaderProgram), n(this));
          }),
            (E.prototype.startLayer = function (t, e) {
              var i = this.gl,
                r = this.shaderProgram,
                n = this.constantBuffers,
                o = this.viewportMatrix;
              (i.useProgram(r),
                c(i, r),
                f(i, t, e, o),
                i.uniformMatrix4fv(r.uViewportMatrix, !1, o),
                i.bindBuffer(i.ARRAY_BUFFER, n.vertexPositions),
                i.vertexAttribPointer(r.aVertexPosition, 3, i.FLOAT, i.FALSE, 0, 0),
                i.bindBuffer(i.ARRAY_BUFFER, n.textureCoords),
                i.vertexAttribPointer(r.aTextureCoord, 2, i.FLOAT, i.FALSE, 0, 0),
                d(i, t.effects(), {
                  opacity: r.uOpacity,
                  colorOffset: r.uColorOffset,
                  colorMatrix: r.uColorMatrix,
                }));
            }),
            (E.prototype.endLayer = function (t, e) {
              var i = this.gl,
                r = this.shaderProgram;
              p(i, r);
            }),
            (E.prototype.renderTile = function (t, e, i, r) {
              var n = this.gl,
                o = this.shaderProgram,
                s = this.constantBuffers,
                a = this.projMatrix,
                h = this.translateVector,
                u = this.scaleVector;
              ((h[0] = t.centerX()),
                (h[1] = t.centerY()),
                (h[2] = -0.5),
                (u[0] = t.scaleX()),
                (u[1] = t.scaleY()),
                (u[2] = 1),
                l.copy(a, i.view().projection()),
                l.rotateX(a, a, t.rotX()),
                l.rotateY(a, a, t.rotY()),
                l.translate(a, a, h),
                l.scale(a, a, u),
                n.uniformMatrix4fv(o.uProjMatrix, !1, a),
                m(n, o, r, t.z),
                v(n, o, e),
                n.bindBuffer(n.ELEMENT_ARRAY_BUFFER, s.vertexIndices),
                n.drawElements(n.TRIANGLES, g.length, n.UNSIGNED_SHORT, 0));
            }),
            (e.exports = E));
        },
        {
          '../shaders/fragmentNormal': 63,
          '../shaders/vertexNormal': 65,
          '../util/clearOwnProperties': 76,
          './WebGlCommon': 57,
          'gl-matrix': 3,
        },
      ],
      57: [
        function (t, e, i) {
          'use strict';
          var p = t('../util/clamp'),
            r = t('gl-matrix').vec4,
            f = t('gl-matrix').vec3,
            d = t('gl-matrix').mat4;
          function l(t, e, i) {
            e = t.createShader(e);
            if (
              (t.shaderSource(e, i), t.compileShader(e), !t.getShaderParameter(e, t.COMPILE_STATUS))
            )
              throw t.getShaderInfoLog(e);
            return e;
          }
          function n(t, e, i, r) {
            var n = t.createBuffer();
            return (t.bindBuffer(e, n), t.bufferData(e, r, i), n);
          }
          var o = r.create(),
            s = d.create();
          d.identity(s);
          var m = f.create(),
            v = f.create();
          e.exports = {
            createShaderProgram: function (t, e, i, r, n) {
              var e = l(t, t.VERTEX_SHADER, e),
                i = l(t, t.FRAGMENT_SHADER, i),
                o = t.createProgram();
              if (
                (t.attachShader(o, e),
                t.attachShader(o, i),
                t.linkProgram(o),
                !t.getProgramParameter(o, t.LINK_STATUS))
              )
                throw t.getProgramInfoLog(o);
              for (var s = 0; s < r.length; s++) {
                var a = r[s];
                if (((o[a] = t.getAttribLocation(o, a)), -1 === o[a]))
                  throw new Error('Shader program has no ' + a + ' attribute');
              }
              for (var h = 0; h < n.length; h++) {
                var u = n[h];
                if (((o[u] = t.getUniformLocation(o, u)), -1 === o[u]))
                  throw new Error('Shader program has no ' + u + ' uniform');
              }
              return o;
            },
            destroyShaderProgram: function (t, e) {
              for (var i = t.getAttachedShaders(e), r = 0; r < i.length; r++) {
                var n = i[r];
                (t.detachShader(e, n), t.deleteShader(n));
              }
              t.deleteProgram(e);
            },
            createConstantBuffers: function (t, e, i, r) {
              return {
                vertexIndices: n(t, t.ELEMENT_ARRAY_BUFFER, t.STATIC_DRAW, new Uint16Array(e)),
                vertexPositions: n(t, t.ARRAY_BUFFER, t.STATIC_DRAW, new Float32Array(i)),
                textureCoords: n(t, t.ARRAY_BUFFER, t.STATIC_DRAW, new Float32Array(r)),
              };
            },
            destroyConstantBuffers: function (t, e) {
              (t.deleteBuffer(e.vertexIndices),
                t.deleteBuffer(e.vertexPositions),
                t.deleteBuffer(e.textureCoords));
            },
            enableAttributes: function (t, e) {
              for (var i = t.getProgramParameter(e, t.ACTIVE_ATTRIBUTES), r = 0; r < i; r++)
                t.enableVertexAttribArray(r);
            },
            disableAttributes: function (t, e) {
              for (var i = t.getProgramParameter(e, t.ACTIVE_ATTRIBUTES), r = 0; r < i; r++)
                t.disableVertexAttribArray(r);
            },
            setTexture: function (t, e, i) {
              (t.activeTexture(t.TEXTURE0),
                t.bindTexture(t.TEXTURE_2D, i._texture),
                t.uniform1i(e.uSampler, 0));
            },
            setDepth: function (t, e, i, r) {
              ((r = (256 * (i + 1) - r) / 65536), t.uniform1f(e.uDepth, r));
            },
            setViewport: function (t, e, i, r) {
              if (0 === i.x && 1 === i.width && 0 === i.y && 1 === i.height)
                return (
                  t.viewport(0, 0, t.drawingBufferWidth, t.drawingBufferHeight),
                  void d.identity(r)
                );
              var n = i.x,
                o = p(n, 0, 1),
                s = o - n,
                a = 1 - o,
                h = p(i.width - s, 0, a),
                u = i.width - h,
                l = 1 - i.height - i.y,
                c = p(l, 0, 1),
                n = c - l,
                a = 1 - c,
                l = p(i.height - n, 0, a),
                a = i.height - l;
              (f.set(v, i.width / h, i.height / l, 1),
                f.set(m, (u - s) / h, (a - n) / l, 0),
                d.identity(r),
                d.translate(r, r, m),
                d.scale(r, r, v),
                t.viewport(
                  t.drawingBufferWidth * o,
                  t.drawingBufferHeight * c,
                  t.drawingBufferWidth * h,
                  t.drawingBufferHeight * l
                ));
            },
            setupPixelEffectUniforms: function (t, e, i) {
              var r = 1;
              (e && null != e.opacity && (r = e.opacity),
                t.uniform1f(i.opacity, r),
                (r = o),
                e && e.colorOffset && (r = e.colorOffset),
                t.uniform4fv(i.colorOffset, r),
                (r = s),
                e && e.colorMatrix && (r = e.colorMatrix),
                t.uniformMatrix4fv(i.colorMatrix, !1, r));
            },
          };
        },
        { '../util/clamp': 75, 'gl-matrix': 3 },
      ],
      58: [
        function (t, e, i) {
          'use strict';
          var r = t('./WebGlBase');
          function n() {
            this.constructor.super_.apply(this, arguments);
          }
          (t('../util/inherits')(n, r), (e.exports = n));
        },
        { '../util/inherits': 89, './WebGlBase': 56 },
      ],
      59: [
        function (t, e, i) {
          'use strict';
          var a = t('gl-matrix').mat4,
            r = t('../util/clearOwnProperties'),
            n = t('./WebGlCommon'),
            o = n.createConstantBuffers,
            s = n.destroyConstantBuffers,
            h = n.createShaderProgram,
            u = n.destroyShaderProgram,
            l = n.enableAttributes,
            c = n.disableAttributes,
            p = n.setViewport,
            f = n.setupPixelEffectUniforms,
            d = n.setDepth,
            m = n.setTexture,
            v = t('../shaders/vertexEquirect'),
            _ = t('../shaders/fragmentEquirect'),
            y = [0, 1, 2, 0, 2, 3],
            g = [-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0],
            w = [0, 0, 1, 0, 1, 1, 0, 1],
            b = ['aVertexPosition'],
            M = [
              'uDepth',
              'uOpacity',
              'uSampler',
              'uInvProjMatrix',
              'uViewportMatrix',
              'uColorOffset',
              'uColorMatrix',
              'uTextureX',
              'uTextureY',
              'uTextureWidth',
              'uTextureHeight',
            ];
          function x(t) {
            ((this.gl = t),
              (this.invProjMatrix = a.create()),
              (this.viewportMatrix = a.create()),
              (this.constantBuffers = o(t, y, g, w)),
              (this.shaderProgram = h(t, v, _, b, M)));
          }
          ((x.prototype.destroy = function () {
            (s(this.gl, this.constantBuffers), u(this.gl, this.shaderProgram), r(this));
          }),
            (x.prototype.startLayer = function (t, e) {
              var i = this.gl,
                r = this.shaderProgram,
                n = this.constantBuffers,
                o = this.invProjMatrix,
                s = this.viewportMatrix;
              (i.useProgram(r),
                l(i, r),
                p(i, t, e, s),
                i.uniformMatrix4fv(r.uViewportMatrix, !1, s),
                i.bindBuffer(i.ARRAY_BUFFER, n.vertexPositions),
                i.vertexAttribPointer(r.aVertexPosition, 3, i.FLOAT, i.FALSE, 0, 0),
                i.bindBuffer(i.ARRAY_BUFFER, n.textureCoords),
                a.copy(o, t.view().projection()),
                a.invert(o, o),
                i.uniformMatrix4fv(r.uInvProjMatrix, !1, o));
              ((e = t.effects().textureCrop || {}),
                (s = null != e.x ? e.x : 0),
                (n = null != e.y ? e.y : 0),
                (o = null != e.width ? e.width : 1),
                (e = null != e.height ? e.height : 1));
              (i.uniform1f(r.uTextureX, s),
                i.uniform1f(r.uTextureY, n),
                i.uniform1f(r.uTextureWidth, o),
                i.uniform1f(r.uTextureHeight, e),
                f(i, t.effects(), {
                  opacity: r.uOpacity,
                  colorOffset: r.uColorOffset,
                  colorMatrix: r.uColorMatrix,
                }));
            }),
            (x.prototype.endLayer = function (t, e) {
              var i = this.gl,
                r = this.shaderProgram;
              c(i, r);
            }),
            (x.prototype.renderTile = function (t, e, i, r) {
              var n = this.gl,
                o = this.shaderProgram,
                s = this.constantBuffers;
              (d(n, o, r, t.z),
                m(n, o, e),
                n.bindBuffer(n.ELEMENT_ARRAY_BUFFER, s.vertexIndices),
                n.drawElements(n.TRIANGLES, y.length, n.UNSIGNED_SHORT, 0));
            }),
            (e.exports = x));
        },
        {
          '../shaders/fragmentEquirect': 62,
          '../shaders/vertexEquirect': 64,
          '../util/clearOwnProperties': 76,
          './WebGlCommon': 57,
          'gl-matrix': 3,
        },
      ],
      60: [
        function (t, e, i) {
          'use strict';
          var r = t('./WebGlBase');
          function n() {
            this.constructor.super_.apply(this, arguments);
          }
          (t('../util/inherits')(n, r), (e.exports = n));
        },
        { '../util/inherits': 89, './WebGlBase': 56 },
      ],
      61: [
        function (t, e, i) {
          'use strict';
          var r = t('./WebGlCube'),
            n = t('./WebGlFlat'),
            o = t('./WebGlEquirect');
          e.exports = function (t) {
            if ('webgl' !== t.type) throw new Error('Unknown stage type: ' + t.type);
            (t.registerRenderer('flat', 'flat', n),
              t.registerRenderer('cube', 'rectilinear', r),
              t.registerRenderer('equirect', 'rectilinear', o));
          };
        },
        { './WebGlCube': 58, './WebGlEquirect': 59, './WebGlFlat': 60 },
      ],
      62: [
        function (t, e, i) {
          'use strict';
          e.exports = [
            '#ifdef GL_FRAGMENT_PRECISION_HIGH',
            'precision highp float;',
            '#else',
            'precision mediump float',
            '#endif',
            'uniform sampler2D uSampler;',
            'uniform float uOpacity;',
            'uniform float uTextureX;',
            'uniform float uTextureY;',
            'uniform float uTextureWidth;',
            'uniform float uTextureHeight;',
            'uniform vec4 uColorOffset;',
            'uniform mat4 uColorMatrix;',
            'varying vec4 vRay;',
            'const float PI = 3.14159265358979323846264;',
            'void main(void) {',
            '  float r = inversesqrt(vRay.x * vRay.x + vRay.y * vRay.y + vRay.z * vRay.z);',
            '  float phi  = acos(vRay.y * r);',
            '  float theta = atan(vRay.x, -1.0*vRay.z);',
            '  float s = 0.5 + 0.5 * theta / PI;',
            '  float t = 1.0 - phi / PI;',
            '  s = s * uTextureWidth + uTextureX;',
            '  t = t * uTextureHeight + uTextureY;',
            '  vec4 color = texture2D(uSampler, vec2(s, t)) * uColorMatrix + uColorOffset;',
            '  gl_FragColor = vec4(color.rgba * uOpacity);',
            '}',
          ].join('\n');
        },
        {},
      ],
      63: [
        function (t, e, i) {
          'use strict';
          e.exports = [
            '#ifdef GL_FRAGMENT_PRECISION_HIGH',
            'precision highp float;',
            '#else',
            'precision mediump float;',
            '#endif',
            'uniform sampler2D uSampler;',
            'uniform float uOpacity;',
            'uniform vec4 uColorOffset;',
            'uniform mat4 uColorMatrix;',
            'varying vec2 vTextureCoord;',
            'void main(void) {',
            '  vec4 color = texture2D(uSampler, vTextureCoord) * uColorMatrix + uColorOffset;',
            '  gl_FragColor = vec4(color.rgba * uOpacity);',
            '}',
          ].join('\n');
        },
        {},
      ],
      64: [
        function (t, e, i) {
          'use strict';
          e.exports = [
            'attribute vec3 aVertexPosition;',
            'uniform float uDepth;',
            'uniform mat4 uViewportMatrix;',
            'uniform mat4 uInvProjMatrix;',
            'varying vec4 vRay;',
            'void main(void) {',
            '  vRay = uInvProjMatrix * vec4(aVertexPosition.xy, 1.0, 1.0);',
            '  gl_Position = uViewportMatrix * vec4(aVertexPosition.xy, uDepth, 1.0);',
            '}',
          ].join('\n');
        },
        {},
      ],
      65: [
        function (t, e, i) {
          'use strict';
          e.exports = [
            'attribute vec3 aVertexPosition;',
            'attribute vec2 aTextureCoord;',
            'uniform float uDepth;',
            'uniform mat4 uViewportMatrix;',
            'uniform mat4 uProjMatrix;',
            'varying vec2 vTextureCoord;',
            'void main(void) {',
            '  gl_Position = uViewportMatrix * uProjMatrix * vec4(aVertexPosition.xy, 0.0, 1.0);',
            '  gl_Position.z = uDepth * gl_Position.w;',
            '  vTextureCoord = aTextureCoord;',
            '}',
          ].join('\n');
        },
        {},
      ],
      66: [
        function (t, e, i) {
          'use strict';
          var r = t('minimal-event-emitter'),
            l = t('../NetworkError'),
            n = t('../collections/WorkPool'),
            c = t('../util/chain'),
            p = t('../util/delay'),
            f = t('../util/now'),
            s = { x: 'x', y: 'y', z: 'z', f: 'face' };
          function a(t, e) {
            ((e = e || {}),
              (this._loadPool = new n({ concurrency: e.concurrency || 4 })),
              (this._retryDelay = e.retryDelay || 1e4),
              (this._retryMap = {}),
              (this._sourceFromTile = t));
          }
          (r(a),
            (a.prototype.loadAsset = function (t, r, e) {
              var n = this,
                i = this._retryDelay,
                o = this._retryMap,
                s = this._sourceFromTile(r),
                a = s.url,
                s = s.rect,
                h = t.loadImage.bind(t, a, s),
                s = o[a];
              null != s && ((s = f() - s) < i ? (u = i - s) : ((u = 0), delete o[a]));
              var u = p.bind(null, u);
              return c(u, function (i) {
                return n._loadPool.push(h, function (t, e) {
                  t
                    ? (t instanceof l && ((o[a] = f()), n.emit('networkError', t, r)), i(t, r))
                    : (delete o[a], i(null, r, e));
                });
              })(e);
            }),
            (a.fromString = function (o, e) {
              var i = ((e = e || {}) && e.cubeMapPreviewFaceOrder) || 'bdflru';
              return new a(
                e.cubeMapPreviewUrl
                  ? function (t) {
                      return (
                        0 === t.z
                          ? function (t) {
                              t = i.indexOf(t.face) / 6;
                              return {
                                url: e.cubeMapPreviewUrl,
                                rect: { x: 0, y: t, width: 1, height: 1 / 6 },
                              };
                            }
                          : r
                      )(t);
                    }
                  : r,
                e
              );
              function r(t) {
                var e,
                  i = o;
                for (e in s)
                  var r = s[e],
                    n = new RegExp('\\{(' + e + ')\\}', 'g'),
                    r = t.hasOwnProperty(r) ? t[r] : '',
                    i = i.replace(n, r);
                return { url: i };
              }
            }),
            (e.exports = a));
        },
        {
          '../NetworkError': 18,
          '../collections/WorkPool': 32,
          '../util/chain': 74,
          '../util/delay': 84,
          '../util/now': 93,
          'minimal-event-emitter': 14,
        },
      ],
      67: [
        function (t, e, i) {
          'use strict';
          function r(t) {
            this._asset = t;
          }
          ((r.prototype.asset = function () {
            return this._asset;
          }),
            (r.prototype.loadAsset = function (t, e, i) {
              var r = this,
                n = setTimeout(function () {
                  i(null, e, r._asset);
                }, 0);
              return function () {
                (clearTimeout(n), i.apply(null, arguments));
              };
            }),
            (e.exports = r));
        },
        {},
      ],
      68: [
        function (t, e, i) {
          'use strict';
          function r() {
            this._renderers = {};
          }
          ((r.prototype.set = function (t, e, i) {
            (this._renderers[t] || (this._renderers[t] = {}), (this._renderers[t][e] = i));
          }),
            (r.prototype.get = function (t, e) {
              return (this._renderers[t] && this._renderers[t][e]) || null;
            }),
            (e.exports = r));
        },
        {},
      ],
      69: [
        function (t, e, i) {
          'use strict';
          var r = t('minimal-event-emitter'),
            n = t('../collections/WorkQueue'),
            _ = t('../util/calcRect'),
            o = t('../util/async'),
            s = t('../util/cancelize'),
            a = t('../util/clearOwnProperties'),
            h = t('./RendererRegistry');
          function u(t, e) {
            return t.cmp(e);
          }
          function l(t, e) {
            return -t.cmp(e);
          }
          function c(t) {
            ((this._progressive = !(!t || !t.progressive)),
              (this._layers = []),
              (this._renderers = []),
              (this._tilesToLoad = []),
              (this._tilesToRender = []),
              (this._tmpVisible = []),
              (this._tmpChildren = []),
              (this._width = 0),
              (this._height = 0),
              (this._tmpRect = {}),
              (this._tmpSize = {}),
              (this._createTextureWorkQueue = new n()),
              (this._emitRenderInvalid = this._emitRenderInvalid.bind(this)),
              (this._rendererRegistry = new h()));
          }
          (r(c),
            (c.prototype.destroy = function () {
              (this.removeAllLayers(), a(this));
            }),
            (c.prototype.registerRenderer = function (t, e, i) {
              return this._rendererRegistry.set(t, e, i);
            }),
            (c.prototype.domElement = function () {
              throw new Error('Stage implementation must override domElement');
            }),
            (c.prototype.width = function () {
              return this._width;
            }),
            (c.prototype.height = function () {
              return this._height;
            }),
            (c.prototype.size = function (t) {
              return (((t = t || {}).width = this._width), (t.height = this._height), t);
            }),
            (c.prototype.setSize = function (t) {
              ((this._width = t.width),
                (this._height = t.height),
                this.setSizeForType(),
                this.emit('resize'),
                this._emitRenderInvalid());
            }),
            (c.prototype.setSizeForType = function (t) {
              throw new Error('Stage implementation must override setSizeForType');
            }),
            (c.prototype.loadImage = function () {
              throw new Error('Stage implementation must override loadImage');
            }),
            (c.prototype._emitRenderInvalid = function () {
              this.emit('renderInvalid');
            }),
            (c.prototype.validateLayer = function (t) {
              throw new Error('Stage implementation must override validateLayer');
            }),
            (c.prototype.listLayers = function () {
              return [].concat(this._layers);
            }),
            (c.prototype.hasLayer = function (t) {
              return 0 <= this._layers.indexOf(t);
            }),
            (c.prototype.addLayer = function (t, e) {
              if (0 <= this._layers.indexOf(t)) throw new Error('Layer already in stage');
              if ((null == e && (e = this._layers.length), e < 0 || e > this._layers.length))
                throw new Error('Invalid layer position');
              this.validateLayer(t);
              var i = t.geometry().type,
                r = t.view().type,
                n = this._rendererRegistry.get(i, r);
              if (!n)
                throw new Error(
                  'No ' + this.type + ' renderer avaiable for ' + i + ' geometry and ' + r + ' view'
                );
              n = this.createRenderer(n);
              (this._layers.splice(e, 0, t),
                this._renderers.splice(e, 0, n),
                t.addEventListener('viewChange', this._emitRenderInvalid),
                t.addEventListener('effectsChange', this._emitRenderInvalid),
                t.addEventListener('fixedLevelChange', this._emitRenderInvalid),
                t.addEventListener('textureStoreChange', this._emitRenderInvalid),
                this._emitRenderInvalid());
            }),
            (c.prototype.moveLayer = function (t, e) {
              var i = this._layers.indexOf(t);
              if (i < 0) throw new Error('No such layer in stage');
              if (e < 0 || e >= this._layers.length) throw new Error('Invalid layer position');
              t = this._layers.splice(i, 1)[0];
              i = this._renderers.splice(i, 1)[0];
              (this._layers.splice(e, 0, t),
                this._renderers.splice(e, 0, i),
                this._emitRenderInvalid());
            }),
            (c.prototype.removeLayer = function (t) {
              var e = this._layers.indexOf(t);
              if (e < 0) throw new Error('No such layer in stage');
              ((t = this._layers.splice(e, 1)[0]), (e = this._renderers.splice(e, 1)[0]));
              (this.destroyRenderer(e),
                t.removeEventListener('viewChange', this._emitRenderInvalid),
                t.removeEventListener('effectsChange', this._emitRenderInvalid),
                t.removeEventListener('fixedLevelChange', this._emitRenderInvalid),
                t.removeEventListener('textureStoreChange', this._emitRenderInvalid),
                this._emitRenderInvalid());
            }),
            (c.prototype.removeAllLayers = function () {
              for (; 0 < this._layers.length; ) this.removeLayer(this._layers[0]);
            }),
            (c.prototype.startFrame = function () {
              throw new Error('Stage implementation must override startFrame');
            }),
            (c.prototype.endFrame = function () {
              throw new Error('Stage implementation must override endFrame');
            }),
            (c.prototype.render = function () {
              var t,
                e,
                i = this._tilesToLoad,
                r = this._tilesToRender,
                n = !0,
                o = this._width,
                s = this._height,
                a = this._tmpRect,
                h = this._tmpSize;
              if (!(o <= 0 || s <= 0)) {
                for (this.startFrame(), t = 0; t < this._layers.length; t++)
                  this._layers[t].textureStore().startFrame();
                for (t = 0; t < this._layers.length; t++) {
                  var u,
                    l,
                    c = this._layers[t],
                    p = c.effects(),
                    f = c.view(),
                    d = c.textureStore(),
                    m = this._renderers[t],
                    v = this._layers.length - t;
                  if ((_(o, s, p && p.rect, a), !(a.width <= 0 || a.height <= 0))) {
                    for (
                      h.width = a.width * this._width,
                        h.height = a.height * this._height,
                        f.setSize(h),
                        m.startLayer(c, a),
                        f = this._collectTiles(c, d),
                        e = 0;
                      e < i.length;
                      e++
                    )
                      ((u = i[e]), d.markTile(u));
                    for (e = 0; e < r.length; e++)
                      ((u = r[e]), (l = d.texture(u)), m.renderTile(u, l, c, v));
                    (c.emit('renderComplete', f), f || (n = !1), m.endLayer(c, a));
                  }
                }
                for (t = 0; t < this._layers.length; t++) this._layers[t].textureStore().endFrame();
                (this.endFrame(), this.emit('renderComplete', n));
              }
            }),
            (c.prototype._collectTiles = function (t, e) {
              var i = this._tilesToLoad,
                r = this._tilesToRender,
                n = this._tmpVisible;
              ((i.length = 0), (r.length = 0), (n.length = 0), t.visibleTiles(n));
              for (var o = !0, s = 0; s < n.length; s++) {
                var a,
                  h = n[s];
                (this._collectTileToLoad(h),
                  e.texture(h)
                    ? ((a = !1), this._collectTileToRender(h))
                    : ((a = this._collectChildren(h, e)), (o = !1)),
                  this._collectParents(h, e, a));
              }
              return (i.sort(u), r.sort(l), o);
            }),
            (c.prototype._collectChildren = function (t, e) {
              var i = this._tmpChildren,
                r = !0;
              do {
                if (((i.length = 0), !t.children(i))) break;
                r = !1;
                for (var n = 0; n < i.length; n++)
                  ((t = i[n]),
                    e.texture(t)
                      ? (this._collectTileToLoad(t), this._collectTileToRender(t))
                      : (r = !0));
              } while (r && 1 === i.length);
              return r;
            }),
            (c.prototype._collectParents = function (t, e, i) {
              for (var r = this._progressive; (r || i) && null != (t = t.parent()); ) {
                if (i)
                  if (e.texture(t)) (this._collectTileToRender(t), (i = !1));
                  else if (!this._progressive) continue;
                this._collectTileToLoad(t) || (r = !1);
              }
              return i;
            }),
            (c.prototype._collectTileToLoad = function (t) {
              return this._collectTileIntoList(t, this._tilesToLoad);
            }),
            (c.prototype._collectTileToRender = function (t) {
              return this._collectTileIntoList(t, this._tilesToRender);
            }),
            (c.prototype._collectTileIntoList = function (t, e) {
              for (var i = !1, r = 0; r < e.length; r++)
                if (t.equals(e[r])) {
                  i = !0;
                  break;
                }
              return (i || e.push(t), !i);
            }),
            (c.prototype.createTexture = function (i, r, n) {
              var t = this;
              var e = s(
                o(function () {
                  return new t.TextureClass(t, i, r);
                })
              );
              return this._createTextureWorkQueue.push(e, function (t, e) {
                n(t, i, r, e);
              });
            }),
            (e.exports = c));
        },
        {
          '../collections/WorkQueue': 33,
          '../util/async': 71,
          '../util/calcRect': 72,
          '../util/cancelize': 73,
          '../util/clearOwnProperties': 76,
          './RendererRegistry': 68,
          'minimal-event-emitter': 14,
        },
      ],
      70: [
        function (t, e, i) {
          'use strict';
          var r = t('./Stage'),
            n = t('../loaders/HtmlImage'),
            o = t('bowser'),
            s = t('../util/inherits'),
            a = t('../util/pixelRatio'),
            u = t('../util/ispot'),
            h = t('../util/dom').setAbsolute,
            l = t('../util/dom').setFullSize,
            c = t('../util/clearOwnProperties'),
            p = o.chrome;
          function f(t) {
            t = t || {};
            var e = this;
            (this.constructor.super_.call(this, t),
              (this._generateMipmaps = null != t.generateMipmaps && t.generateMipmaps),
              (this._loader = new n(this)),
              (this._domElement = document.createElement('canvas')),
              h(this._domElement),
              l(this._domElement),
              (this._gl = (function (t, e) {
                var i = {
                  alpha: !0,
                  premultipliedAlpha: !0,
                  antialias: !(!e || !e.antialias),
                  preserveDrawingBuffer: !(!e || !e.preserveDrawingBuffer),
                };
                if (
                  !(i =
                    t.getContext &&
                    (t.getContext('webgl', i) || t.getContext('experimental-webgl', i)))
                )
                  throw new Error('Could not get WebGL context');
                return (e.wrapContext && (i = e.wrapContext(i)), i);
              })(this._domElement, t)),
              (this._handleContextLoss = function () {
                (e.emit('webglcontextlost'), (e._gl = null));
              }),
              this._domElement.addEventListener('webglcontextlost', this._handleContextLoss),
              (this._rendererInstances = []));
          }
          function d(t, e, i) {
            ((this._stage = t),
              (this._gl = t._gl),
              (this._texture = null),
              (this._timestamp = null),
              (this._width = this._height = null),
              this.refresh(e, i));
          }
          (s(f, r),
            (f.prototype.destroy = function () {
              (this._domElement.removeEventListener('webglcontextlost', this._handleContextLoss),
                this.constructor.super_.prototype.destroy.call(this));
            }),
            (f.prototype.domElement = function () {
              return this._domElement;
            }),
            (f.prototype.webGlContext = function () {
              return this._gl;
            }),
            (f.prototype.setSizeForType = function () {
              var t = a();
              ((this._domElement.width = t * this._width),
                (this._domElement.height = t * this._height));
            }),
            (f.prototype.loadImage = function (t, e, i) {
              return this._loader.loadImage(t, e, i);
            }),
            (f.prototype.maxTextureSize = function () {
              return this._gl.getParameter(this._gl.MAX_TEXTURE_SIZE);
            }),
            (f.prototype.validateLayer = function (t) {
              var e = t.geometry().maxTileSize(),
                t = this.maxTextureSize();
              if (t < e)
                throw new Error(
                  'Layer has level with tile size larger than maximum texture size (' +
                    e +
                    ' vs. ' +
                    t +
                    ')'
                );
            }),
            (f.prototype.createRenderer = function (t) {
              for (var e = this._rendererInstances, i = 0; i < e.length; i++)
                if (e[i] instanceof t) return e[i];
              var r = new t(this._gl);
              return (e.push(r), r);
            }),
            (f.prototype.destroyRenderer = function (t) {
              var e = this._rendererInstances;
              this._renderers.indexOf(t) < 0 &&
                (t.destroy(), 0 <= (t = e.indexOf(t)) && e.splice(t, 1));
            }),
            (f.prototype.startFrame = function () {
              var t = this._gl;
              if (!t) throw new Error('Bad WebGL context - maybe context was lost?');
              (t.viewport(0, 0, t.drawingBufferWidth, t.drawingBufferHeight),
                t.clearColor(0, 0, 0, 0),
                t.clear(t.COLOR_BUFFER_BIT | t.DEPTH_BUFFER_BIT),
                t.enable(t.DEPTH_TEST),
                t.enable(t.BLEND),
                t.blendFunc(t.ONE, t.ONE_MINUS_SRC_ALPHA));
            }),
            (f.prototype.endFrame = function () {}),
            (f.prototype.takeSnapshot = function (t) {
              ('object' == typeof t && null != t) || (t = {});
              t = t.quality;
              if ((void 0 === t && (t = 75), 'number' != typeof t || t < 0 || 100 < t))
                throw new Error(
                  'WebGLStage: Snapshot quality needs to be a number between 0 and 100'
                );
              return (this.render(), this._domElement.toDataURL('image/jpeg', t / 100));
            }),
            (f.type = f.prototype.type = 'webgl'),
            (d.prototype.refresh = function (t, e) {
              var i,
                r = this._gl,
                n = this._stage,
                o = e.timestamp();
              if (o !== this._timestamp) {
                var s = e.element(),
                  a = e.width(),
                  h = e.height();
                if (a !== this._width || h !== this._height) {
                  e = n.maxTextureSize();
                  if (e < a)
                    throw new Error('Texture width larger than max size (' + a + ' vs. ' + e + ')');
                  if (e < h)
                    throw new Error(
                      'Texture height larger than max size (' + h + ' vs. ' + e + ')'
                    );
                  (this._texture && r.deleteTexture(i),
                    (i = this._texture = r.createTexture()),
                    r.bindTexture(r.TEXTURE_2D, i),
                    r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL, !0),
                    r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !0),
                    r.texImage2D(r.TEXTURE_2D, 0, r.RGBA, r.RGBA, r.UNSIGNED_BYTE, s));
                } else
                  ((i = this._texture),
                    r.bindTexture(r.TEXTURE_2D, i),
                    r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL, !0),
                    r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !0),
                    s instanceof HTMLVideoElement && p
                      ? r.texImage2D(r.TEXTURE_2D, 0, r.RGBA, r.RGBA, r.UNSIGNED_BYTE, s)
                      : r.texSubImage2D(r.TEXTURE_2D, 0, 0, 0, r.RGBA, r.UNSIGNED_BYTE, s));
                (n._generateMipmaps && u(a) && u(h)
                  ? (r.texParameteri(r.TEXTURE_2D, r.TEXTURE_MAG_FILTER, r.LINEAR),
                    r.texParameteri(r.TEXTURE_2D, r.TEXTURE_MIN_FILTER, r.LINEAR_MIPMAP_LINEAR),
                    r.generateMipmap(r.TEXTURE_2D))
                  : (r.texParameteri(r.TEXTURE_2D, r.TEXTURE_MAG_FILTER, r.LINEAR),
                    r.texParameteri(r.TEXTURE_2D, r.TEXTURE_MIN_FILTER, r.LINEAR)),
                  r.texParameteri(r.TEXTURE_2D, r.TEXTURE_WRAP_S, r.CLAMP_TO_EDGE),
                  r.texParameteri(r.TEXTURE_2D, r.TEXTURE_WRAP_T, r.CLAMP_TO_EDGE),
                  r.bindTexture(r.TEXTURE_2D, null),
                  (this._timestamp = o),
                  (this._width = a),
                  (this._height = h));
              }
            }),
            (d.prototype.destroy = function () {
              (this._texture && this._gl.deleteTexture(this._texture), c(this));
            }),
            (f.TextureClass = f.prototype.TextureClass = d),
            (e.exports = f));
        },
        {
          '../loaders/HtmlImage': 55,
          '../util/clearOwnProperties': 76,
          '../util/dom': 85,
          '../util/inherits': 89,
          '../util/ispot': 90,
          '../util/pixelRatio': 95,
          './Stage': 69,
          bowser: 1,
        },
      ],
      71: [
        function (t, e, i) {
          'use strict';
          e.exports = function (r) {
            return function (t) {
              var e, i;
              try {
                i = r();
              } catch (t) {
                e = t;
              } finally {
                e ? t(e) : t(null, i);
              }
            };
          };
        },
        {},
      ],
      72: [
        function (t, e, i) {
          'use strict';
          e.exports = function (t, e, i, r) {
            var n, o;
            return (
              (r = r || {}),
              (n =
                null != i && null != i.absoluteWidth
                  ? i.absoluteWidth / t
                  : null != i && null != i.relativeWidth
                    ? i.relativeWidth
                    : 1),
              (o =
                i && null != i.absoluteHeight
                  ? i.absoluteHeight / e
                  : null != i && null != i.relativeHeight
                    ? i.relativeHeight
                    : 1),
              (t =
                null != i && null != i.absoluteX
                  ? i.absoluteX / t
                  : null != i && null != i.relativeX
                    ? i.relativeX
                    : 0),
              (i =
                null != i && null != i.absoluteY
                  ? i.absoluteY / e
                  : null != i && null != i.relativeY
                    ? i.relativeY
                    : 0),
              (r.x = t),
              (r.y = i),
              (r.width = n),
              (r.height = o),
              r
            );
          };
        },
        {},
      ],
      73: [
        function (t, e, i) {
          'use strict';
          var r = t('./once');
          e.exports = function (i) {
            return function () {
              if (!arguments.length) throw new Error('cancelized: expected at least one argument');
              var t = Array.prototype.slice.call(arguments, 0),
                e = (t[t.length - 1] = r(t[t.length - 1]));
              return (
                i.apply(null, t),
                function () {
                  e.apply(null, arguments);
                }
              );
            };
          };
        },
        { './once': 94 },
      ],
      74: [
        function (t, e, i) {
          'use strict';
          var a = t('./noop');
          e.exports = function () {
            var e = Array.prototype.slice.call(arguments, 0);
            return function () {
              var r = e.slice(0),
                n = null,
                o = null,
                t = arguments.length
                  ? Array.prototype.slice.call(arguments, 0, arguments.length - 1)
                  : [],
                s = arguments.length ? arguments[arguments.length - 1] : a;
              return (
                t.unshift(null),
                function t() {
                  if (arguments[0]) return ((n = o = null), void s.apply(null, arguments));
                  if (!r.length) return ((n = o = null), void s.apply(null, arguments));
                  var e = (n = r.shift()),
                    i = Array.prototype.slice.call(arguments, 1);
                  i.push(t);
                  i = n.apply(null, i);
                  if (e === n) {
                    if ('function' != typeof i)
                      throw new Error('chain: chaining on non-cancellable function');
                    o = i;
                  }
                }.apply(null, t),
                function () {
                  o && o.apply(null, arguments);
                }
              );
            };
          };
        },
        { './noop': 92 },
      ],
      75: [
        function (t, e, i) {
          'use strict';
          e.exports = function (t, e, i) {
            return Math.min(Math.max(t, e), i);
          };
        },
        {},
      ],
      76: [
        function (t, e, i) {
          'use strict';
          e.exports = function (t) {
            for (var e in t) t.hasOwnProperty(e) && (t[e] = void 0);
          };
        },
        {},
      ],
      77: [
        function (t, e, i) {
          'use strict';
          e.exports = function (t, e) {
            return t < e ? -1 : e < t ? 1 : 0;
          };
        },
        {},
      ],
      78: [
        function (t, e, i) {
          'use strict';
          e.exports = function () {
            var r = arguments;
            return function (t) {
              for (var e = t, i = 0; i < r.length; i++) e = r[i].call(null, e);
              return e;
            };
          };
        },
        {},
      ],
      79: [
        function (t, e, i) {
          'use strict';
          function r(t, e, i) {
            return 2 * Math.atan((i * Math.tan(t / 2)) / e);
          }
          e.exports = {
            convert: r,
            htov: r,
            htod: function (t, e, i) {
              return r(t, e, Math.sqrt(e * e + i * i));
            },
            vtoh: function (t, e, i) {
              return r(t, i, e);
            },
            vtod: function (t, e, i) {
              return r(t, i, Math.sqrt(e * e + i * i));
            },
            dtoh: function (t, e, i) {
              return r(t, Math.sqrt(e * e + i * i), e);
            },
            dtov: function (t, e, i) {
              return r(t, Math.sqrt(e * e + i * i), i);
            },
          };
        },
        {},
      ],
      80: [
        function (t, e, i) {
          'use strict';
          e.exports = function (t) {
            return t.toPrecision(15);
          };
        },
        {},
      ],
      81: [
        function (t, e, i) {
          'use strict';
          e.exports = function (t, e) {
            for (var i in e) i in t || (t[i] = e[i]);
            return t;
          };
        },
        {},
      ],
      82: [
        function (t, e, i) {
          'use strict';
          e.exports = function (t, e) {
            setTimeout(function () {
              e && 0 < e.length ? t.apply(null, e) : t();
            }, 0);
          };
        },
        {},
      ],
      83: [
        function (t, e, i) {
          'use strict';
          e.exports = function (t) {
            return (t * Math.PI) / 180;
          };
        },
        {},
      ],
      84: [
        function (t, e, i) {
          'use strict';
          e.exports = function (t, e) {
            var i = null;
            return (
              (i = setTimeout(function () {
                null != i && e((i = null));
              }, t)),
              function () {
                null != i && (clearTimeout(i), (i = null), e.apply(null, arguments));
              }
            );
          };
        },
        {},
      ],
      85: [
        function (t, e, i) {
          'use strict';
          function r(t) {
            for (
              var e = document.documentElement.style,
                i = ['Moz', 'Webkit', 'Khtml', 'O', 'ms'],
                r = 0;
              r < i.length;
              r++
            ) {
              var n = i[r] + (t[0].toUpperCase() + t.slice(1));
              if (n in e) return n;
            }
            return t;
          }
          function n(t) {
            var i = r(t);
            return function (t, e) {
              return (t.style[i] = e);
            };
          }
          var o = n('transform'),
            s = n('transformOrigin');
          e.exports = {
            prefixProperty: r,
            getWithVendorPrefix: function (t) {
              var e = r(t);
              return function (t) {
                return t.style[e];
              };
            },
            setWithVendorPrefix: n,
            setTransform: o,
            setTransformOrigin: s,
            setNullTransform: function (t) {
              o(t, 'translateZ(0)');
            },
            setNullTransformOrigin: function (t) {
              s(t, '0 0 0');
            },
            setAbsolute: function (t) {
              t.style.position = 'absolute';
            },
            setPixelPosition: function (t, e, i) {
              ((t.style.left = e + 'px'), (t.style.top = i + 'px'));
            },
            setPixelSize: function (t, e, i) {
              ((t.style.width = e + 'px'), (t.style.height = i + 'px'));
            },
            setNullSize: function (t) {
              t.style.width = t.style.height = 0;
            },
            setFullSize: function (t) {
              t.style.width = t.style.height = '100%';
            },
            setOverflowHidden: function (t) {
              t.style.overflow = 'hidden';
            },
            setOverflowVisible: function (t) {
              t.style.overflow = 'visible';
            },
            setNoPointerEvents: function (t) {
              t.style.pointerEvents = 'none';
            },
          };
        },
        {},
      ],
      86: [
        function (t, e, i) {
          'use strict';
          e.exports = function (t, e) {
            for (var i in e) t[i] = e[i];
            return t;
          };
        },
        {},
      ],
      87: [
        function (t, i, e) {
          (function (e) {
            (function () {
              'use strict';
              var t =
                'undefined' != typeof window
                  ? window
                  : 'undefined' != typeof self
                    ? self
                    : void 0 !== e
                      ? e
                      : null;
              i.exports = t;
            }).call(this);
          }).call(
            this,
            'undefined' != typeof global
              ? global
              : 'undefined' != typeof self
                ? self
                : 'undefined' != typeof window
                  ? window
                  : {}
          );
        },
        {},
      ],
      88: [
        function (t, e, i) {
          'use strict';
          e.exports = function () {
            for (var t = 0, e = 0; e < arguments.length; e++) {
              var i = arguments[e];
              ((t += i), (t += i << 10), (t ^= i >> 6));
            }
            return ((t += t << 3), (t ^= t >> 11), 0 <= (t += t << 15) ? t : -t);
          };
        },
        {},
      ],
      89: [
        function (t, e, i) {
          'use strict';
          e.exports = function (t, e) {
            function i() {}
            ((t.super_ = e),
              (i.prototype = e.prototype),
              (t.prototype = new i()),
              (t.prototype.constructor = t));
          };
        },
        {},
      ],
      90: [
        function (t, e, i) {
          'use strict';
          e.exports = function (t) {
            return 0 == (t & (t - 1));
          };
        },
        {},
      ],
      91: [
        function (t, e, i) {
          'use strict';
          e.exports = function (t, e) {
            return ((+t % (e = +e)) + e) % e;
          };
        },
        {},
      ],
      92: [
        function (t, e, i) {
          'use strict';
          e.exports = function () {};
        },
        {},
      ],
      93: [
        function (t, e, i) {
          'use strict';
          e.exports =
            'undefined' != typeof performance && performance.now
              ? function () {
                  return performance.now();
                }
              : function () {
                  return Date.now();
                };
        },
        {},
      ],
      94: [
        function (t, e, i) {
          'use strict';
          e.exports = function (t) {
            var e,
              i = !1;
            return function () {
              return (i || ((i = !0), (e = t.apply(null, arguments))), e);
            };
          };
        },
        {},
      ],
      95: [
        function (t, e, i) {
          'use strict';
          e.exports = function () {
            if ('undefined' != typeof window) {
              if (window.devicePixelRatio) return window.devicePixelRatio;
              var t = window.screen;
              if (t && t.deviceXDPI && t.logicalXDPI) return t.deviceXDPI / t.logicalXDPI;
              if (t && t.systemXDPI && t.logicalXDPI) return t.systemXDPI / t.logicalXDPI;
            }
            return 1;
          };
        },
        {},
      ],
      96: [
        function (t, e, i) {
          'use strict';
          var n = t('./dom').setTransform,
            o = t('./decimal');
          e.exports = function (t, e, i, r) {
            ((r = r || ''),
              (r = 'translateX(' + o(e) + 'px) translateY(' + o(i) + 'px) translateZ(0) ' + r),
              n(t, r));
          };
        },
        { './decimal': 80, './dom': 85 },
      ],
      97: [
        function (t, e, i) {
          'use strict';
          e.exports = function (t) {
            return (180 * t) / Math.PI;
          };
        },
        {},
      ],
      98: [
        function (t, e, i) {
          'use strict';
          e.exports = function (t) {
            return 'number' == typeof t && isFinite(t);
          };
        },
        {},
      ],
      99: [
        function (t, e, i) {
          'use strict';
          var s = t('./noop');
          e.exports = function (o) {
            return function () {
              var t = arguments.length
                  ? Array.prototype.slice.call(arguments, 0, arguments.length - 1)
                  : [],
                e = arguments.length ? arguments[arguments.length - 1] : s,
                i = null,
                r = !1;
              function n() {
                !arguments[0] || r ? e.apply(null, arguments) : (i = o.apply(null, t));
              }
              return (
                t.push(n),
                n(!0),
                function () {
                  ((r = !0), i.apply(null, arguments));
                }
              );
            };
          };
        },
        { './noop': 92 },
      ],
      100: [
        function (t, e, i) {
          'use strict';
          var a = t('./now');
          e.exports = function (i, r, n) {
            var o = !1,
              s = a();
            return (
              r(0),
              requestAnimationFrame(function t() {
                var e;
                o || ((e = (a() - s) / i) < 1 ? (r(e), requestAnimationFrame(t)) : (r(1), n()));
              }),
              function () {
                ((o = !0), n.apply(null, arguments));
              }
            );
          };
        },
        { './now': 93 },
      ],
      101: [
        function (t, e, i) {
          'use strict';
          e.exports = function (t) {
            var e = typeof t;
            if ('object' == e) {
              if (null === t) return 'null';
              if ('[object Array]' === Object.prototype.toString.call(t)) return 'array';
              if ('[object RegExp]' === Object.prototype.toString.call(t)) return 'regexp';
            }
            return e;
          };
        },
        {},
      ],
      102: [
        function (t, e, i) {
          'use strict';
          var r = t('minimal-event-emitter'),
            u = t('gl-matrix').mat4,
            a = t('gl-matrix').vec4,
            o = t('../util/pixelRatio'),
            p = t('../util/real'),
            f = t('../util/clamp'),
            n = t('../util/clearOwnProperties'),
            l = [1, 0, 1, 0],
            c = [-1, -1, 1, 1];
          function s(t, e) {
            if (!t || null == t.mediaAspectRatio)
              throw new Error('mediaAspectRatio must be defined');
            ((this._x = t && null != t.x ? t.x : 0.5),
              (this._y = t && null != t.y ? t.y : 0.5),
              (this._zoom = t && null != t.zoom ? t.zoom : 1),
              (this._mediaAspectRatio = t.mediaAspectRatio),
              (this._width = t && null != t.width ? t.width : 0),
              (this._height = t && null != t.height ? t.height : 0),
              (this._limiter = e || null),
              (this._projMatrix = u.create()),
              (this._invProjMatrix = u.create()),
              (this._frustum = [0, 0, 0, 0]),
              (this._projectionChanged = !0),
              (this._params = {}),
              (this._vec = a.create()),
              this._update());
          }
          (r(s),
            (s.prototype.destroy = function () {
              n(this);
            }),
            (s.prototype.x = function () {
              return this._x;
            }),
            (s.prototype.y = function () {
              return this._y;
            }),
            (s.prototype.zoom = function () {
              return this._zoom;
            }),
            (s.prototype.mediaAspectRatio = function () {
              return this._mediaAspectRatio;
            }),
            (s.prototype.width = function () {
              return this._width;
            }),
            (s.prototype.height = function () {
              return this._height;
            }),
            (s.prototype.size = function (t) {
              return (((t = t || {}).width = this._width), (t.height = this._height), t);
            }),
            (s.prototype.parameters = function (t) {
              return (
                ((t = t || {}).x = this._x),
                (t.y = this._y),
                (t.zoom = this._zoom),
                (t.mediaAspectRatio = this._mediaAspectRatio),
                t
              );
            }),
            (s.prototype.limiter = function () {
              return this._limiter;
            }),
            (s.prototype.setX = function (t) {
              (this._resetParams(), (this._params.x = t), this._update(this._params));
            }),
            (s.prototype.setY = function (t) {
              (this._resetParams(), (this._params.y = t), this._update(this._params));
            }),
            (s.prototype.setZoom = function (t) {
              (this._resetParams(), (this._params.zoom = t), this._update(this._params));
            }),
            (s.prototype.offsetX = function (t) {
              this.setX(this._x + t);
            }),
            (s.prototype.offsetY = function (t) {
              this.setY(this._y + t);
            }),
            (s.prototype.offsetZoom = function (t) {
              this.setZoom(this._zoom + t);
            }),
            (s.prototype.setMediaAspectRatio = function (t) {
              (this._resetParams(),
                (this._params.mediaAspectRatio = t),
                this._update(this._params));
            }),
            (s.prototype.setSize = function (t) {
              (this._resetParams(),
                (this._params.width = t.width),
                (this._params.height = t.height),
                this._update(this._params));
            }),
            (s.prototype.setParameters = function (t) {
              (this._resetParams(),
                (this._params.x = t.x),
                (this._params.y = t.y),
                (this._params.zoom = t.zoom),
                (this._params.mediaAspectRatio = t.mediaAspectRatio),
                this._update(this._params));
            }),
            (s.prototype.setLimiter = function (t) {
              ((this._limiter = t || null), this._update());
            }),
            (s.prototype._resetParams = function () {
              var t = this._params;
              ((t.x = null),
                (t.y = null),
                (t.zoom = null),
                (t.mediaAspectRatio = null),
                (t.width = null),
                (t.height = null));
            }),
            (s.prototype._update = function (t) {
              null == t && (this._resetParams(), (t = this._params));
              var e = this._x,
                i = this._y,
                r = this._zoom,
                n = this._mediaAspectRatio,
                o = this._width,
                s = this._height;
              if (
                ((t.x = null != t.x ? t.x : e),
                (t.y = null != t.y ? t.y : i),
                (t.zoom = null != t.zoom ? t.zoom : r),
                (t.mediaAspectRatio = null != t.mediaAspectRatio ? t.mediaAspectRatio : n),
                (t.width = null != t.width ? t.width : o),
                (t.height = null != t.height ? t.height : s),
                this._limiter && !(t = this._limiter(t)))
              )
                throw new Error('Bad view limiter');
              var a = t.x,
                h = t.y,
                u = t.zoom,
                l = t.mediaAspectRatio,
                c = t.width,
                t = t.height;
              if (!(p(a) && p(h) && p(u) && p(l) && p(c) && p(t)))
                throw new Error('Bad view - suspect a broken limiter');
              ((u = f(u, 1e-6, 1 / 0)),
                (this._x = a),
                (this._y = h),
                (this._zoom = u),
                (this._mediaAspectRatio = l),
                (this._width = c),
                (this._height = t),
                (a === e && h === i && u === r && l === n && c === o && t === s) ||
                  ((this._projectionChanged = !0), this.emit('change')),
                (c === o && t === s) || this.emit('resize'));
            }),
            (s.prototype._zoomX = function () {
              return this._zoom;
            }),
            (s.prototype._zoomY = function () {
              var t = this._mediaAspectRatio,
                e = this._width / this._height,
                i = this._zoom,
                e = (i * t) / e;
              return (isNaN(e) && (e = i), e);
            }),
            (s.prototype.updateWithControlParameters = function (t) {
              var e = this.zoom(),
                i = this._zoomX(),
                r = this._zoomY();
              (this.offsetX(t.axisScaledX * i + t.x * e),
                this.offsetY(t.axisScaledY * r + t.y * e),
                this.offsetZoom(t.zoom * e));
            }),
            (s.prototype._updateProjection = function () {
              var t,
                e,
                i,
                r,
                n,
                o,
                s = this._projMatrix,
                a = this._invProjMatrix,
                h = this._frustum;
              this._projectionChanged &&
                ((t = this._x),
                (e = this._y),
                (o = this._zoomX()),
                (n = this._zoomY()),
                (i = h[0] = 0.5 - e + 0.5 * n),
                (r = h[1] = t - 0.5 + 0.5 * o),
                (n = h[2] = 0.5 - e - 0.5 * n),
                (o = h[3] = t - 0.5 - 0.5 * o),
                u.ortho(s, o, r, n, i, -1, 1),
                u.invert(a, s),
                (this._projectionChanged = !1));
            }),
            (s.prototype.projection = function () {
              return (this._updateProjection(), this._projMatrix);
            }),
            (s.prototype.inverseProjection = function () {
              return (this._updateProjection(), this._invProjMatrix);
            }),
            (s.prototype.intersects = function (t) {
              this._updateProjection();
              for (var e = this._frustum, i = 0; i < e.length; i++) {
                for (var r = e[i], n = l[i], o = c[i], s = !1, a = 0; a < t.length; a++) {
                  var h = t[a];
                  if ((o < 0 && h[n] < r) || (0 < o && h[n] > r)) {
                    s = !0;
                    break;
                  }
                }
                if (!s) return !1;
              }
              return !0;
            }),
            (s.prototype.selectLevel = function (t) {
              for (var e = o() * this.width(), i = this._zoom, r = 0; r < t.length; r++) {
                var n = t[r];
                if (i * n.width() >= e) return n;
              }
              return t[t.length - 1];
            }),
            (s.prototype.coordinatesToScreen = function (t, e) {
              var i = this._vec;
              e = e || {};
              var r = this._width,
                n = this._height;
              if (r <= 0 || n <= 0) return ((e.x = null), (e.y = null));
              var o = t && null != t.x ? t.x : 0.5,
                t = t && null != t.y ? t.y : 0.5;
              (a.set(i, o - 0.5, 0.5 - t, -1, 1), a.transformMat4(i, i, this.projection()));
              for (var s = 0; s < 3; s++) i[s] /= i[3];
              return ((e.x = (r * (i[0] + 1)) / 2), (e.y = (n * (1 - i[1])) / 2), e);
            }),
            (s.prototype.screenToCoordinates = function (t, e) {
              var i = this._vec;
              e = e || {};
              var r = this._width,
                n = this._height,
                r = (2 * t.x) / r - 1,
                n = 1 - (2 * t.y) / n;
              return (
                a.set(i, r, n, 1, 1),
                a.transformMat4(i, i, this.inverseProjection()),
                (e.x = 0.5 + i[0]),
                (e.y = 0.5 - i[1]),
                e
              );
            }),
            (s.limit = {
              x: function (e, i) {
                return function (t) {
                  return ((t.x = f(t.x, e, i)), t);
                };
              },
              y: function (e, i) {
                return function (t) {
                  return ((t.y = f(t.y, e, i)), t);
                };
              },
              zoom: function (e, i) {
                return function (t) {
                  return ((t.zoom = f(t.zoom, e, i)), t);
                };
              },
              resolution: function (i) {
                return function (t) {
                  if (t.width <= 0 || t.height <= 0) return t;
                  var e = t.width,
                    e = (o() * e) / i;
                  return ((t.zoom = f(t.zoom, e, 1 / 0)), t);
                };
              },
              visibleX: function (r, n) {
                return function (t) {
                  var e = n - r;
                  t.zoom > e && (t.zoom = e);
                  var i = r + 0.5 * t.zoom,
                    e = n - 0.5 * t.zoom;
                  return ((t.x = f(t.x, i, e)), t);
                };
              },
              visibleY: function (r, n) {
                return function (t) {
                  if (t.width <= 0 || t.height <= 0) return t;
                  var e = t.width / t.height / t.mediaAspectRatio,
                    i = (n - r) * e;
                  t.zoom > i && (t.zoom = i);
                  ((i = r + (0.5 * t.zoom) / e), (e = n - (0.5 * t.zoom) / e));
                  return ((t.y = f(t.y, i, e)), t);
                };
              },
              letterbox: function () {
                return function (t) {
                  if (t.width <= 0 || t.height <= 0) return t;
                  var e,
                    i,
                    r,
                    n,
                    o = t.width / t.height,
                    s = o / t.mediaAspectRatio;
                  return (
                    t.mediaAspectRatio >= o && (t.zoom = Math.min(t.zoom, 1)),
                    t.mediaAspectRatio <= o && (t.zoom = Math.min(t.zoom, s)),
                    1 < t.zoom ? (e = i = 0.5) : ((e = 0 + 0.5 * t.zoom), (i = 1 - 0.5 * t.zoom)),
                    t.zoom > s
                      ? (r = n = 0.5)
                      : ((r = 0 + (0.5 * t.zoom) / s), (n = 1 - (0.5 * t.zoom) / s)),
                    (t.x = f(t.x, e, i)),
                    (t.y = f(t.y, r, n)),
                    t
                  );
                };
              },
            }),
            (s.type = s.prototype.type = 'flat'),
            (e.exports = s));
        },
        {
          '../util/clamp': 75,
          '../util/clearOwnProperties': 76,
          '../util/pixelRatio': 95,
          '../util/real': 98,
          'gl-matrix': 3,
          'minimal-event-emitter': 14,
        },
      ],
      103: [
        function (t, e, i) {
          'use strict';
          var r = t('minimal-event-emitter'),
            u = t('gl-matrix').mat4,
            h = t('gl-matrix').vec4,
            o = t('../util/pixelRatio'),
            l = t('../util/convertFov'),
            n = t('../util/mod'),
            v = t('../util/real'),
            s = t('../util/clamp'),
            a = t('../util/decimal'),
            c = t('../util/compose'),
            p = t('../util/clearOwnProperties'),
            f = Math.PI / 4;
          function d(t, e) {
            ((this._yaw = t && null != t.yaw ? t.yaw : 0),
              (this._pitch = t && null != t.pitch ? t.pitch : 0),
              (this._roll = t && null != t.roll ? t.roll : 0),
              (this._fov = t && null != t.fov ? t.fov : f),
              (this._width = t && null != t.width ? t.width : 0),
              (this._height = t && null != t.height ? t.height : 0),
              (this._projectionCenterX =
                t && null != t.projectionCenterX ? t.projectionCenterX : 0),
              (this._projectionCenterY =
                t && null != t.projectionCenterY ? t.projectionCenterY : 0),
              (this._limiter = e || null),
              (this._projMatrix = u.create()),
              (this._invProjMatrix = u.create()),
              (this._frustum = [h.create(), h.create(), h.create(), h.create(), h.create()]),
              (this._projectionChanged = !0),
              (this._params = {}),
              (this._fovs = {}),
              (this._tmpVec = h.create()),
              this._update());
          }
          (r(d),
            (d.prototype.destroy = function () {
              p(this);
            }),
            (d.prototype.yaw = function () {
              return this._yaw;
            }),
            (d.prototype.pitch = function () {
              return this._pitch;
            }),
            (d.prototype.roll = function () {
              return this._roll;
            }),
            (d.prototype.projectionCenterX = function () {
              return this._projectionCenterX;
            }),
            (d.prototype.projectionCenterY = function () {
              return this._projectionCenterY;
            }),
            (d.prototype.fov = function () {
              return this._fov;
            }),
            (d.prototype.width = function () {
              return this._width;
            }),
            (d.prototype.height = function () {
              return this._height;
            }),
            (d.prototype.size = function (t) {
              return (((t = t || {}).width = this._width), (t.height = this._height), t);
            }),
            (d.prototype.parameters = function (t) {
              return (
                ((t = t || {}).yaw = this._yaw),
                (t.pitch = this._pitch),
                (t.roll = this._roll),
                (t.fov = this._fov),
                t
              );
            }),
            (d.prototype.limiter = function () {
              return this._limiter;
            }),
            (d.prototype.setYaw = function (t) {
              (this._resetParams(), (this._params.yaw = t), this._update(this._params));
            }),
            (d.prototype.setPitch = function (t) {
              (this._resetParams(), (this._params.pitch = t), this._update(this._params));
            }),
            (d.prototype.setRoll = function (t) {
              (this._resetParams(), (this._params.roll = t), this._update(this._params));
            }),
            (d.prototype.setFov = function (t) {
              (this._resetParams(), (this._params.fov = t), this._update(this._params));
            }),
            (d.prototype.setProjectionCenterX = function (t) {
              (this._resetParams(),
                (this._params.projectionCenterX = t),
                this._update(this._params));
            }),
            (d.prototype.setProjectionCenterY = function (t) {
              (this._resetParams(),
                (this._params.projectionCenterY = t),
                this._update(this._params));
            }),
            (d.prototype.offsetYaw = function (t) {
              this.setYaw(this._yaw + t);
            }),
            (d.prototype.offsetPitch = function (t) {
              this.setPitch(this._pitch + t);
            }),
            (d.prototype.offsetRoll = function (t) {
              this.setRoll(this._roll + t);
            }),
            (d.prototype.offsetFov = function (t) {
              this.setFov(this._fov + t);
            }),
            (d.prototype.setSize = function (t) {
              (this._resetParams(),
                (this._params.width = t.width),
                (this._params.height = t.height),
                this._update(this._params));
            }),
            (d.prototype.setParameters = function (t) {
              (this._resetParams(),
                (this._params.yaw = t.yaw),
                (this._params.pitch = t.pitch),
                (this._params.roll = t.roll),
                (this._params.fov = t.fov),
                (this._params.projectionCenterX = t.projectionCenterX),
                (this._params.projectionCenterY = t.projectionCenterY),
                this._update(this._params));
            }),
            (d.prototype.setLimiter = function (t) {
              ((this._limiter = t || null), this._update());
            }),
            (d.prototype._resetParams = function () {
              var t = this._params;
              ((t.yaw = null),
                (t.pitch = null),
                (t.roll = null),
                (t.fov = null),
                (t.width = null),
                (t.height = null));
            }),
            (d.prototype._update = function (t) {
              null == t && (this._resetParams(), (t = this._params));
              var e = this._yaw,
                i = this._pitch,
                r = this._roll,
                n = this._fov,
                o = this._projectionCenterX,
                s = this._projectionCenterY,
                a = this._width,
                h = this._height;
              if (
                ((t.yaw = null != t.yaw ? t.yaw : e),
                (t.pitch = null != t.pitch ? t.pitch : i),
                (t.roll = null != t.roll ? t.roll : r),
                (t.fov = null != t.fov ? t.fov : n),
                (t.width = null != t.width ? t.width : a),
                (t.height = null != t.height ? t.height : h),
                (t.projectionCenterX = null != t.projectionCenterX ? t.projectionCenterX : o),
                (t.projectionCenterY = null != t.projectionCenterY ? t.projectionCenterY : s),
                this._limiter && !(t = this._limiter(t)))
              )
                throw new Error('Bad view limiter');
              var u = (t = this._normalize(t)).yaw,
                l = t.pitch,
                c = t.roll,
                p = t.fov,
                f = t.width,
                d = t.height,
                m = t.projectionCenterX,
                t = t.projectionCenterY;
              if (!(v(u) && v(l) && v(c) && v(p) && v(f) && v(d) && v(m) && v(t)))
                throw new Error('Bad view - suspect a broken limiter');
              ((this._yaw = u),
                (this._pitch = l),
                (this._roll = c),
                (this._fov = p),
                (this._width = f),
                (this._height = d),
                (this._projectionCenterX = m),
                (this._projectionCenterY = t),
                (u === e &&
                  l === i &&
                  c === r &&
                  p === n &&
                  f === a &&
                  d === h &&
                  m === o &&
                  t === s) ||
                  ((this._projectionChanged = !0), this.emit('change')),
                (f === a && d === h) || this.emit('resize'));
            }),
            (d.prototype._normalize = function (t) {
              this._normalizeCoordinates(t);
              var e = l.htov(Math.PI, t.width, t.height),
                e = isNaN(e) ? Math.PI : Math.min(Math.PI, e);
              return ((t.fov = s(t.fov, 1e-6, e - 1e-6)), t);
            }),
            (d.prototype._normalizeCoordinates = function (t) {
              return (
                'yaw' in t && (t.yaw = n(t.yaw - Math.PI, -2 * Math.PI) + Math.PI),
                'pitch' in t && (t.pitch = n(t.pitch - Math.PI, -2 * Math.PI) + Math.PI),
                'roll' in t && (t.roll = n(t.roll - Math.PI, -2 * Math.PI) + Math.PI),
                t
              );
            }),
            (d.prototype.normalizeToClosest = function (t, e) {
              var i = this._yaw,
                r = this._pitch,
                n = t.yaw,
                o = t.pitch,
                s = n - 2 * Math.PI,
                t = n + 2 * Math.PI;
              Math.abs(s - i) < Math.abs(n - i)
                ? (n = s)
                : Math.abs(t - i) < Math.abs(n - i) && (n = t);
              ((i = o - 2 * Math.PI), (t = o + 2 * Math.PI));
              return (
                Math.abs(i - r) < Math.abs(o - r)
                  ? (o = i)
                  : Math.abs(i - r) < Math.abs(o - r) && (o = t),
                ((e = e || {}).yaw = n),
                (e.pitch = o),
                e
              );
            }),
            (d.prototype.updateWithControlParameters = function (t) {
              var e = this._fov,
                i = l.vtoh(e, this._width, this._height);
              (isNaN(i) && (i = e),
                this.offsetYaw(t.axisScaledX * i + 2 * t.x * i + t.yaw),
                this.offsetPitch(t.axisScaledY * e + 2 * t.y * i + t.pitch),
                this.offsetRoll(-t.roll),
                this.offsetFov(t.zoom * e));
            }),
            (d.prototype._updateProjection = function () {
              var t,
                e,
                i,
                r,
                n,
                o,
                s = this._projMatrix,
                a = this._invProjMatrix,
                h = this._frustum;
              this._projectionChanged &&
                ((o = this._width),
                (r = this._height),
                (t = this._fov),
                (e = l.vtoh(t, o, r)),
                (i = o / r),
                (n = this._projectionCenterX),
                (o = this._projectionCenterY),
                0 !== n || 0 !== o
                  ? ((r = Math.atan(2 * n * Math.tan(e / 2))),
                    (n = Math.atan(2 * o * Math.tan(t / 2))),
                    ((o = this._fovs).leftDegrees = (180 * (e / 2 + r)) / Math.PI),
                    (o.rightDegrees = (180 * (e / 2 - r)) / Math.PI),
                    (o.upDegrees = (180 * (t / 2 + n)) / Math.PI),
                    (o.downDegrees = (180 * (t / 2 - n)) / Math.PI),
                    u.perspectiveFromFieldOfView(s, o, -1, 1))
                  : u.perspective(s, t, i, -1, 1),
                u.rotateZ(s, s, this._roll),
                u.rotateX(s, s, this._pitch),
                u.rotateY(s, s, this._yaw),
                u.invert(a, s),
                this._matrixToFrustum(s, h),
                (this._projectionChanged = !1));
            }),
            (d.prototype._matrixToFrustum = function (t, e) {
              (h.set(e[0], t[3] + t[0], t[7] + t[4], t[11] + t[8], 0),
                h.set(e[1], t[3] - t[0], t[7] - t[4], t[11] - t[8], 0),
                h.set(e[2], t[3] + t[1], t[7] + t[5], t[11] + t[9], 0),
                h.set(e[3], t[3] - t[1], t[7] - t[5], t[11] - t[9], 0),
                h.set(e[4], t[3] + t[2], t[7] + t[6], t[11] + t[10], 0));
            }),
            (d.prototype.projection = function () {
              return (this._updateProjection(), this._projMatrix);
            }),
            (d.prototype.inverseProjection = function () {
              return (this._updateProjection(), this._invProjMatrix);
            }),
            (d.prototype.intersects = function (t) {
              this._updateProjection();
              for (var e = this._frustum, i = this._tmpVec, r = 0; r < e.length; r++) {
                for (var n = e[r], o = !1, s = 0; s < t.length; s++) {
                  var a = t[s];
                  (h.set(i, a[0], a[1], a[2], 0), 0 <= h.dot(n, i) && (o = !0));
                }
                if (!o) return !1;
              }
              return !0;
            }),
            (d.prototype.selectLevel = function (t) {
              for (
                var e = o() * this._height, i = Math.tan(0.5 * this._fov), r = 0;
                r < t.length;
                r++
              ) {
                var n = t[r];
                if (i * n.height() >= e) return n;
              }
              return t[t.length - 1];
            }),
            (d.prototype.coordinatesToScreen = function (t, e) {
              var i = this._tmpVec;
              e = e || {};
              var r = this._width,
                n = this._height;
              if (r <= 0 || n <= 0) return ((e.x = null), (e.y = null));
              var o = t.yaw,
                s = t.pitch,
                a = Math.sin(o) * Math.cos(s),
                t = -Math.sin(s),
                s = -Math.cos(o) * Math.cos(s);
              return (
                h.set(i, a, t, s, 1),
                h.transformMat4(i, i, this.projection()),
                0 <= i[3]
                  ? ((e.x = (r * (i[0] / i[3] + 1)) / 2), (e.y = (n * (1 - i[1] / i[3])) / 2), e)
                  : ((e.x = null), (e.y = null))
              );
            }),
            (d.prototype.screenToCoordinates = function (t, e) {
              var i = this._tmpVec;
              e = e || {};
              var r = this._width,
                n = this._height,
                r = (2 * t.x) / r - 1,
                n = 1 - (2 * t.y) / n;
              (h.set(i, r, n, 1, 1), h.transformMat4(i, i, this.inverseProjection()));
              n = Math.sqrt(i[0] * i[0] + i[1] * i[1] + i[2] * i[2]);
              return (
                (e.yaw = Math.atan2(i[0], -i[2])),
                (e.pitch = Math.acos(i[1] / n) - Math.PI / 2),
                this._normalizeCoordinates(e),
                e
              );
            }),
            (d.prototype.coordinatesToPerspectiveTransform = function (t, e, i) {
              i = i || '';
              var r = this._height,
                n = this._width,
                o = this._fov,
                s = (0.5 * r) / Math.tan(o / 2),
                o = '';
              return (
                (o += 'translateX(' + a(n / 2) + 'px) '),
                (o += 'translateY(' + a(r / 2) + 'px) '),
                (o += 'translateX(-50%) translateY(-50%) '),
                (o += 'perspective(' + a(s) + 'px) '),
                (o += 'translateZ(' + a(s) + 'px) '),
                (o += 'rotateZ(' + a(-this._roll) + 'rad) '),
                (o += 'rotateX(' + a(-this._pitch) + 'rad) '),
                (o += 'rotateY(' + a(this._yaw) + 'rad) '),
                (o += 'rotateY(' + a(-t.yaw) + 'rad) '),
                (o += 'rotateX(' + a(t.pitch) + 'rad) '),
                (o += 'translateZ(' + a(-e) + 'px) '),
                (o += i + ' ')
              );
            }),
            (d.limit = {
              yaw: function (e, i) {
                return function (t) {
                  return ((t.yaw = s(t.yaw, e, i)), t);
                };
              },
              pitch: function (e, i) {
                return function (t) {
                  return ((t.pitch = s(t.pitch, e, i)), t);
                };
              },
              roll: function (e, i) {
                return function (t) {
                  return ((t.roll = s(t.roll, e, i)), t);
                };
              },
              hfov: function (n, o) {
                return function (t) {
                  var e,
                    i = t.width,
                    r = t.height;
                  return (
                    0 < i &&
                      0 < r &&
                      ((e = l.htov(n, i, r)), (r = l.htov(o, i, r)), (t.fov = s(t.fov, e, r))),
                    t
                  );
                };
              },
              vfov: function (e, i) {
                return function (t) {
                  return ((t.fov = s(t.fov, e, i)), t);
                };
              },
              resolution: function (i) {
                return function (t) {
                  var e = t.height;
                  return (
                    e && ((e = o() * e), (e = 2 * Math.atan(e / i)), (t.fov = s(t.fov, e, 1 / 0))),
                    t
                  );
                };
              },
              traditional: function (t, e, i) {
                return (
                  (i = null != i ? i : e),
                  c(
                    d.limit.resolution(t),
                    d.limit.vfov(0, e),
                    d.limit.hfov(0, i),
                    d.limit.pitch(-Math.PI / 2, Math.PI / 2)
                  )
                );
              },
            }),
            (d.type = d.prototype.type = 'rectilinear'),
            (e.exports = d));
        },
        {
          '../util/clamp': 75,
          '../util/clearOwnProperties': 76,
          '../util/compose': 78,
          '../util/convertFov': 79,
          '../util/decimal': 80,
          '../util/mod': 91,
          '../util/pixelRatio': 95,
          '../util/real': 98,
          'gl-matrix': 3,
          'minimal-event-emitter': 14,
        },
      ],
    },
    {},
    [54]
  )(54);
});
