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
git commit -m "feat: homepage social proof + comparison table + /security page + 3 blog posts + 5 bug fixes (pricing, dashboard auth, CountUp, blog dates, scanner UX)"
echo.
echo Pushing to GitHub...
git push origin main
echo.
echo Done! Check Vercel for the new deployment.
pause
