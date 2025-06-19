import { getConfig } from '@edx/frontend-platform';


export async function fetchCsrfToken() {
    const { STUDIO_BASE_URL, CSRF_TOKEN_API_PATH } = getConfig();
  
    const response = await fetch(`${STUDIO_BASE_URL}${CSRF_TOKEN_API_PATH}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  
    if (!response.ok) {
      throw new Error('Failed to fetch CSRF token');
    }
  
    const data = await response.json();
    return data.csrfToken || ""; 
  }