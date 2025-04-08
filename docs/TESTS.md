# Run tests

## Unit tests

To run unit tests just go to the root of the project and run

```bash
npm test
```

## Integration tests

Define variables which is mandatory to run tests

```bash
export ODATA_USER=UZIVATEL
export ODATA_PASSWORD=tajN3hes10
export ODATA_URL=https://your.syste/path/to/your/service/

```
Disable SSL certificate checking if your system has self-signed
certificate or certificate from untrusted authority.


```bash
export NODE_TLS_REJECT_UNAUTHORIZED=0;
```

Go to root directory of the project and run

```bash
npm run integration
```

If you would like to debug integration tests run


```bash
npm run integration-debug
```

and then open [DevTools](chrome://inspect).