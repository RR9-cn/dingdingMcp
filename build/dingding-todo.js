"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DingtalkTodo = void 0;
class DingtalkTodo {
    appKey;
    appSecret;
    accessToken = null;
    tokenExpireTime = 0;
    constructor(appKey, appSecret) {
        this.appKey = appKey;
        this.appSecret = appSecret;
    }
    /**
     * 获取访问令牌
     */
    async getAccessToken() {
        // 如果令牌仍然有效，则直接返回
        const now = Date.now();
        if (this.accessToken && now < this.tokenExpireTime) {
            return this.accessToken;
        }
        // 获取新的访问令牌
        const url = `https://oapi.dingtalk.com/gettoken?appkey=${this.appKey}&appsecret=${this.appSecret}`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = (await response.json());
        if (data.errcode !== 0) {
            throw new Error(`获取访问令牌失败: ${data.errmsg}`);
        }
        // 保存令牌，设置过期时间（提前5分钟过期，防止边界情况）
        this.accessToken = data.access_token;
        this.tokenExpireTime = now + (data.expires_in - 300) * 1000;
        return this.accessToken;
    }
    /**
     * 获取用户详情
     * @param userId 钉钉用户ID
     */
    async getUserInfo(userId) {
        const accessToken = await this.getAccessToken();
        const url = `https://oapi.dingtalk.com/topapi/v2/user/get?access_token=${accessToken}`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userid: userId,
            }),
        });
        const data = (await response.json());
        if (data.errcode !== 0) {
            throw new Error(`获取用户信息失败: ${data.errmsg}`);
        }
        return data;
    }
    /**
     * 创建待办任务
     * @param params 待办任务参数
     */
    async createTodoTask(params) {
        if (!params.access_token) {
            throw new Error("access_token is required");
        }
        const url = `https://api.dingtalk.com/v1.0/todo/users/${params.unionid}/tasks`;
        const headers = {
            "Content-Type": "application/json",
            "x-acs-dingtalk-access-token": params.access_token,
        };
        const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(params),
        });
        const data = (await response.json());
        return data;
    }
    /**
     * 简单创建待办任务的辅助方法
     * @param userId 用户ID
     * @param subject 待办主题
     * @param accessToken 访问令牌
     * @param description 待办描述
     * @param dueTime 截止时间（时间戳，毫秒）
     */
    async createSimpleTodoTask(userId, subject, accessToken, description, dueTime) {
        if (!accessToken) {
            throw new Error("access_token is required");
        }
        // 创建待办任务参数
        const params = {
            subject,
            description,
            unionid: userId,
            access_token: accessToken,
        };
        if (dueTime) {
            params.due_time = dueTime;
        }
        return this.createTodoTask(params);
    }
    /**
     * 查询待办任务列表
     * @param unionid 用户ID
     * @param queryParams 查询参数
     */
    async queryTodoTasks(unionid, queryParams = {}) {
        // 构建查询参数
        const params = {
            ...queryParams,
            union_id: unionid,
        };
        const url = `/v1.0/todo/users/${unionid}/org/tasks/query`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(params),
        });
        const data = (await response.json());
        if (data.errcode !== 0) {
            throw new Error(`查询待办任务失败: ${JSON.stringify(params)} ${JSON.stringify(data)}`);
        }
        return data;
    }
    /**
     * 获取待办任务详情
     * @param taskId 待办任务ID
     */
    async getTodoTaskDetail(taskId) {
        const accessToken = await this.getAccessToken();
        const url = `https://api.dingtalk.com/v1.0/todo/tasks/${taskId}?access_token=${accessToken}`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = (await response.json());
        if (data.errcode !== 0) {
            throw new Error(`获取待办任务详情失败: ${data.errmsg}`);
        }
        return data;
    }
    /**
     * 更新待办任务状态（完成/取消完成）
     * @param taskId 待办任务ID
     * @param isCompleted 是否完成
     */
    async updateTodoTaskStatus(taskId, isCompleted) {
        const accessToken = await this.getAccessToken();
        const url = `https://api.dingtalk.com/v1.0/todo/tasks/${taskId}/${isCompleted ? "finish" : "restart"}?access_token=${accessToken}`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = (await response.json());
        if (data.errcode !== 0) {
            throw new Error(`更新待办任务状态失败: ${data.errmsg}`);
        }
        return data;
    }
    /**
     * 删除待办任务
     * @param taskId 待办任务ID
     */
    async deleteTodoTask(taskId) {
        const accessToken = await this.getAccessToken();
        const url = `https://api.dingtalk.com/v1.0/todo/tasks/${taskId}?access_token=${accessToken}`;
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = (await response.json());
        if (data.errcode !== 0) {
            throw new Error(`删除待办任务失败: ${data.errmsg}`);
        }
        return data;
    }
}
exports.DingtalkTodo = DingtalkTodo;
//# sourceMappingURL=dingding-todo.js.map