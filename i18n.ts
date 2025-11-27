import { useContext } from 'react';
import { AppContext } from './components/AppContext';
import { Language, LearningPath, FeedbackType, LessonContent } from './types';
import { BADGES } from './constants';

export type Translation = {
  onboarding: {
    welcome: {
      title: string;
      subtitle: string;
      consumerTitle: string;
      consumerParagraph: string;
      creatorTitle: string;
      creatorParagraph: string;
      ctaButton: string;
    };
    roleSelection: {
      title: string;
      description: string;
      student: string;
      studentDescription: string;
      teacher: string;
      teacherDescription: string;
      parent: string;
      parentDescription: string;
    };
    createClass: {
        title: string;
        description: string;
        placeholder: string;
        ctaButton: string;
        successMessage: string;
    };
    linkChild: {
        title: string;
        description: string;
        placeholder: string;
        ctaButton: string;
        successMessage: string;
    };
    skipButton: string;
    ctaButton: string;
    signInButton: string;
    signUpButton: string;
    pathAssignedTitle: string;
    pathAssignedDescription: string;
    signInTitle: string;
    signUpTitle: string;
    emailPlaceholder: string;
    namePlaceholder: string;
    switchToSignUp: string;
    switchToSignIn: string;
    errorUserNotFound: string;
    errorUserExists: string;
    errorGeneric: string;
  };
  dashboard: {
    greeting: (name: string) => string;
    subGreeting: string;
    subGreetingParent: string;
    progressTitle: string;
    progressDescription: (completed: number, total: number) => string;
    continueLearningButton: string;
    allModulesCompleted: string;
    multiplayerTitle: string;
    multiplayerDescription: string;
    gameTitle: string;
    gameDescription: string;
    profileTitle: string;
    profileDescription: string;
    leaderboardTitle: string;
    leaderboardDescription: string;
    walletTitle: string;
    walletDescription: string;
    glossaryTitle: string;
    glossaryDescription: string;
    podcastGeneratorTitle: string;
    podcastGeneratorDescription: string;
    careerExplorerTitle: string;
    careerExplorerDescription: string;
    creationStudioTitle: string;
    creationStudioDescription: string;
    myPortfolioTitle: string;
    myPortfolioDescription: string;
    learningPathTitle: string;
    learningPathLevels: string[];
  };
  aiTutor: {
    title: string;
    description: string;
    welcomeMessage: string;
    inputPlaceholder: string;
    systemInstruction: string;
    errorMessage: string;
  };
  teacherDashboard: {
    greeting: (name: string) => string;
    subGreeting: string;
    classManagementTitle: string;
    classManagementDescription: string;
    resourceHubTitle: string;
    resourceHubDescription: string;
    reviewCurriculumTitle: string;
    reviewCurriculumDescription: string;
    myClasses: string;
    noClasses: string;
    createClass: string;
    studentsCount: (count: number) => string;
    viewProgress: string;
    joinCode: string;
  };
  parentDashboard: {
    greeting: (name: string) => string;
    subGreeting: string;
    childProgressTitle: (name: string) => string;
    currentPath: string;
    modulesCompleted: string;
    pointsEarned: string;
    parentsGuideTitle: string;
    parentsGuideDescription: string;
    familySettingsTitle: string;
    familySettingsDescription: string;
    learningFocusTitle: string;
    linkChildTitle: string;
    linkChildDescription: string;
    linkChildInputPlaceholder: string;
    linkChildButton: string;
    linking: string;
    childNotFound: string;
    childAlreadyLinked: string;
  };
  parentGuideModal: {
    title: string;
    description: string;
    tip1Title: string;
    tip1Content: string;
    tip2Title: string;
    tip2Content: string;
    tip3Title: string;
    tip3Content: string;
  };
  createClassModal: {
    title: string;
    description: string;
    classNameLabel: string;
    classNamePlaceholder: string;
    createButton: string;
    creatingButton: string;
  };
  classDetailsModal: {
    title: (className: string) => string;
    studentsTab: string;
    assignmentsTab: string;
    noStudents: string;
    moduleProgress: (completed: number, total: number) => string;
    assignModules: string;
    saveAssignments: string;
    saving: string;
  };
  peerPractice: {
    title: string;
    description: string;
    createSession: string;
    creating: string;
    joinSession: string;
    joining: string;
    sessionCodePlaceholder: string;
    lobbyTitle: string;
    shareCode: string;
    copied: string;
    players: string;
    waitingForHost: string;
    waitingForPlayers: string;
    startPractice: string;
    starting: string;
    question: (current: number, total: number) => string;
    progress: string;
    practiceComplete: string;
    practiceAgain: string;
    exit: string;
    errorNotFound: string;
    errorAlreadyStarted: string;
    errorFull: string;
    errorGeneric: string;
  };
  game: {
    title: string;
    description: string;
    correct: string;
    incorrect: string;
    writtenBy: (author: string) => string;
    aiAuthor: string;
    humanAuthor: string;
    humanButton: string;
    aiButton: string;
    playAgainButton: string;
    difficulty: string;
    easy: string;
    hard: string;
    pointDescription: string;
  };
  profile: {
    title: string;
    description: string;
    learnerLevel: (level: LearningPath) => string;
    points: string;
    progressTitle: string;
    progressDescription: (completed: number, total: number) => string;
    badgesTitle: string;
    noBadges: string;
    certificatesTitle: string;
    moreCertificates: string;
    certificateTitleSingle: string;
    certificateFor: string;
    certificateCourseName: string;
    certificateCompletedOn: (date: string) => string;
    certificateId: string;
    certificateIssuedBy: (orgName: string) => string;
    downloadButton: string;
    shareButton: string;
    feedbackButton: string;
    multiplayerStatsTitle: string;
    wins: string;
    gamesPlayed: string;
    viewWallet: string;
    learningPathTitle: string;
    changePath: string;
    changePathConfirmTitle: string;
    changePathConfirmMessage: string;
  };
  lesson: {
    startQuizButton: string;
    completeLessonButton: string;
    returnToDashboardButton: string;
    quizTitle: string;
    quizCorrect: (points: number) => string;
    quizIncorrect: string;
    nextQuestionButton: string;
    tryAgainButton: string;
    completionModalTitle: string;
    completionModalPoints: (points: number) => string;
    badgeUnlocked: string;
    quizStreak: (streak: number) => string;
    submitAnswer: string;
    yourAnswer: string;
    readAloud: string;
    scenarioChallenge: string;
  };
  leaderboard: {
    title: string;
    description: string;
    rank: string;
    player: string;
    points: string;
    you: string;
  };
  wallet: {
    title: string;
    description: string;
    currentBalance: string;
    history: string;
    send: string;
    marketplace: string;
    sendPoints: string;
    sendTo: string;
    recipientEmail: string;
    amount: string;
    messageOptional: string;
    messagePlaceholder: string;
    sendButton: string;
    sending: string;
    dailyLimit: (amount: number, limit: number) => string;
    insufficientPoints: string;
    userNotFound: string;
    sendSuccess: (amount: number, name: string) => string;
    sendError: string;
    confirmationTitle: string;
    confirmationSend: (amount: number, name: string) => string;
    confirmationSpend: (amount: number, item: string) => string;
    confirm: string;
    noTransactions: string;
    topUp: {
        title: string;
        description: string;
        tabLabel: string;
        buyButton: string;
        confirmPurchase: (points: number, price: string) => string;
        purchaseSuccess: (points: number) => string;
        transactionDescription: (points: number) => string;
    };
  };
  marketplace: {
    title: string;
    description: string;
    categories: {
        Recognition: string;
        Customization: string;
        'Learning Boosters': string;
        'Social Play': string;
        'Future Perks': string;
    };
    redeem: string;
    redeeming: string;
    owned: string;
    comingSoon: string;
    redeemSuccess: (item: string) => string;
    redeemError: string;
  };
  header: {
    profile: string;
    logout: string;
    settings: string;
  };
  common: {
    backToDashboard: string;
    footer: (year: number) => string;
    pointsAbbr: string;
    save: string;
    cancel: string;
    submit: string;
    close: string;
  };
  feedback: {
    title: string;
    description: string;
    typeLabel: string;
    types: {
      [key in FeedbackType]: string;
    };
    messageLabel: string;
    messagePlaceholder: string;
    submitting: string;
    successTitle: string;
    successDescription: string;
  };
  settings: {
    title: string;
    voiceMode: string;
    voiceModeDescription: string;
  };
  offline: {
    download: string;
    downloaded: string;
    downloading: string;
    offlineIndicator: string;
    onlineIndicator: string;
    syncing: string;
    notAvailable: string;
  };
  voice: {
    listening: string;
    voiceModeActive: string;
    navigatingTo: {
      dashboard: string;
      profile: string;
      leaderboard: string;
      game: string;
      peerPractice: string;
      wallet: string;
    },
    startingModule: (moduleName: string) => string;
    openingSettings: string;
    closingSettings: string;
    loggingOut: string;
  };
  glossary: {
    title: string;
    description: string;
    searchPlaceholder: string;
    noResultsTitle: string;
    noResultsDescription: (term: string) => string;
  };
  podcastGenerator: {
    title: string;
    description: string;
    scriptLabel: string;
    scriptPlaceholder: string;
    voiceLabel: string;
    voices: {
        kore: string;
        puck: string;
    },
    generateButton: string;
    generatingButton: string;
    yourCreation: string;
    errorMessage: string;
  };
  careerExplorer: {
    title: string;
    description: string;
    whatTheyDo: string;
    skillsNeeded: string;
    dayInTheLife: string;
    relevantLessons: string;
    startLearning: string;
    careers: Record<string, {
      title: string;
      description: string;
      what_they_do: string;
      skills: string[];
      day_in_the_life: string;
    }>;
  };
  creationStudio: {
    title: string;
    description: string;
    selectTemplate: string;
    createButton: string;
    creatingButton: string;
    outputTitle: string;
    canvasPlaceholder: string;
    pointDescription: (templateName: string) => string;
    pointsAwarded: string;
    errorMessage: string;
    systemInstruction: string;
    templates: Record<string, {
        title: string;
        description: string;
        inputLabel: string;
        placeholder: string;
    }>;
    refinementActions: {
      longer: string;
      shorter: string;
      funnier: string;
      moreSerious: string;
      tryAgain: string;
    };
    creatorTools: {
      changeStyle: string;
      downloadImage: string;
    }
  };
  studentPortfolio: {
    title: string;
    description: string;
    downloadButton: string;
    generating: string;
    completedModules: string;
    badgesEarned: string;
  };
  proPlan: {
    badge: string;
    modalTitle: (featureName: string) => string;
    modalDescription: string;
    unlockButton: (cost: number) => string;
    unlocking: string;
    feature1: string;
    feature2: string;
    feature3: string;
    feature4: string;
    successTitle: string;
    successDescription: string;
    transactionDescription: string;
    confirmationMessage: (cost: number) => string;
    insufficientPoints: string;
    error: string;
  };
  curriculum: Record<string, { title: string; description: string; lessonContent: LessonContent }>;
  tooltips: Record<string, string>;
  paths: Record<string, { name: string; description: string }>;
  badges: Record<string, { name: string; description: string }>;
};

