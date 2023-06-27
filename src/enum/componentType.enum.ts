export enum ComponentType {
  // 多选框
  QUESTION_CHECKBOX = 'questionCheckbox',
  // 问卷信息
  QUESTION_INFO = 'questionInfo',
  // 输入框
  QUESTION_INPUT = 'questionInput',
  // 段落
  QUESTION_PARAGRAPH = 'questionParagraph',
  // 单选框
  QUESTION_RADIO = 'questionRadio',
  // 文本
  QUESTION_TEXTAREA = 'questionTextarea',
  // 标题
  QUESTION_TITLE = 'questionTitle',
}

export const ComponentTypeText: Record<ComponentType, string> = {
  [ComponentType.QUESTION_CHECKBOX]: '多选框',
  [ComponentType.QUESTION_INFO]: '问卷信息',
  [ComponentType.QUESTION_INPUT]: '输入框',
  [ComponentType.QUESTION_PARAGRAPH]: '段落',
  [ComponentType.QUESTION_RADIO]: '单选框',
  [ComponentType.QUESTION_TEXTAREA]: '文本',
  [ComponentType.QUESTION_TITLE]: '标题',
};

export enum ComponentTypeNumber {
  QUESTION_CHECKBOX = 1,
  QUESTION_INFO = 2,
  QUESTION_INPUT = 3,
  QUESTION_PARAGRAPH = 4,
  QUESTION_RADIO = 5,
  QUESTION_TEXTAREA = 6,
  QUESTION_TITLE = 7,
}
