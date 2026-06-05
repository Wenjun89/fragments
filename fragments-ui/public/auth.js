const config = {
  cognito: {
    region: process.env.AWS_REGION,
    userPoolId: process.env.AWS_COGNITO_POOL_ID,
    clientId: process.env.AWS_COGNITO_CLIENT_ID,
    domain: process.env.AWS_COGNITO_DOMAIN,
    redirectUri: process.env.AWS_COGNITO_REDIRECT_URI,
  },
};

export async function login() {
  console.log('Login initiated...');

  if (!config.cognito.domain || !config.cognito.clientId || !config.cognito.redirectUri) {
    console.error('Missing configuration variables. Check your .env file!');
    return;
  }

  try {
    // Construct the URL
    const url = `${config.cognito.domain}/login?client_id=${config.cognito.clientId}&response_type=code&scope=email+openid+profile&redirect_uri=${config.cognito.redirectUri}`;
    
    console.log('Redirecting to:', url);
    
    // Perform redirect
    window.location.assign(url);
  } catch (err) {
    console.error('Redirect failed:', err);
  }
}

export async function getUser() {
  const idToken = localStorage.getItem('idToken');
  const username = localStorage.getItem('username');
  
  if (idToken && username) {
    return { username, idToken };
  }

  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');

  if (code) {
    try {
      console.log('Authorization code detected. Exchanging for tokens...');
      
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: config.cognito.clientId,
        code: code,
        redirect_uri: config.cognito.redirectUri,
      });

      const res = await fetch(`${config.cognito.domain}/oauth2/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body,
      });

      const data = await res.json();

      if (data.id_token) {
        localStorage.setItem('idToken', data.id_token);
        localStorage.setItem('username', 'Michelle'); 

        window.history.replaceState({}, document.title, window.location.pathname);
        console.log('Login successful.');
        return { username: 'Michelle', idToken: data.id_token };
      } else {
        console.error('Token exchange error:', data);
      }
    } catch (err) {
      console.error('Network error during login:', err);
    }
  }
  return null;
}

export function logout() {
  console.log('Logging out...');
  localStorage.clear();
  window.location.reload();
}