exports.id = 224;
exports.ids = [224];
exports.modules = {

/***/ 4700:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

Promise.resolve(/* import() eager */).then(__webpack_require__.t.bind(__webpack_require__, 7159, 23));
Promise.resolve(/* import() eager */).then(__webpack_require__.t.bind(__webpack_require__, 9022, 23));
Promise.resolve(/* import() eager */).then(__webpack_require__.t.bind(__webpack_require__, 336, 23));
Promise.resolve(/* import() eager */).then(__webpack_require__.t.bind(__webpack_require__, 5680, 23));
Promise.resolve(/* import() eager */).then(__webpack_require__.t.bind(__webpack_require__, 8817, 23))

/***/ }),

/***/ 33:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

Promise.resolve(/* import() eager */).then(__webpack_require__.t.bind(__webpack_require__, 9639, 23));
Promise.resolve(/* import() eager */).then(__webpack_require__.bind(__webpack_require__, 2128))

/***/ }),

/***/ 2128:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "LogoutButton": () => (/* binding */ LogoutButton)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6786);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(8038);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var next_navigation__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(4520);
/* harmony import */ var next_navigation__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_navigation__WEBPACK_IMPORTED_MODULE_2__);
/* __next_internal_client_entry_do_not_use__ LogoutButton auto */ 


function LogoutButton() {
    const router = (0,next_navigation__WEBPACK_IMPORTED_MODULE_2__.useRouter)();
    const handleLogout = async ()=>{
        try {
            await fetch("/api/auth/logout", {
                method: "POST"
            });
            router.push("/login");
            router.refresh();
        } catch (error) {
            console.error("Logout failed", error);
        }
    };
    return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("button", {
        onClick: handleLogout,
        style: {
            width: "100%",
            padding: "10px 15px",
            borderRadius: 8,
            backgroundColor: "rgba(239, 68, 68, 0.15)",
            color: "#FCA5A5",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            cursor: "pointer",
            textAlign: "left",
            marginTop: "auto",
            transition: "all 0.2s"
        },
        children: "\uD83D\uDEAA Sign Out"
    });
}


/***/ }),

/***/ 6494:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ RootLayout),
  "metadata": () => (/* binding */ metadata)
});

// EXTERNAL MODULE: external "next/dist/compiled/react/jsx-runtime"
var jsx_runtime_ = __webpack_require__(6786);
// EXTERNAL MODULE: ./app/globals.css
var globals = __webpack_require__(5937);
// EXTERNAL MODULE: ../../node_modules/next/link.js
var next_link = __webpack_require__(3614);
var link_default = /*#__PURE__*/__webpack_require__.n(next_link);
// EXTERNAL MODULE: ../../node_modules/next/dist/build/webpack/loaders/next-flight-loader/module-proxy.js
var module_proxy = __webpack_require__(6673);
;// CONCATENATED MODULE: ./app/components/LogoutButton.tsx

const proxy = (0,module_proxy.createProxy)(String.raw`/Users/dogukankeskin/.gemini/antigravity/scratch/AirTaxiShare/apps/admin/app/components/LogoutButton.tsx`)

// Accessing the __esModule property and exporting $$typeof are required here.
// The __esModule getter forces the proxy target to create the default export
// and the $$typeof value is for rendering logic to determine if the module
// is a client boundary.
const { __esModule, $$typeof } = proxy;
/* harmony default export */ const LogoutButton = (proxy.default);

const e0 = proxy["LogoutButton"];

;// CONCATENATED MODULE: ./app/layout.tsx




const metadata = {
    title: "AirTaxiShare Admin",
    description: "Admin Panel for AirTaxiShare"
};
function RootLayout({ children  }) {
    return /*#__PURE__*/ jsx_runtime_.jsx("html", {
        lang: "en",
        children: /*#__PURE__*/ (0,jsx_runtime_.jsxs)("body", {
            style: {
                display: "flex",
                minHeight: "100vh"
            },
            children: [
                /*#__PURE__*/ (0,jsx_runtime_.jsxs)("aside", {
                    style: {
                        width: 250,
                        backgroundColor: "#0A2540",
                        color: "white",
                        padding: 20
                    },
                    children: [
                        /*#__PURE__*/ jsx_runtime_.jsx("h2", {
                            style: {
                                marginBottom: 40,
                                borderBottom: "1px solid #333",
                                paddingBottom: 20
                            },
                            children: "AirTaxiShare"
                        }),
                        /*#__PURE__*/ (0,jsx_runtime_.jsxs)("nav", {
                            style: {
                                display: "flex",
                                flexDirection: "column",
                                gap: 10
                            },
                            children: [
                                /*#__PURE__*/ jsx_runtime_.jsx((link_default()), {
                                    href: "/",
                                    style: navItemStyle,
                                    children: "Dashboard"
                                }),
                                /*#__PURE__*/ jsx_runtime_.jsx((link_default()), {
                                    href: "/users",
                                    style: navItemStyle,
                                    children: "User Management"
                                }),
                                /*#__PURE__*/ jsx_runtime_.jsx((link_default()), {
                                    href: "/logs",
                                    style: navItemStyle,
                                    children: "Ride Logs"
                                }),
                                /*#__PURE__*/ jsx_runtime_.jsx((link_default()), {
                                    href: "/settings",
                                    style: navItemStyle,
                                    children: "Settings"
                                })
                            ]
                        }),
                        /*#__PURE__*/ jsx_runtime_.jsx("div", {
                            style: {
                                flex: 1
                            }
                        }),
                        /*#__PURE__*/ jsx_runtime_.jsx(e0, {})
                    ]
                }),
                /*#__PURE__*/ jsx_runtime_.jsx("main", {
                    style: {
                        flex: 1,
                        padding: 40,
                        overflowY: "auto"
                    },
                    children: children
                })
            ]
        })
    });
}
const navItemStyle = {
    padding: "10px 15px",
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "#ddd",
    display: "block",
    marginBottom: 5
};


/***/ }),

/***/ 5937:
/***/ (() => {



/***/ })

};
;