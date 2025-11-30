import { User, LearningPath, FeedbackType, Language, GameSession, Player, Wallet, Transaction, UserRole, SchoolClass, StudentProgress } from '../types';
import { CURRICULUM_MODULES } from '../constants';
import { englishTranslations } from '../i18n'; 
import { auth, googleProvider, storage, db } from './firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signOut, sendPasswordResetEmail, signInWithPopup, deleteUser } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';

const DB_KEY_USERS = 'alk_users_by_email';
const DB_KEY_GAMES = 'alk_games_by_code';
const DB_KEY_CLASSES = 'alk_classes_by_id';

const SIMULATED_DELAY = 300; // ms
const DAILY_TRANSFER_LIMIT = 200;

const readDb = <T>(key: string, defaultValue: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const writeDb = <T>(key: string, data: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e: any) {
    if (e.name === 'QuotaExceededError') {
        console.error("LocalStorage quota exceeded. Cannot save data.");
    } else {
        console.error("Local storage write failed", e);
    }
  }
};

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const initializeDefaultWallet = (points: number): Wallet => ({
    balance: points,
    transactions: [],
    dailyTransfer: { date: getTodayDateString(), amount: 0 },
});

const initializeMockData = () => {
    const users = readDb<Record<string, User>>(DB_KEY_USERS, {});
    if (Object.keys(users).length === 0) {
        const amina: User = {
            id: 'user-amina-mock',
            googleId: 'mock-google-id',
            email: 'amina@example.com',
            name: 'Amina (Offline)',
            role: UserRole.Student,
            points: 250,
            level: LearningPath.Innovator,
            completedModules: ['what-is-ai', 'how-ai-works'],
            badges: ['first-step'],
            multiplayerStats: { wins: 0, gamesPlayed: 0 },
            wallet: initializeDefaultWallet(250),
            lastLoginDate: '',
            loginStreak: 0,
            certificateLevel: 'basic',
            theme: 'default',
            avatarId: 'avatar-01',
            unlockedVoices: [],
            tutorTokens: 2,
            quizRewinds: 5,
            unlockedBanners: [],
            unlockedThemes: ['default'],
            isPro: false,
        };
        users[amina.email.toLowerCase()] = amina;
        writeDb(DB_KEY_USERS, users);
    }
};

initializeMockData();

const mockGetUser = (email: string): User | null => {
    const users = readDb<Record<string, User>>(DB_KEY_USERS, {});
    return users[email.toLowerCase()] || null;
};

const mockSaveUser = (user: User) => {
    const users = readDb<Record<string, User>>(DB_KEY_USERS, {});
    users[user.email.toLowerCase()] = user;
    writeDb(DB_KEY_USERS, users);
};

// Helper to check for offline or invalid config errors
const isOfflineError = (error: any) => {
    return error.code === 'auth/network-request-failed' || 
           error.message?.includes('network-request-failed') ||
           error.code === 'auth/invalid-api-key' ||
           error.message?.includes('API key not valid') ||
           error.message?.includes('INVALID_ARGUMENT') ||
           error.code === 'unavailable';
};

