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
git commit -m "redesign: Vanta-inspired dark theme - deep navy #06060F bg, purple #9B7BFA accent, bold hero headline. Fix 5 Vercel errors (dashboard, regulatory-monitor, 3 truncated files). GDPR enforcement data."
echo.
echo Pushing to GitHub...
git push origin main
echo.
echo Done! Check Vercel for the new deployment.
pause
