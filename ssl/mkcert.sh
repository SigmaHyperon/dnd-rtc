#!/bin/bash
openssl req -x509 -sha256 -nodes -newkey rsa:2048 -days 365 -config cert.cnf -keyout localhost.key -out localhost.crt
openssl pkcs12 -export -name "localhost" -out localhost.pfx -inkey localhost.key -in localhost.crt -password pass:password