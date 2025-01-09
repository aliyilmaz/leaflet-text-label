(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['leaflet'], factory);
    } else if (typeof exports === 'object') {
        factory(require('leaflet'));
    } else {
        factory(L);
    }
}(function (L) {   
    const DomUtil = L.DomUtil;
    const DomEvent = L.DomEvent;
    const LabelPointJsonArray = [];

    function createTextbox(container, x, y, id, value = '') {
        const textbox = DomUtil.create('input', 'leaflet-textbox', container);
        textbox.type = 'text';
        textbox.id = id;
        textbox.value = value;
        textbox.style.position = 'absolute';
        textbox.style.left = `${x}px`;
        textbox.style.top = `${y}px`;
        textbox.style.zIndex = 1000;
        textbox.style.backgroundColor = 'white';
        textbox.style.border = 'none';
        textbox.style.outline = 'none';
        textbox.style.padding = '0 0 0 5px';
        textbox.style.height = '25px';
        return textbox;
    }

    function createSaveButton(container, x, y) {
        const button = DomUtil.create('button', '', container);
        button.innerHTML = '✔';
        button.style.position = 'absolute';
        button.style.left = `${x}px`;
        button.style.top = `${y}px`;
        button.style.zIndex = 1000;
        button.style.backgroundColor = '#4CAF50';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.padding = '2px 10px';
        button.style.cursor = 'pointer';
        button.style.height = '25px';        
        return button;
    }

    L.Control.AddText = L.Control.extend({
        options: {
            position: 'topright',
            buttonText: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-fonts" viewBox="0 -2 16 16"><path d="M12.258 3h-8.51l-.083 2.46h.479c.26-1.544.758-1.783 2.693-1.845l.424-.013v7.827c0 .663-.144.82-1.3.923v.52h4.082v-.52c-1.162-.103-1.306-.26-1.306-.923V3.602l.431.013c1.934.062 2.434.301 2.693 1.846h.479z"></path></svg>`,
            latlng: null,
            returnmode:true
        },

        onAdd: function (map) {
            const container = DomUtil.create('div', 'leaflet-control-add-text leaflet-bar');
            const link = DomUtil.create('a', 'leaflet-bar-part', container);
            link.innerHTML = this.options.buttonText;
            link.href = '#';

            DomEvent.disableClickPropagation(link);
            DomEvent.on(link, 'click', (e) => {
                DomEvent.stop(e);
                map.fire('enableTextMode');
            });

            return container;
        }
    });

    L.Map.include({
        _textMode: false,
        _textbox: null,
        _saveButton: null,
        _idCounter: 0,

        enableTextMode: function () {
            this._textMode = true;
            this.getContainer().style.cursor = 'crosshair';
        },

        disableTextMode: function () {           
            this._textMode = false;
            this.getContainer().style.cursor = '';
            if (this._textbox) {
                this._textbox.remove();
                this._textbox = null;
            }
            if (this._saveButton) {
                this._saveButton.remove();
                this._saveButton = null;
            }
        },

        _generateUniqueId: function () {
            return 'leaflet-textbox-' + this._idCounter++;
        }
    });

    L.Map.addInitHook(function () {
        this.on('enableTextMode', function () {
            this.enableTextMode();
        });

        document.onkeydown = (event) => {
            if (event.key === 'Escape' || event.keyCode == 27) this.disableTextMode();
        };

        this.on('click', function (e) {
            
            if (this._textMode) {
                if (this._textbox) this._textbox.remove();
                if (this._saveButton) this._saveButton.remove();

                const container = this.getContainer();
                const textboxId = this._generateUniqueId();
                const textbox = createTextbox(container, e.containerPoint.x, e.containerPoint.y, textboxId);
                const saveButton = createSaveButton(container, e.containerPoint.x + textbox.offsetWidth, e.containerPoint.y);

                const saveText = () => {
                    const textValue = textbox.value.trim();
                    if (textValue) {
                        const marker = L.marker(this.options.latlng || e.latlng, {
                            icon: L.divIcon({
                                className: 'custom-textbox-icon',
                                html: textValue,
                            }),
                            draggable: true
                        }).addTo(this);

                        const geojsonFeature = marker.toGeoJSON();
                        geojsonFeature.properties = {
                            type: 'Label',
                            id: marker._leaflet_id,  // Unique ID
                            text: textValue
                        };
                        LabelPointJsonArray.push(geojsonFeature);
                        marker.getElement().setAttribute('data-geojson', JSON.stringify(geojsonFeature));
                        this.fire('textSaved', { geojson: geojsonFeature });

                        // Dinleme ve güncelleme işlemi
                        marker.on('move', (event) => {
                            const newLatLng = event.latlng;
                            geojsonFeature.geometry.coordinates = [newLatLng.lng, newLatLng.lat];
                            geojsonFeature.properties.type = 'Label';  // type değerini koru
                            const index = LabelPointJsonArray.findIndex((feature) => feature.properties.id === geojsonFeature.properties.id);
                            if (index !== -1) {
                                LabelPointJsonArray[index] = geojsonFeature;
                            }
                            marker.getElement().setAttribute('data-geojson', JSON.stringify(geojsonFeature));
                        });
                    }
                    this.disableTextMode();
                };

                textbox.onkeydown = (event) => {
                    if (event.key === 'Enter') saveText();
                };

                saveButton.onclick = () => saveText();

                container.appendChild(textbox);
                container.appendChild(saveButton);
                textbox.focus();
                this._textbox = textbox;
                this._saveButton = saveButton;
            }
        });

        this.on('custom-textbox-icon-click', function (e) {            
            if (this._textbox) this._textbox.remove();
            if (this._saveButton) this._saveButton.remove();
            const marker = e.layer;
            const latlng = marker.getLatLng();

            const container = this.getContainer();
            const textboxId = this._generateUniqueId();
            const textbox = createTextbox(container, e.containerPoint.x, e.containerPoint.y, textboxId, marker.options.icon.options.html);
            const saveButton = createSaveButton(container, e.containerPoint.x + textbox.offsetWidth, e.containerPoint.y);

            const saveText = () => {
                const newTextValue = textbox.value.trim();
                if (newTextValue) {
                    marker.setIcon(L.divIcon({
                        className: 'custom-textbox-icon',
                        html: newTextValue,
                    }));

                    const geojsonFeature = marker.toGeoJSON();
                    geojsonFeature.properties = {
                        type: 'Label',
                        id: marker._leaflet_id,  // Unique ID
                        text: newTextValue
                    };

                    const index = LabelPointJsonArray.findIndex((feature) => feature.properties.id === geojsonFeature.properties.id);
                    if (index !== -1) {
                        LabelPointJsonArray[index] = geojsonFeature;
                    } else {
                        LabelPointJsonArray.push(geojsonFeature);
                    }
                    
                    marker.getElement().setAttribute('data-geojson', JSON.stringify(geojsonFeature));

                    // Dinleme ve güncelleme işlemi
                    marker.on('move', (event) => {
                        const newLatLng = event.latlng;
                        geojsonFeature.geometry.coordinates = [newLatLng.lng, newLatLng.lat];
                        geojsonFeature.properties.type = 'Label';  // type değerini koru
                        const index = LabelPointJsonArray.findIndex((feature) => feature.properties.id === geojsonFeature.properties.id);
                        if (index !== -1) {
                            LabelPointJsonArray[index] = geojsonFeature;
                        }
                        marker.getElement().setAttribute('data-geojson', JSON.stringify(geojsonFeature));
                    });
                } else {
                    const index = LabelPointJsonArray.findIndex((feature) => feature.properties.id === marker.toGeoJSON().properties.id);
                    if (index !== -1) {
                        LabelPointJsonArray.splice(index, 1);
                    }
                    marker.remove();
                }
                this.disableTextMode();                
            };

            textbox.onkeydown = (event) => {
                if (event.key === 'Enter') saveText();
            };

            saveButton.onclick = () => saveText();

            container.appendChild(textbox);
            container.appendChild(saveButton);
            textbox.focus();
            this._textbox = textbox;
            this._saveButton = saveButton;
        });        
    });

    L.control.addText = function (options) {
        if(options.status == undefined || (options.status != undefined && options.status)){
            layer = new L.Control.AddText(options);
            return {layer: layer, geojson: LabelPointJsonArray};
        }
        return {layer:null};
    };

    L.control.getLabels = function () {
        const   result = [],
                Labels = document.querySelectorAll('.custom-textbox-icon');
        for (let index = 0; index < Labels.length; index++) {   
            if(Labels[index].dataset != undefined && Labels[index].dataset.geojson != undefined){
                result.push(JSON.parse(Labels[index].dataset.geojson));            
            }
        }   
        return result;           
    };

    L.Map.addInitHook(function () {        
        
        this.on('layeradd', function (e) {            
            if (e.layer.options.icon && e.layer.options.icon.options.className === 'custom-textbox-icon') {
                e.layer.on('click', (event) => {                    
                    this.fire('custom-textbox-icon-click', { layer: e.layer, containerPoint: event.containerPoint });
                }, this);
    
                // Dinleme ve güncelleme işlemi
                e.layer.on('dragend', (event) => {
                    const newLatLng = event.target.getLatLng();
                    const geojsonFeature = e.layer.toGeoJSON();
                    geojsonFeature.geometry.coordinates = [newLatLng.lng, newLatLng.lat];
                    geojsonFeature.properties.type = 'Label';  // type değerini koru
                    geojsonFeature.properties.text = e.layer.options.icon.options.html,
                    geojsonFeature.properties.id = e.layer._leaflet_id;
                    
                    // Eski özellik varsa güncelle, yoksa ekle
                    const index = LabelPointJsonArray.findIndex((feature) => feature.properties.id === geojsonFeature.properties.id);
                    if (index !== -1) {
                        LabelPointJsonArray[index] = geojsonFeature;
                    } else {
                        LabelPointJsonArray.push(geojsonFeature);
                    }                    
                    e.layer.getElement().setAttribute('data-geojson', JSON.stringify(geojsonFeature));
    
                    // Katmanı yeniden ekleyerek, eski konumu temizle                    
                    this.addLayer(e.layer);
                });
            }
        });        
    });
    

}));
