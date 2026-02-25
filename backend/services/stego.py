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
        
        if n_bits == 1:
            values_to_embed = np.unpackbits(payload_np)
        elif n_bits == 2:
            values_to_embed = np.empty(len(payload_np) * 4, dtype=np.uint8)
            values_to_embed[0::4] = (payload_np >> 6) & 0x03
            values_to_embed[1::4] = (payload_np >> 4) & 0x03
            values_to_embed[2::4] = (payload_np >> 2) & 0x03
            values_to_embed[3::4] = payload_np & 0x03
        elif n_bits == 4:
            values_to_embed = np.empty(len(payload_np) * 2, dtype=np.uint8)
            values_to_embed[0::2] = (payload_np >> 4) & 0x0F
            values_to_embed[1::2] = payload_np & 0x0F
        else:
            bits = np.unpackbits(payload_np)
            padding = (n_bits - (len(bits) % n_bits)) % n_bits
            if padding:
                bits = np.pad(bits, (0, padding), 'constant')
            bits_to_embed = bits.reshape(-1, n_bits)
            powers_of_two = 2**np.arange(n_bits)[::-1]
            values_to_embed = np.sum(bits_to_embed * powers_of_two, axis=1).astype(np.uint8)
        
        img_array = np.array(carrier_image)
        flat_img = img_array.flatten().copy()
        
        required_elements = len(values_to_embed)
        if required_elements > len(flat_img):
            repeats = (required_elements + len(flat_img) - 1) // len(flat_img)
            img_array = np.tile(img_array, (repeats, 1, 1))
            flat_img = img_array.flatten().copy()
        
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
        
        if n_bits == 1:
            header_bytes = np.packbits(header_vals[:64]).tobytes()
        elif n_bits == 2:
            vals = header_vals[:32]
            header_bytes = ((vals[0::4] << 6) | (vals[1::4] << 4) | (vals[2::4] << 2) | vals[3::4]).tobytes()
        elif n_bits == 4:
            vals = header_vals[:16]
            header_bytes = ((vals[0::2] << 4) | vals[1::2]).tobytes()
        else:
            header_bits = np.unpackbits(header_vals.reshape(-1, 1), axis=1)[:, -n_bits:].flatten()
            header_bytes = np.packbits(header_bits[:64]).tobytes()
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
        
        # Skip the header portion (64 bits = 64/n_bits elements)
        header_elements = 64 // n_bits
        payload_data_vals = payload_vals[header_elements : header_elements + (data_bits_needed // n_bits)]
        
        if n_bits == 1:
            extracted_data = np.packbits(payload_data_vals).tobytes()
        elif n_bits == 2:
            extracted_data = ((payload_data_vals[0::4] << 6) | (payload_data_vals[1::4] << 4) | 
                              (payload_data_vals[2::4] << 2) | payload_data_vals[3::4]).tobytes()
        elif n_bits == 4:
            extracted_data = ((payload_data_vals[0::2] << 4) | payload_data_vals[1::2]).tobytes()
        else:
            all_bits = np.unpackbits(payload_vals.reshape(-1, 1), axis=1)[:, -n_bits:].flatten()
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
