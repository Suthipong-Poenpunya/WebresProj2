import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  KeyRound,
  UserCheck,
  AlertOctagon,
  Radio,
  BookOpen,
  MessageSquareText,
  FileCheck2,
  LogOut,
  RotateCcw,
  Sparkles,
  Users,
  Lock,
  CheckCircle2,
  GraduationCap,
} from 'lucide-react';
import {
  AssignmentSubmission,
  AuthenticityStatus,
  ClassPulseSharedState,
  FeedPost,
  MicroReactionType,
  PaceSignalType,
  PinnedEssentialItem,
  UserSession,
} from './types';
import {
  CONCEPT_POLL_TEMPLATES,
  COURSE_TOPICS,
  createInitialSeedState,
} from './seedData';
import { LiveClassroomSection } from './components/LiveClassroomSection';
import { ClassroomFeedSection } from './components/ClassroomFeedSection';
import { AuthenticStudioSection } from './components/AuthenticStudioSection';

const STORAGE_KEY = 'CLASSPULSE_LMS_SHARED_STATE_V1';
const CHANNEL_NAME = 'classpulse_lms_sync_channel_v1';

export const App: React.FC = () => {
  // Load or initialize shared state from localStorage
  const [sharedState, setSharedState] = useState<ClassPulseSharedState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ClassPulseSharedState;
        if (parsed && parsed.version === 1) {
          return parsed;
        }
      }
    } catch {
      // Fallback to seed state
    }
    const seed = createInitialSeedState(Date.now());
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    } catch {
      // ignore storage errors
    }
    return seed;
  });

  // Current active user session (defaults to Student A or Login View; let's provide both Top Role Switcher AND Login Modal / Screen)
  const [session, setSession] = useState<UserSession>({
    role: 'instructor',
    roomCode: 'ED2026',
    studentId: 'INSTRUCTOR-01',
    nickname: 'ผศ.ดร.ธนภัทร (อาจารย์ผู้สอน)',
    pin: '0000',
    anonymousAlias: 'ผู้สอนประจำวิชา',
  });

  // Remember last selected student session when toggling Top Role Switcher Bar
  const [lastStudentSession, setLastStudentSession] = useState<UserSession>({
    role: 'student',
    roomCode: 'ED2026',
    studentId: '6740101127',
    nickname: 'ต้นน้ำ (นิสิต A)',
    pin: '1111',
    anonymousAlias: 'ผู้เรียนนิรนาม #308',
  });

  // Navigation Tabs: 'live' (Pillar 2 & 3), 'feed' (Pillar 4), 'studio' (Pillar 5), 'login' (Pillar 1 Join/Switch)
  const [activeTab, setActiveTab] = useState<'live' | 'feed' | 'studio' | 'login'>('live');

  // Pillar 1: PIN-Claimed Session Login Form State
  const [joinRoomCode, setJoinRoomCode] = useState<string>('ED2026');
  const [joinStudentId, setJoinStudentId] = useState<string>('6740101127');
  const [joinNickname, setJoinNickname] = useState<string>('ต้นน้ำ');
  const [joinPin, setJoinPin] = useState<string>('1111');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccessMsg, setLoginSuccessMsg] = useState<string | null>(null);

  // Real-time clock for 5-min Pace Vote TTL & 30s Quick Poll countdown
  const [now, setNow] = useState<number>(Date.now());
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Setup BroadcastChannel + Storage Event Listener for multi-tab real-time sync
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      bc = new BroadcastChannel(CHANNEL_NAME);
      bc.onmessage = (event) => {
        if (event.data && event.data.type === 'SYNC_STATE') {
          setSharedState(event.data.payload);
        }
      };
      broadcastChannelRef.current = bc;
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setSharedState(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // 1-second ticker for TTL and Poll timers
  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Helper to update shared state and broadcast to all tabs immediately
  const updateSharedState = (
    updater: (prev: ClassPulseSharedState) => ClassPulseSharedState
  ) => {
    setSharedState((prev) => {
      const next = updater(prev);
      const stamped: ClassPulseSharedState = {
        ...next,
        lastUpdated: Date.now(),
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stamped));
      } catch {
        // ignore
      }
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({
          type: 'SYNC_STATE',
          payload: stamped,
        });
      }
      return stamped;
    });
  };

  // ===========================================================================
  // PILLAR 1: PIN-CLAIMED SESSION & ANTI-IMPERSONATION GUARD
  // ===========================================================================
  const handleQuickRoomJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSuccessMsg(null);

    const cleanRoom = joinRoomCode.trim().toUpperCase();
    const cleanId = joinStudentId.trim();
    const cleanNick = joinNickname.trim() || `นิสิต ${cleanId.slice(-4)}`;
    const cleanPin = joinPin.trim();

    if (cleanRoom.length !== 6) {
      setLoginError('รหัสห้องเรียนต้องมีความยาว 6 หลัก (เช่น ED2026)');
      return;
    }
    if (cleanId.length < 4) {
      setLoginError('กรุณากรอกรหัสนิสิตให้ถูกต้อง');
      return;
    }
    if (!/^\d{4}$/.test(cleanPin)) {
      setLoginError('กรุณาตั้งรหัส PIN เป็นตัวเลข 4 หลัก (เช่น 1111)');
      return;
    }

    const existingClaim = sharedState.claimedStudents[cleanId];
    if (existingClaim) {
      // ANTI-IMPERSONATION GUARD CHECK
      if (existingClaim.pin !== cleanPin) {
        setLoginError(
          'ป้องกันการสวมรอย: รหัส PIN ไม่ตรงกับเจ้าของรหัสนิสิต (รหัสนิสิตนี้ถูกลงทะเบียนไว้แล้วด้วย PIN อื่น กรุณาตรวจสอบรหัส PIN 4 หลักของคุณ)'
        );
        return;
      }

      // Valid returning student
      const verifiedSession: UserSession = {
        role: 'student',
        roomCode: cleanRoom,
        studentId: existingClaim.studentId,
        nickname: existingClaim.nickname,
        pin: existingClaim.pin,
        anonymousAlias: existingClaim.anonymousAlias,
      };
      setSession(verifiedSession);
      setLastStudentSession(verifiedSession);
      setLoginSuccessMsg(
        `ยืนยันตัวตนสำเร็จ! ยินดีต้อนรับกลับเข้าห้องเรียน ${existingClaim.nickname} (${existingClaim.anonymousAlias})`
      );
      setActiveTab('live');
      return;
    }

    // Claim new student ID with 4-digit PIN
    const aliasNum =
      100 +
      (cleanId
        .split('')
        .reduce((acc, ch) => acc + ch.charCodeAt(0), 0) %
        899);
    const alias = `ผู้เรียนนิรนาม #${aliasNum}`;

    updateSharedState((prev) => ({
      ...prev,
      claimedStudents: {
        ...prev.claimedStudents,
        [cleanId]: {
          studentId: cleanId,
          nickname: cleanNick,
          pin: cleanPin,
          roomCode: cleanRoom,
          anonymousAlias: alias,
          claimedAt: Date.now(),
        },
      },
    }));

    const newSession: UserSession = {
      role: 'student',
      roomCode: cleanRoom,
      studentId: cleanId,
      nickname: cleanNick,
      pin: cleanPin,
      anonymousAlias: alias,
    };
    setSession(newSession);
    setLastStudentSession(newSession);
    setLoginSuccessMsg(
      `ลงทะเบียนผูก PIN 4 หลักสำเร็จ! เข้าสู่ห้องเรียนในชื่อ ${cleanNick} (${alias})`
    );
    setActiveTab('live');
  };

  // 1-Click Demo Presets (3 Profiles)
  const applyPresetProfile = (preset: 'instructor' | 'studentA' | 'studentB') => {
    setLoginError(null);
    setLoginSuccessMsg(null);
    if (preset === 'instructor') {
      setSession({
        role: 'instructor',
        roomCode: 'ED2026',
        studentId: 'INSTRUCTOR-01',
        nickname: 'ผศ.ดร.ธนภัทร (ผู้สอน)',
        pin: '0000',
        anonymousAlias: 'ผู้สอนประจำวิชา',
      });
    } else if (preset === 'studentA') {
      const sA: UserSession = {
        role: 'student',
        roomCode: 'ED2026',
        studentId: '6740101127',
        nickname: 'ต้นน้ำ (นิสิต A)',
        pin: '1111',
        anonymousAlias: 'ผู้เรียนนิรนาม #308',
      };
      setSession(sA);
      setLastStudentSession(sA);
    } else if (preset === 'studentB') {
      const sB: UserSession = {
        role: 'student',
        roomCode: 'ED2026',
        studentId: '6740102527',
        nickname: 'แพรวา (นิสิต B)',
        pin: '2222',
        anonymousAlias: 'ผู้เรียนนิรนาม #412',
      };
      setSession(sB);
      setLastStudentSession(sB);
      setActiveTab('studio');
    }
  };

  // ===========================================================================
  // PILLAR 2: LIVE PACE METER & TTL + TOPIC TRANSITION GUARD HANDLERS
  // ===========================================================================
  const currentTopic =
    COURSE_TOPICS.find((t) => t.id === sharedState.currentTopicId) || COURSE_TOPICS[1];

  // Filter out expired votes (> 5 mins TTL) for the current topic
  const activeTopicVotes = sharedState.paceVotes.filter(
    (v) => v.topicId === currentTopic.id && v.expiresAt > now
  );

  const handleCastPaceVote = (signal: PaceSignalType) => {
    const voteNow = Date.now();
    const fiveMinutesMs = 5 * 60 * 1000;
    updateSharedState((prev) => {
      const otherVotes = prev.paceVotes.filter(
        (v) => !(v.topicId === prev.currentTopicId && v.studentId === session.studentId)
      );
      return {
        ...prev,
        paceVotes: [
          ...otherVotes,
          {
            studentId: session.studentId,
            nickname: session.nickname,
            signal,
            timestamp: voteNow,
            expiresAt: voteNow + fiveMinutesMs,
            topicId: prev.currentTopicId,
          },
        ],
      };
    });
  };

  const handleSimulateClassStruggle = () => {
    const voteNow = Date.now();
    const fiveMinutesMs = 5 * 60 * 1000;
    updateSharedState((prev) => ({
      ...prev,
      paceVotes: [
        ...prev.paceVotes,
        {
          studentId: `sim-fast-${voteNow}-1`,
          nickname: 'นิสิตจำลอง #1',
          signal: 'fast',
          timestamp: voteNow,
          expiresAt: voteNow + fiveMinutesMs,
          topicId: prev.currentTopicId,
        },
        {
          studentId: `sim-fast-${voteNow}-2`,
          nickname: 'นิสิตจำลอง #2',
          signal: 'example',
          timestamp: voteNow,
          expiresAt: voteNow + fiveMinutesMs,
          topicId: prev.currentTopicId,
        },
      ],
    }));
  };

  const handleFastForwardTTL = () => {
    // Advance expiration by 2 minutes (120,000 ms) so evaluator can watch votes decay & expire
    updateSharedState((prev) => ({
      ...prev,
      paceVotes: prev.paceVotes.map((v) => ({
        ...v,
        expiresAt: v.expiresAt - 120_000,
      })),
    }));
  };

  const handleResetTopicVotes = (
    actionType: 'reexplained' | 'next_topic' | 'force_next_topic',
    targetTopicId?: number
  ) => {
    const timeStr = new Date().toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    });

    updateSharedState((prev) => {
      const currVotes = prev.paceVotes.filter(
        (v) => v.topicId === prev.currentTopicId && v.expiresAt > Date.now()
      );
      const goodCount = currVotes.filter((v) => v.signal === 'good').length;
      const exampleCount = currVotes.filter((v) => v.signal === 'example').length;
      const fastCount = currVotes.filter((v) => v.signal === 'fast').length;
      const total = currVotes.length;
      const confusionRatio =
        total > 0 ? Math.round(((exampleCount + fastCount) / total) * 100) : 0;

      const tObj =
        COURSE_TOPICS.find((t) => t.id === prev.currentTopicId) || COURSE_TOPICS[0];

      const logNote =
        actionType === 'reexplained'
          ? 'ผู้สอนอธิบายซ้ำและยกตัวอย่างเพิ่ม ก่อนเคลียร์สัญญาณเตือนของหัวข้อนี้'
          : actionType === 'force_next_topic'
          ? `ผู้สอนยืนยันข้ามไปหัวข้อถัดไป (ขณะมีผู้เรียนตามไม่ทัน ${confusionRatio}%)`
          : 'เปลี่ยนเข้าสู่หัวข้อถัดไปตามแผนการสอน';

      const nextTopic = targetTopicId || prev.currentTopicId;
      const freshVotesForNext =
        actionType === 'reexplained'
          ? [
              {
                studentId: '6740101127',
                nickname: 'ต้นน้ำ (นิสิต A)',
                signal: 'good' as const,
                timestamp: Date.now(),
                expiresAt: Date.now() + 5 * 60 * 1000,
                topicId: nextTopic,
              },
            ]
          : prev.paceVotes.filter((v) => v.topicId !== prev.currentTopicId);

      return {
        ...prev,
        currentTopicId: nextTopic,
        paceVotes: freshVotesForNext,
        topicLogs: [
          {
            id: `log-${Date.now()}`,
            topicId: tObj.id,
            topicTitle: `หัวข้อที่ ${tObj.number}: ${tObj.title}`,
            actionType,
            timestamp: `${timeStr} น.`,
            goodCount,
            exampleCount,
            fastCount,
            confusionRatio,
            note: logNote,
          },
          ...prev.topicLogs,
        ],
      };
    });
  };

  // Quick Concept Poll (30 Seconds)
  const handleLaunchQuickPoll = () => {
    const pollNow = Date.now();
    const template =
      CONCEPT_POLL_TEMPLATES[sharedState.currentTopicId] || CONCEPT_POLL_TEMPLATES[2];
    updateSharedState((prev) => ({
      ...prev,
      activePoll: {
        id: `poll-${pollNow}`,
        topicId: prev.currentTopicId,
        question: template.question,
        options: template.options,
        correctOptionIndex: template.correctOptionIndex,
        createdAt: pollNow,
        expiresAt: pollNow + 30_000,
        isActive: true,
        responses: {
          '6740103127': template.correctOptionIndex,
          '6740103227': template.correctOptionIndex,
          '6740108927': 0,
        },
      },
    }));
  };

  const handleCloseQuickPoll = () => {
    updateSharedState((prev) => ({
      ...prev,
      activePoll: prev.activePoll ? { ...prev.activePoll, isActive: false } : null,
    }));
  };

  const handleAnswerQuickPoll = (optionIdx: number) => {
    updateSharedState((prev) => {
      if (!prev.activePoll) return prev;
      return {
        ...prev,
        activePoll: {
          ...prev.activePoll,
          responses: {
            ...prev.activePoll.responses,
            [session.studentId]: optionIdx,
          },
        },
      };
    });
  };

  // ===========================================================================
  // PILLAR 3: ACCOUNTABLE ANONYMOUS Q&A HANDLERS
  // ===========================================================================
  const handleAskQuestion = (content: string) => {
    const timeStr = new Date().toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    });
    updateSharedState((prev) => ({
      ...prev,
      questions: [
        {
          id: `q-${Date.now()}`,
          topicId: prev.currentTopicId,
          authorStudentId: session.studentId,
          anonymousAlias: session.anonymousAlias,
          content,
          createdAt: `${timeStr} น.`,
          voterIds: [session.studentId],
          isSpotlight: false,
          isAnswered: false,
        },
        ...prev.questions,
      ],
    }));
  };

  const handleToggleQuestionUpvote = (questionId: string) => {
    updateSharedState((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => {
        if (q.id !== questionId) return q;
        const alreadyVoted = q.voterIds.includes(session.studentId);
        const nextVoters = alreadyVoted
          ? q.voterIds.filter((id) => id !== session.studentId)
          : [...q.voterIds, session.studentId];
        return {
          ...q,
          voterIds: nextVoters,
        };
      }),
    }));
  };

  const handleToggleQuestionSpotlight = (questionId: string) => {
    updateSharedState((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => ({
        ...q,
        isSpotlight: q.id === questionId ? !q.isSpotlight : false,
      })),
    }));
  };

  const handleMarkQuestionAnswered = (questionId: string, instructorAnswer: string) => {
    const timeStr = new Date().toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    });
    updateSharedState((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              isAnswered: true,
              isSpotlight: false,
              instructorAnswer:
                instructorAnswer.trim() || 'ผู้สอนตอบและอธิบายเพิ่มเติมในชั้นเรียนเรียบร้อยแล้ว',
              answeredAt: `${timeStr} น.`,
            }
          : q
      ),
    }));
  };

  // ===========================================================================
  // PILLAR 4: STRUCTURED CLASSROOM FEED HANDLERS
  // ===========================================================================
  const handleAddFeedPost = (post: FeedPost) => {
    updateSharedState((prev) => ({
      ...prev,
      feedPosts: [post, ...prev.feedPosts],
    }));
  };

  const handleToggleReaction = (
    postId: string,
    reaction: MicroReactionType,
    userId: string
  ) => {
    updateSharedState((prev) => ({
      ...prev,
      feedPosts: prev.feedPosts.map((p) => {
        if (p.id !== postId) return p;
        const list = p.reactions[reaction] || [];
        const exists = list.includes(userId);
        const nextList = exists ? list.filter((id) => id !== userId) : [...list, userId];
        return {
          ...p,
          reactions: {
            ...p.reactions,
            [reaction]: nextList,
          },
        };
      }),
    }));
  };

  const handleAddPinnedItem = (item: PinnedEssentialItem) => {
    updateSharedState((prev) => ({
      ...prev,
      pinnedItems: [item, ...prev.pinnedItems],
    }));
  };

  const handleRemovePinnedItem = (id: string) => {
    updateSharedState((prev) => ({
      ...prev,
      pinnedItems: prev.pinnedItems.filter((p) => p.id !== id),
    }));
  };

  // ===========================================================================
  // PILLAR 5: 3-STAGE AUTHENTIC STUDIO HANDLERS
  // ===========================================================================
  const handleAddSubmission = (submission: AssignmentSubmission) => {
    updateSharedState((prev) => ({
      ...prev,
      submissions: [submission, ...prev.submissions],
    }));
  };

  const handleUpdateSubmissionStatus = (
    submissionId: string,
    status: AuthenticityStatus,
    feedback?: string
  ) => {
    updateSharedState((prev) => ({
      ...prev,
      submissions: prev.submissions.map((s) =>
        s.id === submissionId
          ? {
              ...s,
              status,
              instructorFeedback:
                feedback !== undefined ? feedback : s.instructorFeedback,
            }
          : s
      ),
    }));
  };

  // Reset entire seed state
  const handleResetDemoData = () => {
    const fresh = createInitialSeedState(Date.now());
    updateSharedState(() => fresh);
    setLoginError(null);
    setLoginSuccessMsg('รีเซ็ตข้อมูลตัวอย่างตั้งต้น (Seed Data) ทั้งหมดเรียบร้อยแล้ว!');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* ===================================================================== */}
      {/* TOP ROLE SWITCHER BAR (STICKY - CONTINUOUS REAL-TIME SYNC)            */}
      {/* ===================================================================== */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Course Badge */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-base shadow-inner">
              CP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight">
                  ClassPulse LMS
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <Radio className="w-3 h-3 animate-pulse" />
                  Sync: localStorage + BroadcastChannel
                </span>
              </div>
              <div className="text-[11px] text-slate-300">
                วิชา <strong className="text-white">{sharedState.courseCode}</strong>{' '}
                {sharedState.courseName} • ห้อง <strong className="text-amber-300">{sharedState.roomCode}</strong>
              </div>
            </div>
          </div>

          {/* Instant Role Switcher + 1-Click Presets */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Primary Top Role Switcher Buttons */}
            <div className="inline-flex rounded-xl bg-slate-800 p-1 border border-slate-700">
              <button
                type="button"
                onClick={() => applyPresetProfile('instructor')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  session.role === 'instructor'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                👨‍🏫 มุมมองผู้สอน
              </button>
              <button
                type="button"
                onClick={() => {
                  setSession(lastStudentSession);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  session.role === 'student'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                🎓 มุมมองผู้เรียน ({lastStudentSession.nickname.split(' ')[0]})
              </button>
            </div>

            {/* Quick Student A / Student B Switcher */}
            <div className="hidden xl:flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => applyPresetProfile('studentA')}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition ${
                  session.studentId === '6740101127'
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                🎓 นิสิต A (ตั้งใจเรียน)
              </button>
              <button
                type="button"
                onClick={() => applyPresetProfile('studentB')}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition ${
                  session.studentId === '6740102527'
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                🎓 นิสิต B (ทดสอบส่งงาน)
              </button>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                activeTab === 'login'
                  ? 'bg-amber-400 text-slate-950 border-amber-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              PIN Login / สลับโปรไฟล์
            </button>

            <button
              type="button"
              onClick={handleResetDemoData}
              title="รีเซ็ตข้อมูลตัวอย่างตั้งต้น"
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-Bar: Active User Session Info & Main Module Navigation */}
        <div className="bg-slate-950/80 border-t border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
            {/* Navigation Tabs */}
            <nav className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('live')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  activeTab === 'live'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-white/10'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                1. ห้องเรียนสด & Q&A นิรนาม (Pace + Q&A)
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('feed')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  activeTab === 'feed'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-white/10'
                }`}
              >
                <MessageSquareText className="w-3.5 h-3.5" />
                2. ฟีดความรู้ไร้สติ๊กเกอร์ (Structured Feed)
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('studio')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  activeTab === 'studio'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-white/10'
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                3. {session.role === 'instructor' ? 'ตรวจงาน Authentic Inspector' : 'สตูดิโอส่งการบ้าน 3-Stage'}
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px]">
                  {sharedState.submissions.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  activeTab === 'login'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-white/10'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                4. ระบบเข้าห้องเรียน PIN-Claimed Session
              </button>
            </nav>

            {/* Current Session Pill */}
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span>กำลังใช้งานในฐานะ:</span>
              <span
                className={`px-2.5 py-0.5 rounded-full font-bold ${
                  session.role === 'instructor'
                    ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/40'
                    : 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40'
                }`}
              >
                {session.role === 'instructor'
                  ? `👨‍🏫 ${session.nickname}`
                  : `🎓 ${session.nickname} (${session.studentId}) • PIN: ${session.pin}`}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* MAIN WORKSPACE CONTENT                                                */}
      {/* ===================================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {/* TAB 4: PILLAR 1 PIN-CLAIMED SESSION LOGIN & ANTI-IMPERSONATION GUARD */}
        {activeTab === 'login' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
            <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-500/30">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-bold mb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                กลไกปิดช่องโหว่ที่ 1 • PIN-Claimed Session & Anti-Impersonation Guard
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                เข้าห้องเรียนไวใน 5 วินาที พร้อมระบบป้องกันการสวมรอยรหัสเพื่อน
              </h1>
              <p className="text-slate-300 text-sm mt-2 leading-relaxed">
                ไม่ต้องใช้อีเมลหรือสมัครสมาชิกยาว เพียงกรอกรหัสห้อง 6 หลัก + รหัสนิสิต + ตั้ง PIN 4 หลัก ระบบจะล็อกสิทธิ์รหัสนิสิตนั้นทันที หากมีคนอื่นกรอกรหัสนิสิตซ้ำแต่ใส่ PIN ไม่ตรง ระบบจะบล็อกการสวมรอยทันที!
              </p>
            </div>

            {/* 1-Click Demo Presets (3 Profiles) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    1-Click Demo Presets (คลิกเข้าใช้งานทันที 3 โปรไฟล์เพื่อทดสอบระบบ)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    คลิกเลือกโปรไฟล์ด้านล่างเพื่อสลับมุมมองและทดสอบฟีเจอร์ทั้งหมดได้ทันที
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    applyPresetProfile('instructor');
                    setActiveTab('live');
                  }}
                  className="p-4 rounded-2xl border-2 border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/70 text-left transition group"
                >
                  <div className="text-base font-extrabold text-indigo-950 group-hover:text-indigo-700">
                    👨‍🏫 อาจารย์ผู้สอน (Instructor View)
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    ผศ.ดร.ธนภัทร • ควบคุมหัวข้อสไลด์, ส่ง Quick Poll 30s, เลือก Spotlight Q&A และตรวจงาน Authentic Inspector
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    applyPresetProfile('studentA');
                    setActiveTab('live');
                  }}
                  className="p-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-left transition group"
                >
                  <div className="text-base font-extrabold text-emerald-950 group-hover:text-emerald-700">
                    🎓 นิสิต A - ตั้งใจเรียน (Student View)
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    รหัส 6740101127 (ต้นน้ำ • PIN: 1111) • กดโหวตความเร็ว, ถามคำถามนิรนาม #308, โพสต์โน้ตสรุปช่วยเพื่อน
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    applyPresetProfile('studentB');
                    setActiveTab('studio');
                  }}
                  className="p-4 rounded-2xl border-2 border-amber-200 bg-amber-50/60 hover:bg-amber-100/70 text-left transition group"
                >
                  <div className="text-base font-extrabold text-amber-950 group-hover:text-amber-700">
                    🎓 นิสิต B - ทดสอบส่งงาน (Student View)
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    รหัส 6740102527 (แพรวา • PIN: 2222) • เข้าสู่สตูดิโอส่งการบ้าน 3-Stage และทดสอบด่านยืนยันตัวตน 60 วินาทีทันที
                  </div>
                </button>
              </div>
            </div>

            {/* Quick Room Join + 4-Digit PIN Form & Anti-Impersonation Guard Tester */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <KeyRound className="w-5 h-5 text-indigo-600" />
                      Quick Room Join + 4-Digit PIN
                    </h3>
                    <p className="text-xs text-slate-500">
                      กรอกรหัสนิสิตใหม่เพื่อผูก PIN หรือกรอกรหัสเดิมพร้อม PIN ที่ถูกต้องเพื่อเข้าเรียนต่อ
                    </p>
                  </div>
                </div>

                {/* Anti-Impersonation Alert Banner */}
                {loginError && (
                  <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-500 text-rose-950 space-y-1 animate-fadeIn">
                    <div className="font-extrabold text-sm text-rose-700 flex items-center gap-2">
                      <AlertOctagon className="w-5 h-5 shrink-0" />
                      ระบบบล็อกการเข้าสู่ระบบ (Anti-Impersonation Guard)
                    </div>
                    <p className="text-xs font-bold leading-relaxed">{loginError}</p>
                  </div>
                )}

                {loginSuccessMsg && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    {loginSuccessMsg}
                  </div>
                )}

                <form onSubmit={handleQuickRoomJoin} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        รหัสห้องเรียน 6 หลัก (Room Code)
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={joinRoomCode}
                        onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold uppercase bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="ED2026"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        รหัสนิสิต (Student ID)
                      </label>
                      <input
                        type="text"
                        value={joinStudentId}
                        onChange={(e) => setJoinStudentId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="เช่น 6740101127"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ชื่อเล่น (Nickname)
                      </label>
                      <input
                        type="text"
                        value={joinNickname}
                        onChange={(e) => setJoinNickname(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="เช่น ต้นน้ำ"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        รหัส PIN 4 หลัก (4-Digit Security PIN)
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={joinPin}
                        onChange={(e) => setJoinPin(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="••••"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setJoinRoomCode('ED2026');
                        setJoinStudentId('6740101127');
                        setJoinNickname('คนแอบอ้างสวมรอย');
                        setJoinPin('9999');
                        setLoginError(
                          'ป้องกันการสวมรอย: รหัส PIN ไม่ตรงกับเจ้าของรหัสนิสิต (รหัสนิสิต 6740101127 ถูกลงทะเบียนไว้ด้วย PIN อื่นแล้ว!)'
                        );
                      }}
                      className="px-3.5 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold transition"
                    >
                      🚨 คลิกทดสอบสวมรอยรหัสเพื่อน (ใส่ PIN ผิด)
                    </button>

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md transition"
                    >
                      เข้าสู่ห้องเรียนด้วย PIN
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Registry of Claimed Student PIN Sessions */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    รายการรหัสนิสิตที่ผูก PIN แล้วในห้องนี้ (Claimed Sessions)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ข้อมูลชุดนี้ใช้ตรวจสอบ Anti-Impersonation Guard แบบ Real-time
                  </p>
                </div>

                <div className="space-y-2.5">
                  {Object.values(sharedState.claimedStudents).map((rec) => (
                    <div
                      key={rec.studentId}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">
                          {rec.nickname} ({rec.studentId})
                        </div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          นามแฝง Q&A: <strong className="text-indigo-600">{rec.anonymousAlias}</strong>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-mono font-bold">
                          PIN: {rec.pin}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: LIVE CLASSROOM (PILLAR 2 LIVE PACE METER + PILLAR 3 ANONYMOUS Q&A) */}
        {activeTab === 'live' && (
          <LiveClassroomSection
            now={now}
            session={session}
            currentTopic={currentTopic}
            activeVotes={activeTopicVotes}
            topicLogs={sharedState.topicLogs}
            activePoll={sharedState.activePoll}
            questions={sharedState.questions}
            onCastPaceVote={handleCastPaceVote}
            onSimulateClassStruggle={handleSimulateClassStruggle}
            onFastForwardTTL={handleFastForwardTTL}
            onResetTopicVotes={handleResetTopicVotes}
            onLaunchQuickPoll={handleLaunchQuickPoll}
            onCloseQuickPoll={handleCloseQuickPoll}
            onAnswerQuickPoll={handleAnswerQuickPoll}
            onAskQuestion={handleAskQuestion}
            onToggleQuestionUpvote={handleToggleQuestionUpvote}
            onToggleQuestionSpotlight={handleToggleQuestionSpotlight}
            onMarkQuestionAnswered={handleMarkQuestionAnswered}
          />
        )}

        {/* TAB 2: STRUCTURED CLASSROOM FEED (PILLAR 4) */}
        {activeTab === 'feed' && (
          <ClassroomFeedSection
            session={session}
            currentTopic={currentTopic}
            pinnedItems={sharedState.pinnedItems}
            feedPosts={sharedState.feedPosts}
            onAddFeedPost={handleAddFeedPost}
            onToggleReaction={handleToggleReaction}
            onAddPinnedItem={handleAddPinnedItem}
            onRemovePinnedItem={handleRemovePinnedItem}
            onNavigateToStudio={() => setActiveTab('studio')}
          />
        )}

        {/* TAB 3: 3-STAGE AUTHENTIC ASSIGNMENT STUDIO & INSPECTOR (PILLAR 5) */}
        {activeTab === 'studio' && (
          <AuthenticStudioSection
            session={session}
            currentTopic={currentTopic}
            submissions={sharedState.submissions}
            onAddSubmission={handleAddSubmission}
            onUpdateSubmissionStatus={handleUpdateSubmissionStatus}
          />
        )}
      </main>
    </div>
  );
};

export default App;

