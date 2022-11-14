# kokkoro-group

> 群管理，时不时来塞口球

## 安装

```shell
# 切换至 bot 目录
cd bot

# 安装 npm 包
npm i kokkoro-plugin-group
```

## 参数

``` typescript
interface GroupOption extends Option {
  /** 群通知(新人入群、退群推送) */
  notice: boolean;
  /** 申请头衔等级限制，默认 1 */
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
