# Physical Web Light Switch

This is a relativly simple wrapper round some of the work I've done to interact with Belkin WeMo lightbulbs

The creates a Eddystone beacon that broadcasts a URL for a web interface to switch a bulb on/off and set 
the brightness.

## Config

Config data goes in config.js. You can set the following:

 - The port the web server listens on
 - The short URL to broadcast
 - The device id of the bulb/group to control
 - The beacon name

The divice id is the id of the bridge + '-' + id of the bulb/group. This isn't the most userfriendly at the 
moment but it works.

```
module.exports = {
	deviceID: '231442B01005F2-94103EA2B27803ED',
	port: 3000,
	shortURL: 'http://s.loc/l'.
	name: 'Lights'
};
```

To run as a user other than root on Linux you will need to grant the NodeJS executable the right priveledges,
this can be done with this command:

```sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)```

## TODO

 - Add current state to the web interface
 - Add Web Bluetooth Access API support
 - Create basic Android App