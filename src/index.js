'use strict';

/**
 * Randomizes the puppeteer fingerprint
 * @return {object}
 */
const protectPage = (page, options = {}) => {

    page.evaluateOnNewDocument(
        (options) => {
            window.afpOptions = options;
            // Canvas Def
            const getImageData = CanvasRenderingContext2D.prototype.getImageData;

            const noisify = (canvas, context) => {
                if (context) {
                    const shift = {
                        r: window.afpOptions.options.canvasRgba                        ? window.afpOptions.options.canvasRgba[0]                        : Math.floor(Math.random() * 10) - 5,
                        g: window.afpOptions.options.canvasRgba                        ? window.afpOptions.options.canvasRgba[1]                        : Math.floor(Math.random() * 10) - 5,
                        b: window.afpOptions.options.canvasRgba                        ? window.afpOptions.options.canvasRgba[2]                        : Math.floor(Math.random() * 10) - 5,
                        a: window.afpOptions.options.canvasRgba                        ? window.afpOptions.options.canvasRgba[3]                        : Math.floor(Math.random() * 10) - 5,
                    };
                    const width = canvas.width;
                    const height = canvas.height;

                    if (width && height) {
                        const imageData = getImageData.apply(context, [0, 0, width, height]);

                        for (let i = 0; i < height; i++) 
                            for (let j = 0; j < width; j++) {
                                const n = i * (width * 4) + j * 4;
                                imageData.data[n + 0] = imageData.data[n + 0] + shift.r;
                                imageData.data[n + 1] = imageData.data[n + 1] + shift.g;
                                imageData.data[n + 2] = imageData.data[n + 2] + shift.b;
                                imageData.data[n + 3] = imageData.data[n + 3] + shift.a;
                            }
                    

                        context.putImageData(imageData, 0, 0);
                    }
                }
            };

            HTMLCanvasElement.prototype.toBlob = new Proxy(HTMLCanvasElement.prototype.toBlob, {
                apply(target, self, args) {
                    noisify(self, self.getContext('2d'));

                    return Reflect.apply(target, self, args);
                },
            });

            HTMLCanvasElement.prototype.toDataURL = new Proxy(HTMLCanvasElement.prototype.toDataURL, {
                apply(target, self, args) {
                    noisify(self, self.getContext('2d'));

                    return Reflect.apply(target, self, args);
                },
            });

            CanvasRenderingContext2D.prototype.getImageData = new Proxy(
                CanvasRenderingContext2D.prototype.getImageData,
                {
                    apply(target, self, args) {
                        noisify(self.canvas, self);

                        return Reflect.apply(target, self, args);
                    },
                }
            );

            //Webgl def
            const config = {
                random: {
                    value: () => {
                        return Math.random();
                    },
                    item: (e) => {
                        const rand = e.length * config.random.value();
                        return e[Math.floor(rand)];
                    },
                    number: (power) => {
                        const tmp = [];
                        for (let i = 0; i < power.length; i++) 
                            tmp.push(Math.pow(2, power[i]));
                    

                        return config.random.item(tmp);
                    },
                    int: (power) => {
                        const tmp = [];
                        for (let i = 0; i < power.length; i++) {
                            const n = Math.pow(2, power[i]);
                            tmp.push(new Int32Array([n, n]));
                        }

                        return config.random.item(tmp);
                    },
                    float: (power) => {
                        const tmp = [];
                        for (let i = 0; i < power.length; i++) {
                            const n = Math.pow(2, power[i]);
                            tmp.push(new Float32Array([1, n]));
                        }

                        return config.random.item(tmp);
                    },
                },
                spoof: {
                    webgl: {
                        buffer: (target) => {
                            const proto = target.prototype ? target.prototype : target.__proto__;

                            proto.bufferData = new Proxy(proto.bufferData, {
                                apply(target, self, args) {
                                    const index = Math.floor(config.random.value() * args[1].length);
                                    const noise =                                    args[1][index] !== undefined ? 0.1 * config.random.value() * args[1][index] : 0;

                                    args[1][index] = args[1][index] + noise;

                                    return Reflect.apply(target, self, args);
                                },
                            });
                        },
                        parameter: (target) => {
                            const proto = target.prototype ? target.prototype : target.__proto__;

                            proto.getParameter = new Proxy(proto.getParameter, {
                                apply(target, receiver, args) {
                                    if (args[0] === 3415) return 0;
                                    else if (args[0] === 3414) return 24;
                                    else if (args[0] === 36348) return 30;
                                    else if (args[0] === 7936) return 'WebKit';
                                    else if (args[0] === 37445) return 'Google Inc.';
                                    else if (args[0] === 7937) return 'WebKit WebGL';
                                    else if (args[0] === 3379)
                                        return window.afpOptions.options.webglData                                        ? window.afpOptions.options.webglData['3378']                                        : config.random.number([14, 15]);
                                    else if (args[0] === 36347)
                                        return window.afpOptions.options.webglData                                        ? window.afpOptions.options.webglData['36347']                                        : config.random.number([12, 13]);
                                    else if (args[0] === 34076)
                                        return window.afpOptions.options.webglData                                        ? window.afpOptions.options.webglData['34076']                                        : config.random.number([14, 15]);
                                    else if (args[0] === 34024)
                                        return window.afpOptions.options.webglData                                        ? window.afpOptions.options.webglData['34024']                                        : config.random.number([14, 15]);
                                    else if (args[0] === 3386)
                                        return window.afpOptions.options.webglData                                        ? window.afpOptions.options.webglData['3386']                                        : config.random.int([13, 14, 15]);
                                    else if (args[0] === 3413)
                                        return window.afpOptions.options.webglData                                        ? window.afpOptions.options.webglData['3413']                                        : config.random.number([1, 2, 3, 4]);
                                    else if (args[0] === 3412)
                                        return window.afpOptions.options.webglData                                        ? window.afpOptions.options.webglData['3412']                                        : config.random.number([1, 2, 3, 4]);
                                    else if (args[0] === 3411)
                                        return window.afpOptions.options.webglData                                        ? window.afpOptions.options.webglData['3411']                                        : config.random.number([1, 2, 3, 4]);
                                    else if (args[0] === 3410)
                                        return window.afpOptions.options.webglData                                        ? window.afpOptions.options.webglData['3410']                                        : config.random.number([1, 2, 3, 4]);
                                    else if (args[0] === 34047)
                                        return window.afpOptions.options.webglData                                        ? window.afpOptions.options.webglData['34047']                                        : config.random.number([1, 2, 3, 4]);
                                    else if (args[0] === 34930)
                                        return window.afpOptions.options.webglData                                        ? window.afpOptions.options.webglData['34930']                                        : config.random.number([1, 2, 3, 4]);
                                    else if (args[0] === 34921)
                                        return window.afpOptions.options.webglData                                        ? window.afpOptions.options.webglData['34921']                                        : config.random.number([1, 2, 3, 4]);
                                    else if (args[0] === 35660)
                                        return window.afpOptions.options.webglData                                        ? window.afpOptions.options.webglData['35660']                                        : config.random.number([1, 2, 3, 4]);
                                    else if (args[0] === 35661)
                                        return window.afpOptions.options.webglData                                        ? window.afpOptions.options.webglData['35661']                                        : config.random.number([4, 5, 6, 7, 8]);
                                    else if (args[0] === 36349)
                                        return window.afpOptions.options.webglData                                        ? window.afpOptions.options.webglData['36349']                                        : config.random.number([10, 11, 12, 13]);
                                    else if (args[0] === 33902)
                                        return window.afpOptions.options.webglData                                        ? window.afpOptions.options.webglData['33902']                                        : config.random.float([0, 10, 11, 12, 13]);
                                    else if (args[0] === 33901)
                                        return window.afpOptions.options.webglData                                        ? window.afpOptions.options.webglData['33901']                                        : config.random.float([0, 10, 11, 12, 13]);
                                    else if (args[0] === 37446)
                                        return window.afpOptions.options.webglData                                        ? window.afpOptions.options.webglData['37446']                                        : config.random.item(['Graphics', 'HD Graphics', 'Intel(R) HD Graphics']);
                                    else if (args[0] === 7938)
                                        return window.afpOptions.options.webglData                                        ? window.afpOptions.options.webglData['7938']                                        : config.random.item([
                                            'WebGL 1.0',
                                            'WebGL 1.0 (OpenGL)',
                                            'WebGL 1.0 (OpenGL Chromium)',
                                        ]);
                                    else if (args[0] === 35724)
                                        return window.afpOptions.options.webglData                                        ? window.afpOptions.options.webglData['35724']                                        : config.random.item([
                                            'WebGL',
                                            'WebGL GLSL',
                                            'WebGL GLSL ES',
                                            'WebGL GLSL ES (OpenGL Chromium',
                                        ]);

                                    return Reflect.apply(target, receiver, args);
                                },
                            });
                        },
                    },
                },
            };

            config.spoof.webgl.buffer(WebGLRenderingContext);
            config.spoof.webgl.buffer(WebGL2RenderingContext);
            config.spoof.webgl.parameter(WebGLRenderingContext);
            config.spoof.webgl.parameter(WebGL2RenderingContext);

            // Font def
            const rand = {
                noise: () => {
                    const SIGN = Math.random() < Math.random() ? -1 : 1;
                    return window.afpOptions.options.fontFingerprint                    ? window.afpOptions.options.fontFingerprint.noise                    : Math.floor(Math.random() + SIGN * Math.random());
                },
                sign: () => {
                    const tmp = [-1, -1, -1, -1, -1, -1, +1, -1, -1, -1];
                    const index = Math.floor(Math.random() * tmp.length);
                    return window.afpOptions.options.fontFingerprint                    ? window.afpOptions.options.fontFingerprint.sign                    : tmp[index];
                },
            };

            Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
                get: new Proxy(Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight').get, {
                    apply(target, self, args) {
                        try {
                            const height = Math.floor(self.getBoundingClientRect().height);
                            const valid = height && rand.sign() === 1;
                            const result = valid ? height + rand.noise() : height;

                            return result;
                        }
                        catch (e) {
                        //return Reflect.apply(target, self, args);
                        }
                    },
                }),
            });

            Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
                get: new Proxy(Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth').get, {
                    apply(target, self, args) {
                        const width = Math.floor(self.getBoundingClientRect().width);
                        const valid = width && rand.sign() === 1;
                        const result = valid ? width + rand.noise() : width;

                        return result;
                    },
                }),
            });

            //Aud def
            const context = {
                BUFFER: null,
                getChannelData: function (e) {
                    e.prototype.getChannelData = new Proxy(e.prototype.getChannelData, {
                        apply(target, self, args) {
                            const results_1 = Reflect.apply(target, self, args);

                            if (context.BUFFER !== results_1) {
                                context.BUFFER = results_1;

                                for (let i = 0; i < results_1.length; i += 100) {
                                    const index = Math.floor(
                                        (window.afpOptions.options.audioFingerprint                                        ? window.afpOptions.options.audioFingerprint.getChannelDataIndexRandom                                        : Math.random()) * i
                                    );
                                    results_1[index] =                                    results_1[index] +                                    (window.afpOptions.options.audioFingerprint                                        ? window.afpOptions.options.audioFingerprint.getChannelDataResultRandom                                        : Math.random()) *                                        0.0000001;
                                }
                            }

                            return results_1;
                        },
                    });
                },
                createAnalyser: function (e) {
                    e.prototype.__proto__.createAnalyser = new Proxy(e.prototype.__proto__.createAnalyser, {
                        apply(target, self, args) {
                            const results_2 = Reflect.apply(target, self, args);

                            results_2.__proto__.getFloatFrequencyData = new Proxy(
                                results_2.__proto__.getFloatFrequencyData,
                                {
                                    apply(target, self, args) {
                                        const results_3 = Reflect.apply(target, self, args);

                                        for (let i = 0; i < arguments[0].length; i += 100) {
                                            const index = Math.floor(
                                                (window.afpOptions.options.audioFingerprint                                                ? window.afpOptions.options.audioFingerprint
                                                    .createAnalyserIndexRandom                                                : Math.random()) * i
                                            );
                                            arguments[0][index] =                                            arguments[0][index] +                                            (window.afpOptions.options.audioFingerprint                                                ? window.afpOptions.options.audioFingerprint
                                                .createAnalyserResultRandom                                                : Math.random()) *                                                0.1;
                                        }

                                        return results_3;
                                    },
                                }
                            );

                            return results_2;
                        },
                    });
                },
            };

            context.getChannelData(AudioBuffer);
            context.createAnalyser(AudioContext);
            context.createAnalyser(OfflineAudioContext);
            if (window.afpOptions.options.webRTCProtect) navigator.mediaDevices.getUserMedia =            navigator.webkitGetUserMedia =            navigator.mozGetUserMedia =            navigator.getUserMedia =            webkitRTCPeerConnection =            RTCPeerConnection =            MediaStreamTrack =                undefined;
            const newProto = navigator.__proto__;
            delete newProto.webdriver;
            navigator.__proto__ = newProto;
        },
        { options }
    );
    return page;
};

const protectedBrowser = async (browser, options = {}) => {
    const protectedBrowser = browser;
    protectedBrowser.newProtectedPage = async () => {
        const page = await browser.newPage();
        await protectPage(page, options);
        return page;
    };
    return protectedBrowser;
};

module.exports = {
    protectPage,
    protectedBrowser,
};
