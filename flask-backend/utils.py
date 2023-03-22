import os
import shutil

def emptyDirectory(directory):
  for filename in os.listdir(directory):
    file_path = os.path.join(directory, filename)
    try:
      if os.path.isfile(file_path) or os.path.islink(file_path):
        os.unlink(file_path)
      elif os.path.isdir(file_path):
        shutil.rmtree(file_path)
    except Exception as e:
      errMsg = f'Empty directory "{directory}" failed! ' + str(e)
      print('Failed: ' + errMsg)
      return {'data': [], 'status': 'failed', 'errMsg': errMsg}
