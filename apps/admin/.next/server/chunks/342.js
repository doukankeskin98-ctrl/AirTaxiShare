exports.id = 342;
exports.ids = [342];
exports.modules = {

/***/ 43732:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

Promise.resolve(/* import() eager */).then(__webpack_require__.bind(__webpack_require__, 82862))

/***/ }),

/***/ 34700:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

Promise.resolve(/* import() eager */).then(__webpack_require__.t.bind(__webpack_require__, 57159, 23));
Promise.resolve(/* import() eager */).then(__webpack_require__.t.bind(__webpack_require__, 85732, 23));
Promise.resolve(/* import() eager */).then(__webpack_require__.t.bind(__webpack_require__, 80336, 23));
Promise.resolve(/* import() eager */).then(__webpack_require__.t.bind(__webpack_require__, 35680, 23));
Promise.resolve(/* import() eager */).then(__webpack_require__.t.bind(__webpack_require__, 18817, 23))

/***/ }),

/***/ 76695:
/***/ (() => {



/***/ }),

/***/ 82862:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Sidebar": () => (/* binding */ Sidebar)
});

// EXTERNAL MODULE: external "next/dist/compiled/react/jsx-runtime"
var jsx_runtime_ = __webpack_require__(56786);
// EXTERNAL MODULE: ../../node_modules/next/link.js
var next_link = __webpack_require__(8270);
var link_default = /*#__PURE__*/__webpack_require__.n(next_link);
// EXTERNAL MODULE: ../../node_modules/next/navigation.js
var navigation = __webpack_require__(44520);
// EXTERNAL MODULE: ../../node_modules/lucide-react/dist/cjs/lucide-react.js
var lucide_react = __webpack_require__(12067);
// EXTERNAL MODULE: external "next/dist/compiled/react"
var react_ = __webpack_require__(18038);
;// CONCATENATED MODULE: ./app/components/LogoutButton.tsx
/* __next_internal_client_entry_do_not_use__ LogoutButton auto */ 



function LogoutButton({ label  }) {
    const router = (0,navigation.useRouter)();
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
    return /*#__PURE__*/ (0,jsx_runtime_.jsxs)("button", {
        onClick: handleLogout,
        style: {
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 15px",
            borderRadius: 8,
            backgroundColor: "rgba(239, 68, 68, 0.15)",
            color: "#FCA5A5",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            cursor: "pointer",
            textAlign: "left",
            transition: "all 0.2s",
            fontSize: 14,
            fontWeight: 500
        },
        children: [
            /*#__PURE__*/ jsx_runtime_.jsx(lucide_react/* LogOut */.d6Z, {
                size: 16
            }),
            label || "Sign Out"
        ]
    });
}

