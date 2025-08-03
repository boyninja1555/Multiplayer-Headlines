import type ApiResponse from "../types/api-response"

const API_URL = import.meta.env.VITE_API_URL as string

export default async function makeApiCall(path: string, method: string, body?: object): Promise<ApiResponse> {
    try {
        const resp = await fetch(`${API_URL}${path}`, {
            method: method.toUpperCase(),
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify(body || {}),
        })
        const data = await resp.json() as ApiResponse

        if (!resp.ok) {
            throw new Error(data.message || "Unknown error!")
        }

        if (!data || typeof data !== "object" || !("status" in data)) {
            throw new Error("Invalid API response format!")
        }

        if (!data.status) {
            throw new Error(data.message)
        }

        return data
    } catch (error) {
        return {
            context: "unknown",
            status: false,
            message: error instanceof Error ? error.message : "Unknown error occured!",
            code: 500,
            timestamp: new Date().toISOString(),
            data: {},
        }
    }
}
