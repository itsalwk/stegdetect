import requests

with open("test_audio_stego2.wav", "rb") as f:
    stego_bytes = f.read()

res = requests.post(
    "http://localhost:8000/extract",
    files={
        "stego_file": ("stego.wav", stego_bytes, "audio/wav"),
    },
    data={
        "password": "test",
        "n_bits": "4"
    }
)

if res.status_code == 200:
    print("Success! Extracted bytes matching expected length:", len(res.content))
else:
    print("Failed API extract:", res.status_code, res.text)
