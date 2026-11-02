export type UserRole = 'instructor' | 'student';

export interface UserSession {
  role: UserRole;
  roomCode: string;
  studentId: string;
  nickname: string;
  pin: string;
  anonymousAlias: string;
}

export interface ClaimedStudentRecord {
  studentId: string;
  nickname: string;
  pin: string;
  roomCode: string;
  anonymousAlias: string;
  claimedAt: number;
}

export type PaceSignalType = 'good' | 'example' | 'fast';

export interface PaceVote {
  studentId: string;
  nickname: string;
  signal: PaceSignalType;
  timestamp: number;
  expiresAt: number; // timestamp + 5 mins (300,000 ms)
  topicId: number;
}

export interface TopicItem {
  id: number;
  number: number;
  title: string;
  subtitle: string;
  durationMin: number;
  keyPoints: string[];
  slideDeckRef: string;
  contextPromptHint: string;
}

export interface TopicHistoryLog {
  id: string;
  topicId: number;
  topicTitle: string;
  actionType: 'reexplained' | 'next_topic' | 'force_next_topic';
  timestamp: string;
  goodCount: number;
  exampleCount: number;
  fastCount: number;
  confusionRatio: number;
  note: string;
}

export interface QuickConceptPoll {
  id: string;
  topicId: number;
  question: string;
  options: string[];
  correctOptionIndex: number;
  createdAt: number;
  expiresAt: number; // 30 seconds live countdown
  isActive: boolean;
  responses: Record<string, number>; // studentId -> optionIndex
}

export interface AnonymousQuestion {
  id: string;
  topicId: number;
  authorStudentId: string;
  anonymousAlias: string;
  content: string;
  createdAt: string;
  voterIds: string[];
  isSpotlight: boolean;
  isAnswered: boolean;
  instructorAnswer?: string;
  answeredAt?: string;
}

export type FeedChannelType = 'announcements' | 'notes' | 'discussion';

export type MicroReactionType = 'understood' | 'idea' | 'thanks' | 'question';

export interface PinnedEssentialItem {
  id: string;
  badge: string;
  title: string;
  description: string;
  linkLabel: string;
  linkUrl: string;
  dueTime?: string;
  pinnedBy: string;
}

export interface FeedPost {
  id: string;
  channel: FeedChannelType;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  topicTag: string;
  title?: string;
  content: string;
  createdAt: string;
  reactions: Record<MicroReactionType, string[]>; // reactionKey -> array of studentIds
}

export type AuthenticityStatus = 'VERIFIED_HUMAN' | 'NEEDS_REVIEW' | 'HIGH_AI_RISK';

export interface TabSwitchEvent {
  timestamp: string;
  reason: string;
}

export interface AssignmentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  // Stage 1: Process-Tracked Editor
  answerContent: string;
  activeTypingSeconds: number;
  keystrokeCount: number;
  backspaceCount: number;
  totalCharCount: number;
  pastedCharCount: number;
  pastedRatio: number; // 0 to 100
  declaredExternalNotes: boolean;
  externalNotesSource?: string;
  // Stage 2: Classroom Context Bridge
  classroomContextBridge: string;
  // Stage 3: 60-Second Anti-Blur Spot-Check Challenge
  extractedSentence: string;
  spotCheckPrompt: string;
  spotCheckResponse: string;
  spotCheckMode: 'text' | 'voice';
  spotCheckDurationSec: number;
  tabSwitchCount: number;
  tabSwitchLogs: TabSwitchEvent[];
  // Computed & Instructor status
  status: AuthenticityStatus;
  authenticityScore: number; // 0 to 100
  riskSummary: string;
  instructorFeedback?: string;
}

export interface ClassPulseSharedState {
  version: number;
  lastUpdated: number;
  courseCode: string;
  courseName: string;
  roomCode: string;
  instructorName: string;
  currentTopicId: number;
  claimedStudents: Record<string, ClaimedStudentRecord>;
  paceVotes: PaceVote[];
  topicLogs: TopicHistoryLog[];
  activePoll: QuickConceptPoll | null;
  questions: AnonymousQuestion[];
  pinnedItems: PinnedEssentialItem[];
  feedPosts: FeedPost[];
  submissions: AssignmentSubmission[];
}

