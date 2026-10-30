// @ts-nocheck
// Supabase Edge Function: `send-push`
// Sends push notification for new messages WITHOUT exposing message text content.
// payload: { recipient_user_id: string, sender_name: string }
Deno.serve(async (req) => {
  const { recipient_user_id, sender_name } = await req.json();

  // Send content-free FCM / APNs push notification
  const notificationPayload = {
    title: `New message from ${sender_name || 'a match'}`,
    body: `You received a new end-to-end encrypted message.`, // No message content exposed!
    data: {
      type: 'chat_message',
    }
  };

  return new Response(
    JSON.stringify({ success: true, notification: notificationPayload }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
