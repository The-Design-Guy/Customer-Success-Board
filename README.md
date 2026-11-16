# WEB3D · Customer Success Board

לוח סינון ומחקר ללקוחות WEB3D. רץ על Vercel: מחקר AI אוטומטי לכל לקוח, ושמירה ב-Google Drive.

## 1. העלאה
1. יוצרים repo **פרטי** ב-GitHub ומעלים את כל הקבצים.
2. ב-Vercel: Add New → Project → בוחרים את ה-repo → Deploy (בלי Build Command, בלי Framework).

## 2. משתני סביבה (Vercel → Settings → Environment Variables)
| משתנה | חובה | למה | מאיפה |
|---|---|---|---|
| APP_PASSWORD | מומלץ מאוד | סיסמה לכניסה לאתר (יש בו טלפונים של לקוחות) | בוחרים לבד |
| ANTHROPIC_API_KEY | כן | זיהוי שם העסק, מונחים ענפיים, עיבוד הקלטות | console.anthropic.com → API Keys |
| SERPAPI_KEY | כן | מיקום בגוגל, Google Business וביקורות, מודעות Google | serpapi.com → Dashboard |
| APIFY_TOKEN | כן | 5 פוסטים אחרונים בפייסבוק/אינסטגרם/טיקטוק, מודעות Meta | console.apify.com → Settings → Integrations |
| PAGESPEED_API_KEY | מומלץ | בדיקת אתר (מובייל, ביצועים) | console.cloud.google.com → PageSpeed Insights API |
| DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD | רשות | נפח חיפוש אמיתי למונחים. בלעדיו: הערכת AI | dataforseo.com |
| GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REFRESH_TOKEN | לשמירה ב-Drive | ראו סעיף 3 | |
| DRIVE_FOLDER_ID | רשות | תיקייה קיימת לשמירה (החלק שאחרי /folders/ בכתובת) | 1OTZmY-fJaAP20LVCflA6MmOnhfhVHEyi |
| CLAUDE_MODEL | רשות | ברירת מחדל claude-sonnet-4-5 | |

אחרי כל שינוי במשתנים: Deployments → ⋯ → Redeploy.

## 3. חיבור Google Drive (פעם אחת)
1. console.cloud.google.com → פרויקט חדש → APIs & Services → Library → **Google Drive API** → Enable.
2. OAuth consent screen → External → ממלאים שם ומייל → Scopes: `.../auth/drive` (אם משתמשים ב-DRIVE_FOLDER_ID) או `.../auth/drive.file` → שומרים. ואז **Publish app** (אחרת החיבור פג אחרי 7 ימים).
3. Credentials → Create credentials → OAuth client ID → Web application.
   - Authorized redirect URIs: `https://<הכתובת-שלכם>.vercel.app/api/google/callback`
4. מעתיקים Client ID ו-Client secret ל-Vercel (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) → Redeploy.
5. נכנסים ל-`https://<הכתובת>.vercel.app/api/google/auth`, מאשרים את החשבון. אם מופיע "Google hasn't verified this app" → Advanced → Continue.
6. בעמוד שנפתח מעתיקים את הערך ל-GOOGLE_REFRESH_TOKEN ב-Vercel → Redeploy.

בדרייב תיווצר תיקייה "Customer Success Board" עם קובץ JSON לכל לקוח שנחקר, וקובץ רשימות והגדרות. הלוח טוען אותם בכל פתיחה ושומר כל שינוי תוך שניות.

## עלויות משוערות לכל לקוח (מחקר מלא)
- SerpApi: כ-10 עד 30 חיפושים (תלוי באיזה עמוד העסק נמצא). התוכנית הבסיסית: 5,000 חיפושים בחודש.
- Apify: 4 הרצות, בערך 0.05$ עד 0.20$.
- Claude: פחות מ-0.02$.

## הערות
- המחקר רץ אוטומטית כשפותחים לקוח שלא נחקר ב-14 הימים האחרונים (אפשר לכבות בלוח).
- מודעות Meta: נבדקות לפי עמוד הפייסבוק. אם אין עמוד, מוצג קישור לחיפוש לפי שם.
- ביקורות Google: 5 האחרונות לפי תאריך.
- Apify ו-SerpApi הם שירותי צד ג׳ שסורקים עמודים ציבוריים. תוצאות יכולות לחסור או להשתנות, ולכן כל ממצא מוצג עם קישור לאימות.
