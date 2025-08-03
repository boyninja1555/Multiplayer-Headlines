import { useEffect, useRef, useState, type FormEvent } from "react"
import makeApiCall from "./utils/api-call"

const MAX_HEADLINES = 5
const SCROLL_SPEED = 2

const API_URL = import.meta.env.VITE_API_URL as string

export interface SubmitResponseType {
    isError: boolean
    message: string
}

export default function App() {
    const [headlines, setHeadlines] = useState<string[]>([])
    const [input, setInput] = useState("")
    const [tickerOffset, setTickerOffset] = useState(0)
    const [submitResp, setSubmitResp] = useState<SubmitResponseType | null>(null)
    const tickerRef = useRef<HTMLDivElement | null>(null)
    const tickerOffsetRef = useRef(0)

    useEffect(() => {
        async function fetchLatestHeadline() {
            try {
                // const resp = await fetch(`${API_URL}/headline`)
                const resp = await fetch(`${API_URL}/headline`)
                const data = await resp.text()
                const latestHeadline = data.trim()
                setHeadlines(prev => {
                    const updated = [...prev, latestHeadline]
                    return updated.slice(-MAX_HEADLINES)
                })
            } catch (error) {
                console.error("Failed to fetch latest headline!", error)
            }
        }

        fetchLatestHeadline()
        const headlineInterval = setInterval(fetchLatestHeadline, 5000)
        const scrollInterval = setInterval(() => {
            const ticker = tickerRef.current
            if (!ticker) return

            const contentWidth = ticker.scrollWidth
            const containerWidth = ticker.parentElement?.getBoundingClientRect().width || 0
            setTickerOffset(prev => {
                const next = prev - SCROLL_SPEED
                tickerOffsetRef.current = next

                if (Math.abs(next) > contentWidth) {
                    return containerWidth
                }

                return next
            })
        }, 16)

        return () => {
            clearInterval(headlineInterval)
            clearInterval(scrollInterval)
        }
    }, [])

    return (
        <div className="min-h-screen flex flex-col items-center justify-between px-4 py-8 gap-8">
            <header className="text-center">
                <h1 className="text-4xl font-bold tracking-tight">Multiplayer Headlines</h1>
                <p className="mt-2 text-lg">Submit a headline to join the real-time ticker.</p>
            </header>

            <main className="w-full max-w-xl space-y-6">
                <div className="rounded-lg p-4 _border bg-background-2">
                    <h2 className="text-xl font-semibold mb-2">Latest Headline</h2>
                    <div className="overflow-hidden whitespace-nowrap ticker-mask">
                        <div className="text-base sm:text-lg md:text-xl font-medium text-foreground-2">
                            <div ref={tickerRef} id="ticker-headlines-wrapper" className="flex items-center gap-[1rem]" style={{ transform: `translateX(${tickerOffset}px)` }}>
                                {headlines.map((headline: string, index: number) => (
                                    <span key={`${index}-${headline}`} className="inline-block">
                                        {headline}
                                        {index < headlines.length - 1 && <span className="ml-[1rem]">•</span>}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={async (event: FormEvent) => {
                    event.preventDefault()

                    if (!input.trim()) return

                    const response = await makeApiCall("/headline", "put", { headline: input.trim(), })
                    setSubmitResp({
                        isError: !response.status,
                        message: response.message || (response.status ? "Headline submitted successfully!" : "Failed to submit headline!"),
                    })

                    if (response.status) {
                        setHeadlines(prev => {
                            const updated = [...prev, input.trim()]
                            return updated.slice(-MAX_HEADLINES)
                        })
                        setInput("")
                    } else {
                        console.error("Failed to submit headline!", response.message)
                    }
                }} className="flex flex-col gap-[.2rem]">
                    <div className="flex gap-4">
                        <input
                            aria-label="Headline input"
                            type="text"
                            placeholder="Type..."
                            value={input}
                            minLength={1}
                            maxLength={50}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setInput(event.target.value)}
                        />
                        <div className="text-right">
                            <button aria-label="Submit headline" type="submit" disabled={!input.trim()}>
                                Submit
                            </button>
                        </div>
                    </div>

                    {submitResp && (
                        <div className={`mt-2 text-sm ${submitResp.isError ? "text-red-500" : "text-green-500"}`}>
                            {submitResp.message}
                        </div>
                    )}
                </form>
            </main>

            <footer className="text-sm text-foreground-2">
                &copy; {new Date().getFullYear()} Multiplayer Headlines
            </footer>
        </div>
    )
}
