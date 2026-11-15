# WEB3D · Customer Success Board

לוח סינון ומחקר ל-334 לקוחות WEB3D.

## הפעלה ב-GitHub Pages
1. מעלים את כל הקבצים בתיקייה הזו לשורש ה-repo.
2. Settings → Pages → Source: Deploy from a branch → main / root.
3. האתר יעלה בכתובת https://<user>.github.io/<repo>/

חובה להריץ דרך שרת (GitHub Pages / Vercel / `npx serve`). פתיחה ישירה של index.html מהמחשב לא תטען את clients-data.json.

## מפתחות (נשמרים רק בדפדפן, לא ב-repo)
- **PageSpeed API** – לבדיקת אתר אוטומטית. console.cloud.google.com → הפעלת PageSpeed Insights API → Credentials → API key.
- **Claude API** – לעיבוד התיעוד הקולי לשדות. console.anthropic.com/settings/keys.

## מיקרופון
עובד ב-Chrome / Edge, בכתובת HTTPS. בפעם הראשונה הדפדפן יבקש הרשאה.

## שמירת נתונים
המחקר נשמר ב-localStorage של הדפדפן. גבו מדי פעם: נתונים ויבוא → ייצוא גיבוי מחקר.

## אבטחה
clients-data.json מכיל שמות וטלפונים של לקוחות. השתמשו ב-repo **פרטי**. שימו לב: GitHub Pages מ-repo פרטי דורש תוכנית בתשלום, והאתר עצמו עדיין ציבורי. חלופה מומלצת: Vercel עם הגנת סיסמה.
