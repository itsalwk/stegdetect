import numpy as np
from PIL import Image
import io
import struct
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
import os
import base64
import zlib

class StegoService:

    def __init__(self):
        pass

    def _derive_key(self, password: str, salt: bytes) -> bytes:
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        return kdf.derive(password.encode())

    def encrypt(self, data: bytes, password: str) -> bytes:
        salt = os.urandom(16)
        key = self._derive_key(password, salt)
        aesgcm = AESGCM(key)
        nonce = os.urandom(12)
        encrypted_data = aesgcm.encrypt(nonce, data, None)
        return salt + nonce + encrypted_data

    def decrypt(self, encrypted_data: bytes, password: str) -> bytes:
        salt = encrypted_data[:16]
        nonce = encrypted_data[16:28]
        ciphertext = encrypted_data[28:]
        key = self._derive_key(password, salt)
        aesgcm = AESGCM(key)
        return aesgcm.decrypt(nonce, ciphertext, None)

    def hide_data(self, carrier_image: Image.Image, secret_data: bytes, password: str = None, n_bits: int = 1) -> Image.Image:
        """Embeds binary data into an image using multiple LSBs."""
        if carrier_image.mode != 'RGB':
            carrier_image = carrier_image.convert('RGB')
            
        secret_data = zlib.compress(secret_data)
        if password:
            secret_data = self.encrypt(secret_data, password)
        
        # Prepare length prefix (4 bytes signature + 4 bytes length = 64 bits)
        signature = b'STG1'
        data_len = len(secret_data)
        len_bytes = struct.pack('>I', data_len) # Big-endian unsigned int
        
        full_payload = signature + len_bytes + secret_data
        
        payload_np = np.frombuffer(full_payload, dtype=np.uint8)
        bits = np.unpackbits(payload_np)
        
        img_array = np.array(carrier_image)
        flat_img = img_array.flatten().copy()
        
        required_elements = (len(bits) + n_bits - 1) // n_bits
        if required_elements > len(flat_img):
            repeats = (required_elements + len(flat_img) - 1) // len(flat_img)
            img_array = np.tile(img_array, (repeats, 1, 1))
            flat_img = img_array.flatten().copy()
        
        # Pad bits to be multiple of n_bits
        padding = (n_bits - (len(bits) % n_bits)) % n_bits
        if padding:
            bits = np.pad(bits, (0, padding), 'constant')
            
        bits_to_embed = bits.reshape(-1, n_bits)
        powers_of_two = 2**np.arange(n_bits)[::-1]
        values_to_embed = np.sum(bits_to_embed * powers_of_two, axis=1).astype(np.uint8)
        
        mask = 0xFF ^ ((1 << n_bits) - 1)
        flat_img[:len(values_to_embed)] = (flat_img[:len(values_to_embed)] & mask) | values_to_embed
        
        new_img_array = flat_img.reshape(img_array.shape)
        return Image.fromarray(new_img_array)

    def extract_data(self, stego_image: Image.Image, password: str = None, n_bits: int = 1) -> bytes:
        """Extracts hidden data from multiple LSBs of an image."""
        if stego_image.mode != 'RGB':
            stego_image = stego_image.convert('RGB')
            
        img_array = np.array(stego_image)
        flat_img = img_array.flatten()
        
        # 1. Extract Header (64 bits)
        len_bits_needed = 64
        pixels_for_len = (len_bits_needed + n_bits - 1) // n_bits
        
        if len(flat_img) < pixels_for_len:
             return None

        mask = (1 << n_bits) - 1
        
        # Extract header pixels
        header_pixels = flat_img[:pixels_for_len]
        header_vals = (header_pixels & mask).astype(np.uint8)
        
        # Unpack bits
        header_bits = np.unpackbits(header_vals.reshape(-1, 1), axis=1)[:, -n_bits:].flatten()
        header_bits = header_bits[:64] # Take exactly 64 bits
        
        # Reconstruct length
        header_bytes = np.packbits(header_bits).tobytes()
        if header_bytes[:4] != b'STG1':
            return None
            
        try:
            data_len = struct.unpack('>I', header_bytes[4:8])[0]
        except struct.error:
            return None
            
        # Sanity check length to avoid memory explosion
        max_possible_bytes = (len(flat_img) * n_bits) // 8
        if data_len > max_possible_bytes or data_len == 0:
            return None
            
        # 2. Extract Data
        # Total bits needed = (64 bits for header) + (data_len * 8 bits for payload)
        data_bits_needed = data_len * 8
        total_bits_needed = 64 + data_bits_needed
        
        # Calculate total pixels required to store everything
        total_pixels_needed = (total_bits_needed + n_bits - 1) // n_bits
        
        if len(flat_img) < total_pixels_needed:
            # File might be truncated or not contain our data
            return None
            
        # Extract all needed pixels
        payload_pixels = flat_img[:total_pixels_needed]
        payload_vals = (payload_pixels & mask).astype(np.uint8)
        
        all_bits = np.unpackbits(payload_vals.reshape(-1, 1), axis=1)[:, -n_bits:].flatten()
        
        # Extract exactly the payload bits
        payload_bits = all_bits[64 : 64 + data_bits_needed]
        
        extracted_data = np.packbits(payload_bits).tobytes()
        
        if password:
            try:
                extracted_data = self.decrypt(extracted_data, password)
            except Exception as e:
                raise ValueError(f"Decryption failed: {str(e)}")
        
        try:
            return zlib.decompress(extracted_data)
        except Exception:
            return extracted_data
