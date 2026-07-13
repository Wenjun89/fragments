POST http://localhost:8080/v1/fragments
Content-Type: application/json
Authorization: Bearer any-token-string-here
{
  "service": "test",
  "data": 123
}

HTTP/1.1 201
[Captures]
url: header "Location"

GET {{url}}
Authorization: Bearer any-token-string-here

HTTP/1.1 200
[Asserts]
jsonpath "$.service" == "test"
jsonpath "$.data" == 123