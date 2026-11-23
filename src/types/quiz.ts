export type DiagramId =
  | 'fig1'
  | 'fig2'
  | 'fig3'
  | 'fig4'
  | 'fig5'
  | 'fig6'
  | 'fig7'
  | 'fig8'
  | 'fig9'
  | 'fig10';

export interface FillBlankItem {
  label: string;
  placeholder?: string;
  correctAnswer: string;
  acceptedAnswers?: string[];
}

export interface ChoiceQuestion {
  type?: 'choice';
  diagram?: DiagramId;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  point?: string;
}

export interface FillQuestion {
  type: 'fill';
  diagram?: DiagramId;
  question: string;
  placeholder?: string;
  correctAnswer: string;
  acceptedAnswers?: string[];
  explanation: string;
  point?: string;
}

export interface MultiFillQuestion {
  type: 'multi_fill';
  diagram?: DiagramId;
  question: string;
  blanks: FillBlankItem[];
  explanation: string;
  point?: string;
}

export type QuizQuestion = ChoiceQuestion | FillQuestion | MultiFillQuestion;

export interface QuizDataset {
  id: string;
  group?: string;
  isReview?: boolean;
  title: string;
  countSuffix?: string;
  description: string;
  questions: QuizQuestion[];
}

export interface LibraryScene {
  name: string;
  url: string;
}

export type UserAnswer = string | string[] | null;
