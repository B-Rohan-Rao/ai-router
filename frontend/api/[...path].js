const BACKEND_URL = 'http://44.223.69.157:3001';

export default async function handler(req, res) {
  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('API Proxy called:', req.method, req.url, req.query);
  
  // Get the path from the request
  let path = '';
  if (req.query.path) {
    if (Array.isArray(req.query.path)) {
      path = req.query.path.join('/');
    } else {
      path = String(req.query.path);
    }
  }
  
  // Build query string from all query params except 'path'
  const queryParams = new URLSearchParams();
  Object.entries(req.query || {}).forEach(([key, value]) => {
    if (key !== 'path' && value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((v) => queryParams.append(key, String(v)));
      } else {
        queryParams.append(key, String(value));
      }
    }
  });
  
  const queryString = queryParams.toString();
  const url = `${BACKEND_URL}/api/${path}${queryString ? `?${queryString}` : ''}`;
  
  console.log('Proxying to:', url);

  try {
    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (req.headers.authorization) {
      headers['Authorization'] = String(req.headers.authorization);
    }

    // Forward the request to the backend
    const fetchOptions = {
      method: req.method,
      headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = typeof req.body === 'string' 
        ? req.body 
        : JSON.stringify(req.body);
    }

    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('Backend error:', response.status, errorText);
      return res.status(response.status).json({ 
        success: false, 
        error: errorText || `HTTP ${response.status}` 
      });
    }
    
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Proxy request failed' 
    });
  }
}