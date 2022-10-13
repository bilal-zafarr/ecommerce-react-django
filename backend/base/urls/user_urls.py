from base.views import user_views as views
from django.urls import path

urlpatterns = [
    path("", views.getUsers, name="users"),
    path("login/", views.MyTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("register/", views.registerUser, name="register"),
    path("email-verify/", views.verify_email, name="email-verify"),
    path("profile/", views.getUserProfile, name="users-profile"),
    path("profile/update/", views.updateUserProfile, name="users-profile-update"),
    path("<str:pk>/", views.getUserById, name="user"),
    path("update/<str:pk>/", views.updateUser, name="user-update"),
    path("delete/<str:pk>/", views.deleteUser, name="user-delete"),
]