;// CONCATENATED MODULE: ./app/dictionaries.ts
const dictionaries = {
    tr: {
        dashboard: "Kontrol Paneli",
        users: "Kullanıcı Y\xf6netimi",
        logs: "S\xfcr\xfcş Kayıtları",
        totalUsers: "Toplam Kullanıcı",
        activeUsers: "Aktif Kullanıcı",
        totalMatches: "Toplam Eşleşme",
        completedRides: "Tamamlanan S\xfcr\xfcş",
        projectedRevenue: "Beklenen Ciro (TL)",
        revenueAnalytics: "Ciro & B\xfcy\xfcme Analitiği",
        revenueSubtitle: "Son 7 g\xfcnl\xfck platform hacmi tahmini.",
        liveActivity: "Canlı Sistem Akışı",
        liveSubtitle: "Ger\xe7ek zamanlı eşleşme kayıtları.",
        noData: "G\xf6rselleştirilecek sistem verisi bulunamadı.",
        noActivity: "Sisteminizde hen\xfcz aktivite ger\xe7ekleşmedi.",
        signOut: "\xc7ıkış Yap",
        searchUsers: "İsim veya e-posta ile ara...",
        exportCSV: "CSV Olarak İndir",
        exportData: "Veriyi İndir",
        registeredUsers: "kayıtlı kullanıcı",
        matchStats: "Platform geneli eşleşme istatistikleri",
        user: "Kullanıcı",
        emailPhone: "E-posta / Telefon",
        rating: "Değerlendirme",
        trips: "S\xfcr\xfcşler",
        verified: "Doğrulandı",
        status: "Durum",
        joined: "Kayıt Tarihi",
        matchId: "Eşleşme ID",
        rideTarget: "Hedef",
        user1: "Kullanıcı 1 (Host)",
        user2: "Kullanıcı 2 (Joiner)",
        matchedAt: "Eşleşme Zamanı",
        completedAt: "Tamamlanma Zamanı",
        emptyLogs: "Sistemde hen\xfcz eşleşme kaydı bulunmuyor.",
        emptyUsers: "Sistemde hen\xfcz kullanıcı bulunmuyor.",
        justNow: "Az \xf6nce",
        ago: "\xf6nce",
        mins: "dk",
        hours: "sa",
        days: "g",
        dashboardSubtitle: "Ger\xe7ek zamanlı platform metrikleri \xb7 Canlı veritabanı bağlantısı"
    },
    en: {
        dashboard: "Dashboard",
        users: "User Management",
        logs: "Ride Logs",
        totalUsers: "Total Users",
        activeUsers: "Active Users",
        totalMatches: "Total Matches",
        completedRides: "Completed Rides",
        projectedRevenue: "Projected Revenue (TL)",
        revenueAnalytics: "Revenue & Growth Analytics",
        revenueSubtitle: "Platform volume projected over the last 7 days.",
        liveActivity: "Live Activity Feed",
        liveSubtitle: "Real-time matchmaking audit log.",
        noData: "No growth data available.",
        noActivity: "No recent activity found.",
        signOut: "Sign Out",
        searchUsers: "Search by name or email...",
        exportCSV: "Export to CSV",
        exportData: "Export Data",
        registeredUsers: "registered users",
        matchStats: "Platform-wide match statistics",
        user: "User",
        emailPhone: "Email / Phone",
        rating: "Rating",
        trips: "Trips",
        verified: "Verified",
        status: "Status",
        joined: "Joined",
        matchId: "Match ID",
        rideTarget: "Ride Target (Dest)",
        user1: "User 1 (Host)",
        user2: "User 2 (Joiner)",
        matchedAt: "Matched At",
        completedAt: "Completed At",
        emptyLogs: "No match records found in the system yet.",
        emptyUsers: "No users found in the system yet.",
        justNow: "Just now",
        ago: "ago",
        mins: "m",
        hours: "h",
        days: "d",
        dashboardSubtitle: "Real-time platform metrics \xb7 Live database connection"
    }
};
const getDictionary = (lang)=>dictionaries[lang] || dictionaries.tr;

;// CONCATENATED MODULE: ./app/components/Sidebar.tsx
/* __next_internal_client_entry_do_not_use__ Sidebar auto */ 





function Sidebar({ currentLang  }) {
    const pathname = (0,navigation.usePathname)();
    const t = getDictionary(currentLang);
    const links = [
        {
            href: "/",
            label: t.dashboard,
            icon: lucide_react/* LayoutDashboard */.yYn
        },
        {
            href: "/users",
            label: t.users,
            icon: lucide_react/* Users */.Qaw
        },
        {
            href: "/logs",
            label: t.logs,
            icon: lucide_react/* Clock */.SUY
        }
    ];
    const toggleLang = ()=>{
        const nextLang = currentLang === "en" ? "tr" : "en";
        document.cookie = `admin_lang=${nextLang}; path=/; max-age=31536000`;
        window.location.reload();
    };
    return /*#__PURE__*/ (0,jsx_runtime_.jsxs)("aside", {
        style: {
            width: 260,
            backgroundColor: "#0A1320",
            color: "white",
            padding: 24,
            display: "flex",
            flexDirection: "column",
            borderRight: "1px solid rgba(255,255,255,0.05)"
        },
        children: [
            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                style: {
                    marginBottom: 40,
                    paddingBottom: 24,
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    display: "flex",
                    alignItems: "center",
                    gap: 12
                },
                children: [
                    /*#__PURE__*/ jsx_runtime_.jsx("div", {
                        style: {
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: "linear-gradient(135deg, #00A3FF, #0EA5E9)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "bold"
                        },
                        children: "A"
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("h2", {
                        style: {
                            margin: 0,
                            fontSize: 18,
                            fontWeight: 700,
                            letterSpacing: -0.5
                        },
                        children: "AirTaxi Admin"
                    })
                ]
            }),
            /*#__PURE__*/ jsx_runtime_.jsx("nav", {
                style: {
                    display: "flex",
                    flexDirection: "column",
                    gap: 6
                },
                children: links.map((link)=>{
                    const isActive = pathname === link.href;
                    const Icon = link.icon;
                    return /*#__PURE__*/ (0,jsx_runtime_.jsxs)((link_default()), {
                        href: link.href,
                        className: "sidebar-link",
                        style: {
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "12px 16px",
                            borderRadius: 10,
                            backgroundColor: isActive ? "rgba(14, 165, 233, 0.15)" : "transparent",
                            color: isActive ? "#38BDF8" : "#9CA3AF",
                            fontWeight: isActive ? 600 : 500,
                            transition: "all 0.2s ease",
                            borderLeft: isActive ? "3px solid #38BDF8" : "3px solid transparent"
                        },
                        children: [
                            /*#__PURE__*/ jsx_runtime_.jsx(Icon, {
                                size: 18,
                                strokeWidth: isActive ? 2.5 : 2
                            }),
                            link.label
                        ]
                    }, link.href);
                })
            }),
            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                style: {
                    flex: 1
                }
            }),
            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                style: {
                    paddingTop: 20,
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12
                },
                children: [
                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("button", {
                        onClick: toggleLang,
                        style: {
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "10px 16px",
                            borderRadius: 8,
                            backgroundColor: "rgba(255,255,255,0.05)",
                            color: "#F9FAFB",
                            border: "1px solid rgba(255,255,255,0.1)",
                            cursor: "pointer",
                            transition: "background-color 0.2s",
                            fontWeight: 500
                        },
                        className: "sidebar-link",
                        children: [
                            /*#__PURE__*/ jsx_runtime_.jsx(lucide_react/* Globe */.THo, {
                                size: 18
                            }),
                            currentLang === "en" ? "T\xfcrk\xe7e'ye Ge\xe7" : "Switch to English"
                        ]
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx(LogoutButton, {
                        label: t.signOut
                    })
                ]
            })
        ]
    });
}


