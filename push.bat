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
git commit -m "QA: auth guards on all private routes, pricing consistency (60-day free, no card), contact email standardisation, SEO (OG image, sitemap, robots.txt, per-page metadata, 404 page), scan page Suspense fix"
echo.
echo Pushing to GitHub...
git push origin main
echo.
echo Done! Check Vercel for the new deployment.
pause
