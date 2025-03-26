"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DingtalkBot = void 0;
const crypto_1 = __importDefault(require("crypto"));
class DingtalkBot {
    accessToken;
    secret;
    baseUrl = "https://oapi.dingtalk.com/robot/send";
    constructor(accessToken, secret) {
        this.accessToken = accessToken;
        this.secret = secret;
    }
    getSignedUrl() {
        const timestamp = Date.now();
        if (this.secret) {
            const stringToSign = `${timestamp}\n${this.secret}`;
            const hmac = crypto_1.default.createHmac("sha256", this.secret);
            const sign = encodeURIComponent(hmac.update(stringToSign).digest("base64"));
            return `${this.baseUrl}?access_token=${this.accessToken}&timestamp=${timestamp}&sign=${sign}`;
        }
        return `${this.baseUrl}?access_token=${this.accessToken}`;
    }
    async sendText(content, atMobiles, atAll = false) {
        const data = {
            msgtype: "text",
            text: {
                content,
            },
            at: {
                atMobiles: atMobiles || [],
                isAtAll: atAll,
            },
        };
        const response = await fetch(this.getSignedUrl(), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        return response.json();
    }
    async sendMarkdown(title, text, atMobiles, atAll = false) {
        const data = {
            msgtype: "markdown",
            markdown: {
                title,
                text,
            },
            at: {
                atMobiles: atMobiles || [],
                isAtAll: atAll,
            },
        };
        const response = await fetch(this.getSignedUrl(), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        return response.json();
    }
}
exports.DingtalkBot = DingtalkBot;
//# sourceMappingURL=dingding.js.map