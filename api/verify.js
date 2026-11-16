export default async function handler(req, res) {
  // 1. Tangani preflight OPTIONS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'https://irmabaitussalam.github.io');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end(); // 204 No Content, sukses
  }

  // 2. Hanya izinkan POST untuk request sebenarnya
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { token } = req.body; // Token dari frontend

  if (!token) {
    return res.status(400).json({ success: false, error: 'Token missing' });
  }

  const secret = process.env.HCAPTCHA_SECRET; // Diambil dari environment variable
  const sitekey = process.env.HCAPTCHA_SITEKEY; // Opsional, bisa juga disimpan di env

  if (!secret) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const payload = {
      secret: secret,
      response: token,
      sitekey: sitekey, // Sertakan jika kamu ingin memvalidasi sitekey
    };
    const params = new URLSearchParams(payload);
    const hcaptchaRes = await fetch('https://api.hcaptcha.com/siteverify', {
      method: 'POST',
      body: params,
    });
    const data = await hcaptchaRes.json();

    if (data.success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json({ success: false, errors: data['error-codes'] || [] });
    }
  } catch (error) {
    console.error('hCaptcha verification error:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}
