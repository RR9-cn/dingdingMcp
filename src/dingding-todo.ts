import crypto from "crypto";

interface ApiResponse {
  errcode: number;
  errmsg: string;
}

interface TokenResponse extends ApiResponse {
  access_token: string;
  expires_in: number;
}

interface LeaderInDept {
  leader: string;
  dept_id: string;
}

interface RoleList {
  group_name: string;
  name: string;
  id: string;
}

interface DeptOrderList {
  dept_id: string;
  order: string;
}

interface UnionEmpMap {
  userid: string;
  corp_id: string;
}

interface UnionEmpExt {
  union_emp_map_list: UnionEmpMap;
  userid: string;
  corp_id: string;
}

interface UserDetail {
  extension?: string;
  unionid: string;
  boss: string;
  role_list: RoleList;
  exclusive_account: boolean;
  manager_userid?: string;
  admin: string;
  remark?: string;
  title?: string;
  hired_date?: string;
  userid: string;
  work_place?: string;
  dept_order_list: DeptOrderList;
  real_authed: string;
  dept_id_list: string;
  job_number?: string;
  email?: string;
  leader_in_dept: LeaderInDept;
  mobile?: string;
  active: string;
  org_email?: string;
  telephone?: string;
  avatar?: string;
  hide_mobile: string;
  senior: string;
  name: string;
  union_emp_ext?: UnionEmpExt;
  state_code?: string;
}

interface UserResponse extends ApiResponse {
  result: UserDetail;
}

interface TodoTaskResponse extends ApiResponse {
  task_id: string;
  [key: string]: any;
}

interface TodoTaskParams {
  access_token: string;
  unionid: string;
  subject: string;
  description?: string;
  due_time?: number;
}

interface TodoTaskQueryParams {
  union_id?: string;
  next_token?: string;
  max_results?: number;
  status?: "COMPLETED" | "DOING";
  role?: "CREATOR" | "EXECUTOR" | "CREATOR_OR_EXECUTOR";
}

interface TodoTaskQueryResponse extends ApiResponse {
  next_token?: string;
  has_more: boolean;
  items: {
    task_id: string;
    subject: string;
    description?: string;
    start_time?: number;
    due_time?: number;
    finish_time?: number;
    status: "COMPLETED" | "DOING";
    creator_id: string;
    [key: string]: any;
  }[];
}

interface TodoTaskDetailResponse extends ApiResponse {
  task_id: string;
  subject: string;
  description?: string;
  start_time?: number;
  due_time?: number;
  finish_time?: number;
  status: "COMPLETED" | "DOING";
  creator_id: string;
  [key: string]: any;
}

export class DingtalkTodo {
  private readonly appKey: string;
  private readonly appSecret: string;
  private accessToken: string | null = null;
  private tokenExpireTime: number = 0;

  constructor(appKey: string, appSecret: string) {
    this.appKey = appKey;
    this.appSecret = appSecret;
  }

  /**
   * 获取访问令牌
   */
  public async getAccessToken(): Promise<string> {
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

    const data = (await response.json()) as TokenResponse;

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
  async getUserInfo(userId: string): Promise<UserResponse> {
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

    const data = (await response.json()) as UserResponse;

    if (data.errcode !== 0) {
      throw new Error(`获取用户信息失败: ${data.errmsg}`);
    }

    return data;
  }

  /**
   * 创建待办任务
   * @param params 待办任务参数
   */
  async createTodoTask(params: TodoTaskParams): Promise<TodoTaskResponse> {
    if (!params.access_token) {
      throw new Error("access_token is required");
    }

    const url = `https://api.dingtalk.com/v1.0/todo/users/${params.unionid}/tasks`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-acs-dingtalk-access-token": params.access_token,
    };

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(params),
    });

    const data = (await response.json()) as TodoTaskResponse;

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
  async createSimpleTodoTask(
    userId: string,
    subject: string,
    accessToken: string,
    description?: string,
    dueTime?: number
  ): Promise<TodoTaskResponse> {
    if (!accessToken) {
      throw new Error("access_token is required");
    }

    // 创建待办任务参数
    const params: TodoTaskParams = {
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
  async queryTodoTasks(
    unionid: string,
    queryParams: Omit<TodoTaskQueryParams, "union_id"> = {}
  ): Promise<TodoTaskQueryResponse> {
    // 构建查询参数
    const params: TodoTaskQueryParams = {
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

    const data = (await response.json()) as TodoTaskQueryResponse;

    if (data.errcode !== 0) {
      throw new Error(
        `查询待办任务失败: ${JSON.stringify(params)} ${JSON.stringify(data)}`
      );
    }

    return data;
  }

  /**
   * 获取待办任务详情
   * @param taskId 待办任务ID
   */
  async getTodoTaskDetail(taskId: string): Promise<TodoTaskDetailResponse> {
    const accessToken = await this.getAccessToken();
    const url = `https://api.dingtalk.com/v1.0/todo/tasks/${taskId}?access_token=${accessToken}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = (await response.json()) as TodoTaskDetailResponse;

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
  async updateTodoTaskStatus(
    taskId: string,
    isCompleted: boolean
  ): Promise<ApiResponse> {
    const accessToken = await this.getAccessToken();
    const url = `https://api.dingtalk.com/v1.0/todo/tasks/${taskId}/${
      isCompleted ? "finish" : "restart"
    }?access_token=${accessToken}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = (await response.json()) as ApiResponse;

    if (data.errcode !== 0) {
      throw new Error(`更新待办任务状态失败: ${data.errmsg}`);
    }

    return data;
  }

  /**
   * 删除待办任务
   * @param taskId 待办任务ID
   */
  async deleteTodoTask(taskId: string): Promise<ApiResponse> {
    const accessToken = await this.getAccessToken();
    const url = `https://api.dingtalk.com/v1.0/todo/tasks/${taskId}?access_token=${accessToken}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = (await response.json()) as ApiResponse;

    if (data.errcode !== 0) {
      throw new Error(`删除待办任务失败: ${data.errmsg}`);
    }

    return data;
  }
}
