from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class User(AbstractUser):
    pass

class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="myposts")
    content = models.TextField()
    date = models.DateTimeField(default=timezone.now)
    likes = models.ManyToManyField(User, related_name="mylikes", blank=True, null=True)

    def serialize(self, request):
        return {
            "id": self.id,
            "user": self.user.username,
            "content": self.content,
            "date": self.date.strftime("%I:%M %p, %b %d %Y"),
            "likes": [user.username for user in self.likes.all()],
            "in": request.user in [like for like in self.likes.all()],
            "is": self.user == request.user
        }

class Follow(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="ifollowing")
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name="ifollower")