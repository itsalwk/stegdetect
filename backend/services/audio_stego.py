import numpy as np
import soundfile as sf
import io
import os
import zlib
import struct
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes

class AudioStegoService:

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

    def hide_data(self, audio_path: str, secret_data: bytes, output_path: str, password: str = None, n_bits: int = 2):
        """
        Embeds data into the multiple LSBs of a WAV file.
        n_bits: Number of LSBs to use per sample (1-4). Higher means more capacity but more noise.
        """
        data, samplerate = sf.read(audio_path, dtype='int16')
        
        # Compress secret data to save space
        secret_data = zlib.compress(secret_data)
        if password:
            secret_data = self.encrypt(secret_data, password)
        
        # Prepare length prefix (4 bytes signature + 4 bytes length = 64 bits)
        signature = b'STG1'
        data_len = len(secret_data)
        len_bytes = struct.pack('>I', data_len) # Big-endian unsigned int
        
        full_payload = signature + len_bytes + secret_data
        
        # Convert data to bits array
        secret_np = np.frombuffer(full_payload, dtype=np.uint8)
        bits = np.unpackbits(secret_np)
        
        # Flatten audio array
        flat_audio = data.flatten().copy()
        
        # Calculate required samples based on n_bits
        required_samples = (len(bits) + n_bits - 1) // n_bits
        
        if required_samples > len(flat_audio):
            repeats = (required_samples + len(flat_audio) - 1) // len(flat_audio)
            if len(data.shape) > 1:
                data = np.tile(data, (repeats, 1))
            else:
                data = np.tile(data, repeats)
            flat_audio = data.flatten().copy()
        
        # Prepare bits for multi-bit injection
        padding = (n_bits - (len(bits) % n_bits)) % n_bits
        if padding:
            bits = np.pad(bits, (0, padding), 'constant')
            
        # Reshape bits to (required_samples, n_bits)
        bits_to_embed = bits.reshape(-1, n_bits)
        
        # Create values to add (bits converted to integers)
        powers_of_two = 2**np.arange(n_bits)[::-1]
        values_to_embed = np.sum(bits_to_embed * powers_of_two, axis=1).astype(np.int16)
        
        # Mask out the target LSBs and inject new values
        mask = ~((1 << n_bits) - 1)
        target = flat_audio[:len(values_to_embed)]
        target &= mask
        target |= values_to_embed.astype(np.int16)
        
        # Reshape and save
        new_audio = flat_audio.reshape(data.shape)
        sf.write(output_path, new_audio, samplerate)
        return output_path

    def extract_data(self, audio_path: str, password: str = None, n_bits: int = 2) -> bytes:
        """Extracts hidden data from multiple LSBs of a WAV file."""
        data, samplerate = sf.read(audio_path, dtype='int16')
        flat_audio = data.flatten()
        
        # 1. Extract Header (64 bits)
        len_bits_needed = 64
        samples_for_len = (len_bits_needed + n_bits - 1) // n_bits
        
        if len(flat_audio) < samples_for_len:
            return None
            
        mask = (1 << n_bits) - 1
        
        header_samples = flat_audio[:samples_for_len]
        header_vals = (header_samples & mask).astype(np.uint8)
        
        header_bits = np.unpackbits(header_vals.reshape(-1, 1), axis=1)[:, -n_bits:].flatten()
        header_bits = header_bits[:64]
        
        header_bytes = np.packbits(header_bits).tobytes()
        if header_bytes[:4] != b'STG1':
            return None
            
        try:
            data_len = struct.unpack('>I', header_bytes[4:8])[0]
        except struct.error:
            return None
            
        max_possible_bytes = (len(flat_audio) * n_bits) // 8
        if data_len > max_possible_bytes or data_len == 0:
            return None
            
        # 2. Extract Data
        data_bits_needed = data_len * 8
        total_bits_needed = 64 + data_bits_needed
        
        total_samples_needed = (total_bits_needed + n_bits - 1) // n_bits
        
        if len(flat_audio) < total_samples_needed:
            return None
            
        payload_samples = flat_audio[:total_samples_needed]
        payload_vals = (payload_samples & mask).astype(np.uint8)
        
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
