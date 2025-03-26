interface ApiResponse {
    errcode: number;
    errmsg: string;
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
export declare class DingtalkTodo {
    private readonly appKey;
    private readonly appSecret;
    private accessToken;
    private tokenExpireTime;
    constructor(appKey: string, appSecret: string);
    /**
     * 获取访问令牌
     */
    getAccessToken(): Promise<string>;
    /**
     * 获取用户详情
     * @param userId 钉钉用户ID
     */
    getUserInfo(userId: string): Promise<UserResponse>;
    /**
     * 创建待办任务
     * @param params 待办任务参数
     */
    createTodoTask(params: TodoTaskParams): Promise<TodoTaskResponse>;
    /**
     * 简单创建待办任务的辅助方法
     * @param userId 用户ID
     * @param subject 待办主题
     * @param accessToken 访问令牌
     * @param description 待办描述
     * @param dueTime 截止时间（时间戳，毫秒）
     */
    createSimpleTodoTask(userId: string, subject: string, accessToken: string, description?: string, dueTime?: number): Promise<TodoTaskResponse>;
    /**
     * 查询待办任务列表
     * @param unionid 用户ID
     * @param queryParams 查询参数
     */
    queryTodoTasks(unionid: string, queryParams?: Omit<TodoTaskQueryParams, "union_id">): Promise<TodoTaskQueryResponse>;
    /**
     * 获取待办任务详情
     * @param taskId 待办任务ID
     */
    getTodoTaskDetail(taskId: string): Promise<TodoTaskDetailResponse>;
    /**
     * 更新待办任务状态（完成/取消完成）
     * @param taskId 待办任务ID
     * @param isCompleted 是否完成
     */
    updateTodoTaskStatus(taskId: string, isCompleted: boolean): Promise<ApiResponse>;
    /**
     * 删除待办任务
     * @param taskId 待办任务ID
     */
    deleteTodoTask(taskId: string): Promise<ApiResponse>;
}
export {};
