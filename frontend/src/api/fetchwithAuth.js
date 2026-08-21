export default async function fetchwithAuth(url, options = {}) {
    const accessToken = localStorage.getItem('existingAccessToken');
    const headers = {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status !== 401) {
        return response;
    }

    // access token was expired/invalid — try to refresh
    const refreshToken = localStorage.getItem('existingRefreshToken');

    const responseRefresh = await fetch('http://localhost:4000/api/Token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(refreshToken)
    });

    if (!responseRefresh.ok) {
        // refresh token is also invalid/expired — can't recover, force real login
        localStorage.removeItem('existingAccessToken');
        localStorage.removeItem('existingRefreshToken');
        window.location.href = '/login';
        return; // stop here, nothing left to return to the caller
    }

    const refreshResponseServer = await responseRefresh.json();

    localStorage.setItem('existingAccessToken', refreshResponseServer.accessToken);

    const newHeaders = {
        ...options.headers,
        Authorization: `Bearer ${refreshResponseServer.accessToken}`
    };

    const retryResponse = await fetch(url, { ...options, headers: newHeaders });

    return retryResponse;
}