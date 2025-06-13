// API route that proxies requests to the backend
export async function action({ request }) {
  const backendUrl = "http://backend:8000/api/v1/chat/stream";
  
  try {
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: await request.text()
    });
    
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response(JSON.stringify({ error: "Failed to connect to backend" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
}