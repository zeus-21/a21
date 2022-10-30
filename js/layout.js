var CryptoJS = CryptoJS || function(c, e) {
    var f = {},
        b = f.lib = {},
        h = function() {},
        y = b.Base = {
            extend: function(g) {
                h.prototype = this;
                var p = new h;
                g && p.mixIn(g);
                p.hasOwnProperty("init") || (p.init = function() {
                    p.$super.init.apply(this, arguments)
                });
                p.init.prototype = p;
                p.$super = this;
                return p
            },
            create: function() {
                var g = this.extend();
                g.init.apply(g, arguments);
                return g
            },
            init: function() {},
            mixIn: function(g) {
                for (var p in g) g.hasOwnProperty(p) && (this[p] = g[p]);
                g.hasOwnProperty("toString") && (this.toString = g.toString)
            },
            clone: function() {
                return this.init.prototype.extend(this)
            }
        },
        l = b.WordArray = y.extend({
            init: function(g, p) {
                g = this.words = g || [];
                this.sigBytes = p != e ? p : 4 * g.length
            },
            toString: function(g) {
                return (g || a).stringify(this)
            },
            concat: function(g) {
                var p = this.words,
                    d = g.words,
                    k = this.sigBytes;
                g = g.sigBytes;
                this.clamp();
                if (k % 4)
                    for (var n = 0; n < g; n++) p[k + n >>> 2] |= (d[n >>> 2] >>> 24 - n % 4 * 8 & 255) << 24 - (k + n) % 4 * 8;
                else if (65535 < d.length)
                    for (n = 0; n < g; n += 4) p[k + n >>> 2] = d[n >>> 2];
                else p.push.apply(p, d);
                this.sigBytes += g;
                return this
            },
            clamp: function() {
                var g = this.words,
                    p = this.sigBytes;
                g[p >>> 2] &= 4294967295 << 32 -
                    p % 4 * 8;
                g.length = c.ceil(p / 4)
            },
            clone: function() {
                var g = y.clone.call(this);
                g.words = this.words.slice(0);
                return g
            },
            random: function(g) {
                for (var p = [], d = 0; d < g; d += 4) p.push(4294967296 * c.random() | 0);
                return new l.init(p, g)
            }
        }),
        B = f.enc = {},
        a = B.Hex = {
            stringify: function(g) {
                var p = g.words;
                g = g.sigBytes;
                for (var d = [], k = 0; k < g; k++) {
                    var n = p[k >>> 2] >>> 24 - k % 4 * 8 & 255;
                    d.push((n >>> 4).toString(16));
                    d.push((n & 15).toString(16))
                }
                return d.join("")
            },
            parse: function(g) {
                for (var p = g.length, d = [], k = 0; k < p; k += 2) d[k >>> 3] |= parseInt(g.substr(k, 2), 16) <<
                    24 - k % 8 * 4;
                return new l.init(d, p / 2)
            }
        },
        m = B.Latin1 = {
            stringify: function(g) {
                var p = g.words;
                g = g.sigBytes;
                for (var d = [], k = 0; k < g; k++) d.push(String.fromCharCode(p[k >>> 2] >>> 24 - k % 4 * 8 & 255));
                return d.join("")
            },
            parse: function(g) {
                for (var p = g.length, d = [], k = 0; k < p; k++) d[k >>> 2] |= (g.charCodeAt(k) & 255) << 24 - k % 4 * 8;
                return new l.init(d, p)
            }
        },
        z = B.Utf8 = {
            stringify: function(g) {
                try {
                    return decodeURIComponent(escape(m.stringify(g)))
                } catch (p) {
                    throw Error("Malformed UTF-8 data");
                }
            },
            parse: function(g) {
                return m.parse(unescape(encodeURIComponent(g)))
            }
        },
        u = b.BufferedBlockAlgorithm = y.extend({
            reset: function() {
                this._data = new l.init;
                this._nDataBytes = 0
            },
            _append: function(g) {
                "string" == typeof g && (g = z.parse(g));
                this._data.concat(g);
                this._nDataBytes += g.sigBytes
            },
            _process: function(g) {
                var p = this._data,
                    d = p.words,
                    k = p.sigBytes,
                    n = this.blockSize,
                    x = k / (4 * n);
                x = g ? c.ceil(x) : c.max((x | 0) - this._minBufferSize, 0);
                g = x * n;
                k = c.min(4 * g, k);
                if (g) {
                    for (var A = 0; A < g; A += n) this._doProcessBlock(d, A);
                    A = d.splice(0, g);
                    p.sigBytes -= k
                }
                return new l.init(A, k)
            },
            clone: function() {
                var g = y.clone.call(this);
                g._data = this._data.clone();
                return g
            },
            _minBufferSize: 0
        });
    b.Hasher = u.extend({
        cfg: y.extend(),
        init: function(g) {
            this.cfg = this.cfg.extend(g);
            this.reset()
        },
        reset: function() {
            u.reset.call(this);
            this._doReset()
        },
        update: function(g) {
            this._append(g);
            this._process();
            return this
        },
        finalize: function(g) {
            g && this._append(g);
            return this._doFinalize()
        },
        blockSize: 16,
        _createHelper: function(g) {
            return function(p, d) {
                return (new g.init(d)).finalize(p)
            }
        },
        _createHmacHelper: function(g) {
            return function(p, d) {
                return (new w.HMAC.init(g,
                    d)).finalize(p)
            }
        }
    });
    var w = f.algo = {};
    return f
}(Math);
(function() {
    var c = CryptoJS,
        e = c.lib.WordArray;
    c.enc.Base64 = {
        stringify: function(f) {
            var b = f.words,
                h = f.sigBytes,
                y = this._map;
            f.clamp();
            f = [];
            for (var l = 0; l < h; l += 3)
                for (var B = (b[l >>> 2] >>> 24 - l % 4 * 8 & 255) << 16 | (b[l + 1 >>> 2] >>> 24 - (l + 1) % 4 * 8 & 255) << 8 | b[l + 2 >>> 2] >>> 24 - (l + 2) % 4 * 8 & 255, a = 0; 4 > a && l + .75 * a < h; a++) f.push(y.charAt(B >>> 6 * (3 - a) & 63));
            if (b = y.charAt(64))
                for (; f.length % 4;) f.push(b);
            return f.join("")
        },
        parse: function(f) {
            var b = f.length,
                h = this._map,
                y = h.charAt(64);
            y && (y = f.indexOf(y), -1 != y && (b = y));
            y = [];
            for (var l = 0, B = 0; B < b; B++)
                if (B %
                    4) {
                    var a = h.indexOf(f.charAt(B - 1)) << B % 4 * 2,
                        m = h.indexOf(f.charAt(B)) >>> 6 - B % 4 * 2;
                    y[l >>> 2] |= (a | m) << 24 - l % 4 * 8;
                    l++
                } return e.create(y, l)
        },
        _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
    }
})();
(function(c) {
    function e(u, w, g, p, d, k, n) {
        u = u + (w & g | ~w & p) + d + n;
        return (u << k | u >>> 32 - k) + w
    }

    function f(u, w, g, p, d, k, n) {
        u = u + (w & p | g & ~p) + d + n;
        return (u << k | u >>> 32 - k) + w
    }

    function b(u, w, g, p, d, k, n) {
        u = u + (w ^ g ^ p) + d + n;
        return (u << k | u >>> 32 - k) + w
    }

    function h(u, w, g, p, d, k, n) {
        u = u + (g ^ (w | ~p)) + d + n;
        return (u << k | u >>> 32 - k) + w
    }
    var y = CryptoJS,
        l = y.lib,
        B = l.WordArray,
        a = l.Hasher;
    l = y.algo;
    for (var m = [], z = 0; 64 > z; z++) m[z] = 4294967296 * c.abs(c.sin(z + 1)) | 0;
    l = l.MD5 = a.extend({
        _doReset: function() {
            this._hash = new B.init([1732584193, 4023233417, 2562383102, 271733878])
        },
        _doProcessBlock: function(u, w) {
            for (var g = 0; 16 > g; g++) {
                var p = w + g,
                    d = u[p];
                u[p] = (d << 8 | d >>> 24) & 16711935 | (d << 24 | d >>> 8) & 4278255360
            }
            g = this._hash.words;
            p = u[w + 0];
            d = u[w + 1];
            var k = u[w + 2],
                n = u[w + 3],
                x = u[w + 4],
                A = u[w + 5],
                I = u[w + 6],
                G = u[w + 7],
                O = u[w + 8],
                D = u[w + 9],
                F = u[w + 10],
                C = u[w + 11],
                J = u[w + 12],
                H = u[w + 13],
                E = u[w + 14],
                L = u[w + 15],
                q = g[0],
                v = g[1],
                r = g[2],
                t = g[3];
            q = e(q, v, r, t, p, 7, m[0]);
            t = e(t, q, v, r, d, 12, m[1]);
            r = e(r, t, q, v, k, 17, m[2]);
            v = e(v, r, t, q, n, 22, m[3]);
            q = e(q, v, r, t, x, 7, m[4]);
            t = e(t, q, v, r, A, 12, m[5]);
            r = e(r, t, q, v, I, 17, m[6]);
            v = e(v, r, t, q, G, 22, m[7]);
            q = e(q, v, r, t, O, 7, m[8]);
            t = e(t, q, v, r, D, 12, m[9]);
            r = e(r, t, q, v, F, 17, m[10]);
            v = e(v, r, t, q, C, 22, m[11]);
            q = e(q, v, r, t, J, 7, m[12]);
            t = e(t, q, v, r, H, 12, m[13]);
            r = e(r, t, q, v, E, 17, m[14]);
            v = e(v, r, t, q, L, 22, m[15]);
            q = f(q, v, r, t, d, 5, m[16]);
            t = f(t, q, v, r, I, 9, m[17]);
            r = f(r, t, q, v, C, 14, m[18]);
            v = f(v, r, t, q, p, 20, m[19]);
            q = f(q, v, r, t, A, 5, m[20]);
            t = f(t, q, v, r, F, 9, m[21]);
            r = f(r, t, q, v, L, 14, m[22]);
            v = f(v, r, t, q, x, 20, m[23]);
            q = f(q, v, r, t, D, 5, m[24]);
            t = f(t, q, v, r, E, 9, m[25]);
            r = f(r, t, q, v, n, 14, m[26]);
            v = f(v, r, t, q, O, 20, m[27]);
            q = f(q, v, r, t, H, 5, m[28]);
            t = f(t, q,
                v, r, k, 9, m[29]);
            r = f(r, t, q, v, G, 14, m[30]);
            v = f(v, r, t, q, J, 20, m[31]);
            q = b(q, v, r, t, A, 4, m[32]);
            t = b(t, q, v, r, O, 11, m[33]);
            r = b(r, t, q, v, C, 16, m[34]);
            v = b(v, r, t, q, E, 23, m[35]);
            q = b(q, v, r, t, d, 4, m[36]);
            t = b(t, q, v, r, x, 11, m[37]);
            r = b(r, t, q, v, G, 16, m[38]);
            v = b(v, r, t, q, F, 23, m[39]);
            q = b(q, v, r, t, H, 4, m[40]);
            t = b(t, q, v, r, p, 11, m[41]);
            r = b(r, t, q, v, n, 16, m[42]);
            v = b(v, r, t, q, I, 23, m[43]);
            q = b(q, v, r, t, D, 4, m[44]);
            t = b(t, q, v, r, J, 11, m[45]);
            r = b(r, t, q, v, L, 16, m[46]);
            v = b(v, r, t, q, k, 23, m[47]);
            q = h(q, v, r, t, p, 6, m[48]);
            t = h(t, q, v, r, G, 10, m[49]);
            r = h(r, t, q, v,
                E, 15, m[50]);
            v = h(v, r, t, q, A, 21, m[51]);
            q = h(q, v, r, t, J, 6, m[52]);
            t = h(t, q, v, r, n, 10, m[53]);
            r = h(r, t, q, v, F, 15, m[54]);
            v = h(v, r, t, q, d, 21, m[55]);
            q = h(q, v, r, t, O, 6, m[56]);
            t = h(t, q, v, r, L, 10, m[57]);
            r = h(r, t, q, v, I, 15, m[58]);
            v = h(v, r, t, q, H, 21, m[59]);
            q = h(q, v, r, t, x, 6, m[60]);
            t = h(t, q, v, r, C, 10, m[61]);
            r = h(r, t, q, v, k, 15, m[62]);
            v = h(v, r, t, q, D, 21, m[63]);
            g[0] = g[0] + q | 0;
            g[1] = g[1] + v | 0;
            g[2] = g[2] + r | 0;
            g[3] = g[3] + t | 0
        },
        _doFinalize: function() {
            var u = this._data,
                w = u.words,
                g = 8 * this._nDataBytes,
                p = 8 * u.sigBytes;
            w[p >>> 5] |= 128 << 24 - p % 32;
            var d = c.floor(g /
                4294967296);
            w[(p + 64 >>> 9 << 4) + 15] = (d << 8 | d >>> 24) & 16711935 | (d << 24 | d >>> 8) & 4278255360;
            w[(p + 64 >>> 9 << 4) + 14] = (g << 8 | g >>> 24) & 16711935 | (g << 24 | g >>> 8) & 4278255360;
            u.sigBytes = 4 * (w.length + 1);
            this._process();
            u = this._hash;
            w = u.words;
            for (g = 0; 4 > g; g++) p = w[g], w[g] = (p << 8 | p >>> 24) & 16711935 | (p << 24 | p >>> 8) & 4278255360;
            return u
        },
        clone: function() {
            var u = a.clone.call(this);
            u._hash = this._hash.clone();
            return u
        }
    });
    y.MD5 = a._createHelper(l);
    y.HmacMD5 = a._createHmacHelper(l)
})(Math);
(function() {
    var c = CryptoJS,
        e = c.lib,
        f = e.Base,
        b = e.WordArray;
    e = c.algo;
    var h = e.EvpKDF = f.extend({
        cfg: f.extend({
            keySize: 4,
            hasher: e.MD5,
            iterations: 1
        }),
        init: function(y) {
            this.cfg = this.cfg.extend(y)
        },
        compute: function(y, l) {
            var B = this.cfg,
                a = B.hasher.create(),
                m = b.create(),
                z = m.words,
                u = B.keySize;
            for (B = B.iterations; z.length < u;) {
                w && a.update(w);
                var w = a.update(y).finalize(l);
                a.reset();
                for (var g = 1; g < B; g++) w = a.finalize(w), a.reset();
                m.concat(w)
            }
            m.sigBytes = 4 * u;
            return m
        }
    });
    c.EvpKDF = function(y, l, B) {
        return h.create(B).compute(y,
            l)
    }
})();
CryptoJS.lib.Cipher || function(c) {
    var e = CryptoJS,
        f = e.lib,
        b = f.Base,
        h = f.WordArray,
        y = f.BufferedBlockAlgorithm,
        l = e.enc.Base64,
        B = e.algo.EvpKDF,
        a = f.Cipher = y.extend({
            cfg: b.extend(),
            createEncryptor: function(d, k) {
                return this.create(this._ENC_XFORM_MODE, d, k)
            },
            createDecryptor: function(d, k) {
                return this.create(this._DEC_XFORM_MODE, d, k)
            },
            init: function(d, k, n) {
                this.cfg = this.cfg.extend(n);
                this._xformMode = d;
                this._key = k;
                this.reset()
            },
            reset: function() {
                y.reset.call(this);
                this._doReset()
            },
            process: function(d) {
                this._append(d);
                return this._process()
            },
            finalize: function(d) {
                d && this._append(d);
                return this._doFinalize()
            },
            keySize: 4,
            ivSize: 4,
            _ENC_XFORM_MODE: 1,
            _DEC_XFORM_MODE: 2,
            _createHelper: function(d) {
                return {
                    encrypt: function(k, n, x) {
                        return ("string" == typeof n ? p : g).encrypt(d, k, n, x)
                    },
                    decrypt: function(k, n, x) {
                        return ("string" == typeof n ? p : g).decrypt(d, k, n, x)
                    }
                }
            }
        });
    f.StreamCipher = a.extend({
        _doFinalize: function() {
            return this._process(!0)
        },
        blockSize: 1
    });
    var m = e.mode = {},
        z = function(d, k, n) {
            var x = this._iv;
            x ? this._iv = c : x = this._prevBlock;
            for (var A = 0; A < n; A++) d[k + A] ^=
                x[A]
        },
        u = (f.BlockCipherMode = b.extend({
            createEncryptor: function(d, k) {
                return this.Encryptor.create(d, k)
            },
            createDecryptor: function(d, k) {
                return this.Decryptor.create(d, k)
            },
            init: function(d, k) {
                this._cipher = d;
                this._iv = k
            }
        })).extend();
    u.Encryptor = u.extend({
        processBlock: function(d, k) {
            var n = this._cipher,
                x = n.blockSize;
            z.call(this, d, k, x);
            n.encryptBlock(d, k);
            this._prevBlock = d.slice(k, k + x)
        }
    });
    u.Decryptor = u.extend({
        processBlock: function(d, k) {
            var n = this._cipher,
                x = n.blockSize,
                A = d.slice(k, k + x);
            n.decryptBlock(d, k);
            z.call(this,
                d, k, x);
            this._prevBlock = A
        }
    });
    m = m.CBC = u;
    u = (e.pad = {}).Pkcs7 = {
        pad: function(d, k) {
            var n = 4 * k;
            n -= d.sigBytes % n;
            for (var x = n << 24 | n << 16 | n << 8 | n, A = [], I = 0; I < n; I += 4) A.push(x);
            n = h.create(A, n);
            d.concat(n)
        },
        unpad: function(d) {
            d.sigBytes -= d.words[d.sigBytes - 1 >>> 2] & 255
        }
    };
    f.BlockCipher = a.extend({
        cfg: a.cfg.extend({
            mode: m,
            padding: u
        }),
        reset: function() {
            a.reset.call(this);
            var d = this.cfg,
                k = d.iv;
            d = d.mode;
            if (this._xformMode == this._ENC_XFORM_MODE) var n = d.createEncryptor;
            else n = d.createDecryptor, this._minBufferSize = 1;
            this._mode =
                n.call(d, this, k && k.words)
        },
        _doProcessBlock: function(d, k) {
            this._mode.processBlock(d, k)
        },
        _doFinalize: function() {
            var d = this.cfg.padding;
            if (this._xformMode == this._ENC_XFORM_MODE) {
                d.pad(this._data, this.blockSize);
                var k = this._process(!0)
            } else k = this._process(!0), d.unpad(k);
            return k
        },
        blockSize: 4
    });
    var w = f.CipherParams = b.extend({
        init: function(d) {
            this.mixIn(d)
        },
        toString: function(d) {
            return (d || this.formatter).stringify(this)
        }
    });
    m = (e.format = {}).OpenSSL = {
        stringify: function(d) {
            var k = d.ciphertext;
            d = d.salt;
            return (d ?
                h.create([1398893684, 1701076831]).concat(d).concat(k) : k).toString(l)
        },
        parse: function(d) {
            d = l.parse(d);
            var k = d.words;
            if (1398893684 == k[0] && 1701076831 == k[1]) {
                var n = h.create(k.slice(2, 4));
                k.splice(0, 4);
                d.sigBytes -= 16
            }
            return w.create({
                ciphertext: d,
                salt: n
            })
        }
    };
    var g = f.SerializableCipher = b.extend({
        cfg: b.extend({
            format: m
        }),
        encrypt: function(d, k, n, x) {
            x = this.cfg.extend(x);
            var A = d.createEncryptor(n, x);
            k = A.finalize(k);
            A = A.cfg;
            return w.create({
                ciphertext: k,
                key: n,
                iv: A.iv,
                algorithm: d,
                mode: A.mode,
                padding: A.padding,
                blockSize: d.blockSize,
                formatter: x.format
            })
        },
        decrypt: function(d, k, n, x) {
            x = this.cfg.extend(x);
            k = this._parse(k, x.format);
            return d.createDecryptor(n, x).finalize(k.ciphertext)
        },
        _parse: function(d, k) {
            return "string" == typeof d ? k.parse(d, this) : d
        }
    });
    e = (e.kdf = {}).OpenSSL = {
        execute: function(d, k, n, x) {
            x || (x = h.random(8));
            d = B.create({
                keySize: k + n
            }).compute(d, x);
            n = h.create(d.words.slice(k), 4 * n);
            d.sigBytes = 4 * k;
            return w.create({
                key: d,
                iv: n,
                salt: x
            })
        }
    };
    var p = f.PasswordBasedCipher = g.extend({
        cfg: g.cfg.extend({
            kdf: e
        }),
        encrypt: function(d,
            k, n, x) {
            x = this.cfg.extend(x);
            n = x.kdf.execute(n, d.keySize, d.ivSize);
            x.iv = n.iv;
            d = g.encrypt.call(this, d, k, n.key, x);
            d.mixIn(n);
            return d
        },
        decrypt: function(d, k, n, x) {
            x = this.cfg.extend(x);
            k = this._parse(k, x.format);
            n = x.kdf.execute(n, d.keySize, d.ivSize, k.salt);
            x.iv = n.iv;
            return g.decrypt.call(this, d, k, n.key, x)
        }
    })
}();
(function() {
    var c = CryptoJS,
        e = c.enc.Utf8;
    c.algo.HMAC = c.lib.Base.extend({
        init: function(f, b) {
            f = this._hasher = new f.init;
            "string" == typeof b && (b = e.parse(b));
            var h = f.blockSize,
                y = 4 * h;
            b.sigBytes > y && (b = f.finalize(b));
            b.clamp();
            for (var l = this._oKey = b.clone(), B = this._iKey = b.clone(), a = l.words, m = B.words, z = 0; z < h; z++) a[z] ^= 1549556828, m[z] ^= 909522486;
            l.sigBytes = B.sigBytes = y;
            this.reset()
        },
        reset: function() {
            var f = this._hasher;
            f.reset();
            f.update(this._iKey)
        },
        update: function(f) {
            this._hasher.update(f);
            return this
        },
        finalize: function(f) {
            var b =
                this._hasher;
            f = b.finalize(f);
            b.reset();
            return b.finalize(this._oKey.clone().concat(f))
        }
    })
})();
(function() {
    for (var c = CryptoJS, e = c.lib.BlockCipher, f = c.algo, b = [], h = [], y = [], l = [], B = [], a = [], m = [], z = [], u = [], w = [], g = [], p = 0; 256 > p; p++) g[p] = 128 > p ? p << 1 : p << 1 ^ 283;
    var d = 0,
        k = 0;
    for (p = 0; 256 > p; p++) {
        var n = k ^ k << 1 ^ k << 2 ^ k << 3 ^ k << 4;
        n = n >>> 8 ^ n & 255 ^ 99;
        b[d] = n;
        h[n] = d;
        var x = g[d],
            A = g[x],
            I = g[A],
            G = 257 * g[n] ^ 16843008 * n;
        y[d] = G << 24 | G >>> 8;
        l[d] = G << 16 | G >>> 16;
        B[d] = G << 8 | G >>> 24;
        a[d] = G;
        G = 16843009 * I ^ 65537 * A ^ 257 * x ^ 16843008 * d;
        m[n] = G << 24 | G >>> 8;
        z[n] = G << 16 | G >>> 16;
        u[n] = G << 8 | G >>> 24;
        w[n] = G;
        d ? (d = x ^ g[g[g[I ^ x]]], k ^= g[g[k]]) : d = k = 1
    }
    var O = [0, 1, 2, 4, 8,
        16, 32, 64, 128, 27, 54
    ];
    f = f.AES = e.extend({
        _doReset: function() {
            var D = this._key,
                F = D.words,
                C = D.sigBytes / 4;
            D = 4 * ((this._nRounds = C + 6) + 1);
            for (var J = this._keySchedule = [], H = 0; H < D; H++)
                if (H < C) J[H] = F[H];
                else {
                    var E = J[H - 1];
                    H % C ? 6 < C && 4 == H % C && (E = b[E >>> 24] << 24 | b[E >>> 16 & 255] << 16 | b[E >>> 8 & 255] << 8 | b[E & 255]) : (E = E << 8 | E >>> 24, E = b[E >>> 24] << 24 | b[E >>> 16 & 255] << 16 | b[E >>> 8 & 255] << 8 | b[E & 255], E ^= O[H / C | 0] << 24);
                    J[H] = J[H - C] ^ E
                } F = this._invKeySchedule = [];
            for (C = 0; C < D; C++) H = D - C, E = C % 4 ? J[H] : J[H - 4], F[C] = 4 > C || 4 >= H ? E : m[b[E >>> 24]] ^ z[b[E >>> 16 & 255]] ^
                u[b[E >>> 8 & 255]] ^ w[b[E & 255]]
        },
        encryptBlock: function(D, F) {
            this._doCryptBlock(D, F, this._keySchedule, y, l, B, a, b)
        },
        decryptBlock: function(D, F) {
            var C = D[F + 1];
            D[F + 1] = D[F + 3];
            D[F + 3] = C;
            this._doCryptBlock(D, F, this._invKeySchedule, m, z, u, w, h);
            C = D[F + 1];
            D[F + 1] = D[F + 3];
            D[F + 3] = C
        },
        _doCryptBlock: function(D, F, C, J, H, E, L, q) {
            for (var v = this._nRounds, r = D[F] ^ C[0], t = D[F + 1] ^ C[1], M = D[F + 2] ^ C[2], K = D[F + 3] ^ C[3], N = 4, S = 1; S < v; S++) {
                var P = J[r >>> 24] ^ H[t >>> 16 & 255] ^ E[M >>> 8 & 255] ^ L[K & 255] ^ C[N++],
                    Q = J[t >>> 24] ^ H[M >>> 16 & 255] ^ E[K >>> 8 & 255] ^ L[r & 255] ^
                    C[N++],
                    R = J[M >>> 24] ^ H[K >>> 16 & 255] ^ E[r >>> 8 & 255] ^ L[t & 255] ^ C[N++];
                K = J[K >>> 24] ^ H[r >>> 16 & 255] ^ E[t >>> 8 & 255] ^ L[M & 255] ^ C[N++];
                r = P;
                t = Q;
                M = R
            }
            P = (q[r >>> 24] << 24 | q[t >>> 16 & 255] << 16 | q[M >>> 8 & 255] << 8 | q[K & 255]) ^ C[N++];
            Q = (q[t >>> 24] << 24 | q[M >>> 16 & 255] << 16 | q[K >>> 8 & 255] << 8 | q[r & 255]) ^ C[N++];
            R = (q[M >>> 24] << 24 | q[K >>> 16 & 255] << 16 | q[r >>> 8 & 255] << 8 | q[t & 255]) ^ C[N++];
            K = (q[K >>> 24] << 24 | q[r >>> 16 & 255] << 16 | q[t >>> 8 & 255] << 8 | q[M & 255]) ^ C[N++];
            D[F] = P;
            D[F + 1] = Q;
            D[F + 2] = R;
            D[F + 3] = K
        },
        keySize: 8
    });
    c.AES = e._createHelper(f)
})();
(function(c) {
    var e = CryptoJS,
        f = e.lib,
        b = f.WordArray,
        h = f.Hasher;
    f = e.algo;
    var y = [],
        l = [];
    (function() {
        function a(w) {
            for (var g = c.sqrt(w), p = 2; p <= g; p++)
                if (!(w % p)) return !1;
            return !0
        }

        function m(w) {
            return 4294967296 * (w - (w | 0)) | 0
        }
        for (var z = 2, u = 0; 64 > u;) a(z) && (8 > u && (y[u] = m(c.pow(z, .5))), l[u] = m(c.pow(z, 1 / 3)), u++), z++
    })();
    var B = [];
    f = f.SHA256 = h.extend({
        _doReset: function() {
            this._hash = new b.init(y.slice(0))
        },
        _doProcessBlock: function(a, m) {
            for (var z = this._hash.words, u = z[0], w = z[1], g = z[2], p = z[3], d = z[4], k = z[5], n = z[6], x = z[7],
                    A = 0; 64 > A; A++) {
                if (16 > A) B[A] = a[m + A] | 0;
                else {
                    var I = B[A - 15],
                        G = B[A - 2];
                    B[A] = ((I << 25 | I >>> 7) ^ (I << 14 | I >>> 18) ^ I >>> 3) + B[A - 7] + ((G << 15 | G >>> 17) ^ (G << 13 | G >>> 19) ^ G >>> 10) + B[A - 16]
                }
                I = x + ((d << 26 | d >>> 6) ^ (d << 21 | d >>> 11) ^ (d << 7 | d >>> 25)) + (d & k ^ ~d & n) + l[A] + B[A];
                G = ((u << 30 | u >>> 2) ^ (u << 19 | u >>> 13) ^ (u << 10 | u >>> 22)) + (u & w ^ u & g ^ w & g);
                x = n;
                n = k;
                k = d;
                d = p + I | 0;
                p = g;
                g = w;
                w = u;
                u = I + G | 0
            }
            z[0] = z[0] + u | 0;
            z[1] = z[1] + w | 0;
            z[2] = z[2] + g | 0;
            z[3] = z[3] + p | 0;
            z[4] = z[4] + d | 0;
            z[5] = z[5] + k | 0;
            z[6] = z[6] + n | 0;
            z[7] = z[7] + x | 0
        },
        _doFinalize: function() {
            var a = this._data,
                m = a.words,
                z = 8 * this._nDataBytes,
                u = 8 * a.sigBytes;
            m[u >>> 5] |= 128 << 24 - u % 32;
            m[(u + 64 >>> 9 << 4) + 14] = c.floor(z / 4294967296);
            m[(u + 64 >>> 9 << 4) + 15] = z;
            a.sigBytes = 4 * m.length;
            this._process();
            return this._hash
        },
        clone: function() {
            var a = h.clone.call(this);
            a._hash = this._hash.clone();
            return a
        }
    });
    e.SHA256 = h._createHelper(f);
    e.HmacSHA256 = h._createHmacHelper(f)
})(Math);

