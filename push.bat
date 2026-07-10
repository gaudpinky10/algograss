@echo off
echo Removing git lock file...
if exist ".git\index.lock" (
    del /f ".git\index.lock"
    echo Lock file removed.
) else (
    echo No lock file found.
)
echo.
echo Staging all changes...
git add .
echo.
echo Committing...
git commit -m "fix: 5 Vercel build errors - dashboard </main> -> </div>, regulatory-monitor apostrophes, restore 3 truncated files (homepage 443L, login 226L, pricing 285L). Light theme + GDPR enforcement data."
echo.
echo Pushing to GitHub...
git push origin main
echo.
echo Done! Check Vercel for the new deployment.
pause
