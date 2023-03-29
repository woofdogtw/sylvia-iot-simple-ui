# sylvia-iot-simple-ui

A simple UI for operating Sylvia-IoT platform.

Although cli ([sylvia-iot-coremgr-cli](https://github.com/woofdogtw/sylvia-iot-core/tree/main/sylvia-iot-coremgr-cli) or
[sylvia-router-cli](https://github.com/woofdogtw/sylvia-iot-core/tree/main/sylvia-router)) provides complete API access functionality, using GUI provides a more intuitive interface to access.

This program provides web pages to access the following components:

- Core
- Router
- Application Server
    - [app-demo](https://github.com/woofdogtw/sylvia-iot-examples/tree/main/app-demo)
- Network Server
    - [lora-ifroglab](https://github.com/woofdogtw/sylvia-iot-examples/tree/main/lora-ifroglab)

I learned Vue.js and web UI programming skills through this project. Maybe I will also use this project to learn Micro Frontend in the future, so that the web pages of application servers and network servers can be developed independently.

# Build Docker Image

Use the following commands:

    $ npx quasar build; \
      docker build sylvia-iot-simple-ui -f Dockerfile .
