import { NextRequest, NextResponse } from "next/server"

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"

async function proxy(req: NextRequest, params: { path: string[] }) {
  const path = params.path.join("/")
  const url = `${BACKEND}/${path}${req.nextUrl.search}`

  const res = await fetch(url, {
    method: req.method,
    headers: req.headers,
    body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
    // @ts-expect-error duplex required for streaming body
    duplex: "half",
  })

  // fetch() auto-decompresses the body, so forwarding encoding headers
  // would cause the browser to try to decompress already-plain data
  const headers = new Headers(res.headers)
  headers.delete("content-encoding")
  headers.delete("transfer-encoding")
  headers.delete("content-length")

  return new NextResponse(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  })
}

type RouteContext = { params: Promise<{ path: string[] }> }

export async function GET(req: NextRequest, { params }: RouteContext) {
  return proxy(req, await params)
}
export async function POST(req: NextRequest, { params }: RouteContext) {
  return proxy(req, await params)
}
export async function PUT(req: NextRequest, { params }: RouteContext) {
  return proxy(req, await params)
}
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  return proxy(req, await params)
}
