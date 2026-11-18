// sessionStorage key used to hand a finished scan from /scan to /dashboard, so a
// signed-in user who clicks "Fix issues" lands on the action plan for that site
// without the site being scanned again.
export const SCAN_HANDOFF_KEY = 'algograss_scan_handoff'
