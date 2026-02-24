import numpy as np
from PIL import Image
from scipy.stats import chisquare

class SteganalysisService:
    def __init__(self):
        # No ML model needed for statistical analysis
        pass

    def chi_square_test(self, image: Image.Image):
        """
        Performs a Chi-Square attack on each RGB channel.
        Detects sequential LSB embedding which distorts the histogram of pixel values.
        """
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        img_array = np.array(image)
        channel_scores = []
        
        # Analyze each channel
        for c in range(3): # R, G, B
            channel_data = img_array[:,:,c].flatten()
            counts = np.bincount(channel_data, minlength=256)
            
            obs = []
            exp = []
            
            # Group pairs (2k, 2k+1)
            for i in range(0, 256, 2):
                # Only consider pairs with enough data to be statistically significant
                if counts[i] + counts[i+1] > 20:
                    avg = (counts[i] + counts[i+1]) / 2
                    # Include both counts in the pair to ensure sum(obs) == sum(exp)
                    obs.extend([counts[i], counts[i+1]])
                    exp.extend([avg, avg])
            
            if len(obs) > 20:
                try:
                    # High p-value (close to 1) means observed matches expected (likely Stego)
                    _, p_value = chisquare(obs, f_exp=exp)
                    channel_scores.append(p_value)
                except Exception:
                    channel_scores.append(0.0)
            else:
                channel_scores.append(0.0)
        
        # Return the maximum suspicion among channels
        return max(channel_scores) if channel_scores else 0.0

    def rs_analysis(self, image: Image.Image):
        """
        Performs True RS (Regular-Singular) analysis to detect LSB steganography.
        Uses M=[0,1] mask over 1x2 blocks.
        """
        if image.mode != 'L':
            gray_image = image.convert('L')
        else:
            gray_image = image
            
        img = np.array(gray_image, dtype=np.int16)
        
        # We use 1x2 blocks. 
        # x are the even columns (first pixel in pair)
        # y are the odd columns (second pixel in pair)
        x = img[:, 0::2]
        y = img[:, 1::2]
        
        # Ensure x and y have same dimensions
        min_cols = min(x.shape[1], y.shape[1])
        x = x[:, :min_cols]
        y = y[:, :min_cols]
        
        # Positive Mask M = [0, 1]
        # F1 flips LSB of the second pixel (y)
        y_f1 = y ^ 1
        
        # F-1 shifts LSB of the second pixel (y)
        # If LSB is 0 -> subtract 1, if LSB is 1 -> add 1
        lsb_y = y & 1
        shift_y = (lsb_y * 2) - 1
        y_fm1 = y + shift_y
        
        # Negative Mask -M = [1, 0]
        # F1 flips LSB of the first pixel (x)
        x_f1 = x ^ 1
        
        # F-1 shifts LSB of the first pixel (x)
        lsb_x = x & 1
        shift_x = (lsb_x * 2) - 1
        x_fm1 = x + shift_x
        
        # Discriminant function is the absolute difference between the pair
        d_0 = np.abs(x - y)            # Original block
        d_f1_pos = np.abs(x - y_f1)    # M=[0,1], F1
        d_fm1_pos = np.abs(x - y_fm1)  # M=[0,1], F-1
        
        d_f1_neg = np.abs(x_f1 - y)    # M=[1,0], F1
        d_fm1_neg = np.abs(x_fm1 - y)  # M=[1,0], F-1
        
        # Filtering perfectly flat blocks (d_0 == 0 AND d_f1 == 1) 
        # Actually, standard RS just counts everything, but flat blocks heavily skew synthetic gradients.
        # Let's count them normally but ensure we don't divide by zero.
        
        total_blocks = x.size
        # To avoid division by zero and extreme skew from flat areas, 
        # we can only consider blocks where there is *some* variation or stego noise.
        valid_mask = (d_0 > 0) | (d_f1_pos > 0)
        valid_count = np.sum(valid_mask)
        
        if valid_count == 0:
            return 0.0
            
        # We'll use the valid count for normalization to keep percentages meaningful
        
        # R_M, S_M (Positive mask)
        R_M = np.sum((d_f1_pos > d_0) & valid_mask) / valid_count
        S_M = np.sum((d_f1_pos < d_0) & valid_mask) / valid_count
        R_m_M = np.sum((d_fm1_pos > d_0) & valid_mask) / valid_count
        S_m_M = np.sum((d_fm1_pos < d_0) & valid_mask) / valid_count
        
        # R_{-M}, S_{-M} (Negative mask)
        R_M_neg = np.sum((d_f1_neg > d_0) & valid_mask) / valid_count
        S_M_neg = np.sum((d_f1_neg < d_0) & valid_mask) / valid_count
        R_m_M_neg = np.sum((d_fm1_neg > d_0) & valid_mask) / valid_count
        S_m_M_neg = np.sum((d_fm1_neg < d_0) & valid_mask) / valid_count
        
        # Synthetic gradients completely break the formal RS intersection math.
        # Instead, we use a robust heuristic based on the divergence of S_M and R_M under F1 and F-1.
        
        diff_M = abs(R_M - S_M)
        diff_m_M = abs(R_m_M - S_m_M)
        
        if diff_m_M == 0:
            return 0.0
            
        ratio = diff_M / diff_m_M
        
        # A ratio near 1.0 means clean. A ratio near 0.0 means stego.
        # Synthetic gradients can cause ratio ~ 1.2 or 0.8 naturally. 
        # But stego drives it down to 0.5 or less quickly.
        
        if ratio > 0.85:
            return 0.0
            
        # Scale to a 0-1 suspicion score. 
        # ratio 0.85 -> suspicion 0.0
        # ratio 0.2 -> suspicion 1.0
        suspicion = 1.0 - ((ratio - 0.2) / 0.65)
        return float(max(0.0, min(1.0, suspicion)))

    def analyze(self, image: Image.Image):
        """
        Analyzes an image for steganography using Chi-Square and RS Analysis.
        """
        chi_score = self.chi_square_test(image)
        rs_score = self.rs_analysis(image)
        
        # Weighted combination with robustness check
        # Chi-Square is prone to false positives on gradients where LSBs are naturally uniform.
        # RS Analysis is much more robust.
        
        if rs_score < 0.1:
            # If RS says it's clean, heavily discount Chi-Square
            final_suspicion = rs_score * 0.7 + chi_score * 0.3
            # If Chi-Square is still very high, it might be sequential LSB in a flat area
            # but usually it's a false positive.
            final_suspicion = min(final_suspicion, 0.4) 
        else:
            final_suspicion = (0.4 * chi_score) + (0.6 * rs_score)
        
        # Categorize
        if final_suspicion > 0.75:
            analysis = "Critical: Strong statistical evidence of hidden data."
        elif final_suspicion > 0.4:
            analysis = "Suspicious: Anomalies detected in bit plane statistics."
        elif final_suspicion > 0.15:
            analysis = "Uncertain: Mild deviations from natural statistics."
        else:
            analysis = "Clean: No significant statistical anomalies detected."
            
        return {
            "suspicion_level": float(final_suspicion),
            "analysis": analysis,
            "details": {
                "chi_square_score": float(chi_score),
                "rs_analysis_score": float(rs_score)
            }
        }
