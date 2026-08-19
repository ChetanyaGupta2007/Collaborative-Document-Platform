export default async function fetchwithAuth(url, options){
    const accessToken = localStorage.getItem('existingAccessToken');
    const headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`
};
    const response = await fetch(url, { ...options, headers });
}
