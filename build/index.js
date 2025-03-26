#! /usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
const dingding_js_1 = require("./dingding.js");
const dingding_todo_js_1 = require("./dingding-todo.js");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// 获取项目根目录
const projectRoot = path_1.default.resolve(__dirname, "..");
// 从.env.example文件读取配置
function parseEnvFile(filePath) {
    try {
        const envContent = fs_1.default.readFileSync(filePath, "utf8");
        const envVars = {};
        // 解析每一行
        envContent.split("\n").forEach((line) => {
            // 忽略注释行和空行
            if (!line || line.startsWith("#"))
                return;
            // 解析键值对
            const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
            if (match) {
                const key = match[1];
                let value = match[2] || "";
                // 如果值有引号，去掉引号
                if (value.length > 0 &&
                    (value.startsWith('"') || value.startsWith("'")) &&
                    value.endsWith(value[0])) {
                    value = value.slice(1, -1);
                }
                envVars[key] = value;
            }
        });
        return envVars;
    }
    catch (error) {
        console.error(`无法读取配置文件 ${filePath}:`, error);
        return {};
    }
}
// 从.env.example读取配置
const envExamplePath = path_1.default.join(projectRoot, ".env.example");
const configFromFile = parseEnvFile(envExamplePath);
// 合并环境变量（优先使用环境变量，其次使用.env.example中的配置）
const CONFIG = {
    DINGTALK_BOT_ACCESS_TOKEN: process.env.DINGTALK_BOT_ACCESS_TOKEN ||
        configFromFile.DINGTALK_BOT_ACCESS_TOKEN,
    DINGTALK_BOT_SECRET: process.env.DINGTALK_BOT_SECRET || configFromFile.DINGTALK_BOT_SECRET,
    DINGTALK_APP_KEY: process.env.DINGTALK_APP_KEY || configFromFile.DINGTALK_APP_KEY,
    DINGTALK_APP_SECRET: process.env.DINGTALK_APP_SECRET || configFromFile.DINGTALK_APP_SECRET,
};
// 验证配置
if (!CONFIG.DINGTALK_BOT_ACCESS_TOKEN) {
    console.error("DINGTALK_BOT_ACCESS_TOKEN 未设置，请检查配置");
    process.exit(1);
}
// Create server instance
const server = new mcp_js_1.McpServer({
    name: "dingding-bot",
    version: "1.0.0",
    description: "A tool for sending messages to Dingding groups via a custom robot",
});
// 初始化钉钉机器人
const dingtalkBot = new dingding_js_1.DingtalkBot(CONFIG.DINGTALK_BOT_ACCESS_TOKEN, CONFIG.DINGTALK_BOT_SECRET);
// 初始化钉钉待办实例
let dingtalkTodo;
if (CONFIG.DINGTALK_APP_KEY && CONFIG.DINGTALK_APP_SECRET) {
    dingtalkTodo = new dingding_todo_js_1.DingtalkTodo(CONFIG.DINGTALK_APP_KEY, CONFIG.DINGTALK_APP_SECRET);
}
else {
    console.warn("DINGTALK_APP_KEY or DINGTALK_APP_SECRET not set, todo features will be disabled");
}
// 添加创建待办任务的工具
if (dingtalkTodo) {
    // 获取钉钉访问令牌
    server.tool("get_access_token", "获取钉钉访问令牌", {}, async () => {
        try {
            const accessToken = await dingtalkTodo.getAccessToken();
            return {
                content: [
                    {
                        type: "text",
                        text: `获取访问令牌成功: ${accessToken}`,
                    },
                ],
            };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return {
                content: [
                    {
                        type: "text",
                        text: `获取访问令牌失败: ${message}`,
                    },
                ],
            };
        }
    });
    // 获取用户信息
    server.tool("get_user_info", "获取钉钉用户信息", {
        userId: zod_1.z.string().describe("钉钉用户ID"),
    }, async ({ userId }) => {
        try {
            const userInfo = await dingtalkTodo.getUserInfo(userId);
            return {
                content: [
                    {
                        type: "text",
                        text: `获取用户信息成功:
用户ID: ${userInfo.result.userid}
用户名: ${userInfo.result.name}
UnionID: ${userInfo.result.unionid}
职位: ${userInfo.result.title || "未设置"}
部门ID: ${userInfo.result.dept_id_list}
手机号: ${userInfo.result.mobile || "未设置"}
邮箱: ${userInfo.result.email || "未设置"}`,
                    },
                ],
            };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return {
                content: [
                    {
                        type: "text",
                        text: `获取用户信息失败: ${message}`,
                    },
                ],
            };
        }
    });
    server.tool("create_todo_task", "创建钉钉待办任务", {
        accessToken: zod_1.z.string().describe("钉钉访问令牌"),
        unionid: zod_1.z.string().describe("接收待办的钉钉用户ID"),
        subject: zod_1.z.string().describe("待办主题"),
        description: zod_1.z.string().optional().describe("待办详细描述"),
        dueTimeMs: zod_1.z.number().optional().describe("截止时间的时间戳（毫秒）"),
    }, async ({ accessToken, unionid, subject, description, dueTimeMs }) => {
        try {
            const response = await dingtalkTodo.createSimpleTodoTask(unionid, subject, accessToken, description, dueTimeMs);
            return {
                content: [
                    {
                        type: "text",
                        text: `待办任务创建成功，任务ID: ${response.task_id}`,
                    },
                ],
            };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return {
                content: [
                    {
                        type: "text",
                        text: `创建待办任务失败: ${message}`,
                    },
                ],
            };
        }
    });
}
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error("Dingding group robot MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error in main()", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map