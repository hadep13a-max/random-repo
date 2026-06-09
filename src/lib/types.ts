export type GroupId = 1 | 2;

export interface Contestant {
  id: string;
  stt: number;
  name: string;
  rank: string;
  position: string;
  unit: string;
  group: GroupId;
}

export interface TableDrawRecord {
  id: string;
  contestantId: string;
  contestantName: string;
  rank: string;
  position: string;
  unit: string;
  table: 1 | 2;
  turn: number;
  at: number;
}

export interface TopicDrawRecord {
  id: string;
  contestantId: string;
  contestantName: string;
  rank: string;
  position: string;
  unit: string;
  group: GroupId;
  topicIndex: number; // 0..2
  topicText: string;
  at: number;
}

export interface QuestionItem {
  id: string;
  number: number;
  text: string;
}

export interface QuestionDrawRecord {
  id: string;
  contestantId: string;
  contestantName: string;
  rank: string;
  position: string;
  unit: string;
  questionId: string;
  questionNumber: number;
  questionText: string;
  at: number;
}

export interface AppData {
  contestants: Contestant[];
  questions: QuestionItem[];
  tableDraws: TableDrawRecord[];
  topicDraws: TopicDrawRecord[];
  questionDraws: QuestionDrawRecord[];
  randomTopic: boolean;
  randomQuestion: boolean;
}