function calElmPos(c, e, f) {
    var b = _centerX,
        h = _centerY,
        y = e + f * _globalVars.config.distanceDeg;
    f = e + 20 + _globalVars.config.sliceWidth - _globalVars.config.borderSlice + f * _globalVars.config.distanceDeg;
    return {
        x1: b + c * Math.cos(Math.PI * y / e),
        y1: h + c * Math.sin(Math.PI * y / e),
        x2: b + c * Math.cos(Math.PI * f / e),
        y2: h + c * Math.sin(Math.PI * f / e)
    }
}

function spin(c, e) {
    if (!localStorage.getItem("remainTime")) {
        _globalVars.isProcessing = !0;
        turnOffFilters();
        _animation.outerLight.on();
        outerSpin.radius("12%");
        innerSpin.radius("8%");
        spinImage.finish().size(140).move(_centerX / 1.23, _centerY / 1.22);
        spinLabel.move("43%", "44%");
        if ("undefined" !== typeof e) {
            0 === e && (e = _globalVars.config.totalSlices);
            var f = e
        } else f = Math.floor(Math.random() * _globalVars.config.totalSlices + 1);
        var b = 360 / _globalVars.config.totalSlices * f;
        switch (parseInt(_globalVars.config.totalSlices)) {
            case 10:
                b -=
                    3;
                break;
            case 8:
                b -= 8;
                break;
            case 5:
                b -= 20
        }
        _globalVars.elms.rotateGroup.animate(15E3, "circInOut").rotate(-3600 - b).afterAll(function() {
            setTimeout(function() {
                _globalVars.elms.pizza.children()[f - 1].animate(200).fill("#fff").loop(3, !0).afterAll(function() {
                    _globalVars.elms.pizza.children()[f - 1].animate(100).fill(_globalVars.elms.pizzaArr[f - 1].fill).afterAll(function() {
                        _animation.outerLight.off();
                        outerSpin.radius("14%");
                        innerSpin.radius("10%");
                        spinImage.size(160).move(_centerX / 1.27, _centerY / 1.26).animate().size(140).move(_centerX /
                            1.23, _centerY / 1.22).loop(!0, !0);
                        spinLabel.move("42%", "44%");
                        _globalVars.isProcessing = !1;
                        try {
                            parseInt(f) === _globalVars.jsonData.length && (f = 0);
                            if(f == 6)
                            {
                                f = 0;
                            }
                            else if(f == 7)
                            {
                                f = 1;
                            }
                            else
                            {
                                f = f+2;
                            }
                            var h = _globalVars.jsonData[f].value;
                            document.getElementById("drawing").setAttribute("value", f)
                        } catch (y) {
                            h = y.toString()
                        }
                        turnOnFilters();
                        c(h)
                    })
                })
            }, 100)
        })
    }
}