/***/ }),

/***/ 83329:
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
var jsx_runtime_ = __webpack_require__(56786);
// EXTERNAL MODULE: ./app/globals.css
var globals = __webpack_require__(35937);
// EXTERNAL MODULE: ../../node_modules/next/dist/build/webpack/loaders/next-flight-loader/module-proxy.js
var module_proxy = __webpack_require__(56673);
;// CONCATENATED MODULE: ./app/components/Sidebar.tsx

const proxy = (0,module_proxy.createProxy)(String.raw`/Users/dogukankeskin/.gemini/antigravity/scratch/AirTaxiShare/apps/admin/app/components/Sidebar.tsx`)

// Accessing the __esModule property and exporting $$typeof are required here.
// The __esModule getter forces the proxy target to create the default export
// and the $$typeof value is for rendering logic to determine if the module
// is a client boundary.
const { __esModule, $$typeof } = proxy;
/* harmony default export */ const Sidebar = (proxy.default);

const e0 = proxy["Sidebar"];

// EXTERNAL MODULE: ../../node_modules/next/headers.js
var headers = __webpack_require__(66824);
;// CONCATENATED MODULE: ./app/layout.tsx




const metadata = {
    title: "AirTaxiShare Admin",
    description: "Admin Panel for AirTaxiShare"
};
function RootLayout({ children  }) {
    const lang = (0,headers.cookies)().get("admin_lang")?.value || "tr";
    const token = (0,headers.cookies)().get("admin_token")?.value;
    // Don't show sidebar on login page
    const isLoginPage = !token;
    return /*#__PURE__*/ (0,jsx_runtime_.jsxs)("html", {
        lang: lang,
        children: [
            /*#__PURE__*/ jsx_runtime_.jsx("head", {
                children: /*#__PURE__*/ jsx_runtime_.jsx("link", {
                    href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
                    rel: "stylesheet"
                })
            }),
            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("body", {
                style: {
                    display: "flex",
                    minHeight: "100vh",
                    backgroundColor: "#0B0F19",
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
                    margin: 0
                },
                children: [
                    !isLoginPage && /*#__PURE__*/ jsx_runtime_.jsx(e0, {
                        currentLang: lang
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("main", {
                        style: {
                            flex: 1,
                            padding: isLoginPage ? 0 : "40px 50px",
                            overflowY: "auto"
                        },
                        children: children
                    })
                ]
            })
        ]
    });
}


/***/ }),

/***/ 19701:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Loading)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(56786);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);

function Loading() {
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
        style: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
            flexDirection: "column",
            gap: 16
        },
        children: [
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                style: {
                    width: 40,
                    height: 40,
                    border: "3px solid rgba(255,255,255,0.1)",
                    borderTopColor: "#4F46E5",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite"
                }
            }),
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("style", {
                children: `@keyframes spin { to { transform: rotate(360deg); } }`
            })
        ]
    });
}


/***/ }),

/***/ 35937:
/***/ (() => {



/***/ })

};
;