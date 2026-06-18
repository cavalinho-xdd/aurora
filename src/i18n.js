import i18n from 'i18next';
/**
 * @file i18n.js
 * @description Internationalization configuration using i18next.
 * Defines resource bundles for supported locales and initializes the translation instance.
 * Automatically synchronizes with local storage to persist user language preferences.
 */
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "app": {
        "verifying": "Verifying login...",
        "loadingProfile": "Loading profile...",
        "dbError": "DB Error: {{error}}",
        "dashboard": "Dashboard",
        "community": "Community",
        "settings": "Settings",
        "logout": "Log out",
        "level": "Lvl",
        "tasks": "Tasks"
      },
      "dashboard": {
        "title": "Your Stats",
        "overview": "Your Overview",
        "todayGoal": "Today's Goal",
        "totalMinutes": "Total Minutes",
        "completedGoals": "Completed Goals",
        "level": "Level",
        "xp": "Experience (XP)",
        "streak": "Streak"
      },
      "goalPlanner": {
        "title": "Quick Start",
        "quizTopic": "Topic for AI evaluation quiz",
        "topicPlaceholder": "e.g. Web App Architecture, Photosynthesis...",
        "timeInMinutes": "Time in minutes",
        "startFocus": "Start Aurora",
        "missingApi": "Missing Gemini API key in Settings. The evaluation quiz won't work without it.",
        "hardcoreMode": "Hardcore Mode (Anti-Cheat)",
        "hardcoreWarningTitle": "Warning: Hardcore Mode",
        "hardcoreWarningDesc": "You will not be able to close the app or cancel the focus block until the time runs out. Are you sure you want to proceed?",
        "hardcoreAccept": "I understand, start",
        "usePomodoro": "Use Pomodoro",
        "pomodoroFocus": "Focus (min)",
        "pomodoroBreak": "Break (min)",
        "requiredField": "Please fill out this field.",
        "noApiTitle": "No API Key",
        "noApiDesc": "You haven't set up your Gemini API key. You can still use the timer, but you won't get AI evaluation and you'll only earn 20 XP.",
        "continueWithoutApi": "Continue without AI",
        "cancel": "Cancel"
      },
      "timerScreen": {
        "focusingOn": "Focusing on",
        "timeRemaining": "Time Remaining",
        "cancelFocus": "Cancel Aurora Block",
        "breakActive": "Break Time! Relax.",
        "phaseFocus": "FOCUS PHASE",
        "phaseBreak": "BREAK PHASE",
        "finished": "Finished!",
        "focusCompleteTitle": "Focus Complete!",
        "focusCompleteBody": "Time to evaluate your knowledge.",
        "breakTimeTitle": "Take a Break",
        "breakTimeBody": "Great job! Rest for a few minutes.",
        "focusTimeTitle": "Back to Focus",
        "focusTimeBody": "Time to lock in."
      },
      "quizScreen": {
        "notAvailable": "Quiz not available",
        "failedToGenerate": "Failed to generate questions. Check your connection and API key.",
        "continue": "Continue",
        "dontKnow": "I don't know",
        "apiError": "Error during API evaluation.",
        "fallbackApi": "Fallback: API was unavailable.",
        "evaluation": "Evaluation",
        "claimXp": "Claim XP",
        "knowledgeCheckTitle": "Knowledge Check",
        "yourAnswer": "Your answer...",
        "evaluating": "AI is evaluating...",
        "submit": "Submit for evaluation"
      },
      "settings": {
        "title": "Settings",
        "language": "Language",
        "english": "English",
        "czech": "Czech",
        "apiKey": "Gemini API Key",
        "saveSettings": "Save Settings",
        "saved": "Saved!",
        "keyDisclaimer": "The key remains securely on your device (userdata.json). It is not sent anywhere else (except Google API).",
        "blacklistLabel": "Blacklist (Blocked Applications)",
        "blacklistDisclaimer": "Process names that will be terminated during Aurora. One process per line.",
        "scanApps": "Scan Running Apps",
        "scanning": "Scanning...",
        "scanTitle": "Running Processes",
        "apply": "Apply Selected",
        "lowGraphics": "Low Graphics Mode",
        "lowGraphicsDesc": "Disables 3D background animations to save battery and CPU.",
        "reportBug": "Report a Bug"
      },
      "socialScreen": {
        "communityFriends": "Community & Friends",
        "addFriend": "Add Friend",
        "globalLeaderboard": "Global Leaderboard",
        "level": "Level",
        "searchUser": "Search user (email)...",
        "friendAdded": "Friend added!",
        "userNotFound": "User not found.",
        "added": "Added!",
        "addError": "Error adding friend.",
        "anonymous": "Anonymous",
        "you": "(You)",
        "empty": "No one is here yet.",
        "communityTitle": "Community & Leaderboards",
        "subtitle": "Compete with friends. Climb the ranks.",
        "globalTop20": "Global Top 20",
        "friends": "Friends",
        "add": "Add",
        "loading": "Loading...",
        "addFriendInstruction": "Add friends by searching their exact nickname.",
        "friendEmailPlaceholder": "Friend's nickname",
        "requests": "Requests",
        "approve": "Approve",
        "deny": "Deny",
        "inviteSent": "Invite sent!",
        "noRequests": "No pending requests.",
        "requestsTitle": "Friend Requests",
        "goals": "Goals",
        "focusTime": "Focus Time",
        "streak": "Streak"
      },
      "authScreen": {
        "loginSignup": "Login / Register",
        "email": "Email",
        "password": "Password",
        "login": "Login",
        "register": "Register",
        "noAccount": "Don't have an account? Register",
        "hasAccount": "Already have an account? Login",
        "error": "Authentication error.",
        "nicknameRequired": "Nickname is required for registration.",
        "emailInUse": "This email is already registered.",
        "invalidCreds": "Invalid email or password.",
        "connectionError": "Connection error. Try again.",
        "nickname": "Nickname",
        "processing": "Processing...",
        "createAccount": "Create account",
        "nicknameInUse": "Nickname is already taken. Choose another.",
        "welcomeBack": "Welcome back",
        "registerSubtitle": "Start earning your focus.",
        "loginSubtitle": "Pick up where you left off.",
        "forgotPassword": "Forgot password?",
        "resetLinkSent": "Password reset link sent! Check your inbox.",
        "verifyEmailTitle": "Verify your email",
        "verifyEmailDesc": "We've sent a verification link to your email. You must click it before you can start using Aurora.",
        "resendEmail": "Resend verification email",
        "refreshStatus": "I've verified my email",
        "emailResent": "Verification email resent!"
      },
      "streakCelebration": {
        "dayStreak": "day streak",
        "tapToContinue": "tap to continue",
        "streakKeepItUp": "Keep it up!",
        "streakNewRecord": "New Record!",
        "streakDay": "Day",
        "streakDays": "Days",
        "xpEarned": "XP Earned",
        "xpMessage": "You're getting stronger. Keep going.",
        "continue": "Continue to Dashboard",
        "noApiEarnMore": "Use AI Evaluation to earn more XP.",
        "labels": {
          "spark": "Spark",
          "burning": "Burning",
          "blazing": "Blazing",
          "inferno": "Inferno",
          "legendary": "Legendary"
        }
      },
      "errors": {
        "auth": {
          "weakPassword": "Password is too weak. Please use at least 6 characters.",
          "userNotFound": "No account found with this email.",
          "wrongPassword": "Incorrect password.",
          "networkRequestFailed": "Network error. Please check your internet connection.",
          "tooManyRequests": "Too many failed attempts. Please try again later.",
          "invalidEmail": "Please enter a valid email address.",
          "default": "An unexpected error occurred. Please try again."
        },
        "system": {
          "offlineTitle": "You are offline",
          "offlineDesc": "Community and Sync features are paused. You can still use the timer.",
          "updaterErrorTitle": "Update Failed",
          "updaterErrorDesc": "We couldn't install the update. We'll try again later."
        }
      },
      "backlog": {
        "title": "Focus Backlog",
        "subtitle": "Plan your focus sessions ahead of time.",
        "addTask": "Add Task",
        "noTasks": "No pending tasks. You're all caught up!",
        "newTaskTitle": "New Task",
        "taskName": "Task name (e.g. Read Chapter 4)",
        "duration": "Duration (minutes)",
        "cancel": "Cancel",
        "save": "Save Task"
      }
    }
  },
  cs: {
    translation: {
      "app": {
        "verifying": "Ověřuji přihlášení...",
        "loadingProfile": "Načítám profil...",
        "dbError": "Chyba DB: {{error}}",
        "dashboard": "Dashboard",
        "community": "Komunita",
        "settings": "Nastavení",
        "logout": "Odhlásit se",
        "level": "Lvl",
        "tasks": "Úkoly"
      },
      "dashboard": {
        "title": "Tvoje Statistiky",
        "overview": "Tvůj přehled",
        "todayGoal": "Dnešní cíl",
        "totalMinutes": "Celkem minut",
        "completedGoals": "Splněné cíle",
        "level": "Level",
        "xp": "Zkušenosti (XP)",
        "streak": "Série"
      },
      "goalPlanner": {
        "title": "Rychlý start",
        "quizTopic": "Téma pro kontrolní AI kvíz",
        "topicPlaceholder": "např. Architektura webovek, Fotosyntéza...",
        "timeInMinutes": "Čas v minutách",
        "startFocus": "Spustit Auroru",
        "missingApi": "Chybí Gemini API klíč v Nastavení. Vyhodnocovací kvíz bez něj nebude fungovat.",
        "hardcoreMode": "Hardcore Mód (Anti-Cheat)",
        "hardcoreWarningTitle": "Varování: Hardcore Mód",
        "hardcoreWarningDesc": "Aplikaci nebude možné nijak zavřít ani zrušit odpočet, dokud čas nevyprší. Opravdu chceš pokračovat?",
        "hardcoreAccept": "Rozumím, spustit",
        "usePomodoro": "Použít Pomodoro",
        "pomodoroFocus": "Soustředění (min)",
        "pomodoroBreak": "Pauza (min)",
        "requiredField": "Vyplňte prosím toto pole.",
        "cancel": "Zrušit"
      },
      "timerScreen": {
        "focus": "Aurora",
        "focusTopic": "Soustředění: {{topic}}",
        "cancelFocus": "Přerušit Auroru",
        "finishFocus": "Dokončit Auroru",
        "finished": "Ukončeno!",
        "focusCompleteTitle": "Blok dokončen!",
        "focusCompleteBody": "Je čas vyhodnotit tvoje znalosti.",
        "breakTimeTitle": "Čas na pauzu",
        "breakTimeBody": "Skvělá práce! Odpočiň si na pár minut.",
        "focusTimeTitle": "Zpět k práci",
        "focusTimeBody": "Čas se soustředit."
      },
      "quizScreen": {
        "notAvailable": "Kvíz není k dispozici",
        "failedToGenerate": "Otázky se nepodařilo vygenerovat. Zkontroluj připojení a API klíč.",
        "continue": "Pokračovat",
        "dontKnow": "Nevím",
        "apiError": "Chyba při vyhodnocení API.",
        "fallbackApi": "Fallback: API nebylo dostupné.",
        "evaluation": "Vyhodnocení",
        "claimXp": "Vyzvednout XP",
        "knowledgeCheckTitle": "Ověření znalostí",
        "yourAnswer": "Tvoje odpověď...",
        "evaluating": "AI vyhodnocuje...",
        "submit": "Odeslat k vyhodnocení"
      },
      "settings": {
        "title": "Nastavení",
        "language": "Jazyk",
        "english": "Angličtina",
        "czech": "Čeština",
        "apiKey": "API Klíč pro Gemini",
        "saveSettings": "Uložit nastavení",
        "saved": "Uloženo!",
        "keyDisclaimer": "Klíč zůstává bezpečně ve tvém zařízení (userdata.json). Není nikam odesílán (kromě Google API).",
        "blacklistLabel": "Blacklist (Zakázané aplikace)",
        "blacklistDisclaimer": "Názvy procesů, které budou během bloku ukončeny. Jeden proces na řádek.",
        "scanApps": "Skenovat běžící aplikace",
        "scanning": "Skenuji...",
        "scanTitle": "Běžící procesy",
        "apply": "Přidat vybrané",
        "lowGraphics": "Úsporný režim grafiky",
        "lowGraphicsDesc": "Vypne 3D animace na pozadí pro úsporu baterie a CPU.",
        "reportBug": "Nahlásit chybu"
      },
      "socialScreen": {
        "communityFriends": "Komunita a Přátelé",
        "addFriend": "Přidat přítele",
        "globalLeaderboard": "Globální žebříček",
        "level": "Úroveň",
        "searchUser": "Vyhledat uživatele (email)...",
        "friendAdded": "Přítel přidán!",
        "userNotFound": "Uživatel nenalezen.",
        "added": "Přidáno!",
        "addError": "Chyba při přidávání.",
        "anonymous": "Anonym",
        "you": "(Ty)",
        "empty": "Zatím tu nikdo není.",
        "communityTitle": "Komunita a Žebříčky",
        "subtitle": "Soutěž s přáteli. Stoupej v žebříčku.",
        "globalTop20": "Globální Top 20",
        "friends": "Přátelé",
        "add": "Přidat",
        "loading": "Načítám...",
        "addFriendInstruction": "Přidej si přátele hledáním jejich přesné přezdívky.",
        "friendEmailPlaceholder": "Přezdívka kamaráda",
        "requests": "Žádosti",
        "approve": "Schválit",
        "deny": "Odmítnout",
        "inviteSent": "Pozvánka odeslána!",
        "noRequests": "Žádné nevyřízené žádosti.",
        "requestsTitle": "Žádosti o přátelství",
        "goals": "Cíle",
        "focusTime": "Čas soustředění",
        "streak": "Série"
      },
      "authScreen": {
        "loginSignup": "Přihlášení / Registrace",
        "email": "Email",
        "password": "Heslo",
        "login": "Přihlásit se",
        "register": "Zaregistrovat",
        "noAccount": "Nemáš účet? Registrovat",
        "hasAccount": "Už máš účet? Přihlásit se",
        "error": "Chyba při autentizaci.",
        "nicknameRequired": "Přezdívka je povinná pro registraci.",
        "emailInUse": "Tento email už je zaregistrovaný.",
        "invalidCreds": "Špatný email nebo heslo.",
        "connectionError": "Chyba připojení. Zkus to znovu.",
        "nickname": "Přezdívka",
        "processing": "Zpracovávám...",
        "createAccount": "Vytvořit účet",
        "nicknameInUse": "Přezdívka už se používá. Zvol si jinou.",
        "welcomeBack": "Vítejte zpět",
        "registerSubtitle": "Začni sbírat xp za soustředění.",
        "loginSubtitle": "Pokračuj tam, kde jsi přestal.",
        "forgotPassword": "Zapomněli jste heslo?",
        "resetLinkSent": "Odkaz pro obnovu hesla odeslán! Zkontrolujte e-mail.",
        "verifyEmailTitle": "Ověřte svůj e-mail",
        "verifyEmailDesc": "Odeslali jsme vám ověřovací odkaz. Než začnete aplikaci používat, musíte e-mail potvrdit.",
        "resendEmail": "Poslat e-mail znovu",
        "refreshStatus": "Už jsem e-mail ověřil",
        "emailResent": "Ověřovací e-mail byl znovu odeslán!"
      },
      "streakCelebration": {
        "dayStreak": "dní v řadě",
        "tapToContinue": "klepněte pro pokračování",
        "streakKeepItUp": "Skvělá práce!",
        "streakNewRecord": "Nový rekord!",
        "streakDay": "Den",
        "streakDays": "Dny",
        "xpEarned": "XP Získáno",
        "xpMessage": "Zlepšuješ se. Jen tak dál.",
        "continue": "Zpět na Dashboard",
        "noApiEarnMore": "Pro získávání více XP používejte AI Evaluation.",
        "noApiTitle": "Chybí API Klíč",
        "noApiDesc": "Nemáš nastavený Gemini API klíč. Můžeš pokračovat s timerem, ale bez AI evaluace získáš jen 20 XP.",
        "continueWithoutApi": "Pokračovat bez AI",
        "labels": {
          "spark": "Jiskra",
          "burning": "Hořící",
          "blazing": "Planoucí",
          "inferno": "Peklo",
          "legendary": "Legenda"
        }
      },
      "errors": {
        "auth": {
          "weakPassword": "Heslo je příliš slabé. Použijte alespoň 6 znaků.",
          "userNotFound": "S tímto emailem nebyl nalezen žádný účet.",
          "wrongPassword": "Nesprávné heslo.",
          "networkRequestFailed": "Chyba sítě. Zkontrolujte připojení k internetu.",
          "tooManyRequests": "Příliš mnoho neúspěšných pokusů. Zkuste to prosím později.",
          "invalidEmail": "Zadejte prosím platnou emailovou adresu.",
          "default": "Došlo k neočekávané chybě. Zkuste to prosím znovu."
        },
        "system": {
          "offlineTitle": "Jste offline",
          "offlineDesc": "Synchronizace a Komunita jsou pozastaveny. Časovač funguje dál.",
          "updaterErrorTitle": "Aktualizace selhala",
          "updaterErrorDesc": "Nepodařilo se nainstalovat aktualizaci. Zkusíme to znovu později."
        }
      },
      "backlog": {
        "title": "Zásobník úkolů",
        "subtitle": "Naplánuj si úkoly dopředu.",
        "addTask": "Přidat úkol",
        "noTasks": "Žádné úkoly. Máš splněno!",
        "newTaskTitle": "Nový úkol",
        "taskName": "Název úkolu (např. Přečíst kapitolu 4)",
        "duration": "Délka (minuty)",
        "cancel": "Zrušit",
        "save": "Uložit úkol"
      }
    }
  }
};

/**
 * Retrieve language from localStorage or default to english.
 */
const savedLang = localStorage.getItem('aurora_lang') || 'en';

/**
 * Configure i18next instance for application localization.
 */
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
