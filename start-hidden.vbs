Set WshShell = CreateObject("WScript.Shell")

' 设置环境变量
WshShell.Environment("PROCESS")("DINGTALK_BOT_ACCESS_TOKEN") = "dingftnwrqolcoeiofdn"
WshShell.Environment("PROCESS")("DINGTALK_BOT_SECRET") = "dingftnwrqolcoeiofdn"
WshShell.Environment("PROCESS")("DINGTALK_APP_KEY") = "dingftnwrqolcoeiofdn"
WshShell.Environment("PROCESS")("DINGTALK_APP_SECRET") = "xFtLIKENEI1BHhBCem1S-AMoY1RJPa9aeaeNXAVLakhch_8dLv7UjwtaNehHcHeR"

' 使用完整路径执行Node.js，0表示隐藏窗口，False表示不等待程序执行完成
WshShell.Run """C:\nodejs\node.exe"" C:\coding\front\dingding-mcp-server\build\index.js", 0, False 