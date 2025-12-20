
interface Env {
    PRISM_KV: KVNamespace;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { env } = context;

    // Key Convention: "R2_CONFIGS"
    // Format: JSON Array of R2Config objects
    // [
    //   {
    //     "id": "1",
    //     "name": "My Bucket",
    //     "accountId": "...",
    //     "accessKeyId": "...",
    //     "secretAccessKey": "...",
    //     "bucketName": "..."
    //   }
    // ]

    try {
        const configs = await env.PRISM_KV.get("R2_CONFIGS");

        // Allow CORS for flexibility if needed, though pages usually share origin
        const headers = {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache"
        };

        if (!configs) {
            return new Response(JSON.stringify([]), { headers });
        }

        return new Response(configs, { headers });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
};
