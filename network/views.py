import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.core.paginator import Paginator

from .models import User, Post, Follow


def index(request):
    if request.user.is_authenticated:
        return render(request, "network/index.html")

    # Everyone else is prompted to sign in
    else:
        posts = Post.objects.all()
        posts = posts.order_by('-date').all()
        posts = Paginator(posts, 10)
        page_number = request.GET.get('page')
        page = posts.get_page(page_number)
        return render(request, "network/index.html", {
            'posts': page
        })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":

        username = request.POST["username"]
        email = request.POST["email"]
        first_name = request.POST["first_name"]
        last_name = request.POST["last_name"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]

        if any(element == "" for element in [username, email, password]):
            return render(request, "network/register.html", {
                "message": "Usename, Email and Password can't be empty."
            })

        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.first_name = first_name
            user.last_name = last_name
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@login_required
def newpost(request):

    # New Post is a POST metho
    if request.method != 'POST':
        return JsonResponse({'error': 'POST request required'}, status=400)

    # Load the content
    data = json.loads(request.body)

    contentjs = data.get("content", "")
    if contentjs == "":
        return JsonResponse({"error": "Content needed."}, status=400)

    post = Post(
        user = request.user,
        content = contentjs
    )
    post.save()
    return JsonResponse(post.serialize(request), safe=False, status=201)

@login_required
def allposts(request):
    if request.method != "GET":
        return JsonResponse({'error': 'GET request required'}, status=400)

    posts = Post.objects.all()
    posts = posts.order_by('-date').all()
    posts = Paginator(posts, 10)
    page_number = request.GET.get('page')
    page = posts.get_page(page_number)
    return JsonResponse({"posts":[post.serialize(request) for post in page],
                         "next": page.has_next(),
                         "prev": page.has_previous()}, safe=False)

@login_required
def profile(request, uname):

    # See Profile Page is just GET method
    if request.method != 'GET':
        return JsonResponse({'error': 'GET request required'}, status=400)

    try:
        puser = User.objects.filter(username=uname).first()
        posts = Post.objects.filter(user=puser).order_by('-date').all()
        posts = Paginator(posts, 10)
        page_number = request.GET.get('page')
        page = posts.get_page(page_number)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found."}, status=404)

    return JsonResponse({
        'following': puser.ifollowing.all().count(),
        'followers': puser.ifollower.all().count(),
        'myposts': [post.serialize(request) for post in page],
        'in': request.user in [follow.user for follow in puser.ifollower.all()],
        "next": page.has_next(),
        "prev": page.has_previous()
    }, safe=False)

@login_required
def following(request):
    if request.method != "GET":
        return JsonResponse({'error': 'GET request required'}, status=400)

    puser = request.user
    teste = [us.following.id for us in puser.ifollowing.all()]
    posts = Post.objects.filter(user__in = teste).order_by('-date').all()
    posts = Paginator(posts, 10)
    page_number = request.GET.get('page')
    page = posts.get_page(page_number)
    return JsonResponse({"posts":[post.serialize(request) for post in page],
                         "next": page.has_next(),
                         "prev": page.has_previous()}, safe=False)

@login_required
def likeunlike(request):

    if request.method != 'PUT':
        return JsonResponse({
            "error": "PUT request required."
            }, status=400)

    data = json.loads(request.body)
    postid = data.get("postid")
    post = Post.objects.get(pk=int(postid))
    user = request.user

    if post in user.mylikes.all():
        user.mylikes.remove(post)
        user.save()
    else:
        user.mylikes.add(post)
        user.save()

    return HttpResponse(status=204)

@login_required
def profilefollow(request):

    if request.method != 'PUT':
        return JsonResponse({
            "error": "PUT request required."
            }, status=400)

    data = json.loads(request.body)
    uname = data.get("follow")
    tofollow = User.objects.filter(username=uname).first()
    user = request.user

    checking = Follow.objects.filter(user=user, following=tofollow)
    if checking:
        checking.delete()
    else:
        new = Follow(user=user, following=tofollow)
        new.save()

    return HttpResponse(status=204)

@login_required
def edit(request):
    if request.method != 'PUT':
        return JsonResponse({
            "error": "PUT request required."
            }, status=400)

    # Query for requested email
    data = json.loads(request.body)
    newcontent = data.get("newcontent")
    postid = int(data.get("postid"))
    try:
        post = Post.objects.get(user=request.user, pk=postid)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found."}, status=404)

    post.content = newcontent
    post.save()
    return JsonResponse(post.serialize(request), safe=False, status=201)

def usern(request, username):
    if request.user.is_authenticated:
        return render(request, "network/index.html")

    # Everyone else is prompted to sign in
    else:
        return HttpResponseRedirect(reverse("login"))