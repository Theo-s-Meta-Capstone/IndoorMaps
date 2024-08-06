export interface SignInData {
    email: string,
    password: string,
}

export type WebsocketUserTracker = {
    [key: `${string}-${string}-${string}-${string}-${string}`]: {
        jwt: string,
        timeCreated: number;
        lastReceived: number;
    }
}
