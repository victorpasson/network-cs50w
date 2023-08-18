from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("newpost", views.newpost, name="newpost"),
    path("allposts", views.allposts, name="allposts"),
    path("allposts/edit", views.edit, name="edit"),
    path("profile/<str:uname>", views.profile, name="profile"),
    path("follow", views.profilefollow, name='follow'),
    path("following", views.following, name="following"),
    path("likeunlike", views.likeunlike, name="likeunlike"),
    path("ifollow", views.index, name="ifollow"),
    path("<str:username>", views.usern, name="usern")
]
