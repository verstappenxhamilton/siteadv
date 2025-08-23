export async function generate(payload: any) {
  const res = await fetch('https://api.groq.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY || ''}`
    },
    body: JSON.stringify(payload)
  });
  return await res.json();
}
