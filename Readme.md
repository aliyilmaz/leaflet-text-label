## Leaflet Text-Label Plugin

This plugin extends the functionality of Leaflet maps by allowing users to add, edit, and manage text annotations (labels) directly on the map. It provides an interactive interface for creating textboxes, saving them as GeoJSON features, and updating their content and position.

## Features
* Add text annotations by clicking on the map.
* Save annotations as draggable markers with text content.
* Edit existing annotations by clicking on them.
* Delete annotations by leaving the text empty during editing.
* Automatically update GeoJSON data when annotations are moved, edited, or deleted.
* Simple and intuitive user interface.


## Installation
### Include the Plugin
Add the script to your project. Ensure it is loaded after including the Leaflet library.

```html
<script src="path/to/leaflet-textbox-plugin.js"></script>
<link rel="stylesheet" href="path/to/leaflet.css">
```
Dependencies: 
* Leaflet.js (v1.7.1 or later)

## Usage
### Initialize the Map
Create a Leaflet map instance and add the plugin control.

```javascript
const map = L.map('map').setView([51.505, -0.09], 13);

// Add a tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
}).addTo(map);

// Add the Textbox control
const addTextControl = L.control.addText({
    position: 'topright', // Position of the control
});
addTextControl.layer.addTo(map);
```

### Adding Textboxes
* Click the "Add Text" button on the map.
* Click on the desired location to place a textbox.
* Enter text and press **Enter** or click the ✔ button to save.
### Editing Textboxes
* Click on an existing text annotation.
* Modify the text content.
* Press **Enter** or click the ✔ button to save changes.
###  Removing Textboxes
* Click on an existing text annotation.
* Remove the text content.
* Press **Enter** or click the ✔ button to save changes.

## API
### L.control.addText(options)
Adds the "Add Text" control to the map.

#### Parameters:
* ``options`` (Object):
* ``position`` (String): The position of the control. Default is topright.
* ``status`` (Boolean): Whether the control is enabled on initialization. Default is true.
#### Returns:
* ``{ layer: L.Control.AddText, geojson: [] }``: The control layer and an array of GeoJSON features.

### L.control.getLabels()
Retrieves all text annotations currently on the map as GeoJSON.

#### Returns:
* ``Array:`` An array of GeoJSON features representing text annotations.

#### GeoJSON Structure
```json
{
    "type": "Feature",
    "geometry": {
        "type": "Point",
        "coordinates": [longitude, latitude]
    },
    "properties": {
        "type": "Label",
        "id": "unique-id",
        "text": "Annotation content"
    }
}

```

## Styling
You can customize the appearance of textboxes and buttons by overriding these CSS classes:

* ``.leaflet-textbox`` - Styles for the textbox input.
* ``.leaflet-bar-part`` - Styles for the control button.
* ``.custom-textbox-icon`` - Styles for the text annotations.

```css
.custom-textbox-icon{    
    width: 100px !important;
    min-height: max-content !important;
    padding: 4px;
    /* color: #000;    
    text-shadow: 
                1px 1px 0 rgba(255, 255, 255, 0.8), 
                -1px -1px 0 rgba(255, 255, 255, 0.8), 
                1px -1px 0 rgba(255, 255, 255, 0.8), 
                -1px 1px 0 rgba(255, 255, 255, 0.8); */
    color: #FFF;
    text-shadow: 
                1px 1px 0 rgba(0, 0, 0, 0.8), 
                -1px -1px 0 rgba(0, 0, 0, 0.8), 
                1px -1px 0 rgba(0, 0, 0, 0.8), 
                -1px 1px 0 rgba(0, 0, 0, 0.8);
    font-weight: bold;
    letter-spacing: 1.2px;
    font-size:14px;
    line-height: normal;
  
}
.leaflet-textbox:focus-visible{
    outline: none;
    outline-offset:none;
}
.leaflet-control-add-text a {
    font-size: 16px;
}
```

## Keyboard Shortcuts
* **Escape:** Exit text mode without adding or editing a textbox.

## Events
* **enableTextMode:** Triggered when the text mode is enabled.
* **textSaved:** Triggered when a new annotation is saved.

## License
This plugin is distributed under the MIT License. Feel free to use, modify, and distribute it as needed.