function redeem(c, e) {
    var f = JSON.parse(localStorage.getItem(cachedKey));
    f[c].redeem = !0;
    localStorage.setItem(cachedKey, JSON.stringify(f));
    document.querySelectorAll(".reward-list .items .item")[c].children[0].textContent = "Used";
    document.querySelectorAll(".reward-list .items .item")[c].children[0].classList.add("disabled");
    document.querySelectorAll(".reward-list .items .item")[c].children[0].removeAttribute("onclick");
    _globalVars.evt.rewardValue = f[c].price;
    document.dispatchEvent(_globalVars.evt)
}

function saveReward(c) {
    var e = {
        redeem: !1,
        price: c
    };
    localStorage.getItem(cachedKey) || localStorage.setItem(cachedKey, JSON.stringify([]));
    c = JSON.parse(localStorage.getItem(cachedKey));
    c.unshift(e);
    localStorage.setItem(cachedKey, JSON.stringify(c));
    loadRewardBag()
}

function loadRewardBag() {
    if (localStorage.getItem(cachedKey)) {
        var c = JSON.parse(localStorage.getItem(cachedKey));
        for (var e = document.querySelector(".reward-list .items"), f = "", b = 0; b < c.length; b++) f = !0 === c[b].redeem ? f + ('<div class="item"><button class="btn-redeem disabled"><span>Used</span></button><div class="value" data-value="' + c[b].price + '">' + c[b].price + "</div></div>") : f + ('<div class="item disabled"><button class="btn-redeem" onclick="redeem(' + b + ')"><span>Redeem</span></button><div class="value" data-value="' +
            c[b].price + '">' + c[b].price + "</div></div>");
        e.innerHTML = f;
        document.querySelector(".burger-menu .counter").innerHTML = c.length
    }
}

