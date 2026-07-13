POST http://localhost:8080/v1/fragments
Content-Type: text/plain; charset=utf-8
Authorization: Bearer any-token-string-here
`Hello with charset`

HTTP/1.1 201
[Captures]
url: header "Location"

GET {{url}}
Authorization: Bearer any-token-string-here

HTTP/1.1 200
Content-Type: text/plain; charset=utf-8
[Asserts]
body == "Hello with charset"