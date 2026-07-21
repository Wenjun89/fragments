# Lab 9 S3 Integration Test: POST, GET, DELETE, and GET (404)

# 1. POST a new text fragment with body "Hello S3!"
POST http://localhost:8080/v1/fragments
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
Content-Type: text/plain
`Hello S3!`

# Confirm 201 Created and capture the Location header into `url`
HTTP/1.1 201
[Captures]
url: header "Location"
[Asserts]
header "Location" exists
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/plain"
jsonpath "$.fragment.body" == "Hello S3!"

# 2. GET the newly created fragment using the captured URL
GET {{url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

# Confirm 200 OK, correct content-type, and body content
HTTP/1.1 200
[Asserts]
header "Content-Type" contains "text/plain"
body == "Hello S3!"

# 3. DELETE the fragment using the captured URL
DELETE {{url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

# Confirm 200 OK on deletion
HTTP/1.1 200

# 4. Try to GET the deleted fragment again
GET {{url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

# Confirm 404 Not Found since it has been deleted
HTTP/1.1 404