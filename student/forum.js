document.addEventListener('DOMContentLoaded', () => {
    // Get HTML elements
    const postsContainer = document.getElementById('postsContainer');
    const addPostBtn = document.getElementById('addPostBtn');
    const titleInput = document.getElementById('postTitleInput');
    const contentInput = document.getElementById('postContentInput');
    const noPostsMessage = document.getElementById('noPostsMessage');

    // --- Function to fetch all posts and trigger comment fetching for each ---
    const fetchAndDisplayPosts = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/forum');
            const posts = await response.json();

            postsContainer.innerHTML = ''; // Clear existing content

            if (posts.length === 0) {
                noPostsMessage.style.display = 'block';
            } else {
                noPostsMessage.style.display = 'none';
                posts.forEach(post => {
                    const postElement = document.createElement('div');
                    postElement.className = 'post'; // Using your CSS class
                    // We create the structure, and the comments will be filled in by another function
                    postElement.innerHTML = `
                        <div class="post-header">
                            <span class="post-author">${post.name}</span>
                            <span class="post-time">${new Date(post.createdAt).toLocaleString()}</span>
                        </div>
                        <h3 class="text-lg font-bold text-slate-800 mb-2">${post.title}</h3>
                        <p class="post-content">${post.content}</p>
                        <div class="comments-section">
                            <h4 class="text-md font-semibold mb-2 text-slate-600">Comments</h4>
                            <div class="comments-container" id="comments-for-${post._id}">
                                <p class="text-slate-500 text-sm">Loading comments...</p>
                            </div>
                            <div class="add-comment-form mt-4">
                                <textarea class="comment-input" placeholder="Add a supportive comment..."></textarea>
                                <button class="comment-btn" data-post-id="${post._id}">Comment</button>
                            </div>
                        </div>
                    `;
                    postsContainer.appendChild(postElement);
                    // Now, fetch the comments for this specific post
                    fetchAndDisplayComments(post._id);
                });
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
            postsContainer.innerHTML = '<p class="text-red-500">Could not load posts.</p>';
        }
    };
    
    // --- Function to fetch and display comments for a single post ---
    const fetchAndDisplayComments = async (postId) => {
        const commentsContainer = document.getElementById(`comments-for-${postId}`);
        try {
            const response = await fetch(`http://localhost:3000/api/forum/${postId}/comments`);
            const comments = await response.json();
            
            commentsContainer.innerHTML = ''; // Clear "Loading..." message
            
            if (comments.length > 0) {
                 comments.forEach(comment => {
                    const commentElement = document.createElement('div');
                    commentElement.className = 'comment';
                    commentElement.innerHTML = `
                        <div class="comment-header">
                            <span class="comment-author">${comment.name}</span>
                            <span class="comment-time">${new Date(comment.createdAt).toLocaleString()}</span>
                        </div>
                        <p class="comment-content">${comment.content}</p>
                    `;
                    commentsContainer.appendChild(commentElement);
                });
            }
        } catch (error) {
            console.error(`Error fetching comments for post ${postId}:`, error);
            commentsContainer.innerHTML = '<p class="text-red-500 text-sm">Could not load comments.</p>';
        }
    };

    // --- Function to handle creating a new post ---
    const handleAddPost = async () => {
        // --- THIS IS THE TEST MESSAGE ---
        console.log('"Post Anonymously" button was clicked!');

        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        if (!title || !content) {
            alert('Please fill in both the title and content.');
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) {
            alert('You must be logged in to post.');
            window.location.href = '../login.html';
            return;
        }
        try {
            const response = await fetch('http://localhost:3000/api/forum', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ title, content }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || 'Failed to create post.');
            }
            titleInput.value = '';
            contentInput.value = '';
            fetchAndDisplayPosts();
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    // --- Function to handle adding a new comment ---
    const handleAddComment = async (postId, commentContent) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('You must be logged in to comment.');
            return;
        }
        try {
            const response = await fetch(`http://localhost:3000/api/forum/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token,
                },
                body: JSON.stringify({ content: commentContent }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || 'Failed to post comment.');
            }
            
            // Refresh just the comments for the relevant post
            fetchAndDisplayComments(postId);

        } catch (error) {
            alert(error.message);
        }
    };

    // --- Event Delegation for all Comment Buttons ---
    // Instead of adding many event listeners, we add one to the main container
    postsContainer.addEventListener('click', (event) => {
        // Check if a comment button was clicked
        if (event.target.classList.contains('comment-btn')) {
            const postId = event.target.dataset.postId;
            const commentInput = event.target.previousElementSibling; // The textarea before the button
            const commentContent = commentInput.value.trim();
            
            if (commentContent) {
                handleAddComment(postId, commentContent);
                commentInput.value = ''; // Clear the textarea
            }
        }
    });

    // Attach event listener for the main post button and load initial posts
    addPostBtn.addEventListener('click', handleAddPost);
    fetchAndDisplayPosts();
});