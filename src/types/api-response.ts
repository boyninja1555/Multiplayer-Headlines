export default interface ApiResponse {
    context: string
    status: boolean
    message?: string
    code: number
    timestamp: string
    data: object
}
