from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0037_rebuild_galleryvideo_no_fk'),
    ]

    operations = [
        migrations.RunSQL(
            sql="DROP TABLE IF EXISTS user_galleryvideo CASCADE;",
            reverse_sql="",
        ),
    ]
