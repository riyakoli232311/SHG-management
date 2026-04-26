from fastapi import FastAPI, UploadFile, File, Form
import cv2
import numpy as np
import pytesseract
import re
from pydantic import BaseModel
import json

# Set Tesseract executable path for Windows
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

app = FastAPI()

# ── VERHOEFF ALGORITHM FOR AADHAAR ─────────────────────────────
verhoeff_d = [
    [0,1,2,3,4,5,6,7,8,9], [1,2,3,4,0,6,7,8,9,5], [2,3,4,0,1,7,8,9,5,6],
    [3,4,0,1,2,8,9,5,6,7], [4,0,1,2,3,9,5,6,7,8], [5,9,8,7,6,0,4,3,2,1],
    [6,5,9,8,7,1,0,4,3,2], [7,6,5,9,8,2,1,0,4,3], [8,7,6,5,9,3,2,1,0,4],
    [9,8,7,6,5,4,3,2,1,0]
]
verhoeff_p = [
    [0,1,2,3,4,5,6,7,8,9], [1,5,7,6,2,8,3,0,9,4], [5,8,0,3,7,9,6,1,4,2],
    [8,9,1,6,0,4,3,5,2,7], [9,4,5,3,1,2,6,8,7,0], [4,2,8,6,5,7,3,9,0,1],
    [2,7,9,3,8,0,6,4,1,5], [7,0,4,6,9,1,3,2,5,8]
]
def validate_verhoeff(num_str: str) -> bool:
    if not num_str.isdigit() or len(num_str) != 12: return False
    c = 0
    num_array = [int(x) for x in reversed(num_str)]
    for i, n in enumerate(num_array):
        c = verhoeff_d[c][verhoeff_p[i % 8][n]]
    return c == 0

# ── IMAGE PROCESSING ───────────────────────────────────────────
def check_image_quality_and_enhance(image: np.ndarray):
    # Detect blurry images
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    variance_of_laplacian = cv2.Laplacian(gray, cv2.CV_64F).var()
    is_blurry = variance_of_laplacian < 100

    # Increase contrast for OCR
    alpha = 1.5 
    beta = 20
    enhanced = cv2.convertScaleAbs(gray, alpha=alpha, beta=beta)
    
    # Adaptive thresholding
    thresh = cv2.adaptiveThreshold(enhanced, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
    return is_blurry, variance_of_laplacian, thresh

# ── ENDPOINTS ──────────────────────────────────────────────────
@app.post("/process-document")
async def process_document(
    file: UploadFile = File(...),
    document_type: str = Form(...),
    member_name: str = Form("")
):
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return {"status": "flagged", "error": "Invalid image file", "extracted_data": {}}

        is_blurry, blur_score, enhanced_img = check_image_quality_and_enhance(img)
        
        # If it's too blurry, we flag it immediately but still try to extract
        # Actually pytesseract can work better on grayscale
        text = pytesseract.image_to_string(img)
        text_from_enh = pytesseract.image_to_string(enhanced_img)
        
        # Combine texts just in case one gives better read
        full_text = text.upper() + "\n" + text_from_enh.upper()
        
        extracted_data = {}
        status = "auto_verified"
        flags = []

        if is_blurry:
            flags.append(f"Image might be blurry (score: {blur_score:.2f})")
            status = "flagged"

        if document_type.lower() == 'aadhaar card':
            # Find 12 digits
            aadhaar_matches = re.findall(r'\b\d{4}\s?\d{4}\s?\d{4}\b', full_text)
            aadhaar_matches = [x.replace(' ', '') for x in aadhaar_matches]
            
            valid_aadhaar = None
            for match in aadhaar_matches:
                if len(match) == 12 and validate_verhoeff(match):
                    valid_aadhaar = match
                    break
            
            if valid_aadhaar:
                extracted_data['aadhaar_number'] = valid_aadhaar
            else:
                flags.append("Could not find a valid 12-digit Verhoeff Aadhaar number.")
                status = "flagged"

            # Try to grab DOB
            dob_match = re.search(r'(DOB|Year of Birth)[:\-\s]*([0-9]{2}/[0-9]{2}/[0-9]{4}|[0-9]{4})', full_text, re.IGNORECASE)
            if dob_match:
                extracted_data['dob'] = dob_match.group(2)

        elif document_type.lower() == 'bank passbook':
            # Looking for IFSC like SBIN0001234 -> 4 chars, 0, 6 alphanumeric
            ifsc_match = re.search(r'\b[A-Z]{4}0[A-Z0-9]{6}\b', full_text)
            if ifsc_match:
                extracted_data['ifsc_code'] = ifsc_match.group()
            else:
                flags.append("Could not find a valid IFSC code format.")
                status = "flagged"
                
            # Try to find Account Number
            acc_match = re.search(r'(A/C|Account|Acct)[^\d]*(\d{9,18})', full_text, re.IGNORECASE)
            if acc_match:
                extracted_data['account_number'] = acc_match.group(2)

        else:
            flags.append("Unknown document type")
            status = "flagged"

        # Check name match if member_name given
        if member_name:
            # simple check: are most parts of member_name found in text?
            parts = member_name.upper().split()
            found_parts = [p for p in parts if p in full_text]
            if len(found_parts) < len(parts) / 2.0:
                flags.append("Member name mismatch or unreadable on document.")
                status = "flagged"
            else:
                extracted_data['matched_name'] = member_name

        extracted_data['flags'] = flags
        
        return {
            "status": status,
            "extracted_data": extracted_data,
            "raw_text_snippet": full_text[:200]  # Just for debugging
        }

    except Exception as e:
        return {"status": "flagged", "error": str(e), "extracted_data": {}}

@app.get("/")
def read_root():
    return {"message": "OCR Service is running"}
