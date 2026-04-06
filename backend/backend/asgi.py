import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

import django
django.setup()

from django.conf import settings
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from whitenoise import WhiteNoise
from backend.routing import websocket_urlpatterns

django_asgi_app = get_asgi_application()

# WhiteNoise serves collected static files in both DEBUG and production (Render)
_whitenoise_app = WhiteNoise(django_asgi_app, root=str(settings.STATIC_ROOT), prefix='static')

application = ProtocolTypeRouter({
    'http': _whitenoise_app,
    'websocket': URLRouter(websocket_urlpatterns),
})
