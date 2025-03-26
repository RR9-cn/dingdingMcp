interface MessageResponse {
    errcode: number;
    errmsg: string;
}
export declare class DingtalkBot {
    private readonly accessToken;
    private readonly secret?;
    private readonly baseUrl;
    constructor(accessToken: string, secret?: string);
    private getSignedUrl;
    sendText(content: string, atMobiles?: string[], atAll?: boolean): Promise<MessageResponse>;
    sendMarkdown(title: string, text: string, atMobiles?: string[], atAll?: boolean): Promise<MessageResponse>;
}
export {};
