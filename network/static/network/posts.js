const csrftoken = document.currentScript.dataset.csrf;

document.addEventListener('DOMContentLoaded', function () {

    // Buttons to toggle between pages
    document.querySelector('#aAllPosts').addEventListener('click', () => load_allposts());
    document.querySelector('#aUser').addEventListener('click', () => load_userpage(document.querySelector("#aUser").innerText, 1));
    document.querySelector('#aFollowing').addEventListener('click', () => load_following(1));

    // By default, load AllPosts
    load_allposts();

})

function load_allposts() {

    // Show post view and hide other views
    document.querySelector("#userPage").style.display = 'none';
    document.querySelector("#following").style.display = 'none';
    document.querySelector("#allPosts").style.display = 'block';

    history.pushState({}, "", '/');

    load_posts(1);

    // Send New Post
    document.querySelector("#NewPost").onsubmit = function () {

        fetch('/newpost', {
            method: 'POST',
            body: JSON.stringify({
                content: document.querySelector('textarea').value
            }),
            headers: { "X-CSRFToken": csrftoken },
        })
        .then(response => response.json())
        .then(result => {
            const npost = build_post(result)
            document.querySelector('#posts').prepend(npost);
            show_alert("Post created successfully!")
        })

        document.querySelector('textarea').value = "";

        return false;
    }

}

function load_userpage(username, argpage) {

    // Show user view and hide other views
    document.querySelector("#userPage").style.display = 'block';
    document.querySelector("#following").style.display = 'none';
    document.querySelector("#allPosts").style.display = 'none';

    history.pushState({}, "", `${username}`);

    document.querySelector("#posts").innerHTML = "";

    const pagenumber = argpage;

    fetch(`/profile/${username}?page=${pagenumber}`)
    .then(response => response.json())
    .then(profile => {
        make_following(username, profile.in);

        document.querySelector("#userInfo").innerHTML = `
        Followers <span id="sfollowers">${profile.followers}</span> |
        Following <span id="sfollowing">${profile.following}</span>
        `;

        profile.myposts.forEach(post => {
            const npost = build_post(post);
            document.querySelector('#posts').append(npost);
        })

        const nav = build_user_nav(profile, pagenumber, username);
        document.querySelector('#posts').append(nav);
    })

    return false;
}

function load_following(argpage) {

    // Show user view and hide other views
    document.querySelector("#userPage").style.display = 'none';
    document.querySelector("#following").style.display = 'block';
    document.querySelector("#allPosts").style.display = 'none';

    history.pushState({}, "", '/ifollow');

    document.querySelector("#posts").innerHTML = "";

    const pagenumber = argpage;

    fetch(`/following?page=${pagenumber}`)
    .then(response => response.json())
    .then(posts => {
        posts.posts.forEach(post => {
            const npost = build_post(post);
            document.querySelector('#posts').append(npost);
        })
        const nav = build_nav(posts.next, posts.prev, pagenumber, load_following);
        document.querySelector('#posts').append(nav);
    })
}

function load_posts(argpage) {

    document.querySelector("#posts").innerHTML = "";

    let pagenumber = argpage;

    fetch(`/allposts?page=${pagenumber}`)
    .then(response => response.json())
    .then(posts => {
        posts.posts.forEach(post => {
            const npost = build_post(post);
            document.querySelector('#posts').append(npost);
        })
        const nav = build_nav(posts.next, posts.prev, pagenumber, load_posts);
        document.querySelector('#posts').append(nav);
    })
}

function build_post(arg1) {
    // Checking status
    let itag = (arg1.in) ? "fa-solid fa-heart" : "fa-regular fa-heart";
    let edit = (arg1.is) ? 'Edit' : "";
    // Create new post element
    let npost = document.createElement('div');
    npost.innerHTML = `
        <h3>${arg1.user}</h3>
        <span class="text-primary edit">${edit}</span>
        <p class="my-2">${arg1.content}</p>
        <p class="my-0 text-secondary">${arg1.date}</p>
        <p class="mt-0 mb-3 text-danger"><i class="${itag}"></i> <span class="likes">${arg1.likes.length}</span></p>
    `;
    // Adding dataset
    npost.dataset.pid = arg1.id;
    // Create EventListeners
    npost.querySelector(".edit").addEventListener('click', () => edit_post(arg1));
    npost.querySelector("h3").addEventListener('click', () => load_userpage(arg1.user, 1));
    npost.querySelector("i").addEventListener('click', () => make_like(npost.dataset.pid));
    // Return the post
    return npost;
}

function build_edit_post(npost, result) {
    // Checking status
    let itag = (result.in) ? "fa-solid fa-heart" : "fa-regular fa-heart";
    let edit = (result.is) ? 'Edit' : "";
    // Editing the innerHTML
    npost.innerHTML = `
            <h3>${result.user}</h3>
            <span class="text-primary edit">${edit}</span>
            <p class="my-2">${result.content}</p>
            <p class="my-0 text-secondary">${result.date}</p>
            <p class="mt-0 mb-3 text-danger"><i class="${itag}"></i> <span class="likes">${result.likes.length}</span></p>
            `;
    // Adding dataset
    npost.dataset.pid = result.id;
    // Creat EventListeners
    npost.querySelector(".edit").addEventListener('click', () => edit_post(result));
    npost.querySelector("h3").addEventListener('click', () => load_userpage(result.user, 1));
    npost.querySelector("i").addEventListener('click', () => make_like(npost.dataset.pid));
}