function turnOffFilters() {
    outerCircle.attr("filter", null);
    outerSpin.attr("filter", null);
    for (var c = 0; c < _lightOuterMem.length; c++) _lightOuterMem[c].element.attr("filter", null);
    for (c = 0; c < _globalVars.elms.innerLightArr.length; c++) _globalVars.elms.innerLightArr[c].element.attr("filter", null);
    for (c = 0; c < _globalVars.elms.textArr.length; c++) _globalVars.elms.textArr[c].attr("filter", null);
    shelfTop.attr("filter", null);
    shelfBot.attr("filter", null);
    outerNeedle.attr("filter", null);
    innerNeedle.attr("filter", null)
}

function turnOnFilters() {
    "undefined" === typeof _globalVars.config.graphicOption && (_globalVars.config.graphicOption = 0);
    1 <= _globalVars.config.graphicOption && (outerCircle.filter(setFilter(10, !1)), outerSpin.filter(setFilter(20, !1)));
    if (2 <= _globalVars.config.graphicOption)
        for (var c = 0; c < _lightOuterMem.length; c++) _lightOuterMem[c].element.filter(setFilter(2, !0));
    if (2 <= _globalVars.config.graphicOption)
        for (c = 0; c < _globalVars.elms.innerLightArr.length; c++) _globalVars.elms.innerLightArr[c].element.filter(setFilter(1,
            !1));
    if (1 <= _globalVars.config.graphicOption)
        for (c = 0; c < _globalVars.elms.textArr.length; c++) _globalVars.elms.textArr[c].filter(setFilter(10, !1));
    2 <= _globalVars.config.graphicOption && (shelfTop.filter(setFilter(3, !1)), shelfBot.filter(setFilter(3, !1)), outerNeedle.filter(setFilter(3, !1)), innerNeedle.filter(setFilter(10, !1)))
}