export const apiService = {
  async getUserByEmail(email: string): Promise<User | null> {
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', email.toLowerCase()));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return mockGetUser(email); // Fallback to local if not found in cloud
        }
        const user = querySnapshot.docs[0].data() as User;
        mockSaveUser(user); // Sync to local
        return user;
    } catch (error: any) {
        console.warn("Firebase error in getUserByEmail, trying mock DB:", error.code || error.message);
        return mockGetUser(email);
    }
  },

  async authenticate(email: string, password?: string): Promise<User> {
      try {
          if (!password) throw new Error("Password required");
          
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const firebaseUser = userCredential.user;

          // Mandatory Email Verification Check
          if (!firebaseUser.emailVerified) {
              await signOut(auth);
              throw new Error("EmailVerificationRequired");
          }

          const lowerEmail = firebaseUser.email!.toLowerCase();
          
          let user: User | null = null;
          
          // Try Firestore first
          try {
              const userDocRef = doc(db, 'users', firebaseUser.uid);
              const userDoc = await getDoc(userDocRef);
              if (userDoc.exists()) {
                  user = userDoc.data() as User;
                  mockSaveUser(user); // Sync local
              }
          } catch (e) {
              console.warn("Firestore fetch failed during auth, checking local");
          }

          if (!user) {
              user = mockGetUser(lowerEmail);
          }

          // If auth succeeds but no local profile (e.g. cleared cache), reconstruct a basic one
          if (!user) {
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
              
              // Try to save to Firestore if online
              try {
                  await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
              } catch (e) {
                  console.warn("Failed to create user in Firestore");
              }
              
              mockSaveUser(newUser);
              return newUser;
          }

          return user;
      } catch (error: any) {
          if (error.message === "EmailVerificationRequired") {
              throw error;
          }

          if (isOfflineError(error)) {
              console.warn("Firebase Auth network/config error. Switching to Offline/Mock mode.");
              const user = mockGetUser(email);
              if (user) {
                  return user;
              } else {
                  if (email === 'amina@example.com' && password === 'password123') {
                      initializeMockData();
                      return mockGetUser(email)!;
                  }
                  throw new Error("Offline mode: User not found locally.");
              }
          }
          
          console.error("Firebase Login Error:", error);
          if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-email') {
              throw new Error("Password or Email Incorrect");
          }
          throw error;
      }
  },

  async signInWithGoogle(): Promise<{ user: User | null, googleCreds: { uid: string, email: string, displayName: string, photoURL: string | null } }> {
      try {
          const result = await signInWithPopup(auth, googleProvider);
          const firebaseUser = result.user;
          const lowerEmail = firebaseUser.email!.toLowerCase();

          // Try Firestore
          try {
              const userDocRef = doc(db, 'users', firebaseUser.uid);
              const userDoc = await getDoc(userDocRef);
              if (userDoc.exists()) {
                  const user = userDoc.data() as User;
                  mockSaveUser(user);
                  return { 
                      user, 
                      googleCreds: { uid: firebaseUser.uid, email: lowerEmail, displayName: firebaseUser.displayName || '', photoURL: firebaseUser.photoURL } 
                  };
              }
          } catch(e) {
              console.warn("Firestore check failed for Google Sign In");
          }

          const user = mockGetUser(lowerEmail);

          if (user) {
              return { 
                  user, 
                  googleCreds: { uid: firebaseUser.uid, email: lowerEmail, displayName: firebaseUser.displayName || '', photoURL: firebaseUser.photoURL } 
              };
          } else {
              return { 
                  user: null, 
                  googleCreds: { uid: firebaseUser.uid, email: lowerEmail, displayName: firebaseUser.displayName || '', photoURL: firebaseUser.photoURL } 
              };
          }
      } catch (error: any) {
          console.error("Google Sign In Error:", error);
          if (isOfflineError(error)) {
              throw new Error("Network error. Please check your connection or try email sign-in.");
          }
          throw error;
      }
  },

  async resetPassword(email: string): Promise<{ success: boolean }> {
      try {
          await sendPasswordResetEmail(auth, email);
          return { success: true };
      } catch (error: any) {
          console.error("Reset Password Error:", error);
          if (isOfflineError(error)) return { success: true };
          throw error;
      }
  },

  async handleUserLogin(email: string): Promise<{ user: User, newTransactions: Transaction[] }> {
    try {
        let user: User | null = await this.getUserByEmail(email);

        if (!user) {
            throw new Error("User not found");
        }

        let newTransactions: Transaction[] = [];

        if (!user.wallet) user.wallet = initializeDefaultWallet(user.points);
        if (!user.lastLoginDate) user.lastLoginDate = '';
        if (!user.loginStreak) user.loginStreak = 0;
        
        const today = getTodayDateString();
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
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
        
        // Sync back to Firestore
        try {
            await updateDoc(doc(db, 'users', user.id), {
                points: user.points,
                wallet: user.wallet,
                lastLoginDate: user.lastLoginDate,
                loginStreak: user.loginStreak
            });
        } catch (e) {
            console.warn("Failed to sync login stats to Firestore");
        }
        
        mockSaveUser(user);
        
        return { user, newTransactions };
    } catch (error) {
        console.error("Handle User Login Error:", error);
        throw error;
    }
  },

  async createUser(details: { name: string, email: string, password?: string, level: LearningPath | null, role: UserRole, googleId: string, phoneNumber?: string, country?: string, photo?: File | null, avatarUrl?: string }): Promise<User> {
    try {
        let firebaseUser;
        let isNewAuth = false;
        
        if (details.password) {
            const userCredential = await createUserWithEmailAndPassword(auth, details.email, details.password);
            firebaseUser = userCredential.user;
            isNewAuth = true;
        } else {
            firebaseUser = auth.currentUser;
            if (!firebaseUser || firebaseUser.email?.toLowerCase() !== details.email.toLowerCase()) {
                throw new Error("Authentication error. Please try signing up again.");
            }
        }

        // Send Email Verification for password-based signups
        if (isNewAuth) {
            await sendEmailVerification(firebaseUser);
        }

        const lowercasedEmail = details.email.toLowerCase();
        let avatarUrl: string | undefined = details.avatarUrl;
        
        if (details.photo) {
            try {
                const storageRef = ref(storage, `user_uploads/${firebaseUser.uid}/profile_picture`);
                await uploadBytes(storageRef, details.photo);
                avatarUrl = await getDownloadURL(storageRef);
            } catch (uploadError) {
                console.error("Failed to upload profile picture during signup:", uploadError);
            }
        }

        const newUser: User = {
            id: firebaseUser.uid,
            googleId: details.googleId,
            email: lowercasedEmail,
            name: details.name,
            phoneNumber: details.phoneNumber,
            country: details.country,
            avatarUrl: avatarUrl,
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

        // Save to Firestore
        await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
        
        // Save locally
        mockSaveUser(newUser);

        if (isNewAuth) {
            // Sign out immediately so they have to login after verifying
            await signOut(auth);
            throw new Error("EmailVerificationRequired");
        }

        return newUser;

    } catch (error: any) {
        if (error.message === "EmailVerificationRequired") {
            throw error;
        }

        if (isOfflineError(error)) {
             console.warn("Firebase Network Error. Creating user locally.");
             const lowercasedEmail = details.email.toLowerCase();
             const existing = mockGetUser(lowercasedEmail);
             if (existing) throw new Error("User already exists locally.");

             const newUser: User = {
                id: `local-${Date.now()}`,
                googleId: details.googleId || `gid-${Date.now()}`,
                email: lowercasedEmail,
                name: details.name,
                phoneNumber: details.phoneNumber,
                country: details.country,
                avatarUrl: details.avatarUrl,
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
            mockSaveUser(newUser);
            return newUser;
        }

        console.error("Create User Error:", error);
        if (error.code === 'auth/email-already-in-use') {
            throw new Error("User already exists");
        }
        throw error;
    }
  },

  async updateUser(uid: string, updates: Partial<Omit<User, 'id' | 'email' | 'googleId'>>): Promise<User | null> {
    try {
        const userRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            
            // Merge arrays to prevent overwriting
            if (updates.badges) updates.badges = [...new Set([...userData.badges, ...updates.badges])];
            if (updates.completedModules) updates.completedModules = [...new Set([...userData.completedModules, ...updates.completedModules])];
            if (updates.unlockedVoices) updates.unlockedVoices = [...new Set([...userData.unlockedVoices, ...updates.unlockedVoices])];
            if (updates.unlockedBanners) updates.unlockedBanners = [...new Set([...userData.unlockedBanners, ...updates.unlockedBanners])];
            if (updates.unlockedThemes) updates.unlockedThemes = [...new Set([...userData.unlockedThemes, ...updates.unlockedThemes])];
            
            if(updates.wallet) {
                // Ensure balance sync
                updates.points = updates.wallet.balance;
            }

            await updateDoc(userRef, updates);
            const updatedData = { ...userData, ...updates };
            mockSaveUser(updatedData);
            return updatedData;
        }
    } catch (e) {
        console.warn("Update User failed in cloud, trying local:", e);
    }

    // Fallback to local update
    const localUsers = readDb<Record<string, User>>(DB_KEY_USERS, {});
    const userEmail = Object.keys(localUsers).find(email => localUsers[email].id === uid);
    
    if (userEmail) {
            const localUser = localUsers[userEmail];
            
            if (updates.badges) updates.badges = [...new Set([...localUser.badges, ...updates.badges])];
            if (updates.completedModules) updates.completedModules = [...new Set([...localUser.completedModules, ...updates.completedModules])];
            if (updates.unlockedVoices) updates.unlockedVoices = [...new Set([...localUser.unlockedVoices, ...updates.unlockedVoices])];
            if (updates.unlockedBanners) updates.unlockedBanners = [...new Set([...localUser.unlockedBanners, ...updates.unlockedBanners])];
            if (updates.unlockedThemes) updates.unlockedThemes = [...new Set([...localUser.unlockedThemes, ...updates.unlockedThemes])];
            
            const mergedUser = { ...localUser, ...updates };
            if(updates.wallet) mergedUser.points = updates.wallet.balance;
            
            mockSaveUser(mergedUser);
            return mergedUser;
    }
    return null;
  },

  async deleteUserAccount(uid: string): Promise<void> {
      try {
          // Delete from Firestore
          await deleteDoc(doc(db, 'users', uid));

          // Delete from Storage
          const deleteStorageFolder = async (storageRef: any) => {
              try {
                  const listResult = await listAll(storageRef);
                  await Promise.all(listResult.items.map((item) => deleteObject(item)));
                  await Promise.all(listResult.prefixes.map((prefix) => deleteStorageFolder(prefix)));
              } catch (e: any) {
                  if (e.code !== 'storage/object-not-found') console.warn("Error deleting storage path:", e);
              }
          };
          const folderRef = ref(storage, `user_uploads/${uid}`);
          await deleteStorageFolder(folderRef);
          
          // Delete Auth User
          const user = auth.currentUser;
          if (user && user.uid === uid) await deleteUser(user);
          
          // Clean Local
          const localUsers = readDb<Record<string, User>>(DB_KEY_USERS, {});
          const userEmail = Object.keys(localUsers).find(email => localUsers[email].id === uid);
          if (userEmail) {
              delete localUsers[userEmail];
              writeDb(DB_KEY_USERS, localUsers);
          }

      } catch (error: any) {
          if (isOfflineError(error)) {
              console.warn("Network failed during delete, removed local data.");
              const localUsers = readDb<Record<string, User>>(DB_KEY_USERS, {});
              const userEmail = Object.keys(localUsers).find(email => localUsers[email].id === uid);
              if (userEmail) {
                  delete localUsers[userEmail];
                  writeDb(DB_KEY_USERS, localUsers);
              }
              return;
          }
          console.error("Error deleting account:", error);
          throw error;
      }
  },

  async uploadProfilePicture(uid: string, file: File): Promise<string> {
      try {
          const storageRef = ref(storage, `user_uploads/${uid}/profile_picture`);
          await uploadBytes(storageRef, file);
          const downloadUrl = await getDownloadURL(storageRef);
          
          await this.updateUser(uid, { avatarUrl: downloadUrl, avatarId: '' });
          return downloadUrl;
      } catch (error: any) {
          if (isOfflineError(error)) throw new Error("Offline: Cannot upload images.");
          console.error("Error uploading profile picture:", error);
          throw error;
      }
  },

  async deleteProfilePicture(uid: string): Promise<void> {
      try {
          const storageRef = ref(storage, `user_uploads/${uid}/profile_picture`);
          await deleteObject(storageRef).catch(error => { if (error.code !== 'storage/object-not-found') throw error; });
          
          await this.updateUser(uid, { avatarUrl: null as any, avatarId: 'avatar-01' });
      } catch (error: any) {
          console.error("Error deleting profile picture:", error);
          throw error;
      }
  },

  async linkChildAccount(parentEmail: string, childEmail: string): Promise<User> {
      try {
          const childUser = await this.getUserByEmail(childEmail);
          if (!childUser) throw new Error("No student account found with that email.");
          if (childUser.role !== UserRole.Student) throw new Error("The provided email does not belong to a student account.");
          const parentUser = await this.getUserByEmail(parentEmail);
          if (!parentUser) throw new Error("Parent account not found.");
          
          const updated = await this.updateUser(parentUser.id, { childEmail: childUser.email });
          return updated!;
      } catch (error) { throw error; }
  },

  async sendPoints(senderEmail: string, recipientEmail: string, amount: number, message: string): Promise<{ sender: User, recipient: User }> {
      try {
          const sender = await this.getUserByEmail(senderEmail);
          const recipient = await this.getUserByEmail(recipientEmail);
          if (!sender) throw new Error("Sender not found.");
          if (!recipient) throw new Error("Recipient not found.");
          if (sender.email === recipient.email) throw new Error("You cannot send points to yourself.");
          if (amount <= 0) throw new Error("Amount must be positive.");
          if (sender.wallet.balance < amount) throw new Error("Insufficient points.");

          const today = getTodayDateString();
          const senderWallet = { ...sender.wallet };
          if (senderWallet.dailyTransfer.date !== today) senderWallet.dailyTransfer = { date: today, amount: 0 };
          if (senderWallet.dailyTransfer.amount + amount > DAILY_TRANSFER_LIMIT) throw new Error(`Daily transfer limit of ${DAILY_TRANSFER_LIMIT} points exceeded.`);

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

          const updatedSender = await this.updateUser(sender.id, { wallet: senderWallet, points: senderWallet.balance });
          const updatedRecipient = await this.updateUser(recipient.id, { wallet: recipientWallet, points: recipientWallet.balance });

          return { 
              sender: updatedSender!, 
              recipient: updatedRecipient!
          };
      } catch (error) { throw error; }
  },

  async redeemItem(userEmail: string, itemId: string, cost: number, payload: any): Promise<User> {
      try {
          const user = await this.getUserByEmail(userEmail);
          if (!user) throw new Error("User not found.");
          if (user.wallet.balance < cost) throw new Error("Insufficient points.");

          const updates: Partial<User> = {};
          if (payload.badgeId) updates.badges = [...user.badges, payload.badgeId];
          if (payload.certificateLevel) updates.certificateLevel = payload.certificateLevel;
          if (payload.unlockTheme) updates.unlockedThemes = user.unlockedThemes ? [...user.unlockedThemes, payload.unlockTheme] : ['default', payload.unlockTheme];
          if (payload.addTutorTokens) updates.tutorTokens = (user.tutorTokens || 0) + payload.addTutorTokens;
          if (payload.addQuizRewinds) updates.quizRewinds = (user.quizRewinds || 0) + payload.addQuizRewinds;
          if (payload.unlockBanner) updates.unlockedBanners = user.unlockedBanners ? [...user.unlockedBanners, payload.unlockBanner] : [payload.unlockBanner];
          if (payload.unlockVoice) updates.unlockedVoices = user.unlockedVoices ? [...user.unlockedVoices, payload.unlockVoice] : [payload.unlockVoice];

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

          const updatedUser = await this.updateUser(user.id, updates);
          if (!updatedUser) throw new Error("Failed to update user");
          return updatedUser;
      } catch (error) { throw error; }
  },
  
  async getLeaderboard(): Promise<Array<Pick<User, 'name' | 'points'>>> {
     try {
         const usersRef = collection(db, 'users');
         const querySnapshot = await getDocs(usersRef);
         return querySnapshot.docs.map(doc => ({ name: doc.data().name, points: doc.data().points })).sort((a, b) => b.points - a.points);
     } catch (error: any) {
         if (isOfflineError(error) || error.message?.includes('network')) {
             const users = readDb<Record<string, User>>(DB_KEY_USERS, {});
             return Object.values(users).map(({ name, points }) => ({ name, points })).sort((a, b) => b.points - a.points);
         }
         console.error("Leaderboard Error:", error);
         return [];
     }
  },

  async submitFeedback(userEmail: string, type: FeedbackType, message: string): Promise<{ success: boolean }> {
      console.log("--- Feedback Submitted (Mock) ---", userEmail, type, message);
      return { success: true };
  },

  async createClass(teacherId: string, name: string): Promise<SchoolClass> {
    return new Promise((resolve) => {
        setTimeout(() => {
            const classes = readDb<Record<string, SchoolClass>>(DB_KEY_CLASSES, {});
            const classId = `cls-${Date.now()}`;
            const joinCode = `AIP-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
            const newClass: SchoolClass = { id: classId, teacherId, name, joinCode, students: [], assignedModules: [] };
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
            resolve(Object.values(classes).filter(c => c.teacherId === teacherId));
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

  async createGameSession(host: User, language: Language): Promise<GameSession> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const games = readDb<Record<string, GameSession>>(DB_KEY_GAMES, {});
        const gameCode = Math.random().toString(36).substring(2, 7).toUpperCase();
        const hostPlayer: Player = { id: host.id, name: host.name, score: 0, progressIndex: 0, language: language, streak: 0 };
        const newSession: GameSession = { code: gameCode, hostId: host.id, status: 'waiting', players: [hostPlayer], questions: [], createdAt: Date.now(), currentQuestionIndex: 0 };
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
            if (session.players.some(p => p.id === user.id)) return resolve(session);
            const newPlayer: Player = { id: user.id, name: user.name, score: 0, progressIndex: 0, language: language, streak: 0 };
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
            if (session) resolve(session); else reject(new Error('Game not found.'));
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
            const allQuestions = CURRICULUM_MODULES.flatMap(module => {
                const moduleQuestions = englishTranslations.curriculum[module.id].lessonContent.quiz.questions;
                const multiplayerQuestions = [];
                for (let i = 0; i < moduleQuestions.length; i++) {
                    if (moduleQuestions[i].type === 'multiple-choice') {
                        multiplayerQuestions.push({ id: `${module.id}-q${i}`, moduleId: module.id, questionIndexInModule: i });
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
            if (!player || !question || player.progressIndex > session.currentQuestionIndex) return resolve(session);
            if(question.id !== questionId) return reject(new Error('Question mismatch.'));
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
                        const localUsers = readDb<Record<string, User>>(DB_KEY_USERS, {});
                        const userEmail = Object.keys(localUsers).find(email => localUsers[email].id === p.id);
                        if (userEmail) {
                            const userFromDb = localUsers[userEmail];
                            const newStats = { wins: userFromDb.multiplayerStats.wins, gamesPlayed: userFromDb.multiplayerStats.gamesPlayed + 1 };
                            userFromDb.multiplayerStats = newStats;
                            userFromDb.points += p.score;
                            const newBadges = [...userFromDb.badges];
                            if (newStats.gamesPlayed === 1 && !newBadges.includes('first-win')) newBadges.push('first-win');
                            if (newStats.gamesPlayed >= 10 && !newBadges.includes('multiplayer-maestro')) newBadges.push('multiplayer-maestro');
                            if (newBadges.length > userFromDb.badges.length) userFromDb.badges = newBadges;
                            localUsers[userEmail] = userFromDb;
                            writeDb(DB_KEY_USERS, localUsers);
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