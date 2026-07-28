POST http://localhost:8080/v1/fragments
Authorization: Bearer any-token-string-here
Content-Type: text/plain

# DynamoDB is great
HTTP/1.1 201
[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id"
[Asserts]
header "Location" exists
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/plain"

GET {{fragment1_url}}
Authorization: Bearer any-token-string-here

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == "{{fragment1_id}}"
jsonpath "$.fragment.type" == "text/plain"

POST http://localhost:8080/v1/fragments
Authorization: Bearer any-token-string-here
Content-Type: text/plain

# DynamoDB is awesome
HTTP/1.1 201
[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"
[Asserts]
header "Location" exists
jsonpath "$.status" == "ok"

GET {{fragment2_url}}
Authorization: Bearer any-token-string-here

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == "{{fragment2_id}}"
jsonpath "$.fragment.type" == "text/plain"

GET http://localhost:8080/v1/fragments
Authorization: Bearer any-token-string-here

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragments" includes "{{fragment1_id}}"
jsonpath "$.fragments" includes "{{fragment2_id}}"

DELETE {{fragment1_url}}
Authorization: Bearer any-token-string-here

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"

GET {{fragment1_url}}
Authorization: Bearer any-token-string-here

HTTP/1.1 404

GET http://localhost:8080/v1/fragments
Authorization: Bearer any-token-string-here

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragments" not includes "{{fragment1_id}}"
jsonpath "$.fragments" includes "{{fragment2_id}}"