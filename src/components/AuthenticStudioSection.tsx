import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Flame,
  Clock,
  Keyboard,
  ClipboardPaste,
  RotateCcw,
  Sparkles,
  PenTool,
  Mic,
  Square,
  EyeOff,
  CheckCircle2,
  FileText,
  UserCheck,
  Search,
  Lock,
  Send,
  Volume2,
  BookOpen,
  SlidersHorizontal,
} from 'lucide-react';
import {
  AssignmentSubmission,
  AuthenticityStatus,
  TabSwitchEvent,
  TopicItem,
  UserSession,
} from '../types';

interface AuthenticStudioSectionProps {
  session: UserSession;
  currentTopic: TopicItem;
  submissions: AssignmentSubmission[];
  onAddSubmission: (submission: AssignmentSubmission) => void;
  onUpdateSubmissionStatus: (
    submissionId: string,
    status: AuthenticityStatus,
    feedback?: string
  ) => void;
}

export const AuthenticStudioSection: React.FC<AuthenticStudioSectionProps> = ({
  session,
  currentTopic,
  submissions,
  onAddSubmission,
  onUpdateSubmissionStatus,
}) => {
  // Student 3-Stage Studio State
  const [answerContent, setAnswerContent] = useState<string>('');
  const [activeTypingSeconds, setActiveTypingSeconds] = useState<number>(0);
  const [keystrokeCount, setKeystrokeCount] = useState<number>(0);
  const [backspaceCount, setBackspaceCount] = useState<number>(0);
  const [pastedCharCount, setPastedCharCount] = useState<number>(0);
  const [declaredExternalNotes, setDeclaredExternalNotes] = useState<boolean>(false);
  const [externalNotesSource, setExternalNotesSource] = useState<string>(
    'จดสรุปด้วยตัวเองใน GoodNotes / Notion ระหว่างฟังบรรยาย'
  );
  const [classroomContextBridge, setClassroomContextBridge] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitSuccessBanner, setSubmitSuccessBanner] = useState<AssignmentSubmission | null>(null);

  // Stage 3: 60-Second Lockdown Modal State
  const [isSpotCheckOpen, setIsSpotCheckOpen] = useState<boolean>(false);
  const [spotCheckSecondsLeft, setSpotCheckSecondsLeft] = useState<number>(60);
  const [extractedSentence, setExtractedSentence] = useState<string>('');
  const [spotCheckResponse, setSpotCheckResponse] = useState<string>('');
  const [spotCheckMode, setSpotCheckMode] = useState<'text' | 'voice'>('text');
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [voiceRecordSeconds, setVoiceRecordSeconds] = useState<number>(0);
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const [tabSwitchLogs, setTabSwitchLogs] = useState<TabSwitchEvent[]>([]);
  const [recentBlurWarning, setRecentBlurWarning] = useState<string | null>(null);

  // Instructor Inspector State
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>(
    submissions[0]?.id || 'sub-seed-1'
  );
  const [statusFilter, setStatusFilter] = useState<'ALL' | AuthenticityStatus>('ALL');
  const [instructorNoteDraft, setInstructorNoteDraft] = useState<string>('');

  const lastKeystrokeTimestampRef = useRef<number>(0);
  const lastBlurTimestampRef = useRef<number>(0);

  // Keep selected submission valid
  const selectedSubmission =
    submissions.find((s) => s.id === selectedSubmissionId) || submissions[0] || null;

  useEffect(() => {
    if (selectedSubmission) {
      setInstructorNoteDraft(selectedSubmission.instructorFeedback || '');
    }
  }, [selectedSubmission?.id]);

  // Real-time Active Typing Time counter (ticks every second if student typed within the last 2.5 seconds)
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (Date.now() - lastKeystrokeTimestampRef.current < 2500) {
        setActiveTypingSeconds((prev) => prev + 1);
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  // 60-Second Spot-Check Countdown Timer
  useEffect(() => {
    if (!isSpotCheckOpen) return;
    const timer = window.setInterval(() => {
      setSpotCheckSecondsLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isSpotCheckOpen]);

  // 30-Second Voice Recording Timer
  useEffect(() => {
    if (!isRecordingVoice) return;
    const timer = window.setInterval(() => {
      setVoiceRecordSeconds((prev) => {
        if (prev >= 29) {
          setIsRecordingVoice(false);
          return 30;
        }
        return prev + 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isRecordingVoice]);

  // Stage 3 Anti-Tab-Switch / Window Blur Detector
  const recordTabSwitchEvent = (sourceLabel: string) => {
    const now = Date.now();
    // Debounce duplicate blur+visibilitychange firing at the same millisecond
    if (now - lastBlurTimestampRef.current < 600) return;
    lastBlurTimestampRef.current = now;

    const timeStr = new Date().toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    setTabSwitchCount((prev) => {
      const nextCount = prev + 1;
      const newLog: TabSwitchEvent = {
        timestamp: `${timeStr} น.`,
        reason: `${sourceLabel} (ครั้งที่ ${nextCount})`,
      };
      setTabSwitchLogs((oldLogs) => [...oldLogs, newLog]);
      setRecentBlurWarning(
        `🚨 ตรวจพบการสลับหน้าจอ/แท็บออกนอกห้องสอบ ครั้งที่ ${nextCount} เวลา ${timeStr} น.! ระบบบันทึกไว้ในรายงานผู้สอนแล้ว`
      );
      return nextCount;
    });
  };

  useEffect(() => {
    if (!isSpotCheckOpen) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        recordTabSwitchEvent('ตรวจพบการซ่อนแท็บ (document.visibilitychange)');
      }
    };

    const handleWindowBlur = () => {
      recordTabSwitchEvent('ตรวจพบหน้าต่างเสียโฟกัส (window.onblur)');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isSpotCheckOpen]);

  // Computed metrics for Stage 1
  const totalCharCount = answerContent.length;
  const effectivePastedChars = Math.min(totalCharCount, pastedCharCount);
  const pastedRatio =
    totalCharCount > 0 ? Math.min(100, Math.round((effectivePastedChars / totalCharCount) * 100)) : 0;
  const showExternalPasteBanner = pastedCharCount >= 100 || pastedRatio >= 35;

  // Handle keystrokes in Stage 1 editor
  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    lastKeystrokeTimestampRef.current = Date.now();
    if (e.key === 'Backspace' || e.key === 'Delete') {
      setBackspaceCount((prev) => prev + 1);
    } else if (e.key.length === 1 || e.key === 'Enter') {
      setKeystrokeCount((prev) => prev + 1);
    }
  };

  // Handle paste in Stage 1 editor
  const handleEditorPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text') || '';
    if (pastedText.length > 0) {
      setPastedCharCount((prev) => prev + pastedText.length);
    }
  };

  // Simulation 1: จำลองนิสิตก๊อป AI มาวาง 100%
  const handleSimulateAICopyPaste = () => {
    const aiText =
      'ในบริบทของนิเวศวิทยาการศึกษาดิจิทัลยุคที่สี่ การบูรณาการพาราไดม์การประเมินผลสัมฤทธิ์ทางการเรียนจำเป็นต้องอาศัยกรอบแนวคิดเชิงวิพากษ์แบบองค์รวม (Holistic Critical Pedagogical Framework) เพื่อสังเคราะห์ดัชนีชี้วัดสมรรถนะขั้นสูงของผู้เรียนผ่านอัลกอริทึมการเรียนรู้เชิงลึกอย่างมีนัยสำคัญทางสถิติและสอดคล้องกับมาตรฐานสากล';
    setAnswerContent(aiText);
    setActiveTypingSeconds(3);
    setKeystrokeCount(2);
    setBackspaceCount(0);
    setPastedCharCount(aiText.length);
    setDeclaredExternalNotes(false);
    setClassroomContextBridge(
      'การประเมินผลในยุคปัจจุบันมีความสำคัญอย่างยิ่งต่อการพัฒนาผู้เรียนให้มีประสิทธิภาพสูงสุดตามหลักวิชาการ'
    );
    setFormError(null);
    setSubmitSuccessBanner(null);
  };

  // Simulation 2: จำลองนิสิตพิมพ์เองตามธรรมชาติ
  const handleSimulateNaturalTyping = () => {
    const naturalText =
      'จากการเรียนในวันนี้ ผมเห็นว่าการออกแบบการวัดผลที่ทนทานต่อการใช้ AI ลอกส่ง คือการเปลี่ยนจากข้อสอบปรนัยจำเนื้อหา มาเป็นการประเมินตามสภาพจริง (Authentic Assessment) ที่ผูกกับบริบทในห้องเรียน เช่น การให้ผู้เรียนยกตัวอย่างกรณีศึกษาที่เพิ่งอภิปรายร่วมกันและอธิบายเหตุผลสั้นๆ ด้วยภาษาของตัวเอง ทำให้ผู้สอนเห็นกระบวนการคิดที่แท้จริงครับ';
    setAnswerContent(naturalText);
    setActiveTypingSeconds(135);
    setKeystrokeCount(392);
    setBackspaceCount(34);
    setPastedCharCount(0);
    setDeclaredExternalNotes(false);
    setClassroomContextBridge(
      'เชื่อมโยงกับตัวอย่างในหัวข้อที่ 2 ที่อาจารย์ธนภัทรชี้ให้เห็นว่า Kahoot วัดความเร็วในการกด แต่ Concept Hinge Question 30 วินาทีช่วยตรวจจับความเข้าใจผิดของเพื่อนในห้องก่อนข้ามบทเรียนได้จริง'
    );
    setFormError(null);
    setSubmitSuccessBanner(null);
  };

  // Simulation 3 (Helper): จำลองนิสิตก๊อปโน้ตตัวเองที่จดใน GoodNotes
  const handleSimulateSelfNotePaste = () => {
    const selfNoteText =
      'สรุปแนวคิดสำคัญจากโน้ตที่จดไว้: การใช้ Constructive Alignment ร่วมกับ Formative Feedback ช่วยให้ผู้สอนไม่ต้องพึ่งพาแต่ข้อสอบปลายภาค แม้ผู้เรียนจะจดสรุปในแอปภายนอกอย่าง GoodNotes หรือ Notion แล้วคัดลอกมาวาง ก็สามารถพิสูจน์ความเข้าใจจริงได้ผ่านการเชื่อมโยงเคสในคาบเรียนและการตอบคำถามสด 60 วินาที';
    setAnswerContent(selfNoteText);
    setActiveTypingSeconds(32);
    setKeystrokeCount(84);
    setBackspaceCount(9);
    setPastedCharCount(240);
    setDeclaredExternalNotes(true);
    setExternalNotesSource('จดสรุปเองใน GoodNotes บน iPad ระหว่างฟังอาจารย์บรรยายหัวข้อที่ 1-2');
    setClassroomContextBridge(
      'เชื่อมโยงกับกรณีศึกษาเรื่องโปรแกรมตรวจ AI ที่มักเกิด False Positive กับนิสิตที่จดสรุปเองใน iPad ซึ่งอาจารย์ได้ยกตัวอย่างในคาบเรียนวันนี้'
    );
    setFormError(null);
    setSubmitSuccessBanner(null);
  };

  // Extract a key sentence from the student's Stage 1 answer for Stage 3 Spot-Check
  const extractKeySentenceFromAnswer = (text: string): string => {
    const cleaned = text.trim().replace(/\s+/g, ' ');
    if (cleaned.length <= 95) return cleaned;
    // Split by space or common Thai connectors
    const segments = cleaned
      .split(/(?:เพราะ|เนื่องจาก|ได้แก่|คือการ|โดยเน้น|เพื่อ|ซึ่ง)/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 25);
    if (segments.length > 0) {
      const picked = segments[Math.min(1, segments.length - 1)];
      return picked.slice(0, 95) + (picked.length > 95 ? '...' : '');
    }
    return cleaned.slice(0, 90) + '...';
  };

  // Open Stage 3 Lockdown Modal
  const handleInitiateSpotCheck = () => {
    if (answerContent.trim().length < 30) {
      setFormError('กรุณาพิมพ์คำตอบใน Stage 1 อย่างน้อย 30 ตัวอักษร ก่อนเข้าสู่ด่านยืนยันตัวตน');
      return;
    }
    if (classroomContextBridge.trim().length < 15) {
      setFormError(
        'กรุณากรอก Stage 2 (การเชื่อมโยงบริบทที่อภิปรายในคาบเรียนวันนี้) อย่างน้อย 1 ประเด็น'
      );
      return;
    }
    setFormError(null);
    const snippet = extractKeySentenceFromAnswer(answerContent);
    setExtractedSentence(snippet);
    setSpotCheckSecondsLeft(60);
    setSpotCheckResponse('');
    setSpotCheckMode('text');
    setIsRecordingVoice(false);
    setVoiceRecordSeconds(0);
    setTabSwitchCount(0);
    setTabSwitchLogs([]);
    setRecentBlurWarning(null);
    setIsSpotCheckOpen(true);
  };

  // Toggle Voice Recording Simulation in Stage 3
  const handleToggleVoiceRecord = () => {
    if (isRecordingVoice) {
      setIsRecordingVoice(false);
      if (!spotCheckResponse.trim()) {
        setSpotCheckResponse(
          `[บันทึกเสียงอธิบายสด ${voiceRecordSeconds || 12} วินาที]: เหตุผลที่เขียนประโยคนี้เพราะตั้งใจชี้ให้เห็นว่า ถ้าผู้เรียนเข้าใจแก่นของบทเรียนและอยู่ในห้องเรียนจริง จะสามารถยกตัวอย่างที่คุยกับอาจารย์มาอธิบายปากเปล่าได้ทันทีโดยไม่ต้องเปิดโพยครับ`
        );
      }
    } else {
      setSpotCheckMode('voice');
      setVoiceRecordSeconds(0);
      setIsRecordingVoice(true);
      setSpotCheckResponse(
        '[กำลังถอดเสียงพูดสดอัตโนมัติ...] เหตุผลที่ผมเขียนประเด็นนี้เพราะในคาบเรียนวันนี้เราเห็นชัดเจนว่าการเช็กความเข้าใจระหว่างเรียนสำคัญกว่าการตรวจแต่ชิ้นงานสุดท้ายครับ'
      );
    }
  };

  // Finalize and Submit after Stage 3
  const handleCompleteSpotCheckSubmit = () => {
    const durationUsed = Math.max(5, 60 - spotCheckSecondsLeft);
    const responseClean = spotCheckResponse.trim();

    // Evaluate Authenticity Status fairly based on all 3 stages
    let status: AuthenticityStatus = 'VERIFIED_HUMAN';
    let authenticityScore = 95;
    let riskSummary = '';

    const hasHighPaste = pastedRatio >= 65;
    const isUltraFastPaste = activeTypingSeconds <= 10 && pastedRatio >= 80;
    const hasValidSpotCheck = responseClean.length >= 25;

    if (tabSwitchCount >= 2 || (isUltraFastPaste && tabSwitchCount >= 1) || (isUltraFastPaste && !declaredExternalNotes && !hasValidSpotCheck)) {
      status = 'HIGH_AI_RISK';
      authenticityScore = Math.max(8, 35 - tabSwitchCount * 10 - Math.round(pastedRatio * 0.15));
      riskSummary = `🚨 ความเสี่ยงสูง (HIGH AI / COPY RISK): วางข้อความ ${pastedRatio}% (ใช้เวลาพิมพ์จริงเพียง ${activeTypingSeconds} วินาที) และตรวจพบการสลับหน้าจอหนี ${tabSwitchCount} ครั้งระหว่างด่านทดสอบสด 60 วินาที`;
    } else if (hasHighPaste && declaredExternalNotes && tabSwitchCount === 0 && hasValidSpotCheck) {
      status = 'VERIFIED_HUMAN';
      authenticityScore = 90;
      riskSummary = `✅ ยืนยันความเข้าใจจริง (External Self-Notes Verified): แม้มีสัดส่วน Paste ${pastedRatio}% แต่ได้แจ้งแหล่งที่มาโน้ตส่วนตัว ไม่สลับหน้าจอหนี (TabSwitch = 0) และอธิบายเหตุผลสดใน 60 วินาทีได้ชัดเจน`;
    } else if (hasHighPaste || tabSwitchCount === 1 || !hasValidSpotCheck) {
      status = 'NEEDS_REVIEW';
      authenticityScore = 62;
      riskSummary = `⚠️ รอผู้สอนตรวจสอบเพิ่มเติม (NEEDS REVIEW): สัดส่วนการวางข้อความ ${pastedRatio}%, เวลาพิมพ์จริง ${activeTypingSeconds} วินาที, สลับหน้าจอ ${tabSwitchCount} ครั้ง — แนะนำให้ผู้สอนอ่านคำตอบ Spot-Check ประกอบ`;
    } else {
      status = 'VERIFIED_HUMAN';
      authenticityScore = Math.min(99, 88 + Math.min(10, Math.floor(activeTypingSeconds / 15)));
      riskSummary = `✅ พิมพ์เองตามธรรมชาติและยืนยันตัวตนสมบูรณ์ (เวลาพิมพ์จริง ${activeTypingSeconds} วินาที, แก้ไขคำ ${backspaceCount} ครั้ง, Paste ${pastedRatio}%, ไม่สลับแท็บหนี)`;
    }

    const nowTimeStr = new Date().toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newSub: AssignmentSubmission = {
      id: `sub-${Date.now()}`,
      studentId: session.studentId,
      studentName: `${session.nickname} (${session.studentId})`,
      submittedAt: `${nowTimeStr} น.`,
      answerContent,
      activeTypingSeconds,
      keystrokeCount,
      backspaceCount,
      totalCharCount,
      pastedCharCount: effectivePastedChars,
      pastedRatio,
      declaredExternalNotes,
      externalNotesSource: declaredExternalNotes ? externalNotesSource : undefined,
      classroomContextBridge,
      extractedSentence,
      spotCheckPrompt: `จากที่คุณเขียนว่า "${extractedSentence}" จงอธิบายเหตุผลด้วยภาษาพูดสั้นๆ ของคุณเองภายใน 60 วินาที หรือกดอัดเสียงอธิบาย 30 วินาที`,
      spotCheckResponse:
        responseClean || '(ไม่ได้ระบุคำอธิบายเพิ่มเติมภายในเวลา 60 วินาที)',
      spotCheckMode,
      spotCheckDurationSec: durationUsed,
      tabSwitchCount,
      tabSwitchLogs,
      status,
      authenticityScore,
      riskSummary,
    };

    onAddSubmission(newSub);
    setSelectedSubmissionId(newSub.id);
    setIsSpotCheckOpen(false);
    setSubmitSuccessBanner(newSub);
  };

  const renderStatusBadge = (status: AuthenticityStatus) => {
    switch (status) {
      case 'VERIFIED_HUMAN':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            🟢 VERIFIED HUMAN (ยืนยันความเข้าใจจริง)
          </span>
        );
      case 'NEEDS_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            🟡 NEEDS REVIEW (วางจากภายนอกแต่ตอบสดได้บางส่วน)
          </span>
        );
      case 'HIGH_AI_RISK':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
            🔴 HIGH AI / COPY RISK (เสี่ยงใช้ AI / สลับจอหนี)
          </span>
        );
    }
  };

  // Filter submissions for instructor view
  const filteredSubmissions = submissions.filter((s) =>
    statusFilter === 'ALL' ? true : s.status === statusFilter
  );

  const verifiedCount = submissions.filter((s) => s.status === 'VERIFIED_HUMAN').length;
  const reviewCount = submissions.filter((s) => s.status === 'NEEDS_REVIEW').length;
  const highRiskCount = submissions.filter((s) => s.status === 'HIGH_AI_RISK').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-indigo-500/30">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              กลไกปิดช่องโหว่ที่ 5 • 3-Stage Authentic Assignment Studio & Anti-Blur Spot-Check
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              สตูดิโอส่งการบ้านตรวจจับกระบวนการคิด + ทดสอบยืนยันตัวตน 60 วินาที
            </h2>
            <p className="text-slate-300 text-sm mt-1">
              ยุติธรรมกับนิสิตที่จดสรุปเองใน GoodNotes/Notion แต่สกัดกั้นการก๊อป AI มาวางและการเปิดจอลอกคำตอบสดด้วยระบบตรวจจับการสลับหน้าจอ
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-medium text-slate-200 border border-white/10">
              🟢 Verified: <strong className="text-emerald-400">{verifiedCount}</strong>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-medium text-slate-200 border border-white/10">
              🟡 Needs Review: <strong className="text-amber-300">{reviewCount}</strong>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-medium text-slate-200 border border-white/10">
              🔴 High AI Risk: <strong className="text-rose-400">{highRiskCount}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* INSTRUCTOR VIEW: AUTHENTICITY INSPECTOR DASHBOARD                     */}
      {/* ===================================================================== */}
      {session.role === 'instructor' ? (
        <div className="space-y-6">
          {/* 3-Tier Status Filter Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`p-4 rounded-xl border text-left transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-300'
              }`}
            >
              <div className="text-xs font-semibold uppercase opacity-80">งานที่ส่งทั้งหมด</div>
              <div className="text-2xl font-bold mt-1">{submissions.length} รายการ</div>
              <div className="text-xs mt-1 opacity-80">คลิกเพื่อดูทุกระดับความเสี่ยง</div>
            </button>

            <button
              onClick={() => setStatusFilter('VERIFIED_HUMAN')}
              className={`p-4 rounded-xl border text-left transition-all ${
                statusFilter === 'VERIFIED_HUMAN'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                  : 'bg-emerald-50/70 text-emerald-950 border-emerald-200 hover:border-emerald-400'
              }`}
            >
              <div className="text-xs font-bold uppercase flex items-center gap-1.5">
                🟢 VERIFIED HUMAN
              </div>
              <div className="text-2xl font-bold mt-1">{verifiedCount} คน</div>
              <div className="text-xs mt-1 opacity-85">
                พิมพ์เอง หรือวางโน้ตตัวเองแต่ผ่าน Spot-Check 60s
              </div>
            </button>

            <button
              onClick={() => setStatusFilter('NEEDS_REVIEW')}
              className={`p-4 rounded-xl border text-left transition-all ${
                statusFilter === 'NEEDS_REVIEW'
                  ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                  : 'bg-amber-50/70 text-amber-950 border-amber-200 hover:border-amber-400'
              }`}
            >
              <div className="text-xs font-bold uppercase flex items-center gap-1.5">
                🟡 NEEDS REVIEW
              </div>
              <div className="text-2xl font-bold mt-1">{reviewCount} คน</div>
              <div className="text-xs mt-1 opacity-85">
                วางจากภายนอกแต่ตอบคำถามสดได้บางส่วน
              </div>
            </button>

            <button
              onClick={() => setStatusFilter('HIGH_AI_RISK')}
              className={`p-4 rounded-xl border text-left transition-all ${
                statusFilter === 'HIGH_AI_RISK'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                  : 'bg-rose-50/70 text-rose-950 border-rose-200 hover:border-rose-400'
              }`}
            >
              <div className="text-xs font-bold uppercase flex items-center gap-1.5">
                🔴 HIGH AI / COPY RISK
              </div>
              <div className="text-2xl font-bold mt-1">{highRiskCount} คน</div>
              <div className="text-xs mt-1 opacity-85">
                วางข้อความ &gt;95% ในไม่กี่วิ + สลับหน้าจอหนีตอนถามสด
              </div>
            </button>
          </div>

          {/* Main Master-Detail Inspector Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left List of Student Submissions */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-indigo-600" />
                    รายการส่งงานของนิสิต ({filteredSubmissions.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    คลิกที่รายชื่อเพื่อตรวจสอบ Process Telemetry รายคน
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100 max-h-[680px] overflow-y-auto">
                {filteredSubmissions.map((sub) => {
                  const isSelected = selectedSubmission?.id === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubmissionId(sub.id)}
                      className={`w-full text-left p-4 transition-all hover:bg-slate-50 ${
                        isSelected
                          ? 'bg-indigo-50/70 border-l-4 border-l-indigo-600'
                          : 'border-l-4 border-l-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-slate-900 text-sm">
                            {sub.studentName}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            รหัสนิสิต: {sub.studentId} • ส่งเมื่อ {sub.submittedAt}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700">
                          Score: {sub.authenticityScore}%
                        </span>
                      </div>

                      <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        {renderStatusBadge(sub.status)}
                        {sub.declaredExternalNotes && (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-100 text-indigo-700">
                            📒 แจ้งวางโน้ตตัวเอง
                          </span>
                        )}
                      </div>

                      {/* Mini Telemetry Bar */}
                      <div className="mt-3 grid grid-cols-3 gap-2 pt-2.5 border-t border-slate-100 text-xs">
                        <div className="bg-slate-50 rounded-lg px-2.5 py-1.5">
                          <span className="text-slate-400 block text-[10px]">เวลาพิมพ์จริง</span>
                          <span className="font-bold text-slate-700">
                            {sub.activeTypingSeconds} วินาที
                          </span>
                        </div>
                        <div className="bg-slate-50 rounded-lg px-2.5 py-1.5">
                          <span className="text-slate-400 block text-[10px]">สัดส่วน Paste</span>
                          <span
                            className={`font-bold ${
                              sub.pastedRatio >= 80
                                ? 'text-rose-600'
                                : sub.pastedRatio >= 40
                                ? 'text-amber-600'
                                : 'text-emerald-600'
                            }`}
                          >
                            {sub.pastedRatio}%
                          </span>
                        </div>
                        <div className="bg-slate-50 rounded-lg px-2.5 py-1.5">
                          <span className="text-slate-400 block text-[10px]">สลับแท็บ (60s)</span>
                          <span
                            className={`font-bold ${
                              sub.tabSwitchCount > 0 ? 'text-rose-600' : 'text-emerald-600'
                            }`}
                          >
                            {sub.tabSwitchCount} ครั้ง
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Detailed Telemetry & Spot-Check Inspector */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              {selectedSubmission ? (
                <div className="space-y-6">
                  {/* Top Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                    <div>
                      <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                        Instructor Authenticity Telemetry Inspector
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                        {selectedSubmission.studentName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        รหัสนิสิต {selectedSubmission.studentId} • ส่งงานเมื่อ{' '}
                        {selectedSubmission.submittedAt}
                      </p>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-1.5">
                      {renderStatusBadge(selectedSubmission.status)}
                      <span className="text-xs text-slate-500">
                        ดัชนีความเชื่อมั่นกระบวนการคิด:{' '}
                        <strong className="text-slate-800">
                          {selectedSubmission.authenticityScore}/100
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Risk Analysis Summary Box */}
                  <div
                    className={`p-4 rounded-xl border text-sm ${
                      selectedSubmission.status === 'HIGH_AI_RISK'
                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                        : selectedSubmission.status === 'NEEDS_REVIEW'
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    }`}
                  >
                    <div className="font-bold mb-1 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      สรุปผลการวิเคราะห์ความแท้จริงของชิ้นงาน (Automated Process Verdict)
                    </div>
                    <p className="text-xs leading-relaxed">{selectedSubmission.riskSummary}</p>
                    {selectedSubmission.declaredExternalNotes && (
                      <div className="mt-2 pt-2 border-t border-emerald-200/60 text-xs font-medium text-indigo-900">
                        📒 <strong>แจ้ง External Draft Declaration:</strong>{' '}
                        {selectedSubmission.externalNotesSource}
                      </div>
                    )}
                  </div>

                  {/* 4 Telemetry Metrics Grid */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                      1. ข้อมูลพฤติกรรมการพิมพ์ (Stage 1 Process Telemetry)
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-indigo-600" />
                          เวลาพิมพ์จริง
                        </div>
                        <div className="text-xl font-bold text-slate-900 mt-1">
                          {selectedSubmission.activeTypingSeconds}s
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Keystrokes: {selectedSubmission.keystrokeCount} ครั้ง
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
                          การแก้ไข/เกลาคำ
                        </div>
                        <div className="text-xl font-bold text-slate-900 mt-1">
                          {selectedSubmission.backspaceCount} ครั้ง
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Backspace / Revision
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <ClipboardPaste className="w-3.5 h-3.5 text-amber-600" />
                          สัดส่วน Paste
                        </div>
                        <div
                          className={`text-xl font-bold mt-1 ${
                            selectedSubmission.pastedRatio >= 85
                              ? 'text-rose-600'
                              : selectedSubmission.pastedRatio >= 40
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {selectedSubmission.pastedRatio}%
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {selectedSubmission.pastedCharCount}/{selectedSubmission.totalCharCount}{' '}
                          ตัวอักษร
                        </div>
                      </div>

                      <div
                        className={`p-3.5 rounded-xl border ${
                          selectedSubmission.tabSwitchCount > 0
                            ? 'bg-rose-50 border-rose-300'
                            : 'bg-emerald-50/60 border-emerald-200'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <EyeOff className="w-3.5 h-3.5 text-rose-600" />
                          สลับหน้าจอตอนถามสด
                        </div>
                        <div
                          className={`text-xl font-bold mt-1 ${
                            selectedSubmission.tabSwitchCount > 0
                              ? 'text-rose-600'
                              : 'text-emerald-700'
                          }`}
                        >
                          {selectedSubmission.tabSwitchCount} ครั้ง
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          ใช้เวลาตอบสด {selectedSubmission.spotCheckDurationSec} วินาที
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stage 1 & Stage 2 Content Inspection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-indigo-600" />
                        คำตอบหลัก (Stage 1 Editor Content)
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                        {selectedSubmission.answerContent}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200">
                      <div className="text-xs font-bold text-indigo-900 mb-1.5 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-indigo-600" />
                        การเชื่อมโยงบริบทคาบเรียนวันนี้ (Stage 2 Context Bridge)
                      </div>
                      <p className="text-xs text-indigo-950 leading-relaxed whitespace-pre-line">
                        {selectedSubmission.classroomContextBridge}
                      </p>
                    </div>
                  </div>

                  {/* Stage 3 Spot-Check 60s Challenge Inspection */}
                  <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Lock className="w-4 h-4 text-emerald-400" />
                        ผลทดสอบยืนยันตัวตนสด 60 วินาที (Stage 3 Lockdown Spot-Check)
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-white/10 text-slate-200">
                        โหมดตอบกลับ:{' '}
                        {selectedSubmission.spotCheckMode === 'voice'
                          ? '🎙️ อัดเสียงอธิบาย 30s'
                          : '⌨️ พิมพ์ภาษาพูดสด'}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300">
                      <span className="text-indigo-300 font-semibold block mb-1">
                        ประโยคที่ระบบสุ่มดึงจากงานนิสิตมาถามสด:
                      </span>
                      “{selectedSubmission.extractedSentence}”
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-400/30 text-xs text-emerald-100">
                      <span className="text-emerald-300 font-semibold block mb-1">
                        คำอธิบายสดของนิสิต (ภายใน {selectedSubmission.spotCheckDurationSec} วินาที):
                      </span>
                      {selectedSubmission.spotCheckResponse}
                    </div>

                    {/* Tab Switch Alert Logs if any */}
                    {selectedSubmission.tabSwitchLogs.length > 0 && (
                      <div className="p-3 rounded-lg bg-rose-500/20 border border-rose-400/40 text-xs text-rose-200 space-y-1">
                        <div className="font-bold text-rose-300 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4" />
                          ประวัติการสลับหน้าจอหนีระหว่างเปิด Lockdown Modal (
                          {selectedSubmission.tabSwitchCount} ครั้ง):
                        </div>
                        {selectedSubmission.tabSwitchLogs.map((log, i) => (
                          <div key={i} className="text-[11px] pl-5">
                            • [{log.timestamp}] {log.reason}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Instructor Override & Feedback Controls */}
                  <div className="pt-4 border-t border-slate-200 space-y-3">
                    <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                      การตัดสินผลและข้อเสนอแนะจากผู้สอน (Instructor Override & Feedback)
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={instructorNoteDraft}
                        onChange={(e) => setInstructorNoteDraft(e.target.value)}
                        placeholder="พิมพ์ความเห็นผู้สอน หรือบันทึกผลการตรวจสอบ..."
                        className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() =>
                          onUpdateSubmissionStatus(
                            selectedSubmission.id,
                            'VERIFIED_HUMAN',
                            instructorNoteDraft
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition"
                      >
                        🟢 ยืนยัน VERIFIED HUMAN
                      </button>
                      <button
                        onClick={() =>
                          onUpdateSubmissionStatus(
                            selectedSubmission.id,
                            'NEEDS_REVIEW',
                            instructorNoteDraft
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition"
                      >
                        🟡 เปลี่ยนเป็น NEEDS REVIEW
                      </button>
                      <button
                        onClick={() =>
                          onUpdateSubmissionStatus(
                            selectedSubmission.id,
                            'HIGH_AI_RISK',
                            instructorNoteDraft
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition"
                      >
                        🔴 ติดธง HIGH AI RISK
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  เลือกรายการส่งงานทางซ้ายเพื่อดูรายละเอียด
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ===================================================================== */
        /* STUDENT VIEW: 3-STAGE AUTHENTIC ASSIGNMENT STUDIO                     */
        /* ===================================================================== */
        <div className="space-y-6">
          {/* Submission Confirmation Result Banner */}
          {submitSuccessBanner && (
            <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-base text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ส่งงานเข้าสู่ระบบผู้สอนเรียบร้อยแล้ว! (ซิงก์ไปยัง Instructor Dashboard ทันที)
                </div>
                <p className="text-xs text-emerald-800">{submitSuccessBanner.riskSummary}</p>
                <div className="pt-1">{renderStatusBadge(submitSuccessBanner.status)}</div>
              </div>
              <button
                onClick={() => setSubmitSuccessBanner(null)}
                className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 shrink-0"
              >
                รับทราบ / ทดสอบส่งใหม่อีกครั้ง
              </button>
            </div>
          )}

          {/* Quick Simulation Bar for Evaluators */}
          <div className="bg-indigo-50/90 border border-indigo-200 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-indigo-900 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                แถบจำลองสถานการณ์สำหรับผู้ตรวจประเมิน (1-Click Evaluator Simulator)
              </div>
              <p className="text-xs text-indigo-700 mt-0.5">
                คลิกปุ่มด้านขวาเพื่อจำลองพฤติกรรมการพิมพ์ของนิสิตแต่ละแบบ แล้วกดปุ่ม “ยืนยันการส่งงาน” เพื่อทดสอบด่าน 60 วินาที
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSimulateAICopyPaste}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
              >
                🧪 จำลองนิสิตก๊อป AI มาวาง 100%
              </button>
              <button
                type="button"
                onClick={handleSimulateNaturalTyping}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
              >
                ✍️ จำลองนิสิตพิมพ์เองตามธรรมชาติ
              </button>
              <button
                type="button"
                onClick={handleSimulateSelfNotePaste}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
              >
                📒 จำลองวางโน้ตที่สรุปเอง (GoodNotes)
              </button>
            </div>
          </div>

          {/* STAGE 1: Process-Tracked Editor & External Draft Declaration */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                  STAGE 1 OF 3
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Process-Tracked Editor & External Draft Declaration
                </h3>
                <p className="text-xs text-slate-500">
                  โจทย์: จงวิเคราะห์แนวทางออกแบบการวัดผลในชั้นเรียนยุค AI ที่ส่งเสริมการคิดวิเคราะห์อย่างแท้จริง
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAnswerContent('');
                  setActiveTypingSeconds(0);
                  setKeystrokeCount(0);
                  setBackspaceCount(0);
                  setPastedCharCount(0);
                  setDeclaredExternalNotes(false);
                }}
                className="text-xs text-slate-500 hover:text-rose-600 font-medium self-start sm:self-center"
              >
                ล้างข้อมูลเริ่มต้นใหม่
              </button>
            </div>

            {/* Real-time Telemetry Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">Active Typing Time</div>
                  <div className="text-base font-bold text-slate-900">
                    {activeTypingSeconds} วินาที
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                  <Keyboard className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">Keystroke Count</div>
                  <div className="text-base font-bold text-slate-900">{keystrokeCount} ครั้ง</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">Revision / Backspace</div>
                  <div className="text-base font-bold text-slate-900">{backspaceCount} ครั้ง</div>
                </div>
              </div>

              <div
                className={`p-3 rounded-xl border flex items-center gap-3 ${
                  pastedRatio >= 70
                    ? 'bg-amber-50 border-amber-300'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    pastedRatio >= 70
                      ? 'bg-amber-200 text-amber-800'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  <ClipboardPaste className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">Pasted Char Ratio</div>
                  <div
                    className={`text-base font-bold ${
                      pastedRatio >= 70 ? 'text-amber-800' : 'text-emerald-700'
                    }`}
                  >
                    {pastedRatio}% ({effectivePastedChars} ตัวอักษร)
                  </div>
                </div>
              </div>
            </div>

            {/* Textarea */}
            <textarea
              rows={5}
              value={answerContent}
              onChange={(e) => setAnswerContent(e.target.value)}
              onKeyDown={handleEditorKeyDown}
              onPaste={handleEditorPaste}
              placeholder="พิมพ์คำตอบของคุณที่นี่ หรือวางข้อความจากโน้ตที่คุณสรุปเอง (ระบบกำลังวัดค่า Active Typing Time, Keystrokes, Revisions และ Pasted Ratio แบบ Real-time)..."
              className="w-full p-4 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
            />

            {/* External Draft Declaration Banner (Appears when Pasted > 100 chars or >= 35%) */}
            {showExternalPasteBanner && (
              <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-3 animate-fadeIn">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold text-sm">
                      คุณวางข้อความจากโน้ตที่สรุปเองข้างนอกใช่หรือไม่? (ตรวจพบการ Paste{' '}
                      {effectivePastedChars} ตัวอักษร / {pastedRatio}%)
                    </div>
                    <p className="text-xs text-amber-800">
                      ระบบ ClassPulse <strong>ไม่หักคะแนนมั่วซั่วจากการวางข้อความ</strong>{' '}
                      หากคุณร่างสรุปเองใน GoodNotes, Notion หรือ Word กรุณาติ๊กยืนยันด้านล่าง และเตรียมผ่านด่านยืนยันความเข้าใจสด 60 วินาทีตอนกดส่งงาน
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-2.5 text-xs font-bold text-amber-950 cursor-pointer bg-white/80 p-3 rounded-lg border border-amber-200">
                  <input
                    type="checkbox"
                    checked={declaredExternalNotes}
                    onChange={(e) => setDeclaredExternalNotes(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>
                    ใช่ ฉันนำข้อความมาจากโน้ตที่ฉันสรุปด้วยตัวเองข้างนอก และพร้อมอธิบายยืนยันความเข้าใจในด่าน 60 วินาที
                  </span>
                </label>

                {declaredExternalNotes && (
                  <input
                    type="text"
                    value={externalNotesSource}
                    onChange={(e) => setExternalNotesSource(e.target.value)}
                    placeholder="ระบุแหล่งที่คุณจดโน้ต เช่น จดใน GoodNotes บน iPad ระหว่างฟังบรรยาย..."
                    className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-white text-xs text-slate-800"
                  />
                )}
              </div>
            )}
          </div>

          {/* STAGE 2: Classroom Context Bridge */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                STAGE 2 OF 3 • CLASSROOM CONTEXT BRIDGE
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                เชื่อมโยงบริบทที่อภิปรายกันสดในคาบเรียนวันนี้ (บังคับกรอก)
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                จงยกตัวอย่างหรือคำพูดที่อภิปรายกันในคาบเรียนวันนี้ มาเชื่อมโยงกับคำตอบของคุณอย่างน้อย 1 ประเด็น (AI ภายนอกไม่ได้นั่งเรียนในห้อง จึงตอบจุดนี้ไม่ได้หากนิสิตไม่เข้าใจ)
              </p>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 flex flex-wrap items-center justify-between gap-2">
              <span>
                💡 <strong>ใบ้บริบทคาบเรียนปัจจุบัน ({currentTopic.title}):</strong>{' '}
                {currentTopic.contextPromptHint}
              </span>
            </div>

            <textarea
              rows={3}
              value={classroomContextBridge}
              onChange={(e) => setClassroomContextBridge(e.target.value)}
              placeholder="ตัวอย่าง: เชื่อมโยงกับที่อาจารย์ธนภัทรเปรียบเทียบในสไลด์หน้า 22 เรื่องการใช้ Kahoot แข่งความเร็ว กับการใช้ Concept Hinge Question 30 วินาที..."
              className="w-full p-3.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {formError}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleInitiateSpotCheck}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                ยืนยันการส่งงาน (เข้าสู่ด่าน Stage 3 ทดสอบสด 60 วินาที)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* STAGE 3 MODAL: 60-SECOND ANTI-BLUR SPOT-CHECK CHALLENGE               */}
      {/* ===================================================================== */}
      {isSpotCheckOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border-2 border-indigo-500 shadow-2xl overflow-hidden animate-fadeIn">
            {/* Top Lockdown Bar */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-300">
                  <Lock className="w-5 h-5" />
                </span>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                    STAGE 3 OF 3 • LOCKDOWN VERIFICATION MODAL
                  </div>
                  <h3 className="text-base font-bold">
                    ด่านยืนยันความเข้าใจสด 60 วินาที (Anti-Blur Spot-Check)
                  </h3>
                </div>
              </div>

              {/* 60s Countdown Badge */}
              <div
                className={`px-3.5 py-1.5 rounded-xl font-mono font-bold text-base flex items-center gap-1.5 border ${
                  spotCheckSecondsLeft <= 15
                    ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                    : 'bg-indigo-600/40 text-indigo-100 border-indigo-400/40'
                }`}
              >
                <Clock className="w-4 h-4" />
                00:{String(spotCheckSecondsLeft).padStart(2, '0')}
              </div>
            </div>

            {/* Countdown Progress Bar */}
            <div className="w-full h-1.5 bg-slate-200">
              <div
                className={`h-full transition-all duration-1000 ${
                  spotCheckSecondsLeft <= 15 ? 'bg-rose-600' : 'bg-indigo-600'
                }`}
                style={{ width: `${(spotCheckSecondsLeft / 60) * 100}%` }}
              />
            </div>

            <div className="p-6 space-y-4">
              {/* Anti-Tab-Switch Live Detector Bar + Evaluator Simulation Button */}
              <div
                className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  tabSwitchCount > 0
                    ? 'bg-rose-50 border-rose-300 text-rose-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="text-xs space-y-0.5">
                  <div className="font-bold flex items-center gap-1.5">
                    <EyeOff
                      className={`w-4 h-4 ${
                        tabSwitchCount > 0 ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    />
                    ระบบตรวจจับการสลับหน้าจอทำงานอยู่ (TabSwitchCount:{' '}
                    <span
                      className={`font-extrabold ${
                        tabSwitchCount > 0 ? 'text-rose-600 underline' : 'text-emerald-700'
                      }`}
                    >
                      {tabSwitchCount} ครั้ง
                    </span>
                    )
                  </div>
                  <p className="text-[11px] opacity-85">
                    ผูก Event <code>visibilitychange</code> และ <code>window.onblur</code> ห้ามสลับแท็บไปเปิด ChatGPT ระหว่างตอบคำถามนี้!
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    recordTabSwitchEvent('จำลองสลับแท็บไปเปิด ChatGPT (Simulated Blur)')
                  }
                  className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm shrink-0 transition"
                >
                  👀 จำลองการสลับแท็บไปเปิด ChatGPT
                </button>
              </div>

              {/* Flashing Red Warning when Tab Switch Detected */}
              {recentBlurWarning && (
                <div className="p-3 rounded-xl bg-rose-600 text-white text-xs font-bold flex items-center gap-2 animate-pulse">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{recentBlurWarning}</span>
                </div>
              )}

              {/* Dynamically Extracted Sentence Prompt */}
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-2">
                <div className="text-xs font-bold text-indigo-800 uppercase">
                  คำถามสุ่มสดจากข้อความที่คุณเพิ่งเขียน:
                </div>
                <p className="text-sm font-bold text-slate-900 leading-relaxed">
                  “จากที่คุณเขียนว่า{' '}
                  <span className="text-indigo-700 underline decoration-indigo-400">
                    '{extractedSentence}'
                  </span>{' '}
                  จงอธิบายเหตุผลด้วยภาษาพูดสั้นๆ ของคุณเองภายใน 60 วินาที หรือกดอัดเสียงอธิบาย 30 วินาที”
                </p>
              </div>

              {/* Mode Selector: Text vs 30s Voice Record */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSpotCheckMode('text')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
                    spotCheckMode === 'text'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  พิมพ์อธิบายด้วยภาษาพูดสั้นๆ
                </button>

                <button
                  type="button"
                  onClick={handleToggleVoiceRecord}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
                    isRecordingVoice
                      ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                      : spotCheckMode === 'voice'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  {isRecordingVoice ? (
                    <>
                      <Square className="w-3.5 h-3.5" />
                      หยุดอัดเสียง ({voiceRecordSeconds}/30s)
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5" />
                      กดอัดเสียงอธิบาย 30 วินาที
                    </>
                  )}
                </button>
              </div>

              {isRecordingVoice && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
                  <span className="font-bold flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-rose-600 animate-bounce" />
                    กำลังบันทึกเสียงพูดสดและถอดความอัตโนมัติ... ({voiceRecordSeconds} วินาที / 30 วินาที)
                  </span>
                  <span className="font-mono font-bold">REC ●</span>
                </div>
              )}

              <textarea
                rows={3}
                value={spotCheckResponse}
                onChange={(e) => setSpotCheckResponse(e.target.value)}
                placeholder="อธิบายด้วยภาษาพูดของคุณเองสั้นๆ 1-2 ประโยค เช่น เพราะถ้าเราวัดเฉพาะงานชิ้นสุดท้าย เด็กจะใช้ AI ทำแทนได้..."
                className="w-full p-3.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              {/* Quick Fill Helper for Evaluators inside the Modal */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() =>
                    setSpotCheckResponse(
                      'เพราะประโยคนี้ผมสรุปมาจากที่อาจารย์ยกตัวอย่างในห้องเรียนว่า ถ้าเราเช็กความเข้าใจระหว่างคาบควบคู่กับการให้เด็กอธิบายเหตุผลสด จะช่วยให้รู้ว่าใครเข้าใจจริงแม้จะจดโน้ตมาจากใน iPad ครับ'
                    )
                  }
                  className="text-xs text-indigo-600 hover:underline font-semibold"
                >
                  + คลิกเติมคำอธิบายภาษาพูดที่ชัดเจน (สำหรับทดสอบผ่านด่าน)
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSpotCheckOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    onClick={handleCompleteSpotCheckSubmit}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    ส่งคำตอบยืนยันตัวตนเข้าสู่ระบบทันที
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

