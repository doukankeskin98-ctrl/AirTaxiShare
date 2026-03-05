"use strict";
(() => {
var exports = {};
exports.id = 932;
exports.ids = [932];
exports.modules = {

/***/ 97783:
/***/ ((module) => {

module.exports = require("next/dist/compiled/@edge-runtime/cookies");

/***/ }),

/***/ 28530:
/***/ ((module) => {

module.exports = require("next/dist/compiled/@opentelemetry/api");

/***/ }),

/***/ 54426:
/***/ ((module) => {

module.exports = require("next/dist/compiled/chalk");

/***/ }),

/***/ 40252:
/***/ ((module) => {

module.exports = require("next/dist/compiled/cookie");

/***/ }),

/***/ 6372:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "headerHooks": () => (/* binding */ headerHooks),
  "originalPathname": () => (/* binding */ originalPathname),
  "requestAsyncStorage": () => (/* binding */ requestAsyncStorage),
  "routeModule": () => (/* binding */ routeModule),
  "serverHooks": () => (/* binding */ serverHooks),
  "staticGenerationAsyncStorage": () => (/* binding */ staticGenerationAsyncStorage),
  "staticGenerationBailout": () => (/* binding */ staticGenerationBailout)
});

// NAMESPACE OBJECT: ./app/api/auth/route.ts
var route_namespaceObject = {};
__webpack_require__.r(route_namespaceObject);
__webpack_require__.d(route_namespaceObject, {
  "POST": () => (POST)
});

// EXTERNAL MODULE: ../../node_modules/next/dist/server/node-polyfill-headers.js
var node_polyfill_headers = __webpack_require__(48302);
// EXTERNAL MODULE: ../../node_modules/next/dist/server/future/route-modules/app-route/module.js
var app_route_module = __webpack_require__(33232);
var module_default = /*#__PURE__*/__webpack_require__.n(app_route_module);
// EXTERNAL MODULE: ../../node_modules/next/dist/server/web/exports/next-response.js
var next_response = __webpack_require__(10274);
;// CONCATENATED MODULE: ./app/api/auth/route.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://airtaxishare-api.onrender.com";
async function POST(request) {
    try {
        const body = await request.json();
        const { email , password  } = body;
        const res = await fetch(`${API_URL}/auth/admin-login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });
        const data = await res.json();
        if (!res.ok) {
            return next_response/* default.json */.Z.json({
                error: data.message || "Invalid credentials"
            }, {
                status: res.status
            });
        }
        // Successfully authenticated, extract token
        const token = data.accessToken;
        // Set secured, HTTP-only cookie via the Next.js Response Object
        const response = next_response/* default.json */.Z.json({
            success: true,
            user: data.user
        });
        response.cookies.set({
            name: "admin_token",
            value: token,
            httpOnly: true,
            secure: "production" === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24
        });
        return response;
    } catch (error) {
        return next_response/* default.json */.Z.json({
            error: "Internal server error"
        }, {
            status: 500
        });
    }
}

;// CONCATENATED MODULE: ../../node_modules/next/dist/build/webpack/loaders/next-app-loader.js?page=%2Fapi%2Fauth%2Froute&name=app%2Fapi%2Fauth%2Froute&pagePath=private-next-app-dir%2Fapi%2Fauth%2Froute.ts&appDir=%2FUsers%2Fdogukankeskin%2F.gemini%2Fantigravity%2Fscratch%2FAirTaxiShare%2Fapps%2Fadmin%2Fapp&appPaths=%2Fapi%2Fauth%2Froute&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&assetPrefix=&nextConfigOutput=&preferredRegion=!

    

    

    

    const routeModule = new (module_default())({
    userland: route_namespaceObject,
    pathname: "/api/auth",
    resolvedPagePath: "/Users/dogukankeskin/.gemini/antigravity/scratch/AirTaxiShare/apps/admin/app/api/auth/route.ts",
    nextConfigOutput: undefined,
  })

    // Pull out the exports that we need to expose from the module. This should
    // be eliminated when we've moved the other routes to the new format. These
    // are used to hook into the route.
    const {
      requestAsyncStorage,
      staticGenerationAsyncStorage,
      serverHooks,
      headerHooks,
      staticGenerationBailout
    } = routeModule

    const originalPathname = "/api/auth/route"

    

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [534,963], () => (__webpack_exec__(6372)));
module.exports = __webpack_exports__;

})();