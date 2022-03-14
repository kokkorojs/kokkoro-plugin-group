# kokkoro-group

> 群管理，时不时来塞口球

## 安装

``` shell
# 切换至 bot 目录
cd bot

# 安装 npm 包
npm i kokkoro-plugin-group
```

在 [kokkoro](https://github.com/kokkorojs/kokkoro) 成功运行并登录后，发送 `>enable group` 即可启用插件
使用 `>group <key> <value>` 可修改当前群聊的插件参数，例如修改申请头衔等级限制 `>group title_level 1`

## 参数

``` typescript
interface GroupOption {
  // 申请头衔等级限制
  title_level: number;
}
```

## 等级

- level 0 群成员（随活跃度提升）
- level 1 群成员（随活跃度提升）
- level 2 群成员（随活跃度提升）
- level 3 管  理
- level 4 群  主
- level 5 主  人
- level 6 维护组
