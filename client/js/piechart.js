var pie = new d3pie("visualization_holder", {
  "header": {
    "title": {
      "text": "Casos por ubicación",
      "color": "#19b393",
      "fontSize": 32,
      "font": "open sans"
    },
    "subtitle": {
      "text": "Total de casos por departamento",
      "color": "#676a6c",
      "fontSize": 20,
      "font": "open sans"
    },
    "titleSubtitlePadding": 10
  },
  "footer": {
    "color": "#999999",
    "fontSize": 10,
    "font": "open sans",
    "location": "bottom-left"
  },
  "size": {
    "canvasHeight": 600,
    "canvasWidth": 700,
    "pieInnerRadius": "1%",
    "pieOuterRadius": "100%"
  },
  "data": {
    "sortOrder": "value-desc",
    "smallSegmentGrouping": {
      "enabled": true
    },
    "content": [
      {
        "label": "FoxPro",
        "value": 32170,
        "color": "#248838"
      },
      {
        "label": "vavav",
        "value": 23322,
        "color": "#efefef"
      }
    ]
  },
  "labels": {
    "outer": {
      "pieDistance": 32
    },
    "inner": {
      "hideWhenLessThanPercentage": 3
    },
    "mainLabel": {
      "font": "open sans",
      "fontSize": 16
    },
    "percentage": {
      "color": "#ffffff",
      "decimalPlaces": 1
    },
    "value": {
      "color": "#adadad",
      "fontSize": 11
    },
    "lines": {
      "enabled": true,
      "style": "straight"
    }
  },
  "tooltips": {
    "enabled": true,
    "type": "placeholder",
    "string": "{label}: {value}, {percentage}%"
  },
  "effects": {
    "load": {
      "speed": 2200
    },
    "pullOutSegmentOnClick": {
      "speed": 400
    }
  },
  "misc": {
    "gradient": {
      "enabled": true,
      "percentage": 100
    },
    "canvasPadding": {
      "bottom": 30
    },
    "pieCenterOffset": {
      "y": 40
    }
  },
  "callbacks": {}
});
