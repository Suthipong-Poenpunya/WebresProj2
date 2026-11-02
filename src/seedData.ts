import {
  ClassPulseSharedState,
  TopicItem,
  PaceVote,
} from './types';

export const COURSE_TOPICS: TopicItem[] = [
  {
    id: 1,
    number: 1,
    title: 'แนวคิด Backward Design & Constructive Alignment ในยุค AI',
    subtitle: 'การตั้งเป้าหมายการเรียนรู้ (LOs) ให้สอดคล้องกับภาระงานและการวัดผลที่ AI ทำแทนไม่ได้',
    durationMin: 25,
    slideDeckRef: 'Slide 01 - 14',
    keyPoints: [
      'เริ่มจาก Desired Results (ผลลัพธ์การเรียนรู้ที่คาดหวัง) ก่อนเลือกเครื่องมือ EdTech',
      'Constructive Alignment (Biggs): เชื่อมโยง Learning Outcomes ↔ กิจกรรมในชั้นเรียน ↔ การประเมินผล',
      'ทำไมข้อสอบปรนัยความจำ (Recall) จึงสูญเสียความเที่ยงตรงในยุค Generative AI',
    ],
    contextPromptHint: 'กรณีศึกษาเรื่องการตั้งโจทย์วิชาประวัติศาสตร์ที่อาจารย์ยกตัวอย่างตอนต้นคาบ',
  },
  {
    id: 2,
    number: 2,
    title: 'การออกแบบ Formative Assessment & Real-time Feedback Loop',
    subtitle: 'การเก็บสัญญาณความเข้าใจระหว่างเรียน (Micro-Checks) เพื่อปรับจังหวะการสอนทันที',
    durationMin: 30,
    slideDeckRef: 'Slide 15 - 32',
    keyPoints: [
      'ความแตกต่างระหว่าง Assessment OF Learning (ตัดสินผล) vs Assessment FOR Learning (พัฒนาผู้เรียน)',
      'การใช้ Time-Decay Pulse Signals ป้องกันข้อมูลค้าง (Stale Feedback) ในห้องเรียนขนาดใหญ่',
      'เทคนิค Concept Hinge Question คำถามจุดเปลี่ยน 30 วินาทีเพื่อตรวจจับ Misconception ก่อนเปลี่ยนหัวข้อ',
    ],
    contextPromptHint: 'ตัวอย่างเปรียบเทียบการใช้ Kahoot แข่งความเร็ว กับการใช้ Concept Hinge Question ที่คุยกันเมื่อกี้',
  },
  {
    id: 3,
    number: 3,
    title: 'กลไก Authentic Assessment & Process-Tracked Evaluation',
    subtitle: 'การประเมินจากกระบวนการคิด การเชื่อมโยงบริบทห้องเรียน และการยืนยันความเข้าใจสด',
    durationMin: 35,
    slideDeckRef: 'Slide 33 - 48',
    keyPoints: [
      'ทำไม AI Text Detector แบบเดิมถึงเกิด False Positive กับนิสิตที่จดโน้ตสรุปเองข้างนอก',
      '3-Stage Authentic Studio: วัด Process Telemetry + Classroom Context Bridge + 60s Spot-Check',
      'การออกแบบ Rubric ที่ให้คุณค่ากับการให้เหตุผล (Reasoning) และหลักฐานเชิงประจักษ์ในห้องเรียน',
    ],
    contextPromptHint: 'ประเด็นดราม่าเรื่องเครื่องมือตรวจ AI ตีตราเด็กที่จดสรุปใน GoodNotes ผิดพลาด',
  },
  {
    id: 4,
    number: 4,
    title: 'Workshop: ออกแบบ Micro-Learning Module สำหรับห้องเรียนยุคใหม่',
    subtitle: 'ลงมือออกแบบแผนจัดกิจกรรมการเรียนรู้ 15 นาที พร้อมจุดเช็กความเข้าใจ 2 จุด',
    durationMin: 30,
    slideDeckRef: 'Slide 49 - 60',
    keyPoints: [
      'โครงสร้าง Micro-Lesson: Hook (3 นาที) → Core Concept (7 นาที) → Active Verification (5 นาที)',
      'การเลือกใช้ Social Learning Feed เพื่อให้นิสิตช่วยกันสรุปโน้ต (Peer Note-Taking)',
      'การสรุปบทเรียนและส่งงานผ่าน 3-Stage Authentic Assignment Studio ท้ายคาบ',
    ],
    contextPromptHint: 'โจทย์ Workshop กลุ่มย่อยเรื่องการลด Cognitive Load ของผู้เรียน',
  },
];

export const CONCEPT_POLL_TEMPLATES: Record<
  number,
  { question: string; options: string[]; correctOptionIndex: number }
