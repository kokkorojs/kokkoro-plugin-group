import { join } from 'path';
import { Plugin } from 'kokkoro';
import { GroupOption } from './type';
import { segment } from 'oicq';

const images_path = join(__dirname, '../images');
const option: GroupOption = {
  apply: true,
  lock: false,
  notice: true,
  title_level: 2,
};
export const plugin = new Plugin('group', option).version(require('../package.json').version);

plugin
  .command('title <name>', 'group')
  .sugar(/^申请头衔\s?(?<name>.+)$/)
  .action(async function (name: string) {
    const { group_id, sender } = this.event;
    const { user_id } = sender;
    const { title_level } = this.option as GroupOption;

    const group = this.bot.pickGroup(group_id);
    const level = this.bot.getUserLevel(this.event);

    let message: string = '';

    switch (true) {
      case !group.is_owner:
        message = `申请头衔需要 bot 拥有群主权限才能正常使用`;
        break;
      case level < title_level:
        message = `你当前为 Level ${level}，申请头衔需要达到 Level ${title_level}`;
        break;
    }
    if (message) {
      return this.event.reply(message, true);
    }
    const title = name.replace('申请头衔', '').trim();
    const succeed = await this.bot.setGroupSpecialTitle(group_id, user_id, title);

    this.event.reply(succeed ? '申请成功' : '申请失败', true);
  })

plugin
  .listen('notice.group.increase')
  .action(function (event) {
    const { group_id, user_id } = event;
    const option = this.getOption(group_id, 'group') as GroupOption;

    if (!option.notice || user_id === this.uin) {
      return;
    }
    const image = join(images_path, 'miyane.jpg');
    const message: any[] = ['欢迎新人 ', segment.at(user_id), ' 的加入~\n', '新人麻烦爆照报三围，希望你不要不识抬举\n', segment.image(image)];

    this.sendGroupMsg(group_id, message);
  })

plugin
  .listen('notice.group.decrease')
  .action(function (event) {
    const { operator_id, group_id, user_id, member } = event;
    const option = this.getOption(group_id, 'group') as GroupOption;

    if (!option.notice || user_id === this.uin) {
      return;
    }
    // 判断是否人为操作
    const message: any[] = operator_id === user_id
      ? [`成员 ${member?.nickname}(${user_id}) 已退出群聊\n`, segment.image(join(images_path, 'chi.jpg'))]
      : ['感谢 ', segment.at(operator_id), ` 成员\n赠送给 ${member?.nickname}(${user_id}) 的一张飞机票~\n`, segment.image(join(images_path, 'mizu.jpg'))];

    this.sendGroupMsg(group_id, message);
  })
