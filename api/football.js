export default async function handler(req, res) {
  const path = req.query.path;
  const response = await fetch(`https://api.football-data.org/v4/${path}`, {
    headers: {
      'X-Auth-Token': process.env.VITE_FOOTBALL_API_KEY
    }
  });
  const data = await response.json();
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(response.status).json(data);
}