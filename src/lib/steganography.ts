/**
 * Advanced Steganography Service
 * Implements LSB-based steganography with encryption support
 */

export class SteganographyService {
  private readonly DELIMITER = '\0\0\0END_OF_MESSAGE\0\0\0';

  /**
   * Hide data in an image using LSB steganography
   */
  async hideData(imageData: ImageData, message: string, password?: string): Promise<ImageData> {
    let dataToHide = message;
    
    // Encrypt data if password provided
    if (password) {
      dataToHide = await this.encrypt(message, password);
    }
    
    // Add delimiter to mark end of data
    dataToHide += this.DELIMITER;
    
    // Convert to binary
    const binaryData = this.stringToBinary(dataToHide);
    
    // Check if image can hold the data
    const maxCapacity = (imageData.width * imageData.height * 3) / 8; // 3 color channels, 8 bits per byte
    if (binaryData.length > maxCapacity) {
      throw new Error(`Message too large. Max capacity: ${Math.floor(maxCapacity)} characters`);
    }

    // Clone image data
    const newImageData = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height
    );

    // Hide data in LSB of RGB channels (skip alpha)
    let bitIndex = 0;
    for (let i = 0; i < newImageData.data.length && bitIndex < binaryData.length; i += 4) {
      // Red channel
      if (bitIndex < binaryData.length) {
        newImageData.data[i] = this.setLSB(newImageData.data[i], parseInt(binaryData[bitIndex]));
        bitIndex++;
      }
      // Green channel
      if (bitIndex < binaryData.length) {
        newImageData.data[i + 1] = this.setLSB(newImageData.data[i + 1], parseInt(binaryData[bitIndex]));
        bitIndex++;
      }
      // Blue channel
      if (bitIndex < binaryData.length) {
        newImageData.data[i + 2] = this.setLSB(newImageData.data[i + 2], parseInt(binaryData[bitIndex]));
        bitIndex++;
      }
      // Skip alpha channel (i + 3)
    }

    return newImageData;
  }

  /**
   * Extract hidden data from an image
   */
  async extractData(imageData: ImageData, password?: string): Promise<string | null> {
    let binaryData = '';
    
    // Extract LSB from RGB channels
    for (let i = 0; i < imageData.data.length; i += 4) {
      // Red channel
      binaryData += this.getLSB(imageData.data[i]);
      // Green channel
      binaryData += this.getLSB(imageData.data[i + 1]);
      // Blue channel
      binaryData += this.getLSB(imageData.data[i + 2]);
      // Skip alpha channel
    }

    // Convert binary to string
    const extractedText = this.binaryToString(binaryData);
    
    // Look for delimiter
    const delimiterIndex = extractedText.indexOf(this.DELIMITER);
    if (delimiterIndex === -1) {
      return null; // No hidden data found
    }

    let hiddenData = extractedText.substring(0, delimiterIndex);

    // Decrypt if password provided
    if (password) {
      try {
        hiddenData = await this.decrypt(hiddenData, password);
      } catch (error) {
        throw new Error('Failed to decrypt data. Incorrect password?');
      }
    }

    return hiddenData;
  }

  /**
   * Analyze image for potential hidden data
   */
  async analyzeImage(imageData: ImageData): Promise<{ suspicionLevel: number; analysis: string }> {
    let lsbPatternScore = 0;
    let totalPixels = 0;
    
    // Analyze LSB patterns
    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      
      // Check for unusual LSB patterns
      const rLSB = r & 1;
      const gLSB = g & 1;
      const bLSB = b & 1;
      
      // Random data should have roughly 50% 1s and 50% 0s
      // Non-random patterns might indicate steganography
      if (rLSB === gLSB && gLSB === bLSB) {
        lsbPatternScore += 1;
      }
      
      totalPixels++;
    }

    // Calculate suspicion level (0-1)
    const patternRatio = lsbPatternScore / totalPixels;
    const expectedRandomRatio = 0.125; // Expected for random data (1/8 chance all three LSBs match)
    const deviation = Math.abs(patternRatio - expectedRandomRatio);
    const suspicionLevel = Math.min(deviation * 8, 1); // Normalize and cap at 1

    const analysis = suspicionLevel > 0.7 
      ? "High probability of hidden data detected"
      : suspicionLevel > 0.4 
      ? "Moderate anomalies in LSB patterns"
      : "No significant steganographic indicators";

    return { suspicionLevel, analysis };
  }

  /**
   * Encrypt text using Web Crypto API
   */
  private async encrypt(text: string, password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    
    // Derive key from password
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      data
    );
    
    // Combine salt, iv, and encrypted data
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);
    
    return btoa(String.fromCharCode(...combined));
  }

  /**
   * Decrypt text using Web Crypto API
   */
  private async decrypt(encryptedText: string, password: string): Promise<string> {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    // Decode base64
    const combined = new Uint8Array(
      atob(encryptedText).split('').map(char => char.charCodeAt(0))
    );
    
    // Extract salt, iv, and encrypted data
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const encrypted = combined.slice(28);
    
    // Derive key from password
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encrypted
    );
    
    return decoder.decode(decrypted);
  }

  /**
   * Convert string to binary representation
   */
  private stringToBinary(str: string): string {
    return str
      .split('')
      .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
      .join('');
  }

  /**
   * Convert binary to string
   */
  private binaryToString(binary: string): string {
    let result = '';
    for (let i = 0; i < binary.length; i += 8) {
      const byte = binary.slice(i, i + 8);
      if (byte.length === 8) {
        result += String.fromCharCode(parseInt(byte, 2));
      }
    }
    return result;
  }

  /**
   * Set the least significant bit
   */
  private setLSB(value: number, bit: number): number {
    return (value & 0xFE) | (bit & 1);
  }

  /**
   * Get the least significant bit
   */
  private getLSB(value: number): string {
    return (value & 1).toString();
  }
}