export const englishTranslations: Translation = {
  onboarding: {
    welcome: {
      title: "Welcome to AI Paddi",
      subtitle: "Your journey to understanding Artificial Intelligence starts here.",
      consumerTitle: "For Learners",
      consumerParagraph: "Learn how to use AI tools safely and effectively.",
      creatorTitle: "For Creators",
      creatorParagraph: "Discover how to build and create with AI technology.",
      ctaButton: "Get Started",
    },
    roleSelection: {
      title: "Who are you?",
      description: "Select your role to get a personalized experience.",
      student: "Student",
      studentDescription: "I want to learn about AI.",
      teacher: "Teacher",
      teacherDescription: "I want to teach AI to my class.",
      parent: "Parent",
      parentDescription: "I want to help my child learn.",
    },
    createClass: {
        title: "Create Your First Class",
        description: "Let's set up a space for your students.",
        placeholder: "e.g., JSS 2 Computer Science",
        ctaButton: "Create Class",
        successMessage: "Class Created!",
    },
    linkChild: {
        title: "Link Child Account",
        description: "Connect to your child's account to track their progress.",
        placeholder: "Enter child's email address",
        ctaButton: "Link Account",
        successMessage: "Account Linked!",
    },
    skipButton: "Skip for now",
    ctaButton: "Start Learning",
    signInButton: "Sign In",
    signUpButton: "Sign Up",
    pathAssignedTitle: "Learning Path Assigned!",
    pathAssignedDescription: "Based on your choice, we've selected the perfect modules for you.",
    signInTitle: "Sign In",
    signUpTitle: "Create Account",
    emailPlaceholder: "Email Address",
    namePlaceholder: "Full Name",
    switchToSignUp: "New here? Create an account",
    switchToSignIn: "Already have an account? Sign In",
    errorUserNotFound: "User not found.",
    errorUserExists: "User with this email already exists.",
    errorGeneric: "Something went wrong. Please try again.",
  },
  dashboard: {
    greeting: (name) => `Hello, ${name}!`,
    subGreeting: "Ready to continue your AI journey?",
    subGreetingParent: "Here is an overview of your family's progress.",
    progressTitle: "Your Progress",
    progressDescription: (completed, total) => `You've completed ${completed} out of ${total} modules.`,
    continueLearningButton: "Continue Learning",
    allModulesCompleted: "All Modules Completed!",
    multiplayerTitle: "Peer Practice",
    multiplayerDescription: "Compete with friends in live quizzes.",
    gameTitle: "AI vs Human",
    gameDescription: "Can you spot the difference?",
    profileTitle: "Profile",
    profileDescription: "View your badges and certificates.",
    leaderboardTitle: "Leaderboard",
    leaderboardDescription: "See top learners this week.",
    walletTitle: "Wallet",
    walletDescription: "Manage your points and rewards.",
    glossaryTitle: "AI Glossary",
    glossaryDescription: "Understand key terms.",
    podcastGeneratorTitle: "Podcast Generator",
    podcastGeneratorDescription: "Create AI audio content.",
    careerExplorerTitle: "Career Explorer",
    careerExplorerDescription: "Discover AI jobs.",
    creationStudioTitle: "Creation Studio",
    creationStudioDescription: "Create with AI.",
    myPortfolioTitle: "My Portfolio",
    myPortfolioDescription: "Showcase your work.",
    learningPathTitle: "Your Learning Path",
    learningPathLevels: ["Foundation", "Core Concepts", "Application & Impact"],
  },
  aiTutor: {
    title: "AI Tutor",
    description: "Ask questions and get personalized help.",
    welcomeMessage: "Hello! I'm your AI Tutor. How can I help you understand AI today?",
    inputPlaceholder: "Ask me anything...",
    systemInstruction: "You are a helpful and friendly AI Tutor for students learning about Artificial Intelligence. Explain concepts simply, use analogies, and be encouraging. Keep answers concise.",
    errorMessage: "I'm having trouble connecting. Please try again later.",
  },
  teacherDashboard: {
    greeting: (name) => `Welcome, Teacher ${name}!`,
    subGreeting: "Manage your classes and resources.",
    classManagementTitle: "Class Management",
    classManagementDescription: "View and manage your students.",
    resourceHubTitle: "Resource Hub",
    resourceHubDescription: "Find lesson plans and guides.",
    reviewCurriculumTitle: "Review Curriculum",
    reviewCurriculumDescription: "Explore the lesson content.",
    myClasses: "My Classes",
    noClasses: "You haven't created any classes yet.",
    createClass: "Create Class",
    studentsCount: (count) => `${count} Student${count !== 1 ? 's' : ''}`,
    viewProgress: "View Progress",
    joinCode: "Join Code",
  },
  parentDashboard: {
    greeting: (name) => `Welcome, ${name}`,
    subGreeting: "Monitor and support your child's learning.",
    childProgressTitle: (name) => `${name}'s Progress`,
    currentPath: "Current Path",
    modulesCompleted: "Modules Completed",
    pointsEarned: "Points Earned",
    parentsGuideTitle: "Parent's Guide",
    parentsGuideDescription: "Tips for supporting AI literacy.",
    familySettingsTitle: "Family Settings",
    familySettingsDescription: "Manage accounts and permissions.",
    learningFocusTitle: "Current Learning Focus",
    linkChildTitle: "Link Child Account",
    linkChildDescription: "Enter your child's email to connect their account.",
    linkChildInputPlaceholder: "Child's Email Address",
    linkChildButton: "Link Account",
    linking: "Linking...",
    childNotFound: "Child account not found.",
    childAlreadyLinked: "Child account already linked.",
  },
  parentGuideModal: {
    title: "Parent's Guide to AI Literacy",
    description: "How to help your child navigate the world of AI.",
    tip1Title: "Start Conversations",
    tip1Content: "Ask your child what they think about AI. Discuss how it's used in apps they like.",
    tip2Title: "Encourage Critical Thinking",
    tip2Content: "Remind them that AI can make mistakes. Encourage them to verify information.",
    tip3Title: "Explore Together",
    tip3Content: "Use AI tools together. Try generating a story or an image as a family activity.",
  },
  createClassModal: {
    title: "Create New Class",
    description: "Enter a name for your new class.",
    classNameLabel: "Class Name",
    classNamePlaceholder: "e.g., Grade 5 Science",
    createButton: "Create Class",
    creatingButton: "Creating...",
  },
  classDetailsModal: {
    title: (className) => `Class: ${className}`,
    studentsTab: "Students",
    assignmentsTab: "Assignments",
    noStudents: "No students have joined yet.",
    moduleProgress: (completed, total) => `${completed}/${total} Modules`,
    assignModules: "Assign Modules to Class",
    saveAssignments: "Save Assignments",
    saving: "Saving...",
  },
  peerPractice: {
    title: "Peer-to-Peer Practice",
    description: "Challenge your friends to a real-time quiz battle!",
    createSession: "Create Session",
    creating: "Creating...",
    joinSession: "Join Session",
    joining: "Joining...",
    sessionCodePlaceholder: "ENTER CODE",
    lobbyTitle: "Waiting Lobby",
    shareCode: "Share this code with your friends:",
    copied: "Copied!",
    players: "Players",
    waitingForHost: "Waiting for host to start...",
    waitingForPlayers: "Waiting for players...",
    startPractice: "Start Practice",
    starting: "Starting...",
    question: (current, total) => `Question ${current} of ${total}`,
    progress: "Progress",
    practiceComplete: "Practice Complete!",
    practiceAgain: "Play Again",
    exit: "Exit",
    errorNotFound: "Session not found.",
    errorAlreadyStarted: "Session already started.",
    errorFull: "Session is full.",
    errorGeneric: "Something went wrong.",
  },
  game: {
    title: "AI vs Human",
    description: "Can you tell if a proverb was written by an AI or a Human?",
    correct: "Correct!",
    incorrect: "Incorrect!",
    writtenBy: (author) => `Written by: ${author}`,
    aiAuthor: "AI",
    humanAuthor: "Human",
    humanButton: "Human",
    aiButton: "AI",
    playAgainButton: "Play Again",
    difficulty: "Difficulty",
    easy: "Easy",
    hard: "Hard",
    pointDescription: "AI vs Human Win",
  },
  profile: {
    title: "My Profile",
    description: "Track your achievements and progress.",
    learnerLevel: (level) => `${level} Level`,
    points: "Points",
    progressTitle: "My Progress",
    progressDescription: (completed, total) => `You've completed ${completed} out of ${total} modules.`,
    badgesTitle: "Badges",
    noBadges: "No badges earned yet. Keep learning!",
    certificatesTitle: "Certificates",
    moreCertificates: "Complete all modules to earn your certificate.",
    certificateTitleSingle: "Certificate of Completion",
    certificateFor: "This certifies that",
    certificateCourseName: "has successfully completed the AI Literacy Course",
    certificateCompletedOn: (date) => `Completed on ${date}`,
    certificateId: "Certificate ID",
    certificateIssuedBy: (org) => `Issued by ${org}`,
    downloadButton: "Download",
    shareButton: "Share",
    feedbackButton: "Give Feedback",
    multiplayerStatsTitle: "Multiplayer Stats",
    wins: "Wins",
    gamesPlayed: "Games Played",
    viewWallet: "View Wallet",
    learningPathTitle: "Learning Path",
    changePath: "Change Path",
    changePathConfirmTitle: "Change Learning Path?",
    changePathConfirmMessage: "Changing your path will reset your current progress for this path. Are you sure?",
  },
  lesson: {
    startQuizButton: "Take the Challenge",
    completeLessonButton: "Complete Lesson",
    returnToDashboardButton: "Return to Dashboard",
    quizTitle: "Knowledge Check",
    quizCorrect: (points) => `Correct! +${points} Points`,
    quizIncorrect: "Not quite. Try again!",
    nextQuestionButton: "Next Question",
    tryAgainButton: "Try Again",
    completionModalTitle: "Lesson Completed!",
    completionModalPoints: (points) => `You earned ${points} Points!`,
    badgeUnlocked: "New Badge Unlocked!",
    quizStreak: (streak) => `${streak}x Streak!`,
    submitAnswer: "Submit",
    yourAnswer: "Your Answer",
    readAloud: "Read Aloud",
    scenarioChallenge: "Scenario Challenge",
  },
  leaderboard: {
    title: "Leaderboard",
    description: "See who's leading the learning race this week.",
    rank: "Rank",
    player: "Player",
    points: "Points",
    you: "You",
  },
  wallet: {
    title: "My Wallet",
    description: "Manage your points and redeem rewards.",
    currentBalance: "Current Balance",
    history: "History",
    send: "Send Points",
    marketplace: "Marketplace",
    sendPoints: "Send Points",
    sendTo: "Send to",
    recipientEmail: "Recipient's Email",
    amount: "Amount",
    messageOptional: "Message (Optional)",
    messagePlaceholder: "e.g., Great job!",
    sendButton: "Send Points",
    sending: "Sending...",
    dailyLimit: (used, limit) => `Daily Limit: ${used}/${limit}`,
    insufficientPoints: "Insufficient points.",
    userNotFound: "User not found.",
    sendSuccess: (amount, email) => `Sent ${amount} points to ${email}!`,
    sendError: "Failed to send points.",
    confirmationTitle: "Confirm Transaction",
    confirmationSend: (amount, name) => `Send ${amount} points to ${name}?`,
    confirmationSpend: (amount, item) => `Spend ${amount} points on "${item}"?`,
    confirm: "Confirm",
    noTransactions: "No transactions yet.",
    topUp: {
        title: "Top Up",
        description: "Buy more points.",
        tabLabel: "Top Up",
        buyButton: "Buy",
        confirmPurchase: (points, price) => `Buy ${points} points for ${price}?`,
        purchaseSuccess: (points) => `Purchased ${points} points!`,
        transactionDescription: (points) => `Purchased ${points} points`,
    },
  },
  marketplace: {
    title: "Marketplace",
    description: "Redeem your points for cool items.",
    categories: {
        Recognition: "Recognition",
        Customization: "Customization",
        'Learning Boosters': "Boosters",
        'Social Play': "Social",
        'Future Perks': "Future Perks",
    },
    redeem: "Redeem",
    redeeming: "Redeeming...",
    owned: "Owned",
    comingSoon: "Coming Soon",
    redeemSuccess: (item) => `Redeemed ${item}!`,
    redeemError: "Failed to redeem item.",
  },
  header: {
    profile: "Profile",
    logout: "Log Out",
    settings: "Settings",
  },
  common: {
    backToDashboard: "Back to Dashboard",
    footer: (year) => `© ${year} AI Paddi. All rights reserved.`,
    pointsAbbr: "pts",
    save: "Save",
    cancel: "Cancel",
    submit: "Submit",
    close: "Close",
  },
  feedback: {
    title: "Send Feedback",
    description: "Let us know how we can improve.",
    typeLabel: "Feedback Type",
    types: {
      [FeedbackType.Bug]: "Report a Bug",
      [FeedbackType.Suggestion]: "Make a Suggestion",
      [FeedbackType.General]: "General Feedback",
    },
    messageLabel: "Message",
    messagePlaceholder: "Tell us more...",
    submitting: "Sending...",
    successTitle: "Feedback Sent",
    successDescription: "Thank you for your feedback!",
  },
  settings: {
    title: "Settings",
    voiceMode: "Voice-First Mode",
    voiceModeDescription: "Navigate the app using voice commands.",
  },
  offline: {
    download: "Download",
    downloaded: "Downloaded",
    downloading: "Downloading...",
    offlineIndicator: "You are offline",
    onlineIndicator: "You are online",
    syncing: "Syncing...",
    notAvailable: "Content not available offline.",
  },
  voice: {
    listening: "Listening...",
    voiceModeActive: "Voice Mode Active",
    navigatingTo: {
      dashboard: "Going to Dashboard",
      profile: "Going to Profile",
      leaderboard: "Going to Leaderboard",
      game: "Going to Game",
      peerPractice: "Going to Peer Practice",
      wallet: "Going to Wallet",
    },
    startingModule: (name) => `Starting module: ${name}`,
    openingSettings: "Opening Settings",
    closingSettings: "Closing Settings",
    loggingOut: "Logging out...",
  },
  glossary: {
    title: "AI Glossary",
    description: "A simple dictionary for all the important AI terms you'll encounter on your journey.",
    searchPlaceholder: "Search for a term (e.g., Algorithm)",
    noResultsTitle: "No Results Found",
    noResultsDescription: (term) => `We couldn't find any terms matching "${term}".`,
  },
  podcastGenerator: {
    title: "Podcast Generator",
    description: "Bring your words to life! Type a script, choose a voice, and generate a short audio clip.",
    scriptLabel: "Your Script",
    scriptPlaceholder: "Type something here... for example, 'Hello everyone, welcome to the first episode of AI Paddi Radio!'",
    voiceLabel: "Choose a Voice",
    voices: {
        kore: "Kore (Female)",
        puck: "Puck (Male)",
    },
    generateButton: "Generate Audio",
    generatingButton: "Generating...",
    yourCreation: "Your Creation",
    errorMessage: "Sorry, we couldn't generate the audio. Please try again.",
  },
  careerExplorer: {
    title: "AI Career Explorer",
    description: "See how AI is creating new jobs and changing existing ones right here in Africa.",
    whatTheyDo: "What They Do",
    skillsNeeded: "Skills Needed",
    dayInTheLife: "A Day in the Life",
    relevantLessons: "Relevant Lessons",
    startLearning: "Start Lesson",
    careers: {
      'agritech-specialist': {
        title: "AgriTech AI Specialist",
        description: "Helps farmers use AI to improve crop yields and manage resources.",
        what_they_do: "They use drones and AI software to analyze soil health, predict weather patterns, and detect crop diseases early. They help make farming more efficient and sustainable.",
        skills: ["Data Analysis", "Problem Solving", "Agriculture Knowledge", "Communication"],
        day_in_the_life: "I might spend my morning analyzing drone imagery to identify a pest outbreak on a farm, then in the afternoon, I'll meet with local farmers to explain how our new AI-powered app can help them predict rainfall.",
      },
      'fintech-ml-engineer': {
        title: "FinTech ML Engineer",
        description: "Builds AI systems for mobile money apps and digital banks.",
        what_they_do: "They create machine learning models to detect fraudulent transactions, provide personalized loan recommendations, and power customer service chatbots for financial companies.",
        skills: ["Programming (Python)", "Machine Learning", "Statistics", "Cybersecurity Basics"],
        day_in_the_life: "Today, I'm training a new model to better detect fake payment alerts. I'm using thousands of data points to teach the AI what a real transaction looks like versus a fraudulent one.",
      },
      'ai-content-creator': {
        title: "AI Content Creator",
        description: "Uses AI tools to create engaging videos, articles, and social media content.",
        what_they_do: "They master tools like ChatGPT for writing scripts, Midjourney for creating images, and other AI software to produce high-quality content faster. They blend creativity with technology.",
        skills: ["Prompt Engineering", "Creativity", "Storytelling", "Digital Marketing"],
        day_in_the_life: "I'm generating images of futuristic African cities for a client's music video. I'm giving the AI very specific prompts to get the exact style I need, then I'll use another AI tool to animate them.",
      },
      'ai-ethicist': {
        title: "AI Ethicist",
        description: "Works to ensure that AI systems are fair, safe, and beneficial for everyone.",
        what_they_do: "They advise companies and governments on the social impact of AI. They study AI models to find hidden biases and recommend ways to make them more transparent and accountable.",
        skills: ["Critical Thinking", "Ethics", "Communication", "Policy Knowledge"],
        day_in_the_life: "I'm reviewing an AI system used for job hiring to make sure it's not unfairly biased against candidates from certain regions or backgrounds. I'll write a report with my findings and suggest improvements.",
      }
    }
  },
  creationStudio: {
    title: "Creation Studio",
    description: "This is your sandbox! Choose a template, give the AI a topic, and see what you can create together.",
    selectTemplate: "1. Select a Template",
    createButton: "Create",
    creatingButton: "Creating...",
    outputTitle: "Your Creation",
    canvasPlaceholder: "Your AI creation will appear here...",
    pointDescription: (templateName) => `Used Creation Studio: ${templateName}`,
    pointsAwarded: "+5 Points!",
    errorMessage: "I'm sorry, I couldn't generate that. Please try a different idea.",
    systemInstruction: "You are a helpful and creative AI assistant for the AI Paddi app. Your goal is to help users create simple, positive, and educational content in various languages spoken in Africa, like English, Nigerian Pidgin, Hausa, Yoruba, and Igbo. You must strictly follow the user's prompt format (e.g., 'Write a four-line poem'). Keep responses short and to the point. The content should be safe, respectful, and encouraging for a young audience.",
    templates: {
        poem: {
            title: "Poem",
            description: "Create a short and sweet poem.",
            inputLabel: "2. What is your poem about?",
            placeholder: "e.g., a busy market in Lagos, the stars in the night sky...",
        },
        story: {
            title: "Story Starter",
            description: "Get the beginning of a new story.",
            inputLabel: "2. What is your story about?",
            placeholder: "e.g., a girl who can talk to animals, a magical talking drum...",
        },
        proverb: {
            title: "Modern Proverb",
            description: "Invent a new proverb for today's world.",
            inputLabel: "2. What is your proverb about?",
            placeholder: "e.g., smartphones, social media, online learning...",
        },
    },
    refinementActions: {
      longer: "Make it longer",
      shorter: "Make it shorter",
      funnier: "Make it funnier",
      moreSerious: "Make it more serious",
      tryAgain: "Try Again",
    },
    creatorTools: {
      changeStyle: "Change Style",
      downloadImage: "Download as Image",
    }
  },
  studentPortfolio: {
    title: "My Student Portfolio",
    description: "Generate a simple, shareable image that summarizes your achievements in the AI Paddi app.",
    downloadButton: "Download Portfolio",
    generating: "Generating...",
    completedModules: "Completed Modules",
    badgesEarned: "Badges Earned",
  },
  proPlan: {
    badge: 'PRO',
    modalTitle: (featureName) => `Unlock ${featureName} with AI Paddi Pro!`,
    modalDescription: 'Our Pro plan gives you unlimited access to our most powerful creation and learning tools. This is a simulation to teach you about premium app features!',
    unlockButton: (cost) => `Upgrade for ${cost} Points`,
    unlocking: 'Unlocking Pro...',
    feature1: 'Generate stories, poems, and more in the Creation Studio.',
    feature2: 'Get personalized help from the AI Tutor.',
    feature3: 'Create your own audio with the Podcast Generator.',
    feature4: 'Explore future careers in AI.',
    successTitle: 'Welcome to Pro!',
    successDescription: 'You now have access to all premium features. Happy creating!',
    transactionDescription: 'Upgrade to AI Paddi Pro Plan',
    confirmationMessage: (cost) => `Are you sure you want to spend ${cost} points to unlock the AI Paddi Pro plan? This is permanent.`,
    insufficientPoints: "You don't have enough points to upgrade yet. Keep learning to earn more!",
    error: "Something went wrong. Please try again.",
  },
  curriculum: {
    'what-is-ai': {
      title: 'What is AI?',
      description: 'Learn the basic meaning of Artificial Intelligence and what makes it different from normal technology.',
      lessonContent: {
        title: 'What is Artificial Intelligence?',
        introduction: "Have you ever wondered how your phone can understand your voice, or how a game can have computer players that seem smart? The answer is Artificial Intelligence, or AI for short. Let's find out what it really is!",
        sections: [
          {
            heading: 'Thinking Like a Human',
            content: "At its core, AI is about making computers think and learn like humans. It's not just about following instructions like a calculator. It's about recognizing patterns, making decisions, and solving problems. Imagine you're teaching a little child to recognize a cat. You show them many pictures of cats. Soon, they can see a new cat and say 'cat!'. AI learns in a very similar way."
          },
          {
            heading: 'Not Magic, Just Maths!',
            content: "AI might seem like magic, but it's really built on maths and data. Data is just information, like a huge collection of pictures, words, or numbers. Scientists, called AI engineers, write special instructions (algorithms) that allow a computer to 'learn' from this data. The more data the computer sees, the smarter it gets at a specific task, like understanding your language or recommending a video for you to watch."
          },
          {
            heading: 'Two Types of AI',
            content: "There are two main ideas to know. 'Narrow AI' is what we have today. It's very good at ONE specific task, like playing chess or translating languages. 'General AI' is the idea of an AI that could do any task a human can, like a robot from a movie. We are still very, very far from creating General AI."
          }
        ],
        summary: "AI is the science of making computers smart enough to perform tasks that normally require human intelligence, like learning, reasoning, and understanding language. It learns from data and is getting better every day.",
        quiz: {
          questions: [
            {
              type: 'multiple-choice',
              question: 'What is the main goal of AI?',
              options: ['To make computers faster', 'To make computers think and learn like humans', 'To replace all human jobs', 'To create movie robots'],
              correctAnswerIndex: 1,
              explanation: "That's right! AI is all about creating computer systems that can perform tasks that usually require human intelligence.",
              hint: "Think about the main purpose. Is it about speed, or something more... intelligent?",
            },
            {
              type: 'multiple-choice',
              question: 'What does AI use to learn?',
              options: ['Electricity', 'Magic', 'Data (information)', 'Internet speed'],
              correctAnswerIndex: 2,
              explanation: "Correct! AI systems are trained on large amounts of data to recognize patterns and make decisions.",
              hint: "What is the 'food' that AI needs to learn and grow smart?",
            },
            {
              type: 'fill-in-the-blank',
              question: "The type of AI that is very good at only one specific task is called ______ AI.",
              options: [],
              correctAnswerIndex: -1,
              answer: "Narrow",
              explanation: "Exactly! All the AI we use today, from Siri to Google Maps, is considered 'Narrow AI' because it's specialized for specific jobs.",
              hint: "It's the opposite of a 'General' AI that can do anything.",
            }
          ]
        },
        scenario: {
            title: "Grandma's New Gadget",
            situation: "Your grandmother buys a new talking speaker. She asks you: 'Is there a tiny person inside this box answering my questions, or is it magic?'",
            choices: [
                {
                    text: "It's magic, Grandma!",
                    response: "Not quite! While AI can seem magical, explaining it as magic doesn't help her understand the technology.",
                    isOptimal: false
                },
                {
                    text: "It's AI. It was trained on lots of conversations to understand and talk like a human.",
                    response: "Perfect answer! You explained that it's a technology (AI) and gave a simple reason for how it works (training on data).",
                    isOptimal: true
                },
                {
                    text: "It's just a recording.",
                    response: "Incorrect. A recording plays the same thing every time. AI listens and creates a new answer based on what you ask.",
                    isOptimal: false
                }
            ]
        }
      }
    },
    'ai-building-blocks': {
      title: 'AI\'s Building Blocks',
      description: 'Learn about the essential ingredients of AI: Data, Algorithms, and Models. The foundation for everything!',
      lessonContent: {
        title: 'The Three Pillars of AI',
        introduction: "To really understand how AI works, we need to know about its three most important parts: Data, Algorithms, and Models. Think of it like building a house. You need bricks, a building plan, and the finished house itself.",
        sections: [
          {
            heading: 'Pillar 1: Data (The Bricks)',
            content: "Data is the raw material for AI. It's just information. For an AI that recognizes animals, the data would be thousands of pictures of dogs, cats, goats, and lions. For a language AI, the data would be millions of books and articles. Without good, high-quality data, you can't build good AI. The more diverse and accurate the data, the stronger the AI's foundation."
          },
          {
            heading: 'Pillar 2: Algorithm (The Plan)',
            content: "An Algorithm is the step-by-step instruction, or the 'building plan', that tells the computer how to learn from the data. It's the recipe. For example, a simple algorithm might say: 1. Look at a picture. 2. Identify shapes and colors. 3. Compare these patterns to patterns you've seen before. 4. Make a guess about what's in the picture. Engineers choose different algorithms for different jobs."
          },
          {
            heading: 'Pillar 3: Model (The House)',
            content: "The Model is the final product that is created after the algorithm has finished learning from all the data. It's the 'trained' AI, the finished house. When you ask Siri a question, you are talking to an AI model. When Google Maps finds you a route, you are using an AI model. The model contains all the knowledge and patterns learned during training, and it's what makes the predictions."
          }
        ],
        summary: "AI is built on three pillars: Data (the information), Algorithms (the instructions for learning), and Models (the trained 'brain' that makes decisions). All three are needed to create a working AI system.",
        quiz: {
          questions: [
            {
              type: 'multiple-choice',
              question: 'In the house analogy, what represents the "Data"?',
              options: ['The building plan', 'The finished house', 'The bricks', 'The architect'],
              correctAnswerIndex: 2,
              explanation: "Correct! Data is the raw material, like bricks, that AI is built from.",
              hint: "The lesson compared data to the raw materials for a house. What were they?",
            },
            {
              type: 'multiple-choice',
              question: 'What is the name for the set of instructions that tells the AI how to learn?',
              options: ['A Model', 'A Data Point', 'A Program', 'An Algorithm'],
              correctAnswerIndex: 3,
              explanation: "Excellent! The algorithm is the recipe or plan for learning.",
              hint: "This is the 'recipe' or the 'plan' that the AI follows.",
            },
            {
              type: 'multiple-choice',
              question: "When you use an AI tool, what are you directly interacting with?",
              options: ['The raw data', 'The AI model', 'The algorithm', 'The engineer\'s computer'],
              correctAnswerIndex: 1,
              explanation: "That's right! The model is the output of the training process, and it's what we use to get predictions and answers.",
              hint: "This is the final, trained product – the 'finished house'.",
            }
          ]
        },
        scenario: {
            title: "The Robot Chef",
            situation: "You are programming a robot to bake a cake. You have the flour and sugar (Data). You have the robot (Computer). What are you missing to make the cake?",
            choices: [
                {
                    text: "The Model",
                    response: "Not quite. The Model is the finished cake! You need something else first.",
                    isOptimal: false
                },
                {
                    text: "The Algorithm (Recipe)",
                    response: "Correct! The Algorithm is the set of instructions (recipe) that tells the robot how to mix the data (ingredients) to create the result.",
                    isOptimal: true
                },
                {
                    text: "More Data",
                    response: "Incorrect. You have the ingredients, but without instructions (an algorithm), the robot won't know what to do with them.",
                    isOptimal: false
                }
            ]
        }
      }
    },
    'how-ai-works': {
      title: 'How AI Works',
      description: 'Discover the simple ideas behind how AI learns, like using data and algorithms.',
      lessonContent: {
        title: 'How Does AI Actually Learn?',
        introduction: "We know that AI learns from data, but how does that process work? It's like training a pet. You reward it for good behavior and correct it for bad behavior. AI learning is similar, but it happens much faster and with a lot of data.",
        sections: [
          {
            heading: 'The Recipe: Data and Algorithms',
            content: "Think of making jollof rice. You need ingredients (data) and a recipe (an algorithm). An algorithm is a set of rules or steps that the computer follows to complete a task. For AI, the algorithm tells the computer how to learn from the data. For example, an algorithm for a photo app might say: 'Look at 1 million pictures of cats. Find the patterns (pointy ears, whiskers, fur). Use these patterns to identify cats in new photos.'"
          },
          {
            heading: 'Training the Model',
            content: "This learning process is called 'training'. During training, the computer creates what is called a 'model'. The model is the 'brain' of the AI that has learned all the patterns from the data. At first, the model makes many mistakes. If it's learning to spot cats, it might call a dog a cat. The engineers will correct it. After seeing millions of examples and being corrected, the model becomes very accurate."
          },
          {
            heading: 'Prediction and Feedback',
            content: "Once the model is trained, it can make predictions. When you give it a new photo, it 'predicts' whether there is a cat in it or not. This is also called 'inference'. AI systems get better over time because they can get feedback. When you say 'Hey Siri, you misunderstood me', you are giving feedback that helps the AI model improve for the future."
          }
        ],
        summary: "AI works by using an algorithm (a recipe) to process huge amounts of data. This 'training' process creates a 'model' (the AI brain), which can then make predictions on new data it has never seen before.",
        quiz: {
          questions: [
            {
              type: 'multiple-choice',
              question: 'In AI, what is an algorithm?',
              options: ['A type of computer chip', 'The data used for training', 'A set of rules or a recipe for the computer to follow', 'The final AI program'],
              correctAnswerIndex: 2,
              explanation: "That's it! An algorithm is the step-by-step procedure that tells the AI how to learn from the data.",
              hint: "It's the set of steps or the 'recipe' for learning.",
            },
            {
              type: 'multiple-choice',
              question: "The process of teaching an AI with data is called...",
              options: ['Cooking', 'Training', 'Downloading', 'Inference'],
              correctAnswerIndex: 1,
              explanation: "Correct! Just like a student trains for an exam, an AI model is trained on data.",
              hint: "It's the process of 'teaching' the AI, similar to how a student studies.",
            },
            {
              type: 'multiple-choice',
              question: "What is the 'brain' of the AI that is created after training?",
              options: ['The algorithm', 'The data', 'The computer', 'The model'],
              correctAnswerIndex: 3,
              explanation: "Yes! The model is the output of the training process and is what you interact with when you use an AI tool.",
              hint: "This is the name for the AI's 'brain' after it has learned from the data.",
            }
          ]
        },
        scenario: {
            title: "Training Day",
            situation: "You want to teach an AI to recognize ripe yellow bananas. Which set of training photos should you show it?",
            choices: [
                {
                    text: "Only one perfect yellow banana.",
                    response: "Too limited. If it sees a banana with a brown spot or a different shape, it won't recognize it.",
                    isOptimal: false
                },
                {
                    text: "Thousands of photos of yellow bananas, green bananas, and other yellow fruits like lemons.",
                    response: "Excellent! Showing it positive examples (yellow bananas) and negative examples (green bananas, lemons) helps it learn exactly what makes a ripe banana unique.",
                    isOptimal: true
                },
                {
                    text: "Photos of cars and trucks.",
                    response: "Incorrect. The data must be relevant to the task you want the AI to learn.",
                    isOptimal: false
                }
            ]
        }
      }
    },
    'ai-in-daily-life': {
      title: 'AI in Daily Life',
      description: "Explore real examples of AI you're already using, from social media to mobile banking.",
      lessonContent: {
        title: 'AI is Everywhere!',
        introduction: "You might think AI is something from the future, but you probably use it every single day without even realizing it. Let's look at some examples that are common in our lives.",
        sections: [
          {
            heading: 'On Your Phone',
            content: "Your smartphone is a powerful AI device. When you use your face to unlock your phone, that's AI (facial recognition). When you type a message and your phone suggests the next word, that's AI (predictive text). Voice assistants like Siri and Google Assistant use AI to understand your speech and answer your questions."
          },
          {
            heading: 'Entertainment and Social Media',
            content: "Do you use YouTube, TikTok, or Netflix? The videos and movies they recommend for you are chosen by an AI. This AI is called a 'recommendation engine'. It learns what you like to watch and suggests similar content to keep you engaged. The filters you use on Instagram or Snapchat also use AI to detect your face and apply effects."
          },
          {
            heading: 'Mobile Money and Banking',
            content: "AI plays a big role in keeping your money safe. When you use a mobile banking app, AI works in the background to check for strange activity. If someone in another city suddenly tries to use your account, the AI might flag it as fraud and block the transaction. This is a very important use of AI."
          },
          {
            heading: 'Getting Around',
            content: "Apps like Google Maps use AI to find the fastest route to your destination. It analyzes traffic information in real-time from thousands of users to predict traffic jams and suggest a better way. This saves you time and fuel."
          }
        ],
        summary: "From unlocking our phones and watching videos to banking and navigation, AI is a hidden partner in many of our daily activities, making them easier, safer, and more personalized.",
        quiz: {
          questions: [
            {
              type: 'multiple-choice',
              question: 'When YouTube suggests a video for you to watch, what is that called?',
              options: ['A lucky guess', 'A recommendation engine', 'A social media filter', 'Predictive text'],
              correctAnswerIndex: 1,
              explanation: "Exactly! Recommendation engines are a very common type of AI that learns your preferences.",
              hint: "This system 'recommends' things to you based on what you like.",
            },
            {
              type: 'multiple-choice',
              question: 'How do mobile banking apps use AI?',
              options: ['To choose a cool app color', 'To count your money', 'To detect fraud and unusual activity', 'To send you marketing messages'],
              correctAnswerIndex: 2,
              explanation: "Correct. AI is crucial for security in modern finance, helping to protect your account from unauthorized access.",
              hint: "Banks use AI to look for patterns of suspicious activity to keep you safe.",
            },
             {
              type: 'fill-in-the-blank',
              question: "The feature that suggests the next word as you type a message is called ________ text.",
              options: [],
              correctAnswerIndex: -1,
              answer: "predictive",
              explanation: "Yes! Predictive text is a simple but powerful AI that learns language patterns to help you type faster.",
              hint: "It 'predicts' what you're going to type next.",
            }
          ]
        },
        scenario: {
            title: "The Movie Detective",
            situation: "You open Netflix and it suggests a movie you've never heard of, but you end up loving it! How did the AI know?",
            choices: [
                {
                    text: "It was a lucky guess.",
                    response: "Unlikely. AI relies on data, not luck.",
                    isOptimal: false
                },
                {
                    text: "It analyzed my past viewing history and found patterns in the types of movies I like.",
                    response: "Spot on! The recommendation engine saw you liked 5 other action comedies, so it found another one with similar traits.",
                    isOptimal: true
                },
                {
                    text: "It read my mind.",
                    response: "AI isn't magic! It can only predict based on the data you give it through your actions.",
                    isOptimal: false
                }
            ]
        }
      }
    },
    'types-of-ai': {
        title: 'Types of AI',
        description: 'Understand the difference between Machine Learning, Deep Learning, and Generative AI.',
        lessonContent: {
            title: 'Meet the AI Family',
            introduction: "AI is a big field, like a big family with many relatives. The most important ones to know are Machine Learning, Deep Learning, and the newest star, Generative AI. Let's see how they're related.",
            sections: [
                {
                    heading: 'Machine Learning (ML): The Foundation',
                    content: "Machine Learning is the most common type of AI. It's the core idea of learning from data without being explicitly programmed. Most Narrow AI we use today is powered by Machine Learning. Recommendation engines and fraud detection systems are great examples of ML in action. It's excellent at prediction and classification tasks."
                },
                {
                    heading: 'Deep Learning: The Powerful Brain',
                    content: "Deep Learning is a special, more powerful type of Machine Learning. It uses something called a 'neural network', which is inspired by the human brain. These networks have many layers, which allow them to learn very complex patterns from huge amounts of data. Deep Learning is what makes things like voice assistants and self-driving cars possible. It's the engine behind the most advanced AI today."
                },
                {
                    heading: 'Generative AI: The Creator',
                    content: "Generative AI is a newer and very exciting type of Deep Learning. While other AIs predict or identify things, Generative AI *creates* new things. It can generate new text, images, music, and code that has never existed before. When you use ChatGPT to write a poem or Midjourney to create an image, you are using Generative AI. It's a tool for creativity."
                }
            ],
            summary: "Machine Learning is the base of AI that learns from data. Deep Learning is a more advanced form of ML using 'neural networks' for complex tasks. Generative AI is a type of Deep Learning that can create brand new content.",
            quiz: {
                questions: [
                    {
                        type: 'multiple-choice',
                        question: 'Which type of AI is focused on CREATING new content like images and text?',
                        options: ['Machine Learning', 'Deep Learning', 'Generative AI', 'All of the above'],
                        correctAnswerIndex: 2,
                        explanation: "Correct! Generative AI is all about generating new, original content.",
                        hint: "Which type is known for being a 'creator'?",
                    },
                    {
                        type: 'multiple-choice',
                        question: 'Deep Learning uses a structure inspired by what?',
                        options: ['A computer circuit', 'The human brain', 'A library', 'A search engine'],
                        correctAnswerIndex: 1,
                        explanation: "That's right! Deep Learning's 'neural networks' are loosely based on the structure of the human brain, allowing it to learn complex patterns.",
                        hint: "Deep Learning's structure is inspired by a biological network.",
                    },
                    {
                        type: 'multiple-choice',
                        question: 'A system that recommends movies on Netflix is a classic example of...',
                        options: ['Generative AI', 'Machine Learning', 'General AI', 'A human curator'],
                        correctAnswerIndex: 1,
                        explanation: "Yes! Recommendation systems are one of the most common applications of Machine Learning. They predict what you will like based on data.",
                        hint: "This is the most common and foundational type of AI, used for prediction.",
                    }
                ]
            },
            scenario: {
                title: "The Right Tool for the Job",
                situation: "You are a business owner. You want an AI to automatically write unique, creative birthday emails to your 10,000 customers. Which type of AI do you need?",
                choices: [
                    {
                        text: "Standard Machine Learning (ML)",
                        response: "Not quite. ML is great for predicting who *wants* an email, but it's not designed to write original text.",
                        isOptimal: false
                    },
                    {
                        text: "Generative AI",
                        response: "Correct! Generative AI excels at creating new content, like writing unique text, which is exactly what you need.",
                        isOptimal: true
                    },
                    {
                        text: "A Calculator",
                        response: "Definitely not! That won't help you write emails.",
                        isOptimal: false
                    }
                ]
            }
        }
    },
    'risks-and-bias': {
      title: 'Risks and Bias',
      description: "Understand the challenges of AI, including how it can sometimes be unfair or make mistakes.",
      lessonContent: {
        title: "When AI Gets It Wrong: Bias and Risks",
        introduction: "AI is a very powerful tool, but it's not perfect. It is made by humans and learns from data created by humans. This means it can have the same problems that humans have, like being unfair or making mistakes. This is a very important topic to understand.",
        sections: [
          {
            heading: 'What is AI Bias?',
            content: "AI bias happens when an AI system makes unfair decisions that favour one group of people over another. But how does this happen? It all comes from the data. Imagine you want to train an AI to recognize photos of doctors. If you train it using 1,000 photos, and 950 of them are men, the AI will learn that doctors are usually men. It might then have trouble recognizing a female doctor. The data was 'biased', so the AI became biased too."
          },
          {
            heading: 'Real-World Examples of Bias',
            content: "This isn't just a theory. Some real AI systems built for hiring have been found to favour male candidates because they were trained on data from a time when mostly men were hired. Some facial recognition systems have been shown to be less accurate for people with darker skin tones because they were trained mostly on photos of people with lighter skin. This is a serious problem that AI creators must work hard to fix."
          },
          {
            heading: 'Other Risks: Privacy and Misinformation',
            content: "Besides bias, there are other risks. AI systems often need a lot of personal data to work, which raises concerns about our privacy. Who is collecting our data and how are they using it? Another risk is misinformation. AI can now be used to create very realistic but fake images, videos (called 'deepfakes'), and news articles. It's becoming harder to know what is real and what is not."
          }
        ],
        summary: "AI systems can be biased if they are trained on unfair or incomplete data, leading to unfair decisions. They also present risks to our privacy and can be used to create convincing misinformation.",
        quiz: {
          questions: [
            {
              type: 'multiple-choice',
              question: 'What is the main cause of AI bias?',
              options: ['Slow computers', 'Bad algorithms', 'Unfair or incomplete training data', 'Hackers'],
              correctAnswerIndex: 2,
              explanation: "Correct. The data used to train an AI is the most common source of bias. Garbage in, garbage out!",
              hint: "The lesson emphasized 'garbage in, garbage out'. What is the 'garbage' in this case?",
            },
            {
              type: 'multiple-choice',
              question: "A fake video created using AI is often called a...",
              options: ['A cheapfake', 'A clone', 'A deepfake', 'A movie clip'],
              correctAnswerIndex: 2,
              explanation: "That's right. Deepfakes are a powerful technology that can be used for good (like in movies) or for bad (like spreading false information).",
              hint: "These realistic but fake videos have a specific name that combines 'deep learning' and 'fake'.",
            },
            {
              type: 'multiple-choice',
              question: 'Why is it important for AI creators to use diverse data for training?',
              options: ['To make the AI bigger', 'To make the AI fair and accurate for everyone', 'To make the AI run faster', 'It is not important'],
              correctAnswerIndex: 1,
              explanation: "Exactly! Using data from all groups of people helps ensure the AI works well for everyone and avoids unfair bias.",
              hint: "To be fair to everyone, the AI needs to learn from data representing everyone.",
            }
          ]
        },
        scenario: {
            title: "The Biased Hiring Manager",
            situation: "You are a company boss. You buy an AI tool to help sort through job applications. You notice it keeps rejecting qualified female engineers. What do you do?",
            choices: [
                {
                    text: "Trust the AI. Computers don't make mistakes.",
                    response: "Dangerous! Computers only know what they are taught. If the training data was biased, the AI will be biased.",
                    isOptimal: false
                },
                {
                    text: "Stop using the tool and ask the developers what data it was trained on.",
                    response: "Excellent! You recognized the bias. Checking the training data will likely reveal it was trained mostly on male resumes.",
                    isOptimal: true
                },
                {
                    text: "Hire only men.",
                    response: "No! That is unfair and you would miss out on great talent.",
                    isOptimal: false
                }
            ]
        }
      }
    },
    'data-privacy': {
        title: 'Data Privacy',
        description: 'Learn why your data is valuable and how to protect it in the age of AI.',
        lessonContent: {
            title: 'Your Data is a Treasure',
            introduction: "We've learned that data is the food that makes AI smart. A lot of this data comes from us, the users! This makes our personal information very valuable. Understanding data privacy is about knowing your rights and protecting your information online.",
            sections: [
                {
                    heading: 'What is Personal Data?',
                    content: "Personal data is any information that can be used to identify you. This includes your name, email address, phone number, location, and photos. It can also include your browsing history, what you 'like' on social media, and what you buy online. All of this information creates a 'digital footprint'."
                },
                {
                    heading: 'Why Do Companies Want Your Data?',
                    content: "Companies collect data for many reasons. Some use it to improve their products, like when Google Maps uses location data to check for traffic. Others use it to show you personalized ads. They learn your interests from your data and show you ads they think you'll click on. This is how many free apps and websites make money."
                },
                {
                    heading: 'How to Protect Your Privacy',
                    content: "You can take steps to protect your data. Be careful what you share on public profiles. Use strong, unique passwords for different websites. Review the privacy settings on your apps and social media accounts to control who sees your information. Think twice before giving an app permission to access your contacts or location if it doesn't need it to function."
                }
            ],
            summary: "Your personal data is valuable information that powers many AI systems and online services. Protecting your data privacy means being mindful of what you share and managing your privacy settings to control your digital footprint.",
            quiz: {
                questions: [
                    {
                        type: 'multiple-choice',
                        question: 'Which of the following is considered personal data?',
                        options: ['The time of day', 'Your name and email', 'The weather forecast', 'A random number'],
                        correctAnswerIndex: 1,
                        explanation: "Correct! Your name and email are pieces of information that can directly identify you.",
                        hint: "Which option can be used to uniquely find or contact you?",
                    },
                    {
                        type: 'multiple-choice',
                        question: 'What is a common reason companies collect user data?',
                        options: ['To slow down your phone', 'To show you personalized advertisements', 'To use up your mobile data', 'To make their app look busy'],
                        correctAnswerIndex: 1,
                        explanation: "That's right. Personalized advertising is a major business model on the internet, and it relies on collecting user data to be effective.",
                        hint: "How do free apps often make money from your activity?",
                    },
                    {
                        type: 'multiple-choice',
                        question: 'A good way to protect your privacy online is to...',
                        options: ['Use the same easy password everywhere', 'Share your phone number publicly', 'Accept all app permissions without reading', 'Review your privacy settings on apps'],
                        correctAnswerIndex: 3,
                        explanation: "Exactly! Taking a few minutes to check your privacy settings can give you much more control over how your information is used.",
                        hint: "This involves taking control of how your information is used by apps.",
                    }
                ]
            },
            scenario: {
                title: "The Flashlight App",
                situation: "You download a simple flashlight app for your phone. It asks for permission to access your Location and Contacts. What do you do?",
                choices: [
                    {
                        text: "Allow it. I want the app to work.",
                        response: "Not a good idea. A flashlight app doesn't need to know where you are or who your friends are to turn on a light.",
                        isOptimal: false
                    },
                    {
                        text: "Deny the permission or find a different app.",
                        response: "Smart choice! This app is likely collecting your data for reasons you didn't agree to (like selling it). Protect your privacy.",
                        isOptimal: true
                    },
                    {
                        text: "Allow it, but turn off my phone's GPS.",
                        response: "This might work for location, but you've still given them access to your Contacts.",
                        isOptimal: false
                    }
                ]
            }
        }
    },
    'ai-safety': {
      title: 'AI Safety',
      description: 'Learn about the importance of building AI that is helpful, harmless, and honest.',
      lessonContent: {
        title: 'Making AI Safe and Helpful',
        introduction: "Because AI is so powerful, it's extremely important that we build it safely and responsibly. AI Safety is a field of study focused on making sure AI systems do what we want them to do, without causing unintended harm.",
        sections: [
          {
            heading: 'What Could Go Wrong?',
            content: "Imagine an AI controlling a self-driving car. We want it to get us to our destination safely. We need to be sure it won't make a dangerous mistake, like misinterpreting a stop sign. AI Safety researchers think about these 'worst-case scenarios' and try to build safeguards to prevent them. The goal is to make AI reliable and predictable."
          },
          {
            heading: 'The Alignment Problem',
            content: "A big idea in AI safety is 'alignment'. This means making sure the AI's goals are aligned with human values. For example, if we tell an AI 'make coffee as fast as possible', a poorly designed AI might cause a fire by overheating the coffee machine to speed things up. It achieved the goal, but not in the way we wanted. A safe, aligned AI would understand the unstated goal: 'make coffee quickly, but without causing any damage'."
          },
          {
            heading: "Three H's of Safe AI",
            content: "A good way to think about AI safety is the three H's: Helpful, Harmless, and Honest. An AI should be **Helpful**: it should assist humans and perform its task well. It should be **Harmless**: it should not cause physical, emotional, or financial damage. And it should be **Honest**: it should not deceive users. For example, a chatbot should be clear that it is an AI, not a real person."
          }
        ],
        summary: "AI Safety is about ensuring AI systems are reliable, aligned with human values, and do not cause unintended harm. We can aim to build AI that is helpful, harmless, and honest.",
        quiz: {
          questions: [
            {
              type: 'multiple-choice',
              question: 'What is the main goal of AI Safety?',
              options: ['Making AI more powerful', 'Making AI cheaper', 'Making sure AI is helpful and does not cause harm', 'Making AI control everything'],
              correctAnswerIndex: 2,
              explanation: "That's the key idea! Safety and responsibility are the most important things when building powerful technology.",
              hint: "The focus isn't on power, but on responsibility and benefit.",
            },
            {
              type: 'multiple-choice',
              question: "The 'Alignment Problem' is about making sure an AI's goals match...",
              options: ['The speed of the internet', 'The goals of other AIs', 'Human values and intentions', 'The size of the data'],
              correctAnswerIndex: 2,
              explanation: "Correct. We need to make sure the AI understands not just what we say, but what we truly mean and value.",
              hint: "The goal is to align the AI's objectives with human...",
            },
             {
              type: 'multiple-choice',
              question: 'Which of these is NOT one of the "Three H\'s" of safe AI?',
              options: ['Helpful', 'Hidden', 'Honest', 'Harmless'],
              correctAnswerIndex: 1,
              explanation: "Exactly. Safe AI should be the opposite of hidden; it should be transparent and honest about what it is and what it does.",
              hint: "Think about the three H's: Helpful, Harmless, and Honest. Which one is not on the list?",
            }
          ]
        },
        scenario: {
            title: "The Cleaning Robot",
            situation: "You tell your new super-intelligent robot: 'Clean up the mess in the kitchen.' The robot sees a messy table but also sees your cat sleeping on the counter. It decides to throw everything, including the cat, into the trash to 'clean up'. What went wrong?",
            choices: [
                {
                    text: "The robot was evil.",
                    response: "Robots aren't evil or good. They just follow instructions.",
                    isOptimal: false
                },
                {
                    text: "Misaligned Goals (The Alignment Problem).",
                    response: "Exactly! The robot's goal ('remove mess') was not aligned with your values ('keep the cat safe'). This is why we need AI Safety.",
                    isOptimal: true
                },
                {
                    text: "The robot needs a software update.",
                    response: "While true, the core issue is that the instructions didn't include safety boundaries.",
                    isOptimal: false
                }
            ]
        }
      }
    },
    'ai-and-jobs': {
      title: 'AI and Jobs',
      description: 'Understand how AI is changing the world of work and creating new opportunities.',
      lessonContent: {
        title: 'How AI is Changing Work',
        introduction: "Many people worry that AI will take away all the jobs. While it's true that AI will change the way we work, it will also create many new and exciting job opportunities. The key is to be ready for the change.",
        sections: [
          {
            heading: 'Automating Tasks, Not Jobs',
            content: "AI is very good at automating repetitive tasks. Think about a customer service agent. An AI chatbot can handle simple, common questions like 'What are your opening hours?'. This frees up the human agent to focus on more complex problems that require empathy and creative thinking. So, the AI didn't take the job, it changed the job to be more focused on human strengths."
          },
          {
            heading: 'New Jobs are Being Created',
            content: "AI is creating jobs that didn't exist 10 years ago. We now need 'Prompt Engineers' (people who are experts at writing instructions for AI), 'AI Ethicists' (people who make sure AI is used responsibly), and 'AI Trainers' (people who help prepare data to teach AI). In sectors like agriculture and healthcare in Africa, we need people who can apply AI to solve local problems."
          },
          {
            heading: 'The Importance of Lifelong Learning',
            content: "The most important skill in the age of AI is the ability to learn new things. The jobs of tomorrow will require a mix of skills: technical skills (like understanding how AI works) and human skills (like creativity, communication, and teamwork). By learning about AI now, you are preparing yourself for the future. Your job might be to work alongside AI, using it as a powerful tool to do your work better and faster."
          }
        ],
        summary: "AI is changing jobs by automating repetitive tasks, which allows humans to focus on more creative and complex work. It is also creating entirely new job roles, making continuous learning more important than ever.",
        quiz: {
          questions: [
            {
              type: 'multiple-choice',
              question: 'AI is best at automating which kind of tasks?',
              options: ['Creative and strategic tasks', 'Tasks requiring empathy', 'Repetitive and predictable tasks', 'All human tasks'],
              correctAnswerIndex: 2,
              explanation: "Correct! AI excels at tasks that are done over and over again, freeing up humans for work that requires a human touch.",
              hint: "AI is great at tasks that are done the same way over and over.",
            },
            {
              type: 'multiple-choice',
              question: 'Which of these is a new job created because of AI?',
              options: ['Farmer', 'Doctor', 'Prompt Engineer', 'Teacher'],
              correctAnswerIndex: 2,
              explanation: "Yes! Prompt Engineering is a new and valuable skill that involves writing effective instructions for AI systems.",
              hint: "This is a new skill related to writing instructions for AI.",
            },
             {
              type: 'multiple-choice',
              question: 'What is the most important skill in the age of AI?',
              options: ['Typing fast', 'Lifelong learning', 'Memorizing facts', 'Following instructions perfectly'],
              correctAnswerIndex: 1,
              explanation: "Exactly! Technology changes quickly, so the ability and willingness to learn new things is the best way to prepare for the future.",
              hint: "Since technology is always changing, what's the best way to keep up?",
            }
          ]
        },
        scenario: {
            title: "The Career Choice",
            situation: "You are advising a student on what to study. They are worried that AI will take all the jobs. What advice do you give?",
            choices: [
                {
                    text: "Don't worry, learn a trade that requires human hands and creativity, or learn how to use AI tools.",
                    response: "Great advice. Jobs that require physical dexterity, empathy, or complex problem-solving are harder to automate. Learning to work WITH AI is also a superpower.",
                    isOptimal: true
                },
                {
                    text: "Study typing. Computers need typists.",
                    response: "Not great advice. AI can already transcribe speech faster than humans can type.",
                    isOptimal: false
                },
                {
                    text: "Give up. Robots will do everything.",
                    response: "Too pessimistic! Humans have unique skills like creativity and empathy that machines don't have.",
                    isOptimal: false
                }
            ]
        }
      }
    },
    'digital-citizenship': {
      title: 'Digital Citizenship',
      description: 'Learn how to use AI and the internet safely, respectfully, and responsibly.',
      lessonContent: {
        title: 'Being a Good Citizen in the Age of AI',
        introduction: "Being online is like being in a large, global community. Digital citizenship is about how we act in that community. With powerful AI tools, it's more important than ever to be safe, respectful, and responsible online.",
        sections: [
          {
            heading: 'Think Before You Share',
            content: "The internet has a long memory. Information you share online, including with AI chatbots, can be stored for a long time. Be careful about sharing personal information like your full name, address, phone number, or school name. Always think: 'Would I be comfortable with this information being public?'"
          },
          {
            heading: 'Fact-Check Your Information',
            content: "As we learned, AI can be used to create misinformation (fake news). Before you believe or share something you see online, take a moment to check if it's true. Does it come from a trusted source, like a well-known news organization? Do other reliable sources say the same thing? Being a good digital citizen means helping to stop the spread of false information."
          },
          {
            heading: 'Use AI Tools Responsibly',
            content: "AI is a tool to help you, not to do your work for you. For example, using an AI to write your entire school essay is plagiarism and is dishonest. However, using an AI to help you brainstorm ideas, check your grammar, or explain a difficult topic is a smart and responsible way to learn. Always be honest about when you've used AI to help with your work."
          },
          {
            heading: 'Be Kind and Respectful',
            content: "The rules of kindness that apply in real life also apply online. Treat others with respect in comment sections, chats, and online games. Remember that there is a real person behind every screen. A good digital citizen helps make the online world a better and safer place for everyone."
          }
        ],
        summary: "Good digital citizenship in the age of AI means protecting your personal information, verifying facts before sharing, using AI tools honestly and responsibly, and always being respectful to others online.",
        quiz: {
          questions: [
            {
              type: 'multiple-choice',
              question: 'Which of these is NOT safe to share online?',
              options: ['Your favorite food', 'Your home address', 'Your opinion on a movie', 'A picture of your pet'],
              correctAnswerIndex: 1,
              explanation: "Correct. Personal information like your address should be kept private to stay safe.",
              hint: "Think about which piece of information could lead someone to your physical location.",
            },
            {
              type: 'multiple-choice',
              question: "If you use an AI to help with your homework, what is the responsible thing to do?",
              options: ['Copy the AI\'s answer and pretend it is yours', 'Use the AI to find ideas and check your work, but write the final answer yourself', 'Delete your homework', 'Tell your friends the AI did it for you'],
              correctAnswerIndex: 1,
              explanation: "Exactly! Using AI as a learning assistant is a great idea, but copying its work is dishonest.",
              hint: "It's about being honest and using AI as a tool, not as a replacement for your own effort.",
            },
            {
              type: 'multiple-choice',
              question: "What should you do before you share an amazing story you saw online?",
              options: ['Share it immediately with everyone', 'Check if the information is from a reliable source', 'Ask an AI if it is true', 'Only share it with your best friend'],
              correctAnswerIndex: 1,
              explanation: "Yes! Fact-checking is a key skill for a good digital citizen to help prevent the spread of misinformation.",
              hint: "To stop the spread of fake news, you should first...?",
            }
          ]
        },
        scenario: {
            title: "The Viral Photo",
            situation: "You see a shocking photo of a politician doing something illegal online. It looks real, but the source is a website you've never heard of. What do you do?",
            choices: [
                {
                    text: "Share it immediately! Everyone needs to see this.",
                    response: "Bad move. If it's a deepfake (AI-generated fake), you are spreading lies.",
                    isOptimal: false
                },
                {
                    text: "Do a reverse image search or check trusted news sites to see if it's real.",
                    response: "Excellent digital citizenship! Always verify shocking content before you share it.",
                    isOptimal: true
                },
                {
                    text: "Ignore it.",
                    response: "Better than sharing, but verifying is the best way to learn the truth.",
                    isOptimal: false
                }
            ]
        }
      }
    },
    'prompt-engineering': {
      title: 'Prompt Engineering',
      description: 'Learn the art of writing clear instructions (prompts) to get the best results from AI.',
      lessonContent: {
        title: 'Talking to AI: The Art of the Prompt',
        introduction: "Getting a great result from an AI like ChatGPT depends on one thing: giving it great instructions. These instructions are called 'prompts'. Prompt engineering is the skill of writing clear, detailed prompts to get the AI to give you exactly what you want.",
        sections: [
          {
            heading: 'Be Specific and Clear',
            content: "AI is not a mind reader. You need to tell it exactly what you want. Don't just say 'Write about a car'. A better prompt would be: 'Write a short paragraph describing a tough, red 4x4 pickup truck driving on a dusty road in the Nigerian savanna.' The second prompt gives the AI more details to work with, so you'll get a much better result."
          },
          {
            heading: 'Give the AI a Role',
            content: "You can get amazing results by telling the AI to act as an expert. This puts it in the right 'mindset'. For example, instead of asking 'Explain photosynthesis', try this prompt: 'You are a science teacher explaining photosynthesis to a 10-year-old student. Use a simple analogy to make it easy to understand.' This will give you a much clearer and more helpful explanation."
          },
          {
            heading: 'Provide Examples',
            content: "If you want the AI to write in a specific style, give it an example! This is called 'few-shot prompting'. You could say: 'I want to write a proverb about smartphones. Here is the style I like: \"The same water that softens the yam can harden the egg.\" Now, write a new one about smartphones in that style.' This helps the AI understand the tone and format you are looking for."
          },
           {
            heading: 'Refine and Iterate',
            content: "Your first prompt might not be perfect. That's okay! The best prompt engineers try something, see the result, and then change their prompt to make it better. Don't be afraid to experiment. Add more details, change the AI's role, or ask it to try again from a different perspective. It's a conversation!"
          }
        ],
        summary: "Effective prompt engineering involves being specific, assigning the AI a role, providing examples of the style you want, and refining your prompts based on the results you get.",
        quiz: {
          questions: [
            {
              type: 'multiple-choice',
              question: "Which of these is the most effective prompt?",
              options: ['Tell me a story.', 'Write a story for a child.', 'Write a funny, 50-word story for a 5-year-old about a goat that learns to fly.', 'Story about a goat.'],
              correctAnswerIndex: 2,
              explanation: "Perfect! This prompt is the most effective because it's specific about the tone (funny), length (50-word), audience (5-year-old), and topic.",
              hint: "The best prompts are detailed and give the AI clear instructions.",
            },
            {
              type: 'multiple-choice',
              question: "Telling the AI 'You are a tour guide' is an example of what technique?",
              options: ['Being vague', 'Giving it a role', 'Few-shot prompting', 'Breaking the AI'],
              correctAnswerIndex: 1,
              explanation: "Correct! Assigning a role helps the AI understand the context and tone you want for the response.",
              hint: "This technique involves telling the AI to act as an expert, like a 'teacher' or 'tour guide'.",
            },
            {
              type: 'multiple-choice',
              question: "What should you do if your first prompt doesn't give you the result you want?",
              options: ['Give up and close the program', 'Type the same prompt again in all capital letters', 'Change and improve your prompt with more details', 'Assume the AI is broken'],
              correctAnswerIndex: 2,
              explanation: "Exactly! The best results come from refining and iterating on your prompts. It's a skill that improves with practice.",
              hint: "Getting the perfect result is a process of trial and error. What is this process called?",
            }
          ]
        },
        scenario: {
            title: "The Lazy Prompt",
            situation: "You ask an AI: 'Write a story.' The AI writes a boring story about a cat sitting on a mat. You wanted a sci-fi adventure. What was the mistake?",
            choices: [
                {
                    text: "The AI is stupid.",
                    response: "No, the AI just did exactly what you asked. Your instructions were too vague.",
                    isOptimal: false
                },
                {
                    text: "The prompt lacked detail, context, and style instructions.",
                    response: "Correct! Garbage in, garbage out. A better prompt would be: 'Write a thrilling sci-fi story about a space explorer on Mars.'",
                    isOptimal: true
                },
                {
                    text: "You didn't say 'Please'.",
                    response: "Being polite is nice, but clarity is what matters for the result.",
                    isOptimal: false
                }
            ]
        }
      }
    },
    'ai-for-writing': {
        title: 'AI for Writing',
        description: 'Use AI as a creative partner to help you write stories, poems, and more.',
        lessonContent: {
            title: 'Your Creative Writing Assistant',
            introduction: "Generative AI is an amazing tool for anyone who loves to write. It can help you overcome writer's block, brainstorm ideas, and even co-write with you. Let's explore how to use AI as your creative partner.",
            sections: [
                {
                    heading: 'Brainstorming Ideas',
                    content: "Staring at a blank page? AI can help. Give it a simple prompt to get started. For example: 'Give me 5 creative ideas for a story about a magical talking drum in ancient Benin.' You can ask it for characters, plot twists, or settings to get your imagination flowing."
                },
                {
                    heading: 'Improving Your Drafts',
                    content: "Once you have a draft, AI can act as an editor. You can paste your text and ask it to: 'Proofread this for spelling and grammar mistakes', or 'Suggest three alternative ways to phrase this sentence to make it more exciting.' This helps you learn and improve your own writing skills."
                },
                {
                    heading: 'Co-Writing and Expansion',
                    content: "You can write a paragraph and then ask the AI to continue the story. For example: 'Here is the start of my story: [your paragraph]. Now, write the next paragraph where the main character discovers a hidden map.' It's like having a co-writer who is always ready with new ideas. Remember, you are always in control. You can take the AI's suggestion, change it, or ignore it completely."
                }
            ],
            summary: "AI can be a powerful assistant for writers, helping with brainstorming ideas, editing drafts, and even co-writing new parts of a story. The key is to use it as a tool to enhance your own creativity, not replace it.",
            quiz: {
                questions: [
                    {
                        type: 'multiple-choice',
                        question: "What is a good way to use AI when you have writer's block?",
                        options: ["Ask it to write the whole story for you", "Ask it to brainstorm a list of ideas or characters", "Ask it to criticize your last story", "Give up on writing"],
                        correctAnswerIndex: 1,
                        explanation: "Correct! AI is excellent at generating ideas to get you started when you feel stuck.",
                        hint: "When you're stuck, AI can help generate initial...",
                    },
                    {
                        type: 'multiple-choice',
                        question: "When using AI to help with writing, who is in control of the final story?",
                        options: ["The AI", "The computer", "The writer (you)", "Nobody"],
                        correctAnswerIndex: 2,
                        explanation: "Exactly! You, the writer, always have the final say. AI is a tool to assist your vision.",
                        hint: "AI is a tool. Who directs the tool?",
                    },
                    {
                        type: 'fill-in-the-blank',
                        question: "Asking an AI to check your text for mistakes is called ________.",
                        options: [],
                        correctAnswerIndex: -1,
                        answer: "proofreading",
                        explanation: "Yes! AI tools are very good at proofreading and can help you catch small errors in your writing.",
                        hint: "It's the term for checking for spelling and grammar mistakes.",
                    }
                ]
            },
            scenario: {
                title: "The Stuck Writer",
                situation: "You are writing a story but you can't think of a good name for your villain. How can AI help?",
                choices: [
                    {
                        text: "Ask AI to 'Give me 10 names for a powerful, magical villain inspired by African mythology'.",
                        response: "Perfect! This is a great brainstorming prompt that will give you options to choose from.",
                        isOptimal: true
                    },
                    {
                        text: "Ask AI to write the whole story.",
                        response: "That solves the name problem, but then it's not your story anymore!",
                        isOptimal: false
                    },
                    {
                        text: "Steal a name from a popular movie.",
                        response: "Not creative! Use AI to help you create something original.",
                        isOptimal: false
                    }
                ]
            }
        }
    },
    'ai-for-art': {
        title: 'AI for Art',
        description: 'Explore how AI tools can help you create amazing images and artwork.',
        lessonContent: {
            title: 'Painting with Words',
            introduction: "AI isn't just for text. It can also create incredible images! This is called 'AI Art Generation'. Tools like Midjourney and DALL-E allow you to create pictures just by describing them in words.",
            sections: [
                {
                    heading: 'How Does It Work?',
                    content: "These AI tools have been trained on billions of images and their captions. They learn the relationship between words and visual patterns. When you type 'a cat riding a bicycle', the AI understands what a 'cat' looks like, what a 'bicycle' looks like, and how to combine them into a new image."
                },
                {
                    heading: 'The Power of Description',
                    content: "Just like with writing, the quality of the image depends on your prompt. 'A dog' will give you a generic dog. 'A futuristic robot dog running through a neon city, cyberpunk style, highly detailed' will give you something spectacular. You can describe the subject, the style (e.g., oil painting, cartoon, photo), the lighting, and the mood."
                },
                {
                    heading: 'Is It Real Art?',
                    content: "This is a big debate! Some say it's not art because a computer made it. Others say it is art because a human had the creative idea and directed the AI. Think of the AI as a very advanced paintbrush. The human is still the artist making the choices. AI art is a new medium for expression."
                }
            ],
            summary: "AI art tools allow you to create visual art by describing it with text prompts. It learns from existing images to generate new ones, offering a powerful new way for people to express their creativity.",
            quiz: {
                questions: [
                    {
                        type: 'multiple-choice',
                        question: "What do you type into an AI art tool to create an image?",
                        options: ["A command code", "A text prompt describing the image", "A math equation", "You upload a video"],
                        correctAnswerIndex: 1,
                        explanation: "Correct! You use text descriptions, or prompts, to tell the AI what to draw.",
                        hint: "It's like 'painting with words'.",
                    },
                    {
                        type: 'multiple-choice',
                        question: "To get a specific style of art, you should...",
                        options: ["Hope for the best", "Include the style in your prompt (e.g., 'oil painting style')", "Restart the computer", "Type in capital letters"],
                        correctAnswerIndex: 1,
                        explanation: "Yes! Including style keywords helps the AI understand the artistic look you want.",
                        hint: "You need to tell the AI the style you want in your description.",
                    },
                    {
                        type: 'multiple-choice',
                        question: "AI art tools learn by looking at...",
                        options: ["Nothing", "Billions of images and their captions", "Only famous paintings", "One single photo"],
                        correctAnswerIndex: 1,
                        explanation: "Exactly. They are trained on massive datasets of images to understand how visual concepts work.",
                        hint: "They need a huge amount of examples to learn from.",
                    }
                ]
            },
            scenario: {
                title: "The Book Cover",
                situation: "You wrote a sci-fi story and want a cover image. You can't draw. How can AI help?",
                choices: [
                    {
                        text: "Use an AI art generator with a prompt like 'Sci-fi book cover, spaceship landing on purple planet, dramatic lighting'.",
                        response: "Great solution! This allows you to visualize your story without needing to be a professional artist.",
                        isOptimal: true
                    },
                    {
                        text: "Describe the image to your friend and hope they draw it.",
                        response: "That works too, but AI gives you instant results to experiment with.",
                        isOptimal: false
                    },
                    {
                        text: "Take a photo of your screen.",
                        response: "That won't create a new image!",
                        isOptimal: false
                    }
                ]
            }
        }
    },
    'ai-in-business': {
        title: 'AI in Business',
        description: 'Learn how companies use AI to work smarter and serve customers better.',
        lessonContent: {
            title: 'AI: The Business Partner',
            introduction: "Businesses all over the world are using AI to solve problems, save money, and create new products. From small shops to giant corporations, AI is becoming a key partner in success.",
            sections: [
                {
                    heading: 'Customer Service',
                    content: "Have you ever chatted with a support bot on a website? That's AI! Chatbots can answer common questions instantly, 24/7. This keeps customers happy because they don't have to wait, and it allows human staff to focus on solving harder problems."
                },
                {
                    heading: 'Making Better Decisions',
                    content: "AI can analyze huge amounts of data faster than any human. A shop owner can use AI to predict what products will be popular next month based on past sales and trends. Farmers can use AI to decide the best time to plant crops based on weather data. This helps businesses make smarter choices."
                },
                {
                    heading: 'Efficiency and Automation',
                    content: "AI can do boring, repetitive tasks automatically. For example, it can automatically sort emails, check invoices, or schedule meetings. This saves time and money, allowing employees to do more interesting and valuable work."
                }
            ],
            summary: "AI helps businesses by automating customer service with chatbots, analyzing data for better decision-making, and taking over repetitive tasks to improve efficiency.",
            quiz: {
                questions: [
                    {
                        type: 'multiple-choice',
                        question: "How do chatbots help businesses?",
                        options: ["They clean the office", "They answer customer questions instantly, 24/7", "They deliver packages", "They make coffee"],
                        correctAnswerIndex: 1,
                        explanation: "Correct! Chatbots provide instant support to customers at any time of day.",
                        hint: "Think about automated customer support on websites.",
                    },
                    {
                        type: 'multiple-choice',
                        question: "Why would a shop owner use AI for prediction?",
                        options: ["To guess lucky numbers", "To know what stock to buy for the future", "To replace all staff", "To make the shop look high-tech"],
                        correctAnswerIndex: 1,
                        explanation: "Yes! Predicting sales trends helps owners buy the right amount of stock.",
                        hint: "It helps them know what customers will want to buy next.",
                    },
                    {
                        type: 'multiple-choice',
                        question: "What is the benefit of automating repetitive tasks?",
                        options: ["It saves time and allows humans to do more important work", "It makes work more boring", "It costs more money", "It slows things down"],
                        correctAnswerIndex: 0,
                        explanation: "Exactly. Automation frees up human time for creative and strategic tasks.",
                        hint: "If a robot does the boring stuff, what can the human do?",
                    }
                ]
            },
            scenario: {
                title: "The Busy Bakery",
                situation: "You own a bakery. You spend 2 hours every day replying to emails asking 'What are your opening hours?' and 'Do you sell gluten-free bread?'. How can AI help?",
                choices: [
                    {
                        text: "Hire a full-time assistant just for emails.",
                        response: "That works, but it's expensive for such simple questions.",
                        isOptimal: false
                    },
                    {
                        text: "Set up a simple AI chatbot on your website/social media to answer these FAQs automatically.",
                        response: "Smart move! The bot handles the routine questions instantly, saving you 2 hours a day for baking.",
                        isOptimal: true
                    },
                    {
                        text: "Stop answering emails.",
                        response: "Bad for business! You will lose customers.",
                        isOptimal: false
                    }
                ]
            }
        }
    },
    'building-with-ai': {
        title: 'Building with AI',
        description: 'An introduction to how you can start building your own simple AI projects.',
        lessonContent: {
            title: 'You Can Be a Builder',
            introduction: "You don't need to be a super-coder to build with AI anymore. There are many tools that make it easy for anyone to create AI-powered apps and projects. Let's look at how you can get started.",
            sections: [
                {
                    heading: 'No-Code Tools',
                    content: "There are platforms that let you build AI apps by dragging and dropping blocks, just like building with LEGOs. You can create an app that recognizes different types of plants or a chatbot that tells jokes, all without writing a single line of complex code. This is a great way to learn the logic of AI."
                },
                {
                    heading: 'Using APIs',
                    content: "For those who know a little bit of coding, you can use APIs (Application Programming Interfaces). Companies like Google and OpenAI provide 'plugs' that let you connect their powerful AI models to your own code. It's like renting a supercomputer for a few seconds to do a smart task for your app."
                },
                {
                    heading: 'Solving Local Problems',
                    content: "The best way to build with AI is to find a problem in your community. Maybe you can build a tool to help translate local news into different languages, or an app that helps students study for exams. Start small, identify a real need, and see if AI can help solve it."
                }
            ],
            summary: "Building with AI is accessible to everyone through no-code tools and APIs. The most impactful projects often start by identifying and solving a specific problem in your local community.",
            quiz: {
                questions: [
                    {
                        type: 'multiple-choice',
                        question: "What are 'No-Code' AI tools?",
                        options: ["Tools that require advanced math", "Tools that let you build apps without writing code", "Tools that don't work", "Tools only for experts"],
                        correctAnswerIndex: 1,
                        explanation: "Correct! No-code tools make technology creation accessible to non-programmers.",
                        hint: "The name implies you don't need to write 'code'.",
                    },
                    {
                        type: 'multiple-choice',
                        question: "What is a great way to find an idea for an AI project?",
                        options: ["Copy Facebook", "Look for a problem in your community to solve", "Wait for someone to tell you", "Build something random"],
                        correctAnswerIndex: 1,
                        explanation: "Yes! Solving real problems creates the most value and is the best way to learn.",
                        hint: "Look around your neighborhood or school for challenges.",
                    },
                    {
                        type: 'multiple-choice',
                        question: "What does an API allow developers to do?",
                        options: ["Connect their code to powerful AI models", "Delete the internet", "Make coffee", "Play video games"],
                        correctAnswerIndex: 0,
                        explanation: "Exactly. APIs allow you to 'plug in' to external services like AI models.",
                        hint: "It acts like a connector or plug for software.",
                    }
                ]
            },
            scenario: {
                title: "The Community Translator",
                situation: "Your community notice board is only in English, but many elders only speak local languages. You want to help. What can you build?",
                choices: [
                    {
                        text: "A robot that reads the board out loud.",
                        response: "Cool, but very hard to build and expensive.",
                        isOptimal: false
                    },
                    {
                        text: "A simple app (using an AI API) where you take a photo of the notice and it translates the text into local languages.",
                        response: "Brilliant! This uses AI translation technology to solve a real communication problem in your community.",
                        isOptimal: true
                    },
                    {
                        text: "Teach everyone English.",
                        response: "A noble goal, but an app helps solve the immediate problem right now.",
                        isOptimal: false
                    }
                ]
            }
        }
    },
    'ai-and-society': {
        title: 'AI and Society',
        description: 'Think about the big picture: how will AI shape the future of our world?',
        lessonContent: {
            title: 'Our Future with AI',
            introduction: "AI is not just technology; it's a force that will shape how we live, learn, and relate to each other. As we move into the future, we need to think about the big questions to ensure AI benefits all of humanity.",
            sections: [
                {
                    heading: 'The Digital Divide',
                    content: "We must ensure that AI doesn't leave people behind. If only rich countries or people have access to AI tools, the gap between rich and poor could get bigger. This is called the 'digital divide'. We need to work to make sure AI education and tools are available to everyone, everywhere, including in Africa."
                },
                {
                    heading: 'Human Connection',
                    content: "As machines get smarter, we need to remember what makes us human. Empathy, kindness, and genuine connection are things AI cannot replace. We should use AI to handle tasks, so we have more time to spend with our families, friends, and communities. We shouldn't let screens replace real human faces."
                },
                {
                    heading: 'Your Voice Matters',
                    content: "The future of AI is not set in stone. It is being built right now. You have a voice in this future. By learning about AI, you can participate in the conversation. You can become a creator, an ethicist, or a leader who guides how this technology is used in your community. You are the future of AI."
                }
            ],
            summary: "The future of AI depends on us. We must bridge the digital divide, prioritize human connection, and actively participate in shaping how this technology is developed and used for the good of society.",
            quiz: {
                questions: [
                    {
                        type: 'multiple-choice',
                        question: "What is the 'digital divide'?",
                        options: ["A math problem", "The gap between those who have access to technology and those who don't", "A crack in a computer screen", "Dividing numbers with a calculator"],
                        correctAnswerIndex: 1,
                        explanation: "Correct. It is a major social issue that we need to address to ensure fair access to the future.",
                        hint: "It refers to the gap or division in access to tech.",
                    },
                    {
                        type: 'multiple-choice',
                        question: "Can AI replace human empathy and connection?",
                        options: ["Yes, robots are better friends", "No, these are uniquely human qualities", "Maybe in 1000 years", "AI doesn't exist"],
                        correctAnswerIndex: 1,
                        explanation: "Exactly. While AI can simulate conversation, it cannot truly feel or offer genuine human connection.",
                        hint: "Think about the emotional difference between a machine and a person.",
                    },
                    {
                        type: 'multiple-choice',
                        question: "Why should you learn about AI?",
                        options: ["To become a robot", "To ensure you can help shape the future of technology", "Because it's required by law", "To hack computers"],
                        correctAnswerIndex: 1,
                        explanation: "Yes! Knowledge gives you the power to participate and lead in the new world.",
                        hint: "Learning gives you a voice in the future.",
                    }
                ]
            },
            scenario: {
                title: "The Town Hall",
                situation: "Your town is holding a meeting about using AI cameras for security. You are worried about privacy. What do you do?",
                choices: [
                    {
                        text: "Stay home. Adults know best.",
                        response: "Your voice matters! Young people often understand tech better than older generations.",
                        isOptimal: false
                    },
                    {
                        text: "Attend the meeting and politely ask questions about how the data will be stored and who will see it.",
                        response: "Excellent citizenship! Using your knowledge to ask important questions helps your community make better decisions.",
                        isOptimal: true
                    },
                    {
                        text: "Protest by breaking the cameras.",
                        response: "No, vandalism is not a constructive way to express your opinion.",
                        isOptimal: false
                    }
                ]
            }
        }
    }
  },
  tooltips: {
    "artificial intelligence": "Computer systems that can perform tasks that normally require human intelligence.",
    "ai": "Short for Artificial Intelligence.",
    "algorithm": "A set of rules or instructions given to an AI, neural network, or other machine to help it learn on its own.",
    "model": "A program that has been trained on a set of data to perform specific tasks.",
    "training": "The process of teaching an AI model by showing it examples.",
    "data": "Facts and statistics collected together for reference or analysis. The 'food' for AI.",
    "bias": "Prejudice in favor of or against one thing, person, or group compared with another, usually in a way considered to be unfair.",
    "generative ai": "A type of AI that can create new content, including text, images, audio, video, and computer code.",
    "prompt": "The input or instruction you give to an AI to get a response.",
    "neural network": "A computer system modeled on the human brain and nervous system.",
    "deepfake": "An image or recording that has been convincingly altered and manipulated to misrepresent someone as doing or saying something that was not actually done or said.",
  },
  paths: {
    [LearningPath.Explorer]: {
      name: "Explorer",
      description: "Curious about AI? Start here to learn the basics.",
    },
    [LearningPath.Creator]: {
      name: "Creator",
      description: "Want to build with AI? Learn prompts and tools.",
    },
    [LearningPath.Innovator]: {
      name: "Innovator",
      description: "Business minded? See how AI changes work.",
    },
    [LearningPath.Ethicist]: {
      name: "Ethicist",
      description: "Care about safety? Study AI risks and impact.",
    },
  },
  badges: {
    'first-step': { name: "First Step", description: "Completed your first lesson." },
    'ai-graduate': { name: "AI Graduate", description: "Completed an entire learning path." },
    'point-pioneer': { name: "Point Pioneer", description: "Earned 100 points." },
    'top-contender': { name: "Top Contender", description: "Reached top 3 on leaderboard." },
    'first-win': { name: "Practice Partner", description: "First peer practice session." },
    'multiplayer-maestro': { name: "Practice Pro", description: "10 peer sessions." },
    'bronze-supporter': { name: "Bronze Supporter", description: "Supporter Badge (Bronze)." },
    'silver-patron': { name: "Silver Patron", description: "Supporter Badge (Silver)." },
    'gold-champion': { name: "Gold Champion", description: "Supporter Badge (Gold)." },
  },
};

export const translations: Record<string, Translation> = {
  [Language.English]: englishTranslations,
};

export const useTranslations = () => {
  const context = useContext(AppContext);
  const language = context?.language || Language.English;
  return translations[language] || englishTranslations;
};