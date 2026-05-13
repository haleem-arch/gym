import PyPDF2
import sys

try:
    reader = PyPDF2.PdfReader(r'C:\Users\haleemmamdouh\Downloads\data for change\WorkoutPlan_v3_Recomp.pdf')
    for i, page in enumerate(reader.pages):
        print(f"--- Page {i+1} ---")
        print(page.extract_text())
except Exception as e:
    print("Error:", e)
