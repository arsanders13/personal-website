export const SEED_DATA = {
  profile: {
    name: 'Arianna Sanders',
    title: 'Incoming Computer Science & Engineering Student',
    university: 'The Ohio State University',
    classYear: '2030',
    location: 'Columbus, OH',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
  },
  tasks: [
    {
      id: 'task-lolla',
      title: '💅 Figure out Lollapalooza Friday Makeup & Outfit',
      priority: 'low',
      category: 'Personal',
      dueDate: '2026-08-01',
      sourceTag: 'Life OS',
      status: 'todo',
      subtasks: [
        { id: 'st-lolla-1', title: 'Pick makeup look for Friday', completed: false },
        { id: 'st-lolla-2', title: 'Pack festival essentials', completed: false }
      ],
      notes: 'Going to Lollapalooza on Friday!'
    },
    {
      id: 'task-linkedin',
      title: '💼 Draft & Post Internship Wrap-Up on LinkedIn',
      priority: 'medium',
      category: 'Career',
      dueDate: '2026-08-05',
      sourceTag: 'Life OS',
      status: 'todo',
      subtasks: [
        { id: 'st-li-1', title: 'Outline key accomplishments and learnings', completed: false },
        { id: 'st-li-2', title: 'Thank manager and team members', completed: false }
      ],
      notes: 'Post next week to wrap up summer internship.'
    },
    {
      id: 'task-chris-bork',
      title: '🔬 Reach Out to Chris Bork Re: Undergraduate Research',
      priority: 'high',
      category: 'Career',
      dueDate: '2026-08-08',
      sourceTag: 'Life OS',
      status: 'todo',
      subtasks: [
        { id: 'st-cb-1', title: 'Draft email introducing CSE interests', completed: false },
        { id: 'st-cb-2', title: 'Attach updated tech resume', completed: false }
      ],
      notes: 'Important (Not Urgent): Explore lab research assistant positions at OSU.'
    },
    {
      id: 'task-depop',
      title: '🛍️ Look Over Depop Listings & Items for School',
      priority: 'low',
      category: 'Personal',
      dueDate: '2026-08-10',
      sourceTag: 'Life OS',
      status: 'todo',
      subtasks: [],
      notes: 'Review Depop side project items.'
    },
    {
      id: 'evt-in-too-deep',
      title: '🌊 In Too Deep Party (Ques)',
      priority: 'medium',
      category: 'Clubs',
      dueDate: '2026-08-20',
      sourceTag: 'Campus Events',
      status: 'todo',
      notes: '⏰ 3:00 PM - 8:00 PM | Hosted by Ques'
    },
    {
      id: 'evt-adult-swim',
      title: '🏊 Adult Swim (Nupes - Invite Only)',
      priority: 'high',
      category: 'Clubs',
      dueDate: '2026-08-21',
      sourceTag: 'Campus Events',
      status: 'todo',
      notes: '⏰ 3:00 PM - 8:00 PM | Hosted by Nupes | Invite Only'
    },
    {
      id: 'evt-pregame',
      title: '🍻 Pregame (Nupes)',
      priority: 'medium',
      category: 'Personal',
      dueDate: '2026-08-21',
      sourceTag: 'Campus Events',
      status: 'todo',
      notes: '⏰ 7:00 PM - 10:00 PM | Hosted by Nupes'
    },
    {
      id: 'evt-summer-never-ends',
      title: '🎤 Summer Never Ends (21+ @ Skullys)',
      priority: 'medium',
      category: 'Personal',
      dueDate: '2026-08-21',
      sourceTag: 'Campus Events',
      status: 'todo',
      notes: '⏰ 10:00 PM - 2:00 AM | Location: Skullys Music Diner | 21+'
    },
    {
      id: 'evt-welcome-backk',
      title: '🎉 Welcome Backk Party @ Nupe House',
      priority: 'high',
      category: 'Clubs',
      dueDate: '2026-08-21',
      sourceTag: 'Campus Events',
      status: 'todo',
      notes: '⏰ 10:00 PM - 2:00 AM | Location: Nupe House | Girls: Free'
    },
    {
      id: 'evt-cookowt',
      title: '🍗 CookOwt @ Hale Hall (Ques)',
      priority: 'medium',
      category: 'Clubs',
      dueDate: '2026-08-22',
      sourceTag: 'Campus Events',
      status: 'todo',
      notes: '⏰ 3:00 PM - 8:00 PM | Location: Hale Hall | Hosted by Ques'
    },
    {
      id: 'evt-blue-ice-party',
      title: '❄️ Blue Ice Party (Alphas & Sigmas)',
      priority: 'high',
      category: 'Clubs',
      dueDate: '2026-08-22',
      sourceTag: 'Campus Events',
      status: 'todo',
      notes: '⏰ 10:00 PM - 2:00 AM | Hosted by Alphas & Sigmas | Girls: Free'
    },
    {
      id: 'evt-nphc-yard-show',
      title: '🎭 NPHC Yard Show & Family Affair (Free)',
      priority: 'high',
      category: 'Clubs',
      dueDate: '2026-08-28',
      sourceTag: 'Campus Events',
      status: 'todo',
      notes: '⏰ 5:00 PM - 10:00 PM | Free Admission'
    },
    {
      id: 'evt-wbw',
      title: '🌙 WBW Event',
      priority: 'medium',
      category: 'Personal',
      dueDate: '2026-08-28',
      sourceTag: 'Campus Events',
      status: 'todo',
      notes: '⏰ 10:00 PM - 2:00 AM'
    },
    {
      id: 'evt-juiced-up',
      title: '🧃 Juiced Up Party (Free First 30 Mins)',
      priority: 'medium',
      category: 'Personal',
      dueDate: '2026-08-28',
      sourceTag: 'Campus Events',
      status: 'todo',
      notes: '⏰ 10:30 PM - Late | Free for the first 30 minutes'
    },
    {
      id: 'evt-bosu-30-meetup',
      title: '🤝 B’OSU ‘30 Meetup @ D9 Plaza (Free)',
      priority: 'high',
      category: 'Clubs',
      dueDate: '2026-08-29',
      sourceTag: 'Campus Events',
      status: 'todo',
      notes: '⏰ 6:00 PM - 8:00 PM | Location: D9 Plaza | Free'
    },
    {
      id: 'evt-annual-african-mixer',
      title: '🌍 Annual African Mixer @ RPAC (Free)',
      priority: 'high',
      category: 'Clubs',
      dueDate: '2026-08-29',
      sourceTag: 'Campus Events',
      status: 'todo',
      notes: '⏰ 5:00 PM - 8:00 PM | Location: RPAC | Free'
    },
    {
      id: 'evt-scholars-ice-cream-social',
      title: '🍦 All Scholars Ice Cream Social @ Kuhn House',
      priority: 'high',
      category: 'Clubs',
      dueDate: '2026-08-28',
      sourceTag: 'OSU Honors',
      status: 'todo',
      notes: 'Location: Kuhn House Back Patio | Mix, mingle & sweet treats with fellow Scholars. RSVP for updates!'
    },
    {
      id: 'evt-oae-open-house',
      title: '🔬 OAE Open House (Undergrad Research & Fellowships)',
      priority: 'high',
      category: 'Career',
      dueDate: '2026-09-15',
      sourceTag: 'OSU Honors',
      status: 'todo',
      notes: '⏰ 4:00 PM - 6:00 PM | Location: Kuhn Honors & Scholars House (220 W 12th Ave) | Explore Undergrad Research, Fellowships & Service Learning!'
    },
    {
      id: 'evt-sports-society-welcome',
      title: '🍕 Sports & Society Welcome Event (Free Pizza + Press Box Giveaway)',
      priority: 'high',
      category: 'Clubs',
      dueDate: '2026-08-24',
      sourceTag: 'Campus Events',
      status: 'todo',
      notes: '⏰ 1:00 PM - 2:30 PM | Location: 106 Journalism Bldg | Free Pizza! Chance to win Press Box seats for OSU vs Ball State game Sept 5.'
    },
    {
      id: 'evt-aavgc-cookout',
      title: '🍔 AAVGC The Cookout @ St. Stephen\'s',
      priority: 'high',
      category: 'Clubs',
      dueDate: '2026-08-26',
      sourceTag: 'Campus Events',
      status: 'todo',
      notes: '⏰ 6:00 PM - 8:00 PM | Location: St. Stephen\'s Episcopal Church (30 W Woodruff Ave) | Music, drinks, food, games & prayer!'
    },
    {
      id: 'evt-engin-serve-info',
      title: '🛠️ EnginSERVE Info Night @ Ohio Union',
      priority: 'high',
      category: 'Career',
      dueDate: '2026-08-26',
      sourceTag: 'Engineering Events',
      status: 'todo',
      notes: '⏰ 8:00 PM - 9:00 PM | Location: Ohio Union (Barbie Tootle Room) | STEM outreach, service projects, networking & free snacks!'
    },
    {
      id: 'evt-bsa-cookout',
      title: '🏈 BSA Cookout @ Tuttle Park',
      priority: 'high',
      category: 'Clubs',
      dueDate: '2026-08-30',
      sourceTag: 'Campus Events',
      status: 'todo',
      notes: '⏰ 4:00 PM | Location: Tuttle Park | Black Student Association Cookout! Food, music, line dancing & vibes.'
    },
    {
      id: 'evt-grad-cafe',
      title: '☕ Grad Café @ Ohio Union (Free Coffee & Snacks)',
      priority: 'medium',
      category: 'Personal',
      dueDate: '2026-09-02',
      sourceTag: 'Campus Events',
      status: 'todo',
      notes: '⏰ 9:00 AM - 12:00 PM | Location: Ohio Union (Creative Arts Room) | Free coffee, tea & café snacks. Quiet study & work space.'
    }
  ],
  projects: [
    {
      id: 'project-arduino-smart-mirror',
      title: '🪞 Arduino Smart Mirror',
      description: 'Portfolio-grade hardware & software engineering project: An interactive smart mirror display powered by Arduino microcontrollers, sensors, and custom web UI widgets for calendar, time, and live feeds.',
      status: 'In Progress',
      progress: 35,
      deadline: '2026-10-15',
      category: 'Embedded Systems & Portfolio',
      tags: ['Arduino', 'Embedded Systems', 'C++', 'Hardware', 'Web UI'],
      tasksCount: 6,
      completedTasksCount: 2,
      notes: 'Main career portfolio project for Computer Science & Engineering.',
      resources: [
        { name: 'Arduino IDE & Libraries', url: 'https://www.arduino.cc' },
        { name: 'Parts & Components List', url: '#' }
      ],
      timeline: [
        { date: 'Aug 1', event: 'Source 2-Way Glass Mirror & Frame' },
        { date: 'Aug 15', event: 'Wire Arduino Microcontroller & Sensors' },
        { date: 'Sep 15', event: 'Mount LCD Panel behind 2-Way Glass' },
        { date: 'Oct 15', event: 'Flash C++ Code & Deploy Web UI Widgets' }
      ],
      milestoneGroups: [
        {
          id: 'grp-asm-1',
          title: 'Hardware & Electronics',
          items: [
            { id: 'asm-1', title: 'Source 2-way glass mirror and custom frame enclosure', completed: true },
            { id: 'asm-2', title: 'Wire Arduino microcontroller board, PIR motion sensors & power bus', completed: true },
            { id: 'asm-3', title: 'Mount LCD display panel behind 2-way glass', completed: false }
          ]
        },
        {
          id: 'grp-asm-2',
          title: 'Software, Firmware & Portfolio UI',
          items: [
            { id: 'asm-4', title: 'Write C++ microcontroller code for sensor inputs and sleep mode', completed: false },
            { id: 'asm-5', title: 'Develop custom web dashboard widgets (Clock, Weather, Google Calendar)', completed: false },
            { id: 'asm-6', title: 'Publish project write-up & demo video to tech portfolio', completed: false }
          ]
        }
      ]
    }
  ],
  goals: [
    {
      id: 'goal-internship-2027',
      title: '🎯 Land a 2027 Software Engineering Internship',
      horizon: 'semester',
      category: 'Career',
      deadline: '2026-12-01',
      notes: 'Primary career milestone for freshman year.',
      isExpanded: true,
      milestoneGroups: [
        {
          id: 'g-m-1',
          title: 'Career Milestones',
          items: [
            { id: 'g-item-1', title: 'Finalize tech resume & GitHub portfolio', completed: false },
            { id: 'g-item-2', title: 'Attend OSU Engineering Career Fair', completed: false }
          ]
        }
      ]
    },
    {
      id: 'goal-tech-setup',
      title: '🎯 Seamless Note & Tech System (Lenovo + iPad + OneNote)',
      horizon: 'semester',
      category: 'Personal',
      deadline: '2026-08-25',
      notes: 'Lenovo + iPad + OneNote + Power Planner + Google Calendar + Life OS integration.',
      isExpanded: true,
      milestoneGroups: [
        {
          id: 'g-m-2',
          title: 'Setup Milestones',
          items: [
            { id: 'g-item-3', title: 'Download & pair OneNote across Lenovo laptop and iPad', completed: false },
            { id: 'g-item-4', title: 'Sync Power Planner homework notifications', completed: false }
          ]
        }
      ]
    },
    {
      id: 'goal-financial-foundation',
      title: '🎯 Build Solid College Financial Foundation',
      horizon: 'long-term',
      category: 'Financial',
      deadline: '2027-05-01',
      notes: 'Maintain US Bank Checking, Capital One HYSA, and open Roth IRA upon turning 18.',
      isExpanded: true,
      milestoneGroups: [
        {
          id: 'g-m-3',
          title: 'Financial Targets',
          items: [
            { id: 'g-item-5', title: 'Set up Capital One High-Yield Savings Account', completed: false },
            { id: 'g-item-6', title: 'Set up US Bank Checking Account', completed: false },
            { id: 'g-item-7', title: 'Open Roth IRA account upon turning 18', completed: false }
          ]
        }
      ]
    }
  ],
  domains: [
    { id: 'dom-cs', name: 'Computer Science', icon: 'cpu', color: 'purple', description: 'Core theoretical and practical CS fundamentals' },
    { id: 'dom-prog', name: 'Programming', icon: 'code-2', color: 'blue', description: 'Programming languages, syntax, and software development' },
    { id: 'dom-web', name: 'Web Development', icon: 'globe', color: 'emerald', description: 'Frontend, backend, and full-stack web applications' },
    { id: 'dom-career', name: 'Career & Professional Development', icon: 'briefcase', color: 'indigo', description: 'Technical interview prep, resume building, and networking' }
  ],
  learning: [
    {
      id: 'learn-java',
      topic: 'Java & Object-Oriented Software',
      domain: 'Programming',
      status: 'In Progress',
      progress: 25,
      description: 'Java programming language used in OSU CSE 2221 (Software I).',
      notes: 'Focus on Components, XML parsing, JUnit testing, and OOP patterns.',
      practiceItems: [],
      resources: [],
      reflection: {}
    }
  ],
  finance: {
    incomeSources: [
      { id: 'inc-1', name: 'Summer Internship', amount: 1200, frequency: 'Monthly', notes: 'Current summer internship income' }
    ],
    categories: [
      { id: 'cat-1', name: '🍔 Food', allocated: 200, spent: 0 },
      { id: 'cat-2', name: '🛒 Shopping & Depop', allocated: 100, spent: 0 },
      { id: 'cat-3', name: '🚗 Transportation', allocated: 50, spent: 0 },
      { id: 'cat-4', name: '📚 School', allocated: 150, spent: 0 },
      { id: 'cat-5', name: '🏠 Dorm / Housing', allocated: 0, spent: 0 },
      { id: 'cat-6', name: '💻 Tech & Smart Mirror', allocated: 100, spent: 0 },
      { id: 'cat-7', name: '🎮 Entertainment & Events', allocated: 100, spent: 0 },
      { id: 'cat-8', name: '🎁 Gifts', allocated: 30, spent: 0 },
      { id: 'cat-9', name: '💊 Health', allocated: 30, spent: 0 },
      { id: 'cat-10', name: '💰 HYSA & Roth Savings', allocated: 440, spent: 0 }
    ],
    accounts: {
      checking: 0,
      savings: 0,
      rothIra: 0
    },
    scholarships: [],
    subscriptions: [],
    bigPurchases: [
      {
        id: 'bp-smart-mirror',
        name: 'Arduino Smart Mirror Parts (Arduino Microcontroller, Sensors, 2-Way Glass, Frame)',
        cost: 250,
        saved: 150,
        date: '2026-10-01',
        priority: 'High',
        notes: 'Hardware components for the Arduino Smart Mirror portfolio project.'
      },
      {
        id: 'bp-capital-one',
        name: 'Capital One High-Yield Savings Account (HYSA)',
        cost: 1000,
        saved: 0,
        date: '2026-09-01',
        priority: 'High',
        notes: 'High-yield interest savings account for college emergency fund.'
      },
      {
        id: 'bp-us-bank',
        name: 'US Bank Checking Account',
        cost: 500,
        saved: 0,
        date: '2026-08-15',
        priority: 'High',
        notes: 'Primary checking account for student living expenses.'
      },
      {
        id: 'bp-roth-ira',
        name: 'Open Roth IRA Account (Turning 18 Target)',
        cost: 1000,
        saved: 0,
        date: '2026-12-31',
        priority: 'Medium',
        notes: 'Long-term retirement index fund investment account to open upon turning 18.'
      }
    ],
    collapsedSections: {
      income: false,
      categories: false,
      savings: false,
      scholarships: false,
      subscriptions: false,
      bigPurchases: false
    }
  },
  wishlist: [],
  journal: [],
  resources: [
    {
      id: 'res-buckeyelink',
      title: 'BuckeyeLink Student Center',
      category: 'OSU Academic',
      url: 'https://buckeyelink.osu.edu',
      description: 'OSU course registration, financial aid, tuition, and grades portal.',
      tags: ['classes', 'registration', 'tuition', 'grades', 'financial aid'],
      isPinned: true,
      isFavorite: true
    },
    {
      id: 'res-carmen',
      title: 'Carmen Canvas LMS',
      category: 'OSU Academic',
      url: 'https://carmen.osu.edu',
      description: 'Official OSU course website for assignments, lectures, and grades.',
      tags: ['carmen', 'canvas', 'assignments', 'homework', 'syllabus', 'classes'],
      isPinned: true,
      isFavorite: true
    },
    {
      id: 'res-email',
      title: 'OSU Outlook Webmail',
      category: 'OSU Academic',
      url: 'https://email.osu.edu',
      description: 'Official Ohio State Microsoft 365 student email inbox.',
      tags: ['email', 'mail', 'outlook', 'buckeye mail', 'messages'],
      isPinned: true,
      isFavorite: true
    },
    {
      id: 'res-onenote',
      title: 'Microsoft OneNote Web App',
      category: 'Tech & Notes',
      url: 'https://onenote.com',
      description: 'Digital notebook for lecture notes synced across Lenovo laptop & iPad.',
      tags: ['onenote', 'notes', 'ipad', 'lenovo', 'lecture notes'],
      isPinned: true,
      isFavorite: true
    }
  ],
  quickCapture: [],
  stickyNote: '🎯 Priority: Arduino Smart Mirror build, Lollapalooza Friday makeup, LinkedIn internship post next week, & email Chris Bork re: research!'
};
