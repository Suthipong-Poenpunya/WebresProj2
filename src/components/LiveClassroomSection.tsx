import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Zap,
  RotateCcw,
  ArrowRight,
  Clock,
  CheckCircle2,
  Flame,
  Mic,
  MessageCircleQuestion,
  Send,
  Layers,
  History,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import {
  AnonymousQuestion,
  PaceSignalType,
  PaceVote,
  QuickConceptPoll,
  TopicHistoryLog,
  TopicItem,
  UserSession,
} from '../types';
import { COURSE_TOPICS } from '../seedData';

interface LiveClassroomSectionProps {
  now: number;
  session: UserSession;
  currentTopic: TopicItem;
  activeVotes: PaceVote[];
  topicLogs: TopicHistoryLog[];
  activePoll: QuickConceptPoll | null;
  questions: AnonymousQuestion[];
  onCastPaceVote: (signal: PaceSignalType) => void;
  onSimulateClassStruggle: () => void;
  onFastForwardTTL: () => void;
  onResetTopicVotes: (actionType: 'reexplained' | 'next_topic' | 'force_next_topic', targetTopicId?: number) => void;
  onLaunchQuickPoll: () => void;
  onCloseQuickPoll: () => void;
  onAnswerQuickPoll: (optionIdx: number) => void;
  onAskQuestion: (content: string) => void;
  onToggleQuestionUpvote: (questionId: string) => void;
  onToggleQuestionSpotlight: (questionId: string) => void;
  onMarkQuestionAnswered: (questionId: string, instructorAnswer: string) => void;
}

