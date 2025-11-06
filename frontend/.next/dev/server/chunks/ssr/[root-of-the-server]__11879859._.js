module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/api.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "apiClient",
    ()=>apiClient
]);
const API_BASE_URL = ("TURBOPACK compile-time value", "http://localhost:8000");
class ApiClient {
    getHeaders(includeAuth = true) {
        const headers = {
            "Content-Type": "application/json"
        };
        if (includeAuth) {
            const token = localStorage.getItem("access_token");
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }
        }
        return headers;
    }
    async login(credentials) {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: credentials.email,
                password: credentials.password
            })
        });
        if (!response.ok) {
            throw new Error("Login failed");
        }
        const data = await response.json();
        localStorage.setItem("access_token", data.access_token);
        return data;
    }
    async register(data) {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
            method: "POST",
            headers: this.getHeaders(false),
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error("Registration failed");
        }
        return response.json();
    }
    async getCurrentUser() {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
            headers: this.getHeaders()
        });
        if (!response.ok) {
            throw new Error("Failed to get user");
        }
        return response.json();
    }
    async fetchWithAuth(url, options = {}) {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...options.headers
            }
        });
        if (response.status === 401) {
            localStorage.removeItem("access_token");
            window.location.href = "/login";
            throw new Error("Unauthorized");
        }
        return response;
    }
    logout() {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
    }
    async getProperties() {
        const response = await this.fetchWithAuth("/api/v1/properties");
        if (!response.ok) {
            throw new Error("Failed to fetch properties");
        }
        const result = await response.json();
        return result.data;
    }
    async createProperty(data) {
        const response = await this.fetchWithAuth("/api/v1/properties", {
            method: "POST",
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error("Failed to create property");
        }
        return response.json();
    }
    async updateProperty(id, data) {
        const response = await this.fetchWithAuth(`/api/v1/properties/${id}`, {
            method: "PUT",
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error("Failed to update property");
        }
        return response.json();
    }
    async deleteProperty(id) {
        const response = await this.fetchWithAuth(`/api/v1/properties/${id}`, {
            method: "DELETE"
        });
        if (!response.ok) {
            throw new Error("Failed to delete property");
        }
    }
    async getRentals() {
        const response = await this.fetchWithAuth("/api/v1/rentals");
        if (!response.ok) {
            throw new Error("Failed to fetch rentals");
        }
        const result = await response.json();
        return result.data;
    }
    async createRental(data) {
        const response = await this.fetchWithAuth("/api/v1/rentals", {
            method: "POST",
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error("Failed to create rental");
        }
        return response.json();
    }
    async updateRental(id, data) {
        const response = await this.fetchWithAuth(`/api/v1/rentals/${id}`, {
            method: "PUT",
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error("Failed to update rental");
        }
        return response.json();
    }
    async deleteRental(id) {
        const response = await this.fetchWithAuth(`/api/v1/rentals/${id}`, {
            method: "DELETE"
        });
        if (!response.ok) {
            throw new Error("Failed to delete rental");
        }
    }
    async getExpenses() {
        const response = await this.fetchWithAuth("/api/v1/expenses");
        if (!response.ok) {
            throw new Error("Failed to fetch expenses");
        }
        const result = await response.json();
        return result.data;
    }
    async createExpense(data) {
        const response = await this.fetchWithAuth("/api/v1/expenses", {
            method: "POST",
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error("Failed to create expense");
        }
        return response.json();
    }
    async updateExpense(id, data) {
        const response = await this.fetchWithAuth(`/api/v1/expenses/${id}`, {
            method: "PUT",
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error("Failed to update expense");
        }
        return response.json();
    }
    async deleteExpense(id) {
        const response = await this.fetchWithAuth(`/api/v1/expenses/${id}`, {
            method: "DELETE"
        });
        if (!response.ok) {
            throw new Error("Failed to delete expense");
        }
    }
    async getPropertyValuation(data) {
        const response = await this.fetchWithAuth("/api/v1/predict-value", {
            method: "POST",
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error("Failed to get valuation");
        }
        return response.json();
    }
    async sendChatMessage(message, history) {
        const response = await this.fetchWithAuth("/api/v1/chat", {
            method: "POST",
            body: JSON.stringify({
                message,
                history
            })
        });
        if (!response.ok) {
            throw new Error("Failed to send chat message");
        }
        return response.json();
    }
}
const apiClient = new ApiClient();
}),
"[project]/lib/auth-context.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function AuthProvider({ children }) {
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const token = localStorage.getItem("access_token");
        if (token) {
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiClient"].getCurrentUser().then(setUser).catch(()=>{
                localStorage.removeItem("access_token");
            }).finally(()=>setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);
    const login = async (email, password)=>{
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiClient"].login({
            email,
            password
        });
        const userData = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiClient"].getCurrentUser();
        setUser(userData);
    };
    const logout = ()=>{
        setUser(null);
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiClient"].logout();
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            loading,
            login,
            logout,
            isAuthenticated: !!user
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/lib/auth-context.tsx",
        lineNumber: 48,
        columnNumber: 5
    }, this);
}
function useAuth() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/dynamic-access-async-storage.external.js [external] (next/dist/server/app-render/dynamic-access-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/dynamic-access-async-storage.external.js", () => require("next/dist/server/app-render/dynamic-access-async-storage.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__11879859._.js.map