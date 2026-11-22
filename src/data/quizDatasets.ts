import { diagramExamDataset } from './diagramExamData';
import { exam1Dataset } from './exam1Data';
import { exam2Dataset } from './exam2Data';
import { exam3Dataset } from './exam3Data';
import { exam4Dataset } from './exam4Data';
import type { QuizDataset } from '../types/quiz';

export const quizDatasets: QuizDataset[] = [
  exam1Dataset,
  exam2Dataset,
  exam3Dataset,
  exam4Dataset,
  diagramExamDataset,
];
