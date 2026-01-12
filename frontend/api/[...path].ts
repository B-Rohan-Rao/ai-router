const BACKEND_URL = 'http://44.223.69.157:3001';

export default async function handler(req: any, res: any) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  // Get the path from the request
  const path = (req.query.path as string[])?.join('/') || '';
  const queryParams = new URLSearchParams();
  
  // Copy all query params except 'path'
  Object.keys(req.query).forEach(key => {
    if (key !== 'path') {
      queryParams.append(key, req.query[key]);
    }
  });
  
  const queryString = queryParams.toString();
  const url = `${BACKEND_URL}/api/${path}${queryString ? `?${queryString}` : ''}`;

  try {
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    // Forward the request to the backend
    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const response = await fetch(url, fetchOptions);
    const data = await response.json();
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return res.status(response.status).json(data);
  } catch (error: any) {
    console.error('Proxy error:', error);
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Proxy request failed' 
    });
  }
}
