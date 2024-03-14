import os
import json

def lambda_handler(event, context):
    # TODO implement
    var = os.getenv('foo2')
    return {
        'statusCode': 200,
        'body': json.dumps(var)
    }