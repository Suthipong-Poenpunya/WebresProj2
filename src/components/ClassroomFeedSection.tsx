import React, { useState } from 'react';
import {
  Pin,
  Megaphone,
  Lightbulb,
  MessageSquare,
  ShieldAlert,
  Send,
  ExternalLink,
  ThumbsUp,
  Heart,
  HelpCircle,
  Plus,
  Trash2,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import {
  FeedChannelType,
  FeedPost,
  MicroReactionType,
  PinnedEssentialItem,
  TopicItem,
  UserSession,
} from '../types';

interface ClassroomFeedSectionProps {
  session: UserSession;
  currentTopic: TopicItem;
  pinnedItems: PinnedEssentialItem[];
  feedPosts: FeedPost[];
  onAddFeedPost: (post: FeedPost) => void;
  onToggleReaction: (postId: string, reaction: MicroReactionType, userId: string) => void;
  onAddPinnedItem: (item: PinnedEssentialItem) => void;
  onRemovePinnedItem: (id: string) => void;
  onNavigateToStudio: () => void;
}

export const ClassroomFeedSection: React.FC<ClassroomFeedSectionProps> = ({
  session,
  currentTopic,
  pinnedItems,
  feedPosts,
  onAddFeedPost,
  onToggleReaction,
  onAddPinnedItem,
  onRemovePinnedItem,
  onNavigateToStudio,
}) => {
  const [activeChannel, setActiveChannel] = useState<FeedChannelType>('notes');
  const [postTitle, setPostTitle] = useState<string>('');
  const [postContent, setPostContent] = useState<string>('');
  const [floodWarning, setFloodWarning] = useState<string | null>(null);
  const [showAddPinForm, setShowAddPinForm] = useState<boolean>(false);
  const [newPinTitle, setNewPinTitle] = useState<string>('');
  const [newPinDesc, setNewPinDesc] = useState<string>('');
  const [newPinDue, setNewPinDue] = useState<string>('ภายในวันนี้ 16:00 น.');

  // Anti-Sticker & Flood Filter Detector
  const detectSpamOrStickerFlood = (text: string): string | null => {
    const trimmed = text.trim();
    if (!trimmed) return 'กรุณาพิมพ์ข้อความก่อนกดส่ง';

    // Check sticker keywords or giant emoji-only flood
    if (/(\[สติ๊กเกอร์\]|\[sticker\]|สติ๊กเกอร์|sticker)/i.test(trimmed)) {
      return '🚫 บล็อกโดย Anti-Sticker Filter: ห้องเรียนนี้ปิดการส่งสติ๊กเกอร์ขนาดใหญ่เพื่อป้องกันข้อมูลสำคัญไหลตกขอบจอ กรุณากดปุ่ม Micro Reactions (👍 เข้าใจแล้ว, 💡 ได้ไอเดีย, ❤️ ขอบคุณ, ❓ สงสัยเพิ่ม) ที่มุมการ์ดข้อความแทน';
    }

    // Check repetitive character spam like 5555555555, ㅋㅋㅋㅋ, aaaaaaa, ++++++, ถถถถถถ
    if (/(.)\1{4,}/.test(trimmed)) {
      return `🚫 บล็อกโดย Anti-Flood Filter: ตรวจพบข้อความพิมพ์ซ้ำกันเกินเกณฑ์ ("${trimmed.slice(
        0,
        20
      )}") ระบบไม่อนุญาตให้ส่งข้อความดันแชท กรุณาใช้ปุ่ม Micro Reactions (👍 / 💡 / ❤️ / ❓) ที่มุมการ์ดข้อความแทนครับ!`;
    }

    // Check ultra-short low-signal chat like "555", "ok", "ครับ", "+1"
    if (/^(55+|ok|เค|ครับ|ค่ะ|\+1|ดีครับ|งง)$/i.test(trimmed)) {
      return `🚫 บล็อกข้อความสั้นดันฟีด ("${trimmed}"): เพื่อรักษาระเบียบฟีดความรู้ กรุณากดปุ่ม Micro Reactions (👍 เข้าใจแล้ว หรือ ❓ สงสัยเพิ่ม) ที่มุมการ์ดข้อความแทนการพิมพ์สั้นๆ ดันหน้าจอ`;
    }

    return null;
  };

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    const spamReason = detectSpamOrStickerFlood(postContent);
    if (spamReason) {
      setFloodWarning(spamReason);
      return;
    }

    setFloodWarning(null);
    const nowTime = new Date().toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newPost: FeedPost = {
      id: `post-${Date.now()}`,
      channel: activeChannel,
      authorId: session.studentId,
      authorName:
        session.role === 'instructor'
          ? 'ผศ.ดร.ธนภัทร อัครเดโช (ผู้สอน)'
          : `${session.nickname} (${session.studentId})`,
      authorRole: session.role,
      topicTag: `หัวข้อที่ ${currentTopic.number} • ${currentTopic.title.slice(0, 28)}`,
      title:
        activeChannel !== 'discussion'
          ? postTitle.trim() ||
            (activeChannel === 'announcements'
              ? '📢 ประกาศสำคัญจากผู้สอน'
              : `💡 สรุปประเด็นสำคัญจาก ${session.nickname}`)
          : undefined,
      content: postContent.trim(),
      createdAt: `${nowTime} น.`,
      reactions: {
        understood: [],
        idea: [],
        thanks: [],
        question: [],
      },
    };

    onAddFeedPost(newPost);
    setPostTitle('');
    setPostContent('');
  };

  const handleAddPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPinTitle.trim()) return;
    onAddPinnedItem({
      id: `pin-${Date.now()}`,
      badge: '📌 ปักหมุดใหม่จากผู้สอน',
      title: newPinTitle.trim(),
      description: newPinDesc.trim() || 'เอกสารหรือนัดหมายสำคัญประจำคาบเรียน',
      linkLabel: 'ดูรายละเอียด',
      linkUrl: '#open-studio',
      dueTime: newPinDue,
      pinnedBy: 'ผศ.ดร.ธนภัทร',
    });
    setNewPinTitle('');
    setNewPinDesc('');
    setShowAddPinForm(false);
  };

  const filteredPosts = feedPosts.filter((p) => p.channel === activeChannel);

  const reactionConfig: {
    key: MicroReactionType;
    emoji: string;
    label: string;
  }[] = [
    { key: 'understood', emoji: '👍', label: 'เข้าใจแล้ว' },
    { key: 'idea', emoji: '💡', label: 'ได้ไอเดีย' },
    { key: 'thanks', emoji: '❤️', label: 'ขอบคุณ' },
    { key: 'question', emoji: '❓', label: 'สงสัยเพิ่ม' },
  ];

  return (
    <div className="space-y-6">
      {/* ===================================================================== */}
      {/* 📌 PINNED ESSENTIAL HUB (LOCKED AT TOP - NEVER SCROLLS AWAY)          */}
      {/* ===================================================================== */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 rounded-2xl p-5 text-white shadow-md border border-indigo-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Pin className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                📌 Pinned Essential Hub (แถบปักหมุดคงที่ด้านบน)
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  ล็อกคงที่ ไม่ไหลตามแชท
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                รวมลิงก์สไลด์ ประกาศสำคัญ และกำหนดส่งงานท้ายคาบที่ผู้สอนปักหมุดไว้
              </p>
            </div>
          </div>

          {session.role === 'instructor' && (
            <button
              type="button"
              onClick={() => setShowAddPinForm((v) => !v)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 self-start sm:self-center transition"
            >
              <Plus className="w-3.5 h-3.5" />
              ปักหมุดประกาศเพิ่ม
            </button>
          )}
        </div>

        {/* Add Pin Form (Instructor Only) */}
        {showAddPinForm && session.role === 'instructor' && (
          <form
            onSubmit={handleAddPin}
            className="mt-4 p-4 rounded-xl bg-white/10 border border-white/15 space-y-3"
          >
            <div className="text-xs font-bold text-indigo-200">
              เพิ่มรายการปักหมุดใหม่ใน Pinned Essential Hub
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={newPinTitle}
                onChange={(e) => setNewPinTitle(e.target.value)}
                placeholder="หัวข้อประกาศสำคัญ เช่น ลิงก์ใบงานกลุ่ม..."
                className="px-3 py-2 rounded-lg bg-slate-900/90 border border-white/20 text-xs text-white"
              />
              <input
                type="text"
                value={newPinDue}
                onChange={(e) => setNewPinDue(e.target.value)}
                placeholder="กำหนดเวลา เช่น ส่งภายใน 12:00 น."
                className="px-3 py-2 rounded-lg bg-slate-900/90 border border-white/20 text-xs text-white"
              />
            </div>
            <input
              type="text"
              value={newPinDesc}
              onChange={(e) => setNewPinDesc(e.target.value)}
              placeholder="รายละเอียดสั้นๆ..."
              className="w-full px-3 py-2 rounded-lg bg-slate-900/90 border border-white/20 text-xs text-white"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddPinForm(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-white/10"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white"
              >
                บันทึกการปักหมุด
              </button>
            </div>
          </form>
        )}

        {/* Pinned Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4">
          {pinnedItems.map((pin) => (
            <div
              key={pin.id}
              className="p-4 rounded-xl bg-white/10 hover:bg-white/[0.13] border border-white/15 transition flex flex-col justify-between gap-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-200 border border-amber-300/30">
                    {pin.badge}
                  </span>
                  <div className="flex items-center gap-2">
                    {pin.dueTime && (
                      <span className="text-[11px] text-emerald-300 font-medium">
                        {pin.dueTime}
                      </span>
                    )}
                    {session.role === 'instructor' && pinnedItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onRemovePinnedItem(pin.id)}
                        className="text-slate-400 hover:text-rose-400"
                        title="เลิกปักหมุด"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <h4 className="font-bold text-sm text-white leading-snug">{pin.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{pin.description}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                <span className="text-slate-400">ปักหมุดโดย {pin.pinnedBy}</span>
                <button
                  type="button"
                  onClick={onNavigateToStudio}
                  className="inline-flex items-center gap-1 font-bold text-indigo-300 hover:text-white transition"
                >
                  {pin.linkLabel}
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 📂 CATEGORIZED CHANNELS (3 DISTINCT TABS)                             */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 p-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveChannel('announcements');
              setFloodWarning(null);
            }}
            className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition ${
              activeChannel === 'announcements'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-200/70'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            📢 ประกาศจากผู้สอน (
            {feedPosts.filter((p) => p.channel === 'announcements').length})
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveChannel('notes');
              setFloodWarning(null);
            }}
            className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition ${
              activeChannel === 'notes'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-200/70'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            💡 โน้ตสรุปช่วยเพื่อน ({feedPosts.filter((p) => p.channel === 'notes').length})
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveChannel('discussion');
              setFloodWarning(null);
            }}
            className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition ${
              activeChannel === 'discussion'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-200/70'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            💬 พูดคุยแลกเปลี่ยน ({feedPosts.filter((p) => p.channel === 'discussion').length})
          </button>
        </div>

        {/* Compose Post + Anti-Sticker & Flood Filter Section */}
        <div className="p-5 bg-slate-50/70 border-b border-slate-200 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-indigo-600" />
              <span>
                🚫 <strong>Anti-Sticker & Flood Filter Active:</strong> ปิดระบบส่งสติ๊กเกอร์ตัวใหญ่และบล็อกข้อความสแปมซ้ำๆ (เช่น 5555555555)
              </span>
            </div>

            {/* Quick Evaluator Test Buttons for Spam/Sticker Blocking */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setPostContent('555555555555555');
                  const reason = detectSpamOrStickerFlood('555555555555555');
                  setFloodWarning(reason);
                }}
                className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 text-[11px] font-bold transition"
              >
                🧪 ทดสอบพิมพ์สแปม &quot;5555555555&quot;
              </button>
              <button
                type="button"
                onClick={() => {
                  setPostContent('[สติ๊กเกอร์]');
                  const reason = detectSpamOrStickerFlood('[สติ๊กเกอร์]');
                  setFloodWarning(reason);
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-bold transition"
              >
                🧪 ทดสอบส่ง &quot;[สติ๊กเกอร์]&quot;
              </button>
            </div>
          </div>

          {/* Flood Block Warning Banner */}
          {floodWarning && (
            <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs space-y-1.5 animate-fadeIn">
              <div className="font-bold flex items-center gap-2 text-rose-700">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                ระบบระงับการส่งข้อความเพื่อป้องกันแชทไหลดันเนื้อหาสำคัญ!
              </div>
              <p className="leading-relaxed">{floodWarning}</p>
            </div>
          )}

          {/* Compose Form */}
          <form onSubmit={handleSubmitPost} className="space-y-2.5">
            {activeChannel !== 'discussion' && (
              <input
                type="text"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder={
                  activeChannel === 'announcements'
                    ? 'หัวข้อประกาศจากผู้สอน...'
                    : 'หัวข้อโน้ตสรุปช่วยเพื่อน (เช่น สรุปสูตรจำง่ายเรื่อง Hinge Question)...'
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={postContent}
                onChange={(e) => {
                  setPostContent(e.target.value);
                  if (floodWarning) setFloodWarning(null);
                }}
                placeholder={
                  activeChannel === 'announcements'
                    ? 'พิมพ์ประกาศสำคัญถึงนิสิตทุกคน...'
                    : activeChannel === 'notes'
                    ? 'แชร์โน้ตสรุปสั้นๆ ช่วยเพื่อนในห้อง...'
                    : 'พิมพ์แลกเปลี่ยนความคิดเห็นเชิงวิชาการ (ห้ามส่งสติ๊กเกอร์หรือพิมพ์ 555555)...'
                }
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-sm flex items-center justify-center gap-1.5 shrink-0 transition"
              >
                <Send className="w-4 h-4" />
                โพสต์ลงหมวดนี้
              </button>
            </div>
          </form>
        </div>

        {/* Feed Posts List */}
        <div className="p-5 space-y-4">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className={`p-5 rounded-2xl border transition ${
                post.authorRole === 'instructor'
                  ? 'bg-indigo-50/40 border-indigo-200'
                  : post.channel === 'notes'
                  ? 'bg-emerald-50/30 border-emerald-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      post.authorRole === 'instructor'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {post.authorRole === 'instructor' ? '👨‍🏫 ผู้สอน' : '🎓 นิสิต'}
                  </span>
                  <span className="font-bold text-xs sm:text-sm text-slate-900">
                    {post.authorName}
                  </span>
                  <span className="text-xs text-slate-400">• {post.createdAt}</span>
                </div>

                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600">
                  {post.topicTag}
                </span>
              </div>

              {post.title && (
                <h4 className="font-bold text-sm sm:text-base text-slate-900 mb-1.5">
                  {post.title}
                </h4>
              )}

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {post.content}
              </p>

              {/* Micro Reactions Bar (Replaces Stickers & Flood Chat) */}
              <div className="mt-4 pt-3 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 font-medium">
                  กดส่ง Micro Reaction แทนการส่งสติ๊กเกอร์ดันแชท:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {reactionConfig.map((rc) => {
                    const reactors = post.reactions[rc.key] || [];
                    const hasReacted = reactors.includes(session.studentId);
                    return (
                      <button
                        key={rc.key}
                        type="button"
                        onClick={() =>
                          onToggleReaction(post.id, rc.key, session.studentId)
                        }
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition ${
                          hasReacted
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span>{rc.emoji}</span>
                        <span>{rc.label}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                            hasReacted
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {reactors.length}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

