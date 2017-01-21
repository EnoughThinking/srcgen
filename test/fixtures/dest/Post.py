from __future__ import unicode_literals
from django.db import models
from django.contrib.auth.models import User


class Post(models.Model):
    title = models.TextField(max_length=512)
    name = models.TextField(max_length=512)