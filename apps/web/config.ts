// export const HTTP_BACKEND = "http://localhost:3001";
// export const WS_BACKEND = "http://localhost:8081";


export const HTTP_BACKEND = process.env.NEXT_PUBLIC_HTTP_BACKEND || "http://localhost:3001";

export const WS_BACKEND = process.env.NEXT_PUBLIC_WS_BACKEND || "ws://localhost:8081";