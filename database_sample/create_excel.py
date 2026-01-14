"""
PilateStudio Database Excel Creator
Creates a single Excel file with multiple sheets from CSV files
"""

import pandas as pd
import os
from pathlib import Path

def create_excel_database():
    """Create Excel file from CSV files"""
    
    # Get current directory
    current_dir = Path(__file__).parent
    
    # Output Excel file
    excel_file = current_dir / 'PilateStudio_Database.xlsx'
    
    # CSV files to process
    csv_files = {
        'Users': 'Users.csv',
        'Trainers': 'Trainers.csv',
        'Classes': 'Classes.csv',
        'Schedules': 'Schedules.csv',
        'Bookings': 'Bookings.csv',
        'Transactions': 'Transactions.csv'
    }
    
    print("🔧 Creating Excel file from CSV data...")
    print("-" * 50)
    
    try:
        # Create Excel writer
        with pd.ExcelWriter(excel_file, engine='openpyxl') as writer:
            for sheet_name, csv_filename in csv_files.items():
                csv_path = current_dir / csv_filename
                
                if not csv_path.exists():
                    print(f"⚠️  Warning: {csv_filename} not found, skipping...")
                    continue
                
                # Read CSV file
                df = pd.read_csv(csv_path)
                
                # Write to Excel sheet
                df.to_excel(writer, sheet_name=sheet_name, index=False)
                
                # Format the sheet
                worksheet = writer.sheets[sheet_name]
                
                # Auto-adjust column widths
                for column in worksheet.columns:
                    max_length = 0
                    column_letter = column[0].column_letter
                    
                    for cell in column:
                        try:
                            if len(str(cell.value)) > max_length:
                                max_length = len(str(cell.value))
                        except:
                            pass
                    
                    adjusted_width = min(max_length + 2, 50)
                    worksheet.column_dimensions[column_letter].width = adjusted_width
                
                # Make header row bold
                for cell in worksheet[1]:
                    cell.font = cell.font.copy(bold=True)
                
                print(f"✓ Sheet created: {sheet_name} ({len(df)} rows)")
        
        print("-" * 50)
        print(f"✅ Success! Excel file created:")
        print(f"   📁 {excel_file}")
        print(f"\n📊 Summary:")
        print(f"   • 6 sheets created")
        print(f"   • Ready to upload to Google Sheets")
        print(f"   • Or use directly in Excel")
        
        return True
        
    except ImportError:
        print("\n❌ Error: Required packages not installed")
        print("\n📦 Please install required packages:")
        print("   pip install pandas openpyxl")
        return False
        
    except Exception as e:
        print(f"\n❌ Error creating Excel file: {str(e)}")
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("  PilateStudio Database - Excel Creator")
    print("=" * 50)
    print()
    
    success = create_excel_database()
    
    if success:
        print("\n🚀 Next steps:")
        print("   1. Open PilateStudio_Database.xlsx")
        print("   2. Verify all data is correct")
        print("   3. Upload to Google Drive")
        print("   4. Open with Google Sheets")
        print("   5. Share with service account")
        print("   6. Copy spreadsheet ID to .env")
    else:
        print("\n💡 Alternative:")
        print("   Import CSV files directly to Google Sheets")
        print("   See README.md for instructions")
    
    print()
