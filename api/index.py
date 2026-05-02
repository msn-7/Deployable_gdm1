import sys
import os

# Make the server module importable
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'server'))

from app import app

# Vercel uses 'app' as the WSGI handler automatically
