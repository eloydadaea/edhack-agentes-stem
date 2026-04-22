// Un logger simple. En producción se podría integrar Datadog o Winston.
export const logger = {
    info: (agent: string, message: string) => {
        console.log(`[INFO][${new Date().toISOString()}] [${agent}] - ${message}`);
    },
    error: (agent: string, error: any) => {
        console.error(`[ERROR][${new Date().toISOString()}] [${agent}] -`, error);
    }
};