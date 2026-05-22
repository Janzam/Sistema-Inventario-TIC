import openpyxl
import pandas as pd

excel_path = r"C:\Users\DELL\Downloads\Inventario 2 (4) 2.xlsx"
xls = pd.ExcelFile(excel_path)

print("Available sheets in pd.ExcelFile:", xls.sheet_names)

for sheet_name in xls.sheet_names:
    # Read the sheet, skipping first few rows if necessary, or check standard header row
    df = pd.read_excel(excel_path, sheet_name=sheet_name, header=None)
    print(f"\nSheet '{sheet_name}': shape {df.shape}")
    
    # Try to find which row is the header row
    # A header row usually contains 'serie' or 'equipo' or 'activo fijo' (case-insensitive)
    found_header = False
    for r_idx in range(min(10, len(df))):
        row_vals = [str(x).strip().lower() for x in df.iloc[r_idx].tolist() if pd.notna(x)]
        if any('serie' in x for x in row_vals) or (any('equipo' in x for x in row_vals) and any('marca' in x for x in row_vals)):
            print(f"  -> Found potential header at row index {r_idx}:")
            print(f"     {df.iloc[r_idx].dropna().tolist()}")
            found_header = True
            break
    if not found_header:
        print("  -> No standard inventory header found in first 10 rows.")