function make_like(post_id) {
    if (document.querySelector(`div[data-pid="${post_id}"]`).querySelector('i').className === "fa-solid fa-heart") {
        document.querySelector(`div[data-pid="${post_id}"]`).querySelector('i').className = "fa-regular fa-heart";

        nlikes = parseInt(document.querySelector(`div[data-pid="${post_id}"]`).querySelector('.likes').innerHTML);
        nlikes--
        document.querySelector(`div[data-pid="${post_id}"]`).querySelector('.likes').innerHTML = nlikes;
    }
    else {
        document.querySelector(`div[data-pid="${post_id}"]`).querySelector('i').className = "fa-solid fa-heart";

        nlikes = parseInt(document.querySelector(`div[data-pid="${post_id}"]`).querySelector('.likes').innerHTML);
        nlikes++
        document.querySelector(`div[data-pid="${post_id}"]`).querySelector('.likes').innerHTML = nlikes;
    }

    fetch(`/likeunlike`, {
        method: 'PUT',
        body: JSON.stringify({
            postid: post_id
        }),
        headers: { "X-CSRFToken": csrftoken },
    })

    return false;
}

function make_following(username, uin) {

    if (username == document.querySelector("#aUser").innerText) {
        document.querySelector("#userPageName").innerHTML = `
            <h1>${username}</h1>
        `;
    }
    else {
        if (uin) {
            document.querySelector("#userPageName").innerHTML = `
            <h1>${username} <button class="btn btn-sm btn-danger">Unfollow</button></h1>
            `;
        }
        else {
            document.querySelector("#userPageName").innerHTML = `
            <h1>${username} <button class="btn btn-sm btn-primary">Follow</button></h1>
            `;
        }
        document.querySelector("#userPageName button").addEventListener('click', () => follow_listener(username));
    }
}

function follow_listener(username) {
    if (document.querySelector("#userPageName button").innerHTML === 'Follow') {
        document.querySelector("#userPageName button").innerHTML = 'Unfollow'
        document.querySelector("#userPageName button").className = "btn btn-sm btn-danger";
        n = parseInt(document.querySelector('#sfollowers').innerHTML);
        n++;
        document.querySelector('#sfollowers').innerHTML = n;
    }
    else {
        document.querySelector("#userPageName button").innerHTML = 'Follow'
        document.querySelector("#userPageName button").className = "btn btn-sm btn-primary";
        n = parseInt(document.querySelector('#sfollowers').innerHTML);
        n--;
        document.querySelector('#sfollowers').innerHTML = n;
    }

    fetch('follow', {
        method: 'PUT',
        body: JSON.stringify({
            follow: username
        }),
        headers: { "X-CSRFToken": csrftoken },
    })

    return false;
}

function edit_post(content) {
    let npost = document.querySelector(`div[data-pid="${content.id}"]`);
    npost.innerHTML = `
    <h3>${content.user}</h3>
    <form>
        <div class="form-group">
            <textarea class="form-control">${content.content}</textarea>
        </div>
        <button class="btn btn-sm btn-danger">Cancel</button>
        <input type="submit" class="btn btn-sm btn-primary" value="Save">
    </form>
    `

    npost.querySelector('form').onsubmit = function() {
        fetch('allposts/edit', {
            method: 'PUT',
            body: JSON.stringify({
                newcontent: npost.querySelector('textarea').value,
                postid: content.id
            }),
            headers: { "X-CSRFToken": csrftoken },
        })
            .then(response => response.json())
            .then(result => {
                // Build Edit Post Content
                build_edit_post(npost, result);
                // Show the user
                show_alert("Post edited successfully!")
            })
        return false;
    }

    npost.querySelector('button').onclick = function() {
        // Build Edit Post Content
        build_edit_post(npost, content);
        // Return False to not update
        return false;
    }
}

function build_nav(hasnext, hasprev, actualpage, f) {
    const nav = document.createElement('nav');
    const hnext = (hasnext) ? '' : 'disabled';
    const hprev = (hasprev) ? '' : 'disabled';
    nav.innerHTML = `
    <ul class="pagination justify-content-center">
        <li class="page-item ${hprev}">
            <a class="page-link" href="#" tabindex="-1">Previous</a>
        </li>
        <li class="page-item ${hnext}">
            <a class="page-link" href="#">Next</a>
        </li>
    </ul>
    `;

    if (hasprev) {
        pprev = actualpage - 1;
        nav.querySelectorAll(".page-link")[0].addEventListener('click', () => f(pprev));
    }

    if (hasnext) {
        pnext = actualpage + 1;
        nav.querySelectorAll(".page-link")[1].addEventListener('click', () => f(pnext));
    }

    return nav;
}

function build_user_nav(profile, pagenumber, username) {
    const nav = document.createElement('nav');
    const hnext = (profile.next) ? '' : 'disabled';
    const hprev = (profile.prev) ? '' : 'disabled';
    nav.innerHTML = `
        <ul class="pagination justify-content-center">
            <li class="page-item ${hprev}">
                <a class="page-link" href="#" tabindex="-1">Previous</a>
            </li>
            <li class="page-item ${hnext}">
                <a class="page-link" href="#">Next</a>
            </li>
        </ul>
        `;

    if (profile.prev) {
        pprev = pagenumber - 1;
        nav.querySelectorAll(".page-link")[0].addEventListener('click', () => load_userpage(username, pprev));
    }

    if (profile.next) {
        pnext = pagenumber + 1;
        nav.querySelectorAll(".page-link")[1].addEventListener('click', () => load_userpage(username, pnext));
    }

    return nav;
}

function show_alert(message) {
    const men = document.createElement('div');
    men.innerHTML = `
    <div class="alert alert-primary alert-dismissible fade show" role="alert">
    <strong>${message}</strong>
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
    </button>
    </div>
    `;
    document.querySelector('.body').prepend(men);
}