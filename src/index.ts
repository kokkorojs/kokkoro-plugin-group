import { join } from 'path';
import { GroupMessageEvent, MemberIncreaseEvent, MemberDecreaseEvent } from 'oicq';
import { Extension, Bot, Order, getOption, getOrder, Option, section } from 'kokkoro';

interface GroupOption extends Option {
  notice: boolean;
  title_level: number;
  color_level: number;
}

type ColorfulType = '红色' | '黄色' | '黑色' | '粉色' | '紫色' | '潮流' | '朝夕' | '粉黛' | '夜空' | '晚秋' | '盛夏' | '日出' | '黄昏' | '冬梅' | '初春' | '蓝色' | '绿色' | '马卡龙' | '科技感' | '高级灰' | '糖果缤纷' | '霓虹闪烁';

const colorful = {
  '红色': '\u003c&ÿÿ5@\u003e',
  '黄色': '<&ÿÿÏP>',
  '黑色': '<&ÿĀĀĀ>',
  '粉色': '<&ÿÿ]•>',
  '紫色': '<&ÿÒUÐ>',
  '潮流': '<%ĀĀ␇Þ>',
  '朝夕': '<%ĀĀ␇Ý>',
  '粉黛': '<%ĀĀ␇Ü>',
  '夜空': '<%ĀĀ␇Û>',
  '晚秋': '<%ĀĀ␇Ú>',
  '盛夏': '<%ĀĀ␇Ø>',
  '日出': '<%ĀĀ␇×>',
  '黄昏': '<%ĀĀ␇Ù>',
  '冬梅': '<%ĀĀ␇Ù>',
  '初春': '<%ĀĀ␇Ù>',
  '蓝色': '<&ÿ␇Çý>',
  '绿色': '<&ÿ␇ÄW>',
  '马卡龙': '<%ĀĀ␇Õ>',
  '科技感': '<%ĀĀ␇Ô>',
  '高级灰': '<%ĀĀ␇Ù>',
  '糖果缤纷': '<%ĀĀ␇Ù>',
  '霓虹闪烁': '<%ĀĀ␇Ö>',
};
const image_path = join(__dirname, '../image');

export default class Group implements Extension {
  bot: Bot;
  option: GroupOption = {
    notice: true,
    title_level: 2,
    color_level: 2,
  }
  orders: Order[] = [
    {
      func: this.applyTitle,
      regular: /^申请头衔[\s]?.+$/,
    },
    {
      func: this.applyColor,
      regular: /^申请颜色[\s]?.+$/,
    },
  ];

  constructor(bot: Bot) {
    this.bot = bot;
  }

  onGroupMessage(event: GroupMessageEvent) {
    const raw_message = event.raw_message;
    const option = getOption(event);
    const order = getOrder(this.orders, raw_message);

    if (option.apply) {
      order && order.call(this, event, option);
    }
  }

  async onMemberIncrease(event: MemberIncreaseEvent) {
    const option = getOption(event) as GroupOption;

    if (!option.notice || event.user_id === this.bot.uin) return;

    const { group_id, user_id } = event;
    const message: any = ['欢迎新人 ', section.at(user_id), ' 的加入~', '\n新人麻烦爆照报三围，希望你不要不识抬举\n', await section.image(join(image_path, 'miyane.jpg'))];

    this.bot.sendGroupMsg(group_id, message);
  }

  async onMemberDecrease(event: MemberDecreaseEvent) {
    const option = getOption(event) as GroupOption;

    if (!option.notice || event.user_id === this.bot.uin) return;

    const { operator_id, group_id, user_id, member } = event;
    // 判断是否人为操作
    const message: any = operator_id === user_id
      ? [`成员 ${member?.nickname}(${user_id}) 已退出群聊\n`, await section.image(join(image_path, 'chi.jpg'))]
      : ['感谢 ', section.at(operator_id), ` 成员\n赠送给 ${member?.nickname}(${user_id}) 的一张飞机票~\n`, await section.image(join(image_path, 'mizu.jpg'))];

    this.bot.sendGroupMsg(group_id, message);
  }

  async applyTitle(event: GroupMessageEvent, option: GroupOption) {
    const { group_id, raw_message, sender } = event;
    const { user_id } = sender;
    const { title_level } = option;

    const group = this.bot.pickGroup(group_id);
    const level = this.bot.getUserLevel(event);

    let message = null;

    switch (true) {
      case !group.is_owner:
        message = `申请头衔需要 bot 拥有群主权限才能正常使用`;
        break;
      case level < title_level:
        message = `你当前为 Level ${level}，申请头衔需要达到 Level ${title_level}`;
        break;
    }

    if (message) {
      return event.reply(message, true);
    }

    const title = raw_message.replace('申请头衔', '').trim();

    try {
      await this.bot.setGroupSpecialTitle(group_id, user_id, title);
      event.reply('申请成功', true);
    } catch (error) {
      event.reply('申请失败', true);
    }
  }

  async applyColor(event: GroupMessageEvent, option: GroupOption) {
    const { group_id, raw_message, sender } = event;
    const { user_id, card, nickname } = sender;
    const { color_level } = option;

    const keys = Object.keys(colorful);
    const level = this.bot.getUserLevel(event);
    const group = this.bot.pickGroup(group_id);
    const color = raw_message.replace('申请颜色', '').trim() as ColorfulType;

    let message = null;

    switch (true) {
      case this.bot.config.platform !== 1:
        message = `申请颜色仅支持安卓协议`;
        break;
      case !group.is_admin:
        message = `申请颜色需要 bot 拥有管理权限才能正常使用`;
        break;
      case level < color_level:
        message = `你当前为 Level ${level}，申请颜色需要达到 Level ${color_level}`;
        break;
      case !keys.includes(color):
        message = `不存在 "${color}"，颜色的合法值为：${keys.join('、')}`;
        break;
    }

    if (message) {
      return event.reply(message, true);
    }

    try {
      const member = this.bot.pickMember(group_id, user_id);
      await member.setCard(`${colorful[color]}${card ? card : nickname}`);
      event.reply('申请成功', true);
    } catch (error) {
      event.reply('申请失败', true);
    }
  }
}
