export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const token = req.query.token || req.body?.token;
  const accountId = req.query.accountId || req.body?.accountId;

  if (!token || !accountId) {
    return res.status(400).json({ error: 'Missing token or accountId' });
  }

  try {
    // 1. Fetch user data
    const userRes = await fetch(
      `https://graph.instagram.com/v20.0/${accountId}?fields=id,username,name,media_count,profile_picture_url&access_token=${token}`
    );
    let userData = {};
    if (userRes.ok) {
      userData = await userRes.json();
    } else {
      const errText = await userRes.text();
      console.error('Error fetching user data:', errText);
    }

    // 2. Fetch insights
    const insightsRes = await fetch(
      `https://graph.instagram.com/v20.0/${accountId}/insights?metric=reach&period=day&access_token=${token}`
    );
    let insightsData = {};
    if (insightsRes.ok) {
      insightsData = await insightsRes.json();
    } else {
      const errText = await insightsRes.text();
      console.error('Error fetching insights:', errText);
    }

    // 3. Fetch media
    const mediaRes = await fetch(
      `https://graph.instagram.com/v20.0/${accountId}/media?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&access_token=${token}`
    );
    let mediaData = {};
    if (mediaRes.ok) {
      mediaData = await mediaRes.json();
    } else {
      const errText = await mediaRes.text();
      console.error('Error fetching media:', errText);
    }

    return res.status(200).json({
      user: userData,
      insights: insightsData,
      media: mediaData
    });
  } catch (err: any) {
    console.error('Instagram Analytics proxy error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
