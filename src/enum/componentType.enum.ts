export enum ComponentType {
  QUESTION_CHECKBOX = 'questionCheckbox',
  QUESTION_INFO = 'questionInfo',
  QUESTION_INPUT = 'questionInput',
  QUESTION_PARAGRAPH = 'questionParagraph',
  QUESTION_RADIO = 'questionRadio',
  QUESTION_TEXTAREA = 'questionTextarea',
  QUESTION_TITLE = 'questionTitle',
}

export const ComponentTypeText: Record<ComponentType, string> = {
  [ComponentType.QUESTION_CHECKBOX]: '多选框组件',
  [ComponentType.QUESTION_INFO]: '问卷标题组件',
  [ComponentType.QUESTION_INPUT]: '输入框组件',
  [ComponentType.QUESTION_PARAGRAPH]: '段落组件',
  [ComponentType.QUESTION_RADIO]: '单选框组件',
  [ComponentType.QUESTION_TEXTAREA]: '文本组件',
  [ComponentType.QUESTION_TITLE]: '标题组件',
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

export const ComponentTypeToNumber: Record<ComponentType, ComponentTypeNumber> = {
  [ComponentType.QUESTION_CHECKBOX]: ComponentTypeNumber.QUESTION_CHECKBOX,
  [ComponentType.QUESTION_INFO]: ComponentTypeNumber.QUESTION_INFO,
  [ComponentType.QUESTION_INPUT]: ComponentTypeNumber.QUESTION_INPUT,
  [ComponentType.QUESTION_PARAGRAPH]: ComponentTypeNumber.QUESTION_PARAGRAPH,
  [ComponentType.QUESTION_RADIO]: ComponentTypeNumber.QUESTION_RADIO,
  [ComponentType.QUESTION_TEXTAREA]: ComponentTypeNumber.QUESTION_TEXTAREA,
  [ComponentType.QUESTION_TITLE]: ComponentTypeNumber.QUESTION_TITLE,
};

export const ComponentNumberToType: Record<ComponentTypeNumber, ComponentType> = {
  [ComponentTypeNumber.QUESTION_CHECKBOX]: ComponentType.QUESTION_CHECKBOX,
  [ComponentTypeNumber.QUESTION_INFO]: ComponentType.QUESTION_INFO,
  [ComponentTypeNumber.QUESTION_INPUT]: ComponentType.QUESTION_INPUT,
  [ComponentTypeNumber.QUESTION_PARAGRAPH]: ComponentType.QUESTION_PARAGRAPH,
  [ComponentTypeNumber.QUESTION_RADIO]: ComponentType.QUESTION_RADIO,
  [ComponentTypeNumber.QUESTION_TEXTAREA]: ComponentType.QUESTION_TEXTAREA,
  [ComponentTypeNumber.QUESTION_TITLE]: ComponentType.QUESTION_TITLE,
};

export const componentOptionType = [1, 5];
