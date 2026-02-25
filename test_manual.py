import requests
import io
from PIL import Image

# 1. Create a stego image with password
with open("stegdetect-logo.png", "rb") as f:
    carrier_bytes = f.read()

res = requests.post(
    "http://localhost:8000/hide",
    files={
        "carrier_file": ("logo.png", carrier_bytes, "image/png"),
    },
    data={
        "secret_text": "hello password world",
        "password": "mypassword123",
        "n_bits": "4"
    }
)

if res.status_code != 200:
    print(f"Hide failed: {res.text}")
    exit(1)

stego_bytes = res.content
print("Successfully generated stego image")

# 2. Extract with password
res2 = requests.post(
    "http://localhost:8000/extract",
    files={
        "stego_file": ("stego.png", stego_bytes, "image/png"),
    },
    data={
        "password": "mypassword123",
        "n_bits": "4"
    }
)

print(f"Extract status: {res2.status_code}")
print(f"Extract response: {res2.text[:200]}")