> = {
  1: {
    question: 'ตามหลัก Backward Design ของ Wiggins & McTighe ขั้นตอนแรกสุดที่ผู้สอนต้องทำคือข้อใด?',
    options: [
      'ก. เลือกแอปพลิเคชันหรือเกม Kahoot ที่จะใช้กระตุ้นความสนใจ',
      'ข. กำหนดผลลัพธ์การเรียนรู้ที่ต้องการให้ติดตัวผู้เรียน (Identify Desired Results)',
      'ค. สร้างสไลด์เนื้อหาให้ครบทุกบทเรียนก่อนเริ่มเขียนแผนการวัดผล',
      'ง. ออกข้อสอบปลายภาคแบบปรนัย 4 ตัวเลือกจำนวน 100 ข้อ',
    ],
    correctOptionIndex: 1,
  },
  2: {
    question: 'ข้อใดคือหัวใจสำคัญของ "Formative Assessment (การประเมินเพื่อพัฒนา)" ที่เราเพิ่งอภิปรายกัน?',
    options: [
      'ก. ใช้ตัดเกรด A-F ตอนสิ้นสุดภาคการศึกษาเพื่อจัดอันดับนิสิต',
      'ข. เก็บข้อมูลความเข้าใจระหว่างเรียนเพื่อนำมาปรับจังหวะการสอนทันทีก่อนข้ามหัวข้อ',
      'ค. ให้คะแนนเฉพาะคนที่กดตอบเร็วที่สุดใน 3 วินาทีแรกเท่านั้น',
      'ง. งดการถาม-ตอบในชั้นเรียนเพื่อให้อาจารย์บรรยายจบตามเวลาสไลด์',
    ],
    correctOptionIndex: 1,
  },
  3: {
    question: 'ทำไมการตรวจงานยุค AI จึงควรใช้ "Classroom Context Bridge + 60s Spot-Check" แทนการห้าม Paste อย่างเดียว?',
    options: [
      'ก. เพราะนิสิตที่จดสรุปเองในแอปภายนอกอาจก๊อปโน้ตตัวเองมาวาง แต่ยังสามารถอธิบายเหตุผลสดได้จริง',
      'ข. เพราะการพิมพ์ช้าแปลว่าใช้ AI เสมอโดยไม่มีข้อยกเว้น',
      'ค. เพื่อบังคับให้นิสิตทุกคนต้องท่องจำคำตอบตามหนังสือเรียนทุกตัวอักษร',
      'ง. เพื่อลดเวลาการอ่านงานของอาจารย์เหลือเพียงการนับจำนวนคำ',
    ],
    correctOptionIndex: 0,
  },
  4: {
    question: 'ในการออกแบบ Micro-Learning 15 นาที สัดส่วนใดช่วยลดภาวะสมองล้า (Cognitive Overload) ได้ดีที่สุด?',
    options: [
      'ก. บรรยายรวดเดียว 15 นาทีโดยไม่หยุดพักแล้วค่อยสั่งการบ้าน',
      'ข. แบ่งเป็น Hook 3 นาที + เนื้อหาแก่น 7 นาที + กิจกรรมตรวจสอบความเข้าใจ 5 นาที',
      'ค. เปิดวิดีโอความยาว 45 นาทีด้วยความเร็ว 3x ให้จบภายใน 15 นาที',
      'ง. แจกสไลด์ 80 หน้าให้นิสิตอ่านเองเงียบๆ ในห้องเรียน',
    ],
    correctOptionIndex: 1,
  },
};

