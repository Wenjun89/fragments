POST http://localhost:8080/v1/fragments
Content-Type: text/plain
Authorization: Bearer any-token-string-here
`This is a fragment!`

HTTP/1.1 201
[Captures]
url: header "Location"

GET {{url}}
Authorization: Bearer any-token-string-here

HTTP/1.1 200
Content-Type: text/plain
[Asserts]
body == "This is a fragment!"