# Generated by Django 4.1.1 on 2022-10-19 11:45

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("base", "0003_remove_orderitem_address_remove_orderitem_city_and_more"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="orderitem",
            name="name",
        ),
    ]
