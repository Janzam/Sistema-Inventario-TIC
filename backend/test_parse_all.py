import pandas as pd
import numpy as np

excel_path = r"C:\Users\DELL\Downloads\Inventario 2 (4) 2.xlsx"
xls = pd.ExcelFile(excel_path)

total_records = 0
parsed_sheets = []

for sheet_name in xls.sheet_names:
    df_raw = pd.read_excel(xls, sheet_name=sheet_name, header=None)
    
    # Try to find header row in first 10 rows
    header_row_idx = None
    for idx in range(min(10, len(df_raw))):
        row_vals = [str(x).strip().lower() for x in df_raw.iloc[idx].tolist() if pd.notna(x)]
        # We look for a row that has 'serie'
        if any('serie' in x for x in row_vals):
            header_row_idx = idx
            break
        # Or has both 'equipo' and 'marca'
        elif any('equipo' in x for x in row_vals) and any('marca' in x for x in row_vals):
            header_row_idx = idx
            break
            
    if header_row_idx is not None:
        # Load the sheet using this row as header
        df = pd.read_excel(xls, sheet_name=sheet_name, skiprows=header_row_idx)
        # Clean column names
        df.columns = [str(c).strip().upper().replace('\n', ' ') for c in df.columns]
        
        # Check if we have EQUIPO and SERIE columns
        has_equipo = any('EQUIPO' in c or 'PRODUCTO' in c for c in df.columns)
        has_serie = any('SERIE' in c for c in df.columns)
        
        if has_equipo and has_serie:
            parsed_sheets.append((sheet_name, len(df), df.columns.tolist()))
            total_records += len(df)
            
            # Print first 2 data rows
            print(f"\nSheet '{sheet_name}' (First 2 rows):")
            print(df.head(2).to_dict(orient='records'))

print(f"\nSummary of parsed sheets:")
for sheet, cnt, cols in parsed_sheets:
    print(f"- Sheet '{sheet}': {cnt} rows. Columns: {cols}")
print(f"Total rows parsed across all valid sheets: {total_records}")
