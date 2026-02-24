from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
import shutil
import os
from services.stego import StegoService
from services.audio_stego import AudioStegoService
from services.analysis import SteganalysisService
from PIL import Image
import io
import uuid
import os
import filetype

app = FastAPI(title="StegDETECT API", version="1.0.0")

# CORS
origins = [
    "http://localhost:5173",
    "http://localhost:8080",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Services
stego_service = StegoService()
audio_stego_service = AudioStegoService()
analysis_service = SteganalysisService()

TMP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tmp_uploads")
os.makedirs(TMP_DIR, exist_ok=True)

def get_tmp_path(filename: str) -> str:
    os.makedirs(TMP_DIR, exist_ok=True)
    return os.path.join(TMP_DIR, filename)

def safe_remove(path: str):
    try:
        if os.path.exists(path):
            os.remove(path)
    except Exception:
        pass

@app.get("/")
def read_root():
    return {"message": "StegDETECT Backend is running!"}

MAX_FILE_SIZE_STEGANOGRAPHY = 100 * 1024 * 1024 # 100MB
MAX_FILE_SIZE_STEGANALYSIS = 300 * 1024 * 1024 # 300MB

@app.post("/hide")
async def hide_data(
    background_tasks: BackgroundTasks,
    carrier_file: UploadFile = File(...),
    secret_file: UploadFile = File(None),
    secret_text: str = Form(None),
    password: str = Form(None),
    n_bits: int = Form(2)
):
    try:
        # Check carrier file size
        if carrier_file.size and carrier_file.size > MAX_FILE_SIZE_STEGANOGRAPHY:
             raise HTTPException(status_code=413, detail="Carrier file too large (max 100MB)")

        # Determine secret data
        if secret_file:
            if secret_file.size and secret_file.size > MAX_FILE_SIZE_STEGANOGRAPHY:
                 raise HTTPException(status_code=413, detail="Secret file too large (max 100MB)")
            secret_data = await secret_file.read()
        elif secret_text:
            secret_data = secret_text.encode()
        else:
            raise HTTPException(status_code=400, detail="No secret data provided")

        filename = carrier_file.filename.lower()
        
        if filename.endswith(('.png', '.jpg', '.jpeg', '.bmp')):
            # Image Steganography
            image_bytes = await carrier_file.read()
            img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            
            stego_img = stego_service.hide_data(img, secret_data, password, n_bits=n_bits)
            
            # ALWAYS save as PNG for steganography to avoid lossy compression
            unique_id = uuid.uuid4().hex
            output_filename = f"stego_{unique_id}.png"
            output_path = get_tmp_path(output_filename)
            stego_img.save(output_path, format="PNG")
            
            background_tasks.add_task(safe_remove, output_path)
            return FileResponse(output_path, media_type="image/png", filename=output_filename)
            
        elif filename.endswith(('.wav', '.flac')):
            # Audio Steganography
            unique_id = uuid.uuid4().hex
            input_path = get_tmp_path(f"carrier_{unique_id}.wav")
            with open(input_path, "wb") as buffer:
                shutil.copyfileobj(carrier_file.file, buffer)
                
            output_filename = f"stego_{unique_id}.wav"
            output_path = get_tmp_path(output_filename)
            audio_stego_service.hide_data(input_path, secret_data, output_path, password=password, n_bits=n_bits)
            
            def cleanup_audio_hide():
                safe_remove(input_path)
                safe_remove(output_path)
            
            background_tasks.add_task(cleanup_audio_hide)
            return FileResponse(output_path, media_type="audio/wav", filename=output_filename)
            
        else:
            raise HTTPException(status_code=400, detail="Unsupported carrier file type")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/extract")
async def extract_data(
    background_tasks: BackgroundTasks,
    stego_file: UploadFile = File(...),
    password: str = Form(None),
    n_bits: int = Form(2)
):
    try:
        if stego_file.size and stego_file.size > MAX_FILE_SIZE_STEGANALYSIS:
             raise HTTPException(status_code=413, detail="Stego file too large (max 300MB)")
        
        filename = stego_file.filename.lower()
        
        if filename.endswith(('.png', '.jpg', '.jpeg', '.bmp')):
            # Image Steganography
            image_bytes = await stego_file.read()
            img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            extracted_bytes = stego_service.extract_data(img, password, n_bits=n_bits)
            
            if not extracted_bytes:
                return JSONResponse(status_code=404, content={"message": "No hidden data found"})
                
            # Try to detect if it's text
            try:
                text = extracted_bytes.decode('utf-8')
                return {"type": "text", "content": text}
            except UnicodeDecodeError:
                # Return as binary file
                kind = filetype.guess(extracted_bytes)
                mime_type = kind.mime if kind else "application/octet-stream"
                ext = kind.extension if kind else "bin"

                unique_id = uuid.uuid4().hex
                output_path = get_tmp_path(f"extracted_file_{unique_id}.{ext}")
                with open(output_path, "wb") as f:
                    f.write(extracted_bytes)
                
                background_tasks.add_task(safe_remove, output_path)
                return FileResponse(output_path, media_type=mime_type, filename=f"extracted_data.{ext}")

        elif filename.endswith(('.wav', '.flac')):
            # Audio Steganography
            unique_id = uuid.uuid4().hex
            input_path = get_tmp_path(f"stego_{unique_id}.wav")
            with open(input_path, "wb") as buffer:
                shutil.copyfileobj(stego_file.file, buffer)
                
            extracted_bytes = audio_stego_service.extract_data(input_path, password=password, n_bits=n_bits)
            
            safe_remove(input_path)
            
            if not extracted_bytes:
                return JSONResponse(status_code=404, content={"message": "No hidden data found"})
            
            try:
                text = extracted_bytes.decode('utf-8')
                return {"type": "text", "content": text}
            except UnicodeDecodeError:
                kind = filetype.guess(extracted_bytes)
                mime_type = kind.mime if kind else "application/octet-stream"
                ext = kind.extension if kind else "bin"

                output_path = get_tmp_path(f"extracted_audio_data_{unique_id}.{ext}")
                with open(output_path, "wb") as f:
                    f.write(extracted_bytes)
                    
                background_tasks.add_task(safe_remove, output_path)
                return FileResponse(output_path, media_type=mime_type, filename=f"extracted_data.{ext}")
        else:
             raise HTTPException(status_code=400, detail="Unsupported file type")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze")
async def analyze_file(file: UploadFile = File(...)):
    try:
        if file.size and file.size > MAX_FILE_SIZE_STEGANALYSIS:
             raise HTTPException(status_code=413, detail="File too large (max 300MB)")
             
        filename = file.filename.lower()
        if filename.endswith(('.png', '.jpg', '.jpeg', '.bmp')):
            image_bytes = await file.read()
            img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            
            result = analysis_service.analyze(img)
            return result
        else:
            return {"message": "Analysis currently only supported for images"}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
