import { User, LearningPath, FeedbackType, Language, GameSession, Player, Wallet, Transaction, UserRole, SchoolClass, StudentProgress } from '../types';
import { CURRICULUM_MODULES } from '../constants';
import { englishTranslations } from '../i18n'; 
import { auth, googleProvider, db, storage } from './firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signOut, sendPasswordResetEmail, signInWithPopup, deleteUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';

// Use localStorage to simulate a persistent database for Games and Classes only
const DB_KEY_GAMES = 'alk_games_by_code';
const DB_KEY_CLASSES = 'alk_classes_by_id';

const SIMULATED_DELAY = 300; // ms
const DAILY_TRANSFER_LIMIT = 200;

// --- Helper Functions ---
const readDb = <T>(key: string, defaultValue: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const writeDb = <T>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const initializeDefaultWallet = (points: number): Wallet => ({
    balance: points,
    transactions: [],
    dailyTransfer: { date: getTodayDateString(), amount: 0 },
});

// --- API Service ---
export const apiService = {
  async getUserByEmail(email: string): Promise<User | null> {
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', email.toLowerCase()));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return null;
        }
        
        // Return the first matching user
        return querySnapshot.docs[0].data() as User;
    } catch (error) {
        console.error("Error fetching user by email:", error);
        return null;
    }
  },

  async authenticate(email: string, password?: string): Promise<User> {
      try {
          if (!password) throw new Error("Password required");
          // Firebase Authentication
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const firebaseUser = userCredential.user;
          const lowerEmail = firebaseUser.email!.toLowerCase();

          // Check if email is verified
          if (!firebaseUser.emailVerified) {
              // Try to resend verification email, but don't block if it fails (e.g. rate limit)
              try {
                  await sendEmailVerification(firebaseUser);
              } catch (e) {
                  // Ignore rate limit errors or other send failures, proceed to enforce verification
              }
              await signOut(auth);
              throw new Error("EmailVerificationRequired");
          }

          // Fetch User from Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
              return userDoc.data() as User;
          } else {
              // User authenticated but not in DB (legacy or error during signup), create them now
              const newUser: User = {
                  id: firebaseUser.uid,
                  googleId: firebaseUser.uid,
                  email: lowerEmail,
                  name: firebaseUser.displayName || email.split('@')[0],
                  role: UserRole.Student,
                  points: 0,
                  level: null,
                  completedModules: [],
                  badges: [],
                  multiplayerStats: { wins: 0, gamesPlayed: 0 },
                  wallet: initializeDefaultWallet(0),
                  lastLoginDate: getTodayDateString(),
                  loginStreak: 1,
                  certificateLevel: 'basic',
                  theme: 'default',
                  avatarId: 'avatar-01',
                  unlockedVoices: [],
                  tutorTokens: 0,
                  quizRewinds: 0,
                  unlockedBanners: [],
                  unlockedThemes: ['default'],
                  isPro: false,
              };
              await setDoc(userDocRef, newUser);
              return newUser;
          }
      } catch (error: any) {
          if (error.message !== "EmailVerificationRequired") {
              console.error("Firebase Login Error:", error);
          }
          if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-email') {
              throw new Error("Password or Email Incorrect");
          }
          throw error;
      }
  },

  async signInWithGoogle(): Promise<User> {
      try {
          const result = await signInWithPopup(auth, googleProvider);
          const firebaseUser = result.user;
          const lowerEmail = firebaseUser.email!.toLowerCase();

          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
              return userDoc.data() as User;
          } else {
              // Create new user from Google profile
              const newUser: User = {
                  id: firebaseUser.uid,
                  googleId: firebaseUser.uid,
                  email: lowerEmail,
                  name: firebaseUser.displayName || 'User',
                  role: UserRole.Student, // Default role
                  level: LearningPath.Explorer, // Default level
                  points: 0,
                  completedModules: [],
                  badges: [],
                  multiplayerStats: { wins: 0, gamesPlayed: 0 },
                  wallet: initializeDefaultWallet(0),
                  lastLoginDate: getTodayDateString(),
                  loginStreak: 1,
                  certificateLevel: 'basic',
                  theme: 'default',
                  avatarId: 'avatar-01', // Default avatar ID
                  avatarUrl: firebaseUser.photoURL || undefined,
                  unlockedVoices: [],
                  tutorTokens: 0,
                  quizRewinds: 0,
                  unlockedBanners: [],
                  unlockedThemes: ['default'],
                  isPro: false,
              };
              await setDoc(userDocRef, newUser);
              return newUser;
          }
      } catch (error) {
          console.error("Google Sign In Error:", error);
          throw error;
      }
  },

  async resetPassword(email: string): Promise<{ success: boolean }> {
      try {
          await sendPasswordResetEmail(auth, email);
          return { success: true };
      } catch (error: any) {
          console.error("Reset Password Error:", error);
          throw error;
      }
  },

  async handleUserLogin(email: string): Promise<{ user: User, newTransactions: Transaction[] }> {
    // This is called AFTER authentication to update streaks/points
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', email.toLowerCase()));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error("User not found in DB");
        }

        const userDoc = querySnapshot.docs[0];
        let user = userDoc.data() as User;
        let newTransactions: Transaction[] = [];

        // --- Backward compatibility & Initialization ---
        if (!user.wallet) user.wallet = initializeDefaultWallet(user.points);
        if (!user.lastLoginDate) user.lastLoginDate = '';
        if (!user.loginStreak) user.loginStreak = 0;
        
        const today = getTodayDateString();
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        // --- Daily Login Streak Logic ---
        if (user.lastLoginDate !== today) {
          let newStreak = 1;
          if (user.lastLoginDate === yesterday) {
            newStreak = user.loginStreak + 1;
          }
          
          const pointsEarned = 10;
          const streakTransaction: Transaction = {
              id: `txn-${Date.now()}`,
              type: 'earn',
              description: `Daily login streak (${newStreak} day${newStreak > 1 ? 's' : ''})`,
              amount: pointsEarned,
              timestamp: Date.now(),
          };

          user.points += pointsEarned;
          user.wallet.balance = user.points;
          user.wallet.transactions.unshift(streakTransaction);
          user.lastLoginDate = today;
          user.loginStreak = newStreak;
          newTransactions.push(streakTransaction);
        }
        
        if (user.wallet.dailyTransfer.date !== today) {
            user.wallet.dailyTransfer = { date: today, amount: 0 };
        }
        
        // Update Firestore
        await updateDoc(userDoc.ref, {
            points: user.points,
            wallet: user.wallet,
            lastLoginDate: user.lastLoginDate,
            loginStreak: user.loginStreak
        });
        
        return { user, newTransactions };
    } catch (error) {
        console.error("Handle User Login Error:", error);
        throw error;
    }
  },

  async createUser(details: { name: string, email: string, password?: string, level: LearningPath | null, role: UserRole, googleId: string, phoneNumber?: string, country?: string }): Promise<User> {
    try {
        if (!details.password) throw new Error("Password required");

        // Firebase Auth Create
        const userCredential = await createUserWithEmailAndPassword(auth, details.email, details.password);
        const firebaseUser = userCredential.user;
        const lowercasedEmail = details.email.toLowerCase();

        // Send verification email
        await sendEmailVerification(firebaseUser);

        // Create Firestore Entry IMMEDIATELY
        const newUser: User = {
            id: firebaseUser.uid,
            googleId: details.googleId,
            email: lowercasedEmail,
            name: details.name,
            phoneNumber: details.phoneNumber,
            country: details.country,
            level: details.level,
            role: details.role,
            points: 0,
            completedModules: [],
            badges: [],
            multiplayerStats: { wins: 0, gamesPlayed: 0 },
            wallet: initializeDefaultWallet(0),
            lastLoginDate: getTodayDateString(),
            loginStreak: 1,
            certificateLevel: 'basic',
            theme: 'default',
            avatarId: 'avatar-01',
            unlockedVoices: [],
            tutorTokens: 0,
            quizRewinds: 0,
            unlockedBanners: [],
            unlockedThemes: ['default'],
            isPro: false,
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), newUser);

        // Sign out immediately so they have to login after verifying
        await signOut(auth);
        
        // Throw specific error to trigger UI flow
        throw new Error("EmailVerificationRequired");

    } catch (error: any) {
        if (error.message !== "EmailVerificationRequired") {
            console.error("Firebase Create User Error:", error);
        }
        if (error.code === 'auth/email-already-in-use') {
            throw new Error("User already exists");
        }
        throw error;
    }
  },

  async updateUser(email: string, updates: Partial<Omit<User, 'id' | 'email' | 'googleId'>>): Promise<User | null> {
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', email.toLowerCase()));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) return null;

        const userDoc = querySnapshot.docs[0];
        let userData = userDoc.data() as User;

        if (updates.badges) updates.badges = [...new Set([...userData.badges, ...updates.badges])];
        if (updates.completedModules) updates.completedModules = [...new Set([...userData.completedModules, ...updates.completedModules])];
        if (updates.unlockedVoices) updates.unlockedVoices = [...new Set([...userData.unlockedVoices, ...updates.unlockedVoices])];
        if (updates.unlockedBanners) updates.unlockedBanners = [...new Set([...userData.unlockedBanners, ...updates.unlockedBanners])];
        if (updates.unlockedThemes) updates.unlockedThemes = [...new Set([...userData.unlockedThemes, ...updates.unlockedThemes])];
        
        if(updates.wallet) {
            userData.points = updates.wallet.balance;
        }

        const finalUpdates = { ...updates };
        if (updates.wallet) {
            finalUpdates.points = updates.wallet.balance;
        }

        await updateDoc(userDoc.ref, finalUpdates);
        
        return { ...userData, ...finalUpdates };
    } catch (error) {
        console.error("Update User Error:", error);
        return null;
    }
  },

  async deleteUserAccount(uid: string): Promise<void> {
      try {
          // 1. Delete from Firestore
          await deleteDoc(doc(db, 'users', uid));
          
          // 2. Delete from Storage (Delete all files in folder)
          const folderRef = ref(storage, `user_uploads/${uid}`);
          try {
              const listResult = await listAll(folderRef);
              // Map all items to delete promises
              const deletePromises = listResult.items.map((itemRef) => deleteObject(itemRef));
              await Promise.all(deletePromises);
          } catch(e) {
              console.warn("Error deleting user storage files or folder empty:", e);
              // Continue to delete auth even if storage fails (e.g. folder doesn't exist)
          }

          // 3. Delete from Auth
          const user = auth.currentUser;
          if (user && user.uid === uid) {
              await deleteUser(user);
          }
      } catch (error) {
          console.error("Error deleting account:", error);
          throw error;
      }
  },

  async uploadProfilePicture(uid: string, file: File): Promise<string> {
      try {
          const storageRef = ref(storage, `user_uploads/${uid}/profile_picture`);
          await uploadBytes(storageRef, file);
          const downloadUrl = await getDownloadURL(storageRef);
          
          // Update Firestore
          const userDocRef = doc(db, 'users', uid);
          await updateDoc(userDocRef, {
              avatarUrl: downloadUrl,
              avatarId: '' // Clear predefined avatar selection
          });
          
          return downloadUrl;
      } catch (error) {
          console.error("Error uploading profile picture:", error);
          throw error;
      }
  },

  async deleteProfilePicture(uid: string): Promise<void> {
      try {
          const storageRef = ref(storage, `user_uploads/${uid}/profile_picture`);
          await deleteObject(storageRef);
          
          // Update Firestore
          const userDocRef = doc(db, 'users', uid);
          await updateDoc(userDocRef, {
              avatarUrl: null, // Firestore null deletes the field or sets it to null
              avatarId: 'avatar-01' // Reset to default
          });
      } catch (error) {
          console.error("Error deleting profile picture:", error);
          throw error;
      }
  },

  async linkChildAccount(parentEmail: string, childEmail: string): Promise<User> {
      try {
          // Verify child exists
          const childUser = await this.getUserByEmail(childEmail);
          if (!childUser) throw new Error("No student account found with that email.");
          if (childUser.role !== UserRole.Student) throw new Error("The provided email does not belong to a student account.");

          // Verify parent
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('email', '==', parentEmail.toLowerCase()));
          const querySnapshot = await getDocs(q);
          if (querySnapshot.empty) throw new Error("Parent account not found.");
          
          const parentDoc = querySnapshot.docs[0];
          const parentData = parentDoc.data() as User;

          // Check if child already linked elsewhere (Optional rule, keeping loose for now or strictly enforce?)
          // Assuming strict: check all users for childEmail match on parent role
          // Skipping complex query for now, relying on simplistic check

          await updateDoc(parentDoc.ref, { childEmail: childUser.email });
          return { ...parentData, childEmail: childUser.email };
      } catch (error) {
          throw error;
      }
  },

  async sendPoints(senderEmail: string, recipientEmail: string, amount: number, message: string): Promise<{ sender: User, recipient: User }> {
      // Transactional logic is complex in distributed systems. 
      // For this simplified app, we will do sequential updates.
      // In a real production app, use `runTransaction`.
      try {
          const sender = await this.getUserByEmail(senderEmail);
          const recipient = await this.getUserByEmail(recipientEmail);

          if (!sender) throw new Error("Sender not found.");
          if (!recipient) throw new Error("Recipient not found.");
          if (sender.email === recipient.email) throw new Error("You cannot send points to yourself.");
          if (amount <= 0) throw new Error("Amount must be positive.");
          if (sender.wallet.balance < amount) throw new Error("Insufficient points.");

          const today = getTodayDateString();
          
          // Update Sender Wallet
          const senderWallet = { ...sender.wallet };
          if (senderWallet.dailyTransfer.date !== today) {
              senderWallet.dailyTransfer = { date: today, amount: 0 };
          }
          if (senderWallet.dailyTransfer.amount + amount > DAILY_TRANSFER_LIMIT) {
              throw new Error(`Daily transfer limit of ${DAILY_TRANSFER_LIMIT} points exceeded.`);
          }

          senderWallet.balance -= amount;
          senderWallet.dailyTransfer.amount += amount;
          senderWallet.transactions.unshift({
              id: `txn-${Date.now()}`,
              type: 'send',
              description: `To ${recipient.name}${message ? `: "${message}"` : ''}`,
              amount,
              timestamp: Date.now(),
              to: recipient.name,
          });

          // Update Recipient Wallet
          const recipientWallet = { ...recipient.wallet };
          recipientWallet.balance += amount;
          recipientWallet.transactions.unshift({
              id: `txn-${Date.now() + 1}`,
              type: 'receive',
              description: `From ${sender.name}${message ? `: "${message}"` : ''}`,
              amount,
              timestamp: Date.now(),
              from: sender.name,
          });

          // Write to DB
          await this.updateUser(sender.email, { wallet: senderWallet, points: senderWallet.balance });
          await this.updateUser(recipient.email, { wallet: recipientWallet, points: recipientWallet.balance });

          return { 
              sender: { ...sender, wallet: senderWallet, points: senderWallet.balance }, 
              recipient: { ...recipient, wallet: recipientWallet, points: recipientWallet.balance }
          };

      } catch (error) {
          throw error;
      }
  },

  async redeemItem(userEmail: string, itemId: string, cost: number, payload: any): Promise<User> {
      try {
          const user = await this.getUserByEmail(userEmail);
          if (!user) throw new Error("User not found.");
          if (user.wallet.balance < cost) throw new Error("Insufficient points.");

          const updates: Partial<User> = {};
          
          // Apply payload effects
          if (payload.badgeId) updates.badges = [...user.badges, payload.badgeId];
          if (payload.certificateLevel) updates.certificateLevel = payload.certificateLevel;
          if (payload.unlockTheme) {
              updates.unlockedThemes = user.unlockedThemes ? [...user.unlockedThemes, payload.unlockTheme] : ['default', payload.unlockTheme];
          }
          if (payload.addTutorTokens) updates.tutorTokens = (user.tutorTokens || 0) + payload.addTutorTokens;
          if (payload.addQuizRewinds) updates.quizRewinds = (user.quizRewinds || 0) + payload.addQuizRewinds;
          if (payload.unlockBanner) {
              updates.unlockedBanners = user.unlockedBanners ? [...user.unlockedBanners, payload.unlockBanner] : [payload.unlockBanner];
          }
          if (payload.unlockVoice) {
              updates.unlockedVoices = user.unlockedVoices ? [...user.unlockedVoices, payload.unlockVoice] : [payload.unlockVoice];
          }

          // Update Wallet
          const newWallet = { ...user.wallet };
          newWallet.balance -= cost;
          newWallet.transactions.unshift({
              id: `txn-${Date.now()}`,
              type: 'spend',
              description: `Purchased item: ${itemId}`,
              amount: cost,
              timestamp: Date.now(),
          });
          
          updates.wallet = newWallet;
          updates.points = newWallet.balance;

          const updatedUser = await this.updateUser(user.email, updates);
          if (!updatedUser) throw new Error("Failed to update user");
          return updatedUser;
      } catch (error) {
          throw error;
      }
  },
  
  async getLeaderboard(): Promise<Array<Pick<User, 'name' | 'points'>>> {
     try {
         // In Firestore, you would index 'points' and use orderBy('points', 'desc').limit(10)
         const usersRef = collection(db, 'users');
         // Getting all users for client-side sorting as dataset is small in this demo. 
         // Real app should use server-side sorting.
         const querySnapshot = await getDocs(usersRef);
         
         const leaderboard = querySnapshot.docs
            .map(doc => ({ name: doc.data().name, points: doc.data().points }))
            .sort((a, b) => b.points - a.points);
            
         return leaderboard;
     } catch (error) {
         console.error("Leaderboard Error:", error);
         return [];
     }
  },

  async submitFeedback(userEmail: string, type: FeedbackType, message: string): Promise<{ success: boolean }> {
      // In a real app, this would write to a 'feedback' collection
      console.log("--- Feedback Submitted (Mock) ---");
      console.log("User:", userEmail);
      console.log("Type:", type);
      console.log("Message:", message);
      return { success: true };
  },

  // --- Class Management API (Keeping localStorage for now to minimize scope change impact) ---
  async createClass(teacherId: string, name: string): Promise<SchoolClass> {
    return new Promise((resolve) => {
        setTimeout(() => {
            const classes = readDb<Record<string, SchoolClass>>(DB_KEY_CLASSES, {});
            const classId = `cls-${Date.now()}`;
            const joinCode = `AIP-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
            const newClass: SchoolClass = {
                id: classId,
                teacherId,
                name,
                joinCode,
                students: [],
                assignedModules: [],
            };
            classes[classId] = newClass;
            writeDb(DB_KEY_CLASSES, classes);
            resolve(newClass);
        }, SIMULATED_DELAY);
    });
  },

  async getClassesForTeacher(teacherId: string): Promise<SchoolClass[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            const classes = readDb<Record<string, SchoolClass>>(DB_KEY_CLASSES, {});
            const teacherClasses = Object.values(classes).filter(c => c.teacherId === teacherId);
            resolve(teacherClasses);
        }, SIMULATED_DELAY);
    });
  },
  
  async getClassDetails(classId: string): Promise<SchoolClass | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const classes = readDb<Record<string, SchoolClass>>(DB_KEY_CLASSES, {});
        const schoolClass = classes[classId];
        
        if (schoolClass && schoolClass.students.length === 0) {
            const mockStudentNames = ['Abubakar', 'Bola', 'Chiamaka', 'David', 'Efe', 'Funke', 'Gozie'];
            const mockStudents: StudentProgress[] = mockStudentNames.map((name, i) => {
                const completedCount = Math.floor(Math.random() * (CURRICULUM_MODULES.length + 1));
                return {
                    studentId: `mock-student-${i}`,
                    studentName: name,
                    avatarId: `avatar-0${(i % 6) + 1}`,
                    completedModules: CURRICULUM_MODULES.slice(0, completedCount).map(m => m.id),
                };
            });
            schoolClass.students = mockStudents;
            classes[classId] = schoolClass;
            writeDb(DB_KEY_CLASSES, classes);
        }

        resolve(schoolClass || null);
      }, SIMULATED_DELAY);
    });
  },

  async assignModulesToClass(classId: string, moduleIds: string[]): Promise<SchoolClass> {
      return new Promise((resolve, reject) => {
          setTimeout(() => {
              const classes = readDb<Record<string, SchoolClass>>(DB_KEY_CLASSES, {});
              const schoolClass = classes[classId];
              if (!schoolClass) return reject(new Error("Class not found."));

              schoolClass.assignedModules = moduleIds;
              classes[classId] = schoolClass;
              writeDb(DB_KEY_CLASSES, classes);
              resolve(schoolClass);
          }, SIMULATED_DELAY);
      });
  },

  // --- Multiplayer API (Keeping localStorage for game sessions) ---
  async createGameSession(host: User, language: Language): Promise<GameSession> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const games = readDb<Record<string, GameSession>>(DB_KEY_GAMES, {});
        const gameCode = Math.random().toString(36).substring(2, 7).toUpperCase();
        
        const hostPlayer: Player = {
          id: host.id,
          name: host.name,
          score: 0,
          progressIndex: 0,
          language: language,
          streak: 0,
        };

        const newSession: GameSession = {
          code: gameCode,
          hostId: host.id,
          status: 'waiting',
          players: [hostPlayer],
          questions: [],
          createdAt: Date.now(),
          currentQuestionIndex: 0,
        };

        games[gameCode] = newSession;
        writeDb(DB_KEY_GAMES, games);
        resolve(newSession);
      }, SIMULATED_DELAY);
    });
  },

  async joinGameSession(gameCode: string, user: User, language: Language): Promise<GameSession> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const games = readDb<Record<string, GameSession>>(DB_KEY_GAMES, {});
            const session = games[gameCode];

            if (!session) return reject(new Error('Game not found.'));
            if (session.status !== 'waiting') return reject(new Error('Game has already started.'));
            if (session.players.length >= 10) return reject(new Error('Game is full.'));
            if (session.players.some(p => p.id === user.id)) { // Allow re-joining
                return resolve(session);
            }

            const newPlayer: Player = {
                id: user.id,
                name: user.name,
                score: 0,
                progressIndex: 0,
                language: language,
                streak: 0,
            };

            session.players.push(newPlayer);
            writeDb(DB_KEY_GAMES, games);
            resolve(session);
        }, SIMULATED_DELAY);
    });
  },

  async getGameSession(gameCode: string): Promise<GameSession> {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
            const games = readDb<Record<string, GameSession>>(DB_KEY_GAMES, {});
            const session = games[gameCode];
            if (session) {
                resolve(session);
            } else {
                reject(new Error('Game not found.'));
            }
        }, SIMULATED_DELAY / 3);
    });
  },

  async startGameSession(gameCode: string, hostId: string): Promise<GameSession> {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
            const games = readDb<Record<string, GameSession>>(DB_KEY_GAMES, {});
            const session = games[gameCode];
            
            if (!session) return reject(new Error('Game not found.'));
            if (session.hostId !== hostId) return reject(new Error('Only the host can start the game.'));
            if (session.status !== 'waiting') return reject(new Error('Game already in progress.'));
            
            // --- Generate Questions ---
            const allQuestions = CURRICULUM_MODULES.flatMap(module => {
                const moduleQuestions = englishTranslations.curriculum[module.id].lessonContent.quiz.questions;
                const multiplayerQuestions = [];
                for (let i = 0; i < moduleQuestions.length; i++) {
                    if (moduleQuestions[i].type === 'multiple-choice') {
                        multiplayerQuestions.push({
                            id: `${module.id}-q${i}`,
                            moduleId: module.id,
                            questionIndexInModule: i,
                        });
                    }
                }
                return multiplayerQuestions;
            });
            
            const shuffled = allQuestions.sort(() => 0.5 - Math.random());
            session.questions = shuffled.slice(0, 5);
            session.status = 'in-progress';
            session.currentQuestionIndex = 0;
            session.players.forEach(p => p.progressIndex = 0);

            writeDb(DB_KEY_GAMES, games);
            resolve(session);
        }, SIMULATED_DELAY);
      });
  },

  async submitAnswer(gameCode: string, userId: string, questionId: string, answerIndex: number, timeTakenMs: number): Promise<GameSession> {
     return new Promise((resolve, reject) => {
        setTimeout(async () => {
            const games = readDb<Record<string, GameSession>>(DB_KEY_GAMES, {});
            const session = games[gameCode];
            
            if (!session) return reject(new Error('Game not found.'));
            
            const player = session.players.find(p => p.id === userId);
            const question = session.questions[session.currentQuestionIndex];

            if (!player || !question || player.progressIndex > session.currentQuestionIndex) {
                return resolve(session);
            }
            if(question.id !== questionId) {
                return reject(new Error('Question mismatch.'));
            }

            const questionContent = englishTranslations.curriculum[question.moduleId].lessonContent.quiz.questions[question.questionIndexInModule];
            const isCorrect = questionContent.correctAnswerIndex === answerIndex;

            if (isCorrect) {
                player.score += 10;
                player.streak += 1;
            } else {
                player.streak = 0;
            }

            player.progressIndex = session.currentQuestionIndex + 1;

            const allPlayersAnswered = session.players.every(p => p.progressIndex > session.currentQuestionIndex);
            
            if (allPlayersAnswered) {
                const isLastQuestion = session.currentQuestionIndex === session.questions.length - 1;

                if (isLastQuestion) {
                    session.status = 'finished';
                    
                    for (const p of session.players) {
                        // We need to update user stats in Firestore
                        const usersRef = collection(db, 'users');
                        const q = query(usersRef, where('id', '==', p.id));
                        const snapshot = await getDocs(q);
                        
                        if (!snapshot.empty) {
                            const userDoc = snapshot.docs[0];
                            const userFromDb = userDoc.data() as User;
                            
                            const updates: Partial<Omit<User, 'id' | 'email' | 'googleId'>> = {};

                            const newStats = {
                                wins: userFromDb.multiplayerStats.wins,
                                gamesPlayed: userFromDb.multiplayerStats.gamesPlayed + 1,
                            };
                            updates.multiplayerStats = newStats;
                            updates.points = userFromDb.points + p.score;
                            
                            const newBadges = [...userFromDb.badges];
                            if (userFromDb.multiplayerStats.gamesPlayed === 0 && !newBadges.includes('first-win')) {
                               newBadges.push('first-win');
                            }
                            if (newStats.gamesPlayed >= 10 && !newBadges.includes('multiplayer-maestro')) {
                               newBadges.push('multiplayer-maestro');
                            }
                            if (newBadges.length > userFromDb.badges.length) {
                               updates.badges = newBadges;
                            }

                            await updateDoc(userDoc.ref, updates);
                        }
                    }
                } else {
                     session.currentQuestionIndex += 1;
                }
            }

            writeDb(DB_KEY_GAMES, games);
            resolve(session);

        }, SIMULATED_DELAY / 2);
     });
  }
};