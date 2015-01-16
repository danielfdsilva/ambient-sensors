# Open Data Happy Hour - Sensor

Ambient data gathering using an arduino and sensors to showcase at the [Open Data Happy Hour](http://flipside.org/notes/open-data-happy-hour/) event of Jan 15th 2015 organized by [Flipside](http://www.flipside.org/) + [Development Seed](http://www.developmentseed.org/)

It features a temperature sensor and a motion sensor that when triggered takes a picture.
The picture is taken using a camera connected through usb and supported by [gphoto2](http://www.gphoto.org/).


## Development environment

- Node & npm
- libgphoto2 (http://www.gphoto.org/)

After these basic requirements are met, run the following commands in the website's folder:
```
$ npm install

```

## Arduino

### Components

- Arduino UNO or equivalent
- Temperature sensor (TMP36)
- Piezo
- Infrared sensor