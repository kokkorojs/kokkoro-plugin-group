import { join } from 'path';
import { Plugin, Option, Sendable, segment } from 'kokkoro';

interface GroupOption extends Option {
  /** 群通知(新人入群、退群推送) */
  notice: boolean;
  /** 申请头衔等级限制，默认 1 */
  title_level: number;
}

const { version } = require('../package.json');
const images_path = join(__dirname, '../images');
const option: GroupOption = {
  apply: true,
  lock: false,
  notice: true,
  title_level: 1,
};
const plugin = new Plugin('group', option);

plugin
  .version(version)

plugin
  .command('title <name>', 'group')
  .sugar(/^申请头衔\s?(?<name>.+)$/)
  .action(async (ctx) => {
    const { group_id, sender, group, permission_level, query, bot } = ctx;
    const { user_id } = sender;
    const { title_level } = <GroupOption>ctx.option;

    let message: string = '';

    switch (true) {
      case !group.is_owner:
        message = `申请头衔需要 bot 拥有群主权限才能正常使用`;
        break;
      case permission_level < title_level:
        message = `你当前为 Level ${permission_level}，申请头衔需要达到 Level ${title_level}`;
        break;
    }
    if (message) {
      return ctx.reply(message, true);
    }
    const title = query.name.replace('申请头衔', '').trim();

    try {
      await bot.setGroupSpecialTitle(group_id, user_id, title);
      ctx.reply('申请成功', true);
    } catch (error) {
      ctx.reply('申请失败', true);
    }
  })

plugin
  .command('admin set <name>', 'group')
  .sugar(/^申请头衔\s?(?<name>.+)$/)
  .action(async (ctx) => {
    const { group_id, sender, group, permission_level, query, bot } = ctx;
    const { user_id } = sender;
    const { title_level } = <GroupOption>ctx.option;

    let message: string = '';

    switch (true) {
      case !group.is_owner:
        message = `申请头衔需要 bot 拥有群主权限才能正常使用`;
        break;
      case permission_level < title_level:
        message = `你当前为 Level ${permission_level}，申请头衔需要达到 Level ${title_level}`;
        break;
    }
    if (message) {
      return ctx.reply(message, true);
    }
    const title = query.name.replace('申请头衔', '').trim();

    try {
      await bot.setGroupSpecialTitle(group_id, user_id, title);
      ctx.reply('申请成功', true);
    } catch (error) {
      ctx.reply('申请失败', true);
    }
  })

plugin
  .event('notice.group.increase')
  .action(async (ctx) => {
    const { group_id, user_id, option, self_id, bot } = ctx;

    if (!option!.notice || user_id === self_id) {
      return;
    }
    const is_admin = bot.isAdmin(user_id);
    const is_master = bot.isMaster(user_id);
    const image = join(images_path, 'miyane.jpg');
    const message: Sendable = [];

    switch (true) {
      case is_admin:
        message.push(...[segment.at(user_id), 'yuki yuki yuki (ﾉ≧∀≦)ﾉ']);
        break;
      case is_master:
        message.push('欢迎新...啊咧？是 master 么 (*ﾟﾛﾟ)');
        break;
      default:
        message.push(...[
          '欢迎新人 ', segment.at(user_id), ' 的加入~\n',
          '新人麻烦爆照报三围，希望你不要不识抬举\n', segment.image(image)
        ]);
        break;
    }
    bot.sendGroupMsg(group_id, message);
  })

plugin
  .event('notice.group.decrease')
  .action((ctx) => {
    const { operator_id, group_id, user_id, member, option, self_id, bot } = ctx;

    if (!option!.notice || user_id === self_id) {
      return;
    }
    // 判断是否人为操作
    const message: Sendable = operator_id === user_id
      ? [`成员 ${member?.nickname}(${user_id}) 已退出群聊\n`, segment.image(join(images_path, 'chi.jpg'))]
      : ['感谢 ', segment.at(operator_id), ` 成员\n赠送给 ${member?.nickname}(${user_id}) 的一张飞机票~\n`, segment.image(join(images_path, 'mizu.jpg'))];

    bot.sendGroupMsg(group_id, message);
  })
