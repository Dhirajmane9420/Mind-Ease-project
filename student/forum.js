document.addEventListener('DOMContentLoaded', () => {
    const addPostBtn = document.getElementById('addPostBtn');
    const postsContainer = document.getElementById('postsContainer');
    const noPostsMessage = document.getElementById('noPostsMessage');

    // Anonymous usernames for a friendly, non-identifiable feel
    const anonymousAnimals = ["Panda", "Tiger", "Eagle", "Dolphin", "Fox", "Wolf", "Owl", "Bear"];
    const getRandomAnimal = () => anonymousAnimals[Math.floor(Math.random() * anonymousAnimals.length)];

    // Load posts from local storage or use a default array
    let posts = JSON.parse(localStorage.getItem('forumPosts')) || [];

    // Function to render all posts
    const renderPosts = () => {
        postsContainer.innerHTML = ''; // Clear existing posts
        if (posts.length === 0) {
            noPostsMessage.style.display = 'block';
        } else {
            noPostsMessage.style.display = 'none';
            posts.forEach(post => {
                const postElement = document.createElement('div');
                postElement.className = 'post';
                postElement.innerHTML = `
                    <div class="post-header">
                        <span class="post-author">Anonymous ${post.authorAnimal}</span>
                        <span class="post-time">${new Date(post.timestamp).toLocaleString()}</span>
                    </div>
                    <h3 class="text-lg font-bold text-slate-800 mb-2">${post.title}</h3>
                    <p class="post-content">${post.content}</p>
                    
                    <div class="comments-section">
                        <h4 class="text-md font-semibold mb-2 text-slate-600">Comments (${post.comments.length})</h4>
                        <div class="comments-container">
                            ${post.comments.map(comment => `
                                <div class="comment">
                                    <div class="comment-header">
                                        <span class="comment-author">Anonymous ${comment.authorAnimal}</span>
                                        <span class="comment-time">${new Date(comment.timestamp).toLocaleString()}</span>
                                    </div>
                                    <p class="comment-content">${comment.content}</p>
                                </div>
                            `).join('')}
                        </div>
                        <div class="add-comment-form mt-4">
                            <textarea class="comment-input" placeholder="Add a supportive comment..."></textarea>
                            <button class="comment-btn">Comment</button>
                        </div>
                    </div>
                `;
                postsContainer.appendChild(postElement);

                // Add event listener for the new comment button
                const commentButton = postElement.querySelector('.comment-btn');
                const commentInput = postElement.querySelector('.comment-input');
                commentButton.addEventListener('click', () => {
                    const commentContent = commentInput.value.trim();
                    if (commentContent) {
                        addComment(post.id, commentContent);
                        commentInput.value = ''; // Clear input
                    }
                });
            });
        }
    };

    // Function to save posts to local storage
    const savePosts = () => {
        localStorage.setItem('forumPosts', JSON.stringify(posts));
    };

    // Function to add a new post
    const addPost = (title, content) => {
        const newPost = {
            id: Date.now(),
            title,
            content,
            authorAnimal: getRandomAnimal(),
            timestamp: new Date().toISOString(),
            comments: []
        };
        posts.unshift(newPost); // Add to the beginning of the array
        savePosts();
        renderPosts();
    };
    
    // Function to add a comment to a post
    const addComment = (postId, content) => {
        const post = posts.find(p => p.id === postId);
        if (post) {
            const newComment = {
                authorAnimal: getRandomAnimal(),
                content,
                timestamp: new Date().toISOString()
            };
            post.comments.push(newComment);
            savePosts();
            renderPosts(); // Re-render all posts to show the new comment
        }
    };

    // Event listener for the main "Add Post" button
    addPostBtn.addEventListener('click', () => {
        const titleInput = document.getElementById('postTitleInput');
        const contentInput = document.getElementById('postContentInput');
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        if (title && content) {
            addPost(title, content);
            titleInput.value = '';
            contentInput.value = '';
        } else {
            alert('Please fill in both the title and content for your post.');
        }
    });

    // Initial render of posts when the page loads
    renderPosts();
});