export function createInitialSeedState(now: number = Date.now()): ClassPulseSharedState {
  const fiveMins = 5 * 60 * 1000;

  // Create 20 active pace votes on Topic 2 where 7 out of 20 (35%) are 'example' or 'fast'
  // so that the >30% Warning Banner & Topic Transition Guard are immediately demonstrable!
  const initialPaceVotes: PaceVote[] = [
    {
      studentId: '6740101127',
      nickname: 'ต้นน้ำ (นิสิต A)',
      signal: 'good',
      timestamp: now - 45_000,
      expiresAt: now - 45_000 + fiveMins,
      topicId: 2,
    },
    {
      studentId: '6740102527',
      nickname: 'แพรวา (นิสิต B)',
      signal: 'example',
      timestamp: now - 30_000,
      expiresAt: now - 30_000 + fiveMins,
      topicId: 2,
    },
    {
      studentId: '6740108927',
      nickname: 'กิตติภพ',
      signal: 'fast',
      timestamp: now - 25_000,
      expiresAt: now - 25_000 + fiveMins,
      topicId: 2,
    },
    {
      studentId: '6740103127',
      nickname: 'มินตรา',
      signal: 'fast',
      timestamp: now - 40_000,
      expiresAt: now - 40_000 + fiveMins,
      topicId: 2,
    },
    {
      studentId: '6740103227',
      nickname: 'ภูวดล',
      signal: 'fast',
      timestamp: now - 55_000,
      expiresAt: now - 55_000 + fiveMins,
      topicId: 2,
    },
    {
      studentId: '6740103327',
      nickname: 'ณัฐณิชา',
      signal: 'example',
      timestamp: now - 20_000,
      expiresAt: now - 20_000 + fiveMins,
      topicId: 2,
    },
    {
      studentId: '6740103427',
      nickname: 'ชยพล',
      signal: 'example',
      timestamp: now - 50_000,
      expiresAt: now - 50_000 + fiveMins,
      topicId: 2,
    },
    {
      studentId: '6740103527',
      nickname: 'พิมพ์ชนก',
      signal: 'fast',
      timestamp: now - 15_000,
      expiresAt: now - 15_000 + fiveMins,
      topicId: 2,
    },
    // 13 'good' votes total (with Tonnam above) => 13 good, 3 example, 4 fast = 20 votes total (35% struggling!)
    ...Array.from({ length: 12 }, (_, idx) => ({
      studentId: `6740104${idx + 10}`,
      nickname: `นิสิตกลุ่มเรียนร่วม #${idx + 1}`,
      signal: 'good' as const,
      timestamp: now - (idx + 1) * 8_000,
      expiresAt: now - (idx + 1) * 8_000 + fiveMins,
      topicId: 2,
    })),
  ];

  return {
    version: 1,
    lastUpdated: now,
    courseCode: '2726301',
    courseName: 'นวัตกรรมและเทคโนโลยีเพื่อการเรียนรู้',
    roomCode: 'ED2026',
    instructorName: 'ผศ.ดร.ธนภัทร อัครเดโช (อาจารย์ประจำวิชา)',
    currentTopicId: 2,
    claimedStudents: {
      '6740101127': {
        studentId: '6740101127',
        nickname: 'ต้นน้ำ (นิสิต A)',
        pin: '1111',
        roomCode: 'ED2026',
        anonymousAlias: 'ผู้เรียนนิรนาม #308',
        claimedAt: now - 3600_000,
      },
      '6740102527': {
        studentId: '6740102527',
        nickname: 'แพรวา (นิสิต B)',
        pin: '2222',
        roomCode: 'ED2026',
        anonymousAlias: 'ผู้เรียนนิรนาม #412',
        claimedAt: now - 3500_000,
      },
      '6740108927': {
        studentId: '6740108927',
        nickname: 'กิตติภพ',
        pin: '3333',
        roomCode: 'ED2026',
        anonymousAlias: 'ผู้เรียนนิรนาม #519',
        claimedAt: now - 3400_000,
      },
    },
    paceVotes: initialPaceVotes,
    topicLogs: [
      {
        id: 'log-1',
        topicId: 1,
        topicTitle: 'หัวข้อที่ 1: แนวคิด Backward Design & Constructive Alignment ในยุค AI',
        actionType: 'next_topic',
        timestamp: '10:05 น.',
        goodCount: 22,
        exampleCount: 2,
        fastCount: 1,
        confusionRatio: 12,
        note: 'ผู้เรียน 88% ตามทัน เปลี่ยนเข้าสู่หัวข้อที่ 2 ตามแผนการสอน',
      },
    ],
    activePoll: null,
    questions: [
      {
        id: 'q-101',
        topicId: 2,
        authorStudentId: '6740102527',
        anonymousAlias: 'ผู้เรียนนิรนาม #412',
        content:
          'อาจารย์คะ ถ้าเราใช้ Formative Quiz ระหว่างคาบทุกๆ 15 นาที จะทำให้นิสิตเกิดความเครียดเหมือนโดนสอบตลอดเวลาไหมคะ มีเกณฑ์ไหมว่าควรออกแบบอย่างไรไม่ให้กดดัน?',
        createdAt: '10:18 น.',
        voterIds: [
          '6740101127',
          '6740102527',
          '6740103127',
          '6740103227',
          '6740103327',
          '6740103427',
          '6740103527',
          '674010410',
          '674010411',
          '674010412',
          '674010413',
          '674010414',
        ],
        isSpotlight: true,
        isAnswered: false,
      },
      {
        id: 'q-102',
        topicId: 2,
        authorStudentId: '6740101127',
        anonymousAlias: 'ผู้เรียนนิรนาม #308',
        content:
          'อยากให้อาจารย์ยกตัวอย่าง "Concept Hinge Question (คำถามจุดเปลี่ยน)" ในวิชาสายปฏิบัติการ เช่น การเขียนโปรแกรมหรือการทดลองวิทยาศาสตร์ ว่าตั้งตัวลวง (Distractors) ยังไงให้จับความเข้าใจผิดได้แม่นยำครับ?',
        createdAt: '10:21 น.',
        voterIds: [
          '6740101127',
          '6740103127',
          '6740103227',
          '6740103327',
          '674010410',
          '674010411',
          '674010412',
          '674010415',
        ],
        isSpotlight: false,
        isAnswered: false,
      },
      {
        id: 'q-103',
        topicId: 3,
        authorStudentId: '6740108927',
        anonymousAlias: 'ผู้เรียนนิรนาม #519',
        content:
          'กรณีที่เราใช้ AI ช่วยเกลาไวยากรณ์หรือจัดโครงร่าง (Outline) แต่เนื้อหาหลักเราคิดเอง แบบนี้ในระบบ Authentic Assessment ควรประเมินอย่างไรให้ยุติธรรมครับ?',
        createdAt: '10:24 น.',
        voterIds: ['6740108927', '6740102527', '6740103427', '6740103527', '674010416'],
        isSpotlight: false,
        isAnswered: false,
      },
      {
        id: 'q-104',
        topicId: 1,
        authorStudentId: '6740103127',
        anonymousAlias: 'ผู้เรียนนิรนาม #204',
        content:
          'Constructive Alignment ของ Biggs จำเป็นต้องเขียน Rubric แยกตามระดับ Bloom’s Taxonomy ทุกข้อเลยไหมคะ หรือใช้ Holistic Rubric ร่วมด้วยได้?',
        createdAt: '09:58 น.',
        voterIds: ['6740103127', '6740101127', '6740102527'],
        isSpotlight: false,
        isAnswered: true,
        instructorAnswer:
          'สามารถใช้ควบคู่กันได้ครับ! สำหรับงานออกแบบนวัตกรรม แนะนำ Analytic Rubric ที่ผูกกับ LO หลัก 3 ด้าน เพื่อให้ผู้เรียนเห็นจุดที่ต้องพัฒนาชัดเจน ส่วน Holistic เหมาะกับการประเมินภาพรวมตอน Pitching ครับ',
        answeredAt: '10:03 น.',
      },
    ],
    pinnedItems: [
      {
        id: 'pin-1',
        badge: '📚 เอกสารประกอบการเรียนหลัก',
        title: 'สไลด์บทที่ 4: Formative & Authentic Assessment in AI Era (PDF + Canvas Template)',
        description:
          'รวมผัง Backward Design, ตัวอย่างการตั้งคำถาม Hinge Question และเกณฑ์ Rubric สำหรับทำกิจกรรมท้ายคาบ',
        linkLabel: 'เปิดสไลด์ Slide 01-60',
        linkUrl: '#slide-deck-2726301',
        dueTime: 'อัปเดตล่าสุด วันนี้ 09:00 น.',
        pinnedBy: 'ผศ.ดร.ธนภัทร',
      },
      {
        id: 'pin-2',
        badge: '⏰ ภาระงานท้ายคาบ (บังคับส่ง)',
        title: 'งานชิ้นที่ 3: วิเคราะห์แนวทางออกแบบการวัดผลที่ส่งเสริมการคิดวิเคราะห์และทนทานต่อการคัดลอกด้วย AI',
        description:
          'ส่งในแท็บ "สตูดิโอส่งงาน (Authentic Studio)" มีระบบเชื่อมโยงบริบทคาบเรียน + ยืนยันความเข้าใจสด 60 วินาที (อนุญาตให้นำโน้ตที่สรุปเองมาวางได้)',
        linkLabel: 'ไปที่สตูดิโอส่งงาน',
        linkUrl: '#open-studio',
        dueTime: 'กำหนดส่งวันนี้ ภายใน 12:00 น.',
        pinnedBy: 'ผศ.ดร.ธนภัทร',
      },
    ],
    feedPosts: [
      // Announcements (ประกาศจากผู้สอน)
      {
        id: 'post-ann-1',
        channel: 'announcements',
        authorId: 'instructor-01',
        authorName: 'ผศ.ดร.ธนภัทร อัครเดโช',
        authorRole: 'instructor',
        topicTag: 'ข้อตกลงการส่งงานท้ายคาบ',
        title: 'แนวทางการใช้โน้ตส่วนตัวในการทำใบงาน Authentic Assessment วันนี้',
        content:
          'นิสิตที่จดสรุปลงใน iPad / GoodNotes หรือ Notion ระหว่างฟังบรรยาย สามารถคัดลอกโครงร่างของตัวเองมาวางในสตูดิโอส่งงานได้ตามปกตินะครับ ระบบจะไม่หักคะแนนจากการ Paste เพียงอย่างเดียว แต่จะให้ยืนยันความเข้าใจด้วยภาษาพูดของตนเองในด่าน Spot-Check 60 วินาทีครับ',
        createdAt: '09:35 น.',
        reactions: {
          understood: ['6740101127', '6740102527', '6740103127', '6740103227'],
          idea: ['6740101127'],
          thanks: ['6740102527', '6740103327'],
          question: [],
        },
      },
      {
        id: 'post-ann-2',
        channel: 'announcements',
        authorId: 'instructor-01',
        authorName: 'ผศ.ดร.ธนภัทร อัครเดโช',
        authorRole: 'instructor',
        topicTag: 'หัวข้อที่ 2',
        title: 'เปิดรับคำถามนิรนามสำหรับกรณีศึกษา Formative Feedback แล้ว',
        content:
          'ใครที่ยังสงสัยเรื่องการออกแบบตัวลวง (Distractor) ใน Concept Hinge Question สามารถพิมพ์ทิ้งไว้ในกล่อง Q&A นิรนาม หรือกด 🔥 สงสัยเหมือนกัน เพื่อดันคำถามขึ้นคิวบนสุดได้เลยครับ',
        createdAt: '10:12 น.',
        reactions: {
          understood: ['6740101127', '6740108927'],
          idea: ['6740102527'],
          thanks: ['6740101127'],
          question: [],
        },
      },
      // Shared Class Notes (โน้ตสรุปช่วยเพื่อน 3 ชิ้น)
      {
        id: 'post-note-1',
        channel: 'notes',
        authorId: '6740101127',
        authorName: 'ต้นน้ำ (6740101127)',
        authorRole: 'student',
        topicTag: 'หัวข้อที่ 1 • Backward Design',
        title: '📝 สรุป 3 ขั้นตอน Backward Design + ตารางเทียบงานแบบเดิม vs ยุค AI',
        content:
          'สรุปจากที่อาจารย์บรรยายเมื่อสักครู่ครับ:\n1) กำหนดผลลัพธ์ (Desired Results): ต้องเน้นขั้น วิเคราะห์/ประเมินค่า/สร้างสรรค์\n2) กำหนดหลักฐานร่องรอย (Acceptable Evidence): เปลี่ยนจากตรวจเฉพาะชิ้นงานสำเร็จรูป มาตรวจ Process + การอธิบายเหตุผลสด\n3) ออกแบบกิจกรรมการเรียนรู้ (Learning Experience): มีการฝึกให้ Feedback ระหว่างคาบก่อนประเมินจริง',
        createdAt: '10:02 น.',
        reactions: {
          understood: ['6740102527', '6740103127'],
          idea: ['6740102527', '6740103227', '6740103327'],
          thanks: ['6740102527', '6740108927', '6740103127', '6740103427'],
          question: [],
        },
      },
      {
        id: 'post-note-2',
        channel: 'notes',
        authorId: '6740102527',
        authorName: 'แพรวา (6740102527)',
        authorRole: 'student',
        topicTag: 'หัวข้อที่ 2 • Formative vs Summative',
        title: '💡 สูตรจำง่าย: Kahoot แข่งความเร็ว vs Hinge Question เช็กความเข้าใจลึก',
        content:
          'ประเด็นสำคัญที่อาจารย์เน้นในสไลด์หน้า 22:\n• เกมควิซเน้นความเร็ว: เด็กมักเดาสุ่มเพื่อเอาแต้มโบนัสเวลา ทำให้ผู้สอนไม่รู้ว่าเข้าใจจริงหรือไม่\n• Hinge Question (คำถามจุดเปลี่ยน 30-60 วินาที): ไม่คิดคะแนนความเร็ว แต่ตัวเลือก ก-ง ออกแบบมาจากความเข้าใจผิดที่พบบ่อย (Common Misconceptions) ถ้าคนตอบผิดเกิน 30% ผู้สอนต้องเบรกและอธิบายใหม่ทันที!',
        createdAt: '10:19 น.',
        reactions: {
          understood: ['6740101127', '6740103127', '6740103527'],
          idea: ['6740101127', '6740103427'],
          thanks: ['6740101127', '6740103127', '6740103227'],
          question: [],
        },
      },
      {
        id: 'post-note-3',
        channel: 'notes',
        authorId: '6740103127',
        authorName: 'มินตรา (6740103127)',
        authorRole: 'student',
        topicTag: 'หัวข้อที่ 3 • Authentic Studio',
        title: '🎯 เทคนิคทำ Classroom Context Bridge ให้ได้คะแนนเต็ม',
        content:
          'เวลาเขียนเชื่อมโยงบริบทคาบเรียน (Stage 2) อย่าเขียนลอยๆ ให้ระบุชื่อกรณีศึกษาที่เราถกกันในห้องวันนี้เลย เช่น เคสที่อาจารย์เปรียบเทียบการให้ทำเรียงความที่บ้าน กับการทำ Micro-Defense 60 วินาทีในห้องเรียน จะช่วยให้เห็นการเชื่อมโยงทฤษฎีสู่การปฏิบัติชัดเจนมากค่ะ',
        createdAt: '10:26 น.',
        reactions: {
          understood: ['6740101127', '6740102527'],
          idea: ['6740101127', '6740102527', '6740108927'],
          thanks: ['6740101127', '6740102527'],
          question: [],
        },
      },
      // Structured Discussion (พูดคุยแลกเปลี่ยน)
      {
        id: 'post-disc-1',
        channel: 'discussion',
        authorId: '6740101127',
        authorName: 'ต้นน้ำ (6740101127)',
        authorRole: 'student',
        topicTag: 'แลกเปลี่ยนไอเดียประยุกต์ใช้',
        content:
          'ผมคิดว่าถ้าเอาระบบ Live Pace Meter ที่มีเวลาหมดอายุ 5 นาที ไปใช้ในวิชาเขียนโปรแกรมตอนสอนเขียน Loop น่าจะดีมากเลยครับ เพราะปกติพอเพื่อนหลุดบรรทัดเดียวแล้วไม่กล้ายกมือ ก็จะหลุดยาวทั้งคาบเลย',
        createdAt: '10:22 น.',
        reactions: {
          understood: ['6740102527'],
          idea: ['6740102527', '6740103127', '6740103227'],
          thanks: ['6740103327'],
          question: [],
        },
      },
      {
        id: 'post-disc-2',
        channel: 'discussion',
        authorId: '6740102527',
        authorName: 'แพรวา (6740102527)',
        authorRole: 'student',
        topicTag: 'แลกเปลี่ยนไอเดียประยุกต์ใช้',
        content:
          'เห็นด้วยกับต้นน้ำเลยค่ะ ของแพรวาสนใจเอา Concept Hinge Question ไปปรับใช้กับวิชาภาษาอังกฤษ โดยตั้งตัวเลือกเป็นประโยคที่คนไทยชอบแปลตรงตัวผิดๆ เพื่อเช็กก่อนขึ้นเรื่อง Relative Clause ค่ะ',
        createdAt: '10:25 น.',
        reactions: {
          understood: ['6740101127'],
          idea: ['6740101127', '6740103127'],
          thanks: ['6740101127'],
          question: [],
        },
      },
    ],
    submissions: [
      {
        id: 'sub-seed-1',
        studentId: '6740101127',
        studentName: 'นายต้นน้ำ พัฒนากุล (นิสิตตัวอย่างคนที่ 1 - พิมพ์เองตามธรรมชาติ)',
        submittedAt: '10:20 น.',
        answerContent:
          'การออกแบบการประเมินผลในยุค Generative AI ไม่ควรเน้นเพียงการตรวจชิ้นงานสุดท้ายแบบความจำ (Recall) เพราะ AI สามารถสร้างคำตอบสำเร็จรูปได้ในเสี้ยววินาที แนวทางที่ยั่งยืนคือการประยุกต์ใช้ Constructive Alignment ร่วมกับ Formative Assessment ระหว่างคาบเรียน โดยเน้นประเมินที่กระบวนการคิด (Process Evaluation) และการให้ผู้เรียนสะท้อนเหตุผลของการตัดสินใจเลือกวิธีแก้ปัญหาด้วยตนเอง',
        activeTypingSeconds: 142,
        keystrokeCount: 418,
        backspaceCount: 38,
        totalCharCount: 364,
        pastedCharCount: 0,
        pastedRatio: 0,
        declaredExternalNotes: false,
        classroomContextBridge:
          'เชื่อมโยงกับตัวอย่างในคาบเรียนช่วงหัวข้อที่ 2 ที่อาจารย์ธนภัทรเปรียบเทียบว่า การใช้ Kahoot แข่งกดเร็ววัดได้แค่ความไว แต่การใช้ Concept Hinge Question 30 วินาทีช่วยให้เห็นว่าเพื่อน 35% ยังสับสนจุดไหนแล้วอธิบายซ้ำได้ทันที',
        extractedSentence:
          'แนวทางที่ยั่งยืนคือการประยุกต์ใช้ Constructive Alignment ร่วมกับ Formative Assessment ระหว่างคาบเรียน โดยเน้นประเมินที่กระบวนการคิด',
        spotCheckPrompt:
          'จากที่คุณเขียนว่า "แนวทางที่ยั่งยืนคือการประยุกต์ใช้ Constructive Alignment ร่วมกับ Formative Assessment ระหว่างคาบเรียน..." จงอธิบายเหตุผลด้วยภาษาพูดสั้นๆ ของคุณเองภายใน 60 วินาทีว่าทำไมวิธีนี้ถึงแก้ปัญหาการลอก AI ได้จริง?',
        spotCheckResponse:
          'เพราะถ้าเราเก็บหลักฐานระหว่างเรียนไปเรื่อยๆ และให้เด็กเชื่อมโยงกับสิ่งที่เพิ่งคุยกันสดๆ ในห้อง คนที่ใช้ AI ก๊อปมาวางโดยไม่ได้ฟังอาจารย์จะอธิบายที่มาที่ไปของความคิดตัวเองใน 60 วินาทีไม่ได้เลยครับ',
        spotCheckMode: 'text',
        spotCheckDurationSec: 34,
        tabSwitchCount: 0,
        tabSwitchLogs: [],
        status: 'VERIFIED_HUMAN',
        authenticityScore: 98,
        riskSummary:
          'พิมพ์เองตามธรรมชาติ 100% (เวลาพิมพ์จริง 142 วินาที, แก้ไขคำ 38 ครั้ง, Paste 0%) เชื่อมโยงบริบทคาบเรียนตรงประเด็น และผ่านด่าน Spot-Check 60 วินาทีโดยไม่สลับหน้าจอ',
        instructorFeedback: 'ยอดเยี่ยมมาก อธิบายเชื่อมโยงกรณีศึกษาในห้องได้ชัดเจนและผ่านการยืนยันตัวตน 100%',
      },
      {
        id: 'sub-seed-2',
        studentId: '6740102527',
        studentName: 'น.ส.แพรวา รัตนโชติ (นิสิตตัวอย่างคนที่ 2 - ก๊อปโน้ตตัวเองแต่ผ่าน Spot-Check ชัดเจน)',
        submittedAt: '10:24 น.',
        answerContent:
          'หัวใจของการวัดผลแบบ Authentic Assessment คือการเปลี่ยนจากการจับผิดด้วยโปรแกรมตรวจ AI ที่มักเกิด False Positive มาเป็นการวัดความเข้าใจที่แท้จริงผ่าน 3 องค์ประกอบ ได้แก่ 1) การเปิดโอกาสให้นิสิตนำโน้ตที่สรุปเองมาพัฒนาต่อได้โดยโปร่งใส 2) การตั้งโจทย์ที่ต้องอ้างอิงเหตุการณ์จริงในชั้นเรียน และ 3) การทำ Micro-Defense ยืนยันความเข้าใจด้วยภาษาพูดของตนเองในเวลาจำกัด',
        activeTypingSeconds: 36,
        keystrokeCount: 95,
        backspaceCount: 11,
        totalCharCount: 372,
        pastedCharCount: 290,
        pastedRatio: 78,
        declaredExternalNotes: true,
        externalNotesSource: 'จดสรุปด้วยตัวเองในแอป GoodNotes 6 บน iPad ระหว่างฟังบรรยายหัวข้อที่ 1-2 แล้วคัดลอกมาวางเพื่อเกลาต่อ',
        classroomContextBridge:
          'เชื่อมโยงกับประเด็นที่อาจารย์ยกตัวอย่างตอนต้นคาบเรื่องนิสิตที่ตั้งใจจดสรุปใน GoodNotes แล้วก๊อปมาส่ง แต่กลับถูกโปรแกรม AI Detector แบบเก่าตีตราว่าใช้ AI ทั้งที่คิดเองทั้งหมด',
        extractedSentence:
          'การเปลี่ยนจากการจับผิดด้วยโปรแกรมตรวจ AI ที่มักเกิด False Positive มาเป็นการวัดความเข้าใจที่แท้จริงผ่าน 3 องค์ประกอบ',
        spotCheckPrompt:
          'จากที่คุณเขียนว่า "การเปลี่ยนจากการจับผิดด้วยโปรแกรมตรวจ AI ที่มักเกิด False Positive มาเป็นการวัดความเข้าใจที่แท้จริง..." จงอธิบายด้วยภาษาพูดสั้นๆ ใน 60 วินาทีว่าทำไมการถามสด 60 วินาทีถึงยุติธรรมกับคนจดโน้ตข้างนอกมากกว่า?',
        spotCheckResponse:
          'เพราะหนูเป็นคนจดสรุปลงใน iPad เองตั้งแต่ต้นคาบค่ะ พอคัดลอกข้อความตัวเองมาวางแล้วระบบถามเจาะจงประโยคที่หนูเขียน หนูก็สามารถอธิบายขยายความด้วยคำพูดตัวเองได้ทันทีโดยไม่ต้องสลับจอไปถามใครค่ะ',
        spotCheckMode: 'voice',
        spotCheckDurationSec: 27,
        tabSwitchCount: 0,
        tabSwitchLogs: [],
        status: 'VERIFIED_HUMAN',
        authenticityScore: 91,
        riskSummary:
          'แม้มีสัดส่วน Paste 78% จากการวางโน้ต GoodNotes ส่วนตัว แต่ได้แจ้ง External Draft อย่างโปร่งใส ไม่มีการสลับแท็บหนี (TabSwitch = 0) และอธิบายปากเปล่าใน Spot-Check 60 วินาทีได้ชัดเจนสอดคล้องกับเนื้อหา 100%',
        instructorFeedback: 'ตัวอย่างที่ดีมากของการจดโน้ตส่วนตัวแล้วนำมาส่ง สามารถอธิบายยืนยันความเข้าใจสดได้ชัดเจน',
      },
      {
        id: 'sub-seed-3',
        studentId: '6740108927',
        studentName: 'นายกิตติภพ วงศ์สวัสดิ์ (นิสิตตัวอย่างคนที่ 3 - ก๊อป AI วางใน 3 วินาที + สลับแท็บหนี 3 ครั้ง)',
        submittedAt: '10:27 น.',
        answerContent:
          'ในบริบทของนิเวศวิทยาการศึกษาดิจิทัลยุคที่สี่ การบูรณาการพาราไดม์การประเมินผลสัมฤทธิ์ทางการเรียนจำเป็นต้องอาศัยกรอบแนวคิดเชิงวิพากษ์แบบองค์รวม (Holistic Critical Pedagogical Framework) เพื่อสังเคราะห์ดัชนีชี้วัดสมรรถนะขั้นสูงของผู้เรียนผ่านอัลกอริทึมการเรียนรู้เชิงลึกอย่างมีนัยสำคัญทางสถิติและสอดคล้องกับมาตรฐานสากล',
        activeTypingSeconds: 3,
        keystrokeCount: 4,
        backspaceCount: 0,
        totalCharCount: 332,
        pastedCharCount: 326,
        pastedRatio: 98,
        declaredExternalNotes: false,
        classroomContextBridge:
          'การประเมินผลมีความสำคัญมากต่อการศึกษาในยุคปัจจุบันและช่วยให้ผู้เรียนมีความรู้ความเข้าใจที่ดีขึ้นตามลำดับ',
        extractedSentence:
          'การบูรณาการพาราไดม์การประเมินผลสัมฤทธิ์ทางการเรียนจำเป็นต้องอาศัยกรอบแนวคิดเชิงวิพากษ์แบบองค์รวม (Holistic Critical Pedagogical Framework)',
        spotCheckPrompt:
          'จากที่คุณเขียนว่า "การบูรณาการพาราไดม์การประเมินผลสัมฤทธิ์ทางการเรียนจำเป็นต้องอาศัยกรอบแนวคิดเชิงวิพากษ์แบบองค์รวม..." จงอธิบายความหมายของคำนี้ด้วยภาษาพูดของคุณเองภายใน 60 วินาที',
        spotCheckResponse:
          'เอ่อ คือการนำเทคโนโลยีมาใช้ในการเรียนการสอนให้ทันสมัยและประเมินผลอย่างเป็นระบบครับ',
        spotCheckMode: 'text',
        spotCheckDurationSec: 58,
        tabSwitchCount: 3,
        tabSwitchLogs: [
          { timestamp: '10:26:12 น.', reason: 'ตรวจพบการสลับหน้าต่าง/แท็บ (window.blur / visibilitychange ครั้งที่ 1)' },
          { timestamp: '10:26:29 น.', reason: 'ตรวจพบการสลับหน้าต่าง/แท็บ (window.blur / visibilitychange ครั้งที่ 2)' },
          { timestamp: '10:26:47 น.', reason: 'ตรวจพบการสลับหน้าต่าง/แท็บ (window.blur / visibilitychange ครั้งที่ 3)' },
        ],
        status: 'HIGH_AI_RISK',
        authenticityScore: 14,
        riskSummary:
          '🚨 ความเสี่ยงสูงมาก: วางข้อความรวดเดียว 98% ในเวลาพิมพ์เพียง 3 วินาที (0 Backspace), ไม่สามารถเชื่อมโยงตัวอย่างในคาบเรียนได้ และสลับหน้าจอหนี 3 ครั้งระหว่างด่านทดสอบ 60 วินาที รวมถึงอธิบายคำศัพท์ในงานตัวเองไม่ได้',
        instructorFeedback: 'รอเรียกพูดคุยยืนยันความเข้าใจตัวต่อตัวหลังจบคาบเรียน',
      },
    ],
  };
}

