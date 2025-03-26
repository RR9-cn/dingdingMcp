import crypto from "crypto";

interface MessageResponse {
  errcode: number;
  errmsg: string;
}

interface TextMessage {
  msgtype: "text";
  text: {
    content: string;
  };
  at: {
    atMobiles?: string[];
    isAtAll?: boolean;
  };
}

interface MarkdownMessage {
  msgtype: "markdown";
  markdown: {
    title: string;
    text: string;
  };
  at: {
    atMobiles?: string[];
    isAtAll?: boolean;
  };
}

export class DingtalkBot {
  private readonly accessToken: string;
  private readonly secret?: string;
  private readonly baseUrl: string = "https://oapi.dingtalk.com/robot/send";

  constructor(accessToken: string, secret?: string) {
    this.accessToken = accessToken;
    this.secret = secret;
  }

  private getSignedUrl(): string {
    const timestamp = Date.now();

    if (this.secret) {
      const stringToSign = `${timestamp}\n${this.secret}`;
      const hmac = crypto.createHmac("sha256", this.secret);
      const sign = encodeURIComponent(
        hmac.update(stringToSign).digest("base64")
      );
      return `${this.baseUrl}?access_token=${this.accessToken}&timestamp=${timestamp}&sign=${sign}`;
    }

    return `${this.baseUrl}?access_token=${this.accessToken}`;
  }

  async sendText(
    content: string,
    atMobiles?: string[],
    atAll: boolean = false
  ): Promise<MessageResponse> {
    const data: TextMessage = {
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
    return response.json() as Promise<MessageResponse>;
  }

  async sendMarkdown(
    title: string,
    text: string,
    atMobiles?: string[],
    atAll: boolean = false
  ): Promise<MessageResponse> {
    const data: MarkdownMessage = {
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
    return response.json() as Promise<MessageResponse>;
  }
}
