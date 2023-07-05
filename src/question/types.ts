import { Question } from './question.entity';
import { QuestionCheckbox } from './questionCheckbox.entity';
import { QuestionInfo } from './questionInfo.entity';
import { QuestionInput } from './questionInput.entity';
import { QuestionParagraph } from './questionParagraph.entity';
import { QuestionRadio } from './questionRadio.entity';
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

export type QuestionComponentClass =
  | typeof QuestionCheckbox
  | typeof QuestionInfo
  | typeof QuestionInput
  | typeof QuestionParagraph
  | typeof QuestionRadio
  | typeof QuestionTextarea
  | typeof QuestionTitle;