function setFilter(c, e) {
    var f = new SVG.Filter,
        b = f.offset(0, 0).gaussianBlur(c);
    f.blend(f.source, b);
    f.size("200%", "200%").move("-50%", "-50%");
    e && b.animate({
        ease: "<"
    }).attr({
        stdDeviation: "9"
    }).loop(!0, !0);
    _globalVars.elms.filters.push(f);
    return f
}

function renderImageReward(c, e, f, b) {
    var h = _globalVars.jsonData[e].imageUrl + "?v=" + (new Date).getTime(),
        y = parseInt(_globalVars.config.totalSlices),
        l = 0;
    f -= _globalVars.config.sliceWidth;
    b -= _globalVars.config.sliceWidth;
    12 === y && (0 === e && (f += 0, b += 15, l = -90), 1 === e && (f -= 0, b += 15, l = -55), 2 === e && (f -= 0, b += 15, l = -35), 3 === e && (f -= 10, b += 15, l = 0), 4 === e && (f -= 10, b += 15, l = 35), 5 === e && (f -= 10, b += 15, l = 55), 6 === e && (f -= 10, b += 15, l = 90), 7 === e && (f -= 10, b += 15, l = 115), 8 === e && (f -= 10, b += 0, l = 140), 9 === e && (f -= 10, b += 0, l = 180), 10 === e && (f -= 10, b +=
        0, l = 215), 11 === e && (f -= 0, b += 15, l = 240));
    imgObj = c.image(h, 90);
    imgObj.move(f, b).rotate(l);
    _globalVars.elms.rewardImageGroup.add(imgObj)
}
var _animation = {
        outerLight: {
            on: function() {
                for (var c, e = 0; e < _lightOuterMem.length; e++) c = .1 * e + "s", "3" === _globalVars.config.wheelUX ? _lightOuterMem[e].element.animate({
                    ease: "<",
                    delay: c
                }).fill("#c9658f").loop(!0, !0) : _lightOuterMem[e].element.animate({
                    ease: "<",
                    delay: c
                }).fill("#CD0802").loop(!0, !0)
            },
            off: function() {
                for (var c = 0; c < _lightOuterMem.length; c++) "3" === _globalVars.config.wheelUX && _lightOuterMem[c].element.finish().fill("#ffa000"), "2" === _globalVars.config.wheelUX && _lightOuterMem[c].element.finish().fill("#F4F4F4"),
                    "0" !== _globalVars.config.wheelUX && "1" !== _globalVars.config.wheelUX || _lightOuterMem[c].element.finish().fill("#FFFFB0")
            }
        }
    },
    _globalVars, _width = 750,
    _height = 750,
    _centerX = _width / 2,
    _centerY = _height / 2,
    mFilter = new SVG.Filter;
mFilter.offset(0, 0).gaussianBlur(10);
mFilter.blend(mFilter.source, blur);
mFilter.size("200%", "200%").move("-50%", "-50%");
var lgFilter = new SVG.Filter;
lgFilter.offset(0, 0).gaussianBlur(20);
lgFilter.blend(mFilter.source, blur);
lgFilter.size("200%", "200%").move("-50%", "-50%");
var cachedKey = "ghfjghdsjhf" + window.location.hostname;

