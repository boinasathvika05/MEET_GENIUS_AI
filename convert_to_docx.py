import subprocess
import sys

def install(package):
    subprocess.check_call([sys.executable, "-m", "pip", "install", package])

try:
    import pypandoc
except ImportError:
    install('pypandoc')
    import pypandoc

try:
    pypandoc.download_pandoc()
except Exception as e:
    print(f"Error downloading pandoc: {e}")

try:
    pypandoc.convert_file('submission.md', 'docx', outputfile='submission.docx')
    print("Successfully converted submission.md to submission.docx")
except Exception as e:
    print(f"Error converting: {e}")