export const LiveClassroomSection: React.FC<LiveClassroomSectionProps> = ({
  now,
  session,
  currentTopic,
  activeVotes,
  topicLogs,
  activePoll,
  questions,
  onCastPaceVote,
  onSimulateClassStruggle,
  onFastForwardTTL,
  onResetTopicVotes,
  onLaunchQuickPoll,
  onCloseQuickPoll,
  onAnswerQuickPoll,
  onAskQuestion,
  onToggleQuestionUpvote,
  onToggleQuestionSpotlight,
  onMarkQuestionAnswered,
}) => {
  // Modal state for Topic Transition Guard
  const [transitionGuardModalOpen, setTransitionGuardModalOpen] = useState<boolean>(false);
  const [pendingTargetTopicId, setPendingTargetTopicId] = useState<number | null>(null);

  // Q&A form states
  const [newQuestionText, setNewQuestionText] = useState<string>('');
  const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(null);
  const [instructorAnswerDraft, setInstructorAnswerDraft] = useState<string>('');

  // Calculate live pace metrics for current topic
  const totalVotes = activeVotes.length;
  const goodVotes = activeVotes.filter((v) => v.signal === 'good');
  const exampleVotes = activeVotes.filter((v) => v.signal === 'example');
  const fastVotes = activeVotes.filter((v) => v.signal === 'fast');

  const goodPct = totalVotes > 0 ? Math.round((goodVotes.length / totalVotes) * 100) : 0;
  const examplePct = totalVotes > 0 ? Math.round((exampleVotes.length / totalVotes) * 100) : 0;
  const fastPct = totalVotes > 0 ? Math.round((fastVotes.length / totalVotes) * 100) : 0;
  const strugglingCount = exampleVotes.length + fastVotes.length;
  const strugglingPct =
    totalVotes > 0 ? Math.round((strugglingCount / totalVotes) * 100) : 0;
  const isOverThreshold = strugglingPct > 30;

  // Current student's active vote (if any)
  const myActiveVote = activeVotes.find((v) => v.studentId === session.studentId) || null;
  const myVoteRemainingSec = myActiveVote
    ? Math.max(0, Math.ceil((myActiveVote.expiresAt - now) / 1000))
    : 0;

  const formatMMSS = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Handle clicking "เปลี่ยนหัวข้อถัดไป" or clicking another topic tab
  const handleAttemptTopicChange = (targetTopicId: number) => {
    if (targetTopicId === currentTopic.id) return;
    if (isOverThreshold) {
      setPendingTargetTopicId(targetTopicId);
      setTransitionGuardModalOpen(true);
    } else {
      onResetTopicVotes('next_topic', targetTopicId);
    }
  };

  const nextTopicId =
    currentTopic.id < COURSE_TOPICS.length ? currentTopic.id + 1 : 1;

  // Sort Questions: Unanswered first (sorted by voterIds.length DESC), then Answered
  const sortedQuestions = [...questions].sort((a, b) => {
    if (a.isAnswered !== b.isAnswered) {
      return a.isAnswered ? 1 : -1;
    }
    return b.voterIds.length - a.voterIds.length;
  });

  const spotlightQuestion = questions.find((q) => q.isSpotlight && !q.isAnswered) || null;

  // Active Quick Concept Poll remaining time
  const pollRemainingSec =
    activePoll && activePoll.isActive
      ? Math.max(0, Math.ceil((activePoll.expiresAt - now) / 1000))
      : 0;
  const myPollChoice =
    activePoll && activePoll.responses[session.studentId] !== undefined
      ? activePoll.responses[session.studentId]
      : null;

  return (
    <div className="space-y-6">
      {/* ===================================================================== */}
      {/* ACTIVE QUICK CONCEPT POLL (30 SECONDS) POPUP / BANNER                 */}
      {/* ===================================================================== */}
      {activePoll && activePoll.isActive && (
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl border-2 border-amber-400 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/15">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold">
                <Zap className="w-5 h-5" />
              </span>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  ⚡ LIVE QUICK CONCEPT POLL (คำถามเช็กความเข้าใจ 30 วินาทีก่อนข้ามหัวข้อ)
                </div>
                <h3 className="text-base sm:text-lg font-bold mt-0.5">
                  {activePoll.question}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <span
                className={`px-3.5 py-1.5 rounded-xl font-mono font-bold text-sm flex items-center gap-1.5 ${
                  pollRemainingSec <= 10
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-white/15 text-amber-200'
                }`}
              >
                <Clock className="w-4 h-4" />
                {pollRemainingSec > 0 ? `เหลือเวลา ${pollRemainingSec}s` : 'หมดเวลาโหวต'}
              </span>
              {session.role === 'instructor' && (
                <button
                  type="button"
                  onClick={onCloseQuickPoll}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200"
                  title="ปิดโพล"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            {activePoll.options.map((opt, idx) => {
              const totalPollVotes = Object.keys(activePoll.responses).length;
              const optVotes = Object.values(activePoll.responses).filter(
                (v) => v === idx
              ).length;
              const optPct =
                totalPollVotes > 0 ? Math.round((optVotes / totalPollVotes) * 100) : 0;
              const isMyChoice = myPollChoice === idx;
              const isCorrect = activePoll.correctOptionIndex === idx;
              const showAnswer =
                session.role === 'instructor' || myPollChoice !== null || pollRemainingSec === 0;

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={pollRemainingSec === 0}
                  onClick={() => onAnswerQuickPoll(idx)}
                  className={`p-4 rounded-xl border text-left transition relative overflow-hidden ${
                    isMyChoice
                      ? 'bg-amber-400/25 border-amber-300 text-white ring-2 ring-amber-300'
                      : showAnswer && isCorrect
                      ? 'bg-emerald-500/25 border-emerald-400 text-white'
                      : 'bg-white/10 hover:bg-white/15 border-white/15 text-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs sm:text-sm font-bold">
                    <span>{opt}</span>
                    {showAnswer && (
                      <span className="shrink-0 font-mono text-xs px-2 py-0.5 rounded bg-slate-950/50">
                        {optVotes} คน ({optPct}%) {isCorrect ? '✅ เฉลย' : ''}
                      </span>
                    )}
                  </div>
                  {showAnswer && (
                    <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full ${
                          isCorrect ? 'bg-emerald-400' : 'bg-indigo-400'
                        }`}
                        style={{ width: `${optPct}%` }}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-indigo-200">
            <span>
              ผู้เรียนตอบแล้ว {Object.keys(activePoll.responses).length} คน •{' '}
              {myPollChoice !== null
                ? 'คุณส่งคำตอบเรียบร้อยแล้ว!'
                : 'คลิกตัวเลือกเพื่อส่งคำตอบทันที'}
            </span>
            {session.role === 'instructor' && (
              <button
                type="button"
                onClick={onCloseQuickPoll}
                className="text-amber-300 hover:underline font-bold"
              >
                จบการทำโพลและซ่อนหน้าต่างนี้
              </button>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* COURSE TOPIC STEPPER (4 TOPICS IN SESSION)                            */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              โครงสร้างหัวข้อการสอนประจำคาบเรียน (4 หัวข้อ) • {currentTopic.slideDeckRef}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
              หัวข้อที่ {currentTopic.number}: {currentTopic.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">{currentTopic.subtitle}</p>
          </div>

          {session.role === 'instructor' && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onLaunchQuickPoll}
                className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm flex items-center gap-1.5 transition"
              >
                <Zap className="w-4 h-4" />
                ⚡ ส่ง Quick Concept Poll (30 วินาที)
              </button>

              <button
                type="button"
                onClick={() => onResetTopicVotes('reexplained')}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-4 h-4" />
                อธิบายซ้ำแล้ว / เคลียร์สัญญาณเตือน
              </button>

              <button
                type="button"
                onClick={() => handleAttemptTopicChange(nextTopicId)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition"
              >
                เปลี่ยนหัวข้อถัดไป
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* 4 Topics Selector Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2">
          {COURSE_TOPICS.map((topic) => {
            const isCurrent = topic.id === currentTopic.id;
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => {
                  if (session.role === 'instructor') {
                    handleAttemptTopicChange(topic.id);
                  }
                }}
                className={`p-3 rounded-xl border text-left transition ${
                  isCurrent
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300'
                } ${session.role !== 'instructor' ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold opacity-85">
                  <span>หัวข้อที่ {topic.number}</span>
                  <span>{topic.slideDeckRef}</span>
                </div>
                <div className="font-bold text-xs mt-1 line-clamp-2">{topic.title}</div>
              </button>
            );
          })}
        </div>

        {/* Key Slide Bullet Points for Current Topic */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="text-xs font-bold text-slate-700">
            📌 ประเด็นสำคัญในสไลด์ปัจจุบัน ({currentTopic.slideDeckRef}):
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {currentTopic.keyPoints.map((kp, i) => (
              <li
                key={i}
                className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed flex items-start gap-2"
              >
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{kp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* PILLAR 2 & PILLAR 3 TWO-COLUMN INTERACTIVE GRID                       */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN (6 cols): PILLAR 2 LIVE PACE METER + TTL + LOGS */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-700">
                  กลไกปิดช่องโหว่ที่ 2 • LIVE PACE METER (TTL 5 นาที)
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  ระบบควบคุมจังหวะการสอนสด & สัญญาณหมดอายุอัตโนมัติ
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                Active Votes: {totalVotes} คน
              </span>
            </div>

            {/* INSTRUCTOR WARNING BANNER WHEN STRUGGLING > 30% */}
            {isOverThreshold && (
              <div className="p-4 rounded-2xl bg-rose-600 text-white shadow-md border-2 border-rose-300 animate-pulse space-y-2">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-extrabold text-sm">
                      🚨 สัญญาณเตือนจังหวะการสอน: มีผู้เรียน {strugglingPct}% ({strugglingCount} จาก{' '}
                      {totalVotes} คน) กด &quot;เร็วไป&quot; หรือ &quot;ขอตัวอย่างเพิ่ม&quot; เกินเกณฑ์ 30%!
                    </div>
                    <p className="text-xs text-rose-100 mt-0.5">
                      ระบบเปิด Topic Transition Guard อัตโนมัติ — แนะนำให้อธิบายซ้ำหรือส่ง Quick Concept Poll 30 วินาทีก่อนเปลี่ยนหัวข้อถัดไป
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* STUDENT PACE SIGNAL CONTROLS (3 STATUS BUTTONS) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">
                  กดส่งสัญญาณความเร็วในการเรียนของคุณ (มีอายุ Active 5 นาที):
                </span>
                {myActiveVote && (
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    TTL คงเหลือ {formatMMSS(myVoteRemainingSec)}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => onCastPaceVote('good')}
                  className={`p-3.5 rounded-2xl border-2 text-left transition flex flex-col justify-between ${
                    myActiveVote?.signal === 'good'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-[1.01]'
                      : 'bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-950 border-emerald-200'
                  }`}
                >
                  <div className="text-sm font-extrabold">🟢 ตามทัน</div>
                  <div className="text-[11px] opacity-85 mt-0.5">Good Pace • เข้าใจชัดเจน</div>
                  <div className="mt-2 text-xs font-bold">
                    {goodVotes.length} คน ({goodPct}%)
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onCastPaceVote('example')}
                  className={`p-3.5 rounded-2xl border-2 text-left transition flex flex-col justify-between ${
                    myActiveVote?.signal === 'example'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-md scale-[1.01]'
                      : 'bg-amber-50/70 hover:bg-amber-100/80 text-amber-950 border-amber-200'
                  }`}
                >
                  <div className="text-sm font-extrabold">🟡 ขอตัวอย่างเพิ่ม</div>
                  <div className="text-[11px] opacity-85 mt-0.5">
                    Need Example • อยากเห็นเคสจริง
                  </div>
                  <div className="mt-2 text-xs font-bold">
                    {exampleVotes.length} คน ({examplePct}%)
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onCastPaceVote('fast')}
                  className={`p-3.5 rounded-2xl border-2 text-left transition flex flex-col justify-between ${
                    myActiveVote?.signal === 'fast'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-md scale-[1.01]'
                      : 'bg-rose-50/70 hover:bg-rose-100/80 text-rose-950 border-rose-200'
                  }`}
                >
                  <div className="text-sm font-extrabold">🔴 เร็วไป! ตามไม่ทัน</div>
                  <div className="text-[11px] opacity-85 mt-0.5">
                    Too Fast • ช่วยชะลอ/ทวนซ้ำ
                  </div>
                  <div className="mt-2 text-xs font-bold">
                    {fastVotes.length} คน ({fastPct}%)
                  </div>
                </button>
              </div>

              {/* Active Student Vote 5-Min TTL Progress Bar */}
              {myActiveVote && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span>
                      สถานะโหวตของคุณ:{' '}
                      <strong className="text-slate-900">
                        {myActiveVote.signal === 'good'
                          ? '🟢 ตามทัน'
                          : myActiveVote.signal === 'example'
                          ? '🟡 ขอตัวอย่างเพิ่ม'
                          : '🔴 เร็วไป! ตามไม่ทัน'}
                      </strong>{' '}
                      (Active)
                    </span>
                    <span>หมดอายุอัตโนมัติใน {formatMMSS(myVoteRemainingSec)} นาที</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-1000"
                      style={{
                        width: `${Math.min(100, (myVoteRemainingSec / 300) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Live Distribution Meter Bar */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">
                  สัดส่วนสัญญาณในหัวข้อปัจจุบัน:
                </span>
                <span
                  className={`font-bold ${
                    isOverThreshold ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  ตามไม่ทัน/ขอตัวอย่างรวม: {strugglingPct}% (เกณฑ์เตือน &gt;30%)
                </span>
              </div>

              <div className="w-full h-4 rounded-full bg-slate-100 overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${goodPct}%` }}
                  title={`ตามทัน ${goodPct}%`}
                />
                <div
                  className="bg-amber-400 h-full transition-all duration-500"
                  style={{ width: `${examplePct}%` }}
                  title={`ขอตัวอย่างเพิ่ม ${examplePct}%`}
                />
                <div
                  className="bg-rose-500 h-full transition-all duration-500"
                  style={{ width: `${fastPct}%` }}
                  title={`เร็วไป ${fastPct}%`}
                />
              </div>

              {/* Evaluator Helpers for Testing TTL & >30% Guard */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={onSimulateClassStruggle}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold transition"
                >
                  + จำลองเพื่อนกด 🔴 เร็วไป เพิ่ม (ทดสอบเกิน 30%)
                </button>
                <button
                  type="button"
                  onClick={onFastForwardTTL}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition"
                >
                  ⏩ เร่งเวลาทดสอบ Time-Decay (-2 นาที)
                </button>
              </div>
            </div>

            {/* Topic Log (ประวัติจังหวะการสอนรายหัวข้อ) */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <History className="w-4 h-4 text-indigo-600" />
                Topic Log (บันทึกประวัติก่อนรีเซ็ตโหวต/เปลี่ยนหัวข้อ):
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {topicLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-bold text-slate-800">{log.topicTitle}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">{log.note}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-bold text-[10px]">
                        {log.timestamp}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        🟢{log.goodCount} • 🟡{log.exampleCount} • 🔴{log.fastCount}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (6 cols): PILLAR 3 ACCOUNTABLE ANONYMOUS Q&A */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  กลไกปิดช่องโหว่ที่ 3 • ACCOUNTABLE ANONYMOUS Q&A
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
                  <MessageCircleQuestion className="w-5 h-5 text-emerald-600" />
                  ถาม-ตอบนิรนามแบบมีความรับผิดชอบ (1 คน 1 โหวต)
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                นามแฝงคุณ: <strong className="text-indigo-600">{session.anonymousAlias}</strong>
              </span>
            </div>

            {/* Spotlighted Question Banner */}
            {spotlightQuestion && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white border-2 border-indigo-400 shadow-md space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-extrabold flex items-center gap-1">
                    <Mic className="w-3.5 h-3.5" />
                    🎙️ กำลังอธิบายข้อนี้บนหน้าจอหลัก (Spotlight)
                  </span>
                  <span className="text-indigo-200 font-semibold">
                    {spotlightQuestion.anonymousAlias} • 🔥 {spotlightQuestion.voterIds.length} โหวต
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-bold leading-relaxed">
                  “{spotlightQuestion.content}”
                </p>
              </div>
            )}

            {/* Submit Anonymous Question Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newQuestionText.trim()) return;
                onAskQuestion(newQuestionText.trim());
                setNewQuestionText('');
              }}
              className="flex flex-col sm:flex-row gap-2"
            >
              <input
                type="text"
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder={`ถามคำถามในนาม "${session.anonymousAlias}" (เพื่อนไม่เห็นชื่อจริง)...`}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-sm flex items-center justify-center gap-1.5 shrink-0 transition"
              >
                <Send className="w-4 h-4" />
                ส่งคำถามนิรนาม
              </button>
            </form>

            {/* Questions Queue List (Sorted by Vote Count) */}
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {sortedQuestions.map((q) => {
                const hasUpvoted = q.voterIds.includes(session.studentId);
                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-2xl border transition ${
                      q.isAnswered
                        ? 'bg-slate-50 border-slate-200 opacity-85'
                        : q.isSpotlight
                        ? 'bg-indigo-50/70 border-2 border-indigo-500 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-indigo-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-full">
                            🕵️ {q.anonymousAlias}
                          </span>
                          <span className="text-slate-400">• {q.createdAt}</span>
                          {q.isSpotlight && !q.isAnswered && (
                            <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white font-bold text-[10px]">
                              🎙️ Spotlight
                            </span>
                          )}
                          {q.isAnswered && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              ✅ ตอบแล้ว ({q.answeredAt})
                            </span>
                          )}
                        </div>

                        <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed pt-1">
                          {q.content}
                        </p>
                      </div>

                      {/* 1-Person 1-Upvote Button */}
                      <button
                        type="button"
                        onClick={() => onToggleQuestionUpvote(q.id)}
                        title={
                          hasUpvoted
                            ? 'คลิกซ้ำเพื่อยกเลิกโหวต (ป้องกันการปั๊มโหวต)'
                            : 'กดโหวตคำถามนี้ (+1)'
                        }
                        className={`px-3 py-2 rounded-xl border text-xs font-extrabold flex flex-col items-center justify-center shrink-0 min-w-[78px] transition ${
                          hasUpvoted
                            ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                            : 'bg-orange-50 hover:bg-orange-100 text-orange-900 border-orange-200'
                        }`}
                      >
                        <span className="flex items-center gap-1 text-sm">
                          🔥 +{q.voterIds.length}
                        </span>
                        <span className="text-[10px] mt-0.5">
                          {hasUpvoted ? 'โหวตแล้ว' : 'สงสัยด้วย'}
                        </span>
                      </button>
                    </div>

                    {/* Instructor Written Summary Answer */}
                    {q.isAnswered && q.instructorAnswer && (
                      <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
                        <div className="font-bold text-emerald-800 mb-0.5">
                          ✅ สรุปคำตอบจากผู้สอน:
                        </div>
                        <p className="leading-relaxed">{q.instructorAnswer}</p>
                      </div>
                    )}

                    {/* Instructor Action Controls */}
                    {session.role === 'instructor' && !q.isAnswered && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onToggleQuestionSpotlight(q.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                              q.isSpotlight
                                ? 'bg-indigo-600 text-white'
                                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                            }`}
                          >
                            🎙️ {q.isSpotlight ? 'ปิด Spotlight' : 'กำลังอธิบายข้อนี้ (Spotlight)'}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setAnsweringQuestionId(
                                answeringQuestionId === q.id ? null : q.id
                              );
                              setInstructorAnswerDraft(
                                'ผู้สอนอธิบายขยายความในห้องเรียนพร้อมยกตัวอย่างประกอบเรียบร้อยแล้ว'
                              );
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition"
                          >
                            ✅ ตอบแล้ว (แนบสรุปคำตอบ)
                          </button>
                        </div>

                        {answeringQuestionId === q.id && (
                          <div className="flex flex-col sm:flex-row gap-2 pt-1">
                            <input
                              type="text"
                              value={instructorAnswerDraft}
                              onChange={(e) => setInstructorAnswerDraft(e.target.value)}
                              placeholder="พิมพ์สรุปคำตอบสั้นๆ แนบไว้ใต้คำถาม..."
                              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                onMarkQuestionAnswered(q.id, instructorAnswerDraft);
                                setAnsweringQuestionId(null);
                              }}
                              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold shrink-0"
                            >
                              บันทึกคำตอบ
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TOPIC TRANSITION GUARD MODAL (WHEN > 30% STRUGGLING)                  */}
      {/* ===================================================================== */}
      {transitionGuardModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border-2 border-rose-500 shadow-2xl overflow-hidden animate-fadeIn">
            <div className="bg-rose-600 text-white px-6 py-4 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-rose-100">
                  TOPIC TRANSITION GUARD • ระบบป้องกันการข้ามหัวข้อเร็วเกินไป
                </div>
                <h3 className="text-base font-bold">
                  ตรวจพบผู้เรียนตามไม่ทันเกินเกณฑ์ 30%!
                </h3>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm font-bold text-slate-900 leading-relaxed">
                “มีผู้เรียน <span className="text-rose-600 underline">{strugglingPct}%</span> ยังตามไม่ทันในหัวข้อนี้ ต้องการส่ง Quick Pulse Check 1 คำถามก่อนข้ามหัวข้อหรือไม่?”
              </p>

              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                <div>
                  • กด 🟡 ขอตัวอย่างเพิ่ม: <strong>{exampleVotes.length} คน</strong> ({examplePct}%)
                </div>
                <div>
                  • กด 🔴 เร็วไป! ตามไม่ทัน: <strong>{fastVotes.length} คน</strong> ({fastPct}%)
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTransitionGuardModalOpen(false);
                    onLaunchQuickPoll();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 transition"
                >
                  <Zap className="w-4 h-4" />
                  ⚡ ส่ง Quick Concept Poll (30 วินาที) เช็กความเข้าใจเดี๋ยวนี้
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTransitionGuardModalOpen(false);
                    onResetTopicVotes('reexplained');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  อธิบายซ้ำแล้ว / เคลียร์สัญญาณเตือนก่อน
                </button>

                <div className="flex items-center justify-between gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setTransitionGuardModalOpen(false)}
                    className="flex-1 py-2 px-3 rounded-xl border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                  >
                    ยกเลิก (อยู่ในหัวข้อเดิม)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const target = pendingTargetTopicId || nextTopicId;
                      setTransitionGuardModalOpen(false);
                      onResetTopicVotes('force_next_topic', target);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold"
                  >
                    ข้ามไปหัวข้อถัดไปทันที
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

