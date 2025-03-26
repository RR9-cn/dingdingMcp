# 钉钉 MCP 服务器

这是一个基于 Model Context Protocol 的钉钉服务，可以发送消息到钉钉群和创建钉钉待办任务。

## 功能

- 创建钉钉待办任务


### 钉钉待办功能配置

要使用钉钉待办功能，需要设置以下环境变量：

- `DINGTALK_APP_KEY`: 钉钉应用的 AppKey
- `DINGTALK_APP_SECRET`: 钉钉应用的 AppSecret

## 安装与运行

1. 安装依赖:

```bash
npm install
```

2. 编译 TypeScript:

```bash
npm run build
```

3. 运行服务:

```bash
npm start
```

### 创建待办任务

```typescript
// 初始化钉钉待办实例
const dingtalkTodo = new DingtalkTodo(appKey, appSecret);

// 创建简单待办任务
const response = await dingtalkTodo.createSimpleTodoTask(
  "用户ID", // 钉钉用户ID
  "待办标题", // 待办标题
  "待办描述", // 可选: 待办详细描述
  1682006400000 // 可选: 截止时间的毫秒时间戳
);

// 创建高级待办任务
const params = {
  subject: "待办标题",
  description: "待办详细描述",
  due_time: 1682006400000, // 截止时间
  receivers: [
    {
      staff_id: "用户的unionid", // 需要先调用getUserInfo获取
      name: "用户名称",
    },
  ],
  notify_conf: {
    skip_notify: false, // 是否跳过通知
  },
  priority: 1, // 优先级
};

const response = await dingtalkTodo.createTodoTask(params);
```

### 查询待办任务列表

```typescript
// 查询用户的所有待办任务
const tasks = await dingtalkTodo.queryTodoTasks("用户ID");

// 查询用户的已完成待办任务
const completedTasks = await dingtalkTodo.queryTodoTasks("用户ID", {
  status: "COMPLETED",
});

// 查询用户的进行中待办任务，限制返回10条
const doingTasks = await dingtalkTodo.queryTodoTasks("用户ID", {
  status: "DOING",
  max_results: 10,
});

// 分页查询
const nextPageTasks = await dingtalkTodo.queryTodoTasks("用户ID", {
  next_token: "上一次查询返回的next_token",
});
```

### 获取待办任务详情

```typescript
// 获取待办任务详情
const taskDetail = await dingtalkTodo.getTodoTaskDetail("任务ID");
```

### 更新待办任务状态

```typescript
// 将待办任务标记为已完成
await dingtalkTodo.updateTodoTaskStatus("任务ID", true);

// 将待办任务标记为进行中（取消完成状态）
await dingtalkTodo.updateTodoTaskStatus("任务ID", false);
```

### 删除待办任务

```typescript
// 删除待办任务
await dingtalkTodo.deleteTodoTask("任务ID");
```

## 通过 MCP 使用待办功能

本服务通过 MCP 协议提供以下工具：

- `get_access_token` - 获取钉钉应用访问令牌（API 调用所需）
- `create_todo_task` - 创建钉钉待办任务
- `query_todo_tasks` - 查询用户的待办任务列表
- `get_todo_task_detail` - 获取待办任务详情
- `update_todo_task_status` - 更新待办任务状态
- `delete_todo_task` - 删除待办任务

示例：

```javascript
// 获取钉钉访问令牌
const tokenResponse = await server.get_access_token();
// tokenResponse.content[0].text包含访问令牌信息

// 通过MCP服务创建待办任务
await server.create_todo_task({
  userId: "钉钉用户ID",
  subject: "待办标题",
  description: "待办详细描述",
  dueTimeMs: Date.now() + 86400000, // 24小时后截止
});

// 查询用户待办任务
const tasks = await server.query_todo_tasks({
  userId: "钉钉用户ID",
  status: "DOING", // 可选，查询进行中的任务
});

// 获取任务详情
const detail = await server.get_todo_task_detail({
  taskId: "任务ID",
});

// 完成任务
await server.update_todo_task_status({
  taskId: "任务ID",
  isCompleted: true,
});

// 删除任务
await server.delete_todo_task({
  taskId: "任务ID",
});
```
