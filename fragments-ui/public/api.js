export async function handleFetchFragments(user) {
  if (!user) {
    alert('Please log in first!');
    return;
  }

  try {
    const res = await fetch('http://localhost:8080/v1/fragments', {
      headers: {
        Authorization: `Bearer ${user.idToken}`,
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    console.log('Success:', data);
    
    return data;
  } catch (err) {
    console.error('Fetch failed:', err);
    throw err;
  }
}