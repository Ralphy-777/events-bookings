from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0036_galleryvideo_allow_blank_video'),
    ]

    operations = [
        migrations.RunSQL(
            sql="DROP TABLE IF EXISTS user_galleryvideo CASCADE;",
            reverse_sql="",
        ),
        migrations.CreateModel(
            name='GalleryVideo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('video_file', models.FileField(blank=True, null=True, upload_to='gallery_videos/', help_text='Upload MP4 video file')),
                ('thumbnail', models.ImageField(blank=True, null=True, upload_to='gallery_thumbnails/', help_text='Optional thumbnail image')),
                ('description', models.TextField(blank=True)),
                ('category', models.CharField(blank=True, default='General', max_length=100, help_text='e.g. Wedding, Birthday')),
                ('order', models.IntegerField(default=0, help_text='Lower number = appears first')),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name': 'Gallery Video',
                'verbose_name_plural': 'Gallery Videos',
                'ordering': ['order', '-created_at'],
            },
        ),
    ]