function drawGraphic() {
    var c = SVG("drawing");
    c.viewbox({
        x: 0,
        y: 0,
        width: _width,
        height: _height  
    }).attr("id", "viewBox");
    document.getElementById("viewBox").style.height = window.innerHeight+ "px";
    _globalVars = {
        isProcessing: !1,
        coords: {
            clientX: null,
            clientY: null
        },
        config: {
            wheelUX: "4",
            totalSlices: 12,
            distanceDeg: 45,
            defaultStartDeg: null,
            borderSlice: 5,
            sliceWidth: 30,
            graphicOption: 1,
            brandLogo: "img/brand.png",
            backgroundColor: "#337ab7",
            allowSound: !0
        },
        elms: {
            container: c.group(),
            pizza: c.group(),
            pizzaArr: [],
            outerLight: c.group(),
            innerLight: c.group(),
            innerLightArr: [],
            spin: c.group(),
            needle: c.group(),
            text: c.group(),
            textArr: [],
            rotateGroup: c.group(),
            rewardImageGroup: c.group(),
            filters: []
        },
        jsonData: [
            { value: "100$", imageUrl: "img/reward0.png" },
            { value: "Iphone 14 Pro max", imageUrl: "img/reward1.png" },
            { value: "Gift Box I", imageUrl: "img/reward2.png" },
            { value: "Mac Bok Pro 2022", imageUrl: "img/reward3.png" },
            { value: "Apple Watch SE 2022", imageUrl: "img/reward4.png" },
            { value: "IPad Pro 2022", imageUrl: "img/reward5.png" },
            { value: "Gift Box II", imageUrl: "img/reward6.png" },
            { value: "Air Bods Pro 2022", imageUrl: "img/reward7.png" },
    ]
    };
    if (0 < document.querySelectorAll('[data-type="admin"]').length)
        if (localStorage.getItem("defaultConfig") && (_globalVars.config = JSON.parse(localStorage.getItem("defaultConfig"))),
            localStorage.getItem("sliceData")) _globalVars.jsonData = JSON.parse(localStorage.getItem("sliceData"));
        else {
            if (12 === parseInt(_globalVars.config.totalSlices))
                for (var e = 0; e < _globalVars.jsonData.length; e++) _globalVars.jsonData[e].imageUrl = "img/reward" + e + ".png"
        }
    else "undefined" !== typeof _dynamicParams && (_globalVars.config = _dynamicParams.config, _globalVars.jsonData = _dynamicParams.jsonData);
    _globalVars.evt = document.createEvent("Event");
    _globalVars.evt.initEvent("onRedeemCompleted", !0, !0);
    _globalVars.config.defaultStartDeg =
        _globalVars.config.totalSlices / 2 * _globalVars.config.distanceDeg;
    if ("4" === _globalVars.config.wheelUX) {
        var f = c.gradient("linear", function(a) {
            a.at(0, "#222222");
            a.at(1, "#333333")
        });
        outerCircle = c.circle(_width - 30).move(15, 15);
        outerCircle.fill(f);
        f = c.circle("100%").attr({
            fill: "#E8DA9F"
        });
        f.radius("45%");
        outerSpin = c.circle("100%").attr({
            fill: "#23051D"
        });
        var b = c.gradient("radial", function(a) {
            a.at(0, "#FFFFFF");
            a.at(1, "#4E82CB")
        })
    }
    "3" === _globalVars.config.wheelUX && (f = c.gradient("linear", function(a) {
        a.at(0,
            "#ffa000");
        a.at(1, "#ffa000")
    }), outerCircle = c.circle(_width - 30).move(15, 15), outerCircle.fill(f), f = c.circle("100%").attr({
        fill: "#ffa000"
    }), f.radius("45%"), outerSpin = c.circle("100%").attr({
        fill: "#23051D"
    }), b = c.gradient("radial", function(a) {
        a.at(0, "#ffa000");
        a.at(1, "#ffa")
    }));
    "2" === _globalVars.config.wheelUX && (f = c.gradient("linear", function(a) {
            a.at(0, "#3E192A");
            a.at(1, "#2E0928")
        }), outerCircle = c.circle(_width - 30).move(15, 15), outerCircle.fill(f), f = c.circle("100%").attr({
            fill: "#666"
        }), f.radius("45%"), outerSpin =
        c.circle("100%").attr({
            fill: "#23051D"
        }), b = c.gradient("radial", function(a) {
            a.at(0, "#420D39");
            a.at(1, "#23051D")
        }));
    "1" === _globalVars.config.wheelUX && (f = c.gradient("linear", function(a) {
        a.at(0, "#E8DA9F");
        a.at(1, "#E8DA9F")
    }), outerCircle = c.circle(_width - 30).move(15, 15), outerCircle.fill(f), f = c.circle("100%").attr({
        fill: "#E8DA9F"
    }), f.radius("45%"), outerSpin = c.circle("100%").attr({
        fill: "#23051D"
    }), b = c.gradient("radial", function(a) {
        a.at(0, "#E8DA9F");
        a.at(1, "#000000")
    }));
    "0" === _globalVars.config.wheelUX && (f =
        c.gradient("linear", function(a) {
            a.at(0, "#3E192A");
            a.at(1, "#2E0928")
        }), outerCircle = c.circle(_width - 30).move(15, 15), outerCircle.fill(f), f = c.circle("100%").attr({
            fill: "#666"
        }), f.radius("45%"), outerSpin = c.circle("100%").attr({
            fill: "#23051D"
        }), b = c.gradient("radial", function(a) {
            a.at(0, "#420D39");
            a.at(1, "#23051D")
        }));
    b.from(.5, 0).to(.5, 0).radius(.4);
    outerSpin.radius("14%");
    outerSpin.fill(b);
    "4" === _globalVars.config.wheelUX ? (innerSpin = c.circle("100%").attr({
        fill: "#501245"
    }), e = c.gradient("linear", function(a) {
        a.at(0,
            "#FFFFFF");
        a.at(1, "#4E82CB")
    })) : (innerSpin = c.circle("100%").attr({
        fill: "#501245"
    }), e = c.gradient("linear", function(a) {
        a.at(0, "#23051D");
        a.at(1, "#521246")
    }));
    e.from(0, .5).to(0, 1);
    innerSpin.radius("10%");
    innerSpin.fill(e);
    spinLabel = c.text("SPIN");
    spinLabel.font({
        size: 0,
        fill: "#fff"
    });
    spinLabel.move("42%", "44%");
    spinImage = c.image(_globalVars.config.brandLogo, 160);
    spinImage.move(_centerX / 1.27, _centerY / 1.26);
    _lightOuterMem = [];
    if (12 >= parseInt(_globalVars.config.totalSlices) && "4" !== _globalVars.config.wheelUX)
        for (var h =
                0; h < 2 * _globalVars.config.totalSlices; h++) e = calElmPos(_width / 2.08, 2 * _globalVars.config.defaultStartDeg, h), e = "3" === _globalVars.config.wheelUX ? c.ellipse(30, 30).fill("#ffa").move(e.x1 - 15, e.y1 - 15).attr("id", h) : "2" === _globalVars.config.wheelUX ? c.ellipse(30, 30).fill("#F4F4F4").move(e.x1 - 15, e.y1 - 15).attr("id", h) : c.ellipse(30, 30).fill("#FFFFB0").move(e.x1 - 15, e.y1 - 15).attr("id", h), _lightOuterMem.push({
            element: e,
            filter: blur
        }), _globalVars.elms.outerLight.add(e);
    for (h = 0; h < _globalVars.config.totalSlices; h++) {
        b =
            "M" + _centerX + "," + _centerY + " ";
        var y = _width / 2.2;
        e = calElmPos(y, _globalVars.config.defaultStartDeg, h);
        e = c.path(b + "L" + e.x1 + "," + e.y1 + " A" + y + "," + y + " 0 0,1 " + e.x2 + "," + e.y2 + " z");
        var l = "";
        "4" === _globalVars.config.wheelUX && (l = 0 === h || 0 === h % 2 ? c.gradient("linear", function(a) {
            a.at(0, "#4E82CB");
            a.at(1, "#2D66C4")
        }) : c.gradient("radial", function(a) {
            a.at(0, "#FFFFFF");
            a.at(1, "#FFFFFF")
        }), e.fill(l), 5 === parseInt(_globalVars.config.totalSlices) && (l = c.gradient("linear", function(a) {
                a.at(0, "#FFFFFF");
                a.at(1, "#FFFFFF")
            }),
            e.fill(l)), e.stroke({
            color: "#222222",
            width: 1,
            linecap: "round",
            linejoin: "round"
        }));
        "3" === _globalVars.config.wheelUX && e.stroke({
            color: "#212121",
            width: 1,
            linecap: "round",
            linejoin: "round"
        });
        "2" === _globalVars.config.wheelUX && (l = 0 === h || 0 === h % 2 ? c.gradient("linear", function(a) {
                a.at(0, "#EA352F");
                a.at(1, "#222222")
            }) : c.gradient("radial", function(a) {
                a.at(0, "#FFFFFF");
                a.at(1, "#FFFFFF")
            }), e.fill(l), 5 === parseInt(_globalVars.config.totalSlices) && (l = c.gradient("linear", function(a) {
                a.at(0, "blue");
                a.at(1, "#fb3")
            }), e.fill(l)),
            e.stroke({
                color: "#320E34",
                width: 1,
                linecap: "round",
                linejoin: "round"
            }));
        "1" === _globalVars.config.wheelUX && (l = 0 === h || 0 === h % 2 ? c.gradient("linear", function(a) {
            a.at(0, "#161313");
            a.at(1, "#222222")
        }) : c.gradient("radial", function(a) {
            a.at(0, "#E8DA9F");
            a.at(1, "#C8AB68")
        }), e.fill(l), 5 === parseInt(_globalVars.config.totalSlices) && (l = c.gradient("linear", function(a) {
            a.at(0, "#E8DA9F");
            a.at(1, "#C8AB68")
        }), e.fill(l)), e.stroke({
            color: "#E8DA9F",
            width: 1,
            linecap: "round",
            linejoin: "round"
        }));
        "0" === _globalVars.config.wheelUX &&
            (l = 0 === h || 4 === h || 8 === h || 12 === h || 16 === h || 20 === h || 24 === h || 28 === h || 32 === h || 36 === h ? c.gradient("radial", function(a) {
                a.at(0, "#D80001");
                a.at(1, "#BC1505")
            }) : 1 === h || 5 === h || 9 === h || 13 === h || 17 === h || 21 === h || 25 === h || 29 === h || 33 === h ? c.gradient("linear", function(a) {
                a.at(0, "#04756F");
                a.at(1, "#045E5C")
            }) : 2 === h || 6 === h || 10 === h || 14 === h || 18 === h || 22 === h || 10 === h || 10 === h || 10 === h ? c.gradient("linear", function(a) {
                a.at(0, "#FF8B00");
                a.at(1, "#D37201")
            }) : 36 !== parseInt(_globalVars.config.totalSlices) || 27 !== h && 31 !== h && 34 !== h ? c.gradient("radial",
                function(a) {
                    a.at(0, "#400B35");
                    a.at(1, "#320B28")
                }) : c.gradient("radial", function(a) {
                a.at(0, "#333333");
                a.at(1, "#666666")
            }), e.fill(l), e.stroke({
                color: "#320E34",
                width: 1,
                linecap: "round",
                linejoin: "round"
            }));
        _globalVars.elms.pizza.add(e);
        _globalVars.elms.pizzaArr.push({
            element: e,
            fill: l
        });
        b = e = e = e = "";
        if ("0" === _globalVars.config.wheelUX && 12 >= parseInt(_globalVars.config.totalSlices))
            for (b = 0; 5 > b; b++) e = _width / 2.5 - 40 * b, e = calElmPos(e, _globalVars.config.defaultStartDeg, h), e = c.ellipse(16, 16).fill("#FFFFB0").move(e.x1 -
                8, e.y1 - 8), e.attr("id", b), _globalVars.elms.innerLightArr.push({
                element: e,
                filter: blur
            }), 5 === parseInt(_globalVars.config.totalSlices) && e.opacity(0), _globalVars.elms.innerLight.add(e)
    }
    _globalVars.elms.container.add(_globalVars.elms.pizza);
    for (h = 0; h < _globalVars.config.totalSlices; h++) {
        e = _width / 2.8;
        e = calElmPos(e, _globalVars.config.defaultStartDeg, h);
        36 === parseInt(_globalVars.config.totalSlices) ? (e.x1 -= 15, e.y1 -= 13) : (5 === parseInt(_globalVars.config.totalSlices) ? (e.x1 += 10, e.y1 -= 35) : (e.x1 = e.x1, e.y1 -= 20), _globalVars.jsonData[h].value.indexOf(" "));
        "4" === _globalVars.config.wheelUX && (l = 0 === h || 0 === h % 2 ? c.gradient("linear", function(a) {
            a.at(0, "#222222");
            a.at(1, "#333333")
        }) : c.gradient("linear", function(a) {
            a.at(0, "#F1F1F1");
            a.at(1, "#F4F4F4")
        }), 5 === parseInt(_globalVars.config.totalSlices) && (l = c.gradient("linear", function(a) {
            a.at(0, "#EB3323");
            a.at(1, "#FF8B00")
        })));
        "3" === _globalVars.config.wheelUX && (0 === h && (l = c.gradient("linear", function(a) {
                a.at(0, "#f6546a");
                a.at(1, "#f6546a")
            })), 1 === h && (l = c.gradient("linear", function(a) {
                a.at(0, "#2bfe72");
                a.at(1, "#2bfe72")
            })),
            2 === h && (l = c.gradient("linear", function(a) {
                a.at(0, "#ffff00");
                a.at(1, "#ffff00")
            })), 3 === h && (l = c.gradient("linear", function(a) {
                a.at(0, "#ffffff");
                a.at(1, "#ffffff")
            })), 4 === h && (l = c.gradient("linear", function(a) {
                a.at(0, "#FFA500");
                a.at(1, "#FFA500")
            })), 5 === h && (l = c.gradient("linear", function(a) {
                a.at(0, "#CD853F");
                a.at(1, "#CD853F")
            })), 6 === h && (l = c.gradient("linear", function(a) {
                a.at(0, "#0080ff");
                a.at(1, "#0080ff")
            })), 7 === h && (l = c.gradient("linear", function(a) {
                a.at(0, "#b2fbbb");
                a.at(1, "#b2fbbb")
            })), 8 === h && (l = c.gradient("linear",
                function(a) {
                    a.at(0, "#c9658f");
                    a.at(1, "#c9658f")
                })), 9 === h && (l = c.gradient("linear", function(a) {
                a.at(0, "#666");
                a.at(1, "#ddd")
            })), 10 === h && (l = c.gradient("linear", function(a) {
                a.at(0, "#987dc5");
                a.at(1, "#987dc5")
            })), 11 === h && (l = c.gradient("linear", function(a) {
                a.at(0, "#e0eeee");
                a.at(1, "#838b8b")
            })));
        "2" === _globalVars.config.wheelUX && (l = 0 === h || 0 === h % 2 ? c.gradient("linear", function(a) {
            a.at(0, "#222222");
            a.at(1, "#333333")
        }) : c.gradient("linear", function(a) {
            a.at(0, "#F1F1F1");
            a.at(1, "#F4F4F4")
        }));
        "1" === _globalVars.config.wheelUX &&
            (l = 0 === h || 0 === h % 2 ? c.gradient("linear", function(a) {
                a.at(0, "#FFFFFF");
                a.at(1, "#F4F4F4")
            }) : c.gradient("linear", function(a) {
                a.at(0, "#EB3323");
                a.at(1, "#FF8B00")
            }));
        "0" === _globalVars.config.wheelUX && (l = c.gradient("linear", function(a) {
            a.at(0, "#F1F1F1");
            a.at(1, "#F4F4F4")
        }));
        if (12 >= parseInt(_globalVars.config.totalSlices))
            if (-1 < _globalVars.jsonData[h].value.indexOf(" ")) {
                var B = _globalVars.jsonData[h].value.split(" ");
                b = c.text(function(a) {
                    for (var m = 0; m < B.length; m++) a.tspan(B[m]).newLine(), a.font({
                        size: 24,
                        fill: l,
                        anchor: "middle"
                    })
                });
                4 < _globalVars.jsonData[h].value.length && (e.x1 = e.x1, e.y1 = e.y1)
            } else b = "3" === _globalVars.config.wheelUX ? c.text(function(a) {
                a.tspan(_globalVars.jsonData[h].value).font({
                    size: 22,
                    fill: l,
                    anchor: "middle"
                })
            }) : c.text(function(a) {
                a.tspan(_globalVars.jsonData[h].value).font({
                    size: 30,
                    fill: l,
                    anchor: "middle"
                })
            });
        else b = c.text(function(a) {
            a.tspan(_globalVars.jsonData[h].value).font({
                size: 20,
                fill: l
            })
        });
        b.rotate(0).move(e.x1, e.y1);
        8 === parseInt(_globalVars.config.totalSlices) && (b.opacity(0), renderImageReward(c,
            h, e.x1, e.y1));
        if (36 === parseInt(_globalVars.config.totalSlices)) switch (h) {
            case 0:
                b.rotate(-90);
                break;
            case 1:
                b.rotate(-80);
                break;
            case 2:
                b.rotate(-70);
                break;
            case 3:
                b.rotate(-60);
                break;
            case 4:
                b.rotate(-50);
                break;
            case 5:
                b.rotate(-40);
                break;
            case 6:
                b.rotate(-30);
                break;
            case 7:
                b.rotate(-20);
                break;
            case 8:
                b.rotate(-10);
                break;
            case 9:
                b.rotate(0);
                break;
            case 10:
                b.rotate(10);
                break;
            case 11:
                b.rotate(20);
                break;
            case 12:
                b.rotate(30);
                break;
            case 13:
                b.rotate(40);
                break;
            case 14:
                b.rotate(50);
                break;
            case 15:
                b.rotate(60);
                break;
            case 16:
                b.rotate(70);
                break;
            case 17:
                b.rotate(80);
                break;
            case 18:
                b.rotate(90);
                break;
            case 19:
                b.rotate(100);
                break;
            case 20:
                b.rotate(110);
                break;
            case 21:
                b.rotate(120);
                break;
            case 22:
                b.rotate(130);
                break;
            case 23:
                b.rotate(140);
                break;
            case 24:
                b.rotate(150);
                break;
            case 25:
                b.rotate(160);
                break;
            case 26:
                b.rotate(170);
                break;
            case 27:
                b.rotate(180);
                break;
            case 28:
                b.rotate(190);
                break;
            case 29:
                b.rotate(200);
                break;
            case 30:
                b.rotate(210);
                break;
            case 31:
                b.rotate(220);
                break;
            case 32:
                b.rotate(230);
                break;
            case 33:
                b.rotate(240);
                break;
            case 34:
                b.rotate(250);
                break;
            case 35:
                b.rotate(260);
                break;
            default:
                b.rotate(0)
        }
        if (12 === parseInt(_globalVars.config.totalSlices)) switch (h) {
            case 0:
                b.rotate(-90);
                break;
            case 1:
                b.rotate(-60);
                break;
            case 2:
                b.rotate(-30);
                break;
            case 3:
                b.rotate(0);
                break;
            case 4:
                b.rotate(30);
                break;
            case 5:
                b.rotate(60);
                break;
            case 6:
                b.rotate(90);
                break;
            case 7:
                b.rotate(120);
                break;
            case 8:
                b.rotate(150);
                break;
            case 9:
                b.rotate(180);
                break;
            case 10:
                b.rotate(210);
                break;
            case 11:
                b.rotate(240);
                break;
            default:
                b.rotate(0)
        }
        if (10 === parseInt(_globalVars.config.totalSlices)) switch (h) {
            case 0:
                b.rotate(-90);
                break;
            case 1:
                b.rotate(-55);
                break;
            case 2:
                b.rotate(-20);
                break;
            case 3:
                b.rotate(15);
                break;
            case 4:
                b.rotate(55);
                break;
            case 5:
                b.rotate(90);
                break;
            case 6:
                b.rotate(125);
                break;
            case 7:
                b.rotate(160);
                break;
            case 8:
                b.rotate(195);
                break;
            case 9:
                b.rotate(230);
                break;
            default:
                b.rotate(0)
        }
        if (8 === parseInt(_globalVars.config.totalSlices)) switch (h) {
            case 0:
                b.rotate(-90);
                break;
            case 1:
                b.rotate(-45);
                break;
            case 2:
                b.rotate(0);
                break;
            case 3:
                b.rotate(45);
                break;
            case 4:
                b.rotate(90);
                break;
            case 5:
                b.rotate(135);
                break;
            case 6:
                b.rotate(180);
                break;
            case 7:
                b.rotate(225);
                break;
            default:
                b.rotate(0)
        }
        if (5 === parseInt(_globalVars.config.totalSlices)) switch (h) {
            case 0:
                b.rotate(-92);
                break;
            case 1:
                b.rotate(-20);
                break;
            case 2:
                b.rotate(52);
                break;
            case 3:
                b.rotate(122);
                break;
            case 4:
                b.rotate(195);
                break;
            default:
                b.rotate(0)
        }
        _globalVars.elms.text.add(b);
        _globalVars.elms.textArr.push(b)
    }
    shelfTop = c.rect(130, 70);
    shelfTop.cx(_centerX);
    shelfTop.cy(0);
    shelfTop.radius(10);
    l = "3" === _globalVars.config.wheelUX ? c.gradient("linear", function(a) {
        a.at(0, "#fb3");
        a.at(.1, "#ffa000");
        a.at(.5, "#ffa000");
        a.at(.9, "#ffa000");
        a.at(1, "#fb3")
    }) : c.gradient("linear", function(a) {
        a.at(0, "#B3B4B6");
        a.at(.1, "#EAEAEA");
        a.at(.5, "#E6E7E9");
        a.at(.9, "#EAEAEA");
        a.at(1, "#B3B4B6")
    });
    shelfTop.fill(l);
    shelfTop.stroke({
        color: l,
        width: 10,
        linecap: "round",
        linejoin: "round"
    });
    "1" === _globalVars.config.wheelUX && shelfTop.opacity(0);
    shelfBot = c.path("M 20 0 L 180 0 L 200 80  L 260 110 L -60 110 L 0 80 Z");
    shelfBot.cx(_centerX);
    shelfBot.cy(_height + 20);
    l = c.gradient("linear", function(a) {
        a.at(0, "#BDBDBD");
        a.at(.25,
            "#E2E1DF");
        a.at(.5, "#C0C0C0");
        a.at(.8, "#5D5D5D");
        a.at(1, "#E2E1DF")
    });
    l.from(0, 0).to(0, 1);
    shelfBot.fill(l);
    shelfBot.stroke({
        color: l,
        width: 10,
        linecap: "round",
        linejoin: "round"
    });
    "3" === _globalVars.config.wheelUX && shelfBot.opacity(0);
    "1" === _globalVars.config.wheelUX && shelfBot.opacity(0);
    outerNeedle = c.polygon("0,0 100,0 50,100");
    outerNeedle.cx(_centerX);
    outerNeedle.cy(30);
    outerNeedle.size(100, 70);
    "4" === _globalVars.config.wheelUX && (l = c.gradient("radial", function(a) {
        a.at(0, "#F0F0F0");
        a.at(1, "#A0A0A0")
    }));
    "3" === _globalVars.config.wheelUX && (l = c.gradient("radial", function(a) {
        a.at(0, "#c9658f");
        a.at(1, "#222222")
    }));
    "2" === _globalVars.config.wheelUX && (l = c.gradient("radial", function(a) {
        a.at(0, "#FFFFFF");
        a.at(1, "#222222")
    }));
    "1" === _globalVars.config.wheelUX && (l = c.gradient("radial", function(a) {
        a.at(0, "#A0A0A0");
        a.at(1, "#E8DA9F")
    }));
    "0" === _globalVars.config.wheelUX && (l = c.gradient("radial", function(a) {
        a.at(0, "#F0F0F0");
        a.at(1, "#A0A0A0")
    }));
    outerNeedle.fill(l);
    outerNeedle.stroke({
        color: l,
        width: 10,
        linecap: "round",
        linejoin: "round"
    });
    innerNeedle = c.polygon("0,0 60,0 30,60");
    innerNeedle.cx(_centerX);
    innerNeedle.cy(10);
    innerNeedle.size(60, 50);
    "3" === _globalVars.config.wheelUX && innerNeedle.fill("#2bfe72");
    "2" === _globalVars.config.wheelUX && innerNeedle.fill("#F2F2F2");
    "1" === _globalVars.config.wheelUX && innerNeedle.fill("#EB3323");
    "" === _globalVars.config.wheelUX && innerNeedle.fill("#FFFFFF");
    _globalVars.elms.spin.add(outerSpin);
    _globalVars.elms.spin.add(innerSpin);
    _globalVars.elms.spin.add(spinLabel);
    _globalVars.elms.spin.add(spinImage);
    _globalVars.elms.needle.add(outerNeedle);
    _globalVars.elms.needle.add(innerNeedle);
    _globalVars.elms.container.add(shelfTop);
    _globalVars.elms.container.add(shelfBot);
    _globalVars.elms.container.add(outerCircle);
    _globalVars.elms.container.add(f);
    _globalVars.elms.container.add(_globalVars.elms.outerLight);
    _globalVars.elms.rotateGroup.add(_globalVars.elms.pizza);
    _globalVars.elms.rotateGroup.add(_globalVars.elms.innerLight);
    _globalVars.elms.rotateGroup.add(_globalVars.elms.text);
    _globalVars.elms.container.add(_globalVars.elms.rotateGroup);
    _globalVars.elms.rotateGroup.add(_globalVars.elms.rewardImageGroup);
    _globalVars.elms.container.add(_globalVars.elms.spin);
    _globalVars.elms.container.add(_globalVars.elms.needle);
    turnOnFilters();
    _globalVars.elms.spin.children()[3].animate().size(140).move(_centerX / 1.23, _centerY / 1.22).loop(!0, !0);
    _globalVars.elms.spin.style("cursor", "pointer");
    _globalVars.elms.pizza.rotate(105);
    _globalVars.elms.innerLight.rotate(105);
    36 === parseInt(_globalVars.config.totalSlices) && (_globalVars.elms.pizza.rotate(95),
        _globalVars.elms.innerLight.rotate(95));
    switch (parseInt(_globalVars.config.totalSlices)) {
        case 36:
            _globalVars.elms.rotateGroup.rotate(0);
            _globalVars.elms.text.rotate(90);
            break;
        case 12:
            _globalVars.elms.rotateGroup.rotate(0);
            _globalVars.elms.text.rotate(90);
            _globalVars.elms.rewardImageGroup.rotate(90);
            break;
        case 10:
            _globalVars.elms.rotateGroup.rotate(3);
            _globalVars.elms.text.rotate(87);
            break;
        case 8:
            _globalVars.elms.rotateGroup.rotate(7);
            _globalVars.elms.text.rotate(83);
            _globalVars.elms.rewardImageGroup.rotate(353);
            break;
        case 5:
            _globalVars.elms.rotateGroup.rotate(20),
                _globalVars.elms.text.rotate(72)
    }
}

