// forum.js

document.addEventListener('DOMContentLoaded', () => {

    // --- A simple, non-blocking notification utility ---
    const showNotification = (message, type = 'error') => {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    };
    
    // --- Central API Fetch Helper ---
    // Handles all requests, adds auth token, and parses response
    const apiFetch = async (endpoint, options = {}) => {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };
        if (token) {
            headers['x-auth-token'] = token;
        }

        const response = await fetch(`http://localhost:3000/api${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || `API request failed with status ${response.status}`);
        }
        return response.json();
    };

    // --- "Component" Functions to Create HTML Elements ---

    const createPostElement = (post) => {
        const postElement = document.createElement('div');
        postElement.className = 'post bg-white p-6 rounded-lg shadow-md'; // Added some style for clarity
        postElement.innerHTML = `
            <div class="post-header flex justify-between items-center text-sm text-slate-500 mb-2">
                <span class="post-author font-semibold">${post.name}</span>
                <span class="post-time">${new Date(post.createdAt).toLocaleString()}</span>
            </div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">${post.title}</h3>
            <p class="post-content text-slate-700 whitespace-pre-wrap">${post.content}</p>
            <div class="comments-section mt-4 pt-4 border-t border-slate-200">
                <h4 class="text-md font-semibold mb-3 text-slate-600">Comments</h4>
                <div class="comments-container" id="comments-for-${post._id}"></div>
                <div class="add-comment-form mt-4 flex items-center gap-2">
                    <textarea class="comment-input w-full p-2 border border-slate-300 rounded-md" placeholder="Add a supportive comment..."></textarea>
                    <button class="comment-btn shrink-0 px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700" data-post-id="${post._id}">Reply</button>
                </div>
            </div>
        `;
        return postElement;
    };

    const createCommentElement = (comment) => {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment bg-slate-100 p-3 rounded-md mb-2';
        commentElement.innerHTML = `
            <div class="comment-header flex justify-between items-center text-xs text-slate-500 mb-1">
                <span class="comment-author font-semibold">${comment.name}</span>
                <span class="comment-time">${new Date(comment.createdAt).toLocaleString()}</span>
            </div>
            <p class="comment-content text-sm text-slate-800">${comment.content}</p>
        `;
        return commentElement;
    };


    // --- Main Logic Functions ---
    const postsContainer = document.getElementById('postsContainer');
    const noPostsMessage = document.getElementById('noPostsMessage');

    const fetchAndDisplayComments = async (postId) => {
        const commentsContainer = document.getElementById(`comments-for-${postId}`);
        try {
            const comments = await apiFetch(`/forum/${postId}/comments`);
            commentsContainer.innerHTML = '';
            if (comments.length > 0) {
                comments.forEach(comment => commentsContainer.appendChild(createCommentElement(comment)));
            } else {
                 commentsContainer.innerHTML = '<p class="text-slate-500 text-sm">No comments yet.</p>';
            }
        } catch (error) {
            commentsContainer.innerHTML = `<p class="text-red-500 text-sm">${error.message}</p>`;
        }
    };

    const fetchAndDisplayPosts = async () => {
        try {
            const posts = await apiFetch('/forum');
            postsContainer.innerHTML = '';
            noPostsMessage.style.display = posts.length === 0 ? 'block' : 'none';

            posts.forEach(post => {
                const postElement = createPostElement(post);
                postsContainer.appendChild(postElement);
                fetchAndDisplayComments(post._id);
            });
        } catch (error) {
            showNotification(error.message);
        }
    };

    const handleAddPost = async () => {
        const titleInput = document.getElementById('postTitleInput');
        const contentInput = document.getElementById('postContentInput');
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        if (!title || !content) {
            return showNotification('Please fill in both the title and content.', 'warning');
        }

        try {
            const newPost = await apiFetch('/forum', {
                method: 'POST',
                body: JSON.stringify({ title, content }),
            });

            // Optimistic UI Update: Add post directly instead of re-fetching all
            const postElement = createPostElement(newPost);
            postsContainer.prepend(postElement); // Add to the top
            fetchAndDisplayComments(newPost._id); // Load its (empty) comments section
            noPostsMessage.style.display = 'none';

            titleInput.value = '';
            contentInput.value = '';
        } catch (error) {
            if (error.message.includes('token')) {
                window.location.href = '../login.html';
            }
            showNotification(error.message);
        }
    };

    const handleAddComment = async (postId, commentInput) => {
        const content = commentInput.value.trim();
        if (!content) return;

        try {
            const newComment = await apiFetch(`/forum/${postId}/comments`, {
                method: 'POST',
                body: JSON.stringify({ content }),
            });
            
            // Optimistic UI Update for comments
            const commentsContainer = document.getElementById(`comments-for-${postId}`);
            if (commentsContainer.querySelector('p')) { // If "No comments yet" message is there
                commentsContainer.innerHTML = '';
            }
            commentsContainer.appendChild(createCommentElement(newComment));
            commentInput.value = '';

        } catch (error) {
            showNotification(error.message);
        }
    };

    // --- Event Listeners ---
    document.getElementById('addPostBtn').addEventListener('click', handleAddPost);

    postsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('comment-btn')) {
            const postId = event.target.dataset.postId;
            const commentInput = event.target.previousElementSibling;
            handleAddComment(postId, commentInput);
        }
    });

    // Initial load
    fetchAndDisplayPosts();
});