Compress-Archive -Path .\sparse_env\Lib\site-packages\dicetables\ -DestinationPath mypkg.zip

Compress-Archive -Path .\request_handler\ -Update -DestinationPath .\mypkg.zip
Compress-Archive -Path .\lambda_function.py\ -Update -DestinationPath .\mypkg.zip