function drawLuckWheel() {
    drawGraphic()
}
var callback = function() {
    setTimeout(function() {
        drawLuckWheel();
        loadEvents()
    }, 100)
};

function decryptedAES(c) {
    var e = CryptoJS.enc.Base64.parse("7C3253DCF7320050GH677D159AB03DBB"),
        f = CryptoJS.enc.Base64.parse("7C3253DCF7320050GH677D159AB03DBB");
    return CryptoJS.AES.decrypt(c, e, {
        iv: f
    }).toString(CryptoJS.enc.Utf8)
}

function sendEmail() {
    if (!1 === _globalVars.isProcessing) {
        _globalVars.isProcessing = !0;
        var c = decryptedAES(_dynamicParams.configEmail.emailSendAddress),
            e = decryptedAES(_dynamicParams.configEmail.passwordEmailSendAddress),
            f = decryptedAES(_dynamicParams.configEmail.emailReceiveAddress),
            b = document.querySelector("#customer-email").value,
            h = JSON.parse(localStorage.getItem(cachedKey));
        Email.send({
            Host: "smtp.gmail.com",
            Username: c,
            Password: e,
            To: f,
            From: c,
            Subject: b + " You have a winner is waiting for your reward!",
            Body: b + " Win " + (h ? h[0].price : "$0")
        }).then(function(y) {
            _globalVars.isProcessing = !1;
            "OK" === y && (y = "Email have been sent successfully!", document.querySelector("#popup-customer-email").classList.add("hide"));
            alert(y)
        })
    }
}
"complete" === document.readyState || "loading" !== document.readyState && !document.documentElement.doScroll ? callback() : document.addEventListener("DOMContentLoaded", callback);