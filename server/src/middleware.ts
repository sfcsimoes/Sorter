export { default } from "next-auth/middleware"


export const config = { matcher: ["/", "/products", "/orders", "/warehouses", "/users"] }