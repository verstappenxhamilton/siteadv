export async function generate(payload: any) {
  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY || ''}`
    },
    body: JSON.stringify(payload)
  });
  return await res.json();
}
