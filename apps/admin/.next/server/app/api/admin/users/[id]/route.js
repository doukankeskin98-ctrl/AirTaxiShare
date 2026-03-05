"use strict";
(() => {
var exports = {};
exports.id = 317;
exports.ids = [317];
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

/***/ 49113:
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

// NAMESPACE OBJECT: ./app/api/admin/users/[id]/route.ts
var route_namespaceObject = {};
__webpack_require__.r(route_namespaceObject);
__webpack_require__.d(route_namespaceObject, {
  "PATCH": () => (PATCH)
});

// EXTERNAL MODULE: ../../node_modules/next/dist/server/node-polyfill-headers.js
var node_polyfill_headers = __webpack_require__(48302);
// EXTERNAL MODULE: ../../node_modules/next/dist/server/future/route-modules/app-route/module.js
var app_route_module = __webpack_require__(33232);
var module_default = /*#__PURE__*/__webpack_require__.n(app_route_module);
// EXTERNAL MODULE: ../../node_modules/next/dist/server/web/exports/next-response.js
var next_response = __webpack_require__(10274);
// EXTERNAL MODULE: ../../node_modules/next/headers.js
var headers = __webpack_require__(66824);
;// CONCATENATED MODULE: ./app/api/admin/users/[id]/route.ts


const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://airtaxishare-api.onrender.com";
/**
 * Proxy admin user actions through Next.js API route
 * so the httpOnly admin_token cookie is automatically included.
 */ async function PATCH(request, { params  }) {
    const token = (0,headers.cookies)().get("admin_token")?.value;
    if (!token) {
        return next_response/* default.json */.Z.json({
            error: "Unauthorized"
        }, {
            status: 401
        });
    }
    try {
        const body = await request.json();
        const res = await fetch(`${API_URL}/admin/users/${params.id}/status`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        return next_response/* default.json */.Z.json(data, {
            status: res.status
        });
    } catch (error) {
        return next_response/* default.json */.Z.json({
            error: "Internal server error"
        }, {
            status: 500
        });
    }
}

;// CONCATENATED MODULE: ../../node_modules/next/dist/build/webpack/loaders/next-app-loader.js?page=%2Fapi%2Fadmin%2Fusers%2F%5Bid%5D%2Froute&name=app%2Fapi%2Fadmin%2Fusers%2F%5Bid%5D%2Froute&pagePath=private-next-app-dir%2Fapi%2Fadmin%2Fusers%2F%5Bid%5D%2Froute.ts&appDir=%2FUsers%2Fdogukankeskin%2F.gemini%2Fantigravity%2Fscratch%2FAirTaxiShare%2Fapps%2Fadmin%2Fapp&appPaths=%2Fapi%2Fadmin%2Fusers%2F%5Bid%5D%2Froute&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&assetPrefix=&nextConfigOutput=&preferredRegion=!

    

    

    

    const routeModule = new (module_default())({
    userland: route_namespaceObject,
    pathname: "/api/admin/users/[id]",
    resolvedPagePath: "/Users/dogukankeskin/.gemini/antigravity/scratch/AirTaxiShare/apps/admin/app/api/admin/users/[id]/route.ts",
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

    const originalPathname = "/api/admin/users/[id]/route"

    

/***/ }),

/***/ 66824:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


module.exports = __webpack_require__(14534);


/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [534,963], () => (__webpack_exec__(49113)));
module.exports = __webpack_exports__;

})();