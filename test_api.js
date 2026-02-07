
const BASE_URL = 'http://localhost:5000/api';
let token = '';
let userId = '';
let postId = '';

async function request(method, endpoint, body = null, authToken = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
    
    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const text = await response.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        console.error(`[${method}] ${endpoint}: Failed to parse JSON. Response:`, text.substring(0, 200));
        return { status: response.status, data: { success: false, message: 'Invalid JSON response' } };
    }
    // console.log(`[${method}] ${endpoint}:`, response.status, data.success ? 'SUCCESS' : 'FAILED');
    return { status: response.status, data };
}

async function runTests() {
    console.log('--- Starting Visibility Tests ---');

    // 1. Register
    const user = { name: 'TestVis', email: `testvis${Date.now()}@example.com`, password: 'password123' };
    let res = await request('POST', '/auth/register', user);
    
    if (res.data.success) {
        res = await request('POST', '/auth/login', { email: user.email, password: user.password });
        if (res.data.success) {
            token = res.data.token;
            console.log('Logged in.');
        } else { console.error('Login failed'); return; }
    } else { console.error('Registration failed'); return; }

    // 2. Create Published Post
    const pubPost = {
        title: `Public Post ${Date.now()}`,
        content: 'Content.',
        tags: ['vis'],
        status: 'published'
    };
    res = await request('POST', '/posts', pubPost, token);
    if (res.data.success) {
        postId = res.data.post._id;
        console.log('Published Post Created:', postId);
    } else { console.error('Create Post Failed'); return; }

    // 3. Get Posts (Public)
    res = await request('GET', '/posts');
    const post = res.data.data.find(p => p._id === postId);
    
    if (post) {
        console.log('Public Post Found.');
        console.log('Has Status field? (Expect FALSE):', post.hasOwnProperty('status'));
        console.log('Author has email? (Expect FALSE):', post.author.hasOwnProperty('email'));
        console.log('Author has name? (Expect TRUE):', post.author.hasOwnProperty('name'));
    } else {
        console.error('Public Post NOT found in public list.');
    }

    console.log('--- Tests Completed ---');
}

runTests();
