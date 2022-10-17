import jwt
from base.models import *
from base.serializer import *
from base.utils import Util
from django.conf import settings
from django.contrib.auth.hashers import make_password
from django.contrib.sites.shortcuts import get_current_site
from django.http import JsonResponse
from django.urls import reverse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        serializer = UserSerializerWithToken(self.user).data

        for k, v in serializer.items():
            data[k] = v

        return data


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


@api_view(["POST"])
def registerUser(request):
    data = request.data
    try:
        user = User.objects.create(
            first_name=data["name"],
            username=data["email"],
            email=data["email"],
            password=make_password(data["password"]),
        )

        # send email for user verification
        token = RefreshToken.for_user(user).access_token
        current_site = get_current_site(request).domain
        relativeLink = reverse("email-verify")
        absurl = "http://" + current_site + relativeLink + "?token=" + str(token)

        data = {
            "email_subject": "Verify your email",
            "email_body": "Hi "
            + user.first_name
            + "! Click the link below to verify your email \n"
            + absurl,
            "to_email": user.email,
        }
        Util.send_email(data)

        serializer = UserSerializerWithToken(user, many=False)
        return Response(serializer.data)
    except:
        message = {"detail": "User with this email already exists"}
        return Response(message, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def verify_email(request):
    token = request.GET.get("token")
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user = User.objects.get(id=payload["user_id"])
        if not user.emailVerified:
            user.emailVerified = True
            user.save()
        return JsonResponse(
            {"email": "Successfully activated"}, status=status.HTTP_200_OK
        )
    except jwt.ExpiredSignatureError as identifier:
        return Response(
            {"error": "Activation Expired"}, status=status.HTTP_400_BAD_REQUEST
        )
    except jwt.exceptions.DecodeError as identifier:
        return JsonResponse(
            {"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST
        )


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def updateUserProfile(request):
    user = request.user
    serializer = UserSerializerWithToken(user, many=False)

    data = request.data
    user.first_name = data["name"]
    user.username = data["email"]
    user.email = data["email"]
    if data["password"] != "":
        user.password = make_password(data["password"])

    user.save()

    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def getUserProfile(request):
    user = request.user
    serializer = UserSerializer(user, many=False)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAdminUser])
def getUsers(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAdminUser])
def getUserById(request, pk):
    user = User.objects.get(id=pk)
    serializer = UserSerializer(user, many=False)
    return Response(serializer.data)


@api_view(["PUT"])
@permission_classes([IsAdminUser])
def updateUser(request, pk):
    user = User.objects.get(id=pk)

    data = request.data
    user.first_name = data["name"]
    user.username = data["email"]
    user.email = data["email"]
    user.is_staff = data["isAdmin"]

    user.save()

    serializer = UserSerializer(user, many=False)
    return Response(serializer.data)


@api_view(["DELETE"])
@permission_classes([IsAdminUser])
def deleteUser(request, pk):
    userForDeletion = User.objects.get(id=pk)
    userForDeletion.delete()
    return Response("User Deleted")
