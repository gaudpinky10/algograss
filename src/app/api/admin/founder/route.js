import { cookies } from 'next/headers'
import { getCollection, parseUserCookie } from '@/lib/dbHelpers'

const ALLOWED_EMAIL = 'pinkigaud11@algograss.com'

function isAuthorized(cookieStore) {
  try {
    const c = cookieStore.get('algograss_user')
    if (!c) return false
    const user = parseUserCookie(c.value)
    return user?.email?.toLowerCase() === ALLOWED_EMAIL
  } catch { return false }
}

export async function GET() {
  if (!isAuthorized(cookies())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const [users, scans, activities, complaints, dsars, dpias, vendors] = await Promise.all([
      getCollection('users'), getCollection('scans'), getCollection('activities'),
      getCollection('complaints'), getCollection('dsars'), getCollection('dpias'), getCollection('vendors'),
    ])

    const now = new Date()
    const day  = new Date(now); day.setHours(0,0,0,0)
    const week = new Date(now); week.setDate(now.getDate()-7)
    const month= new Date(now); month.setDate(now.getDate()-30)

    async function count(col, filter={}) { return col ? await col.countDocuments(filter) : 0 }
    async function all(col, sort={ createdAt:-1 }, limit=200) { return col ? await col.find({}).sort(sort).limit(limit).toArray() : [] }

    const [
      totalUsers, usersToday, usersWeek, usersMonth,
      totalScans, scansToday, scansWeek,
      totalActivities, activitiesToday,
      totalComplaints, totalDsars, totalDpias, totalVendors,
      recentUsers, allActivities, allScans, allUsers,
    ] = await Promise.all([
      count(users), count(users,{createdAt:{$gte:day}}), count(users,{createdAt:{$gte:week}}), count(users,{createdAt:{$gte:month}}),
      count(scans), count(scans,{scannedAt:{$gte:day}}), count(scans,{scannedAt:{$gte:week}}),
      count(activities), count(activities,{createdAt:{$gte:day}}),
      count(complaints), count(dsars), count(dpias), count(vendors),
      all(users,{createdAt:-1},10), all(activities,{createdAt:-1},500), all(scans,{scannedAt:-1},200), all(users,{createdAt:-1},200),
    ])

    const signupsByDay = {}
    allUsers.filter(u=>new Date(u.createdAt)>=month).forEach(u=>{
      const d=new Date(u.createdAt).toLocaleDateString('en-GB',{day:'2-digit',month:'short'})
      signupsByDay[d]=(signupsByDay[d]||0)+1
    })

    const toolUsage    = allActivities.reduce((acc,a)=>{ acc[a.tool]=(acc[a.tool]||0)+1; return acc },{})
    const planBreakdown= allUsers.reduce((acc,u)=>{ const p=u.plan||'free'; acc[p]=(acc[p]||0)+1; return acc },{})
    const avgScore     = allScans.length ? Math.round(allScans.reduce((s,sc)=>s+(sc.score||0),0)/allScans.length) : 0

    const userActivityCount = allActivities.reduce((acc,a)=>{ if(a.userEmail&&a.userEmail!=='anonymous') acc[a.userEmail]=(acc[a.userEmail]||0)+1; return acc },{})
    const topUsers = Object.entries(userActivityCount).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([email,count])=>({email,count}))

    const actsByDay = {}
    allActivities.filter(a=>new Date(a.createdAt)>=month).forEach(a=>{
      const d=new Date(a.createdAt).toLocaleDateString('en-GB',{day:'2-digit',month:'short'})
      actsByDay[d]=(actsByDay[d]||0)+1
    })

    return Response.json({
      overview:{ totalUsers,usersToday,usersWeek,usersMonth,totalScans,scansToday,scansWeek,totalActivities,activitiesToday,totalComplaints,totalDsars,totalDpias,totalVendors,avgScore },
      signupsByDay, toolUsage, planBreakdown, topUsers, actsByDay,
      recentUsers: recentUsers.map(u=>({...u,password:undefined})),
    })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
