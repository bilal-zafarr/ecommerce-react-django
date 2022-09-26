from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import *
from .products import products
from .serializer import *


@api_view(["GET"])
def getRoutes(request):
    return Response("Here are your routes")


@api_view(["GET"])
def getProducts(request):
    products = Product.objects.all()
    # this "products" is returning a python queryset -- we need to serialize it into JSON format
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def getProduct(request, pk):
    product = Product.objects.get(_id=pk)
    serializer = ProductSerializer(product, many=False)
    return Response(serializer.data)
