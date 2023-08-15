import { ComponentTypeNumber } from '@/enum/componentType.enum';

import { Question } from './question.entity';
import { QuestionCheckbox } from './questionCheckbox.entity';
import { QuestionCheckboxOption } from './questionCheckboxOption.entity';
import { QuestionInfo } from './questionInfo.entity';
import { QuestionInput } from './questionInput.entity';
import { QuestionParagraph } from './questionParagraph.entity';
import { QuestionRadio } from './questionRadio.entity';
import { QuestionRadioOption } from './questionRadioOption.entity';
import { QuestionTextarea } from './questionTextarea.entity';
import { QuestionTitle } from './questionTitle.entity';

// 前端传过来的组件类型
export type Component = {
  fe_id?: string;
  type?: string;
  title?: string;
  isHidden?: boolean;
  disabled?: boolean;
  question?: Question;
  props?: {
    [key: string]: any;
  };
};

// 实体类型
export type ComponentType =
  | QuestionCheckbox
  | QuestionInfo
  | QuestionInput
  | QuestionParagraph
  | QuestionRadio
  | QuestionTextarea
  | QuestionTitle;

// 实体类的类型
export type QuestionComponentClass =
  | typeof QuestionCheckbox
  | typeof QuestionInfo
  | typeof QuestionInput
  | typeof QuestionParagraph
  | typeof QuestionRadio
  | typeof QuestionTextarea
  | typeof QuestionTitle;

export type ComponentDB = { [fe_id: string]: ComponentTypeNumber };

// 因为是前端传值过来的，都是字符串类型
export type SearchOptions = {
  keyword?: string;
  isStar?: string;
  isDeleted?: string;
  page?: number;
  pageSize?: number;
};

// 组件选项实体
export type ComponentOptionType = QuestionCheckboxOption | QuestionRadioOption | null;
// 有选项的组件实体
export type ComponentHaveOptionType = QuestionCheckbox | QuestionRadio;

export type ArrayOfType<T> = T[];

export type ComponentOptionMapping = {
  [key in ComponentTypeNumber]: ComponentOptionType[];
};
