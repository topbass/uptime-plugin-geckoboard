# uptime-plugin-geckoboard

This is a custom Uptime plugin for Geckoboard. The main function of this plugin
is to push uptime status to Geckoboard, so that geckoboard can generate graphs
and charts from the data.

- Uptime: https://github.com/fzaninotto/uptime
- Geckoboard: https://www.geckoboard.com/

## Getting Started

To install the plugin, you have to install Uptime first, and then execute the
following commands.

```shell
$ cd /path/to/your/uptime/installation/folder
$ git clone git@github.com:waltzofpearls/uptime-plugin-geckoboard.git plugins/geckoboard
# Read the next section for plugin configuration first, then properly enable
# and configure the plugin, and then restart Uptime app.
```

## Configuration

In config file `config/production.yaml`, add the following line under `plugins`
to enable the geckoboard plugin.

```yaml
  - ./plugins/geckoboard
```

Also add the following geckoboard config to `config/production.yaml`.

```yaml
geckoboard:
  apiKey: [geckoboard api key]
  check:
    [Uptime check name]:
      - url: [geckoboard push url]
        key: [geckoboard widget key]
        widget: monitoring # monitoring, linechart or highcharts
      - url: [geckoboard push url]
        key: [geckoboard widget key]
        widget: linechart
        color: '#00ff00'
```

Restart Uptime app after changing the configuration.

## License

The MIT License (MIT)

Copyright (c) 2015 Rollie Ma @ Topbass Labs

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
