export enum ComponentType {
  QUESTION_CHECKBOX = 'questionCheckbox',
  QUESTION_INFO = 'questionInfo',
  QUESTION_INPUT = 'questionInput',
  QUESTION_PARAGRAPH = 'questionParagraph',
  QUESTION_RADIO = 'questionRadio',
  QUESTION_TEXTAREA = 'questionTextarea',
  QUESTION_TITLE = 'questionTitle',
}

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
