import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Reminder from '@/models/Reminder';

// GET - fetch user's reminders from DB
export async function GET(request) {
  try {
    const cookieStore = cookies();
    const userCookie = cookieStore.get('algograss_user');
    if (!userCookie) return Response.json({ reminders: [] });

    const user = JSON.parse(Buffer.from(userCookie.value, 'base64').toString());
    if (!user?.id) return Response.json({ reminders: [] });

    await connectDB();
    const reminders = await Reminder.find({ userId: user.id }).sort({ dueDate: 1 });
    return Response.json({ reminders });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// POST - save reminder or send email digest
export async function POST(request) {
  const body = await request.json();

  // Send email digest
  if (body.action === 'email') {
    const { email, reminders } = body;
    if (!email || !reminders?.length) return Response.json({ error: 'Email and reminders required' }, { status: 400 });

    const formspreeId = process.env.FORMSPREE_ID;
    if (!formspreeId) return Response.json({ error: 'Email not configured.' }, { status: 500 });

    const upcoming = reminders.filter(r => {
      const days = Math.ceil((new Date(r.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
      return days >= 0 && days <= 30;
    });

    const message = `AlgoGrass Compliance Review Reminders\n\nUpcoming reviews for ${email}:\n\n${reminders.map(r => {
      const days = Math.ceil((new Date(r.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
      const status = days < 0 ? '⚠️ OVERDUE' : days === 0 ? '🔴 DUE TODAY' : days <= 7 ? `🟡 Due in ${days} days` : `🟢 Due in ${days} days`;
      return `${status} — ${r.title} (${r.type})\nDue: ${new Date(r.dueDate).toLocaleDateString('en-GB')}\nOwner: ${r.owner || 'Unassigned'}`;
    }).join('\n\n')}\n\nLog in to AlgoGrass to manage your reviews: https://www.algograss.co.uk/reminders`;

    try {
      await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: `AlgoGrass: ${upcoming.length} compliance review${upcoming.length !== 1 ? 's' : ''} coming up`,
          _replyto: email,
          email,
          message,
        }),
      });
      return Response.json({ success: true, sent: reminders.length });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  // Save new reminder to DB
  try {
    const cookieStore = cookies();
    const userCookie = cookieStore.get('algograss_user');
    if (!userCookie) return Response.json({ error: 'Not logged in' }, { status: 401 });

    const user = JSON.parse(Buffer.from(userCookie.value, 'base64').toString());
    if (!user?.id) return Response.json({ error: 'Invalid session' }, { status: 401 });

    await connectDB();
    const reminder = await Reminder.create({
      userId: user.id,
      userEmail: user.email,
      title: body.title,
      type: body.type,
      dueDate: body.dueDate,
      owner: body.owner,
      notes: body.notes,
    });
    return Response.json({ success: true, reminder });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// DELETE - remove a reminder
export async function DELETE(request) {
  try {
    const { id } = await request.json();
    const cookieStore = cookies();
    const userCookie = cookieStore.get('algograss_user');
    if (!userCookie) return Response.json({ error: 'Not logged in' }, { status: 401 });

    const user = JSON.parse(Buffer.from(userCookie.value, 'base64').toString());
    await connectDB();
    await Reminder.deleteOne({ _id: id, userId: user.id });
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
